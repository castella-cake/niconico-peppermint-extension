if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    $('body').css({
        'color':'#fff',
        'background-color':'#252525'
    })
}

function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", function () { 
    let manifestData = chrome.runtime.getManifest();
    $("#version").text("v" + manifestData.version_name + " Manifest V" + manifestData.manifest_version)
})
