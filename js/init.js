const os = require('os');
var fs = require('fs'),
	rimraf = require('rimraf'),
	spawn = require('child_process').spawn,
	https = require('https');

const path = require('path');
const sevenmin = require('7zip-min');
const Store = require('electron-store');
const store = new Store();
const homedir = os.homedir();
const arch = os.arch();
const platform = os.platform();
const { ipcRenderer } = require('electron');
const remote = require('electron').remote;
var appVersion = remote.app.getVersion();
var appPath = remote.app.getAppPath();
var appData = remote.app.getPath('userData');
var Jimp = require('jimp');
const { dialog } = require('electron').remote;
const ua = require('universal-analytics');
const log = require('electron-log');
// clear log at start
log.transports.file.clear();
var logfilepath = log.transports.file.getFile().path;

var remotemodsurl = 'https://springfightclub.com/data/';
var remotemapsurl2 = 'https://springfiles.springrts.com/files/maps/';
var remotemapsurl = 'https://files.balancedannihilation.com/data/maps/';
var springdir, mapsdir, minimapsdir, modsdir, chatlogsdir, infologfile, scriptfile, zipfile;

$('#appVersion').text('Zlobby v' + appVersion);


if (platform == 'win32') {
	$('body').addClass('win32');
} else if (platform == 'darwin') {
	$('body').addClass('darwin');
} else if (platform == 'linux') {
	$('body').addClass('linux');
}

if (remote.app.isEmojiPanelSupported()){
	$('body').addClass('emoji');
}

	
$.ajax({
	   url: "https://api.github.com/repos/marciomarim/zlobby/releases/latest",
		type:"get",
		dataType: 'json',  
		error: function(data){			
			log.error(data);
		},
		success:function( releaseinfo ) {			  
						
			log.info('Zlobby latest release version: ' + releaseinfo['name']);
			
			// if (releaseinfo['name'] > appVersion && platform == 'darwin') {
			// 	  				
			// 	log.warn('Update available: ' + releaseinfo['name']);
			// 	
			// 	var updatefile = homedir + '/Downloads/Zlobby-' + releaseinfo['name'] + '-mac.zip';
			// 	
			// 	// already downloaded
			// 	if (fs.existsSync( updatefile )){
			// 	  
			// 	  log.info('Update file already downloaded, unzipping...');
			// 	  sevenmin.unpack( updatefile , '/Applications/', err => {
			// 		  log.info('Updated!');					  
			// 	  });
			// 							  
			// 	}else{
			// 	  var fileurl = 'https://github.com/marciomarim/zlobby/releases/download/v' + releaseinfo['name'] + '/Zlobby-' + releaseinfo['name'] + '-mac.zip';
			// 	
			// 	  ipcRenderer.send('download', {
			// 		  url: fileurl,
			// 		  properties: { directory: homedir + '/Downloads/' },
			// 	  });
			// 	
			// 	  ipcRenderer.on('download progress', async (event, progress) => {
			// 		  var w = Math.round(progress.percent * 100) + '%';
			// 		  log.info('Downloading update: ' + w + ' of 100%');
			// 		  $('#appUpdate').text('Downloading ' + w + ' of 100%');					  
			// 	  });
			// 	
			// 	  ipcRenderer.on('download complete', (event, progress) => {
			// 		  log.info('Download completed, unzipping...');
			// 		  					  					  
			// 		  // unpack
			// 		  sevenmin.unpack( updatefile , '/Applications/', err => {
			// 			  // show button to update
			// 			  $('#appUpdate').text('Click to update');
			// 			  
			// 			  $('body').on('click', '#appUpdate', function(e) {
			// 				  
			// 				  remote.app.relaunch()
			// 				  remote.app.exit()
			// 				  
			// 			  });
			// 		  });
			// 	  });	
			// 	}		
			// }
				
			if (releaseinfo['name'] > appVersion && platform == 'win32') {
			  			  
			  log.warn('Update available: ' + releaseinfo['name']);
			  
			  var updatefile = homedir + '\\Downloads\\Zlobby Setup ' + releaseinfo['name'] + '.exe';
			  
			  // already downloaded
			  if (fs.existsSync(homedir + '\\Downloads\\Zlobby-Setup-' + releaseinfo['name'] + '.exe.zip')){
				  
				  log.info('Update file already downloaded, unzipping...');
				  sevenmin.unpack(homedir + '\\Downloads\\Zlobby-Setup-' + releaseinfo['name'] + '.exe.zip', homedir + '\\Downloads\\', err => {				
					  
					  const bat = spawn( updatefile , {
						  detached: true,
						  stdio: 'ignore',
					  });
					  bat.unref();
					  remote.getCurrentWindow().close();				
				  });
										  
			  }else{
				  var fileurl = 'https://github.com/marciomarim/zlobby/releases/download/v' + releaseinfo['name'] + '/Zlobby-Setup-' + releaseinfo['name'] + '.exe.zip';
			
				  ipcRenderer.send('download', {
					  url: fileurl,
					  properties: { directory: homedir + '\\Downloads\\' },
				  });
			
				  ipcRenderer.on('download progress', async (event, progress) => {
					  var w = Math.round(progress.percent * 100) + '%';
					  log.info('Downloading update: ' + w + ' of 100%');
					  //$('#appUpdate').text('Downloading ' + w + ' of 100%');
				  });
			
				  ipcRenderer.on('download complete', (event, progress) => {
					  log.info('Download completed, unzipping...');
					  // unpack
					  sevenmin.unpack(homedir + '\\Downloads\\Zlobby-Setup-' + releaseinfo['name'] + '.exe.zip', homedir + '\\Downloads\\', err => {
						  // show button to update
						  $('#appUpdate').text('Click to update');
			
						  $('body').on('click', '#appUpdate', function(e) {
							  const bat = spawn( updatefile , {
								  detached: true,
								  stdio: 'ignore',
							  });
							  bat.unref();
							  remote.getCurrentWindow().close();
						  });
					  });
				  });	
			  }		
			}
			  
			
			if (releaseinfo['name'] > appVersion && platform == 'linux') {
			  
			  var updatefile = homedir + '/Downloads/Zlobby_' + releaseinfo['name'] + '_amd64.deb';
			  log.warn('Update available: ' + releaseinfo['name']);
			  
			  // already downloaded
			  if (fs.existsSync(updatefile)){					  
				  
				  const { exec } = require("child_process");
				  exec('sudo dpkg -i ' + updatefile, (error, data, getter) => {
					  if(error){
						  log.error(error.message);
						  return;
					  }
					  if(getter){
						  log.info(data);
						  return;
					  }
					  log.info(data);			
				  });
							  
			  }else{
				  // show info					
				  var fileurl = 'https://github.com/marciomarim/zlobby/releases/download/v' + releaseinfo['name'] + '/Zlobby_' + releaseinfo['name'] + '_amd64.deb';
			
				  ipcRenderer.send('download', {
					  url: fileurl,
					  properties: { directory: homedir + '/Downloads/' },
				  });
			
				  ipcRenderer.on('download progress', async (event, progress) => {
					  var w = Math.round(progress.percent * 100) + '%';
					  log.info('Downloading update: ' + w + ' of 100%');
					  $('#appUpdate').text('Downloading update: ' + w + ' of 100%');
				  });
			
				  ipcRenderer.on('download complete', (event, progress) => {
					  
					  // show button to update
					  $('#appUpdate').text('Click to update');
			
					  $('body').on('click', '#appUpdate', function(e) {
						  const { exec } = require("child_process");
						  exec('sudo dpkg -i ' + updatefile, (error, data, getter) => {
							  if(error){
								  log.error(error.message);
								  return;
							  }
							  if(getter){
								  log.info(data);
								  return;
							  }
							  log.info(data);			
						  });
						  remote.getCurrentWindow().close();
					  });
				  });
			  }
			  
			}
		}
});



function initial_check() {
	
	springdir = store.get('paths.springdir');
	
	if (platform == 'win32') {
		
		if (!springdir){
			springdir = homedir + '\\Documents\\My Games\\Spring\\';	
			log.info('Using default spring dir');	
		}else{
			log.info('Using saved spring dir');	
		}	
					
	} else if (platform == 'darwin') {
		
		if (!springdir){
			springdir = homedir + '/.spring/';
			log.info('Using default spring dir');	
		}else{
			log.info('Using saved spring dir');	
		}
		
	} else if (platform == 'linux') {
		
		if (!springdir){
			springdir = homedir + '/.spring/';
			log.info('Using default spring dir');	
		}else{
			log.info('Using saved spring dir');	
		}
		
	}	
	store.set('paths.springdir', springdir);
	// add it to preferences tab
	$('#springdir').val(springdir);
	
	set_detault_paths(springdir);
	check_folders(springdir);
}

initial_check();

function set_detault_paths(springdir) {
	// set default paths based on saved base paths
	
	if (platform == 'win32') {		
		mapsdir = springdir + 'maps\\';		
		minimapsdir = springdir + 'minimaps\\';		
		modsdir = springdir + 'games\\';
		chatlogsdir = springdir + 'chatlogs\\';
		infologfile = springdir + 'infolog.txt';
		scriptfile = springdir + 'e-script.txt';
	} else if (platform == 'darwin') {
		mapsdir = springdir + 'maps/';
		minimapsdir = springdir + 'minimaps/';
		modsdir = springdir + 'games/';
		chatlogsdir = springdir + 'chatlogs/';
		infologfile = springdir + 'infolog.txt';
		scriptfile = springdir + 'e-script.txt';
		
	} else if (platform == 'linux') {
		mapsdir = springdir + 'maps/';		
		minimapsdir = springdir + 'minimaps/';
		modsdir = springdir + 'games/';
		chatlogsdir = springdir + 'chatlogs/';
		infologfile = springdir + 'infolog.txt';
		scriptfile = springdir + 'e-script.txt';
	} 		
}

function check_folders() {
	// additional checks for win
	log.info('Checking folders in springdir');
	
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

	if (!fs.existsSync(minimapsdir)) {
		fs.mkdirSync(minimapsdir);
	}

	if (!fs.existsSync(modsdir)) {
		fs.mkdirSync(modsdir);
	}

	if (!fs.existsSync(chatlogsdir)) {
		fs.mkdirSync(chatlogsdir);
	}

}


// preferences
// load preferences
$(window).ready(function() {
	
	// save defaults on first launch
	var autoconnect = store.get('prefs.autoconnect');
	if (autoconnect == undefined) store.set('prefs.autoconnect', 0);
	
	var hostselected = store.get('prefs.hostselected');
	if (hostselected == undefined) store.set('prefs.hostselected', 'springfightclub.com');

	var lightmode = store.get('prefs.lightmode');
	if (lightmode == undefined) store.set('prefs.lightmode', 0);
	
	var backgroundvideo = store.get('prefs.backgroundvideo');
	if (backgroundvideo == undefined) store.set('prefs.backgroundvideo', 1);
	
	var savechats = store.get('prefs.savechats');
	if (savechats == undefined) store.set('prefs.savechats', 0);

	var rudechat = store.get('prefs.rudechat');
	if (rudechat == undefined) store.set('prefs.rudechat', 1);

	var chatnotifications = store.get('prefs.chatnotifications');
	if (chatnotifications == undefined) store.set('prefs.chatnotifications', 0);
	
	var inlinechat = store.get('prefs.inlinechat');
	if (inlinechat == undefined) store.set('prefs.inlinechat', 0);
	
	// set default color
	var mycolor = store.get('user.mycolor');
	if (mycolor == undefined) store.set('user.mycolor', '556677');
	

	// load preferences and update checkboxes
	autoconnect = store.get('prefs.autoconnect');
	if (autoconnect == 0) {
		$('.autoconnect').prop('checked', false);
	} else {
		$('.autoconnect').prop('checked', true);
	}	
	
	hostselected = store.get('prefs.hostselected');
	if (hostselected) {		
		$('.serverhosturl[data-url="'+hostselected+'"]').addClass('active');
		if ( hostselected == 'springfightclub.com'){
			$('.agreementcode').hide();
		}else{
			$('.agreementcode').show();
		}		
	}

	lightmode = store.get('prefs.lightmode');
	if (lightmode == 0) {
		$('.lightmode').prop('checked', false);
	} else {
		$('.lightmode').prop('checked', true);
		$('body').addClass('lightmode');
	}
	
	backgroundvideo = store.get('prefs.backgroundvideo');
	if (backgroundvideo == 0) {
		$('.backgroundvideo').prop('checked', false);
		$('#videocontainer').remove();
	} else {
		$('.backgroundvideo').prop('checked', true);
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

	if (fs.existsSync($('#springdir').val())) {
		store.set('paths.springdir', $('#springdir').val());
		set_detault_paths($('#springdir').val());
	} else {
		$('#springdir').val('spring folder not found');
		alert('spring folder not found');
	}
});

$('body').on('click', '.resetpaths', function(e) {	
	store.set('paths.springdir', '');	
	initial_check();
});

$('body').on('click', '.deleteappdata', function(e) {
	
	if (fs.existsSync(appData)){
		log.warn('Deleting: ' + appData);
		rimraf(appData, error => {
		  if (error) log.error(error);
		 });
	}
	
});

$('body').on('click', '.deletespringdir', function(e) {
	
	if (fs.existsSync(springdir)){
		log.warn('Deleting: ' + springdir);
		rimraf(springdir, error => {
		  if (error) log.error(error);
		 });
	}
	
});

$('body').on('click', '.sendlog', function(e) {		
	
	const sgMail = require('@sendgrid/mail');	
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);	
	var username = $('#myusername').text();
	var appVersion = $('#appVersion').text();
	
	fs.readFile(logfilepath , function(err, data) {
		if (err) throw err;
		if (data) {
			
			var message = data.toString();		
			message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
			
			const msg = {
				  to: 'marciomarim@gmail.com',
				  from: 'marcio@yhello.co', // Use the email address or domain you verified above
				  subject: 'Zlobby log - ' + username + ' appVersion - ' + appVersion,				  
				  html: message,				  
				};			
				//ES8
				(async () => {
				  try {
					await sgMail.send(msg);
				  } catch (error) {
					console.error(error);
				 
					if (error.response) {
					  console.error(error.response.body)
					}
				  }
				})();	
		}
	});
	
	
	
	
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

$('body').on('click', '.backgroundvideo', function(e) {
	if ($('.backgroundvideo').prop('checked') == true) {
		store.set('prefs.backgroundvideo', 1);		
	} else {
		store.set('prefs.backgroundvideo', 0);
		$('#videocontainer').remove();
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

export { springdir, mapsdir, minimapsdir, modsdir, chatlogsdir, infologfile, scriptfile, remotemodsurl, remotemapsurl, remotemapsurl2 };
