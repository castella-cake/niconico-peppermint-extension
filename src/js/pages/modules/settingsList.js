const settings = {
    hide: [
        {
            type: "checkbox",
            name: "hiderankpagead",
            default: false,
        },
        {
            type: "checkbox",
            name: "hideeventbanner",
            default: false,
        },
        {
            type: "checkbox",
            name: "hidepopup",
            default: false,
        },
        {
            type: "checkbox",
            name: "hideheaderbanner",
            default: false,
        },
        {
            type: "select",
            name: "hidesupporterbutton",
            values: ["", "watch", "all"],
            default: "",
        },
        {
            type: "select",
            name: "hidemetadata",
            values: ["", "watch", "searchandhome", "all"],
            default: "",
        },
    ],
    watchpage: [
        {
            type: "desc",
            name: "featurenotavailable_newwatchpage",
            href: "https://www.cyakigasi.net/niconico/2024/peppermint-niconico-restore-affect/"
        },
        {
            type: "checkbox",
            name: "enablewatchpagereplace",
            default: false,
        },
        {
            type: "checkbox",
            name: "pmwforcepagehls",
            default: false,
        },
        {
            type: "select",
            name: "pmwlayouttype",
            values: ["renew", "recresc", "resp", "3col"],
            default: "renew"
        },
        {
            type: "checkbox",
            name: "enablemisskeyshare",
            default: false,
            settingLink: {
                name: "MISSKEYSHARE_CONFIGURE_LINK",
                href: "setmkinstance.html"
            }
        }
        /*{
            type: "select",
            name: "watchpagetheme",
            values: ["","mint","harazyuku"],
            default: ""
        },
        {
            type: "select",
            name: "playertheme",
            values: ["", "harazyuku", "rc1", "rc1plus", "ginza", "mint"],
            default: "",
        },
        {
            type: "select",
            name: "playerstyleoverride",
            values: ["", "harazyuku", "rc1", "rc1dark", "ginza", "mint", "none"],
            default: "",
        },
        {
            type: "inputNumber",
            name: "commentrow",
            min: 1,
            max: 32,
            default: 1,
        },
        {
            type: "select",
            name: "replacemarqueecontent",
            values: ["", "ranking", "blank"],
            default: "",
        },
        {
            type: "checkbox",
            name: "highlightlockedtag",
            default: false,
        },
        {
            type: "checkbox",
            name: "cleanvidowner",
            default: false,
        },
        {
            type: "checkbox",
            name: "shortcutassist",
            default: false,
            children: [{
                type: "checkbox",
                name: "excommander",
                default: false,
            }]
        },
        {
            type: "checkbox",
            name: "usetheaterui",
            default: false,
            children: [{
                type: "checkbox",
                name: "disabletheaterpalette",
                default: false,
            }]
        },
        {
            type: "checkbox",
            name: "enablenicoboxui",
            default: false,
        },
        {
            type: "checkbox",
            name: "usenicoboxui",
            default: false,
            children: [{
                type: "checkbox",
                name: "useoldnicoboxstyle",
                default: false,
            }]
        },
        {
            "type": "select",
            "name": "skipkokenending",
            default: "",
            values: ["", "onboxui", "always"],
        },
        {
            type: "checkbox",
            name: "quickvidarticle",
            default: false,
        }*/
    ],
    nicopedia: [
        {
            type: "select",
            name: "hidereputation",
            values: ["", "dislikeonly", "all"],
            default: "",
        },
        {
            type: "checkbox",
            name: "liketonicoru",
            default: false,
        },
        {
            type: "checkbox",
            name: "dicfullwidth",
            default: false,
            children: [
                {
                    type: "select",
                    name: "dicforcewidthmode",
                    values: ["", "auto", "100"],
                    default: "",
                },
            ]
        },
        {
            type: "checkbox",
            name: "dicsidebartoleft",
            default: false,
        },
        {
            type: "checkbox",
            name: "dicbettereditor",
            default: false,
        },
        {
            type: "checkbox",
            name: "diccontextsearch",
            default: false,
        },
    ],
    other: [
        {
            type: "checkbox",
            name: "alignpagewidth",
            default: false,
        },
        {
            type: "checkbox",
            name: "fixedheaderwidth",
            default: false,
        },
        {
            type: "checkbox",
            name: "highlightnewnotice",
            default: false,
        },
        {
            type: "checkbox",
            name: "vidtoptwocolumn",
            default: false,
        },
    ],
    global: [
        {
            type: "select",
            name: "darkmode",
            values: ["", "pmcolor", "spcolor", "nordcolor", "black", "cybernight", "custom"],
            default: "",
            settingLink: {
                name: "DARKMODE_CUSTOMPALETTE_LINK",
                href: "customcolorpalette.html"
            },
            children: [{
                type: "checkbox",
                name: "darkmodedynamic",
                default: false,
            }],
        },
        {
            type: "select",
            name: "headerbg",
            values: ["", "gradient", "custom"],
            default: "",
            children: [
                {
                    type: "inputString",
                    name: "headercolor",
                    default: "#252525",
                },
            ],
        },
        {
            type: "checkbox",
            name: "enablevisualpatch",
            default: false,
        },
        {
            type: "checkbox",
            name: "enablespredirect",
            default: false,
        },
        {
            type: "checkbox",
            name: "enableseriesstock",
            default: false,
            children: [{
                type: "checkbox",
                name: "showseriesstockinpage",
                default: false,
            }],
        },
        {
            type: "checkbox",
            name: "enablecustomvideotop",
            default: false,
            settingLink: {
                name: "CUSTOMVIDTOP_CONFIGURE_LINK",
                href: "customvidtop.html"
            },
        },
        {
            type: "checkbox",
            name: "skipquickpanel",
            default: false,
        },
    ],
    quickpanel: [
        {
            type: "checkbox",
            name: "enableseriesstocktab",
            default: false,
        },
        /*{
            type: "checkbox",
            name: "enablenicorepotab",
            default: false,
        },*/
        {
            type: "checkbox",
            name: "enablequicksettingstab",
            default: false,
        },
    ],
}

export default settings