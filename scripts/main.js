const list = document.getElementById('list')
let selected = 0
let selectedTabId = 0
let tabs = []
let i = 0

const renderTabs = (q = '') => {
    list.innerHTML = ''
    chrome.tabs.query({}, function (_tabs) {
        tabs = _tabs
    });
    if(q != '') {
        tabs = tabs.filter(tab => {
            return tab.title.toLowerCase().includes(q.toLowerCase())
                || tab.url.includes(q.toLowerCase())
        })
        tabs.filter(x => x.url.includes('chrome://'))
            .forEach(x => x.favIconUrl = "/assets/favicons/chrome.png")
        mathResult = null
        if(q.match(/^[0-9]+$/) == null) {
            stringMath(q, (err, res) => {
                mathResult = res
            })
        }
        console.log(mathResult)
        if (mathResult) {
            tabs.unshift({
                title: `${q} = ${mathResult}`,
                favIconUrl: '/assets/favicons/calc.png',
                id: -1
            })
        }
        if(isValidURL(q)) {
            tabs.unshift({
                title: "Ouvrir dans un nouvel onglet",
                url: 'https://' + q,
                favIconUrl: '/assets/favicons/launch.png',
                id: -2
            })
        } else if(tabs.length == 0) {
            tabs.push({
                title: `Rechercher ${q} sur Google`,
                favIconUrl: 'https://www.google.com/favicon.ico',
                id: -1
            })
        }
    }
    tabs.forEach(function (tab) {
        let li = document.createElement('li')
        li.classList.add('list__item')
        li.setAttribute('data-id', tab.id)
        li.innerHTML = `
            <img class="list__item-favicon" src="${tab.favIconUrl || '/assets/favicons/default.png'}">
            <span class="list__item-text list__item-text--${tab.url ? 'two-lines' : 'one-line'}">
                <span class="list__item-first-line">${tab.title}</span>
                <span class="list__item-second-line">${tab.url}</span>
            </span>
            <button class="list__item-action icon-button icon-button--small">
                <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
            </button>
        `
        if(selected == i) {
            li.classList.add('list__item--selected')
            selected = false
        }
        if(tab.active) {
            li.classList.add('list__item--active')
            list.insertBefore(li, list.firstChild)
        } else {
            list.appendChild(li)
        }
    });
};

const renderSeleted = () => {
    listItems = document.querySelectorAll('.list__item')
    if(listItems.length == 0) return
    i = 0
    listItems.forEach(function (item) {
        item.classList.remove('list__item--selected')
        if(i == selected) {
            item.classList.add('list__item--selected')
            selectedTabId = parseInt(item.getAttribute('data-id'))
        }
        i++
    });
    if (selected >= i) {
        selected = 0
        renderSeleted(selected) 
    }
    if (selected < 0) {
        selected = i - 1
        renderSeleted(selected) 
    }
}

const input = document.getElementById('input')
let lastSearch = input.value

const isValidURL = (string) => {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
    return (res !== null)
}

input.addEventListener('keyup', e => {
    if(e.keyCode == 38) {
        selected--
    } else if(e.keyCode == 40) {
        selected++
    } else if(e.keyCode == 13) {
        if(selectedTabId == -1) {
            chrome.tabs.create({
                url: `https://www.google.com/search?q=${encodeURIComponent(input.value)}`
            })
        } else if(selectedTabId == -2) {
            chrome.tabs.create({
                url: `https://${input.value}`
            })
        } else {
            chrome.tabs.get(selectedTabId, function(tab) {
                chrome.tabs.highlight({'tabs': tab.index}, function() {})
            })
        }
    }
    if(lastSearch != input.value) {
        renderTabs(lastSearch = input.value)
    }
    renderSeleted(selected)
})

document.addEventListener('DOMContentLoaded', () => {
    renderTabs()
    renderSeleted(selected)
})
