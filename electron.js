const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')

process.env['APP_PATH'] = app.getAppPath()
const server = require('./server.js')

let mainWindow
let win

function createWindow() {
    win = new BrowserWindow({
        // frame: false,
        backgroundColor: '#eee',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            partition: 'persist:qortal'
        },
        // icon: Path.join(__dirname, '../', config.icon),
        autoHideMenuBar: true
    })
    win.loadURL('http://qor.tal/q/wallet/')
    win.on('closed', function () {
        win = null
    })
    win.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify()
    })
}

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() })
})

autoUpdater.on('update-available', () => {
    // mainWindow.webContents.send('update_available') // Not used at the moment...
    const n = new Notification({
        title: 'Update available',
        body: 'It will be downloaded in the background and installed on next restart'
    })
    n.show()
})

autoUpdater.on('update-downloaded', () => {
    // mainWindow.webContents.send('update_downloaded') // Not used at the moment
    const n = new Notification({
        title: 'Update downloaded',
        body: 'Restart your UI to update'
    })
    n.show()
})

