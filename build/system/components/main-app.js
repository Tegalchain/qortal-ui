System.register(['../default-theme-cc48de01.js', '../pwa-helpers-b8803d22.js', '../typography-bad221cc.js', '../styles/app-styles.js', '../styles/app-theme.js', './login-view/login-view.js', '../iron-a11y-keys-behavior-17f3f126.js', '../mwc-icon-a3cde566.js', '../loading-ripple-18b8235f.js', '../iron-a11y-announcer-6506206b.js', '../FileSaver.min-1db86b76.js', '../paper-ripple-1db8d130.js', '../mwc-icon-button-0b515f06.js', './login-view/create-account-section.js', '../paper-spinner-lite-5d2340d5.js', './login-view/login-section.js', '../show-plugin-4b421031.js', '../iron-overlay-behavior-67fa3e2b.js', './app-view.js', './wallet-profile.js', './sidenav-menu.js'], function () {
    'use strict';
    var store, installRouter, connect, LitElement, html, EpmlStream, doNavigate;
    return {
        setters: [function () {}, function (module) {
            store = module.s;
            installRouter = module.r;
            connect = module.u;
            LitElement = module.L;
            html = module.h;
        }, function (module) {
            EpmlStream = module.E;
            doNavigate = module.a;
        }, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}],
        execute: function () {

            const LOGIN_STREAM_NAME = 'logged_in';
            const CONFIG_STREAM_NAME = 'config';
            const SELECTED_ADDRESS_STREAM_NAME = 'selected_address';

            const loggedInStream = new EpmlStream(LOGIN_STREAM_NAME, () => store.getState().app.loggedIn);
            const configStream = new EpmlStream(CONFIG_STREAM_NAME, () => store.getState().config);
            const selectedAddressStream = new EpmlStream(SELECTED_ADDRESS_STREAM_NAME, () => store.getState().app.selectedAddress);

            // const INTERVAL = 10 * 60 * 1000 // 10 minutes

            let oldState = {
                app: {}
            };

            // protocol: 'http',
            //     domain: '127.0.0.1',
            //         port: 4999,
            //             url: '/airdrop/',
            //                 dhcpUrl: '/airdrop/ping/'

            store.subscribe(() => {
                const state = store.getState();
                if (oldState.app.loggedIn !== state.app.loggedIn) {
                    loggedInStream.emit(state.app.loggedIn);
                }
                // This one may be a little on the heavy side...AHHH, NEED TO MOVE STORAGE OF ENCRYPTED SEED. DONE <3
                if (oldState.config !== state.config) {
                    configStream.emit(state.config);
                }
                if (oldState.app.selectedAddress !== state.app.selectedAddress) {
                    console.log('Selected address changed');
                    // selectedAddressStream.emit(state.selectedAddress)
                    selectedAddressStream.emit({
                        address: state.app.selectedAddress.address,
                        color: state.app.selectedAddress.color,
                        nonce: state.app.selectedAddress.nonce,
                        textColor: state.app.selectedAddress.textColor
                    });

                    // Don't think we want this crap
                    // if (state.app.selectedAddress.address) {
                    //     const node = store.getState().config.coin.node.airdrop
                    //     const fn = () => {
                    //         console.log('PINGING DHCP')
                    //         const url = node.protocol + '://' + node.domain + ':' + node.port + node.dhcpUrl + state.app.wallet.addresses[0].address
                    //         console.log(url)
                    //         fetch(url, { mode: 'no-cors' }).then(res => console.log('Ping resonse', res)).catch(err => console.error('Ping error', err))
                    //     }
                    //     pingInterval = setInterval(fn, node.pingInterval)
                    //     fn()
                    // }
                }
                oldState = state;
            });

            /* STUFF THAT WE'RE NOT USING RESOLVE...WE'RE IMPORTING THE FILES DIRECTLY */

            installRouter((location) => store.dispatch(doNavigate(location)));

            // console.log('==============')
            // console.log(styles)
            // console.log('==============')

            class MainApp extends connect(store)(LitElement) {
                static get properties () {
                    return {
                        name: { type: 'String' },
                        loggedIn: { type: Boolean }
                    }
                }

                static get styles () {
                    return [
                        // css`
                        //     ${unsafeCSS(styles)}
                        // `
                        // css(styles)
                    ]
                }

                // constructor () {
                //     super()
                // }
                //  ?hidden=${!this.loggedIn}
                render () {
                    return html`
            <!-- <app-styles></app-styles> -->
            <!-- Core layout goes here? Then the log out button can go alongside the log out button...and scale down to it? -->
            <!-- No. login-view will go inside of app-view. Theme, plugin loading, and maybe the web workers will go here. -->
            
            <login-view></login-view>
            
            <app-view></app-view> <!-- Might dynamic import this one... YUP DEFINITELY :) -->
            
            <!-- <confirm-transaction-dialog></confirm-transaction-dialog> -->

            <!-- <input type="text" placeholder="name" value="${this.name}" @input=${this._nameChanged}> -->
        `
                }

                _nameChanged (e) {
                    // store.dispatch(updateName(e.target.value))
                }

                stateChanged (state) {
                    // this.name = state.test.name
                    this.loggedIn = state.app.loggedIn;
                    document.title = state.config.coin.name;
                }

                connectedCallback () {
                    super.connectedCallback();
                }
            }

            window.customElements.define('main-app', MainApp);

        }
    };
});
//# sourceMappingURL=main-app.js.map
