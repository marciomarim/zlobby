const { app, BrowserWindow, ipcMain } = require('electron')

const { autoUpdater } = require("electron-updater")

const { download } = require("electron-dl")



function createWindow () {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 1800,
		height: 1000,
		icon: __dirname + '/assets/icons/icon.png',
		titleBarStyle: 'hidden',
		webPreferences: {
		  nodeIntegration: true,
		  webviewTag: true,
		  enableRemoteModule: true
		}
	})
	
	// and load the index.html of the app.
	win.loadFile(__dirname + '/index.html')
	
	// Open the DevTools.
	win.webContents.openDevTools()
  
  
  	ipcMain.on("download", async (event, info) => {
    	
    	info.properties.onProgress = status => win.webContents.send("download progress", status);    	    	    	
		download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
        	.then(dl => win.webContents.send("download complete", dl.getSavePath()));
	});
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});