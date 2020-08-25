const net = require('net');	
const crypto = require("crypto");

const Store = require('electron-store'); 
const store = new Store();

import Protocol from './protocol.js';
let protocol = new Protocol();

export var socketClient;
var connectInterval;

function socket_connect(){
	
	socketClient = net.connect({host:'springfightclub.com', port:8200},  () => {
	//socketClient = net.connect({host:'springrts.com', port:8200},  () => {
		
		// 'connect' listener
		console.log('Connected to server!');
		
		$('body').addClass('socketlive');
		
		socketClient.setKeepAlive(true, 10000 );
		
		//socketClient.write('STLS \n');
		socketClient.write('LISTCOMPFLAGS \n');																	
		
	});				
	
}



	
function login(){
	
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
		
	if (username && password){
		
		store.set('user.username', username);
		store.set('user.password', password);
		
		$('.container.active').removeClass('active');		
		$('.tab').removeClass('active');
		
		$('.tab.battlelist').addClass('active');
		$('#battlelist').addClass('active');
		
	}else{
		return false;
	}
	
		
	socket_connect();		
	
	const passwordHash = crypto
		.createHash("md5")
		.update(password)
		.digest("base64");
		
	var loginString = 'LOGIN ' + username + ' ' + passwordHash + ' 0 * Elobby 1.0 \n';	
	socketClient.write(loginString);
	
	// save my username
	$('#myusername').text(username);
		
	var socketInterval = setInterval(function(){
		socketClient.write('PING\n');	
	}, 10000);
	
	
	socketClient.on('data', (data) => {
		
		clearInterval(connectInterval);
		protocol.server( data.toString() );
		console.log(data.toString() );
	
	});
	
	
	
	socketClient.on('end', (data) => {
		
		console.log( 'Socket End: Disconnected from server' );
		console.log( data.toString() );		
		resetUI();
		//socket_connect();
		
	});
	
	
	
	socketClient.on('destroy', (data) => {
		
		console.log( 'Socket Destroyed' );
		console.log( data.toString() );	
		resetUI();	
		//socket_connect();		
		
	});
	
	
	
	socketClient.on('error', (data) => {
		
		console.log( 'Socket Error' );
		console.log( data.toString() );		
		socketClient.destroy();
		
		resetUI();
		
/*
		// start trying connect 
		connectInterval = setInterval(function(){
			login();
		}, 10000);
*/
		
		
	});
	
	
	
	socketClient.on( "timeout", () => {
		
	    console.log('Socket Timeout');		
		socket_connect();
		
	});

}	

function resetUI(){
	
	$('#battleroom, #battle-list, #chat-list').empty();
	$('body').removeClass();
	$('.lmenu .tab, .container, #battleroom .status, #chats').removeClass('active');
	$('#start').addClass('active');
	
}

$('body').on('click', '.login', function(e) {
	
	login();

});


$('body').on('keypress','#password', function (e) {
	
	if (e.which == 13) {
		login();
	}
	
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

