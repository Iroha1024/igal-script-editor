const { ipcRenderer } = require('electron')
const fs = require('fs')

export function openDirectory(target) {
    target.addEventListener('click', () => {
        ipcRenderer.send('open-directory-dialog')
    })
}
