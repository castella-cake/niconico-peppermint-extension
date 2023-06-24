let manifestData = chrome.runtime.getManifest();
document.getElementById("current-version").textContent = manifestData.version_name