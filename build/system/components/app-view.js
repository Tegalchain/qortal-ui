System.register(['../default-theme-f4872173.js', '../pwa-helpers-e04d8fac.js', '../typography-df547440.js', '../iron-a11y-keys-behavior-c9affbac.js', '../mwc-icon-b1620148.js', '../iron-a11y-announcer-b4b56881.js', '../FileSaver.min-be8d0938.js', '../paper-ripple-99c84c5f.js', '../mwc-icon-button-894e1099.js', '../paper-spinner-lite-1456450e.js', '../show-plugin-50f62f15.js', '../iron-overlay-behavior-914e647b.js', './wallet-profile.js', './sidenav-menu.js'], function () {
    'use strict';
    var MDCFoundation, classMap, IronResizableBehavior, store, query, property, html, css, customElement, connect, LitElement, Epml, doAddPlugin, doLogout, __extends, __assign, __decorate, Polymer, html$1, afterNextRender, dom, Debouncer, animationFrame, enqueueDebouncer, observer, BaseElement, addHasRemoveClass, supportsPassiveEventListener, addPluginRoutes;
    return {
        setters: [function (module) {
            MDCFoundation = module.M;
            classMap = module.b;
            IronResizableBehavior = module.I;
        }, function (module) {
            store = module.s;
            query = module.q;
            property = module.p;
            html = module.h;
            css = module.c;
            customElement = module.a;
            connect = module.u;
            LitElement = module.L;
        }, function (module) {
            Epml = module.k;
            doAddPlugin = module.l;
            doLogout = module.f;
        }, function (module) {
            __extends = module._;
            __assign = module.a;
            __decorate = module.b;
            Polymer = module.P;
            html$1 = module.h;
            afterNextRender = module.i;
            dom = module.d;
            Debouncer = module.D;
            animationFrame = module.j;
            enqueueDebouncer = module.k;
        }, function () {}, function (module) {
            observer = module.o;
            BaseElement = module.B;
            addHasRemoveClass = module.b;
            supportsPassiveEventListener = module.s;
        }, function () {}, function () {}, function () {}, function () {}, function (module) {
            addPluginRoutes = module.a;
        }, function () {}, function () {}, function () {}],
        execute: function () {

            // Epml.registerPlugin(EpmlContentWindow)

            let retryLoadPluginsInterval = 0;
            const loadPlugins = () => fetch('/getPlugins')
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    const plugins = response.plugins;
                    console.log(plugins);
                    const config = store.getState().config;
                    // console.log(config)
                    pluginLoader(plugins, config);
                })
                .catch(err => {
                    retryLoadPluginsInterval += 1000;
                    console.error(err);
                    console.error(`Could not load plugins. Retrying in ${retryLoadPluginsInterval / 1000} second(s)`);
                    setTimeout(loadPlugins, retryLoadPluginsInterval);
                });

            const pluginLoader = (plugins, config) => {
                const pluginContentWindows = [];
                plugins.forEach(plugin => {
                    const frame = document.createElement('iframe');
                    frame.className += 'pluginJSFrame';
                    frame.sandbox = 'allow-scripts allow-same-origin';
                    // Why not support http/https, pass the plugin as a location hash
                    // frame.src = window.location.protocol + '//' + window.location.hostname + ':' + config.user.server.plugin.port + '/src/plugins/plugin-mainjs-loader.html#' + plugin // + '/main.js'
                    frame.src = window.location.protocol + '//' + config.user.server.plugin.domain + ':' + config.user.server.plugin.port + '/frag-components/plugin-mainjs-loader.html#' + plugin + '/main.js';

                    const insertedFrame = window.document.body.appendChild(frame);

                    pluginContentWindows.push(insertedFrame.contentWindow);

                    const epmlInstance = new Epml({
                        type: 'WINDOW',
                        source: insertedFrame.contentWindow
                    });

                    addPluginRoutes(epmlInstance);
                    epmlInstance.imReady();
                    console.log('I\'m ready!');
                    console.log(`${plugin}-plugin`);
                    Epml.registerProxyInstance(`${plugin}-plugin`, epmlInstance);

                    store.dispatch(doAddPlugin(epmlInstance));
                    // Wimp.registerTarget(plugin, insertedFrame.contentWindow)
                });

                // const allPluginsEpml = new Epml(pluginContentWindows.map(cwindow => {
                //     return {
                //         type: 'WINDOW',
                //         source: cwindow
                //     }
                // }))

                // addPluginRoutes(allPluginsEpml)
                // allPluginsEpml.imReady()

                // store.dispatch(doAddPlugin(allPluginsEpml))

                // Wimp.registerTarget('all-plugin-loaders', plugins)

                // this.wimps.pluginLoader = parentWimpAPI('all-plugin-loaders')
                // Can be called now as the plugins have been loaded, and show-plugin is not being shown yet so it does not matter
                // Wimp.init()
            };

            /**
             * @license
             * Copyright 2016 Google Inc.
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            var cssClasses = {
                ANIMATE: 'mdc-drawer--animate',
                CLOSING: 'mdc-drawer--closing',
                DISMISSIBLE: 'mdc-drawer--dismissible',
                MODAL: 'mdc-drawer--modal',
                OPEN: 'mdc-drawer--open',
                OPENING: 'mdc-drawer--opening',
                ROOT: 'mdc-drawer',
            };
            var strings = {
                APP_CONTENT_SELECTOR: '.mdc-drawer-app-content',
                CLOSE_EVENT: 'MDCDrawer:closed',
                OPEN_EVENT: 'MDCDrawer:opened',
                SCRIM_SELECTOR: '.mdc-drawer-scrim',
            };

            /**
             * @license
             * Copyright 2018 Google Inc.
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            var MDCDismissibleDrawerFoundation = /** @class */ (function (_super) {
                __extends(MDCDismissibleDrawerFoundation, _super);
                function MDCDismissibleDrawerFoundation(adapter) {
                    var _this = _super.call(this, __assign({}, MDCDismissibleDrawerFoundation.defaultAdapter, adapter)) || this;
                    _this.animationFrame_ = 0;
                    _this.animationTimer_ = 0;
                    return _this;
                }
                Object.defineProperty(MDCDismissibleDrawerFoundation, "strings", {
                    get: function () {
                        return strings;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MDCDismissibleDrawerFoundation, "cssClasses", {
                    get: function () {
                        return cssClasses;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MDCDismissibleDrawerFoundation, "defaultAdapter", {
                    get: function () {
                        // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                        return {
                            addClass: function () { return undefined; },
                            removeClass: function () { return undefined; },
                            hasClass: function () { return false; },
                            elementHasClass: function () { return false; },
                            notifyClose: function () { return undefined; },
                            notifyOpen: function () { return undefined; },
                            saveFocus: function () { return undefined; },
                            restoreFocus: function () { return undefined; },
                            focusActiveNavigationItem: function () { return undefined; },
                            trapFocus: function () { return undefined; },
                            releaseFocus: function () { return undefined; },
                        };
                        // tslint:enable:object-literal-sort-keys
                    },
                    enumerable: true,
                    configurable: true
                });
                MDCDismissibleDrawerFoundation.prototype.destroy = function () {
                    if (this.animationFrame_) {
                        cancelAnimationFrame(this.animationFrame_);
                    }
                    if (this.animationTimer_) {
                        clearTimeout(this.animationTimer_);
                    }
                };
                /**
                 * Opens the drawer from the closed state.
                 */
                MDCDismissibleDrawerFoundation.prototype.open = function () {
                    var _this = this;
                    if (this.isOpen() || this.isOpening() || this.isClosing()) {
                        return;
                    }
                    this.adapter_.addClass(cssClasses.OPEN);
                    this.adapter_.addClass(cssClasses.ANIMATE);
                    // Wait a frame once display is no longer "none", to establish basis for animation
                    this.runNextAnimationFrame_(function () {
                        _this.adapter_.addClass(cssClasses.OPENING);
                    });
                    this.adapter_.saveFocus();
                };
                /**
                 * Closes the drawer from the open state.
                 */
                MDCDismissibleDrawerFoundation.prototype.close = function () {
                    if (!this.isOpen() || this.isOpening() || this.isClosing()) {
                        return;
                    }
                    this.adapter_.addClass(cssClasses.CLOSING);
                };
                /**
                 * Returns true if the drawer is in the open position.
                 * @return true if drawer is in open state.
                 */
                MDCDismissibleDrawerFoundation.prototype.isOpen = function () {
                    return this.adapter_.hasClass(cssClasses.OPEN);
                };
                /**
                 * Returns true if the drawer is animating open.
                 * @return true if drawer is animating open.
                 */
                MDCDismissibleDrawerFoundation.prototype.isOpening = function () {
                    return this.adapter_.hasClass(cssClasses.OPENING) || this.adapter_.hasClass(cssClasses.ANIMATE);
                };
                /**
                 * Returns true if the drawer is animating closed.
                 * @return true if drawer is animating closed.
                 */
                MDCDismissibleDrawerFoundation.prototype.isClosing = function () {
                    return this.adapter_.hasClass(cssClasses.CLOSING);
                };
                /**
                 * Keydown handler to close drawer when key is escape.
                 */
                MDCDismissibleDrawerFoundation.prototype.handleKeydown = function (evt) {
                    var keyCode = evt.keyCode, key = evt.key;
                    var isEscape = key === 'Escape' || keyCode === 27;
                    if (isEscape) {
                        this.close();
                    }
                };
                /**
                 * Handles the `transitionend` event when the drawer finishes opening/closing.
                 */
                MDCDismissibleDrawerFoundation.prototype.handleTransitionEnd = function (evt) {
                    var OPENING = cssClasses.OPENING, CLOSING = cssClasses.CLOSING, OPEN = cssClasses.OPEN, ANIMATE = cssClasses.ANIMATE, ROOT = cssClasses.ROOT;
                    // In Edge, transitionend on ripple pseudo-elements yields a target without classList, so check for Element first.
                    var isRootElement = this.isElement_(evt.target) && this.adapter_.elementHasClass(evt.target, ROOT);
                    if (!isRootElement) {
                        return;
                    }
                    if (this.isClosing()) {
                        this.adapter_.removeClass(OPEN);
                        this.closed_();
                        this.adapter_.restoreFocus();
                        this.adapter_.notifyClose();
                    }
                    else {
                        this.adapter_.focusActiveNavigationItem();
                        this.opened_();
                        this.adapter_.notifyOpen();
                    }
                    this.adapter_.removeClass(ANIMATE);
                    this.adapter_.removeClass(OPENING);
                    this.adapter_.removeClass(CLOSING);
                };
                /**
                 * Extension point for when drawer finishes open animation.
                 */
                MDCDismissibleDrawerFoundation.prototype.opened_ = function () { }; // tslint:disable-line:no-empty
                /**
                 * Extension point for when drawer finishes close animation.
                 */
                MDCDismissibleDrawerFoundation.prototype.closed_ = function () { }; // tslint:disable-line:no-empty
                /**
                 * Runs the given logic on the next animation frame, using setTimeout to factor in Firefox reflow behavior.
                 */
                MDCDismissibleDrawerFoundation.prototype.runNextAnimationFrame_ = function (callback) {
                    var _this = this;
                    cancelAnimationFrame(this.animationFrame_);
                    this.animationFrame_ = requestAnimationFrame(function () {
                        _this.animationFrame_ = 0;
                        clearTimeout(_this.animationTimer_);
                        _this.animationTimer_ = setTimeout(callback, 0);
                    });
                };
                MDCDismissibleDrawerFoundation.prototype.isElement_ = function (element) {
                    // In Edge, transitionend on ripple pseudo-elements yields a target without classList.
                    return Boolean(element.classList);
                };
                return MDCDismissibleDrawerFoundation;
            }(MDCFoundation));

            /**
             * @license
             * Copyright 2018 Google Inc.
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            /* istanbul ignore next: subclass is not a branch statement */
            var MDCModalDrawerFoundation = /** @class */ (function (_super) {
                __extends(MDCModalDrawerFoundation, _super);
                function MDCModalDrawerFoundation() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /**
                 * Handles click event on scrim.
                 */
                MDCModalDrawerFoundation.prototype.handleScrimClick = function () {
                    this.close();
                };
                /**
                 * Called when drawer finishes open animation.
                 */
                MDCModalDrawerFoundation.prototype.opened_ = function () {
                    this.adapter_.trapFocus();
                };
                /**
                 * Called when drawer finishes close animation.
                 */
                MDCModalDrawerFoundation.prototype.closed_ = function () {
                    this.adapter_.releaseFocus();
                };
                return MDCModalDrawerFoundation;
            }(MDCDismissibleDrawerFoundation));

            /**
            @license
            Copyright 2018 Google Inc. All Rights Reserved.

            Licensed under the Apache License, Version 2.0 (the "License");
            you may not use this file except in compliance with the License.
            You may obtain a copy of the License at

                http://www.apache.org/licenses/LICENSE-2.0

            Unless required by applicable law or agreed to in writing, software
            distributed under the License is distributed on an "AS IS" BASIS,
            WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            See the License for the specific language governing permissions and
            limitations under the License.
            */
            const blockingElements = document.$blockingElements;
            class DrawerBase extends BaseElement {
                constructor() {
                    super(...arguments);
                    this._previousFocus = null;
                    this.open = false;
                    this.hasHeader = false;
                    this.type = '';
                }
                get mdcFoundationClass() {
                    return this.type === 'modal' ? MDCModalDrawerFoundation :
                        MDCDismissibleDrawerFoundation;
                }
                createAdapter() {
                    return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { elementHasClass: (element, className) => element.classList.contains(className), saveFocus: () => {
                            // Note, casting to avoid cumbersome runtime check.
                            this._previousFocus =
                                this.getRootNode().activeElement;
                        }, restoreFocus: () => {
                            const previousFocus = this._previousFocus && this._previousFocus.focus;
                            if (previousFocus) {
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                this._previousFocus.focus();
                            }
                        }, notifyClose: () => {
                            this.open = false;
                            this.dispatchEvent(new Event(strings.CLOSE_EVENT, { bubbles: true, cancelable: true }));
                        }, notifyOpen: () => {
                            this.open = true;
                            this.dispatchEvent(new Event(strings.OPEN_EVENT, { bubbles: true, cancelable: true }));
                        }, focusActiveNavigationItem: () => { }, trapFocus: () => {
                            blockingElements.push(this);
                            this.appContent.inert = true;
                        }, releaseFocus: () => {
                            blockingElements.remove(this);
                            this.appContent.inert = false;
                        } });
                }
                _handleScrimClick() {
                    if (this.mdcFoundation instanceof MDCModalDrawerFoundation) {
                        this.mdcFoundation.handleScrimClick();
                    }
                }
                render() {
                    const dismissible = this.type === 'dismissible' || this.type === 'modal';
                    const modal = this.type === 'modal';
                    const header = this.hasHeader ? html `
      <div class="mdc-drawer__header">
        <h3 class="mdc-drawer__title"><slot name="title"></slot></h3>
        <h6 class="mdc-drawer__subtitle"><slot name="subtitle"></slot></h6>
        <slot name="header"></slot>
      </div>
      ` :
                        '';
                    return html `
      <aside class="mdc-drawer
          ${classMap({
            'mdc-drawer--dismissible': dismissible,
            'mdc-drawer--modal': modal
        })}">
        ${header}
        <div class="mdc-drawer__content"><slot></slot></div>
      </aside>
      ${modal ? html `<div class="mdc-drawer-scrim"
                          @click="${this._handleScrimClick}"></div>` :
            ''}
      <div class="mdc-drawer-app-content">
        <slot name="appContent"></slot>
      </div>
      `;
                }
                // note, we avoid calling `super.firstUpdated()` to control when
                // `createFoundation()` is called.
                firstUpdated() {
                    this.mdcRoot.addEventListener('keydown', (e) => this.mdcFoundation.handleKeydown(e));
                    this.mdcRoot.addEventListener('transitionend', (e) => this.mdcFoundation.handleTransitionEnd(e));
                }
                updated(changedProperties) {
                    if (changedProperties.has('type')) {
                        this.createFoundation();
                    }
                }
            }
            __decorate([
                query('.mdc-drawer')
            ], DrawerBase.prototype, "mdcRoot", void 0);
            __decorate([
                query('.mdc-drawer-app-content')
            ], DrawerBase.prototype, "appContent", void 0);
            __decorate([
                observer(function (value) {
                    if (this.type === '') {
                        return;
                    }
                    if (value) {
                        this.mdcFoundation.open();
                    }
                    else {
                        this.mdcFoundation.close();
                    }
                }),
                property({ type: Boolean, reflect: true })
            ], DrawerBase.prototype, "open", void 0);
            __decorate([
                property({ type: Boolean })
            ], DrawerBase.prototype, "hasHeader", void 0);
            __decorate([
                property({ reflect: true })
            ], DrawerBase.prototype, "type", void 0);

            /**
            @license
            Copyright 2018 Google Inc. All Rights Reserved.

            Licensed under the Apache License, Version 2.0 (the "License");
            you may not use this file except in compliance with the License.
            You may obtain a copy of the License at

                http://www.apache.org/licenses/LICENSE-2.0

            Unless required by applicable law or agreed to in writing, software
            distributed under the License is distributed on an "AS IS" BASIS,
            WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            See the License for the specific language governing permissions and
            limitations under the License.
            */
            const style = css `.mdc-drawer{border-color:rgba(0,0,0,.12);background-color:#fff;border-radius:0 0 0 0;z-index:6;width:256px;display:flex;flex-direction:column;flex-shrink:0;box-sizing:border-box;height:100%;border-right-width:1px;border-right-style:solid;overflow:hidden;transition-property:transform;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.mdc-drawer .mdc-drawer__title{color:rgba(0,0,0,.87)}.mdc-drawer .mdc-list-group__subheader{color:rgba(0,0,0,.6)}.mdc-drawer .mdc-drawer__subtitle{color:rgba(0,0,0,.6)}.mdc-drawer .mdc-list-item__graphic{color:rgba(0,0,0,.6)}.mdc-drawer .mdc-list-item{color:rgba(0,0,0,.87)}.mdc-drawer .mdc-list-item--activated .mdc-list-item__graphic{color:#6200ee}.mdc-drawer .mdc-list-item--activated{color:rgba(98,0,238,.87)}[dir=rtl] .mdc-drawer,.mdc-drawer[dir=rtl]{border-radius:0 0 0 0}.mdc-drawer .mdc-list-item{border-radius:4px}.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content{margin-left:256px;margin-right:0}[dir=rtl] .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content,.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content[dir=rtl]{margin-left:0;margin-right:256px}[dir=rtl] .mdc-drawer,.mdc-drawer[dir=rtl]{border-right-width:0;border-left-width:1px;border-right-style:none;border-left-style:solid}.mdc-drawer .mdc-list-item{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.375rem;font-weight:500;letter-spacing:.0071428571em;text-decoration:inherit;text-transform:inherit;height:calc(48px - 2 * 4px);margin:8px 8px;padding:0 8px}.mdc-drawer .mdc-list-item:nth-child(1){margin-top:2px}.mdc-drawer .mdc-list-item:nth-last-child(1){margin-bottom:0}.mdc-drawer .mdc-list-group__subheader{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.25rem;font-weight:400;letter-spacing:.0178571429em;text-decoration:inherit;text-transform:inherit;display:block;margin-top:0;line-height:normal;margin:0;padding:0 16px}.mdc-drawer .mdc-list-group__subheader::before{display:inline-block;width:0;height:24px;content:"";vertical-align:0}.mdc-drawer .mdc-list-divider{margin:3px 0 4px}.mdc-drawer .mdc-list-item__text,.mdc-drawer .mdc-list-item__graphic{pointer-events:none}.mdc-drawer--animate{transform:translateX(-100%)}[dir=rtl] .mdc-drawer--animate,.mdc-drawer--animate[dir=rtl]{transform:translateX(100%)}.mdc-drawer--opening{transform:translateX(0);transition-duration:250ms}[dir=rtl] .mdc-drawer--opening,.mdc-drawer--opening[dir=rtl]{transform:translateX(0)}.mdc-drawer--closing{transform:translateX(-100%);transition-duration:200ms}[dir=rtl] .mdc-drawer--closing,.mdc-drawer--closing[dir=rtl]{transform:translateX(100%)}.mdc-drawer__header{flex-shrink:0;box-sizing:border-box;min-height:64px;padding:0 16px 4px}.mdc-drawer__title{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1.25rem;line-height:2rem;font-weight:500;letter-spacing:.0125em;text-decoration:inherit;text-transform:inherit;display:block;margin-top:0;line-height:normal;margin-bottom:-20px}.mdc-drawer__title::before{display:inline-block;width:0;height:36px;content:"";vertical-align:0}.mdc-drawer__title::after{display:inline-block;width:0;height:20px;content:"";vertical-align:-20px}.mdc-drawer__subtitle{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:.875rem;line-height:1.25rem;font-weight:400;letter-spacing:.0178571429em;text-decoration:inherit;text-transform:inherit;display:block;margin-top:0;line-height:normal;margin-bottom:0}.mdc-drawer__subtitle::before{display:inline-block;width:0;height:20px;content:"";vertical-align:0}.mdc-drawer__content{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}.mdc-drawer--dismissible{left:0;right:initial;display:none;position:absolute}[dir=rtl] .mdc-drawer--dismissible,.mdc-drawer--dismissible[dir=rtl]{left:initial;right:0}.mdc-drawer--dismissible.mdc-drawer--open{display:flex}.mdc-drawer-app-content{margin-left:0;margin-right:0;position:relative}[dir=rtl] .mdc-drawer-app-content,.mdc-drawer-app-content[dir=rtl]{margin-left:0;margin-right:0}.mdc-drawer--modal{box-shadow:0px 8px 10px -5px rgba(0, 0, 0, 0.2),0px 16px 24px 2px rgba(0, 0, 0, 0.14),0px 6px 30px 5px rgba(0,0,0,.12);left:0;right:initial;display:none;position:fixed}.mdc-drawer--modal+.mdc-drawer-scrim{background-color:rgba(0,0,0,.32)}[dir=rtl] .mdc-drawer--modal,.mdc-drawer--modal[dir=rtl]{left:initial;right:0}.mdc-drawer--modal.mdc-drawer--open{display:flex}.mdc-drawer-scrim{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:5;transition-property:opacity;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.mdc-drawer--open+.mdc-drawer-scrim{display:block}.mdc-drawer--animate+.mdc-drawer-scrim{opacity:0}.mdc-drawer--opening+.mdc-drawer-scrim{transition-duration:250ms;opacity:1}.mdc-drawer--closing+.mdc-drawer-scrim{transition-duration:200ms;opacity:0}.mdc-drawer-app-content{overflow:auto;flex:1}:host{display:flex;height:100%}`;

            let Drawer = class Drawer extends DrawerBase {
            };
            Drawer.styles = style;
            Drawer = __decorate([
                customElement('mwc-drawer')
            ], Drawer);

            /**
             * @license
             * Copyright 2018 Google Inc.
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            var cssClasses$1 = {
                FIXED_CLASS: 'mdc-top-app-bar--fixed',
                FIXED_SCROLLED_CLASS: 'mdc-top-app-bar--fixed-scrolled',
                SHORT_CLASS: 'mdc-top-app-bar--short',
                SHORT_COLLAPSED_CLASS: 'mdc-top-app-bar--short-collapsed',
                SHORT_HAS_ACTION_ITEM_CLASS: 'mdc-top-app-bar--short-has-action-item',
            };
            var numbers = {
                DEBOUNCE_THROTTLE_RESIZE_TIME_MS: 100,
                MAX_TOP_APP_BAR_HEIGHT: 128,
            };
            var strings$1 = {
                ACTION_ITEM_SELECTOR: '.mdc-top-app-bar__action-item',
                NAVIGATION_EVENT: 'MDCTopAppBar:nav',
                NAVIGATION_ICON_SELECTOR: '.mdc-top-app-bar__navigation-icon',
                ROOT_SELECTOR: '.mdc-top-app-bar',
                TITLE_SELECTOR: '.mdc-top-app-bar__title',
            };

            /**
             * @license
             * Copyright 2018 Google Inc.
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            var MDCTopAppBarBaseFoundation = /** @class */ (function (_super) {
                __extends(MDCTopAppBarBaseFoundation, _super);
                /* istanbul ignore next: optional argument is not a branch statement */
                function MDCTopAppBarBaseFoundation(adapter) {
                    return _super.call(this, __assign({}, MDCTopAppBarBaseFoundation.defaultAdapter, adapter)) || this;
                }
                Object.defineProperty(MDCTopAppBarBaseFoundation, "strings", {
                    get: function () {
                        return strings$1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MDCTopAppBarBaseFoundation, "cssClasses", {
                    get: function () {
                        return cssClasses$1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MDCTopAppBarBaseFoundation, "numbers", {
                    get: function () {
                        return numbers;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MDCTopAppBarBaseFoundation, "defaultAdapter", {
                    /**
                     * See {@link MDCTopAppBarAdapter} for typing information on parameters and return types.
                     */
                    get: function () {
                        // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                        return {
                            addClass: function () { return undefined; },
                            removeClass: function () { return undefined; },
                            hasClass: function () { return false; },
                            setStyle: function () { return undefined; },
                            getTopAppBarHeight: function () { return 0; },
                            notifyNavigationIconClicked: function () { return undefined; },
                            getViewportScrollY: function () { return 0; },
                            getTotalActionItems: function () { return 0; },
                        };
                        // tslint:enable:object-literal-sort-keys
                    },
                    enumerable: true,
                    configurable: true
                });
                /** Other variants of TopAppBar foundation overrides this method */
                MDCTopAppBarBaseFoundation.prototype.handleTargetScroll = function () { }; // tslint:disable-line:no-empty
                /** Other variants of TopAppBar foundation overrides this method */
                MDCTopAppBarBaseFoundation.prototype.handleWindowResize = function () { }; // tslint:disable-line:no-empty
                MDCTopAppBarBaseFoundation.prototype.handleNavigationClick = function () {
                    this.adapter_.notifyNavigationIconClicked();
                };
                return MDCTopAppBarBaseFoundation;
            }(MDCFoundation));

            /**
             * @license
             * Copyright 2018 Google Inc.
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            var INITIAL_VALUE = 0;
            var MDCTopAppBarFoundation = /** @class */ (function (_super) {
                __extends(MDCTopAppBarFoundation, _super);
                /* istanbul ignore next: optional argument is not a branch statement */
                function MDCTopAppBarFoundation(adapter) {
                    var _this = _super.call(this, adapter) || this;
                    /**
                     * Indicates if the top app bar was docked in the previous scroll handler iteration.
                     */
                    _this.wasDocked_ = true;
                    /**
                     * Indicates if the top app bar is docked in the fully shown position.
                     */
                    _this.isDockedShowing_ = true;
                    /**
                     * Variable for current scroll position of the top app bar
                     */
                    _this.currentAppBarOffsetTop_ = 0;
                    /**
                     * Used to prevent the top app bar from being scrolled out of view during resize events
                     */
                    _this.isCurrentlyBeingResized_ = false;
                    /**
                     * The timeout that's used to throttle the resize events
                     */
                    _this.resizeThrottleId_ = INITIAL_VALUE;
                    /**
                     * The timeout that's used to debounce toggling the isCurrentlyBeingResized_ variable after a resize
                     */
                    _this.resizeDebounceId_ = INITIAL_VALUE;
                    _this.lastScrollPosition_ = _this.adapter_.getViewportScrollY();
                    _this.topAppBarHeight_ = _this.adapter_.getTopAppBarHeight();
                    return _this;
                }
                MDCTopAppBarFoundation.prototype.destroy = function () {
                    _super.prototype.destroy.call(this);
                    this.adapter_.setStyle('top', '');
                };
                /**
                 * Scroll handler for the default scroll behavior of the top app bar.
                 * @override
                 */
                MDCTopAppBarFoundation.prototype.handleTargetScroll = function () {
                    var currentScrollPosition = Math.max(this.adapter_.getViewportScrollY(), 0);
                    var diff = currentScrollPosition - this.lastScrollPosition_;
                    this.lastScrollPosition_ = currentScrollPosition;
                    // If the window is being resized the lastScrollPosition_ needs to be updated but the
                    // current scroll of the top app bar should stay in the same position.
                    if (!this.isCurrentlyBeingResized_) {
                        this.currentAppBarOffsetTop_ -= diff;
                        if (this.currentAppBarOffsetTop_ > 0) {
                            this.currentAppBarOffsetTop_ = 0;
                        }
                        else if (Math.abs(this.currentAppBarOffsetTop_) > this.topAppBarHeight_) {
                            this.currentAppBarOffsetTop_ = -this.topAppBarHeight_;
                        }
                        this.moveTopAppBar_();
                    }
                };
                /**
                 * Top app bar resize handler that throttle/debounce functions that execute updates.
                 * @override
                 */
                MDCTopAppBarFoundation.prototype.handleWindowResize = function () {
                    var _this = this;
                    // Throttle resize events 10 p/s
                    if (!this.resizeThrottleId_) {
                        this.resizeThrottleId_ = setTimeout(function () {
                            _this.resizeThrottleId_ = INITIAL_VALUE;
                            _this.throttledResizeHandler_();
                        }, numbers.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
                    }
                    this.isCurrentlyBeingResized_ = true;
                    if (this.resizeDebounceId_) {
                        clearTimeout(this.resizeDebounceId_);
                    }
                    this.resizeDebounceId_ = setTimeout(function () {
                        _this.handleTargetScroll();
                        _this.isCurrentlyBeingResized_ = false;
                        _this.resizeDebounceId_ = INITIAL_VALUE;
                    }, numbers.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
                };
                /**
                 * Function to determine if the DOM needs to update.
                 */
                MDCTopAppBarFoundation.prototype.checkForUpdate_ = function () {
                    var offscreenBoundaryTop = -this.topAppBarHeight_;
                    var hasAnyPixelsOffscreen = this.currentAppBarOffsetTop_ < 0;
                    var hasAnyPixelsOnscreen = this.currentAppBarOffsetTop_ > offscreenBoundaryTop;
                    var partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;
                    // If it's partially showing, it can't be docked.
                    if (partiallyShowing) {
                        this.wasDocked_ = false;
                    }
                    else {
                        // Not previously docked and not partially showing, it's now docked.
                        if (!this.wasDocked_) {
                            this.wasDocked_ = true;
                            return true;
                        }
                        else if (this.isDockedShowing_ !== hasAnyPixelsOnscreen) {
                            this.isDockedShowing_ = hasAnyPixelsOnscreen;
                            return true;
                        }
                    }
                    return partiallyShowing;
                };
                /**
                 * Function to move the top app bar if needed.
                 */
                MDCTopAppBarFoundation.prototype.moveTopAppBar_ = function () {
                    if (this.checkForUpdate_()) {
                        // Once the top app bar is fully hidden we use the max potential top app bar height as our offset
                        // so the top app bar doesn't show if the window resizes and the new height > the old height.
                        var offset = this.currentAppBarOffsetTop_;
                        if (Math.abs(offset) >= this.topAppBarHeight_) {
                            offset = -numbers.MAX_TOP_APP_BAR_HEIGHT;
                        }
                        this.adapter_.setStyle('top', offset + 'px');
                    }
                };
                /**
                 * Throttled function that updates the top app bar scrolled values if the
                 * top app bar height changes.
                 */
                MDCTopAppBarFoundation.prototype.throttledResizeHandler_ = function () {
                    var currentHeight = this.adapter_.getTopAppBarHeight();
                    if (this.topAppBarHeight_ !== currentHeight) {
                        this.wasDocked_ = false;
                        // Since the top app bar has a different height depending on the screen width, this
                        // will ensure that the top app bar remains in the correct location if
                        // completely hidden and a resize makes the top app bar a different height.
                        this.currentAppBarOffsetTop_ -= this.topAppBarHeight_ - currentHeight;
                        this.topAppBarHeight_ = currentHeight;
                    }
                    this.handleTargetScroll();
                };
                return MDCTopAppBarFoundation;
            }(MDCTopAppBarBaseFoundation));

            const passiveEventOptionsIfSupported = supportsPassiveEventListener ? { passive: true } : undefined;
            class TopAppBarBaseBase extends BaseElement {
                constructor() {
                    super(...arguments);
                    this.mdcFoundationClass = MDCTopAppBarBaseFoundation;
                    this.centerTitle = false;
                    this.handleTargetScroll = () => {
                        this.mdcFoundation.handleTargetScroll();
                    };
                    this.handleNavigationClick = () => {
                        this.mdcFoundation.handleNavigationClick();
                    };
                }
                get scrollTarget() {
                    return this._scrollTarget || window;
                }
                set scrollTarget(value) {
                    const old = this.scrollTarget;
                    this._scrollTarget = value;
                    this.updateRootPosition();
                    this.requestUpdate('scrollTarget', old);
                }
                updateRootPosition() {
                    if (this.mdcRoot) {
                        const windowScroller = this.scrollTarget === window;
                        // we add support for top-app-bar's tied to an element scroller.
                        this.mdcRoot.style.position = windowScroller ? '' : 'absolute';
                    }
                }
                render() {
                    // clang-format off
                    let title = html `<span class="mdc-top-app-bar__title"><slot name="title"></slot></span>`;
                    if (this.centerTitle) {
                        title = html `<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-center">${title}</section>`;
                    }
                    // clang-format on
                    return html `
      <header class="mdc-top-app-bar ${classMap(this.barClasses())}">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start" id="navigation">
          <slot name="navigationIcon"
            @click=${this.handleNavigationClick}></slot>
          ${this.centerTitle ? null : title}
        </section>
        ${this.centerTitle ? title : null}
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" id="actions" role="toolbar">
          <slot name="actionItems"></slot>
        </section>
      </div>
    </header>
    <div class="${classMap(this.contentClasses())}">
      <slot></slot>
    </div>
    `;
                }
                createAdapter() {
                    return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setStyle: (property, value) => this.mdcRoot.style.setProperty(property, value), getTopAppBarHeight: () => this.mdcRoot.clientHeight, notifyNavigationIconClicked: () => {
                            this.dispatchEvent(new Event(strings$1.NAVIGATION_EVENT, { bubbles: true, cancelable: true }));
                        }, getViewportScrollY: () => this.scrollTarget instanceof Window ?
                            this.scrollTarget.pageYOffset :
                            this.scrollTarget.scrollTop, getTotalActionItems: () => this._actionItemsSlot
                            .assignedNodes({ flatten: true })
                            .length });
                }
                registerListeners() {
                    this.scrollTarget.addEventListener('scroll', this.handleTargetScroll, passiveEventOptionsIfSupported);
                }
                unregisterListeners() {
                    this.scrollTarget.removeEventListener('scroll', this.handleTargetScroll);
                }
                firstUpdated() {
                    super.firstUpdated();
                    this.updateRootPosition();
                    this.registerListeners();
                }
                disconnectedCallback() {
                    super.disconnectedCallback();
                    this.unregisterListeners();
                }
            }
            __decorate([
                query('.mdc-top-app-bar')
            ], TopAppBarBaseBase.prototype, "mdcRoot", void 0);
            __decorate([
                query('slot[name="actionItems"]')
            ], TopAppBarBaseBase.prototype, "_actionItemsSlot", void 0);
            __decorate([
                property({ type: Boolean })
            ], TopAppBarBaseBase.prototype, "centerTitle", void 0);
            __decorate([
                property()
            ], TopAppBarBaseBase.prototype, "scrollTarget", null);

            class TopAppBarBase extends TopAppBarBaseBase {
                constructor() {
                    super(...arguments);
                    this.mdcFoundationClass = MDCTopAppBarFoundation;
                    this.prominent = false;
                    this.dense = false;
                    this.handleResize = () => {
                        this.mdcFoundation.handleWindowResize();
                    };
                }
                barClasses() {
                    return {
                        'mdc-top-app-bar--dense': this.dense,
                        'mdc-top-app-bar--prominent': this.prominent,
                        'center-title': this.centerTitle,
                    };
                }
                contentClasses() {
                    return {
                        'mdc-top-app-bar--fixed-adjust': !this.dense && !this.prominent,
                        'mdc-top-app-bar--dense-fixed-adjust': this.dense && !this.prominent,
                        'mdc-top-app-bar--prominent-fixed-adjust': !this.dense && this.prominent,
                        'mdc-top-app-bar--dense-prominent-fixed-adjust': this.dense && this.prominent,
                    };
                }
                registerListeners() {
                    super.registerListeners();
                    window.addEventListener('resize', this.handleResize, passiveEventOptionsIfSupported);
                }
                unregisterListeners() {
                    super.unregisterListeners();
                    window.removeEventListener('resize', this.handleResize);
                }
            }
            __decorate([
                property({ type: Boolean, reflect: true })
            ], TopAppBarBase.prototype, "prominent", void 0);
            __decorate([
                property({ type: Boolean, reflect: true })
            ], TopAppBarBase.prototype, "dense", void 0);

            /**
            @license
            Copyright 2018 Google Inc. All Rights Reserved.

            Licensed under the Apache License, Version 2.0 (the "License");
            you may not use this file except in compliance with the License.
            You may obtain a copy of the License at

                http://www.apache.org/licenses/LICENSE-2.0

            Unless required by applicable law or agreed to in writing, software
            distributed under the License is distributed on an "AS IS" BASIS,
            WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            See the License for the specific language governing permissions and
            limitations under the License.
            */
            const style$1 = css `.mdc-top-app-bar{background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee);color:#fff;display:flex;position:fixed;flex-direction:column;justify-content:space-between;box-sizing:border-box;width:100%;z-index:4}.mdc-top-app-bar .mdc-top-app-bar__action-item,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon{color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item::before,.mdc-top-app-bar .mdc-top-app-bar__action-item::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after{background-color:#fff;background-color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item:hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:hover::before{opacity:.08}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):focus::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.24}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded)::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):active::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.24}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.24}.mdc-top-app-bar__row{display:flex;position:relative;box-sizing:border-box;width:100%;height:64px}.mdc-top-app-bar__section{display:inline-flex;flex:1 1 auto;align-items:center;min-width:0;padding:8px 12px;z-index:1}.mdc-top-app-bar__section--align-start{justify-content:flex-start;order:-1}.mdc-top-app-bar__section--align-end{justify-content:flex-end;order:1}.mdc-top-app-bar__title{font-family:Roboto, sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-size:1.25rem;line-height:2rem;font-weight:500;letter-spacing:.0125em;text-decoration:inherit;text-transform:inherit;padding-left:20px;padding-right:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;z-index:1}[dir=rtl] .mdc-top-app-bar__title,.mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--short-collapsed{border-radius:0 0 24px 0}[dir=rtl] .mdc-top-app-bar--short-collapsed,.mdc-top-app-bar--short-collapsed[dir=rtl]{border-radius:0 0 0 24px}.mdc-top-app-bar--short{top:0;right:auto;left:0;width:100%;transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-top-app-bar--short,.mdc-top-app-bar--short[dir=rtl]{right:0;left:auto}.mdc-top-app-bar--short .mdc-top-app-bar__row{height:56px}.mdc-top-app-bar--short .mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short .mdc-top-app-bar__title{transition:opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);opacity:1}.mdc-top-app-bar--short-collapsed{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);width:56px;transition:width 300ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__title{display:none}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__action-item{transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item{width:112px}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--dense .mdc-top-app-bar__row{height:48px}.mdc-top-app-bar--dense .mdc-top-app-bar__section{padding:0 4px}.mdc-top-app-bar--dense .mdc-top-app-bar__title{padding-left:12px;padding-right:0}[dir=rtl] .mdc-top-app-bar--dense .mdc-top-app-bar__title,.mdc-top-app-bar--dense .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:12px}.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:128px}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{align-self:flex-end;padding-bottom:2px}.mdc-top-app-bar--prominent .mdc-top-app-bar__action-item,.mdc-top-app-bar--prominent .mdc-top-app-bar__navigation-icon{align-self:flex-start}.mdc-top-app-bar--fixed{transition:box-shadow 200ms linear}.mdc-top-app-bar--fixed-scrolled{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);transition:box-shadow 200ms linear}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:96px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section{padding:0 12px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-left:20px;padding-right:0;padding-bottom:9px}[dir=rtl] .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title,.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--fixed-adjust{padding-top:64px}.mdc-top-app-bar--dense-fixed-adjust{padding-top:48px}.mdc-top-app-bar--short-fixed-adjust{padding-top:56px}.mdc-top-app-bar--prominent-fixed-adjust{padding-top:128px}.mdc-top-app-bar--dense-prominent-fixed-adjust{padding-top:96px}@media(max-width: 599px){.mdc-top-app-bar__row{height:56px}.mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short{transition:width 200ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed{transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-bottom:6px}.mdc-top-app-bar--fixed-adjust{padding-top:56px}}:host{display:block}.mdc-top-app-bar{color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar--prominent #navigation ::slotted(*),.mdc-top-app-bar--prominent #actions ::slotted(*){align-self:flex-start}#navigation ::slotted(*),#actions ::slotted(*){--mdc-icon-button-ripple-opacity: 0.24}.mdc-top-app-bar--short-collapsed #actions ::slotted(*){transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar__section--align-center{justify-content:center}.mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.center-title .mdc-top-app-bar__section--align-start,.center-title .mdc-top-app-bar__section--align-end{flex-basis:0}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.mdc-top-app-bar--fixed-scrolled{box-shadow:var(--mdc-top-app-bar-fixed-box-shadow, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12))}`;

            let TopAppBar = class TopAppBar extends TopAppBarBase {
            };
            TopAppBar.styles = style$1;
            TopAppBar = __decorate([
                customElement('mwc-top-app-bar')
            ], TopAppBar);

            /**
            @license
            Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */

            const _scrollEffects = {};

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

            /**
            app-drawer is a navigation drawer that can slide in from the left or right.

            Example:

            Align the drawer at the start, which is left in LTR layouts (default):

            ```html
            <app-drawer opened></app-drawer>
            ```

            Align the drawer at the end:

            ```html
            <app-drawer align="end" opened></app-drawer>
            ```

            To make the contents of the drawer scrollable, create a wrapper for the scroll
            content, and apply height and overflow styles to it.

            ```html
            <app-drawer>
              <div style="height: 100%; overflow: auto;"></div>
            </app-drawer>
            ```

            ### Styling

            Custom property                  | Description                            | Default
            ---------------------------------|----------------------------------------|--------------------
            `--app-drawer-width`             | Width of the drawer                    | 256px
            `--app-drawer-content-container` | Mixin for the drawer content container | {}
            `--app-drawer-scrim-background`  | Background for the scrim               | rgba(0, 0, 0, 0.5)

            **NOTE:** If you use `<app-drawer>` with `<app-drawer-layout>` and specify a
            value for
            `--app-drawer-width`, that value must be accessible by both elements. This can
            be done by defining the value on the `:host` that contains `<app-drawer-layout>`
            (or `html` if outside a shadow root):

            ```css
            :host {
              --app-drawer-width: 300px;
            }
            ```

            @element app-drawer
            @demo app-drawer/demo/left-drawer.html Simple Left Drawer
            @demo app-drawer/demo/right-drawer.html Right Drawer with Icons
            */
            Polymer({
              /** @override */
              _template: html$1`
    <style>
      :host {
        position: fixed;
        top: -120px;
        right: 0;
        bottom: -120px;
        left: 0;

        visibility: hidden;

        transition-property: visibility;
      }

      :host([opened]) {
        visibility: visible;
      }

      :host([persistent]) {
        width: var(--app-drawer-width, 256px);
      }

      :host([persistent][position=left]) {
        right: auto;
      }

      :host([persistent][position=right]) {
        left: auto;
      }

      #contentContainer {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;

        width: var(--app-drawer-width, 256px);
        padding: var(--app-drawer-content-padding, 120px 0);

        transition-property: -webkit-transform;
        transition-property: transform;
        -webkit-transform: translate3d(-100%, 0, 0);
        transform: translate3d(-100%, 0, 0);

        background-color: #FFF;

        @apply --app-drawer-content-container;
      }

      #contentContainer[persistent] {
        width: 100%;
      }

      #contentContainer[position=right] {
        right: 0;
        left: auto;

        -webkit-transform: translate3d(100%, 0, 0);
        transform: translate3d(100%, 0, 0);
      }

      #contentContainer[swipe-open]::after {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 100%;

        visibility: visible;

        width: 20px;

        content: '';
      }

      #contentContainer[swipe-open][position=right]::after {
        right: 100%;
        left: auto;
      }

      #contentContainer[opened] {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
      }

      #scrim {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        transition-property: opacity;
        -webkit-transform: translateZ(0);
        transform:  translateZ(0);

        opacity: 0;
        background: var(--app-drawer-scrim-background, rgba(0, 0, 0, 0.5));
      }

      #scrim.visible {
        opacity: 1;
      }

      :host([no-transition]) #contentContainer {
        transition-property: none;
      }
    </style>

    <div id="scrim" on-click="close"></div>

    <!-- HACK(keanulee): Bind attributes here (in addition to :host) for styling to workaround Safari
    bug. https://bugs.webkit.org/show_bug.cgi?id=170762 -->
    <div id="contentContainer" opened\$="[[opened]]" persistent\$="[[persistent]]" position\$="[[position]]" swipe-open\$="[[swipeOpen]]">
      <slot></slot>
    </div>
`,

              is: 'app-drawer',

              properties: {
                /**
                 * The opened state of the drawer.
                 */
                opened:
                    {type: Boolean, value: false, notify: true, reflectToAttribute: true},

                /**
                 * The drawer does not have a scrim and cannot be swiped close.
                 */
                persistent: {type: Boolean, value: false, reflectToAttribute: true},

                /**
                 * The transition duration of the drawer in milliseconds.
                 */
                transitionDuration: {type: Number, value: 200},

                /**
                 * The alignment of the drawer on the screen ('left', 'right', 'start' or
                 * 'end'). 'start' computes to left and 'end' to right in LTR layout and
                 * vice versa in RTL layout.
                 */
                align: {type: String, value: 'left'},

                /**
                 * The computed, read-only position of the drawer on the screen ('left' or
                 * 'right').
                 */
                position: {type: String, readOnly: true, reflectToAttribute: true},

                /**
                 * Create an area at the edge of the screen to swipe open the drawer.
                 */
                swipeOpen: {type: Boolean, value: false, reflectToAttribute: true},

                /**
                 * Trap keyboard focus when the drawer is opened and not persistent.
                 */
                noFocusTrap: {type: Boolean, value: false},

                /**
                 * Disables swiping on the drawer.
                 */
                disableSwipe: {type: Boolean, value: false}
              },

              observers: [
                'resetLayout(position, isAttached)',
                '_resetPosition(align, isAttached)',
                '_styleTransitionDuration(transitionDuration)',
                '_openedPersistentChanged(opened, persistent)'
              ],

              _translateOffset: 0,
              _trackDetails: null,
              _drawerState: 0,
              _boundEscKeydownHandler: null,
              _firstTabStop: null,
              _lastTabStop: null,

              /** @override */
              attached: function() {
                afterNextRender(this, function() {
                  this._boundEscKeydownHandler = this._escKeydownHandler.bind(this);
                  this.addEventListener('keydown', this._tabKeydownHandler.bind(this));

                  // Only listen for horizontal track so you can vertically scroll
                  // inside the drawer.
                  this.listen(this, 'track', '_track');
                  this.setScrollDirection('y');
                });

                this.fire('app-reset-layout');
              },

              /** @override */
              detached: function() {
                document.removeEventListener('keydown', this._boundEscKeydownHandler);
              },

              /**
               * Opens the drawer.
               */
              open: function() {
                this.opened = true;
              },

              /**
               * Closes the drawer.
               */
              close: function() {
                this.opened = false;
              },

              /**
               * Toggles the drawer open and close.
               */
              toggle: function() {
                this.opened = !this.opened;
              },

              /**
               * Gets the width of the drawer.
               *
               * @return {number} The width of the drawer in pixels.
               */
              getWidth: function() {
                return this._savedWidth || this.$.contentContainer.offsetWidth;
              },

              _isRTL: function() {
                return window.getComputedStyle(this).direction === 'rtl';
              },

              _resetPosition: function() {
                switch (this.align) {
                  case 'start':
                    this._setPosition(this._isRTL() ? 'right' : 'left');
                    return;
                  case 'end':
                    this._setPosition(this._isRTL() ? 'left' : 'right');
                    return;
                }
                this._setPosition(this.align);
              },

              _escKeydownHandler: function(event) {
                var ESC_KEYCODE = 27;
                if (event.keyCode === ESC_KEYCODE) {
                  // Prevent any side effects if app-drawer closes.
                  event.preventDefault();
                  this.close();
                }
              },

              _track: function(event) {
                if (this.persistent || this.disableSwipe) {
                  return;
                }

                // Disable user selection on desktop.
                event.preventDefault();

                switch (event.detail.state) {
                  case 'start':
                    this._trackStart(event);
                    break;
                  case 'track':
                    this._trackMove(event);
                    break;
                  case 'end':
                    this._trackEnd(event);
                    break;
                }
              },

              _trackStart: function(event) {
                this._drawerState = this._DRAWER_STATE.TRACKING;

                var rect = this.$.contentContainer.getBoundingClientRect();
                this._savedWidth = rect.width;
                if (this.position === 'left') {
                  this._translateOffset = rect.left;
                } else {
                  this._translateOffset = rect.right - window.innerWidth;
                }

                this._trackDetails = [];

                // Disable transitions since style attributes will reflect user track
                // events.
                this._styleTransitionDuration(0);
                this.style.visibility = 'visible';
              },

              _trackMove: function(event) {
                this._translateDrawer(event.detail.dx + this._translateOffset);

                // Use Date.now() since event.timeStamp is inconsistent across browsers
                // (e.g. most browsers use milliseconds but FF 44 uses microseconds).
                this._trackDetails.push({dx: event.detail.dx, timeStamp: Date.now()});
              },

              _trackEnd: function(event) {
                var x = event.detail.dx + this._translateOffset;
                var drawerWidth = this.getWidth();
                var isPositionLeft = this.position === 'left';
                var isInEndState = isPositionLeft ? (x >= 0 || x <= -drawerWidth) :
                                                    (x <= 0 || x >= drawerWidth);

                if (!isInEndState) {
                  // No longer need the track events after this method returns - allow them
                  // to be GC'd.
                  var trackDetails = this._trackDetails;
                  this._trackDetails = null;

                  this._flingDrawer(event, trackDetails);
                  if (this._drawerState === this._DRAWER_STATE.FLINGING) {
                    return;
                  }
                }

                // If the drawer is not flinging, toggle the opened state based on the
                // position of the drawer.
                var halfWidth = drawerWidth / 2;
                if (event.detail.dx < -halfWidth) {
                  this.opened = this.position === 'right';
                } else if (event.detail.dx > halfWidth) {
                  this.opened = this.position === 'left';
                }

                if (isInEndState) {
                  this.debounce('_resetDrawerState', this._resetDrawerState);
                } else {
                  this.debounce(
                      '_resetDrawerState', this._resetDrawerState, this.transitionDuration);
                }

                this._styleTransitionDuration(this.transitionDuration);
                this._resetDrawerTranslate();
                this.style.visibility = '';
              },

              _calculateVelocity: function(event, trackDetails) {
                // Find the oldest track event that is within 100ms using binary search.
                var now = Date.now();
                var timeLowerBound = now - 100;
                var trackDetail;
                var min = 0;
                var max = trackDetails.length - 1;

                while (min <= max) {
                  // Floor of average of min and max.
                  var mid = (min + max) >> 1;
                  var d = trackDetails[mid];
                  if (d.timeStamp >= timeLowerBound) {
                    trackDetail = d;
                    max = mid - 1;
                  } else {
                    min = mid + 1;
                  }
                }

                if (trackDetail) {
                  var dx = event.detail.dx - trackDetail.dx;
                  var dt = (now - trackDetail.timeStamp) || 1;
                  return dx / dt;
                }
                return 0;
              },

              _flingDrawer: function(event, trackDetails) {
                var velocity = this._calculateVelocity(event, trackDetails);

                // Do not fling if velocity is not above a threshold.
                if (Math.abs(velocity) < this._MIN_FLING_THRESHOLD) {
                  return;
                }

                this._drawerState = this._DRAWER_STATE.FLINGING;

                var x = event.detail.dx + this._translateOffset;
                var drawerWidth = this.getWidth();
                var isPositionLeft = this.position === 'left';
                var isVelocityPositive = velocity > 0;
                var isClosingLeft = !isVelocityPositive && isPositionLeft;
                var isClosingRight = isVelocityPositive && !isPositionLeft;
                var dx;
                if (isClosingLeft) {
                  dx = -(x + drawerWidth);
                } else if (isClosingRight) {
                  dx = (drawerWidth - x);
                } else {
                  dx = -x;
                }

                // Enforce a minimum transition velocity to make the drawer feel snappy.
                if (isVelocityPositive) {
                  velocity = Math.max(velocity, this._MIN_TRANSITION_VELOCITY);
                  this.opened = this.position === 'left';
                } else {
                  velocity = Math.min(velocity, -this._MIN_TRANSITION_VELOCITY);
                  this.opened = this.position === 'right';
                }

                // Calculate the amount of time needed to finish the transition based on the
                // initial slope of the timing function.
                var t = this._FLING_INITIAL_SLOPE * dx / velocity;
                this._styleTransitionDuration(t);
                this._styleTransitionTimingFunction(this._FLING_TIMING_FUNCTION);

                this._resetDrawerTranslate();
                this.debounce('_resetDrawerState', this._resetDrawerState, t);
              },

              _styleTransitionDuration: function(duration) {
                this.style.transitionDuration = duration + 'ms';
                this.$.contentContainer.style.transitionDuration = duration + 'ms';
                this.$.scrim.style.transitionDuration = duration + 'ms';
              },

              _styleTransitionTimingFunction: function(timingFunction) {
                this.$.contentContainer.style.transitionTimingFunction = timingFunction;
                this.$.scrim.style.transitionTimingFunction = timingFunction;
              },

              _translateDrawer: function(x) {
                var drawerWidth = this.getWidth();

                if (this.position === 'left') {
                  x = Math.max(-drawerWidth, Math.min(x, 0));
                  this.$.scrim.style.opacity = 1 + x / drawerWidth;
                } else {
                  x = Math.max(0, Math.min(x, drawerWidth));
                  this.$.scrim.style.opacity = 1 - x / drawerWidth;
                }

                this.translate3d(x + 'px', '0', '0', this.$.contentContainer);
              },

              _resetDrawerTranslate: function() {
                this.$.scrim.style.opacity = '';
                this.transform('', this.$.contentContainer);
              },

              _resetDrawerState: function() {
                var oldState = this._drawerState;

                // If the drawer was flinging, we need to reset the style attributes.
                if (oldState === this._DRAWER_STATE.FLINGING) {
                  this._styleTransitionDuration(this.transitionDuration);
                  this._styleTransitionTimingFunction('');
                  this.style.visibility = '';
                }

                this._savedWidth = null;

                if (this.opened) {
                  this._drawerState = this.persistent ?
                      this._DRAWER_STATE.OPENED_PERSISTENT :
                      this._DRAWER_STATE.OPENED;
                } else {
                  this._drawerState = this._DRAWER_STATE.CLOSED;
                }

                if (oldState !== this._drawerState) {
                  if (this._drawerState === this._DRAWER_STATE.OPENED) {
                    this._setKeyboardFocusTrap();
                    document.addEventListener('keydown', this._boundEscKeydownHandler);
                    document.body.style.overflow = 'hidden';
                  } else {
                    document.removeEventListener('keydown', this._boundEscKeydownHandler);
                    document.body.style.overflow = '';
                  }

                  // Don't fire the event on initial load.
                  if (oldState !== this._DRAWER_STATE.INIT) {
                    this.fire('app-drawer-transitioned');
                  }
                }
              },

              /**
               * Resets the layout.
               *
               * @method resetLayout
               */
              resetLayout: function() {
                this.fire('app-reset-layout');
              },

              _setKeyboardFocusTrap: function() {
                if (this.noFocusTrap) {
                  return;
                }

                // NOTE: Unless we use /deep/ (which we shouldn't since it's deprecated),
                // this will not select focusable elements inside shadow roots.
                var focusableElementsSelector = [
                  'a[href]:not([tabindex="-1"])',
                  'area[href]:not([tabindex="-1"])',
                  'input:not([disabled]):not([tabindex="-1"])',
                  'select:not([disabled]):not([tabindex="-1"])',
                  'textarea:not([disabled]):not([tabindex="-1"])',
                  'button:not([disabled]):not([tabindex="-1"])',
                  'iframe:not([tabindex="-1"])',
                  '[tabindex]:not([tabindex="-1"])',
                  '[contentEditable=true]:not([tabindex="-1"])'
                ].join(',');
                var focusableElements =
                    dom(this).querySelectorAll(focusableElementsSelector);

                if (focusableElements.length > 0) {
                  this._firstTabStop = focusableElements[0];
                  this._lastTabStop = focusableElements[focusableElements.length - 1];
                } else {
                  // Reset saved tab stops when there are no focusable elements in the
                  // drawer.
                  this._firstTabStop = null;
                  this._lastTabStop = null;
                }

                // Focus on app-drawer if it has non-zero tabindex. Otherwise, focus the
                // first focusable element in the drawer, if it exists. Use the tabindex
                // attribute since the this.tabIndex property in IE/Edge returns 0 (instead
                // of -1) when the attribute is not set.
                var tabindex = this.getAttribute('tabindex');
                if (tabindex && parseInt(tabindex, 10) > -1) {
                  this.focus();
                } else if (this._firstTabStop) {
                  this._firstTabStop.focus();
                }
              },

              _tabKeydownHandler: function(event) {
                if (this.noFocusTrap) {
                  return;
                }

                var TAB_KEYCODE = 9;
                if (this._drawerState === this._DRAWER_STATE.OPENED &&
                    event.keyCode === TAB_KEYCODE) {
                  if (event.shiftKey) {
                    if (this._firstTabStop &&
                        dom(event).localTarget === this._firstTabStop) {
                      event.preventDefault();
                      this._lastTabStop.focus();
                    }
                  } else {
                    if (this._lastTabStop && dom(event).localTarget === this._lastTabStop) {
                      event.preventDefault();
                      this._firstTabStop.focus();
                    }
                  }
                }
              },

              _openedPersistentChanged: function(opened, persistent) {
                this.toggleClass('visible', opened && !persistent, this.$.scrim);

                // Use a debounce timer instead of transitionend since transitionend won't
                // fire when app-drawer is display: none.
                this.debounce(
                    '_resetDrawerState', this._resetDrawerState, this.transitionDuration);
              },

              _MIN_FLING_THRESHOLD: 0.2,
              _MIN_TRANSITION_VELOCITY: 1.2,
              _FLING_TIMING_FUNCTION: 'cubic-bezier(0.667, 1, 0.667, 1)',
              _FLING_INITIAL_SLOPE: 1.5,

              _DRAWER_STATE: {
                INIT: 0,
                OPENED: 1,
                OPENED_PERSISTENT: 2,
                CLOSED: 3,
                TRACKING: 4,
                FLINGING: 5
              }

              /**
               * Fired when the layout of app-drawer has changed.
               *
               * @event app-reset-layout
               */

              /**
               * Fired when app-drawer has finished transitioning.
               *
               * @event app-drawer-transitioned
               */
            });

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

            /**
            `iron-media-query` can be used to data bind to a CSS media query.
            The `query` property is a bare CSS media query.
            The `query-matches` property is a boolean representing whether the page matches
            that media query.

            Example:

            ```html
            <iron-media-query query="(min-width: 600px)" query-matches="{{queryMatches}}">
            </iron-media-query>
            ```

            @group Iron Elements
            @demo demo/index.html
            @hero hero.svg
            @element iron-media-query
            */
            Polymer({

              is: 'iron-media-query',

              properties: {

                /**
                 * The Boolean return value of the media query.
                 */
                queryMatches: {type: Boolean, value: false, readOnly: true, notify: true},

                /**
                 * The CSS media query to evaluate.
                 */
                query: {type: String, observer: 'queryChanged'},

                /**
                 * If true, the query attribute is assumed to be a complete media query
                 * string rather than a single media feature.
                 */
                full: {type: Boolean, value: false},

                /**
                 * @type {function(MediaQueryList)}
                 */
                _boundMQHandler: {
                  value: function() {
                    return this.queryHandler.bind(this);
                  }
                },

                /**
                 * @type {MediaQueryList}
                 */
                _mq: {value: null}
              },

              attached: function() {
                this.style.display = 'none';
                this.queryChanged();
              },

              detached: function() {
                this._remove();
              },

              _add: function() {
                if (this._mq) {
                  this._mq.addListener(this._boundMQHandler);
                }
              },

              _remove: function() {
                if (this._mq) {
                  this._mq.removeListener(this._boundMQHandler);
                }
                this._mq = null;
              },

              queryChanged: function() {
                this._remove();
                var query = this.query;
                if (!query) {
                  return;
                }
                if (!this.full && query[0] !== '(') {
                  query = '(' + query + ')';
                }
                this._mq = window.matchMedia(query);
                this._add();
                this.queryHandler(this._mq);
              },

              queryHandler: function(mq) {
                this._setQueryMatches(mq.matches);
              }

            });

            /**
            @license
            Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */

            /**
             * @polymerBehavior
             */
            const AppLayoutBehavior = [
              IronResizableBehavior,
              {

                listeners: {
                  'app-reset-layout': '_appResetLayoutHandler',
                  'iron-resize': 'resetLayout'
                },

                attached: function() {
                  this.fire('app-reset-layout');
                },

                _appResetLayoutHandler: function(e) {
                  if (dom(e).path[0] === this) {
                    return;
                  }
                  this.resetLayout();
                  e.stopPropagation();
                },

                _updateLayoutStates: function() {
                  console.error('unimplemented');
                },

                /**
                 * Resets the layout. If you changed the size of this element via CSS
                 * you can notify the changes by either firing the `iron-resize` event
                 * or calling `resetLayout` directly.
                 *
                 * @method resetLayout
                 */
                resetLayout: function() {
                  var cb = this._updateLayoutStates.bind(this);
                  this._layoutDebouncer =
                      Debouncer.debounce(this._layoutDebouncer, animationFrame, cb);
                  enqueueDebouncer(this._layoutDebouncer);
                  this._notifyDescendantResize();
                },

                _notifyLayoutChanged: function() {
                  var self = this;
                  // TODO: the event `app-reset-layout` can be fired synchronously
                  // as long as `_updateLayoutStates` waits for all the microtasks after
                  // rAF. E.g. requestAnimationFrame(setTimeOut())
                  requestAnimationFrame(function() {
                    self.fire('app-reset-layout');
                  });
                },

                _notifyDescendantResize: function() {
                  if (!this.isAttached) {
                    return;
                  }
                  this._interestedResizables.forEach(function(resizable) {
                    if (this.resizerShouldNotify(resizable)) {
                      this._notifyDescendant(resizable);
                    }
                  }, this);
                }
              }
            ];

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

            /**
            app-drawer-layout is a wrapper element that positions an app-drawer and other
            content. When the viewport width is smaller than `responsiveWidth`, this element
            changes to narrow layout. In narrow layout, the drawer will be stacked on top of
            the main content. The drawer will slide in/out to hide/reveal the main content.

            By default the drawer is aligned to the start, which is left in LTR layouts:

            ```html
            <app-drawer-layout>
              <app-drawer slot="drawer">
                drawer content
              </app-drawer>
              <div>
                main content
              </div>
            </app-drawer-layout>
            ```

            Align the drawer at the end:

            ```html
            <app-drawer-layout>
              <app-drawer slot="drawer" align="end">
                 drawer content
              </app-drawer>
              <div>
                main content
              </div>
            </app-drawer-layout>
            ```

            With an app-header-layout:

            ```html
            <app-drawer-layout>
              <app-drawer slot="drawer">
                drawer-content
              </app-drawer>
              <app-header-layout>
                <app-header slot="header">
                  <app-toolbar>
                    <div main-title>App name</div>
                  </app-toolbar>
                </app-header>

                main content

              </app-header-layout>
            </app-drawer-layout>
            ```

            Add the `drawer-toggle` attribute to elements inside `app-drawer-layout` that
            toggle the drawer on click events:

            ```html
            <app-drawer-layout>
              <app-drawer slot="drawer">
                drawer-content
              </app-drawer>
              <app-header-layout>
                <app-header slot="header">
                  <app-toolbar>
                    <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                    <div main-title>App name</div>
                  </app-toolbar>
                </app-header>

                main content

              </app-header-layout>
            </app-drawer-layout>
            ```

            **NOTE:** With app-layout 2.0, the `drawer-toggle` element needs to be manually
            hidden when app-drawer-layout is not in narrow layout. To add this, add the
            following CSS rule where app-drawer-layout is used:

            ```css
            app-drawer-layout:not([narrow]) [drawer-toggle] {
              display: none;
            }
            ```

            Add the `fullbleed` attribute to app-drawer-layout to make it fit the size of
            its container:

            ```html
            <app-drawer-layout fullbleed>
              <app-drawer slot="drawer">
                 drawer content
              </app-drawer>
              <div>
                main content
              </div>
            </app-drawer-layout>
            ```

            ### Styling

            Custom property                          | Description                          | Default
            -----------------------------------------|--------------------------------------|---------
            `--app-drawer-width`                     | Width of the drawer                  | 256px
            `--app-drawer-layout-content-transition` | Transition for the content container | none

            **NOTE:** If you use <app-drawer> with <app-drawer-layout> and specify a value
            for
            `--app-drawer-width`, that value must be accessible by both elements. This can
            be done by defining the value on the `:host` that contains <app-drawer-layout>
            (or `html` if outside a shadow root):

            ```css
            :host {
              --app-drawer-width: 300px;
            }
            ```

            @element app-drawer-layout
            @demo app-drawer-layout/demo/index.html
            */
            Polymer({
              /** @override */
              _template: html$1`
    <style>
      :host {
        display: block;
        /**
         * Force app-drawer-layout to have its own stacking context so that its parent can
         * control the stacking of it relative to other elements.
         */
        position: relative;
        z-index: 0;
      }

      :host ::slotted([slot=drawer]) {
        z-index: 1;
      }

      :host([fullbleed]) {
        @apply --layout-fit;
      }

      #contentContainer {
        /* Create a stacking context here so that all children appear below the header. */
        position: relative;
        z-index: 0;
        height: 100%;
        transition: var(--app-drawer-layout-content-transition, none);
      }

      #contentContainer[drawer-position=left] {
        margin-left: var(--app-drawer-width, 256px);
      }

      #contentContainer[drawer-position=right] {
        margin-right: var(--app-drawer-width, 256px);
      }
    </style>

    <slot id="drawerSlot" name="drawer"></slot>

    <div id="contentContainer" drawer-position\$="[[_drawerPosition]]">
      <slot></slot>
    </div>

    <iron-media-query query="[[_computeMediaQuery(forceNarrow, responsiveWidth)]]" on-query-matches-changed="_onQueryMatchesChanged"></iron-media-query>
`,

              is: 'app-drawer-layout',
              behaviors: [AppLayoutBehavior],

              properties: {
                /**
                 * If true, ignore `responsiveWidth` setting and force the narrow layout.
                 */
                forceNarrow: {type: Boolean, value: false},

                /**
                 * If the viewport's width is smaller than this value, the panel will change
                 * to narrow layout. In the mode the drawer will be closed.
                 */
                responsiveWidth: {type: String, value: '640px'},

                /**
                 * Returns true if it is in narrow layout. This is useful if you need to
                 * show/hide elements based on the layout.
                 */
                narrow:
                    {type: Boolean, reflectToAttribute: true, readOnly: true, notify: true},

                /**
                 * If true, the drawer will initially be opened when in narrow layout mode.
                 */
                openedWhenNarrow: {type: Boolean, value: false},

                _drawerPosition: {type: String}
              },

              listeners: {'click': '_clickHandler'},
              observers: ['_narrowChanged(narrow)'],

              /**
               * A reference to the app-drawer element.
               *
               * @property drawer
               */
              get drawer() {
                return dom(this.$.drawerSlot).getDistributedNodes()[0];
              },

              /** @override */
              attached: function() {
                // Disable drawer transitions until after app-drawer-layout sets the initial
                // opened state.
                var drawer = this.drawer;
                if (drawer) {
                  drawer.setAttribute('no-transition', '');
                }
              },

              _clickHandler: function(e) {
                var target = dom(e).localTarget;
                if (target && target.hasAttribute('drawer-toggle')) {
                  var drawer = this.drawer;
                  if (drawer && !drawer.persistent) {
                    drawer.toggle();
                  }
                }
              },

              _updateLayoutStates: function() {
                var drawer = this.drawer;
                if (!this.isAttached || !drawer) {
                  return;
                }

                this._drawerPosition = this.narrow ? null : drawer.position;
                if (this._drawerNeedsReset) {
                  if (this.narrow) {
                    drawer.opened = this.openedWhenNarrow;
                    drawer.persistent = false;
                  } else {
                    drawer.opened = drawer.persistent = true;
                  }
                  if (drawer.hasAttribute('no-transition')) {
                    // Enable drawer transitions after app-drawer-layout sets the initial
                    // opened state.
                    afterNextRender(this, function() {
                      drawer.removeAttribute('no-transition');
                    });
                  }
                  this._drawerNeedsReset = false;
                }
              },

              _narrowChanged: function() {
                this._drawerNeedsReset = true;
                this.resetLayout();
              },

              _onQueryMatchesChanged: function(event) {
                this._setNarrow(event.detail.value);
              },

              _computeMediaQuery: function(forceNarrow, responsiveWidth) {
                return forceNarrow ? '(min-width: 0px)' :
                                     '(max-width: ' + responsiveWidth + ')';
              }
            });

            /**
            @license
            Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */
            const $_documentContainer = document.createElement('template');
            $_documentContainer.setAttribute('style', 'display: none;');

            $_documentContainer.innerHTML = `<dom-module id="app-grid-style">
  <template>
    <style>
      :host {
        /**
         * The width for the expandible item is:
         * ((100% - subPixelAdjustment) / columns * itemColumns - gutter
         *
         * - subPixelAdjustment: 0.1px (Required for IE 11)
         * - gutter: var(--app-grid-gutter)
         * - columns: var(--app-grid-columns)
         * - itemColumn: var(--app-grid-expandible-item-columns)
         */
        --app-grid-expandible-item: {
          -webkit-flex-basis: calc((100% - 0.1px) / var(--app-grid-columns, 1) * var(--app-grid-expandible-item-columns, 1) - var(--app-grid-gutter, 0px)) !important;
          flex-basis: calc((100% - 0.1px) / var(--app-grid-columns, 1) * var(--app-grid-expandible-item-columns, 1) - var(--app-grid-gutter, 0px)) !important;
          max-width: calc((100% - 0.1px) / var(--app-grid-columns, 1) * var(--app-grid-expandible-item-columns, 1) - var(--app-grid-gutter, 0px)) !important;
        };
      }

      .app-grid {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;

        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;

        -ms-flex-wrap: wrap;
        -webkit-flex-wrap: wrap;
        flex-wrap: wrap;

        padding-top: var(--app-grid-gutter, 0px);
        padding-left: var(--app-grid-gutter, 0px);
        box-sizing: border-box;
      }

      .app-grid > * {
        /* Required for IE 10 */
        -ms-flex: 1 1 100%;
        -webkit-flex: 1;
        flex: 1;

        /* The width for an item is: (100% - subPixelAdjustment - gutter * columns) / columns */
        -webkit-flex-basis: calc((100% - 0.1px - (var(--app-grid-gutter, 0px) * var(--app-grid-columns, 1))) / var(--app-grid-columns, 1));
        flex-basis: calc((100% - 0.1px - (var(--app-grid-gutter, 0px) * var(--app-grid-columns, 1))) / var(--app-grid-columns, 1));

        max-width: calc((100% - 0.1px - (var(--app-grid-gutter, 0px) * var(--app-grid-columns, 1))) / var(--app-grid-columns, 1));
        margin-bottom: var(--app-grid-gutter, 0px);
        margin-right: var(--app-grid-gutter, 0px);
        height: var(--app-grid-item-height);
        box-sizing: border-box;
      }

      .app-grid[has-aspect-ratio] > * {
        position: relative;
      }

      .app-grid[has-aspect-ratio] > *::before {
        display: block;
        content: "";
        padding-top: var(--app-grid-item-height, 100%);
      }

      .app-grid[has-aspect-ratio] > * > * {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    </style>
  </template>
</dom-module>`;

            document.head.appendChild($_documentContainer.content);

            /**
            @license
            Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */

            /**
             * `Polymer.IronScrollTargetBehavior` allows an element to respond to scroll
             * events from a designated scroll target.
             *
             * Elements that consume this behavior can override the `_scrollHandler`
             * method to add logic on the scroll event.
             *
             * @demo demo/scrolling-region.html Scrolling Region
             * @demo demo/document.html Document Element
             * @polymerBehavior
             */
            const IronScrollTargetBehavior = {

              properties: {

                /**
                 * Specifies the element that will handle the scroll event
                 * on the behalf of the current element. This is typically a reference to an
                 *element, but there are a few more posibilities:
                 *
                 * ### Elements id
                 *
                 *```html
                 * <div id="scrollable-element" style="overflow: auto;">
                 *  <x-element scroll-target="scrollable-element">
                 *    <!-- Content-->
                 *  </x-element>
                 * </div>
                 *```
                 * In this case, the `scrollTarget` will point to the outer div element.
                 *
                 * ### Document scrolling
                 *
                 * For document scrolling, you can use the reserved word `document`:
                 *
                 *```html
                 * <x-element scroll-target="document">
                 *   <!-- Content -->
                 * </x-element>
                 *```
                 *
                 * ### Elements reference
                 *
                 *```js
                 * appHeader.scrollTarget = document.querySelector('#scrollable-element');
                 *```
                 *
                 * @type {HTMLElement}
                 * @default document
                 */
                scrollTarget: {
                  type: HTMLElement,
                  value: function() {
                    return this._defaultScrollTarget;
                  }
                }
              },

              observers: ['_scrollTargetChanged(scrollTarget, isAttached)'],

              /**
               * True if the event listener should be installed.
               */
              _shouldHaveListener: true,

              _scrollTargetChanged: function(scrollTarget, isAttached) {

                if (this._oldScrollTarget) {
                  this._toggleScrollListener(false, this._oldScrollTarget);
                  this._oldScrollTarget = null;
                }
                if (!isAttached) {
                  return;
                }
                // Support element id references
                if (scrollTarget === 'document') {
                  this.scrollTarget = this._doc;

                } else if (typeof scrollTarget === 'string') {
                  var domHost = this.domHost;

                  this.scrollTarget = domHost && domHost.$ ?
                      domHost.$[scrollTarget] :
                      dom(this.ownerDocument).querySelector('#' + scrollTarget);

                } else if (this._isValidScrollTarget()) {
                  this._oldScrollTarget = scrollTarget;
                  this._toggleScrollListener(this._shouldHaveListener, scrollTarget);
                }
              },

              /**
               * Runs on every scroll event. Consumer of this behavior may override this
               * method.
               *
               * @protected
               */
              _scrollHandler: function scrollHandler() {},

              /**
               * The default scroll target. Consumers of this behavior may want to customize
               * the default scroll target.
               *
               * @type {Element}
               */
              get _defaultScrollTarget() {
                return this._doc;
              },

              /**
               * Shortcut for the document element
               *
               * @type {Element}
               */
              get _doc() {
                return this.ownerDocument.documentElement;
              },

              /**
               * Gets the number of pixels that the content of an element is scrolled
               * upward.
               *
               * @type {number}
               */
              get _scrollTop() {
                if (this._isValidScrollTarget()) {
                  return this.scrollTarget === this._doc ? window.pageYOffset :
                                                           this.scrollTarget.scrollTop;
                }
                return 0;
              },

              /**
               * Gets the number of pixels that the content of an element is scrolled to the
               * left.
               *
               * @type {number}
               */
              get _scrollLeft() {
                if (this._isValidScrollTarget()) {
                  return this.scrollTarget === this._doc ? window.pageXOffset :
                                                           this.scrollTarget.scrollLeft;
                }
                return 0;
              },

              /**
               * Sets the number of pixels that the content of an element is scrolled
               * upward.
               *
               * @type {number}
               */
              set _scrollTop(top) {
                if (this.scrollTarget === this._doc) {
                  window.scrollTo(window.pageXOffset, top);
                } else if (this._isValidScrollTarget()) {
                  this.scrollTarget.scrollTop = top;
                }
              },

              /**
               * Sets the number of pixels that the content of an element is scrolled to the
               * left.
               *
               * @type {number}
               */
              set _scrollLeft(left) {
                if (this.scrollTarget === this._doc) {
                  window.scrollTo(left, window.pageYOffset);
                } else if (this._isValidScrollTarget()) {
                  this.scrollTarget.scrollLeft = left;
                }
              },

              /**
               * Scrolls the content to a particular place.
               *
               * @method scroll
               * @param {number|!{left: number, top: number}} leftOrOptions The left position or scroll options
               * @param {number=} top The top position
               * @return {void}
               */
              scroll: function(leftOrOptions, top) {
                var left;

                if (typeof leftOrOptions === 'object') {
                  left = leftOrOptions.left;
                  top = leftOrOptions.top;
                } else {
                  left = leftOrOptions;
                }

                left = left || 0;
                top = top || 0;
                if (this.scrollTarget === this._doc) {
                  window.scrollTo(left, top);
                } else if (this._isValidScrollTarget()) {
                  this.scrollTarget.scrollLeft = left;
                  this.scrollTarget.scrollTop = top;
                }
              },

              /**
               * Gets the width of the scroll target.
               *
               * @type {number}
               */
              get _scrollTargetWidth() {
                if (this._isValidScrollTarget()) {
                  return this.scrollTarget === this._doc ? window.innerWidth :
                                                           this.scrollTarget.offsetWidth;
                }
                return 0;
              },

              /**
               * Gets the height of the scroll target.
               *
               * @type {number}
               */
              get _scrollTargetHeight() {
                if (this._isValidScrollTarget()) {
                  return this.scrollTarget === this._doc ? window.innerHeight :
                                                           this.scrollTarget.offsetHeight;
                }
                return 0;
              },

              /**
               * Returns true if the scroll target is a valid HTMLElement.
               *
               * @return {boolean}
               */
              _isValidScrollTarget: function() {
                return this.scrollTarget instanceof HTMLElement;
              },

              _toggleScrollListener: function(yes, scrollTarget) {
                var eventTarget = scrollTarget === this._doc ? window : scrollTarget;
                if (yes) {
                  if (!this._boundScrollHandler) {
                    this._boundScrollHandler = this._scrollHandler.bind(this);
                    eventTarget.addEventListener('scroll', this._boundScrollHandler);
                  }
                } else {
                  if (this._boundScrollHandler) {
                    eventTarget.removeEventListener('scroll', this._boundScrollHandler);
                    this._boundScrollHandler = null;
                  }
                }
              },

              /**
               * Enables or disables the scroll event listener.
               *
               * @param {boolean} yes True to add the event, False to remove it.
               */
              toggleScrollListener: function(yes) {
                this._shouldHaveListener = yes;
                this._toggleScrollListener(yes, this.scrollTarget);
              }

            };

            /**
            @license
            Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
            This code may only be used under the BSD style license found at
            http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
            http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
            found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
            part of the polymer project is also subject to an additional IP rights grant
            found at http://polymer.github.io/PATENTS.txt
            */

            /**
             * `Polymer.AppScrollEffectsBehavior` provides an interface that allows an
             * element to use scrolls effects.
             *
             * ### Importing the app-layout effects
             *
             * app-layout provides a set of scroll effects that can be used by explicitly
             * importing `app-scroll-effects.js`:
             *
             * ```js
             * import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
             * ```
             *
             * The scroll effects can also be used by individually importing
             * `@polymer/app-layout/app-scroll-effects/effects/[effectName].js`. For
             * example:
             *
             * ```js
             * import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
             * ```
             *
             * ### Consuming effects
             *
             * Effects can be consumed via the `effects` property. For example:
             *
             * ```html
             * <app-header effects="waterfall"></app-header>
             * ```
             *
             * ### Creating scroll effects
             *
             * You may want to create a custom scroll effect if you need to modify the CSS
             * of an element based on the scroll position.
             *
             * A scroll effect definition is an object with `setUp()`, `tearDown()` and
             * `run()` functions.
             *
             * To register the effect, you can use
             * `Polymer.AppLayout.registerEffect(effectName, effectDef)` For example, let's
             * define an effect that resizes the header's logo:
             *
             * ```js
             * Polymer.AppLayout.registerEffect('resizable-logo', {
             *   setUp: function(config) {
             *     // the effect's config is passed to the setUp.
             *     this._fxResizeLogo = { logo: Polymer.dom(this).querySelector('[logo]') };
             *   },
             *
             *   run: function(progress) {
             *      // the progress of the effect
             *      this.transform('scale3d(' + progress + ', '+ progress +', 1)',
             * this._fxResizeLogo.logo);
             *   },
             *
             *   tearDown: function() {
             *      // clean up and reset of states
             *      delete this._fxResizeLogo;
             *   }
             * });
             * ```
             * Now, you can consume the effect:
             *
             * ```html
             * <app-header id="appHeader" effects="resizable-logo">
             *   <img logo src="logo.svg">
             * </app-header>
             * ```
             *
             * ### Imperative API
             *
             * ```js
             * var logoEffect = appHeader.createEffect('resizable-logo', effectConfig);
             * // run the effect: logoEffect.run(progress);
             * // tear down the effect: logoEffect.tearDown();
             * ```
             *
             * ### Configuring effects
             *
             * For effects installed via the `effects` property, their configuration can be
             * set via the `effectsConfig` property. For example:
             *
             * ```html
             * <app-header effects="waterfall"
             *   effects-config='{"waterfall": {"startsAt": 0, "endsAt": 0.5}}'>
             * </app-header>
             * ```
             *
             * All effects have a `startsAt` and `endsAt` config property. They specify at
             * what point the effect should start and end. This value goes from 0 to 1
             * inclusive.
             *
             * @polymerBehavior
             */
            const AppScrollEffectsBehavior = [
              IronScrollTargetBehavior,
              {

                properties: {

                  /**
                   * A space-separated list of the effects names that will be triggered when
                   * the user scrolls. e.g. `waterfall parallax-background` installs the
                   * `waterfall` and `parallax-background`.
                   */
                  effects: {type: String},

                  /**
                   * An object that configurates the effects installed via the `effects`
                   * property. e.g.
                   * ```js
                   *  element.effectsConfig = {
                   *   "blend-background": {
                   *     "startsAt": 0.5
                   *   }
                   * };
                   * ```
                   * Every effect has at least two config properties: `startsAt` and
                   * `endsAt`. These properties indicate when the event should start and end
                   * respectively and relative to the overall element progress. So for
                   * example, if `blend-background` starts at `0.5`, the effect will only
                   * start once the current element reaches 0.5 of its progress. In this
                   * context, the progress is a value in the range of `[0, 1]` that
                   * indicates where this element is on the screen relative to the viewport.
                   */
                  effectsConfig: {
                    type: Object,
                    value: function() {
                      return {};
                    }
                  },

                  /**
                   * Disables CSS transitions and scroll effects on the element.
                   */
                  disabled: {type: Boolean, reflectToAttribute: true, value: false},

                  /**
                   * Allows to set a `scrollTop` threshold. When greater than 0,
                   * `thresholdTriggered` is true only when the scroll target's `scrollTop`
                   * has reached this value.
                   *
                   * For example, if `threshold = 100`, `thresholdTriggered` is true when
                   * the `scrollTop` is at least `100`.
                   */
                  threshold: {type: Number, value: 0},

                  /**
                   * True if the `scrollTop` threshold (set in `scrollTopThreshold`) has
                   * been reached.
                   */
                  thresholdTriggered: {
                    type: Boolean,
                    notify: true,
                    readOnly: true,
                    reflectToAttribute: true
                  }
                },

                observers: ['_effectsChanged(effects, effectsConfig, isAttached)'],

                /**
                 * Updates the scroll state. This method should be overridden
                 * by the consumer of this behavior.
                 *
                 * @method _updateScrollState
                 * @param {number} scrollTop
                 */
                _updateScrollState: function(scrollTop) {},

                /**
                 * Returns true if the current element is on the screen.
                 * That is, visible in the current viewport. This method should be
                 * overridden by the consumer of this behavior.
                 *
                 * @method isOnScreen
                 * @return {boolean}
                 */
                isOnScreen: function() {
                  return false;
                },

                /**
                 * Returns true if there's content below the current element. This method
                 * should be overridden by the consumer of this behavior.
                 *
                 * @method isContentBelow
                 * @return {boolean}
                 */
                isContentBelow: function() {
                  return false;
                },

                /**
                 * List of effects handlers that will take place during scroll.
                 *
                 * @type {Array<Function>}
                 */
                _effectsRunFn: null,

                /**
                 * List of the effects definitions installed via the `effects` property.
                 *
                 * @type {Array<Object>}
                 */
                _effects: null,

                /**
                 * The clamped value of `_scrollTop`.
                 * @type number
                 */
                get _clampedScrollTop() {
                  return Math.max(0, this._scrollTop);
                },

                attached: function() {
                  this._scrollStateChanged();
                },

                detached: function() {
                  this._tearDownEffects();
                },

                /**
                 * Creates an effect object from an effect's name that can be used to run
                 * effects programmatically.
                 *
                 * @method createEffect
                 * @param {string} effectName The effect's name registered via `Polymer.AppLayout.registerEffect`.
                 * @param {Object=} effectConfig The effect config object. (Optional)
                 * @return {Object} An effect object with the following functions:
                 *
                 *  * `effect.setUp()`, Sets up the requirements for the effect.
                 *       This function is called automatically before the `effect` function
                 * returns.
                 *  * `effect.run(progress, y)`, Runs the effect given a `progress`.
                 *  * `effect.tearDown()`, Cleans up any DOM nodes or element references
                 * used by the effect.
                 *
                 * Example:
                 * ```js
                 * var parallax = element.createEffect('parallax-background');
                 * // runs the effect
                 * parallax.run(0.5, 0);
                 * ```
                 */
                createEffect: function(effectName, effectConfig) {
                  var effectDef = _scrollEffects[effectName];
                  if (!effectDef) {
                    throw new ReferenceError(this._getUndefinedMsg(effectName));
                  }
                  var prop = this._boundEffect(effectDef, effectConfig || {});
                  prop.setUp();
                  return prop;
                },

                /**
                 * Called when `effects` or `effectsConfig` changes.
                 */
                _effectsChanged: function(effects, effectsConfig, isAttached) {
                  this._tearDownEffects();

                  if (!effects || !isAttached) {
                    return;
                  }
                  effects.split(' ').forEach(function(effectName) {
                    var effectDef;
                    if (effectName !== '') {
                      if ((effectDef = _scrollEffects[effectName])) {
                        this._effects.push(
                            this._boundEffect(effectDef, effectsConfig[effectName]));
                      } else {
                        console.warn(this._getUndefinedMsg(effectName));
                      }
                    }
                  }, this);

                  this._setUpEffect();
                },

                /**
                 * Forces layout
                 */
                _layoutIfDirty: function() {
                  return this.offsetWidth;
                },

                /**
                 * Returns an effect object bound to the current context.
                 *
                 * @param {Object} effectDef
                 * @param {Object=} effectsConfig The effect config object if the effect accepts config values. (Optional)
                 */
                _boundEffect: function(effectDef, effectsConfig) {
                  effectsConfig = effectsConfig || {};
                  var startsAt = parseFloat(effectsConfig.startsAt || 0);
                  var endsAt = parseFloat(effectsConfig.endsAt || 1);
                  var deltaS = endsAt - startsAt;
                  var noop = function() {};
                  // fast path if possible
                  var runFn = (startsAt === 0 && endsAt === 1) ?
                      effectDef.run :
                      function(progress, y) {
                        effectDef.run.call(
                            this, Math.max(0, (progress - startsAt) / deltaS), y);
                      };
                  return {
                    setUp: effectDef.setUp ? effectDef.setUp.bind(this, effectsConfig) :
                                             noop,
                    run: effectDef.run ? runFn.bind(this) : noop,
                    tearDown: effectDef.tearDown ? effectDef.tearDown.bind(this) : noop
                  };
                },

                /**
                 * Sets up the effects.
                 */
                _setUpEffect: function() {
                  if (this.isAttached && this._effects) {
                    this._effectsRunFn = [];
                    this._effects.forEach(function(effectDef) {
                      // install the effect only if no error was reported
                      if (effectDef.setUp() !== false) {
                        this._effectsRunFn.push(effectDef.run);
                      }
                    }, this);
                  }
                },

                /**
                 * Tears down the effects.
                 */
                _tearDownEffects: function() {
                  if (this._effects) {
                    this._effects.forEach(function(effectDef) {
                      effectDef.tearDown();
                    });
                  }
                  this._effectsRunFn = [];
                  this._effects = [];
                },

                /**
                 * Runs the effects.
                 *
                 * @param {number} p The progress
                 * @param {number} y The top position of the current element relative to the viewport.
                 */
                _runEffects: function(p, y) {
                  if (this._effectsRunFn) {
                    this._effectsRunFn.forEach(function(run) {
                      run(p, y);
                    });
                  }
                },

                /**
                 * Overrides the `_scrollHandler`.
                 */
                _scrollHandler: function() {
                  this._scrollStateChanged();
                },

                _scrollStateChanged: function() {
                  if (!this.disabled) {
                    var scrollTop = this._clampedScrollTop;
                    this._updateScrollState(scrollTop);
                    if (this.threshold > 0) {
                      this._setThresholdTriggered(scrollTop >= this.threshold);
                    }
                  }
                },

                /**
                 * Override this method to return a reference to a node in the local DOM.
                 * The node is consumed by a scroll effect.
                 *
                 * @param {string} id The id for the node.
                 */
                _getDOMRef: function(id) {
                  console.warn('_getDOMRef', '`' + id + '` is undefined');
                },

                _getUndefinedMsg: function(effectName) {
                  return 'Scroll effect `' + effectName + '` is undefined. ' +
                      'Did you forget to import app-layout/app-scroll-effects/effects/' +
                      effectName + '.html ?';
                }

              }
            ];

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

            /**
            app-header is container element for app-toolbars at the top of the screen that
            can have scroll effects. By default, an app-header moves away from the viewport
            when scrolling down and if using `reveals`, the header slides back when
            scrolling back up. For example:

            ```html
            <app-header reveals>
              <app-toolbar>
                <div main-title>App name</div>
              </app-toolbar>
            </app-header>
            ```

            app-header can also condense when scrolling down. To achieve this behavior, the
            header must have a larger height than the `sticky` element in the light DOM. For
            example:

            ```html
            <app-header style="height: 96px;" condenses fixed>
              <app-toolbar style="height: 64px;">
                <div main-title>App name</div>
              </app-toolbar>
            </app-header>
            ```

            In this case the header is initially `96px` tall, and it shrinks to `64px` when
            scrolling down. That is what is meant by "condensing".

            ### Sticky element

            The element that is positioned fixed to top of the header's `scrollTarget` when
            a threshold is reached, similar to `position: sticky` in CSS. This element
            **must** be an immediate child of app-header. By default, the `sticky` element
            is the first `app-toolbar that is an immediate child of app-header.

            ```html
            <app-header condenses>
              <app-toolbar> Sticky element </app-toolbar>
              <app-toolbar></app-toolbar>
            </app-header>
            ```

            #### Customizing the sticky element

            ```html
            <app-header condenses>
              <app-toolbar></app-toolbar>
              <app-toolbar sticky> Sticky element </app-toolbar>
            </app-header>
            ```

            ### Scroll target

            The app-header's `scrollTarget` property allows to customize the scrollable
            element to which the header responds when the user scrolls. By default,
            app-header uses the document as the scroll target, but you can customize this
            property by setting the id of the element, e.g.

            ```html
            <div id="scrollingRegion" style="overflow-y: auto;">
              <app-header scroll-target="scrollingRegion">
              </app-header>
            </div>
            ```

            In this case, the `scrollTarget` property points to the outer div element.
            Alternatively, you can set this property programmatically:

            ```js
            appHeader.scrollTarget = document.querySelector("#scrollingRegion");
            ```

            ## Backgrounds
            app-header has two background layers that can be used for styling when the
            header is condensed or when the scrollable element is scrolled to the top.

            ## Scroll effects

            Scroll effects are _optional_ visual effects applied in app-header based on
            scroll position. For example, The [Material Design scrolling
            techniques](https://www.google.com/design/spec/patterns/scrolling-techniques.html)
            recommends effects that can be installed via the `effects` property. e.g.

            ```html
            <app-header effects="waterfall">
              <app-toolbar>App name</app-toolbar>
            </app-header>
            ```

            #### Importing the effects

            To use the scroll effects, you must explicitly import them in addition to
            `app-header`:

            ```js
            import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
            ```

            #### List of effects

            * **blend-background**
            Fades in/out two background elements by applying CSS opacity based on scroll
            position. You can use this effect to smoothly change the background color or
            image of the header. For example, using the mixin
            `--app-header-background-rear-layer` lets you assign a different background when
            the header is condensed:

            ```css
            app-header {
              background-color: red;
              --app-header-background-rear-layer: {
                /* The header is blue when condensed *\/
                background-color: blue;
              };
            }
            ```

            * **fade-background**
            Upon scrolling past a threshold, this effect will trigger an opacity transition
            to fade in/out the backgrounds. Compared to the `blend-background` effect, this
            effect doesn't interpolate the opacity based on scroll position.


            * **parallax-background**
            A simple parallax effect that vertically translates the backgrounds based on a
            fraction of the scroll position. For example:

            ```css
            app-header {
              --app-header-background-front-layer: {
                background-image: url(...);
              };
            }
            ```
            ```html
            <app-header style="height: 300px;" effects="parallax-background">
              <app-toolbar>App name</app-toolbar>
            </app-header>
            ```

            The fraction determines how far the background moves relative to the scroll
            position. This value can be assigned via the `scalar` config value and it is
            typically a value between 0 and 1 inclusive. If `scalar=0`, the background
            doesn't move away from the header.

            * **resize-title**
            Progressively interpolates the size of the title from the element with the
            `main-title` attribute to the element with the `condensed-title` attribute as
            the header condenses. For example:

            ```html
            <app-header condenses reveals effects="resize-title">
              <app-toolbar>
                  <h4 condensed-title>App name</h4>
              </app-toolbar>
              <app-toolbar>
                  <h1 main-title>App name</h1>
              </app-toolbar>
            </app-header>
            ```

            * **resize-snapped-title**
            Upon scrolling past a threshold, this effect fades in/out the titles using
            opacity transitions. Similarly to `resize-title`, the `main-title` and
            `condensed-title` elements must be placed in the light DOM.

            * **waterfall**
            Toggles the shadow property in app-header to create a sense of depth (as
            recommended in the MD spec) between the header and the underneath content. You
            can change the shadow by customizing the `--app-header-shadow` mixin. For
            example:

            ```css
            app-header {
              --app-header-shadow: {
                box-shadow: inset 0px 5px 2px -3px rgba(0, 0, 0, 0.2);
              };
            }
            ```

            ```html
            <app-header condenses reveals effects="waterfall">
              <app-toolbar>
                  <h1 main-title>App name</h1>
              </app-toolbar>
            </app-header>
            ```

            * **material**
            Installs the waterfall, resize-title, blend-background and parallax-background
            effects.

            ### Content attributes

            Attribute | Description         | Default
            ----------|---------------------|----------------------------------------
            `sticky` | Element that remains at the top when the header condenses. | The first app-toolbar in the light DOM.


            ## Styling

            Mixin | Description | Default
            ------|-------------|----------
            `--app-header-background-front-layer` | Applies to the front layer of the background. | {}
            `--app-header-background-rear-layer` | Applies to the rear layer of the background. | {}
            `--app-header-shadow` | Applies to the shadow. | {}

            @element app-header
            @demo app-header/demo/blend-background-1.html Blend Background Image
            @demo app-header/demo/blend-background-2.html Blend 2 Background Images
            @demo app-header/demo/blend-background-3.html Blend Background Colors
            @demo app-header/demo/contacts.html Contacts Demo
            @demo app-header/demo/give.html Resize Snapped Title Demo
            @demo app-header/demo/music.html Reveals Demo
            @demo app-header/demo/no-effects.html Condenses and Reveals Demo
            @demo app-header/demo/notes.html Fixed with Dynamic Shadow Demo
            @demo app-header/demo/custom-sticky-element-1.html Custom Sticky Element Demo 1
            @demo app-header/demo/custom-sticky-element-2.html Custom Sticky Element Demo 2

            */
            Polymer({
              /** @override */
              _template: html$1`
    <style>
      :host {
        position: relative;
        display: block;
        transition-timing-function: linear;
        transition-property: -webkit-transform;
        transition-property: transform;
      }

      :host::before {
        position: absolute;
        right: 0px;
        bottom: -5px;
        left: 0px;
        width: 100%;
        height: 5px;
        content: "";
        transition: opacity 0.4s;
        pointer-events: none;
        opacity: 0;
        box-shadow: inset 0px 5px 6px -3px rgba(0, 0, 0, 0.4);
        will-change: opacity;
        @apply --app-header-shadow;
      }

      :host([shadow])::before {
        opacity: 1;
      }

      #background {
        @apply --layout-fit;
        overflow: hidden;
      }

      #backgroundFrontLayer,
      #backgroundRearLayer {
        @apply --layout-fit;
        height: 100%;
        pointer-events: none;
        background-size: cover;
      }

      #backgroundFrontLayer {
        @apply --app-header-background-front-layer;
      }

      #backgroundRearLayer {
        opacity: 0;
        @apply --app-header-background-rear-layer;
      }

      #contentContainer {
        position: relative;
        width: 100%;
        height: 100%;
      }

      :host([disabled]),
      :host([disabled])::after,
      :host([disabled]) #backgroundFrontLayer,
      :host([disabled]) #backgroundRearLayer,
      /* Silent scrolling should not run CSS transitions */
      :host([silent-scroll]),
      :host([silent-scroll])::after,
      :host([silent-scroll]) #backgroundFrontLayer,
      :host([silent-scroll]) #backgroundRearLayer {
        transition: none !important;
      }

      :host([disabled]) ::slotted(app-toolbar:first-of-type),
      :host([disabled]) ::slotted([sticky]),
      /* Silent scrolling should not run CSS transitions */
      :host([silent-scroll]) ::slotted(app-toolbar:first-of-type),
      :host([silent-scroll]) ::slotted([sticky]) {
        transition: none !important;
      }

    </style>
    <div id="contentContainer">
      <slot id="slot"></slot>
    </div>
`,

              is: 'app-header',
              behaviors: [AppScrollEffectsBehavior, AppLayoutBehavior],

              properties: {
                /**
                 * If true, the header will automatically collapse when scrolling down.
                 * That is, the `sticky` element remains visible when the header is fully
                 *condensed whereas the rest of the elements will collapse below `sticky`
                 *element.
                 *
                 * By default, the `sticky` element is the first toolbar in the light DOM:
                 *
                 *```html
                 * <app-header condenses>
                 *   <app-toolbar>This toolbar remains on top</app-toolbar>
                 *   <app-toolbar></app-toolbar>
                 *   <app-toolbar></app-toolbar>
                 * </app-header>
                 * ```
                 *
                 * Additionally, you can specify which toolbar or element remains visible in
                 *condensed mode by adding the `sticky` attribute to that element. For
                 *example: if we want the last toolbar to remain visible, we can add the
                 *`sticky` attribute to it.
                 *
                 *```html
                 * <app-header condenses>
                 *   <app-toolbar></app-toolbar>
                 *   <app-toolbar></app-toolbar>
                 *   <app-toolbar sticky>This toolbar remains on top</app-toolbar>
                 * </app-header>
                 * ```
                 *
                 * Note the `sticky` element must be a direct child of `app-header`.
                 */
                condenses: {type: Boolean, value: false},

                /**
                 * Mantains the header fixed at the top so it never moves away.
                 */
                fixed: {type: Boolean, value: false},

                /**
                 * Slides back the header when scrolling back up.
                 */
                reveals: {type: Boolean, value: false},

                /**
                 * Displays a shadow below the header.
                 */
                shadow: {type: Boolean, reflectToAttribute: true, value: false}
              },

              observers: ['_configChanged(isAttached, condenses, fixed)'],

              /**
               * A cached offsetHeight of the current element.
               *
               * @type {number}
               */
              _height: 0,

              /**
               * The distance in pixels the header will be translated to when scrolling.
               *
               * @type {number}
               */
              _dHeight: 0,

              /**
               * The offsetTop of `_stickyEl`
               *
               * @type {number}
               */
              _stickyElTop: 0,

              /**
               * A reference to the element that remains visible when the header condenses.
               *
               * @type {HTMLElement}
               */
              _stickyElRef: null,

              /**
               * The header's top value used for the `transformY`
               *
               * @type {number}
               */
              _top: 0,

              /**
               * The current scroll progress.
               *
               * @type {number}
               */
              _progress: 0,

              _wasScrollingDown: false,
              _initScrollTop: 0,
              _initTimestamp: 0,
              _lastTimestamp: 0,
              _lastScrollTop: 0,

              /**
               * The distance the header is allowed to move away.
               *
               * @type {number}
               */
              get _maxHeaderTop() {
                return this.fixed ? this._dHeight : this._height + 5;
              },

              /**
               * Returns a reference to the sticky element.
               *
               * @return {HTMLElement}?
               */
              get _stickyEl() {
                if (this._stickyElRef) {
                  return this._stickyElRef;
                }
                var nodes = dom(this.$.slot).getDistributedNodes();
                // Get the element with the sticky attribute on it or the first element in
                // the light DOM.
                for (var i = 0, node; node = /** @type {!HTMLElement} */ (nodes[i]); i++) {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute('sticky')) {
                      this._stickyElRef = node;
                      break;
                    } else if (!this._stickyElRef) {
                      this._stickyElRef = node;
                    }
                  }
                }
                return this._stickyElRef;
              },

              _configChanged: function() {
                this.resetLayout();
                this._notifyLayoutChanged();
              },

              _updateLayoutStates: function() {
                if (this.offsetWidth === 0 && this.offsetHeight === 0) {
                  return;
                }
                var scrollTop = this._clampedScrollTop;
                var firstSetup = this._height === 0 || scrollTop === 0;
                var currentDisabled = this.disabled;
                this._height = this.offsetHeight;
                this._stickyElRef = null;
                this.disabled = true;
                // prepare for measurement
                if (!firstSetup) {
                  this._updateScrollState(0, true);
                }
                if (this._mayMove()) {
                  this._dHeight =
                      this._stickyEl ? this._height - this._stickyEl.offsetHeight : 0;
                } else {
                  this._dHeight = 0;
                }
                this._stickyElTop = this._stickyEl ? this._stickyEl.offsetTop : 0;
                this._setUpEffect();
                if (firstSetup) {
                  this._updateScrollState(scrollTop, true);
                } else {
                  this._updateScrollState(this._lastScrollTop, true);
                  this._layoutIfDirty();
                }
                // restore no transition
                this.disabled = currentDisabled;
              },

              /**
               * Updates the scroll state.
               *
               * @param {number} scrollTop
               * @param {boolean=} forceUpdate (default: false)
               */
              _updateScrollState: function(scrollTop, forceUpdate) {
                if (this._height === 0) {
                  return;
                }
                var progress = 0;
                var top = 0;
                var lastTop = this._top;
                var lastScrollTop = this._lastScrollTop;
                var maxHeaderTop = this._maxHeaderTop;
                var dScrollTop = scrollTop - this._lastScrollTop;
                var absDScrollTop = Math.abs(dScrollTop);
                var isScrollingDown = scrollTop > this._lastScrollTop;
                var now = performance.now();

                if (this._mayMove()) {
                  top = this._clamp(
                      this.reveals ? lastTop + dScrollTop : scrollTop, 0, maxHeaderTop);
                }
                if (scrollTop >= this._dHeight) {
                  top = this.condenses && !this.fixed ? Math.max(this._dHeight, top) : top;
                  this.style.transitionDuration = '0ms';
                }
                if (this.reveals && !this.disabled && absDScrollTop < 100) {
                  // set the initial scroll position
                  if (now - this._initTimestamp > 300 ||
                      this._wasScrollingDown !== isScrollingDown) {
                    this._initScrollTop = scrollTop;
                    this._initTimestamp = now;
                  }
                  if (scrollTop >= maxHeaderTop) {
                    // check if the header is allowed to snap
                    if (Math.abs(this._initScrollTop - scrollTop) > 30 ||
                        absDScrollTop > 10) {
                      if (isScrollingDown && scrollTop >= maxHeaderTop) {
                        top = maxHeaderTop;
                      } else if (!isScrollingDown && scrollTop >= this._dHeight) {
                        top = this.condenses && !this.fixed ? this._dHeight : 0;
                      }
                      var scrollVelocity = dScrollTop / (now - this._lastTimestamp);
                      this.style.transitionDuration =
                          this._clamp((top - lastTop) / scrollVelocity, 0, 300) + 'ms';
                    } else {
                      top = this._top;
                    }
                  }
                }
                if (this._dHeight === 0) {
                  progress = scrollTop > 0 ? 1 : 0;
                } else {
                  progress = top / this._dHeight;
                }
                if (!forceUpdate) {
                  this._lastScrollTop = scrollTop;
                  this._top = top;
                  this._wasScrollingDown = isScrollingDown;
                  this._lastTimestamp = now;
                }
                if (forceUpdate || progress !== this._progress || lastTop !== top ||
                    scrollTop === 0) {
                  this._progress = progress;
                  this._runEffects(progress, top);
                  this._transformHeader(top);
                }
              },

              /**
               * Returns true if the current header is allowed to move as the user scrolls.
               *
               * @return {boolean}
               */
              _mayMove: function() {
                return this.condenses || !this.fixed;
              },

              /**
               * Returns true if the current header will condense based on the size of the
               * header and the `consenses` property.
               *
               * @return {boolean}
               */
              willCondense: function() {
                return this._dHeight > 0 && this.condenses;
              },

              /**
               * Returns true if the current element is on the screen.
               * That is, visible in the current viewport.
               *
               * @method isOnScreen
               * @return {boolean}
               */
              isOnScreen: function() {
                return this._height !== 0 && this._top < this._height;
              },

              /**
               * Returns true if there's content below the current element.
               *
               * @method isContentBelow
               * @return {boolean}
               */
              isContentBelow: function() {
                return this._top === 0 ? this._clampedScrollTop > 0 :
                                         this._clampedScrollTop - this._maxHeaderTop >= 0;
              },

              /**
               * Transforms the header.
               *
               * @param {number} y
               */
              _transformHeader: function(y) {
                this.translate3d(0, (-y) + 'px', 0);
                if (this._stickyEl) {
                  this.translate3d(
                      0,
                      this.condenses && y >= this._stickyElTop ?
                          (Math.min(y, this._dHeight) - this._stickyElTop) + 'px' :
                          0,
                      0,
                      this._stickyEl);
                }
              },

              _clamp: function(v, min, max) {
                return Math.min(max, Math.max(min, v));
              },

              _ensureBgContainers: function() {
                if (!this._bgContainer) {
                  this._bgContainer = document.createElement('div');
                  this._bgContainer.id = 'background';
                  this._bgRear = document.createElement('div');
                  this._bgRear.id = 'backgroundRearLayer';
                  this._bgContainer.appendChild(this._bgRear);
                  this._bgFront = document.createElement('div');
                  this._bgFront.id = 'backgroundFrontLayer';
                  this._bgContainer.appendChild(this._bgFront);
                  dom(this.root).insertBefore(this._bgContainer, this.$.contentContainer);
                }
              },

              _getDOMRef: function(id) {
                switch (id) {
                  case 'backgroundFrontLayer':
                    this._ensureBgContainers();
                    return this._bgFront;
                  case 'backgroundRearLayer':
                    this._ensureBgContainers();
                    return this._bgRear;
                  case 'background':
                    this._ensureBgContainers();
                    return this._bgContainer;
                  case 'mainTitle':
                    return dom(this).querySelector('[main-title]');
                  case 'condensedTitle':
                    return dom(this).querySelector('[condensed-title]');
                }
                return null;
              },

              /**
               * Returns an object containing the progress value of the scroll effects
               * and the top position of the header.
               *
               * @method getScrollState
               * @return {Object}
               */
              getScrollState: function() {
                return {progress: this._progress, top: this._top};
              }
            });

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

            /**
            app-header-layout is a wrapper element that positions an app-header and other
            content. This element uses the document scroll by default, but it can also
            define its own scrolling region.

            Using the document scroll:

            ```html
            <app-header-layout>
              <app-header slot="header" fixed condenses effects="waterfall">
                <app-toolbar>
                  <div main-title>App name</div>
                </app-toolbar>
              </app-header>
              <div>
                main content
              </div>
            </app-header-layout>
            ```

            Using an own scrolling region:

            ```html
            <app-header-layout has-scrolling-region style="width: 300px; height: 400px;">
              <app-header slot="header" fixed condenses effects="waterfall">
                <app-toolbar>
                  <div main-title>App name</div>
                </app-toolbar>
              </app-header>
              <div>
                main content
              </div>
            </app-header-layout>
            ```

            Add the `fullbleed` attribute to app-header-layout to make it fit the size of
            its container:

            ```html
            <app-header-layout fullbleed>
             ...
            </app-header-layout>
            ```

            @element app-header-layout
            @demo app-header-layout/demo/simple.html Simple Demo
            @demo app-header-layout/demo/scrolling-region.html Scrolling Region
            @demo app-header-layout/demo/music.html Music Demo
            @demo app-header-layout/demo/footer.html Footer Demo
            */
            Polymer({
              /** @override */
              _template: html$1`
    <style>
      :host {
        display: block;
        /**
         * Force app-header-layout to have its own stacking context so that its parent can
         * control the stacking of it relative to other elements (e.g. app-drawer-layout).
         * This could be done using \`isolation: isolate\`, but that's not well supported
         * across browsers.
         */
        position: relative;
        z-index: 0;
      }

      #wrapper ::slotted([slot=header]) {
        @apply --layout-fixed-top;
        z-index: 1;
      }

      #wrapper.initializing ::slotted([slot=header]) {
        position: relative;
      }

      :host([has-scrolling-region]) {
        height: 100%;
      }

      :host([has-scrolling-region]) #wrapper ::slotted([slot=header]) {
        position: absolute;
      }

      :host([has-scrolling-region]) #wrapper.initializing ::slotted([slot=header]) {
        position: relative;
      }

      :host([has-scrolling-region]) #wrapper #contentContainer {
        @apply --layout-fit;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      :host([has-scrolling-region]) #wrapper.initializing #contentContainer {
        position: relative;
      }

      :host([fullbleed]) {
        @apply --layout-vertical;
        @apply --layout-fit;
      }

      :host([fullbleed]) #wrapper,
      :host([fullbleed]) #wrapper #contentContainer {
        @apply --layout-vertical;
        @apply --layout-flex;
      }

      #contentContainer {
        /* Create a stacking context here so that all children appear below the header. */
        position: relative;
        z-index: 0;
      }

      @media print {
        :host([has-scrolling-region]) #wrapper #contentContainer {
          overflow-y: visible;
        }
      }

    </style>

    <div id="wrapper" class="initializing">
      <slot id="headerSlot" name="header"></slot>

      <div id="contentContainer">
        <slot></slot>
      </div>
    </div>
`,

              is: 'app-header-layout',
              behaviors: [AppLayoutBehavior],

              properties: {
                /**
                 * If true, the current element will have its own scrolling region.
                 * Otherwise, it will use the document scroll to control the header.
                 */
                hasScrollingRegion: {type: Boolean, value: false, reflectToAttribute: true}
              },

              observers: ['resetLayout(isAttached, hasScrollingRegion)'],

              /**
               * A reference to the app-header element.
               *
               * @property header
               */
              get header() {
                return dom(this.$.headerSlot).getDistributedNodes()[0];
              },

              _updateLayoutStates: function() {
                var header = this.header;
                if (!this.isAttached || !header) {
                  return;
                }
                // Remove the initializing class, which staticly positions the header and
                // the content until the height of the header can be read.
                this.$.wrapper.classList.remove('initializing');
                // Update scroll target.
                header.scrollTarget = this.hasScrollingRegion ?
                    this.$.contentContainer :
                    this.ownerDocument.documentElement;
                // Get header height here so that style reads are batched together before
                // style writes (i.e. getBoundingClientRect() below).
                var headerHeight = header.offsetHeight;
                // Update the header position.
                if (!this.hasScrollingRegion) {
                  requestAnimationFrame(function() {
                    var rect = this.getBoundingClientRect();
                    var rightOffset = document.documentElement.clientWidth - rect.right;
                    header.style.left = rect.left + 'px';
                    header.style.right = rightOffset + 'px';
                  }.bind(this));
                } else {
                  header.style.left = '';
                  header.style.right = '';
                }
                // Update the content container position.
                var containerStyle = this.$.contentContainer.style;
                if (header.fixed && !header.condenses && this.hasScrollingRegion) {
                  // If the header size does not change and we're using a scrolling region,
                  // exclude the header area from the scrolling region so that the header
                  // doesn't overlap the scrollbar.
                  containerStyle.marginTop = headerHeight + 'px';
                  containerStyle.paddingTop = '';
                } else {
                  containerStyle.paddingTop = headerHeight + 'px';
                  containerStyle.marginTop = '';
                }
              }
            });

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

            /**
            app-toolbar is a horizontal toolbar containing items that can be used for
            label, navigation, search and actions.

            ### Example

            Add a title to the toolbar.

            ```html
            <app-toolbar>
              <div main-title>App name</div>
            </app-toolbar>
            ```

            Add a button to the left and right side of the toolbar.

            ```html
            <app-toolbar>
              <paper-icon-button icon="menu"></paper-icon-button>
              <div main-title>App name</div>
              <paper-icon-button icon="search"></paper-icon-button>
            </app-toolbar>
            ```

            You can use the attributes `top-item` or `bottom-item` to completely fit an
            element to the top or bottom of the toolbar respectively.

            ### Content attributes

            Attribute            | Description
            ---------------------|---------------------------------------------------------
            `main-title`         | The main title element.
            `condensed-title`    | The title element if used inside a condensed app-header.
            `spacer`             | Adds a left margin of `64px`.
            `bottom-item`        | Sticks the element to the bottom of the toolbar.
            `top-item`           | Sticks the element to the top of the toolbar.

            ### Styling

            Custom property              | Description                  | Default
            -----------------------------|------------------------------|-----------------------
            `--app-toolbar-font-size`    | Toolbar font size            | 20px

            @element app-toolbar
            @demo app-toolbar/demo/index.html
            */
            Polymer({
              /** @override */
              _template: html$1`
    <style>

      :host {
        @apply --layout-horizontal;
        @apply --layout-center;
        position: relative;
        height: 64px;
        padding: 0 16px;
        pointer-events: none;
        font-size: var(--app-toolbar-font-size, 20px);
      }

      :host ::slotted(*) {
        pointer-events: auto;
      }

      :host ::slotted(paper-icon-button) {
        /* paper-icon-button/issues/33 */
        font-size: 0;
      }

      :host ::slotted([main-title]),
      :host ::slotted([condensed-title]) {
        pointer-events: none;
        @apply --layout-flex;
      }

      :host ::slotted([bottom-item]) {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
      }

      :host ::slotted([top-item]) {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
      }

      :host ::slotted([spacer]) {
        margin-left: 64px;
      }
    </style>

    <slot></slot>
`,

              is: 'app-toolbar'
            });

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

            /**
            app-box is a container element that can have scroll effects - visual effects
            based on scroll position. For example, the parallax effect can be used to move
            an image at a slower rate than the foreground.

            ```html
            <app-box style="height: 100px;" effects="parallax-background">
              <img slot="background" src="picture.png" style="width: 100%; height: 600px;">
            </app-box>
            ```

            Notice the `background` attribute in the `img` element; this attribute specifies
            that that image is used as the background. By adding the background to the light
            dom, you can compose backgrounds that can change dynamically. Alternatively, the
            mixin `--app-box-background-front-layer` allows to style the background. For
            example:

            ```css
              .parallaxAppBox {
                --app-box-background-front-layer: {
                  background-image: url(picture.png);
                };
              }
            ```

            Finally, app-box can have content inside. For example:

            ```html
            <app-box effects="parallax-background">
              <h2>Sub title</h2>
            </app-box>
            ```

            #### Importing the effects

            To use the scroll effects, you must explicitly import them in addition to
            `app-box`:

            ```js
            import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
            ```

            #### List of effects

            * **parallax-background**
            A simple parallax effect that vertically translates the backgrounds based on a
            fraction of the scroll position. For example:

            ```css
            app-header {
              --app-header-background-front-layer: {
                background-image: url(...);
              };
            }
            ```
            ```html
            <app-header style="height: 300px;" effects="parallax-background">
              <app-toolbar>App name</app-toolbar>
            </app-header>
            ```

            The fraction determines how far the background moves relative to the scroll
            position. This value can be assigned via the `scalar` config value and it is
            typically a value between 0 and 1 inclusive. If `scalar=0`, the background
            doesn't move away from the header.

            ## Styling

            Mixin | Description | Default
            ----------------|-------------|----------
            `--app-box-background-front-layer` | Applies to the front layer of the background | {}

            @element app-box
            @demo app-box/demo/document-scroll.html Document Scroll
            @demo app-box/demo/scrolling-region.html Scrolling Region
            */
            Polymer({
              /** @override */
              _template: html$1`
    <style>
      :host {
        position: relative;
        display: block;
      }

      #background {
        @apply --layout-fit;
        overflow: hidden;
        height: 100%;
      }

      #backgroundFrontLayer {
        min-height: 100%;
        pointer-events: none;
        background-size: cover;
        @apply --app-box-background-front-layer;
      }

      #contentContainer {
        position: relative;
        width: 100%;
        height: 100%;
      }

      :host([disabled]),
      :host([disabled]) #backgroundFrontLayer {
        transition: none !important;
      }
    </style>

    <div id="background">
      <div id="backgroundFrontLayer">
        <slot name="background"></slot>
      </div>
    </div>
    <div id="contentContainer">
      <slot></slot>
    </div>
`,

              is: 'app-box',
              behaviors: [AppScrollEffectsBehavior, IronResizableBehavior],
              listeners: {'iron-resize': '_resizeHandler'},

              /**
               * The current scroll progress.
               *
               * @type {number}
               */
              _progress: 0,

              /** @override */
              attached: function() {
                this.resetLayout();
              },

              _debounceRaf: function(fn) {
                var self = this;
                if (this._raf) {
                  window.cancelAnimationFrame(this._raf);
                }
                this._raf = window.requestAnimationFrame(function() {
                  self._raf = null;
                  fn.call(self);
                });
              },

              /**
               * Resets the layout. This method is automatically called when the element is
               * attached to the DOM.
               *
               * @method resetLayout
               */
              resetLayout: function() {
                this._debounceRaf(function() {
                  // noop if the box isn't in the rendered tree
                  if (this.offsetWidth === 0 && this.offsetHeight === 0) {
                    return;
                  }

                  var scrollTop = this._clampedScrollTop;
                  var savedDisabled = this.disabled;

                  this.disabled = true;
                  this._elementTop = this._getElementTop();
                  this._elementHeight = this.offsetHeight;
                  this._cachedScrollTargetHeight = this._scrollTargetHeight;
                  this._setUpEffect();
                  this._updateScrollState(scrollTop);
                  this.disabled = savedDisabled;
                });
              },

              _getElementTop: function() {
                var currentNode = this;
                var top = 0;

                while (currentNode && currentNode !== this.scrollTarget) {
                  top += currentNode.offsetTop;
                  currentNode = currentNode.offsetParent;
                }
                return top;
              },

              _updateScrollState: function(scrollTop) {
                if (this.isOnScreen()) {
                  var viewportTop = this._elementTop - scrollTop;
                  this._progress = 1 -
                      (viewportTop + this._elementHeight) / this._cachedScrollTargetHeight;
                  this._runEffects(this._progress, scrollTop);
                }
              },

              /**
               * Returns true if this app-box is on the screen.
               * That is, visible in the current viewport.
               *
               * @method isOnScreen
               * @return {boolean}
               */
              isOnScreen: function() {
                return this._elementTop <
                    this._scrollTop + this._cachedScrollTargetHeight &&
                    this._elementTop + this._elementHeight > this._scrollTop;
              },

              _resizeHandler: function() {
                this.resetLayout();
              },

              _getDOMRef: function(id) {
                if (id === 'background') {
                  return this.$.background;
                }
                if (id === 'backgroundFrontLayer') {
                  return this.$.backgroundFrontLayer;
                }
              },

              /**
               * Returns an object containing the progress value of the scroll effects.
               *
               * @method getScrollState
               * @return {Object}
               */
              getScrollState: function() {
                return {progress: this._progress};
              }
            });

            class AppView extends connect(store)(LitElement) {
                static get properties () {
                    return {
                        loggedIn: {
                            type: Boolean,
                            hasChanged: (some, thing) => {
                            // console.log('loggedIn CHANGED!!!', some, thing)
                            }
                        },
                        config: { type: Object },
                        urls: { type: Object }
                    }
                }

                static get styles () {
                    return [
                        css`
            :host {
                --app-drawer-width: 260px;;
            }

            app-drawer-layout:not([narrow]) [drawer-toggle]:not(sidenav-menu) {
                display: none;
            }

            app-drawer {
                box-shadow: var(--shadow-2);
                background: var(--mdc-theme-surface);
            }
            app-header {
                box-shadow: var(--shadow-2);
            }
            app-toolbar {
                background: var(--mdc-theme-surface);
                color: var(--mdc-theme-on-surface);
            }
        `
                    ]
                }

                render () {
                    return html`
        <style>

        </style>
        <!--style="height: var(--window-height);" -->
        <app-drawer-layout responsive-width='${getComputedStyle(document.body).getPropertyValue('--layout-breakpoint-desktop')}' fullbleed >
            <app-drawer swipe-open slot="drawer" id="appdrawer">
                <app-header-layout>

                    <wallet-profile></wallet-profile>

                    <sidenav-menu drawer-toggle></sidenav-menu>

                </app-header-layout>
            </app-drawer>

            <app-header-layout style="height: var(--window-height);">

                <app-header id='appHeader' slot="header" fixedd>
                    <app-toolbar>

                        <paper-icon-button class="menu-toggle-button" drawer-toggle icon="menu"></paper-icon-button>

                        <div main-title>
                            <span class="qora-title">
                                <img src="${this.config.coin.logo}" style="height:32px; padding-left:12px;">
                                <!-- &nbsp;${this.config.coin.name} -->
                            </span>

                            <small>
                                <!-- <i>{{ route.path }}#{{ hashRoute.path }}</i> -->
                            </small>
                        </div>

                        <template is="dom-repeat" items="{{topMenuItems}}">
                            <paper-button style="font-size:16px; height:40px;" on-tap="_openTopMenuModal">{{ item.text }}&nbsp;<iron-icon icon="{{item.icon}}"></iron-icon></paper-button>
                        </template>

                        <div style="display:inline">
                            <!-- <paper-icon-button icon="icons:settings" on-tap="openSettings"></paper-icon-button> -->
                                <paper-icon-button title="Log out" icon="icons:power-settings-new" style="background:#fff; border-radius:50%;" @click=${e => this.logout(e)}></paper-icon-button>
                        </div>
                    </app-toolbar>
                </app-header>

                <show-plugin size='100' logged-in="{{loggedIn}}" config="{{config}}" current-plugin-frame="{{currentPluginFrame}}" route="{{route}}" data="{{routeData}}" subroute="{{subroute}}" url="{{activeUrl}}"></show-plugin>
                    
            </app-header-layout >
        </app-drawer-layout >
    `
                }

                constructor () {
                    super();
                    // console.log('loading plugins')
                    loadPlugins();
                }

                firstUpdated () {
                //
                }

                stateChanged (state) {
                    this.loggedIn = state.app.loggedIn;
                    this.config = state.config;
                    this.urls = state.app.registeredUrls;
                }

                async logout (e) {
                    console.log('LOGGIN OUTTT');
                    // Add a glorious animation please!
                    store.dispatch(doLogout());
                }
            }

            window.customElements.define('app-view', AppView);

        }
    };
});
//# sourceMappingURL=app-view.js.map
