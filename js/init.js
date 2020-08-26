const os = require('os');

var fs = require('fs');

const Store = require('electron-store'); 
const store = new Store();

const homedir = os.homedir();

const shell = require('electron').shell;

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
	
	if (os.platform() == 'darwin'){
		var enginepath = "/Applications/Spring_103.0.app/Contents/MacOS/spring";	
	}else{
		var enginepath = "/var/etc/spring";
	}
	
}else if(os.platform() == 'win32'){
	
	var springdir = homedir + '\\Documents\\My Games\\Spring\\';
	var mapsdir = homedir + '\\Documents\\My Games\\Spring\\maps\\';
	var modsdir = homedir + '\\Documents\\My Games\\Spring\\games\\';
	var replaysdir = homedir + '\\Documents\\My Games\\Spring\\demos\\';
	var chatlogsdir = homedir + '\\Documents\\My Games\\Spring\\chatlogs\\';
	var infologfile = homedir + '\\Documents\\My Games\\Spring\\infolog.log';
	var scriptfile = homedir + '\\Documents\\My Games\\Spring\\e-script.txt';
	var enginepath = homedir + '\\Documents\\My Games\\Spring\\engine\\103.0\\spring.exe';
}


if (!fs.existsSync(chatlogsdir)){
    fs.mkdirSync(chatlogsdir);
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


$('.lmenu').on('click', '.tab', function(e) {
	
	var tab = $(this).data('target');	
	var id = '#' + $(this).data('target');
	
	$('.tab').removeClass('active');
	$('.rcontainer').removeClass('active');
	
	if (tab == 'chatlist'){
		$('#chats').addClass('active');	
	}
	
	if ( tab == 'battleroom' && !$('body').hasClass('inbattleroom') ){
		return false;
	}
	
	$('.container.active').removeClass('active');
	$(id).addClass('active');
	$(this).addClass('active');
	
});




$('body').on('click', 'a', (event) => {
	
	event.preventDefault();
	let link = event.target.href;
	shell.openExternal(link);
	
});



$('body').on('click', '.account .btn', function(e) {
	var target = '#' + $(this).data('target');
	$('.account .pane.active, .account .btn').removeClass('active');
	$(target).addClass('active');
	$(this).addClass('active');
		
});