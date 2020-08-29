const os = require('os');

var fs = require('fs');

const seven = require('node-7z');

const Store = require('electron-store'); 
const store = new Store();

const homedir = os.homedir();

const {ipcRenderer} = require("electron");

var appVersion = require('electron').remote.app.getVersion();

const ua = require('universal-analytics');


// set default paths	
if (os.platform() == 'linux' || os.platform() == 'darwin'){
	
	var springdir = homedir + '/.spring/';	
	var mapsdir = homedir + '/.spring/maps/';
	var modsdir = homedir + '/.spring/games/';
	var replaysdir = homedir + '/.spring/demos/';
	var chatlogsdir = homedir + '/.spring/chatlogs/';
	var infologfile = homedir + '/.spring/infolog.log';
	var scriptfile = homedir + '/.spring/e-script.txt';
	//var enginedir = '/Applications/';
	//var enginedir = '/Users/marcio/Downloads/';

	if (os.platform() == 'darwin'){
		var enginepath = '/Applications/Spring_104.0.app/Contents/MacOS/spring';	
		var enginedir = '/Applications/';
	}else{
		var enginepath = "/var/etc/spring";
		var enginedir = '/var/etc/';
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
	
	
	
}else if(os.platform() == 'win32'){
	
	var mygamesdir = homedir + '\\Documents\\My Games\\';
	if (!fs.existsSync(mygamesdir)){
	    fs.mkdirSync(mygamesdir);
	}
	
	var springdir = homedir + '\\Documents\\My Games\\Spring\\';
	var mapsdir = homedir + '\\Documents\\My Games\\Spring\\maps\\';
	var modsdir = homedir + '\\Documents\\My Games\\Spring\\games\\';
	var replaysdir = homedir + '\\Documents\\My Games\\Spring\\demos\\';
	var chatlogsdir = homedir + '\\Documents\\My Games\\Spring\\chatlogs\\';
	var infologfile = homedir + '\\Documents\\My Games\\Spring\\infolog.log';
	var scriptfile = homedir + '\\Documents\\My Games\\Spring\\e-script.txt';
	var enginedir = homedir + '\\Documents\\My Games\\Spring\\engine\\';
	var enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103.0\\spring.exe';
	
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
		console.log('Creating chatlog folder');
	    fs.mkdirSync(chatlogsdir);
	}
	
	if (!fs.existsSync(enginedir)){
		console.log('Creating engine folder');
		fs.mkdirSync(enginedir);
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
}


if (!fs.existsSync(enginepath)) {
	
	if(os.platform() == 'win32'){
		var engineurl = 'https://springrts.com/dl/buildbot/default/master/103.0/win64/spring_103.0_win64_portable.7z';	
	}else if (os.platform() == 'linux'){
		var engineurl = 'https://springrts.com/dl/buildbot/default/master/103.0/linux64/spring_103.0_minimal-portable-linux64-static.7z';
	}else if (os.platform() == 'darwin'){
		var engineurl = 'https://springrts.com/dl/buildbot/default/master/103.0/win64/spring_103.0_win64_portable.7z';
	}
			
    console.log('Download spring');
    
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
		$('#start .engine-download .download-title').text('Downloading map: ' + w + ' of 100%');
		$('#start .engine-download .progress').css('width', w);											
	});
	
	ipcRenderer.on("download complete", (event, progress) => {
		console.log('Engine download: completed!');
		$('#start .engine-download .download-title').text('Extracting files...');
		
		console.log(enginedir);

		const myStream = seven.extractFull(enginedir + 'spring_103.0_win64_portable.7z', enginedir, { 
			$progress: true,			
		})
		
		myStream.on('end', function (err) {
			
			$('#start .engine-download .download-title').text('All ready!');
			
			setTimeout( function(){
				$('#start .engine-download').removeClass('downloading');
			}, 3000);
			
		})
	});
	
}

var remotemodsurl = 'https://springfightclub.com/data/';
//var remotemapsdir = 'https://springfightclub.com/data/maps/';
var remotemapsurl = 'http://files.balancedannihilation.com/data/maps/';

export {springdir, mapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl}


$(window).on( 'load', function(){
	
	console.log('Elobby v' + appVersion);	
	$('#appVersion').text('ELobby v'+appVersion);			

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


