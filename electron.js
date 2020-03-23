const { app, BrowserWindow, ipcMain, Menu, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

process.env['APP_PATH'] = app.getAppPath()
const server = require('./server.js')

Menu.setApplicationMenu(null)

let myWindow

function createWindow() {
    myWindow = new BrowserWindow({
        // frame: false,
        backgroundColor: '#eee',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            partition: 'persist:qortal',
            enableRemoteModule: false,
        },
        // icon: Path.join(__dirname, '../', config.icon),
        autoHideMenuBar: true
    })
    myWindow.loadURL('http://127.0.0.1:12388/app')

    myWindow.on('closed', function () {
        myWindow = null
    })

    myWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify()
    })
}


app.on('ready', () => {
    createWindow()

    console.log(app.getVersion());
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (myWindow === null) {
        createWindow()
    }
})

ipcMain.on('app_version', (event, args) => {

    myWindow.webContents.send("app_version", { version: app.getVersion() });
    // event.sender.send('app_version', { version: app.getVersion() })
})


autoUpdater.on('update-available', () => {
    // myWindow.webContents.send('update_available') // this won't be needed
    const n = new Notification({
        title: 'Update Available!',
        body: 'It will be downloaded in the background and installed on next restart'
    })
    n.show()
})


autoUpdater.on('update-downloaded', () => {
    // myWindow.webContents.send('update_downloaded') // this won't be needed
    const n = new Notification({
        title: 'Update Downloaded!',
        body: 'Restart to update'
    })
    n.show()

    // Restart App
    autoUpdater.quitAndInstall();
})

// ipcMain.on('restart_app', () => {
//     autoUpdater.quitAndInstall();
// });