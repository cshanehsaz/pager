$ = function(arg) {return document.getElementById(arg)};

let addCurrentPage = $('addCurrentPage')
let openTabs = $('openTabs')
let siteList = $('siteList')
let options = $('options')
let groupSelect = $('groupSelect')

document.addEventListener('DOMContentLoaded', function() {
    showSites() //show list of sites stored in sync on launch

    //allows you to add current tab to your tab group
    addCurrentPage.onclick = function(e) {
        chrome.tabs.query({ currentWindow: true, active: true}, function(tab) {
            chrome.storage.sync.get('sites', function(res) {
                sites = res.sites;
                sites.push(tab[0].url);
                chrome.storage.sync.set({ sites: sites }, function() {
                    showSites();
                });
            })
        });
    };

    openTabs.onclick = function(e) {
        chrome.storage.sync.get('sites', function(res) {
            sites = res.sites;
            for(let i=0; i<sites.length; i++) {
                let site = {url: sites[i]}
                chrome.tabs.create(site);
            }
            showSites();
        })
    }

    options.onclick = function(e) {
        chrome.runtime.openOptionsPage(function(){
            return
        })
    }

    groupSelect.onclick = function(e) {
        if($('group')) {
            e.stopPropagation();
            groupSelect.removeChild($('group'));

            let newGroupContainer = document.createElement('div');
            newGroupContainer.id = "newGroupContainer"
            groupSelect.appendChild(newGroupContainer);

            let input = document.createElement('input');
            input.value = "New Group"
            newGroupContainer.appendChild(input);

            input.onclick = function(e) { e.stopPropagation() }

            let button = document.createElement('button');
            button.innerHTML = "Create New Group"
            newGroupContainer.appendChild(button);

            button.onclick = function(e) {
                e.stopPropagation();
                let p = document.createElement('p')
                p.innerHTML = 'test'
                p.id = 'group'
                groupSelect.appendChild(p)
                $('groupSelect').removeChild($('newGroupContainer'));

                //test
                chrome.storage.sync.get('groups', function(res) {
                    console.log(res.groups);
                })
            }
        }
    }
})

showSites = function() {
    chrome.storage.sync.get('sites', function(res) {
        if(res.sites === undefined) {
            chrome.storage.sync.set({ 'sites': [] })
            return
        }

        clearSites()
        sites = res.sites
        for(let s of sites) {
            let p = document.createElement('p')
            p.innerHTML = s
            siteList.appendChild(p)
        }
    })
}

clearSites = function() {
    let siteList = $('siteList')
    while(siteList.firstChild) {
        siteList.removeChild(siteList.firstChild);
    }
}