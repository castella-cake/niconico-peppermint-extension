$(function(){
    function onError(error) {
        console.log(`Error: ${error}`);
    }
    var getting = browser.storage.sync.get(null);
    getting.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.test_checkbox == true ) {
            $('*').css('background', '#ff0');
        }
        if (result.test_var == "hello") {
            console.log(`CSS Loaded!`)
            var link_style = $('<link>').attr({
                'rel': 'stylesheet',
                'href': browser.runtime.getURL("pagemod/css/hello.css")
            });
            $('body').append(link_style);
        } else {
            console.log(`CSS not Loaded!`)
        }
    }
});