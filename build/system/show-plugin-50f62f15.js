System.register(['./default-theme-f4872173.js', './pwa-helpers-e04d8fac.js', './typography-df547440.js', './iron-a11y-keys-behavior-c9affbac.js', './iron-overlay-behavior-914e647b.js'], function (exports) {
    'use strict';
    var connect, store, LitElement, css, html$1, doAddPluginUrl, request, api, createTransaction$1, processTransaction$1, Epml, html, dom, Polymer, IronOverlayBehavior;
    return {
        setters: [function () {}, function (module) {
            connect = module.u;
            store = module.s;
            LitElement = module.L;
            css = module.c;
            html$1 = module.h;
        }, function (module) {
            doAddPluginUrl = module.g;
            request = module.r;
            api = module.h;
            createTransaction$1 = module.j;
            processTransaction$1 = module.p;
            Epml = module.k;
        }, function (module) {
            html = module.h;
            dom = module.d;
            Polymer = module.P;
        }, function (module) {
            IronOverlayBehavior = module.I;
        }],
        execute: function () {

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
            const template = html`
<custom-style>
  <style is="custom-style">
    html {

      --shadow-transition: {
        transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      };

      --shadow-none: {
        box-shadow: none;
      };

      /* from http://codepen.io/shyndman/pen/c5394ddf2e8b2a5c9185904b57421cdb */

      --shadow-elevation-2dp: {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
      };

      --shadow-elevation-3dp: {
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
                    0 1px 8px 0 rgba(0, 0, 0, 0.12),
                    0 3px 3px -2px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-4dp: {
        box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12),
                    0 2px 4px -1px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-6dp: {
        box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                    0 1px 18px 0 rgba(0, 0, 0, 0.12),
                    0 3px 5px -1px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-8dp: {
        box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12),
                    0 5px 5px -3px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-12dp: {
        box-shadow: 0 12px 16px 1px rgba(0, 0, 0, 0.14),
                    0 4px 22px 3px rgba(0, 0, 0, 0.12),
                    0 6px 7px -4px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-16dp: {
        box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                    0  6px 30px 5px rgba(0, 0, 0, 0.12),
                    0  8px 10px -5px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-24dp: {
        box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
                    0 9px 46px 8px rgba(0, 0, 0, 0.12),
                    0 11px 15px -7px rgba(0, 0, 0, 0.4);
      };
    }
  </style>
</custom-style>`;
            template.setAttribute('style', 'display: none;');
            document.head.appendChild(template.content);

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
            const $_documentContainer = document.createElement('template');
            $_documentContainer.setAttribute('style', 'display: none;');

            $_documentContainer.innerHTML = `<dom-module id="paper-dialog-shared-styles">
  <template>
    <style>
      :host {
        display: block;
        margin: 24px 40px;

        background: var(--paper-dialog-background-color, var(--primary-background-color));
        color: var(--paper-dialog-color, var(--primary-text-color));

        @apply --paper-font-body1;
        @apply --shadow-elevation-16dp;
        @apply --paper-dialog;
      }

      :host > ::slotted(*) {
        margin-top: 20px;
        padding: 0 24px;
      }

      :host > ::slotted(.no-padding) {
        padding: 0;
      }

      
      :host > ::slotted(*:first-child) {
        margin-top: 24px;
      }

      :host > ::slotted(*:last-child) {
        margin-bottom: 24px;
      }

      /* In 1.x, this selector was \`:host > ::content h2\`. In 2.x <slot> allows
      to select direct children only, which increases the weight of this
      selector, so we have to re-define first-child/last-child margins below. */
      :host > ::slotted(h2) {
        position: relative;
        margin: 0;

        @apply --paper-font-title;
        @apply --paper-dialog-title;
      }

      /* Apply mixin again, in case it sets margin-top. */
      :host > ::slotted(h2:first-child) {
        margin-top: 24px;
        @apply --paper-dialog-title;
      }

      /* Apply mixin again, in case it sets margin-bottom. */
      :host > ::slotted(h2:last-child) {
        margin-bottom: 24px;
        @apply --paper-dialog-title;
      }

      :host > ::slotted(.paper-dialog-buttons),
      :host > ::slotted(.buttons) {
        position: relative;
        padding: 8px 8px 8px 24px;
        margin: 0;

        color: var(--paper-dialog-button-color, var(--primary-color));

        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>
  </template>
</dom-module>`;

            document.head.appendChild($_documentContainer.content);

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
             * `NeonAnimatableBehavior` is implemented by elements containing
             * animations for use with elements implementing
             * `NeonAnimationRunnerBehavior`.
             * @polymerBehavior
             */
            const NeonAnimatableBehavior = {

              properties: {

                /**
                 * Animation configuration. See README for more info.
                 */
                animationConfig: {type: Object},

                /**
                 * Convenience property for setting an 'entry' animation. Do not set
                 * `animationConfig.entry` manually if using this. The animated node is set
                 * to `this` if using this property.
                 */
                entryAnimation: {
                  observer: '_entryAnimationChanged',
                  type: String,
                },

                /**
                 * Convenience property for setting an 'exit' animation. Do not set
                 * `animationConfig.exit` manually if using this. The animated node is set
                 * to `this` if using this property.
                 */
                exitAnimation: {
                  observer: '_exitAnimationChanged',
                  type: String,
                },

              },

              _entryAnimationChanged: function() {
                this.animationConfig = this.animationConfig || {};
                this.animationConfig['entry'] = [{name: this.entryAnimation, node: this}];
              },

              _exitAnimationChanged: function() {
                this.animationConfig = this.animationConfig || {};
                this.animationConfig['exit'] = [{name: this.exitAnimation, node: this}];
              },

              _copyProperties: function(config1, config2) {
                // shallowly copy properties from config2 to config1
                for (var property in config2) {
                  config1[property] = config2[property];
                }
              },

              _cloneConfig: function(config) {
                var clone = {isClone: true};
                this._copyProperties(clone, config);
                return clone;
              },

              _getAnimationConfigRecursive: function(type, map, allConfigs) {
                if (!this.animationConfig) {
                  return;
                }

                if (this.animationConfig.value &&
                    typeof this.animationConfig.value === 'function') {
                  this._warn(this._logf(
                      'playAnimation',
                      'Please put \'animationConfig\' inside of your components \'properties\' object instead of outside of it.'));
                  return;
                }

                // type is optional
                var thisConfig;
                if (type) {
                  thisConfig = this.animationConfig[type];
                } else {
                  thisConfig = this.animationConfig;
                }

                if (!Array.isArray(thisConfig)) {
                  thisConfig = [thisConfig];
                }

                // iterate animations and recurse to process configurations from child nodes
                if (thisConfig) {
                  for (var config, index = 0; config = thisConfig[index]; index++) {
                    if (config.animatable) {
                      config.animatable._getAnimationConfigRecursive(
                          config.type || type, map, allConfigs);
                    } else {
                      if (config.id) {
                        var cachedConfig = map[config.id];
                        if (cachedConfig) {
                          // merge configurations with the same id, making a clone lazily
                          if (!cachedConfig.isClone) {
                            map[config.id] = this._cloneConfig(cachedConfig);
                            cachedConfig = map[config.id];
                          }
                          this._copyProperties(cachedConfig, config);
                        } else {
                          // put any configs with an id into a map
                          map[config.id] = config;
                        }
                      } else {
                        allConfigs.push(config);
                      }
                    }
                  }
                }
              },

              /**
               * An element implementing `NeonAnimationRunnerBehavior` calls this
               * method to configure an animation with an optional type. Elements
               * implementing `NeonAnimatableBehavior` should define the property
               * `animationConfig`, which is either a configuration object or a map of
               * animation type to array of configuration objects.
               */
              getAnimationConfig: function(type) {
                var map = {};
                var allConfigs = [];
                this._getAnimationConfigRecursive(type, map, allConfigs);
                // append the configurations saved in the map to the array
                for (var key in map) {
                  allConfigs.push(map[key]);
                }
                return allConfigs;
              }

            };

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
             * `NeonAnimationRunnerBehavior` adds a method to run animations.
             *
             * @polymerBehavior NeonAnimationRunnerBehavior
             */
            const NeonAnimationRunnerBehaviorImpl = {

              _configureAnimations: function(configs) {
                var results = [];
                var resultsToPlay = [];

                if (configs.length > 0) {
                  for (let config, index = 0; config = configs[index]; index++) {
                    let neonAnimation = document.createElement(config.name);
                    // is this element actually a neon animation?
                    if (neonAnimation.isNeonAnimation) {
                      let result = null;
                      // Closure compiler does not work well with a try / catch here.
                      // .configure needs to be explicitly defined
                      if (!neonAnimation.configure) {
                        /**
                         * @param {Object} config
                         * @return {AnimationEffectReadOnly}
                         */
                        neonAnimation.configure = function(config) {
                          return null;
                        };
                      }

                      result = neonAnimation.configure(config);
                      resultsToPlay.push({
                        result: result,
                        config: config,
                        neonAnimation: neonAnimation,
                      });
                    } else {
                      console.warn(this.is + ':', config.name, 'not found!');
                    }
                  }
                }

                for (var i = 0; i < resultsToPlay.length; i++) {
                  let result = resultsToPlay[i].result;
                  let config = resultsToPlay[i].config;
                  let neonAnimation = resultsToPlay[i].neonAnimation;
                  // configuration or play could fail if polyfills aren't loaded
                  try {
                    // Check if we have an Effect rather than an Animation
                    if (typeof result.cancel != 'function') {
                      result = document.timeline.play(result);
                    }
                  } catch (e) {
                    result = null;
                    console.warn('Couldnt play', '(', config.name, ').', e);
                  }

                  if (result) {
                    results.push({
                      neonAnimation: neonAnimation,
                      config: config,
                      animation: result,
                    });
                  }
                }

                return results;
              },

              _shouldComplete: function(activeEntries) {
                var finished = true;
                for (var i = 0; i < activeEntries.length; i++) {
                  if (activeEntries[i].animation.playState != 'finished') {
                    finished = false;
                    break;
                  }
                }
                return finished;
              },

              _complete: function(activeEntries) {
                for (var i = 0; i < activeEntries.length; i++) {
                  activeEntries[i].neonAnimation.complete(activeEntries[i].config);
                }
                for (var i = 0; i < activeEntries.length; i++) {
                  activeEntries[i].animation.cancel();
                }
              },

              /**
               * Plays an animation with an optional `type`.
               * @param {string=} type
               * @param {!Object=} cookie
               */
              playAnimation: function(type, cookie) {
                var configs = this.getAnimationConfig(type);
                if (!configs) {
                  return;
                }
                this._active = this._active || {};
                if (this._active[type]) {
                  this._complete(this._active[type]);
                  delete this._active[type];
                }

                var activeEntries = this._configureAnimations(configs);

                if (activeEntries.length == 0) {
                  this.fire('neon-animation-finish', cookie, {bubbles: false});
                  return;
                }

                this._active[type] = activeEntries;

                for (var i = 0; i < activeEntries.length; i++) {
                  activeEntries[i].animation.onfinish = function() {
                    if (this._shouldComplete(activeEntries)) {
                      this._complete(activeEntries);
                      delete this._active[type];
                      this.fire('neon-animation-finish', cookie, {bubbles: false});
                    }
                  }.bind(this);
                }
              },

              /**
               * Cancels the currently running animations.
               */
              cancelAnimation: function() {
                for (var k in this._active) {
                  var entries = this._active[k];

                                for (var j in entries) {
                    entries[j].animation.cancel();
                  }
                }

                this._active = {};
              }
            };

            /** @polymerBehavior */
            const NeonAnimationRunnerBehavior =
                [NeonAnimatableBehavior, NeonAnimationRunnerBehaviorImpl];

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
              Use `Polymer.PaperDialogBehavior` and `paper-dialog-shared-styles.html` to
              implement a Material Design dialog.

              For example, if `<paper-dialog-impl>` implements this behavior:

                  <paper-dialog-impl>
                      <h2>Header</h2>
                      <div>Dialog body</div>
                      <div class="buttons">
                          <paper-button dialog-dismiss>Cancel</paper-button>
                          <paper-button dialog-confirm>Accept</paper-button>
                      </div>
                  </paper-dialog-impl>

              `paper-dialog-shared-styles.html` provide styles for a header, content area,
              and an action area for buttons. Use the `<h2>` tag for the header and the
              `buttons` class for the action area. You can use the `paper-dialog-scrollable`
              element (in its own repository) if you need a scrolling content area.

              Use the `dialog-dismiss` and `dialog-confirm` attributes on interactive
              controls to close the dialog. If the user dismisses the dialog with
              `dialog-confirm`, the `closingReason` will update to include `confirmed:
              true`.

              ### Accessibility

              This element has `role="dialog"` by default. Depending on the context, it may
              be more appropriate to override this attribute with `role="alertdialog"`.

              If `modal` is set, the element will prevent the focus from exiting the
              element. It will also ensure that focus remains in the dialog.

              @hero hero.svg
              @demo demo/index.html
              @polymerBehavior PaperDialogBehavior
             */
            const PaperDialogBehaviorImpl = {

              hostAttributes: {'role': 'dialog', 'tabindex': '-1'},

              properties: {

                /**
                 * If `modal` is true, this implies `no-cancel-on-outside-click`,
                 * `no-cancel-on-esc-key` and `with-backdrop`.
                 */
                modal: {type: Boolean, value: false},

                __readied: {type: Boolean, value: false}

              },

              observers: ['_modalChanged(modal, __readied)'],

              listeners: {'tap': '_onDialogClick'},

              /**
               * @return {void}
               */
              ready: function() {
                // Only now these properties can be read.
                this.__prevNoCancelOnOutsideClick = this.noCancelOnOutsideClick;
                this.__prevNoCancelOnEscKey = this.noCancelOnEscKey;
                this.__prevWithBackdrop = this.withBackdrop;
                this.__readied = true;
              },

              _modalChanged: function(modal, readied) {
                // modal implies noCancelOnOutsideClick, noCancelOnEscKey and withBackdrop.
                // We need to wait for the element to be ready before we can read the
                // properties values.
                if (!readied) {
                  return;
                }

                if (modal) {
                  this.__prevNoCancelOnOutsideClick = this.noCancelOnOutsideClick;
                  this.__prevNoCancelOnEscKey = this.noCancelOnEscKey;
                  this.__prevWithBackdrop = this.withBackdrop;
                  this.noCancelOnOutsideClick = true;
                  this.noCancelOnEscKey = true;
                  this.withBackdrop = true;
                } else {
                  // If the value was changed to false, let it false.
                  this.noCancelOnOutsideClick =
                      this.noCancelOnOutsideClick && this.__prevNoCancelOnOutsideClick;
                  this.noCancelOnEscKey =
                      this.noCancelOnEscKey && this.__prevNoCancelOnEscKey;
                  this.withBackdrop = this.withBackdrop && this.__prevWithBackdrop;
                }
              },

              _updateClosingReasonConfirmed: function(confirmed) {
                this.closingReason = this.closingReason || {};
                this.closingReason.confirmed = confirmed;
              },

              /**
               * Will dismiss the dialog if user clicked on an element with dialog-dismiss
               * or dialog-confirm attribute.
               */
              _onDialogClick: function(event) {
                // Search for the element with dialog-confirm or dialog-dismiss,
                // from the root target until this (excluded).
                var path = dom(event).path;
                for (var i = 0, l = path.indexOf(this); i < l; i++) {
                  var target = path[i];
                  if (target.hasAttribute &&
                      (target.hasAttribute('dialog-dismiss') ||
                       target.hasAttribute('dialog-confirm'))) {
                    this._updateClosingReasonConfirmed(
                        target.hasAttribute('dialog-confirm'));
                    this.close();
                    event.stopPropagation();
                    break;
                  }
                }
              }

            };

            /** @polymerBehavior */
            const PaperDialogBehavior =
                [IronOverlayBehavior, PaperDialogBehaviorImpl];

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
            Material design:
            [Dialogs](https://www.google.com/design/spec/components/dialogs.html)

            `<paper-dialog>` is a dialog with Material Design styling and optional
            animations when it is opened or closed. It provides styles for a header, content
            area, and an action area for buttons. You can use the
            `<paper-dialog-scrollable>` element (in its own repository) if you need a
            scrolling content area. To autofocus a specific child element after opening the
            dialog, give it the `autofocus` attribute. See `Polymer.PaperDialogBehavior` and
            `Polymer.IronOverlayBehavior` for specifics.

            For example, the following code implements a dialog with a header, scrolling
            content area and buttons. Focus will be given to the `dialog-confirm` button
            when the dialog is opened.

                <paper-dialog>
                  <h2>Header</h2>
                  <paper-dialog-scrollable>
                    Lorem ipsum...
                  </paper-dialog-scrollable>
                  <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button dialog-confirm autofocus>Accept</paper-button>
                  </div>
                </paper-dialog>

            ### Styling

            See the docs for `Polymer.PaperDialogBehavior` for the custom properties
            available for styling this element.

            ### Animations

            Set the `entry-animation` and/or `exit-animation` attributes to add an animation
            when the dialog is opened or closed. See the documentation in
            [PolymerElements/neon-animation](https://github.com/PolymerElements/neon-animation)
            for more info.

            For example:

                <script type="module">
                  import '@polymer/neon-animation/animations/fade-out-animation.js';
                  import '@polymer/neon-animation/animations/scale-up-animation.js';
                </script>

                <paper-dialog entry-animation="scale-up-animation"
                              exit-animation="fade-out-animation">
                  <h2>Header</h2>
                  <div>Dialog body</div>
                </paper-dialog>

            ### Accessibility

            See the docs for `Polymer.PaperDialogBehavior` for accessibility features
            implemented by this element.

            @group Paper Elements
            @element paper-dialog
            @hero hero.svg
            @demo demo/index.html
            */
            Polymer({
              _template: html`
    <style include="paper-dialog-shared-styles"></style>
    <slot></slot>
`,

              is: 'paper-dialog',
              behaviors: [PaperDialogBehavior, NeonAnimationRunnerBehavior],
              listeners: {'neon-animation-finish': '_onNeonAnimationFinish'},

              _renderOpened: function() {
                this.cancelAnimation();
                this.playAnimation('entry');
              },

              _renderClosed: function() {
                this.cancelAnimation();
                this.playAnimation('exit');
              },

              _onNeonAnimationFinish: function() {
                if (this.opened) {
                  this._finishRenderOpened();
                } else {
                  this._finishRenderClosed();
                }
              }
            });

            class ConfirmTransactionDialog extends connect(store)(LitElement) {
                static get properties () {
                    return {
                        txInfo: { type: Object }
                    }
                }

                static get styles () {
                    return css`
            .decline {
                --mdc-theme-primary: var(--mdc-theme-error)
            }
            #txInfo {
                text-align:left;
                max-width:520px;
            }

            .buttons {
                text-align:right;
            }
            table td, th{
                padding:4px;
                text-align:left;
                font-size:14px;
            }
        `
                }

                constructor () {
                    super();
                    this.transaction = {
                        template: html$1`Awaiting transaction info`
                    };
                    this.txInfo = html$1``;
                }

                render () {
                    return html$1`
            <style>
                
            </style>

            <paper-dialog id="james" modal>
                <h2>Transaction request</h2>
                <div id="txInfo">
                    ${this.txInfo}
                </div>
                <div class="buttons">
                    <mwc-button class='decline' @click=${e => this.decline(e)} dialog-dismiss>Decline</mwc-button>
                    <mwc-button class='confirm' @click=${e => this.confirm(e)} dialog-confirm autofocus>Confirm</mwc-button>
                </div>
            </paper-dialog>
        `
                }

                stateChanged (state) {
                    this.loggedIn = state.app.loggedIn;
                }

                requestTransaction (transaction) {
                    this.shadowRoot.getElementById('james').open();
                    this.transaction = transaction;
                    this.txInfo = transaction.render(html$1);
                    console.log(this.txInfo);
                    return new Promise((resolve, reject) => {
                        this._resolve = resolve;
                        this._reject = reject;
                    })
                }

                confirm (e) {
                    this._resolve({
                        success: true
                    });
                }

                decline (e) {
                    // this._resolve({
                    //     success: false,
                    //     reason: 'User declined transaction'
                    // })
                    // or...?
                    // this._reject({
                    //     success: false,
                    //     reason: 'User declined transaction'
                    // })
                    // Or just
                    this._reject(new Error('User declined transaction'));
                }
            }

            window.customElements.define('confirm-transaction-dialog', ConfirmTransactionDialog);

            const txDialog = document.createElement('confirm-transaction-dialog');
            const requestTransactionDialog = document.body.appendChild(txDialog);

            const createTransaction = createTransaction$1;
            const processTransaction = processTransaction$1;
            // import { createTransaction } from '../api/createTransaction.js'
            // import { createTransaction } from '@frag-crypto/crypto'

            const routes = {
                hello: async req => {
                    return 'Hello from awesomeness'
                },

                pluginsLoaded: async req => {
                    // Hmmm... not sure what this one does
                },

                registerUrl: async req => {
                    // console.log('REGISTER URL REQUEST YASSSSS', req)
                    const { url, title, menus, icon, domain, page, parent = false } = req.data;
                    store.dispatch(doAddPluginUrl({
                        url,
                        domain,
                        title,
                        menus,
                        icon,
                        page,
                        parent
                    }));
                },

                registerTopMenuModal: async req => {
                    // const { icon, frameUrl, text } = req
                    // Leave as not implemented for now, don't need cause we are using a normal page for send money...better on mobile
                },

                addMenuItem: async req => {
                    // I assume this is...idk
                },

                apiCall: async req => {
                    // console.log(req.data)
                    // console.log(api.request)
                    // console.log(req)
                    const url = req.data.url;
                    delete req.data.url;
                    return request(url, req.data)
                },

                addresses: async req => {
                    return store.getState().app.wallet.addresses.map(address => {
                        return {
                            address: address.address,
                            color: address.color,
                            nonce: address.nonce,
                            textColor: address.textColor,
                            base58PublicKey: address.base58PublicKey
                        }
                    })
                },

                // Singular
                address: async req => {
                    // nvm
                },

                transaction: async req => {
                    // One moment please...this requires templates in the transaction classes
                    let response;
                    try {
                        // const txBytes = createTransaction(req.data.type, store.getState().app.wallet._addresses[req.data.nonce].keyPair, req.data.params)
                        const tx = createTransaction(req.data.type, store.getState().app.wallet._addresses[req.data.nonce].keyPair, req.data.params);
                        console.log(api, tx, tx.signedBytes);
                        await requestTransactionDialog.requestTransaction(tx);
                        const res = await processTransaction(tx.signedBytes);
                        console.log(res);
                        response = {
                            success: true,
                            data: res
                        };
                    } catch (e) {
                        console.error(e);
                        console.error(e.message);
                        response = {
                            success: false,
                            message: e.message
                        };
                    }
                    return response
                },

                username: async req => {
                    const state = store.getState();
                    console.log(state.app.wallet.addresses[0].address, state.user.storedWallets);
                    const username = state.user.storedWallets[state.app.wallet.addresses[0].address].name;
                    console.log(username);
                    return username
                }
            };

            const addPluginRoutes = exports('a', epmlInstance => {
                // console.log('Adding routes')
                Object.entries(routes).forEach(([route, handler]) => {
                    epmlInstance.route(route, handler);
                });
            });

            class ShowPlugin extends connect(store)(LitElement) {
                static get properties () {
                    return {
                        app: { type: Object },
                        pluginConfig: { type: Object },
                        url: { type: String }
                    }
                }

                static get styles () {
                    return css`
            iframe#showPluginFrame {
                width:100%;
                height:calc(var(--window-height) - 68px);
                border:0;
                padding:0;
                margin:0;
            }
        `
                }

                // ${window.location.protocol}//${this.pluginConfig.domain}:${this.pluginConfig.port}/plugins/${this.app.registeredUrls[this.url].page}

                /*
                <iframe src="${this.app.registeredUrls[this.url] ? `
                            ${window.location.protocol}//${window.location.hostname}:${this.pluginConfig.port}/plugins/${this.app.registeredUrls[this.url].page}
                        ` : `about:blank`}" id="showPluginFrame"></iframe>

                                    <iframe src="${this.app.registeredUrls[this.url] ? `
                            ${window.location.protocol}//${window.location.hostname}:${this.pluginConfig.port}/plugins/${this.app.registeredUrls[this.url].page}
                        ` : 'about:blank'}" id="showPluginFrame"></iframe>
                        */
                render () {
                    console.log(this.app.registeredUrls[this.url]);
                    // console.log(this.app.registeredUrls)
                    // Let's come back to this...
                    return html$1`
            <iframe src="${this.app.registeredUrls[this.url] ? `
                ${window.location.protocol}//${this.config.user.server.plugin.domain}:${this.config.user.server.plugin.port}/plugin/${this.app.registeredUrls[this.url].domain}/${this.app.registeredUrls[this.url].page}
            ` : 'about:blank'}" id="showPluginFrame"></iframe>

        `
                }
                /*
                <iframe src="${this.app.registeredUrls[this.url] ? `
                            ${window.location.protocol}//${this.app.registeredUrls[this.url].domain}.${window.location.hostname}/${this.app.registeredUrls[this.url].page}
                        ` : 'about:blank'}" id="showPluginFrame"></iframe>*/

                firstUpdated (changedProps) {
                    console.log(changedProps);
                    const showingPluginEpml = new Epml({
                        type: 'WINDOW',
                        source: this.shadowRoot.getElementById('showPluginFrame').contentWindow
                    });
                    addPluginRoutes(showingPluginEpml);
                    showingPluginEpml.imReady();
                    this.showingPluginEpml = showingPluginEpml;
                    Epml.registerProxyInstance('visible-plugin', showingPluginEpml);
                    console.log(showingPluginEpml);
                }

                updated (changedProps) {
                    if (changedProps.has('url')) ;

                    if (changedProps.has('computerUrl')) {
                        if (this.computedUrl !== 'about:blank') {
                            this.loading = true;
                            // this.
                        }
                    }
                }

                stateChanged (state) {
                    this.app = state.app;
                    // console.log(state.config.user)
                    this.config = state.config;
                    const split = state.app.url.split('/');
                    // ${ window.location.protocol }//${this.app.registeredUrls[this.url].url}.${window.location.hostname}:${window.location.port}
                    // this.url = split[1] === 'q' ? split[2] : 'about:blank'
                    // Need to add the port in too, in case it gets hosted not on port 80 or 443
                    this.url = split[1] === 'q' ? split[2] : '404';
                }
            }

            window.customElements.define('show-plugin', ShowPlugin);

        }
    };
});
//# sourceMappingURL=show-plugin-50f62f15.js.map
