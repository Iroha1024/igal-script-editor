const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const iconv = require('iconv-lite')

import menu from './menu'

ipcMain.on('open-directory-dialog', event => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },  files => {
        if (files) event.sender.send('select-dir', files)
    })
})

ipcMain.on('read-file', (event, path) => {
    const file = fs.readFileSync(path, {encoding:'binary'})
    const buf = new Buffer(file, 'binary')
    event.returnValue = iconv.decode(buf, 'utf-8')
})


export { menu }