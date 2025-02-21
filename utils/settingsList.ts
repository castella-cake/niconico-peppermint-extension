export type setting = {
    type: string,
    name: string,
    values?: any[],
    default?: any,
    href?: string,
    settingLink?: {
        name: string,
        href: string
    },
    children?: setting[],
    min?: number,
    max?: number,
    placeholder?: string,
}

export type settingList = {
    [categoryName: string]: setting[]
}
const settings: settingList = {
    global: [
        {
            type: "desc",
            name: "globaldesc"
        },
        {
            type: "select",
            name: "darkmode",
            values: ["", "pmcolor", "spcolor", "nordcolor", "nordlight", "black", "cybernight", "custom"],
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
            name: "enableseriesstock",
            default: false,
        },
        {
            type: "checkbox",
            name: "enablecustomvideotop",
            default: false,
            settingLink: {
                name: "CUSTOMVIDTOP_CONFIGURE_LINK",
                href: "customvideotop.html"
            },
        },
    ],
    hide: [
        {
            type: "desc",
            name: "hidedesc"
        },
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
            name: "hidemetadata",
            values: ["", "searchandhome"],
            default: "",
        },
    ],
    watchpage: [
        {
            type: "desc",
            name: "watchpagedesc"
        },
        {
            type: "checkbox",
            name: "watchhideknowntitle",
            default: false,
        },
        {
            type: "checkbox",
            name: "usenativedarkmode",
            default: false,
        }
    ],
    nicopedia: [
        {
            type: "desc",
            name: "nicopediadesc"
        },
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
            type: "desc",
            name: "otherdesc"
        },
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
    ],
    quickpanel: [
        {
            type: "desc",
            name: "quickpaneldesc"
        },
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
        {
            type: "checkbox",
            name: "skipquickpanel",
            default: false,
        },
    ],
}

export default settings