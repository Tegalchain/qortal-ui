System.register(['./pwa-helpers-b8803d22.js', './iron-a11y-keys-behavior-17f3f126.js'], function () {
    'use strict';
    var css, customElement, LitElement, html, __decorate;
    return {
        setters: [function (module) {
            css = module.c;
            customElement = module.a;
            LitElement = module.L;
            html = module.h;
        }, function (module) {
            __decorate = module.b;
        }],
        execute: function () {

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
            const style = css `:host{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}`;

            let Icon = class Icon extends LitElement {
                render() {
                    return html `<slot></slot>`;
                }
            };
            Icon.styles = style;
            Icon = __decorate([
                customElement('mwc-icon')
            ], Icon);

        }
    };
});
//# sourceMappingURL=mwc-icon-a3cde566.js.map
