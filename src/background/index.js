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
