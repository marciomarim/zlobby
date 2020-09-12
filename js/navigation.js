const shell = require('electron').shell;

import Utils from './utils.js';
let utils = new Utils();

$('.lmenu').on('click', '.tab', function(e) {
	
	var tab = $(this).data('target');	
	var id = '#' + $(this).data('target');
	
	if (tab == 'chatlist'){
		$('#chats').addClass('active');	
		var useractive = $('.userchat.active').data('username');
		if( $('.userpm-select[data-username="'+jQuery.escapeSelector(useractive)+'"] .unread').length )
			$('.userpm-select[data-username="'+jQuery.escapeSelector(useractive)+'"] .unread').remove();
		utils.update_global_unread_count();
	}

	if (tab == 'channellist'){
		$('#channels').addClass('active');	
		var channelactive = $('.channelchat.active').data('channame');
	}
	
	if ( tab == 'battleroom' && !$('body').hasClass('inbattleroom') ){
		return false;
	}
			
	$('.tab, .rcontainer, .container.active').removeClass('active');
	
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

$(window).focus(function() {
    $('body').addClass('focus');
});

$(window).blur(function() {
    $('body').removeClass('focus');
});


