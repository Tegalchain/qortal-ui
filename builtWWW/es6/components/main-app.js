import '../default-theme-c3daa274.js';
import { s as store, r as installRouter, u as connect, L as LitElement, h as html } from '../pwa-helpers-18d9cdf0.js';
import { E as EpmlStream, a as doNavigate } from '../typography-547f22b4.js';
import '../styles/app-styles.js';
import '../styles/app-theme.js';
import './login-view/login-view.js';
import '../iron-a11y-keys-behavior-491299bd.js';
import '../mwc-icon-25391be8.js';
import '../loading-ripple-3f7b6eec.js';
import '../iron-a11y-announcer-7d216145.js';
import '../FileSaver.min-58a02fe3.js';
import '../paper-ripple-f2e3e93a.js';
import '../mwc-icon-button-41bd0e4d.js';
import './login-view/create-account-section.js';
import '../paper-spinner-lite-00d3f81a.js';
import './login-view/login-section.js';
import '../show-plugin-4cb12f63.js';
import '../iron-overlay-behavior-ac2d4710.js';
import './app-view.js';
import './wallet-profile.js';
import './sidenav-menu.js';

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
//# sourceMappingURL=main-app.js.map
