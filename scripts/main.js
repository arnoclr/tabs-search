const list = document.getElementById('list')
let selected = 0
let selectedTabId = 0

const renderTabs = (q = '') => {
    list.innerHTML = ''
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            let li = document.createElement('li')
            li.classList.add('list__item')
            li.setAttribute('data-id', tab.id)
            li.innerHTML = `
                <img class="list__item-favicon" src="${tab.favIconUrl}">
                <span class="list__item-text">
                    <span class="list__item-first-line">${tab.title}</span>
                    <span class="list__item-second-line">${tab.url}</span>
                </span>
                <button class="list__item-action icon-button icon-button--small">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                </button>
            `
            if(tab.title.toLowerCase().includes(q.toLowerCase()) || tab.url.includes(q.toLowerCase())) {
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
            }
        });
    });
};

const renderSeleted = () => {
    listItems = document.querySelectorAll('.list__item')
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

input.addEventListener('keyup', e => {
    if(e.keyCode == 38) {
        selected--
    } else if(e.keyCode == 40) {
        selected++
    } else if(e.keyCode == 13) {
        chrome.tabs.get(selectedTabId, function(tab) {
            chrome.tabs.highlight({'tabs': tab.index}, function() {})
        })
    }
    if(lastSearch != input.value) {
        renderTabs(lastSearch = input.value)
    }
    renderSeleted(selected)
})

renderTabs()
