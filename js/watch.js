
function onError(error) {
    console.log(`Error: ${error}`);
}
var getting = browser.storage.sync.get(null);
getting.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.playertheme == "hrzkv1") {
        console.log(`CSS Loaded!`)
        var link_style = $('<link>').attr(
            {
                'rel': 'stylesheet',
                'href': browser.runtime.getURL("pagemod/css/playerstyle/harazyuku.css"),
            },
        );
        $('body').append(link_style);
        var link_style = $('<link>').attr(
            {
                'rel': 'stylesheet',
                'href': browser.runtime.getURL("pagemod/css/playertheme/harazyuku.css"),
            },
        );
        $('body').append(link_style);
        $('.ControllerContainer-inner').css('top', '3px');
    } else {
        console.log(`CSS not Loaded!`)
    }
}
