const net = require('net');
const crypto = require('crypto');
const log = require('electron-log');
const Store = require('electron-store');
const store = new Store();

const getmac = require('getmac');
var macaddress = getmac.default();
//console.warn( macaddress );
var CRC32 = require('crc-32');   

import Protocol from './protocol.js';
let protocol = new Protocol();

var win = require('electron').remote.getCurrentWindow();

var Filter = require('bad-words'),
	filter = new Filter();

filter.addWords('FAGGOTS', 'DICKS', 'dickhead', 'pussy');

export var socketClient;
//var connectInterval;
var socketInterval;

var app = require('electron').remote.app;
var appVersion = app.getVersion();

var error_count = 0;

import { trackEvent } from './init.js';

function socket_connect() {
	
	//var hostselected = $('.serverhosturl.active').data('url');
	var hostselected = store.get('prefs.hostselected');

	socketClient = net.connect({ host: hostselected, port: 8200 }, () => {
		// 'connect' listener
		console.log('Connected to server!');

		$('body').addClass('socketlive');

		//socketClient.setKeepAlive(true, 10000 );
		//socketClient.write('STLS \n');
		//socketClient.write('LISTCOMPFLAGS \n');
	});
}

function socket_disconnect() {
	socketClient.write('EXIT \n');
	socketClient.destroy();
}

export function login() {
	var username = $('#username').val();
	var password = $('#password').val();

	if (username && password) {
		store.set('user.username', username);
		store.set('user.password', password);
	} else {
		return false;
	}

	const passwordHash = crypto
		.createHash('md5')
		.update(password)
		.digest('base64');
		
	
	var userID = CRC32.str(macaddress);
	
	var loginString = 'LOGIN ' + username + ' ' + passwordHash + ' 0 * Zlobby ' + appVersion + '	'+userID+'	l \n';
	socketClient.write(loginString);

	// save my username
	$('#myusername').text(username);

	//trackEvent('User', 'login', 'username', username);

	socketInterval = setInterval(function() {
		socketClient.write('PING\n');
		trackEvent('Lobby', appVersion);
		trackEvent(username, appVersion);
	}, 15000);

	socketClient.on('data', data => {
		//console.log( socketClient.bytesRead );
		//console.log( data.toString().length );
		protocol.server(data.toString());
		log.info(data.toString());
		if (!data.toString().startsWith('PONG')) {
			console.log(data.toString());
		}
		//clearInterval(connectInterval);
	});

	socketClient.on('end', data => {
		console.log('Socket End: Disconnected from server');
		console.log(data.toString());
		log.info('Socket End: Disconnected from server');
		log.info(data.toString());		
		win.reload();		
	});

	socketClient.on('error', data => {
		
		var err = data.toString();		
		log.warn('Socket Error');
		log.warn(err);
		win.reload();
				
		// if (err == 'Error [ERR_STREAM_DESTROYED]: Cannot call write after a stream was destroyed' || err.indexOf('Error: getaddrinfo ENOTFOUND') !== -1) {			
		// 	win.reload();			
		// }
	});
}

function create_account() {
	var username = $('#createusername').val();
	var password = $('#createpassword').val();
	var email = $('#createemail').val();

	const passwordHash = crypto
		.createHash('md5')
		.update(password)
		.digest('base64');

	var loginString = 'REGISTER ' + username + ' ' + passwordHash + ' ' + email + '\n';
	console.log(loginString);
	socketClient.write(loginString);

	$('#username').val(username);
	$('#password').val(password);
	$('#password').focus();
	$('#createpane').removeClass('active');
	$('#loginpane').addClass('active');

	// agreement sent after 1500ms, then try to autoconnect
	setTimeout(login(), 2500);
}

function resetUI() {
	$('#battleroom, #battle-list, #chat-list, #channel-list').empty();
	$('body').removeClass('socketlive inbattleroom picking ingame');
	$('.lmenu .tab, .container, #battleroom .status, #chats').removeClass('active');
	$('#start, .lmenu .tab.start').addClass('active');
	$('.tab.battlelist .count').text('');
	$('#loginpane').addClass('active');
	$('.account .btn').removeClass('active');
	$('#disconnectpane').removeClass('active');
}

$('body').on('click', '.login', function(e) {
	socket_connect();
	login();
});

$('body').on('click', '.createaccount', function(e) {
	socket_connect();

	setTimeout(function() {
		create_account();
	}, 500);
});

$('body').on('click', '.confirmagreement', function(e) {
	var code = $('#agreementcode').val();
	if ( code && code != '' ){
		var command = 'CONFIRMAGREEMENT ' + code +'\n';	
	}else{
		var command = 'CONFIRMAGREEMENT\n';	
	}	
	socketClient.write(command);
});

$('body').on('keypress', '#password', function(e) {
	if (e.which == 13) {
		login();
	}
});

$('body').on('keypress', '#createpassword', function(e) {
	if (e.which == 13) {
		create_account();
	}
});

$('body').on('click', '.disconnect', function(e) {
	clearInterval(socketInterval);
	socket_disconnect();
	resetUI();
});

$(document).ready(function() {
	var username = store.get('user.username');
	var password = store.get('user.password');

	$('#username').val(username);
	$('#password').val(password);
	$('#password').focus();

	var autoconnect = store.get('prefs.autoconnect');
	var hostselected = store.get('prefs.hostselected');
	
	if (autoconnect && username && password && hostselected) {
		socket_connect();
		login();
	} else {
		$('#loginpane').addClass('active');
	}
});

$(document).on('offline online', function(event) {
	$('body').addClass(event.type);
});
