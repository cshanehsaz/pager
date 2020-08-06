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
                groups[currentGroup].push({link: tab[0].url, alias: tab[0].url});
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
                let site = {url: sites[i].link}
                chrome.tabs.create(site);
            }
            showSites();
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
    for(let key of Object.keys(groups).sort()) {
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
    input.addEventListener("keyup", function(event) { //on enter will submit changes
        if (event.keyCode === 13) {
          event.preventDefault();
          button.click();
        }
    })

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

        sites = groups[currentGroup]
        let container = document.createElement('div')
        for(let s of sites) {
            //creates div
            let d = document.createElement('div')
            d.className = "siteListIndividualContainer"
            d.link = s.link;

            //creates link name
            let alias = s.alias;
            if(alias.startsWith('https://')) { alias = alias.slice(8) }
            alias = alias.length < 20 ? alias : alias.slice(0, 19) + '...';
            d.alias = alias;

            let favicon = document.createElement('img');
            favicon.src = 'http://www.google.com/s2/favicons?domain=' + isolateSite(d.link);
            favicon.className = 'favicon'

            let p = createParagraph(undefined, alias, undefined, 'siteListIndividual');
            p.onclick = function(e) {
                chrome.tabs.create({url: e.target.parentElement.link});
            }

            //creates rename
            let edit = createParagraph(undefined, 'rename', siteEditHelperFunction, 'siteListEdit')

            //creates delete icon
            let deleteIcon = createElement('img', undefined, 'undefined', siteDeleteHelperFunction, 'deleteGroupButton')
            deleteIcon.src = "images/delete.svg"
            deleteIcon.link = s.link;

            d.appendChild(favicon);
            d.appendChild(p)
            d.appendChild(edit)
            d.appendChild(deleteIcon)
            container.appendChild(d)
        }
        clearSites()
        siteList.appendChild(container)
    })
}

clearSites = function() {
    let siteList = $('siteList')
    while(siteList.firstChild) {
        siteList.removeChild(siteList.firstChild);
    }
}

siteDeleteHelperFunction = function(e) {
    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let sites = res.groups[res.currentGroup];
        let siteToRemove = e.target.link;
        for (let i = 0; i<sites.length; i++) {
            if(sites[i].link === siteToRemove) {
                sites.splice(i, 1)
            }
        }
        groups[res.currentGroup] = sites;
        chrome.storage.sync.set({ groups: groups }, () => showSites())
    })
}

siteEditHelperFunction = function(e) {
    let parent = e.target.parentElement;
    let alias = parent.alias;
    while(parent.childNodes.length > 1) {parent.removeChild(parent.lastChild)}

    let editField = document.createElement('input');
    editField.value = alias;
    editField.className = 'siteListEditField';
    parent.appendChild(editField);
    editField.addEventListener("keyup", function(event) { //on enter will submit changes
        if (event.keyCode === 13) {
          event.preventDefault();
          setName.click();
        }
    })

    let setName = createParagraph(undefined, 'Save', siteRenameHelperFunction, 'siteListEdit')
    parent.appendChild(setName)

    editField.focus();
    editField.select();
}

siteRenameHelperFunction = function(e) {
    let parent = e.target.parentElement;
    let link = parent.link;
    let alias = parent.childNodes[1].value;

    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let sites = groups[res.currentGroup];
        for(let s of sites) {
            if(s.link === link) {
                s.alias = alias;
            }
        }
        groups[res.currentGroup] = sites;
        chrome.storage.sync.set({groups: groups}, function() {
            showSites();
        })
    })
}

groupEditHelperFunction = function(e) {
    let parent = e.target.parentElement;
    parent.oldName = parent.firstChild.innerHTML;
    while(parent.firstChild) {parent.removeChild(parent.firstChild)}

    let editField = document.createElement('input');
    editField.value = parent.oldName;
    editField.className = 'groupListEditField';
    parent.appendChild(editField);
    editField.addEventListener("keyup", function(event) {
        //on enter will submit changes
        if (event.keyCode === 13) {
          event.preventDefault();
          setName.click();
        }
    })

    let setName = createParagraph(undefined, 'save', groupRenameHelperFunction, 'siteListEdit')
    parent.appendChild(setName)

    editField.focus();
    editField.select();
}

groupRenameHelperFunction = function(e) {
    let parent = e.target.parentElement;
    let oldName = parent.oldName;
    let newName = parent.firstChild.value;

    chrome.storage.sync.get(['groups', 'currentGroup'], function(res) {
        let groups = res.groups;
        let currentGroup = res.currentGroup;

        if(Object.keys(groups).indexOf(newName) > -1) { //don't update info if name exists already
            groupSelect.removeChild($('allGroupsContainer'));
            showGroups(groups);
            return;
        }

        //if there's a new alias made
        groups[newName] = groups[oldName];
        delete groups[oldName];
        chrome.storage.sync.set({
            groups: groups,
            currentGroup: oldName === currentGroup ? newName : currentGroup
        }, function() {
            groupSelect.removeChild($('allGroupsContainer'))
            showGroups(groups);
        })
    })
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
        createElement('p', undefined, key.length < 20 ? key : key.slice(0, 18) + '...', groupSelectHelperFunction, 'groupIndividual')
    )

    let renameButton = createElement('p', undefined, 'rename', groupEditHelperFunction, 'siteListEdit')
    container.appendChild(renameButton)

    let deleteIcon = createElement('img', undefined, 'undefined', groupDeleteHelperFunction, 'deleteGroupButton')
    deleteIcon.src = "images/delete.svg"
    container.appendChild(deleteIcon)
    return container;
}

groupDeleteHelperFunction = function(e) { //used for onclick delete buttons on groups page
    let groupToDelete = e.target.parentElement.id;
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

isolateSite = function(link) {
    if(link.startsWith('https://')) {
        link = link.slice(8);
    }
    if(link.startsWith('http://')) {
        link = link.slice(7);
    }
    if(link.indexOf('/' !== -1)) {
        link = link.slice(0, link.indexOf('/'));
    }
    return link;
}