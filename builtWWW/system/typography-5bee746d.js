System.register(['./default-theme-f4872173.js', './pwa-helpers-e04d8fac.js', './iron-a11y-keys-behavior-c9affbac.js'], function (exports) {
    'use strict';
    var createCommonjsModule, LOG_IN, SELECT_ADDRESS, LOG_OUT, INIT_WORKERS, ADD_PLUGIN, ADD_PLUGIN_URL, NAVIGATE, global, process, nextTick, html;
    return {
        setters: [function (module) {
            createCommonjsModule = module.a;
        }, function (module) {
            LOG_IN = module.f;
            SELECT_ADDRESS = module.S;
            LOG_OUT = module.g;
            INIT_WORKERS = module.I;
            ADD_PLUGIN = module.i;
            ADD_PLUGIN_URL = module.j;
            NAVIGATE = module.k;
            global = module.l;
            process = module.m;
            nextTick = module.o;
        }, function (module) {
            html = module.h;
        }],
        execute: function () {

            exports('r', request);

            // import { doSelectAddress } from '../app-actions.js'
            // export const doLogin = (wallet, pin) => {
            /*
                sourceType: 'storedWallet',
                source: {
                    wallet,
                    password: pin + '' + birthMonth
                }
            */

            const doSelectAddress = exports('e', address => {
                return (dispatch, getState) => {
                    dispatch(selectAddress(address));
                }
            });

            const selectAddress = address => {
                return {
                    type: SELECT_ADDRESS,
                    address
                }
            };

            // export const doLogin = (sourceType, source, statusUpdateFn) => {
            //     return async (dispatch, getState) => {
            //         dispatch(login())
            //         return createWallet(sourceType, source, statusUpdateFn)
            //             .then(wallet => {
            //                 dispatch(login('success', {
            //                     wallet,
            //                     pin: source.pin
            //                 }))
            //                 dispatch(selectAddress(wallet._addresses[0]))
            //                 return wallet
            //             })
            //             .catch(err => {
            //                 dispatch(login('error', err))
            //                 throw err // Throw it again so that it bubbles
            //             })
            //     }
            // }

            // const login = (status, payload) => {
            //     return {
            //         type: LOG_IN,
            //         status,
            //         payload
            //     }
            // }

            const doLogin = exports('b', wallet => {
                return (dispatch, getState) => {
                    dispatch(login('success', {
                        wallet
                    }));
                }
            });

            const login = (status, payload) => {
                return {
                    type: LOG_IN,
                    status,
                    payload
                }
            };

            const doLogout = exports('f', () => {
                // Maybe add some checks for ongoing stuff...who knows
                return (dispatch, getState) => {
                    dispatch(logout());
                }
            });

            const logout = () => {
                return {
                    type: LOG_OUT
                }
            };

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
                static prepareOutgoingData (data) {
                    // console.log(data)
                    return JSON.stringify(data)
                }

                constructor (source) {
                    if (!source) throw new Error('Source must be spcified')

                    // Not needed, uses type instead
                    // if (!this.constructor.test) throw new Error('Class requires a static `test` method in order to check whether or not a source is compatible with the constructor')

                    if (!this.constructor.type) throw new Error(`Type not defined`)

                    if (!this.constructor.name) console.warn(`No name provided`);

                    if (!this.constructor.description) console.warn('No description provided');

                    if (!this.sendMessage) throw new Error('A new target requires a sendMessage method')
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
                static registerPlugin (plugin, options) {
                    plugin.init(Epml, options);
                    return Epml
                }

                // /**
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

                static registerTargetType (type, targetConstructor) {
                    if (type in targetTypes) throw new Error('Target type has already been registered')
                    if (!(targetConstructor.prototype instanceof Target)) throw new Error('Target constructors must inherit from the Target base class')
                    targetTypes[type] = targetConstructor;
                    return Epml
                }

                static registerEpmlMessageType (type, fn) {
                    messageTypes[type] = fn;
                    return Epml
                }

                /**
                 * Installs a plugin for only this instance
                 * @param {object} plugin - Epml plugin
                 */
                registerPlugin (plugin) {
                    plugin.init(this);
                    return this
                }

                /**
                 * Takes data from an event and figures out what to do with it
                 * @param {object} strData - String data received from something like event.data
                 * @param {Target} target - Target object from which the message was received
                 */
                static handleMessage (strData, target) {
                    // Changes to targetID...and gets fetched through Epml.targets[targetID]...or something like that
                    const data = Epml.prepareIncomingData(strData);
                    // console.log(target)
                    if ('EpmlMessageType' in data) {
                        messageTypes[data.EpmlMessageType](data, target, this); // Reference to Epml
                    }
                    // Then send a response or whatever back with target.sendMessage(this.constructor.prepareOutgoingData(someData))
                }

                /**
                * Prepares data for processing. Take JSON string and return object
                * @param {string} strData - JSON data in string form
                */
                static prepareIncomingData (strData) {
                    if (typeof strData !== 'string') {
                        // If sending object is enabled then return the string...otherwise stringify and then parse (safeguard against code injections...whatever the word for that was)
                        return strData
                    }
                    return JSON.parse(strData)
                }

                /**
                 * Takes (a) target(s) and returns an array of target Objects
                 * @param {Object|Object[]} targets
                 * @returns {Object[]} - An array of target objects
                 */
                static createTargets (targetSources) {
                    if (!Array.isArray(targetSources)) targetSources = [targetSources];

                    const targets = [];

                    for (const targetSource of targetSources) {
                        if (targetSource.allowObjects === undefined) targetSource.allowObjects = false;
                        targets.push(...Epml.createTarget(targetSource));
                    }

                    return targets
                }

                /**
                 * Takes a single target source and returns an array of target object
                 * @param {any} targetSource - Can be any target source for which a targetConstructor has been installed
                 * @return {Object} - Target object
                 */
                static createTarget (targetSource) {
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
                        throw new Error(`Target type '${targetSource.type}' not registered`)
                    }
                    let newTargets = new targetTypes[targetSource.type](targetSource.source);
                    if (!Array.isArray(newTargets)) newTargets = [newTargets];
                    for (const newTarget of newTargets) {
                        newTarget.allowObjects = targetSource.allowObjects;
                    }
                    return newTargets
                }

                /**
                 * Creates a new Epml instance
                 * @constructor
                 * @param {Object|Object[]} targets - Target instantiation object or an array of them
                 */
                constructor (targets) {
                    this.targets = this.constructor.createTargets(targets);
                }
            } exports('k', Epml);

            // https://gist.github.com/LeverOne/1308368
            var genUUID = (a, b) => { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-'); return b };

            // function () {
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

                    if (Epml.prototype.ready) throw new Error('Epml.prototype.ready is already defined')
                    if (Epml.prototype.imReady) throw new Error('Epml.prototype.imReady is already defined')

                    Epml.prototype.ready = readyPrototype;
                    Epml.prototype.resetReadyCheck = resetCheckReadyPrototype;
                    Epml.prototype.imReady = imReadyPrototype;

                    // Being asked if ready
                    Epml.registerEpmlMessageType(READY_MESSAGE_TYPE, respondToReadyRequest);

                    // Getting a response after polling for ready
                    Epml.registerEpmlMessageType(READY_MESSAGE_RESPONSE_TYPE, readyResponseHandler);
                }
            };

            // This is the only part in the other "window"
            function respondToReadyRequest (data, target) {
                if (!target._i_am_ready) return
                target.sendMessage({
                    EpmlMessageType: READY_MESSAGE_RESPONSE_TYPE,
                    requestID: data.requestID
                });
            }

            function imReadyPrototype () {
                // console.log('I\'m ready called', this)
                for (const target of this.targets) {
                    target._i_am_ready = true;
                }
                // this._ready_plugin.imReady = true
            }

            // myEpmlInstance.ready().then(...)
            function readyPrototype () {
                this._ready_plugin = this._ready_plugin || {};

                this._ready_plugin.pendingReadyResolves = this._ready_plugin.pendingReadyResolves ? this._ready_plugin.pendingReadyResolves : []; // Call resolves when all targets are ready

                if (!this._pending_ready_checking) {
                    this._pending_ready_checking = true;
                    checkReady.call(this, this.targets)
                        .then(() => {
                            this._ready_plugin.pendingReadyResolves.forEach(resolve => resolve());
                        });
                }

                return new Promise(resolve => {
                    if (this._ready_plugin.isReady) {
                        resolve();
                    } else {
                        this._ready_plugin.pendingReadyResolves.push(resolve);
                    }
                })
            }

            function resetCheckReadyPrototype () {
                this._ready_plugin = this._ready_plugin || {};
                this._ready_plugin.isReady = false;
            }

            function checkReady (targets) {
                // console.log('Checking', targets)
                this._ready_plugin = this._ready_plugin || {};
                this._ready_plugin.pendingReadyResolves = [];

                return Promise.all(targets.map(target => {
                    return new Promise((resolve, reject) => {
                        const id = genUUID();
                        // Send a message at an interval.
                        const inteval = setInterval(() => {
                            // console.log('interval')
                            // , this, window.location
                            target.sendMessage({
                                EpmlMessageType: READY_MESSAGE_TYPE,
                                requestID: id
                            });
                        }, READY_CHECK_INTERVAL);

                        // Clear the interval and resolve the promise
                        pendingReadyRequests[id] = () => {
                            // console.log('RESOLVING')
                            clearInterval(inteval);
                            resolve();
                        };
                    })
                })).then(() => {
                    this._ready_plugin.isReady = true;
                })
            }

            // Sets ready for a SINGLE TARGET
            function readyResponseHandler (data, target) {
                // console.log('response')
                // console.log('==== THIS TARGET IS REEEEEAAADDDDYYY ====')
                // console.log(target)

                target._ready_plugin = target._ready_plugin || {};
                target._ready_plugin._is_ready = true;

                pendingReadyRequests[data.requestID]();
            }

            // IE8 event listener support...probably going to be pointless in the end
            function bindEvent (element, eventName, eventHandler) {
                if (element.addEventListener) {
                    element.addEventListener(eventName, eventHandler, false);
                } else if (element.attachEvent) {
                    element.attachEvent('on' + eventName, eventHandler);
                } else {
                    throw new Error('Could not bind event.')
                }
            }

            const sourceTargetMap = new Map();

            /**
             * Can only take ONE iframe or popup as source
             */
            class ContentWindowTarget extends Target {
                static get sources () {
                    return Array.from(sourceTargetMap.keys())
                }

                static get targets () {
                    return Array.from(sourceTargetMap.values())
                }

                static getTargetFromSource (source) {
                    return sourceTargetMap.get(source)
                }

                static hasTarget (source) {
                    return sourceTargetMap.has(source)
                }

                static get type () {
                    return 'WINDOW'
                }

                static get name () {
                    return 'Content window plugin'
                }

                static get description () {
                    return `Allows Epml to communicate with iframes and popup windows.`
                }

                static test (source) {
                    // if (typeof source !== 'object') return false
                    // console.log('FOCUS FNS', source.focus === window.focus)
                    // return (source === source.window && source.focus === window.focus) // <- Cause cors is a beach
                    // return (typeof source === 'object' && source.focus === window.focus)
                    return (typeof source === 'object' && source === source.self)
                }

                isFrom (source) {
                    //
                }

                constructor (source) {
                    super(source);

                    // if (source.contentWindow) source = source.contentWindow // <- Causes issues when cross origin

                    // If the source already has an existing target object, simply return it.
                    if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

                    if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

                    this._source = source;

                    // SHOULD MODIFY. Should become source = { contentWindow, origin } rather than source = contentWindow
                    // try {
                    //     this._sourceOrigin = source.origin
                    // } catch (e) {
                    //     // Go away CORS
                    //     this._sourceOrigin = '*'
                    // }
                    this._sourceOrigin = '*';

                    sourceTargetMap.set(source, this);

                    // targetWindows.push(source)
                }

                get source () {
                    return this._source
                }

                sendMessage (message) {
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
                        if (!ContentWindowTarget.hasTarget(event.source)) return
                        Epml.handleMessage(event.data, ContentWindowTarget.getTargetFromSource(event.source));
                        // Epml.handleMessage(event.data, event.source, message => {
                        //     event.source.postMessage(message, event.origin)
                        // })
                    });

                    // Epml.addTargetConstructor(ContentWindowTarget)
                    Epml.registerTargetType(ContentWindowTarget.type, ContentWindowTarget);

                    // Epml.addTargetHandler({
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

            // import Target from '../../EpmlCore/Target.js'

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
                    if (Epml.prototype.request) throw new Error('Epml.prototype.request is already defined')

                    if (Epml.prototype.route) throw new Error(`Empl.prototype.route is already defined`)

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
                        };
                        // console.log(pendingRequests)
                    })
                }))
                    .then(responses => {
                        // console.log(responses)
                        // If an instance only has one target, don't return the array. That'd be weird
                        if (this.targets.length === 1) return responses[0]
                    })
            };

            function requestResponseHandler (data, target, Epml) {
                // console.log("REQUESSTTT", data, pendingRequests)
                // console.log('IN REQUESTHANDLER', pendingRequests, data)
                if (data.requestID in pendingRequests) {
                    // console.log(data)
                    // const parsedData = Epml.prepareIncomingData(data.data)
                    const parsedData = data.data;
                    // const parsedData = data.data
                    pendingRequests[data.requestID](parsedData);
                } else {
                    console.warn('requestID not found in pendingRequests');
                }
            }

            function requestHandler (data, target) {
                // console.log('REQUESTHANLDER')
                // console.log(routeMap)
                // console.log(data)
                // console.log(target)
                if (!routeMap.has(target)) {
                    // Error, route does not exist
                    console.warn(`Route does not exist - missing target`);
                    return
                }
                const routes = routeMap.get(target);
                // console.log(data, routes)
                const route = routes[data.requestType];
                if (!route) {
                    // Error, route does not exist
                    console.warn('Route does not exist');
                    return
                }
                // console.log('CALLING FN')
                route(data, target);
            }

            function createRoute (route, fn) {
                // console.log(`CREATING ROUTTTEEE "${route}"`)
                if (!this.routes) this.routes = {};

                if (this.routes[route]) return

                for (const target of this.targets) {
                    if (!routeMap.has(target)) {
                        routeMap.set(target, {});
                    }

                    const routes = routeMap.get(target);

                    routes[route] = (data, target) => {
                        // console.log('ROUTE FN CALLED', data)
                        // User supllied route function. This will turn it into a promise if it isn't one, or it will leave it as one.
                        Promise.resolve(fn(data))
                            .catch(err => {
                                if (err instanceof Error) return err.message
                                return err
                            }) // Still send errors you dumb fuck
                            .then((response) => {
                                // console.log(response)
                                // response = this.constructor.prepareOutgoingData(response)
                                // const preparedResponse = Target.prepareOutgoingData(response)
                                target.sendMessage({
                                    data: response, // preparedResponse
                                    EpmlMessageType: REQUEST_RESPONSE_MESSAGE_TYPE,
                                    requestOrResponse: 'request',
                                    requestID: data.requestID
                                });
                            });
                    };
                }

                // console.log('hello')
            }

            class TwoWayMap {
                constructor (map) {
                    this._map = map || new Map();
                    this._revMap = new Map();

                    this._map.forEach((key, value) => {
                        this._revMap.set(value, key);
                    });
                }

                values () {
                    return this._map.values()
                }

                entries () {
                    return this._map.entries()
                }

                push (key, value) {
                    this._map.set(key, value);
                    this._revMap.set(value, key);
                }

                getByKey (key) {
                    return this._map.get(key)
                }

                getByValue (value) {
                    return this._revMap.get(value)
                }

                hasKey (key) {
                    return this._map.has(key)
                }

                hasValue (value) {
                    return this._revMap.has(value)
                }

                deleteByKey (key) {
                    const value = this._map.get(key);
                    this._map.delete(key);
                    this._revMap.delete(value);
                }

                deleteByValue (value) {
                    const key = this._revMap.get(value);
                    this._map.delete(key);
                    this._revMap.delete(value);
                }
            }

            const PROXY_MESSAGE_TYPE = 'PROXY_MESSAGE';

            // Proxy target source will be another instance of epml. The source instance will be the proxy. The extra parameter will be the target for that proxy

            // Stores source.proxy => new Map([[source.target, new ProxyTarget(source)]])
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
                static get proxySources () {
                    return proxySources
                }

                static get sources () {
                    for (const [proxySource, valueMap] of proxySources) {
                        for (const [target] of valueMap) {
                        }
                    }
                    Array.from(proxySources.entries()).map((sourceProxy, valueMap) => {
                        return {
                            proxy: sourceProxy,
                            target: Array.from(valueMap.keys())[0]
                        }
                    });
                }
                // ==================================================
                // ALL THIS NEEDS REWORKING. BUT PROBABLY NOT URGENT
                // ==================================================
                static get targets () {
                    return Array.from(proxySources.values())
                }

                static getTargetFromSource (source) {
                    return proxySources.getByValue(source)
                }

                static hasTarget (source) {
                    return proxySources.hasValue(source)
                }

                static get type () {
                    return 'PROXY'
                }

                static get name () {
                    return 'Proxy target'
                }

                static get description () {
                    return `Uses other target, and proxies requests, allowing things like iframes to communicate through their host`
                }

                static test (source) {
                    if (typeof source !== 'object') return false
                    // console.log('FOCUS FNS', source.focus === window.focus)
                    if (!(source.proxy instanceof this.Epml)) return false
                    // return (source === source.window && source.focus === window.focus)
                    return true
                }

                isFrom (source) {
                    //
                }

                // Bit different to a normal target, has a second parameter
                constructor (source) {
                    super(source);
                    /**
                     * Source looks like {proxy: epmlInstance, target: 'referenceToTargetInProxy'}
                     */

                    this.constructor.proxySources.push(source.id, this);

                    if (!this.constructor.test(source)) throw new Error('Source can not be used with target')

                    this._source = source;
                }

                get source () {
                    return this._source
                }

                sendMessage (message) {
                    // ID for the proxy
                    const uuid = genUUID();

                    message = Target.prepareOutgoingData(message);

                    message = {
                        EpmlMessageType: PROXY_MESSAGE_TYPE,
                        // proxyMessageType: 'REQUEST',
                        state: 'TRANSIT',
                        requestID: uuid,
                        target: this._source.target, // 'frame1' - the registered name
                        message,
                        id: this._source.id
                    };

                    // console.log(this._source)
                    // Doesn't need to loop through, as a proxy should only ever have a single proxy target (although the target can have multiple...it just shouldn't send THROUGH multiple targets)
                    this._source.proxy.targets[0].sendMessage(message);
                    // this._source.proxy.targets.forEach(target => target.sendMessage(messaage))
                }
            }

            // Proxy is a "normal" target, but it intercepts the message, changes the type, and passes it on to the target window, where it's received by the proxy handler...message type reverted, and passed to handleMessage with the actual target
            // import Target from '../../EpmlCore/Target.js';
            // Stores id => target (and reverse). Can be used in the host and the target...targets just have different roles :)
            // const proxySources = new TwoWayMap() // Map id to it's target :) OOOHHHHH....MAYBE THIS SHOULD BE IN THE PROXYTARGET...AND IT GET ACCESSED FROM HERE. DUH!!!
            // ProxyTarget.proxySources = proxySources // :)
            const proxySources$1 = ProxyTarget.proxySources;
            // There will be two message states....transit or delivery. Transit is sent to the proxy....delivery is sent to the target....the source simply being the target in the opposit direction

            let EpmlReference;

            var EpmlProxyPlugin = {
                init: function (Epml) {
                    // const proto = Epml.prototype

                    Object.defineProperty(ProxyTarget, 'Epml', {
                        get: () => Epml
                    });

                    // So that the below functions can access
                    EpmlReference = Epml;

                    // Epml.addTargetConstructor(ContentWindowTarget)
                    Epml.registerTargetType(ProxyTarget.type, ProxyTarget);

                    Epml.registerProxyInstance = registerProxyInstance;

                    Epml.registerEpmlMessageType(PROXY_MESSAGE_TYPE, proxyMessageHandler);
                }
            };

            function proxyMessageHandler (data, target) {
                // console.log(data)
                // SWITCH BASED ON STATE === TRANSIT OR DELIVERY
                // If it's in transit, then look up the id in the map and pass the corresponding target...
                // YES! Instead of creating a new target that will translate to send to the thing....you look up the source's id....it will (have to) correspond to the source object created in this window :)

                if (data.state === 'TRANSIT') {
                    // This fetches an epml instance which has the id, and so has the targets inside of it...i guess
                    const targetInstance = proxySources$1.getByKey(data.target);
                    if (!targetInstance) {
                        console.warn(`Target ${data.target} not registered.`);
                        return
                    }

                    data.state = 'DELIVERY';
                    // console.log(targetInstance)
                    targetInstance.targets.forEach(target => target.sendMessage(data));
                    // targets.targets[0].sendMessage(data)
                } else if (data.state === 'DELIVERY') {
                    // This target is a target created through type: proxy
                    const targetInstance = proxySources$1.getByKey(data.target);
                    if (!targetInstance) {
                        console.warn(`Target ${data.target} not registered.`);
                        return
                    }
                    const target = proxySources$1.getByKey(data.target);
                    // console.log(target)
                    // console.log(proxySources)
                    // console.log(data)
                    EpmlReference.handleMessage(data.message, target);
                }
            }

            // NOT A TARGET....IT'S AN EPML INSTANCE
            function registerProxyInstance (id, target) {
                // console.log(target, id)
                if (proxySources$1.hasKey(id)) console.warn(`${id} is already defined. Overwriting...`);
                proxySources$1.push(id, target);
                // console.log(proxySources)
            }

            // I need to pass the proxySources twowaymap to the proxyTarget object, so that any new target created through it can be pushed to it

            const sourceTargetMap$1 = new Map();

            /**
             * Can only take ONE iframe or popup as source
             */
            class WorkerTarget extends Target {
                static get sources () {
                    return Array.from(sourceTargetMap$1.keys())
                }

                static get targets () {
                    return Array.from(sourceTargetMap$1.values())
                }

                static getTargetFromSource (source) {
                    return sourceTargetMap$1.get(source)
                }

                static hasTarget (source) {
                    return sourceTargetMap$1.has(source)
                }

                static get type () {
                    return 'WORKER'
                }

                static get name () {
                    return 'Web/Service worker plugin'
                }

                static get description () {
                    return `Allows Epml to communicate with web and service workers.`
                }

                static test (source) {
                    if (typeof source !== 'object') return false
                    // console.log('FOCUS FNS', source.focus === window.focus)

                    return ((typeof WorkerGlobalScope !== 'undefined' && source instanceof WorkerGlobalScope) || source instanceof Worker)
                }

                isFrom (source) {
                    //
                }

                constructor (source) {
                    super(source);

                    // if (source.contentWindow) source = source.contentWindow

                    // If the source already has an existing target object, simply return it.
                    if (sourceTargetMap$1.has(source)) return sourceTargetMap$1.get(source)

                    if (!this.constructor.EpmlReference) throw new Error('No Epml(core) reference')

                    if (!this.constructor.test(source)) throw new Error(`Source can not be used with target type '${this.constructor.type}'`)

                    this._source = source;

                    // sourceTargetMap.set(source, this)

                    // And listen for messages
                    // console.log(source)
                    source.onmessage = event => {
                        // console.log(event)
                        // console.log(this)
                        this.constructor.EpmlReference.handleMessage(event.data, this);
                    };
                    // targetWindows.push(source)
                }

                get source () {
                    return this._source
                }

                sendMessage (message) {
                    message = Target.prepareOutgoingData(message);
                    this._source.postMessage(message, this._sourceOrigin);
                }
            }

            /**
             * Epml webworker plugin. Enables communication with web/service workers
             */
            var EpmlWorkerPlugin = {
                init: function (Epml) {
                    // Adding the listener to the worker requires a reference to Epml for the handleMessage method
                    WorkerTarget.EpmlReference = Epml;

                    // Epml.addTargetConstructor(ContentWindowTarget)
                    Epml.registerTargetType(WorkerTarget.type, WorkerTarget);
                }
            };

            const STREAM_UPDATE_MESSAGE_TYPE = 'STREAM_UPDATE';

            const allStreams = {}; // Maybe not even needed

            class EpmlStream {
                static get streams () {
                    return allStreams
                }

                constructor (name, subscriptionFn = () => {}) {
                    this._name = name; // Stream name
                    this.targets = []; // Targets listening to the stream
                    this._subscriptionFn = subscriptionFn; // Called on subscription, whatever it returns we send to the new target
                    if (name in allStreams) {
                        console.warn(`Stream with name ${name} already exists! Returning it instead`);
                        return allStreams[name]
                    }
                    allStreams[name] = this;
                }

                async subscribe (target) {
                    if (target in this.targets) {
                        console.info('Target is already subscribed to this stream');
                    }
                    const response = await this._subscriptionFn();
                    this._sendMessage(response, target);
                    this.targets.push(target);
                }

                _sendMessage (data, target) {
                    target.sendMessage({
                        data: Target.prepareOutgoingData(data),
                        EpmlMessageType: STREAM_UPDATE_MESSAGE_TYPE,
                        streamName: this._name
                    });
                }

                emit (data) {
                    this.targets.forEach(target => this._sendMessage(data, target));
                }
            } exports('E', EpmlStream);

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
                    if (Epml.prototype.subscribe) throw new Error('Epml.prototype.subscribe is already defined')

                    if (Epml.prototype.createStream) throw new Error(`Empl.prototype.createStream is already defined`)

                    Epml.prototype.subscribe = subscribe;

                    Epml.registerEpmlMessageType(JOIN_STREAM_MESSAGE_TYPE, joinStream);
                    Epml.registerEpmlMessageType(STREAM_UPDATE_MESSAGE_TYPE, receiveData);
                }
            };

            // 'server'side...on the side of myStream = new Stream('myStream'[, joinFn]).
            const joinStream = function (req, target) {
                // if (!targetsToStreamsMap.has(target)) {
                //     // Error, route does not exist
                //     console.warn(`Stream does not exist - missing target`)
                //     return
                // }
                const name = req.data.name;
                // const streamToJoin = targetsToStreamsMap.get(target)[name]
                const streamToJoin = EpmlStream.streams[name];
                if (!streamToJoin) {
                    console.warn(`No stream with name ${name}`, this);
                    return
                }

                streamToJoin.subscribe(target);
            };

            // Gives an Epml instance access to a stream...maybe
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
                        data: { name }
                    });
                });
                subscriptions[name] = subscriptions[name] || [];
                subscriptions[name].push(listener);
            };
            // Client side
            // Called on STREAM_UPDATE_MESSAGE_TYPE message
            const receiveData = function (message, target) {
                // console.log('data', message, target)
                subscriptions[message.streamName].forEach(listener => listener(message.data));
            };

            // Epml.registerPlugin(contentWindowsPlugin)
            Epml.registerPlugin(requestPlugin);
            Epml.registerPlugin(readyPlugin);
            Epml.registerPlugin(EpmlContentWindowPlugin);
            Epml.registerPlugin(EpmlStreamPlugin);
            Epml.registerPlugin(EpmlProxyPlugin);
            Epml.allowProxying = true;

            Epml.registerPlugin(EpmlWorkerPlugin);

            const doInitWorkers = exports('d', (numberOfWorkers, workerURL) => {
                const workers = [];
                return (dispatch, getState) => {
                    dispatch(initWorkers()); // loading
                    try {
                        for (let i = 0; i < numberOfWorkers; i++) {
                            workers.push(new Epml({ type: 'WORKER', source: new Worker(workerURL) }));
                        }
                        Promise.all(workers.map(workerEpml => workerEpml.ready()))
                            .then(() => {
                                // console.log('All workers ready')
                                dispatch(initWorkers('success', workers));
                            });
                    } catch (e) {
                        dispatch(initWorkers('error', e));
                    }
                }
            });
            const initWorkers = (status, payload) => {
                return {
                    type: INIT_WORKERS,
                    status,
                    payload
                }
            };

            // import { addPluginRoutes } from '../../../plugins/addPluginRoutes.js'
            // BOUND action creator
            const doAddPluginUrl = exports('g', (urlOptions) => {
                return (dispatch, getState) => {
                    dispatch(addPluginUrl(urlOptions));
                }
            });

            const addPluginUrl = (payload) => {
                return {
                    type: ADD_PLUGIN_URL,
                    payload
                }
            };

            const doAddPlugin = exports('l', (epmlInstance) => {
                // Add the appropriate routes here
                return (dispatch, getState) => {
                    dispatch(addPlugin(epmlInstance));
                }
            });

            const addPlugin = (payload) => {
                return {
                    type: ADD_PLUGIN,
                    payload
                }
            };

            const doNavigate = exports('a', loca => {
                return (dispatch, getState) => {
                    dispatch(navigate(loca));
                }
            });

            // Action creator
            const navigate = loca => {
                // Action
                // console.log(loca)
                return {
                    type: NAVIGATE,
                    url: loca.pathname
                }
            };

            // export const logIn = () => {
            //     return { type: LOG_IN }
            // }

            // export const logOut = () => {
            //     return { type: LOG_OUT }
            // }

            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
            var inited = false;
            function init () {
              inited = true;
              var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
              }

              revLookup['-'.charCodeAt(0)] = 62;
              revLookup['_'.charCodeAt(0)] = 63;
            }

            function toByteArray (b64) {
              if (!inited) {
                init();
              }
              var i, j, l, tmp, placeHolders, arr;
              var len = b64.length;

              if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
              }

              // the number of equal signs (place holders)
              // if there are two placeholders, than the two characters before it
              // represent one byte
              // if there is only one, then the three characters before it represent 2 bytes
              // this is just a cheap hack to not do indexOf twice
              placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

              // base64 is 4/3 + up to two characters of the original data
              arr = new Arr(len * 3 / 4 - placeHolders);

              // if there are placeholders, only get up to the last complete 4 chars
              l = placeHolders > 0 ? len - 4 : len;

              var L = 0;

              for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = (tmp >> 16) & 0xFF;
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              if (placeHolders === 2) {
                tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
                arr[L++] = tmp & 0xFF;
              } else if (placeHolders === 1) {
                tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              return arr
            }

            function tripletToBase64 (num) {
              return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
            }

            function encodeChunk (uint8, start, end) {
              var tmp;
              var output = [];
              for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                output.push(tripletToBase64(tmp));
              }
              return output.join('')
            }

            function fromByteArray (uint8) {
              if (!inited) {
                init();
              }
              var tmp;
              var len = uint8.length;
              var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
              var output = '';
              var parts = [];
              var maxChunkLength = 16383; // must be multiple of 3

              // go through the array every three bytes, we'll deal with trailing stuff later
              for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
              }

              // pad the end with zeros, but make sure to not forget the extra bytes
              if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += lookup[tmp >> 2];
                output += lookup[(tmp << 4) & 0x3F];
                output += '==';
              } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
                output += lookup[tmp >> 10];
                output += lookup[(tmp >> 4) & 0x3F];
                output += lookup[(tmp << 2) & 0x3F];
                output += '=';
              }

              parts.push(output);

              return parts.join('')
            }

            function read (buffer, offset, isLE, mLen, nBytes) {
              var e, m;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var nBits = -7;
              var i = isLE ? (nBytes - 1) : 0;
              var d = isLE ? -1 : 1;
              var s = buffer[offset + i];

              i += d;

              e = s & ((1 << (-nBits)) - 1);
              s >>= (-nBits);
              nBits += eLen;
              for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              m = e & ((1 << (-nBits)) - 1);
              e >>= (-nBits);
              nBits += mLen;
              for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              if (e === 0) {
                e = 1 - eBias;
              } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
              } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
              }
              return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
            }

            function write (buffer, value, offset, isLE, mLen, nBytes) {
              var e, m, c;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
              var i = isLE ? 0 : (nBytes - 1);
              var d = isLE ? 1 : -1;
              var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

              value = Math.abs(value);

              if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
              } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                  e--;
                  c *= 2;
                }
                if (e + eBias >= 1) {
                  value += rt / c;
                } else {
                  value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                  e++;
                  c /= 2;
                }

                if (e + eBias >= eMax) {
                  m = 0;
                  e = eMax;
                } else if (e + eBias >= 1) {
                  m = (value * c - 1) * Math.pow(2, mLen);
                  e = e + eBias;
                } else {
                  m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                  e = 0;
                }
              }

              for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

              e = (e << mLen) | m;
              eLen += mLen;
              for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

              buffer[offset + i - d] |= s * 128;
            }

            var toString = {}.toString;

            var isArray = Array.isArray || function (arr) {
              return toString.call(arr) == '[object Array]';
            };

            var INSPECT_MAX_BYTES = 50;

            /**
             * If `Buffer.TYPED_ARRAY_SUPPORT`:
             *   === true    Use Uint8Array implementation (fastest)
             *   === false   Use Object implementation (most compatible, even IE6)
             *
             * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
             * Opera 11.6+, iOS 4.2+.
             *
             * Due to various browser bugs, sometimes the Object implementation will be used even
             * when the browser supports typed arrays.
             *
             * Note:
             *
             *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
             *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
             *
             *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
             *
             *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
             *     incorrect length in some situations.

             * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
             * get the Object implementation, which is slower but behaves correctly.
             */
            Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
              ? global.TYPED_ARRAY_SUPPORT
              : true;

            /*
             * Export kMaxLength after typed array support is determined.
             */
            var _kMaxLength = kMaxLength();

            function kMaxLength () {
              return Buffer.TYPED_ARRAY_SUPPORT
                ? 0x7fffffff
                : 0x3fffffff
            }

            function createBuffer (that, length) {
              if (kMaxLength() < length) {
                throw new RangeError('Invalid typed array length')
              }
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = new Uint8Array(length);
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                if (that === null) {
                  that = new Buffer(length);
                }
                that.length = length;
              }

              return that
            }

            /**
             * The Buffer constructor returns instances of `Uint8Array` that have their
             * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
             * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
             * and the `Uint8Array` methods. Square bracket notation works as expected -- it
             * returns a single octet.
             *
             * The `Uint8Array` prototype remains unmodified.
             */

            function Buffer (arg, encodingOrOffset, length) {
              if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                return new Buffer(arg, encodingOrOffset, length)
              }

              // Common case.
              if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                  throw new Error(
                    'If encoding is specified then the first argument must be a string'
                  )
                }
                return allocUnsafe(this, arg)
              }
              return from(this, arg, encodingOrOffset, length)
            }

            Buffer.poolSize = 8192; // not used by this implementation

            // TODO: Legacy, not needed anymore. Remove in next major version.
            Buffer._augment = function (arr) {
              arr.__proto__ = Buffer.prototype;
              return arr
            };

            function from (that, value, encodingOrOffset, length) {
              if (typeof value === 'number') {
                throw new TypeError('"value" argument must not be a number')
              }

              if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
                return fromArrayBuffer(that, value, encodingOrOffset, length)
              }

              if (typeof value === 'string') {
                return fromString(that, value, encodingOrOffset)
              }

              return fromObject(that, value)
            }

            /**
             * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
             * if value is a number.
             * Buffer.from(str[, encoding])
             * Buffer.from(array)
             * Buffer.from(buffer)
             * Buffer.from(arrayBuffer[, byteOffset[, length]])
             **/
            Buffer.from = function (value, encodingOrOffset, length) {
              return from(null, value, encodingOrOffset, length)
            };

            if (Buffer.TYPED_ARRAY_SUPPORT) {
              Buffer.prototype.__proto__ = Uint8Array.prototype;
              Buffer.__proto__ = Uint8Array;
            }

            function assertSize (size) {
              if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be a number')
              } else if (size < 0) {
                throw new RangeError('"size" argument must not be negative')
              }
            }

            function alloc (that, size, fill, encoding) {
              assertSize(size);
              if (size <= 0) {
                return createBuffer(that, size)
              }
              if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string'
                  ? createBuffer(that, size).fill(fill, encoding)
                  : createBuffer(that, size).fill(fill)
              }
              return createBuffer(that, size)
            }

            /**
             * Creates a new filled Buffer instance.
             * alloc(size[, fill[, encoding]])
             **/
            Buffer.alloc = function (size, fill, encoding) {
              return alloc(null, size, fill, encoding)
            };

            function allocUnsafe (that, size) {
              assertSize(size);
              that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < size; ++i) {
                  that[i] = 0;
                }
              }
              return that
            }

            /**
             * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
             * */
            Buffer.allocUnsafe = function (size) {
              return allocUnsafe(null, size)
            };
            /**
             * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
             */
            Buffer.allocUnsafeSlow = function (size) {
              return allocUnsafe(null, size)
            };

            function fromString (that, string, encoding) {
              if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8';
              }

              if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding')
              }

              var length = byteLength(string, encoding) | 0;
              that = createBuffer(that, length);

              var actual = that.write(string, encoding);

              if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                that = that.slice(0, actual);
              }

              return that
            }

            function fromArrayLike (that, array) {
              var length = array.length < 0 ? 0 : checked(array.length) | 0;
              that = createBuffer(that, length);
              for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255;
              }
              return that
            }

            function fromArrayBuffer (that, array, byteOffset, length) {
              array.byteLength; // this throws if `array` is not a valid ArrayBuffer

              if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('\'offset\' is out of bounds')
              }

              if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('\'length\' is out of bounds')
              }

              if (byteOffset === undefined && length === undefined) {
                array = new Uint8Array(array);
              } else if (length === undefined) {
                array = new Uint8Array(array, byteOffset);
              } else {
                array = new Uint8Array(array, byteOffset, length);
              }

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = array;
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                that = fromArrayLike(that, array);
              }
              return that
            }

            function fromObject (that, obj) {
              if (internalIsBuffer(obj)) {
                var len = checked(obj.length) | 0;
                that = createBuffer(that, len);

                if (that.length === 0) {
                  return that
                }

                obj.copy(that, 0, 0, len);
                return that
              }

              if (obj) {
                if ((typeof ArrayBuffer !== 'undefined' &&
                    obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
                  if (typeof obj.length !== 'number' || isnan(obj.length)) {
                    return createBuffer(that, 0)
                  }
                  return fromArrayLike(that, obj)
                }

                if (obj.type === 'Buffer' && isArray(obj.data)) {
                  return fromArrayLike(that, obj.data)
                }
              }

              throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
            }

            function checked (length) {
              // Note: cannot use `length < kMaxLength()` here because that fails when
              // length is NaN (which is otherwise coerced to zero.)
              if (length >= kMaxLength()) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                     'size: 0x' + kMaxLength().toString(16) + ' bytes')
              }
              return length | 0
            }

            function SlowBuffer (length) {
              if (+length != length) { // eslint-disable-line eqeqeq
                length = 0;
              }
              return Buffer.alloc(+length)
            }
            Buffer.isBuffer = isBuffer;
            function internalIsBuffer (b) {
              return !!(b != null && b._isBuffer)
            }

            Buffer.compare = function compare (a, b) {
              if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
                throw new TypeError('Arguments must be Buffers')
              }

              if (a === b) return 0

              var x = a.length;
              var y = b.length;

              for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                  x = a[i];
                  y = b[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            Buffer.isEncoding = function isEncoding (encoding) {
              switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return true
                default:
                  return false
              }
            };

            Buffer.concat = function concat (list, length) {
              if (!isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers')
              }

              if (list.length === 0) {
                return Buffer.alloc(0)
              }

              var i;
              if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; ++i) {
                  length += list[i].length;
                }
              }

              var buffer = Buffer.allocUnsafe(length);
              var pos = 0;
              for (i = 0; i < list.length; ++i) {
                var buf = list[i];
                if (!internalIsBuffer(buf)) {
                  throw new TypeError('"list" argument must be an Array of Buffers')
                }
                buf.copy(buffer, pos);
                pos += buf.length;
              }
              return buffer
            };

            function byteLength (string, encoding) {
              if (internalIsBuffer(string)) {
                return string.length
              }
              if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
                  (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                return string.byteLength
              }
              if (typeof string !== 'string') {
                string = '' + string;
              }

              var len = string.length;
              if (len === 0) return 0

              // Use a for loop to avoid recursion
              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'ascii':
                  case 'latin1':
                  case 'binary':
                    return len
                  case 'utf8':
                  case 'utf-8':
                  case undefined:
                    return utf8ToBytes(string).length
                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return len * 2
                  case 'hex':
                    return len >>> 1
                  case 'base64':
                    return base64ToBytes(string).length
                  default:
                    if (loweredCase) return utf8ToBytes(string).length // assume utf8
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            }
            Buffer.byteLength = byteLength;

            function slowToString (encoding, start, end) {
              var loweredCase = false;

              // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
              // property of a typed array.

              // This behaves neither like String nor Uint8Array in that we set start/end
              // to their upper/lower bounds if the value passed is out of range.
              // undefined is handled specially as per ECMA-262 6th Edition,
              // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
              if (start === undefined || start < 0) {
                start = 0;
              }
              // Return early if start > this.length. Done here to prevent potential uint32
              // coercion fail below.
              if (start > this.length) {
                return ''
              }

              if (end === undefined || end > this.length) {
                end = this.length;
              }

              if (end <= 0) {
                return ''
              }

              // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
              end >>>= 0;
              start >>>= 0;

              if (end <= start) {
                return ''
              }

              if (!encoding) encoding = 'utf8';

              while (true) {
                switch (encoding) {
                  case 'hex':
                    return hexSlice(this, start, end)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Slice(this, start, end)

                  case 'ascii':
                    return asciiSlice(this, start, end)

                  case 'latin1':
                  case 'binary':
                    return latin1Slice(this, start, end)

                  case 'base64':
                    return base64Slice(this, start, end)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return utf16leSlice(this, start, end)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = (encoding + '').toLowerCase();
                    loweredCase = true;
                }
              }
            }

            // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
            // Buffer instances.
            Buffer.prototype._isBuffer = true;

            function swap (b, n, m) {
              var i = b[n];
              b[n] = b[m];
              b[m] = i;
            }

            Buffer.prototype.swap16 = function swap16 () {
              var len = this.length;
              if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits')
              }
              for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1);
              }
              return this
            };

            Buffer.prototype.swap32 = function swap32 () {
              var len = this.length;
              if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits')
              }
              for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3);
                swap(this, i + 1, i + 2);
              }
              return this
            };

            Buffer.prototype.swap64 = function swap64 () {
              var len = this.length;
              if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits')
              }
              for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7);
                swap(this, i + 1, i + 6);
                swap(this, i + 2, i + 5);
                swap(this, i + 3, i + 4);
              }
              return this
            };

            Buffer.prototype.toString = function toString () {
              var length = this.length | 0;
              if (length === 0) return ''
              if (arguments.length === 0) return utf8Slice(this, 0, length)
              return slowToString.apply(this, arguments)
            };

            Buffer.prototype.equals = function equals (b) {
              if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
              if (this === b) return true
              return Buffer.compare(this, b) === 0
            };

            Buffer.prototype.inspect = function inspect () {
              var str = '';
              var max = INSPECT_MAX_BYTES;
              if (this.length > 0) {
                str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
                if (this.length > max) str += ' ... ';
              }
              return '<Buffer ' + str + '>'
            };

            Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
              if (!internalIsBuffer(target)) {
                throw new TypeError('Argument must be a Buffer')
              }

              if (start === undefined) {
                start = 0;
              }
              if (end === undefined) {
                end = target ? target.length : 0;
              }
              if (thisStart === undefined) {
                thisStart = 0;
              }
              if (thisEnd === undefined) {
                thisEnd = this.length;
              }

              if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index')
              }

              if (thisStart >= thisEnd && start >= end) {
                return 0
              }
              if (thisStart >= thisEnd) {
                return -1
              }
              if (start >= end) {
                return 1
              }

              start >>>= 0;
              end >>>= 0;
              thisStart >>>= 0;
              thisEnd >>>= 0;

              if (this === target) return 0

              var x = thisEnd - thisStart;
              var y = end - start;
              var len = Math.min(x, y);

              var thisCopy = this.slice(thisStart, thisEnd);
              var targetCopy = target.slice(start, end);

              for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                  x = thisCopy[i];
                  y = targetCopy[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
            // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
            //
            // Arguments:
            // - buffer - a Buffer to search
            // - val - a string, Buffer, or number
            // - byteOffset - an index into `buffer`; will be clamped to an int32
            // - encoding - an optional encoding, relevant is val is a string
            // - dir - true for indexOf, false for lastIndexOf
            function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
              // Empty buffer means no match
              if (buffer.length === 0) return -1

              // Normalize byteOffset
              if (typeof byteOffset === 'string') {
                encoding = byteOffset;
                byteOffset = 0;
              } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff;
              } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000;
              }
              byteOffset = +byteOffset;  // Coerce to Number.
              if (isNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : (buffer.length - 1);
              }

              // Normalize byteOffset: negative offsets start from the end of the buffer
              if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
              if (byteOffset >= buffer.length) {
                if (dir) return -1
                else byteOffset = buffer.length - 1;
              } else if (byteOffset < 0) {
                if (dir) byteOffset = 0;
                else return -1
              }

              // Normalize val
              if (typeof val === 'string') {
                val = Buffer.from(val, encoding);
              }

              // Finally, search either indexOf (if dir is true) or lastIndexOf
              if (internalIsBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                  return -1
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
              } else if (typeof val === 'number') {
                val = val & 0xFF; // Search for a byte value [0-255]
                if (Buffer.TYPED_ARRAY_SUPPORT &&
                    typeof Uint8Array.prototype.indexOf === 'function') {
                  if (dir) {
                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
                  } else {
                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
                  }
                }
                return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
              }

              throw new TypeError('val must be string, number or Buffer')
            }

            function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
              var indexSize = 1;
              var arrLength = arr.length;
              var valLength = val.length;

              if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();
                if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                    encoding === 'utf16le' || encoding === 'utf-16le') {
                  if (arr.length < 2 || val.length < 2) {
                    return -1
                  }
                  indexSize = 2;
                  arrLength /= 2;
                  valLength /= 2;
                  byteOffset /= 2;
                }
              }

              function read (buf, i) {
                if (indexSize === 1) {
                  return buf[i]
                } else {
                  return buf.readUInt16BE(i * indexSize)
                }
              }

              var i;
              if (dir) {
                var foundIndex = -1;
                for (i = byteOffset; i < arrLength; i++) {
                  if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                    if (foundIndex === -1) foundIndex = i;
                    if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
                  } else {
                    if (foundIndex !== -1) i -= i - foundIndex;
                    foundIndex = -1;
                  }
                }
              } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                for (i = byteOffset; i >= 0; i--) {
                  var found = true;
                  for (var j = 0; j < valLength; j++) {
                    if (read(arr, i + j) !== read(val, j)) {
                      found = false;
                      break
                    }
                  }
                  if (found) return i
                }
              }

              return -1
            }

            Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
              return this.indexOf(val, byteOffset, encoding) !== -1
            };

            Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
            };

            Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
            };

            function hexWrite (buf, string, offset, length) {
              offset = Number(offset) || 0;
              var remaining = buf.length - offset;
              if (!length) {
                length = remaining;
              } else {
                length = Number(length);
                if (length > remaining) {
                  length = remaining;
                }
              }

              // must be an even number of digits
              var strLen = string.length;
              if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

              if (length > strLen / 2) {
                length = strLen / 2;
              }
              for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (isNaN(parsed)) return i
                buf[offset + i] = parsed;
              }
              return i
            }

            function utf8Write (buf, string, offset, length) {
              return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
            }

            function asciiWrite (buf, string, offset, length) {
              return blitBuffer(asciiToBytes(string), buf, offset, length)
            }

            function latin1Write (buf, string, offset, length) {
              return asciiWrite(buf, string, offset, length)
            }

            function base64Write (buf, string, offset, length) {
              return blitBuffer(base64ToBytes(string), buf, offset, length)
            }

            function ucs2Write (buf, string, offset, length) {
              return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
            }

            Buffer.prototype.write = function write (string, offset, length, encoding) {
              // Buffer#write(string)
              if (offset === undefined) {
                encoding = 'utf8';
                length = this.length;
                offset = 0;
              // Buffer#write(string, encoding)
              } else if (length === undefined && typeof offset === 'string') {
                encoding = offset;
                length = this.length;
                offset = 0;
              // Buffer#write(string, offset[, length][, encoding])
              } else if (isFinite(offset)) {
                offset = offset | 0;
                if (isFinite(length)) {
                  length = length | 0;
                  if (encoding === undefined) encoding = 'utf8';
                } else {
                  encoding = length;
                  length = undefined;
                }
              // legacy write(string, encoding, offset, length) - remove in v0.13
              } else {
                throw new Error(
                  'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                )
              }

              var remaining = this.length - offset;
              if (length === undefined || length > remaining) length = remaining;

              if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds')
              }

              if (!encoding) encoding = 'utf8';

              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'hex':
                    return hexWrite(this, string, offset, length)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Write(this, string, offset, length)

                  case 'ascii':
                    return asciiWrite(this, string, offset, length)

                  case 'latin1':
                  case 'binary':
                    return latin1Write(this, string, offset, length)

                  case 'base64':
                    // Warning: maxLength not taken into account in base64Write
                    return base64Write(this, string, offset, length)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return ucs2Write(this, string, offset, length)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            };

            Buffer.prototype.toJSON = function toJSON () {
              return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
              }
            };

            function base64Slice (buf, start, end) {
              if (start === 0 && end === buf.length) {
                return fromByteArray(buf)
              } else {
                return fromByteArray(buf.slice(start, end))
              }
            }

            function utf8Slice (buf, start, end) {
              end = Math.min(buf.length, end);
              var res = [];

              var i = start;
              while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = (firstByte > 0xEF) ? 4
                  : (firstByte > 0xDF) ? 3
                  : (firstByte > 0xBF) ? 2
                  : 1;

                if (i + bytesPerSequence <= end) {
                  var secondByte, thirdByte, fourthByte, tempCodePoint;

                  switch (bytesPerSequence) {
                    case 1:
                      if (firstByte < 0x80) {
                        codePoint = firstByte;
                      }
                      break
                    case 2:
                      secondByte = buf[i + 1];
                      if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 3:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 4:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      fourthByte = buf[i + 3];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                          codePoint = tempCodePoint;
                        }
                      }
                  }
                }

                if (codePoint === null) {
                  // we did not generate a valid codePoint so insert a
                  // replacement char (U+FFFD) and advance only 1 byte
                  codePoint = 0xFFFD;
                  bytesPerSequence = 1;
                } else if (codePoint > 0xFFFF) {
                  // encode to utf16 (surrogate pair dance)
                  codePoint -= 0x10000;
                  res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                  codePoint = 0xDC00 | codePoint & 0x3FF;
                }

                res.push(codePoint);
                i += bytesPerSequence;
              }

              return decodeCodePointsArray(res)
            }

            // Based on http://stackoverflow.com/a/22747272/680742, the browser with
            // the lowest limit is Chrome, with 0x10000 args.
            // We go 1 magnitude less, for safety
            var MAX_ARGUMENTS_LENGTH = 0x1000;

            function decodeCodePointsArray (codePoints) {
              var len = codePoints.length;
              if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
              }

              // Decode in chunks to avoid "call stack size exceeded".
              var res = '';
              var i = 0;
              while (i < len) {
                res += String.fromCharCode.apply(
                  String,
                  codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                );
              }
              return res
            }

            function asciiSlice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F);
              }
              return ret
            }

            function latin1Slice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i]);
              }
              return ret
            }

            function hexSlice (buf, start, end) {
              var len = buf.length;

              if (!start || start < 0) start = 0;
              if (!end || end < 0 || end > len) end = len;

              var out = '';
              for (var i = start; i < end; ++i) {
                out += toHex(buf[i]);
              }
              return out
            }

            function utf16leSlice (buf, start, end) {
              var bytes = buf.slice(start, end);
              var res = '';
              for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
              }
              return res
            }

            Buffer.prototype.slice = function slice (start, end) {
              var len = this.length;
              start = ~~start;
              end = end === undefined ? len : ~~end;

              if (start < 0) {
                start += len;
                if (start < 0) start = 0;
              } else if (start > len) {
                start = len;
              }

              if (end < 0) {
                end += len;
                if (end < 0) end = 0;
              } else if (end > len) {
                end = len;
              }

              if (end < start) end = start;

              var newBuf;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                newBuf = this.subarray(start, end);
                newBuf.__proto__ = Buffer.prototype;
              } else {
                var sliceLen = end - start;
                newBuf = new Buffer(sliceLen, undefined);
                for (var i = 0; i < sliceLen; ++i) {
                  newBuf[i] = this[i + start];
                }
              }

              return newBuf
            };

            /*
             * Need to make sure that buffer isn't trying to write out of bounds.
             */
            function checkOffset (offset, ext, length) {
              if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
              if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
            }

            Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }

              return val
            };

            Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                checkOffset(offset, byteLength, this.length);
              }

              var val = this[offset + --byteLength];
              var mul = 1;
              while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul;
              }

              return val
            };

            Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              return this[offset]
            };

            Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return this[offset] | (this[offset + 1] << 8)
            };

            Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return (this[offset] << 8) | this[offset + 1]
            };

            Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return ((this[offset]) |
                  (this[offset + 1] << 8) |
                  (this[offset + 2] << 16)) +
                  (this[offset + 3] * 0x1000000)
            };

            Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] * 0x1000000) +
                ((this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                this[offset + 3])
            };

            Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var i = byteLength;
              var mul = 1;
              var val = this[offset + --i];
              while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              if (!(this[offset] & 0x80)) return (this[offset])
              return ((0xff - this[offset] + 1) * -1)
            };

            Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset] | (this[offset + 1] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset + 1] | (this[offset] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16) |
                (this[offset + 3] << 24)
            };

            Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] << 24) |
                (this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                (this[offset + 3])
            };

            Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, true, 23, 4)
            };

            Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, false, 23, 4)
            };

            Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, true, 52, 8)
            };

            Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, false, 52, 8)
            };

            function checkInt (buf, value, offset, ext, max, min) {
              if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
              if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
            }

            Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var mul = 1;
              var i = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var i = byteLength - 1;
              var mul = 1;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              this[offset] = (value & 0xff);
              return offset + 1
            };

            function objectWriteUInt16 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                  (littleEndian ? i : 1 - i) * 8;
              }
            }

            Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            function objectWriteUInt32 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffffffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
              }
            }

            Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset + 3] = (value >>> 24);
                this[offset + 2] = (value >>> 16);
                this[offset + 1] = (value >>> 8);
                this[offset] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = 0;
              var mul = 1;
              var sub = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = byteLength - 1;
              var mul = 1;
              var sub = 0;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              if (value < 0) value = 0xff + value + 1;
              this[offset] = (value & 0xff);
              return offset + 1
            };

            Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
                this[offset + 2] = (value >>> 16);
                this[offset + 3] = (value >>> 24);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (value < 0) value = 0xffffffff + value + 1;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            function checkIEEE754 (buf, value, offset, ext, max, min) {
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
              if (offset < 0) throw new RangeError('Index out of range')
            }

            function writeFloat (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 4);
              }
              write(buf, value, offset, littleEndian, 23, 4);
              return offset + 4
            }

            Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
              return writeFloat(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
              return writeFloat(this, value, offset, false, noAssert)
            };

            function writeDouble (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 8);
              }
              write(buf, value, offset, littleEndian, 52, 8);
              return offset + 8
            }

            Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
              return writeDouble(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
              return writeDouble(this, value, offset, false, noAssert)
            };

            // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
            Buffer.prototype.copy = function copy (target, targetStart, start, end) {
              if (!start) start = 0;
              if (!end && end !== 0) end = this.length;
              if (targetStart >= target.length) targetStart = target.length;
              if (!targetStart) targetStart = 0;
              if (end > 0 && end < start) end = start;

              // Copy 0 bytes; we're done
              if (end === start) return 0
              if (target.length === 0 || this.length === 0) return 0

              // Fatal error conditions
              if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds')
              }
              if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
              if (end < 0) throw new RangeError('sourceEnd out of bounds')

              // Are we oob?
              if (end > this.length) end = this.length;
              if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start;
              }

              var len = end - start;
              var i;

              if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (i = len - 1; i >= 0; --i) {
                  target[i + targetStart] = this[i + start];
                }
              } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                // ascending copy from start
                for (i = 0; i < len; ++i) {
                  target[i + targetStart] = this[i + start];
                }
              } else {
                Uint8Array.prototype.set.call(
                  target,
                  this.subarray(start, start + len),
                  targetStart
                );
              }

              return len
            };

            // Usage:
            //    buffer.fill(number[, offset[, end]])
            //    buffer.fill(buffer[, offset[, end]])
            //    buffer.fill(string[, offset[, end]][, encoding])
            Buffer.prototype.fill = function fill (val, start, end, encoding) {
              // Handle string cases:
              if (typeof val === 'string') {
                if (typeof start === 'string') {
                  encoding = start;
                  start = 0;
                  end = this.length;
                } else if (typeof end === 'string') {
                  encoding = end;
                  end = this.length;
                }
                if (val.length === 1) {
                  var code = val.charCodeAt(0);
                  if (code < 256) {
                    val = code;
                  }
                }
                if (encoding !== undefined && typeof encoding !== 'string') {
                  throw new TypeError('encoding must be a string')
                }
                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                  throw new TypeError('Unknown encoding: ' + encoding)
                }
              } else if (typeof val === 'number') {
                val = val & 255;
              }

              // Invalid ranges are not set to a default, so can range check early.
              if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index')
              }

              if (end <= start) {
                return this
              }

              start = start >>> 0;
              end = end === undefined ? this.length : end >>> 0;

              if (!val) val = 0;

              var i;
              if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                  this[i] = val;
                }
              } else {
                var bytes = internalIsBuffer(val)
                  ? val
                  : utf8ToBytes(new Buffer(val, encoding).toString());
                var len = bytes.length;
                for (i = 0; i < end - start; ++i) {
                  this[i + start] = bytes[i % len];
                }
              }

              return this
            };

            // HELPER FUNCTIONS
            // ================

            var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

            function base64clean (str) {
              // Node strips out invalid characters like \n and \t from the string, base64-js does not
              str = stringtrim(str).replace(INVALID_BASE64_RE, '');
              // Node converts strings with length < 2 to ''
              if (str.length < 2) return ''
              // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
              while (str.length % 4 !== 0) {
                str = str + '=';
              }
              return str
            }

            function stringtrim (str) {
              if (str.trim) return str.trim()
              return str.replace(/^\s+|\s+$/g, '')
            }

            function toHex (n) {
              if (n < 16) return '0' + n.toString(16)
              return n.toString(16)
            }

            function utf8ToBytes (string, units) {
              units = units || Infinity;
              var codePoint;
              var length = string.length;
              var leadSurrogate = null;
              var bytes = [];

              for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i);

                // is surrogate component
                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                  // last char was a lead
                  if (!leadSurrogate) {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                      // unexpected trail
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    } else if (i + 1 === length) {
                      // unpaired lead
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    }

                    // valid lead
                    leadSurrogate = codePoint;

                    continue
                  }

                  // 2 leads in a row
                  if (codePoint < 0xDC00) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    leadSurrogate = codePoint;
                    continue
                  }

                  // valid surrogate pair
                  codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                } else if (leadSurrogate) {
                  // valid bmp char, but last char was a lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                }

                leadSurrogate = null;

                // encode utf8
                if (codePoint < 0x80) {
                  if ((units -= 1) < 0) break
                  bytes.push(codePoint);
                } else if (codePoint < 0x800) {
                  if ((units -= 2) < 0) break
                  bytes.push(
                    codePoint >> 0x6 | 0xC0,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x10000) {
                  if ((units -= 3) < 0) break
                  bytes.push(
                    codePoint >> 0xC | 0xE0,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x110000) {
                  if ((units -= 4) < 0) break
                  bytes.push(
                    codePoint >> 0x12 | 0xF0,
                    codePoint >> 0xC & 0x3F | 0x80,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else {
                  throw new Error('Invalid code point')
                }
              }

              return bytes
            }

            function asciiToBytes (str) {
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF);
              }
              return byteArray
            }

            function utf16leToBytes (str, units) {
              var c, hi, lo;
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break

                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi);
              }

              return byteArray
            }


            function base64ToBytes (str) {
              return toByteArray(base64clean(str))
            }

            function blitBuffer (src, dst, offset, length) {
              for (var i = 0; i < length; ++i) {
                if ((i + offset >= dst.length) || (i >= src.length)) break
                dst[i + offset] = src[i];
              }
              return i
            }

            function isnan (val) {
              return val !== val // eslint-disable-line no-self-compare
            }


            // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
            // The _isBuffer check is for Safari 5-7 support, because it's missing
            // Object.prototype.constructor. Remove this eventually
            function isBuffer(obj) {
              return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
            }

            function isFastBuffer (obj) {
              return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
            }

            // For Node v0.10 support. Remove this eventually.
            function isSlowBuffer (obj) {
              return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
            }

            var bufferEs6 = /*#__PURE__*/Object.freeze({
                __proto__: null,
                INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
                kMaxLength: _kMaxLength,
                Buffer: Buffer,
                SlowBuffer: SlowBuffer,
                isBuffer: isBuffer
            });

            // Generated by CoffeeScript 1.8.0

            // == Changed for ES6 modules == //
            //(function() {
            //var ALPHABET, ALPHABET_MAP, Base58, i;

            //const Base58 = (typeof module !== "undefined" && module !== null ? module.exports : void 0) || (window.Base58 = {});
            const Base58$1 = {};

            const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

            const ALPHABET_MAP = {};

            let i = 0;

            while (i < ALPHABET.length) {
            ALPHABET_MAP[ALPHABET.charAt(i)] = i;
            i++;
            }

            Base58$1.encode = function(buffer) {
            buffer = new Uint8Array(buffer);
            var carry, digits, j;
            if (buffer.length === 0) {
                return "";
            }
            i = void 0;
            j = void 0;
            digits = [0];
            i = 0;
            while (i < buffer.length) {
                j = 0;
                while (j < digits.length) {
                digits[j] <<= 8;
                j++;
                }
                digits[0] += buffer[i];
                carry = 0;
                j = 0;
                while (j < digits.length) {
                digits[j] += carry;
                carry = (digits[j] / 58) | 0;
                digits[j] %= 58;
                ++j;
                }
                while (carry) {
                digits.push(carry % 58);
                carry = (carry / 58) | 0;
                }
                i++;
            }
            i = 0;
            while (buffer[i] === 0 && i < buffer.length - 1) {
                digits.push(0);
                i++;
            }
            return digits.reverse().map(function(digit) {
                return ALPHABET[digit];
            }).join("");
            };

            Base58$1.decode = function(string) {
            var bytes, c, carry, j;
            if (string.length === 0) {
                return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(0);
            }
            i = void 0;
            j = void 0;
            bytes = [0];
            i = 0;
            while (i < string.length) {
                c = string[i];
                if (!(c in ALPHABET_MAP)) {
                throw "Base58.decode received unacceptable input. Character '" + c + "' is not in the Base58 alphabet.";
                }
                j = 0;
                while (j < bytes.length) {
                bytes[j] *= 58;
                j++;
                }
                bytes[0] += ALPHABET_MAP[c];
                carry = 0;
                j = 0;
                while (j < bytes.length) {
                bytes[j] += carry;
                carry = bytes[j] >> 8;
                bytes[j] &= 0xff;
                ++j;
                }
                while (carry) {
                bytes.push(carry & 0xff);
                carry >>= 8;
                }
                i++;
            }
            i = 0;
            while (string[i] === "1" && i < string.length - 1) {
                bytes.push(0);
                i++;
            }
            return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(bytes.reverse());
            };
            exports('B', Base58$1);

            let store;
            const initApi = exports('i', (s) => { store = s; });

            const utils = {
                int32ToBytes (word) {
                    var byteArray = [];
                    for (var b = 0; b < 32; b += 8) {
                        byteArray.push((word >>> (24 - b % 32)) & 0xFF);
                    }
                    return byteArray
                },

                stringtoUTF8Array (message) {
                    if (typeof message === 'string') {
                        var s = unescape(encodeURIComponent(message)); // UTF-8
                        message = new Uint8Array(s.length);
                        for (var i = 0; i < s.length; i++) {
                            message[i] = s.charCodeAt(i) & 0xff;
                        }
                    }
                    return message
                },
                // ...buffers then buffers.foreach and append to buffer1
                appendBuffer (buffer1, buffer2) {
                    buffer1 = new Uint8Array(buffer1);
                    buffer2 = new Uint8Array(buffer2);
                    let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
                    tmp.set(buffer1, 0);
                    tmp.set(buffer2, buffer1.byteLength);
                    return tmp
                },

                int64ToBytes (int64) {
                    // we want to represent the input as a 8-bytes array
                    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

                    for (var index = 0; index < byteArray.length; index++) {
                        var byte = int64 & 0xff;
                        byteArray[ byteArray.length - index - 1 ] = byte;
                        int64 = (int64 - byte) / 256; 
                    }

                    return byteArray
                },

                hexToBytes (hexString) {
                    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
                },

                stringToHex (bytes) {
                    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
                },

                equal (buf1, buf2) {
                    if (buf1.byteLength != buf2.byteLength) return false
                    var dv1 = new Uint8Array(buf1);
                    var dv2 = new Uint8Array(buf2);
                    for (var i = 0; i != buf1.byteLength; i++) {
                        if (dv1[i] != dv2[i]) return false
                    }
                    return true
                }
            };

            // const TransactionTypes =  {
            //    GENESIS_TRANSACTION: 1,
            //    PAYMENT_TRANSACTION: 2,
            //
            //    REGISTER_NAME_TRANSACTION: 3,
            //    UPDATE_NAME_TRANSACTION: 4,
            //    SELL_NAME_TRANSACTION: 5,
            //    CANCEL_SELL_NAME_TRANSACTION: 6,
            //    BUY_NAME_TRANSACTION: 7,
            //
            //    CREATE_POLL_TRANSACTION: 8,
            //    VOTE_ON_POLL_TRANSACTION: 9,
            //
            //    ARBITRARY_TRANSACTION: 10,
            //
            //    ISSUE_ASSET_TRANSACTION: 11,
            //    TRANSFER_ASSET_TRANSACTION: 12,
            //    CREATE_ORDER_TRANSACTION: 13,
            //    CANCEL_ORDER_TRANSACTION: 14,
            //    MULTI_PAYMENT_TRANSACTION: 15,
            //
            //    DEPLOY_AT_TRANSACTION: 16,
            //
            //    MESSAGE_TRANSACTION: 17
            // };

            /**
             * Not to be confused with register name...this is a special use case
             */

            const TX_TYPE = 3; // NAME_REGISTRATION
            const CHECK_LAST_REF_INTERVAL = 30 * 1000; // err 30 seconds

            const pendingAddresses = {};

            // const config = store.getState().config
            // const node = config.coin.node.api
            // const baseUrl = node.url + node.tail

            const checkLastRefs = () => {
                Object.entries(pendingAddresses).forEach(([address, fn]) => {
                    // console.log(fn, address)
                    request('addresses/lastreference/' + address).then(res => {
                        if (res === 'false') return
                        fn(res);
                        delete pendingAddresses[address];
                        clearInterval(lastRefInterval);
                    });
                    // fetch(baseUrl + 'addresses/lastreference/' + address)
                    //     .then(async res => res.text())
                });
            };

            const lastRefInterval = setInterval(() => checkLastRefs(), CHECK_LAST_REF_INTERVAL);

            const callOnLastRef = (address, fn) => {
                pendingAddresses[address] = fn;
            };

            const registerUsername = async ({ name, address, lastRef, keyPair }) => {
                callOnLastRef(address, lastreference => {
                    const txBytes = createTransaction(TX_TYPE, keyPair, {
                        registrantPublicKey: keyPair.publicKey,
                        registrantAddress: address,
                        name,
                        value: address,
                        lastReference: lastreference
                    });
                    processTransaction(txBytes).then(res => {});
                });
            };

            let subscriptions$1 = [];

            // Have to wait with init because something import stateAwait before the store gets initialized
            let initialized = false;
            const init$1 = () => {
                initialized = true;
                store.subscribe(() => {
                    const state = store.getState();

                    subscriptions$1 = subscriptions$1.filter(fn => fn(state));
                });
            };

            const stateAwait = fn => {
                return new Promise((resolve, reject) => {
                    // Check immediately...then if not true store it
                    if (!initialized) {
                        init$1();
                    }
                    if (fn(store.getState())) resolve();
                    subscriptions$1.push(state => {
                        if (fn(state)) {
                            resolve();
                            return true
                        }
                        return false
                    });
                })
            };

            function string_to_bytes(str, utf8 = false) {
                var len = str.length, bytes = new Uint8Array(utf8 ? 4 * len : len);
                for (var i = 0, j = 0; i < len; i++) {
                    var c = str.charCodeAt(i);
                    if (utf8 && 0xd800 <= c && c <= 0xdbff) {
                        if (++i >= len)
                            throw new Error('Malformed string, low surrogate expected at position ' + i);
                        c = ((c ^ 0xd800) << 10) | 0x10000 | (str.charCodeAt(i) ^ 0xdc00);
                    }
                    else if (!utf8 && c >>> 8) {
                        throw new Error('Wide characters are not allowed.');
                    }
                    if (!utf8 || c <= 0x7f) {
                        bytes[j++] = c;
                    }
                    else if (c <= 0x7ff) {
                        bytes[j++] = 0xc0 | (c >> 6);
                        bytes[j++] = 0x80 | (c & 0x3f);
                    }
                    else if (c <= 0xffff) {
                        bytes[j++] = 0xe0 | (c >> 12);
                        bytes[j++] = 0x80 | ((c >> 6) & 0x3f);
                        bytes[j++] = 0x80 | (c & 0x3f);
                    }
                    else {
                        bytes[j++] = 0xf0 | (c >> 18);
                        bytes[j++] = 0x80 | ((c >> 12) & 0x3f);
                        bytes[j++] = 0x80 | ((c >> 6) & 0x3f);
                        bytes[j++] = 0x80 | (c & 0x3f);
                    }
                }
                return bytes.subarray(0, j);
            }
            function is_bytes(a) {
                return a instanceof Uint8Array;
            }
            function _heap_init(heap, heapSize) {
                const size = heap ? heap.byteLength : heapSize || 65536;
                if (size & 0xfff || size <= 0)
                    throw new Error('heap size must be a positive integer and a multiple of 4096');
                heap = heap || new Uint8Array(new ArrayBuffer(size));
                return heap;
            }
            function _heap_write(heap, hpos, data, dpos, dlen) {
                const hlen = heap.length - hpos;
                const wlen = hlen < dlen ? hlen : dlen;
                heap.set(data.subarray(dpos, dpos + wlen), hpos);
                return wlen;
            }
            function joinBytes(...arg) {
                const totalLenght = arg.reduce((sum, curr) => sum + curr.length, 0);
                const ret = new Uint8Array(totalLenght);
                let cursor = 0;
                for (let i = 0; i < arg.length; i++) {
                    ret.set(arg[i], cursor);
                    cursor += arg[i].length;
                }
                return ret;
            }

            /**
             * Util exports
             */

            class IllegalStateError extends Error {
                constructor(...args) {
                    super(...args);
                }
            }
            class IllegalArgumentError extends Error {
                constructor(...args) {
                    super(...args);
                }
            }
            class SecurityError extends Error {
                constructor(...args) {
                    super(...args);
                }
            }

            /**
             * @file {@link http://asmjs.org Asm.js} implementation of the {@link https://en.wikipedia.org/wiki/Advanced_Encryption_Standard Advanced Encryption Standard}.
             * @author Artem S Vybornov <vybornov@gmail.com>
             * @license MIT
             */
            var AES_asm = function () {

              /**
               * Galois Field stuff init flag
               */
              var ginit_done = false;

              /**
               * Galois Field exponentiation and logarithm tables for 3 (the generator)
               */
              var gexp3, glog3;

              /**
               * Init Galois Field tables
               */
              function ginit() {
                gexp3 = [],
                  glog3 = [];

                var a = 1, c, d;
                for (c = 0; c < 255; c++) {
                  gexp3[c] = a;

                  // Multiply by three
                  d = a & 0x80, a <<= 1, a &= 255;
                  if (d === 0x80) a ^= 0x1b;
                  a ^= gexp3[c];

                  // Set the log table value
                  glog3[gexp3[c]] = c;
                }
                gexp3[255] = gexp3[0];
                glog3[0] = 0;

                ginit_done = true;
              }

              /**
               * Galois Field multiplication
               * @param {number} a
               * @param {number} b
               * @return {number}
               */
              function gmul(a, b) {
                var c = gexp3[(glog3[a] + glog3[b]) % 255];
                if (a === 0 || b === 0) c = 0;
                return c;
              }

              /**
               * Galois Field reciprocal
               * @param {number} a
               * @return {number}
               */
              function ginv(a) {
                var i = gexp3[255 - glog3[a]];
                if (a === 0) i = 0;
                return i;
              }

              /**
               * AES stuff init flag
               */
              var aes_init_done = false;

              /**
               * Encryption, Decryption, S-Box and KeyTransform tables
               *
               * @type {number[]}
               */
              var aes_sbox;

              /**
               * @type {number[]}
               */
              var aes_sinv;

              /**
               * @type {number[][]}
               */
              var aes_enc;

              /**
               * @type {number[][]}
               */
              var aes_dec;

              /**
               * Init AES tables
               */
              function aes_init() {
                if (!ginit_done) ginit();

                // Calculates AES S-Box value
                function _s(a) {
                  var c, s, x;
                  s = x = ginv(a);
                  for (c = 0; c < 4; c++) {
                    s = ((s << 1) | (s >>> 7)) & 255;
                    x ^= s;
                  }
                  x ^= 99;
                  return x;
                }

                // Tables
                aes_sbox = [],
                  aes_sinv = [],
                  aes_enc = [[], [], [], []],
                  aes_dec = [[], [], [], []];

                for (var i = 0; i < 256; i++) {
                  var s = _s(i);

                  // S-Box and its inverse
                  aes_sbox[i] = s;
                  aes_sinv[s] = i;

                  // Ecryption and Decryption tables
                  aes_enc[0][i] = (gmul(2, s) << 24) | (s << 16) | (s << 8) | gmul(3, s);
                  aes_dec[0][s] = (gmul(14, i) << 24) | (gmul(9, i) << 16) | (gmul(13, i) << 8) | gmul(11, i);
                  // Rotate tables
                  for (var t = 1; t < 4; t++) {
                    aes_enc[t][i] = (aes_enc[t - 1][i] >>> 8) | (aes_enc[t - 1][i] << 24);
                    aes_dec[t][s] = (aes_dec[t - 1][s] >>> 8) | (aes_dec[t - 1][s] << 24);
                  }
                }

                aes_init_done = true;
              }

              /**
               * Asm.js module constructor.
               *
               * <p>
               * Heap buffer layout by offset:
               * <pre>
               * 0x0000   encryption key schedule
               * 0x0400   decryption key schedule
               * 0x0800   sbox
               * 0x0c00   inv sbox
               * 0x1000   encryption tables
               * 0x2000   decryption tables
               * 0x3000   reserved (future GCM multiplication lookup table)
               * 0x4000   data
               * </pre>
               * Don't touch anything before <code>0x400</code>.
               * </p>
               *
               * @alias AES_asm
               * @class
               * @param foreign - <i>ignored</i>
               * @param buffer - heap buffer to link with
               */
              var wrapper = function (foreign, buffer) {
                // Init AES stuff for the first time
                if (!aes_init_done) aes_init();

                // Fill up AES tables
                var heap = new Uint32Array(buffer);
                heap.set(aes_sbox, 0x0800 >> 2);
                heap.set(aes_sinv, 0x0c00 >> 2);
                for (var i = 0; i < 4; i++) {
                  heap.set(aes_enc[i], (0x1000 + 0x400 * i) >> 2);
                  heap.set(aes_dec[i], (0x2000 + 0x400 * i) >> 2);
                }

                /**
                 * Calculate AES key schedules.
                 * @instance
                 * @memberof AES_asm
                 * @param {number} ks - key size, 4/6/8 (for 128/192/256-bit key correspondingly)
                 * @param {number} k0 - key vector components
                 * @param {number} k1 - key vector components
                 * @param {number} k2 - key vector components
                 * @param {number} k3 - key vector components
                 * @param {number} k4 - key vector components
                 * @param {number} k5 - key vector components
                 * @param {number} k6 - key vector components
                 * @param {number} k7 - key vector components
                 */
                function set_key(ks, k0, k1, k2, k3, k4, k5, k6, k7) {
                  var ekeys = heap.subarray(0x000, 60),
                    dkeys = heap.subarray(0x100, 0x100 + 60);

                  // Encryption key schedule
                  ekeys.set([k0, k1, k2, k3, k4, k5, k6, k7]);
                  for (var i = ks, rcon = 1; i < 4 * ks + 28; i++) {
                    var k = ekeys[i - 1];
                    if ((i % ks === 0) || (ks === 8 && i % ks === 4)) {
                      k = aes_sbox[k >>> 24] << 24 ^ aes_sbox[k >>> 16 & 255] << 16 ^ aes_sbox[k >>> 8 & 255] << 8 ^ aes_sbox[k & 255];
                    }
                    if (i % ks === 0) {
                      k = (k << 8) ^ (k >>> 24) ^ (rcon << 24);
                      rcon = (rcon << 1) ^ ((rcon & 0x80) ? 0x1b : 0);
                    }
                    ekeys[i] = ekeys[i - ks] ^ k;
                  }

                  // Decryption key schedule
                  for (var j = 0; j < i; j += 4) {
                    for (var jj = 0; jj < 4; jj++) {
                      var k = ekeys[i - (4 + j) + (4 - jj) % 4];
                      if (j < 4 || j >= i - 4) {
                        dkeys[j + jj] = k;
                      } else {
                        dkeys[j + jj] = aes_dec[0][aes_sbox[k >>> 24]]
                          ^ aes_dec[1][aes_sbox[k >>> 16 & 255]]
                          ^ aes_dec[2][aes_sbox[k >>> 8 & 255]]
                          ^ aes_dec[3][aes_sbox[k & 255]];
                      }
                    }
                  }

                  // Set rounds number
                  asm.set_rounds(ks + 5);
                }

                // create library object with necessary properties
                var stdlib = {Uint8Array: Uint8Array, Uint32Array: Uint32Array};

                var asm = function (stdlib, foreign, buffer) {
                  "use asm";

                  var S0 = 0, S1 = 0, S2 = 0, S3 = 0,
                    I0 = 0, I1 = 0, I2 = 0, I3 = 0,
                    N0 = 0, N1 = 0, N2 = 0, N3 = 0,
                    M0 = 0, M1 = 0, M2 = 0, M3 = 0,
                    H0 = 0, H1 = 0, H2 = 0, H3 = 0,
                    R = 0;

                  var HEAP = new stdlib.Uint32Array(buffer),
                    DATA = new stdlib.Uint8Array(buffer);

                  /**
                   * AES core
                   * @param {number} k - precomputed key schedule offset
                   * @param {number} s - precomputed sbox table offset
                   * @param {number} t - precomputed round table offset
                   * @param {number} r - number of inner rounds to perform
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _core(k, s, t, r, x0, x1, x2, x3) {
                    k = k | 0;
                    s = s | 0;
                    t = t | 0;
                    r = r | 0;
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    var t1 = 0, t2 = 0, t3 = 0,
                      y0 = 0, y1 = 0, y2 = 0, y3 = 0,
                      i = 0;

                    t1 = t | 0x400, t2 = t | 0x800, t3 = t | 0xc00;

                    // round 0
                    x0 = x0 ^ HEAP[(k | 0) >> 2],
                      x1 = x1 ^ HEAP[(k | 4) >> 2],
                      x2 = x2 ^ HEAP[(k | 8) >> 2],
                      x3 = x3 ^ HEAP[(k | 12) >> 2];

                    // round 1..r
                    for (i = 16; (i | 0) <= (r << 4); i = (i + 16) | 0) {
                      y0 = HEAP[(t | x0 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x1 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x2 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x3 << 2 & 1020) >> 2] ^ HEAP[(k | i | 0) >> 2],
                        y1 = HEAP[(t | x1 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x2 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x3 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x0 << 2 & 1020) >> 2] ^ HEAP[(k | i | 4) >> 2],
                        y2 = HEAP[(t | x2 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x3 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x0 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x1 << 2 & 1020) >> 2] ^ HEAP[(k | i | 8) >> 2],
                        y3 = HEAP[(t | x3 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x0 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x1 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x2 << 2 & 1020) >> 2] ^ HEAP[(k | i | 12) >> 2];
                      x0 = y0, x1 = y1, x2 = y2, x3 = y3;
                    }

                    // final round
                    S0 = HEAP[(s | x0 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x1 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x2 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x3 << 2 & 1020) >> 2] ^ HEAP[(k | i | 0) >> 2],
                      S1 = HEAP[(s | x1 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x2 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x3 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x0 << 2 & 1020) >> 2] ^ HEAP[(k | i | 4) >> 2],
                      S2 = HEAP[(s | x2 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x3 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x0 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x1 << 2 & 1020) >> 2] ^ HEAP[(k | i | 8) >> 2],
                      S3 = HEAP[(s | x3 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x0 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x1 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x2 << 2 & 1020) >> 2] ^ HEAP[(k | i | 12) >> 2];
                  }

                  /**
                   * ECB mode encryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _ecb_enc(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    _core(
                      0x0000, 0x0800, 0x1000,
                      R,
                      x0,
                      x1,
                      x2,
                      x3
                    );
                  }

                  /**
                   * ECB mode decryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _ecb_dec(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    var t = 0;

                    _core(
                      0x0400, 0x0c00, 0x2000,
                      R,
                      x0,
                      x3,
                      x2,
                      x1
                    );

                    t = S1, S1 = S3, S3 = t;
                  }


                  /**
                   * CBC mode encryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _cbc_enc(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    _core(
                      0x0000, 0x0800, 0x1000,
                      R,
                      I0 ^ x0,
                      I1 ^ x1,
                      I2 ^ x2,
                      I3 ^ x3
                    );

                    I0 = S0,
                      I1 = S1,
                      I2 = S2,
                      I3 = S3;
                  }

                  /**
                   * CBC mode decryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _cbc_dec(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    var t = 0;

                    _core(
                      0x0400, 0x0c00, 0x2000,
                      R,
                      x0,
                      x3,
                      x2,
                      x1
                    );

                    t = S1, S1 = S3, S3 = t;

                    S0 = S0 ^ I0,
                      S1 = S1 ^ I1,
                      S2 = S2 ^ I2,
                      S3 = S3 ^ I3;

                    I0 = x0,
                      I1 = x1,
                      I2 = x2,
                      I3 = x3;
                  }

                  /**
                   * CFB mode encryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _cfb_enc(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    _core(
                      0x0000, 0x0800, 0x1000,
                      R,
                      I0,
                      I1,
                      I2,
                      I3
                    );

                    I0 = S0 = S0 ^ x0,
                      I1 = S1 = S1 ^ x1,
                      I2 = S2 = S2 ^ x2,
                      I3 = S3 = S3 ^ x3;
                  }


                  /**
                   * CFB mode decryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _cfb_dec(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    _core(
                      0x0000, 0x0800, 0x1000,
                      R,
                      I0,
                      I1,
                      I2,
                      I3
                    );

                    S0 = S0 ^ x0,
                      S1 = S1 ^ x1,
                      S2 = S2 ^ x2,
                      S3 = S3 ^ x3;

                    I0 = x0,
                      I1 = x1,
                      I2 = x2,
                      I3 = x3;
                  }

                  /**
                   * OFB mode encryption / decryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _ofb(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    _core(
                      0x0000, 0x0800, 0x1000,
                      R,
                      I0,
                      I1,
                      I2,
                      I3
                    );

                    I0 = S0,
                      I1 = S1,
                      I2 = S2,
                      I3 = S3;

                    S0 = S0 ^ x0,
                      S1 = S1 ^ x1,
                      S2 = S2 ^ x2,
                      S3 = S3 ^ x3;
                  }

                  /**
                   * CTR mode encryption / decryption
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _ctr(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    _core(
                      0x0000, 0x0800, 0x1000,
                      R,
                      N0,
                      N1,
                      N2,
                      N3
                    );

                    N3 = (~M3 & N3) | M3 & (N3 + 1);
                      N2 = (~M2 & N2) | M2 & (N2 + ((N3 | 0) == 0));
                      N1 = (~M1 & N1) | M1 & (N1 + ((N2 | 0) == 0));
                      N0 = (~M0 & N0) | M0 & (N0 + ((N1 | 0) == 0));

                    S0 = S0 ^ x0;
                      S1 = S1 ^ x1;
                      S2 = S2 ^ x2;
                      S3 = S3 ^ x3;
                  }

                  /**
                   * GCM mode MAC calculation
                   * @param {number} x0 - 128-bit input block vector
                   * @param {number} x1 - 128-bit input block vector
                   * @param {number} x2 - 128-bit input block vector
                   * @param {number} x3 - 128-bit input block vector
                   */
                  function _gcm_mac(x0, x1, x2, x3) {
                    x0 = x0 | 0;
                    x1 = x1 | 0;
                    x2 = x2 | 0;
                    x3 = x3 | 0;

                    var y0 = 0, y1 = 0, y2 = 0, y3 = 0,
                      z0 = 0, z1 = 0, z2 = 0, z3 = 0,
                      i = 0, c = 0;

                    x0 = x0 ^ I0,
                      x1 = x1 ^ I1,
                      x2 = x2 ^ I2,
                      x3 = x3 ^ I3;

                    y0 = H0 | 0,
                      y1 = H1 | 0,
                      y2 = H2 | 0,
                      y3 = H3 | 0;

                    for (; (i | 0) < 128; i = (i + 1) | 0) {
                      if (y0 >>> 31) {
                        z0 = z0 ^ x0,
                          z1 = z1 ^ x1,
                          z2 = z2 ^ x2,
                          z3 = z3 ^ x3;
                      }

                      y0 = (y0 << 1) | (y1 >>> 31),
                        y1 = (y1 << 1) | (y2 >>> 31),
                        y2 = (y2 << 1) | (y3 >>> 31),
                        y3 = (y3 << 1);

                      c = x3 & 1;

                      x3 = (x3 >>> 1) | (x2 << 31),
                        x2 = (x2 >>> 1) | (x1 << 31),
                        x1 = (x1 >>> 1) | (x0 << 31),
                        x0 = (x0 >>> 1);

                      if (c) x0 = x0 ^ 0xe1000000;
                    }

                    I0 = z0,
                      I1 = z1,
                      I2 = z2,
                      I3 = z3;
                  }

                  /**
                   * Set the internal rounds number.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} r - number if inner AES rounds
                   */
                  function set_rounds(r) {
                    r = r | 0;
                    R = r;
                  }

                  /**
                   * Populate the internal state of the module.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} s0 - state vector
                   * @param {number} s1 - state vector
                   * @param {number} s2 - state vector
                   * @param {number} s3 - state vector
                   */
                  function set_state(s0, s1, s2, s3) {
                    s0 = s0 | 0;
                    s1 = s1 | 0;
                    s2 = s2 | 0;
                    s3 = s3 | 0;

                    S0 = s0,
                      S1 = s1,
                      S2 = s2,
                      S3 = s3;
                  }

                  /**
                   * Populate the internal iv of the module.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} i0 - iv vector
                   * @param {number} i1 - iv vector
                   * @param {number} i2 - iv vector
                   * @param {number} i3 - iv vector
                   */
                  function set_iv(i0, i1, i2, i3) {
                    i0 = i0 | 0;
                    i1 = i1 | 0;
                    i2 = i2 | 0;
                    i3 = i3 | 0;

                    I0 = i0,
                      I1 = i1,
                      I2 = i2,
                      I3 = i3;
                  }

                  /**
                   * Set nonce for CTR-family modes.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} n0 - nonce vector
                   * @param {number} n1 - nonce vector
                   * @param {number} n2 - nonce vector
                   * @param {number} n3 - nonce vector
                   */
                  function set_nonce(n0, n1, n2, n3) {
                    n0 = n0 | 0;
                    n1 = n1 | 0;
                    n2 = n2 | 0;
                    n3 = n3 | 0;

                    N0 = n0,
                      N1 = n1,
                      N2 = n2,
                      N3 = n3;
                  }

                  /**
                   * Set counter mask for CTR-family modes.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} m0 - counter mask vector
                   * @param {number} m1 - counter mask vector
                   * @param {number} m2 - counter mask vector
                   * @param {number} m3 - counter mask vector
                   */
                  function set_mask(m0, m1, m2, m3) {
                    m0 = m0 | 0;
                    m1 = m1 | 0;
                    m2 = m2 | 0;
                    m3 = m3 | 0;

                    M0 = m0,
                      M1 = m1,
                      M2 = m2,
                      M3 = m3;
                  }

                  /**
                   * Set counter for CTR-family modes.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} c0 - counter vector
                   * @param {number} c1 - counter vector
                   * @param {number} c2 - counter vector
                   * @param {number} c3 - counter vector
                   */
                  function set_counter(c0, c1, c2, c3) {
                    c0 = c0 | 0;
                    c1 = c1 | 0;
                    c2 = c2 | 0;
                    c3 = c3 | 0;

                    N3 = (~M3 & N3) | M3 & c3,
                      N2 = (~M2 & N2) | M2 & c2,
                      N1 = (~M1 & N1) | M1 & c1,
                      N0 = (~M0 & N0) | M0 & c0;
                  }

                  /**
                   * Store the internal state vector into the heap.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} pos - offset where to put the data
                   * @return {number} The number of bytes have been written into the heap, always 16.
                   */
                  function get_state(pos) {
                    pos = pos | 0;

                    if (pos & 15) return -1;

                    DATA[pos | 0] = S0 >>> 24,
                      DATA[pos | 1] = S0 >>> 16 & 255,
                      DATA[pos | 2] = S0 >>> 8 & 255,
                      DATA[pos | 3] = S0 & 255,
                      DATA[pos | 4] = S1 >>> 24,
                      DATA[pos | 5] = S1 >>> 16 & 255,
                      DATA[pos | 6] = S1 >>> 8 & 255,
                      DATA[pos | 7] = S1 & 255,
                      DATA[pos | 8] = S2 >>> 24,
                      DATA[pos | 9] = S2 >>> 16 & 255,
                      DATA[pos | 10] = S2 >>> 8 & 255,
                      DATA[pos | 11] = S2 & 255,
                      DATA[pos | 12] = S3 >>> 24,
                      DATA[pos | 13] = S3 >>> 16 & 255,
                      DATA[pos | 14] = S3 >>> 8 & 255,
                      DATA[pos | 15] = S3 & 255;

                    return 16;
                  }

                  /**
                   * Store the internal iv vector into the heap.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} pos - offset where to put the data
                   * @return {number} The number of bytes have been written into the heap, always 16.
                   */
                  function get_iv(pos) {
                    pos = pos | 0;

                    if (pos & 15) return -1;

                    DATA[pos | 0] = I0 >>> 24,
                      DATA[pos | 1] = I0 >>> 16 & 255,
                      DATA[pos | 2] = I0 >>> 8 & 255,
                      DATA[pos | 3] = I0 & 255,
                      DATA[pos | 4] = I1 >>> 24,
                      DATA[pos | 5] = I1 >>> 16 & 255,
                      DATA[pos | 6] = I1 >>> 8 & 255,
                      DATA[pos | 7] = I1 & 255,
                      DATA[pos | 8] = I2 >>> 24,
                      DATA[pos | 9] = I2 >>> 16 & 255,
                      DATA[pos | 10] = I2 >>> 8 & 255,
                      DATA[pos | 11] = I2 & 255,
                      DATA[pos | 12] = I3 >>> 24,
                      DATA[pos | 13] = I3 >>> 16 & 255,
                      DATA[pos | 14] = I3 >>> 8 & 255,
                      DATA[pos | 15] = I3 & 255;

                    return 16;
                  }

                  /**
                   * GCM initialization.
                   * @instance
                   * @memberof AES_asm
                   */
                  function gcm_init() {
                    _ecb_enc(0, 0, 0, 0);
                    H0 = S0,
                      H1 = S1,
                      H2 = S2,
                      H3 = S3;
                  }

                  /**
                   * Perform ciphering operation on the supplied data.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} mode - block cipher mode (see {@link AES_asm} mode constants)
                   * @param {number} pos - offset of the data being processed
                   * @param {number} len - length of the data being processed
                   * @return {number} Actual amount of data have been processed.
                   */
                  function cipher(mode, pos, len) {
                    mode = mode | 0;
                    pos = pos | 0;
                    len = len | 0;

                    var ret = 0;

                    if (pos & 15) return -1;

                    while ((len | 0) >= 16) {
                      _cipher_modes[mode & 7](
                        DATA[pos | 0] << 24 | DATA[pos | 1] << 16 | DATA[pos | 2] << 8 | DATA[pos | 3],
                        DATA[pos | 4] << 24 | DATA[pos | 5] << 16 | DATA[pos | 6] << 8 | DATA[pos | 7],
                        DATA[pos | 8] << 24 | DATA[pos | 9] << 16 | DATA[pos | 10] << 8 | DATA[pos | 11],
                        DATA[pos | 12] << 24 | DATA[pos | 13] << 16 | DATA[pos | 14] << 8 | DATA[pos | 15]
                      );

                      DATA[pos | 0] = S0 >>> 24,
                        DATA[pos | 1] = S0 >>> 16 & 255,
                        DATA[pos | 2] = S0 >>> 8 & 255,
                        DATA[pos | 3] = S0 & 255,
                        DATA[pos | 4] = S1 >>> 24,
                        DATA[pos | 5] = S1 >>> 16 & 255,
                        DATA[pos | 6] = S1 >>> 8 & 255,
                        DATA[pos | 7] = S1 & 255,
                        DATA[pos | 8] = S2 >>> 24,
                        DATA[pos | 9] = S2 >>> 16 & 255,
                        DATA[pos | 10] = S2 >>> 8 & 255,
                        DATA[pos | 11] = S2 & 255,
                        DATA[pos | 12] = S3 >>> 24,
                        DATA[pos | 13] = S3 >>> 16 & 255,
                        DATA[pos | 14] = S3 >>> 8 & 255,
                        DATA[pos | 15] = S3 & 255;

                      ret = (ret + 16) | 0,
                        pos = (pos + 16) | 0,
                        len = (len - 16) | 0;
                    }

                    return ret | 0;
                  }

                  /**
                   * Calculates MAC of the supplied data.
                   * @instance
                   * @memberof AES_asm
                   * @param {number} mode - block cipher mode (see {@link AES_asm} mode constants)
                   * @param {number} pos - offset of the data being processed
                   * @param {number} len - length of the data being processed
                   * @return {number} Actual amount of data have been processed.
                   */
                  function mac(mode, pos, len) {
                    mode = mode | 0;
                    pos = pos | 0;
                    len = len | 0;

                    var ret = 0;

                    if (pos & 15) return -1;

                    while ((len | 0) >= 16) {
                      _mac_modes[mode & 1](
                        DATA[pos | 0] << 24 | DATA[pos | 1] << 16 | DATA[pos | 2] << 8 | DATA[pos | 3],
                        DATA[pos | 4] << 24 | DATA[pos | 5] << 16 | DATA[pos | 6] << 8 | DATA[pos | 7],
                        DATA[pos | 8] << 24 | DATA[pos | 9] << 16 | DATA[pos | 10] << 8 | DATA[pos | 11],
                        DATA[pos | 12] << 24 | DATA[pos | 13] << 16 | DATA[pos | 14] << 8 | DATA[pos | 15]
                      );

                      ret = (ret + 16) | 0,
                        pos = (pos + 16) | 0,
                        len = (len - 16) | 0;
                    }

                    return ret | 0;
                  }

                  /**
                   * AES cipher modes table (virual methods)
                   */
                  var _cipher_modes = [_ecb_enc, _ecb_dec, _cbc_enc, _cbc_dec, _cfb_enc, _cfb_dec, _ofb, _ctr];

                  /**
                   * AES MAC modes table (virual methods)
                   */
                  var _mac_modes = [_cbc_enc, _gcm_mac];

                  /**
                   * Asm.js module exports
                   */
                  return {
                    set_rounds: set_rounds,
                    set_state: set_state,
                    set_iv: set_iv,
                    set_nonce: set_nonce,
                    set_mask: set_mask,
                    set_counter: set_counter,
                    get_state: get_state,
                    get_iv: get_iv,
                    gcm_init: gcm_init,
                    cipher: cipher,
                    mac: mac,
                  };
                }(stdlib, foreign, buffer);

                asm.set_key = set_key;

                return asm;
              };

              /**
               * AES enciphering mode constants
               * @enum {number}
               * @const
               */
              wrapper.ENC = {
                ECB: 0,
                CBC: 2,
                CFB: 4,
                OFB: 6,
                CTR: 7,
              },

                /**
                 * AES deciphering mode constants
                 * @enum {number}
                 * @const
                 */
                wrapper.DEC = {
                  ECB: 1,
                  CBC: 3,
                  CFB: 5,
                  OFB: 6,
                  CTR: 7,
                },

                /**
                 * AES MAC mode constants
                 * @enum {number}
                 * @const
                 */
                wrapper.MAC = {
                  CBC: 0,
                  GCM: 1,
                };

              /**
               * Heap data offset
               * @type {number}
               * @const
               */
              wrapper.HEAP_DATA = 0x4000;

              return wrapper;
            }();

            class AES {
                constructor(key, iv, padding = true, mode) {
                    this.pos = 0;
                    this.len = 0;
                    this.mode = mode;
                    // The AES "worker"
                    this.heap = _heap_init().subarray(AES_asm.HEAP_DATA);
                    this.asm = new AES_asm(null, this.heap.buffer);
                    // The AES object state
                    this.pos = 0;
                    this.len = 0;
                    // Key
                    const keylen = key.length;
                    if (keylen !== 16 && keylen !== 24 && keylen !== 32)
                        throw new IllegalArgumentError('illegal key size');
                    const keyview = new DataView(key.buffer, key.byteOffset, key.byteLength);
                    this.asm.set_key(keylen >> 2, keyview.getUint32(0), keyview.getUint32(4), keyview.getUint32(8), keyview.getUint32(12), keylen > 16 ? keyview.getUint32(16) : 0, keylen > 16 ? keyview.getUint32(20) : 0, keylen > 24 ? keyview.getUint32(24) : 0, keylen > 24 ? keyview.getUint32(28) : 0);
                    // IV
                    if (iv !== undefined) {
                        if (iv.length !== 16)
                            throw new IllegalArgumentError('illegal iv size');
                        let ivview = new DataView(iv.buffer, iv.byteOffset, iv.byteLength);
                        this.asm.set_iv(ivview.getUint32(0), ivview.getUint32(4), ivview.getUint32(8), ivview.getUint32(12));
                    }
                    else {
                        this.asm.set_iv(0, 0, 0, 0);
                    }
                    this.padding = padding;
                }
                AES_Encrypt_process(data) {
                    if (!is_bytes(data))
                        throw new TypeError("data isn't of expected type");
                    let asm = this.asm;
                    let heap = this.heap;
                    let amode = AES_asm.ENC[this.mode];
                    let hpos = AES_asm.HEAP_DATA;
                    let pos = this.pos;
                    let len = this.len;
                    let dpos = 0;
                    let dlen = data.length || 0;
                    let rpos = 0;
                    let rlen = (len + dlen) & -16;
                    let wlen = 0;
                    let result = new Uint8Array(rlen);
                    while (dlen > 0) {
                        wlen = _heap_write(heap, pos + len, data, dpos, dlen);
                        len += wlen;
                        dpos += wlen;
                        dlen -= wlen;
                        wlen = asm.cipher(amode, hpos + pos, len);
                        if (wlen)
                            result.set(heap.subarray(pos, pos + wlen), rpos);
                        rpos += wlen;
                        if (wlen < len) {
                            pos += wlen;
                            len -= wlen;
                        }
                        else {
                            pos = 0;
                            len = 0;
                        }
                    }
                    this.pos = pos;
                    this.len = len;
                    return result;
                }
                AES_Encrypt_finish() {
                    let asm = this.asm;
                    let heap = this.heap;
                    let amode = AES_asm.ENC[this.mode];
                    let hpos = AES_asm.HEAP_DATA;
                    let pos = this.pos;
                    let len = this.len;
                    let plen = 16 - (len % 16);
                    let rlen = len;
                    if (this.hasOwnProperty('padding')) {
                        if (this.padding) {
                            for (let p = 0; p < plen; ++p) {
                                heap[pos + len + p] = plen;
                            }
                            len += plen;
                            rlen = len;
                        }
                        else if (len % 16) {
                            throw new IllegalArgumentError('data length must be a multiple of the block size');
                        }
                    }
                    else {
                        len += plen;
                    }
                    const result = new Uint8Array(rlen);
                    if (len)
                        asm.cipher(amode, hpos + pos, len);
                    if (rlen)
                        result.set(heap.subarray(pos, pos + rlen));
                    this.pos = 0;
                    this.len = 0;
                    return result;
                }
                AES_Decrypt_process(data) {
                    if (!is_bytes(data))
                        throw new TypeError("data isn't of expected type");
                    let asm = this.asm;
                    let heap = this.heap;
                    let amode = AES_asm.DEC[this.mode];
                    let hpos = AES_asm.HEAP_DATA;
                    let pos = this.pos;
                    let len = this.len;
                    let dpos = 0;
                    let dlen = data.length || 0;
                    let rpos = 0;
                    let rlen = (len + dlen) & -16;
                    let plen = 0;
                    let wlen = 0;
                    if (this.padding) {
                        plen = len + dlen - rlen || 16;
                        rlen -= plen;
                    }
                    const result = new Uint8Array(rlen);
                    while (dlen > 0) {
                        wlen = _heap_write(heap, pos + len, data, dpos, dlen);
                        len += wlen;
                        dpos += wlen;
                        dlen -= wlen;
                        wlen = asm.cipher(amode, hpos + pos, len - (!dlen ? plen : 0));
                        if (wlen)
                            result.set(heap.subarray(pos, pos + wlen), rpos);
                        rpos += wlen;
                        if (wlen < len) {
                            pos += wlen;
                            len -= wlen;
                        }
                        else {
                            pos = 0;
                            len = 0;
                        }
                    }
                    this.pos = pos;
                    this.len = len;
                    return result;
                }
                AES_Decrypt_finish() {
                    let asm = this.asm;
                    let heap = this.heap;
                    let amode = AES_asm.DEC[this.mode];
                    let hpos = AES_asm.HEAP_DATA;
                    let pos = this.pos;
                    let len = this.len;
                    let rlen = len;
                    if (len > 0) {
                        if (len % 16) {
                            if (this.hasOwnProperty('padding')) {
                                throw new IllegalArgumentError('data length must be a multiple of the block size');
                            }
                            else {
                                len += 16 - (len % 16);
                            }
                        }
                        asm.cipher(amode, hpos + pos, len);
                        if (this.hasOwnProperty('padding') && this.padding) {
                            let pad = heap[pos + rlen - 1];
                            if (pad < 1 || pad > 16 || pad > rlen)
                                throw new SecurityError('bad padding');
                            let pcheck = 0;
                            for (let i = pad; i > 1; i--)
                                pcheck |= pad ^ heap[pos + rlen - i];
                            if (pcheck)
                                throw new SecurityError('bad padding');
                            rlen -= pad;
                        }
                    }
                    const result = new Uint8Array(rlen);
                    if (rlen > 0) {
                        result.set(heap.subarray(pos, pos + rlen));
                    }
                    this.pos = 0;
                    this.len = 0;
                    return result;
                }
            }

            class AES_CBC extends AES {
                static encrypt(data, key, padding = true, iv) {
                    return new AES_CBC(key, iv, padding).encrypt(data);
                }
                static decrypt(data, key, padding = true, iv) {
                    return new AES_CBC(key, iv, padding).decrypt(data);
                }
                constructor(key, iv, padding = true) {
                    super(key, iv, padding, 'CBC');
                }
                encrypt(data) {
                    const r1 = this.AES_Encrypt_process(data);
                    const r2 = this.AES_Encrypt_finish();
                    return joinBytes(r1, r2);
                }
                decrypt(data) {
                    const r1 = this.AES_Decrypt_process(data);
                    const r2 = this.AES_Decrypt_finish();
                    return joinBytes(r1, r2);
                }
            }

            /**
             * Integers are represented as little endian array of 32-bit limbs.
             * Limbs number is a power of 2 and a multiple of 8 (256 bits).
             * Negative values use two's complement representation.
             */
            var bigint_asm = function ( stdlib, foreign, buffer ) {
                "use asm";

                var SP = 0;

                var HEAP32 = new stdlib.Uint32Array(buffer);

                var imul = stdlib.Math.imul;

                /**
                 * Simple stack memory allocator
                 *
                 * Methods:
                 *  sreset
                 *  salloc
                 *  sfree
                 */

                function sreset ( p ) {
                    p = p|0;
                    SP = p = (p + 31) & -32;
                    return p|0;
                }

                function salloc ( l ) {
                    l = l|0;
                    var p = 0; p = SP;
                    SP = p + ((l + 31) & -32)|0;
                    return p|0;
                }

                function sfree ( l ) {
                    l = l|0;
                    SP = SP - ((l + 31) & -32)|0;
                }

                /**
                 * Utility functions:
                 *  cp
                 *  z
                 */

                function cp ( l, A, B ) {
                    l = l|0;
                    A = A|0;
                    B = B|0;

                    var i = 0;

                    if ( (A|0) > (B|0) ) {
                        for ( ; (i|0) < (l|0); i = (i+4)|0 ) {
                            HEAP32[(B+i)>>2] = HEAP32[(A+i)>>2];
                        }
                    }
                    else {
                        for ( i = (l-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                            HEAP32[(B+i)>>2] = HEAP32[(A+i)>>2];
                        }
                    }
                }

                function z ( l, z, A ) {
                    l = l|0;
                    z = z|0;
                    A = A|0;

                    var i = 0;

                    for ( ; (i|0) < (l|0); i = (i+4)|0 ) {
                        HEAP32[(A+i)>>2] = z;
                    }
                }

                /**
                 * Negate the argument
                 *
                 * Perform two's complement transformation:
                 *
                 *  -A = ~A + 1
                 *
                 * @param A offset of the argment being negated, 32-byte aligned
                 * @param lA length of the argument, multiple of 32
                 *
                 * @param R offset where to place the result to, 32-byte aligned
                 * @param lR length to truncate the result to, multiple of 32
                 */
                function neg ( A, lA, R, lR ) {
                    A  =  A|0;
                    lA = lA|0;
                    R  =  R|0;
                    lR = lR|0;

                    var a = 0, c = 0, t = 0, r = 0, i = 0;

                    if ( (lR|0) <= 0 )
                        lR = lA;

                    if ( (lR|0) < (lA|0) )
                        lA = lR;

                    c = 1;
                    for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                        a = ~HEAP32[(A+i)>>2];
                        t = (a & 0xffff) + c|0;
                        r = (a >>> 16) + (t >>> 16)|0;
                        HEAP32[(R+i)>>2] = (r << 16) | (t & 0xffff);
                        c = r >>> 16;
                    }

                    for ( ; (i|0) < (lR|0); i = (i+4)|0 ) {
                        HEAP32[(R+i)>>2] = (c-1)|0;
                    }

                    return c|0;
                }

                function cmp ( A, lA, B, lB ) {
                    A  =  A|0;
                    lA = lA|0;
                    B  =  B|0;
                    lB = lB|0;

                    var a = 0, b = 0, i = 0;

                    if ( (lA|0) > (lB|0) ) {
                        for ( i = (lA-4)|0; (i|0) >= (lB|0); i = (i-4)|0 ) {
                            if ( HEAP32[(A+i)>>2]|0 ) return 1;
                        }
                    }
                    else {
                        for ( i = (lB-4)|0; (i|0) >= (lA|0); i = (i-4)|0 ) {
                            if ( HEAP32[(B+i)>>2]|0 ) return -1;
                        }
                    }

                    for ( ; (i|0) >= 0; i = (i-4)|0 ) {
                        a = HEAP32[(A+i)>>2]|0, b = HEAP32[(B+i)>>2]|0;
                        if ( (a>>>0) < (b>>>0) ) return -1;
                        if ( (a>>>0) > (b>>>0) ) return 1;
                    }

                    return 0;
                }

                /**
                 * Test the argument
                 *
                 * Same as `cmp` with zero.
                 */
                function tst ( A, lA ) {
                    A  =  A|0;
                    lA = lA|0;

                    var i = 0;

                    for ( i = (lA-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                        if ( HEAP32[(A+i)>>2]|0 ) return (i+4)|0;
                    }

                    return 0;
                }

                /**
                 * Conventional addition
                 *
                 * @param A offset of the first argument, 32-byte aligned
                 * @param lA length of the first argument, multiple of 32
                 *
                 * @param B offset of the second argument, 32-bit aligned
                 * @param lB length of the second argument, multiple of 32
                 *
                 * @param R offset where to place the result to, 32-byte aligned
                 * @param lR length to truncate the result to, multiple of 32
                 */
                function add ( A, lA, B, lB, R, lR ) {
                    A  =  A|0;
                    lA = lA|0;
                    B  =  B|0;
                    lB = lB|0;
                    R  =  R|0;
                    lR = lR|0;

                    var a = 0, b = 0, c = 0, t = 0, r = 0, i = 0;

                    if ( (lA|0) < (lB|0) ) {
                        t = A, A = B, B = t;
                        t = lA, lA = lB, lB = t;
                    }

                    if ( (lR|0) <= 0 )
                        lR = lA+4|0;

                    if ( (lR|0) < (lB|0) )
                        lA = lB = lR;

                    for ( ; (i|0) < (lB|0); i = (i+4)|0 ) {
                        a = HEAP32[(A+i)>>2]|0;
                        b = HEAP32[(B+i)>>2]|0;
                        t = ( (a & 0xffff) + (b & 0xffff)|0 ) + c|0;
                        r = ( (a >>> 16) + (b >>> 16)|0 ) + (t >>> 16)|0;
                        HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                        c = r >>> 16;
                    }

                    for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                        a = HEAP32[(A+i)>>2]|0;
                        t = (a & 0xffff) + c|0;
                        r = (a >>> 16) + (t >>> 16)|0;
                        HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                        c = r >>> 16;
                    }

                    for ( ; (i|0) < (lR|0); i = (i+4)|0 ) {
                        HEAP32[(R+i)>>2] = c|0;
                        c = 0;
                    }

                    return c|0;
                }

               /**
                 * Conventional subtraction
                 *
                 * @param A offset of the first argument, 32-byte aligned
                 * @param lA length of the first argument, multiple of 32
                 *
                 * @param B offset of the second argument, 32-bit aligned
                 * @param lB length of the second argument, multiple of 32
                 *
                 * @param R offset where to place the result to, 32-byte aligned
                 * @param lR length to truncate the result to, multiple of 32
                 */
                function sub ( A, lA, B, lB, R, lR ) {
                    A  =  A|0;
                    lA = lA|0;
                    B  =  B|0;
                    lB = lB|0;
                    R  =  R|0;
                    lR = lR|0;

                    var a = 0, b = 0, c = 0, t = 0, r = 0, i = 0;

                    if ( (lR|0) <= 0 )
                        lR = (lA|0) > (lB|0) ? lA+4|0 : lB+4|0;

                    if ( (lR|0) < (lA|0) )
                        lA = lR;

                    if ( (lR|0) < (lB|0) )
                        lB = lR;

                    if ( (lA|0) < (lB|0) ) {
                        for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                            a = HEAP32[(A+i)>>2]|0;
                            b = HEAP32[(B+i)>>2]|0;
                            t = ( (a & 0xffff) - (b & 0xffff)|0 ) + c|0;
                            r = ( (a >>> 16) - (b >>> 16)|0 ) + (t >> 16)|0;
                            HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                            c = r >> 16;
                        }

                        for ( ; (i|0) < (lB|0); i = (i+4)|0 ) {
                            b = HEAP32[(B+i)>>2]|0;
                            t = c - (b & 0xffff)|0;
                            r = (t >> 16) - (b >>> 16)|0;
                            HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                            c = r >> 16;
                        }
                    }
                    else {
                        for ( ; (i|0) < (lB|0); i = (i+4)|0 ) {
                            a = HEAP32[(A+i)>>2]|0;
                            b = HEAP32[(B+i)>>2]|0;
                            t = ( (a & 0xffff) - (b & 0xffff)|0 ) + c|0;
                            r = ( (a >>> 16) - (b >>> 16)|0 ) + (t >> 16)|0;
                            HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                            c = r >> 16;
                        }

                        for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                            a = HEAP32[(A+i)>>2]|0;
                            t = (a & 0xffff) + c|0;
                            r = (a >>> 16) + (t >> 16)|0;
                            HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                            c = r >> 16;
                        }
                    }

                    for ( ; (i|0) < (lR|0); i = (i+4)|0 ) {
                        HEAP32[(R+i)>>2] = c|0;
                    }

                    return c|0;
                }

                /**
                 * Conventional multiplication
                 *
                 * TODO implement Karatsuba algorithm for large multiplicands
                 *
                 * @param A offset of the first argument, 32-byte aligned
                 * @param lA length of the first argument, multiple of 32
                 *
                 * @param B offset of the second argument, 32-byte aligned
                 * @param lB length of the second argument, multiple of 32
                 *
                 * @param R offset where to place the result to, 32-byte aligned
                 * @param lR length to truncate the result to, multiple of 32
                 */
                function mul ( A, lA, B, lB, R, lR ) {
                    A  =  A|0;
                    lA = lA|0;
                    B  =  B|0;
                    lB = lB|0;
                    R  =  R|0;
                    lR = lR|0;

                    var al0 = 0, al1 = 0, al2 = 0, al3 = 0, al4 = 0, al5 = 0, al6 = 0, al7 = 0, ah0 = 0, ah1 = 0, ah2 = 0, ah3 = 0, ah4 = 0, ah5 = 0, ah6 = 0, ah7 = 0,
                        bl0 = 0, bl1 = 0, bl2 = 0, bl3 = 0, bl4 = 0, bl5 = 0, bl6 = 0, bl7 = 0, bh0 = 0, bh1 = 0, bh2 = 0, bh3 = 0, bh4 = 0, bh5 = 0, bh6 = 0, bh7 = 0,
                        r0 = 0, r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0, r6 = 0, r7 = 0, r8 = 0, r9 = 0, r10 = 0, r11 = 0, r12 = 0, r13 = 0, r14 = 0, r15 = 0,
                        u = 0, v = 0, w = 0, m = 0,
                        i = 0, Ai = 0, j = 0, Bj = 0, Rk = 0;

                    if ( (lA|0) > (lB|0) ) {
                        u = A, v = lA;
                        A = B, lA = lB;
                        B = u, lB = v;
                    }

                    m = (lA+lB)|0;
                    if ( ( (lR|0) > (m|0) ) | ( (lR|0) <= 0 ) )
                        lR = m;

                    if ( (lR|0) < (lA|0) )
                        lA = lR;

                    if ( (lR|0) < (lB|0) )
                        lB = lR;

                    for ( ; (i|0) < (lA|0); i = (i+32)|0 ) {
                        Ai = (A+i)|0;

                        ah0 = HEAP32[(Ai|0)>>2]|0,
                        ah1 = HEAP32[(Ai|4)>>2]|0,
                        ah2 = HEAP32[(Ai|8)>>2]|0,
                        ah3 = HEAP32[(Ai|12)>>2]|0,
                        ah4 = HEAP32[(Ai|16)>>2]|0,
                        ah5 = HEAP32[(Ai|20)>>2]|0,
                        ah6 = HEAP32[(Ai|24)>>2]|0,
                        ah7 = HEAP32[(Ai|28)>>2]|0,
                        al0 = ah0 & 0xffff,
                        al1 = ah1 & 0xffff,
                        al2 = ah2 & 0xffff,
                        al3 = ah3 & 0xffff,
                        al4 = ah4 & 0xffff,
                        al5 = ah5 & 0xffff,
                        al6 = ah6 & 0xffff,
                        al7 = ah7 & 0xffff,
                        ah0 = ah0 >>> 16,
                        ah1 = ah1 >>> 16,
                        ah2 = ah2 >>> 16,
                        ah3 = ah3 >>> 16,
                        ah4 = ah4 >>> 16,
                        ah5 = ah5 >>> 16,
                        ah6 = ah6 >>> 16,
                        ah7 = ah7 >>> 16;

                        r8 = r9 = r10 = r11 = r12 = r13 = r14 = r15 = 0;

                        for ( j = 0; (j|0) < (lB|0); j = (j+32)|0 ) {
                            Bj = (B+j)|0;
                            Rk = (R+(i+j|0))|0;

                            bh0 = HEAP32[(Bj|0)>>2]|0,
                            bh1 = HEAP32[(Bj|4)>>2]|0,
                            bh2 = HEAP32[(Bj|8)>>2]|0,
                            bh3 = HEAP32[(Bj|12)>>2]|0,
                            bh4 = HEAP32[(Bj|16)>>2]|0,
                            bh5 = HEAP32[(Bj|20)>>2]|0,
                            bh6 = HEAP32[(Bj|24)>>2]|0,
                            bh7 = HEAP32[(Bj|28)>>2]|0,
                            bl0 = bh0 & 0xffff,
                            bl1 = bh1 & 0xffff,
                            bl2 = bh2 & 0xffff,
                            bl3 = bh3 & 0xffff,
                            bl4 = bh4 & 0xffff,
                            bl5 = bh5 & 0xffff,
                            bl6 = bh6 & 0xffff,
                            bl7 = bh7 & 0xffff,
                            bh0 = bh0 >>> 16,
                            bh1 = bh1 >>> 16,
                            bh2 = bh2 >>> 16,
                            bh3 = bh3 >>> 16,
                            bh4 = bh4 >>> 16,
                            bh5 = bh5 >>> 16,
                            bh6 = bh6 >>> 16,
                            bh7 = bh7 >>> 16;

                            r0 = HEAP32[(Rk|0)>>2]|0,
                            r1 = HEAP32[(Rk|4)>>2]|0,
                            r2 = HEAP32[(Rk|8)>>2]|0,
                            r3 = HEAP32[(Rk|12)>>2]|0,
                            r4 = HEAP32[(Rk|16)>>2]|0,
                            r5 = HEAP32[(Rk|20)>>2]|0,
                            r6 = HEAP32[(Rk|24)>>2]|0,
                            r7 = HEAP32[(Rk|28)>>2]|0;

                            u = ((imul(al0, bl0)|0) + (r8 & 0xffff)|0) + (r0 & 0xffff)|0;
                            v = ((imul(ah0, bl0)|0) + (r8 >>> 16)|0) + (r0 >>> 16)|0;
                            w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r0 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl1)|0) + (m & 0xffff)|0) + (r1 & 0xffff)|0;
                            v = ((imul(ah0, bl1)|0) + (m >>> 16)|0) + (r1 >>> 16)|0;
                            w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r1 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl2)|0) + (m & 0xffff)|0) + (r2 & 0xffff)|0;
                            v = ((imul(ah0, bl2)|0) + (m >>> 16)|0) + (r2 >>> 16)|0;
                            w = ((imul(al0, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r2 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl3)|0) + (m & 0xffff)|0) + (r3 & 0xffff)|0;
                            v = ((imul(ah0, bl3)|0) + (m >>> 16)|0) + (r3 >>> 16)|0;
                            w = ((imul(al0, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl4)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                            v = ((imul(ah0, bl4)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                            w = ((imul(al0, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl5)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                            v = ((imul(ah0, bl5)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                            w = ((imul(al0, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl6)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah0, bl6)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al0, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl7)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah0, bl7)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al0, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            r8 = m;

                            u = ((imul(al1, bl0)|0) + (r9 & 0xffff)|0) + (r1 & 0xffff)|0;
                            v = ((imul(ah1, bl0)|0) + (r9 >>> 16)|0) + (r1 >>> 16)|0;
                            w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r1 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl1)|0) + (m & 0xffff)|0) + (r2 & 0xffff)|0;
                            v = ((imul(ah1, bl1)|0) + (m >>> 16)|0) + (r2 >>> 16)|0;
                            w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r2 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl2)|0) + (m & 0xffff)|0) + (r3 & 0xffff)|0;
                            v = ((imul(ah1, bl2)|0) + (m >>> 16)|0) + (r3 >>> 16)|0;
                            w = ((imul(al1, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl3)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                            v = ((imul(ah1, bl3)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                            w = ((imul(al1, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl4)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                            v = ((imul(ah1, bl4)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                            w = ((imul(al1, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl5)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah1, bl5)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al1, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl6)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah1, bl6)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al1, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl7)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah1, bl7)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al1, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            r9 = m;

                            u = ((imul(al2, bl0)|0) + (r10 & 0xffff)|0) + (r2 & 0xffff)|0;
                            v = ((imul(ah2, bl0)|0) + (r10 >>> 16)|0) + (r2 >>> 16)|0;
                            w = ((imul(al2, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r2 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl1)|0) + (m & 0xffff)|0) + (r3 & 0xffff)|0;
                            v = ((imul(ah2, bl1)|0) + (m >>> 16)|0) + (r3 >>> 16)|0;
                            w = ((imul(al2, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl2)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                            v = ((imul(ah2, bl2)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                            w = ((imul(al2, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl3)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                            v = ((imul(ah2, bl3)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                            w = ((imul(al2, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl4)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah2, bl4)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al2, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl5)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah2, bl5)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al2, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl6)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah2, bl6)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al2, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl7)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah2, bl7)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al2, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            r10 = m;

                            u = ((imul(al3, bl0)|0) + (r11 & 0xffff)|0) + (r3 & 0xffff)|0;
                            v = ((imul(ah3, bl0)|0) + (r11 >>> 16)|0) + (r3 >>> 16)|0;
                            w = ((imul(al3, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl1)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                            v = ((imul(ah3, bl1)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                            w = ((imul(al3, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl2)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                            v = ((imul(ah3, bl2)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                            w = ((imul(al3, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl3)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah3, bl3)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al3, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl4)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah3, bl4)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al3, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl5)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah3, bl5)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al3, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl6)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah3, bl6)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al3, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl7)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                            v = ((imul(ah3, bl7)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                            w = ((imul(al3, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            r11 = m;

                            u = ((imul(al4, bl0)|0) + (r12 & 0xffff)|0) + (r4 & 0xffff)|0;
                            v = ((imul(ah4, bl0)|0) + (r12 >>> 16)|0) + (r4 >>> 16)|0;
                            w = ((imul(al4, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl1)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                            v = ((imul(ah4, bl1)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                            w = ((imul(al4, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl2)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah4, bl2)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al4, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl3)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah4, bl3)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al4, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl4)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah4, bl4)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al4, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl5)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah4, bl5)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al4, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl6)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                            v = ((imul(ah4, bl6)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                            w = ((imul(al4, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl7)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                            v = ((imul(ah4, bl7)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                            w = ((imul(al4, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            r12 = m;

                            u = ((imul(al5, bl0)|0) + (r13 & 0xffff)|0) + (r5 & 0xffff)|0;
                            v = ((imul(ah5, bl0)|0) + (r13 >>> 16)|0) + (r5 >>> 16)|0;
                            w = ((imul(al5, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl1)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah5, bl1)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al5, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl2)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah5, bl2)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al5, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl3)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah5, bl3)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al5, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl4)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah5, bl4)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al5, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl5)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                            v = ((imul(ah5, bl5)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                            w = ((imul(al5, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl6)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                            v = ((imul(ah5, bl6)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                            w = ((imul(al5, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl7)|0) + (m & 0xffff)|0) + (r12 & 0xffff)|0;
                            v = ((imul(ah5, bl7)|0) + (m >>> 16)|0) + (r12 >>> 16)|0;
                            w = ((imul(al5, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r12 = (w << 16) | (u & 0xffff);

                            r13 = m;

                            u = ((imul(al6, bl0)|0) + (r14 & 0xffff)|0) + (r6 & 0xffff)|0;
                            v = ((imul(ah6, bl0)|0) + (r14 >>> 16)|0) + (r6 >>> 16)|0;
                            w = ((imul(al6, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl1)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah6, bl1)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al6, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl2)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah6, bl2)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al6, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl3)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah6, bl3)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al6, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl4)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                            v = ((imul(ah6, bl4)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                            w = ((imul(al6, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl5)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                            v = ((imul(ah6, bl5)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                            w = ((imul(al6, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl6)|0) + (m & 0xffff)|0) + (r12 & 0xffff)|0;
                            v = ((imul(ah6, bl6)|0) + (m >>> 16)|0) + (r12 >>> 16)|0;
                            w = ((imul(al6, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r12 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl7)|0) + (m & 0xffff)|0) + (r13 & 0xffff)|0;
                            v = ((imul(ah6, bl7)|0) + (m >>> 16)|0) + (r13 >>> 16)|0;
                            w = ((imul(al6, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r13 = (w << 16) | (u & 0xffff);

                            r14 = m;

                            u = ((imul(al7, bl0)|0) + (r15 & 0xffff)|0) + (r7 & 0xffff)|0;
                            v = ((imul(ah7, bl0)|0) + (r15 >>> 16)|0) + (r7 >>> 16)|0;
                            w = ((imul(al7, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl1)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah7, bl1)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al7, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl2)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah7, bl2)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al7, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl3)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                            v = ((imul(ah7, bl3)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                            w = ((imul(al7, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl4)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                            v = ((imul(ah7, bl4)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                            w = ((imul(al7, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl5)|0) + (m & 0xffff)|0) + (r12 & 0xffff)|0;
                            v = ((imul(ah7, bl5)|0) + (m >>> 16)|0) + (r12 >>> 16)|0;
                            w = ((imul(al7, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r12 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl6)|0) + (m & 0xffff)|0) + (r13 & 0xffff)|0;
                            v = ((imul(ah7, bl6)|0) + (m >>> 16)|0) + (r13 >>> 16)|0;
                            w = ((imul(al7, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r13 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl7)|0) + (m & 0xffff)|0) + (r14 & 0xffff)|0;
                            v = ((imul(ah7, bl7)|0) + (m >>> 16)|0) + (r14 >>> 16)|0;
                            w = ((imul(al7, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r14 = (w << 16) | (u & 0xffff);

                            r15 = m;

                            HEAP32[(Rk|0)>>2] = r0,
                            HEAP32[(Rk|4)>>2] = r1,
                            HEAP32[(Rk|8)>>2] = r2,
                            HEAP32[(Rk|12)>>2] = r3,
                            HEAP32[(Rk|16)>>2] = r4,
                            HEAP32[(Rk|20)>>2] = r5,
                            HEAP32[(Rk|24)>>2] = r6,
                            HEAP32[(Rk|28)>>2] = r7;
                        }

                        Rk = (R+(i+j|0))|0;
                        HEAP32[(Rk|0)>>2] = r8,
                        HEAP32[(Rk|4)>>2] = r9,
                        HEAP32[(Rk|8)>>2] = r10,
                        HEAP32[(Rk|12)>>2] = r11,
                        HEAP32[(Rk|16)>>2] = r12,
                        HEAP32[(Rk|20)>>2] = r13,
                        HEAP32[(Rk|24)>>2] = r14,
                        HEAP32[(Rk|28)>>2] = r15;
                    }
            /*
                    for ( i = lA & -32; (i|0) < (lA|0); i = (i+4)|0 ) {
                        Ai = (A+i)|0;

                        ah0 = HEAP32[Ai>>2]|0,
                        al0 = ah0 & 0xffff,
                        ah0 = ah0 >>> 16;

                        r1 = 0;

                        for ( j = 0; (j|0) < (lB|0); j = (j+4)|0 ) {
                            Bj = (B+j)|0;
                            Rk = (R+(i+j|0))|0;

                            bh0 = HEAP32[Bj>>2]|0,
                            bl0 = bh0 & 0xffff,
                            bh0 = bh0 >>> 16;

                            r0 = HEAP32[Rk>>2]|0;

                            u = ((imul(al0, bl0)|0) + (r1 & 0xffff)|0) + (r0 & 0xffff)|0;
                            v = ((imul(ah0, bl0)|0) + (r1 >>> 16)|0) + (r0 >>> 16)|0;
                            w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r0 = (w << 16) | (u & 0xffff);

                            r1 = m;

                            HEAP32[Rk>>2] = r0;
                        }

                        Rk = (R+(i+j|0))|0;
                        HEAP32[Rk>>2] = r1;
                    }
            */
                }

                /**
                 * Fast squaring
                 *
                 * Exploits the fact:
                 *
                 *  X² = ( X0 + X1*B )² = X0² + 2*X0*X1*B + X1²*B²,
                 *
                 * where B is a power of 2, so:
                 *
                 *  2*X0*X1*B = (X0*X1 << 1)*B
                 *
                 * @param A offset of the argument being squared, 32-byte aligned
                 * @param lA length of the argument, multiple of 32
                 *
                 * @param R offset where to place the result to, 32-byte aligned
                 */
                function sqr ( A, lA, R ) {
                    A  =  A|0;
                    lA = lA|0;
                    R  =  R|0;

                    var al0 = 0, al1 = 0, al2 = 0, al3 = 0, al4 = 0, al5 = 0, al6 = 0, al7 = 0, ah0 = 0, ah1 = 0, ah2 = 0, ah3 = 0, ah4 = 0, ah5 = 0, ah6 = 0, ah7 = 0,
                        bl0 = 0, bl1 = 0, bl2 = 0, bl3 = 0, bl4 = 0, bl5 = 0, bl6 = 0, bl7 = 0, bh0 = 0, bh1 = 0, bh2 = 0, bh3 = 0, bh4 = 0, bh5 = 0, bh6 = 0, bh7 = 0,
                        r0 = 0, r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0, r6 = 0, r7 = 0, r8 = 0, r9 = 0, r10 = 0, r11 = 0, r12 = 0, r13 = 0, r14 = 0, r15 = 0,
                        u = 0, v = 0, w = 0, c = 0, h = 0, m = 0, r = 0,
                        d = 0, dd = 0, p = 0, i = 0, j = 0, k = 0, Ai = 0, Aj = 0, Rk = 0;

                    // prepare for iterations
                    for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                        Rk = R+(i<<1)|0;
                        ah0 = HEAP32[(A+i)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16;
                        u = imul(al0,al0)|0;
                        v = (imul(al0,ah0)|0) + (u >>> 17)|0;
                        w = (imul(ah0,ah0)|0) + (v >>> 15)|0;
                        HEAP32[(Rk)>>2] = (v << 17) | (u & 0x1ffff);
                        HEAP32[(Rk|4)>>2] = w;
                    }

                    // unrolled 1st iteration
                    for ( p = 0; (p|0) < (lA|0); p = (p+8)|0 ) {
                        Ai = A+p|0, Rk = R+(p<<1)|0;

                        ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16;

                        bh0 = HEAP32[(Ai|4)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16;

                        u = imul(al0,bl0)|0;
                        v = (imul(al0,bh0)|0) + (u >>> 16)|0;
                        w = (imul(ah0,bl0)|0) + (v & 0xffff)|0;
                        m = ((imul(ah0,bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;

                        r = HEAP32[(Rk|4)>>2]|0;
                        u = (r & 0xffff) + ((u & 0xffff) << 1)|0;
                        w = ((r >>> 16) + ((w & 0xffff) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|4)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|8)>>2]|0;
                        u = ((r & 0xffff) + ((m & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((m >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|8)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        if ( c ) {
                            r = HEAP32[(Rk|12)>>2]|0;
                            u = (r & 0xffff) + c|0;
                            w = (r >>> 16) + (u >>> 16)|0;
                            HEAP32[(Rk|12)>>2] = (w << 16) | (u & 0xffff);
                        }
                    }

                    // unrolled 2nd iteration
                    for ( p = 0; (p|0) < (lA|0); p = (p+16)|0 ) {
                        Ai = A+p|0, Rk = R+(p<<1)|0;

                        ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16,
                        ah1 = HEAP32[(Ai|4)>>2]|0, al1 = ah1 & 0xffff, ah1 = ah1 >>> 16;

                        bh0 = HEAP32[(Ai|8)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16,
                        bh1 = HEAP32[(Ai|12)>>2]|0, bl1 = bh1 & 0xffff, bh1 = bh1 >>> 16;

                        u = imul(al0, bl0)|0;
                        v = imul(ah0, bl0)|0;
                        w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r0 = (w << 16) | (u & 0xffff);

                        u = (imul(al0, bl1)|0) + (m & 0xffff)|0;
                        v = (imul(ah0, bl1)|0) + (m >>> 16)|0;
                        w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r1 = (w << 16) | (u & 0xffff);

                        r2 = m;

                        u = (imul(al1, bl0)|0) + (r1 & 0xffff)|0;
                        v = (imul(ah1, bl0)|0) + (r1 >>> 16)|0;
                        w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r1 = (w << 16) | (u & 0xffff);

                        u = ((imul(al1, bl1)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah1, bl1)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r2 = (w << 16) | (u & 0xffff);

                        r3 = m;

                        r = HEAP32[(Rk|8)>>2]|0;
                        u = (r & 0xffff) + ((r0 & 0xffff) << 1)|0;
                        w = ((r >>> 16) + ((r0 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|8)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|12)>>2]|0;
                        u = ((r & 0xffff) + ((r1 & 0xffff) << 1)|0)  + c|0;
                        w = ((r >>> 16) + ((r1 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|12)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|16)>>2]|0;
                        u = ((r & 0xffff) + ((r2 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r2 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|16)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|20)>>2]|0;
                        u = ((r & 0xffff) + ((r3 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r3 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|20)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        for ( k = 24; !!c & ( (k|0) < 32 ); k = (k+4)|0 ) {
                            r = HEAP32[(Rk|k)>>2]|0;
                            u = (r & 0xffff) + c|0;
                            w = (r >>> 16) + (u >>> 16)|0;
                            HEAP32[(Rk|k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;
                        }
                    }

                    // unrolled 3rd iteration
                    for ( p = 0; (p|0) < (lA|0); p = (p+32)|0 ) {
                        Ai = A+p|0, Rk = R+(p<<1)|0;

                        ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16,
                        ah1 = HEAP32[(Ai|4)>>2]|0, al1 = ah1 & 0xffff, ah1 = ah1 >>> 16,
                        ah2 = HEAP32[(Ai|8)>>2]|0, al2 = ah2 & 0xffff, ah2 = ah2 >>> 16,
                        ah3 = HEAP32[(Ai|12)>>2]|0, al3 = ah3 & 0xffff, ah3 = ah3 >>> 16;

                        bh0 = HEAP32[(Ai|16)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16,
                        bh1 = HEAP32[(Ai|20)>>2]|0, bl1 = bh1 & 0xffff, bh1 = bh1 >>> 16,
                        bh2 = HEAP32[(Ai|24)>>2]|0, bl2 = bh2 & 0xffff, bh2 = bh2 >>> 16,
                        bh3 = HEAP32[(Ai|28)>>2]|0, bl3 = bh3 & 0xffff, bh3 = bh3 >>> 16;

                        u = imul(al0, bl0)|0;
                        v = imul(ah0, bl0)|0;
                        w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r0 = (w << 16) | (u & 0xffff);

                        u = (imul(al0, bl1)|0) + (m & 0xffff)|0;
                        v = (imul(ah0, bl1)|0) + (m >>> 16)|0;
                        w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r1 = (w << 16) | (u & 0xffff);

                        u = (imul(al0, bl2)|0) + (m & 0xffff)|0;
                        v = (imul(ah0, bl2)|0) + (m >>> 16)|0;
                        w = ((imul(al0, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah0, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r2 = (w << 16) | (u & 0xffff);

                        u = (imul(al0, bl3)|0) + (m & 0xffff)|0;
                        v = (imul(ah0, bl3)|0) + (m >>> 16)|0;
                        w = ((imul(al0, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah0, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r3 = (w << 16) | (u & 0xffff);

                        r4 = m;

                        u = (imul(al1, bl0)|0) + (r1 & 0xffff)|0;
                        v = (imul(ah1, bl0)|0) + (r1 >>> 16)|0;
                        w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r1 = (w << 16) | (u & 0xffff);

                        u = ((imul(al1, bl1)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah1, bl1)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r2 = (w << 16) | (u & 0xffff);

                        u = ((imul(al1, bl2)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah1, bl2)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al1, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah1, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r3 = (w << 16) | (u & 0xffff);

                        u = ((imul(al1, bl3)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah1, bl3)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al1, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah1, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r4 = (w << 16) | (u & 0xffff);

                        r5 = m;

                        u = (imul(al2, bl0)|0) + (r2 & 0xffff)|0;
                        v = (imul(ah2, bl0)|0) + (r2 >>> 16)|0;
                        w = ((imul(al2, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah2, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r2 = (w << 16) | (u & 0xffff);

                        u = ((imul(al2, bl1)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah2, bl1)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al2, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah2, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r3 = (w << 16) | (u & 0xffff);

                        u = ((imul(al2, bl2)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah2, bl2)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al2, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah2, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r4 = (w << 16) | (u & 0xffff);

                        u = ((imul(al2, bl3)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah2, bl3)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al2, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah2, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r5 = (w << 16) | (u & 0xffff);

                        r6 = m;

                        u = (imul(al3, bl0)|0) + (r3 & 0xffff)|0;
                        v = (imul(ah3, bl0)|0) + (r3 >>> 16)|0;
                        w = ((imul(al3, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah3, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r3 = (w << 16) | (u & 0xffff);

                        u = ((imul(al3, bl1)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah3, bl1)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al3, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah3, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r4 = (w << 16) | (u & 0xffff);

                        u = ((imul(al3, bl2)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah3, bl2)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al3, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah3, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r5 = (w << 16) | (u & 0xffff);

                        u = ((imul(al3, bl3)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                        v = ((imul(ah3, bl3)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                        w = ((imul(al3, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                        m = ((imul(ah3, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                        r6 = (w << 16) | (u & 0xffff);

                        r7 = m;

                        r = HEAP32[(Rk|16)>>2]|0;
                        u = (r & 0xffff) + ((r0 & 0xffff) << 1)|0;
                        w = ((r >>> 16) + ((r0 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|16)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|20)>>2]|0;
                        u = ((r & 0xffff) + ((r1 & 0xffff) << 1)|0)  + c|0;
                        w = ((r >>> 16) + ((r1 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|20)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|24)>>2]|0;
                        u = ((r & 0xffff) + ((r2 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r2 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|24)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk|28)>>2]|0;
                        u = ((r & 0xffff) + ((r3 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r3 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk|28)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk+32)>>2]|0;
                        u = ((r & 0xffff) + ((r4 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r4 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+32)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk+36)>>2]|0;
                        u = ((r & 0xffff) + ((r5 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r5 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+36)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk+40)>>2]|0;
                        u = ((r & 0xffff) + ((r6 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r6 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+40)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        r = HEAP32[(Rk+44)>>2]|0;
                        u = ((r & 0xffff) + ((r7 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r7 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+44)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        for ( k = 48; !!c & ( (k|0) < 64 ); k = (k+4)|0 ) {
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = (r & 0xffff) + c|0;
                            w = (r >>> 16) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;
                        }
                    }

                    // perform iterations
                    for ( d = 32; (d|0) < (lA|0); d = d << 1 ) { // depth loop
                        dd = d << 1;

                        for ( p = 0; (p|0) < (lA|0); p = (p+dd)|0 ) { // part loop
                            Rk = R+(p<<1)|0;

                            h = 0;
                            for ( i = 0; (i|0) < (d|0); i = (i+32)|0 ) { // multiply-and-add loop
                                Ai = (A+p|0)+i|0;

                                ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16,
                                ah1 = HEAP32[(Ai|4)>>2]|0, al1 = ah1 & 0xffff, ah1 = ah1 >>> 16,
                                ah2 = HEAP32[(Ai|8)>>2]|0, al2 = ah2 & 0xffff, ah2 = ah2 >>> 16,
                                ah3 = HEAP32[(Ai|12)>>2]|0, al3 = ah3 & 0xffff, ah3 = ah3 >>> 16,
                                ah4 = HEAP32[(Ai|16)>>2]|0, al4 = ah4 & 0xffff, ah4 = ah4 >>> 16,
                                ah5 = HEAP32[(Ai|20)>>2]|0, al5 = ah5 & 0xffff, ah5 = ah5 >>> 16,
                                ah6 = HEAP32[(Ai|24)>>2]|0, al6 = ah6 & 0xffff, ah6 = ah6 >>> 16,
                                ah7 = HEAP32[(Ai|28)>>2]|0, al7 = ah7 & 0xffff, ah7 = ah7 >>> 16;

                                r8 = r9 = r10 = r11 = r12 = r13 = r14 = r15 = c = 0;

                                for ( j = 0; (j|0) < (d|0); j = (j+32)|0 ) {
                                    Aj = ((A+p|0)+d|0)+j|0;

                                    bh0 = HEAP32[(Aj)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16,
                                    bh1 = HEAP32[(Aj|4)>>2]|0, bl1 = bh1 & 0xffff, bh1 = bh1 >>> 16,
                                    bh2 = HEAP32[(Aj|8)>>2]|0, bl2 = bh2 & 0xffff, bh2 = bh2 >>> 16,
                                    bh3 = HEAP32[(Aj|12)>>2]|0, bl3 = bh3 & 0xffff, bh3 = bh3 >>> 16,
                                    bh4 = HEAP32[(Aj|16)>>2]|0, bl4 = bh4 & 0xffff, bh4 = bh4 >>> 16,
                                    bh5 = HEAP32[(Aj|20)>>2]|0, bl5 = bh5 & 0xffff, bh5 = bh5 >>> 16,
                                    bh6 = HEAP32[(Aj|24)>>2]|0, bl6 = bh6 & 0xffff, bh6 = bh6 >>> 16,
                                    bh7 = HEAP32[(Aj|28)>>2]|0, bl7 = bh7 & 0xffff, bh7 = bh7 >>> 16;

                                    r0 = r1 = r2 = r3 = r4 = r5 = r6 = r7 = 0;

                                    u = ((imul(al0, bl0)|0) + (r0 & 0xffff)|0) + (r8 & 0xffff)|0;
                                    v = ((imul(ah0, bl0)|0) + (r0 >>> 16)|0) + (r8 >>> 16)|0;
                                    w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r0 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl1)|0) + (r1 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl1)|0) + (r1 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r1 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl2)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl2)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r2 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl3)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl3)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r3 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl4)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl4)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r4 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl5)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl5)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r5 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl6)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl6)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al0, bl7)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah0, bl7)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al0, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah0, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    r8 = m;

                                    u = ((imul(al1, bl0)|0) + (r1 & 0xffff)|0) + (r9 & 0xffff)|0;
                                    v = ((imul(ah1, bl0)|0) + (r1 >>> 16)|0) + (r9 >>> 16)|0;
                                    w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r1 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl1)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl1)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r2 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl2)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl2)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r3 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl3)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl3)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r4 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl4)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl4)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r5 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl5)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl5)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl6)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl6)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al1, bl7)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah1, bl7)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al1, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah1, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    r9 = m;

                                    u = ((imul(al2, bl0)|0) + (r2 & 0xffff)|0) + (r10 & 0xffff)|0;
                                    v = ((imul(ah2, bl0)|0) + (r2 >>> 16)|0) + (r10 >>> 16)|0;
                                    w = ((imul(al2, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r2 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl1)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl1)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r3 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl2)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl2)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r4 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl3)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl3)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r5 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl4)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl4)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl5)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl5)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl6)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl6)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al2, bl7)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah2, bl7)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al2, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah2, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r9 = (w << 16) | (u & 0xffff);

                                    r10 = m;

                                    u = ((imul(al3, bl0)|0) + (r3 & 0xffff)|0) + (r11 & 0xffff)|0;
                                    v = ((imul(ah3, bl0)|0) + (r3 >>> 16)|0) + (r11 >>> 16)|0;
                                    w = ((imul(al3, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r3 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl1)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl1)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r4 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl2)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl2)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r5 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl3)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl3)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl4)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl4)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl5)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl5)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl6)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl6)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r9 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al3, bl7)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah3, bl7)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al3, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah3, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r10 = (w << 16) | (u & 0xffff);

                                    r11 = m;

                                    u = ((imul(al4, bl0)|0) + (r4 & 0xffff)|0) + (r12 & 0xffff)|0;
                                    v = ((imul(ah4, bl0)|0) + (r4 >>> 16)|0) + (r12 >>> 16)|0;
                                    w = ((imul(al4, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r4 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl1)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl1)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r5 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl2)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl2)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl3)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl3)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl4)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl4)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl5)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl5)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r9 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl6)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl6)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r10 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al4, bl7)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah4, bl7)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al4, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah4, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r11 = (w << 16) | (u & 0xffff);

                                    r12 = m;

                                    u = ((imul(al5, bl0)|0) + (r5 & 0xffff)|0) + (r13 & 0xffff)|0;
                                    v = ((imul(ah5, bl0)|0) + (r5 >>> 16)|0) + (r13 >>> 16)|0;
                                    w = ((imul(al5, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r5 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl1)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl1)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl2)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl2)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl3)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl3)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl4)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl4)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r9 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl5)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl5)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r10 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl6)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl6)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r11 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al5, bl7)|0) + (r12 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah5, bl7)|0) + (r12 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al5, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah5, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r12 = (w << 16) | (u & 0xffff);

                                    r13 = m;

                                    u = ((imul(al6, bl0)|0) + (r6 & 0xffff)|0) + (r14 & 0xffff)|0;
                                    v = ((imul(ah6, bl0)|0) + (r6 >>> 16)|0) + (r14 >>> 16)|0;
                                    w = ((imul(al6, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r6 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl1)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl1)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl2)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl2)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl3)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl3)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r9 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl4)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl4)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r10 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl5)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl5)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r11 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl6)|0) + (r12 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl6)|0) + (r12 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r12 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al6, bl7)|0) + (r13 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah6, bl7)|0) + (r13 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al6, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah6, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r13 = (w << 16) | (u & 0xffff);

                                    r14 = m;

                                    u = ((imul(al7, bl0)|0) + (r7 & 0xffff)|0) + (r15 & 0xffff)|0;
                                    v = ((imul(ah7, bl0)|0) + (r7 >>> 16)|0) + (r15 >>> 16)|0;
                                    w = ((imul(al7, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r7 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl1)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl1)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r8 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl2)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl2)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r9 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl3)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl3)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r10 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl4)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl4)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r11 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl5)|0) + (r12 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl5)|0) + (r12 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r12 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl6)|0) + (r13 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl6)|0) + (r13 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r13 = (w << 16) | (u & 0xffff);

                                    u = ((imul(al7, bl7)|0) + (r14 & 0xffff)|0) + (m & 0xffff)|0;
                                    v = ((imul(ah7, bl7)|0) + (r14 >>> 16)|0) + (m >>> 16)|0;
                                    w = ((imul(al7, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                                    m = ((imul(ah7, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                                    r14 = (w << 16) | (u & 0xffff);

                                    r15 = m;

                                    k = d+(i+j|0)|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r0 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r0 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r1 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r1 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r2 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r2 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r3 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r3 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r4 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r4 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r5 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r5 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r6 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r6 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;

                                    k = k+4|0;
                                    r = HEAP32[(Rk+k)>>2]|0;
                                    u = ((r & 0xffff) + ((r7 & 0xffff) << 1)|0) + c|0;
                                    w = ((r >>> 16) + ((r7 >>> 16) << 1)|0) + (u >>> 16)|0;
                                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                    c = w >>> 16;
                                }

                                k = d+(i+j|0)|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = (((r & 0xffff) + ((r8 & 0xffff) << 1)|0) + c|0) + h|0;
                                w = ((r >>> 16) + ((r8 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r9 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r9 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r10 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r10 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r11 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r11 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r12 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r12 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r13 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r13 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r14 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r14 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                c = w >>> 16;

                                k = k+4|0;
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = ((r & 0xffff) + ((r15 & 0xffff) << 1)|0) + c|0;
                                w = ((r >>> 16) + ((r15 >>> 16) << 1)|0) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                h = w >>> 16;
                            }

                            for ( k = k+4|0; !!h & ( (k|0) < (dd<<1) ); k = (k+4)|0 ) { // carry propagation loop
                                r = HEAP32[(Rk+k)>>2]|0;
                                u = (r & 0xffff) + h|0;
                                w = (r >>> 16) + (u >>> 16)|0;
                                HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                                h = w >>> 16;
                            }
                        }
                    }
                }

                /**
                 * Conventional division
                 *
                 * @param A offset of the numerator, 32-byte aligned
                 * @param lA length of the numerator, multiple of 32
                 *
                 * @param B offset of the divisor, 32-byte aligned
                 * @param lB length of the divisor, multiple of 32
                 *
                 * @param R offset where to place the remainder to, 32-byte aligned
                 *
                 * @param Q offser where to place the quotient to, 32-byte aligned
                 */

                function div ( N, lN, D, lD, Q ) {
                    N  =  N|0;
                    lN = lN|0;
                    D  =  D|0;
                    lD = lD|0;
                    Q  =  Q|0;

                    var n = 0, d = 0, e = 0,
                        u1 = 0, u0 = 0,
                        v0 = 0, vh = 0, vl = 0,
                        qh = 0, ql = 0, rh = 0, rl = 0,
                        t1 = 0, t2 = 0, m = 0, c = 0,
                        i = 0, j = 0, k = 0;

                    // number of significant limbs in `N` (multiplied by 4)
                    for ( i = (lN-1) & -4; (i|0) >= 0; i = (i-4)|0 ) {
                        n = HEAP32[(N+i)>>2]|0;
                        if ( n ) {
                            lN = i;
                            break;
                        }
                    }

                    // number of significant limbs in `D` (multiplied by 4)
                    for ( i = (lD-1) & -4; (i|0) >= 0; i = (i-4)|0 ) {
                        d = HEAP32[(D+i)>>2]|0;
                        if ( d ) {
                            lD = i;
                            break;
                        }
                    }

                    // `D` is zero? WTF?!

                    // calculate `e` — the power of 2 of the normalization factor
                    while ( (d & 0x80000000) == 0 ) {
                        d = d << 1;
                        e = e + 1|0;
                    }

                    // normalize `N` in place
                    u0 = HEAP32[(N+lN)>>2]|0;
                    if ( e ) {
                        u1 = u0>>>(32-e|0);
                        for ( i = (lN-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                            n = HEAP32[(N+i)>>2]|0;
                            HEAP32[(N+i+4)>>2] = (u0 << e) | ( e ? n >>> (32-e|0) : 0 );
                            u0 = n;
                        }
                        HEAP32[N>>2] = u0 << e;
                    }

                    // normalize `D` in place
                    if ( e ) {
                        v0 = HEAP32[(D+lD)>>2]|0;
                        for ( i = (lD-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                            d = HEAP32[(D+i)>>2]|0;
                            HEAP32[(D+i+4)>>2] = (v0 << e) | ( d >>> (32-e|0) );
                            v0 = d;
                        }
                        HEAP32[D>>2] = v0 << e;
                    }

                    // divisor parts won't change
                    v0 = HEAP32[(D+lD)>>2]|0;
                    vh = v0 >>> 16, vl = v0 & 0xffff;

                    // perform division
                    for ( i = lN; (i|0) >= (lD|0); i = (i-4)|0 ) {
                        j = (i-lD)|0;

                        // estimate high part of the quotient
                        u0 = HEAP32[(N+i)>>2]|0;
                        qh = ( (u1>>>0) / (vh>>>0) )|0, rh = ( (u1>>>0) % (vh>>>0) )|0, t1 = imul(qh, vl)|0;
                        while ( ( (qh|0) == 0x10000 ) | ( (t1>>>0) > (((rh << 16)|(u0 >>> 16))>>>0) ) ) {
                            qh = (qh-1)|0, rh = (rh+vh)|0, t1 = (t1-vl)|0;
                            if ( (rh|0) >= 0x10000 ) break;
                        }

                        // bulk multiply-and-subtract
                        // m - multiplication carry, c - subtraction carry
                        m = 0, c = 0;
                        for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                            d = HEAP32[(D+k)>>2]|0;
                            t1 = (imul(qh, d & 0xffff)|0) + (m >>> 16)|0;
                            t2 = (imul(qh, d >>> 16)|0) + (t1 >>> 16)|0;
                            d = (m & 0xffff) | (t1 << 16);
                            m = t2;
                            n = HEAP32[(N+j+k)>>2]|0;
                            t1 = ((n & 0xffff) - (d & 0xffff)|0) + c|0;
                            t2 = ((n >>> 16) - (d >>> 16)|0) + (t1 >> 16)|0;
                            HEAP32[(N+j+k)>>2] = (t2 << 16) | (t1 & 0xffff);
                            c = t2 >> 16;
                        }
                        t1 = ((u1 & 0xffff) - (m & 0xffff)|0) + c|0;
                        t2 = ((u1 >>> 16) - (m >>> 16)|0) + (t1 >> 16)|0;
                        u1 = (t2 << 16) | (t1 & 0xffff);
                        c = t2 >> 16;

                        // add `D` back if got carry-out
                        if ( c ) {
                            qh = (qh-1)|0;
                            c = 0;
                            for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                                d = HEAP32[(D+k)>>2]|0;
                                n = HEAP32[(N+j+k)>>2]|0;
                                t1 = (n & 0xffff) + c|0;
                                t2 = (n >>> 16) + d + (t1 >>> 16)|0;
                                HEAP32[(N+j+k)>>2] = (t2 << 16) | (t1 & 0xffff);
                                c = t2 >>> 16;
                            }
                            u1 = (u1+c)|0;
                        }

                        // estimate low part of the quotient
                        u0 = HEAP32[(N+i)>>2]|0;
                        n = (u1 << 16) | (u0 >>> 16);
                        ql = ( (n>>>0) / (vh>>>0) )|0, rl = ( (n>>>0) % (vh>>>0) )|0, t1 = imul(ql, vl)|0;
                        while ( ( (ql|0) == 0x10000 ) | ( (t1>>>0) > (((rl << 16)|(u0 & 0xffff))>>>0) ) ) {
                            ql = (ql-1)|0, rl = (rl+vh)|0, t1 = (t1-vl)|0;
                            if ( (rl|0) >= 0x10000 ) break;
                        }

                        // bulk multiply-and-subtract
                        // m - multiplication carry, c - subtraction carry
                        m = 0, c = 0;
                        for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                            d = HEAP32[(D+k)>>2]|0;
                            t1 = (imul(ql, d & 0xffff)|0) + (m & 0xffff)|0;
                            t2 = ((imul(ql, d >>> 16)|0) + (t1 >>> 16)|0) + (m >>> 16)|0;
                            d = (t1 & 0xffff) | (t2 << 16);
                            m = t2 >>> 16;
                            n = HEAP32[(N+j+k)>>2]|0;
                            t1 = ((n & 0xffff) - (d & 0xffff)|0) + c|0;
                            t2 = ((n >>> 16) - (d >>> 16)|0) + (t1 >> 16)|0;
                            c = t2 >> 16;
                            HEAP32[(N+j+k)>>2] = (t2 << 16) | (t1 & 0xffff);
                        }
                        t1 = ((u1 & 0xffff) - (m & 0xffff)|0) + c|0;
                        t2 = ((u1 >>> 16) - (m >>> 16)|0) + (t1 >> 16)|0;
                        c = t2 >> 16;

                        // add `D` back if got carry-out
                        if ( c ) {
                            ql = (ql-1)|0;
                            c = 0;
                            for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                                d = HEAP32[(D+k)>>2]|0;
                                n = HEAP32[(N+j+k)>>2]|0;
                                t1 = ((n & 0xffff) + (d & 0xffff)|0) + c|0;
                                t2 = ((n >>> 16) + (d >>> 16)|0) + (t1 >>> 16)|0;
                                c = t2 >>> 16;
                                HEAP32[(N+j+k)>>2] = (t1 & 0xffff) | (t2 << 16);
                            }
                        }

                        // got quotient limb
                        HEAP32[(Q+j)>>2] = (qh << 16) | ql;

                        u1 = HEAP32[(N+i)>>2]|0;
                    }

                    if ( e ) {
                        // TODO denormalize `D` in place

                        // denormalize `N` in place
                        u0 = HEAP32[N>>2]|0;
                        for ( i = 4; (i|0) <= (lD|0); i = (i+4)|0 ) {
                            n = HEAP32[(N+i)>>2]|0;
                            HEAP32[(N+i-4)>>2] = ( n << (32-e|0) ) | (u0 >>> e);
                            u0 = n;
                        }
                        HEAP32[(N+lD)>>2] = u0 >>> e;
                    }
                }

                /**
                 * Montgomery modular reduction
                 *
                 * Definition:
                 *
                 *  MREDC(A) = A × X (mod N),
                 *  M × X = N × Y + 1,
                 *
                 * where M = 2^(32*m) such that N < M and A < N×M
                 *
                 * Numbers `X` and `Y` can be calculated using Extended Euclidean Algorithm.
                 */
                function mredc ( A, lA, N, lN, y, R ) {
                    A  =  A|0;
                    lA = lA|0;
                    N  =  N|0;
                    lN = lN|0;
                    y  =  y|0;
                    R  =  R|0;

                    var T = 0,
                        c = 0, uh = 0, ul = 0, vl = 0, vh = 0, w0 = 0, w1 = 0, w2 = 0, r0 = 0, r1 = 0,
                        i = 0, j = 0, k = 0;

                    T = salloc(lN<<1)|0;
                    z(lN<<1, 0, T);

                    cp( lA, A, T );

                    // HAC 14.32
                    for ( i = 0; (i|0) < (lN|0); i = (i+4)|0 ) {
                        uh = HEAP32[(T+i)>>2]|0, ul = uh & 0xffff, uh = uh >>> 16;
                        vh = y >>> 16, vl = y & 0xffff;
                        w0 = imul(ul,vl)|0, w1 = ( (imul(ul,vh)|0) + (imul(uh,vl)|0) | 0 ) + (w0 >>> 16) | 0;
                        ul = w0 & 0xffff, uh = w1 & 0xffff;
                        r1 = 0;
                        for ( j = 0; (j|0) < (lN|0); j = (j+4)|0 ) {
                            k = (i+j)|0;
                            vh = HEAP32[(N+j)>>2]|0, vl = vh & 0xffff, vh = vh >>> 16;
                            r0 = HEAP32[(T+k)>>2]|0;
                            w0 = ((imul(ul, vl)|0) + (r1 & 0xffff)|0) + (r0 & 0xffff)|0;
                            w1 = ((imul(ul, vh)|0) + (r1 >>> 16)|0) + (r0 >>> 16)|0;
                            w2 = ((imul(uh, vl)|0) + (w1 & 0xffff)|0) + (w0 >>> 16)|0;
                            r1 = ((imul(uh, vh)|0) + (w2 >>> 16)|0) + (w1 >>> 16)|0;
                            r0 = (w2 << 16) | (w0 & 0xffff);
                            HEAP32[(T+k)>>2] = r0;
                        }
                        k = (i+j)|0;
                        r0 = HEAP32[(T+k)>>2]|0;
                        w0 = ((r0 & 0xffff) + (r1 & 0xffff)|0) + c|0;
                        w1 = ((r0 >>> 16) + (r1 >>> 16)|0) + (w0 >>> 16)|0;
                        HEAP32[(T+k)>>2] = (w1 << 16) | (w0 & 0xffff);
                        c = w1 >>> 16;
                    }

                    cp( lN, (T+lN)|0, R );

                    sfree(lN<<1);

                    if ( c | ( (cmp( N, lN, R, lN )|0) <= 0 ) ) {
                        sub( R, lN, N, lN, R, lN )|0;
                    }
                }

                return {
                    sreset: sreset,
                    salloc: salloc,
                    sfree:  sfree,
                    z: z,
                    tst: tst,
                    neg: neg,
                    cmp: cmp,
                    add: add,
                    sub: sub,
                    mul: mul,
                    sqr: sqr,
                    div: div,
                    mredc: mredc
                };
            };

            function Number_extGCD(a, b) {
                var sa = a < 0 ? -1 : 1, sb = b < 0 ? -1 : 1, xi = 1, xj = 0, yi = 0, yj = 1, r, q, t, a_cmp_b;
                a *= sa;
                b *= sb;
                a_cmp_b = a < b;
                if (a_cmp_b) {
                    t = a;
                    (a = b), (b = t);
                    t = sa;
                    sa = sb;
                    sb = t;
                }
                (q = Math.floor(a / b)), (r = a - q * b);
                while (r) {
                    (t = xi - q * xj), (xi = xj), (xj = t);
                    (t = yi - q * yj), (yi = yj), (yj = t);
                    (a = b), (b = r);
                    (q = Math.floor(a / b)), (r = a - q * b);
                }
                xj *= sa;
                yj *= sb;
                if (a_cmp_b) {
                    t = xj;
                    (xj = yj), (yj = t);
                }
                return {
                    gcd: b,
                    x: xj,
                    y: yj,
                };
            }
            function BigNumber_extGCD(a, b) {
                let sa = a.sign;
                let sb = b.sign;
                if (sa < 0)
                    a = a.negate();
                if (sb < 0)
                    b = b.negate();
                const a_cmp_b = a.compare(b);
                if (a_cmp_b < 0) {
                    let t = a;
                    (a = b), (b = t);
                    let t2 = sa;
                    sa = sb;
                    sb = t2;
                }
                var xi = BigNumber.ONE, xj = BigNumber.ZERO, lx = b.bitLength, yi = BigNumber.ZERO, yj = BigNumber.ONE, ly = a.bitLength, z, r, q;
                z = a.divide(b);
                while ((r = z.remainder) !== BigNumber.ZERO) {
                    q = z.quotient;
                    (z = xi.subtract(q.multiply(xj).clamp(lx)).clamp(lx)), (xi = xj), (xj = z);
                    (z = yi.subtract(q.multiply(yj).clamp(ly)).clamp(ly)), (yi = yj), (yj = z);
                    (a = b), (b = r);
                    z = a.divide(b);
                }
                if (sa < 0)
                    xj = xj.negate();
                if (sb < 0)
                    yj = yj.negate();
                if (a_cmp_b < 0) {
                    let t = xj;
                    (xj = yj), (yj = t);
                }
                return {
                    gcd: b,
                    x: xj,
                    y: yj,
                };
            }

            function getRandomValues(buf) {
                if (typeof process !== 'undefined') {
                    const nodeCrypto = require('crypto');
                    const bytes = nodeCrypto.randomBytes(buf.length);
                    buf.set(bytes);
                    return;
                }
                if (window.crypto && window.crypto.getRandomValues) {
                    window.crypto.getRandomValues(buf);
                    return;
                }
                if (self.crypto && self.crypto.getRandomValues) {
                    self.crypto.getRandomValues(buf);
                    return;
                }
                // @ts-ignore
                if (window.msCrypto && window.msCrypto.getRandomValues) {
                    // @ts-ignore
                    window.msCrypto.getRandomValues(buf);
                    return;
                }
                throw new Error('No secure random number generator available.');
            }

            ///////////////////////////////////////////////////////////////////////////////
            const _bigint_stdlib = { Uint32Array: Uint32Array, Math: Math };
            const _bigint_heap = new Uint32Array(0x100000);
            let _bigint_asm;
            function _half_imul(a, b) {
                return (a * b) | 0;
            }
            if (_bigint_stdlib.Math.imul === undefined) {
                _bigint_stdlib.Math.imul = _half_imul;
                _bigint_asm = bigint_asm(_bigint_stdlib, null, _bigint_heap.buffer);
                delete _bigint_stdlib.Math.imul;
            }
            else {
                _bigint_asm = bigint_asm(_bigint_stdlib, null, _bigint_heap.buffer);
            }
            ///////////////////////////////////////////////////////////////////////////////
            const _BigNumber_ZERO_limbs = new Uint32Array(0);
            class BigNumber {
                constructor(num) {
                    let limbs = _BigNumber_ZERO_limbs;
                    let bitlen = 0;
                    let sign = 0;
                    if (num === undefined) ;
                    else {
                        for (var i = 0; !num[i]; i++)
                            ;
                        bitlen = (num.length - i) * 8;
                        if (!bitlen)
                            return BigNumber.ZERO;
                        limbs = new Uint32Array((bitlen + 31) >> 5);
                        for (var j = num.length - 4; j >= i; j -= 4) {
                            limbs[(num.length - 4 - j) >> 2] = (num[j] << 24) | (num[j + 1] << 16) | (num[j + 2] << 8) | num[j + 3];
                        }
                        if (i - j === 3) {
                            limbs[limbs.length - 1] = num[i];
                        }
                        else if (i - j === 2) {
                            limbs[limbs.length - 1] = (num[i] << 8) | num[i + 1];
                        }
                        else if (i - j === 1) {
                            limbs[limbs.length - 1] = (num[i] << 16) | (num[i + 1] << 8) | num[i + 2];
                        }
                        sign = 1;
                    }
                    this.limbs = limbs;
                    this.bitLength = bitlen;
                    this.sign = sign;
                }
                static fromString(str) {
                    const bytes = string_to_bytes(str);
                    return new BigNumber(bytes);
                }
                static fromNumber(num) {
                    let limbs = _BigNumber_ZERO_limbs;
                    let bitlen = 0;
                    let sign = 0;
                    var absnum = Math.abs(num);
                    if (absnum > 0xffffffff) {
                        limbs = new Uint32Array(2);
                        limbs[0] = absnum | 0;
                        limbs[1] = (absnum / 0x100000000) | 0;
                        bitlen = 52;
                    }
                    else if (absnum > 0) {
                        limbs = new Uint32Array(1);
                        limbs[0] = absnum;
                        bitlen = 32;
                    }
                    else {
                        limbs = _BigNumber_ZERO_limbs;
                        bitlen = 0;
                    }
                    sign = num < 0 ? -1 : 1;
                    return BigNumber.fromConfig({ limbs, bitLength: bitlen, sign });
                }
                static fromArrayBuffer(buffer) {
                    return new BigNumber(new Uint8Array(buffer));
                }
                static fromConfig(obj) {
                    const bn = new BigNumber();
                    bn.limbs = new Uint32Array(obj.limbs);
                    bn.bitLength = obj.bitLength;
                    bn.sign = obj.sign;
                    return bn;
                }
                toString(radix) {
                    radix = radix || 16;
                    const limbs = this.limbs;
                    const bitlen = this.bitLength;
                    let str = '';
                    if (radix === 16) {
                        // FIXME clamp last limb to (bitlen % 32)
                        for (var i = ((bitlen + 31) >> 5) - 1; i >= 0; i--) {
                            var h = limbs[i].toString(16);
                            str += '00000000'.substr(h.length);
                            str += h;
                        }
                        str = str.replace(/^0+/, '');
                        if (!str.length)
                            str = '0';
                    }
                    else {
                        throw new IllegalArgumentError('bad radix');
                    }
                    if (this.sign < 0)
                        str = '-' + str;
                    return str;
                }
                toBytes() {
                    const bitlen = this.bitLength;
                    const limbs = this.limbs;
                    if (bitlen === 0)
                        return new Uint8Array(0);
                    const bytelen = (bitlen + 7) >> 3;
                    const bytes = new Uint8Array(bytelen);
                    for (let i = 0; i < bytelen; i++) {
                        let j = bytelen - i - 1;
                        bytes[i] = limbs[j >> 2] >> ((j & 3) << 3);
                    }
                    return bytes;
                }
                /**
                 * Downgrade to Number
                 */
                valueOf() {
                    const limbs = this.limbs;
                    const bits = this.bitLength;
                    const sign = this.sign;
                    if (!sign)
                        return 0;
                    if (bits <= 32)
                        return sign * (limbs[0] >>> 0);
                    if (bits <= 52)
                        return sign * (0x100000000 * (limbs[1] >>> 0) + (limbs[0] >>> 0));
                    // normalization
                    let i, l, e = 0;
                    for (i = limbs.length - 1; i >= 0; i--) {
                        if ((l = limbs[i]) === 0)
                            continue;
                        while (((l << e) & 0x80000000) === 0)
                            e++;
                        break;
                    }
                    if (i === 0)
                        return sign * (limbs[0] >>> 0);
                    return (sign *
                        (0x100000 * (((limbs[i] << e) | (e ? limbs[i - 1] >>> (32 - e) : 0)) >>> 0) +
                            (((limbs[i - 1] << e) | (e && i > 1 ? limbs[i - 2] >>> (32 - e) : 0)) >>> 12)) *
                        Math.pow(2, 32 * i - e - 52));
                }
                clamp(b) {
                    const limbs = this.limbs;
                    const bitlen = this.bitLength;
                    // FIXME check b is number and in a valid range
                    if (b >= bitlen)
                        return this;
                    const clamped = new BigNumber();
                    let n = (b + 31) >> 5;
                    let k = b % 32;
                    clamped.limbs = new Uint32Array(limbs.subarray(0, n));
                    clamped.bitLength = b;
                    clamped.sign = this.sign;
                    if (k)
                        clamped.limbs[n - 1] &= -1 >>> (32 - k);
                    return clamped;
                }
                slice(f, b) {
                    const limbs = this.limbs;
                    const bitlen = this.bitLength;
                    if (f < 0)
                        throw new RangeError('TODO');
                    if (f >= bitlen)
                        return BigNumber.ZERO;
                    if (b === undefined || b > bitlen - f)
                        b = bitlen - f;
                    const sliced = new BigNumber();
                    let n = f >> 5;
                    let m = (f + b + 31) >> 5;
                    let l = (b + 31) >> 5;
                    let t = f % 32;
                    let k = b % 32;
                    const slimbs = new Uint32Array(l);
                    if (t) {
                        for (var i = 0; i < m - n - 1; i++) {
                            slimbs[i] = (limbs[n + i] >>> t) | (limbs[n + i + 1] << (32 - t));
                        }
                        slimbs[i] = limbs[n + i] >>> t;
                    }
                    else {
                        slimbs.set(limbs.subarray(n, m));
                    }
                    if (k) {
                        slimbs[l - 1] &= -1 >>> (32 - k);
                    }
                    sliced.limbs = slimbs;
                    sliced.bitLength = b;
                    sliced.sign = this.sign;
                    return sliced;
                }
                negate() {
                    const negative = new BigNumber();
                    negative.limbs = this.limbs;
                    negative.bitLength = this.bitLength;
                    negative.sign = -1 * this.sign;
                    return negative;
                }
                compare(that) {
                    var alimbs = this.limbs, alimbcnt = alimbs.length, blimbs = that.limbs, blimbcnt = blimbs.length, z = 0;
                    if (this.sign < that.sign)
                        return -1;
                    if (this.sign > that.sign)
                        return 1;
                    _bigint_heap.set(alimbs, 0);
                    _bigint_heap.set(blimbs, alimbcnt);
                    z = _bigint_asm.cmp(0, alimbcnt << 2, alimbcnt << 2, blimbcnt << 2);
                    return z * this.sign;
                }
                add(that) {
                    if (!this.sign)
                        return that;
                    if (!that.sign)
                        return this;
                    var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, asign = this.sign, bbitlen = that.bitLength, blimbs = that.limbs, blimbcnt = blimbs.length, bsign = that.sign, rbitlen, rlimbcnt, rsign, rof, result = new BigNumber();
                    rbitlen = (abitlen > bbitlen ? abitlen : bbitlen) + (asign * bsign > 0 ? 1 : 0);
                    rlimbcnt = (rbitlen + 31) >> 5;
                    _bigint_asm.sreset();
                    var pA = _bigint_asm.salloc(alimbcnt << 2), pB = _bigint_asm.salloc(blimbcnt << 2), pR = _bigint_asm.salloc(rlimbcnt << 2);
                    _bigint_asm.z(pR - pA + (rlimbcnt << 2), 0, pA);
                    _bigint_heap.set(alimbs, pA >> 2);
                    _bigint_heap.set(blimbs, pB >> 2);
                    if (asign * bsign > 0) {
                        _bigint_asm.add(pA, alimbcnt << 2, pB, blimbcnt << 2, pR, rlimbcnt << 2);
                        rsign = asign;
                    }
                    else if (asign > bsign) {
                        rof = _bigint_asm.sub(pA, alimbcnt << 2, pB, blimbcnt << 2, pR, rlimbcnt << 2);
                        rsign = rof ? bsign : asign;
                    }
                    else {
                        rof = _bigint_asm.sub(pB, blimbcnt << 2, pA, alimbcnt << 2, pR, rlimbcnt << 2);
                        rsign = rof ? asign : bsign;
                    }
                    if (rof)
                        _bigint_asm.neg(pR, rlimbcnt << 2, pR, rlimbcnt << 2);
                    if (_bigint_asm.tst(pR, rlimbcnt << 2) === 0)
                        return BigNumber.ZERO;
                    result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + rlimbcnt));
                    result.bitLength = rbitlen;
                    result.sign = rsign;
                    return result;
                }
                subtract(that) {
                    return this.add(that.negate());
                }
                square() {
                    if (!this.sign)
                        return BigNumber.ZERO;
                    var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, rbitlen, rlimbcnt, result = new BigNumber();
                    rbitlen = abitlen << 1;
                    rlimbcnt = (rbitlen + 31) >> 5;
                    _bigint_asm.sreset();
                    var pA = _bigint_asm.salloc(alimbcnt << 2), pR = _bigint_asm.salloc(rlimbcnt << 2);
                    _bigint_asm.z(pR - pA + (rlimbcnt << 2), 0, pA);
                    _bigint_heap.set(alimbs, pA >> 2);
                    _bigint_asm.sqr(pA, alimbcnt << 2, pR);
                    result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + rlimbcnt));
                    result.bitLength = rbitlen;
                    result.sign = 1;
                    return result;
                }
                divide(that) {
                    var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, bbitlen = that.bitLength, blimbs = that.limbs, blimbcnt = blimbs.length, qlimbcnt, rlimbcnt, quotient = BigNumber.ZERO, remainder = BigNumber.ZERO;
                    _bigint_asm.sreset();
                    var pA = _bigint_asm.salloc(alimbcnt << 2), pB = _bigint_asm.salloc(blimbcnt << 2), pQ = _bigint_asm.salloc(alimbcnt << 2);
                    _bigint_asm.z(pQ - pA + (alimbcnt << 2), 0, pA);
                    _bigint_heap.set(alimbs, pA >> 2);
                    _bigint_heap.set(blimbs, pB >> 2);
                    _bigint_asm.div(pA, alimbcnt << 2, pB, blimbcnt << 2, pQ);
                    qlimbcnt = _bigint_asm.tst(pQ, alimbcnt << 2) >> 2;
                    if (qlimbcnt) {
                        quotient = new BigNumber();
                        quotient.limbs = new Uint32Array(_bigint_heap.subarray(pQ >> 2, (pQ >> 2) + qlimbcnt));
                        quotient.bitLength = abitlen < qlimbcnt << 5 ? abitlen : qlimbcnt << 5;
                        quotient.sign = this.sign * that.sign;
                    }
                    rlimbcnt = _bigint_asm.tst(pA, blimbcnt << 2) >> 2;
                    if (rlimbcnt) {
                        remainder = new BigNumber();
                        remainder.limbs = new Uint32Array(_bigint_heap.subarray(pA >> 2, (pA >> 2) + rlimbcnt));
                        remainder.bitLength = bbitlen < rlimbcnt << 5 ? bbitlen : rlimbcnt << 5;
                        remainder.sign = this.sign;
                    }
                    return {
                        quotient: quotient,
                        remainder: remainder,
                    };
                }
                multiply(that) {
                    if (!this.sign || !that.sign)
                        return BigNumber.ZERO;
                    var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, bbitlen = that.bitLength, blimbs = that.limbs, blimbcnt = blimbs.length, rbitlen, rlimbcnt, result = new BigNumber();
                    rbitlen = abitlen + bbitlen;
                    rlimbcnt = (rbitlen + 31) >> 5;
                    _bigint_asm.sreset();
                    var pA = _bigint_asm.salloc(alimbcnt << 2), pB = _bigint_asm.salloc(blimbcnt << 2), pR = _bigint_asm.salloc(rlimbcnt << 2);
                    _bigint_asm.z(pR - pA + (rlimbcnt << 2), 0, pA);
                    _bigint_heap.set(alimbs, pA >> 2);
                    _bigint_heap.set(blimbs, pB >> 2);
                    _bigint_asm.mul(pA, alimbcnt << 2, pB, blimbcnt << 2, pR, rlimbcnt << 2);
                    result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + rlimbcnt));
                    result.sign = this.sign * that.sign;
                    result.bitLength = rbitlen;
                    return result;
                }
                isMillerRabinProbablePrime(rounds) {
                    var t = BigNumber.fromConfig(this), s = 0;
                    t.limbs[0] -= 1;
                    while (t.limbs[s >> 5] === 0)
                        s += 32;
                    while (((t.limbs[s >> 5] >> (s & 31)) & 1) === 0)
                        s++;
                    t = t.slice(s);
                    var m = new Modulus(this), m1 = this.subtract(BigNumber.ONE), a = BigNumber.fromConfig(this), l = this.limbs.length - 1;
                    while (a.limbs[l] === 0)
                        l--;
                    while (--rounds >= 0) {
                        getRandomValues(a.limbs);
                        if (a.limbs[0] < 2)
                            a.limbs[0] += 2;
                        while (a.compare(m1) >= 0)
                            a.limbs[l] >>>= 1;
                        var x = m.power(a, t);
                        if (x.compare(BigNumber.ONE) === 0)
                            continue;
                        if (x.compare(m1) === 0)
                            continue;
                        var c = s;
                        while (--c > 0) {
                            x = x.square().divide(m).remainder;
                            if (x.compare(BigNumber.ONE) === 0)
                                return false;
                            if (x.compare(m1) === 0)
                                break;
                        }
                        if (c === 0)
                            return false;
                    }
                    return true;
                }
                isProbablePrime(paranoia = 80) {
                    var limbs = this.limbs;
                    var i = 0;
                    // Oddity test
                    // (50% false positive probability)
                    if ((limbs[0] & 1) === 0)
                        return false;
                    if (paranoia <= 1)
                        return true;
                    // Magic divisors (3, 5, 17) test
                    // (~25% false positive probability)
                    var s3 = 0, s5 = 0, s17 = 0;
                    for (i = 0; i < limbs.length; i++) {
                        var l3 = limbs[i];
                        while (l3) {
                            s3 += l3 & 3;
                            l3 >>>= 2;
                        }
                        var l5 = limbs[i];
                        while (l5) {
                            s5 += l5 & 3;
                            l5 >>>= 2;
                            s5 -= l5 & 3;
                            l5 >>>= 2;
                        }
                        var l17 = limbs[i];
                        while (l17) {
                            s17 += l17 & 15;
                            l17 >>>= 4;
                            s17 -= l17 & 15;
                            l17 >>>= 4;
                        }
                    }
                    if (!(s3 % 3) || !(s5 % 5) || !(s17 % 17))
                        return false;
                    if (paranoia <= 2)
                        return true;
                    // Miller-Rabin test
                    // (≤ 4^(-k) false positive probability)
                    return this.isMillerRabinProbablePrime(paranoia >>> 1);
                }
            }
            BigNumber.extGCD = BigNumber_extGCD;
            BigNumber.ZERO = BigNumber.fromNumber(0);
            BigNumber.ONE = BigNumber.fromNumber(1);
            class Modulus extends BigNumber {
                constructor(number) {
                    super();
                    this.limbs = number.limbs;
                    this.bitLength = number.bitLength;
                    this.sign = number.sign;
                    if (this.valueOf() < 1)
                        throw new RangeError();
                    if (this.bitLength <= 32)
                        return;
                    let comodulus;
                    if (this.limbs[0] & 1) {
                        const bitlen = ((this.bitLength + 31) & -32) + 1;
                        const limbs = new Uint32Array((bitlen + 31) >> 5);
                        limbs[limbs.length - 1] = 1;
                        comodulus = new BigNumber();
                        comodulus.sign = 1;
                        comodulus.bitLength = bitlen;
                        comodulus.limbs = limbs;
                        const k = Number_extGCD(0x100000000, this.limbs[0]).y;
                        this.coefficient = k < 0 ? -k : 0x100000000 - k;
                    }
                    else {
                        /**
                         * TODO even modulus reduction
                         * Modulus represented as `N = 2^U * V`, where `V` is odd and thus `GCD(2^U, V) = 1`.
                         * Calculation `A = TR' mod V` is made as for odd modulo using Montgomery method.
                         * Calculation `B = TR' mod 2^U` is easy as modulus is a power of 2.
                         * Using Chinese Remainder Theorem and Garner's Algorithm restore `TR' mod N` from `A` and `B`.
                         */
                        return;
                    }
                    this.comodulus = comodulus;
                    this.comodulusRemainder = comodulus.divide(this).remainder;
                    this.comodulusRemainderSquare = comodulus.square().divide(this).remainder;
                }
                /**
                 * Modular reduction
                 */
                reduce(a) {
                    if (a.bitLength <= 32 && this.bitLength <= 32)
                        return BigNumber.fromNumber(a.valueOf() % this.valueOf());
                    if (a.compare(this) < 0)
                        return a;
                    return a.divide(this).remainder;
                }
                /**
                 * Modular inverse
                 */
                inverse(a) {
                    a = this.reduce(a);
                    const r = BigNumber_extGCD(this, a);
                    if (r.gcd.valueOf() !== 1)
                        throw new Error('GCD is not 1');
                    if (r.y.sign < 0)
                        return r.y.add(this).clamp(this.bitLength);
                    return r.y;
                }
                /**
                 * Modular exponentiation
                 */
                power(g, e) {
                    // count exponent set bits
                    let c = 0;
                    for (let i = 0; i < e.limbs.length; i++) {
                        let t = e.limbs[i];
                        while (t) {
                            if (t & 1)
                                c++;
                            t >>>= 1;
                        }
                    }
                    // window size parameter
                    let k = 8;
                    if (e.bitLength <= 4536)
                        k = 7;
                    if (e.bitLength <= 1736)
                        k = 6;
                    if (e.bitLength <= 630)
                        k = 5;
                    if (e.bitLength <= 210)
                        k = 4;
                    if (e.bitLength <= 60)
                        k = 3;
                    if (e.bitLength <= 12)
                        k = 2;
                    if (c <= 1 << (k - 1))
                        k = 1;
                    // montgomerize base
                    g = Modulus._Montgomery_reduce(this.reduce(g).multiply(this.comodulusRemainderSquare), this);
                    // precompute odd powers
                    const g2 = Modulus._Montgomery_reduce(g.square(), this), gn = new Array(1 << (k - 1));
                    gn[0] = g;
                    gn[1] = Modulus._Montgomery_reduce(g.multiply(g2), this);
                    for (let i = 2; i < 1 << (k - 1); i++) {
                        gn[i] = Modulus._Montgomery_reduce(gn[i - 1].multiply(g2), this);
                    }
                    // perform exponentiation
                    const u = this.comodulusRemainder;
                    let r = u;
                    for (let i = e.limbs.length - 1; i >= 0; i--) {
                        let t = e.limbs[i];
                        for (let j = 32; j > 0;) {
                            if (t & 0x80000000) {
                                let n = t >>> (32 - k), l = k;
                                while ((n & 1) === 0) {
                                    n >>>= 1;
                                    l--;
                                }
                                var m = gn[n >>> 1];
                                while (n) {
                                    n >>>= 1;
                                    if (r !== u)
                                        r = Modulus._Montgomery_reduce(r.square(), this);
                                }
                                r = r !== u ? Modulus._Montgomery_reduce(r.multiply(m), this) : m;
                                (t <<= l), (j -= l);
                            }
                            else {
                                if (r !== u)
                                    r = Modulus._Montgomery_reduce(r.square(), this);
                                (t <<= 1), j--;
                            }
                        }
                    }
                    // de-montgomerize result
                    return Modulus._Montgomery_reduce(r, this);
                }
                static _Montgomery_reduce(a, n) {
                    const alimbs = a.limbs;
                    const alimbcnt = alimbs.length;
                    const nlimbs = n.limbs;
                    const nlimbcnt = nlimbs.length;
                    const y = n.coefficient;
                    _bigint_asm.sreset();
                    const pA = _bigint_asm.salloc(alimbcnt << 2), pN = _bigint_asm.salloc(nlimbcnt << 2), pR = _bigint_asm.salloc(nlimbcnt << 2);
                    _bigint_asm.z(pR - pA + (nlimbcnt << 2), 0, pA);
                    _bigint_heap.set(alimbs, pA >> 2);
                    _bigint_heap.set(nlimbs, pN >> 2);
                    _bigint_asm.mredc(pA, alimbcnt << 2, pN, nlimbcnt << 2, y, pR);
                    const result = new BigNumber();
                    result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + nlimbcnt));
                    result.bitLength = n.bitLength;
                    result.sign = 1;
                    return result;
                }
            }

            class Hash {
                constructor() {
                    this.pos = 0;
                    this.len = 0;
                }
                reset() {
                    this.result = null;
                    this.pos = 0;
                    this.len = 0;
                    this.asm.reset();
                    return this;
                }
                process(data) {
                    if (this.result !== null)
                        throw new IllegalStateError('state must be reset before processing new data');
                    let asm = this.asm;
                    let heap = this.heap;
                    let hpos = this.pos;
                    let hlen = this.len;
                    let dpos = 0;
                    let dlen = data.length;
                    let wlen = 0;
                    while (dlen > 0) {
                        wlen = _heap_write(heap, hpos + hlen, data, dpos, dlen);
                        hlen += wlen;
                        dpos += wlen;
                        dlen -= wlen;
                        wlen = asm.process(hpos, hlen);
                        hpos += wlen;
                        hlen -= wlen;
                        if (!hlen)
                            hpos = 0;
                    }
                    this.pos = hpos;
                    this.len = hlen;
                    return this;
                }
                finish() {
                    if (this.result !== null)
                        throw new IllegalStateError('state must be reset before processing new data');
                    this.asm.finish(this.pos, this.len, 0);
                    this.result = new Uint8Array(this.HASH_SIZE);
                    this.result.set(this.heap.subarray(0, this.HASH_SIZE));
                    this.pos = 0;
                    this.len = 0;
                    return this;
                }
            }

            var sha256_asm = function ( stdlib, foreign, buffer ) {
                "use asm";

                // SHA256 state
                var H0 = 0, H1 = 0, H2 = 0, H3 = 0, H4 = 0, H5 = 0, H6 = 0, H7 = 0,
                    TOTAL0 = 0, TOTAL1 = 0;

                // HMAC state
                var I0 = 0, I1 = 0, I2 = 0, I3 = 0, I4 = 0, I5 = 0, I6 = 0, I7 = 0,
                    O0 = 0, O1 = 0, O2 = 0, O3 = 0, O4 = 0, O5 = 0, O6 = 0, O7 = 0;

                // I/O buffer
                var HEAP = new stdlib.Uint8Array(buffer);

                function _core ( w0, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15 ) {
                    w0 = w0|0;
                    w1 = w1|0;
                    w2 = w2|0;
                    w3 = w3|0;
                    w4 = w4|0;
                    w5 = w5|0;
                    w6 = w6|0;
                    w7 = w7|0;
                    w8 = w8|0;
                    w9 = w9|0;
                    w10 = w10|0;
                    w11 = w11|0;
                    w12 = w12|0;
                    w13 = w13|0;
                    w14 = w14|0;
                    w15 = w15|0;

                    var a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0;

                    a = H0;
                    b = H1;
                    c = H2;
                    d = H3;
                    e = H4;
                    f = H5;
                    g = H6;
                    h = H7;
                    
                    // 0
                    h = ( w0 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0x428a2f98 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 1
                    g = ( w1 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0x71374491 )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 2
                    f = ( w2 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0xb5c0fbcf )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 3
                    e = ( w3 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0xe9b5dba5 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 4
                    d = ( w4 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0x3956c25b )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 5
                    c = ( w5 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0x59f111f1 )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 6
                    b = ( w6 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0x923f82a4 )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 7
                    a = ( w7 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0xab1c5ed5 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 8
                    h = ( w8 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0xd807aa98 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 9
                    g = ( w9 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0x12835b01 )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 10
                    f = ( w10 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0x243185be )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 11
                    e = ( w11 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0x550c7dc3 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 12
                    d = ( w12 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0x72be5d74 )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 13
                    c = ( w13 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0x80deb1fe )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 14
                    b = ( w14 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0x9bdc06a7 )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 15
                    a = ( w15 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0xc19bf174 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 16
                    w0 = ( ( w1>>>7  ^ w1>>>18 ^ w1>>>3  ^ w1<<25 ^ w1<<14 ) + ( w14>>>17 ^ w14>>>19 ^ w14>>>10 ^ w14<<15 ^ w14<<13 ) + w0 + w9 )|0;
                    h = ( w0 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0xe49b69c1 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 17
                    w1 = ( ( w2>>>7  ^ w2>>>18 ^ w2>>>3  ^ w2<<25 ^ w2<<14 ) + ( w15>>>17 ^ w15>>>19 ^ w15>>>10 ^ w15<<15 ^ w15<<13 ) + w1 + w10 )|0;
                    g = ( w1 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0xefbe4786 )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 18
                    w2 = ( ( w3>>>7  ^ w3>>>18 ^ w3>>>3  ^ w3<<25 ^ w3<<14 ) + ( w0>>>17 ^ w0>>>19 ^ w0>>>10 ^ w0<<15 ^ w0<<13 ) + w2 + w11 )|0;
                    f = ( w2 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0x0fc19dc6 )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 19
                    w3 = ( ( w4>>>7  ^ w4>>>18 ^ w4>>>3  ^ w4<<25 ^ w4<<14 ) + ( w1>>>17 ^ w1>>>19 ^ w1>>>10 ^ w1<<15 ^ w1<<13 ) + w3 + w12 )|0;
                    e = ( w3 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0x240ca1cc )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 20
                    w4 = ( ( w5>>>7  ^ w5>>>18 ^ w5>>>3  ^ w5<<25 ^ w5<<14 ) + ( w2>>>17 ^ w2>>>19 ^ w2>>>10 ^ w2<<15 ^ w2<<13 ) + w4 + w13 )|0;
                    d = ( w4 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0x2de92c6f )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 21
                    w5 = ( ( w6>>>7  ^ w6>>>18 ^ w6>>>3  ^ w6<<25 ^ w6<<14 ) + ( w3>>>17 ^ w3>>>19 ^ w3>>>10 ^ w3<<15 ^ w3<<13 ) + w5 + w14 )|0;
                    c = ( w5 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0x4a7484aa )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 22
                    w6 = ( ( w7>>>7  ^ w7>>>18 ^ w7>>>3  ^ w7<<25 ^ w7<<14 ) + ( w4>>>17 ^ w4>>>19 ^ w4>>>10 ^ w4<<15 ^ w4<<13 ) + w6 + w15 )|0;
                    b = ( w6 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0x5cb0a9dc )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 23
                    w7 = ( ( w8>>>7  ^ w8>>>18 ^ w8>>>3  ^ w8<<25 ^ w8<<14 ) + ( w5>>>17 ^ w5>>>19 ^ w5>>>10 ^ w5<<15 ^ w5<<13 ) + w7 + w0 )|0;
                    a = ( w7 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0x76f988da )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 24
                    w8 = ( ( w9>>>7  ^ w9>>>18 ^ w9>>>3  ^ w9<<25 ^ w9<<14 ) + ( w6>>>17 ^ w6>>>19 ^ w6>>>10 ^ w6<<15 ^ w6<<13 ) + w8 + w1 )|0;
                    h = ( w8 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0x983e5152 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 25
                    w9 = ( ( w10>>>7  ^ w10>>>18 ^ w10>>>3  ^ w10<<25 ^ w10<<14 ) + ( w7>>>17 ^ w7>>>19 ^ w7>>>10 ^ w7<<15 ^ w7<<13 ) + w9 + w2 )|0;
                    g = ( w9 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0xa831c66d )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 26
                    w10 = ( ( w11>>>7  ^ w11>>>18 ^ w11>>>3  ^ w11<<25 ^ w11<<14 ) + ( w8>>>17 ^ w8>>>19 ^ w8>>>10 ^ w8<<15 ^ w8<<13 ) + w10 + w3 )|0;
                    f = ( w10 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0xb00327c8 )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 27
                    w11 = ( ( w12>>>7  ^ w12>>>18 ^ w12>>>3  ^ w12<<25 ^ w12<<14 ) + ( w9>>>17 ^ w9>>>19 ^ w9>>>10 ^ w9<<15 ^ w9<<13 ) + w11 + w4 )|0;
                    e = ( w11 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0xbf597fc7 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 28
                    w12 = ( ( w13>>>7  ^ w13>>>18 ^ w13>>>3  ^ w13<<25 ^ w13<<14 ) + ( w10>>>17 ^ w10>>>19 ^ w10>>>10 ^ w10<<15 ^ w10<<13 ) + w12 + w5 )|0;
                    d = ( w12 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0xc6e00bf3 )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 29
                    w13 = ( ( w14>>>7  ^ w14>>>18 ^ w14>>>3  ^ w14<<25 ^ w14<<14 ) + ( w11>>>17 ^ w11>>>19 ^ w11>>>10 ^ w11<<15 ^ w11<<13 ) + w13 + w6 )|0;
                    c = ( w13 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0xd5a79147 )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 30
                    w14 = ( ( w15>>>7  ^ w15>>>18 ^ w15>>>3  ^ w15<<25 ^ w15<<14 ) + ( w12>>>17 ^ w12>>>19 ^ w12>>>10 ^ w12<<15 ^ w12<<13 ) + w14 + w7 )|0;
                    b = ( w14 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0x06ca6351 )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 31
                    w15 = ( ( w0>>>7  ^ w0>>>18 ^ w0>>>3  ^ w0<<25 ^ w0<<14 ) + ( w13>>>17 ^ w13>>>19 ^ w13>>>10 ^ w13<<15 ^ w13<<13 ) + w15 + w8 )|0;
                    a = ( w15 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0x14292967 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 32
                    w0 = ( ( w1>>>7  ^ w1>>>18 ^ w1>>>3  ^ w1<<25 ^ w1<<14 ) + ( w14>>>17 ^ w14>>>19 ^ w14>>>10 ^ w14<<15 ^ w14<<13 ) + w0 + w9 )|0;
                    h = ( w0 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0x27b70a85 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 33
                    w1 = ( ( w2>>>7  ^ w2>>>18 ^ w2>>>3  ^ w2<<25 ^ w2<<14 ) + ( w15>>>17 ^ w15>>>19 ^ w15>>>10 ^ w15<<15 ^ w15<<13 ) + w1 + w10 )|0;
                    g = ( w1 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0x2e1b2138 )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 34
                    w2 = ( ( w3>>>7  ^ w3>>>18 ^ w3>>>3  ^ w3<<25 ^ w3<<14 ) + ( w0>>>17 ^ w0>>>19 ^ w0>>>10 ^ w0<<15 ^ w0<<13 ) + w2 + w11 )|0;
                    f = ( w2 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0x4d2c6dfc )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 35
                    w3 = ( ( w4>>>7  ^ w4>>>18 ^ w4>>>3  ^ w4<<25 ^ w4<<14 ) + ( w1>>>17 ^ w1>>>19 ^ w1>>>10 ^ w1<<15 ^ w1<<13 ) + w3 + w12 )|0;
                    e = ( w3 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0x53380d13 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 36
                    w4 = ( ( w5>>>7  ^ w5>>>18 ^ w5>>>3  ^ w5<<25 ^ w5<<14 ) + ( w2>>>17 ^ w2>>>19 ^ w2>>>10 ^ w2<<15 ^ w2<<13 ) + w4 + w13 )|0;
                    d = ( w4 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0x650a7354 )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 37
                    w5 = ( ( w6>>>7  ^ w6>>>18 ^ w6>>>3  ^ w6<<25 ^ w6<<14 ) + ( w3>>>17 ^ w3>>>19 ^ w3>>>10 ^ w3<<15 ^ w3<<13 ) + w5 + w14 )|0;
                    c = ( w5 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0x766a0abb )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 38
                    w6 = ( ( w7>>>7  ^ w7>>>18 ^ w7>>>3  ^ w7<<25 ^ w7<<14 ) + ( w4>>>17 ^ w4>>>19 ^ w4>>>10 ^ w4<<15 ^ w4<<13 ) + w6 + w15 )|0;
                    b = ( w6 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0x81c2c92e )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 39
                    w7 = ( ( w8>>>7  ^ w8>>>18 ^ w8>>>3  ^ w8<<25 ^ w8<<14 ) + ( w5>>>17 ^ w5>>>19 ^ w5>>>10 ^ w5<<15 ^ w5<<13 ) + w7 + w0 )|0;
                    a = ( w7 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0x92722c85 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 40
                    w8 = ( ( w9>>>7  ^ w9>>>18 ^ w9>>>3  ^ w9<<25 ^ w9<<14 ) + ( w6>>>17 ^ w6>>>19 ^ w6>>>10 ^ w6<<15 ^ w6<<13 ) + w8 + w1 )|0;
                    h = ( w8 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0xa2bfe8a1 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 41
                    w9 = ( ( w10>>>7  ^ w10>>>18 ^ w10>>>3  ^ w10<<25 ^ w10<<14 ) + ( w7>>>17 ^ w7>>>19 ^ w7>>>10 ^ w7<<15 ^ w7<<13 ) + w9 + w2 )|0;
                    g = ( w9 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0xa81a664b )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 42
                    w10 = ( ( w11>>>7  ^ w11>>>18 ^ w11>>>3  ^ w11<<25 ^ w11<<14 ) + ( w8>>>17 ^ w8>>>19 ^ w8>>>10 ^ w8<<15 ^ w8<<13 ) + w10 + w3 )|0;
                    f = ( w10 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0xc24b8b70 )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 43
                    w11 = ( ( w12>>>7  ^ w12>>>18 ^ w12>>>3  ^ w12<<25 ^ w12<<14 ) + ( w9>>>17 ^ w9>>>19 ^ w9>>>10 ^ w9<<15 ^ w9<<13 ) + w11 + w4 )|0;
                    e = ( w11 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0xc76c51a3 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 44
                    w12 = ( ( w13>>>7  ^ w13>>>18 ^ w13>>>3  ^ w13<<25 ^ w13<<14 ) + ( w10>>>17 ^ w10>>>19 ^ w10>>>10 ^ w10<<15 ^ w10<<13 ) + w12 + w5 )|0;
                    d = ( w12 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0xd192e819 )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 45
                    w13 = ( ( w14>>>7  ^ w14>>>18 ^ w14>>>3  ^ w14<<25 ^ w14<<14 ) + ( w11>>>17 ^ w11>>>19 ^ w11>>>10 ^ w11<<15 ^ w11<<13 ) + w13 + w6 )|0;
                    c = ( w13 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0xd6990624 )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 46
                    w14 = ( ( w15>>>7  ^ w15>>>18 ^ w15>>>3  ^ w15<<25 ^ w15<<14 ) + ( w12>>>17 ^ w12>>>19 ^ w12>>>10 ^ w12<<15 ^ w12<<13 ) + w14 + w7 )|0;
                    b = ( w14 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0xf40e3585 )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 47
                    w15 = ( ( w0>>>7  ^ w0>>>18 ^ w0>>>3  ^ w0<<25 ^ w0<<14 ) + ( w13>>>17 ^ w13>>>19 ^ w13>>>10 ^ w13<<15 ^ w13<<13 ) + w15 + w8 )|0;
                    a = ( w15 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0x106aa070 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 48
                    w0 = ( ( w1>>>7  ^ w1>>>18 ^ w1>>>3  ^ w1<<25 ^ w1<<14 ) + ( w14>>>17 ^ w14>>>19 ^ w14>>>10 ^ w14<<15 ^ w14<<13 ) + w0 + w9 )|0;
                    h = ( w0 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0x19a4c116 )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 49
                    w1 = ( ( w2>>>7  ^ w2>>>18 ^ w2>>>3  ^ w2<<25 ^ w2<<14 ) + ( w15>>>17 ^ w15>>>19 ^ w15>>>10 ^ w15<<15 ^ w15<<13 ) + w1 + w10 )|0;
                    g = ( w1 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0x1e376c08 )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 50
                    w2 = ( ( w3>>>7  ^ w3>>>18 ^ w3>>>3  ^ w3<<25 ^ w3<<14 ) + ( w0>>>17 ^ w0>>>19 ^ w0>>>10 ^ w0<<15 ^ w0<<13 ) + w2 + w11 )|0;
                    f = ( w2 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0x2748774c )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 51
                    w3 = ( ( w4>>>7  ^ w4>>>18 ^ w4>>>3  ^ w4<<25 ^ w4<<14 ) + ( w1>>>17 ^ w1>>>19 ^ w1>>>10 ^ w1<<15 ^ w1<<13 ) + w3 + w12 )|0;
                    e = ( w3 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0x34b0bcb5 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 52
                    w4 = ( ( w5>>>7  ^ w5>>>18 ^ w5>>>3  ^ w5<<25 ^ w5<<14 ) + ( w2>>>17 ^ w2>>>19 ^ w2>>>10 ^ w2<<15 ^ w2<<13 ) + w4 + w13 )|0;
                    d = ( w4 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0x391c0cb3 )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 53
                    w5 = ( ( w6>>>7  ^ w6>>>18 ^ w6>>>3  ^ w6<<25 ^ w6<<14 ) + ( w3>>>17 ^ w3>>>19 ^ w3>>>10 ^ w3<<15 ^ w3<<13 ) + w5 + w14 )|0;
                    c = ( w5 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0x4ed8aa4a )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 54
                    w6 = ( ( w7>>>7  ^ w7>>>18 ^ w7>>>3  ^ w7<<25 ^ w7<<14 ) + ( w4>>>17 ^ w4>>>19 ^ w4>>>10 ^ w4<<15 ^ w4<<13 ) + w6 + w15 )|0;
                    b = ( w6 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0x5b9cca4f )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 55
                    w7 = ( ( w8>>>7  ^ w8>>>18 ^ w8>>>3  ^ w8<<25 ^ w8<<14 ) + ( w5>>>17 ^ w5>>>19 ^ w5>>>10 ^ w5<<15 ^ w5<<13 ) + w7 + w0 )|0;
                    a = ( w7 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0x682e6ff3 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    // 56
                    w8 = ( ( w9>>>7  ^ w9>>>18 ^ w9>>>3  ^ w9<<25 ^ w9<<14 ) + ( w6>>>17 ^ w6>>>19 ^ w6>>>10 ^ w6<<15 ^ w6<<13 ) + w8 + w1 )|0;
                    h = ( w8 + h + ( e>>>6 ^ e>>>11 ^ e>>>25 ^ e<<26 ^ e<<21 ^ e<<7 ) +  ( g ^ e & (f^g) ) + 0x748f82ee )|0;
                    d = ( d + h )|0;
                    h = ( h + ( (a & b) ^ ( c & (a ^ b) ) ) + ( a>>>2 ^ a>>>13 ^ a>>>22 ^ a<<30 ^ a<<19 ^ a<<10 ) )|0;

                    // 57
                    w9 = ( ( w10>>>7  ^ w10>>>18 ^ w10>>>3  ^ w10<<25 ^ w10<<14 ) + ( w7>>>17 ^ w7>>>19 ^ w7>>>10 ^ w7<<15 ^ w7<<13 ) + w9 + w2 )|0;
                    g = ( w9 + g + ( d>>>6 ^ d>>>11 ^ d>>>25 ^ d<<26 ^ d<<21 ^ d<<7 ) +  ( f ^ d & (e^f) ) + 0x78a5636f )|0;
                    c = ( c + g )|0;
                    g = ( g + ( (h & a) ^ ( b & (h ^ a) ) ) + ( h>>>2 ^ h>>>13 ^ h>>>22 ^ h<<30 ^ h<<19 ^ h<<10 ) )|0;

                    // 58
                    w10 = ( ( w11>>>7  ^ w11>>>18 ^ w11>>>3  ^ w11<<25 ^ w11<<14 ) + ( w8>>>17 ^ w8>>>19 ^ w8>>>10 ^ w8<<15 ^ w8<<13 ) + w10 + w3 )|0;
                    f = ( w10 + f + ( c>>>6 ^ c>>>11 ^ c>>>25 ^ c<<26 ^ c<<21 ^ c<<7 ) +  ( e ^ c & (d^e) ) + 0x84c87814 )|0;
                    b = ( b + f )|0;
                    f = ( f + ( (g & h) ^ ( a & (g ^ h) ) ) + ( g>>>2 ^ g>>>13 ^ g>>>22 ^ g<<30 ^ g<<19 ^ g<<10 ) )|0;

                    // 59
                    w11 = ( ( w12>>>7  ^ w12>>>18 ^ w12>>>3  ^ w12<<25 ^ w12<<14 ) + ( w9>>>17 ^ w9>>>19 ^ w9>>>10 ^ w9<<15 ^ w9<<13 ) + w11 + w4 )|0;
                    e = ( w11 + e + ( b>>>6 ^ b>>>11 ^ b>>>25 ^ b<<26 ^ b<<21 ^ b<<7 ) +  ( d ^ b & (c^d) ) + 0x8cc70208 )|0;
                    a = ( a + e )|0;
                    e = ( e + ( (f & g) ^ ( h & (f ^ g) ) ) + ( f>>>2 ^ f>>>13 ^ f>>>22 ^ f<<30 ^ f<<19 ^ f<<10 ) )|0;

                    // 60
                    w12 = ( ( w13>>>7  ^ w13>>>18 ^ w13>>>3  ^ w13<<25 ^ w13<<14 ) + ( w10>>>17 ^ w10>>>19 ^ w10>>>10 ^ w10<<15 ^ w10<<13 ) + w12 + w5 )|0;
                    d = ( w12 + d + ( a>>>6 ^ a>>>11 ^ a>>>25 ^ a<<26 ^ a<<21 ^ a<<7 ) +  ( c ^ a & (b^c) ) + 0x90befffa )|0;
                    h = ( h + d )|0;
                    d = ( d + ( (e & f) ^ ( g & (e ^ f) ) ) + ( e>>>2 ^ e>>>13 ^ e>>>22 ^ e<<30 ^ e<<19 ^ e<<10 ) )|0;

                    // 61
                    w13 = ( ( w14>>>7  ^ w14>>>18 ^ w14>>>3  ^ w14<<25 ^ w14<<14 ) + ( w11>>>17 ^ w11>>>19 ^ w11>>>10 ^ w11<<15 ^ w11<<13 ) + w13 + w6 )|0;
                    c = ( w13 + c + ( h>>>6 ^ h>>>11 ^ h>>>25 ^ h<<26 ^ h<<21 ^ h<<7 ) +  ( b ^ h & (a^b) ) + 0xa4506ceb )|0;
                    g = ( g + c )|0;
                    c = ( c + ( (d & e) ^ ( f & (d ^ e) ) ) + ( d>>>2 ^ d>>>13 ^ d>>>22 ^ d<<30 ^ d<<19 ^ d<<10 ) )|0;

                    // 62
                    w14 = ( ( w15>>>7  ^ w15>>>18 ^ w15>>>3  ^ w15<<25 ^ w15<<14 ) + ( w12>>>17 ^ w12>>>19 ^ w12>>>10 ^ w12<<15 ^ w12<<13 ) + w14 + w7 )|0;
                    b = ( w14 + b + ( g>>>6 ^ g>>>11 ^ g>>>25 ^ g<<26 ^ g<<21 ^ g<<7 ) +  ( a ^ g & (h^a) ) + 0xbef9a3f7 )|0;
                    f = ( f + b )|0;
                    b = ( b + ( (c & d) ^ ( e & (c ^ d) ) ) + ( c>>>2 ^ c>>>13 ^ c>>>22 ^ c<<30 ^ c<<19 ^ c<<10 ) )|0;

                    // 63
                    w15 = ( ( w0>>>7  ^ w0>>>18 ^ w0>>>3  ^ w0<<25 ^ w0<<14 ) + ( w13>>>17 ^ w13>>>19 ^ w13>>>10 ^ w13<<15 ^ w13<<13 ) + w15 + w8 )|0;
                    a = ( w15 + a + ( f>>>6 ^ f>>>11 ^ f>>>25 ^ f<<26 ^ f<<21 ^ f<<7 ) +  ( h ^ f & (g^h) ) + 0xc67178f2 )|0;
                    e = ( e + a )|0;
                    a = ( a + ( (b & c) ^ ( d & (b ^ c) ) ) + ( b>>>2 ^ b>>>13 ^ b>>>22 ^ b<<30 ^ b<<19 ^ b<<10 ) )|0;

                    H0 = ( H0 + a )|0;
                    H1 = ( H1 + b )|0;
                    H2 = ( H2 + c )|0;
                    H3 = ( H3 + d )|0;
                    H4 = ( H4 + e )|0;
                    H5 = ( H5 + f )|0;
                    H6 = ( H6 + g )|0;
                    H7 = ( H7 + h )|0;
                }

                function _core_heap ( offset ) {
                    offset = offset|0;

                    _core(
                        HEAP[offset|0]<<24 | HEAP[offset|1]<<16 | HEAP[offset|2]<<8 | HEAP[offset|3],
                        HEAP[offset|4]<<24 | HEAP[offset|5]<<16 | HEAP[offset|6]<<8 | HEAP[offset|7],
                        HEAP[offset|8]<<24 | HEAP[offset|9]<<16 | HEAP[offset|10]<<8 | HEAP[offset|11],
                        HEAP[offset|12]<<24 | HEAP[offset|13]<<16 | HEAP[offset|14]<<8 | HEAP[offset|15],
                        HEAP[offset|16]<<24 | HEAP[offset|17]<<16 | HEAP[offset|18]<<8 | HEAP[offset|19],
                        HEAP[offset|20]<<24 | HEAP[offset|21]<<16 | HEAP[offset|22]<<8 | HEAP[offset|23],
                        HEAP[offset|24]<<24 | HEAP[offset|25]<<16 | HEAP[offset|26]<<8 | HEAP[offset|27],
                        HEAP[offset|28]<<24 | HEAP[offset|29]<<16 | HEAP[offset|30]<<8 | HEAP[offset|31],
                        HEAP[offset|32]<<24 | HEAP[offset|33]<<16 | HEAP[offset|34]<<8 | HEAP[offset|35],
                        HEAP[offset|36]<<24 | HEAP[offset|37]<<16 | HEAP[offset|38]<<8 | HEAP[offset|39],
                        HEAP[offset|40]<<24 | HEAP[offset|41]<<16 | HEAP[offset|42]<<8 | HEAP[offset|43],
                        HEAP[offset|44]<<24 | HEAP[offset|45]<<16 | HEAP[offset|46]<<8 | HEAP[offset|47],
                        HEAP[offset|48]<<24 | HEAP[offset|49]<<16 | HEAP[offset|50]<<8 | HEAP[offset|51],
                        HEAP[offset|52]<<24 | HEAP[offset|53]<<16 | HEAP[offset|54]<<8 | HEAP[offset|55],
                        HEAP[offset|56]<<24 | HEAP[offset|57]<<16 | HEAP[offset|58]<<8 | HEAP[offset|59],
                        HEAP[offset|60]<<24 | HEAP[offset|61]<<16 | HEAP[offset|62]<<8 | HEAP[offset|63]
                    );
                }

                // offset — multiple of 32
                function _state_to_heap ( output ) {
                    output = output|0;

                    HEAP[output|0] = H0>>>24;
                    HEAP[output|1] = H0>>>16&255;
                    HEAP[output|2] = H0>>>8&255;
                    HEAP[output|3] = H0&255;
                    HEAP[output|4] = H1>>>24;
                    HEAP[output|5] = H1>>>16&255;
                    HEAP[output|6] = H1>>>8&255;
                    HEAP[output|7] = H1&255;
                    HEAP[output|8] = H2>>>24;
                    HEAP[output|9] = H2>>>16&255;
                    HEAP[output|10] = H2>>>8&255;
                    HEAP[output|11] = H2&255;
                    HEAP[output|12] = H3>>>24;
                    HEAP[output|13] = H3>>>16&255;
                    HEAP[output|14] = H3>>>8&255;
                    HEAP[output|15] = H3&255;
                    HEAP[output|16] = H4>>>24;
                    HEAP[output|17] = H4>>>16&255;
                    HEAP[output|18] = H4>>>8&255;
                    HEAP[output|19] = H4&255;
                    HEAP[output|20] = H5>>>24;
                    HEAP[output|21] = H5>>>16&255;
                    HEAP[output|22] = H5>>>8&255;
                    HEAP[output|23] = H5&255;
                    HEAP[output|24] = H6>>>24;
                    HEAP[output|25] = H6>>>16&255;
                    HEAP[output|26] = H6>>>8&255;
                    HEAP[output|27] = H6&255;
                    HEAP[output|28] = H7>>>24;
                    HEAP[output|29] = H7>>>16&255;
                    HEAP[output|30] = H7>>>8&255;
                    HEAP[output|31] = H7&255;
                }

                function reset () {
                    H0 = 0x6a09e667;
                    H1 = 0xbb67ae85;
                    H2 = 0x3c6ef372;
                    H3 = 0xa54ff53a;
                    H4 = 0x510e527f;
                    H5 = 0x9b05688c;
                    H6 = 0x1f83d9ab;
                    H7 = 0x5be0cd19;
                    TOTAL0 = TOTAL1 = 0;
                }

                function init ( h0, h1, h2, h3, h4, h5, h6, h7, total0, total1 ) {
                    h0 = h0|0;
                    h1 = h1|0;
                    h2 = h2|0;
                    h3 = h3|0;
                    h4 = h4|0;
                    h5 = h5|0;
                    h6 = h6|0;
                    h7 = h7|0;
                    total0 = total0|0;
                    total1 = total1|0;

                    H0 = h0;
                    H1 = h1;
                    H2 = h2;
                    H3 = h3;
                    H4 = h4;
                    H5 = h5;
                    H6 = h6;
                    H7 = h7;
                    TOTAL0 = total0;
                    TOTAL1 = total1;
                }

                // offset — multiple of 64
                function process ( offset, length ) {
                    offset = offset|0;
                    length = length|0;

                    var hashed = 0;

                    if ( offset & 63 )
                        return -1;

                    while ( (length|0) >= 64 ) {
                        _core_heap(offset);

                        offset = ( offset + 64 )|0;
                        length = ( length - 64 )|0;

                        hashed = ( hashed + 64 )|0;
                    }

                    TOTAL0 = ( TOTAL0 + hashed )|0;
                    if ( TOTAL0>>>0 < hashed>>>0 ) TOTAL1 = ( TOTAL1 + 1 )|0;

                    return hashed|0;
                }

                // offset — multiple of 64
                // output — multiple of 32
                function finish ( offset, length, output ) {
                    offset = offset|0;
                    length = length|0;
                    output = output|0;

                    var hashed = 0,
                        i = 0;

                    if ( offset & 63 )
                        return -1;

                    if ( ~output )
                        if ( output & 31 )
                            return -1;

                    if ( (length|0) >= 64 ) {
                        hashed = process( offset, length )|0;
                        if ( (hashed|0) == -1 )
                            return -1;

                        offset = ( offset + hashed )|0;
                        length = ( length - hashed )|0;
                    }

                    hashed = ( hashed + length )|0;
                    TOTAL0 = ( TOTAL0 + length )|0;
                    if ( TOTAL0>>>0 < length>>>0 ) TOTAL1 = ( TOTAL1 + 1 )|0;

                    HEAP[offset|length] = 0x80;

                    if ( (length|0) >= 56 ) {
                        for ( i = (length+1)|0; (i|0) < 64; i = (i+1)|0 )
                            HEAP[offset|i] = 0x00;

                        _core_heap(offset);

                        length = 0;

                        HEAP[offset|0] = 0;
                    }

                    for ( i = (length+1)|0; (i|0) < 59; i = (i+1)|0 )
                        HEAP[offset|i] = 0;

                    HEAP[offset|56] = TOTAL1>>>21&255;
                    HEAP[offset|57] = TOTAL1>>>13&255;
                    HEAP[offset|58] = TOTAL1>>>5&255;
                    HEAP[offset|59] = TOTAL1<<3&255 | TOTAL0>>>29;
                    HEAP[offset|60] = TOTAL0>>>21&255;
                    HEAP[offset|61] = TOTAL0>>>13&255;
                    HEAP[offset|62] = TOTAL0>>>5&255;
                    HEAP[offset|63] = TOTAL0<<3&255;
                    _core_heap(offset);

                    if ( ~output )
                        _state_to_heap(output);

                    return hashed|0;
                }

                function hmac_reset () {
                    H0 = I0;
                    H1 = I1;
                    H2 = I2;
                    H3 = I3;
                    H4 = I4;
                    H5 = I5;
                    H6 = I6;
                    H7 = I7;
                    TOTAL0 = 64;
                    TOTAL1 = 0;
                }

                function _hmac_opad () {
                    H0 = O0;
                    H1 = O1;
                    H2 = O2;
                    H3 = O3;
                    H4 = O4;
                    H5 = O5;
                    H6 = O6;
                    H7 = O7;
                    TOTAL0 = 64;
                    TOTAL1 = 0;
                }

                function hmac_init ( p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15 ) {
                    p0 = p0|0;
                    p1 = p1|0;
                    p2 = p2|0;
                    p3 = p3|0;
                    p4 = p4|0;
                    p5 = p5|0;
                    p6 = p6|0;
                    p7 = p7|0;
                    p8 = p8|0;
                    p9 = p9|0;
                    p10 = p10|0;
                    p11 = p11|0;
                    p12 = p12|0;
                    p13 = p13|0;
                    p14 = p14|0;
                    p15 = p15|0;

                    // opad
                    reset();
                    _core(
                        p0 ^ 0x5c5c5c5c,
                        p1 ^ 0x5c5c5c5c,
                        p2 ^ 0x5c5c5c5c,
                        p3 ^ 0x5c5c5c5c,
                        p4 ^ 0x5c5c5c5c,
                        p5 ^ 0x5c5c5c5c,
                        p6 ^ 0x5c5c5c5c,
                        p7 ^ 0x5c5c5c5c,
                        p8 ^ 0x5c5c5c5c,
                        p9 ^ 0x5c5c5c5c,
                        p10 ^ 0x5c5c5c5c,
                        p11 ^ 0x5c5c5c5c,
                        p12 ^ 0x5c5c5c5c,
                        p13 ^ 0x5c5c5c5c,
                        p14 ^ 0x5c5c5c5c,
                        p15 ^ 0x5c5c5c5c
                    );
                    O0 = H0;
                    O1 = H1;
                    O2 = H2;
                    O3 = H3;
                    O4 = H4;
                    O5 = H5;
                    O6 = H6;
                    O7 = H7;

                    // ipad
                    reset();
                    _core(
                        p0 ^ 0x36363636,
                        p1 ^ 0x36363636,
                        p2 ^ 0x36363636,
                        p3 ^ 0x36363636,
                        p4 ^ 0x36363636,
                        p5 ^ 0x36363636,
                        p6 ^ 0x36363636,
                        p7 ^ 0x36363636,
                        p8 ^ 0x36363636,
                        p9 ^ 0x36363636,
                        p10 ^ 0x36363636,
                        p11 ^ 0x36363636,
                        p12 ^ 0x36363636,
                        p13 ^ 0x36363636,
                        p14 ^ 0x36363636,
                        p15 ^ 0x36363636
                    );
                    I0 = H0;
                    I1 = H1;
                    I2 = H2;
                    I3 = H3;
                    I4 = H4;
                    I5 = H5;
                    I6 = H6;
                    I7 = H7;

                    TOTAL0 = 64;
                    TOTAL1 = 0;
                }

                // offset — multiple of 64
                // output — multiple of 32
                function hmac_finish ( offset, length, output ) {
                    offset = offset|0;
                    length = length|0;
                    output = output|0;

                    var t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0,
                        hashed = 0;

                    if ( offset & 63 )
                        return -1;

                    if ( ~output )
                        if ( output & 31 )
                            return -1;

                    hashed = finish( offset, length, -1 )|0;
                    t0 = H0, t1 = H1, t2 = H2, t3 = H3, t4 = H4, t5 = H5, t6 = H6, t7 = H7;

                    _hmac_opad();
                    _core( t0, t1, t2, t3, t4, t5, t6, t7, 0x80000000, 0, 0, 0, 0, 0, 0, 768 );

                    if ( ~output )
                        _state_to_heap(output);

                    return hashed|0;
                }

                // salt is assumed to be already processed
                // offset — multiple of 64
                // output — multiple of 32
                function pbkdf2_generate_block ( offset, length, block, count, output ) {
                    offset = offset|0;
                    length = length|0;
                    block = block|0;
                    count = count|0;
                    output = output|0;

                    var h0 = 0, h1 = 0, h2 = 0, h3 = 0, h4 = 0, h5 = 0, h6 = 0, h7 = 0,
                        t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0;

                    if ( offset & 63 )
                        return -1;

                    if ( ~output )
                        if ( output & 31 )
                            return -1;

                    // pad block number into heap
                    // FIXME probable OOB write
                    HEAP[(offset+length)|0]   = block>>>24;
                    HEAP[(offset+length+1)|0] = block>>>16&255;
                    HEAP[(offset+length+2)|0] = block>>>8&255;
                    HEAP[(offset+length+3)|0] = block&255;

                    // finish first iteration
                    hmac_finish( offset, (length+4)|0, -1 )|0;
                    h0 = t0 = H0, h1 = t1 = H1, h2 = t2 = H2, h3 = t3 = H3, h4 = t4 = H4, h5 = t5 = H5, h6 = t6 = H6, h7 = t7 = H7;
                    count = (count-1)|0;

                    // perform the rest iterations
                    while ( (count|0) > 0 ) {
                        hmac_reset();
                        _core( t0, t1, t2, t3, t4, t5, t6, t7, 0x80000000, 0, 0, 0, 0, 0, 0, 768 );
                        t0 = H0, t1 = H1, t2 = H2, t3 = H3, t4 = H4, t5 = H5, t6 = H6, t7 = H7;

                        _hmac_opad();
                        _core( t0, t1, t2, t3, t4, t5, t6, t7, 0x80000000, 0, 0, 0, 0, 0, 0, 768 );
                        t0 = H0, t1 = H1, t2 = H2, t3 = H3, t4 = H4, t5 = H5, t6 = H6, t7 = H7;

                        h0 = h0 ^ H0;
                        h1 = h1 ^ H1;
                        h2 = h2 ^ H2;
                        h3 = h3 ^ H3;
                        h4 = h4 ^ H4;
                        h5 = h5 ^ H5;
                        h6 = h6 ^ H6;
                        h7 = h7 ^ H7;

                        count = (count-1)|0;
                    }

                    H0 = h0;
                    H1 = h1;
                    H2 = h2;
                    H3 = h3;
                    H4 = h4;
                    H5 = h5;
                    H6 = h6;
                    H7 = h7;

                    if ( ~output )
                        _state_to_heap(output);

                    return 0;
                }

                return {
                  // SHA256
                  reset: reset,
                  init: init,
                  process: process,
                  finish: finish,

                  // HMAC-SHA256
                  hmac_reset: hmac_reset,
                  hmac_init: hmac_init,
                  hmac_finish: hmac_finish,

                  // PBKDF2-HMAC-SHA256
                  pbkdf2_generate_block: pbkdf2_generate_block
                }
            };

            const _sha256_block_size = 64;
            const _sha256_hash_size = 32;
            class Sha256 extends Hash {
                constructor() {
                    super();
                    this.NAME = 'sha256';
                    this.BLOCK_SIZE = _sha256_block_size;
                    this.HASH_SIZE = _sha256_hash_size;
                    this.heap = _heap_init();
                    this.asm = sha256_asm({ Uint8Array: Uint8Array }, null, this.heap.buffer);
                    this.reset();
                }
            }
            Sha256.NAME = 'sha256';

            var sha512_asm = function ( stdlib, foreign, buffer ) {
                "use asm";

                // SHA512 state
                var H0h = 0, H0l = 0, H1h = 0, H1l = 0, H2h = 0, H2l = 0, H3h = 0, H3l = 0,
                    H4h = 0, H4l = 0, H5h = 0, H5l = 0, H6h = 0, H6l = 0, H7h = 0, H7l = 0,
                    TOTAL0 = 0, TOTAL1 = 0;

                // HMAC state
                var I0h = 0, I0l = 0, I1h = 0, I1l = 0, I2h = 0, I2l = 0, I3h = 0, I3l = 0,
                    I4h = 0, I4l = 0, I5h = 0, I5l = 0, I6h = 0, I6l = 0, I7h = 0, I7l = 0,
                    O0h = 0, O0l = 0, O1h = 0, O1l = 0, O2h = 0, O2l = 0, O3h = 0, O3l = 0,
                    O4h = 0, O4l = 0, O5h = 0, O5l = 0, O6h = 0, O6l = 0, O7h = 0, O7l = 0;

                // I/O buffer
                var HEAP = new stdlib.Uint8Array(buffer);

                function _core ( w0h, w0l, w1h, w1l, w2h, w2l, w3h, w3l, w4h, w4l, w5h, w5l, w6h, w6l, w7h, w7l, w8h, w8l, w9h, w9l, w10h, w10l, w11h, w11l, w12h, w12l, w13h, w13l, w14h, w14l, w15h, w15l ) {
                    w0h = w0h|0;
                    w0l = w0l|0;
                    w1h = w1h|0;
                    w1l = w1l|0;
                    w2h = w2h|0;
                    w2l = w2l|0;
                    w3h = w3h|0;
                    w3l = w3l|0;
                    w4h = w4h|0;
                    w4l = w4l|0;
                    w5h = w5h|0;
                    w5l = w5l|0;
                    w6h = w6h|0;
                    w6l = w6l|0;
                    w7h = w7h|0;
                    w7l = w7l|0;
                    w8h = w8h|0;
                    w8l = w8l|0;
                    w9h = w9h|0;
                    w9l = w9l|0;
                    w10h = w10h|0;
                    w10l = w10l|0;
                    w11h = w11h|0;
                    w11l = w11l|0;
                    w12h = w12h|0;
                    w12l = w12l|0;
                    w13h = w13h|0;
                    w13l = w13l|0;
                    w14h = w14h|0;
                    w14l = w14l|0;
                    w15h = w15h|0;
                    w15l = w15l|0;

                    var ah = 0, al = 0, bh = 0, bl = 0, ch = 0, cl = 0, dh = 0, dl = 0, eh = 0, el = 0, fh = 0, fl = 0, gh = 0, gl = 0, hh = 0, hl = 0,
                        th = 0, tl = 0, xl = 0;

                    ah = H0h;
                    al = H0l;
                    bh = H1h;
                    bl = H1l;
                    ch = H2h;
                    cl = H2l;
                    dh = H3h;
                    dl = H3l;
                    eh = H4h;
                    el = H4l;
                    fh = H5h;
                    fl = H5l;
                    gh = H6h;
                    gl = H6l;
                    hh = H7h;
                    hl = H7l;

                    // 0
                    tl = ( 0xd728ae22 + w0l )|0;
                    th = ( 0x428a2f98 + w0h + ((tl >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 1
                    tl = ( 0x23ef65cd + w1l )|0;
                    th = ( 0x71374491 + w1h + ((tl >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 2
                    tl = ( 0xec4d3b2f + w2l )|0;
                    th = ( 0xb5c0fbcf + w2h + ((tl >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 3
                    tl = ( 0x8189dbbc + w3l )|0;
                    th = ( 0xe9b5dba5 + w3h + ((tl >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 4
                    tl = ( 0xf348b538 + w4l )|0;
                    th = ( 0x3956c25b + w4h + ((tl >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 5
                    tl = ( 0xb605d019 + w5l )|0;
                    th = ( 0x59f111f1 + w5h + ((tl >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 6
                    tl = ( 0xaf194f9b + w6l )|0;
                    th = ( 0x923f82a4 + w6h + ((tl >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 7
                    tl = ( 0xda6d8118 + w7l )|0;
                    th = ( 0xab1c5ed5 + w7h + ((tl >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 8
                    tl = ( 0xa3030242 + w8l )|0;
                    th = ( 0xd807aa98 + w8h + ((tl >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 9
                    tl = ( 0x45706fbe + w9l )|0;
                    th = ( 0x12835b01 + w9h + ((tl >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 10
                    tl = ( 0x4ee4b28c + w10l )|0;
                    th = ( 0x243185be + w10h + ((tl >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 11
                    tl = ( 0xd5ffb4e2 + w11l )|0;
                    th = ( 0x550c7dc3 + w11h + ((tl >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 12
                    tl = ( 0xf27b896f + w12l )|0;
                    th = ( 0x72be5d74 + w12h + ((tl >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 13
                    tl = ( 0x3b1696b1 + w13l )|0;
                    th = ( 0x80deb1fe + w13h + ((tl >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 14
                    tl = ( 0x25c71235 + w14l )|0;
                    th = ( 0x9bdc06a7 + w14h + ((tl >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 15
                    tl = ( 0xcf692694 + w15l )|0;
                    th = ( 0xc19bf174 + w15h + ((tl >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 16
                    w0l = ( w0l + w9l )|0;
                    w0h = ( w0h + w9h + ((w0l >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 1) | (w1h << 31)) ^ ((w1l >>> 8) | (w1h << 24)) ^ ((w1l >>> 7) | (w1h << 25)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w1h >>> 1) | (w1l << 31)) ^ ((w1h >>> 8) | (w1l << 24)) ^ (w1h >>> 7) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 19) | (w14h << 13)) ^ ((w14l << 3) | (w14h >>> 29)) ^ ((w14l >>> 6) | (w14h << 26)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w14h >>> 19) | (w14l << 13)) ^ ((w14h << 3) | (w14l >>> 29)) ^ (w14h >>> 6) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x9ef14ad2 + w0l )|0;
                    th = ( 0xe49b69c1 + w0h + ((tl >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 17
                    w1l = ( w1l + w10l )|0;
                    w1h = ( w1h + w10h + ((w1l >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 1) | (w2h << 31)) ^ ((w2l >>> 8) | (w2h << 24)) ^ ((w2l >>> 7) | (w2h << 25)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w2h >>> 1) | (w2l << 31)) ^ ((w2h >>> 8) | (w2l << 24)) ^ (w2h >>> 7) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 19) | (w15h << 13)) ^ ((w15l << 3) | (w15h >>> 29)) ^ ((w15l >>> 6) | (w15h << 26)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w15h >>> 19) | (w15l << 13)) ^ ((w15h << 3) | (w15l >>> 29)) ^ (w15h >>> 6) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x384f25e3 + w1l )|0;
                    th = ( 0xefbe4786 + w1h + ((tl >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 18
                    w2l = ( w2l + w11l )|0;
                    w2h = ( w2h + w11h + ((w2l >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 1) | (w3h << 31)) ^ ((w3l >>> 8) | (w3h << 24)) ^ ((w3l >>> 7) | (w3h << 25)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w3h >>> 1) | (w3l << 31)) ^ ((w3h >>> 8) | (w3l << 24)) ^ (w3h >>> 7) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 19) | (w0h << 13)) ^ ((w0l << 3) | (w0h >>> 29)) ^ ((w0l >>> 6) | (w0h << 26)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w0h >>> 19) | (w0l << 13)) ^ ((w0h << 3) | (w0l >>> 29)) ^ (w0h >>> 6) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x8b8cd5b5 + w2l )|0;
                    th = ( 0xfc19dc6 + w2h + ((tl >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 19
                    w3l = ( w3l + w12l )|0;
                    w3h = ( w3h + w12h + ((w3l >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 1) | (w4h << 31)) ^ ((w4l >>> 8) | (w4h << 24)) ^ ((w4l >>> 7) | (w4h << 25)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w4h >>> 1) | (w4l << 31)) ^ ((w4h >>> 8) | (w4l << 24)) ^ (w4h >>> 7) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 19) | (w1h << 13)) ^ ((w1l << 3) | (w1h >>> 29)) ^ ((w1l >>> 6) | (w1h << 26)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w1h >>> 19) | (w1l << 13)) ^ ((w1h << 3) | (w1l >>> 29)) ^ (w1h >>> 6) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x77ac9c65 + w3l )|0;
                    th = ( 0x240ca1cc + w3h + ((tl >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 20
                    w4l = ( w4l + w13l )|0;
                    w4h = ( w4h + w13h + ((w4l >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 1) | (w5h << 31)) ^ ((w5l >>> 8) | (w5h << 24)) ^ ((w5l >>> 7) | (w5h << 25)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w5h >>> 1) | (w5l << 31)) ^ ((w5h >>> 8) | (w5l << 24)) ^ (w5h >>> 7) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 19) | (w2h << 13)) ^ ((w2l << 3) | (w2h >>> 29)) ^ ((w2l >>> 6) | (w2h << 26)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w2h >>> 19) | (w2l << 13)) ^ ((w2h << 3) | (w2l >>> 29)) ^ (w2h >>> 6) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x592b0275 + w4l )|0;
                    th = ( 0x2de92c6f + w4h + ((tl >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 21
                    w5l = ( w5l + w14l )|0;
                    w5h = ( w5h + w14h + ((w5l >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 1) | (w6h << 31)) ^ ((w6l >>> 8) | (w6h << 24)) ^ ((w6l >>> 7) | (w6h << 25)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w6h >>> 1) | (w6l << 31)) ^ ((w6h >>> 8) | (w6l << 24)) ^ (w6h >>> 7) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 19) | (w3h << 13)) ^ ((w3l << 3) | (w3h >>> 29)) ^ ((w3l >>> 6) | (w3h << 26)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w3h >>> 19) | (w3l << 13)) ^ ((w3h << 3) | (w3l >>> 29)) ^ (w3h >>> 6) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x6ea6e483 + w5l )|0;
                    th = ( 0x4a7484aa + w5h + ((tl >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 22
                    w6l = ( w6l + w15l )|0;
                    w6h = ( w6h + w15h + ((w6l >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 1) | (w7h << 31)) ^ ((w7l >>> 8) | (w7h << 24)) ^ ((w7l >>> 7) | (w7h << 25)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w7h >>> 1) | (w7l << 31)) ^ ((w7h >>> 8) | (w7l << 24)) ^ (w7h >>> 7) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 19) | (w4h << 13)) ^ ((w4l << 3) | (w4h >>> 29)) ^ ((w4l >>> 6) | (w4h << 26)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w4h >>> 19) | (w4l << 13)) ^ ((w4h << 3) | (w4l >>> 29)) ^ (w4h >>> 6) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xbd41fbd4 + w6l )|0;
                    th = ( 0x5cb0a9dc + w6h + ((tl >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 23
                    w7l = ( w7l + w0l )|0;
                    w7h = ( w7h + w0h + ((w7l >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 1) | (w8h << 31)) ^ ((w8l >>> 8) | (w8h << 24)) ^ ((w8l >>> 7) | (w8h << 25)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w8h >>> 1) | (w8l << 31)) ^ ((w8h >>> 8) | (w8l << 24)) ^ (w8h >>> 7) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 19) | (w5h << 13)) ^ ((w5l << 3) | (w5h >>> 29)) ^ ((w5l >>> 6) | (w5h << 26)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w5h >>> 19) | (w5l << 13)) ^ ((w5h << 3) | (w5l >>> 29)) ^ (w5h >>> 6) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x831153b5 + w7l )|0;
                    th = ( 0x76f988da + w7h + ((tl >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 24
                    w8l = ( w8l + w1l )|0;
                    w8h = ( w8h + w1h + ((w8l >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 1) | (w9h << 31)) ^ ((w9l >>> 8) | (w9h << 24)) ^ ((w9l >>> 7) | (w9h << 25)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w9h >>> 1) | (w9l << 31)) ^ ((w9h >>> 8) | (w9l << 24)) ^ (w9h >>> 7) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 19) | (w6h << 13)) ^ ((w6l << 3) | (w6h >>> 29)) ^ ((w6l >>> 6) | (w6h << 26)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w6h >>> 19) | (w6l << 13)) ^ ((w6h << 3) | (w6l >>> 29)) ^ (w6h >>> 6) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xee66dfab + w8l )|0;
                    th = ( 0x983e5152 + w8h + ((tl >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 25
                    w9l = ( w9l + w2l )|0;
                    w9h = ( w9h + w2h + ((w9l >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 1) | (w10h << 31)) ^ ((w10l >>> 8) | (w10h << 24)) ^ ((w10l >>> 7) | (w10h << 25)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w10h >>> 1) | (w10l << 31)) ^ ((w10h >>> 8) | (w10l << 24)) ^ (w10h >>> 7) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 19) | (w7h << 13)) ^ ((w7l << 3) | (w7h >>> 29)) ^ ((w7l >>> 6) | (w7h << 26)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w7h >>> 19) | (w7l << 13)) ^ ((w7h << 3) | (w7l >>> 29)) ^ (w7h >>> 6) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x2db43210 + w9l )|0;
                    th = ( 0xa831c66d + w9h + ((tl >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 26
                    w10l = ( w10l + w3l )|0;
                    w10h = ( w10h + w3h + ((w10l >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 1) | (w11h << 31)) ^ ((w11l >>> 8) | (w11h << 24)) ^ ((w11l >>> 7) | (w11h << 25)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w11h >>> 1) | (w11l << 31)) ^ ((w11h >>> 8) | (w11l << 24)) ^ (w11h >>> 7) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 19) | (w8h << 13)) ^ ((w8l << 3) | (w8h >>> 29)) ^ ((w8l >>> 6) | (w8h << 26)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w8h >>> 19) | (w8l << 13)) ^ ((w8h << 3) | (w8l >>> 29)) ^ (w8h >>> 6) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x98fb213f + w10l )|0;
                    th = ( 0xb00327c8 + w10h + ((tl >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 27
                    w11l = ( w11l + w4l )|0;
                    w11h = ( w11h + w4h + ((w11l >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 1) | (w12h << 31)) ^ ((w12l >>> 8) | (w12h << 24)) ^ ((w12l >>> 7) | (w12h << 25)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w12h >>> 1) | (w12l << 31)) ^ ((w12h >>> 8) | (w12l << 24)) ^ (w12h >>> 7) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 19) | (w9h << 13)) ^ ((w9l << 3) | (w9h >>> 29)) ^ ((w9l >>> 6) | (w9h << 26)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w9h >>> 19) | (w9l << 13)) ^ ((w9h << 3) | (w9l >>> 29)) ^ (w9h >>> 6) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xbeef0ee4 + w11l )|0;
                    th = ( 0xbf597fc7 + w11h + ((tl >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 28
                    w12l = ( w12l + w5l )|0;
                    w12h = ( w12h + w5h + ((w12l >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 1) | (w13h << 31)) ^ ((w13l >>> 8) | (w13h << 24)) ^ ((w13l >>> 7) | (w13h << 25)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w13h >>> 1) | (w13l << 31)) ^ ((w13h >>> 8) | (w13l << 24)) ^ (w13h >>> 7) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 19) | (w10h << 13)) ^ ((w10l << 3) | (w10h >>> 29)) ^ ((w10l >>> 6) | (w10h << 26)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w10h >>> 19) | (w10l << 13)) ^ ((w10h << 3) | (w10l >>> 29)) ^ (w10h >>> 6) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x3da88fc2 + w12l )|0;
                    th = ( 0xc6e00bf3 + w12h + ((tl >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 29
                    w13l = ( w13l + w6l )|0;
                    w13h = ( w13h + w6h + ((w13l >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 1) | (w14h << 31)) ^ ((w14l >>> 8) | (w14h << 24)) ^ ((w14l >>> 7) | (w14h << 25)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w14h >>> 1) | (w14l << 31)) ^ ((w14h >>> 8) | (w14l << 24)) ^ (w14h >>> 7) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 19) | (w11h << 13)) ^ ((w11l << 3) | (w11h >>> 29)) ^ ((w11l >>> 6) | (w11h << 26)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w11h >>> 19) | (w11l << 13)) ^ ((w11h << 3) | (w11l >>> 29)) ^ (w11h >>> 6) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x930aa725 + w13l )|0;
                    th = ( 0xd5a79147 + w13h + ((tl >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 30
                    w14l = ( w14l + w7l )|0;
                    w14h = ( w14h + w7h + ((w14l >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 1) | (w15h << 31)) ^ ((w15l >>> 8) | (w15h << 24)) ^ ((w15l >>> 7) | (w15h << 25)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w15h >>> 1) | (w15l << 31)) ^ ((w15h >>> 8) | (w15l << 24)) ^ (w15h >>> 7) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 19) | (w12h << 13)) ^ ((w12l << 3) | (w12h >>> 29)) ^ ((w12l >>> 6) | (w12h << 26)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w12h >>> 19) | (w12l << 13)) ^ ((w12h << 3) | (w12l >>> 29)) ^ (w12h >>> 6) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xe003826f + w14l )|0;
                    th = ( 0x6ca6351 + w14h + ((tl >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 31
                    w15l = ( w15l + w8l )|0;
                    w15h = ( w15h + w8h + ((w15l >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 1) | (w0h << 31)) ^ ((w0l >>> 8) | (w0h << 24)) ^ ((w0l >>> 7) | (w0h << 25)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w0h >>> 1) | (w0l << 31)) ^ ((w0h >>> 8) | (w0l << 24)) ^ (w0h >>> 7) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 19) | (w13h << 13)) ^ ((w13l << 3) | (w13h >>> 29)) ^ ((w13l >>> 6) | (w13h << 26)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w13h >>> 19) | (w13l << 13)) ^ ((w13h << 3) | (w13l >>> 29)) ^ (w13h >>> 6) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xa0e6e70 + w15l )|0;
                    th = ( 0x14292967 + w15h + ((tl >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 32
                    w0l = ( w0l + w9l )|0;
                    w0h = ( w0h + w9h + ((w0l >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 1) | (w1h << 31)) ^ ((w1l >>> 8) | (w1h << 24)) ^ ((w1l >>> 7) | (w1h << 25)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w1h >>> 1) | (w1l << 31)) ^ ((w1h >>> 8) | (w1l << 24)) ^ (w1h >>> 7) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 19) | (w14h << 13)) ^ ((w14l << 3) | (w14h >>> 29)) ^ ((w14l >>> 6) | (w14h << 26)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w14h >>> 19) | (w14l << 13)) ^ ((w14h << 3) | (w14l >>> 29)) ^ (w14h >>> 6) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x46d22ffc + w0l )|0;
                    th = ( 0x27b70a85 + w0h + ((tl >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 33
                    w1l = ( w1l + w10l )|0;
                    w1h = ( w1h + w10h + ((w1l >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 1) | (w2h << 31)) ^ ((w2l >>> 8) | (w2h << 24)) ^ ((w2l >>> 7) | (w2h << 25)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w2h >>> 1) | (w2l << 31)) ^ ((w2h >>> 8) | (w2l << 24)) ^ (w2h >>> 7) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 19) | (w15h << 13)) ^ ((w15l << 3) | (w15h >>> 29)) ^ ((w15l >>> 6) | (w15h << 26)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w15h >>> 19) | (w15l << 13)) ^ ((w15h << 3) | (w15l >>> 29)) ^ (w15h >>> 6) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x5c26c926 + w1l )|0;
                    th = ( 0x2e1b2138 + w1h + ((tl >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 34
                    w2l = ( w2l + w11l )|0;
                    w2h = ( w2h + w11h + ((w2l >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 1) | (w3h << 31)) ^ ((w3l >>> 8) | (w3h << 24)) ^ ((w3l >>> 7) | (w3h << 25)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w3h >>> 1) | (w3l << 31)) ^ ((w3h >>> 8) | (w3l << 24)) ^ (w3h >>> 7) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 19) | (w0h << 13)) ^ ((w0l << 3) | (w0h >>> 29)) ^ ((w0l >>> 6) | (w0h << 26)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w0h >>> 19) | (w0l << 13)) ^ ((w0h << 3) | (w0l >>> 29)) ^ (w0h >>> 6) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x5ac42aed + w2l )|0;
                    th = ( 0x4d2c6dfc + w2h + ((tl >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 35
                    w3l = ( w3l + w12l )|0;
                    w3h = ( w3h + w12h + ((w3l >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 1) | (w4h << 31)) ^ ((w4l >>> 8) | (w4h << 24)) ^ ((w4l >>> 7) | (w4h << 25)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w4h >>> 1) | (w4l << 31)) ^ ((w4h >>> 8) | (w4l << 24)) ^ (w4h >>> 7) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 19) | (w1h << 13)) ^ ((w1l << 3) | (w1h >>> 29)) ^ ((w1l >>> 6) | (w1h << 26)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w1h >>> 19) | (w1l << 13)) ^ ((w1h << 3) | (w1l >>> 29)) ^ (w1h >>> 6) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x9d95b3df + w3l )|0;
                    th = ( 0x53380d13 + w3h + ((tl >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 36
                    w4l = ( w4l + w13l )|0;
                    w4h = ( w4h + w13h + ((w4l >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 1) | (w5h << 31)) ^ ((w5l >>> 8) | (w5h << 24)) ^ ((w5l >>> 7) | (w5h << 25)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w5h >>> 1) | (w5l << 31)) ^ ((w5h >>> 8) | (w5l << 24)) ^ (w5h >>> 7) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 19) | (w2h << 13)) ^ ((w2l << 3) | (w2h >>> 29)) ^ ((w2l >>> 6) | (w2h << 26)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w2h >>> 19) | (w2l << 13)) ^ ((w2h << 3) | (w2l >>> 29)) ^ (w2h >>> 6) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x8baf63de + w4l )|0;
                    th = ( 0x650a7354 + w4h + ((tl >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 37
                    w5l = ( w5l + w14l )|0;
                    w5h = ( w5h + w14h + ((w5l >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 1) | (w6h << 31)) ^ ((w6l >>> 8) | (w6h << 24)) ^ ((w6l >>> 7) | (w6h << 25)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w6h >>> 1) | (w6l << 31)) ^ ((w6h >>> 8) | (w6l << 24)) ^ (w6h >>> 7) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 19) | (w3h << 13)) ^ ((w3l << 3) | (w3h >>> 29)) ^ ((w3l >>> 6) | (w3h << 26)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w3h >>> 19) | (w3l << 13)) ^ ((w3h << 3) | (w3l >>> 29)) ^ (w3h >>> 6) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x3c77b2a8 + w5l )|0;
                    th = ( 0x766a0abb + w5h + ((tl >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 38
                    w6l = ( w6l + w15l )|0;
                    w6h = ( w6h + w15h + ((w6l >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 1) | (w7h << 31)) ^ ((w7l >>> 8) | (w7h << 24)) ^ ((w7l >>> 7) | (w7h << 25)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w7h >>> 1) | (w7l << 31)) ^ ((w7h >>> 8) | (w7l << 24)) ^ (w7h >>> 7) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 19) | (w4h << 13)) ^ ((w4l << 3) | (w4h >>> 29)) ^ ((w4l >>> 6) | (w4h << 26)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w4h >>> 19) | (w4l << 13)) ^ ((w4h << 3) | (w4l >>> 29)) ^ (w4h >>> 6) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x47edaee6 + w6l )|0;
                    th = ( 0x81c2c92e + w6h + ((tl >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 39
                    w7l = ( w7l + w0l )|0;
                    w7h = ( w7h + w0h + ((w7l >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 1) | (w8h << 31)) ^ ((w8l >>> 8) | (w8h << 24)) ^ ((w8l >>> 7) | (w8h << 25)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w8h >>> 1) | (w8l << 31)) ^ ((w8h >>> 8) | (w8l << 24)) ^ (w8h >>> 7) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 19) | (w5h << 13)) ^ ((w5l << 3) | (w5h >>> 29)) ^ ((w5l >>> 6) | (w5h << 26)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w5h >>> 19) | (w5l << 13)) ^ ((w5h << 3) | (w5l >>> 29)) ^ (w5h >>> 6) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x1482353b + w7l )|0;
                    th = ( 0x92722c85 + w7h + ((tl >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 40
                    w8l = ( w8l + w1l )|0;
                    w8h = ( w8h + w1h + ((w8l >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 1) | (w9h << 31)) ^ ((w9l >>> 8) | (w9h << 24)) ^ ((w9l >>> 7) | (w9h << 25)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w9h >>> 1) | (w9l << 31)) ^ ((w9h >>> 8) | (w9l << 24)) ^ (w9h >>> 7) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 19) | (w6h << 13)) ^ ((w6l << 3) | (w6h >>> 29)) ^ ((w6l >>> 6) | (w6h << 26)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w6h >>> 19) | (w6l << 13)) ^ ((w6h << 3) | (w6l >>> 29)) ^ (w6h >>> 6) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x4cf10364 + w8l )|0;
                    th = ( 0xa2bfe8a1 + w8h + ((tl >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 41
                    w9l = ( w9l + w2l )|0;
                    w9h = ( w9h + w2h + ((w9l >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 1) | (w10h << 31)) ^ ((w10l >>> 8) | (w10h << 24)) ^ ((w10l >>> 7) | (w10h << 25)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w10h >>> 1) | (w10l << 31)) ^ ((w10h >>> 8) | (w10l << 24)) ^ (w10h >>> 7) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 19) | (w7h << 13)) ^ ((w7l << 3) | (w7h >>> 29)) ^ ((w7l >>> 6) | (w7h << 26)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w7h >>> 19) | (w7l << 13)) ^ ((w7h << 3) | (w7l >>> 29)) ^ (w7h >>> 6) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xbc423001 + w9l )|0;
                    th = ( 0xa81a664b + w9h + ((tl >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 42
                    w10l = ( w10l + w3l )|0;
                    w10h = ( w10h + w3h + ((w10l >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 1) | (w11h << 31)) ^ ((w11l >>> 8) | (w11h << 24)) ^ ((w11l >>> 7) | (w11h << 25)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w11h >>> 1) | (w11l << 31)) ^ ((w11h >>> 8) | (w11l << 24)) ^ (w11h >>> 7) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 19) | (w8h << 13)) ^ ((w8l << 3) | (w8h >>> 29)) ^ ((w8l >>> 6) | (w8h << 26)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w8h >>> 19) | (w8l << 13)) ^ ((w8h << 3) | (w8l >>> 29)) ^ (w8h >>> 6) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xd0f89791 + w10l )|0;
                    th = ( 0xc24b8b70 + w10h + ((tl >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 43
                    w11l = ( w11l + w4l )|0;
                    w11h = ( w11h + w4h + ((w11l >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 1) | (w12h << 31)) ^ ((w12l >>> 8) | (w12h << 24)) ^ ((w12l >>> 7) | (w12h << 25)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w12h >>> 1) | (w12l << 31)) ^ ((w12h >>> 8) | (w12l << 24)) ^ (w12h >>> 7) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 19) | (w9h << 13)) ^ ((w9l << 3) | (w9h >>> 29)) ^ ((w9l >>> 6) | (w9h << 26)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w9h >>> 19) | (w9l << 13)) ^ ((w9h << 3) | (w9l >>> 29)) ^ (w9h >>> 6) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x654be30 + w11l )|0;
                    th = ( 0xc76c51a3 + w11h + ((tl >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 44
                    w12l = ( w12l + w5l )|0;
                    w12h = ( w12h + w5h + ((w12l >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 1) | (w13h << 31)) ^ ((w13l >>> 8) | (w13h << 24)) ^ ((w13l >>> 7) | (w13h << 25)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w13h >>> 1) | (w13l << 31)) ^ ((w13h >>> 8) | (w13l << 24)) ^ (w13h >>> 7) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 19) | (w10h << 13)) ^ ((w10l << 3) | (w10h >>> 29)) ^ ((w10l >>> 6) | (w10h << 26)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w10h >>> 19) | (w10l << 13)) ^ ((w10h << 3) | (w10l >>> 29)) ^ (w10h >>> 6) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xd6ef5218 + w12l )|0;
                    th = ( 0xd192e819 + w12h + ((tl >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 45
                    w13l = ( w13l + w6l )|0;
                    w13h = ( w13h + w6h + ((w13l >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 1) | (w14h << 31)) ^ ((w14l >>> 8) | (w14h << 24)) ^ ((w14l >>> 7) | (w14h << 25)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w14h >>> 1) | (w14l << 31)) ^ ((w14h >>> 8) | (w14l << 24)) ^ (w14h >>> 7) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 19) | (w11h << 13)) ^ ((w11l << 3) | (w11h >>> 29)) ^ ((w11l >>> 6) | (w11h << 26)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w11h >>> 19) | (w11l << 13)) ^ ((w11h << 3) | (w11l >>> 29)) ^ (w11h >>> 6) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x5565a910 + w13l )|0;
                    th = ( 0xd6990624 + w13h + ((tl >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 46
                    w14l = ( w14l + w7l )|0;
                    w14h = ( w14h + w7h + ((w14l >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 1) | (w15h << 31)) ^ ((w15l >>> 8) | (w15h << 24)) ^ ((w15l >>> 7) | (w15h << 25)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w15h >>> 1) | (w15l << 31)) ^ ((w15h >>> 8) | (w15l << 24)) ^ (w15h >>> 7) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 19) | (w12h << 13)) ^ ((w12l << 3) | (w12h >>> 29)) ^ ((w12l >>> 6) | (w12h << 26)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w12h >>> 19) | (w12l << 13)) ^ ((w12h << 3) | (w12l >>> 29)) ^ (w12h >>> 6) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x5771202a + w14l )|0;
                    th = ( 0xf40e3585 + w14h + ((tl >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 47
                    w15l = ( w15l + w8l )|0;
                    w15h = ( w15h + w8h + ((w15l >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 1) | (w0h << 31)) ^ ((w0l >>> 8) | (w0h << 24)) ^ ((w0l >>> 7) | (w0h << 25)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w0h >>> 1) | (w0l << 31)) ^ ((w0h >>> 8) | (w0l << 24)) ^ (w0h >>> 7) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 19) | (w13h << 13)) ^ ((w13l << 3) | (w13h >>> 29)) ^ ((w13l >>> 6) | (w13h << 26)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w13h >>> 19) | (w13l << 13)) ^ ((w13h << 3) | (w13l >>> 29)) ^ (w13h >>> 6) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x32bbd1b8 + w15l )|0;
                    th = ( 0x106aa070 + w15h + ((tl >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 48
                    w0l = ( w0l + w9l )|0;
                    w0h = ( w0h + w9h + ((w0l >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 1) | (w1h << 31)) ^ ((w1l >>> 8) | (w1h << 24)) ^ ((w1l >>> 7) | (w1h << 25)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w1h >>> 1) | (w1l << 31)) ^ ((w1h >>> 8) | (w1l << 24)) ^ (w1h >>> 7) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 19) | (w14h << 13)) ^ ((w14l << 3) | (w14h >>> 29)) ^ ((w14l >>> 6) | (w14h << 26)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w14h >>> 19) | (w14l << 13)) ^ ((w14h << 3) | (w14l >>> 29)) ^ (w14h >>> 6) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xb8d2d0c8 + w0l )|0;
                    th = ( 0x19a4c116 + w0h + ((tl >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 49
                    w1l = ( w1l + w10l )|0;
                    w1h = ( w1h + w10h + ((w1l >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 1) | (w2h << 31)) ^ ((w2l >>> 8) | (w2h << 24)) ^ ((w2l >>> 7) | (w2h << 25)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w2h >>> 1) | (w2l << 31)) ^ ((w2h >>> 8) | (w2l << 24)) ^ (w2h >>> 7) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 19) | (w15h << 13)) ^ ((w15l << 3) | (w15h >>> 29)) ^ ((w15l >>> 6) | (w15h << 26)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w15h >>> 19) | (w15l << 13)) ^ ((w15h << 3) | (w15l >>> 29)) ^ (w15h >>> 6) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x5141ab53 + w1l )|0;
                    th = ( 0x1e376c08 + w1h + ((tl >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 50
                    w2l = ( w2l + w11l )|0;
                    w2h = ( w2h + w11h + ((w2l >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 1) | (w3h << 31)) ^ ((w3l >>> 8) | (w3h << 24)) ^ ((w3l >>> 7) | (w3h << 25)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w3h >>> 1) | (w3l << 31)) ^ ((w3h >>> 8) | (w3l << 24)) ^ (w3h >>> 7) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 19) | (w0h << 13)) ^ ((w0l << 3) | (w0h >>> 29)) ^ ((w0l >>> 6) | (w0h << 26)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w0h >>> 19) | (w0l << 13)) ^ ((w0h << 3) | (w0l >>> 29)) ^ (w0h >>> 6) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xdf8eeb99 + w2l )|0;
                    th = ( 0x2748774c + w2h + ((tl >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 51
                    w3l = ( w3l + w12l )|0;
                    w3h = ( w3h + w12h + ((w3l >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 1) | (w4h << 31)) ^ ((w4l >>> 8) | (w4h << 24)) ^ ((w4l >>> 7) | (w4h << 25)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w4h >>> 1) | (w4l << 31)) ^ ((w4h >>> 8) | (w4l << 24)) ^ (w4h >>> 7) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 19) | (w1h << 13)) ^ ((w1l << 3) | (w1h >>> 29)) ^ ((w1l >>> 6) | (w1h << 26)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w1h >>> 19) | (w1l << 13)) ^ ((w1h << 3) | (w1l >>> 29)) ^ (w1h >>> 6) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xe19b48a8 + w3l )|0;
                    th = ( 0x34b0bcb5 + w3h + ((tl >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 52
                    w4l = ( w4l + w13l )|0;
                    w4h = ( w4h + w13h + ((w4l >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 1) | (w5h << 31)) ^ ((w5l >>> 8) | (w5h << 24)) ^ ((w5l >>> 7) | (w5h << 25)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w5h >>> 1) | (w5l << 31)) ^ ((w5h >>> 8) | (w5l << 24)) ^ (w5h >>> 7) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 19) | (w2h << 13)) ^ ((w2l << 3) | (w2h >>> 29)) ^ ((w2l >>> 6) | (w2h << 26)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w2h >>> 19) | (w2l << 13)) ^ ((w2h << 3) | (w2l >>> 29)) ^ (w2h >>> 6) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xc5c95a63 + w4l )|0;
                    th = ( 0x391c0cb3 + w4h + ((tl >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 53
                    w5l = ( w5l + w14l )|0;
                    w5h = ( w5h + w14h + ((w5l >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 1) | (w6h << 31)) ^ ((w6l >>> 8) | (w6h << 24)) ^ ((w6l >>> 7) | (w6h << 25)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w6h >>> 1) | (w6l << 31)) ^ ((w6h >>> 8) | (w6l << 24)) ^ (w6h >>> 7) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 19) | (w3h << 13)) ^ ((w3l << 3) | (w3h >>> 29)) ^ ((w3l >>> 6) | (w3h << 26)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w3h >>> 19) | (w3l << 13)) ^ ((w3h << 3) | (w3l >>> 29)) ^ (w3h >>> 6) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xe3418acb + w5l )|0;
                    th = ( 0x4ed8aa4a + w5h + ((tl >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 54
                    w6l = ( w6l + w15l )|0;
                    w6h = ( w6h + w15h + ((w6l >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 1) | (w7h << 31)) ^ ((w7l >>> 8) | (w7h << 24)) ^ ((w7l >>> 7) | (w7h << 25)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w7h >>> 1) | (w7l << 31)) ^ ((w7h >>> 8) | (w7l << 24)) ^ (w7h >>> 7) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 19) | (w4h << 13)) ^ ((w4l << 3) | (w4h >>> 29)) ^ ((w4l >>> 6) | (w4h << 26)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w4h >>> 19) | (w4l << 13)) ^ ((w4h << 3) | (w4l >>> 29)) ^ (w4h >>> 6) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x7763e373 + w6l )|0;
                    th = ( 0x5b9cca4f + w6h + ((tl >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 55
                    w7l = ( w7l + w0l )|0;
                    w7h = ( w7h + w0h + ((w7l >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 1) | (w8h << 31)) ^ ((w8l >>> 8) | (w8h << 24)) ^ ((w8l >>> 7) | (w8h << 25)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w8h >>> 1) | (w8l << 31)) ^ ((w8h >>> 8) | (w8l << 24)) ^ (w8h >>> 7) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 19) | (w5h << 13)) ^ ((w5l << 3) | (w5h >>> 29)) ^ ((w5l >>> 6) | (w5h << 26)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w5h >>> 19) | (w5l << 13)) ^ ((w5h << 3) | (w5l >>> 29)) ^ (w5h >>> 6) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xd6b2b8a3 + w7l )|0;
                    th = ( 0x682e6ff3 + w7h + ((tl >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 56
                    w8l = ( w8l + w1l )|0;
                    w8h = ( w8h + w1h + ((w8l >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 1) | (w9h << 31)) ^ ((w9l >>> 8) | (w9h << 24)) ^ ((w9l >>> 7) | (w9h << 25)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w9h >>> 1) | (w9l << 31)) ^ ((w9h >>> 8) | (w9l << 24)) ^ (w9h >>> 7) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 19) | (w6h << 13)) ^ ((w6l << 3) | (w6h >>> 29)) ^ ((w6l >>> 6) | (w6h << 26)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w6h >>> 19) | (w6l << 13)) ^ ((w6h << 3) | (w6l >>> 29)) ^ (w6h >>> 6) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x5defb2fc + w8l )|0;
                    th = ( 0x748f82ee + w8h + ((tl >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 57
                    w9l = ( w9l + w2l )|0;
                    w9h = ( w9h + w2h + ((w9l >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 1) | (w10h << 31)) ^ ((w10l >>> 8) | (w10h << 24)) ^ ((w10l >>> 7) | (w10h << 25)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w10h >>> 1) | (w10l << 31)) ^ ((w10h >>> 8) | (w10l << 24)) ^ (w10h >>> 7) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 19) | (w7h << 13)) ^ ((w7l << 3) | (w7h >>> 29)) ^ ((w7l >>> 6) | (w7h << 26)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w7h >>> 19) | (w7l << 13)) ^ ((w7h << 3) | (w7l >>> 29)) ^ (w7h >>> 6) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x43172f60 + w9l )|0;
                    th = ( 0x78a5636f + w9h + ((tl >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 58
                    w10l = ( w10l + w3l )|0;
                    w10h = ( w10h + w3h + ((w10l >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 1) | (w11h << 31)) ^ ((w11l >>> 8) | (w11h << 24)) ^ ((w11l >>> 7) | (w11h << 25)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w11h >>> 1) | (w11l << 31)) ^ ((w11h >>> 8) | (w11l << 24)) ^ (w11h >>> 7) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 19) | (w8h << 13)) ^ ((w8l << 3) | (w8h >>> 29)) ^ ((w8l >>> 6) | (w8h << 26)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w8h >>> 19) | (w8l << 13)) ^ ((w8h << 3) | (w8l >>> 29)) ^ (w8h >>> 6) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xa1f0ab72 + w10l )|0;
                    th = ( 0x84c87814 + w10h + ((tl >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 59
                    w11l = ( w11l + w4l )|0;
                    w11h = ( w11h + w4h + ((w11l >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 1) | (w12h << 31)) ^ ((w12l >>> 8) | (w12h << 24)) ^ ((w12l >>> 7) | (w12h << 25)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w12h >>> 1) | (w12l << 31)) ^ ((w12h >>> 8) | (w12l << 24)) ^ (w12h >>> 7) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 19) | (w9h << 13)) ^ ((w9l << 3) | (w9h >>> 29)) ^ ((w9l >>> 6) | (w9h << 26)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w9h >>> 19) | (w9l << 13)) ^ ((w9h << 3) | (w9l >>> 29)) ^ (w9h >>> 6) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x1a6439ec + w11l )|0;
                    th = ( 0x8cc70208 + w11h + ((tl >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 60
                    w12l = ( w12l + w5l )|0;
                    w12h = ( w12h + w5h + ((w12l >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 1) | (w13h << 31)) ^ ((w13l >>> 8) | (w13h << 24)) ^ ((w13l >>> 7) | (w13h << 25)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w13h >>> 1) | (w13l << 31)) ^ ((w13h >>> 8) | (w13l << 24)) ^ (w13h >>> 7) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 19) | (w10h << 13)) ^ ((w10l << 3) | (w10h >>> 29)) ^ ((w10l >>> 6) | (w10h << 26)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w10h >>> 19) | (w10l << 13)) ^ ((w10h << 3) | (w10l >>> 29)) ^ (w10h >>> 6) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x23631e28 + w12l )|0;
                    th = ( 0x90befffa + w12h + ((tl >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 61
                    w13l = ( w13l + w6l )|0;
                    w13h = ( w13h + w6h + ((w13l >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 1) | (w14h << 31)) ^ ((w14l >>> 8) | (w14h << 24)) ^ ((w14l >>> 7) | (w14h << 25)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w14h >>> 1) | (w14l << 31)) ^ ((w14h >>> 8) | (w14l << 24)) ^ (w14h >>> 7) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 19) | (w11h << 13)) ^ ((w11l << 3) | (w11h >>> 29)) ^ ((w11l >>> 6) | (w11h << 26)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w11h >>> 19) | (w11l << 13)) ^ ((w11h << 3) | (w11l >>> 29)) ^ (w11h >>> 6) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xde82bde9 + w13l )|0;
                    th = ( 0xa4506ceb + w13h + ((tl >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 62
                    w14l = ( w14l + w7l )|0;
                    w14h = ( w14h + w7h + ((w14l >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 1) | (w15h << 31)) ^ ((w15l >>> 8) | (w15h << 24)) ^ ((w15l >>> 7) | (w15h << 25)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w15h >>> 1) | (w15l << 31)) ^ ((w15h >>> 8) | (w15l << 24)) ^ (w15h >>> 7) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 19) | (w12h << 13)) ^ ((w12l << 3) | (w12h >>> 29)) ^ ((w12l >>> 6) | (w12h << 26)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w12h >>> 19) | (w12l << 13)) ^ ((w12h << 3) | (w12l >>> 29)) ^ (w12h >>> 6) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xb2c67915 + w14l )|0;
                    th = ( 0xbef9a3f7 + w14h + ((tl >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 63
                    w15l = ( w15l + w8l )|0;
                    w15h = ( w15h + w8h + ((w15l >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 1) | (w0h << 31)) ^ ((w0l >>> 8) | (w0h << 24)) ^ ((w0l >>> 7) | (w0h << 25)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w0h >>> 1) | (w0l << 31)) ^ ((w0h >>> 8) | (w0l << 24)) ^ (w0h >>> 7) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 19) | (w13h << 13)) ^ ((w13l << 3) | (w13h >>> 29)) ^ ((w13l >>> 6) | (w13h << 26)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w13h >>> 19) | (w13l << 13)) ^ ((w13h << 3) | (w13l >>> 29)) ^ (w13h >>> 6) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xe372532b + w15l )|0;
                    th = ( 0xc67178f2 + w15h + ((tl >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 64
                    w0l = ( w0l + w9l )|0;
                    w0h = ( w0h + w9h + ((w0l >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 1) | (w1h << 31)) ^ ((w1l >>> 8) | (w1h << 24)) ^ ((w1l >>> 7) | (w1h << 25)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w1h >>> 1) | (w1l << 31)) ^ ((w1h >>> 8) | (w1l << 24)) ^ (w1h >>> 7) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 19) | (w14h << 13)) ^ ((w14l << 3) | (w14h >>> 29)) ^ ((w14l >>> 6) | (w14h << 26)) )|0;
                    w0l = ( w0l + xl)|0;
                    w0h = ( w0h + ( ((w14h >>> 19) | (w14l << 13)) ^ ((w14h << 3) | (w14l >>> 29)) ^ (w14h >>> 6) ) + ((w0l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xea26619c + w0l )|0;
                    th = ( 0xca273ece + w0h + ((tl >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 65
                    w1l = ( w1l + w10l )|0;
                    w1h = ( w1h + w10h + ((w1l >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 1) | (w2h << 31)) ^ ((w2l >>> 8) | (w2h << 24)) ^ ((w2l >>> 7) | (w2h << 25)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w2h >>> 1) | (w2l << 31)) ^ ((w2h >>> 8) | (w2l << 24)) ^ (w2h >>> 7) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 19) | (w15h << 13)) ^ ((w15l << 3) | (w15h >>> 29)) ^ ((w15l >>> 6) | (w15h << 26)) )|0;
                    w1l = ( w1l + xl)|0;
                    w1h = ( w1h + ( ((w15h >>> 19) | (w15l << 13)) ^ ((w15h << 3) | (w15l >>> 29)) ^ (w15h >>> 6) ) + ((w1l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x21c0c207 + w1l )|0;
                    th = ( 0xd186b8c7 + w1h + ((tl >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 66
                    w2l = ( w2l + w11l )|0;
                    w2h = ( w2h + w11h + ((w2l >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 1) | (w3h << 31)) ^ ((w3l >>> 8) | (w3h << 24)) ^ ((w3l >>> 7) | (w3h << 25)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w3h >>> 1) | (w3l << 31)) ^ ((w3h >>> 8) | (w3l << 24)) ^ (w3h >>> 7) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 19) | (w0h << 13)) ^ ((w0l << 3) | (w0h >>> 29)) ^ ((w0l >>> 6) | (w0h << 26)) )|0;
                    w2l = ( w2l + xl)|0;
                    w2h = ( w2h + ( ((w0h >>> 19) | (w0l << 13)) ^ ((w0h << 3) | (w0l >>> 29)) ^ (w0h >>> 6) ) + ((w2l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xcde0eb1e + w2l )|0;
                    th = ( 0xeada7dd6 + w2h + ((tl >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 67
                    w3l = ( w3l + w12l )|0;
                    w3h = ( w3h + w12h + ((w3l >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 1) | (w4h << 31)) ^ ((w4l >>> 8) | (w4h << 24)) ^ ((w4l >>> 7) | (w4h << 25)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w4h >>> 1) | (w4l << 31)) ^ ((w4h >>> 8) | (w4l << 24)) ^ (w4h >>> 7) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w1l >>> 19) | (w1h << 13)) ^ ((w1l << 3) | (w1h >>> 29)) ^ ((w1l >>> 6) | (w1h << 26)) )|0;
                    w3l = ( w3l + xl)|0;
                    w3h = ( w3h + ( ((w1h >>> 19) | (w1l << 13)) ^ ((w1h << 3) | (w1l >>> 29)) ^ (w1h >>> 6) ) + ((w3l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xee6ed178 + w3l )|0;
                    th = ( 0xf57d4f7f + w3h + ((tl >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 68
                    w4l = ( w4l + w13l )|0;
                    w4h = ( w4h + w13h + ((w4l >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 1) | (w5h << 31)) ^ ((w5l >>> 8) | (w5h << 24)) ^ ((w5l >>> 7) | (w5h << 25)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w5h >>> 1) | (w5l << 31)) ^ ((w5h >>> 8) | (w5l << 24)) ^ (w5h >>> 7) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w2l >>> 19) | (w2h << 13)) ^ ((w2l << 3) | (w2h >>> 29)) ^ ((w2l >>> 6) | (w2h << 26)) )|0;
                    w4l = ( w4l + xl)|0;
                    w4h = ( w4h + ( ((w2h >>> 19) | (w2l << 13)) ^ ((w2h << 3) | (w2l >>> 29)) ^ (w2h >>> 6) ) + ((w4l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x72176fba + w4l )|0;
                    th = ( 0x6f067aa + w4h + ((tl >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 69
                    w5l = ( w5l + w14l )|0;
                    w5h = ( w5h + w14h + ((w5l >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 1) | (w6h << 31)) ^ ((w6l >>> 8) | (w6h << 24)) ^ ((w6l >>> 7) | (w6h << 25)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w6h >>> 1) | (w6l << 31)) ^ ((w6h >>> 8) | (w6l << 24)) ^ (w6h >>> 7) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w3l >>> 19) | (w3h << 13)) ^ ((w3l << 3) | (w3h >>> 29)) ^ ((w3l >>> 6) | (w3h << 26)) )|0;
                    w5l = ( w5l + xl)|0;
                    w5h = ( w5h + ( ((w3h >>> 19) | (w3l << 13)) ^ ((w3h << 3) | (w3l >>> 29)) ^ (w3h >>> 6) ) + ((w5l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xa2c898a6 + w5l )|0;
                    th = ( 0xa637dc5 + w5h + ((tl >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 70
                    w6l = ( w6l + w15l )|0;
                    w6h = ( w6h + w15h + ((w6l >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 1) | (w7h << 31)) ^ ((w7l >>> 8) | (w7h << 24)) ^ ((w7l >>> 7) | (w7h << 25)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w7h >>> 1) | (w7l << 31)) ^ ((w7h >>> 8) | (w7l << 24)) ^ (w7h >>> 7) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w4l >>> 19) | (w4h << 13)) ^ ((w4l << 3) | (w4h >>> 29)) ^ ((w4l >>> 6) | (w4h << 26)) )|0;
                    w6l = ( w6l + xl)|0;
                    w6h = ( w6h + ( ((w4h >>> 19) | (w4l << 13)) ^ ((w4h << 3) | (w4l >>> 29)) ^ (w4h >>> 6) ) + ((w6l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xbef90dae + w6l )|0;
                    th = ( 0x113f9804 + w6h + ((tl >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 71
                    w7l = ( w7l + w0l )|0;
                    w7h = ( w7h + w0h + ((w7l >>> 0) < (w0l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 1) | (w8h << 31)) ^ ((w8l >>> 8) | (w8h << 24)) ^ ((w8l >>> 7) | (w8h << 25)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w8h >>> 1) | (w8l << 31)) ^ ((w8h >>> 8) | (w8l << 24)) ^ (w8h >>> 7) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w5l >>> 19) | (w5h << 13)) ^ ((w5l << 3) | (w5h >>> 29)) ^ ((w5l >>> 6) | (w5h << 26)) )|0;
                    w7l = ( w7l + xl)|0;
                    w7h = ( w7h + ( ((w5h >>> 19) | (w5l << 13)) ^ ((w5h << 3) | (w5l >>> 29)) ^ (w5h >>> 6) ) + ((w7l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x131c471b + w7l )|0;
                    th = ( 0x1b710b35 + w7h + ((tl >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 72
                    w8l = ( w8l + w1l )|0;
                    w8h = ( w8h + w1h + ((w8l >>> 0) < (w1l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 1) | (w9h << 31)) ^ ((w9l >>> 8) | (w9h << 24)) ^ ((w9l >>> 7) | (w9h << 25)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w9h >>> 1) | (w9l << 31)) ^ ((w9h >>> 8) | (w9l << 24)) ^ (w9h >>> 7) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w6l >>> 19) | (w6h << 13)) ^ ((w6l << 3) | (w6h >>> 29)) ^ ((w6l >>> 6) | (w6h << 26)) )|0;
                    w8l = ( w8l + xl)|0;
                    w8h = ( w8h + ( ((w6h >>> 19) | (w6l << 13)) ^ ((w6h << 3) | (w6l >>> 29)) ^ (w6h >>> 6) ) + ((w8l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x23047d84 + w8l )|0;
                    th = ( 0x28db77f5 + w8h + ((tl >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 73
                    w9l = ( w9l + w2l )|0;
                    w9h = ( w9h + w2h + ((w9l >>> 0) < (w2l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 1) | (w10h << 31)) ^ ((w10l >>> 8) | (w10h << 24)) ^ ((w10l >>> 7) | (w10h << 25)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w10h >>> 1) | (w10l << 31)) ^ ((w10h >>> 8) | (w10l << 24)) ^ (w10h >>> 7) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w7l >>> 19) | (w7h << 13)) ^ ((w7l << 3) | (w7h >>> 29)) ^ ((w7l >>> 6) | (w7h << 26)) )|0;
                    w9l = ( w9l + xl)|0;
                    w9h = ( w9h + ( ((w7h >>> 19) | (w7l << 13)) ^ ((w7h << 3) | (w7l >>> 29)) ^ (w7h >>> 6) ) + ((w9l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x40c72493 + w9l )|0;
                    th = ( 0x32caab7b + w9h + ((tl >>> 0) < (w9l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 74
                    w10l = ( w10l + w3l )|0;
                    w10h = ( w10h + w3h + ((w10l >>> 0) < (w3l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 1) | (w11h << 31)) ^ ((w11l >>> 8) | (w11h << 24)) ^ ((w11l >>> 7) | (w11h << 25)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w11h >>> 1) | (w11l << 31)) ^ ((w11h >>> 8) | (w11l << 24)) ^ (w11h >>> 7) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w8l >>> 19) | (w8h << 13)) ^ ((w8l << 3) | (w8h >>> 29)) ^ ((w8l >>> 6) | (w8h << 26)) )|0;
                    w10l = ( w10l + xl)|0;
                    w10h = ( w10h + ( ((w8h >>> 19) | (w8l << 13)) ^ ((w8h << 3) | (w8l >>> 29)) ^ (w8h >>> 6) ) + ((w10l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x15c9bebc + w10l )|0;
                    th = ( 0x3c9ebe0a + w10h + ((tl >>> 0) < (w10l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 75
                    w11l = ( w11l + w4l )|0;
                    w11h = ( w11h + w4h + ((w11l >>> 0) < (w4l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 1) | (w12h << 31)) ^ ((w12l >>> 8) | (w12h << 24)) ^ ((w12l >>> 7) | (w12h << 25)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w12h >>> 1) | (w12l << 31)) ^ ((w12h >>> 8) | (w12l << 24)) ^ (w12h >>> 7) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w9l >>> 19) | (w9h << 13)) ^ ((w9l << 3) | (w9h >>> 29)) ^ ((w9l >>> 6) | (w9h << 26)) )|0;
                    w11l = ( w11l + xl)|0;
                    w11h = ( w11h + ( ((w9h >>> 19) | (w9l << 13)) ^ ((w9h << 3) | (w9l >>> 29)) ^ (w9h >>> 6) ) + ((w11l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x9c100d4c + w11l )|0;
                    th = ( 0x431d67c4 + w11h + ((tl >>> 0) < (w11l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 76
                    w12l = ( w12l + w5l )|0;
                    w12h = ( w12h + w5h + ((w12l >>> 0) < (w5l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 1) | (w13h << 31)) ^ ((w13l >>> 8) | (w13h << 24)) ^ ((w13l >>> 7) | (w13h << 25)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w13h >>> 1) | (w13l << 31)) ^ ((w13h >>> 8) | (w13l << 24)) ^ (w13h >>> 7) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w10l >>> 19) | (w10h << 13)) ^ ((w10l << 3) | (w10h >>> 29)) ^ ((w10l >>> 6) | (w10h << 26)) )|0;
                    w12l = ( w12l + xl)|0;
                    w12h = ( w12h + ( ((w10h >>> 19) | (w10l << 13)) ^ ((w10h << 3) | (w10l >>> 29)) ^ (w10h >>> 6) ) + ((w12l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xcb3e42b6 + w12l )|0;
                    th = ( 0x4cc5d4be + w12h + ((tl >>> 0) < (w12l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 77
                    w13l = ( w13l + w6l )|0;
                    w13h = ( w13h + w6h + ((w13l >>> 0) < (w6l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w14l >>> 1) | (w14h << 31)) ^ ((w14l >>> 8) | (w14h << 24)) ^ ((w14l >>> 7) | (w14h << 25)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w14h >>> 1) | (w14l << 31)) ^ ((w14h >>> 8) | (w14l << 24)) ^ (w14h >>> 7) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w11l >>> 19) | (w11h << 13)) ^ ((w11l << 3) | (w11h >>> 29)) ^ ((w11l >>> 6) | (w11h << 26)) )|0;
                    w13l = ( w13l + xl)|0;
                    w13h = ( w13h + ( ((w11h >>> 19) | (w11l << 13)) ^ ((w11h << 3) | (w11l >>> 29)) ^ (w11h >>> 6) ) + ((w13l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0xfc657e2a + w13l )|0;
                    th = ( 0x597f299c + w13h + ((tl >>> 0) < (w13l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 78
                    w14l = ( w14l + w7l )|0;
                    w14h = ( w14h + w7h + ((w14l >>> 0) < (w7l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w15l >>> 1) | (w15h << 31)) ^ ((w15l >>> 8) | (w15h << 24)) ^ ((w15l >>> 7) | (w15h << 25)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w15h >>> 1) | (w15l << 31)) ^ ((w15h >>> 8) | (w15l << 24)) ^ (w15h >>> 7) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w12l >>> 19) | (w12h << 13)) ^ ((w12l << 3) | (w12h >>> 29)) ^ ((w12l >>> 6) | (w12h << 26)) )|0;
                    w14l = ( w14l + xl)|0;
                    w14h = ( w14h + ( ((w12h >>> 19) | (w12l << 13)) ^ ((w12h << 3) | (w12l >>> 29)) ^ (w12h >>> 6) ) + ((w14l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x3ad6faec + w14l )|0;
                    th = ( 0x5fcb6fab + w14h + ((tl >>> 0) < (w14l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    // 79
                    w15l = ( w15l + w8l )|0;
                    w15h = ( w15h + w8h + ((w15l >>> 0) < (w8l >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w0l >>> 1) | (w0h << 31)) ^ ((w0l >>> 8) | (w0h << 24)) ^ ((w0l >>> 7) | (w0h << 25)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w0h >>> 1) | (w0l << 31)) ^ ((w0h >>> 8) | (w0l << 24)) ^ (w0h >>> 7) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((w13l >>> 19) | (w13h << 13)) ^ ((w13l << 3) | (w13h >>> 29)) ^ ((w13l >>> 6) | (w13h << 26)) )|0;
                    w15l = ( w15l + xl)|0;
                    w15h = ( w15h + ( ((w13h >>> 19) | (w13l << 13)) ^ ((w13h << 3) | (w13l >>> 29)) ^ (w13h >>> 6) ) + ((w15l >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    tl = ( 0x4a475817 + w15l )|0;
                    th = ( 0x6c44198c + w15h + ((tl >>> 0) < (w15l >>> 0) ? 1 : 0) )|0;
                    tl = ( tl + hl )|0;
                    th = ( th + hh + ((tl >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + (((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9))) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    xl = ( ( gl ^ el & (fl^gl) ) )|0;
                    tl = ( tl + xl )|0;
                    th = ( th + ( gh ^ eh & (fh^gh) ) + ((tl >>> 0) < (xl >>> 0) ? 1 : 0) )|0;
                    hl = gl; hh = gh;
                    gl = fl; gh = fh;
                    fl = el; fh = eh;
                    el = ( dl + tl )|0; eh = ( dh + th + ((el >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    dl = cl; dh = ch;
                    cl = bl; ch = bh;
                    bl = al; bh = ah;
                    al = ( tl + ( (bl & cl) ^ ( dl & (bl ^ cl) ) ) )|0;
                    ah = ( th + ( (bh & ch) ^ ( dh & (bh ^ ch) ) ) + ((al >>> 0) < (tl >>> 0) ? 1 : 0) )|0;
                    xl = ( ((bl >>> 28) | (bh << 4)) ^ ((bl << 30) | (bh >>> 2)) ^ ((bl << 25) | (bh >>> 7)) )|0;
                    al = ( al + xl )|0;
                    ah = ( ah + (((bh >>> 28) | (bl << 4)) ^ ((bh << 30) | (bl >>> 2)) ^ ((bh << 25) | (bl >>> 7))) + ((al >>> 0) < (xl >>> 0) ? 1 : 0) )|0;

                    H0l = ( H0l + al )|0;
                    H0h = ( H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0) )|0;
                    H1l = ( H1l + bl )|0;
                    H1h = ( H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0) )|0;
                    H2l = ( H2l + cl )|0;
                    H2h = ( H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0) )|0;
                    H3l = ( H3l + dl )|0;
                    H3h = ( H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0) )|0;
                    H4l = ( H4l + el )|0;
                    H4h = ( H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0) )|0;
                    H5l = ( H5l + fl )|0;
                    H5h = ( H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0) )|0;
                    H6l = ( H6l + gl )|0;
                    H6h = ( H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0) )|0;
                    H7l = ( H7l + hl )|0;
                    H7h = ( H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0) )|0;
                }

                function _core_heap ( offset ) {
                    offset = offset|0;

                    _core(
                        HEAP[offset|0]<<24 | HEAP[offset|1]<<16 | HEAP[offset|2]<<8 | HEAP[offset|3],
                        HEAP[offset|4]<<24 | HEAP[offset|5]<<16 | HEAP[offset|6]<<8 | HEAP[offset|7],
                        HEAP[offset|8]<<24 | HEAP[offset|9]<<16 | HEAP[offset|10]<<8 | HEAP[offset|11],
                        HEAP[offset|12]<<24 | HEAP[offset|13]<<16 | HEAP[offset|14]<<8 | HEAP[offset|15],
                        HEAP[offset|16]<<24 | HEAP[offset|17]<<16 | HEAP[offset|18]<<8 | HEAP[offset|19],
                        HEAP[offset|20]<<24 | HEAP[offset|21]<<16 | HEAP[offset|22]<<8 | HEAP[offset|23],
                        HEAP[offset|24]<<24 | HEAP[offset|25]<<16 | HEAP[offset|26]<<8 | HEAP[offset|27],
                        HEAP[offset|28]<<24 | HEAP[offset|29]<<16 | HEAP[offset|30]<<8 | HEAP[offset|31],
                        HEAP[offset|32]<<24 | HEAP[offset|33]<<16 | HEAP[offset|34]<<8 | HEAP[offset|35],
                        HEAP[offset|36]<<24 | HEAP[offset|37]<<16 | HEAP[offset|38]<<8 | HEAP[offset|39],
                        HEAP[offset|40]<<24 | HEAP[offset|41]<<16 | HEAP[offset|42]<<8 | HEAP[offset|43],
                        HEAP[offset|44]<<24 | HEAP[offset|45]<<16 | HEAP[offset|46]<<8 | HEAP[offset|47],
                        HEAP[offset|48]<<24 | HEAP[offset|49]<<16 | HEAP[offset|50]<<8 | HEAP[offset|51],
                        HEAP[offset|52]<<24 | HEAP[offset|53]<<16 | HEAP[offset|54]<<8 | HEAP[offset|55],
                        HEAP[offset|56]<<24 | HEAP[offset|57]<<16 | HEAP[offset|58]<<8 | HEAP[offset|59],
                        HEAP[offset|60]<<24 | HEAP[offset|61]<<16 | HEAP[offset|62]<<8 | HEAP[offset|63],
                        HEAP[offset|64]<<24 | HEAP[offset|65]<<16 | HEAP[offset|66]<<8 | HEAP[offset|67],
                        HEAP[offset|68]<<24 | HEAP[offset|69]<<16 | HEAP[offset|70]<<8 | HEAP[offset|71],
                        HEAP[offset|72]<<24 | HEAP[offset|73]<<16 | HEAP[offset|74]<<8 | HEAP[offset|75],
                        HEAP[offset|76]<<24 | HEAP[offset|77]<<16 | HEAP[offset|78]<<8 | HEAP[offset|79],
                        HEAP[offset|80]<<24 | HEAP[offset|81]<<16 | HEAP[offset|82]<<8 | HEAP[offset|83],
                        HEAP[offset|84]<<24 | HEAP[offset|85]<<16 | HEAP[offset|86]<<8 | HEAP[offset|87],
                        HEAP[offset|88]<<24 | HEAP[offset|89]<<16 | HEAP[offset|90]<<8 | HEAP[offset|91],
                        HEAP[offset|92]<<24 | HEAP[offset|93]<<16 | HEAP[offset|94]<<8 | HEAP[offset|95],
                        HEAP[offset|96]<<24 | HEAP[offset|97]<<16 | HEAP[offset|98]<<8 | HEAP[offset|99],
                        HEAP[offset|100]<<24 | HEAP[offset|101]<<16 | HEAP[offset|102]<<8 | HEAP[offset|103],
                        HEAP[offset|104]<<24 | HEAP[offset|105]<<16 | HEAP[offset|106]<<8 | HEAP[offset|107],
                        HEAP[offset|108]<<24 | HEAP[offset|109]<<16 | HEAP[offset|110]<<8 | HEAP[offset|111],
                        HEAP[offset|112]<<24 | HEAP[offset|113]<<16 | HEAP[offset|114]<<8 | HEAP[offset|115],
                        HEAP[offset|116]<<24 | HEAP[offset|117]<<16 | HEAP[offset|118]<<8 | HEAP[offset|119],
                        HEAP[offset|120]<<24 | HEAP[offset|121]<<16 | HEAP[offset|122]<<8 | HEAP[offset|123],
                        HEAP[offset|124]<<24 | HEAP[offset|125]<<16 | HEAP[offset|126]<<8 | HEAP[offset|127]
                    );
                }

                // offset — multiple of 32
                function _state_to_heap ( output ) {
                    output = output|0;

                    HEAP[output|0] = H0h>>>24;
                    HEAP[output|1] = H0h>>>16&255;
                    HEAP[output|2] = H0h>>>8&255;
                    HEAP[output|3] = H0h&255;
                    HEAP[output|4] = H0l>>>24;
                    HEAP[output|5] = H0l>>>16&255;
                    HEAP[output|6] = H0l>>>8&255;
                    HEAP[output|7] = H0l&255;
                    HEAP[output|8] = H1h>>>24;
                    HEAP[output|9] = H1h>>>16&255;
                    HEAP[output|10] = H1h>>>8&255;
                    HEAP[output|11] = H1h&255;
                    HEAP[output|12] = H1l>>>24;
                    HEAP[output|13] = H1l>>>16&255;
                    HEAP[output|14] = H1l>>>8&255;
                    HEAP[output|15] = H1l&255;
                    HEAP[output|16] = H2h>>>24;
                    HEAP[output|17] = H2h>>>16&255;
                    HEAP[output|18] = H2h>>>8&255;
                    HEAP[output|19] = H2h&255;
                    HEAP[output|20] = H2l>>>24;
                    HEAP[output|21] = H2l>>>16&255;
                    HEAP[output|22] = H2l>>>8&255;
                    HEAP[output|23] = H2l&255;
                    HEAP[output|24] = H3h>>>24;
                    HEAP[output|25] = H3h>>>16&255;
                    HEAP[output|26] = H3h>>>8&255;
                    HEAP[output|27] = H3h&255;
                    HEAP[output|28] = H3l>>>24;
                    HEAP[output|29] = H3l>>>16&255;
                    HEAP[output|30] = H3l>>>8&255;
                    HEAP[output|31] = H3l&255;
                    HEAP[output|32] = H4h>>>24;
                    HEAP[output|33] = H4h>>>16&255;
                    HEAP[output|34] = H4h>>>8&255;
                    HEAP[output|35] = H4h&255;
                    HEAP[output|36] = H4l>>>24;
                    HEAP[output|37] = H4l>>>16&255;
                    HEAP[output|38] = H4l>>>8&255;
                    HEAP[output|39] = H4l&255;
                    HEAP[output|40] = H5h>>>24;
                    HEAP[output|41] = H5h>>>16&255;
                    HEAP[output|42] = H5h>>>8&255;
                    HEAP[output|43] = H5h&255;
                    HEAP[output|44] = H5l>>>24;
                    HEAP[output|45] = H5l>>>16&255;
                    HEAP[output|46] = H5l>>>8&255;
                    HEAP[output|47] = H5l&255;
                    HEAP[output|48] = H6h>>>24;
                    HEAP[output|49] = H6h>>>16&255;
                    HEAP[output|50] = H6h>>>8&255;
                    HEAP[output|51] = H6h&255;
                    HEAP[output|52] = H6l>>>24;
                    HEAP[output|53] = H6l>>>16&255;
                    HEAP[output|54] = H6l>>>8&255;
                    HEAP[output|55] = H6l&255;
                    HEAP[output|56] = H7h>>>24;
                    HEAP[output|57] = H7h>>>16&255;
                    HEAP[output|58] = H7h>>>8&255;
                    HEAP[output|59] = H7h&255;
                    HEAP[output|60] = H7l>>>24;
                    HEAP[output|61] = H7l>>>16&255;
                    HEAP[output|62] = H7l>>>8&255;
                    HEAP[output|63] = H7l&255;
                }

                function reset () {
                    H0h = 0x6a09e667;
                    H0l = 0xf3bcc908;
                    H1h = 0xbb67ae85;
                    H1l = 0x84caa73b;
                    H2h = 0x3c6ef372;
                    H2l = 0xfe94f82b;
                    H3h = 0xa54ff53a;
                    H3l = 0x5f1d36f1;
                    H4h = 0x510e527f;
                    H4l = 0xade682d1;
                    H5h = 0x9b05688c;
                    H5l = 0x2b3e6c1f;
                    H6h = 0x1f83d9ab;
                    H6l = 0xfb41bd6b;
                    H7h = 0x5be0cd19;
                    H7l = 0x137e2179;

                    TOTAL0 = TOTAL1 = 0;
                }

                function init ( h0h, h0l, h1h, h1l, h2h, h2l, h3h, h3l, h4h, h4l, h5h, h5l, h6h, h6l, h7h, h7l, total0, total1 ) {
                    h0h = h0h|0;
                    h0l = h0l|0;
                    h1h = h1h|0;
                    h1l = h1l|0;
                    h2h = h2h|0;
                    h2l = h2l|0;
                    h3h = h3h|0;
                    h3l = h3l|0;
                    h4h = h4h|0;
                    h4l = h4l|0;
                    h5h = h5h|0;
                    h5l = h5l|0;
                    h6h = h6h|0;
                    h6l = h6l|0;
                    h7h = h7h|0;
                    h7l = h7l|0;
                    total0 = total0|0;
                    total1 = total1|0;

                    H0h = h0h;
                    H0l = h0l;
                    H1h = h1h;
                    H1l = h1l;
                    H2h = h2h;
                    H2l = h2l;
                    H3h = h3h;
                    H3l = h3l;
                    H4h = h4h;
                    H4l = h4l;
                    H5h = h5h;
                    H5l = h5l;
                    H6h = h6h;
                    H6l = h6l;
                    H7h = h7h;
                    H7l = h7l;
                    TOTAL0 = total0;
                    TOTAL1 = total1;
                }

                // offset — multiple of 128
                function process ( offset, length ) {
                    offset = offset|0;
                    length = length|0;

                    var hashed = 0;

                    if ( offset & 127 )
                        return -1;

                    while ( (length|0) >= 128 ) {
                        _core_heap(offset);

                        offset = ( offset + 128 )|0;
                        length = ( length - 128 )|0;

                        hashed = ( hashed + 128 )|0;
                    }

                    TOTAL0 = ( TOTAL0 + hashed )|0;
                    if ( TOTAL0>>>0 < hashed>>>0 ) TOTAL1 = ( TOTAL1 + 1 )|0;

                    return hashed|0;
                }

                // offset — multiple of 128
                // output — multiple of 64
                function finish ( offset, length, output ) {
                    offset = offset|0;
                    length = length|0;
                    output = output|0;

                    var hashed = 0,
                        i = 0;

                    if ( offset & 127 )
                        return -1;

                    if ( ~output )
                        if ( output & 63 )
                            return -1;

                    if ( (length|0) >= 128 ) {
                        hashed = process( offset, length )|0;
                        if ( (hashed|0) == -1 )
                            return -1;

                        offset = ( offset + hashed )|0;
                        length = ( length - hashed )|0;
                    }

                    hashed = ( hashed + length )|0;
                    TOTAL0 = ( TOTAL0 + length )|0;
                    if ( TOTAL0>>>0 < length>>>0 ) TOTAL1 = ( TOTAL1 + 1 )|0;

                    HEAP[offset|length] = 0x80;

                    if ( (length|0) >= 112 ) {
                        for ( i = (length+1)|0; (i|0) < 128; i = (i+1)|0 )
                            HEAP[offset|i] = 0x00;

                        _core_heap(offset);

                        length = 0;

                        HEAP[offset|0] = 0;
                    }

                    for ( i = (length+1)|0; (i|0) < 123; i = (i+1)|0 )
                        HEAP[offset|i] = 0;

                    HEAP[offset|120] = TOTAL1>>>21&255;
                    HEAP[offset|121] = TOTAL1>>>13&255;
                    HEAP[offset|122] = TOTAL1>>>5&255;
                    HEAP[offset|123] = TOTAL1<<3&255 | TOTAL0>>>29;
                    HEAP[offset|124] = TOTAL0>>>21&255;
                    HEAP[offset|125] = TOTAL0>>>13&255;
                    HEAP[offset|126] = TOTAL0>>>5&255;
                    HEAP[offset|127] = TOTAL0<<3&255;
                    _core_heap(offset);

                    if ( ~output )
                        _state_to_heap(output);

                    return hashed|0;
                }

                function hmac_reset () {
                    H0h = I0h;
                    H0l = I0l;
                    H1h = I1h;
                    H1l = I1l;
                    H2h = I2h;
                    H2l = I2l;
                    H3h = I3h;
                    H3l = I3l;
                    H4h = I4h;
                    H4l = I4l;
                    H5h = I5h;
                    H5l = I5l;
                    H6h = I6h;
                    H6l = I6l;
                    H7h = I7h;
                    H7l = I7l;
                    TOTAL0 = 128;
                    TOTAL1 = 0;
                }

                function _hmac_opad () {
                    H0h = O0h;
                    H0l = O0l;
                    H1h = O1h;
                    H1l = O1l;
                    H2h = O2h;
                    H2l = O2l;
                    H3h = O3h;
                    H3l = O3l;
                    H4h = O4h;
                    H4l = O4l;
                    H5h = O5h;
                    H5l = O5l;
                    H6h = O6h;
                    H6l = O6l;
                    H7h = O7h;
                    H7l = O7l;
                    TOTAL0 = 128;
                    TOTAL1 = 0;
                }

                function hmac_init ( p0h, p0l, p1h, p1l, p2h, p2l, p3h, p3l, p4h, p4l, p5h, p5l, p6h, p6l, p7h, p7l, p8h, p8l, p9h, p9l, p10h, p10l, p11h, p11l, p12h, p12l, p13h, p13l, p14h, p14l, p15h, p15l ) {
                    p0h = p0h|0;
                    p0l = p0l|0;
                    p1h = p1h|0;
                    p1l = p1l|0;
                    p2h = p2h|0;
                    p2l = p2l|0;
                    p3h = p3h|0;
                    p3l = p3l|0;
                    p4h = p4h|0;
                    p4l = p4l|0;
                    p5h = p5h|0;
                    p5l = p5l|0;
                    p6h = p6h|0;
                    p6l = p6l|0;
                    p7h = p7h|0;
                    p7l = p7l|0;
                    p8h = p8h|0;
                    p8l = p8l|0;
                    p9h = p9h|0;
                    p9l = p9l|0;
                    p10h = p10h|0;
                    p10l = p10l|0;
                    p11h = p11h|0;
                    p11l = p11l|0;
                    p12h = p12h|0;
                    p12l = p12l|0;
                    p13h = p13h|0;
                    p13l = p13l|0;
                    p14h = p14h|0;
                    p14l = p14l|0;
                    p15h = p15h|0;
                    p15l = p15l|0;

                    // opad
                    reset();
                    _core(
                        p0h ^ 0x5c5c5c5c,
                        p0l ^ 0x5c5c5c5c,
                        p1h ^ 0x5c5c5c5c,
                        p1l ^ 0x5c5c5c5c,
                        p2h ^ 0x5c5c5c5c,
                        p2l ^ 0x5c5c5c5c,
                        p3h ^ 0x5c5c5c5c,
                        p3l ^ 0x5c5c5c5c,
                        p4h ^ 0x5c5c5c5c,
                        p4l ^ 0x5c5c5c5c,
                        p5h ^ 0x5c5c5c5c,
                        p5l ^ 0x5c5c5c5c,
                        p6h ^ 0x5c5c5c5c,
                        p6l ^ 0x5c5c5c5c,
                        p7h ^ 0x5c5c5c5c,
                        p7l ^ 0x5c5c5c5c,
                        p8h ^ 0x5c5c5c5c,
                        p8l ^ 0x5c5c5c5c,
                        p9h ^ 0x5c5c5c5c,
                        p9l ^ 0x5c5c5c5c,
                        p10h ^ 0x5c5c5c5c,
                        p10l ^ 0x5c5c5c5c,
                        p11h ^ 0x5c5c5c5c,
                        p11l ^ 0x5c5c5c5c,
                        p12h ^ 0x5c5c5c5c,
                        p12l ^ 0x5c5c5c5c,
                        p13h ^ 0x5c5c5c5c,
                        p13l ^ 0x5c5c5c5c,
                        p14h ^ 0x5c5c5c5c,
                        p14l ^ 0x5c5c5c5c,
                        p15h ^ 0x5c5c5c5c,
                        p15l ^ 0x5c5c5c5c
                    );
                    O0h = H0h;
                    O0l = H0l;
                    O1h = H1h;
                    O1l = H1l;
                    O2h = H2h;
                    O2l = H2l;
                    O3h = H3h;
                    O3l = H3l;
                    O4h = H4h;
                    O4l = H4l;
                    O5h = H5h;
                    O5l = H5l;
                    O6h = H6h;
                    O6l = H6l;
                    O7h = H7h;
                    O7l = H7l;

                    // ipad
                    reset();
                    _core(
                       p0h ^ 0x36363636,
                       p0l ^ 0x36363636,
                       p1h ^ 0x36363636,
                       p1l ^ 0x36363636,
                       p2h ^ 0x36363636,
                       p2l ^ 0x36363636,
                       p3h ^ 0x36363636,
                       p3l ^ 0x36363636,
                       p4h ^ 0x36363636,
                       p4l ^ 0x36363636,
                       p5h ^ 0x36363636,
                       p5l ^ 0x36363636,
                       p6h ^ 0x36363636,
                       p6l ^ 0x36363636,
                       p7h ^ 0x36363636,
                       p7l ^ 0x36363636,
                       p8h ^ 0x36363636,
                       p8l ^ 0x36363636,
                       p9h ^ 0x36363636,
                       p9l ^ 0x36363636,
                       p10h ^ 0x36363636,
                       p10l ^ 0x36363636,
                       p11h ^ 0x36363636,
                       p11l ^ 0x36363636,
                       p12h ^ 0x36363636,
                       p12l ^ 0x36363636,
                       p13h ^ 0x36363636,
                       p13l ^ 0x36363636,
                       p14h ^ 0x36363636,
                       p14l ^ 0x36363636,
                       p15h ^ 0x36363636,
                       p15l ^ 0x36363636
                    );
                    I0h = H0h;
                    I0l = H0l;
                    I1h = H1h;
                    I1l = H1l;
                    I2h = H2h;
                    I2l = H2l;
                    I3h = H3h;
                    I3l = H3l;
                    I4h = H4h;
                    I4l = H4l;
                    I5h = H5h;
                    I5l = H5l;
                    I6h = H6h;
                    I6l = H6l;
                    I7h = H7h;
                    I7l = H7l;

                    TOTAL0 = 128;
                    TOTAL1 = 0;
                }

                // offset — multiple of 128
                // output — multiple of 64
                function hmac_finish ( offset, length, output ) {
                    offset = offset|0;
                    length = length|0;
                    output = output|0;

                    var t0h = 0, t0l = 0, t1h = 0, t1l = 0, t2h = 0, t2l = 0, t3h = 0, t3l = 0,
                        t4h = 0, t4l = 0, t5h = 0, t5l = 0, t6h = 0, t6l = 0, t7h = 0, t7l = 0,
                        hashed = 0;

                    if ( offset & 127 )
                        return -1;

                    if ( ~output )
                        if ( output & 63 )
                            return -1;

                    hashed = finish( offset, length, -1 )|0;
                    t0h = H0h;
                    t0l = H0l;
                    t1h = H1h;
                    t1l = H1l;
                    t2h = H2h;
                    t2l = H2l;
                    t3h = H3h;
                    t3l = H3l;
                    t4h = H4h;
                    t4l = H4l;
                    t5h = H5h;
                    t5l = H5l;
                    t6h = H6h;
                    t6l = H6l;
                    t7h = H7h;
                    t7l = H7l;

                    _hmac_opad();
                    _core( t0h, t0l, t1h, t1l, t2h, t2l, t3h, t3l, t4h, t4l, t5h, t5l, t6h, t6l, t7h, t7l, 0x80000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1536 );

                    if ( ~output )
                        _state_to_heap(output);

                    return hashed|0;
                }

                // salt is assumed to be already processed
                // offset — multiple of 128
                // output — multiple of 64
                function pbkdf2_generate_block ( offset, length, block, count, output ) {
                    offset = offset|0;
                    length = length|0;
                    block = block|0;
                    count = count|0;
                    output = output|0;

                    var h0h = 0, h0l = 0, h1h = 0, h1l = 0, h2h = 0, h2l = 0, h3h = 0, h3l = 0,
                        h4h = 0, h4l = 0, h5h = 0, h5l = 0, h6h = 0, h6l = 0, h7h = 0, h7l = 0,
                        t0h = 0, t0l = 0, t1h = 0, t1l = 0, t2h = 0, t2l = 0, t3h = 0, t3l = 0,
                        t4h = 0, t4l = 0, t5h = 0, t5l = 0, t6h = 0, t6l = 0, t7h = 0, t7l = 0;

                    if ( offset & 127 )
                        return -1;

                    if ( ~output )
                        if ( output & 63 )
                            return -1;

                    // pad block number into heap
                    // FIXME probable OOB write
                    HEAP[(offset+length)|0]   = block>>>24;
                    HEAP[(offset+length+1)|0] = block>>>16&255;
                    HEAP[(offset+length+2)|0] = block>>>8&255;
                    HEAP[(offset+length+3)|0] = block&255;

                    // finish first iteration
                    hmac_finish( offset, (length+4)|0, -1 )|0;

                    h0h = t0h = H0h;
                    h0l = t0l = H0l;
                    h1h = t1h = H1h;
                    h1l = t1l = H1l;
                    h2h = t2h = H2h;
                    h2l = t2l = H2l;
                    h3h = t3h = H3h;
                    h3l = t3l = H3l;
                    h4h = t4h = H4h;
                    h4l = t4l = H4l;
                    h5h = t5h = H5h;
                    h5l = t5l = H5l;
                    h6h = t6h = H6h;
                    h6l = t6l = H6l;
                    h7h = t7h = H7h;
                    h7l = t7l = H7l;

                    count = (count-1)|0;

                    // perform the rest iterations
                    while ( (count|0) > 0 ) {
                        hmac_reset();
                        _core( t0h, t0l, t1h, t1l, t2h, t2l, t3h, t3l, t4h, t4l, t5h, t5l, t6h, t6l, t7h, t7l, 0x80000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1536 );

                        t0h = H0h;
                        t0l = H0l;
                        t1h = H1h;
                        t1l = H1l;
                        t2h = H2h;
                        t2l = H2l;
                        t3h = H3h;
                        t3l = H3l;
                        t4h = H4h;
                        t4l = H4l;
                        t5h = H5h;
                        t5l = H5l;
                        t6h = H6h;
                        t6l = H6l;
                        t7h = H7h;
                        t7l = H7l;

                        _hmac_opad();
                        _core( t0h, t0l, t1h, t1l, t2h, t2l, t3h, t3l, t4h, t4l, t5h, t5l, t6h, t6l, t7h, t7l, 0x80000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1536 );

                        t0h = H0h;
                        t0l = H0l;
                        t1h = H1h;
                        t1l = H1l;
                        t2h = H2h;
                        t2l = H2l;
                        t3h = H3h;
                        t3l = H3l;
                        t4h = H4h;
                        t4l = H4l;
                        t5h = H5h;
                        t5l = H5l;
                        t6h = H6h;
                        t6l = H6l;
                        t7h = H7h;
                        t7l = H7l;

                        h0h = h0h ^ H0h;
                        h0l = h0l ^ H0l;
                        h1h = h1h ^ H1h;
                        h1l = h1l ^ H1l;
                        h2h = h2h ^ H2h;
                        h2l = h2l ^ H2l;
                        h3h = h3h ^ H3h;
                        h3l = h3l ^ H3l;
                        h4h = h4h ^ H4h;
                        h4l = h4l ^ H4l;
                        h5h = h5h ^ H5h;
                        h5l = h5l ^ H5l;
                        h6h = h6h ^ H6h;
                        h6l = h6l ^ H6l;
                        h7h = h7h ^ H7h;
                        h7l = h7l ^ H7l;

                        count = (count-1)|0;
                    }

                    H0h = h0h;
                    H0l = h0l;
                    H1h = h1h;
                    H1l = h1l;
                    H2h = h2h;
                    H2l = h2l;
                    H3h = h3h;
                    H3l = h3l;
                    H4h = h4h;
                    H4l = h4l;
                    H5h = h5h;
                    H5l = h5l;
                    H6h = h6h;
                    H6l = h6l;
                    H7h = h7h;
                    H7l = h7l;

                    if ( ~output )
                        _state_to_heap(output);

                    return 0;
                }

                return {
                  // SHA512
                  reset: reset,
                  init: init,
                  process: process,
                  finish: finish,

                  // HMAC-SHA512
                  hmac_reset: hmac_reset,
                  hmac_init: hmac_init,
                  hmac_finish: hmac_finish,

                  // PBKDF2-HMAC-SHA512
                  pbkdf2_generate_block: pbkdf2_generate_block
                }
            };

            const _sha512_block_size = 128;
            const _sha512_hash_size = 64;
            class Sha512 extends Hash {
                constructor() {
                    super();
                    this.NAME = 'sha512';
                    this.BLOCK_SIZE = _sha512_block_size;
                    this.HASH_SIZE = _sha512_hash_size;
                    this.heap = _heap_init();
                    this.asm = sha512_asm({ Uint8Array: Uint8Array }, null, this.heap.buffer);
                    this.reset();
                }
            }
            Sha512.NAME = 'sha512';

            class Hmac {
                constructor(hash, password, verify) {
                    if (!hash.HASH_SIZE)
                        throw new SyntaxError("option 'hash' supplied doesn't seem to be a valid hash function");
                    this.hash = hash;
                    this.BLOCK_SIZE = this.hash.BLOCK_SIZE;
                    this.HMAC_SIZE = this.hash.HASH_SIZE;
                    this.result = null;
                    this.key = _hmac_key(this.hash, password);
                    const ipad = new Uint8Array(this.key);
                    for (let i = 0; i < ipad.length; ++i)
                        ipad[i] ^= 0x36;
                    this.hash.reset().process(ipad);
                    if (verify !== undefined) {
                        this._hmac_init_verify(verify);
                    }
                    else {
                        this.verify = null;
                    }
                }
                process(data) {
                    if (this.result !== null)
                        throw new IllegalStateError('state must be reset before processing new data');
                    this.hash.process(data);
                    return this;
                }
                finish() {
                    if (this.result !== null)
                        throw new IllegalStateError('state must be reset before processing new data');
                    const inner_result = this.hash.finish().result;
                    const opad = new Uint8Array(this.key);
                    for (let i = 0; i < opad.length; ++i)
                        opad[i] ^= 0x5c;
                    const verify = this.verify;
                    const result = this.hash
                        .reset()
                        .process(opad)
                        .process(inner_result)
                        .finish().result;
                    if (verify) {
                        if (verify.length === result.length) {
                            let diff = 0;
                            for (let i = 0; i < verify.length; i++) {
                                diff |= verify[i] ^ result[i];
                            }
                            if (diff !== 0)
                                throw new Error("HMAC verification failed, hash value doesn't match");
                        }
                        else {
                            throw new Error("HMAC verification failed, lengths doesn't match");
                        }
                    }
                    this.result = result;
                    return this;
                }
                _hmac_init_verify(verify) {
                    if (verify.length !== this.HMAC_SIZE)
                        throw new IllegalArgumentError('illegal verification tag size');
                    this.verify = verify;
                }
            }
            function _hmac_key(hash, password) {
                const key = new Uint8Array(hash.BLOCK_SIZE);
                if (password.length > hash.BLOCK_SIZE) {
                    key.set(hash
                        .reset()
                        .process(password)
                        .finish().result);
                }
                else {
                    key.set(password);
                }
                return key;
            }

            class HmacSha512 extends Hmac {
                constructor(password, verify) {
                    const hash = new Sha512();
                    // Calculate ipad, init the underlying engine, calculate this.key
                    super(hash, password, verify);
                    this.reset();
                    if (verify !== undefined) {
                        this._hmac_init_verify(verify);
                    }
                    else {
                        this.verify = null;
                    }
                    return this;
                }
                reset() {
                    const key = this.key;
                    this.hash
                        .reset()
                        .asm.hmac_init((key[0] << 24) | (key[1] << 16) | (key[2] << 8) | key[3], (key[4] << 24) | (key[5] << 16) | (key[6] << 8) | key[7], (key[8] << 24) | (key[9] << 16) | (key[10] << 8) | key[11], (key[12] << 24) | (key[13] << 16) | (key[14] << 8) | key[15], (key[16] << 24) | (key[17] << 16) | (key[18] << 8) | key[19], (key[20] << 24) | (key[21] << 16) | (key[22] << 8) | key[23], (key[24] << 24) | (key[25] << 16) | (key[26] << 8) | key[27], (key[28] << 24) | (key[29] << 16) | (key[30] << 8) | key[31], (key[32] << 24) | (key[33] << 16) | (key[34] << 8) | key[35], (key[36] << 24) | (key[37] << 16) | (key[38] << 8) | key[39], (key[40] << 24) | (key[41] << 16) | (key[42] << 8) | key[43], (key[44] << 24) | (key[45] << 16) | (key[46] << 8) | key[47], (key[48] << 24) | (key[49] << 16) | (key[50] << 8) | key[51], (key[52] << 24) | (key[53] << 16) | (key[54] << 8) | key[55], (key[56] << 24) | (key[57] << 16) | (key[58] << 8) | key[59], (key[60] << 24) | (key[61] << 16) | (key[62] << 8) | key[63], (key[64] << 24) | (key[65] << 16) | (key[66] << 8) | key[67], (key[68] << 24) | (key[69] << 16) | (key[70] << 8) | key[71], (key[72] << 24) | (key[73] << 16) | (key[74] << 8) | key[75], (key[76] << 24) | (key[77] << 16) | (key[78] << 8) | key[79], (key[80] << 24) | (key[81] << 16) | (key[82] << 8) | key[83], (key[84] << 24) | (key[85] << 16) | (key[86] << 8) | key[87], (key[88] << 24) | (key[89] << 16) | (key[90] << 8) | key[91], (key[92] << 24) | (key[93] << 16) | (key[94] << 8) | key[95], (key[96] << 24) | (key[97] << 16) | (key[98] << 8) | key[99], (key[100] << 24) | (key[101] << 16) | (key[102] << 8) | key[103], (key[104] << 24) | (key[105] << 16) | (key[106] << 8) | key[107], (key[108] << 24) | (key[109] << 16) | (key[110] << 8) | key[111], (key[112] << 24) | (key[113] << 16) | (key[114] << 8) | key[115], (key[116] << 24) | (key[117] << 16) | (key[118] << 8) | key[119], (key[120] << 24) | (key[121] << 16) | (key[122] << 8) | key[123], (key[124] << 24) | (key[125] << 16) | (key[126] << 8) | key[127]);
                    return this;
                }
                finish() {
                    if (this.key === null)
                        throw new IllegalStateError('no key is associated with the instance');
                    if (this.result !== null)
                        throw new IllegalStateError('state must be reset before processing new data');
                    const hash = this.hash;
                    const asm = this.hash.asm;
                    const heap = this.hash.heap;
                    asm.hmac_finish(hash.pos, hash.len, 0);
                    const verify = this.verify;
                    const result = new Uint8Array(_sha512_hash_size);
                    result.set(heap.subarray(0, _sha512_hash_size));
                    if (verify) {
                        if (verify.length === result.length) {
                            let diff = 0;
                            for (let i = 0; i < verify.length; i++) {
                                diff |= verify[i] ^ result[i];
                            }
                            if (diff !== 0)
                                throw new Error("HMAC verification failed, hash value doesn't match");
                        }
                        else {
                            throw new Error("HMAC verification failed, lengths doesn't match");
                        }
                    }
                    else {
                        this.result = result;
                    }
                    return this;
                }
            }

            // import { HmacSha512, AES_CBC, Sha512, base64_to_bytes, bytes_to_base64 } from "asmcrypto.js"

            const kdf = async (seed, salt, status = () => {}) => {
                const state = store.getState();
                const config = state.config;
                const workers = state.app.workers.workers;
                status('Waiting for workers to be ready');
                await stateAwait(state => state.app.workers.ready);
                status('Deriving key parts');
                salt = new Uint8Array(salt);
                const seedParts = await Promise.all(workers.map((worker, index) => {
                    const nonce = index;
                    return worker.request('kdf', {
                        key: seed,
                        salt,
                        nonce,
                        staticSalt: config.crypto.staticSalt,
                        staticBcryptSalt: config.crypto.staticBcryptSalt
                    }).then(data => {
                        // console.log('response:', data)
                        // Hmmm... it's not json?
                        // data = JSON.parse(data)
                        let jsonData;
                        try {
                            jsonData = JSON.parse(data);
                            data = jsonData;
                        } catch (e) { 
                            // console.error ('JSON NO WORKEY', e) 
                        }
                        if (seed !== data.key) throw new Error('Error, incorrect key. ' + seed + ' !== ' + data.key)
                        if (nonce !== data.nonce) throw new Error('Error, incorrect nonce')
                        return data.result
                    })
                }));
                status('Combining key parts');
                const result = new Sha512().process(utils.stringtoUTF8Array(config.crypto.staticSalt + seedParts.reduce((a, c) => a + c))).finish().result;
                status('Key is ready ');
                return result
            };

            // == CHANGE TO ES6 EXPORT == //
            const nacl = {};

            // Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
            // Public domain.
            //
            // Implementation derived from TweetNaCl version 20140427.
            // See for details: http://tweetnacl.cr.yp.to/

            var gf = function(init) {
              var i, r = new Float64Array(16);
              if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
              return r;
            };

            //  Pluggable, initialized in high-level API below.
            var randombytes = function(/* x, n */) { throw new Error('no PRNG'); };

            var _0 = new Uint8Array(16);
            var _9 = new Uint8Array(32); _9[0] = 9;

            var gf0 = gf(),
                gf1 = gf([1]),
                _121665 = gf([0xdb41, 1]),
                D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
                D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
                X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
                Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
                I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

            function ts64(x, i, h, l) {
              x[i]   = (h >> 24) & 0xff;
              x[i+1] = (h >> 16) & 0xff;
              x[i+2] = (h >>  8) & 0xff;
              x[i+3] = h & 0xff;
              x[i+4] = (l >> 24)  & 0xff;
              x[i+5] = (l >> 16)  & 0xff;
              x[i+6] = (l >>  8)  & 0xff;
              x[i+7] = l & 0xff;
            }

            function vn(x, xi, y, yi, n) {
              var i,d = 0;
              for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
              return (1 & ((d - 1) >>> 8)) - 1;
            }

            function crypto_verify_16(x, xi, y, yi) {
              return vn(x,xi,y,yi,16);
            }

            function crypto_verify_32(x, xi, y, yi) {
              return vn(x,xi,y,yi,32);
            }

            function core_salsa20(o, p, k, c) {
              var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
                  j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
                  j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
                  j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
                  j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
                  j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
                  j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
                  j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
                  j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
                  j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
                  j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
                  j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
                  j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
                  j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
                  j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
                  j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

              var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
                  x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
                  x15 = j15, u;

              for (var i = 0; i < 20; i += 2) {
                u = x0 + x12 | 0;
                x4 ^= u<<7 | u>>>(32-7);
                u = x4 + x0 | 0;
                x8 ^= u<<9 | u>>>(32-9);
                u = x8 + x4 | 0;
                x12 ^= u<<13 | u>>>(32-13);
                u = x12 + x8 | 0;
                x0 ^= u<<18 | u>>>(32-18);

                u = x5 + x1 | 0;
                x9 ^= u<<7 | u>>>(32-7);
                u = x9 + x5 | 0;
                x13 ^= u<<9 | u>>>(32-9);
                u = x13 + x9 | 0;
                x1 ^= u<<13 | u>>>(32-13);
                u = x1 + x13 | 0;
                x5 ^= u<<18 | u>>>(32-18);

                u = x10 + x6 | 0;
                x14 ^= u<<7 | u>>>(32-7);
                u = x14 + x10 | 0;
                x2 ^= u<<9 | u>>>(32-9);
                u = x2 + x14 | 0;
                x6 ^= u<<13 | u>>>(32-13);
                u = x6 + x2 | 0;
                x10 ^= u<<18 | u>>>(32-18);

                u = x15 + x11 | 0;
                x3 ^= u<<7 | u>>>(32-7);
                u = x3 + x15 | 0;
                x7 ^= u<<9 | u>>>(32-9);
                u = x7 + x3 | 0;
                x11 ^= u<<13 | u>>>(32-13);
                u = x11 + x7 | 0;
                x15 ^= u<<18 | u>>>(32-18);

                u = x0 + x3 | 0;
                x1 ^= u<<7 | u>>>(32-7);
                u = x1 + x0 | 0;
                x2 ^= u<<9 | u>>>(32-9);
                u = x2 + x1 | 0;
                x3 ^= u<<13 | u>>>(32-13);
                u = x3 + x2 | 0;
                x0 ^= u<<18 | u>>>(32-18);

                u = x5 + x4 | 0;
                x6 ^= u<<7 | u>>>(32-7);
                u = x6 + x5 | 0;
                x7 ^= u<<9 | u>>>(32-9);
                u = x7 + x6 | 0;
                x4 ^= u<<13 | u>>>(32-13);
                u = x4 + x7 | 0;
                x5 ^= u<<18 | u>>>(32-18);

                u = x10 + x9 | 0;
                x11 ^= u<<7 | u>>>(32-7);
                u = x11 + x10 | 0;
                x8 ^= u<<9 | u>>>(32-9);
                u = x8 + x11 | 0;
                x9 ^= u<<13 | u>>>(32-13);
                u = x9 + x8 | 0;
                x10 ^= u<<18 | u>>>(32-18);

                u = x15 + x14 | 0;
                x12 ^= u<<7 | u>>>(32-7);
                u = x12 + x15 | 0;
                x13 ^= u<<9 | u>>>(32-9);
                u = x13 + x12 | 0;
                x14 ^= u<<13 | u>>>(32-13);
                u = x14 + x13 | 0;
                x15 ^= u<<18 | u>>>(32-18);
              }
               x0 =  x0 +  j0 | 0;
               x1 =  x1 +  j1 | 0;
               x2 =  x2 +  j2 | 0;
               x3 =  x3 +  j3 | 0;
               x4 =  x4 +  j4 | 0;
               x5 =  x5 +  j5 | 0;
               x6 =  x6 +  j6 | 0;
               x7 =  x7 +  j7 | 0;
               x8 =  x8 +  j8 | 0;
               x9 =  x9 +  j9 | 0;
              x10 = x10 + j10 | 0;
              x11 = x11 + j11 | 0;
              x12 = x12 + j12 | 0;
              x13 = x13 + j13 | 0;
              x14 = x14 + j14 | 0;
              x15 = x15 + j15 | 0;

              o[ 0] = x0 >>>  0 & 0xff;
              o[ 1] = x0 >>>  8 & 0xff;
              o[ 2] = x0 >>> 16 & 0xff;
              o[ 3] = x0 >>> 24 & 0xff;

              o[ 4] = x1 >>>  0 & 0xff;
              o[ 5] = x1 >>>  8 & 0xff;
              o[ 6] = x1 >>> 16 & 0xff;
              o[ 7] = x1 >>> 24 & 0xff;

              o[ 8] = x2 >>>  0 & 0xff;
              o[ 9] = x2 >>>  8 & 0xff;
              o[10] = x2 >>> 16 & 0xff;
              o[11] = x2 >>> 24 & 0xff;

              o[12] = x3 >>>  0 & 0xff;
              o[13] = x3 >>>  8 & 0xff;
              o[14] = x3 >>> 16 & 0xff;
              o[15] = x3 >>> 24 & 0xff;

              o[16] = x4 >>>  0 & 0xff;
              o[17] = x4 >>>  8 & 0xff;
              o[18] = x4 >>> 16 & 0xff;
              o[19] = x4 >>> 24 & 0xff;

              o[20] = x5 >>>  0 & 0xff;
              o[21] = x5 >>>  8 & 0xff;
              o[22] = x5 >>> 16 & 0xff;
              o[23] = x5 >>> 24 & 0xff;

              o[24] = x6 >>>  0 & 0xff;
              o[25] = x6 >>>  8 & 0xff;
              o[26] = x6 >>> 16 & 0xff;
              o[27] = x6 >>> 24 & 0xff;

              o[28] = x7 >>>  0 & 0xff;
              o[29] = x7 >>>  8 & 0xff;
              o[30] = x7 >>> 16 & 0xff;
              o[31] = x7 >>> 24 & 0xff;

              o[32] = x8 >>>  0 & 0xff;
              o[33] = x8 >>>  8 & 0xff;
              o[34] = x8 >>> 16 & 0xff;
              o[35] = x8 >>> 24 & 0xff;

              o[36] = x9 >>>  0 & 0xff;
              o[37] = x9 >>>  8 & 0xff;
              o[38] = x9 >>> 16 & 0xff;
              o[39] = x9 >>> 24 & 0xff;

              o[40] = x10 >>>  0 & 0xff;
              o[41] = x10 >>>  8 & 0xff;
              o[42] = x10 >>> 16 & 0xff;
              o[43] = x10 >>> 24 & 0xff;

              o[44] = x11 >>>  0 & 0xff;
              o[45] = x11 >>>  8 & 0xff;
              o[46] = x11 >>> 16 & 0xff;
              o[47] = x11 >>> 24 & 0xff;

              o[48] = x12 >>>  0 & 0xff;
              o[49] = x12 >>>  8 & 0xff;
              o[50] = x12 >>> 16 & 0xff;
              o[51] = x12 >>> 24 & 0xff;

              o[52] = x13 >>>  0 & 0xff;
              o[53] = x13 >>>  8 & 0xff;
              o[54] = x13 >>> 16 & 0xff;
              o[55] = x13 >>> 24 & 0xff;

              o[56] = x14 >>>  0 & 0xff;
              o[57] = x14 >>>  8 & 0xff;
              o[58] = x14 >>> 16 & 0xff;
              o[59] = x14 >>> 24 & 0xff;

              o[60] = x15 >>>  0 & 0xff;
              o[61] = x15 >>>  8 & 0xff;
              o[62] = x15 >>> 16 & 0xff;
              o[63] = x15 >>> 24 & 0xff;
            }

            function core_hsalsa20(o,p,k,c) {
              var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
                  j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
                  j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
                  j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
                  j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
                  j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
                  j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
                  j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
                  j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
                  j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
                  j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
                  j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
                  j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
                  j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
                  j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
                  j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

              var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
                  x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
                  x15 = j15, u;

              for (var i = 0; i < 20; i += 2) {
                u = x0 + x12 | 0;
                x4 ^= u<<7 | u>>>(32-7);
                u = x4 + x0 | 0;
                x8 ^= u<<9 | u>>>(32-9);
                u = x8 + x4 | 0;
                x12 ^= u<<13 | u>>>(32-13);
                u = x12 + x8 | 0;
                x0 ^= u<<18 | u>>>(32-18);

                u = x5 + x1 | 0;
                x9 ^= u<<7 | u>>>(32-7);
                u = x9 + x5 | 0;
                x13 ^= u<<9 | u>>>(32-9);
                u = x13 + x9 | 0;
                x1 ^= u<<13 | u>>>(32-13);
                u = x1 + x13 | 0;
                x5 ^= u<<18 | u>>>(32-18);

                u = x10 + x6 | 0;
                x14 ^= u<<7 | u>>>(32-7);
                u = x14 + x10 | 0;
                x2 ^= u<<9 | u>>>(32-9);
                u = x2 + x14 | 0;
                x6 ^= u<<13 | u>>>(32-13);
                u = x6 + x2 | 0;
                x10 ^= u<<18 | u>>>(32-18);

                u = x15 + x11 | 0;
                x3 ^= u<<7 | u>>>(32-7);
                u = x3 + x15 | 0;
                x7 ^= u<<9 | u>>>(32-9);
                u = x7 + x3 | 0;
                x11 ^= u<<13 | u>>>(32-13);
                u = x11 + x7 | 0;
                x15 ^= u<<18 | u>>>(32-18);

                u = x0 + x3 | 0;
                x1 ^= u<<7 | u>>>(32-7);
                u = x1 + x0 | 0;
                x2 ^= u<<9 | u>>>(32-9);
                u = x2 + x1 | 0;
                x3 ^= u<<13 | u>>>(32-13);
                u = x3 + x2 | 0;
                x0 ^= u<<18 | u>>>(32-18);

                u = x5 + x4 | 0;
                x6 ^= u<<7 | u>>>(32-7);
                u = x6 + x5 | 0;
                x7 ^= u<<9 | u>>>(32-9);
                u = x7 + x6 | 0;
                x4 ^= u<<13 | u>>>(32-13);
                u = x4 + x7 | 0;
                x5 ^= u<<18 | u>>>(32-18);

                u = x10 + x9 | 0;
                x11 ^= u<<7 | u>>>(32-7);
                u = x11 + x10 | 0;
                x8 ^= u<<9 | u>>>(32-9);
                u = x8 + x11 | 0;
                x9 ^= u<<13 | u>>>(32-13);
                u = x9 + x8 | 0;
                x10 ^= u<<18 | u>>>(32-18);

                u = x15 + x14 | 0;
                x12 ^= u<<7 | u>>>(32-7);
                u = x12 + x15 | 0;
                x13 ^= u<<9 | u>>>(32-9);
                u = x13 + x12 | 0;
                x14 ^= u<<13 | u>>>(32-13);
                u = x14 + x13 | 0;
                x15 ^= u<<18 | u>>>(32-18);
              }

              o[ 0] = x0 >>>  0 & 0xff;
              o[ 1] = x0 >>>  8 & 0xff;
              o[ 2] = x0 >>> 16 & 0xff;
              o[ 3] = x0 >>> 24 & 0xff;

              o[ 4] = x5 >>>  0 & 0xff;
              o[ 5] = x5 >>>  8 & 0xff;
              o[ 6] = x5 >>> 16 & 0xff;
              o[ 7] = x5 >>> 24 & 0xff;

              o[ 8] = x10 >>>  0 & 0xff;
              o[ 9] = x10 >>>  8 & 0xff;
              o[10] = x10 >>> 16 & 0xff;
              o[11] = x10 >>> 24 & 0xff;

              o[12] = x15 >>>  0 & 0xff;
              o[13] = x15 >>>  8 & 0xff;
              o[14] = x15 >>> 16 & 0xff;
              o[15] = x15 >>> 24 & 0xff;

              o[16] = x6 >>>  0 & 0xff;
              o[17] = x6 >>>  8 & 0xff;
              o[18] = x6 >>> 16 & 0xff;
              o[19] = x6 >>> 24 & 0xff;

              o[20] = x7 >>>  0 & 0xff;
              o[21] = x7 >>>  8 & 0xff;
              o[22] = x7 >>> 16 & 0xff;
              o[23] = x7 >>> 24 & 0xff;

              o[24] = x8 >>>  0 & 0xff;
              o[25] = x8 >>>  8 & 0xff;
              o[26] = x8 >>> 16 & 0xff;
              o[27] = x8 >>> 24 & 0xff;

              o[28] = x9 >>>  0 & 0xff;
              o[29] = x9 >>>  8 & 0xff;
              o[30] = x9 >>> 16 & 0xff;
              o[31] = x9 >>> 24 & 0xff;
            }

            function crypto_core_salsa20(out,inp,k,c) {
              core_salsa20(out,inp,k,c);
            }

            function crypto_core_hsalsa20(out,inp,k,c) {
              core_hsalsa20(out,inp,k,c);
            }

            var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
                        // "expand 32-byte k"

            function crypto_stream_salsa20_xor(c,cpos,m,mpos,b,n,k) {
              var z = new Uint8Array(16), x = new Uint8Array(64);
              var u, i;
              for (i = 0; i < 16; i++) z[i] = 0;
              for (i = 0; i < 8; i++) z[i] = n[i];
              while (b >= 64) {
                crypto_core_salsa20(x,z,k,sigma);
                for (i = 0; i < 64; i++) c[cpos+i] = m[mpos+i] ^ x[i];
                u = 1;
                for (i = 8; i < 16; i++) {
                  u = u + (z[i] & 0xff) | 0;
                  z[i] = u & 0xff;
                  u >>>= 8;
                }
                b -= 64;
                cpos += 64;
                mpos += 64;
              }
              if (b > 0) {
                crypto_core_salsa20(x,z,k,sigma);
                for (i = 0; i < b; i++) c[cpos+i] = m[mpos+i] ^ x[i];
              }
              return 0;
            }

            function crypto_stream_salsa20(c,cpos,b,n,k) {
              var z = new Uint8Array(16), x = new Uint8Array(64);
              var u, i;
              for (i = 0; i < 16; i++) z[i] = 0;
              for (i = 0; i < 8; i++) z[i] = n[i];
              while (b >= 64) {
                crypto_core_salsa20(x,z,k,sigma);
                for (i = 0; i < 64; i++) c[cpos+i] = x[i];
                u = 1;
                for (i = 8; i < 16; i++) {
                  u = u + (z[i] & 0xff) | 0;
                  z[i] = u & 0xff;
                  u >>>= 8;
                }
                b -= 64;
                cpos += 64;
              }
              if (b > 0) {
                crypto_core_salsa20(x,z,k,sigma);
                for (i = 0; i < b; i++) c[cpos+i] = x[i];
              }
              return 0;
            }

            function crypto_stream(c,cpos,d,n,k) {
              var s = new Uint8Array(32);
              crypto_core_hsalsa20(s,n,k,sigma);
              var sn = new Uint8Array(8);
              for (var i = 0; i < 8; i++) sn[i] = n[i+16];
              return crypto_stream_salsa20(c,cpos,d,sn,s);
            }

            function crypto_stream_xor(c,cpos,m,mpos,d,n,k) {
              var s = new Uint8Array(32);
              crypto_core_hsalsa20(s,n,k,sigma);
              var sn = new Uint8Array(8);
              for (var i = 0; i < 8; i++) sn[i] = n[i+16];
              return crypto_stream_salsa20_xor(c,cpos,m,mpos,d,sn,s);
            }

            /*
            * Port of Andrew Moon's Poly1305-donna-16. Public domain.
            * https://github.com/floodyberry/poly1305-donna
            */

            var poly1305 = function(key) {
              this.buffer = new Uint8Array(16);
              this.r = new Uint16Array(10);
              this.h = new Uint16Array(10);
              this.pad = new Uint16Array(8);
              this.leftover = 0;
              this.fin = 0;

              var t0, t1, t2, t3, t4, t5, t6, t7;

              t0 = key[ 0] & 0xff | (key[ 1] & 0xff) << 8; this.r[0] = ( t0                     ) & 0x1fff;
              t1 = key[ 2] & 0xff | (key[ 3] & 0xff) << 8; this.r[1] = ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
              t2 = key[ 4] & 0xff | (key[ 5] & 0xff) << 8; this.r[2] = ((t1 >>> 10) | (t2 <<  6)) & 0x1f03;
              t3 = key[ 6] & 0xff | (key[ 7] & 0xff) << 8; this.r[3] = ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
              t4 = key[ 8] & 0xff | (key[ 9] & 0xff) << 8; this.r[4] = ((t3 >>>  4) | (t4 << 12)) & 0x00ff;
              this.r[5] = ((t4 >>>  1)) & 0x1ffe;
              t5 = key[10] & 0xff | (key[11] & 0xff) << 8; this.r[6] = ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
              t6 = key[12] & 0xff | (key[13] & 0xff) << 8; this.r[7] = ((t5 >>> 11) | (t6 <<  5)) & 0x1f81;
              t7 = key[14] & 0xff | (key[15] & 0xff) << 8; this.r[8] = ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
              this.r[9] = ((t7 >>>  5)) & 0x007f;

              this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
              this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
              this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
              this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
              this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
              this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
              this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
              this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
            };

            poly1305.prototype.blocks = function(m, mpos, bytes) {
              var hibit = this.fin ? 0 : (1 << 11);
              var t0, t1, t2, t3, t4, t5, t6, t7, c;
              var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;

              var h0 = this.h[0],
                  h1 = this.h[1],
                  h2 = this.h[2],
                  h3 = this.h[3],
                  h4 = this.h[4],
                  h5 = this.h[5],
                  h6 = this.h[6],
                  h7 = this.h[7],
                  h8 = this.h[8],
                  h9 = this.h[9];

              var r0 = this.r[0],
                  r1 = this.r[1],
                  r2 = this.r[2],
                  r3 = this.r[3],
                  r4 = this.r[4],
                  r5 = this.r[5],
                  r6 = this.r[6],
                  r7 = this.r[7],
                  r8 = this.r[8],
                  r9 = this.r[9];

              while (bytes >= 16) {
                t0 = m[mpos+ 0] & 0xff | (m[mpos+ 1] & 0xff) << 8; h0 += ( t0                     ) & 0x1fff;
                t1 = m[mpos+ 2] & 0xff | (m[mpos+ 3] & 0xff) << 8; h1 += ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
                t2 = m[mpos+ 4] & 0xff | (m[mpos+ 5] & 0xff) << 8; h2 += ((t1 >>> 10) | (t2 <<  6)) & 0x1fff;
                t3 = m[mpos+ 6] & 0xff | (m[mpos+ 7] & 0xff) << 8; h3 += ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
                t4 = m[mpos+ 8] & 0xff | (m[mpos+ 9] & 0xff) << 8; h4 += ((t3 >>>  4) | (t4 << 12)) & 0x1fff;
                h5 += ((t4 >>>  1)) & 0x1fff;
                t5 = m[mpos+10] & 0xff | (m[mpos+11] & 0xff) << 8; h6 += ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
                t6 = m[mpos+12] & 0xff | (m[mpos+13] & 0xff) << 8; h7 += ((t5 >>> 11) | (t6 <<  5)) & 0x1fff;
                t7 = m[mpos+14] & 0xff | (m[mpos+15] & 0xff) << 8; h8 += ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
                h9 += ((t7 >>> 5)) | hibit;

                c = 0;

                d0 = c;
                d0 += h0 * r0;
                d0 += h1 * (5 * r9);
                d0 += h2 * (5 * r8);
                d0 += h3 * (5 * r7);
                d0 += h4 * (5 * r6);
                c = (d0 >>> 13); d0 &= 0x1fff;
                d0 += h5 * (5 * r5);
                d0 += h6 * (5 * r4);
                d0 += h7 * (5 * r3);
                d0 += h8 * (5 * r2);
                d0 += h9 * (5 * r1);
                c += (d0 >>> 13); d0 &= 0x1fff;

                d1 = c;
                d1 += h0 * r1;
                d1 += h1 * r0;
                d1 += h2 * (5 * r9);
                d1 += h3 * (5 * r8);
                d1 += h4 * (5 * r7);
                c = (d1 >>> 13); d1 &= 0x1fff;
                d1 += h5 * (5 * r6);
                d1 += h6 * (5 * r5);
                d1 += h7 * (5 * r4);
                d1 += h8 * (5 * r3);
                d1 += h9 * (5 * r2);
                c += (d1 >>> 13); d1 &= 0x1fff;

                d2 = c;
                d2 += h0 * r2;
                d2 += h1 * r1;
                d2 += h2 * r0;
                d2 += h3 * (5 * r9);
                d2 += h4 * (5 * r8);
                c = (d2 >>> 13); d2 &= 0x1fff;
                d2 += h5 * (5 * r7);
                d2 += h6 * (5 * r6);
                d2 += h7 * (5 * r5);
                d2 += h8 * (5 * r4);
                d2 += h9 * (5 * r3);
                c += (d2 >>> 13); d2 &= 0x1fff;

                d3 = c;
                d3 += h0 * r3;
                d3 += h1 * r2;
                d3 += h2 * r1;
                d3 += h3 * r0;
                d3 += h4 * (5 * r9);
                c = (d3 >>> 13); d3 &= 0x1fff;
                d3 += h5 * (5 * r8);
                d3 += h6 * (5 * r7);
                d3 += h7 * (5 * r6);
                d3 += h8 * (5 * r5);
                d3 += h9 * (5 * r4);
                c += (d3 >>> 13); d3 &= 0x1fff;

                d4 = c;
                d4 += h0 * r4;
                d4 += h1 * r3;
                d4 += h2 * r2;
                d4 += h3 * r1;
                d4 += h4 * r0;
                c = (d4 >>> 13); d4 &= 0x1fff;
                d4 += h5 * (5 * r9);
                d4 += h6 * (5 * r8);
                d4 += h7 * (5 * r7);
                d4 += h8 * (5 * r6);
                d4 += h9 * (5 * r5);
                c += (d4 >>> 13); d4 &= 0x1fff;

                d5 = c;
                d5 += h0 * r5;
                d5 += h1 * r4;
                d5 += h2 * r3;
                d5 += h3 * r2;
                d5 += h4 * r1;
                c = (d5 >>> 13); d5 &= 0x1fff;
                d5 += h5 * r0;
                d5 += h6 * (5 * r9);
                d5 += h7 * (5 * r8);
                d5 += h8 * (5 * r7);
                d5 += h9 * (5 * r6);
                c += (d5 >>> 13); d5 &= 0x1fff;

                d6 = c;
                d6 += h0 * r6;
                d6 += h1 * r5;
                d6 += h2 * r4;
                d6 += h3 * r3;
                d6 += h4 * r2;
                c = (d6 >>> 13); d6 &= 0x1fff;
                d6 += h5 * r1;
                d6 += h6 * r0;
                d6 += h7 * (5 * r9);
                d6 += h8 * (5 * r8);
                d6 += h9 * (5 * r7);
                c += (d6 >>> 13); d6 &= 0x1fff;

                d7 = c;
                d7 += h0 * r7;
                d7 += h1 * r6;
                d7 += h2 * r5;
                d7 += h3 * r4;
                d7 += h4 * r3;
                c = (d7 >>> 13); d7 &= 0x1fff;
                d7 += h5 * r2;
                d7 += h6 * r1;
                d7 += h7 * r0;
                d7 += h8 * (5 * r9);
                d7 += h9 * (5 * r8);
                c += (d7 >>> 13); d7 &= 0x1fff;

                d8 = c;
                d8 += h0 * r8;
                d8 += h1 * r7;
                d8 += h2 * r6;
                d8 += h3 * r5;
                d8 += h4 * r4;
                c = (d8 >>> 13); d8 &= 0x1fff;
                d8 += h5 * r3;
                d8 += h6 * r2;
                d8 += h7 * r1;
                d8 += h8 * r0;
                d8 += h9 * (5 * r9);
                c += (d8 >>> 13); d8 &= 0x1fff;

                d9 = c;
                d9 += h0 * r9;
                d9 += h1 * r8;
                d9 += h2 * r7;
                d9 += h3 * r6;
                d9 += h4 * r5;
                c = (d9 >>> 13); d9 &= 0x1fff;
                d9 += h5 * r4;
                d9 += h6 * r3;
                d9 += h7 * r2;
                d9 += h8 * r1;
                d9 += h9 * r0;
                c += (d9 >>> 13); d9 &= 0x1fff;

                c = (((c << 2) + c)) | 0;
                c = (c + d0) | 0;
                d0 = c & 0x1fff;
                c = (c >>> 13);
                d1 += c;

                h0 = d0;
                h1 = d1;
                h2 = d2;
                h3 = d3;
                h4 = d4;
                h5 = d5;
                h6 = d6;
                h7 = d7;
                h8 = d8;
                h9 = d9;

                mpos += 16;
                bytes -= 16;
              }
              this.h[0] = h0;
              this.h[1] = h1;
              this.h[2] = h2;
              this.h[3] = h3;
              this.h[4] = h4;
              this.h[5] = h5;
              this.h[6] = h6;
              this.h[7] = h7;
              this.h[8] = h8;
              this.h[9] = h9;
            };

            poly1305.prototype.finish = function(mac, macpos) {
              var g = new Uint16Array(10);
              var c, mask, f, i;

              if (this.leftover) {
                i = this.leftover;
                this.buffer[i++] = 1;
                for (; i < 16; i++) this.buffer[i] = 0;
                this.fin = 1;
                this.blocks(this.buffer, 0, 16);
              }

              c = this.h[1] >>> 13;
              this.h[1] &= 0x1fff;
              for (i = 2; i < 10; i++) {
                this.h[i] += c;
                c = this.h[i] >>> 13;
                this.h[i] &= 0x1fff;
              }
              this.h[0] += (c * 5);
              c = this.h[0] >>> 13;
              this.h[0] &= 0x1fff;
              this.h[1] += c;
              c = this.h[1] >>> 13;
              this.h[1] &= 0x1fff;
              this.h[2] += c;

              g[0] = this.h[0] + 5;
              c = g[0] >>> 13;
              g[0] &= 0x1fff;
              for (i = 1; i < 10; i++) {
                g[i] = this.h[i] + c;
                c = g[i] >>> 13;
                g[i] &= 0x1fff;
              }
              g[9] -= (1 << 13);

              mask = (g[9] >>> ((2 * 8) - 1)) - 1;
              for (i = 0; i < 10; i++) g[i] &= mask;
              mask = ~mask;
              for (i = 0; i < 10; i++) this.h[i] = (this.h[i] & mask) | g[i];

              this.h[0] = ((this.h[0]       ) | (this.h[1] << 13)                    ) & 0xffff;
              this.h[1] = ((this.h[1] >>>  3) | (this.h[2] << 10)                    ) & 0xffff;
              this.h[2] = ((this.h[2] >>>  6) | (this.h[3] <<  7)                    ) & 0xffff;
              this.h[3] = ((this.h[3] >>>  9) | (this.h[4] <<  4)                    ) & 0xffff;
              this.h[4] = ((this.h[4] >>> 12) | (this.h[5] <<  1) | (this.h[6] << 14)) & 0xffff;
              this.h[5] = ((this.h[6] >>>  2) | (this.h[7] << 11)                    ) & 0xffff;
              this.h[6] = ((this.h[7] >>>  5) | (this.h[8] <<  8)                    ) & 0xffff;
              this.h[7] = ((this.h[8] >>>  8) | (this.h[9] <<  5)                    ) & 0xffff;

              f = this.h[0] + this.pad[0];
              this.h[0] = f & 0xffff;
              for (i = 1; i < 8; i++) {
                f = (((this.h[i] + this.pad[i]) | 0) + (f >>> 16)) | 0;
                this.h[i] = f & 0xffff;
              }

              mac[macpos+ 0] = (this.h[0] >>> 0) & 0xff;
              mac[macpos+ 1] = (this.h[0] >>> 8) & 0xff;
              mac[macpos+ 2] = (this.h[1] >>> 0) & 0xff;
              mac[macpos+ 3] = (this.h[1] >>> 8) & 0xff;
              mac[macpos+ 4] = (this.h[2] >>> 0) & 0xff;
              mac[macpos+ 5] = (this.h[2] >>> 8) & 0xff;
              mac[macpos+ 6] = (this.h[3] >>> 0) & 0xff;
              mac[macpos+ 7] = (this.h[3] >>> 8) & 0xff;
              mac[macpos+ 8] = (this.h[4] >>> 0) & 0xff;
              mac[macpos+ 9] = (this.h[4] >>> 8) & 0xff;
              mac[macpos+10] = (this.h[5] >>> 0) & 0xff;
              mac[macpos+11] = (this.h[5] >>> 8) & 0xff;
              mac[macpos+12] = (this.h[6] >>> 0) & 0xff;
              mac[macpos+13] = (this.h[6] >>> 8) & 0xff;
              mac[macpos+14] = (this.h[7] >>> 0) & 0xff;
              mac[macpos+15] = (this.h[7] >>> 8) & 0xff;
            };

            poly1305.prototype.update = function(m, mpos, bytes) {
              var i, want;

              if (this.leftover) {
                want = (16 - this.leftover);
                if (want > bytes)
                  want = bytes;
                for (i = 0; i < want; i++)
                  this.buffer[this.leftover + i] = m[mpos+i];
                bytes -= want;
                mpos += want;
                this.leftover += want;
                if (this.leftover < 16)
                  return;
                this.blocks(this.buffer, 0, 16);
                this.leftover = 0;
              }

              if (bytes >= 16) {
                want = bytes - (bytes % 16);
                this.blocks(m, mpos, want);
                mpos += want;
                bytes -= want;
              }

              if (bytes) {
                for (i = 0; i < bytes; i++)
                  this.buffer[this.leftover + i] = m[mpos+i];
                this.leftover += bytes;
              }
            };

            function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
              var s = new poly1305(k);
              s.update(m, mpos, n);
              s.finish(out, outpos);
              return 0;
            }

            function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
              var x = new Uint8Array(16);
              crypto_onetimeauth(x,0,m,mpos,n,k);
              return crypto_verify_16(h,hpos,x,0);
            }

            function crypto_secretbox(c,m,d,n,k) {
              var i;
              if (d < 32) return -1;
              crypto_stream_xor(c,0,m,0,d,n,k);
              crypto_onetimeauth(c, 16, c, 32, d - 32, c);
              for (i = 0; i < 16; i++) c[i] = 0;
              return 0;
            }

            function crypto_secretbox_open(m,c,d,n,k) {
              var i;
              var x = new Uint8Array(32);
              if (d < 32) return -1;
              crypto_stream(x,0,32,n,k);
              if (crypto_onetimeauth_verify(c, 16,c, 32,d - 32,x) !== 0) return -1;
              crypto_stream_xor(m,0,c,0,d,n,k);
              for (i = 0; i < 32; i++) m[i] = 0;
              return 0;
            }

            function set25519(r, a) {
              var i;
              for (i = 0; i < 16; i++) r[i] = a[i]|0;
            }

            function car25519(o) {
              var i, v, c = 1;
              for (i = 0; i < 16; i++) {
                v = o[i] + c + 65535;
                c = Math.floor(v / 65536);
                o[i] = v - c * 65536;
              }
              o[0] += c-1 + 37 * (c-1);
            }

            function sel25519(p, q, b) {
              var t, c = ~(b-1);
              for (var i = 0; i < 16; i++) {
                t = c & (p[i] ^ q[i]);
                p[i] ^= t;
                q[i] ^= t;
              }
            }

            function pack25519(o, n) {
              var i, j, b;
              var m = gf(), t = gf();
              for (i = 0; i < 16; i++) t[i] = n[i];
              car25519(t);
              car25519(t);
              car25519(t);
              for (j = 0; j < 2; j++) {
                m[0] = t[0] - 0xffed;
                for (i = 1; i < 15; i++) {
                  m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
                  m[i-1] &= 0xffff;
                }
                m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
                b = (m[15]>>16) & 1;
                m[14] &= 0xffff;
                sel25519(t, m, 1-b);
              }
              for (i = 0; i < 16; i++) {
                o[2*i] = t[i] & 0xff;
                o[2*i+1] = t[i]>>8;
              }
            }

            function neq25519(a, b) {
              var c = new Uint8Array(32), d = new Uint8Array(32);
              pack25519(c, a);
              pack25519(d, b);
              return crypto_verify_32(c, 0, d, 0);
            }

            function par25519(a) {
              var d = new Uint8Array(32);
              pack25519(d, a);
              return d[0] & 1;
            }

            function unpack25519(o, n) {
              var i;
              for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
              o[15] &= 0x7fff;
            }

            function A(o, a, b) {
              for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
            }

            function Z(o, a, b) {
              for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
            }

            function M(o, a, b) {
              var v, c,
                 t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
                 t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
                t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
                t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
                b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3],
                b4 = b[4],
                b5 = b[5],
                b6 = b[6],
                b7 = b[7],
                b8 = b[8],
                b9 = b[9],
                b10 = b[10],
                b11 = b[11],
                b12 = b[12],
                b13 = b[13],
                b14 = b[14],
                b15 = b[15];

              v = a[0];
              t0 += v * b0;
              t1 += v * b1;
              t2 += v * b2;
              t3 += v * b3;
              t4 += v * b4;
              t5 += v * b5;
              t6 += v * b6;
              t7 += v * b7;
              t8 += v * b8;
              t9 += v * b9;
              t10 += v * b10;
              t11 += v * b11;
              t12 += v * b12;
              t13 += v * b13;
              t14 += v * b14;
              t15 += v * b15;
              v = a[1];
              t1 += v * b0;
              t2 += v * b1;
              t3 += v * b2;
              t4 += v * b3;
              t5 += v * b4;
              t6 += v * b5;
              t7 += v * b6;
              t8 += v * b7;
              t9 += v * b8;
              t10 += v * b9;
              t11 += v * b10;
              t12 += v * b11;
              t13 += v * b12;
              t14 += v * b13;
              t15 += v * b14;
              t16 += v * b15;
              v = a[2];
              t2 += v * b0;
              t3 += v * b1;
              t4 += v * b2;
              t5 += v * b3;
              t6 += v * b4;
              t7 += v * b5;
              t8 += v * b6;
              t9 += v * b7;
              t10 += v * b8;
              t11 += v * b9;
              t12 += v * b10;
              t13 += v * b11;
              t14 += v * b12;
              t15 += v * b13;
              t16 += v * b14;
              t17 += v * b15;
              v = a[3];
              t3 += v * b0;
              t4 += v * b1;
              t5 += v * b2;
              t6 += v * b3;
              t7 += v * b4;
              t8 += v * b5;
              t9 += v * b6;
              t10 += v * b7;
              t11 += v * b8;
              t12 += v * b9;
              t13 += v * b10;
              t14 += v * b11;
              t15 += v * b12;
              t16 += v * b13;
              t17 += v * b14;
              t18 += v * b15;
              v = a[4];
              t4 += v * b0;
              t5 += v * b1;
              t6 += v * b2;
              t7 += v * b3;
              t8 += v * b4;
              t9 += v * b5;
              t10 += v * b6;
              t11 += v * b7;
              t12 += v * b8;
              t13 += v * b9;
              t14 += v * b10;
              t15 += v * b11;
              t16 += v * b12;
              t17 += v * b13;
              t18 += v * b14;
              t19 += v * b15;
              v = a[5];
              t5 += v * b0;
              t6 += v * b1;
              t7 += v * b2;
              t8 += v * b3;
              t9 += v * b4;
              t10 += v * b5;
              t11 += v * b6;
              t12 += v * b7;
              t13 += v * b8;
              t14 += v * b9;
              t15 += v * b10;
              t16 += v * b11;
              t17 += v * b12;
              t18 += v * b13;
              t19 += v * b14;
              t20 += v * b15;
              v = a[6];
              t6 += v * b0;
              t7 += v * b1;
              t8 += v * b2;
              t9 += v * b3;
              t10 += v * b4;
              t11 += v * b5;
              t12 += v * b6;
              t13 += v * b7;
              t14 += v * b8;
              t15 += v * b9;
              t16 += v * b10;
              t17 += v * b11;
              t18 += v * b12;
              t19 += v * b13;
              t20 += v * b14;
              t21 += v * b15;
              v = a[7];
              t7 += v * b0;
              t8 += v * b1;
              t9 += v * b2;
              t10 += v * b3;
              t11 += v * b4;
              t12 += v * b5;
              t13 += v * b6;
              t14 += v * b7;
              t15 += v * b8;
              t16 += v * b9;
              t17 += v * b10;
              t18 += v * b11;
              t19 += v * b12;
              t20 += v * b13;
              t21 += v * b14;
              t22 += v * b15;
              v = a[8];
              t8 += v * b0;
              t9 += v * b1;
              t10 += v * b2;
              t11 += v * b3;
              t12 += v * b4;
              t13 += v * b5;
              t14 += v * b6;
              t15 += v * b7;
              t16 += v * b8;
              t17 += v * b9;
              t18 += v * b10;
              t19 += v * b11;
              t20 += v * b12;
              t21 += v * b13;
              t22 += v * b14;
              t23 += v * b15;
              v = a[9];
              t9 += v * b0;
              t10 += v * b1;
              t11 += v * b2;
              t12 += v * b3;
              t13 += v * b4;
              t14 += v * b5;
              t15 += v * b6;
              t16 += v * b7;
              t17 += v * b8;
              t18 += v * b9;
              t19 += v * b10;
              t20 += v * b11;
              t21 += v * b12;
              t22 += v * b13;
              t23 += v * b14;
              t24 += v * b15;
              v = a[10];
              t10 += v * b0;
              t11 += v * b1;
              t12 += v * b2;
              t13 += v * b3;
              t14 += v * b4;
              t15 += v * b5;
              t16 += v * b6;
              t17 += v * b7;
              t18 += v * b8;
              t19 += v * b9;
              t20 += v * b10;
              t21 += v * b11;
              t22 += v * b12;
              t23 += v * b13;
              t24 += v * b14;
              t25 += v * b15;
              v = a[11];
              t11 += v * b0;
              t12 += v * b1;
              t13 += v * b2;
              t14 += v * b3;
              t15 += v * b4;
              t16 += v * b5;
              t17 += v * b6;
              t18 += v * b7;
              t19 += v * b8;
              t20 += v * b9;
              t21 += v * b10;
              t22 += v * b11;
              t23 += v * b12;
              t24 += v * b13;
              t25 += v * b14;
              t26 += v * b15;
              v = a[12];
              t12 += v * b0;
              t13 += v * b1;
              t14 += v * b2;
              t15 += v * b3;
              t16 += v * b4;
              t17 += v * b5;
              t18 += v * b6;
              t19 += v * b7;
              t20 += v * b8;
              t21 += v * b9;
              t22 += v * b10;
              t23 += v * b11;
              t24 += v * b12;
              t25 += v * b13;
              t26 += v * b14;
              t27 += v * b15;
              v = a[13];
              t13 += v * b0;
              t14 += v * b1;
              t15 += v * b2;
              t16 += v * b3;
              t17 += v * b4;
              t18 += v * b5;
              t19 += v * b6;
              t20 += v * b7;
              t21 += v * b8;
              t22 += v * b9;
              t23 += v * b10;
              t24 += v * b11;
              t25 += v * b12;
              t26 += v * b13;
              t27 += v * b14;
              t28 += v * b15;
              v = a[14];
              t14 += v * b0;
              t15 += v * b1;
              t16 += v * b2;
              t17 += v * b3;
              t18 += v * b4;
              t19 += v * b5;
              t20 += v * b6;
              t21 += v * b7;
              t22 += v * b8;
              t23 += v * b9;
              t24 += v * b10;
              t25 += v * b11;
              t26 += v * b12;
              t27 += v * b13;
              t28 += v * b14;
              t29 += v * b15;
              v = a[15];
              t15 += v * b0;
              t16 += v * b1;
              t17 += v * b2;
              t18 += v * b3;
              t19 += v * b4;
              t20 += v * b5;
              t21 += v * b6;
              t22 += v * b7;
              t23 += v * b8;
              t24 += v * b9;
              t25 += v * b10;
              t26 += v * b11;
              t27 += v * b12;
              t28 += v * b13;
              t29 += v * b14;
              t30 += v * b15;

              t0  += 38 * t16;
              t1  += 38 * t17;
              t2  += 38 * t18;
              t3  += 38 * t19;
              t4  += 38 * t20;
              t5  += 38 * t21;
              t6  += 38 * t22;
              t7  += 38 * t23;
              t8  += 38 * t24;
              t9  += 38 * t25;
              t10 += 38 * t26;
              t11 += 38 * t27;
              t12 += 38 * t28;
              t13 += 38 * t29;
              t14 += 38 * t30;
              // t15 left as is

              // first car
              c = 1;
              v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
              v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
              v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
              v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
              v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
              v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
              v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
              v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
              v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
              v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
              v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
              v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
              v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
              v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
              v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
              v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
              t0 += c-1 + 37 * (c-1);

              // second car
              c = 1;
              v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
              v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
              v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
              v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
              v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
              v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
              v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
              v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
              v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
              v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
              v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
              v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
              v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
              v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
              v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
              v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
              t0 += c-1 + 37 * (c-1);

              o[ 0] = t0;
              o[ 1] = t1;
              o[ 2] = t2;
              o[ 3] = t3;
              o[ 4] = t4;
              o[ 5] = t5;
              o[ 6] = t6;
              o[ 7] = t7;
              o[ 8] = t8;
              o[ 9] = t9;
              o[10] = t10;
              o[11] = t11;
              o[12] = t12;
              o[13] = t13;
              o[14] = t14;
              o[15] = t15;
            }

            function S(o, a) {
              M(o, a, a);
            }

            function inv25519(o, i) {
              var c = gf();
              var a;
              for (a = 0; a < 16; a++) c[a] = i[a];
              for (a = 253; a >= 0; a--) {
                S(c, c);
                if(a !== 2 && a !== 4) M(c, c, i);
              }
              for (a = 0; a < 16; a++) o[a] = c[a];
            }

            function pow2523(o, i) {
              var c = gf();
              var a;
              for (a = 0; a < 16; a++) c[a] = i[a];
              for (a = 250; a >= 0; a--) {
                  S(c, c);
                  if(a !== 1) M(c, c, i);
              }
              for (a = 0; a < 16; a++) o[a] = c[a];
            }

            function crypto_scalarmult(q, n, p) {
              var z = new Uint8Array(32);
              var x = new Float64Array(80), r, i;
              var a = gf(), b = gf(), c = gf(),
                  d = gf(), e = gf(), f = gf();
              for (i = 0; i < 31; i++) z[i] = n[i];
              z[31]=(n[31]&127)|64;
              z[0]&=248;
              unpack25519(x,p);
              for (i = 0; i < 16; i++) {
                b[i]=x[i];
                d[i]=a[i]=c[i]=0;
              }
              a[0]=d[0]=1;
              for (i=254; i>=0; --i) {
                r=(z[i>>>3]>>>(i&7))&1;
                sel25519(a,b,r);
                sel25519(c,d,r);
                A(e,a,c);
                Z(a,a,c);
                A(c,b,d);
                Z(b,b,d);
                S(d,e);
                S(f,a);
                M(a,c,a);
                M(c,b,e);
                A(e,a,c);
                Z(a,a,c);
                S(b,a);
                Z(c,d,f);
                M(a,c,_121665);
                A(a,a,d);
                M(c,c,a);
                M(a,d,f);
                M(d,b,x);
                S(b,e);
                sel25519(a,b,r);
                sel25519(c,d,r);
              }
              for (i = 0; i < 16; i++) {
                x[i+16]=a[i];
                x[i+32]=c[i];
                x[i+48]=b[i];
                x[i+64]=d[i];
              }
              var x32 = x.subarray(32);
              var x16 = x.subarray(16);
              inv25519(x32,x32);
              M(x16,x16,x32);
              pack25519(q,x16);
              return 0;
            }

            function crypto_scalarmult_base(q, n) {
              return crypto_scalarmult(q, n, _9);
            }

            function crypto_box_keypair(y, x) {
              randombytes(x, 32);
              return crypto_scalarmult_base(y, x);
            }

            function crypto_box_beforenm(k, y, x) {
              var s = new Uint8Array(32);
              crypto_scalarmult(s, x, y);
              return crypto_core_hsalsa20(k, _0, s, sigma);
            }

            var crypto_box_afternm = crypto_secretbox;
            var crypto_box_open_afternm = crypto_secretbox_open;

            function crypto_box(c, m, d, n, y, x) {
              var k = new Uint8Array(32);
              crypto_box_beforenm(k, y, x);
              return crypto_box_afternm(c, m, d, n, k);
            }

            function crypto_box_open(m, c, d, n, y, x) {
              var k = new Uint8Array(32);
              crypto_box_beforenm(k, y, x);
              return crypto_box_open_afternm(m, c, d, n, k);
            }

            var K = [
              0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
              0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
              0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
              0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
              0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
              0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
              0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
              0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
              0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
              0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
              0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
              0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
              0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
              0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
              0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
              0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
              0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
              0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
              0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
              0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
              0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
              0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
              0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
              0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
              0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
              0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
              0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
              0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
              0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
              0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
              0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
              0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
              0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
              0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
              0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
              0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
              0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
              0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
              0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
              0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
            ];

            function crypto_hashblocks_hl(hh, hl, m, n) {
              var wh = new Int32Array(16), wl = new Int32Array(16),
                  bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
                  bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
                  th, tl, i, j, h, l, a, b, c, d;

              var ah0 = hh[0],
                  ah1 = hh[1],
                  ah2 = hh[2],
                  ah3 = hh[3],
                  ah4 = hh[4],
                  ah5 = hh[5],
                  ah6 = hh[6],
                  ah7 = hh[7],

                  al0 = hl[0],
                  al1 = hl[1],
                  al2 = hl[2],
                  al3 = hl[3],
                  al4 = hl[4],
                  al5 = hl[5],
                  al6 = hl[6],
                  al7 = hl[7];

              var pos = 0;
              while (n >= 128) {
                for (i = 0; i < 16; i++) {
                  j = 8 * i + pos;
                  wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
                  wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
                }
                for (i = 0; i < 80; i++) {
                  bh0 = ah0;
                  bh1 = ah1;
                  bh2 = ah2;
                  bh3 = ah3;
                  bh4 = ah4;
                  bh5 = ah5;
                  bh6 = ah6;
                  bh7 = ah7;

                  bl0 = al0;
                  bl1 = al1;
                  bl2 = al2;
                  bl3 = al3;
                  bl4 = al4;
                  bl5 = al5;
                  bl6 = al6;
                  bl7 = al7;

                  // add
                  h = ah7;
                  l = al7;

                  a = l & 0xffff; b = l >>> 16;
                  c = h & 0xffff; d = h >>> 16;

                  // Sigma1
                  h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
                  l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  // Ch
                  h = (ah4 & ah5) ^ (~ah4 & ah6);
                  l = (al4 & al5) ^ (~al4 & al6);

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  // K
                  h = K[i*2];
                  l = K[i*2+1];

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  // w
                  h = wh[i%16];
                  l = wl[i%16];

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  b += a >>> 16;
                  c += b >>> 16;
                  d += c >>> 16;

                  th = c & 0xffff | d << 16;
                  tl = a & 0xffff | b << 16;

                  // add
                  h = th;
                  l = tl;

                  a = l & 0xffff; b = l >>> 16;
                  c = h & 0xffff; d = h >>> 16;

                  // Sigma0
                  h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
                  l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  // Maj
                  h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
                  l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  b += a >>> 16;
                  c += b >>> 16;
                  d += c >>> 16;

                  bh7 = (c & 0xffff) | (d << 16);
                  bl7 = (a & 0xffff) | (b << 16);

                  // add
                  h = bh3;
                  l = bl3;

                  a = l & 0xffff; b = l >>> 16;
                  c = h & 0xffff; d = h >>> 16;

                  h = th;
                  l = tl;

                  a += l & 0xffff; b += l >>> 16;
                  c += h & 0xffff; d += h >>> 16;

                  b += a >>> 16;
                  c += b >>> 16;
                  d += c >>> 16;

                  bh3 = (c & 0xffff) | (d << 16);
                  bl3 = (a & 0xffff) | (b << 16);

                  ah1 = bh0;
                  ah2 = bh1;
                  ah3 = bh2;
                  ah4 = bh3;
                  ah5 = bh4;
                  ah6 = bh5;
                  ah7 = bh6;
                  ah0 = bh7;

                  al1 = bl0;
                  al2 = bl1;
                  al3 = bl2;
                  al4 = bl3;
                  al5 = bl4;
                  al6 = bl5;
                  al7 = bl6;
                  al0 = bl7;

                  if (i%16 === 15) {
                    for (j = 0; j < 16; j++) {
                      // add
                      h = wh[j];
                      l = wl[j];

                      a = l & 0xffff; b = l >>> 16;
                      c = h & 0xffff; d = h >>> 16;

                      h = wh[(j+9)%16];
                      l = wl[(j+9)%16];

                      a += l & 0xffff; b += l >>> 16;
                      c += h & 0xffff; d += h >>> 16;

                      // sigma0
                      th = wh[(j+1)%16];
                      tl = wl[(j+1)%16];
                      h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
                      l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

                      a += l & 0xffff; b += l >>> 16;
                      c += h & 0xffff; d += h >>> 16;

                      // sigma1
                      th = wh[(j+14)%16];
                      tl = wl[(j+14)%16];
                      h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
                      l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

                      a += l & 0xffff; b += l >>> 16;
                      c += h & 0xffff; d += h >>> 16;

                      b += a >>> 16;
                      c += b >>> 16;
                      d += c >>> 16;

                      wh[j] = (c & 0xffff) | (d << 16);
                      wl[j] = (a & 0xffff) | (b << 16);
                    }
                  }
                }

                // add
                h = ah0;
                l = al0;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[0];
                l = hl[0];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[0] = ah0 = (c & 0xffff) | (d << 16);
                hl[0] = al0 = (a & 0xffff) | (b << 16);

                h = ah1;
                l = al1;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[1];
                l = hl[1];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[1] = ah1 = (c & 0xffff) | (d << 16);
                hl[1] = al1 = (a & 0xffff) | (b << 16);

                h = ah2;
                l = al2;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[2];
                l = hl[2];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[2] = ah2 = (c & 0xffff) | (d << 16);
                hl[2] = al2 = (a & 0xffff) | (b << 16);

                h = ah3;
                l = al3;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[3];
                l = hl[3];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[3] = ah3 = (c & 0xffff) | (d << 16);
                hl[3] = al3 = (a & 0xffff) | (b << 16);

                h = ah4;
                l = al4;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[4];
                l = hl[4];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[4] = ah4 = (c & 0xffff) | (d << 16);
                hl[4] = al4 = (a & 0xffff) | (b << 16);

                h = ah5;
                l = al5;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[5];
                l = hl[5];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[5] = ah5 = (c & 0xffff) | (d << 16);
                hl[5] = al5 = (a & 0xffff) | (b << 16);

                h = ah6;
                l = al6;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[6];
                l = hl[6];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[6] = ah6 = (c & 0xffff) | (d << 16);
                hl[6] = al6 = (a & 0xffff) | (b << 16);

                h = ah7;
                l = al7;

                a = l & 0xffff; b = l >>> 16;
                c = h & 0xffff; d = h >>> 16;

                h = hh[7];
                l = hl[7];

                a += l & 0xffff; b += l >>> 16;
                c += h & 0xffff; d += h >>> 16;

                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;

                hh[7] = ah7 = (c & 0xffff) | (d << 16);
                hl[7] = al7 = (a & 0xffff) | (b << 16);

                pos += 128;
                n -= 128;
              }

              return n;
            }

            function crypto_hash(out, m, n) {
              var hh = new Int32Array(8),
                  hl = new Int32Array(8),
                  x = new Uint8Array(256),
                  i, b = n;

              hh[0] = 0x6a09e667;
              hh[1] = 0xbb67ae85;
              hh[2] = 0x3c6ef372;
              hh[3] = 0xa54ff53a;
              hh[4] = 0x510e527f;
              hh[5] = 0x9b05688c;
              hh[6] = 0x1f83d9ab;
              hh[7] = 0x5be0cd19;

              hl[0] = 0xf3bcc908;
              hl[1] = 0x84caa73b;
              hl[2] = 0xfe94f82b;
              hl[3] = 0x5f1d36f1;
              hl[4] = 0xade682d1;
              hl[5] = 0x2b3e6c1f;
              hl[6] = 0xfb41bd6b;
              hl[7] = 0x137e2179;

              crypto_hashblocks_hl(hh, hl, m, n);
              n %= 128;

              for (i = 0; i < n; i++) x[i] = m[b-n+i];
              x[n] = 128;

              n = 256-128*(n<112?1:0);
              x[n-9] = 0;
              ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
              crypto_hashblocks_hl(hh, hl, x, n);

              for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

              return 0;
            }

            function add(p, q) {
              var a = gf(), b = gf(), c = gf(),
                  d = gf(), e = gf(), f = gf(),
                  g = gf(), h = gf(), t = gf();

              Z(a, p[1], p[0]);
              Z(t, q[1], q[0]);
              M(a, a, t);
              A(b, p[0], p[1]);
              A(t, q[0], q[1]);
              M(b, b, t);
              M(c, p[3], q[3]);
              M(c, c, D2);
              M(d, p[2], q[2]);
              A(d, d, d);
              Z(e, b, a);
              Z(f, d, c);
              A(g, d, c);
              A(h, b, a);

              M(p[0], e, f);
              M(p[1], h, g);
              M(p[2], g, f);
              M(p[3], e, h);
            }

            function cswap(p, q, b) {
              var i;
              for (i = 0; i < 4; i++) {
                sel25519(p[i], q[i], b);
              }
            }

            function pack(r, p) {
              var tx = gf(), ty = gf(), zi = gf();
              inv25519(zi, p[2]);
              M(tx, p[0], zi);
              M(ty, p[1], zi);
              pack25519(r, ty);
              r[31] ^= par25519(tx) << 7;
            }

            function scalarmult(p, q, s) {
              var b, i;
              set25519(p[0], gf0);
              set25519(p[1], gf1);
              set25519(p[2], gf1);
              set25519(p[3], gf0);
              for (i = 255; i >= 0; --i) {
                b = (s[(i/8)|0] >> (i&7)) & 1;
                cswap(p, q, b);
                add(q, p);
                add(p, p);
                cswap(p, q, b);
              }
            }

            function scalarbase(p, s) {
              var q = [gf(), gf(), gf(), gf()];
              set25519(q[0], X);
              set25519(q[1], Y);
              set25519(q[2], gf1);
              M(q[3], X, Y);
              scalarmult(p, q, s);
            }

            function crypto_sign_keypair(pk, sk, seeded) {
              var d = new Uint8Array(64);
              var p = [gf(), gf(), gf(), gf()];
              var i;

              if (!seeded) randombytes(sk, 32);
              crypto_hash(d, sk, 32);
              d[0] &= 248;
              d[31] &= 127;
              d[31] |= 64;

              scalarbase(p, d);
              pack(pk, p);

              for (i = 0; i < 32; i++) sk[i+32] = pk[i];
              return 0;
            }

            var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

            function modL(r, x) {
              var carry, i, j, k;
              for (i = 63; i >= 32; --i) {
                carry = 0;
                for (j = i - 32, k = i - 12; j < k; ++j) {
                  x[j] += carry - 16 * x[i] * L[j - (i - 32)];
                  carry = (x[j] + 128) >> 8;
                  x[j] -= carry * 256;
                }
                x[j] += carry;
                x[i] = 0;
              }
              carry = 0;
              for (j = 0; j < 32; j++) {
                x[j] += carry - (x[31] >> 4) * L[j];
                carry = x[j] >> 8;
                x[j] &= 255;
              }
              for (j = 0; j < 32; j++) x[j] -= carry * L[j];
              for (i = 0; i < 32; i++) {
                x[i+1] += x[i] >> 8;
                r[i] = x[i] & 255;
              }
            }

            function reduce(r) {
              var x = new Float64Array(64), i;
              for (i = 0; i < 64; i++) x[i] = r[i];
              for (i = 0; i < 64; i++) r[i] = 0;
              modL(r, x);
            }

            // Note: difference from C - smlen returned, not passed as argument.
            function crypto_sign(sm, m, n, sk) {
              var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
              var i, j, x = new Float64Array(64);
              var p = [gf(), gf(), gf(), gf()];

              crypto_hash(d, sk, 32);
              d[0] &= 248;
              d[31] &= 127;
              d[31] |= 64;

              var smlen = n + 64;
              for (i = 0; i < n; i++) sm[64 + i] = m[i];
              for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

              crypto_hash(r, sm.subarray(32), n+32);
              reduce(r);
              scalarbase(p, r);
              pack(sm, p);

              for (i = 32; i < 64; i++) sm[i] = sk[i];
              crypto_hash(h, sm, n + 64);
              reduce(h);

              for (i = 0; i < 64; i++) x[i] = 0;
              for (i = 0; i < 32; i++) x[i] = r[i];
              for (i = 0; i < 32; i++) {
                for (j = 0; j < 32; j++) {
                  x[i+j] += h[i] * d[j];
                }
              }

              modL(sm.subarray(32), x);
              return smlen;
            }

            function unpackneg(r, p) {
              var t = gf(), chk = gf(), num = gf(),
                  den = gf(), den2 = gf(), den4 = gf(),
                  den6 = gf();

              set25519(r[2], gf1);
              unpack25519(r[1], p);
              S(num, r[1]);
              M(den, num, D);
              Z(num, num, r[2]);
              A(den, r[2], den);

              S(den2, den);
              S(den4, den2);
              M(den6, den4, den2);
              M(t, den6, num);
              M(t, t, den);

              pow2523(t, t);
              M(t, t, num);
              M(t, t, den);
              M(t, t, den);
              M(r[0], t, den);

              S(chk, r[0]);
              M(chk, chk, den);
              if (neq25519(chk, num)) M(r[0], r[0], I);

              S(chk, r[0]);
              M(chk, chk, den);
              if (neq25519(chk, num)) return -1;

              if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

              M(r[3], r[0], r[1]);
              return 0;
            }

            function crypto_sign_open(m, sm, n, pk) {
              var i, mlen;
              var t = new Uint8Array(32), h = new Uint8Array(64);
              var p = [gf(), gf(), gf(), gf()],
                  q = [gf(), gf(), gf(), gf()];

              mlen = -1;
              if (n < 64) return -1;

              if (unpackneg(q, pk)) return -1;

              for (i = 0; i < n; i++) m[i] = sm[i];
              for (i = 0; i < 32; i++) m[i+32] = pk[i];
              crypto_hash(h, m, n);
              reduce(h);
              scalarmult(p, q, h);

              scalarbase(q, sm.subarray(32));
              add(p, q);
              pack(t, p);

              n -= 64;
              if (crypto_verify_32(sm, 0, t, 0)) {
                for (i = 0; i < n; i++) m[i] = 0;
                return -1;
              }

              for (i = 0; i < n; i++) m[i] = sm[i + 64];
              mlen = n;
              return mlen;
            }

            var crypto_secretbox_KEYBYTES = 32,
                crypto_secretbox_NONCEBYTES = 24,
                crypto_secretbox_ZEROBYTES = 32,
                crypto_secretbox_BOXZEROBYTES = 16,
                crypto_scalarmult_BYTES = 32,
                crypto_scalarmult_SCALARBYTES = 32,
                crypto_box_PUBLICKEYBYTES = 32,
                crypto_box_SECRETKEYBYTES = 32,
                crypto_box_BEFORENMBYTES = 32,
                crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
                crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
                crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
                crypto_sign_BYTES = 64,
                crypto_sign_PUBLICKEYBYTES = 32,
                crypto_sign_SECRETKEYBYTES = 64,
                crypto_sign_SEEDBYTES = 32,
                crypto_hash_BYTES = 64;

            nacl.lowlevel = {
              crypto_core_hsalsa20: crypto_core_hsalsa20,
              crypto_stream_xor: crypto_stream_xor,
              crypto_stream: crypto_stream,
              crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
              crypto_stream_salsa20: crypto_stream_salsa20,
              crypto_onetimeauth: crypto_onetimeauth,
              crypto_onetimeauth_verify: crypto_onetimeauth_verify,
              crypto_verify_16: crypto_verify_16,
              crypto_verify_32: crypto_verify_32,
              crypto_secretbox: crypto_secretbox,
              crypto_secretbox_open: crypto_secretbox_open,
              crypto_scalarmult: crypto_scalarmult,
              crypto_scalarmult_base: crypto_scalarmult_base,
              crypto_box_beforenm: crypto_box_beforenm,
              crypto_box_afternm: crypto_box_afternm,
              crypto_box: crypto_box,
              crypto_box_open: crypto_box_open,
              crypto_box_keypair: crypto_box_keypair,
              crypto_hash: crypto_hash,
              crypto_sign: crypto_sign,
              crypto_sign_keypair: crypto_sign_keypair,
              crypto_sign_open: crypto_sign_open,

              crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
              crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
              crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
              crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
              crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
              crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
              crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
              crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
              crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
              crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
              crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
              crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
              crypto_sign_BYTES: crypto_sign_BYTES,
              crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
              crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
              crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
              crypto_hash_BYTES: crypto_hash_BYTES
            };

            /* High-level API */

            function checkLengths(k, n) {
              if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
              if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
            }

            function checkBoxLengths(pk, sk) {
              if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
              if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
            }

            function checkArrayTypes() {
              var t, i;
              for (i = 0; i < arguments.length; i++) {
                 if ((t = Object.prototype.toString.call(arguments[i])) !== '[object Uint8Array]')
                   throw new TypeError('unexpected type ' + t + ', use Uint8Array');
              }
            }

            function cleanup(arr) {
              for (var i = 0; i < arr.length; i++) arr[i] = 0;
            }

            nacl.util = {};

            nacl.util.decodeUTF8 = function(s) {
              var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
              for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
              return b;
            };

            nacl.util.encodeUTF8 = function(arr) {
              var i, s = [];
              for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
              return decodeURIComponent(escape(s.join('')));
            };

            nacl.util.encodeBase64 = function(arr) {
              if (typeof btoa === 'undefined') {
                return (new Buffer(arr)).toString('base64');
              } else {
                var i, s = [], len = arr.length;
                for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
                return btoa(s.join(''));
              }
            };

            nacl.util.decodeBase64 = function(s) {
              if (typeof atob === 'undefined') {
                return new Uint8Array(Array.prototype.slice.call(new Buffer(s, 'base64'), 0));
              } else {
                var i, d = atob(s), b = new Uint8Array(d.length);
                for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
                return b;
              }
            };

            nacl.randomBytes = function(n) {
              var b = new Uint8Array(n);
              randombytes(b, n);
              return b;
            };

            nacl.secretbox = function(msg, nonce, key) {
              checkArrayTypes(msg, nonce, key);
              checkLengths(key, nonce);
              var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
              var c = new Uint8Array(m.length);
              for (var i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i];
              crypto_secretbox(c, m, m.length, nonce, key);
              return c.subarray(crypto_secretbox_BOXZEROBYTES);
            };

            nacl.secretbox.open = function(box, nonce, key) {
              checkArrayTypes(box, nonce, key);
              checkLengths(key, nonce);
              var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
              var m = new Uint8Array(c.length);
              for (var i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i];
              if (c.length < 32) return false;
              if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return false;
              return m.subarray(crypto_secretbox_ZEROBYTES);
            };

            nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
            nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
            nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;

            nacl.scalarMult = function(n, p) {
              checkArrayTypes(n, p);
              if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
              if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
              var q = new Uint8Array(crypto_scalarmult_BYTES);
              crypto_scalarmult(q, n, p);
              return q;
            };

            nacl.scalarMult.base = function(n) {
              checkArrayTypes(n);
              if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
              var q = new Uint8Array(crypto_scalarmult_BYTES);
              crypto_scalarmult_base(q, n);
              return q;
            };

            nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
            nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;

            nacl.box = function(msg, nonce, publicKey, secretKey) {
              var k = nacl.box.before(publicKey, secretKey);
              return nacl.secretbox(msg, nonce, k);
            };

            nacl.box.before = function(publicKey, secretKey) {
              checkArrayTypes(publicKey, secretKey);
              checkBoxLengths(publicKey, secretKey);
              var k = new Uint8Array(crypto_box_BEFORENMBYTES);
              crypto_box_beforenm(k, publicKey, secretKey);
              return k;
            };

            nacl.box.after = nacl.secretbox;

            nacl.box.open = function(msg, nonce, publicKey, secretKey) {
              var k = nacl.box.before(publicKey, secretKey);
              return nacl.secretbox.open(msg, nonce, k);
            };

            nacl.box.open.after = nacl.secretbox.open;

            nacl.box.keyPair = function() {
              var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
              var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
              crypto_box_keypair(pk, sk);
              return {publicKey: pk, secretKey: sk};
            };

            nacl.box.keyPair.fromSecretKey = function(secretKey) {
              checkArrayTypes(secretKey);
              if (secretKey.length !== crypto_box_SECRETKEYBYTES)
                throw new Error('bad secret key size');
              var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
              crypto_scalarmult_base(pk, secretKey);
              return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
            };

            nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
            nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
            nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
            nacl.box.nonceLength = crypto_box_NONCEBYTES;
            nacl.box.overheadLength = nacl.secretbox.overheadLength;

            nacl.sign = function(msg, secretKey) {
              checkArrayTypes(msg, secretKey);
              if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
                throw new Error('bad secret key size');
              var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
              crypto_sign(signedMsg, msg, msg.length, secretKey);
              return signedMsg;
            };

            nacl.sign.open = function(signedMsg, publicKey) {
              if (arguments.length !== 2)
                throw new Error('nacl.sign.open accepts 2 arguments; did you mean to use nacl.sign.detached.verify?');
              checkArrayTypes(signedMsg, publicKey);
              if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
                throw new Error('bad public key size');
              var tmp = new Uint8Array(signedMsg.length);
              var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
              if (mlen < 0) return null;
              var m = new Uint8Array(mlen);
              for (var i = 0; i < m.length; i++) m[i] = tmp[i];
              return m;
            };

            nacl.sign.detached = function(msg, secretKey) {
              var signedMsg = nacl.sign(msg, secretKey);
              var sig = new Uint8Array(crypto_sign_BYTES);
              for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
              return sig;
            };

            nacl.sign.detached.verify = function(msg, sig, publicKey) {
              checkArrayTypes(msg, sig, publicKey);
              if (sig.length !== crypto_sign_BYTES)
                throw new Error('bad signature size');
              if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
                throw new Error('bad public key size');
              var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
              var m = new Uint8Array(crypto_sign_BYTES + msg.length);
              var i;
              for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
              for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
              return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
            };

            nacl.sign.keyPair = function() {
              var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
              var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
              crypto_sign_keypair(pk, sk);
              return {publicKey: pk, secretKey: sk};
            };

            nacl.sign.keyPair.fromSecretKey = function(secretKey) {
              checkArrayTypes(secretKey);
              if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
                throw new Error('bad secret key size');
              var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
              for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
              return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
            };

            nacl.sign.keyPair.fromSeed = function(seed) {
              checkArrayTypes(seed);
              if (seed.length !== crypto_sign_SEEDBYTES)
                throw new Error('bad seed size');
              var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
              var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
              for (var i = 0; i < 32; i++) sk[i] = seed[i];
              crypto_sign_keypair(pk, sk, true);
              return {publicKey: pk, secretKey: sk};
            };

            nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
            nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
            nacl.sign.seedLength = crypto_sign_SEEDBYTES;
            nacl.sign.signatureLength = crypto_sign_BYTES;

            nacl.hash = function(msg) {
              checkArrayTypes(msg);
              var h = new Uint8Array(crypto_hash_BYTES);
              crypto_hash(h, msg, msg.length);
              return h;
            };

            nacl.hash.hashLength = crypto_hash_BYTES;

            nacl.verify = function(x, y) {
              checkArrayTypes(x, y);
              // Zero length arguments are considered not equal.
              if (x.length === 0 || y.length === 0) return false;
              if (x.length !== y.length) return false;
              return (vn(x, 0, y, 0, x.length) === 0) ? true : false;
            };

            nacl.setPRNG = function(fn) {
              randombytes = fn;
            };

            (function() {
              // Initialize PRNG if environment provides CSPRNG.
              // If not, methods calling randombytes will throw.
              var crypto;
              if (typeof window !== 'undefined') {
                // Browser.
                if (window.crypto && window.crypto.getRandomValues) {
                  crypto = window.crypto; // Standard
                } else if (window.msCrypto && window.msCrypto.getRandomValues) {
                  crypto = window.msCrypto; // Internet Explorer 11+
                }
                if (crypto) {
                  nacl.setPRNG(function(x, n) {
                    var i, v = new Uint8Array(n);
                    crypto.getRandomValues(v);
                    for (i = 0; i < n; i++) x[i] = v[i];
                    cleanup(v);
                  });
                }
              } else if (typeof require !== 'undefined') {
                // Node.js.
                crypto = require('crypto');
                if (crypto) {
                  nacl.setPRNG(function(x, n) {
                    var i, v = crypto.randomBytes(n);
                    for (i = 0; i < n; i++) x[i] = v[i];
                    cleanup(v);
                  });
                }
              }
            })();

            const getRandomValues$1 = window.crypto ? window.crypto.getRandomValues.bind(window.crypto) : window.msCrypto.getRandomValues.bind(window.msCrypto);

            const generateSaveWalletData = async (wallet, password, kdfThreads, statusUpdateFn) => {
                statusUpdateFn('Generating random values');
                let iv = new Uint8Array(16);
                getRandomValues$1(iv);
                let salt = new Uint8Array(32);
                getRandomValues$1(salt); // Can actually use a salt this time, as we can store the salt with the wallet

                // const key = PBKDF2_HMAC_SHA512.bytes(utils.stringtoUTF8Array(password), salt, PBKDF2_ROUNDS, 64) // 512bit key to be split in two for mac/encryption
                const key = await kdf(password, salt, statusUpdateFn);
                statusUpdateFn('Encrypting seed');
                const encryptionKey = key.slice(0, 32);
                const macKey = key.slice(32, 63);
                const encryptedSeed = AES_CBC.encrypt(wallet._byteSeed, encryptionKey, false, iv);
                // const mac = HmacSha512.bytes(encryptedSeed, macKey)
                statusUpdateFn('Generating mac');
                const mac = new HmacSha512(macKey).process(encryptedSeed).finish().result;
                return {
                    address0: wallet._addresses[0].address,
                    encryptedSeed: Base58$1.encode(encryptedSeed),
                    salt: Base58$1.encode(salt),
                    iv: Base58$1.encode(iv),
                    version: wallet._walletVersion,
                    mac: Base58$1.encode(mac),
                    kdfThreads
                }
            };

            var inherits;
            if (typeof Object.create === 'function'){
              inherits = function inherits(ctor, superCtor) {
                // implementation from standard node.js 'util' module
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                  constructor: {
                    value: ctor,
                    enumerable: false,
                    writable: true,
                    configurable: true
                  }
                });
              };
            } else {
              inherits = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function () {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
              };
            }
            var inherits$1 = inherits;

            var formatRegExp = /%[sdj%]/g;
            function format(f) {
              if (!isString(f)) {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                  objects.push(inspect(arguments[i]));
                }
                return objects.join(' ');
              }

              var i = 1;
              var args = arguments;
              var len = args.length;
              var str = String(f).replace(formatRegExp, function(x) {
                if (x === '%%') return '%';
                if (i >= len) return x;
                switch (x) {
                  case '%s': return String(args[i++]);
                  case '%d': return Number(args[i++]);
                  case '%j':
                    try {
                      return JSON.stringify(args[i++]);
                    } catch (_) {
                      return '[Circular]';
                    }
                  default:
                    return x;
                }
              });
              for (var x = args[i]; i < len; x = args[++i]) {
                if (isNull(x) || !isObject(x)) {
                  str += ' ' + x;
                } else {
                  str += ' ' + inspect(x);
                }
              }
              return str;
            }

            // Mark that a method should not be used.
            // Returns a modified function which warns once by default.
            // If --no-deprecation is set, then it is a no-op.
            function deprecate(fn, msg) {
              // Allow for deprecating things in the process of starting up.
              if (isUndefined(global.process)) {
                return function() {
                  return deprecate(fn, msg).apply(this, arguments);
                };
              }

              var warned = false;
              function deprecated() {
                if (!warned) {
                  {
                    console.error(msg);
                  }
                  warned = true;
                }
                return fn.apply(this, arguments);
              }

              return deprecated;
            }

            var debugs = {};
            var debugEnviron;
            function debuglog(set) {
              if (isUndefined(debugEnviron))
                debugEnviron =  '';
              set = set.toUpperCase();
              if (!debugs[set]) {
                if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                  var pid = 0;
                  debugs[set] = function() {
                    var msg = format.apply(null, arguments);
                    console.error('%s %d: %s', set, pid, msg);
                  };
                } else {
                  debugs[set] = function() {};
                }
              }
              return debugs[set];
            }

            /**
             * Echos the value of a value. Trys to print the value out
             * in the best way possible given the different types.
             *
             * @param {Object} obj The object to print out.
             * @param {Object} opts Optional options object that alters the output.
             */
            /* legacy: obj, showHidden, depth, colors*/
            function inspect(obj, opts) {
              // default options
              var ctx = {
                seen: [],
                stylize: stylizeNoColor
              };
              // legacy...
              if (arguments.length >= 3) ctx.depth = arguments[2];
              if (arguments.length >= 4) ctx.colors = arguments[3];
              if (isBoolean(opts)) {
                // legacy...
                ctx.showHidden = opts;
              } else if (opts) {
                // got an "options" object
                _extend(ctx, opts);
              }
              // set default options
              if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
              if (isUndefined(ctx.depth)) ctx.depth = 2;
              if (isUndefined(ctx.colors)) ctx.colors = false;
              if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
              if (ctx.colors) ctx.stylize = stylizeWithColor;
              return formatValue(ctx, obj, ctx.depth);
            }

            // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
            inspect.colors = {
              'bold' : [1, 22],
              'italic' : [3, 23],
              'underline' : [4, 24],
              'inverse' : [7, 27],
              'white' : [37, 39],
              'grey' : [90, 39],
              'black' : [30, 39],
              'blue' : [34, 39],
              'cyan' : [36, 39],
              'green' : [32, 39],
              'magenta' : [35, 39],
              'red' : [31, 39],
              'yellow' : [33, 39]
            };

            // Don't use 'blue' not visible on cmd.exe
            inspect.styles = {
              'special': 'cyan',
              'number': 'yellow',
              'boolean': 'yellow',
              'undefined': 'grey',
              'null': 'bold',
              'string': 'green',
              'date': 'magenta',
              // "name": intentionally not styling
              'regexp': 'red'
            };


            function stylizeWithColor(str, styleType) {
              var style = inspect.styles[styleType];

              if (style) {
                return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                       '\u001b[' + inspect.colors[style][1] + 'm';
              } else {
                return str;
              }
            }


            function stylizeNoColor(str, styleType) {
              return str;
            }


            function arrayToHash(array) {
              var hash = {};

              array.forEach(function(val, idx) {
                hash[val] = true;
              });

              return hash;
            }


            function formatValue(ctx, value, recurseTimes) {
              // Provide a hook for user-specified inspect functions.
              // Check that value is an object with an inspect function on it
              if (ctx.customInspect &&
                  value &&
                  isFunction(value.inspect) &&
                  // Filter out the util module, it's inspect function is special
                  value.inspect !== inspect &&
                  // Also filter out any prototype objects using the circular check.
                  !(value.constructor && value.constructor.prototype === value)) {
                var ret = value.inspect(recurseTimes, ctx);
                if (!isString(ret)) {
                  ret = formatValue(ctx, ret, recurseTimes);
                }
                return ret;
              }

              // Primitive types cannot have properties
              var primitive = formatPrimitive(ctx, value);
              if (primitive) {
                return primitive;
              }

              // Look up the keys of the object.
              var keys = Object.keys(value);
              var visibleKeys = arrayToHash(keys);

              if (ctx.showHidden) {
                keys = Object.getOwnPropertyNames(value);
              }

              // IE doesn't make error fields non-enumerable
              // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
              if (isError(value)
                  && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
                return formatError(value);
              }

              // Some type of object without properties can be shortcutted.
              if (keys.length === 0) {
                if (isFunction(value)) {
                  var name = value.name ? ': ' + value.name : '';
                  return ctx.stylize('[Function' + name + ']', 'special');
                }
                if (isRegExp(value)) {
                  return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                  return ctx.stylize(Date.prototype.toString.call(value), 'date');
                }
                if (isError(value)) {
                  return formatError(value);
                }
              }

              var base = '', array = false, braces = ['{', '}'];

              // Make Array say that they are Array
              if (isArray$1(value)) {
                array = true;
                braces = ['[', ']'];
              }

              // Make functions say that they are functions
              if (isFunction(value)) {
                var n = value.name ? ': ' + value.name : '';
                base = ' [Function' + n + ']';
              }

              // Make RegExps say that they are RegExps
              if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
              }

              // Make dates with properties first say the date
              if (isDate(value)) {
                base = ' ' + Date.prototype.toUTCString.call(value);
              }

              // Make error with message first say the error
              if (isError(value)) {
                base = ' ' + formatError(value);
              }

              if (keys.length === 0 && (!array || value.length == 0)) {
                return braces[0] + base + braces[1];
              }

              if (recurseTimes < 0) {
                if (isRegExp(value)) {
                  return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                } else {
                  return ctx.stylize('[Object]', 'special');
                }
              }

              ctx.seen.push(value);

              var output;
              if (array) {
                output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
              } else {
                output = keys.map(function(key) {
                  return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                });
              }

              ctx.seen.pop();

              return reduceToSingleString(output, base, braces);
            }


            function formatPrimitive(ctx, value) {
              if (isUndefined(value))
                return ctx.stylize('undefined', 'undefined');
              if (isString(value)) {
                var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                         .replace(/'/g, "\\'")
                                                         .replace(/\\"/g, '"') + '\'';
                return ctx.stylize(simple, 'string');
              }
              if (isNumber(value))
                return ctx.stylize('' + value, 'number');
              if (isBoolean(value))
                return ctx.stylize('' + value, 'boolean');
              // For some reason typeof null is "object", so special case here.
              if (isNull(value))
                return ctx.stylize('null', 'null');
            }


            function formatError(value) {
              return '[' + Error.prototype.toString.call(value) + ']';
            }


            function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
              var output = [];
              for (var i = 0, l = value.length; i < l; ++i) {
                if (hasOwnProperty(value, String(i))) {
                  output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                      String(i), true));
                } else {
                  output.push('');
                }
              }
              keys.forEach(function(key) {
                if (!key.match(/^\d+$/)) {
                  output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                      key, true));
                }
              });
              return output;
            }


            function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
              var name, str, desc;
              desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
              if (desc.get) {
                if (desc.set) {
                  str = ctx.stylize('[Getter/Setter]', 'special');
                } else {
                  str = ctx.stylize('[Getter]', 'special');
                }
              } else {
                if (desc.set) {
                  str = ctx.stylize('[Setter]', 'special');
                }
              }
              if (!hasOwnProperty(visibleKeys, key)) {
                name = '[' + key + ']';
              }
              if (!str) {
                if (ctx.seen.indexOf(desc.value) < 0) {
                  if (isNull(recurseTimes)) {
                    str = formatValue(ctx, desc.value, null);
                  } else {
                    str = formatValue(ctx, desc.value, recurseTimes - 1);
                  }
                  if (str.indexOf('\n') > -1) {
                    if (array) {
                      str = str.split('\n').map(function(line) {
                        return '  ' + line;
                      }).join('\n').substr(2);
                    } else {
                      str = '\n' + str.split('\n').map(function(line) {
                        return '   ' + line;
                      }).join('\n');
                    }
                  }
                } else {
                  str = ctx.stylize('[Circular]', 'special');
                }
              }
              if (isUndefined(name)) {
                if (array && key.match(/^\d+$/)) {
                  return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                  name = name.substr(1, name.length - 2);
                  name = ctx.stylize(name, 'name');
                } else {
                  name = name.replace(/'/g, "\\'")
                             .replace(/\\"/g, '"')
                             .replace(/(^"|"$)/g, "'");
                  name = ctx.stylize(name, 'string');
                }
              }

              return name + ': ' + str;
            }


            function reduceToSingleString(output, base, braces) {
              var length = output.reduce(function(prev, cur) {
                if (cur.indexOf('\n') >= 0) ;
                return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
              }, 0);

              if (length > 60) {
                return braces[0] +
                       (base === '' ? '' : base + '\n ') +
                       ' ' +
                       output.join(',\n  ') +
                       ' ' +
                       braces[1];
              }

              return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }


            // NOTE: These type checking functions intentionally don't use `instanceof`
            // because it is fragile and can be easily faked with `Object.create()`.
            function isArray$1(ar) {
              return Array.isArray(ar);
            }

            function isBoolean(arg) {
              return typeof arg === 'boolean';
            }

            function isNull(arg) {
              return arg === null;
            }

            function isNullOrUndefined(arg) {
              return arg == null;
            }

            function isNumber(arg) {
              return typeof arg === 'number';
            }

            function isString(arg) {
              return typeof arg === 'string';
            }

            function isSymbol(arg) {
              return typeof arg === 'symbol';
            }

            function isUndefined(arg) {
              return arg === void 0;
            }

            function isRegExp(re) {
              return isObject(re) && objectToString(re) === '[object RegExp]';
            }

            function isObject(arg) {
              return typeof arg === 'object' && arg !== null;
            }

            function isDate(d) {
              return isObject(d) && objectToString(d) === '[object Date]';
            }

            function isError(e) {
              return isObject(e) &&
                  (objectToString(e) === '[object Error]' || e instanceof Error);
            }

            function isFunction(arg) {
              return typeof arg === 'function';
            }

            function isPrimitive(arg) {
              return arg === null ||
                     typeof arg === 'boolean' ||
                     typeof arg === 'number' ||
                     typeof arg === 'string' ||
                     typeof arg === 'symbol' ||  // ES6 symbol
                     typeof arg === 'undefined';
            }

            function isBuffer$1(maybeBuf) {
              return isBuffer(maybeBuf);
            }

            function objectToString(o) {
              return Object.prototype.toString.call(o);
            }


            function pad(n) {
              return n < 10 ? '0' + n.toString(10) : n.toString(10);
            }


            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                          'Oct', 'Nov', 'Dec'];

            // 26 Feb 16:19:34
            function timestamp() {
              var d = new Date();
              var time = [pad(d.getHours()),
                          pad(d.getMinutes()),
                          pad(d.getSeconds())].join(':');
              return [d.getDate(), months[d.getMonth()], time].join(' ');
            }


            // log is just a thin wrapper to console.log that prepends a timestamp
            function log() {
              console.log('%s - %s', timestamp(), format.apply(null, arguments));
            }

            function _extend(origin, add) {
              // Don't do anything if add isn't an object
              if (!add || !isObject(add)) return origin;

              var keys = Object.keys(add);
              var i = keys.length;
              while (i--) {
                origin[keys[i]] = add[keys[i]];
              }
              return origin;
            }
            function hasOwnProperty(obj, prop) {
              return Object.prototype.hasOwnProperty.call(obj, prop);
            }

            var require$$0 = {
              inherits: inherits$1,
              _extend: _extend,
              log: log,
              isBuffer: isBuffer$1,
              isPrimitive: isPrimitive,
              isFunction: isFunction,
              isError: isError,
              isDate: isDate,
              isObject: isObject,
              isRegExp: isRegExp,
              isUndefined: isUndefined,
              isSymbol: isSymbol,
              isString: isString,
              isNumber: isNumber,
              isNullOrUndefined: isNullOrUndefined,
              isNull: isNull,
              isBoolean: isBoolean,
              isArray: isArray$1,
              inspect: inspect,
              deprecate: deprecate,
              format: format,
              debuglog: debuglog
            };

            var inherits_browser = createCommonjsModule(function (module) {
            if (typeof Object.create === 'function') {
              // implementation from standard node.js 'util' module
              module.exports = function inherits(ctor, superCtor) {
                if (superCtor) {
                  ctor.super_ = superCtor;
                  ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                      value: ctor,
                      enumerable: false,
                      writable: true,
                      configurable: true
                    }
                  });
                }
              };
            } else {
              // old school shim for old browsers
              module.exports = function inherits(ctor, superCtor) {
                if (superCtor) {
                  ctor.super_ = superCtor;
                  var TempCtor = function () {};
                  TempCtor.prototype = superCtor.prototype;
                  ctor.prototype = new TempCtor();
                  ctor.prototype.constructor = ctor;
                }
              };
            }
            });

            var inherits$2 = createCommonjsModule(function (module) {
            try {
              var util = require$$0;
              /* istanbul ignore next */
              if (typeof util.inherits !== 'function') throw '';
              module.exports = util.inherits;
            } catch (e) {
              /* istanbul ignore next */
              module.exports = inherits_browser;
            }
            });

            var safeBuffer = createCommonjsModule(function (module, exports) {
            /* eslint-disable node/no-deprecated-api */

            var Buffer = bufferEs6.Buffer;

            // alternative to using Object.keys for old browsers
            function copyProps (src, dst) {
              for (var key in src) {
                dst[key] = src[key];
              }
            }
            if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
              module.exports = bufferEs6;
            } else {
              // Copy properties from require('buffer')
              copyProps(bufferEs6, exports);
              exports.Buffer = SafeBuffer;
            }

            function SafeBuffer (arg, encodingOrOffset, length) {
              return Buffer(arg, encodingOrOffset, length)
            }

            SafeBuffer.prototype = Object.create(Buffer.prototype);

            // Copy static methods from Buffer
            copyProps(Buffer, SafeBuffer);

            SafeBuffer.from = function (arg, encodingOrOffset, length) {
              if (typeof arg === 'number') {
                throw new TypeError('Argument must not be a number')
              }
              return Buffer(arg, encodingOrOffset, length)
            };

            SafeBuffer.alloc = function (size, fill, encoding) {
              if (typeof size !== 'number') {
                throw new TypeError('Argument must be a number')
              }
              var buf = Buffer(size);
              if (fill !== undefined) {
                if (typeof encoding === 'string') {
                  buf.fill(fill, encoding);
                } else {
                  buf.fill(fill);
                }
              } else {
                buf.fill(0);
              }
              return buf
            };

            SafeBuffer.allocUnsafe = function (size) {
              if (typeof size !== 'number') {
                throw new TypeError('Argument must be a number')
              }
              return Buffer(size)
            };

            SafeBuffer.allocUnsafeSlow = function (size) {
              if (typeof size !== 'number') {
                throw new TypeError('Argument must be a number')
              }
              return bufferEs6.SlowBuffer(size)
            };
            });
            var safeBuffer_1 = safeBuffer.Buffer;

            var domain;

            // This constructor is used to store event handlers. Instantiating this is
            // faster than explicitly calling `Object.create(null)` to get a "clean" empty
            // object (tested with v8 v4.9).
            function EventHandlers() {}
            EventHandlers.prototype = Object.create(null);

            function EventEmitter() {
              EventEmitter.init.call(this);
            }

            // nodejs oddity
            // require('events') === require('events').EventEmitter
            EventEmitter.EventEmitter = EventEmitter;

            EventEmitter.usingDomains = false;

            EventEmitter.prototype.domain = undefined;
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;

            // By default EventEmitters will print a warning if more than 10 listeners are
            // added to it. This is a useful default which helps finding memory leaks.
            EventEmitter.defaultMaxListeners = 10;

            EventEmitter.init = function() {
              this.domain = null;
              if (EventEmitter.usingDomains) {
                // if there is an active domain, then attach to it.
                if (domain.active ) ;
              }

              if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
                this._events = new EventHandlers();
                this._eventsCount = 0;
              }

              this._maxListeners = this._maxListeners || undefined;
            };

            // Obviously not all Emitters should be limited to 10. This function allows
            // that to be increased. Set to zero for unlimited.
            EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
              if (typeof n !== 'number' || n < 0 || isNaN(n))
                throw new TypeError('"n" argument must be a positive number');
              this._maxListeners = n;
              return this;
            };

            function $getMaxListeners(that) {
              if (that._maxListeners === undefined)
                return EventEmitter.defaultMaxListeners;
              return that._maxListeners;
            }

            EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
              return $getMaxListeners(this);
            };

            // These standalone emit* functions are used to optimize calling of event
            // handlers for fast cases because emit() itself often has a variable number of
            // arguments and can be deoptimized because of that. These functions always have
            // the same number of arguments and thus do not get deoptimized, so the code
            // inside them can execute faster.
            function emitNone(handler, isFn, self) {
              if (isFn)
                handler.call(self);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self);
              }
            }
            function emitOne(handler, isFn, self, arg1) {
              if (isFn)
                handler.call(self, arg1);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self, arg1);
              }
            }
            function emitTwo(handler, isFn, self, arg1, arg2) {
              if (isFn)
                handler.call(self, arg1, arg2);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self, arg1, arg2);
              }
            }
            function emitThree(handler, isFn, self, arg1, arg2, arg3) {
              if (isFn)
                handler.call(self, arg1, arg2, arg3);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].call(self, arg1, arg2, arg3);
              }
            }

            function emitMany(handler, isFn, self, args) {
              if (isFn)
                handler.apply(self, args);
              else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                  listeners[i].apply(self, args);
              }
            }

            EventEmitter.prototype.emit = function emit(type) {
              var er, handler, len, args, i, events, domain;
              var doError = (type === 'error');

              events = this._events;
              if (events)
                doError = (doError && events.error == null);
              else if (!doError)
                return false;

              domain = this.domain;

              // If there is no 'error' event listener then throw.
              if (doError) {
                er = arguments[1];
                if (domain) {
                  if (!er)
                    er = new Error('Uncaught, unspecified "error" event');
                  er.domainEmitter = this;
                  er.domain = domain;
                  er.domainThrown = false;
                  domain.emit('error', er);
                } else if (er instanceof Error) {
                  throw er; // Unhandled 'error' event
                } else {
                  // At least give some kind of context to the user
                  var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
                  err.context = er;
                  throw err;
                }
                return false;
              }

              handler = events[type];

              if (!handler)
                return false;

              var isFn = typeof handler === 'function';
              len = arguments.length;
              switch (len) {
                // fast cases
                case 1:
                  emitNone(handler, isFn, this);
                  break;
                case 2:
                  emitOne(handler, isFn, this, arguments[1]);
                  break;
                case 3:
                  emitTwo(handler, isFn, this, arguments[1], arguments[2]);
                  break;
                case 4:
                  emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
                  break;
                // slower
                default:
                  args = new Array(len - 1);
                  for (i = 1; i < len; i++)
                    args[i - 1] = arguments[i];
                  emitMany(handler, isFn, this, args);
              }

              return true;
            };

            function _addListener(target, type, listener, prepend) {
              var m;
              var events;
              var existing;

              if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');

              events = target._events;
              if (!events) {
                events = target._events = new EventHandlers();
                target._eventsCount = 0;
              } else {
                // To avoid recursion in the case that type === "newListener"! Before
                // adding it to the listeners, first emit "newListener".
                if (events.newListener) {
                  target.emit('newListener', type,
                              listener.listener ? listener.listener : listener);

                  // Re-assign `events` because a newListener handler could have caused the
                  // this._events to be assigned to a new object
                  events = target._events;
                }
                existing = events[type];
              }

              if (!existing) {
                // Optimize the case of one listener. Don't need the extra array object.
                existing = events[type] = listener;
                ++target._eventsCount;
              } else {
                if (typeof existing === 'function') {
                  // Adding the second element, need to change to array.
                  existing = events[type] = prepend ? [listener, existing] :
                                                      [existing, listener];
                } else {
                  // If we've already got an array, just append.
                  if (prepend) {
                    existing.unshift(listener);
                  } else {
                    existing.push(listener);
                  }
                }

                // Check for listener leak
                if (!existing.warned) {
                  m = $getMaxListeners(target);
                  if (m && m > 0 && existing.length > m) {
                    existing.warned = true;
                    var w = new Error('Possible EventEmitter memory leak detected. ' +
                                        existing.length + ' ' + type + ' listeners added. ' +
                                        'Use emitter.setMaxListeners() to increase limit');
                    w.name = 'MaxListenersExceededWarning';
                    w.emitter = target;
                    w.type = type;
                    w.count = existing.length;
                    emitWarning(w);
                  }
                }
              }

              return target;
            }
            function emitWarning(e) {
              typeof console.warn === 'function' ? console.warn(e) : console.log(e);
            }
            EventEmitter.prototype.addListener = function addListener(type, listener) {
              return _addListener(this, type, listener, false);
            };

            EventEmitter.prototype.on = EventEmitter.prototype.addListener;

            EventEmitter.prototype.prependListener =
                function prependListener(type, listener) {
                  return _addListener(this, type, listener, true);
                };

            function _onceWrap(target, type, listener) {
              var fired = false;
              function g() {
                target.removeListener(type, g);
                if (!fired) {
                  fired = true;
                  listener.apply(target, arguments);
                }
              }
              g.listener = listener;
              return g;
            }

            EventEmitter.prototype.once = function once(type, listener) {
              if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');
              this.on(type, _onceWrap(this, type, listener));
              return this;
            };

            EventEmitter.prototype.prependOnceListener =
                function prependOnceListener(type, listener) {
                  if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');
                  this.prependListener(type, _onceWrap(this, type, listener));
                  return this;
                };

            // emits a 'removeListener' event iff the listener was removed
            EventEmitter.prototype.removeListener =
                function removeListener(type, listener) {
                  var list, events, position, i, originalListener;

                  if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');

                  events = this._events;
                  if (!events)
                    return this;

                  list = events[type];
                  if (!list)
                    return this;

                  if (list === listener || (list.listener && list.listener === listener)) {
                    if (--this._eventsCount === 0)
                      this._events = new EventHandlers();
                    else {
                      delete events[type];
                      if (events.removeListener)
                        this.emit('removeListener', type, list.listener || listener);
                    }
                  } else if (typeof list !== 'function') {
                    position = -1;

                    for (i = list.length; i-- > 0;) {
                      if (list[i] === listener ||
                          (list[i].listener && list[i].listener === listener)) {
                        originalListener = list[i].listener;
                        position = i;
                        break;
                      }
                    }

                    if (position < 0)
                      return this;

                    if (list.length === 1) {
                      list[0] = undefined;
                      if (--this._eventsCount === 0) {
                        this._events = new EventHandlers();
                        return this;
                      } else {
                        delete events[type];
                      }
                    } else {
                      spliceOne(list, position);
                    }

                    if (events.removeListener)
                      this.emit('removeListener', type, originalListener || listener);
                  }

                  return this;
                };

            EventEmitter.prototype.removeAllListeners =
                function removeAllListeners(type) {
                  var listeners, events;

                  events = this._events;
                  if (!events)
                    return this;

                  // not listening for removeListener, no need to emit
                  if (!events.removeListener) {
                    if (arguments.length === 0) {
                      this._events = new EventHandlers();
                      this._eventsCount = 0;
                    } else if (events[type]) {
                      if (--this._eventsCount === 0)
                        this._events = new EventHandlers();
                      else
                        delete events[type];
                    }
                    return this;
                  }

                  // emit removeListener for all listeners on all events
                  if (arguments.length === 0) {
                    var keys = Object.keys(events);
                    for (var i = 0, key; i < keys.length; ++i) {
                      key = keys[i];
                      if (key === 'removeListener') continue;
                      this.removeAllListeners(key);
                    }
                    this.removeAllListeners('removeListener');
                    this._events = new EventHandlers();
                    this._eventsCount = 0;
                    return this;
                  }

                  listeners = events[type];

                  if (typeof listeners === 'function') {
                    this.removeListener(type, listeners);
                  } else if (listeners) {
                    // LIFO order
                    do {
                      this.removeListener(type, listeners[listeners.length - 1]);
                    } while (listeners[0]);
                  }

                  return this;
                };

            EventEmitter.prototype.listeners = function listeners(type) {
              var evlistener;
              var ret;
              var events = this._events;

              if (!events)
                ret = [];
              else {
                evlistener = events[type];
                if (!evlistener)
                  ret = [];
                else if (typeof evlistener === 'function')
                  ret = [evlistener.listener || evlistener];
                else
                  ret = unwrapListeners(evlistener);
              }

              return ret;
            };

            EventEmitter.listenerCount = function(emitter, type) {
              if (typeof emitter.listenerCount === 'function') {
                return emitter.listenerCount(type);
              } else {
                return listenerCount.call(emitter, type);
              }
            };

            EventEmitter.prototype.listenerCount = listenerCount;
            function listenerCount(type) {
              var events = this._events;

              if (events) {
                var evlistener = events[type];

                if (typeof evlistener === 'function') {
                  return 1;
                } else if (evlistener) {
                  return evlistener.length;
                }
              }

              return 0;
            }

            EventEmitter.prototype.eventNames = function eventNames() {
              return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
            };

            // About 1.5x faster than the two-arg version of Array#splice().
            function spliceOne(list, index) {
              for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
                list[i] = list[k];
              list.pop();
            }

            function arrayClone(arr, i) {
              var copy = new Array(i);
              while (i--)
                copy[i] = arr[i];
              return copy;
            }

            function unwrapListeners(arr) {
              var ret = new Array(arr.length);
              for (var i = 0; i < ret.length; ++i) {
                ret[i] = arr[i].listener || arr[i];
              }
              return ret;
            }

            function BufferList() {
              this.head = null;
              this.tail = null;
              this.length = 0;
            }

            BufferList.prototype.push = function (v) {
              var entry = { data: v, next: null };
              if (this.length > 0) this.tail.next = entry;else this.head = entry;
              this.tail = entry;
              ++this.length;
            };

            BufferList.prototype.unshift = function (v) {
              var entry = { data: v, next: this.head };
              if (this.length === 0) this.tail = entry;
              this.head = entry;
              ++this.length;
            };

            BufferList.prototype.shift = function () {
              if (this.length === 0) return;
              var ret = this.head.data;
              if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
              --this.length;
              return ret;
            };

            BufferList.prototype.clear = function () {
              this.head = this.tail = null;
              this.length = 0;
            };

            BufferList.prototype.join = function (s) {
              if (this.length === 0) return '';
              var p = this.head;
              var ret = '' + p.data;
              while (p = p.next) {
                ret += s + p.data;
              }return ret;
            };

            BufferList.prototype.concat = function (n) {
              if (this.length === 0) return Buffer.alloc(0);
              if (this.length === 1) return this.head.data;
              var ret = Buffer.allocUnsafe(n >>> 0);
              var p = this.head;
              var i = 0;
              while (p) {
                p.data.copy(ret, i);
                i += p.data.length;
                p = p.next;
              }
              return ret;
            };

            // Copyright Joyent, Inc. and other Node contributors.
            var isBufferEncoding = Buffer.isEncoding
              || function(encoding) {
                   switch (encoding && encoding.toLowerCase()) {
                     case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
                     default: return false;
                   }
                 };


            function assertEncoding(encoding) {
              if (encoding && !isBufferEncoding(encoding)) {
                throw new Error('Unknown encoding: ' + encoding);
              }
            }

            // StringDecoder provides an interface for efficiently splitting a series of
            // buffers into a series of JS strings without breaking apart multi-byte
            // characters. CESU-8 is handled as part of the UTF-8 encoding.
            //
            // @TODO Handling all encodings inside a single object makes it very difficult
            // to reason about this code, so it should be split up in the future.
            // @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
            // points as used by CESU-8.
            function StringDecoder(encoding) {
              this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
              assertEncoding(encoding);
              switch (this.encoding) {
                case 'utf8':
                  // CESU-8 represents each of Surrogate Pair by 3-bytes
                  this.surrogateSize = 3;
                  break;
                case 'ucs2':
                case 'utf16le':
                  // UTF-16 represents each of Surrogate Pair by 2-bytes
                  this.surrogateSize = 2;
                  this.detectIncompleteChar = utf16DetectIncompleteChar;
                  break;
                case 'base64':
                  // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
                  this.surrogateSize = 3;
                  this.detectIncompleteChar = base64DetectIncompleteChar;
                  break;
                default:
                  this.write = passThroughWrite;
                  return;
              }

              // Enough space to store all bytes of a single character. UTF-8 needs 4
              // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
              this.charBuffer = new Buffer(6);
              // Number of bytes received for the current incomplete multi-byte character.
              this.charReceived = 0;
              // Number of bytes expected for the current incomplete multi-byte character.
              this.charLength = 0;
            }

            // write decodes the given buffer and returns it as JS string that is
            // guaranteed to not contain any partial multi-byte characters. Any partial
            // character found at the end of the buffer is buffered up, and will be
            // returned when calling write again with the remaining bytes.
            //
            // Note: Converting a Buffer containing an orphan surrogate to a String
            // currently works, but converting a String to a Buffer (via `new Buffer`, or
            // Buffer#write) will replace incomplete surrogates with the unicode
            // replacement character. See https://codereview.chromium.org/121173009/ .
            StringDecoder.prototype.write = function(buffer) {
              var charStr = '';
              // if our last write ended with an incomplete multibyte character
              while (this.charLength) {
                // determine how many remaining bytes this buffer has to offer for this char
                var available = (buffer.length >= this.charLength - this.charReceived) ?
                    this.charLength - this.charReceived :
                    buffer.length;

                // add the new bytes to the char buffer
                buffer.copy(this.charBuffer, this.charReceived, 0, available);
                this.charReceived += available;

                if (this.charReceived < this.charLength) {
                  // still not enough chars in this buffer? wait for more ...
                  return '';
                }

                // remove bytes belonging to the current character from the buffer
                buffer = buffer.slice(available, buffer.length);

                // get the character that was split
                charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

                // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
                var charCode = charStr.charCodeAt(charStr.length - 1);
                if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                  this.charLength += this.surrogateSize;
                  charStr = '';
                  continue;
                }
                this.charReceived = this.charLength = 0;

                // if there are no more bytes in this buffer, just emit our char
                if (buffer.length === 0) {
                  return charStr;
                }
                break;
              }

              // determine and set charLength / charReceived
              this.detectIncompleteChar(buffer);

              var end = buffer.length;
              if (this.charLength) {
                // buffer the incomplete character bytes we got
                buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
                end -= this.charReceived;
              }

              charStr += buffer.toString(this.encoding, 0, end);

              var end = charStr.length - 1;
              var charCode = charStr.charCodeAt(end);
              // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
              if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                var size = this.surrogateSize;
                this.charLength += size;
                this.charReceived += size;
                this.charBuffer.copy(this.charBuffer, size, 0, size);
                buffer.copy(this.charBuffer, 0, 0, size);
                return charStr.substring(0, end);
              }

              // or just emit the charStr
              return charStr;
            };

            // detectIncompleteChar determines if there is an incomplete UTF-8 character at
            // the end of the given buffer. If so, it sets this.charLength to the byte
            // length that character, and sets this.charReceived to the number of bytes
            // that are available for this character.
            StringDecoder.prototype.detectIncompleteChar = function(buffer) {
              // determine how many bytes we have to check at the end of this buffer
              var i = (buffer.length >= 3) ? 3 : buffer.length;

              // Figure out if one of the last i bytes of our buffer announces an
              // incomplete char.
              for (; i > 0; i--) {
                var c = buffer[buffer.length - i];

                // See http://en.wikipedia.org/wiki/UTF-8#Description

                // 110XXXXX
                if (i == 1 && c >> 5 == 0x06) {
                  this.charLength = 2;
                  break;
                }

                // 1110XXXX
                if (i <= 2 && c >> 4 == 0x0E) {
                  this.charLength = 3;
                  break;
                }

                // 11110XXX
                if (i <= 3 && c >> 3 == 0x1E) {
                  this.charLength = 4;
                  break;
                }
              }
              this.charReceived = i;
            };

            StringDecoder.prototype.end = function(buffer) {
              var res = '';
              if (buffer && buffer.length)
                res = this.write(buffer);

              if (this.charReceived) {
                var cr = this.charReceived;
                var buf = this.charBuffer;
                var enc = this.encoding;
                res += buf.slice(0, cr).toString(enc);
              }

              return res;
            };

            function passThroughWrite(buffer) {
              return buffer.toString(this.encoding);
            }

            function utf16DetectIncompleteChar(buffer) {
              this.charReceived = buffer.length % 2;
              this.charLength = this.charReceived ? 2 : 0;
            }

            function base64DetectIncompleteChar(buffer) {
              this.charReceived = buffer.length % 3;
              this.charLength = this.charReceived ? 3 : 0;
            }

            Readable.ReadableState = ReadableState;

            var debug = debuglog('stream');
            inherits$1(Readable, EventEmitter);

            function prependListener(emitter, event, fn) {
              // Sadly this is not cacheable as some libraries bundle their own
              // event emitter implementation with them.
              if (typeof emitter.prependListener === 'function') {
                return emitter.prependListener(event, fn);
              } else {
                // This is a hack to make sure that our error handler is attached before any
                // userland ones.  NEVER DO THIS. This is here only because this code needs
                // to continue to work with older versions of Node.js that do not include
                // the prependListener() method. The goal is to eventually remove this hack.
                if (!emitter._events || !emitter._events[event])
                  emitter.on(event, fn);
                else if (Array.isArray(emitter._events[event]))
                  emitter._events[event].unshift(fn);
                else
                  emitter._events[event] = [fn, emitter._events[event]];
              }
            }
            function listenerCount$1 (emitter, type) {
              return emitter.listeners(type).length;
            }
            function ReadableState(options, stream) {

              options = options || {};

              // object stream flag. Used to make read(n) ignore n and to
              // make all the buffer merging and length checks go away
              this.objectMode = !!options.objectMode;

              if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

              // the point at which it stops calling _read() to fill the buffer
              // Note: 0 is a valid value, means "don't call _read preemptively ever"
              var hwm = options.highWaterMark;
              var defaultHwm = this.objectMode ? 16 : 16 * 1024;
              this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

              // cast to ints.
              this.highWaterMark = ~ ~this.highWaterMark;

              // A linked list is used to store data chunks instead of an array because the
              // linked list can remove elements from the beginning faster than
              // array.shift()
              this.buffer = new BufferList();
              this.length = 0;
              this.pipes = null;
              this.pipesCount = 0;
              this.flowing = null;
              this.ended = false;
              this.endEmitted = false;
              this.reading = false;

              // a flag to be able to tell if the onwrite cb is called immediately,
              // or on a later tick.  We set this to true at first, because any
              // actions that shouldn't happen until "later" should generally also
              // not happen before the first write call.
              this.sync = true;

              // whenever we return null, then we set a flag to say
              // that we're awaiting a 'readable' event emission.
              this.needReadable = false;
              this.emittedReadable = false;
              this.readableListening = false;
              this.resumeScheduled = false;

              // Crypto is kind of old and crusty.  Historically, its default string
              // encoding is 'binary' so we have to make this configurable.
              // Everything else in the universe uses 'utf8', though.
              this.defaultEncoding = options.defaultEncoding || 'utf8';

              // when piping, we only care about 'readable' events that happen
              // after read()ing all the bytes and not getting any pushback.
              this.ranOut = false;

              // the number of writers that are awaiting a drain event in .pipe()s
              this.awaitDrain = 0;

              // if true, a maybeReadMore has been scheduled
              this.readingMore = false;

              this.decoder = null;
              this.encoding = null;
              if (options.encoding) {
                this.decoder = new StringDecoder(options.encoding);
                this.encoding = options.encoding;
              }
            }
            function Readable(options) {

              if (!(this instanceof Readable)) return new Readable(options);

              this._readableState = new ReadableState(options, this);

              // legacy
              this.readable = true;

              if (options && typeof options.read === 'function') this._read = options.read;

              EventEmitter.call(this);
            }

            // Manually shove something into the read() buffer.
            // This returns true if the highWaterMark has not been hit yet,
            // similar to how Writable.write() returns true if you should
            // write() some more.
            Readable.prototype.push = function (chunk, encoding) {
              var state = this._readableState;

              if (!state.objectMode && typeof chunk === 'string') {
                encoding = encoding || state.defaultEncoding;
                if (encoding !== state.encoding) {
                  chunk = Buffer.from(chunk, encoding);
                  encoding = '';
                }
              }

              return readableAddChunk(this, state, chunk, encoding, false);
            };

            // Unshift should *always* be something directly out of read()
            Readable.prototype.unshift = function (chunk) {
              var state = this._readableState;
              return readableAddChunk(this, state, chunk, '', true);
            };

            Readable.prototype.isPaused = function () {
              return this._readableState.flowing === false;
            };

            function readableAddChunk(stream, state, chunk, encoding, addToFront) {
              var er = chunkInvalid(state, chunk);
              if (er) {
                stream.emit('error', er);
              } else if (chunk === null) {
                state.reading = false;
                onEofChunk(stream, state);
              } else if (state.objectMode || chunk && chunk.length > 0) {
                if (state.ended && !addToFront) {
                  var e = new Error('stream.push() after EOF');
                  stream.emit('error', e);
                } else if (state.endEmitted && addToFront) {
                  var _e = new Error('stream.unshift() after end event');
                  stream.emit('error', _e);
                } else {
                  var skipAdd;
                  if (state.decoder && !addToFront && !encoding) {
                    chunk = state.decoder.write(chunk);
                    skipAdd = !state.objectMode && chunk.length === 0;
                  }

                  if (!addToFront) state.reading = false;

                  // Don't add to the buffer if we've decoded to an empty string chunk and
                  // we're not in object mode
                  if (!skipAdd) {
                    // if we want the data now, just emit it.
                    if (state.flowing && state.length === 0 && !state.sync) {
                      stream.emit('data', chunk);
                      stream.read(0);
                    } else {
                      // update the buffer info.
                      state.length += state.objectMode ? 1 : chunk.length;
                      if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

                      if (state.needReadable) emitReadable(stream);
                    }
                  }

                  maybeReadMore(stream, state);
                }
              } else if (!addToFront) {
                state.reading = false;
              }

              return needMoreData(state);
            }

            // if it's past the high water mark, we can push in some more.
            // Also, if we have no data yet, we can stand some
            // more bytes.  This is to work around cases where hwm=0,
            // such as the repl.  Also, if the push() triggered a
            // readable event, and the user called read(largeNumber) such that
            // needReadable was set, then we ought to push more, so that another
            // 'readable' event will be triggered.
            function needMoreData(state) {
              return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
            }

            // backwards compatibility.
            Readable.prototype.setEncoding = function (enc) {
              this._readableState.decoder = new StringDecoder(enc);
              this._readableState.encoding = enc;
              return this;
            };

            // Don't raise the hwm > 8MB
            var MAX_HWM = 0x800000;
            function computeNewHighWaterMark(n) {
              if (n >= MAX_HWM) {
                n = MAX_HWM;
              } else {
                // Get the next highest power of 2 to prevent increasing hwm excessively in
                // tiny amounts
                n--;
                n |= n >>> 1;
                n |= n >>> 2;
                n |= n >>> 4;
                n |= n >>> 8;
                n |= n >>> 16;
                n++;
              }
              return n;
            }

            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function howMuchToRead(n, state) {
              if (n <= 0 || state.length === 0 && state.ended) return 0;
              if (state.objectMode) return 1;
              if (n !== n) {
                // Only flow one buffer at a time
                if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
              }
              // If we're asking for more than the current hwm, then raise the hwm.
              if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
              if (n <= state.length) return n;
              // Don't have enough
              if (!state.ended) {
                state.needReadable = true;
                return 0;
              }
              return state.length;
            }

            // you can override either this method, or the async _read(n) below.
            Readable.prototype.read = function (n) {
              debug('read', n);
              n = parseInt(n, 10);
              var state = this._readableState;
              var nOrig = n;

              if (n !== 0) state.emittedReadable = false;

              // if we're doing read(0) to trigger a readable event, but we
              // already have a bunch of data in the buffer, then just trigger
              // the 'readable' event and move on.
              if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                debug('read: emitReadable', state.length, state.ended);
                if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
                return null;
              }

              n = howMuchToRead(n, state);

              // if we've ended, and we're now clear, then finish it up.
              if (n === 0 && state.ended) {
                if (state.length === 0) endReadable(this);
                return null;
              }

              // All the actual chunk generation logic needs to be
              // *below* the call to _read.  The reason is that in certain
              // synthetic stream cases, such as passthrough streams, _read
              // may be a completely synchronous operation which may change
              // the state of the read buffer, providing enough data when
              // before there was *not* enough.
              //
              // So, the steps are:
              // 1. Figure out what the state of things will be after we do
              // a read from the buffer.
              //
              // 2. If that resulting state will trigger a _read, then call _read.
              // Note that this may be asynchronous, or synchronous.  Yes, it is
              // deeply ugly to write APIs this way, but that still doesn't mean
              // that the Readable class should behave improperly, as streams are
              // designed to be sync/async agnostic.
              // Take note if the _read call is sync or async (ie, if the read call
              // has returned yet), so that we know whether or not it's safe to emit
              // 'readable' etc.
              //
              // 3. Actually pull the requested chunks out of the buffer and return.

              // if we need a readable event, then we need to do some reading.
              var doRead = state.needReadable;
              debug('need readable', doRead);

              // if we currently have less than the highWaterMark, then also read some
              if (state.length === 0 || state.length - n < state.highWaterMark) {
                doRead = true;
                debug('length less than watermark', doRead);
              }

              // however, if we've ended, then there's no point, and if we're already
              // reading, then it's unnecessary.
              if (state.ended || state.reading) {
                doRead = false;
                debug('reading or ended', doRead);
              } else if (doRead) {
                debug('do read');
                state.reading = true;
                state.sync = true;
                // if the length is currently zero, then we *need* a readable event.
                if (state.length === 0) state.needReadable = true;
                // call internal read method
                this._read(state.highWaterMark);
                state.sync = false;
                // If _read pushed data synchronously, then `reading` will be false,
                // and we need to re-evaluate how much data we can return to the user.
                if (!state.reading) n = howMuchToRead(nOrig, state);
              }

              var ret;
              if (n > 0) ret = fromList(n, state);else ret = null;

              if (ret === null) {
                state.needReadable = true;
                n = 0;
              } else {
                state.length -= n;
              }

              if (state.length === 0) {
                // If we have nothing in the buffer, then we want to know
                // as soon as we *do* get something into the buffer.
                if (!state.ended) state.needReadable = true;

                // If we tried to read() past the EOF, then emit end on the next tick.
                if (nOrig !== n && state.ended) endReadable(this);
              }

              if (ret !== null) this.emit('data', ret);

              return ret;
            };

            function chunkInvalid(state, chunk) {
              var er = null;
              if (!isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
                er = new TypeError('Invalid non-string/buffer chunk');
              }
              return er;
            }

            function onEofChunk(stream, state) {
              if (state.ended) return;
              if (state.decoder) {
                var chunk = state.decoder.end();
                if (chunk && chunk.length) {
                  state.buffer.push(chunk);
                  state.length += state.objectMode ? 1 : chunk.length;
                }
              }
              state.ended = true;

              // emit 'readable' now to make sure it gets picked up.
              emitReadable(stream);
            }

            // Don't emit readable right away in sync mode, because this can trigger
            // another read() call => stack overflow.  This way, it might trigger
            // a nextTick recursion warning, but that's not so bad.
            function emitReadable(stream) {
              var state = stream._readableState;
              state.needReadable = false;
              if (!state.emittedReadable) {
                debug('emitReadable', state.flowing);
                state.emittedReadable = true;
                if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
              }
            }

            function emitReadable_(stream) {
              debug('emit readable');
              stream.emit('readable');
              flow(stream);
            }

            // at this point, the user has presumably seen the 'readable' event,
            // and called read() to consume some data.  that may have triggered
            // in turn another _read(n) call, in which case reading = true if
            // it's in progress.
            // However, if we're not ended, or reading, and the length < hwm,
            // then go ahead and try to read some more preemptively.
            function maybeReadMore(stream, state) {
              if (!state.readingMore) {
                state.readingMore = true;
                nextTick(maybeReadMore_, stream, state);
              }
            }

            function maybeReadMore_(stream, state) {
              var len = state.length;
              while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                debug('maybeReadMore read 0');
                stream.read(0);
                if (len === state.length)
                  // didn't get any data, stop spinning.
                  break;else len = state.length;
              }
              state.readingMore = false;
            }

            // abstract method.  to be overridden in specific implementation classes.
            // call cb(er, data) where data is <= n in length.
            // for virtual (non-string, non-buffer) streams, "length" is somewhat
            // arbitrary, and perhaps not very meaningful.
            Readable.prototype._read = function (n) {
              this.emit('error', new Error('not implemented'));
            };

            Readable.prototype.pipe = function (dest, pipeOpts) {
              var src = this;
              var state = this._readableState;

              switch (state.pipesCount) {
                case 0:
                  state.pipes = dest;
                  break;
                case 1:
                  state.pipes = [state.pipes, dest];
                  break;
                default:
                  state.pipes.push(dest);
                  break;
              }
              state.pipesCount += 1;
              debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

              var doEnd = (!pipeOpts || pipeOpts.end !== false);

              var endFn = doEnd ? onend : cleanup;
              if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

              dest.on('unpipe', onunpipe);
              function onunpipe(readable) {
                debug('onunpipe');
                if (readable === src) {
                  cleanup();
                }
              }

              function onend() {
                debug('onend');
                dest.end();
              }

              // when the dest drains, it reduces the awaitDrain counter
              // on the source.  This would be more elegant with a .once()
              // handler in flow(), but adding and removing repeatedly is
              // too slow.
              var ondrain = pipeOnDrain(src);
              dest.on('drain', ondrain);

              var cleanedUp = false;
              function cleanup() {
                debug('cleanup');
                // cleanup event handlers once the pipe is broken
                dest.removeListener('close', onclose);
                dest.removeListener('finish', onfinish);
                dest.removeListener('drain', ondrain);
                dest.removeListener('error', onerror);
                dest.removeListener('unpipe', onunpipe);
                src.removeListener('end', onend);
                src.removeListener('end', cleanup);
                src.removeListener('data', ondata);

                cleanedUp = true;

                // if the reader is waiting for a drain event from this
                // specific writer, then it would cause it to never start
                // flowing again.
                // So, if this is awaiting a drain, then we just call it now.
                // If we don't know, then assume that we are waiting for one.
                if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
              }

              // If the user pushes more data while we're writing to dest then we'll end up
              // in ondata again. However, we only want to increase awaitDrain once because
              // dest will only emit one 'drain' event for the multiple writes.
              // => Introduce a guard on increasing awaitDrain.
              var increasedAwaitDrain = false;
              src.on('data', ondata);
              function ondata(chunk) {
                debug('ondata');
                increasedAwaitDrain = false;
                var ret = dest.write(chunk);
                if (false === ret && !increasedAwaitDrain) {
                  // If the user unpiped during `dest.write()`, it is possible
                  // to get stuck in a permanently paused state if that write
                  // also returned false.
                  // => Check whether `dest` is still a piping destination.
                  if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                    debug('false write response, pause', src._readableState.awaitDrain);
                    src._readableState.awaitDrain++;
                    increasedAwaitDrain = true;
                  }
                  src.pause();
                }
              }

              // if the dest has an error, then stop piping into it.
              // however, don't suppress the throwing behavior for this.
              function onerror(er) {
                debug('onerror', er);
                unpipe();
                dest.removeListener('error', onerror);
                if (listenerCount$1(dest, 'error') === 0) dest.emit('error', er);
              }

              // Make sure our error handler is attached before userland ones.
              prependListener(dest, 'error', onerror);

              // Both close and finish should trigger unpipe, but only once.
              function onclose() {
                dest.removeListener('finish', onfinish);
                unpipe();
              }
              dest.once('close', onclose);
              function onfinish() {
                debug('onfinish');
                dest.removeListener('close', onclose);
                unpipe();
              }
              dest.once('finish', onfinish);

              function unpipe() {
                debug('unpipe');
                src.unpipe(dest);
              }

              // tell the dest that it's being piped to
              dest.emit('pipe', src);

              // start the flow if it hasn't been started already.
              if (!state.flowing) {
                debug('pipe resume');
                src.resume();
              }

              return dest;
            };

            function pipeOnDrain(src) {
              return function () {
                var state = src._readableState;
                debug('pipeOnDrain', state.awaitDrain);
                if (state.awaitDrain) state.awaitDrain--;
                if (state.awaitDrain === 0 && src.listeners('data').length) {
                  state.flowing = true;
                  flow(src);
                }
              };
            }

            Readable.prototype.unpipe = function (dest) {
              var state = this._readableState;

              // if we're not piping anywhere, then do nothing.
              if (state.pipesCount === 0) return this;

              // just one destination.  most common case.
              if (state.pipesCount === 1) {
                // passed in one, but it's not the right one.
                if (dest && dest !== state.pipes) return this;

                if (!dest) dest = state.pipes;

                // got a match.
                state.pipes = null;
                state.pipesCount = 0;
                state.flowing = false;
                if (dest) dest.emit('unpipe', this);
                return this;
              }

              // slow case. multiple pipe destinations.

              if (!dest) {
                // remove all.
                var dests = state.pipes;
                var len = state.pipesCount;
                state.pipes = null;
                state.pipesCount = 0;
                state.flowing = false;

                for (var _i = 0; _i < len; _i++) {
                  dests[_i].emit('unpipe', this);
                }return this;
              }

              // try to find the right one.
              var i = indexOf(state.pipes, dest);
              if (i === -1) return this;

              state.pipes.splice(i, 1);
              state.pipesCount -= 1;
              if (state.pipesCount === 1) state.pipes = state.pipes[0];

              dest.emit('unpipe', this);

              return this;
            };

            // set up data events if they are asked for
            // Ensure readable listeners eventually get something
            Readable.prototype.on = function (ev, fn) {
              var res = EventEmitter.prototype.on.call(this, ev, fn);

              if (ev === 'data') {
                // Start flowing on next tick if stream isn't explicitly paused
                if (this._readableState.flowing !== false) this.resume();
              } else if (ev === 'readable') {
                var state = this._readableState;
                if (!state.endEmitted && !state.readableListening) {
                  state.readableListening = state.needReadable = true;
                  state.emittedReadable = false;
                  if (!state.reading) {
                    nextTick(nReadingNextTick, this);
                  } else if (state.length) {
                    emitReadable(this);
                  }
                }
              }

              return res;
            };
            Readable.prototype.addListener = Readable.prototype.on;

            function nReadingNextTick(self) {
              debug('readable nexttick read 0');
              self.read(0);
            }

            // pause() and resume() are remnants of the legacy readable stream API
            // If the user uses them, then switch into old mode.
            Readable.prototype.resume = function () {
              var state = this._readableState;
              if (!state.flowing) {
                debug('resume');
                state.flowing = true;
                resume(this, state);
              }
              return this;
            };

            function resume(stream, state) {
              if (!state.resumeScheduled) {
                state.resumeScheduled = true;
                nextTick(resume_, stream, state);
              }
            }

            function resume_(stream, state) {
              if (!state.reading) {
                debug('resume read 0');
                stream.read(0);
              }

              state.resumeScheduled = false;
              state.awaitDrain = 0;
              stream.emit('resume');
              flow(stream);
              if (state.flowing && !state.reading) stream.read(0);
            }

            Readable.prototype.pause = function () {
              debug('call pause flowing=%j', this._readableState.flowing);
              if (false !== this._readableState.flowing) {
                debug('pause');
                this._readableState.flowing = false;
                this.emit('pause');
              }
              return this;
            };

            function flow(stream) {
              var state = stream._readableState;
              debug('flow', state.flowing);
              while (state.flowing && stream.read() !== null) {}
            }

            // wrap an old-style stream as the async data source.
            // This is *not* part of the readable stream interface.
            // It is an ugly unfortunate mess of history.
            Readable.prototype.wrap = function (stream) {
              var state = this._readableState;
              var paused = false;

              var self = this;
              stream.on('end', function () {
                debug('wrapped end');
                if (state.decoder && !state.ended) {
                  var chunk = state.decoder.end();
                  if (chunk && chunk.length) self.push(chunk);
                }

                self.push(null);
              });

              stream.on('data', function (chunk) {
                debug('wrapped data');
                if (state.decoder) chunk = state.decoder.write(chunk);

                // don't skip over falsy values in objectMode
                if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

                var ret = self.push(chunk);
                if (!ret) {
                  paused = true;
                  stream.pause();
                }
              });

              // proxy all the other methods.
              // important when wrapping filters and duplexes.
              for (var i in stream) {
                if (this[i] === undefined && typeof stream[i] === 'function') {
                  this[i] = function (method) {
                    return function () {
                      return stream[method].apply(stream, arguments);
                    };
                  }(i);
                }
              }

              // proxy certain important events.
              var events = ['error', 'close', 'destroy', 'pause', 'resume'];
              forEach(events, function (ev) {
                stream.on(ev, self.emit.bind(self, ev));
              });

              // when we try to consume some more bytes, simply unpause the
              // underlying stream.
              self._read = function (n) {
                debug('wrapped _read', n);
                if (paused) {
                  paused = false;
                  stream.resume();
                }
              };

              return self;
            };

            // exposed for testing purposes only.
            Readable._fromList = fromList;

            // Pluck off n bytes from an array of buffers.
            // Length is the combined lengths of all the buffers in the list.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function fromList(n, state) {
              // nothing buffered
              if (state.length === 0) return null;

              var ret;
              if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
                // read it all, truncate the list
                if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
                state.buffer.clear();
              } else {
                // read part of list
                ret = fromListPartial(n, state.buffer, state.decoder);
              }

              return ret;
            }

            // Extracts only enough buffered data to satisfy the amount requested.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function fromListPartial(n, list, hasStrings) {
              var ret;
              if (n < list.head.data.length) {
                // slice is the same for buffers and strings
                ret = list.head.data.slice(0, n);
                list.head.data = list.head.data.slice(n);
              } else if (n === list.head.data.length) {
                // first chunk is a perfect match
                ret = list.shift();
              } else {
                // result spans more than one buffer
                ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
              }
              return ret;
            }

            // Copies a specified amount of characters from the list of buffered data
            // chunks.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function copyFromBufferString(n, list) {
              var p = list.head;
              var c = 1;
              var ret = p.data;
              n -= ret.length;
              while (p = p.next) {
                var str = p.data;
                var nb = n > str.length ? str.length : n;
                if (nb === str.length) ret += str;else ret += str.slice(0, n);
                n -= nb;
                if (n === 0) {
                  if (nb === str.length) {
                    ++c;
                    if (p.next) list.head = p.next;else list.head = list.tail = null;
                  } else {
                    list.head = p;
                    p.data = str.slice(nb);
                  }
                  break;
                }
                ++c;
              }
              list.length -= c;
              return ret;
            }

            // Copies a specified amount of bytes from the list of buffered data chunks.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function copyFromBuffer(n, list) {
              var ret = Buffer.allocUnsafe(n);
              var p = list.head;
              var c = 1;
              p.data.copy(ret);
              n -= p.data.length;
              while (p = p.next) {
                var buf = p.data;
                var nb = n > buf.length ? buf.length : n;
                buf.copy(ret, ret.length - n, 0, nb);
                n -= nb;
                if (n === 0) {
                  if (nb === buf.length) {
                    ++c;
                    if (p.next) list.head = p.next;else list.head = list.tail = null;
                  } else {
                    list.head = p;
                    p.data = buf.slice(nb);
                  }
                  break;
                }
                ++c;
              }
              list.length -= c;
              return ret;
            }

            function endReadable(stream) {
              var state = stream._readableState;

              // If we get here before consuming all the bytes, then that is a
              // bug in node.  Should never happen.
              if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

              if (!state.endEmitted) {
                state.ended = true;
                nextTick(endReadableNT, state, stream);
              }
            }

            function endReadableNT(state, stream) {
              // Check that we didn't get one last unshift.
              if (!state.endEmitted && state.length === 0) {
                state.endEmitted = true;
                stream.readable = false;
                stream.emit('end');
              }
            }

            function forEach(xs, f) {
              for (var i = 0, l = xs.length; i < l; i++) {
                f(xs[i], i);
              }
            }

            function indexOf(xs, x) {
              for (var i = 0, l = xs.length; i < l; i++) {
                if (xs[i] === x) return i;
              }
              return -1;
            }

            // A bit simpler than readable streams.
            Writable.WritableState = WritableState;
            inherits$1(Writable, EventEmitter);

            function nop() {}

            function WriteReq(chunk, encoding, cb) {
              this.chunk = chunk;
              this.encoding = encoding;
              this.callback = cb;
              this.next = null;
            }

            function WritableState(options, stream) {
              Object.defineProperty(this, 'buffer', {
                get: deprecate(function () {
                  return this.getBuffer();
                }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
              });
              options = options || {};

              // object stream flag to indicate whether or not this stream
              // contains buffers or objects.
              this.objectMode = !!options.objectMode;

              if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

              // the point at which write() starts returning false
              // Note: 0 is a valid value, means that we always return false if
              // the entire buffer is not flushed immediately on write()
              var hwm = options.highWaterMark;
              var defaultHwm = this.objectMode ? 16 : 16 * 1024;
              this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

              // cast to ints.
              this.highWaterMark = ~ ~this.highWaterMark;

              this.needDrain = false;
              // at the start of calling end()
              this.ending = false;
              // when end() has been called, and returned
              this.ended = false;
              // when 'finish' is emitted
              this.finished = false;

              // should we decode strings into buffers before passing to _write?
              // this is here so that some node-core streams can optimize string
              // handling at a lower level.
              var noDecode = options.decodeStrings === false;
              this.decodeStrings = !noDecode;

              // Crypto is kind of old and crusty.  Historically, its default string
              // encoding is 'binary' so we have to make this configurable.
              // Everything else in the universe uses 'utf8', though.
              this.defaultEncoding = options.defaultEncoding || 'utf8';

              // not an actual buffer we keep track of, but a measurement
              // of how much we're waiting to get pushed to some underlying
              // socket or file.
              this.length = 0;

              // a flag to see when we're in the middle of a write.
              this.writing = false;

              // when true all writes will be buffered until .uncork() call
              this.corked = 0;

              // a flag to be able to tell if the onwrite cb is called immediately,
              // or on a later tick.  We set this to true at first, because any
              // actions that shouldn't happen until "later" should generally also
              // not happen before the first write call.
              this.sync = true;

              // a flag to know if we're processing previously buffered items, which
              // may call the _write() callback in the same tick, so that we don't
              // end up in an overlapped onwrite situation.
              this.bufferProcessing = false;

              // the callback that's passed to _write(chunk,cb)
              this.onwrite = function (er) {
                onwrite(stream, er);
              };

              // the callback that the user supplies to write(chunk,encoding,cb)
              this.writecb = null;

              // the amount that is being written when _write is called.
              this.writelen = 0;

              this.bufferedRequest = null;
              this.lastBufferedRequest = null;

              // number of pending user-supplied write callbacks
              // this must be 0 before 'finish' can be emitted
              this.pendingcb = 0;

              // emit prefinish if the only thing we're waiting for is _write cbs
              // This is relevant for synchronous Transform streams
              this.prefinished = false;

              // True if the error was already emitted and should not be thrown again
              this.errorEmitted = false;

              // count buffered requests
              this.bufferedRequestCount = 0;

              // allocate the first CorkedRequest, there is always
              // one allocated and free to use, and we maintain at most two
              this.corkedRequestsFree = new CorkedRequest(this);
            }

            WritableState.prototype.getBuffer = function writableStateGetBuffer() {
              var current = this.bufferedRequest;
              var out = [];
              while (current) {
                out.push(current);
                current = current.next;
              }
              return out;
            };
            function Writable(options) {

              // Writable ctor is applied to Duplexes, though they're not
              // instanceof Writable, they're instanceof Readable.
              if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

              this._writableState = new WritableState(options, this);

              // legacy.
              this.writable = true;

              if (options) {
                if (typeof options.write === 'function') this._write = options.write;

                if (typeof options.writev === 'function') this._writev = options.writev;
              }

              EventEmitter.call(this);
            }

            // Otherwise people can pipe Writable streams, which is just wrong.
            Writable.prototype.pipe = function () {
              this.emit('error', new Error('Cannot pipe, not readable'));
            };

            function writeAfterEnd(stream, cb) {
              var er = new Error('write after end');
              // TODO: defer error events consistently everywhere, not just the cb
              stream.emit('error', er);
              nextTick(cb, er);
            }

            // If we get something that is not a buffer, string, null, or undefined,
            // and we're not in objectMode, then that's an error.
            // Otherwise stream chunks are all considered to be of length=1, and the
            // watermarks determine how many objects to keep in the buffer, rather than
            // how many bytes or characters.
            function validChunk(stream, state, chunk, cb) {
              var valid = true;
              var er = false;
              // Always throw error if a null is written
              // if we are not in object mode then throw
              // if it is not a buffer, string, or undefined.
              if (chunk === null) {
                er = new TypeError('May not write null values to stream');
              } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
                er = new TypeError('Invalid non-string/buffer chunk');
              }
              if (er) {
                stream.emit('error', er);
                nextTick(cb, er);
                valid = false;
              }
              return valid;
            }

            Writable.prototype.write = function (chunk, encoding, cb) {
              var state = this._writableState;
              var ret = false;

              if (typeof encoding === 'function') {
                cb = encoding;
                encoding = null;
              }

              if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

              if (typeof cb !== 'function') cb = nop;

              if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
                state.pendingcb++;
                ret = writeOrBuffer(this, state, chunk, encoding, cb);
              }

              return ret;
            };

            Writable.prototype.cork = function () {
              var state = this._writableState;

              state.corked++;
            };

            Writable.prototype.uncork = function () {
              var state = this._writableState;

              if (state.corked) {
                state.corked--;

                if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
              }
            };

            Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
              // node::ParseEncoding() requires lower case.
              if (typeof encoding === 'string') encoding = encoding.toLowerCase();
              if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
              this._writableState.defaultEncoding = encoding;
              return this;
            };

            function decodeChunk(state, chunk, encoding) {
              if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
                chunk = Buffer.from(chunk, encoding);
              }
              return chunk;
            }

            // if we're already writing something, then just put this
            // in the queue, and wait our turn.  Otherwise, call _write
            // If we return false, then we need a drain event, so set that flag.
            function writeOrBuffer(stream, state, chunk, encoding, cb) {
              chunk = decodeChunk(state, chunk, encoding);

              if (Buffer.isBuffer(chunk)) encoding = 'buffer';
              var len = state.objectMode ? 1 : chunk.length;

              state.length += len;

              var ret = state.length < state.highWaterMark;
              // we must ensure that previous needDrain will not be reset to false.
              if (!ret) state.needDrain = true;

              if (state.writing || state.corked) {
                var last = state.lastBufferedRequest;
                state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
                if (last) {
                  last.next = state.lastBufferedRequest;
                } else {
                  state.bufferedRequest = state.lastBufferedRequest;
                }
                state.bufferedRequestCount += 1;
              } else {
                doWrite(stream, state, false, len, chunk, encoding, cb);
              }

              return ret;
            }

            function doWrite(stream, state, writev, len, chunk, encoding, cb) {
              state.writelen = len;
              state.writecb = cb;
              state.writing = true;
              state.sync = true;
              if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
              state.sync = false;
            }

            function onwriteError(stream, state, sync, er, cb) {
              --state.pendingcb;
              if (sync) nextTick(cb, er);else cb(er);

              stream._writableState.errorEmitted = true;
              stream.emit('error', er);
            }

            function onwriteStateUpdate(state) {
              state.writing = false;
              state.writecb = null;
              state.length -= state.writelen;
              state.writelen = 0;
            }

            function onwrite(stream, er) {
              var state = stream._writableState;
              var sync = state.sync;
              var cb = state.writecb;

              onwriteStateUpdate(state);

              if (er) onwriteError(stream, state, sync, er, cb);else {
                // Check if we're actually ready to finish, but don't emit yet
                var finished = needFinish(state);

                if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
                  clearBuffer(stream, state);
                }

                if (sync) {
                  /*<replacement>*/
                    nextTick(afterWrite, stream, state, finished, cb);
                  /*</replacement>*/
                } else {
                    afterWrite(stream, state, finished, cb);
                  }
              }
            }

            function afterWrite(stream, state, finished, cb) {
              if (!finished) onwriteDrain(stream, state);
              state.pendingcb--;
              cb();
              finishMaybe(stream, state);
            }

            // Must force callback to be called on nextTick, so that we don't
            // emit 'drain' before the write() consumer gets the 'false' return
            // value, and has a chance to attach a 'drain' listener.
            function onwriteDrain(stream, state) {
              if (state.length === 0 && state.needDrain) {
                state.needDrain = false;
                stream.emit('drain');
              }
            }

            // if there's something in the buffer waiting, then process it
            function clearBuffer(stream, state) {
              state.bufferProcessing = true;
              var entry = state.bufferedRequest;

              if (stream._writev && entry && entry.next) {
                // Fast case, write everything using _writev()
                var l = state.bufferedRequestCount;
                var buffer = new Array(l);
                var holder = state.corkedRequestsFree;
                holder.entry = entry;

                var count = 0;
                while (entry) {
                  buffer[count] = entry;
                  entry = entry.next;
                  count += 1;
                }

                doWrite(stream, state, true, state.length, buffer, '', holder.finish);

                // doWrite is almost always async, defer these to save a bit of time
                // as the hot path ends with doWrite
                state.pendingcb++;
                state.lastBufferedRequest = null;
                if (holder.next) {
                  state.corkedRequestsFree = holder.next;
                  holder.next = null;
                } else {
                  state.corkedRequestsFree = new CorkedRequest(state);
                }
              } else {
                // Slow case, write chunks one-by-one
                while (entry) {
                  var chunk = entry.chunk;
                  var encoding = entry.encoding;
                  var cb = entry.callback;
                  var len = state.objectMode ? 1 : chunk.length;

                  doWrite(stream, state, false, len, chunk, encoding, cb);
                  entry = entry.next;
                  // if we didn't call the onwrite immediately, then
                  // it means that we need to wait until it does.
                  // also, that means that the chunk and cb are currently
                  // being processed, so move the buffer counter past them.
                  if (state.writing) {
                    break;
                  }
                }

                if (entry === null) state.lastBufferedRequest = null;
              }

              state.bufferedRequestCount = 0;
              state.bufferedRequest = entry;
              state.bufferProcessing = false;
            }

            Writable.prototype._write = function (chunk, encoding, cb) {
              cb(new Error('not implemented'));
            };

            Writable.prototype._writev = null;

            Writable.prototype.end = function (chunk, encoding, cb) {
              var state = this._writableState;

              if (typeof chunk === 'function') {
                cb = chunk;
                chunk = null;
                encoding = null;
              } else if (typeof encoding === 'function') {
                cb = encoding;
                encoding = null;
              }

              if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

              // .end() fully uncorks
              if (state.corked) {
                state.corked = 1;
                this.uncork();
              }

              // ignore unnecessary end() calls.
              if (!state.ending && !state.finished) endWritable(this, state, cb);
            };

            function needFinish(state) {
              return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
            }

            function prefinish(stream, state) {
              if (!state.prefinished) {
                state.prefinished = true;
                stream.emit('prefinish');
              }
            }

            function finishMaybe(stream, state) {
              var need = needFinish(state);
              if (need) {
                if (state.pendingcb === 0) {
                  prefinish(stream, state);
                  state.finished = true;
                  stream.emit('finish');
                } else {
                  prefinish(stream, state);
                }
              }
              return need;
            }

            function endWritable(stream, state, cb) {
              state.ending = true;
              finishMaybe(stream, state);
              if (cb) {
                if (state.finished) nextTick(cb);else stream.once('finish', cb);
              }
              state.ended = true;
              stream.writable = false;
            }

            // It seems a linked list but it is not
            // there will be only 2 of these for each stream
            function CorkedRequest(state) {
              var _this = this;

              this.next = null;
              this.entry = null;

              this.finish = function (err) {
                var entry = _this.entry;
                _this.entry = null;
                while (entry) {
                  var cb = entry.callback;
                  state.pendingcb--;
                  cb(err);
                  entry = entry.next;
                }
                if (state.corkedRequestsFree) {
                  state.corkedRequestsFree.next = _this;
                } else {
                  state.corkedRequestsFree = _this;
                }
              };
            }

            inherits$1(Duplex, Readable);

            var keys = Object.keys(Writable.prototype);
            for (var v = 0; v < keys.length; v++) {
              var method = keys[v];
              if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
            }
            function Duplex(options) {
              if (!(this instanceof Duplex)) return new Duplex(options);

              Readable.call(this, options);
              Writable.call(this, options);

              if (options && options.readable === false) this.readable = false;

              if (options && options.writable === false) this.writable = false;

              this.allowHalfOpen = true;
              if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

              this.once('end', onend);
            }

            // the no-half-open enforcer
            function onend() {
              // if we allow half-open state, or if the writable side ended,
              // then we're ok.
              if (this.allowHalfOpen || this._writableState.ended) return;

              // no more data can be written.
              // But allow more writes to happen in this tick.
              nextTick(onEndNT, this);
            }

            function onEndNT(self) {
              self.end();
            }

            // a transform stream is a readable/writable stream where you do
            inherits$1(Transform, Duplex);

            function TransformState(stream) {
              this.afterTransform = function (er, data) {
                return afterTransform(stream, er, data);
              };

              this.needTransform = false;
              this.transforming = false;
              this.writecb = null;
              this.writechunk = null;
              this.writeencoding = null;
            }

            function afterTransform(stream, er, data) {
              var ts = stream._transformState;
              ts.transforming = false;

              var cb = ts.writecb;

              if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

              ts.writechunk = null;
              ts.writecb = null;

              if (data !== null && data !== undefined) stream.push(data);

              cb(er);

              var rs = stream._readableState;
              rs.reading = false;
              if (rs.needReadable || rs.length < rs.highWaterMark) {
                stream._read(rs.highWaterMark);
              }
            }
            function Transform(options) {
              if (!(this instanceof Transform)) return new Transform(options);

              Duplex.call(this, options);

              this._transformState = new TransformState(this);

              // when the writable side finishes, then flush out anything remaining.
              var stream = this;

              // start out asking for a readable event once data is transformed.
              this._readableState.needReadable = true;

              // we have implemented the _read method, and done the other things
              // that Readable wants before the first _read call, so unset the
              // sync guard flag.
              this._readableState.sync = false;

              if (options) {
                if (typeof options.transform === 'function') this._transform = options.transform;

                if (typeof options.flush === 'function') this._flush = options.flush;
              }

              this.once('prefinish', function () {
                if (typeof this._flush === 'function') this._flush(function (er) {
                  done(stream, er);
                });else done(stream);
              });
            }

            Transform.prototype.push = function (chunk, encoding) {
              this._transformState.needTransform = false;
              return Duplex.prototype.push.call(this, chunk, encoding);
            };

            // This is the part where you do stuff!
            // override this function in implementation classes.
            // 'chunk' is an input chunk.
            //
            // Call `push(newChunk)` to pass along transformed output
            // to the readable side.  You may call 'push' zero or more times.
            //
            // Call `cb(err)` when you are done with this chunk.  If you pass
            // an error, then that'll put the hurt on the whole operation.  If you
            // never call cb(), then you'll never get another chunk.
            Transform.prototype._transform = function (chunk, encoding, cb) {
              throw new Error('Not implemented');
            };

            Transform.prototype._write = function (chunk, encoding, cb) {
              var ts = this._transformState;
              ts.writecb = cb;
              ts.writechunk = chunk;
              ts.writeencoding = encoding;
              if (!ts.transforming) {
                var rs = this._readableState;
                if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
              }
            };

            // Doesn't matter what the args are here.
            // _transform does all the work.
            // That we got here means that the readable side wants more data.
            Transform.prototype._read = function (n) {
              var ts = this._transformState;

              if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                ts.transforming = true;
                this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
              } else {
                // mark that we need a transform, so that any data that comes in
                // will get processed, now that we've asked for it.
                ts.needTransform = true;
              }
            };

            function done(stream, er) {
              if (er) return stream.emit('error', er);

              // if there's nothing in the write buffer, then that means
              // that nothing more will ever be provided
              var ws = stream._writableState;
              var ts = stream._transformState;

              if (ws.length) throw new Error('Calling transform done when ws.length != 0');

              if (ts.transforming) throw new Error('Calling transform done when still transforming');

              return stream.push(null);
            }

            inherits$1(PassThrough, Transform);
            function PassThrough(options) {
              if (!(this instanceof PassThrough)) return new PassThrough(options);

              Transform.call(this, options);
            }

            PassThrough.prototype._transform = function (chunk, encoding, cb) {
              cb(null, chunk);
            };

            inherits$1(Stream, EventEmitter);
            Stream.Readable = Readable;
            Stream.Writable = Writable;
            Stream.Duplex = Duplex;
            Stream.Transform = Transform;
            Stream.PassThrough = PassThrough;

            // Backwards-compat with node 0.4.x
            Stream.Stream = Stream;

            // old-style streams.  Note that the pipe method (the only relevant
            // part of this class) is overridden in the Readable class.

            function Stream() {
              EventEmitter.call(this);
            }

            Stream.prototype.pipe = function(dest, options) {
              var source = this;

              function ondata(chunk) {
                if (dest.writable) {
                  if (false === dest.write(chunk) && source.pause) {
                    source.pause();
                  }
                }
              }

              source.on('data', ondata);

              function ondrain() {
                if (source.readable && source.resume) {
                  source.resume();
                }
              }

              dest.on('drain', ondrain);

              // If the 'end' option is not supplied, dest.end() will be called when
              // source gets the 'end' or 'close' events.  Only dest.end() once.
              if (!dest._isStdio && (!options || options.end !== false)) {
                source.on('end', onend);
                source.on('close', onclose);
              }

              var didOnEnd = false;
              function onend() {
                if (didOnEnd) return;
                didOnEnd = true;

                dest.end();
              }


              function onclose() {
                if (didOnEnd) return;
                didOnEnd = true;

                if (typeof dest.destroy === 'function') dest.destroy();
              }

              // don't leave dangling pipes when there are errors.
              function onerror(er) {
                cleanup();
                if (EventEmitter.listenerCount(this, 'error') === 0) {
                  throw er; // Unhandled stream error in pipe.
                }
              }

              source.on('error', onerror);
              dest.on('error', onerror);

              // remove all the event listeners that were added.
              function cleanup() {
                source.removeListener('data', ondata);
                dest.removeListener('drain', ondrain);

                source.removeListener('end', onend);
                source.removeListener('close', onclose);

                source.removeListener('error', onerror);
                dest.removeListener('error', onerror);

                source.removeListener('end', cleanup);
                source.removeListener('close', cleanup);

                dest.removeListener('close', cleanup);
              }

              source.on('end', cleanup);
              source.on('close', cleanup);

              dest.on('close', cleanup);

              dest.emit('pipe', source);

              // Allow for unix-like usage: A.pipe(B).pipe(C)
              return dest;
            };

            var Buffer$1 = safeBuffer.Buffer;
            var Transform$1 = Stream.Transform;


            function throwIfNotStringOrBuffer (val, prefix) {
              if (!Buffer$1.isBuffer(val) && typeof val !== 'string') {
                throw new TypeError(prefix + ' must be a string or a buffer')
              }
            }

            function HashBase (blockSize) {
              Transform$1.call(this);

              this._block = Buffer$1.allocUnsafe(blockSize);
              this._blockSize = blockSize;
              this._blockOffset = 0;
              this._length = [0, 0, 0, 0];

              this._finalized = false;
            }

            inherits$2(HashBase, Transform$1);

            HashBase.prototype._transform = function (chunk, encoding, callback) {
              var error = null;
              try {
                this.update(chunk, encoding);
              } catch (err) {
                error = err;
              }

              callback(error);
            };

            HashBase.prototype._flush = function (callback) {
              var error = null;
              try {
                this.push(this.digest());
              } catch (err) {
                error = err;
              }

              callback(error);
            };

            HashBase.prototype.update = function (data, encoding) {
              throwIfNotStringOrBuffer(data, 'Data');
              if (this._finalized) throw new Error('Digest already called')
              if (!Buffer$1.isBuffer(data)) data = Buffer$1.from(data, encoding);

              // consume data
              var block = this._block;
              var offset = 0;
              while (this._blockOffset + data.length - offset >= this._blockSize) {
                for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++];
                this._update();
                this._blockOffset = 0;
              }
              while (offset < data.length) block[this._blockOffset++] = data[offset++];

              // update length
              for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
                this._length[j] += carry;
                carry = (this._length[j] / 0x0100000000) | 0;
                if (carry > 0) this._length[j] -= 0x0100000000 * carry;
              }

              return this
            };

            HashBase.prototype._update = function () {
              throw new Error('_update is not implemented')
            };

            HashBase.prototype.digest = function (encoding) {
              if (this._finalized) throw new Error('Digest already called')
              this._finalized = true;

              var digest = this._digest();
              if (encoding !== undefined) digest = digest.toString(encoding);

              // reset state
              this._block.fill(0);
              this._blockOffset = 0;
              for (var i = 0; i < 4; ++i) this._length[i] = 0;

              return digest
            };

            HashBase.prototype._digest = function () {
              throw new Error('_digest is not implemented')
            };

            var hashBase = HashBase;

            var Buffer$2 = bufferEs6.Buffer;



            var ARRAY16 = new Array(16);

            var zl = [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
              7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
              3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
              1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
              4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
            ];

            var zr = [
              5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
              6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
              15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
              8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
              12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
            ];

            var sl = [
              11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
              7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
              11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
              11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
              9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
            ];

            var sr = [
              8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
              9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
              9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
              15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
              8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
            ];

            var hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
            var hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

            function RIPEMD160 () {
              hashBase.call(this, 64);

              // state
              this._a = 0x67452301;
              this._b = 0xefcdab89;
              this._c = 0x98badcfe;
              this._d = 0x10325476;
              this._e = 0xc3d2e1f0;
            }

            inherits$2(RIPEMD160, hashBase);

            RIPEMD160.prototype._update = function () {
              var words = ARRAY16;
              for (var j = 0; j < 16; ++j) words[j] = this._block.readInt32LE(j * 4);

              var al = this._a | 0;
              var bl = this._b | 0;
              var cl = this._c | 0;
              var dl = this._d | 0;
              var el = this._e | 0;

              var ar = this._a | 0;
              var br = this._b | 0;
              var cr = this._c | 0;
              var dr = this._d | 0;
              var er = this._e | 0;

              // computation
              for (var i = 0; i < 80; i += 1) {
                var tl;
                var tr;
                if (i < 16) {
                  tl = fn1(al, bl, cl, dl, el, words[zl[i]], hl[0], sl[i]);
                  tr = fn5(ar, br, cr, dr, er, words[zr[i]], hr[0], sr[i]);
                } else if (i < 32) {
                  tl = fn2(al, bl, cl, dl, el, words[zl[i]], hl[1], sl[i]);
                  tr = fn4(ar, br, cr, dr, er, words[zr[i]], hr[1], sr[i]);
                } else if (i < 48) {
                  tl = fn3(al, bl, cl, dl, el, words[zl[i]], hl[2], sl[i]);
                  tr = fn3(ar, br, cr, dr, er, words[zr[i]], hr[2], sr[i]);
                } else if (i < 64) {
                  tl = fn4(al, bl, cl, dl, el, words[zl[i]], hl[3], sl[i]);
                  tr = fn2(ar, br, cr, dr, er, words[zr[i]], hr[3], sr[i]);
                } else { // if (i<80) {
                  tl = fn5(al, bl, cl, dl, el, words[zl[i]], hl[4], sl[i]);
                  tr = fn1(ar, br, cr, dr, er, words[zr[i]], hr[4], sr[i]);
                }

                al = el;
                el = dl;
                dl = rotl(cl, 10);
                cl = bl;
                bl = tl;

                ar = er;
                er = dr;
                dr = rotl(cr, 10);
                cr = br;
                br = tr;
              }

              // update state
              var t = (this._b + cl + dr) | 0;
              this._b = (this._c + dl + er) | 0;
              this._c = (this._d + el + ar) | 0;
              this._d = (this._e + al + br) | 0;
              this._e = (this._a + bl + cr) | 0;
              this._a = t;
            };

            RIPEMD160.prototype._digest = function () {
              // create padding and handle blocks
              this._block[this._blockOffset++] = 0x80;
              if (this._blockOffset > 56) {
                this._block.fill(0, this._blockOffset, 64);
                this._update();
                this._blockOffset = 0;
              }

              this._block.fill(0, this._blockOffset, 56);
              this._block.writeUInt32LE(this._length[0], 56);
              this._block.writeUInt32LE(this._length[1], 60);
              this._update();

              // produce result
              var buffer = Buffer$2.alloc ? Buffer$2.alloc(20) : new Buffer$2(20);
              buffer.writeInt32LE(this._a, 0);
              buffer.writeInt32LE(this._b, 4);
              buffer.writeInt32LE(this._c, 8);
              buffer.writeInt32LE(this._d, 12);
              buffer.writeInt32LE(this._e, 16);
              return buffer
            };

            function rotl (x, n) {
              return (x << n) | (x >>> (32 - n))
            }

            function fn1 (a, b, c, d, e, m, k, s) {
              return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
            }

            function fn2 (a, b, c, d, e, m, k, s) {
              return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
            }

            function fn3 (a, b, c, d, e, m, k, s) {
              return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
            }

            function fn4 (a, b, c, d, e, m, k, s) {
              return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
            }

            function fn5 (a, b, c, d, e, m, k, s) {
              return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
            }

            var ripemd160 = RIPEMD160;

            // "Generated from Java with JSweet 1.0.0 - http://www.jsweet.org";
            // BAD IMPLEMENTATION. BROKEN, BUT MUST KEEP CAUSE OF NETWORK
            //const RIPEMD160 = (function () {
            // == Convert to ES6 module for export == //
            const RIPEMD160$1 = (function () {
                function RIPEMD160() {
                    this.MDbuf = [];
                    this.MDbuf[0] = 1732584193;
                    this.MDbuf[1] = -271733879;
                    this.MDbuf[2] = -1732584194;
                    this.MDbuf[3] = 271733878;
                    this.MDbuf[4] = -1009589776;
            		this.working = new Int32Array(16);
            		
                    this.working_ptr = 0;
                    this.msglen = 0;
                }
                RIPEMD160.prototype.reset = function () {
                    this.MDbuf = [];
                    this.MDbuf[0] = 1732584193;
                    this.MDbuf[1] = -271733879;
                    this.MDbuf[2] = -1732584194;
                    this.MDbuf[3] = 271733878;
                    this.MDbuf[4] = -1009589776;
                    this.working = new Int32Array(16);
                    this.working_ptr = 0;
                    this.msglen = 0;
                };
                RIPEMD160.prototype.compress = function (X) {
                    var index = 0;
                    var a;
                    var b;
                    var c;
                    var d;
                    var e;
                    var A;
                    var B;
                    var C;
                    var D;
                    var E;
                    var temp;
                    var s;
                    A = a = this.MDbuf[0];
                    B = b = this.MDbuf[1];
                    C = c = this.MDbuf[2];
                    D = d = this.MDbuf[3];
                    E = e = this.MDbuf[4];
                    for (; index < 16; index++) {
                        temp = a + (b ^ c ^ d) + X[RIPEMD160.IndexArray[0][index]];
                        a = e;
                        e = d;
                        d = (c << 10) | (c >>> 22);
                        c = b;
                        s = RIPEMD160.ArgArray[0][index];
                        b = ((temp << s) | (temp >>> (32 - s))) + a;
                        temp = A + (B ^ (C | ~D)) + X[RIPEMD160.IndexArray[1][index]] + 1352829926;
                        A = E;
                        E = D;
                        D = (C << 10) | (C >>> 22);
                        C = B;
                        s = RIPEMD160.ArgArray[1][index];
                        B = ((temp << s) | (temp >>> (32 - s))) + A;
                    }
                    for (; index < 32; index++) {
                        temp = a + ((b & c) | (~b & d)) + X[RIPEMD160.IndexArray[0][index]] + 1518500249;
                        a = e;
                        e = d;
                        d = (c << 10) | (c >>> 22);
                        c = b;
                        s = RIPEMD160.ArgArray[0][index];
                        b = ((temp << s) | (temp >>> (32 - s))) + a;
                        temp = A + ((B & D) | (C & ~D)) + X[RIPEMD160.IndexArray[1][index]] + 1548603684;
                        A = E;
                        E = D;
                        D = (C << 10) | (C >>> 22);
                        C = B;
                        s = RIPEMD160.ArgArray[1][index];
                        B = ((temp << s) | (temp >>> (32 - s))) + A;
                    }
                    for (; index < 48; index++) {
                        temp = a + ((b | ~c) ^ d) + X[RIPEMD160.IndexArray[0][index]] + 1859775393;
                        a = e;
                        e = d;
                        d = (c << 10) | (c >>> 22);
                        c = b;
                        s = RIPEMD160.ArgArray[0][index];
                        b = ((temp << s) | (temp >>> (32 - s))) + a;
                        temp = A + ((B | ~C) ^ D) + X[RIPEMD160.IndexArray[1][index]] + 1836072691;
                        A = E;
                        E = D;
                        D = (C << 10) | (C >>> 22);
                        C = B;
                        s = RIPEMD160.ArgArray[1][index];
                        B = ((temp << s) | (temp >>> (32 - s))) + A;
                    }
                    for (; index < 64; index++) {
                        temp = a + ((b & d) | (c & ~d)) + X[RIPEMD160.IndexArray[0][index]] + -1894007588;
                        a = e;
                        e = d;
                        d = (c << 10) | (c >>> 22);
                        c = b;
                        s = RIPEMD160.ArgArray[0][index];
                        b = ((temp << s) | (temp >>> (32 - s))) + a;
                        temp = A + ((B & C) | (~B & D)) + X[RIPEMD160.IndexArray[1][index]] + 2053994217;
                        A = E;
                        E = D;
                        D = (C << 10) | (C >>> 22);
                        C = B;
                        s = RIPEMD160.ArgArray[1][index];
                        B = ((temp << s) | (temp >>> (32 - s))) + A;
                    }
                    for (; index < 80; index++) {
                        temp = a + (b ^ (c | ~d)) + X[RIPEMD160.IndexArray[0][index]] + -1454113458;
                        a = e;
                        e = d;
                        d = (c << 10) | (c >>> 22);
                        c = b;
                        s = RIPEMD160.ArgArray[0][index];
                        b = ((temp << s) | (temp >>> (32 - s))) + a;
                        temp = A + (B ^ C ^ D) + X[RIPEMD160.IndexArray[1][index]];
                        A = E;
                        E = D;
                        D = (C << 10) | (C >>> 22);
                        C = B;
                        s = RIPEMD160.ArgArray[1][index];
                        B = ((temp << s) | (temp >>> (32 - s))) + A;
                    }
                    D += c + this.MDbuf[1];
                    this.MDbuf[1] = this.MDbuf[2] + d + E;
                    this.MDbuf[2] = this.MDbuf[3] + e + A;
                    this.MDbuf[3] = this.MDbuf[4] + a + B;
                    this.MDbuf[4] = this.MDbuf[0] + b + C;
                    this.MDbuf[0] = D;
                };
                RIPEMD160.prototype.MDfinish = function (array, lswlen, mswlen) {
                    var X = array;
                    X[(lswlen >> 2) & 15] ^= 1 << (((lswlen & 3) << 3) + 7);
                    if (((lswlen & 63) > 55)) {
                        this.compress(X);
                        for (var i = 0; i < 14; i++) {
                            X[i] = 0;
                        }
                    }
                    X[14] = lswlen << 3;
                    X[15] = (lswlen >> 29) | (mswlen << 3);
                    this.compress(X);
                };
                RIPEMD160.prototype.update = function (input) {
                    for (var i = 0; i < input.length; i++) {
                        this.working[this.working_ptr >> 2] ^= input[i] << ((this.working_ptr & 3) << 3);
                        this.working_ptr++;
                        if ((this.working_ptr == 64)) {
                            this.compress(this.working);
                            for (var j = 0; j < 16; j++) {
                                this.working[j] = 0;
                            }
                            this.working_ptr = 0;
                        }
                    }
                    this.msglen += input.length;
                };
                RIPEMD160.prototype.digestBin = function () {
                    this.MDfinish(this.working, this.msglen, 0);
                    //var res = new Int8Array();
            		var res = [];
                    for (var i = 0; i < 20; i++) {
                        res[i] = ((this.MDbuf[i >> 2] >>> ((i & 3) << 3)) & 255);
                    }
                    return new Uint8Array(res);
                };
                RIPEMD160.prototype.digest = function (input) {
                    this.update(new Int8Array(input));
                    return this.digestBin();
                };
                RIPEMD160.ArgArray = [[11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6], [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]];
                RIPEMD160.IndexArray = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13], [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]];
                return RIPEMD160;
            })();

            // NEEDS TO MOVE TO THE COIN-CONFIG SECTION

            // Qortal TX types



            const TX_TYPES = {
                1: "Genesis",
                2: "Payment",
                
                3: "Name registration",
                4: "Name update",
                5: "Sell name",
                6: "Cancel sell name",
                7: "Buy name",
                
                8: "Create poll",
                9: "Vote in poll",
                
                10: "Arbitrary",
                
                11: "Issue asset",
                12: "Transfer asset",
                13: "Create asset order",
                14: "Cancel asset order",
                15: "Multi-payment transaction",
                
                16: "Deploy AT",
                
                17: "Message",

                18: "Delegation",
                19: "Supernode",
                20: "Airdrop",

                21: 'AT',

                22: 'Create group',
                23: 'Update group',
                24: 'Add group admin',
                25: 'Remove group admin',
                26: 'Group ban',
                27: 'Cancel group ban',
                28: 'Group kick',
                29: 'Group invite',
                30: 'Cancel group invite',
                31: 'Join group',
                32: 'Leave group',
                33: 'Group approval',
                34: 'Set group',

                35: 'Update asset',

                36: 'Account flags',

                37: 'Enable forging',
                38: 'Reward share',
                39: 'Account level'
            };

            const QORT_DECIMALS = 1e8;

            const ADDRESS_VERSION = 58;  // Q for Qora

            //const TX_TYPES =  {
            //    GENESIS_TRANSACTION: 1,
            //    PAYMENT_TRANSACTION: 2,
            //
            //    REGISTER_NAME_TRANSACTION: 3,
            //    UPDATE_NAME_TRANSACTION: 4,
            //    SELL_NAME_TRANSACTION: 5,
            //    CANCEL_SELL_NAME_TRANSACTION: 6,
            //    BUY_NAME_TRANSACTION: 7,
            //
            //    CREATE_POLL_TRANSACTION: 8,
            //    VOTE_ON_POLL_TRANSACTION: 9,
            //
            //    ARBITRARY_TRANSACTION: 10,
            //
            //    ISSUE_ASSET_TRANSACTION: 11,
            //    TRANSFER_ASSET_TRANSACTION: 12,
            //    CREATE_ORDER_TRANSACTION: 13,
            //    CANCEL_ORDER_TRANSACTION: 14,
            //    MULTI_PAYMENT_TRANSACTION: 15,
            //
            //    DEPLOY_AT_TRANSACTION: 16,
            //
            //    MESSAGE_TRANSACTION: 17
            //};

            // Some string, and amount of times to sha256 it
            const repeatSHA256 = (passphrase, hashes) => {
                let hash = passphrase;
                for (let i = 0; i < hashes; i++) {
                    hash = new Sha256().process(hash).finish().result;
                }
                return hash
            };

            const publicKeyToAddress = (publicKey, qora = false) => {
                const publicKeySha256 = new Sha256().process(publicKey).finish().result;
                const publicKeyHashHex = qora ? new RIPEMD160$1().digest(publicKeySha256) : new ripemd160().update(Buffer.from(publicKeySha256)).digest('hex');
                // const publicKeyHashHex = new RIPEMD160().update(Buffer.from(publicKeySha256)).digest('hex')
                const publicKeyHash = qora ? publicKeyHashHex : utils.hexToBytes(publicKeyHashHex);
                let address = new Uint8Array();
                
                address = utils.appendBuffer(address, [ADDRESS_VERSION]);
                address = utils.appendBuffer(address, publicKeyHash);

                // const checkSum = Sha256.bytes(Sha256.bytes(address))
                const checkSum = repeatSHA256(address, 2);
                address = utils.appendBuffer(address, checkSum.subarray(0, 4));
                // Turn it into a string
                address = Base58$1.encode(address);
                // console.log(address)
                return address
            };

            /*
            Copyright 2017-2018 @ irontiga and vbcs (original developer)
            */
            // // Just for a quick debug
            // window.utils = utils
            // window.RIPEMD160 = RIPEMD160

            class PhraseWallet {
                constructor (seed, walletVersion) {
                    // walletVersion 1 = Original Java wallet version with double sha etc.
                    // walletVersion 2 = "new" Qora ui seed generation
                    this._walletVersion = walletVersion || 2;
                    this.seed = seed;

                    // Probably put getters/setters to validate...
                    this.savedSeedData = {};
                    this.hasBeenSaved = false;
                }
                /*
                seed is a byte array
                */
                set seed (seed) {
                    this._byteSeed = seed;
                    this._base58Seed = Base58$1.encode(seed);
                    // console.log(this._base58Seed)

                    this._addresses = [];

                    this.genAddress(0);
                }

                getAddress (nonce) {
                    return this._addresses[nonce]
                }

                get addresses () {
                    return this._addresses
                }

                get addressIDs () {
                    // only return IDs
                    return this._addresses.map(addr => {
                        return addr.address
                    })
                }

                get seed () {
                    return this._byteSeed
                }

                addressExists (nonce) {
                    return this._addresses[nonce] != undefined
                }

                // // Some string, and amount of times to sha256 it
                // _repeatSHA256 (passphrase, hashes) {
                //     let hash = passphrase
                //     for (let i = 0; i < hashes; i++) {
                //         hash = new Sha256().process(hash).finish().result
                //     }
                //     return hash
                // }

                _genAddressSeed (seed) {
                    let newSeed = new Sha512().process(seed).finish().result;
                    newSeed = new Sha512().process(utils.appendBuffer(newSeed, seed)).finish().result;
                    return newSeed
                }

                genAddress (nonce) {
                    // Check if nonce index is available in array
                    if (nonce >= this._addresses.length) {
                        this._addresses.length = nonce + 1;
                    }
                    // Don't regenerate the address if it's already generated
                    if (this.addressExists(nonce)) {
                        return this.addresses[nonce]
                    }

                    const nonceBytes = utils.int32ToBytes(nonce);

                    let addrSeed = new Uint8Array();
                    // console.log("Initial seed ", addrSeed)
                    addrSeed = utils.appendBuffer(addrSeed, nonceBytes);
                    // console.log("Seed after nonceBytes ", addrSeed)
                    addrSeed = utils.appendBuffer(addrSeed, this._byteSeed);
                    // console.log("Seed after nonce and seed ", addrSeed)
                    addrSeed = utils.appendBuffer(addrSeed, nonceBytes);
                    // console.log("Appended seed ", addrSeed)
                    // console.log(this._walletVersion)
                    // Questionable advantage to sha256d...sha256(sha256(x) + x) does not increase collisions the way sha256d does. Really nitpicky though. Note that this seed is computed from the original seed (which went through (bcrypt) so it's generation does not need to be computationally expenise
                    if (this._walletVersion == 1) {
                        // addrSeed = new SHA256.digest(SHA256.digest(addrSeed))
                        // addrSeed = Sha256.bytes(Sha256.bytes(addrSeed))
                        addrSeed = new Sha256().process(
                            new Sha256()
                                .process(addrSeed)
                                .finish()
                                .result
                            ).finish().result;
                        // console.log('wallet 1')
                    // } else if (this._walletVersion == 2) {
                    //     addrSeed = new Sha512().process(
                    //         new Sha512()
                    //             .process(addrSeed)
                    //             .finish()
                    //             .result
                    //     ).finish().result//.slice(0, 32)
                    //     console.log('wallet2')
                    } else {
                        // addrSeed = new SHA256.digest(utils.appendBuffer(SHA256.digest(addrSeed), addrSeed))
                        // Why not use sha512?
                        // addrSeed = Sha512.bytes(utils.appendBuffer(Sha512.bytes(addrSeed), addrSeed)).slice(0, 32)
                        // addrSeed = new Sha512().process(utils.stringtoUTF8Array(addrSeed)).finish().result
                        // Sha512.bytes(utils.appendBuffer(Sha512.bytes(addrSeed), addrSeed)).slice(0, 32)
                        addrSeed = this._genAddressSeed(addrSeed).slice(0, 32);
                    }

                    // console.log(addrSeed)
                    const addrKeyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(addrSeed));

                    // const publicKeyHash = new RIPEMD160().digest(Sha256.bytes(addrKeyPair.publicKey));
                    // const publicKeyHash = new RIPEMD160().digest(new Sha256().process(addrKeyPair.publicKey).finish().result)
                    // const publicKeySha256 = new Sha256().process(addrKeyPair.publicKey).finish().result
                    // console.log(publicKeySha256.buffer)
                    // const publicKeyHashHex = new RIPEMD160().update(Buffer.from(publicKeySha256)).digest('hex')
                    // const publicKeyHash = utils.hexToBytes(publicKeyHashHex)

                    // let address = new Uint8Array()

                    // address = utils.appendBuffer(address, [ADDRESS_VERSION])
                    // address = utils.appendBuffer(address, publicKeyHash)

                    // // const checkSum = Sha256.bytes(Sha256.bytes(address))
                    // const checkSum = this._repeatSHA256(address, 2)

                    // address = utils.appendBuffer(address, checkSum.subarray(0, 4))
                    // // Turn it into a string
                    // address = Base58.encode(address)

                    const address = publicKeyToAddress(addrKeyPair.publicKey);
                    const qoraAddress = publicKeyToAddress(addrKeyPair.publicKey, true);

                    this._addresses[nonce] = {
                        address,
                        qoraAddress,
                        keyPair: {
                            publicKey: addrKeyPair.publicKey,
                            privateKey: addrKeyPair.secretKey
                        },
                        base58PublicKey: Base58$1.encode(addrKeyPair.publicKey),
                        seed: addrSeed,
                        nonce: nonce
                    };
                    return this._addresses[nonce]
                }

                // password, kdfThreads, statusUpdateFn
                generateSaveWalletData (...args) {
                    // return generateSaveWalletData(this, ...args)
                    return generateSaveWalletData(this, ...args)
                }
            }

            // password = pin + birthmonth
            const decryptStoredWallet = async (password, wallet, statusFn = () => {}) => {
                statusFn('Decoding saved data');
                const encryptedSeedBytes = Base58$1.decode(wallet.encryptedSeed);
                const iv = Base58$1.decode(wallet.iv);
                const salt = Base58$1.decode(wallet.salt);
                statusFn('Generating decryption key');
                const key = await kdf(password, salt, statusFn);
                const encryptionKey = key.slice(0, 32);
                const macKey = key.slice(32, 63);

                statusFn('Checking key');
                const mac = new HmacSha512(macKey).process(encryptedSeedBytes).finish().result;
                if (Base58$1.encode(mac) !== wallet.mac) {
                    // throw new Error('Incorrect password')
                    throw new Error('Incorrect password')
                }
                statusFn('Decrypting');
                const decryptedBytes = AES_CBC.decrypt(encryptedSeedBytes, encryptionKey, false, iv);
                return decryptedBytes
            };

            const createWallet = exports('c', async (sourceType, source, statusUpdateFn) => {
                let version, seed;
                // console.log(sourceType)
                switch (sourceType) {
                    case 'phrase':
                        version = 2;
                        seed = await kdf(source, void 0, statusUpdateFn);
                        break
                    case 'seed':
                        // console.log(source)
                        version = 1;
                        seed = Base58$1.decode(source);
                        break
                    // case 'v1seed':
                    //     version = 1
                    //     seed = Base58.decode(source)
                    //     break
                    case 'storedWallet':
                    case 'backedUpSeed':
                        seed = await decryptStoredWallet(source.password, source.wallet, statusUpdateFn);
                        break
                    default:
                        throw 'sourceType ' + sourceType + ' not recognized'
                }
                // console.log('making wallet')
                const wallet = new PhraseWallet(seed, version);
                // console.log('returning wallet')
                return wallet
            });

            window.Base58 = Base58$1;

            let config = false;
            const configWatchers = [];
            const waitingForConfig = [];

            const subscribeToStore = () => {
                if (!store) return setTimeout(() => subscribeToStore(), 50) // 0.05s

                store.subscribe(() => {
                    const c = store.getState().config;
                    if (!c.loaded) return
                    waitingForConfig.forEach(r => r(c));
                    configWatchers.forEach(fn => fn(c));
                    config = c;
                });
            };

            subscribeToStore();

            function watchConfig(fn) {
                // config ? fn(config) : void 0
                fn(config);
                configWatchers.push(fn);
            }

            function waitForConfig () {
                return new Promise((resolve, reject) => {
                    if (config) return resolve(config)
                    waitingForConfig.push(resolve);
                })
            }

            let config$1 = {};
            watchConfig(c => { config$1 = c; });

            async function request(url, options){
                options = options || {};
                const body = options.body;
                const method = options.method || 'GET';

                await waitForConfig();
                
                const n = config$1.user.knownNodes[config$1.user.node];
                const node = n.protocol + '://' + n.domain + ':' + n.port;
                return fetch(node + url, {
                    method,
                    body // If it's undefined that's fine right?
                }).then(async response => {
                    try {
                        const json = await response.clone().json();
                        return json
                    } catch (e) {
                        return await response.text()
                    }
                })
            }

            // import { html } from 'lit-element'

            class TransactionBase {
                static get utils () {
                    return utils
                }
                static get nacl () {
                    return nacl
                }
                static get Base58 () {
                    return Base58$1
                }

                constructor () {
                    // Defaults
                    this.fee = 0;
                    this.groupID = 0;
                    this.timestamp = Date.now();
                    this.tests = [
                        () => {
                            if (!(this._type >= 1 && this._type in TX_TYPES)) {
                                return 'Invalid type: ' + this.type
                            }
                            return true
                        },
                        () => {
                            if (this._fee < 0) {
                                return 'Invalid fee: ' + this._fee / QORT_DECIMALS
                            }
                            return true
                        },
                        () => {
                            if (this._groupID < 0 || !Number.isInteger(this._groupID)) {
                                return 'Invalid groupID: ' + this._groupID
                            }
                            return true
                        },
                        () => {
                            if (!(new Date(this._timestamp)).getTime() > 0) {
                                return 'Invalid timestamp: ' + this._timestamp
                            }
                            return true
                        },
                        () => {
                            if (!(this._lastReference instanceof Uint8Array && this._lastReference.byteLength == 64)) {
                                // console.log(this._lastReference)
                                return 'Invalid last reference: ' + this._lastReference
                            }
                            return true
                        },
                        () => {
                            if (!(this._keyPair)) {
                                return 'keyPair must be specified'
                            }
                            if (!(this._keyPair.publicKey instanceof Uint8Array && this._keyPair.publicKey.byteLength === 32)) {
                                return 'Invalid publicKey'
                            }
                            if (!(this._keyPair.privateKey instanceof Uint8Array && this._keyPair.privateKey.byteLength === 64)) {
                                return 'Invalid privateKey'
                            }
                            return true
                        }
                    ];
                }

                set keyPair (keyPair) {
                    this._keyPair = keyPair;
                }
                set type (type) {
                    this.typeText = TX_TYPES[type];
                    // this._type = TX_TYPES[type];
                    this._type = type;
                    this._typeBytes = this.constructor.utils.int32ToBytes(this._type);
                }
                set groupID (groupID) {
                    this._groupID = groupID;
                    this._groupIDBytes = this.constructor.utils.int32ToBytes(this._groupID);
                }
                set timestamp (timestamp) {
                    this._timestamp = timestamp;
                    this._timestampBytes = this.constructor.utils.int64ToBytes(this._timestamp);
                }
                set fee (fee) {
                    this._fee = fee * QORT_DECIMALS;
                    this._feeBytes = this.constructor.utils.int64ToBytes(this._fee);
                }
                set lastReference (lastReference) { // Always Base58 encoded. Accepts Uint8Array or Base58 string.
                    // lastReference could be a string or an Uint8Array
                    this._lastReference = lastReference instanceof Uint8Array ? lastReference : this.constructor.Base58.decode(lastReference);
                }
                get params () {
                    return [
                        this._typeBytes,
                        this._timestampBytes,
                        this._groupIDBytes,
                        this._lastReference,
                        this._keyPair.publicKey
                    ]
                }
                get signedBytes () {
                    if (!this._signedBytes) {
                        this.sign();
                        // console.log('Got past signing...')
                    }
                    return this._signedBytes
                }

                // render function but NOT lit element
                render (html) {
                    return html`Please implement a render method (html\`...\`) in order to display requested transaction info`
                }

                validParams () {
                    let finalResult = {
                        valid: true
                    };
                    // const valid =
                    this.tests.some(test => {
                        const result = test();
                        if (result !== true) {
                            finalResult = {
                                valid: false,
                                message: result
                            };
                            return true // exists the loop
                        }
                    });
                    return finalResult
                }

                generateBase () {
                    const isValid = this.validParams();
                    if (!isValid.valid) {
                        // console.log(isValid)
                        // console.log(isValid.message)
                        throw new Error(isValid.message)
                    }
                    let result = new Uint8Array();

                    this.params.forEach(item => {
                        result = this.constructor.utils.appendBuffer(result, item);
                    });

                    this._base = result;
                    return result
                }

                sign () {
                    // Can't sign if keypair was not specified
                    if (!this._keyPair) {
                        throw new Error('keyPair not defined')
                    }
                    // console.log(this._keyPair)
                    if (!this._base) {
                        // console.log('Generating base...')
                        this.generateBase();
                    }
                    this._signature = this.constructor.nacl.sign.detached(this._base, this._keyPair.privateKey);

                    this._signedBytes = this.constructor.utils.appendBuffer(this._base, this._signature);

                    return this._signature
                }
            }

            class PaymentTransaction extends TransactionBase {
                constructor () {
                    super();
                    this.type = 2;
                    this.tests.push(
                        () => {
                            if (!(this._amount >= 0)) {
                                return 'Invalid amount ' + this._amount / store.getState().config.coin.decimals
                            }
                            return true
                        },
                        () => {
                            if (!(this._recipient instanceof Uint8Array && this._recipient.length == 25)) {
                                return 'Invalid recipient ' + Base58$1.encode(this._recipient)
                            }
                            return true
                        }
                    );
                }

                set recipient (recipient) { // Always Base58 encoded. Accepts Uint8Array or Base58 string.
                    this._recipient = recipient instanceof Uint8Array ? recipient : this.constructor.Base58.decode(recipient);
                }
                set amount (amount) {
                    // console.log('=====AOUMNTNT ',amount, store.getState().config.coin.decimals)
                    this._amount = amount * store.getState().config.coin.decimals;
                    this._amountBytes = this.constructor.utils.int64ToBytes(amount);
                }
                get params () {
                    const params = super.params;
                    params.push(
                        this._recipient,
                        this._amountBytes,
                        this._feeBytes
                    );
                    return params
                }

                render(html) {
                    const conf = store.getState().config;
                    // console.log(conf.coin)
                    // console.log(this)
                    return html`
            <table>
                <tr>
                    <th>To</th>
                    <td>${Base58$1.encode(this._recipient)}</td>
                </tr>
                <tr>
                    <th>Amount</th>
                    <td>${this._amount / conf.coin.decimals} ${conf.coin.symbol}</td>
                </tr>
            </table>
        `
                }
            }
            //
            // import txTypes from "./txTypes.js"
            // import nacl from "./deps/nacl-fast.js"
            // import Utils from "./Utils.js"
            //
            // function generateSignaturePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp) => {
            //    const data = generatePaymentTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp);
            //    return nacl.sign.detached(data, keyPair.privateKey);
            // }
            //
            // function generatePaymentTransaction(keyPair, lastReference, recipient, amount, fee, timestamp, signature) => {
            //    return Utils.appendBuffer(generatePaymentTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp),signature);
            // }
            //
            // function generatePaymentTransactionBase(publicKey, lastReference, recipient, amount, fee, timestamp) => {
            //    const txType = txTypes.PAYMENT_TRANSACTION;
            //    const typeBytes = Utils.int32ToBytes(txType);
            //    const timestampBytes = Utils.int64ToBytes(timestamp);
            //    const amountBytes = Utils.int64ToBytes(amount * 100000000);
            //    const feeBytes = Utils.int64ToBytes(fee * 100000000);
            //
            //    let data = new Uint8Array();
            //
            //    data = Utils.appendBuffer(data, typeBytes);
            //    data = Utils.appendBuffer(data, timestampBytes);
            //    data = Utils.appendBuffer(data, lastReference);
            //    data = Utils.appendBuffer(data, publicKey);
            //    data = Utils.appendBuffer(data, recipient);
            //    data = Utils.appendBuffer(data, amountBytes);
            //    data = Utils.appendBuffer(data, feeBytes);
            //
            //    return data;
            // }

            /* ====================================
            EXTEND THE PAYMENT TRANSACTION YOU CLOWN
            ====================================== */ 

            class MessageTransaction extends PaymentTransaction{
                constructor(){
                    super();
                    this.type = 17;
                    this._key = this.constructor.utils.int64ToBytes(0);
                    this._isEncrypted = new Uint8Array(1); // Defaults to false
                    this._isText = new Uint8Array(1); // Defaults to false
                }
                
                set message(message /* UTF8 String */){
                    // ...yes? no?
                    this.messageText = message;
                    
                    // Not sure about encoding here...
                    //this._message = message instanceof Uint8Array ? message : this.constructor.Base58.decode(message);
                    this._message = this.constructor.utils.stringtoUTF8Array(message);
                    this._messageLength = this.constructor.utils.int64ToBytes(this._message.length);
                }
                set isEncrypted(isEncrypted){
                    this._isEncrypted[0] = isEncrypted;
                }
                set isText(isText){
                    this._isText[0] = isText;
                }
                get _params(){
                    // dont extend super because paymentTrasaction is different
                    //const params = super.params;
                    return [
                        this._typeBytes,
                        this._timestampBytes,
                        this._lastReference,
                        this._keyPair.publicKey,
                        this._recipient,
                        this._key,
                        this._amountBytes,
                        this._messageLength,
                        this._message,
                        this._isEncrypted,
                        this._isText,
                        this._feeBytes
                    ]
                }
            }

            //"use strict";
            //function generateSignatureMessageTransaction(keyPair, lastReference, recipient, amount, fee, timestamp, message, isText, isEncrypted) => {
            //    const data = generateMessageTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp, message, isText, isEncrypted);
            //    return nacl.sign.detached(data, keyPair.privateKey);
            //}
            //
            //function generateMessageTransaction(keyPair, lastReference, recipient, amount, fee, timestamp, message, isText, isEncrypted, signature) => {
            //    return appendBuffer(generateMessageTransactionBase(keyPair.publicKey, lastReference, recipient, amount, fee, timestamp, message, isText, isEncrypted),
            //                        signature);
            //}
            //function generateMessageTransactionBase(publicKey, lastReference, recipient, amount, fee, timestamp, message, isText, isEncrypted) => {
            //    txType = TYPES.MESSAGE_TRANSACTION;
            //
            //    const typeBytes = int32ToBytes(txType);
            //    const timestampBytes = int64ToBytes(timestamp);
            //    const amountBytes = int64ToBytes(amount * 100000000);
            //    const feeBytes = int64ToBytes(fee * 100000000);
            //    const messageLength = int32ToBytes(message.length);
            //    const key = int64ToBytes(0);
            //
            //    isTextB = new Uint8Array(1);
            //    isTextB[0] = isText;
            //
            //    isEncryptedB = new Uint8Array(1);
            //    isEncryptedB[0] = isEncrypted;
            //
            //    let data = new Uint8Array();
            //
            //    data = appendBuffer(data, typeBytes);
            //    data = appendBuffer(data, timestampBytes);
            //    data = appendBuffer(data, lastReference);
            //    data = appendBuffer(data, publicKey);
            //    data = appendBuffer(data, recipient);
            //    data = appendBuffer(data, key);
            //    data = appendBuffer(data, amountBytes);
            //    data = appendBuffer(data, messageLength);
            //    data = appendBuffer(data, message);
            //    data = appendBuffer(data, isEncryptedB);
            //    data = appendBuffer(data, isTextB);
            //    data = appendBuffer(data, feeBytes);
            //
            //    return data;
            //}

            // tx_hex="${tx_type}${timestamp_hex}${reference_hex}${registrant_pubkey_hex}${owner_hex}${name_size}${name_hex}${value_size}${value_hex}${fee_hex}"

            class RegisterNameTransaction extends TransactionBase {
                constructor() {
                    super();
                    this.type = 3;
                    this.fee = 0;
                    this.tests.push(
                        () => {
                            if (!(this._registrantPublicKey instanceof Uint8Array && this._registrantPublicKey.length == 32)) {
                                return "Invalid registrant " + Base58.encode(this._registrantPublicKey)
                            }
                            return true
                        }
                    );
                }

                // set recipient(recipient) {// Always Base58 encoded. Accepts Uint8Array or Base58 string.
                //     this._recipient = recipient instanceof Uint8Array ? recipient : this.constructor.Base58.decode(recipient);
                // }
                
                // Registrant publickey
                set registrantPublicKey (registrantPublicKey) {
                    this._registrantPublicKey = registrantPublicKey instanceof Uint8Array ? registrantPublicKey : this.constructor.Base58.decode(registrantPublicKey);
                }

                set registrantAddress(registrantAddress) {// Always Base58 encoded. Accepts Uint8Array or Base58 string.
                    this._registrantAddress = registrantAddress instanceof Uint8Array ? registrantAddress : this.constructor.Base58.decode(registrantAddress);
                }

                set name(name /* UTF8 String */) {
                    // ...yes? no?
                    this.nameText = name;

                    // Not sure about encoding here...
                    //this._message = message instanceof Uint8Array ? message : this.constructor.Base58.decode(message);
                    this._nameBytes = this.constructor.utils.stringtoUTF8Array(name);
                    this._nameLength = this.constructor.utils.int32ToBytes(this._nameBytes.length);
                }

                set value (value) {
                    this.valueText = value;

                    // Not sure about encoding here...
                    //this._message = message instanceof Uint8Array ? message : this.constructor.Base58.decode(message);
                    this._valueBytes = this.constructor.utils.stringtoUTF8Array(value);
                    this._valueLength = this.constructor.utils.int32ToBytes(this._valueBytes.length);
                }

                // set amount(amount) {
                //     this._amount = amount * QORT_DECIMALS;
                //     this._amountBytes = this.constructor.utils.int64ToBytes(amount);
                // }
                
                get params() {
                    const params = super.params;
                    params.push(
                        // this._registrantPublicKey,
                        this._registrantAddress,
                        this._nameLength,
                        this._nameBytes,
                        this._valueLength,
                        this._valueBytes,
                        this._feeBytes
                    );
                    return params;
                }
            }

            // import { QORT_DECIMALS } from "../constants.js" // Not needed, no amount

            class DelegationTransaction extends TransactionBase {
                constructor () {
                    super();
                    this.type = 18;
                    this.tests.push(
                        () => {
                            if (!(this._superNodeAddress instanceof Uint8Array && this._superNodeAddress.length == 25)) {
                                return 'Invalid recipient ' + Base58.encode(this._superNodeAddress)
                            }
                            return true
                        }
                    );
                }

                set superNodeAddress (superNodeAddress) { // Always Base58 encoded. Accepts Uint8Array or Base58 string.
                    this._superNodeAddress = superNodeAddress instanceof Uint8Array ? superNodeAddress : this.constructor.Base58.decode(superNodeAddress);
                }

                get params () {
                    const params = super.params;
                    params.push(
                        this._superNodeAddress,
                        this._feeBytes
                    );
                    return params
                }
            }

            /*
             * ed2curve: convert Ed25519 signing key pair into Curve25519
             * key pair suitable for Diffie-Hellman key exchange.
             *
             * Written by Dmitry Chestnykh in 2014. Public domain.
             */

            // (function(root, f) {
            //   'use strict';
            //   if (typeof module !== 'undefined' && module.exports) module.exports = f(require('tweetnacl'));
            //   else root.ed2curve = f(root.nacl);
            // }(this, function(nacl) {
            //   'use strict';
            //   if (!nacl) throw new Error('tweetnacl not loaded');

              // -- Operations copied from TweetNaCl.js. --

              var gf$1 = function(init) {
                var i, r = new Float64Array(16);
                if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
                return r;
              };

              var gf0$1 = gf$1(),
                  gf1$1 = gf$1([1]),
                  D$1 = gf$1([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
                  I$1 = gf$1([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

              function car25519$1(o) {
                var c;
                var i;
                for (i = 0; i < 16; i++) {
                  o[i] += 65536;
                  c = Math.floor(o[i] / 65536);
                  o[(i+1)*(i<15?1:0)] += c - 1 + 37 * (c-1) * (i===15?1:0);
                  o[i] -= (c * 65536);
                }
              }

              function sel25519$1(p, q, b) {
                var t, c = ~(b-1);
                for (var i = 0; i < 16; i++) {
                  t = c & (p[i] ^ q[i]);
                  p[i] ^= t;
                  q[i] ^= t;
                }
              }

              function unpack25519$1(o, n) {
                var i;
                for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
                o[15] &= 0x7fff;
              }

              // addition
              function A$1(o, a, b) {
                var i;
                for (i = 0; i < 16; i++) o[i] = (a[i] + b[i])|0;
              }

              // subtraction
              function Z$1(o, a, b) {
                var i;
                for (i = 0; i < 16; i++) o[i] = (a[i] - b[i])|0;
              }

              // multiplication
              function M$1(o, a, b) {
                var i, j, t = new Float64Array(31);
                for (i = 0; i < 31; i++) t[i] = 0;
                for (i = 0; i < 16; i++) {
                  for (j = 0; j < 16; j++) {
                    t[i+j] += a[i] * b[j];
                  }
                }
                for (i = 0; i < 15; i++) {
                  t[i] += 38 * t[i+16];
                }
                for (i = 0; i < 16; i++) o[i] = t[i];
                car25519$1(o);
                car25519$1(o);
              }

              // squaring
              function S$1(o, a) {
                M$1(o, a, a);
              }

              // inversion
              function inv25519$1(o, i) {
                var c = gf$1();
                var a;
                for (a = 0; a < 16; a++) c[a] = i[a];
                for (a = 253; a >= 0; a--) {
                  S$1(c, c);
                  if(a !== 2 && a !== 4) M$1(c, c, i);
                }
                for (a = 0; a < 16; a++) o[a] = c[a];
              }

              function pack25519$1(o, n) {
                var i, j, b;
                var m = gf$1(), t = gf$1();
                for (i = 0; i < 16; i++) t[i] = n[i];
                car25519$1(t);
                car25519$1(t);
                car25519$1(t);
                for (j = 0; j < 2; j++) {
                  m[0] = t[0] - 0xffed;
                  for (i = 1; i < 15; i++) {
                    m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
                    m[i-1] &= 0xffff;
                  }
                  m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
                  b = (m[15]>>16) & 1;
                  m[14] &= 0xffff;
                  sel25519$1(t, m, 1-b);
                }
                for (i = 0; i < 16; i++) {
                  o[2*i] = t[i] & 0xff;
                  o[2*i+1] = t[i] >> 8;
                }
              }

              function par25519$1(a) {
                var d = new Uint8Array(32);
                pack25519$1(d, a);
                return d[0] & 1;
              }

              function vn$1(x, xi, y, yi, n) {
                var i, d = 0;
                for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
                return (1 & ((d - 1) >>> 8)) - 1;
              }

              function crypto_verify_32$1(x, xi, y, yi) {
                return vn$1(x, xi, y, yi, 32);
              }

              function neq25519$1(a, b) {
                var c = new Uint8Array(32), d = new Uint8Array(32);
                pack25519$1(c, a);
                pack25519$1(d, b);
                return crypto_verify_32$1(c, 0, d, 0);
              }

              function pow2523$1(o, i) {
                var c = gf$1();
                var a;
                for (a = 0; a < 16; a++) c[a] = i[a];
                for (a = 250; a >= 0; a--) {
                  S$1(c, c);
                  if (a !== 1) M$1(c, c, i);
                }
                for (a = 0; a < 16; a++) o[a] = c[a];
              }

              function set25519$1(r, a) {
                var i;
                for (i = 0; i < 16; i++) r[i] = a[i] | 0;
              }

              function unpackneg$1(r, p) {
                var t = gf$1(), chk = gf$1(), num = gf$1(),
                  den = gf$1(), den2 = gf$1(), den4 = gf$1(),
                  den6 = gf$1();

                set25519$1(r[2], gf1$1);
                unpack25519$1(r[1], p);
                S$1(num, r[1]);
                M$1(den, num, D$1);
                Z$1(num, num, r[2]);
                A$1(den, r[2], den);

                S$1(den2, den);
                S$1(den4, den2);
                M$1(den6, den4, den2);
                M$1(t, den6, num);
                M$1(t, t, den);

                pow2523$1(t, t);
                M$1(t, t, num);
                M$1(t, t, den);
                M$1(t, t, den);
                M$1(r[0], t, den);

                S$1(chk, r[0]);
                M$1(chk, chk, den);
                if (neq25519$1(chk, num)) M$1(r[0], r[0], I$1);

                S$1(chk, r[0]);
                M$1(chk, chk, den);
                if (neq25519$1(chk, num)) return -1;

                if (par25519$1(r[0]) === (p[31] >> 7)) Z$1(r[0], gf0$1, r[0]);

                M$1(r[3], r[0], r[1]);
                return 0;
              }

              // ----

              // Converts Ed25519 public key to Curve25519 public key.
              // montgomeryX = (edwardsY + 1)*inverse(1 - edwardsY) mod p
              function convertPublicKey(pk) {
                var z = new Uint8Array(32),
                  q = [gf$1(), gf$1(), gf$1(), gf$1()],
                  a = gf$1(), b = gf$1();

                if (unpackneg$1(q, pk)) return null; // reject invalid key

                var y = q[1];

                A$1(a, gf1$1, y);
                Z$1(b, gf1$1, y);
                inv25519$1(b, b);
                M$1(a, a, b);

                pack25519$1(z, a);
                return z;
              }

              // Converts Ed25519 secret key to Curve25519 secret key.
              function convertSecretKey(sk) {
                var d = new Uint8Array(64), o = new Uint8Array(32), i;
                nacl.lowlevel.crypto_hash(d, sk, 32);
                d[0] &= 248;
                d[31] &= 127;
                d[31] |= 64;
                for (i = 0; i < 32; i++) o[i] = d[i];
                for (i = 0; i < 64; i++) d[i] = 0;
                return o;
              }

              function convertKeyPair(edKeyPair) {
                var publicKey = convertPublicKey(edKeyPair.publicKey);
                if (!publicKey) return null;
                return {
                  publicKey: publicKey,
                  secretKey: convertSecretKey(edKeyPair.secretKey)
                };
              }

            //   return {
            //     convertPublicKey: convertPublicKey,
            //     convertSecretKey: convertSecretKey,
            //     convertKeyPair: convertKeyPair,
            //   };

            var ed2curve = {
                convertPublicKey: convertPublicKey,
                convertSecretKey: convertSecretKey,
                convertKeyPair: convertKeyPair,
            };

            // }));

            // layout.add("txType: " + TransactionType.REWARD_SHARE.valueString, TransformationType.INT);

            class RewardShareTransaction extends TransactionBase {
                constructor() {
                    super();
                    this.type = 38;
                    // this.fee = 1
                    // this.tests.push(
                    //     () => {
                    //         if (!(this._registrantPublicKey instanceof Uint8Array && this._registrantPublicKey.length == 32)) {
                    //             return "Invalid registrant " + Base58.encode(this._registrantPublicKey)
                    //         }
                    //         return true
                    //     }
                    // )
                }

                render (html) {
                    return html`
            Would you like to create a reward share transaction, sharing <strong>${this._percentageShare}%</strong> of your minting rewards with <strong>${this.constructor.Base58.encode(this._recipient)}</strong>? 
            If yes, you will need to save the key below in order to mint. It can be supplied to any node in order to allow it to mint on your behalf.
            <div style="background:#eee; padding:8px; margin:8px 0; border-radius:2px;">
                <span>${this._base58RewardShareSeed}</span>
            </div>
            On pressing confirm, the rewardshare will be created, but you will still need to supply the above key to a node in order to mint with the account.
        `
                }

                set recipientPublicKey (recipientPublicKey) {
                    this._base58RecipientPublicKey = recipientPublicKey instanceof Uint8Array ? this.constructor.Base58.encode(recipientPublicKey) : recipientPublicKey;
                    this._recipientPublicKey = this.constructor.Base58.decode(this._base58RecipientPublicKey);
                    // console.log(this._recipientPublicKey)
                    // console.log(publicKeyToAddress)
                    this.recipient = publicKeyToAddress(this._recipientPublicKey);
                    // this._rewardSharePublicKey = this.rewardShareKey
                    // console.log(recipientPublicKey, this._keyPair)
                    this.fee = (recipientPublicKey === this.constructor.Base58.encode(this._keyPair.publicKey) ? 0 : 0.001);

                    // Reward share pub key
                    const convertedKeypair = ed2curve.convertKeyPair({
                        publicKey: this._keyPair.publicKey,
                        secretKey: this._keyPair.privateKey
                    });
                    // console.log(convertedKeypair)
                    const sharedSecret = nacl.box.before(this._recipientPublicKey, convertedKeypair.secretKey);
                    this._rewardShareSeed = new Sha256().process(sharedSecret).finish().result;
                    this._base58RewardShareSeed = this.constructor.Base58.encode(this._rewardShareSeed);

                    this._rewardShareKeyPair = nacl.sign.keyPair.fromSeed(this._rewardShareSeed);
                    // console.log(this._rewardShareKeyPair)
                }

                set recipient(recipient) { // Always Base58 encoded. Accepts Uint8Array or Base58 string.
                    this._recipient = recipient instanceof Uint8Array ? recipient : this.constructor.Base58.decode(recipient);
                }

                set percentageShare (share) {
                    this._percentageShare = share * 1e8;
                    this._percentageShareBytes = this.constructor.utils.int64ToBytes(this._percentageShare);
                }

                get params() {
                    const params = super.params;
                    // console.log(this)
                    // console.log(this._rewardShareKeyPair)
                    params.push(
                        this._recipient,
                        this._rewardShareKeyPair.publicKey,
                        this._percentageShareBytes,
                        this._feeBytes
                    );
                    return params;
                }
            }

            const transactionTypes = {
                2: PaymentTransaction,
                3: RegisterNameTransaction,
                17: MessageTransaction,
                18: DelegationTransaction,
                38: RewardShareTransaction
            };

            // window.Base58 = Base58

            const createTransaction = exports('j', (type, keyPair, params) => {
                const tx = new transactionTypes[type]();
                tx.keyPair = keyPair;
                Object.keys(params).forEach(param => {
                    // console.log('Doing ' + param + 'with data ' + params[param])
                    tx[param] = params[param];
                });
                // console.log('Got to signing part...')
                // const response = tx.signedBytes
                // console.log(response)
                // return response
                return tx
            });

            const processTransaction = exports('p', bytes => request('/transactions/process', {
                method: 'POST',
                body: Base58$1.encode(bytes)
            }));

            window.Base58 = Base58$1;

            var api = /*#__PURE__*/Object.freeze({
                __proto__: null,
                initApi: initApi,
                get store () { return store; },
                createWallet: createWallet,
                Base58: Base58$1,
                utils: utils,
                request: request,
                transactions: transactionTypes,
                processTransaction: processTransaction,
                createTransaction: createTransaction,
                registerUsername: registerUsername
            });
            exports('h', api);

            /**
            @license
            Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */

            // Give the user the choice to opt out of font loading.
            if (!window.polymerSkipLoadingFontRoboto) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = 'text/css';
              link.crossOrigin = 'anonymous';
              link.href =
                  'https://fonts.googleapis.com/css?family=Roboto+Mono:400,700|Roboto:400,300,300italic,400italic,500,500italic,700,700italic';
              document.head.appendChild(link);
            }

            /**
            @license
            Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */
            const template = html`<custom-style>
  <style is="custom-style">
    html {

      /* Shared Styles */
      --paper-font-common-base: {
        font-family: 'Roboto', 'Noto', sans-serif;
        -webkit-font-smoothing: antialiased;
      };

      --paper-font-common-code: {
        font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
        -webkit-font-smoothing: antialiased;
      };

      --paper-font-common-expensive-kerning: {
        text-rendering: optimizeLegibility;
      };

      --paper-font-common-nowrap: {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      };

      /* Material Font Styles */

      --paper-font-display4: {
        @apply --paper-font-common-base;
        @apply --paper-font-common-nowrap;

        font-size: 112px;
        font-weight: 300;
        letter-spacing: -.044em;
        line-height: 120px;
      };

      --paper-font-display3: {
        @apply --paper-font-common-base;
        @apply --paper-font-common-nowrap;

        font-size: 56px;
        font-weight: 400;
        letter-spacing: -.026em;
        line-height: 60px;
      };

      --paper-font-display2: {
        @apply --paper-font-common-base;

        font-size: 45px;
        font-weight: 400;
        letter-spacing: -.018em;
        line-height: 48px;
      };

      --paper-font-display1: {
        @apply --paper-font-common-base;

        font-size: 34px;
        font-weight: 400;
        letter-spacing: -.01em;
        line-height: 40px;
      };

      --paper-font-headline: {
        @apply --paper-font-common-base;

        font-size: 24px;
        font-weight: 400;
        letter-spacing: -.012em;
        line-height: 32px;
      };

      --paper-font-title: {
        @apply --paper-font-common-base;
        @apply --paper-font-common-nowrap;

        font-size: 20px;
        font-weight: 500;
        line-height: 28px;
      };

      --paper-font-subhead: {
        @apply --paper-font-common-base;

        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
      };

      --paper-font-body2: {
        @apply --paper-font-common-base;

        font-size: 14px;
        font-weight: 500;
        line-height: 24px;
      };

      --paper-font-body1: {
        @apply --paper-font-common-base;

        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
      };

      --paper-font-caption: {
        @apply --paper-font-common-base;
        @apply --paper-font-common-nowrap;

        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.011em;
        line-height: 20px;
      };

      --paper-font-menu: {
        @apply --paper-font-common-base;
        @apply --paper-font-common-nowrap;

        font-size: 13px;
        font-weight: 500;
        line-height: 24px;
      };

      --paper-font-button: {
        @apply --paper-font-common-base;
        @apply --paper-font-common-nowrap;

        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.018em;
        line-height: 24px;
        text-transform: uppercase;
      };

      --paper-font-code2: {
        @apply --paper-font-common-code;

        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
      };

      --paper-font-code1: {
        @apply --paper-font-common-code;

        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
      };

    }

  </style>
</custom-style>`;
            template.setAttribute('style', 'display: none;');
            document.head.appendChild(template.content);

        }
    };
});
//# sourceMappingURL=typography-5bee746d.js.map
