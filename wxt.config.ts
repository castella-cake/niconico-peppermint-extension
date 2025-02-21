import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    // https://github.com/tabler/tabler-icons/issues/1233 の解決策
    vite: () => { return {
        resolve: {
            alias: {
              // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
                '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
            },
        },
    }},
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
            if (wxt.config.browser === "firefox") {
                manifest.browser_specific_settings = {
                    "gecko": {
                        "id": "niconico-peppermint@cyakigasi.net"
                    }
                }
            }
        },
    },
});
