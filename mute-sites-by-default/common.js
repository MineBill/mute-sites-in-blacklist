"use strict";

function modifyBlacklist(site, muted) {
	return getBlacklist().then(blacklist => {
		var blacklisted = isBlacklisted(blacklist, site);

		// add site to blacklist if user changed it to muted
		if (muted && !blacklisted) {
			blacklist.push(site);
		}

		// remove site from blacklist if user changed it to unmuted
		if (!muted && blacklisted) {
			blacklist.splice(blacklist.indexOf(site), 1);
		}

		return setBlacklist(blacklist);
	});
}

function updateTab(tab) {
	return getBlacklist().then(blacklist => {
		var blacklisted = isBlacklisted(blacklist, urlToHostname(tab.url));
		return modifyTab(tab.id, blacklisted);
	});
}

function updateAllTabs() {
	return Promise.all([getBlacklist(), getTabs()]).then(result => {
		var blacklist = result[0];
		var tabs = result[1];
		var updates = [];

		// unmute sites on blacklist and mute sites not on blacklist
		for (let tab of tabs) {
			let blacklisted = isBlacklisted(blacklist, urlToHostname(tab.url));
			updates.push(modifyTab(tab.id, blacklisted));
		}

		return Promise.all(updates);
	});
}

function getOptions() {
	return browser.storage.local.get("options").then(optionsObject => {
		return optionsObject.options;
	});
}

function setOptions(options) {
	return browser.storage.local.set({"options": options});
}

function getBlacklist() {
	return browser.storage.local.get("blacklist").then(blacklistObject => {
		return blacklistObject.blacklist;
	});
}

function setBlacklist(blacklist) {
	return browser.storage.local.set({"blacklist": blacklist});
}

function isBlacklisted(blacklist, url) {
	for (let blacklistedUrl of blacklist) {
		// escape ignored regular expression symbols
		blacklistedUrl = blacklistedUrl.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&");

		// replace wildcard character "*" with regular expression
		blacklistedUrl = blacklistedUrl.split("*").join(".*")

		if (new RegExp("^" + blacklistedUrl + "$").test(url)) {
			return true;
		}
	}
	return false;
}

function getTabs() {
	return browser.tabs.query({});
}

function modifyTab(tabId, muted) {
	return browser.tabs.update(tabId, {muted: muted});
}

function urlToHostname(url) {
	return new URL(url).hostname;
}
