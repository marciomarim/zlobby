const { app, BrowserWindow, ipcMain, dialog } = require('electron');

const { autoUpdater } = require('electron-updater');

const { download } = require('electron-dl');

const Store = require('electron-store');
const store = new Store();

function createWindow() {
	// Create the browser window.		
	const win = new BrowserWindow({
		width: 1800,
		height: 1200,
		minWidth: 1100,
		minHeight: 800,
		backgroundColor: '#000000',		
		titleBarStyle: 'hidden',
		frame: true,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,			
			webviewTag: true,
			enableRemoteModule: true,
			worldSafeExecuteJavaScript: true,			
		},
	});

	// and load the index.html of the app.
	win.loadFile(__dirname + '/index.html');

	// Open the DevTools.
	//win.webContents.openDevTools()

	win.once('ready-to-show', () => {
		win.show();
		if (process.platform == 'darwin') {
			autoUpdater.checkForUpdatesAndNotify();
		}
	});
	
	win.once('focus', () => win.flashFrame(false));

	ipcMain.on('download', async (event, info) => {
		info.properties.onProgress = status => win.webContents.send('download progress', status);
		download(BrowserWindow.getFocusedWindow(), info.url, info.properties).then(dl => win.webContents.send('download complete', dl.getSavePath()));
	});

	app.on('open-url', function(event, data) {
		event.preventDefault();
		//log('open-url event: ' + data);
		win.webContents.executeJavaScript(`document.querySelector('#externaldata').innerHTML="${data}"`);
		link = data;
	});

	app.setAsDefaultProtocolClient('zlobby');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
	if (process.platform == 'darwin') {
		autoUpdater.checkForUpdatesAndNotify();
	}
	createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	//if (process.platform !== 'darwin') {
		app.quit();
	//}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => {
	console.log('Checking for update...');
});

autoUpdater.on('update-available', info => {
	console.log('update-available...');
});

autoUpdater.on('error', err => {});

autoUpdater.on('download-progress', progressObj => {
	let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
	log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
	log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
	console.log(log_message);
});

autoUpdater.on('update-downloaded', info => {
	const dialogOpts = {
		type: 'info',
		buttons: ['Restart', 'Later'],
		title: 'Update is ready',
		message: 'Update is ready',
		detail: 'A new version has been downloaded. Restart to apply the updates.',
	};

	dialog.showMessageBox(dialogOpts).then(returnValue => {
		if (returnValue.response === 0) autoUpdater.quitAndInstall();
	});
});
