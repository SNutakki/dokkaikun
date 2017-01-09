(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
chrome.browserAction.setBadgeBackgroundColor({color: "red"});
chrome.browserAction.setBadgeText({text: "Off"});
chrome.browserAction.onClicked.addListener(passBadgeText); 

function passBadgeText(tab) {
    chrome.browserAction.getBadgeText({tabId: tab.id},function(result) {
        if (result == "Off") {
            chrome.browserAction.setBadgeText({text: "On"});
            chrome.tabs.sendMessage(tab.id,{action: "On"},function(response) {
                if (chrome.runtime.lastError) {
                    alert("chrome.runtime.lastError: " + chrome.runtime.lastError.message);
                }
                alert("event page got a response: " + response);
            });
        } else {
            chrome.browserAction.setBadgeText({text: "Off"});
            chrome.tabs.sendMessage(tab.id,{action: "Off"},function(response) {
                if (chrome.runtime.lastError) {
                    alert("chrome.runtime.lastError: " + chrome.runtime.lastError.message);
                }
                alert("event page got a response: " + response);
            });
        }
    });
}

},{}]},{},[1]);
