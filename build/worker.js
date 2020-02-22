(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('crypto')) :
    typeof define === 'function' && define.amd ? define(['crypto'], factory) :
    (global = global || self, factory(global.crypto));
}(this, (function (crypto) { 'use strict';

    crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;

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
    }

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

    // Proxy target source will be another instance of epml. The source instance will be the proxy. The extra parameter will be the target for that proxy

    // Stores source.proxy => new Map([[source.target, new ProxyTarget(source)]])
    const proxySources = new TwoWayMap();

    const sourceTargetMap = new Map();

    /**
     * Can only take ONE iframe or popup as source
     */
    class WorkerTarget extends Target {
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
            if (sourceTargetMap.has(source)) return sourceTargetMap.get(source)

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
            const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
            tmp.set(buffer1, 0);
            tmp.set(buffer2, buffer1.byteLength);
            return tmp
        },

        int64ToBytes (int64) {
            // we want to represent the input as a 8-bytes array
            var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

            for (var index = 0; index < byteArray.length; index++) {
                var byte = int64 & 0xff;
                byteArray[byteArray.length - index - 1] = byte;
                int64 = (int64 - byte) / 256;
            }

            return byteArray
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

    const local_btoa = typeof btoa === 'undefined' ? (str) => Buffer.from(str, 'binary').toString('base64') : btoa;
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
    function bytes_to_string(bytes, utf8 = false) {
        var len = bytes.length, chars = new Array(len);
        for (var i = 0, j = 0; i < len; i++) {
            var b = bytes[i];
            if (!utf8 || b < 128) {
                chars[j++] = b;
            }
            else if (b >= 192 && b < 224 && i + 1 < len) {
                chars[j++] = ((b & 0x1f) << 6) | (bytes[++i] & 0x3f);
            }
            else if (b >= 224 && b < 240 && i + 2 < len) {
                chars[j++] = ((b & 0xf) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f);
            }
            else if (b >= 240 && b < 248 && i + 3 < len) {
                var c = ((b & 7) << 18) | ((bytes[++i] & 0x3f) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f);
                if (c <= 0xffff) {
                    chars[j++] = c;
                }
                else {
                    c ^= 0x10000;
                    chars[j++] = 0xd800 | (c >> 10);
                    chars[j++] = 0xdc00 | (c & 0x3ff);
                }
            }
            else {
                throw new Error('Malformed UTF8 character at byte offset ' + i);
            }
        }
        var str = '', bs = 16384;
        for (var i = 0; i < j; i += bs) {
            str += String.fromCharCode.apply(String, chars.slice(i, i + bs <= j ? i + bs : j));
        }
        return str;
    }
    function bytes_to_base64(arr) {
        return local_btoa(bytes_to_string(arr));
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var bcrypt = createCommonjsModule(function (module) {
    /*
     Copyright (c) 2012 Nevins Bartolomeo <nevins.bartolomeo@gmail.com>
     Copyright (c) 2012 Shane Girish <shaneGirish@gmail.com>
     Copyright (c) 2014 Daniel Wirtz <dcode@dcode.io>

     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions
     are met:
     1. Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.
     2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in the
     documentation and/or other materials provided with the distribution.
     3. The name of the author may not be used to endorse or promote products
     derived from this software without specific prior written permission.

     THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
     IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
     OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
     IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
     NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
     THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    /**
     * @license bcrypt.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/bcrypt.js for details
     */
    (function(global, factory) {

        /* AMD */ if (typeof commonjsRequire === 'function' && 'object' === "object" && module && module["exports"])
            module["exports"] = factory();
        /* Global */ else
            (global["dcodeIO"] = global["dcodeIO"] || {})["bcrypt"] = factory();

    }(commonjsGlobal, function() {

        /**
         * bcrypt namespace.
         * @type {Object.<string,*>}
         */
        var bcrypt = {};

        /**
         * The random implementation to use as a fallback.
         * @type {?function(number):!Array.<number>}
         * @inner
         */
        var randomFallback = null;

        /**
         * Generates cryptographically secure random bytes.
         * @function
         * @param {number} len Bytes length
         * @returns {!Array.<number>} Random bytes
         * @throws {Error} If no random implementation is available
         * @inner
         */
        function random(len) {
            /* node */ if ( module && module['exports'])
                try {
                    return crypto['randomBytes'](len);
                } catch (e) {}
            /* WCA */ try {
                var a; (self['crypto']||self['msCrypto'])['getRandomValues'](a = new Uint32Array(len));
                return Array.prototype.slice.call(a);
            } catch (e) {}
            /* fallback */ if (!randomFallback)
                throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
            return randomFallback(len);
        }

        // Test if any secure randomness source is available
        var randomAvailable = false;
        try {
            random(1);
            randomAvailable = true;
        } catch (e) {}

        // Default fallback, if any
        randomFallback = null;
        /**
         * Sets the pseudo random number generator to use as a fallback if neither node's `crypto` module nor the Web Crypto
         *  API is available. Please note: It is highly important that the PRNG used is cryptographically secure and that it
         *  is seeded properly!
         * @param {?function(number):!Array.<number>} random Function taking the number of bytes to generate as its
         *  sole argument, returning the corresponding array of cryptographically secure random byte values.
         * @see http://nodejs.org/api/crypto.html
         * @see http://www.w3.org/TR/WebCryptoAPI/
         */
        bcrypt.setRandomFallback = function(random) {
            randomFallback = random;
        };

        /**
         * Synchronously generates a salt.
         * @param {number=} rounds Number of rounds to use, defaults to 10 if omitted
         * @param {number=} seed_length Not supported.
         * @returns {string} Resulting salt
         * @throws {Error} If a random fallback is required but not set
         * @expose
         */
        bcrypt.genSaltSync = function(rounds, seed_length) {
            rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
            if (typeof rounds !== 'number')
                throw Error("Illegal arguments: "+(typeof rounds)+", "+(typeof seed_length));
            if (rounds < 4)
                rounds = 4;
            else if (rounds > 31)
                rounds = 31;
            var salt = [];
            salt.push("$2a$");
            if (rounds < 10)
                salt.push("0");
            salt.push(rounds.toString());
            salt.push('$');
            salt.push(base64_encode(random(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN)); // May throw
            return salt.join('');
        };

        /**
         * Asynchronously generates a salt.
         * @param {(number|function(Error, string=))=} rounds Number of rounds to use, defaults to 10 if omitted
         * @param {(number|function(Error, string=))=} seed_length Not supported.
         * @param {function(Error, string=)=} callback Callback receiving the error, if any, and the resulting salt
         * @returns {!Promise} If `callback` has been omitted
         * @throws {Error} If `callback` is present but not a function
         * @expose
         */
        bcrypt.genSalt = function(rounds, seed_length, callback) {
            if (typeof seed_length === 'function')
                callback = seed_length,
                seed_length = undefined; // Not supported.
            if (typeof rounds === 'function')
                callback = rounds,
                rounds = undefined;
            if (typeof rounds === 'undefined')
                rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
            else if (typeof rounds !== 'number')
                throw Error("illegal arguments: "+(typeof rounds));

            function _async(callback) {
                nextTick(function() { // Pretty thin, but salting is fast enough
                    try {
                        callback(null, bcrypt.genSaltSync(rounds));
                    } catch (err) {
                        callback(err);
                    }
                });
            }

            if (callback) {
                if (typeof callback !== 'function')
                    throw Error("Illegal callback: "+typeof(callback));
                _async(callback);
            } else
                return new Promise(function(resolve, reject) {
                    _async(function(err, res) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(res);
                    });
                });
        };

        /**
         * Synchronously generates a hash for the given string.
         * @param {string} s String to hash
         * @param {(number|string)=} salt Salt length to generate or salt to use, default to 10
         * @returns {string} Resulting hash
         * @expose
         */
        bcrypt.hashSync = function(s, salt) {
            if (typeof salt === 'undefined')
                salt = GENSALT_DEFAULT_LOG2_ROUNDS;
            if (typeof salt === 'number')
                salt = bcrypt.genSaltSync(salt);
            if (typeof s !== 'string' || typeof salt !== 'string')
                throw Error("Illegal arguments: "+(typeof s)+', '+(typeof salt));
            return _hash(s, salt);
        };

        /**
         * Asynchronously generates a hash for the given string.
         * @param {string} s String to hash
         * @param {number|string} salt Salt length to generate or salt to use
         * @param {function(Error, string=)=} callback Callback receiving the error, if any, and the resulting hash
         * @param {function(number)=} progressCallback Callback successively called with the percentage of rounds completed
         *  (0.0 - 1.0), maximally once per `MAX_EXECUTION_TIME = 100` ms.
         * @returns {!Promise} If `callback` has been omitted
         * @throws {Error} If `callback` is present but not a function
         * @expose
         */
        bcrypt.hash = function(s, salt, callback, progressCallback) {

            function _async(callback) {
                if (typeof s === 'string' && typeof salt === 'number')
                    bcrypt.genSalt(salt, function(err, salt) {
                        _hash(s, salt, callback, progressCallback);
                    });
                else if (typeof s === 'string' && typeof salt === 'string')
                    _hash(s, salt, callback, progressCallback);
                else
                    nextTick(callback.bind(this, Error("Illegal arguments: "+(typeof s)+', '+(typeof salt))));
            }

            if (callback) {
                if (typeof callback !== 'function')
                    throw Error("Illegal callback: "+typeof(callback));
                _async(callback);
            } else
                return new Promise(function(resolve, reject) {
                    _async(function(err, res) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(res);
                    });
                });
        };

        /**
         * Compares two strings of the same length in constant time.
         * @param {string} known Must be of the correct length
         * @param {string} unknown Must be the same length as `known`
         * @returns {boolean}
         * @inner
         */
        function safeStringCompare(known, unknown) {
            var right = 0,
                wrong = 0;
            for (var i=0, k=known.length; i<k; ++i) {
                if (known.charCodeAt(i) === unknown.charCodeAt(i))
                    ++right;
                else
                    ++wrong;
            }
            // Prevent removal of unused variables (never true, actually)
            if (right < 0)
                return false;
            return wrong === 0;
        }

        /**
         * Synchronously tests a string against a hash.
         * @param {string} s String to compare
         * @param {string} hash Hash to test against
         * @returns {boolean} true if matching, otherwise false
         * @throws {Error} If an argument is illegal
         * @expose
         */
        bcrypt.compareSync = function(s, hash) {
            if (typeof s !== "string" || typeof hash !== "string")
                throw Error("Illegal arguments: "+(typeof s)+', '+(typeof hash));
            if (hash.length !== 60)
                return false;
            return safeStringCompare(bcrypt.hashSync(s, hash.substr(0, hash.length-31)), hash);
        };

        /**
         * Asynchronously compares the given data against the given hash.
         * @param {string} s Data to compare
         * @param {string} hash Data to be compared to
         * @param {function(Error, boolean)=} callback Callback receiving the error, if any, otherwise the result
         * @param {function(number)=} progressCallback Callback successively called with the percentage of rounds completed
         *  (0.0 - 1.0), maximally once per `MAX_EXECUTION_TIME = 100` ms.
         * @returns {!Promise} If `callback` has been omitted
         * @throws {Error} If `callback` is present but not a function
         * @expose
         */
        bcrypt.compare = function(s, hash, callback, progressCallback) {

            function _async(callback) {
                if (typeof s !== "string" || typeof hash !== "string") {
                    nextTick(callback.bind(this, Error("Illegal arguments: "+(typeof s)+', '+(typeof hash))));
                    return;
                }
                if (hash.length !== 60) {
                    nextTick(callback.bind(this, null, false));
                    return;
                }
                bcrypt.hash(s, hash.substr(0, 29), function(err, comp) {
                    if (err)
                        callback(err);
                    else
                        callback(null, safeStringCompare(comp, hash));
                }, progressCallback);
            }

            if (callback) {
                if (typeof callback !== 'function')
                    throw Error("Illegal callback: "+typeof(callback));
                _async(callback);
            } else
                return new Promise(function(resolve, reject) {
                    _async(function(err, res) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(res);
                    });
                });
        };

        /**
         * Gets the number of rounds used to encrypt the specified hash.
         * @param {string} hash Hash to extract the used number of rounds from
         * @returns {number} Number of rounds used
         * @throws {Error} If `hash` is not a string
         * @expose
         */
        bcrypt.getRounds = function(hash) {
            if (typeof hash !== "string")
                throw Error("Illegal arguments: "+(typeof hash));
            return parseInt(hash.split("$")[2], 10);
        };

        /**
         * Gets the salt portion from a hash. Does not validate the hash.
         * @param {string} hash Hash to extract the salt from
         * @returns {string} Extracted salt part
         * @throws {Error} If `hash` is not a string or otherwise invalid
         * @expose
         */
        bcrypt.getSalt = function(hash) {
            if (typeof hash !== 'string')
                throw Error("Illegal arguments: "+(typeof hash));
            if (hash.length !== 60)
                throw Error("Illegal hash length: "+hash.length+" != 60");
            return hash.substring(0, 29);
        };

        /**
         * Continues with the callback on the next tick.
         * @function
         * @param {function(...[*])} callback Callback to execute
         * @inner
         */
        var nextTick = typeof process !== 'undefined' && process && typeof process.nextTick === 'function'
            ? (typeof setImmediate === 'function' ? setImmediate : process.nextTick)
            : setTimeout;

        /**
         * Converts a JavaScript string to UTF8 bytes.
         * @param {string} str String
         * @returns {!Array.<number>} UTF8 bytes
         * @inner
         */
        function stringToBytes(str) {
            var out = [],
                i = 0;
            utfx.encodeUTF16toUTF8(function() {
                if (i >= str.length) return null;
                return str.charCodeAt(i++);
            }, function(b) {
                out.push(b);
            });
            return out;
        }

        // A base64 implementation for the bcrypt algorithm. This is partly non-standard.

        /**
         * bcrypt's own non-standard base64 dictionary.
         * @type {!Array.<string>}
         * @const
         * @inner
         **/
        var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split('');

        /**
         * @type {!Array.<number>}
         * @const
         * @inner
         **/
        var BASE64_INDEX = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0,
            1, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, -1, -1, -1, -1, -1, -1,
            -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, -1, -1, -1, -1, -1, -1, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
            48, 49, 50, 51, 52, 53, -1, -1, -1, -1, -1];

        /**
         * @type {!function(...number):string}
         * @inner
         */
        var stringFromCharCode = String.fromCharCode;

        /**
         * Encodes a byte array to base64 with up to len bytes of input.
         * @param {!Array.<number>} b Byte array
         * @param {number} len Maximum input length
         * @returns {string}
         * @inner
         */
        function base64_encode(b, len) {
            var off = 0,
                rs = [],
                c1, c2;
            if (len <= 0 || len > b.length)
                throw Error("Illegal len: "+len);
            while (off < len) {
                c1 = b[off++] & 0xff;
                rs.push(BASE64_CODE[(c1 >> 2) & 0x3f]);
                c1 = (c1 & 0x03) << 4;
                if (off >= len) {
                    rs.push(BASE64_CODE[c1 & 0x3f]);
                    break;
                }
                c2 = b[off++] & 0xff;
                c1 |= (c2 >> 4) & 0x0f;
                rs.push(BASE64_CODE[c1 & 0x3f]);
                c1 = (c2 & 0x0f) << 2;
                if (off >= len) {
                    rs.push(BASE64_CODE[c1 & 0x3f]);
                    break;
                }
                c2 = b[off++] & 0xff;
                c1 |= (c2 >> 6) & 0x03;
                rs.push(BASE64_CODE[c1 & 0x3f]);
                rs.push(BASE64_CODE[c2 & 0x3f]);
            }
            return rs.join('');
        }

        /**
         * Decodes a base64 encoded string to up to len bytes of output.
         * @param {string} s String to decode
         * @param {number} len Maximum output length
         * @returns {!Array.<number>}
         * @inner
         */
        function base64_decode(s, len) {
            var off = 0,
                slen = s.length,
                olen = 0,
                rs = [],
                c1, c2, c3, c4, o, code;
            if (len <= 0)
                throw Error("Illegal len: "+len);
            while (off < slen - 1 && olen < len) {
                code = s.charCodeAt(off++);
                c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
                code = s.charCodeAt(off++);
                c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
                if (c1 == -1 || c2 == -1)
                    break;
                o = (c1 << 2) >>> 0;
                o |= (c2 & 0x30) >> 4;
                rs.push(stringFromCharCode(o));
                if (++olen >= len || off >= slen)
                    break;
                code = s.charCodeAt(off++);
                c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
                if (c3 == -1)
                    break;
                o = ((c2 & 0x0f) << 4) >>> 0;
                o |= (c3 & 0x3c) >> 2;
                rs.push(stringFromCharCode(o));
                if (++olen >= len || off >= slen)
                    break;
                code = s.charCodeAt(off++);
                c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
                o = ((c3 & 0x03) << 6) >>> 0;
                o |= c4;
                rs.push(stringFromCharCode(o));
                ++olen;
            }
            var res = [];
            for (off = 0; off<olen; off++)
                res.push(rs[off].charCodeAt(0));
            return res;
        }

        /**
         * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
         * Released under the Apache License, Version 2.0
         * see: https://github.com/dcodeIO/utfx for details
         */
        var utfx = function() {

            /**
             * utfx namespace.
             * @inner
             * @type {!Object.<string,*>}
             */
            var utfx = {};

            /**
             * Maximum valid code point.
             * @type {number}
             * @const
             */
            utfx.MAX_CODEPOINT = 0x10FFFF;

            /**
             * Encodes UTF8 code points to UTF8 bytes.
             * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
             *  respectively `null` if there are no more code points left or a single numeric code point.
             * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
             */
            utfx.encodeUTF8 = function(src, dst) {
                var cp = null;
                if (typeof src === 'number')
                    cp = src,
                    src = function() { return null; };
                while (cp !== null || (cp = src()) !== null) {
                    if (cp < 0x80)
                        dst(cp&0x7F);
                    else if (cp < 0x800)
                        dst(((cp>>6)&0x1F)|0xC0),
                        dst((cp&0x3F)|0x80);
                    else if (cp < 0x10000)
                        dst(((cp>>12)&0x0F)|0xE0),
                        dst(((cp>>6)&0x3F)|0x80),
                        dst((cp&0x3F)|0x80);
                    else
                        dst(((cp>>18)&0x07)|0xF0),
                        dst(((cp>>12)&0x3F)|0x80),
                        dst(((cp>>6)&0x3F)|0x80),
                        dst((cp&0x3F)|0x80);
                    cp = null;
                }
            };

            /**
             * Decodes UTF8 bytes to UTF8 code points.
             * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
             *  are no more bytes left.
             * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
             * @throws {RangeError} If a starting byte is invalid in UTF8
             * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
             *  remaining bytes.
             */
            utfx.decodeUTF8 = function(src, dst) {
                var a, b, c, d, fail = function(b) {
                    b = b.slice(0, b.indexOf(null));
                    var err = Error(b.toString());
                    err.name = "TruncatedError";
                    err['bytes'] = b;
                    throw err;
                };
                while ((a = src()) !== null) {
                    if ((a&0x80) === 0)
                        dst(a);
                    else if ((a&0xE0) === 0xC0)
                        ((b = src()) === null) && fail([a, b]),
                        dst(((a&0x1F)<<6) | (b&0x3F));
                    else if ((a&0xF0) === 0xE0)
                        ((b=src()) === null || (c=src()) === null) && fail([a, b, c]),
                        dst(((a&0x0F)<<12) | ((b&0x3F)<<6) | (c&0x3F));
                    else if ((a&0xF8) === 0xF0)
                        ((b=src()) === null || (c=src()) === null || (d=src()) === null) && fail([a, b, c ,d]),
                        dst(((a&0x07)<<18) | ((b&0x3F)<<12) | ((c&0x3F)<<6) | (d&0x3F));
                    else throw RangeError("Illegal starting byte: "+a);
                }
            };

            /**
             * Converts UTF16 characters to UTF8 code points.
             * @param {!function():number|null} src Characters source as a function returning the next char code respectively
             *  `null` if there are no more characters left.
             * @param {!function(number)} dst Code points destination as a function successively called with each converted code
             *  point.
             */
            utfx.UTF16toUTF8 = function(src, dst) {
                var c1, c2 = null;
                while (true) {
                    if ((c1 = c2 !== null ? c2 : src()) === null)
                        break;
                    if (c1 >= 0xD800 && c1 <= 0xDFFF) {
                        if ((c2 = src()) !== null) {
                            if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                                dst((c1-0xD800)*0x400+c2-0xDC00+0x10000);
                                c2 = null; continue;
                            }
                        }
                    }
                    dst(c1);
                }
                if (c2 !== null) dst(c2);
            };

            /**
             * Converts UTF8 code points to UTF16 characters.
             * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
             *  respectively `null` if there are no more code points left or a single numeric code point.
             * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
             * @throws {RangeError} If a code point is out of range
             */
            utfx.UTF8toUTF16 = function(src, dst) {
                var cp = null;
                if (typeof src === 'number')
                    cp = src, src = function() { return null; };
                while (cp !== null || (cp = src()) !== null) {
                    if (cp <= 0xFFFF)
                        dst(cp);
                    else
                        cp -= 0x10000,
                        dst((cp>>10)+0xD800),
                        dst((cp%0x400)+0xDC00);
                    cp = null;
                }
            };

            /**
             * Converts and encodes UTF16 characters to UTF8 bytes.
             * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
             *  if there are no more characters left.
             * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
             */
            utfx.encodeUTF16toUTF8 = function(src, dst) {
                utfx.UTF16toUTF8(src, function(cp) {
                    utfx.encodeUTF8(cp, dst);
                });
            };

            /**
             * Decodes and converts UTF8 bytes to UTF16 characters.
             * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
             *  are no more bytes left.
             * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
             * @throws {RangeError} If a starting byte is invalid in UTF8
             * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
             */
            utfx.decodeUTF8toUTF16 = function(src, dst) {
                utfx.decodeUTF8(src, function(cp) {
                    utfx.UTF8toUTF16(cp, dst);
                });
            };

            /**
             * Calculates the byte length of an UTF8 code point.
             * @param {number} cp UTF8 code point
             * @returns {number} Byte length
             */
            utfx.calculateCodePoint = function(cp) {
                return (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
            };

            /**
             * Calculates the number of UTF8 bytes required to store UTF8 code points.
             * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
             *  `null` if there are no more code points left.
             * @returns {number} The number of UTF8 bytes required
             */
            utfx.calculateUTF8 = function(src) {
                var cp, l=0;
                while ((cp = src()) !== null)
                    l += utfx.calculateCodePoint(cp);
                return l;
            };

            /**
             * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
             * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
             *  `null` if there are no more characters left.
             * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
             */
            utfx.calculateUTF16asUTF8 = function(src) {
                var n=0, l=0;
                utfx.UTF16toUTF8(src, function(cp) {
                    ++n; l += utfx.calculateCodePoint(cp);
                });
                return [n,l];
            };

            return utfx;
        }();

        Date.now = Date.now || function() { return +new Date; };

        /**
         * @type {number}
         * @const
         * @inner
         */
        var BCRYPT_SALT_LEN = 16;

        /**
         * @type {number}
         * @const
         * @inner
         */
        var GENSALT_DEFAULT_LOG2_ROUNDS = 10;

        /**
         * @type {number}
         * @const
         * @inner
         */
        var BLOWFISH_NUM_ROUNDS = 16;

        /**
         * @type {number}
         * @const
         * @inner
         */
        var MAX_EXECUTION_TIME = 100;

        /**
         * @type {Array.<number>}
         * @const
         * @inner
         */
        var P_ORIG = [
            0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822,
            0x299f31d0, 0x082efa98, 0xec4e6c89, 0x452821e6, 0x38d01377,
            0xbe5466cf, 0x34e90c6c, 0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5,
            0xb5470917, 0x9216d5d9, 0x8979fb1b
        ];

        /**
         * @type {Array.<number>}
         * @const
         * @inner
         */
        var S_ORIG = [
            0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, 0xb8e1afed,
            0x6a267e96, 0xba7c9045, 0xf12c7f99, 0x24a19947, 0xb3916cf7,
            0x0801f2e2, 0x858efc16, 0x636920d8, 0x71574e69, 0xa458fea3,
            0xf4933d7e, 0x0d95748f, 0x728eb658, 0x718bcd58, 0x82154aee,
            0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013, 0xc5d1b023,
            0x286085f0, 0xca417918, 0xb8db38ef, 0x8e79dcb0, 0x603a180e,
            0x6c9e0e8b, 0xb01e8a3e, 0xd71577c1, 0xbd314b27, 0x78af2fda,
            0x55605c60, 0xe65525f3, 0xaa55ab94, 0x57489862, 0x63e81440,
            0x55ca396a, 0x2aab10b6, 0xb4cc5c34, 0x1141e8ce, 0xa15486af,
            0x7c72e993, 0xb3ee1411, 0x636fbc2a, 0x2ba9c55d, 0x741831f6,
            0xce5c3e16, 0x9b87931e, 0xafd6ba33, 0x6c24cf5c, 0x7a325381,
            0x28958677, 0x3b8f4898, 0x6b4bb9af, 0xc4bfe81b, 0x66282193,
            0x61d809cc, 0xfb21a991, 0x487cac60, 0x5dec8032, 0xef845d5d,
            0xe98575b1, 0xdc262302, 0xeb651b88, 0x23893e81, 0xd396acc5,
            0x0f6d6ff3, 0x83f44239, 0x2e0b4482, 0xa4842004, 0x69c8f04a,
            0x9e1f9b5e, 0x21c66842, 0xf6e96c9a, 0x670c9c61, 0xabd388f0,
            0x6a51a0d2, 0xd8542f68, 0x960fa728, 0xab5133a3, 0x6eef0b6c,
            0x137a3be4, 0xba3bf050, 0x7efb2a98, 0xa1f1651d, 0x39af0176,
            0x66ca593e, 0x82430e88, 0x8cee8619, 0x456f9fb4, 0x7d84a5c3,
            0x3b8b5ebe, 0xe06f75d8, 0x85c12073, 0x401a449f, 0x56c16aa6,
            0x4ed3aa62, 0x363f7706, 0x1bfedf72, 0x429b023d, 0x37d0d724,
            0xd00a1248, 0xdb0fead3, 0x49f1c09b, 0x075372c9, 0x80991b7b,
            0x25d479d8, 0xf6e8def7, 0xe3fe501a, 0xb6794c3b, 0x976ce0bd,
            0x04c006ba, 0xc1a94fb6, 0x409f60c4, 0x5e5c9ec2, 0x196a2463,
            0x68fb6faf, 0x3e6c53b5, 0x1339b2eb, 0x3b52ec6f, 0x6dfc511f,
            0x9b30952c, 0xcc814544, 0xaf5ebd09, 0xbee3d004, 0xde334afd,
            0x660f2807, 0x192e4bb3, 0xc0cba857, 0x45c8740f, 0xd20b5f39,
            0xb9d3fbdb, 0x5579c0bd, 0x1a60320a, 0xd6a100c6, 0x402c7279,
            0x679f25fe, 0xfb1fa3cc, 0x8ea5e9f8, 0xdb3222f8, 0x3c7516df,
            0xfd616b15, 0x2f501ec8, 0xad0552ab, 0x323db5fa, 0xfd238760,
            0x53317b48, 0x3e00df82, 0x9e5c57bb, 0xca6f8ca0, 0x1a87562e,
            0xdf1769db, 0xd542a8f6, 0x287effc3, 0xac6732c6, 0x8c4f5573,
            0x695b27b0, 0xbbca58c8, 0xe1ffa35d, 0xb8f011a0, 0x10fa3d98,
            0xfd2183b8, 0x4afcb56c, 0x2dd1d35b, 0x9a53e479, 0xb6f84565,
            0xd28e49bc, 0x4bfb9790, 0xe1ddf2da, 0xa4cb7e33, 0x62fb1341,
            0xcee4c6e8, 0xef20cada, 0x36774c01, 0xd07e9efe, 0x2bf11fb4,
            0x95dbda4d, 0xae909198, 0xeaad8e71, 0x6b93d5a0, 0xd08ed1d0,
            0xafc725e0, 0x8e3c5b2f, 0x8e7594b7, 0x8ff6e2fb, 0xf2122b64,
            0x8888b812, 0x900df01c, 0x4fad5ea0, 0x688fc31c, 0xd1cff191,
            0xb3a8c1ad, 0x2f2f2218, 0xbe0e1777, 0xea752dfe, 0x8b021fa1,
            0xe5a0cc0f, 0xb56f74e8, 0x18acf3d6, 0xce89e299, 0xb4a84fe0,
            0xfd13e0b7, 0x7cc43b81, 0xd2ada8d9, 0x165fa266, 0x80957705,
            0x93cc7314, 0x211a1477, 0xe6ad2065, 0x77b5fa86, 0xc75442f5,
            0xfb9d35cf, 0xebcdaf0c, 0x7b3e89a0, 0xd6411bd3, 0xae1e7e49,
            0x00250e2d, 0x2071b35e, 0x226800bb, 0x57b8e0af, 0x2464369b,
            0xf009b91e, 0x5563911d, 0x59dfa6aa, 0x78c14389, 0xd95a537f,
            0x207d5ba2, 0x02e5b9c5, 0x83260376, 0x6295cfa9, 0x11c81968,
            0x4e734a41, 0xb3472dca, 0x7b14a94a, 0x1b510052, 0x9a532915,
            0xd60f573f, 0xbc9bc6e4, 0x2b60a476, 0x81e67400, 0x08ba6fb5,
            0x571be91f, 0xf296ec6b, 0x2a0dd915, 0xb6636521, 0xe7b9f9b6,
            0xff34052e, 0xc5855664, 0x53b02d5d, 0xa99f8fa1, 0x08ba4799,
            0x6e85076a, 0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623,
            0xad6ea6b0, 0x49a7df7d, 0x9cee60b8, 0x8fedb266, 0xecaa8c71,
            0x699a17ff, 0x5664526c, 0xc2b19ee1, 0x193602a5, 0x75094c29,
            0xa0591340, 0xe4183a3e, 0x3f54989a, 0x5b429d65, 0x6b8fe4d6,
            0x99f73fd6, 0xa1d29c07, 0xefe830f5, 0x4d2d38e6, 0xf0255dc1,
            0x4cdd2086, 0x8470eb26, 0x6382e9c6, 0x021ecc5e, 0x09686b3f,
            0x3ebaefc9, 0x3c971814, 0x6b6a70a1, 0x687f3584, 0x52a0e286,
            0xb79c5305, 0xaa500737, 0x3e07841c, 0x7fdeae5c, 0x8e7d44ec,
            0x5716f2b8, 0xb03ada37, 0xf0500c0d, 0xf01c1f04, 0x0200b3ff,
            0xae0cf51a, 0x3cb574b2, 0x25837a58, 0xdc0921bd, 0xd19113f9,
            0x7ca92ff6, 0x94324773, 0x22f54701, 0x3ae5e581, 0x37c2dadc,
            0xc8b57634, 0x9af3dda7, 0xa9446146, 0x0fd0030e, 0xecc8c73e,
            0xa4751e41, 0xe238cd99, 0x3bea0e2f, 0x3280bba1, 0x183eb331,
            0x4e548b38, 0x4f6db908, 0x6f420d03, 0xf60a04bf, 0x2cb81290,
            0x24977c79, 0x5679b072, 0xbcaf89af, 0xde9a771f, 0xd9930810,
            0xb38bae12, 0xdccf3f2e, 0x5512721f, 0x2e6b7124, 0x501adde6,
            0x9f84cd87, 0x7a584718, 0x7408da17, 0xbc9f9abc, 0xe94b7d8c,
            0xec7aec3a, 0xdb851dfa, 0x63094366, 0xc464c3d2, 0xef1c1847,
            0x3215d908, 0xdd433b37, 0x24c2ba16, 0x12a14d43, 0x2a65c451,
            0x50940002, 0x133ae4dd, 0x71dff89e, 0x10314e55, 0x81ac77d6,
            0x5f11199b, 0x043556f1, 0xd7a3c76b, 0x3c11183b, 0x5924a509,
            0xf28fe6ed, 0x97f1fbfa, 0x9ebabf2c, 0x1e153c6e, 0x86e34570,
            0xeae96fb1, 0x860e5e0a, 0x5a3e2ab3, 0x771fe71c, 0x4e3d06fa,
            0x2965dcb9, 0x99e71d0f, 0x803e89d6, 0x5266c825, 0x2e4cc978,
            0x9c10b36a, 0xc6150eba, 0x94e2ea78, 0xa5fc3c53, 0x1e0a2df4,
            0xf2f74ea7, 0x361d2b3d, 0x1939260f, 0x19c27960, 0x5223a708,
            0xf71312b6, 0xebadfe6e, 0xeac31f66, 0xe3bc4595, 0xa67bc883,
            0xb17f37d1, 0x018cff28, 0xc332ddef, 0xbe6c5aa5, 0x65582185,
            0x68ab9802, 0xeecea50f, 0xdb2f953b, 0x2aef7dad, 0x5b6e2f84,
            0x1521b628, 0x29076170, 0xecdd4775, 0x619f1510, 0x13cca830,
            0xeb61bd96, 0x0334fe1e, 0xaa0363cf, 0xb5735c90, 0x4c70a239,
            0xd59e9e0b, 0xcbaade14, 0xeecc86bc, 0x60622ca7, 0x9cab5cab,
            0xb2f3846e, 0x648b1eaf, 0x19bdf0ca, 0xa02369b9, 0x655abb50,
            0x40685a32, 0x3c2ab4b3, 0x319ee9d5, 0xc021b8f7, 0x9b540b19,
            0x875fa099, 0x95f7997e, 0x623d7da8, 0xf837889a, 0x97e32d77,
            0x11ed935f, 0x16681281, 0x0e358829, 0xc7e61fd6, 0x96dedfa1,
            0x7858ba99, 0x57f584a5, 0x1b227263, 0x9b83c3ff, 0x1ac24696,
            0xcdb30aeb, 0x532e3054, 0x8fd948e4, 0x6dbc3128, 0x58ebf2ef,
            0x34c6ffea, 0xfe28ed61, 0xee7c3c73, 0x5d4a14d9, 0xe864b7e3,
            0x42105d14, 0x203e13e0, 0x45eee2b6, 0xa3aaabea, 0xdb6c4f15,
            0xfacb4fd0, 0xc742f442, 0xef6abbb5, 0x654f3b1d, 0x41cd2105,
            0xd81e799e, 0x86854dc7, 0xe44b476a, 0x3d816250, 0xcf62a1f2,
            0x5b8d2646, 0xfc8883a0, 0xc1c7b6a3, 0x7f1524c3, 0x69cb7492,
            0x47848a0b, 0x5692b285, 0x095bbf00, 0xad19489d, 0x1462b174,
            0x23820e00, 0x58428d2a, 0x0c55f5ea, 0x1dadf43e, 0x233f7061,
            0x3372f092, 0x8d937e41, 0xd65fecf1, 0x6c223bdb, 0x7cde3759,
            0xcbee7460, 0x4085f2a7, 0xce77326e, 0xa6078084, 0x19f8509e,
            0xe8efd855, 0x61d99735, 0xa969a7aa, 0xc50c06c2, 0x5a04abfc,
            0x800bcadc, 0x9e447a2e, 0xc3453484, 0xfdd56705, 0x0e1e9ec9,
            0xdb73dbd3, 0x105588cd, 0x675fda79, 0xe3674340, 0xc5c43465,
            0x713e38d8, 0x3d28f89e, 0xf16dff20, 0x153e21e7, 0x8fb03d4a,
            0xe6e39f2b, 0xdb83adf7, 0xe93d5a68, 0x948140f7, 0xf64c261c,
            0x94692934, 0x411520f7, 0x7602d4f7, 0xbcf46b2e, 0xd4a20068,
            0xd4082471, 0x3320f46a, 0x43b7d4b7, 0x500061af, 0x1e39f62e,
            0x97244546, 0x14214f74, 0xbf8b8840, 0x4d95fc1d, 0x96b591af,
            0x70f4ddd3, 0x66a02f45, 0xbfbc09ec, 0x03bd9785, 0x7fac6dd0,
            0x31cb8504, 0x96eb27b3, 0x55fd3941, 0xda2547e6, 0xabca0a9a,
            0x28507825, 0x530429f4, 0x0a2c86da, 0xe9b66dfb, 0x68dc1462,
            0xd7486900, 0x680ec0a4, 0x27a18dee, 0x4f3ffea2, 0xe887ad8c,
            0xb58ce006, 0x7af4d6b6, 0xaace1e7c, 0xd3375fec, 0xce78a399,
            0x406b2a42, 0x20fe9e35, 0xd9f385b9, 0xee39d7ab, 0x3b124e8b,
            0x1dc9faf7, 0x4b6d1856, 0x26a36631, 0xeae397b2, 0x3a6efa74,
            0xdd5b4332, 0x6841e7f7, 0xca7820fb, 0xfb0af54e, 0xd8feb397,
            0x454056ac, 0xba489527, 0x55533a3a, 0x20838d87, 0xfe6ba9b7,
            0xd096954b, 0x55a867bc, 0xa1159a58, 0xcca92963, 0x99e1db33,
            0xa62a4a56, 0x3f3125f9, 0x5ef47e1c, 0x9029317c, 0xfdf8e802,
            0x04272f70, 0x80bb155c, 0x05282ce3, 0x95c11548, 0xe4c66d22,
            0x48c1133f, 0xc70f86dc, 0x07f9c9ee, 0x41041f0f, 0x404779a4,
            0x5d886e17, 0x325f51eb, 0xd59bc0d1, 0xf2bcc18f, 0x41113564,
            0x257b7834, 0x602a9c60, 0xdff8e8a3, 0x1f636c1b, 0x0e12b4c2,
            0x02e1329e, 0xaf664fd1, 0xcad18115, 0x6b2395e0, 0x333e92e1,
            0x3b240b62, 0xeebeb922, 0x85b2a20e, 0xe6ba0d99, 0xde720c8c,
            0x2da2f728, 0xd0127845, 0x95b794fd, 0x647d0862, 0xe7ccf5f0,
            0x5449a36f, 0x877d48fa, 0xc39dfd27, 0xf33e8d1e, 0x0a476341,
            0x992eff74, 0x3a6f6eab, 0xf4f8fd37, 0xa812dc60, 0xa1ebddf8,
            0x991be14c, 0xdb6e6b0d, 0xc67b5510, 0x6d672c37, 0x2765d43b,
            0xdcd0e804, 0xf1290dc7, 0xcc00ffa3, 0xb5390f92, 0x690fed0b,
            0x667b9ffb, 0xcedb7d9c, 0xa091cf0b, 0xd9155ea3, 0xbb132f88,
            0x515bad24, 0x7b9479bf, 0x763bd6eb, 0x37392eb3, 0xcc115979,
            0x8026e297, 0xf42e312d, 0x6842ada7, 0xc66a2b3b, 0x12754ccc,
            0x782ef11c, 0x6a124237, 0xb79251e7, 0x06a1bbe6, 0x4bfb6350,
            0x1a6b1018, 0x11caedfa, 0x3d25bdd8, 0xe2e1c3c9, 0x44421659,
            0x0a121386, 0xd90cec6e, 0xd5abea2a, 0x64af674e, 0xda86a85f,
            0xbebfe988, 0x64e4c3fe, 0x9dbc8057, 0xf0f7c086, 0x60787bf8,
            0x6003604d, 0xd1fd8346, 0xf6381fb0, 0x7745ae04, 0xd736fccc,
            0x83426b33, 0xf01eab71, 0xb0804187, 0x3c005e5f, 0x77a057be,
            0xbde8ae24, 0x55464299, 0xbf582e61, 0x4e58f48f, 0xf2ddfda2,
            0xf474ef38, 0x8789bdc2, 0x5366f9c3, 0xc8b38e74, 0xb475f255,
            0x46fcd9b9, 0x7aeb2661, 0x8b1ddf84, 0x846a0e79, 0x915f95e2,
            0x466e598e, 0x20b45770, 0x8cd55591, 0xc902de4c, 0xb90bace1,
            0xbb8205d0, 0x11a86248, 0x7574a99e, 0xb77f19b6, 0xe0a9dc09,
            0x662d09a1, 0xc4324633, 0xe85a1f02, 0x09f0be8c, 0x4a99a025,
            0x1d6efe10, 0x1ab93d1d, 0x0ba5a4df, 0xa186f20f, 0x2868f169,
            0xdcb7da83, 0x573906fe, 0xa1e2ce9b, 0x4fcd7f52, 0x50115e01,
            0xa70683fa, 0xa002b5c4, 0x0de6d027, 0x9af88c27, 0x773f8641,
            0xc3604c06, 0x61a806b5, 0xf0177a28, 0xc0f586e0, 0x006058aa,
            0x30dc7d62, 0x11e69ed7, 0x2338ea63, 0x53c2dd94, 0xc2c21634,
            0xbbcbee56, 0x90bcb6de, 0xebfc7da1, 0xce591d76, 0x6f05e409,
            0x4b7c0188, 0x39720a3d, 0x7c927c24, 0x86e3725f, 0x724d9db9,
            0x1ac15bb4, 0xd39eb8fc, 0xed545578, 0x08fca5b5, 0xd83d7cd3,
            0x4dad0fc4, 0x1e50ef5e, 0xb161e6f8, 0xa28514d9, 0x6c51133c,
            0x6fd5c7e7, 0x56e14ec4, 0x362abfce, 0xddc6c837, 0xd79a3234,
            0x92638212, 0x670efa8e, 0x406000e0, 0x3a39ce37, 0xd3faf5cf,
            0xabc27737, 0x5ac52d1b, 0x5cb0679e, 0x4fa33742, 0xd3822740,
            0x99bc9bbe, 0xd5118e9d, 0xbf0f7315, 0xd62d1c7e, 0xc700c47b,
            0xb78c1b6b, 0x21a19045, 0xb26eb1be, 0x6a366eb4, 0x5748ab2f,
            0xbc946e79, 0xc6a376d2, 0x6549c2c8, 0x530ff8ee, 0x468dde7d,
            0xd5730a1d, 0x4cd04dc6, 0x2939bbdb, 0xa9ba4650, 0xac9526e8,
            0xbe5ee304, 0xa1fad5f0, 0x6a2d519a, 0x63ef8ce2, 0x9a86ee22,
            0xc089c2b8, 0x43242ef6, 0xa51e03aa, 0x9cf2d0a4, 0x83c061ba,
            0x9be96a4d, 0x8fe51550, 0xba645bd6, 0x2826a2f9, 0xa73a3ae1,
            0x4ba99586, 0xef5562e9, 0xc72fefd3, 0xf752f7da, 0x3f046f69,
            0x77fa0a59, 0x80e4a915, 0x87b08601, 0x9b09e6ad, 0x3b3ee593,
            0xe990fd5a, 0x9e34d797, 0x2cf0b7d9, 0x022b8b51, 0x96d5ac3a,
            0x017da67d, 0xd1cf3ed6, 0x7c7d2d28, 0x1f9f25cf, 0xadf2b89b,
            0x5ad6b472, 0x5a88f54c, 0xe029ac71, 0xe019a5e6, 0x47b0acfd,
            0xed93fa9b, 0xe8d3c48d, 0x283b57cc, 0xf8d56629, 0x79132e28,
            0x785f0191, 0xed756055, 0xf7960e44, 0xe3d35e8c, 0x15056dd4,
            0x88f46dba, 0x03a16125, 0x0564f0bd, 0xc3eb9e15, 0x3c9057a2,
            0x97271aec, 0xa93a072a, 0x1b3f6d9b, 0x1e6321f5, 0xf59c66fb,
            0x26dcf319, 0x7533d928, 0xb155fdf5, 0x03563482, 0x8aba3cbb,
            0x28517711, 0xc20ad9f8, 0xabcc5167, 0xccad925f, 0x4de81751,
            0x3830dc8e, 0x379d5862, 0x9320f991, 0xea7a90c2, 0xfb3e7bce,
            0x5121ce64, 0x774fbe32, 0xa8b6e37e, 0xc3293d46, 0x48de5369,
            0x6413e680, 0xa2ae0810, 0xdd6db224, 0x69852dfd, 0x09072166,
            0xb39a460a, 0x6445c0dd, 0x586cdecf, 0x1c20c8ae, 0x5bbef7dd,
            0x1b588d40, 0xccd2017f, 0x6bb4e3bb, 0xdda26a7e, 0x3a59ff45,
            0x3e350a44, 0xbcb4cdd5, 0x72eacea8, 0xfa6484bb, 0x8d6612ae,
            0xbf3c6f47, 0xd29be463, 0x542f5d9e, 0xaec2771b, 0xf64e6370,
            0x740e0d8d, 0xe75b1357, 0xf8721671, 0xaf537d5d, 0x4040cb08,
            0x4eb4e2cc, 0x34d2466a, 0x0115af84, 0xe1b00428, 0x95983a1d,
            0x06b89fb4, 0xce6ea048, 0x6f3f3b82, 0x3520ab82, 0x011a1d4b,
            0x277227f8, 0x611560b1, 0xe7933fdc, 0xbb3a792b, 0x344525bd,
            0xa08839e1, 0x51ce794b, 0x2f32c9b7, 0xa01fbac9, 0xe01cc87e,
            0xbcc7d1f6, 0xcf0111c3, 0xa1e8aac7, 0x1a908749, 0xd44fbd9a,
            0xd0dadecb, 0xd50ada38, 0x0339c32a, 0xc6913667, 0x8df9317c,
            0xe0b12b4f, 0xf79e59b7, 0x43f5bb3a, 0xf2d519ff, 0x27d9459c,
            0xbf97222c, 0x15e6fc2a, 0x0f91fc71, 0x9b941525, 0xfae59361,
            0xceb69ceb, 0xc2a86459, 0x12baa8d1, 0xb6c1075e, 0xe3056a0c,
            0x10d25065, 0xcb03a442, 0xe0ec6e0e, 0x1698db3b, 0x4c98a0be,
            0x3278e964, 0x9f1f9532, 0xe0d392df, 0xd3a0342b, 0x8971f21e,
            0x1b0a7441, 0x4ba3348c, 0xc5be7120, 0xc37632d8, 0xdf359f8d,
            0x9b992f2e, 0xe60b6f47, 0x0fe3f11d, 0xe54cda54, 0x1edad891,
            0xce6279cf, 0xcd3e7e6f, 0x1618b166, 0xfd2c1d05, 0x848fd2c5,
            0xf6fb2299, 0xf523f357, 0xa6327623, 0x93a83531, 0x56cccd02,
            0xacf08162, 0x5a75ebb5, 0x6e163697, 0x88d273cc, 0xde966292,
            0x81b949d0, 0x4c50901b, 0x71c65614, 0xe6c6c7bd, 0x327a140a,
            0x45e1d006, 0xc3f27b9a, 0xc9aa53fd, 0x62a80f00, 0xbb25bfe2,
            0x35bdd2f6, 0x71126905, 0xb2040222, 0xb6cbcf7c, 0xcd769c2b,
            0x53113ec0, 0x1640e3d3, 0x38abbd60, 0x2547adf0, 0xba38209c,
            0xf746ce76, 0x77afa1c5, 0x20756060, 0x85cbfe4e, 0x8ae88dd8,
            0x7aaaf9b0, 0x4cf9aa7e, 0x1948c25c, 0x02fb8a8c, 0x01c36ae4,
            0xd6ebe1f9, 0x90d4f869, 0xa65cdea0, 0x3f09252d, 0xc208e69f,
            0xb74e6132, 0xce77e25b, 0x578fdfe3, 0x3ac372e6
        ];

        /**
         * @type {Array.<number>}
         * @const
         * @inner
         */
        var C_ORIG = [
            0x4f727068, 0x65616e42, 0x65686f6c, 0x64657253, 0x63727944,
            0x6f756274
        ];

        /**
         * @param {Array.<number>} lr
         * @param {number} off
         * @param {Array.<number>} P
         * @param {Array.<number>} S
         * @returns {Array.<number>}
         * @inner
         */
        function _encipher(lr, off, P, S) { // This is our bottleneck: 1714/1905 ticks / 90% - see profile.txt
            var n,
                l = lr[off],
                r = lr[off + 1];

            l ^= P[0];

            /*
            for (var i=0, k=BLOWFISH_NUM_ROUNDS-2; i<=k;)
                // Feistel substitution on left word
                n  = S[l >>> 24],
                n += S[0x100 | ((l >> 16) & 0xff)],
                n ^= S[0x200 | ((l >> 8) & 0xff)],
                n += S[0x300 | (l & 0xff)],
                r ^= n ^ P[++i],
                // Feistel substitution on right word
                n  = S[r >>> 24],
                n += S[0x100 | ((r >> 16) & 0xff)],
                n ^= S[0x200 | ((r >> 8) & 0xff)],
                n += S[0x300 | (r & 0xff)],
                l ^= n ^ P[++i];
            */

            //The following is an unrolled version of the above loop.
            //Iteration 0
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[1];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[2];
            //Iteration 1
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[3];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[4];
            //Iteration 2
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[5];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[6];
            //Iteration 3
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[7];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[8];
            //Iteration 4
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[9];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[10];
            //Iteration 5
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[11];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[12];
            //Iteration 6
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[13];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[14];
            //Iteration 7
            n  = S[l >>> 24];
            n += S[0x100 | ((l >> 16) & 0xff)];
            n ^= S[0x200 | ((l >> 8) & 0xff)];
            n += S[0x300 | (l & 0xff)];
            r ^= n ^ P[15];
            n  = S[r >>> 24];
            n += S[0x100 | ((r >> 16) & 0xff)];
            n ^= S[0x200 | ((r >> 8) & 0xff)];
            n += S[0x300 | (r & 0xff)];
            l ^= n ^ P[16];

            lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
            lr[off + 1] = l;
            return lr;
        }

        /**
         * @param {Array.<number>} data
         * @param {number} offp
         * @returns {{key: number, offp: number}}
         * @inner
         */
        function _streamtoword(data, offp) {
            for (var i = 0, word = 0; i < 4; ++i)
                word = (word << 8) | (data[offp] & 0xff),
                offp = (offp + 1) % data.length;
            return { key: word, offp: offp };
        }

        /**
         * @param {Array.<number>} key
         * @param {Array.<number>} P
         * @param {Array.<number>} S
         * @inner
         */
        function _key(key, P, S) {
            var offset = 0,
                lr = [0, 0],
                plen = P.length,
                slen = S.length,
                sw;
            for (var i = 0; i < plen; i++)
                sw = _streamtoword(key, offset),
                offset = sw.offp,
                P[i] = P[i] ^ sw.key;
            for (i = 0; i < plen; i += 2)
                lr = _encipher(lr, 0, P, S),
                P[i] = lr[0],
                P[i + 1] = lr[1];
            for (i = 0; i < slen; i += 2)
                lr = _encipher(lr, 0, P, S),
                S[i] = lr[0],
                S[i + 1] = lr[1];
        }

        /**
         * Expensive key schedule Blowfish.
         * @param {Array.<number>} data
         * @param {Array.<number>} key
         * @param {Array.<number>} P
         * @param {Array.<number>} S
         * @inner
         */
        function _ekskey(data, key, P, S) {
            var offp = 0,
                lr = [0, 0],
                plen = P.length,
                slen = S.length,
                sw;
            for (var i = 0; i < plen; i++)
                sw = _streamtoword(key, offp),
                offp = sw.offp,
                P[i] = P[i] ^ sw.key;
            offp = 0;
            for (i = 0; i < plen; i += 2)
                sw = _streamtoword(data, offp),
                offp = sw.offp,
                lr[0] ^= sw.key,
                sw = _streamtoword(data, offp),
                offp = sw.offp,
                lr[1] ^= sw.key,
                lr = _encipher(lr, 0, P, S),
                P[i] = lr[0],
                P[i + 1] = lr[1];
            for (i = 0; i < slen; i += 2)
                sw = _streamtoword(data, offp),
                offp = sw.offp,
                lr[0] ^= sw.key,
                sw = _streamtoword(data, offp),
                offp = sw.offp,
                lr[1] ^= sw.key,
                lr = _encipher(lr, 0, P, S),
                S[i] = lr[0],
                S[i + 1] = lr[1];
        }

        /**
         * Internaly crypts a string.
         * @param {Array.<number>} b Bytes to crypt
         * @param {Array.<number>} salt Salt bytes to use
         * @param {number} rounds Number of rounds
         * @param {function(Error, Array.<number>=)=} callback Callback receiving the error, if any, and the resulting bytes. If
         *  omitted, the operation will be performed synchronously.
         *  @param {function(number)=} progressCallback Callback called with the current progress
         * @returns {!Array.<number>|undefined} Resulting bytes if callback has been omitted, otherwise `undefined`
         * @inner
         */
        function _crypt(b, salt, rounds, callback, progressCallback) {
            var cdata = C_ORIG.slice(),
                clen = cdata.length,
                err;

            // Validate
            if (rounds < 4 || rounds > 31) {
                err = Error("Illegal number of rounds (4-31): "+rounds);
                if (callback) {
                    nextTick(callback.bind(this, err));
                    return;
                } else
                    throw err;
            }
            if (salt.length !== BCRYPT_SALT_LEN) {
                err =Error("Illegal salt length: "+salt.length+" != "+BCRYPT_SALT_LEN);
                if (callback) {
                    nextTick(callback.bind(this, err));
                    return;
                } else
                    throw err;
            }
            rounds = (1 << rounds) >>> 0;

            var P, S, i = 0, j;

            //Use typed arrays when available - huge speedup!
            if (Int32Array) {
                P = new Int32Array(P_ORIG);
                S = new Int32Array(S_ORIG);
            } else {
                P = P_ORIG.slice();
                S = S_ORIG.slice();
            }

            _ekskey(salt, b, P, S);

            /**
             * Calcualtes the next round.
             * @returns {Array.<number>|undefined} Resulting array if callback has been omitted, otherwise `undefined`
             * @inner
             */
            function next() {
                if (progressCallback)
                    progressCallback(i / rounds);
                if (i < rounds) {
                    var start = Date.now();
                    for (; i < rounds;) {
                        i = i + 1;
                        _key(b, P, S);
                        _key(salt, P, S);
                        if (Date.now() - start > MAX_EXECUTION_TIME)
                            break;
                    }
                } else {
                    for (i = 0; i < 64; i++)
                        for (j = 0; j < (clen >> 1); j++)
                            _encipher(cdata, j << 1, P, S);
                    var ret = [];
                    for (i = 0; i < clen; i++)
                        ret.push(((cdata[i] >> 24) & 0xff) >>> 0),
                        ret.push(((cdata[i] >> 16) & 0xff) >>> 0),
                        ret.push(((cdata[i] >> 8) & 0xff) >>> 0),
                        ret.push((cdata[i] & 0xff) >>> 0);
                    if (callback) {
                        callback(null, ret);
                        return;
                    } else
                        return ret;
                }
                if (callback)
                    nextTick(next);
            }

            // Async
            if (typeof callback !== 'undefined') {
                next();

                // Sync
            } else {
                var res;
                while (true)
                    if (typeof(res = next()) !== 'undefined')
                        return res || [];
            }
        }

        /**
         * Internally hashes a string.
         * @param {string} s String to hash
         * @param {?string} salt Salt to use, actually never null
         * @param {function(Error, string=)=} callback Callback receiving the error, if any, and the resulting hash. If omitted,
         *  hashing is perormed synchronously.
         *  @param {function(number)=} progressCallback Callback called with the current progress
         * @returns {string|undefined} Resulting hash if callback has been omitted, otherwise `undefined`
         * @inner
         */
        function _hash(s, salt, callback, progressCallback) {
            var err;
            if (typeof s !== 'string' || typeof salt !== 'string') {
                err = Error("Invalid string / salt: Not a string");
                if (callback) {
                    nextTick(callback.bind(this, err));
                    return;
                }
                else
                    throw err;
            }

            // Validate the salt
            var minor, offset;
            if (salt.charAt(0) !== '$' || salt.charAt(1) !== '2') {
                err = Error("Invalid salt version: "+salt.substring(0,2));
                if (callback) {
                    nextTick(callback.bind(this, err));
                    return;
                }
                else
                    throw err;
            }
            if (salt.charAt(2) === '$')
                minor = String.fromCharCode(0),
                offset = 3;
            else {
                minor = salt.charAt(2);
                if ((minor !== 'a' && minor !== 'b' && minor !== 'y') || salt.charAt(3) !== '$') {
                    err = Error("Invalid salt revision: "+salt.substring(2,4));
                    if (callback) {
                        nextTick(callback.bind(this, err));
                        return;
                    } else
                        throw err;
                }
                offset = 4;
            }

            // Extract number of rounds
            if (salt.charAt(offset + 2) > '$') {
                err = Error("Missing salt rounds");
                if (callback) {
                    nextTick(callback.bind(this, err));
                    return;
                } else
                    throw err;
            }
            var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10,
                r2 = parseInt(salt.substring(offset + 1, offset + 2), 10),
                rounds = r1 + r2,
                real_salt = salt.substring(offset + 3, offset + 25);
            s += minor >= 'a' ? "\x00" : "";

            var passwordb = stringToBytes(s),
                saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);

            /**
             * Finishes hashing.
             * @param {Array.<number>} bytes Byte array
             * @returns {string}
             * @inner
             */
            function finish(bytes) {
                var res = [];
                res.push("$2");
                if (minor >= 'a')
                    res.push(minor);
                res.push("$");
                if (rounds < 10)
                    res.push("0");
                res.push(rounds.toString());
                res.push("$");
                res.push(base64_encode(saltb, saltb.length));
                res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
                return res.join('');
            }

            // Sync
            if (typeof callback == 'undefined')
                return finish(_crypt(passwordb, saltb, rounds));

            // Async
            else {
                _crypt(passwordb, saltb, rounds, function(err, bytes) {
                    if (err)
                        callback(err, null);
                    else
                        callback(null, finish(bytes));
                }, progressCallback);
            }
        }

        /**
         * Encodes a byte array to base64 with up to len bytes of input, using the custom bcrypt alphabet.
         * @function
         * @param {!Array.<number>} b Byte array
         * @param {number} len Maximum input length
         * @returns {string}
         * @expose
         */
        bcrypt.encodeBase64 = base64_encode;

        /**
         * Decodes a base64 encoded string to up to len bytes of output, using the custom bcrypt alphabet.
         * @function
         * @param {string} s String to decode
         * @param {number} len Maximum output length
         * @returns {!Array.<number>}
         * @expose
         */
        bcrypt.decodeBase64 = base64_decode;

        return bcrypt;
    }));
    });

    /*
     Copyright (c) 2012 Nevins Bartolomeo <nevins.bartolomeo@gmail.com>
     Copyright (c) 2012 Shane Girish <shaneGirish@gmail.com>
     Copyright (c) 2013 Daniel Wirtz <dcode@dcode.io>

     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions
     are met:
     1. Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.
     2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in the
     documentation and/or other materials provided with the distribution.
     3. The name of the author may not be used to endorse or promote products
     derived from this software without specific prior written permission.

     THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
     IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
     OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
     IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
     NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
     THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    var bcryptjs = bcrypt;

    // This will be moved to frag-qora-crypto

    Epml.registerPlugin(requestPlugin);
    Epml.registerPlugin(readyPlugin);
    Epml.registerPlugin(EpmlWorkerPlugin);

    // console.log('HIIIII IN THE WORKERRRR')

    const parentEpml = new Epml({ type: 'WORKER', source: self });

    parentEpml.route('kdf', async req => {
        // console.log(req)
        const { salt, key, nonce, staticSalt, staticBcryptSalt } = req.data;
        const combinedBytes = utils.appendBuffer(salt, utils.stringtoUTF8Array(staticSalt + key + nonce));
        const sha512Hash = new Sha512().process(combinedBytes).finish().result;
        const sha512HashBase64 = bytes_to_base64(sha512Hash);
        const result = bcryptjs.hashSync(sha512HashBase64.substring(0, 72), staticBcryptSalt);
        return { key, nonce, result }
    });

    parentEpml.imReady();

})));
//# sourceMappingURL=worker.js.map
