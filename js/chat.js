import {socketClient} from './socket.js'

var Filter = require('bad-words'),
    filter = new Filter(),
	fs = require('fs');

import Utils from './utils.js';
let utils = new Utils();

import User from './user.js';

$('body').on('keypress','.chat', function (e) {
	
	if (e.which == 13) {	
    	socketClient.write( $(this).val() +'\n');
    	$(this).val('');
		return false;    //<---- Add this line		
	}
});


$('#chat-list').on('click', 'li', function(e) {
	
	var username = $(this).data('username');
	if (!$('.userchat[data-username="'+username+'"]').length){
		utils.init_chat( username );
	}
	$('.userchat, .userpm-select').removeClass('active');		
	$('.userchat[data-username="'+username+'"]').addClass('active');							
	
});

$('body').on('click', '.userchat .closewin', function(e) {
	
	$(this).closest('.userchat').removeClass('active');	
	var username = $(this).data('username');	
	$('#activechats li[data-username="'+username+'"]').remove();
	
});

$('body').on('click', '.userchat .clearchat', function(e) {
	
	var username = $(this).data('username');			
	utils.clear_user_chat(username);
	$(this).closest('.userchat').remove();
	$('.userpm-select[data-username="'+username+'"]').remove();
	
});


$('#activechats').on('click', '.userpm-select', function(e) {

	var username = $(this).data('username');
				
	$('.userchat, .userpm-select').removeClass('active');		
	$('.userchat[data-username="'+username+'"]').addClass('active');
	$(this).addClass('active');
	
	if (!$('.userchat[data-username="'+username+'"]').length){
		utils.init_chat( username );
	}
	
	$('#chats .text-scroll').scrollTop($('.userchat[data-username="'+username+'"] .messages')[0].scrollHeight);    	    	
	
});


//user chat
$('body').on('keypress','.userchat_input', function (e) {
			
	if (e.which == 13) {
		
		var username = $(this).data('username');
		var message = $(this).val(); 
		
		if (message == '')
			return false;
			
		message = utils.urlify(message);  	
		message = filter.clean(message);

		var command = 'SAYPRIVATE ' + username + ' ' + message + '\n';
    	socketClient.write( command );
    	
    	utils.add_message_to_chat(username, message, true);
    	
    	$(this).val('');
		return false;    //<---- Add this line		
	}
});