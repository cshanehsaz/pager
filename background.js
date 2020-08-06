chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(['groups'], function(res) {
        if(res.groups === undefined) {
            chrome.storage.sync.set({ 
                sites: [], 
                currentGroup: 'Click me!', 
                groups: { 'Click me!': [{link: 'https://google.com', alias: 'google.com'}], "Another Collection": [] } 
            }, function() {});
            return ('new instance created');
        }
    })
});