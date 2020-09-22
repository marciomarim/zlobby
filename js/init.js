const os = require('os');

var fs = require('fs');

//const seven = require('node-7z'); 
const sevenmin = require('7zip-min');

const Store = require('electron-store'); 
const store = new Store();

const homedir = os.homedir();
const arch = os.arch();
const platform = os.platform();

const {ipcRenderer} = require("electron");

var appVersion = require('electron').remote.app.getVersion();

const { dialog } = require('electron').remote;

const ua = require('universal-analytics');

var remotemodsurl = 'https://springfightclub.com/data/';
//var remotemapsdir = 'https://springfightclub.com/data/maps/';
var remotemapsurl = 'http://files.balancedannihilation.com/data/maps/';

export {springdir, mapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl}


//console.log('Elobby v' + appVersion);	
$('#appVersion').text('Elobby v' + appVersion);

/*
var enginefound = store.get('engine.enginefound');
if (enginefound){
	
}
*/

// set default paths	
var enginefound = 0;
if(platform == 'win32'){		
	
	var springdir = homedir + '\\Documents\\My Games\\Spring\\';
	var mapsdir = homedir + '\\Documents\\My Games\\Spring\\maps\\';
	var modsdir = homedir + '\\Documents\\My Games\\Spring\\games\\';
	var replaysdir = homedir + '\\Documents\\My Games\\Spring\\demos\\';
	var chatlogsdir = homedir + '\\Documents\\My Games\\Spring\\chatlogs\\';
	var infologfile = homedir + '\\Documents\\My Games\\Spring\\infolog.log';
	var scriptfile = homedir + '\\Documents\\My Games\\Spring\\e-script.txt';
	var enginedir = homedir + '\\Documents\\My Games\\Spring\\engine\\';	
	var engineverdir = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\';
	
	if (arch == 'x64'){
		var zipfile = 'spring_103.0_win64-minimal-portable.7z';
	}else{		
		var zipfile = 'spring_103.0_win32-minimal-portable.7z';
	}	
	
	if ( fs.existsSync( homedir + '\\Documents\\My Games\\Spring\\engine\\103.0\\spring.exe' ) ) {
		var enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103.3\\spring.exe';
		enginefound = 1;		
	}else if( fs.existsSync( homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe' ) ){
		var enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103\\spring.exe';
		enginefound = 1;
	}else if( fs.existsSync( 'C:\\Program Files (x86)\\Spring\\spring.exe' ) ){
		var enginepath = 'C:\\Program Files (x86)\\Spring\\spring.exe';
		enginefound = 1;
	}else{
		enginefound = 0;
	}			
	
	if (arch == 'x64'){
		var zipfile = 'spring_103.0_win64-minimal-portable.7z';
		var engineurl = 'https://www.springfightclub.com/data/master_103/win64/' + zipfile;
	}else{
		var zipfile = 'spring_103.0_win32-minimal-portable.7z';
		var engineurl = 'https://www.springfightclub.com/data/master_103/win32/' + zipfile;	
	}		
	
	// not portable
/*
	if (!fs.existsSync(springdir)){
		springdir = 'C:\\Program Files (x86)\\Spring\\';
		var mapsdir = 'C:\\Program Files (x86)\\Spring\\maps\\';
		var modsdir = 'C:\\Program Files (x86)\\Spring\\games\\';
		var replaysdir = 'C:\\Program Files (x86)\\Spring\\demos\\';
		var chatlogsdir = 'C:\\Program Files (x86)\\Spring\\chatlogs\\';
		var infologfile = 'C:\\Program Files (x86)\\Spring\\infolog.log';
		var scriptfile = 'C:\\Program Files (x86)\\Spring\\e-script.txt';
		var enginepath = 'C:\\Program Files (x86)\\Spring\\spring.exe';
	}	
*/	
}else if( platform == 'darwin' ){
	
	var springdir = homedir + '/.spring/';	
	var mapsdir = homedir + '/.spring/maps/';
	var modsdir = homedir + '/.spring/games/';	
	var chatlogsdir = homedir + '/.spring/chatlogs/';
	var infologfile = homedir + '/.spring/infolog.log';
	var scriptfile = homedir + '/.spring/e-script.txt';	
	var replaysdir = homedir + '/.config/spring/demos/';
	var enginepath = '/Applications/Spring_103.0.app/Contents/MacOS/spring';			
	var enginedir = '/Applications/';
	var engineverdir = enginedir;
	var zipfile = 'Spring_103.0.app.7z'; 	
	var engineurl = 'https://www.springfightclub.com/data/master_103/mac/' + zipfile;
	
	if ( fs.existsSync(enginepath) ){
		enginefound = 1;
	}
	
}else if( platform == 'linux' ){
	
	var springdir = homedir + '/.spring/';	
	var mapsdir = homedir + '/.spring/maps/';
	var modsdir = homedir + '/.spring/games/';	
	var chatlogsdir = homedir + '/.spring/chatlogs/';
	var infologfile = homedir + '/.spring/infolog.log';
	var scriptfile = homedir + '/.spring/e-script.txt';
	var replaysdir = homedir + '/.spring/demos/';
	var enginepath = homedir + '/.spring/engine/103/spring';
	var enginedir = homedir + '/.spring/engine/103/';
	var engineverdir = enginedir;
	
	if ( fs.existsSync(enginepath) ){
		enginefound = 1;
	}
	
	if (arch == 'x64' || arch == 'arm64'){
		var zipfile = 'spring_103.0_minimal-portable-linux64-static.7z'
		var engineurl = 'https://www.springfightclub.com/data/master_103/linux64/' + zipfile;
	}else{
		var zipfile = 'spring_103.0_minimal-portable-linux32-static.7z'
		var engineurl = 'https://www.springfightclub.com/data/master_103/linux32/' + zipfile;
	}
	
}else{
	$('#enginestatus').addClass('active').text('Your OS is not supported');
}

// add it to preferences tab
$('#enginepath').val(enginepath);
$('#springdir').val(springdir);

// additional checks for win
if (platform == 'win32'){	
	var mygamesdir = homedir + '\\Documents\\My Games\\';
	if (!fs.existsSync(mygamesdir)){
	    fs.mkdirSync(mygamesdir);
	}
}

if (!fs.existsSync(springdir)){
    fs.mkdirSync(springdir);
}

if (!fs.existsSync(mapsdir)){
    fs.mkdirSync(mapsdir);
}

if (!fs.existsSync(modsdir)){
    fs.mkdirSync(modsdir);
}

if (!fs.existsSync(replaysdir)){
    fs.mkdirSync(replaysdir);
}

if (!fs.existsSync(chatlogsdir)){
    fs.mkdirSync(chatlogsdir);
}

// additional checks for win
if (platform == 'win32'){
	
	if (!fs.existsSync(enginedir)){
		//console.log('Creating engine folder');
		fs.mkdirSync(enginedir);
	}
	
	if (!fs.existsSync(engineverdir)){
		//console.log('Creating engine version folder');
		fs.mkdirSync(engineverdir);
	}
}
  
		 
if (!enginefound) {
	prepareenginedownload(engineurl);
} else {
	$('#enginestatus').addClass('active').text('Engine: ok');
}


function prepareenginedownload(engineurl){
	
	$.ajax({ 
        url: engineurl, 
        type: 'HEAD', 
        error: function()  
        { 
            console.log('Engine not found!');                                
        }, 
        success: function()  
        {                 
            downloadengine(engineurl);
        } 
    });
    
}


function downloadengine(fileurl){
    
    ipcRenderer.send("download", {
	    url: fileurl,
	    properties: {directory: enginedir}
	});			
	
	ipcRenderer.on("download progress", async (event, progress) => {		
		var w = Math.round( progress.percent*100 ) + '%';
		console.log('Downloading engine: ' + w + ' of 100%');
		$('#start .engine-download').addClass('downloading');
		$('#start .engine-download .download-title').text('Downloading engine: ' + w + ' of 100%');
		$('#start .engine-download .progress').css('width', w);											
	});
	
	ipcRenderer.on("download complete", (event, progress) => {
		
		console.log('Engine download: completed!');		
		$('#start .engine-download .download-title').text('Extracting files...');
		// unpack
		sevenmin.unpack(enginedir + zipfile, engineverdir, err => {
			
			$('#enginestatus').addClass('active').text('Engine: ok');
			$('#start .engine-download .download-title').text('All ready!');
			setTimeout( function(){
				$('#start .engine-download').removeClass('downloading');
			}, 3000);
			
			console.log(enginepath);
		});
		
	});
	
}



// preferences
// load preferences
$(document).ready(function() {
	
	var autoconnect = store.get('prefs.autoconnect');
	if(autoconnect == 0){
		$('.autoconnect').prop("checked", false);
	}else{
		$('.autoconnect').prop("checked", true);
	}
	
	var rudechat = store.get('prefs.rudechat');
	if(rudechat == 0){
		$('.rudechat').prop("checked", false);
	}else{
		$('.rudechat').prop("checked", true);
	}
	
	var savechats = store.get('prefs.savechats');
	if(savechats == 0){
		$('.savechats').prop("checked", false);
	}else{
		$('.savechats').prop("checked", true);
	}
		
});



// save preferences
$('body').on('click', '.autoconnect', function(e) {
	
	if ($('.autoconnect').prop("checked") == true){
		store.set('prefs.autoconnect', 1);		
	}else{
		store.set('prefs.autoconnect', 0);
	}		
	
});

$('body').on('click', '.rudechat', function(e) {
	
	if ($('.rudechat').prop("checked") == true){
		store.set('prefs.rudechat', 1);		
	}else{
		store.set('prefs.rudechat', 0);
	}		
	
});

$('body').on('click', '.savechats', function(e) {
	
	if ($('.savechats').prop("checked") == true){
		store.set('prefs.savechats', 1);		
	}else{
		store.set('prefs.savechats', 0);
	}		
	
});


// generate uuid 
var uuid = require('uuid-random');
var useruuid = store.get('user.uuid');	

if (!useruuid){
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


