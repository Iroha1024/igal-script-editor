import { ipcMain, dialog } from 'electron'

ipcMain.on('open-directory-dialog', event => {
    dialog.showOpenDialog(
        {
            properties: ['openDirectory'],
        },
        files => {
            if (files) event.sender.send('select-dir', files)
        }
    )
})

export { menu } from './menu'
export * from './config.js'
