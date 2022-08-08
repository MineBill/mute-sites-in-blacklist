"use strict";

init();

function init() {
	var optionsHeading = document.getElementById("options-heading");
	var optionsChangeBlacklistCheckbox = document.getElementById("options-change-blacklist-checkbox");
	var optionsChangeBlacklistLabel = document.getElementById("options-change-blacklist-label");
	var blacklistHeading = document.getElementById("blacklist-heading");
	var blacklistAddInput = document.getElementById("blacklist-add-input");
	var blacklistAddButton = document.getElementById("blacklist-add-button");
	var blacklistTableWebsiteHeader = document.getElementById("blacklist-table-website-header");
	var blacklistTableRemoveHeader = document.getElementById("blacklist-table-remove-header");

	// set localized strings
	optionsHeading.appendChild(document.createTextNode(browser.i18n.getMessage("optionsHeading")));
	optionsChangeBlacklistLabel.appendChild(document.createTextNode(browser.i18n.getMessage("optionsChangeBlacklistLabel")));
	blacklistHeading.appendChild(document.createTextNode(browser.i18n.getMessage("blacklistHeading")));
	blacklistAddInput.placeholder = browser.i18n.getMessage("blacklistAddInput", "www.youtube.com");
	blacklistAddButton.appendChild(document.createTextNode(browser.i18n.getMessage("blacklistAddButton")));
	blacklistTableWebsiteHeader.appendChild(document.createTextNode(browser.i18n.getMessage("blacklistTableWebsiteHeader")));
	blacklistTableRemoveHeader.appendChild(document.createTextNode(browser.i18n.getMessage("blacklistTableRemoveHeader")));

	// initialize options
	getOptions().then((options) => {
		optionsChangeBlacklistCheckbox.checked = options.changeBlacklist;
	});
	optionsChangeBlacklistCheckbox.addEventListener("change", () => {onOptionsChanged();});

	// initialize blacklist
	updateBlacklistTable();
	blacklistAddButton.addEventListener("click", () => {onBlacklistAdd();});
	blacklistAddInput.addEventListener("keypress", (event) => {
		if (event.which == 13) {
			onBlacklistAdd();
		}
	});
	browser.storage.onChanged.addListener(onStorageChanged);
}

function updateBlacklistTable() {
	// create new table from current blacklist
	var table = document.getElementById("blacklist-table");
	var rows = document.createElement("tbody");

	// create row for every site on blacklist
	return getBlacklist().then(blacklist => {
		blacklist.sort();
		for (let site of blacklist) {
			var row = rows.insertRow(-1);

			var siteText = document.createElement("input");
			siteText.value = site;
			siteText.type = "text";
			siteText.className = "form-control";
			siteText.readOnly = "readonly";
			row.insertCell(0).appendChild(siteText);

			var removeButton = document.createElement("input");
			removeButton.type = "button";
			removeButton.className = "btn btn-danger";
			removeButton.value = "X";
			removeButton.onclick = () => {onBlacklistRemove(site);};

			var removeCell = row.insertCell(1);
			removeCell.style.textAlign = "center";
			removeCell.appendChild(removeButton);
		}

		// replace old table with new table
		var oldRows = table.getElementsByTagName("tbody")[0];
		table.replaceChild(rows, oldRows);
	});
}

function onOptionsChanged() {
	var optionsChangeBlacklistCheckbox = document.getElementById("options-change-blacklist-checkbox");
	var options = {
		"changeBlacklist": optionsChangeBlacklistCheckbox.checked
	};
	return setOptions(options);
}

function onBlacklistAdd() {
	var input = document.getElementById("blacklist-add-input");
	var site = input.value;
	input.value = "";

	return modifyBlacklist(site, true).then(() => {
		return updateBlacklistTable();
	});
}

function onBlacklistRemove(site) {
	return modifyBlacklist(site, false).then(() => {
		return updateBlacklistTable();
	});
}

function onStorageChanged(changes, area) {
	// update table when blacklist changes
	if ("blacklist" in changes) {
		return updateBlacklistTable();
	}
}
