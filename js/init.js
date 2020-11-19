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

var springdir, mapsdir, minimapsdir, modsdir, replaysdir, replaysdir2, chatlogsdir, enginedir, engineverdir, enginepath, infologfile, scriptfile, zipfile;

function initial_check() {
	enginepath = store.get('paths.enginepath');
	var springdir_saved = store.get('paths.springdir');

	console.warn('debug engine checking: 0');

	if (springdir_saved && fs.existsSync(springdir_saved)) {
		springdir = springdir_saved;
		console.warn('debug engine checking: 1');
	} else {
		// set default springdir
		if (platform == 'win32') {
			springdir = homedir + '\\Documents\\My Games\\Spring\\';
			console.warn('debug engine checking: 2');
		} else if (platform == 'darwin') {
			springdir = homedir + '/.spring/';
		} else if (platform == 'linux') {
			springdir = homedir + '/.spring/';
		}
		store.set('paths.springdir', springdir);
	}
	// add it to preferences tab
	$('#springdir').val(springdir);

	set_detault_paths(enginepath, springdir);
	check_folders(springdir);

	// check if spring executable exists
	if (enginepath && fs.existsSync(enginepath)) {
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

function set_detault_paths(enginepath, springdir) {
	// set default paths based on saved base paths
	if (platform == 'win32') {
		console.warn('debug engine checking: 3');
		mapsdir = springdir + 'maps\\';
		minimapsdir = appPath + '\\minimaps\\';
		modsdir = springdir + 'games\\';
		replaysdir = springdir + 'demos\\';
		chatlogsdir = springdir + 'chatlogs\\';
		infologfile = springdir + 'infolog.txt';
		scriptfile = springdir + 'e-script.txt';
		enginedir = springdir + 'engine\\';
		engineverdir = springdir + 'engine\\103\\';
		if (fs.existsSync(homedir + '\\Documents\\My Games\\Spring\\engine\\103.0\\')) {
			console.warn('debug engine checking: 4');
			engineverdir = springdir + 'engine\\103.0\\';
			replaysdir2 = springdir + 'engine\\103.0\\demos\\';
		} else if (fs.existsSync(homedir + '\\Documents\\My Games\\Spring\\engine\\103\\')) {
			console.warn('debug engine checking: 5');
			engineverdir = springdir + 'engine\\103\\';
			replaysdir2 = springdir + 'engine\\103\\demos\\';
		}
	} else if (platform == 'darwin') {
		mapsdir = springdir + 'maps/';
		minimapsdir = appPath + '/minimaps/';
		modsdir = springdir + 'games/';
		chatlogsdir = springdir + 'chatlogs/';
		infologfile = springdir + 'infolog.txt';
		scriptfile = springdir + 'e-script.txt';
		replaysdir = homedir + '/.config/demos/';
		replaysdir2 = homedir + '/.config/spring/demos/';
		enginedir = '/Applications/';
		engineverdir = enginedir;
	} else if (platform == 'linux') {
		mapsdir = springdir + 'maps/';
		minimapsdir = appPath + '/minimaps/';
		modsdir = springdir + 'games/';
		chatlogsdir = springdir + 'chatlogs/';
		infologfile = springdir + 'infolog.txt';
		scriptfile = springdir + 'e-script.txt';
		replaysdir = springdir + 'demos/';
		enginedir = springdir + 'engine/103/';
		engineverdir = enginedir;
	} else {
		$('#enginestatus')
			.addClass('active')
			.text('Your OS is not supported');
	}
}

function check_folders() {
	// additional checks for win
	if (platform == 'win32') {
		var documentsdir = homedir + '\\Documents\\';
		if (!fs.existsSync(documentsdir)) {
			fs.mkdirSync(documentsdir);
		}

		var mygamesdir = homedir + '\\Documents\\My Games\\';
		if (!fs.existsSync(mygamesdir)) {
			fs.mkdirSync(mygamesdir);
		}
	}

	if (platform == 'darwin') {
		if (!fs.existsSync(homedir + '/.config/')) {
			fs.mkdirSync(homedir + '/.config/');
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
			enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103.0\\spring.exe';
			enginefound = 1;
			console.warn('debug engine checking: 6');
		} else if (fs.existsSync(homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe')) {
			enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe';
			enginefound = 1;
			console.warn('debug engine checking: 7');
		} else if (fs.existsSync('C:\\Program Files (x86)\\Spring\\spring.exe')) {
			enginepath = 'C:\\Program Files (x86)\\Spring\\spring.exe';
			enginefound = 1;
			console.warn('debug engine checking: 8');
		} else {
			enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe';
			enginefound = 0;
			console.warn('debug engine checking: 9');
		}
		store.set('paths.enginepath', enginepath);
	} else if (platform == 'darwin') {
		if (fs.existsSync('/Applications/Spring_103.0.app/Contents/MacOS/spring')) {
			enginefound = 1;
			enginepath = '/Applications/Spring_103.0.app/Contents/MacOS/spring';
		}
	} else if (platform == 'linux') {
		if (fs.existsSync(springdir + 'engine/103/spring')) {
			enginefound = 1;
			enginepath = springdir + 'engine/103/spring';
		}
	}

	if (!enginefound) {
		console.warn('debug engine checking: 10');
		setTimeout(function() {
			var answer = window.confirm('Engine not found, click OK to download or CANCEL to setup manually?');
			if (answer) {
				prepareenginedownload();
			} else {
				$('.tab, .container.active').removeClass('active');
				$('#preferences, .tab.preferences').addClass('active');
			}
		}, 2000);
	} else {
		$('#enginestatus')
			.addClass('active')
			.text('Engine: ok');

		// add it to preferences tab
		$('#enginepath').val(enginepath);
		store.set('paths.enginepath', enginepath);
	}
}

function prepareenginedownload() {
	console.warn('debug engine checking: 11');
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

	var lightmode = store.get('prefs.lightmode');
	if (lightmode == undefined) store.set('prefs.lightmode', 0);

	var savechats = store.get('prefs.savechats');
	if (savechats == undefined) store.set('prefs.savechats', 0);

	var rudechat = store.get('prefs.rudechat');
	if (rudechat == undefined) store.set('prefs.rudechat', 1);

	var chatnotifications = store.get('prefs.chatnotifications');
	if (chatnotifications == undefined) store.set('prefs.chatnotifications', 0);

	// load preferences and update checkboxes
	autoconnect = store.get('prefs.autoconnect');
	if (autoconnect == 0) {
		$('.autoconnect').prop('checked', false);
	} else {
		$('.autoconnect').prop('checked', true);
	}

	lightmode = store.get('prefs.lightmode');
	if (lightmode == 0) {
		$('.lightmode').prop('checked', false);
	} else {
		$('.lightmode').prop('checked', true);
		$('body').addClass('lightmode');
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

	chatnotifications = store.get('prefs.chatnotifications');
	if (chatnotifications == 0) {
		$('.chatnotifications').prop('checked', false);
	} else {
		$('.chatnotifications').prop('checked', true);
	}
});

// save preferences

$('body').on('click', '.savepaths', function(e) {
	if (fs.existsSync($('#enginepath').val())) {
		store.set('paths.enginepath', $('#enginepath').val());
		// redefine paths
		enginepath = $('#enginepath').val();
	} else {
		$('#enginepath').val('spring file not found');
		alert('spring file not found');
	}

	if (fs.existsSync($('#springdir').val())) {
		store.set('paths.springdir', $('#springdir').val());
		set_detault_paths($('#enginepath').val(), $('#springdir').val());
	} else {
		$('#springdir').val('spring folder not found');
		alert('spring folder not found');
	}
});

$('body').on('click', '.autoconnect', function(e) {
	if ($('.autoconnect').prop('checked') == true) {
		store.set('prefs.autoconnect', 1);
	} else {
		store.set('prefs.autoconnect', 0);
	}
});

$('body').on('click', '.lightmode', function(e) {
	if ($('.lightmode').prop('checked') == true) {
		store.set('prefs.lightmode', 1);
		$('body').addClass('lightmode');
	} else {
		store.set('prefs.lightmode', 0);
		$('body').removeClass('lightmode');
	}
});

$('body').on('click', '.rudechat', function(e) {
	if ($('.rudechat').prop('checked') == true) {
		store.set('prefs.rudechat', 1);
	} else {
		store.set('prefs.rudechat', 0);
	}
});

$('body').on('click', '.chatnotifications', function(e) {
	if ($('.chatnotifications').prop('checked') == true) {
		store.set('prefs.chatnotifications', 1);
	} else {
		store.set('prefs.chatnotifications', 0);
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

export { springdir, mapsdir, minimapsdir, modsdir, replaysdir, replaysdir2, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl };
