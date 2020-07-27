$ = function(s) {return document.getElementById(s)}
showSites = function() {
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let currentGroup = res.currentGroup;
        if(groups[currentGroup] === undefined) {
            groups[currentGroup] = []
            chrome.storage.sync.set({ 'groups': groups })
            return
        }

        clearSites()
        sites = groups[currentGroup]
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

createParagraph = function(id, text, onclick, className) {
    let p = document.createElement('p');
    p.innerHTML = text;
    p.id = id;
    if(onclick !== undefined) {
        p.onclick = onclick;
    }
    if(className !== undefined) {
        p.className = className
    }
    return p
}

groupSelectHelperFunction = function(e) {
    let currentGroup = e.target.innerHTML
    chrome.storage.sync.set({currentGroup: currentGroup}, function() {
        groupSelect.removeChild($('allGroupsContainer'))
        groupSelect.removeChild($('newGroupContainer'))
        groupSelect.appendChild(
            createParagraph('group', currentGroup, onclick=undefined, 'groupIndividual')
        )
        showSites();
    })
}

showGroups = function(groups) {
    //sets up the list of all current groups
    let allGroupsContainer = document.createElement('div')
    allGroupsContainer.id = "allGroupsContainer"
    groupSelect.appendChild(allGroupsContainer)

    //iterates over all groups for dropdown
    for(let key of Object.keys(groups)) {
        allGroupsContainer.appendChild(
            createParagraph('', key, groupSelectHelperFunction, 'groupIndividual')
        )
    }                 

    //everything below setups up the new group button
    let newGroupContainer = document.createElement('div');
    newGroupContainer.id = "newGroupContainer"
    groupSelect.appendChild(newGroupContainer);

    let input = document.createElement('input'); //text field for group name
    input.value = "New Group"
    input.id = "New Group Name"
    newGroupContainer.appendChild(input);
    input.onclick = function(e) { e.stopPropagation() }

    let button = document.createElement('button'); //submit button to add new group
    button.innerHTML = "Add New Group"
    button.className = "addNewGroupButton"
    newGroupContainer.appendChild(button);

    button.onclick = function(e) { //handles new groups
        e.stopPropagation();
        let newGroup = $('New Group Name').value;
        if(groups[newGroup] !== undefined) {
            alert('A group with this name already exists')
            return
        }
        groups[newGroup] = [];
        chrome.storage.sync.set({'groups': groups })
        allGroupsContainer.appendChild(
            createParagraph('', newGroup, groupSelectHelperFunction, 'groupIndividual')
        )
    }
}



//main script
let siteList = $('siteList')

let sites = [];
showSites()

let page = $('buttonDiv')
let input = document.createElement('input');

//group selector
let groupSelect = $('groupSelect')
groupSelect.onclick = function(e) {
    if($('group')) {
        e.stopPropagation();
        chrome.storage.sync.get('groups', function(res) {
            groupSelect.removeChild($('group'));
            groupsData = res;
            showGroups(res.groups);
        })
    }
}

//add current group
chrome.storage.sync.get('currentGroup', function(res) {
    let group = createParagraph('group', res.currentGroup, undefined, 'individualGroup')
    groupSelect.appendChild(group)
})

//add new button
let submit = document.createElement('button');
submit.textContent = "Add new site"
submit.style.width = 'auto';
submit.onclick = function() {
    sites.push(input.value)
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let currentGroup = res.currentGroup;        
        groups[currentGroup] = sites;
        chrome.storage.sync.set({ 'groups': groups }, function() {
            showSites();
        })
    })  
}

//clear button
let clear = document.createElement('button');
clear.textContent = "Clear sites";
clear.style.width = 'auto';
clear.onclick = function() {
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let currentGroup = res.currentGroup;
        groups[currentGroup] = []
        chrome.storage.sync.set( { "groups": res.groups }, function() {} )
        showSites()
    })   
}

//new tab button
let open = document.createElement('button');
open.textContent = "Open tabs";
open.style.width = 'auto';
open.onclick = function() {
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        for(let site of res.groups[res.currentGroup]) {
            let siteObj = {url: site}
            chrome.tabs.create(siteObj);
        }
    })
}

page.appendChild(input)
page.appendChild(submit)
page.appendChild(clear)
page.appendChild(open)