(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    /**
     * Base class for a target. Has checks in place to validate Target objects
     * @module Target
     */
    class Target {
      // // Need a static getter to check for inheritance...otherwise browser bundles can break
      // static get _isInheritedFromTargetBaseClass () {
      //     return true
      // }

      /**
          * Last step before sending data. Turns it into a string (obj->JSON)
          * @param {object} data
          */
      static prepareOutgoingData(data) {
        // console.log(data)
        return JSON.stringify(data);
      }

      constructor(source) {
        if (!source) throw new Error('Source must be spcified'); // Not needed, uses type instead
        // if (!this.constructor.test) throw new Error('Class requires a static `test` method in order to check whether or not a source is compatible with the constructor')

        if (!this.constructor.type) throw new Error(`Type not defined`);
        if (!this.constructor.name) console.warn(`No name provided`);
        if (!this.constructor.description) console.warn('No description provided');
        if (!this.sendMessage) throw new Error('A new target requires a sendMessage method');
      }

    }

    const messageTypes = {};
    const targetTypes = {};
    // Change this to have id based targets, and therefore the ability to access any target anywhere always as long as you have it's id (don't need to pass objects around)
    // const allTargets = {}

    /**
     * Epml core. All plugins build off this
     * @constructor
     */

    class Epml {
      /**
       * Installs a plugin "globally". Every new and existing epml instance will have this plugin enabled
       * @param {object} plugin - Epml plugin
       * @param {object} options - Options config object
       */
      static registerPlugin(plugin, options) {
        plugin.init(Epml, options);
        return Epml;
      } // /**
      //  * Adds a request handler function. Will be called whenever a message has a requestType corressponding to the supplied type
      //  * @param {string} type - Unique request identifier
      //  * @param {function} fn - Function to handle requests of this type
      //  */
      // static addRequestHandler (type, fn) {
      //     if (epmlRequestTypeHandlers[type]) throw new Error(`${type} is already defined`)
      //     epmlRequestTypeHandlers[type] = fn
      // }

      /**
       * @typedef TargetConstructor - Target constructor. Return a Target
       */
      // /**
      //  * Adds a new target contructor
      //  * @param {TargetConstructor} TargetConstructor - Has many methods...
      //  * @param {function} targetConstructor.isValidTarget - Takes a target and returns true if this constructor can handle this type of target
      //  */
      // static addTargetConstructor (TargetConstructor) {
      //     if (!(TargetConstructor instanceof Target)) throw new Error(`TargetConstructor must inherit from the Target base class.`)
      //     targetConstructors.push(TargetConstructor)
      // }


      static registerTargetType(type, targetConstructor) {
        if (type in targetTypes) throw new Error('Target type has already been registered');
        if (!(targetConstructor.prototype instanceof Target)) throw new Error('Target constructors must inherit from the Target base class');
        targetTypes[type] = targetConstructor;
        return Epml;
      }

      static registerEpmlMessageType(type, fn) {
        messageTypes[type] = fn;
        return Epml;
      }
      /**
       * Installs a plugin for only this instance
       * @param {object} plugin - Epml plugin
       */


      registerPlugin(plugin) {
        plugin.init(this);
        return this;
      }
      /**
       * Takes data from an event and figures out what to do with it
       * @param {object} strData - String data received from something like event.data
       * @param {Target} target - Target object from which the message was received
       */


      static handleMessage(strData, target) {
        // Changes to targetID...and gets fetched through Epml.targets[targetID]...or something like that
        const data = Epml.prepareIncomingData(strData); // console.log(target)

        if ('EpmlMessageType' in data) {
          messageTypes[data.EpmlMessageType](data, target, this); // Reference to Epml
        } // Then send a response or whatever back with target.sendMessage(this.constructor.prepareOutgoingData(someData))

      }
      /**
      * Prepares data for processing. Take JSON string and return object
      * @param {string} strData - JSON data in string form
      */


      static prepareIncomingData(strData) {
        if (typeof strData !== 'string') {
          // If sending object is enabled then return the string...otherwise stringify and then parse (safeguard against code injections...whatever the word for that was)
          return strData;
        }

        return JSON.parse(strData);
      }
      /**
       * Takes (a) target(s) and returns an array of target Objects
       * @param {Object|Object[]} targets
       * @returns {Object[]} - An array of target objects
       */


      static createTargets(targetSources) {
        if (!Array.isArray(targetSources)) targetSources = [targetSources];
        const targets = [];

        for (const targetSource of targetSources) {
          if (targetSource.allowObjects === undefined) targetSource.allowObjects = false;
          targets.push(...Epml.createTarget(targetSource));
        }

        return targets;
      }
      /**
       * Takes a single target source and returns an array of target object
       * @param {any} targetSource - Can be any target source for which a targetConstructor has been installed
       * @return {Object} - Target object
       */


      static createTarget(targetSource) {
        /*
            {
                source: myContentWindow / "my_channel" / "myWorker.js",
                type: 'WINDOW' / 'BROADCAST_CHANNEL' / 'WORKER',
                allowObjects: Bool
            }
        */
        // const TargetConstructor = targetConstructors.find(tCtor => tCtor.test(targetSource))
        // const newTarget = new TargetConstructor(targetSource)
        // console.log(targetTypes, targetTypes[targetSource.type])
        if (!targetTypes[targetSource.type]) {
          throw new Error(`Target type '${targetSource.type}' not registered`);
        }

        let newTargets = new targetTypes[targetSource.type](targetSource.source);
        if (!Array.isArray(newTargets)) newTargets = [newTargets];

        for (const newTarget of newTargets) {
          newTarget.allowObjects = targetSource.allowObjects;
        }

        return newTargets;
      }
      /**
       * Creates a new Epml instance
       * @constructor
       * @param {Object|Object[]} targets - Target instantiation object or an array of them
       */


      constructor(targets) {
        this.targets = this.constructor.createTargets(targets);
      }

    }

    // https://gist.github.com/LeverOne/1308368
    var genUUID = ((a, b) => {
      for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');

      return b;
    }); // function () {
    //     return (1 + Math.random()).toString(36)
    // }

    /**
     * Requires epml-request plugin...or not
     */
    const READY_CHECK_INTERVAL = 15; // ms

    const READY_MESSAGE_TYPE = 'EPML_READY_STATE_CHECK';
    const READY_MESSAGE_RESPONSE_TYPE = 'EPML_READY_STATE_CHECK_RESPONSE';
    const pendingReadyRequests = {};
    const readyPlugin = {
      init: (Epml, options) => {
        // if (!Epml.prototype.request) throw new Error('Requires request plugin')
        if (Epml.prototype.ready) throw new Error('Epml.prototype.ready is already defined');
        if (Epml.prototype.imReady) throw new Error('Epml.prototype.imReady is already defined');
        Epml.prototype.ready = readyPrototype;
        Epml.prototype.resetReadyCheck = resetCheckReadyPrototype;
        Epml.prototype.imReady = imReadyPrototype; // Being asked if ready

        Epml.registerEpmlMessageType(READY_MESSAGE_TYPE, respondToReadyRequest); // Getting a response after polling for ready

        Epml.registerEpmlMessageType(READY_MESSAGE_RESPONSE_TYPE, readyResponseHandler);
      }
    }; // This is the only part in the other "window"

    function respondToReadyRequest(data, target) {
      if (!target._i_am_ready) return;
      target.sendMessage({
        EpmlMessageType: READY_MESSAGE_RESPONSE_TYPE,
        requestID: data.requestID
      });
    }

    function imReadyPrototype() {
      // console.log('I\'m ready called', this)
      for (const target of this.targets) {
        target._i_am_ready = true;
      } // this._ready_plugin.imReady = true

    } // myEpmlInstance.ready().then(...)


    function readyPrototype() {
      this._ready_plugin = this._ready_plugin || {};
      this._ready_plugin.pendingReadyResolves = this._ready_plugin.pendingReadyResolves ? this._ready_plugin.pendingReadyResolves : []; // Call resolves when all targets are ready

      if (!this._pending_ready_checking) {
        this._pending_ready_checking = true;
        checkReady.call(this, this.targets).then(() => {
          this._ready_plugin.pendingReadyResolves.forEach(resolve => resolve());
        });
      }

      return new Promise(resolve => {
        if (this._ready_plugin.isReady) {
          resolve();
        } else {
          this._ready_plugin.pendingReadyResolves.push(resolve);
        }
      });
    }

    function resetCheckReadyPrototype() {
      this._ready_plugin = this._ready_plugin || {};
      this._ready_plugin.isReady = false;
    }

    function checkReady(targets) {
      // console.log('Checking', targets)
      this._ready_plugin = this._ready_plugin || {};
      this._ready_plugin.pendingReadyResolves = [];
      return Promise.all(targets.map(target => {
        return new Promise((resolve, reject) => {
          const id = genUUID(); // Send a message at an interval.

          const inteval = setInterval(() => {
            // console.log('interval')
            // , this, window.location
            target.sendMessage({
              EpmlMessageType: READY_MESSAGE_TYPE,
              requestID: id
            });
          }, READY_CHECK_INTERVAL); // Clear the interval and resolve the promise

          pendingReadyRequests[id] = () => {
            // console.log('RESOLVING')
            clearInterval(inteval);
            resolve();
          };
        });
      })).then(() => {
        this._ready_plugin.isReady = true;
      });
    } // Sets ready for a SINGLE TARGET


    function readyResponseHandler(data, target) {
      // console.log('response')
      // console.log('==== THIS TARGET IS REEEEEAAADDDDYYY ====')
      // console.log(target)
      target._ready_plugin = target._ready_plugin || {};
      target._ready_plugin._is_ready = true;
      pendingReadyRequests[data.requestID]();
    }

    // IE8 event listener support...probably going to be pointless in the end
    function bindEvent(element, eventName, eventHandler) {
      if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
      } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
      } else {
        throw new Error('Could not bind event.');
      }
    }

    const sourceTargetMap = new Map();
    /**
     * Can only take ONE iframe or popup as source
     */

    class ContentWindowTarget extends Target {
      static get sources() {
        return Array.from(sourceTargetMap.keys());
      }

      static get targets() {
        return Array.from(sourceTargetMap.values());
      }

      static getTargetFromSource(source) {
        return sourceTargetMap.get(source);
      }

      static hasTarget(source) {
        return sourceTargetMap.has(source);
      }

      static get type() {
        return 'WINDOW';
      }

      static get name() {
        return 'Content window plugin';
      }

      static get description() {
        return `Allows Epml to communicate with iframes and popup windows.`;
      }

      static test(source) {
        // if (typeof source !== 'object') return false
        // console.log('FOCUS FNS', source.focus === window.focus)
        // return (source === source.window && source.focus === window.focus) // <- Cause cors is a beach
        // return (typeof source === 'object' && source.focus === window.focus)
        return typeof source === 'object' && source === source.self;
      }

      isFrom(source) {//
      }

      constructor(source) {
        super(source); // if (source.contentWindow) source = source.contentWindow // <- Causes issues when cross origin
        // If the source already has an existing target object, simply return it.

        if (sourceTargetMap.has(source)) return sourceTargetMap.get(source);
        if (!this.constructor.test(source)) throw new Error('Source can not be used with target');
        this._source = source; // SHOULD MODIFY. Should become source = { contentWindow, origin } rather than source = contentWindow
        // try {
        //     this._sourceOrigin = source.origin
        // } catch (e) {
        //     // Go away CORS
        //     this._sourceOrigin = '*'
        // }

        this._sourceOrigin = '*';
        sourceTargetMap.set(source, this); // targetWindows.push(source)
      }

      get source() {
        return this._source;
      }

      sendMessage(message) {
        message = Target.prepareOutgoingData(message);

        this._source.postMessage(message, this._sourceOrigin);
      }

    }

    /**
     * Epml content windows plugin. Enables communication with iframes and popup windows
     */

    var EpmlContentWindowPlugin = {
      init: function (Epml) {
        // const proto = Epml.prototype
        bindEvent(window, 'message', event => {
          // console.log(event)
          if (!ContentWindowTarget.hasTarget(event.source)) return;
          Epml.handleMessage(event.data, ContentWindowTarget.getTargetFromSource(event.source)); // Epml.handleMessage(event.data, event.source, message => {
          //     event.source.postMessage(message, event.origin)
          // })
        }); // Epml.addTargetConstructor(ContentWindowTarget)

        Epml.registerTargetType(ContentWindowTarget.type, ContentWindowTarget); // Epml.addTargetHandler({
        //     targetType: 'WINDOW', // Unique type for each target type
        //     name: 'Content window',
        //     description: 'Allows Epml to communicate with iframes and popup windows',
        //     isMatchingTargetSource: function (source) {
        //         if (typeof source !== 'object') return false
        //         source = source.contentWindow || source
        //     },
        //     createTarget: function (source) {
        //         targetWindows.push({
        //             source,
        //             eventIsFromSource: function (event) {
        //                 if (event.source === source) return true
        //                 return false
        //             }
        //         })
        //         return {
        //             sendMessage: function (data) {
        //                 return source.postMessage(data, source.origin)
        //             }
        //         }
        //     }
        // })
      }
    };

    const REQUEST_MESSAGE_TYPE = 'REQUEST';
    const REQUEST_RESPONSE_MESSAGE_TYPE = 'REQUEST_RESPONSE';
    /**
     * Epml request module. Wrapper for asynchronous requests and responses (routes)
     * @module plugins/request/request.js
     */
    // Maps a target to an array of routes

    const routeMap = new Map();
    const pendingRequests = {};
    /**
     * Request plugin
     */

    const requestPlugin = {
      init: (Epml, options) => {
        if (Epml.prototype.request) throw new Error('Epml.prototype.request is already defined');
        if (Epml.prototype.route) throw new Error(`Empl.prototype.route is already defined`);
        Epml.prototype.request = requestFn;
        Epml.prototype.route = createRoute;
        Epml.registerEpmlMessageType(REQUEST_MESSAGE_TYPE, requestHandler);
        Epml.registerEpmlMessageType(REQUEST_RESPONSE_MESSAGE_TYPE, requestResponseHandler);
      }
    };

    const requestFn = function (requestType, data, timeout) {
      // console.log(this)
      return Promise.all(this.targets.map(target => {
        const uuid = genUUID();
        const message = {
          EpmlMessageType: REQUEST_MESSAGE_TYPE,
          requestOrResponse: 'request',
          requestID: uuid,
          requestType,
          data // If data is undefined it's simply omitted :)

        };
        target.sendMessage(message);
        return new Promise((resolve, reject) => {
          // console.log('PROMISEEEE')
          let timeOutFn;

          if (timeout) {
            timeOutFn = setTimeout(() => {
              delete pendingRequests[uuid];
              reject(new Error('Request timed out'));
            }, timeout);
          }

          pendingRequests[uuid] = (...args) => {
            if (timeOutFn) clearTimeout(timeOutFn);
            resolve(...args);
          }; // console.log(pendingRequests)

        });
      })).then(responses => {
        // console.log(responses)
        // If an instance only has one target, don't return the array. That'd be weird
        if (this.targets.length === 1) return responses[0];
      });
    };

    function requestResponseHandler(data, target, Epml) {
      // console.log("REQUESSTTT", data, pendingRequests)
      // console.log('IN REQUESTHANDLER', pendingRequests, data)
      if (data.requestID in pendingRequests) {
        // console.log(data)
        // const parsedData = Epml.prepareIncomingData(data.data)
        const parsedData = data.data; // const parsedData = data.data

        pendingRequests[data.requestID](parsedData);
      } else {
        console.warn('requestID not found in pendingRequests');
      }
    }

    function requestHandler(data, target) {
      // console.log('REQUESTHANLDER')
      // console.log(routeMap)
      // console.log(data)
      // console.log(target)
      if (!routeMap.has(target)) {
        // Error, route does not exist
        console.warn(`Route does not exist - missing target`);
        return;
      }

      const routes = routeMap.get(target); // console.log(data, routes)

      const route = routes[data.requestType];

      if (!route) {
        // Error, route does not exist
        console.warn('Route does not exist');
        return;
      } // console.log('CALLING FN')


      route(data, target);
    }

    function createRoute(route, fn) {
      // console.log(`CREATING ROUTTTEEE "${route}"`)
      if (!this.routes) this.routes = {};
      if (this.routes[route]) return;

      for (const target of this.targets) {
        if (!routeMap.has(target)) {
          routeMap.set(target, {});
        }

        const routes = routeMap.get(target);

        routes[route] = (data, target) => {
          // console.log('ROUTE FN CALLED', data)
          // User supllied route function. This will turn it into a promise if it isn't one, or it will leave it as one.
          Promise.resolve(fn(data)).catch(err => {
            if (err instanceof Error) return err.message;
            return err;
          }) // Still send errors you dumb fuck
          .then(response => {
            // console.log(response)
            // response = this.constructor.prepareOutgoingData(response)
            // const preparedResponse = Target.prepareOutgoingData(response)
            target.sendMessage({
              data: response,
              // preparedResponse
              EpmlMessageType: REQUEST_RESPONSE_MESSAGE_TYPE,
              requestOrResponse: 'request',
              requestID: data.requestID
            });
          });
        };
      } // console.log('hello')

    }

    class TwoWayMap {
      constructor(map) {
        this._map = map || new Map();
        this._revMap = new Map();

        this._map.forEach((key, value) => {
          this._revMap.set(value, key);
        });
      }

      values() {
        return this._map.values();
      }

      entries() {
        return this._map.entries();
      }

      push(key, value) {
        this._map.set(key, value);

        this._revMap.set(value, key);
      }

      getByKey(key) {
        return this._map.get(key);
      }

      getByValue(value) {
        return this._revMap.get(value);
      }

      hasKey(key) {
        return this._map.has(key);
      }

      hasValue(value) {
        return this._revMap.has(value);
      }

      deleteByKey(key) {
        const value = this._map.get(key);

        this._map.delete(key);

        this._revMap.delete(value);
      }

      deleteByValue(value) {
        const key = this._revMap.get(value);

        this._map.delete(key);

        this._revMap.delete(value);
      }

    }

    const PROXY_MESSAGE_TYPE = 'PROXY_MESSAGE';

    // Proxy target source will be another instance of epml. The source instance will be the proxy. The extra parameter will be the target for that proxy

    const proxySources = new TwoWayMap();
    /**
     *  source = {
     *      target:'frame1',
     *      proxy: epmlInstance
     *  }
     */

    /**
     * Can only take ONE iframe or popup as source
     */

    class ProxyTarget extends Target {
      static get proxySources() {
        return proxySources;
      }

      static get sources() {

        for (const [proxySource, valueMap] of proxySources) {
          for (const [target] of valueMap) {
          }
        }

        Array.from(proxySources.entries()).map((sourceProxy, valueMap) => {
          return {
            proxy: sourceProxy,
            target: Array.from(valueMap.keys())[0]
          };
        });
      } // ==================================================
      // ALL THIS NEEDS REWORKING. BUT PROBABLY NOT URGENT
      // ==================================================


      static get targets() {
        return Array.from(proxySources.values());
      }

      static getTargetFromSource(source) {
        return proxySources.getByValue(source);
      }

      static hasTarget(source) {
        return proxySources.hasValue(source);
      }

      static get type() {
        return 'PROXY';
      }

      static get name() {
        return 'Proxy target';
      }

      static get description() {
        return `Uses other target, and proxies requests, allowing things like iframes to communicate through their host`;
      }

      static test(source) {
        if (typeof source !== 'object') return false; // console.log('FOCUS FNS', source.focus === window.focus)

        if (!(source.proxy instanceof this.Epml)) return false; // return (source === source.window && source.focus === window.focus)

        return true;
      }

      isFrom(source) {} //
      // Bit different to a normal target, has a second parameter


      constructor(source) {
        super(source);
        /**
         * Source looks like {proxy: epmlInstance, target: 'referenceToTargetInProxy'}
         */

        this.constructor.proxySources.push(source.id, this);
        if (!this.constructor.test(source)) throw new Error('Source can not be used with target');
        this._source = source;
      }

      get source() {
        return this._source;
      }

      sendMessage(message) {
        // ID for the proxy
        const uuid = genUUID();
        message = Target.prepareOutgoingData(message);
        message = {
          EpmlMessageType: PROXY_MESSAGE_TYPE,
          // proxyMessageType: 'REQUEST',
          state: 'TRANSIT',
          requestID: uuid,
          target: this._source.target,
          // 'frame1' - the registered name
          message,
          id: this._source.id
        }; // console.log(this._source)
        // Doesn't need to loop through, as a proxy should only ever have a single proxy target (although the target can have multiple...it just shouldn't send THROUGH multiple targets)

        this._source.proxy.targets[0].sendMessage(message); // this._source.proxy.targets.forEach(target => target.sendMessage(messaage))

      }

    }

    // Proxy is a "normal" target, but it intercepts the message, changes the type, and passes it on to the target window, where it's received by the proxy handler...message type reverted, and passed to handleMessage with the actual target
    // Stores id => target (and reverse). Can be used in the host and the target...targets just have different roles :)
    // const proxySources = new TwoWayMap() // Map id to it's target :) OOOHHHHH....MAYBE THIS SHOULD BE IN THE PROXYTARGET...AND IT GET ACCESSED FROM HERE. DUH!!!
    // ProxyTarget.proxySources = proxySources // :)

    const proxySources$1 = ProxyTarget.proxySources; // There will be two message states....transit or delivery. Transit is sent to the proxy....delivery is sent to the target....the source simply being the target in the opposit direction

    let EpmlReference;
    var EpmlProxyPlugin = {
      init: function (Epml) {
        // const proto = Epml.prototype
        Object.defineProperty(ProxyTarget, 'Epml', {
          get: () => Epml
        }); // So that the below functions can access

        EpmlReference = Epml; // Epml.addTargetConstructor(ContentWindowTarget)

        Epml.registerTargetType(ProxyTarget.type, ProxyTarget);
        Epml.registerProxyInstance = registerProxyInstance;
        Epml.registerEpmlMessageType(PROXY_MESSAGE_TYPE, proxyMessageHandler);
      }
    };

    function proxyMessageHandler(data, target) {
      // console.log(data)
      // SWITCH BASED ON STATE === TRANSIT OR DELIVERY
      // If it's in transit, then look up the id in the map and pass the corresponding target...
      // YES! Instead of creating a new target that will translate to send to the thing....you look up the source's id....it will (have to) correspond to the source object created in this window :)
      if (data.state === 'TRANSIT') {
        // This fetches an epml instance which has the id, and so has the targets inside of it...i guess
        const targetInstance = proxySources$1.getByKey(data.target);

        if (!targetInstance) {
          console.warn(`Target ${data.target} not registered.`);
          return;
        }

        data.state = 'DELIVERY'; // console.log(targetInstance)

        targetInstance.targets.forEach(target => target.sendMessage(data)); // targets.targets[0].sendMessage(data)
      } else if (data.state === 'DELIVERY') {
        // This target is a target created through type: proxy
        const targetInstance = proxySources$1.getByKey(data.target);

        if (!targetInstance) {
          console.warn(`Target ${data.target} not registered.`);
          return;
        }

        const target = proxySources$1.getByKey(data.target); // console.log(target)
        // console.log(proxySources)
        // console.log(data)

        EpmlReference.handleMessage(data.message, target);
      }
    } // NOT A TARGET....IT'S AN EPML INSTANCE


    function registerProxyInstance(id, target) {
      // console.log(target, id)
      if (proxySources$1.hasKey(id)) console.warn(`${id} is already defined. Overwriting...`);
      proxySources$1.push(id, target); // console.log(proxySources)
    } // I need to pass the proxySources twowaymap to the proxyTarget object, so that any new target created through it can be pushed to it

    const STREAM_UPDATE_MESSAGE_TYPE = 'STREAM_UPDATE';
    const allStreams = {}; // Maybe not even needed

    class EpmlStream {
      static get streams() {
        return allStreams;
      }

      constructor(name, subscriptionFn = () => {}) {
        this._name = name; // Stream name

        this.targets = []; // Targets listening to the stream

        this._subscriptionFn = subscriptionFn; // Called on subscription, whatever it returns we send to the new target

        if (name in allStreams) {
          console.warn(`Stream with name ${name} already exists! Returning it instead`);
          return allStreams[name];
        }

        allStreams[name] = this;
      }

      async subscribe(target) {
        if (target in this.targets) {
          console.info('Target is already subscribed to this stream');
        }

        const response = await this._subscriptionFn();

        this._sendMessage(response, target);

        this.targets.push(target);
      }

      _sendMessage(data, target) {
        target.sendMessage({
          data: Target.prepareOutgoingData(data),
          EpmlMessageType: STREAM_UPDATE_MESSAGE_TYPE,
          streamName: this._name
        });
      }

      emit(data) {
        this.targets.forEach(target => this._sendMessage(data, target));
      }

    }

    const JOIN_STREAM_MESSAGE_TYPE = 'JOIN_STREAM';
    /**
     * Epml streams module. Wrapper for asynchronous requests and responses (routes)
     * @module plugins/request/request.js
     */
    // Maps a target to an array of routes
    // const routeMap = new Map()
    // const pendingRequests = {}
    // allStreams = Streams.allStreams
    // // Server
    // const targetsToStreamsMap = new Map()
    // // Client

    const subscriptions = {};
    /**
     * Request plugin
     */

    const EpmlStreamPlugin = {
      init: (Epml, options) => {
        // if (Epml.prototype.connectStream) throw new Error('Epml.prototype.connectStream is already defined')
        if (Epml.prototype.subscribe) throw new Error('Epml.prototype.subscribe is already defined');
        if (Epml.prototype.createStream) throw new Error(`Empl.prototype.createStream is already defined`);
        Epml.prototype.subscribe = subscribe;
        Epml.registerEpmlMessageType(JOIN_STREAM_MESSAGE_TYPE, joinStream);
        Epml.registerEpmlMessageType(STREAM_UPDATE_MESSAGE_TYPE, receiveData);
      }
    }; // 'server'side...on the side of myStream = new Stream('myStream'[, joinFn]).

    const joinStream = function (req, target) {
      // if (!targetsToStreamsMap.has(target)) {
      //     // Error, route does not exist
      //     console.warn(`Stream does not exist - missing target`)
      //     return
      // }
      const name = req.data.name; // const streamToJoin = targetsToStreamsMap.get(target)[name]

      const streamToJoin = EpmlStream.streams[name];

      if (!streamToJoin) {
        console.warn(`No stream with name ${name}`, this);
        return;
      }

      streamToJoin.subscribe(target);
    }; // Gives an Epml instance access to a stream...maybe
    // const connectStream = function (streamInstance) {
    //     //
    // }
    // No such thing as Epml.createStream...just myStream = new Epml.Stream()
    // Client side
    // EpmlInstance.subscribe(...)


    const subscribe = function (name, listener) {
      this.targets.forEach(target => {
        target.sendMessage({
          EpmlMessageType: JOIN_STREAM_MESSAGE_TYPE,
          data: {
            name
          }
        });
      });
      subscriptions[name] = subscriptions[name] || [];
      subscriptions[name].push(listener);
    }; // Client side
    // Called on STREAM_UPDATE_MESSAGE_TYPE message


    const receiveData = function (message, target) {
      // console.log('data', message, target)
      subscriptions[message.streamName].forEach(listener => listener(message.data));
    };

    Epml.registerPlugin(requestPlugin);
    Epml.registerPlugin(readyPlugin);
    Epml.registerPlugin(EpmlContentWindowPlugin);
    Epml.registerPlugin(EpmlStreamPlugin);
    Epml.registerPlugin(EpmlProxyPlugin);
    Epml.allowProxying = true;

    // Epml.registerPlugin(ContentWindow)

    window.Epml = Epml;
    window.EpmlStream = EpmlStream;
    const pluginScript = document.createElement('script');
    pluginScript.async = false;
    pluginScript.type = 'module';
    const hash = window.location.hash; // console.log(hash)

    pluginScript.src = '/plugin/' + hash.slice(1); // pluginScript.src = window.location.protocol + '//' + hash.slice(1) + '.' + window.location.hostname + '/main.js'
    // pluginScript.src = '/main.js'
    // console.log(pluginScript.src)

    document.body.appendChild(pluginScript);

})));
//# sourceMappingURL=plugin-mainjs-loader.js.map
