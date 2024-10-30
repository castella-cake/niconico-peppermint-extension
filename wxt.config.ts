import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: {
        "name": "Niconico-PepperMint+",
        "permissions": [
            "storage",
            "contextMenus",
            "alarms",
            "tabs",
            "scripting"
        ],
        "host_permissions": [
            "*://*.nicovideo.jp/*",
            "https://fonts.googleapis.com/icon",
            "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/*",
            "https://nicovideo.cdn.nimg.jp/thumbnails/*",
        ],
        "web_accessible_resources": [{
            "resources": [
                "style/*",
                "watch_injector.js",
                "*://*.nicovideo.jp/*",
            ],
            "matches": [
                "*://*.nicovideo.jp/*",
            ]
        }],
        "browser_specific_settings": {
            "gecko": {
                "id": "niconico-peppermint@cyakigasi.net"
            }
        }
    },
    extensionApi: "chrome",
    hooks: {
        'build:manifestGenerated': (wxt, manifest) => {
            if (wxt.config.mode.toLowerCase() === "development") {
                manifest.icons = {
                    "32": "icon-dev/icon-32.png",
                    "64": "icon-dev/icon-64.png",
                    "128": "icon-dev/icon-128.png"
                }
            }
        },
    },
});
