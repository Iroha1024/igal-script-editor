const { ipcRenderer } = require('electron')

export function openDirectory(target) {
    target.addEventListener('click', () => {
        ipcRenderer.send('open-directory-dialog')
    })
}
