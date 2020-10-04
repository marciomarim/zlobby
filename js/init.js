const os = require('os');
var fs = require('fs');
const sevenmin = require('7zip-min');
const Store = require('electron-store');
const store = new Store();
const homedir = os.homedir();
const arch = os.arch();
const platform = os.platform();
const { ipcRenderer } = require('electron');
var appVersion = require('electron').remote.app.getVersion();
var appPath = require('electron').remote.app.getAppPath();
var Jimp = require('jimp');
const { dialog } = require('electron').remote;
const ua = require('universal-analytics');

var remotemodsurl = 'https://springfightclub.com/data/';
var remotemapsurl = 'https://files.balancedannihilation.com/data/maps/';

//console.log('Elobby v' + appVersion);
$('#appVersion').text('Elobby v' + appVersion);

var springdir, mapsdir, minimapsdir, modsdir, replaysdir, chatlogsdir, enginedir, engineverdir, enginepath, infologfile, scriptfile, zipfile;

function initial_check() {
	var enginepath_saved = store.get('paths.enginepath');

	set_detault_paths();
	check_folders();

	// check if already looked for
	if (enginepath_saved && fs.existsSync(enginepath_saved)) {
		enginepath = enginepath_saved;
		$('#enginestatus')
			.addClass('active')
			.text('Engine: ok');

		// add it to preferences tab
		$('#enginepath').val(enginepath);
	} else {
		lookforengine();
	}
}
initial_check();

function set_detault_paths() {
	// set default paths
	if (platform == 'win32') {
		springdir = homedir + '\\Documents\\My Games\\Spring\\';
		mapsdir = homedir + '\\Documents\\My Games\\Spring\\maps\\';
		minimapsdir = appPath + '\\minimaps\\';
		modsdir = homedir + '\\Documents\\My Games\\Spring\\games\\';
		replaysdir = homedir + '\\Documents\\My Games\\Spring\\demos\\';
		chatlogsdir = homedir + '\\Documents\\My Games\\Spring\\chatlogs\\';
		infologfile = homedir + '\\Documents\\My Games\\Spring\\infolog.txt';
		scriptfile = homedir + '\\Documents\\My Games\\Spring\\e-script.txt';
		enginedir = homedir + '\\Documents\\My Games\\Spring\\engine\\';
		engineverdir = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\';
	} else if (platform == 'darwin') {
		springdir = homedir + '/.spring/';
		mapsdir = homedir + '/.spring/maps/';
		minimapsdir = appPath + '/minimaps/';
		modsdir = homedir + '/.spring/games/';
		chatlogsdir = homedir + '/.spring/chatlogs/';
		infologfile = homedir + '/.spring/infolog.txt';
		scriptfile = homedir + '/.spring/e-script.txt';
		replaysdir = homedir + '/.spring/demos/';
		enginepath = '/Applications/Spring_103.0.app/Contents/MacOS/spring';
		enginedir = '/Applications/';
		engineverdir = enginedir;
	} else if (platform == 'linux') {
		springdir = homedir + '/.spring/';
		mapsdir = homedir + '/.spring/maps/';
		minimapsdir = appPath + '/minimaps/';
		modsdir = homedir + '/.spring/games/';
		chatlogsdir = homedir + '/.spring/chatlogs/';
		infologfile = homedir + '/.spring/infolog.txt';
		scriptfile = homedir + '/.spring/e-script.txt';
		replaysdir = homedir + '/.spring/demos/';
		enginepath = homedir + '/.spring/engine/103/spring';
		enginedir = homedir + '/.spring/engine/103/';
		engineverdir = enginedir;
	} else {
		$('#enginestatus')
			.addClass('active')
			.text('Your OS is not supported');
	}

	// add it to preferences tab
	$('#springdir').val(springdir);
}

function check_folders() {
	// additional checks for win
	if (platform == 'win32') {
		var mygamesdir = homedir + '\\Documents\\My Games\\';
		if (!fs.existsSync(mygamesdir)) {
			fs.mkdirSync(mygamesdir);
		}
	}

	if (!fs.existsSync(springdir)) {
		fs.mkdirSync(springdir);
	}

	if (!fs.existsSync(mapsdir)) {
		fs.mkdirSync(mapsdir);
	}

	if (!fs.existsSync(minimapsdir)) {
		fs.mkdirSync(minimapsdir);
	}

	if (!fs.existsSync(modsdir)) {
		fs.mkdirSync(modsdir);
	}

	if (!fs.existsSync(replaysdir)) {
		fs.mkdirSync(replaysdir);
	}

	if (!fs.existsSync(chatlogsdir)) {
		fs.mkdirSync(chatlogsdir);
	}

	// additional checks for win
	if (platform == 'win32') {
		if (!fs.existsSync(enginedir)) {
			//console.log('Creating engine folder');
			fs.mkdirSync(enginedir);
		}

		if (!fs.existsSync(engineverdir)) {
			//console.log('Creating engine version folder');
			fs.mkdirSync(engineverdir);
		}
	}
}

function lookforengine() {
	var enginefound = 0;
	if (platform == 'win32') {
		if (fs.existsSync(homedir + '\\Documents\\My Games\\Spring\\engine\\103.0\\spring.exe')) {
			enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103.3\\spring.exe';
			engineverdir = homedir + '\\Documents\\My Games\\Spring\\engine\\103.3\\';
			enginefound = 1;
			store.set('paths.enginepath', enginepath);
		} else if (fs.existsSync(homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe')) {
			enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe';
			enginefound = 1;
			store.set('paths.enginepath', enginepath);
		} else if (fs.existsSync('C:\\Program Files (x86)\\Spring\\spring.exe')) {
			enginepath = 'C:\\Program Files (x86)\\Spring\\spring.exe';
			enginefound = 1;
			store.set('paths.enginepath', enginepath);
		} else {
			enginefound = 0;
			enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe';
		}
	} else if (platform == 'darwin') {
		if (fs.existsSync(enginepath)) {
			enginefound = 1;
			store.set('paths.enginepath', enginepath);
		}
	} else if (platform == 'linux') {
		if (fs.existsSync(enginepath)) {
			enginefound = 1;
			store.set('paths.enginepath', enginepath);
		}
	}

	if (!enginefound) {
		prepareenginedownload();
	} else {
		$('#enginestatus')
			.addClass('active')
			.text('Engine: ok');

		// add it to preferences tab
		$('#enginepath').val(enginepath);
	}
}

function prepareenginedownload() {
	if (platform == 'win32') {
		if (arch == 'x64') {
			zipfile = 'spring_103.0_win64-minimal-portable.7z';
			var engineurl = 'https://www.springfightclub.com/data/master_103/win64/' + zipfile;
		} else {
			zipfile = 'spring_103.0_win32-minimal-portable.7z';
			var engineurl = 'https://www.springfightclub.com/data/master_103/win32/' + zipfile;
		}
	} else if (platform == 'darwin') {
		zipfile = 'Spring_103.0.app.7z';
		var engineurl = 'https://www.springfightclub.com/data/master_103/mac/' + zipfile;
	} else if (platform == 'linux') {
		if (arch == 'x64' || arch == 'arm64') {
			zipfile = 'spring_103.0_minimal-portable-linux64-static.7z';
			var engineurl = 'https://www.springfightclub.com/data/master_103/linux64/' + zipfile;
		} else {
			zipfile = 'spring_103.0_minimal-portable-linux32-static.7z';
			var engineurl = 'https://www.springfightclub.com/data/master_103/linux32/' + zipfile;
		}
	}

	$.ajax({
		url: engineurl,
		type: 'HEAD',
		error: function() {
			console.log('Engine not found!');
		},
		success: function() {
			downloadengine(engineurl);
		},
	});
}

function downloadengine(engineurl) {
	ipcRenderer.send('download', {
		url: engineurl,
		properties: { directory: enginedir },
	});

	ipcRenderer.on('download progress', async (event, progress) => {
		var w = Math.round(progress.percent * 100) + '%';
		console.log('Downloading engine: ' + w + ' of 100%');
		$('#start .engine-download').addClass('downloading');
		$('#start .engine-download .download-title').text('Downloading engine: ' + w + ' of 100%');
		$('#start .engine-download .progress').css('width', w);
	});

	ipcRenderer.on('download complete', (event, progress) => {
		console.log('Engine download: completed!');
		$('#start .engine-download .download-title').text('Extracting files...');
		// unpack
		sevenmin.unpack(enginedir + zipfile, engineverdir, err => {
			$('#enginestatus')
				.addClass('active')
				.text('Engine: ok');

			// add it to preferences tab
			$('#enginepath').val(enginepath);

			$('#start .engine-download .download-title').text('All ready!');
			setTimeout(function() {
				$('#start .engine-download').removeClass('downloading');
			}, 3000);
		});
	});
}

// preferences
// load preferences
$(window).ready(function() {
	// save defaults on first launch
	var autoconnect = store.get('prefs.autoconnect');
	if (autoconnect == undefined) store.set('prefs.autoconnect', 1);

	var savechats = store.get('prefs.savechats');
	if (savechats == undefined) store.set('prefs.savechats', 0);

	var rudechat = store.get('prefs.rudechat');
	if (rudechat == undefined) store.set('prefs.rudechat', 0);

	// load preferences and update checkboxes
	autoconnect = store.get('prefs.autoconnect');
	if (autoconnect == 0) {
		$('.autoconnect').prop('checked', false);
	} else {
		$('.autoconnect').prop('checked', true);
	}

	rudechat = store.get('prefs.rudechat');
	if (rudechat == 0) {
		$('.rudechat').prop('checked', false);
	} else {
		$('.rudechat').prop('checked', true);
	}

	savechats = store.get('prefs.savechats');
	if (savechats == 0) {
		$('.savechats').prop('checked', false);
	} else {
		$('.savechats').prop('checked', true);
	}
});

// save preferences
$('body').on('click', '.autoconnect', function(e) {
	if ($('.autoconnect').prop('checked') == true) {
		store.set('prefs.autoconnect', 1);
	} else {
		store.set('prefs.autoconnect', 0);
	}
});

$('body').on('click', '.rudechat', function(e) {
	if ($('.rudechat').prop('checked') == true) {
		store.set('prefs.rudechat', 1);
	} else {
		store.set('prefs.rudechat', 0);
	}
});

$('body').on('click', '.savechats', function(e) {
	if ($('.savechats').prop('checked') == true) {
		store.set('prefs.savechats', 1);
	} else {
		store.set('prefs.savechats', 0);
	}
});

$('body').on('click', '.deletechats', function(e) {
	fs.readdir(chatlogsdir, (err, files) => {
		files.forEach(file => {
			if (file.startsWith('pm')) {
				fs.unlinkSync(chatlogsdir + file);
			}
		});
	});
});

$('body').on('click', '.deletebattlechats', function(e) {
	fs.readdir(chatlogsdir, (err, files) => {
		files.forEach(file => {
			if (file.startsWith('battleroom')) {
				fs.unlinkSync(chatlogsdir + file);
			}
		});
	});
});

$('body').on('click', '.deletechannelchats', function(e) {
	fs.readdir(chatlogsdir, (err, files) => {
		files.forEach(file => {
			if (file.startsWith('channel')) {
				fs.unlinkSync(chatlogsdir + file);
			}
		});
	});
});

// generate uuid
var uuid = require('uuid-random');
var useruuid = store.get('user.uuid');

if (!useruuid) {
	useruuid = uuid();
	store.set('user.uuid', useruuid);
}

const usr = ua('UA-176437325-1', useruuid);

export function trackEvent(category, action, label, value) {
	usr
		.event({
			ec: category,
			ea: action,
			el: label,
			ev: value,
		})
		.send();
}
trackEvent('App', 'launched');

export { springdir, mapsdir, minimapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl };
