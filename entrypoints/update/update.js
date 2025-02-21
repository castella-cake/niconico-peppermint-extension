let manifestData = browser.runtime.getManifest();
document.getElementById("current-version").textContent = manifestData.version_name || manifestData.version || "Unknown"