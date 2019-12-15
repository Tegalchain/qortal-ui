// CAN'T BE BOTHERED WITH THIS. EVERYTHING IS JUST GOING IN FRAG_CORE
import { LitElement, html, css } from 'lit-element'
import { connect } from 'pwa-helpers'
// import { store } from '../../store.js'
import { store } from 'frag-core/src/store.js'

// import { createWallet } from '../../qora/createWallet.js'
// import { generateSaveWalletData } from '../../qora/storeWallet.js'
// import { doSelectAddress } from '../../redux/app/app-actions.js'
// import { doStoreWallet } from '../../redux/user/user-actions.js'

// import { logIn } from '../../actions/app-actions.js'

import '@material/mwc-button'
import '@material/mwc-icon'

import '@polymer/iron-pages'
import '@polymer/paper-icon-button/paper-icon-button.js'
import '@polymer/paper-spinner/paper-spinner-lite.js'

import 'particle.js'

import 'frag-core/element-components'
// import './login-section.js'
// import 'frag-core/src/components/login-view/login-section.js'

window.reduxStore = store

// import { MDCTextField } from '@material/textfield'
// const textField = new MDCTextField(document.querySelector('.mdc-text-field'))

class LoginView extends connect(store)(LitElement) {
    static get properties() {
        return {
            loggedIn: { type: 'Boolean' },
            selectedPage: { type: 'String' },
            pages: { type: Object },
            rippleIsOpen: { type: Boolean },
            config: { type: Object },
            rippleLoadingMessage: { type: String }
        }
    }

    static get styles() {
        return [
            css`
                
            `
        ]
    }

    getPreSelectedPage() {
        return (store.getState().user.storedWallets && Object.entries(store.getState().user.storedWallets || {}).length > 0) ? 'login' : 'welcome'
    }

    constructor() {
        super()
        this.selectedPage = this.getPreSelectedPage()
        this.rippleIsOpen = false
        this.pages = {
            'welcome': 0,
            'create-account': 1,
            'login': 2
        }
        this.rippleLoadingMessage = 'Getting information'
    }

    firstUpdated() {
        // this.shadowRoot.getElementById('createAccountSection').loginFunction = (...args) => this.login(...args)
        // this.shadowRoot.getElementById('loginSection').loginFunction = (...args) => this.login(...args)
    }

    render() {
        return html`
            <style>
                canvas {
                    display: block;
                    vertical-align: bottom;
                } /* ---- particles.js container ---- */
                #particles-js {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-color: #202020;
                    background-image: url("");
                    background-repeat: no-repeat;
                    background-size: cover;
                    background-position: 50% 50%;
                } /* ---- stats.js ---- */
                .count-particles {
                    background: #000022;
                    position: absolute;
                    top: 48px;
                    left: 0;
                    width: 80px;
                    color: #13e8e9;
                    font-size: 0.8em;
                    text-align: left;
                    text-indent: 4px;
                    line-height: 14px;
                    padding-bottom: 2px;
                    font-family: Helvetica, Arial, sans-serif;
                    font-weight: bold;
                }
                .js-count-particles {
                    font-size: 1.1em;
                }
                #stats, .count-particles {
                    -webkit-user-select: none;
                    margin-top: 5px;
                    margin-left: 5px;
                }
                #stats {
                    border-radius: 3px 3px 0 0;
                    overflow: hidden;
                }
                .count-particles {
                    border-radius: 0 0 3px 3px;
                }

                /* GO SASSSSSSS ASAPPP */
                .login-page {
                    height: var(--window-height);
                    width:100vw;
                    max-width:100vw;
                    max-height:var(--window-height);
                    position:absolute;
                    top:0;
                    left:0;
                    /* background: var(--mdc-theme-surface); */
                    /* background: var(--mdc-theme-background); */
                    background: #333; /* Needs to become configurable... */
                    z-index:1;
                }
                .login-card-container {
                    max-width:100vw;
                    max-height:var(--window-height);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: var(--window-height);
                    overflow:hidden;
                }
                #loginContainerPages [page] {
                    background: var(--mdc-theme-surface);
                    padding:0;
                }
                .login-card {
                    min-width: 340px;
                    /* background:#fff; */
                    text-align:center;
                }
                .login-card p {
                    margin-top: 0;
                    font-size: 1rem;
                    font-style: italic;
                }
                .login-card h1{
                    margin-bottom:12px;
                    font-size:64px;
                }
                .login-card [page="welcome"] mwc-button {
                    margin: 6px;
                    width: 90%;
                    max-width:90vw;
                    margin: 4px;
                }
                .login-card iron-pages {
                    height:100%;
                }
                .backButton {
                    padding-top:18px;
                    text-align:center;
                }
                @media only screen and (min-width: ${getComputedStyle(document.body).getPropertyValue('--layout-breakpoint-tablet')}) {
                    /* Desktop/tablet */
                    .login-card {
                        /* box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); */
                    }
                    #loginContainerPages [page] {
                        /* border: 1px solid var(--mdc-theme-on-surface); */
                        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
                        border-radius: 4px;
                        /* padding: 6px; */
                    }
                    #loginContainerPages [page="welcome"] {

                    }
                }
                @media only screen and (max-width: ${getComputedStyle(document.body).getPropertyValue('--layout-breakpoint-tablet')}) {
                    /* Mobile */
                    .login-page {
                        background: var(--mdc-theme-surface);
                    }
                    .login-card{
                        /* height:100%; */
                        width:100%;
                        margin:0;
                        top:0;
                        max-width:100%;
                    }
                    .backButton {
                        text-align: left;
                        padding-left:12px;
                    }
                    .section {
                        height: calc(var(--window-height) - 60px);
                        display:block;
                    }
                }

                @keyframes fade {
                    from {
                        opacity: 0;
                        transform: translateX(-20%)
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0)
                    }
                }
                iron-pages .animated {
                    animation-duration: 0.6s;
                    animation-name: fade;
                }
                div[page] > paper-icon-button {
                    margin:12px;
                }
                .hideme { 
                    visibility:none;
                }
            </style>

            <!-- particles.js container --> <div id="particles-js"></div> <!-- stats - count particles --> <div class="count-particles"> <span class="js-count-particles">--</span> particles </div> <!-- particles.js lib - https://github.com/VincentGarreau/particles.js --> <script src="http://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script> <!-- stats.js lib --> <script src="http://threejs.org/examples/js/libs/stats.min.js"></script>
            
            <div class="login-page" ?hidden=${this.loggedIn}>
                <div class="login-card-container">
                    <div class="login-card">
                        <iron-pages selected="${this.selectedPage}" attr-for-selected="page" id="loginContainerPages">
                            <div page="welcome">
                                <i style="visibility: hidden; float:right; padding:24px;">${this.config.coin.name} ${this.config.version}</i>
                                <br>
                                <br>
                                <!-- <h1>Karma</h1> -->
                                <img src="${this.config.coin.logo}" style="max-width: 300px; width:60%;">
                                <!-- <p>Enter the Karmaconomy</p> -->

                                <br><br><br>
                                <mwc-button
                                    @click=${() => this.selectPage('create-account')}
                                    raised
                                >
                                    Create account ASDJKFH
                                </mwc-button>
                                <mwc-button
                                    @click=${() => this.selectPage('login')}
                                >
                                    Login
                                </mwc-button>
                                <div style="text-align: right; padding:12px;">
                                    <br>
                                    <p style="margin:0; font-size: 0.9rem">Karmaship, LLC [alpha build v2.0]</p>
                                    <p style="font-size: 0.9rem"><i><small>Rewarding real life experiences</small></i></p>
                                </div>
                                <!-- <login-welcome-page selected-page="{{selectedPage}}"></login-welcome-page> -->
                            </div>
                            
                            <div page="create-account" style="text-align:left">
                                <!-- <paper-icon-button
                                    icon="icons:arrow-back"
                                    @click=${() => this.selectPage('welcome')}
                                ></paper-icon-button> -->
                                <div class="backButton">
                                    <mwc-button
                                        @click=${() => this.selectPage('welcome')}
                                    ><mwc-icon>keyboard_arrow_left</mwc-icon> Login</mwc-button>
                                </div>
                                <br>
                                <create-account-section class="section" id="createAccountSection"></create-account-section>
                            </div>
                            
                            <div page="login">
                                <!-- <paper-icon-button
                                    icon="icons:arrow-back"
                                    @click=${() => this.selectPage('welcome')}
                                ></paper-icon-button> -->
                                <div class="backButton">
                                    <mwc-button
                                        @click=${() => this.selectPage('welcome')}
                                    ><mwc-icon>keyboard_arrow_left</mwc-icon> Create account</mwc-button>
                                </div>
                                <br>
                                <login-section class="section" id='loginSection'></login-section>
                            </div>
                        </iron-pages>
                        
                    </div>
                </div>
            </div>
        `
    }

    selectPage(newPage) {
        const oldPage = this.selectedPage
        this.selectedPage = newPage
        this._pageChange(newPage, oldPage)
    }

    _pageChange(newPage, oldPage) {
        if (!this.shadowRoot.querySelector('#loginContainerPages') || !newPage) {
            return
        }
        const pages = this.shadowRoot.querySelector('#loginContainerPages').children
        // Run the animation on the newly selected page
        const newIndex = this.pages[newPage]
        if (!pages[newIndex].className.includes('animated')) {
            pages[newIndex].className += ' animated'
        }

        if (typeof oldPage !== 'undefined') {
            const oldIndex = this.pages[oldPage]
            // Stop the animation of hidden pages
            // pages[oldIndex].className = pages[oldIndex].className.split(' animated').join('');
            pages[oldIndex].classList.remove('animated')
        }
    }
    _backToWelcome() {
        this.selectedPage = 'welcome'
    }

    // _loginClick (e) {
    //     logIn()
    // }

    stateChanged(state) {
        this.loggedIn = state.app.loggedIn
        this.config = state.config
    }

    // loginAnimation (rippleOrigin) {
    //     const rippleWrapper = this.shadowRoot.getElementById('rippleWrapper')
    //     const ripple = this.shadowRoot.getElementById('ripple')
    //     const rippleContentWrapper = this.shadowRoot.getElementById('rippleContentWrapper')

    //     // Position the center of the ripple
    //     // console.dir(rippleWrapper)
    //     // console.log(rippleOrigin)
    //     rippleWrapper.style.top = rippleOrigin.y + 'px'
    //     rippleWrapper.style.left = rippleOrigin.x + 'px'
    //     rippleContentWrapper.style.marginTop = -rippleOrigin.y + 'px'
    //     rippleContentWrapper.style.marginLeft = -rippleOrigin.x + 'px'

    //     ripple.classList.add('activating')

    //     const transitionEventNames = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd']

    //     const closeRipple = () => {
    //         return new Promise((resolve, reject) => {
    //             let rippleClosed = false
    //             const rippleClosedEvent = e => {
    //                 if (!rippleClosed) {
    //                     rippleClosed = true
    //                     transitionEventNames.forEach(name => ripple.removeEventListener(name, rippleClosedEvent))
    //                     // Reset the ripple
    //                     ripple.classList.remove('activating')
    //                     ripple.classList.remove('activating-done')
    //                     ripple.classList.remove('disabling')
    //                     this.rippleIsOpen = false
    //                     resolve()
    //                 }
    //             }

    //             ripple.classList.add('disabling')
    //             transitionEventNames.forEach(name => ripple.addEventListener(name, rippleClosedEvent))
    //         })
    //     }

    //     return new Promise((resolve, reject) => {
    //         this.rippleIsOpen = false
    //         const transitionedEvent = () => {
    //             // First time
    //             if (!this.rippleIsOpen) {
    //                 ripple.classList.add('activating-done')
    //                 transitionEventNames.forEach(name => ripple.removeEventListener(name, transitionedEvent))
    //                 resolve(closeRipple)
    //             }
    //             this.rippleIsOpen = true
    //         }
    //         transitionEventNames.forEach(name => ripple.addEventListener(name, transitionedEvent))
    //     })
    // }

    // /*
    // NEED TO CHANGE THIS TO LISTENING TO STATE, WAITING FOR REDUX TO SAY, BUSY_LOGGING_IN = TRUE, WITH SOME X,Y VALUES, AND THEN RIPPLE AND UPDATE INFO FROM THERE. THIS IS CURRENTLY AN... ANTIPATTERN (MAYBE LOL)
    // */
    // async login (rippleOrigin, params) {
    //     const closeRipple = await this.loginAnimation(rippleOrigin)
    //     try {
    //         const wallet = await createWallet(this, params)
    //         store.dispatch(doLogin(wallet, params.pin))
    //         const addressColors = this.config.styles.theme.addressColors
    //         const addresses = wallet.addresses.map(address => {
    //             address.color = addressColors[address.nonce % addressColors.length]

    //             const hexSplit = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(address.color)
    //             const rgb = hexSplit.map(color => {
    //                 return parseInt(color, 16) / 255
    //             }).map(color => {
    //                 return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4)
    //             })
    //             const luminance = 0.2126 * rgb[1] + 0.7152 * rgb[2] + 0.0722 * rgb[3]

    //             address.textColor = luminance > 0.179 ? 'dark' : 'light'

    //             return address
    //         })

    //         store.dispatch(doSelectAddress(addresses[0]))
    //         // console.log('params', params)
    //         if (params.save) {
    //             // Check if the seed is already saved
    //             if (!this.config.savedWallets || !this.config.savedWallets[wallet._addresses[0].address]) {
    //                 // Snackbar
    //                 this.rippleLoadingMessage = 'Encrypting seed for storage'
    //                 // console.log(this.rippleLoadingMessage)
    //                 const saveSeedData = await generateSaveWalletData(wallet, params.pin + params.birthMonth, this.config.crypto.kdfThreads)
    //                 store.dispatch(doStoreWallet(saveSeedData))
    //             } else {
    //                 // Snackbar to say already saved
    //             }
    //         }
    //         closeRipple()
    //         this.cleanup()
    //     } catch (e) {
    //         return new Promise((resolve, reject) => {
    //             const ripple = this.shadowRoot.getElementById('ripple')
    //             const transitionEventNames = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd']
    //             let rippleClosed = false
    //             ripple.classList.add('error')
    //             ripple.classList.remove('activating')
    //             ripple.classList.remove('activating-done')
    //             const rippleClosedEvent = e => {
    //                 if (!rippleClosed) {
    //                     rippleClosed = true
    //                     transitionEventNames.forEach(name => ripple.removeEventListener(name, rippleClosedEvent))
    //                     // Reset the ripple
    //                     ripple.classList.remove('error')
    //                     this.rippleIsOpen = false
    //                     resolve()
    //                 }
    //             }
    //             transitionEventNames.forEach(name => ripple.addEventListener(name, rippleClosedEvent))
    //         }).then(() => {
    //             throw e
    //         })
    //         // alert(e)
    //     }
    //     return 'success'
    // }

    cleanup() {
        this.selectedPage = 'welcome'
    }
}

window.customElements.define('login-view', LoginView)
