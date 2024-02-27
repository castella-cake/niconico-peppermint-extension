function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", function () { 
    let manifestData = chrome.runtime.getManifest();
    $("#version").text("v" + manifestData.version_name + " Manifest V" + manifestData.manifest_version);

    // easter egg
    let eggArray = []
    document.getElementById("ee_s").addEventListener("click", (e) => {
        e.preventDefault()
        eggArray.push("s")
        if (eggArray.length > 4) {
            eggArray = []
        }
    })
    document.getElementById("ee_t").addEventListener("click", (e) => {
        e.preventDefault()
        eggArray.push("t")
        if (eggArray.length > 4) {
            eggArray = []
        }
    })
    document.getElementById("ee_a").addEventListener("click", (e) => {
        e.preventDefault()
        eggArray.push("a")
        if (eggArray.length > 4) {
            eggArray = []
        }
    })
    document.getElementById("ee_r").addEventListener("click", (e) => {
        e.preventDefault()
        eggArray.push("r")
        if (eggArray.join("") == "star") {
            document.getElementById("ee_style").innerHTML = `
                body { background: #000; color: #ff0; }
                .settings-area { background: transparent; text-align: center; }
                .settings-area > * { text-align: center; font-family: "Arial", "Helvetica", "Helvetica Neue", "Meiryo", sans-serif }
                .settings-area h1 { text-transform: uppercase; }
                .settings-area a { color: #ff0; }
            `
        }
    })
})
