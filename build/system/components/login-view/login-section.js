System.register(['../../default-theme-f4872173.js', '../../pwa-helpers-e04d8fac.js', '../../typography-df547440.js', '../../iron-a11y-keys-behavior-c9affbac.js', '../../mwc-icon-b1620148.js', '../../loading-ripple-10861ce1.js', '../../iron-a11y-announcer-b4b56881.js', '../../paper-ripple-99c84c5f.js', '../../paper-spinner-lite-1456450e.js'], function () {
  'use strict';
  var IronResizableBehavior, LitElement, css, html$1, connect, store, createWallet, doLogin, doSelectAddress, Polymer, html, Base, dom, ripple, snackbar, doStoreWallet;
  return {
    setters: [function (module) {
      IronResizableBehavior = module.I;
    }, function (module) {
      LitElement = module.L;
      css = module.c;
      html$1 = module.h;
      connect = module.u;
      store = module.s;
    }, function (module) {
      createWallet = module.c;
      doLogin = module.b;
      doSelectAddress = module.e;
    }, function (module) {
      Polymer = module.P;
      html = module.h;
      Base = module.B;
      dom = module.d;
    }, function () {}, function (module) {
      ripple = module.r;
      snackbar = module.s;
    }, function (module) {
      doStoreWallet = module.g;
    }, function () {}, function () {}],
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

      /**
      `iron-collapse` creates a collapsible block of content.  By default, the content
      will be collapsed.  Use `opened` or `toggle()` to show/hide the content.

          <button on-click="toggle">toggle collapse</button>

          <iron-collapse id="collapse">
            <div>Content goes here...</div>
          </iron-collapse>

          ...

          toggle: function() {
            this.$.collapse.toggle();
          }

      `iron-collapse` adjusts the max-height/max-width of the collapsible element to
      show/hide the content.  So avoid putting padding/margin/border on the
      collapsible directly, and instead put a div inside and style that.

          <style>
            .collapse-content {
              padding: 15px;
              border: 1px solid #dedede;
            }
          </style>

          <iron-collapse>
            <div class="collapse-content">
              <div>Content goes here...</div>
            </div>
          </iron-collapse>

      ### Styling

      The following custom properties and mixins are available for styling:

      Custom property | Description | Default
      ----------------|-------------|----------
      `--iron-collapse-transition-duration` | Animation transition duration | `300ms`

      @group Iron Elements
      @hero hero.svg
      @demo demo/index.html
      @element iron-collapse
      */
      Polymer({
        _template: html`
    <style>
      :host {
        display: block;
        transition-duration: var(--iron-collapse-transition-duration, 300ms);
        /* Safari 10 needs this property prefixed to correctly apply the custom property */
        -webkit-transition-duration: var(--iron-collapse-transition-duration, 300ms);
        overflow: visible;
      }

      :host(.iron-collapse-closed) {
        display: none;
      }

      :host(:not(.iron-collapse-opened)) {
        overflow: hidden;
      }
    </style>

    <slot></slot>
`,

        is: 'iron-collapse',
        behaviors: [IronResizableBehavior],

        properties: {

          /**
           * If true, the orientation is horizontal; otherwise is vertical.
           *
           * @attribute horizontal
           */
          horizontal: {type: Boolean, value: false, observer: '_horizontalChanged'},

          /**
           * Set opened to true to show the collapse element and to false to hide it.
           *
           * @attribute opened
           */
          opened:
              {type: Boolean, value: false, notify: true, observer: '_openedChanged'},

          /**
           * When true, the element is transitioning its opened state. When false,
           * the element has finished opening/closing.
           *
           * @attribute transitioning
           */
          transitioning: {type: Boolean, notify: true, readOnly: true},

          /**
           * Set noAnimation to true to disable animations.
           *
           * @attribute noAnimation
           */
          noAnimation: {type: Boolean},

          /**
           * Stores the desired size of the collapse body.
           * @private
           */
          _desiredSize: {type: String, value: ''}
        },

        get dimension() {
          return this.horizontal ? 'width' : 'height';
        },

        /**
         * `maxWidth` or `maxHeight`.
         * @private
         */
        get _dimensionMax() {
          return this.horizontal ? 'maxWidth' : 'maxHeight';
        },

        /**
         * `max-width` or `max-height`.
         * @private
         */
        get _dimensionMaxCss() {
          return this.horizontal ? 'max-width' : 'max-height';
        },

        hostAttributes: {
          role: 'group',
          'aria-hidden': 'true',
        },

        listeners: {transitionend: '_onTransitionEnd'},

        /**
         * Toggle the opened state.
         *
         * @method toggle
         */
        toggle: function() {
          this.opened = !this.opened;
        },

        show: function() {
          this.opened = true;
        },

        hide: function() {
          this.opened = false;
        },

        /**
         * Updates the size of the element.
         * @param {string} size The new value for `maxWidth`/`maxHeight` as css property value, usually `auto` or `0px`.
         * @param {boolean=} animated if `true` updates the size with an animation, otherwise without.
         */
        updateSize: function(size, animated) {
          // Consider 'auto' as '', to take full size.
          size = size === 'auto' ? '' : size;

          var willAnimate = animated && !this.noAnimation && this.isAttached &&
              this._desiredSize !== size;

          this._desiredSize = size;

          this._updateTransition(false);
          // If we can animate, must do some prep work.
          if (willAnimate) {
            // Animation will start at the current size.
            var startSize = this._calcSize();
            // For `auto` we must calculate what is the final size for the animation.
            // After the transition is done, _transitionEnd will set the size back to
            // `auto`.
            if (size === '') {
              this.style[this._dimensionMax] = '';
              size = this._calcSize();
            }
            // Go to startSize without animation.
            this.style[this._dimensionMax] = startSize;
            // Force layout to ensure transition will go. Set scrollTop to itself
            // so that compilers won't remove it.
            this.scrollTop = this.scrollTop;
            // Enable animation.
            this._updateTransition(true);
            // If final size is the same as startSize it will not animate.
            willAnimate = (size !== startSize);
          }
          // Set the final size.
          this.style[this._dimensionMax] = size;
          // If it won't animate, call transitionEnd to set correct classes.
          if (!willAnimate) {
            this._transitionEnd();
          }
        },

        /**
         * enableTransition() is deprecated, but left over so it doesn't break
         * existing code. Please use `noAnimation` property instead.
         *
         * @method enableTransition
         * @deprecated since version 1.0.4
         */
        enableTransition: function(enabled) {
          Base._warn(
              '`enableTransition()` is deprecated, use `noAnimation` instead.');
          this.noAnimation = !enabled;
        },

        _updateTransition: function(enabled) {
          this.style.transitionDuration = (enabled && !this.noAnimation) ? '' : '0s';
        },

        _horizontalChanged: function() {
          this.style.transitionProperty = this._dimensionMaxCss;
          var otherDimension =
              this._dimensionMax === 'maxWidth' ? 'maxHeight' : 'maxWidth';
          this.style[otherDimension] = '';
          this.updateSize(this.opened ? 'auto' : '0px', false);
        },

        _openedChanged: function() {
          this.setAttribute('aria-hidden', !this.opened);

          this._setTransitioning(true);
          this.toggleClass('iron-collapse-closed', false);
          this.toggleClass('iron-collapse-opened', false);
          this.updateSize(this.opened ? 'auto' : '0px', true);

          // Focus the current collapse.
          if (this.opened) {
            this.focus();
          }
        },

        _transitionEnd: function() {
          this.style[this._dimensionMax] = this._desiredSize;
          this.toggleClass('iron-collapse-closed', !this.opened);
          this.toggleClass('iron-collapse-opened', this.opened);
          this._updateTransition(false);
          this.notifyResize();
          this._setTransitioning(false);
        },

        _onTransitionEnd: function(event) {
          if (dom(event).rootTarget === this) {
            this._transitionEnd();
          }
        },

        _calcSize: function() {
          return this.getBoundingClientRect()[this.dimension] + 'px';
        }
      });

      class FragFileInput extends LitElement {
          static get properties () {
              return {
                  accept: {
                      type: String
                  },
                  readAs: {
                      type: String
                  }
              }
          }

          static get styles () {
              return css`
            #drop-area {
                border: 2px dashed #ccc;
                font-family: "Roboto", sans-serif;
                padding: 20px;
            }
            #trigger:hover {
                cursor: pointer;
            }
            #drop-area.highlight {
                border-color: var(--mdc-theme-primary, #000);
            }
            p {
                margin-top: 0;
            }
            form {
                margin-bottom: 10px;
            }
            #fileInput {
                display: none;
            }
        `
          }

          constructor () {
              super();
              this.readAs = this.readAs || 'Text';
          }

          render () {
              return html$1`
            <style>
                
            </style>
            
            <div id="drop-area">
                <slot name="info-text"></slot>

                <div style="line-height:40px;">
                    <slot id="trigger" name="inputTrigger" @click=${() => this.shadowRoot.getElementById('fileInput').click()} style="dispay:inline;">
                        <mwc-button><mwc-icon>cloud_upload</mwc-icon>&nbsp; Select file</mwc-button>
                    </slot>
                    <span style="padding-top:6px;">Drag and drop backup here</span>
                </div>
            </div>

            

            <input type="file" id="fileInput" accept="${this.accept}" @change="${e => this.readFile(e.target.files[0])}">
        `
          }

          readFile (file) {
              const fr = new FileReader();

              fr.onload = () => {
                  this.dispatchEvent(new CustomEvent('file-read-success', {
                      detail: { result: fr.result },
                      bubbles: true,
                      composed: true
                  }));
              };

              fr['readAs' + this.readAs](file);
          }

          firstUpdated () {
              this._dropArea = this.shadowRoot.getElementById('drop-area');
              console.log(this._dropArea);

              const preventDefaults = e => {
                  e.preventDefault();
                  e.stopPropagation();
              }

              ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                  this._dropArea.addEventListener(eventName, preventDefaults, false);
              });

              const highlight = e => {
                  this._dropArea.classList.add('highlight');
              };

              const unhighlight = e => {
                  this._dropArea.classList.remove('highlight');
              }

              ;['dragenter', 'dragover'].forEach(eventName => {
                  console.log('dragenter/dragover');
                  this._dropArea.addEventListener(eventName, highlight, false);
              })

              ;['dragleave', 'drop'].forEach(eventName => {
                  console.log('drag-leave/drop');
                  this._dropArea.addEventListener(eventName, unhighlight, false);
              });

              this._dropArea.addEventListener('drop', e => {
                  console.log('DROPPED');
                  const dt = e.dataTransfer;
                  const file = dt.files[0];

                  this.readFile(file);
              }, false);
          }
      }

      window.customElements.define('frag-file-input', FragFileInput);

      // import '@polymer/iron-pages'
      // import '@polymer/paper-icon-button/paper-icon-button.js'
      // import { MDCTextField } from '@material/textfield'
      // const textField = new MDCTextField(document.querySelector('.mdc-text-field'))

      class LoginSection extends connect(store)(LitElement) {
          static get properties () {
              return {
                  nextHidden: { type: Boolean, notify: true },
                  nextDisabled: { type: Boolean, notify: true },
                  nextText: { type: String, notify: true },
                  backHidden: { type: Boolean, notify: true },
                  backDisabled: { type: Boolean, notify: true },
                  backText: { type: String, notify: true },
                  hideNav: { type: Boolean, notify: true },

                  loginFunction: { type: Object },
                  selectedWallet: { type: Object },
                  selectedPage: { type: String },
                  wallets: { type: Object },
                  loginErrorMessage: { type: String },
                  saveInBrowser: { type: Boolean },
                  hasStoredWallets: { type: Boolean },
                  saveInBrowser: { type: Boolean },
                  backedUpWalletJSON: { type: Object },
                  backedUpSeedLoading: { type: Boolean }
              }
          }

          static get styles () {
              return [
                  css`
                
            `
              ]
          }

          constructor () {
              super();
              this.nextHidden = true;
              this.backText = 'Back';

              this.backedUpSeedLoading = false;
              this.hasStoredWallets = Object.keys(store.getState().user.storedWallets).length > 0;
              this.selectedPage = this.hasStoredWallets ? 'storedWallet' : 'loginOptions';
              this.selectedWallet = {};
              this.loginErrorMessage = '';
              this.saveInBrowser = false;

              this.loginOptions = [
                  {
                      page: 'phrase',
                      linkText: 'Seedphrase',
                      icon: 'short_text'
                  },
                  {
                      page: 'storedWallet',
                      linkText: 'Saved account',
                      icon: 'save'
                  },
                  {
                      page: 'seed',
                      linkText: 'Qora seed',
                      icon: 'clear_all'
                  },
                  {
                      page: 'backedUpSeed',
                      linkText: 'Qortal wallet backup',
                      icon: 'insert_drive_file'
                  }
              ];

              this.showPasswordCheckboxPages = ['seed', 'phrase', 'V1Seed', 'unlockBackedUpSeed'];
          }

          render () {
              return html$1`
            <style>
                #loginSection {
                    padding:0;
                    text-align:left;
                    padding-top: 12px;
                    --paper-spinner-color: var(--mdc-theme-primary);
                    --paper-spinner-stroke-width: 2px;
                }
                #wallets {
                    max-height: 400px;
                    overflow-y:auto;
                    overflow-x:hidden;
                    border-bottom: 1px solid #eee;
                    border-top: 1px solid #eee;
                }
                .wallet {
                    /* max-width: 300px; */
                    position: relative;
                    padding: 12px;
                    cursor: pointer;
                    display: flex;
                }
                .wallet .wallet-details {
                    padding-left:12px;
                    flex: 1;
                    min-width: 0;
                }
                .wallet div .address{
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin:0;
                }
                .wallet .wallet-details h3 {
                    margin:0;
                    padding: 6px 0;
                    font-size:16px;
                }
                .login-option {
                    max-width: 300px;
                    position: relative;
                    padding: 16px 0 8px 12px;
                    cursor: pointer;
                    display: flex;
                }
                .loginIcon {
                    /* font-size:42px; */
                    padding-right: 12px;
                    margin-top: -2px;
                }
                *[hidden] { 
                    display:none !important;
                    visibility: hidden;
                }
                h1 {
                    padding: 24px;
                    padding-top:0;
                    margin:0;
                    font-size:24px;
                    font-weight:100;
                }
                .accountIcon {
                    font-size:42px;
                    padding-top:8px;
                }

                #unlockStoredPage {
                    padding: 24px;
                }
                #unlockStoredPage mwc-icon {
                    font-size:48px;
                }

                @media only screen and (max-width: ${getComputedStyle(document.body).getPropertyValue('--layout-breakpoint-tablet')}) {
                    /* Mobile */
                    #wallets {
                        /* max-height: calc(var(--window-height) - 180px);
                        min-height: calc(var(--window-height) - 180px); */
                        height:100%;
                        overflow-y:auto;
                        overflow-x:hidden;
                    }
                    #loginSection {
                        height: calc(var(--window-height) - 56px);
                    }
                    .wallet {
                        max-width: 100%;
                    }
                }
                .backButton {
                    padding:14px;
                    text-align:left;
                }
                iron-pages h3{
                    color: #333;
                    font-family: "Roboto mono", monospace;
                    font-weight: 300;
                }
                #pagesContainer {
                    max-height: calc(var(--window-height) - 184px);
                }
                .checkboxLabel:hover{
                    cursor: pointer;
                }
            </style>
            
            <div id="loginSection">
                <div id="pagesContainer">
                    <iron-pages style="padding: 0;" selected="${this.selectedPage}" attr-for-selected="page" id="loginPages">
                        <div page="loginOptions">
                            <h3>How would you like to login?</h3>
                            ${this.loginOptions.map(({ page, linkText, icon }) => html$1`
                                <div class="login-option" @click=${() => { this.selectedPage = page; }}>
                                    <paper-ripple></paper-ripple>
                                    <div>
                                        <mwc-icon class='loginIcon'>${icon}</mwc-icon>
                                    </div>
                                    <div>
                                        ${linkText}
                                    </div>
                                </div>
                            `)}
                        </div>

                        <div page="storedWallet" id="walletsPage">
                            <div style="padding-left:0;">
                                <h1 style="padding:0;">Your accounts</h1>
                                <p style="margin:0; padding: 0 0 12px 0;">Click your account to login with it</p>
                            </div>
                            <div id="wallets">
                                ${(Object.entries(this.wallets || {}).length < 1) ? html$1`
                                    <p style="padding: 0 0 6px 0;">You need to create or save an account before you can log in!</p>
                                ` : ''}
                                ${Object.entries(this.wallets || {}).map(wallet => html$1`
                                    <div class="wallet" @click=${() => this.selectWallet(wallet[1])}>
                                        <paper-ripple></paper-ripple>
                                        <div>
                                            <mwc-icon class='accountIcon'>account_circle</mwc-icon>
                                        </div>
                                        <div class="wallet-details">
                                            <h3>${wallet[1].name || wallet[1].address0.substring(0, 5)}</h3>
                                            <p class="address">${wallet[1].address0}</p>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>

                        <div page="phrase" id="phrasePage">
                            <div style="padding:0;">
                                <div style="display:flex;">
                                    <!-- <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">short_text</mwc-icon> -->
                                    <mwc-textfield icon="short_text" style="width:100%;" label="Seedphrase" id="existingSeedPhraseInput" type="password"></mwc-textfield>
                                    <!-- <paper-input style="width:100%;" label="Seedphrase" id="existingSeedPhraseInput" type="password"></paper-input> -->
                                </div>
                            </div>
                        </div>

                        <div page="seed" id="seedPage">
                            <div>
                                <div style="display:flex;">
                                    <!-- <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">lock</mwc-icon> -->
                                    <mwc-textfield style="width:100%;" icon="clear_all" label="Qora seed" id="v1SeedInput" type="password"></mwc-textfield>
                                    <!-- <paper-input style="width:100%;" label="V1 Seed" id="v1SeedInput" type="password"></paper-input> -->
                                </div>
                            </div>
                        </div>

                        <div page="unlockStored" id="unlockStoredPage">
                            <div style="text-align:center;">
                                <mwc-icon id='accountIcon' style=" padding-bottom:24px;">account_circle</mwc-icon>
                                <br>
                                <span style="font-size:14px; font-weight:100; font-family: 'Roboto Mono', monospace;">${this.selectedWallet.address0}</span>
                            </div>
                        </div>

                        <div page="backedUpSeed">
                            ${!this.backedUpSeedLoading ? html$1`
                                <h3>Upload your qortal backup</h3>
                                <!-- (qortal_backup_Q123456789abcdefghkjkmnpqrs.json) -->
                                <frag-file-input accept=".zip,.json" @file-read-success="${e => this.loadBackup(e.detail.result)}"></frag-file-input>
                            ` : html$1`
                                <paper-spinner-lite active style="display: block; margin: 0 auto;"></paper-spinner-lite>
                            `}
                        </div>

                        <div page="unlockBackedUpSeed">
                            <h3>Decrypt backup</h3>
                        </div>

                    </iron-pages>
                    <!-- (this.saveInBrowser && this.showPasswordCheckboxPages.includes(this.selectedPage)) || (this.showPasswordPages.includes(this.selectedPage) && (this.wallets || {}).length < 1) || this.selectedPage === 'unlockBackedUpSeed' || this.selectedPage === 'unlockStored' -->
                    <iron-collapse style="" ?opened=${this.showPassword(this.selectedPage)} id="passwordCollapse">
                        <div style="display:flex;">
                            <!-- <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">vpn_key</mwc-icon> -->
                            <mwc-textfield icon="vpn_key" style="width:100%;" label="Password" id="password" type="password" @keyup=${e => this.keyupEnter(e, e => this.emitNext(e))}></mwc-textfield>
                            <!-- <paper-input style="width:100%;" always-float-labell label="Password" id="password" type="password"></paper-input> -->
                        </div>
                    </iron-collapse>

                    <div style="text-align: right; color: var(--mdc-theme-error)">
                        ${this.loginErrorMessage}
                    </div>
                        ${this.showPasswordCheckboxPages.includes(this.selectedPage) ? html$1`
                            <!-- Remember me checkbox and fields-->
                            <div style="text-align:right; min-height:40px;">
                                <p style="vertical-align: top; line-height: 40px; margin:0;">
                                    <label
                                    for="storeCheckbox"
                                    class="checkboxLabel"
                                    @click=${() => this.shadowRoot.getElementById('storeCheckbox').click()}
                                    >Save in this browser</label>
                                    <mwc-checkbox id="storeCheckbox" style="margin-bottom:-12px;" @click=${e => { this.saveInBrowser = !e.target.checked; }} ?checked="${this.saveInBrowser}"></mwc-checkbox>
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Passes this.selectedPage to trigger updates -->

            </div>
        `
          }
          /*

                      <div style="margin-left:24px; margin-right:24px;" ?hidden=${!(this.loginOptionIsSelected(this.selectedPage) && (this.hasStoredWallets || this.selectedPage !== 'storedWallet'))}>
                          <mwc-button style="margin-top:12px; width:100%;" raised @click=${e => this.login(e)}>Login</mwc-button>
                      </div>
          */

          firstUpdated () {
              // this.loadingRipple = this.shadowRoot.getElementById('loadingRipple')
              this.loadingRipple = ripple; // Just cause I'm lazy...

              const pages = this.shadowRoot.querySelector('#loginPages');
              pages.addEventListener('selected-item-changed', () => {
                  if (!pages.selectedItem) ; else {
                      this.updateNext();
                      this.shadowRoot.querySelector('#password').value = '';
                  }
              });
          }

          selectWallet (wallet) {
              this.selectedWallet = wallet;
              this.selectedPage = 'unlockStored';
          }

          stateChanged (state) {
              this.loggedIn = state.app.loggedIn;
              this.wallets = state.user.storedWallets;
              this.hasStoredWallets = this.wallets.length > 0;
          }

          keyupEnter (e, action) {
              if (e.keyCode === 13) {
                  e.preventDefault();
                  action(e);
              }
          }

          emitNext (e) {
              this.dispatchEvent(new CustomEvent('next', {
                  detail: {}
              }));
          }

          loadBackup (file) {
              let error = '';
              let pf;
              this.selectedPage = 'unlockBackedUpSeed';

              try {
                  pf = JSON.parse(file);
              } catch (e) {
                  this.loginErrorMessage = 'Backup must be valid JSON';
              }

              try {
                  const requiredFields = ['address0', 'salt', 'iv', 'version', 'encryptedSeed', 'mac', 'kdfThreads'];
                  for (const field of requiredFields) {
                      if (!(field in pf)) throw new Error(field + ' not found in JSON')
                  }
              } catch (e) {
                  error = e;
              }

              if (error !== '') {
                  snackbar.add({
                      labelText: error
                  });
                  this.selectedPage = 'backedUpSeed';
                  return
              }
              this.backedUpWalletJSON = pf;
          }

          showPassword (selectedPage) {
              return (
                  this.saveInBrowser && [
                      'storedWallet',
                      'unlockBackedUpSeed',
                      'seed',
                      'phrase'
                  ].includes(selectedPage)
              ) ||
              (
                  [
                      'unlockBackedUpSeed',
                      'unlockStored'
                  ].includes(selectedPage)
              )
              //  ||
              // (
              //     selectedPage === 'storedWallet' && (this.wallets || {}).length < 1
              // )
          }

          get walletSources () {
              return {
                  seed: () => {
                      const seed = this.shadowRoot.querySelector('#v1SeedInput').value;
                      return seed
                  },
                  storedWallet: () => {
                      const wallet = this.selectedWallet;
                      // const password = this.shadowRoot.querySelector('#password').value
                      const password = this.shadowRoot.getElementById('password').value;
                      return {
                          wallet,
                          password
                      }
                  },
                  phrase: () => {
                      const seedPhrase = this.shadowRoot.querySelector('#existingSeedPhraseInput').value;
                      return seedPhrase
                  },
                  backedUpSeed: () => {
                      const wallet = this.backedUpWalletJSON;
                      const password = this.shadowRoot.getElementById('password').value;
                      return {
                          password,
                          wallet
                      }
                  }
              }
          }

          loginOptionIsSelected (type) {
              return this.loginOptions.map(op => op.page).includes(type)
          }

          login (e) {
              let type = this.selectedPage === 'unlockStored' ? 'storedWallet' : this.selectedPage;
              type = type === 'unlockBackedUpSeed' ? 'backedUpSeed' : type;

              if (!this.loginOptionIsSelected(type)) {
                  throw new Error('Login option not selected page')
              }

              // First decrypt...
              this.loadingRipple.open({
                  x: e.clientX,
                  y: e.clientY
              })
                  .then(() => {
                      const source = this.walletSources[type]();
                      return createWallet(type, source, status => {
                          this.loadingRipple.loadingMessage = status;
                      })
                          .then(wallet => {
                              store.dispatch(doLogin(wallet));
                              store.dispatch(doSelectAddress(wallet.addresses[0]));
                              this.navigate('show-address');
                              console.log(wallet);
                              // store.dispatch(doUpdateAccountInfo({ name: store.getState().user.storedWallets[wallet.addresses[0].address].name }))
                              const storedWallets = store.getState().user.storedWallets;
                              const storedWalletAddress = storedWallets[wallet.addresses[0].address];
                              // STORAGEEEE
                              console.log(storedWalletAddress, this.saveInBrowser, type);
                              if (!storedWalletAddress) {
                                  console.log(' -- Wallet not already stored -- ', this.saveInBrowser);
                                  // const expectedName = storedWallets[wallet.addresses[0].address].name
                                  // store.dispatch(doUpdateAccountName(wallet.addresses[0].address, expectedName, false))
                                  if (this.saveInBrowser && type !== 'storedWallet') {
                                      //
                                      console.log('==== STORING THE WALLET ====');
                                      store.dispatch(doStoreWallet(wallet, source.password, '' /* username */, () => {
                                          // this.loadingRipple.loadingMessage = status
                                          ripple.loadingMessage = status;
                                      })).catch(err => console.error(err));
                                  }
                              }
                              this.cleanup();
                              return this.loadingRipple.fade()
                          })
                  })
                  .catch(e => {
                      this.loginErrorMessage = e;
                      console.error(e);
                      return this.loadingRipple.close()
                  });
          }

          back () {
              if (['seed', 'phrase', 'storedWallet', 'backedUpSeed'].includes(this.selectedPage)) {
                  this.selectedPage = 'loginOptions';
              } else if (this.selectedPage === 'loginOptions') {
                  this.navigate('welcome');
              } else if (this.selectedPage === 'unlockStored') {
                  this.selectedPage = 'storedWallet';
              } else if (this.selectedPage === 'unlockBackedUpSeed') {
                  this.selectedPage = 'backedUpSeed';
              }
          }

          next (e) {
              this.login(e);
          }

          // clicks next for parent
          clickNext () {

          }

          updateNext () {
              if (['phrase', 'seed', 'unlockStored', 'unlockBackedUpSeed'].includes(this.selectedPage)) {
                  this.nextText = 'Login';
                  this.nextHidden = false;
                  // Should enable/disable the next button based on whether or not password are inputted
              } else if (['storedWallet', 'loginOptions', 'backedUpSeed'].includes(this.selectedPage)) {
                  this.nextHidden = true;
                  this.nextText = 'Next';
              }

              this.updatedProperty();
          }

          updatedProperty () {
              this.dispatchEvent(new CustomEvent('updatedProperty', {
                  detail: {},
                  bubbles: true,
                  composed: true
              }));
          }

          navigate (page) {
              this.dispatchEvent(new CustomEvent('navigate', {
                  detail: { page },
                  bubbles: true,
                  composed: true
              }));
          }

          cleanup () {
              this.wallet = {};
              this.shadowRoot.querySelector('#password').value = '';
              this.hasStoredWallets = Object.keys(store.getState().user.storedWallets).length > 0;
              this.selectedPage = this.hasStoredWallets ? 'storedWallet' : 'loginOptions';
          }
      }

      window.customElements.define('login-section', LoginSection);

    }
  };
});
//# sourceMappingURL=login-section.js.map
