$ = function(s) {return document.getElementById(s)}
showSites = function() {
    chrome.storage.sync.get('groups', function(res) {
        console.log(res.groups['Group 1'])
        if(res.groups['Group 1'] === undefined) {
            chrome.storage.sync.set({ 'groups': { 'Group 1': [] }})
            return
        }

        clearSites()
        sites = res.groups['Group 1']
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

//main script

let sites = [];
let siteList = $('siteList')

showSites()

let page = $('buttonDiv')
let input = document.createElement('input');

//add new button
let submit = document.createElement('button');
submit.textContent = "Add new site"
submit.style.width = 'auto';
submit.addEventListener('click', function() {
    sites.push(input.value)
    chrome.storage.sync.get('groups', function(res) {
        res.groups['Group 1'] = sites;
        chrome.storage.sync.set({ 'groups': res.groups }, function() {
            showSites();
        })
    })  
})

//clear button
let clear = document.createElement('button');
clear.textContent = "Clear sites";
clear.style.width = 'auto';
clear.addEventListener('click', function() {
    chrome.storage.sync.get('groups', function(res) {
        res.groups['Group 1'] = []
        chrome.storage.sync.set( { "groups": res.groups }, function() {} )
        showSites()
    })
    
})

//new tab button
let open = document.createElement('button');
open.textContent = "Open tabs";
open.style.width = 'auto';
open.addEventListener('click', function() {
    chrome.storage.sync.get('groups', function(res) {
        for(let site of res.groups['Group 1']) {
            window.open(site, '_blank')
        }
    })
})

page.appendChild(input)
page.appendChild(submit)
page.appendChild(clear)
page.appendChild(open)