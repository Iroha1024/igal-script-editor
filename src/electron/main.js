const { ipcMain, dialog } = require('electron')

import menu from './menu'

ipcMain.on('open-directory-dialog', event => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },  files => {
        if (files) event.sender.send('select-dir', files)
    })
})


export { menu }