const getSyncStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));

const getLocalStorageData = new Promise((resolve) => chrome.storage.local.get(null, resolve));

module.exports = { getSyncStorageData, getLocalStorageData }