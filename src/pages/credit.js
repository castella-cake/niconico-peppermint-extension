$('a').on('click', function (e) {
    if (this.target != "_blank") {
        e.preventDefault();
        $('body').css({
            'animation': 'fadeout 0.1s ease forwards 0s',
        })
        let href = $(this).attr('href')
        setTimeout(function () {
            location.href = href
        }, 100)
    }
})
function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", function () { 
    let manifestData = chrome.runtime.getManifest();
    $("#version").text("v" + manifestData.version_name + " Manifest V" + manifestData.manifest_version)
})
