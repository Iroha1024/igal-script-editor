import { app, ipcMain } from 'electron'
import Path from 'path'
import fs, { promises } from 'fs'

const dataPath = app.getPath('userData')
const configPath = Path.resolve(dataPath, 'config.json')

const data = {
    fontSize: {
        value: 25,
        type: 'input',
    },
    fontFamily: {
        value: 'none',
        type: 'select',
    },
}
let configData

ipcMain.on('read-config', async event => {
    if (!fs.existsSync(configPath)) {
        await promises.writeFile(configPath, JSON.stringify(data))
    }
    configData = await promises.readFile(configPath, 'utf-8')
    configData = JSON.parse(configData)
    event.sender.send('get-config', configData)
})

ipcMain.on('set-config', async (event, data) => {
    await promises.writeFile(configPath, JSON.stringify(data))
    event.sender.send('save-config')
})

export * from './config.js'
