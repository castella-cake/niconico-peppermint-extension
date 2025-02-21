function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", function () { 
    const manifestData = browser.runtime.getManifest();
    const thisVersion = manifestData.version_name || manifestData.version || "Unknown"
    document.getElementById("version").textContent = "v" + thisVersion + " Manifest V" + manifestData.manifest_version;

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
.maincontainer {
    overflow: hidden;
}
.maincontainer_inner {
    transform-style: preserve-3d;
    animation: 15s linear 0s forwards star;
    overflow: hidden;
}
.settings-area { background: transparent; text-align: center; }
.settings-area > * { text-align: center; font-family: "Arial", "Helvetica", "Helvetica Neue", "Meiryo", sans-serif }
.settings-area h1 { text-transform: uppercase; }
.settings-area a { color: #ff0; }
@keyframes star {
    0% {
        transform: perspective(2000px) rotateX(40deg) scale(0.9) translateY(300vh);
        opacity: 1.0
    }
    93% {
        transform: perspective(2000px) rotateX(40deg) scale(0.9) translateY(-250vh);
        opacity: 1.0
    }
    94% {
        transform: perspective(2000px) rotateX(40deg) scale(0.9) translateY(-250vh);
        opacity: 0.0
    }
    95% {
        transform: perspective(0px) rotateX(0deg) scale(1) translateY(0vh);
        opacity: 0.0
    }
    100% {
        transform: perspective(0px) rotateX(0deg) scale(1) translateY(0vh);
        opacity: 1.0
    }
}
            `
        }
    })
})
