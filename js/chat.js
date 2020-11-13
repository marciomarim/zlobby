import { socketClient } from './socket.js';

var Filter = require('bad-words'),
	filter = new Filter(),
	fs = require('fs');

import Utils from './utils.js';
let utils = new Utils();

import User from './user.js';

$('body').on('keypress', '.chat', function(e) {
	if (e.which == 13) {
		socketClient.write($(this).val() + '\n');
		$(this).val('');
		return false; //<---- Add this line
	}
});

$('#chat-list').on('click', 'li', function(e) {
	var username = $(this).data('username');
	if (!$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
		utils.init_chat(username);
	}
	$('.userchat, .userpm-select').removeClass('active');
	$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('active');
});

$('body').on('click', '.userchat .closewin', function(e) {
	$(this)
		.closest('.userchat')
		.removeClass('active');
	var username = $(this).data('username');
});

$('body').on('click', '.userchat .clearchat', function(e) {
	var username = $(this).data('username');
	utils.clear_user_chat(username);
});

$('body').on('click', '.userchat .deletechat', function(e) {
	var username = $(this).data('username');
	$(this)
		.closest('.userchat')
		.remove();
	$('.userpm-select[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
	utils.clear_user_chat(username);
});

$('body').on('click', '.userchat.active', function(e) {
	// on click on chat, clear unread message counter
	var username = $(this).data('username');
	$('.userpm-select[data-username="' + jQuery.escapeSelector(username) + '"] .unread').remove();
	utils.update_global_unread_count();
});

//deal with unsent messages
$('body').on('click', '.messages .offline', function(e) {
	var username = $('.userchat.active').data('username');
	var html = $(this).html();

	// if offline
	if (!$('#chat-list li[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
		utils.delete_unsent_message(username, html);
		$(this).remove();
		return false;

		// var notification = new Notification('Cant send yet', {
		// 	body: 'User still offline',
		// });
		// return false;
	} else {
		var message = $(this)
			.children('.message')
			.text();

		utils.send_unsent_message(username, html);

		var command = 'SAYPRIVATE ' + username + ' ' + message + '\n';
		socketClient.write(command);
		utils.add_message_to_chat(username, message, true);

		$(this).remove();
	}
});

function checkunsentmessages() {
	$('.userpm-select.online').each(function() {
		var username = $(this).data('username');
		$('.userchat[data-username=' + jQuery.escapeSelector(username) + '] .messages .offline').each(function() {
			var html = $(this).html();
			var message = $(this)
				.children('.message')
				.text();

			if (message != '') {
				utils.send_unsent_message(username, html);

				var command = 'SAYPRIVATE ' + username + ' ' + message + '\n';
				socketClient.write(command);
				utils.add_message_to_chat(username, message, true);

				$(this).remove();
			} else {
				utils.delete_unsent_message(username, html);
			}
		});
	});
}

$('#activechats').on('click', '.userpm-select', function(e) {
	var username = $(this).data('username');

	$('.userchat, .userpm-select').removeClass('active');
	$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('active');
	$(this).addClass('active');

	if (!$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
		utils.init_chat(username);
	}

	// if unread, remove unread count
	$('.userpm-select[data-username="' + jQuery.escapeSelector(username) + '"] .unread').remove();
	utils.update_global_unread_count();

	$('#chats .text-scroll').scrollTop($('.userchat[data-username="' + jQuery.escapeSelector(username) + '"] .messages')[0].scrollHeight);
});

$('.userchat_input').focus(function() {
	$(this)
		.closest('.text-scroll')
		.scrollTop($(this).closest('.messages')[0].scrollHeight);
});

//user chat
$('body').on('keypress', '.userchat_input', function(e) {
	if (e.which == 13) {
		var username = $(this).data('username');
		var message = $(this).val();

		if (message == '') return false;

		message = utils.urlify(message);
		//message = filter.clean(message);

		var command = 'SAYPRIVATE ' + username + ' ' + message + '\n';
		socketClient.write(command);

		utils.add_message_to_chat(username, message, true);

		$(this).val('');
		return false; //<---- Add this line
	}
});

$('#channel-list').on('click', 'li', function(e) {
	var chanName = $(this).data('channame');

	var command = 'JOIN ' + chanName + ' \n';
	socketClient.write(command);

	if (!$('.channelchat[data-channame="' + chanName + '"]').length) {
		utils.init_channel(chanName);
	}

	$('.channelchat').removeClass('active');
	$('.channelchat[data-channame="' + chanName + '"]').addClass('active');
});

$('body').on('click', '.channelchat .closewin', function(e) {
	var chanName = $(this).data('channame');
	$(this)
		.closest('.channelchat')
		.removeClass('active');

	var command = 'LEAVE ' + chanName + ' \n';
	socketClient.write(command);
});

$('body').on('click', '.channelchat .clearchannel', function(e) {
	var chanName = $(this).data('channame');
	utils.clear_channel_chat(chanName);
	//$(this).closest('.channelchat').remove();
	//$('.userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').remove();
});

$('body').on('click', '.channelchat.active', function(e) {
	// on click on chat, clear unread message counter
	var chanName = $(this).data('channame');
	//$('.userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').remove();
	//utils.update_global_unread_count();
});

//user chat
$('body').on('keypress', '.channelchat_input', function(e) {
	if (e.which == 13) {
		var chanName = $(this).data('channame');
		var message = $(this).val();

		if (message == '') return false;

		message = utils.urlify(message);
		//message = filter.clean(message);

		var command = 'SAY ' + chanName + ' ' + message + '\n';
		socketClient.write(command);

		//utils.add_message_to_channel(chanName, '', message, true);

		$(this).val('');
		return false; //<---- Add this line
	}
});

$(window).ready(function() {
	var checkUnsent = setInterval(checkunsentmessages, 2000);
});
