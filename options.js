$ = function(s) {return document.getElementById(s)}

let sites = [];
let siteList = $('siteList')

showSites = function() {
    chrome.storage.sync.get('sites', function(res) {
        if(res.sites === undefined) {
            chrome.storage.sync.set({ 'sites': [] })
            return
        }

    // chrome.storage.sync.get('groups', function(res) {
    //     console.log(res.groups)
    //     console.log(res.groups.group1)
    //     console.log(res.groups['Group 1'])
    //     if(res.groups[] === undefined) {
    //         chrome.storage.sync.set({ 'groups': { 'group1': [] }})
    //         chrome.storage.sync.set({ 'sites': [] })
    //         return
    //     }

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

showSites()

let page = $('buttonDiv')
let input = document.createElement('input');

//add new button
let submit = document.createElement('button');
submit.textContent = "Add new site"
submit.style.width = 'auto';
submit.addEventListener('click', function() {
    sites.push(input.value)
    chrome.storage.sync.set({"sites": sites}, function() {})
    showSites()
})

//clear button
let clear = document.createElement('button');
clear.textContent = "Clear sites";
clear.style.width = 'auto';
clear.addEventListener('click', function() {
    chrome.storage.sync.set({"sites": []}, function() {})
    showSites()
})

//new tab button
let open = document.createElement('button');
open.textContent = "Open tabs";
open.style.width = 'auto';
open.addEventListener('click', function() {
    chrome.storage.sync.get('sites', function(res) {
        for(let site of res.sites) {
            window.open(site, '_blank')
        }
    })
})

page.appendChild(input)
page.appendChild(submit)
page.appendChild(clear)
page.appendChild(open)