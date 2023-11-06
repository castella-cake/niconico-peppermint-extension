const getSyncStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));

module.exports = { getSyncStorageData }