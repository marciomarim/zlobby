const net = require('net');	
const crypto = require("crypto");

const Store = require('electron-store'); 
const store = new Store();

import Protocol from './protocol.js';
let protocol = new Protocol();

export var socketClient;
var connectInterval;

var appVersion = require('electron').remote.app.getVersion();

import {trackEvent} from './init.js';

function socket_connect(){
	
	socketClient = net.connect({host:'springfightclub.com', port:8200},  () => {
	//socketClient = net.connect({host:'springrts.com', port:8200},  () => {
		
		// 'connect' listener
		console.log('Connected to server!');
		
		$('body').addClass('socketlive');
		
		//socketClient.setKeepAlive(true, 10000 );
		
		//socketClient.write('STLS \n');
		//socketClient.write('LISTCOMPFLAGS \n');																	
		
	});				
	
}

function socket_disconnect(){
	
	socketClient.write('EXIT \n');																	
	socketClient.destroy();	
	
}



	
export function login(){					
	
	var username = $('#username').val();
	var password = $('#password').val();
	
	if (username && password){
		
		store.set('user.username', username);
		store.set('user.password', password );								
		
	}else{
		return false;
	}
	
	const passwordHash = crypto
		.createHash("md5")
		.update(password)
		.digest("base64");
		
	var loginString = 'LOGIN ' + username + ' ' + passwordHash + ' 0 * Elobby '+appVersion+' \n';	
	socketClient.write(loginString);
	
	// save my username
	$('#myusername').text(username);		
	
	trackEvent('User', 'login', 'username', username);
		
	var socketInterval = setInterval(function(){
		socketClient.write('PING\n');
		trackEvent('Lobby', 'ping');	
	}, 20000);
	
	
	socketClient.on('data', (data) => {
		
		//console.log( socketClient.bytesRead );
		//console.log( data.toString().length );
		protocol.server( data.toString() );		
		console.log(data.toString() );
		
		clearInterval(connectInterval);
	
	});
	
	
	socketClient.on('end', (data) => {
		
		console.log( 'Socket End: Disconnected from server' );
		console.log( data.toString() );		
		resetUI();
		//socket_connect();
		
	});
	
	
	socketClient.on('error', (data) => {
		
		console.log( 'Socket Error' );
		var err = data.toString();
		console.log( err );		
		//socketClient.destroy();		
		if (err == 'Error [ERR_STREAM_DESTROYED]: Cannot call write after a stream was destroyed' || err == 'Error: read ECONNRESET'){
			resetUI();
		}
		
	});

}	

function create_account(){
	
	var username = $('#createusername').val();
	var password = $('#createpassword').val();
	
	const passwordHash = crypto
		.createHash("md5")
		.update(password)
		.digest("base64");
		
	var loginString = 'REGISTER ' + username + ' ' + passwordHash + '\n';	
	console.log(loginString);
	socketClient.write(loginString);
	$('#loginpane').addClass('active');	
	
}

function resetUI(){
	
	
	$('#battleroom, #battle-list, #chat-list, #channel-list').empty();
	$('body').removeClass();
	$('.lmenu .tab, .container, #battleroom .status, #chats').removeClass('active');
	$('#start, .lmenu .tab.start').addClass('active');
	$('.tab.battlelist .count').text('');	
	$('.account #loginpane').addClass('active');
	$('.account .btn').removeClass('active');
	$('.account #disconnectpane').removeClass('active');
	
}

$('body').on('click', '.login', function(e) {					
			
	socket_connect();
	
	login();

});

$('body').on('click', '.createaccount', function(e) {		
	
	socket_connect();
	
	create_account();

});


$('body').on('keypress','#password', function (e) {
	
	if (e.which == 13) {
		login();
	}
	
});

$('body').on('keypress','#createpassword', function (e) {
	
	if (e.which == 13) {
		create_account();
	}
	
});


$('body').on('click', '.disconnect', function(e) {		
	
	socket_disconnect();	
	resetUI();

});


$(document).ready(function() {
	
	var username = store.get('user.username');
	var password = store.get('user.password');
	
	$('#username').val(username);
	$('#password').val(password);
	$('#password').focus();
	
});


$(document).on('offline online', function (event) {
    $('body').addClass(event.type);
});

