chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ 
        sites: [], 
        currentGroup: 1, 
        groups: { 'Group 1': ['test'] } 
    }, function() {});



    // chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    //     chrome.declarativeContent.onPageChanged.addRules([{
    //       conditions: [new chrome.declarativeContent.PageStateMatcher({
    //         pageUrl: {hostEquals: 'developer.chrome.com'},
    //       })
    //       ],
    //           actions: [new chrome.declarativeContent.ShowPageAction()]
    //     }]);
    // });
});