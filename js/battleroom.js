import {socketClient} from './socket.js'

import Utils from './utils.js';
let utils = new Utils();

import User from './user.js';
let users = new User();

import Battle from './battle.js';
let battles = new Battle();

var Filter = require('bad-words'),
    filter = new Filter();

const Store = require('electron-store'); 
const store = new Store();

$('body').on('click', '.battle-card', function(e) {
	
	var username = $('#myusername').text();
	
	//if I'm in, just go to battleroom
	if ($(this).hasClass('activebattle')){
		
		$('.container').removeClass('active');
		$('#battleroom').addClass('active');
	
	// need to leave another battle	
	}else if( $('.activebattle').length ){
		
		var command = 'LEAVEBATTLE \n';	
		socketClient.write( command );
				
		var battleid = $(this).data('battleid');	
		
		var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';	
		console.log(command);
		socketClient.write( command );
		
	// try to join	
	}else{	

		var battleid = $(this).data('battleid');				
		var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';			
		
		console.log(command);
		socketClient.write( command );		
		
	}							
	
});



$('body').on('click', '.leavebattle', function(e) {
	
	var command = 'LEAVEBATTLE \n';	
	socketClient.write( command );
	
});



$('body').on('click', '.specbattle', function(e) {
	
	if ($('.readybattle').prop("checked") == true){
		$('.readybattle').prop("checked", false); 
	}
	$(this).prop("checked");
	utils.sendbattlestatus();
	
});


$('body').on('click', '.readybattle', function(e) {
	
	if ($('.specbattle').prop("checked") == true){
		$('.specbattle').prop("checked", false); 
	}
	$(this).prop("checked");
	utils.sendbattlestatus();		
	
});


$('body').on('click', '.showhostmessages', function(e) {
	
	if ($('.showhostmessages').prop("checked") == true){
		//$('.showhostmessages').prop("checked", false);
		$('.ishost').removeClass('hidemessage');
		store.set('user.showhostmessages', 1);
	}else{
		$('.ishost').addClass('hidemessage');
		store.set('user.showhostmessages', 0);
	}		
	//$(this).prop("checked");		
	
});




$('body').on('click', '.vote.yes', function(e) {
	var command = 'SAYBATTLE !vote y\n';	
	socketClient.write( command );	
});

$('body').on('click', '.vote.no', function(e) {
	var command = 'SAYBATTLE !vote n\n';	
	socketClient.write( command );	
});



$('body').on('click', '.smallnav .navbtn', function(e) {
	
	$('.smallnav .navbtn, .smalltab').removeClass('active');
	$(this).addClass('active');
	
	var target = '#'+$(this).data('target');
	$(target).addClass('active')

});



$('body').on('click', '.pickarm', function(e) {
	$('.pickcore').removeClass('active');
	$(this).addClass('active');
	utils.sendbattlestatus();

	//save prefered faction	
	store.set('user.faction', 1);
});	


$('body').on('click', '.pickcore', function(e) {	
	$('.pickarm').removeClass('active');
	$(this).addClass('active');
	utils.sendbattlestatus();

	//save prefered faction
	store.set('user.faction', 0);
});


$("body").on('click', '.colorpicked', function(e) {
    
    $('.colorpicker').toggleClass('active');
    utils.sendbattlestatus();
    
});



$('body').on('click', '.startbattle', function(e) {
	
	var founder = $('#battleroom .founder').text();
	
	if( $('.battle-players li[data-username="'+founder+'"] .icon-user').hasClass('ingame') ){
						
		if ($('.specbattle').prop("checked") == true){
			battles.launchgame();		
		}else{
			battles.launchgame();			
		}
		
		$('body').addClass('ingame');
		utils.sendstatus();
			
	}else{		
		var command = 'SAYBATTLE !start\n';
    	socketClient.write( command );
	}	
	
});



// battleroom chat
$('body').on('keypress', '.battleroom_input', function (e) {
			
	if (e.which == 13) {
		
		var message = $(this).val();
		
		if(message == '/clear'){
			utils.clear_battleroom_chat();	
		}else{
			message = filter.clean(message);
	    	var command = 'SAYBATTLE ' + message + '\n';
	    	//console.log(command);
	    	socketClient.write( command );	
		}		    	    	    	
    	$(this).val('');
		return false;    //<---- Add this line		
	}
});



// userwin in battleroom, chat and commands
$('body').on('click', '.battle-players li', function(e) {
				
	var username = $(this).data('username');
	
	// create popoup	
	var $userwin = $('<div class="userwin active" data-username="'+username+'"><div class="title">'+username+'</div></div>');
	var commands = '<div class="usercommands"><div class="usercommand" data-username="'+username+'" data-command="!ring">!ring</div>';
		commands +=	'<div class="usercommand" data-username="'+username+'" data-command="!spec">!spec</div></div>';
	$userwin.append(commands);
	$userwin.append('<div class="floatinginput"><input type="text" class="pminput" data-username="'+username+'" placeholder="Message @'+username+'"></div>');
	$(this).append($userwin);
	$('.pminput').focus();
	
});

$('body').on('keypress', '.pminput', function (e) {
			
	if (e.which == 13) {
		
		var message = $(this).val();
		var username = $(this).data('username');
		message = filter.clean(message);
		
		if (!$('.userchat[data-username="'+jQuery.escapeSelector(username)+'"]').length){
			utils.init_chat( username );
		}
		
    	var command = 'SAYPRIVATE ' + username + ' ' + message + '\n';
    	socketClient.write( command );    	    	    	
    	$(this).val('');
		
    	utils.add_message_to_chat(username, message, true);
		return false;    //<---- Add this line		
	}
});

$('body').on('click', '.usercommand', function (e) {
	var username = $(this).data('username');		
	var command = $(this).data('command');		
	socketClient.write( 'SAYBATTLE ' + command + ' ' + username + '\n');
});


$(document).mouseup(function(e) 
{
    var container = $(".userwin.active");
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.remove();
    }
});


