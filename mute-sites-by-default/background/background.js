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

	browser.menus.create({
		id: "mute-site",
		title: "Mute site",
		contexts: ["tab"]
	});

	browser.menus.create({
		id: "unmute-site",
		title: "Unmute site",
		contexts: ["tab"]
	});

	browser.menus.onClicked.addListener((info, tab) => {
		if (info.menuItemId === "mute-site") {
			modifyBlacklist(urlToHostname(tab.url), true);
		} else if (info.menuItemId === "unmute-site") {
			modifyBlacklist(urlToHostname(tab.url), false);
		}
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
		// TODO: This will also affect tabs that have different state.
		// Maybe do some manual tracking of mute state to preserve individual tab mute status when a site get blacklisted
		if ("blacklist" in changes) {
			updateAllTabs();
		}
	});
}
