"use strict";

init();

function init() {
	// initialize storage on first run
	getOptions().then(options => {
		if (!options) {
			var options = {
				"changeBlacklist": true
			};
			return setOptions(options);
		}
	});
	getBlacklist().then(blacklist => {
		if (!blacklist) {
			return setBlacklist([]);
		}
	}).then(() => {
		updateAllTabs();
		browser.tabs.onCreated.addListener(onTabCreated);
		browser.tabs.onUpdated.addListener(onTabUpdated);
		browser.storage.onChanged.addListener(onStorageChanged);
	});
}

function onTabCreated(tab) {
	// set muted state for new tabs
	updateTab(tab);
}

function onTabUpdated(tabId, changeInfo, tab) {
	// update muted state when url changes
	if (changeInfo.url) {
		updateTab(tab);
	}

	// update blacklist when user changes muted state
	getOptions().then(options => {
		if (changeInfo.mutedInfo && changeInfo.mutedInfo.reason == "user" && options.changeBlacklist) {
			modifyBlacklist(urlToHostname(tab.url), changeInfo.mutedInfo.muted);
		}
	});
}

function onStorageChanged(changes, area) {
	// update muted states when blacklist changes
	getOptions().then(options => {
		if ("blacklist" in changes && options.changeBlacklist) {
			updateAllTabs();
		}
	});
}
