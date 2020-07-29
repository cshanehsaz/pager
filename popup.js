$ = function(arg) {return document.getElementById(arg)};

let addCurrentPage = $('addCurrentPage')
let openTabs = $('openTabs')
let siteList = $('siteList')
let options = $('options')
let groupSelect = $('groupSelect')

document.addEventListener('DOMContentLoaded', function() {
    showSites() //show list of sites stored in sync on launch
    chrome.storage.sync.get('currentGroup', function(res) {
        groupSelect.appendChild(
            createParagraph('group', res.currentGroup + ' ' + '&#11206', onclick=undefined, 'currentGroup')
        )
    })

    //allows you to add current tab to your tab group
    addCurrentPage.onclick = function(e) {
        chrome.tabs.query({ currentWindow: true, active: true}, function(tab) {
            chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
                let groups = res.groups;
                let currentGroup = res.currentGroup;
                groups[currentGroup].push(tab[0].url);
                chrome.storage.sync.set({ 'groups': groups }, function() {
                    showSites();
                });
            })
        });
    };

    //opens all links within the current group
    openTabs.onclick = function(e) {
        chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
            let groups = res.groups;
            let currentGroup = res.currentGroup;
            sites = groups[currentGroup];
            for(let i=0; i<sites.length; i++) {
                let site = {url: sites[i]}
                chrome.tabs.create(site);
            }
            showSites();
        })
    }

    //opens extension options menu
    options.onclick = function(e) {
        chrome.runtime.openOptionsPage(function(){
            return
        })
    }

    //allows you to select your group
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
})

showGroups = function(groups) {
    //sets up the list of all current groups
    let allGroupsContainer = document.createElement('div')
    allGroupsContainer.id = "allGroupsContainer"
    allGroupsContainer.className = "allGroupsContainer"
    groupSelect.appendChild(allGroupsContainer)

    //iterates over all groups for dropdown
    for(let key of Object.keys(groups)) {
        // allGroupsContainer.appendChild(
        //     createParagraph('', key, groupSelectHelperFunction, 'groupIndividual')
        // )
        allGroupsContainer.appendChild(createGroupWithDelete(key))
    }                 

    //everything below setups up the new group button
    let newGroupContainer = document.createElement('div');
    newGroupContainer.id = "newGroupContainer"
    newGroupContainer.className = "addNewGroupContainer"
    allGroupsContainer.appendChild(newGroupContainer);

    let input = document.createElement('input'); //text field for group name
    input.value = "New Collection"
    input.id = "New Group Name"
    input.className = "addNewGroupInput"
    newGroupContainer.appendChild(input);
    input.onclick = function(e) { 
        e.stopPropagation()
        if(input.value === "New Collection") {
            input.value = ''
        } 
    }

    let button = document.createElement('button'); //submit button to add new group
    button.innerHTML = "Add"
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
        allGroupsContainer.removeChild(newGroupContainer);
        allGroupsContainer.appendChild(
            // createParagraph('', newGroup, groupSelectHelperFunction, 'groupIndividual')
            createGroupWithDelete(newGroup)
        )
        allGroupsContainer.appendChild(newGroupContainer)
        input.value = "New Collection";
    }
}

showSites = function() {
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let currentGroup = res.currentGroup;
        if(groups[currentGroup] === undefined) {
            groups[currentGroup] = [];
            chrome.storage.sync.set({ 'groups': groups } )
            return
        }

        clearSites()
        sites = groups[currentGroup]
        for(let s of sites) {
            let p = createParagraph(undefined, s, undefined, 'siteListIndividual');
            p.onclick = function(e) {
                chrome.tabs.create({url: e.target.innerHTML});
            }
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
        groupSelect.appendChild(
            createParagraph('group', currentGroup + '        ' + '&#11206', onclick=undefined, 'currentGroup')
        )
        showSites();
    })
}

createGroupWithDelete = function(key) {
    let container = document.createElement('div')
    container.id = key
    container.className = "groupWithDeleteContainer"
    container.appendChild(
        createElement('p', undefined, key, groupSelectHelperFunction, 'groupIndividual')
    )
    let deleteIcon = createElement('img', undefined, 'undefined', groupDeleteHelperFunction, 'deleteGroupButton')
    deleteIcon.src = "images/delete.svg"
    container.appendChild(deleteIcon)
    return container;
}

groupDeleteHelperFunction = function(e) { //used for onclick delete buttons on groups page
    let groupToDelete = e.target.parentElement.firstChild.innerHTML;
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        delete groups[groupToDelete];
        chrome.storage.sync.set({ 
            groups: groups, 
            currentGroup: 
                groupToDelete === res.currentGroup ? 
                    Object.keys(groups).length < 1 ? 
                        "Collection 1" : Object.keys(groups)[0]
                    :res.currentGroup
        }, function() {
            allGroupsContainer.removeChild($(groupToDelete))
        })
    })
}

createElement = function(element, id, text, onclick, className) {
    let e = document.createElement(element);
    if(id) {
        e.id = id;
    }
    if(text) {
        e.innerHTML = text;
    }
    if(onclick) {
        e.onclick = onclick;
    }
    if(className) {
        e.className = className;
    }
    return e;
}