import { socketClient } from './socket.js';

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

var app = require('electron').remote.app;

var bmessages = [];
var bmcount = 1;

$('body').on('click', '#battleroom .emojibtn', function(e) {
	if (app.isEmojiPanelSupported()) {
		$('#battleroom .battleroom_input').focus();
		app.showEmojiPanel();
	}
});

$('body').on('click', '.battle-card', function(e) {
	if (!$('body').hasClass('clickbattle')) {
		$('body').addClass('clickbattle');
		setTimeout(function() {
			$('body').removeClass('clickbattle');
		}, 2000);

		var username = $('#myusername').text();

		// hide map picker
		$('.mappicker').removeClass('active');

		//if I'm in, just go to battleroom
		if ($(this).hasClass('activebattle')) {
			$('.container, .tab').removeClass('active');
			$('#battleroom, .tab.battleroom').addClass('active');

			$(id).addClass('active');
			$(this).addClass('active');

			// need to leave another battle
		} else if ($('.activebattle').length) {
			var command = 'LEAVEBATTLE \n';
			socketClient.write(command);

			var battleid = $(this).data('battleid');

			var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';
			console.log(command);
			socketClient.write(command);

			// try to join
		} else {
			var battleid = $(this).data('battleid');
			var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';

			console.log(command);
			socketClient.write(command);
		}
	}
});

$('body').on('click', '.leavebattle', function(e) {
	var command = 'LEAVEBATTLE \n';
	socketClient.write(command);
});

$('body').on('click', '.specbattle', function(e) {
	if ($('#battleroom .specbattle').prop('checked') == true) {
		$('body').removeClass('unspecing');
	} else {
		$('body').addClass('unspecing');
	}
	if ($('#battleroom .readybattle').prop('checked') == true) {
		$('#battleroom .readybattle').prop('checked', false);
	}
	$(this).prop('checked');
	utils.sendbattlestatus();
});

$('body').on('click', '.readybattle', function(e) {
	if ($('#battleroom .specbattle').prop('checked') == true) {
		$('#battleroom .specbattle').prop('checked', false);
	}
	$(this).prop('checked');
	utils.sendbattlestatus();
});

$('body').on('click', '.showhostmessages', function(e) {
	if ($('.showhostmessages').prop('checked') == true) {
		//$('.showhostmessages').prop("checked", false);
		$('.ishost').removeClass('hidemessage');
		store.set('user.showhostmessages', 1);
	} else {
		$('.ishost').addClass('hidemessage');
		store.set('user.showhostmessages', 0);
	}
	//$(this).prop("checked");
});

$('body').on('click', '.autoscrollbattle', function(e) {
	if ($('.autoscrollbattle').prop('checked') == true) {
		store.set('user.autoscrollbattle', 1);
	} else {
		store.set('user.autoscrollbattle', 0);
	}
});

$('body').on('click', '.mutebattleroom', function(e) {
	if ($('.mutebattleroom').prop('checked') == true) {
		store.set('user.mutebattleroom', 1);
		var sound = document.getElementById('messagesound');
		sound.volume = 0;
		var ring = document.getElementById('ringsound');
		ring.volume = 0;
	} else {
		store.set('user.mutebattleroom', 0);
		var sound = document.getElementById('messagesound');
		sound.volume = 1;
		var ring = document.getElementById('ringsound');
		ring.volume = 1;
	}
});

$('body').on('click', '.command', function(e) {
	var command = 'SAYBATTLE ' + $(this).data('command') + '\n';
	socketClient.write(command);
});

$('body').on('click', '.vote.yes', function(e) {
	var command = 'SAYBATTLE !vote y\n';
	socketClient.write(command);
	$('#votewin').removeClass('active');
});

$('body').on('click', '.vote.no', function(e) {
	var command = 'SAYBATTLE !vote n\n';
	socketClient.write(command);
	$('#votewin').removeClass('active');
});

$('body').on('click', '.endvote', function(e) {
	var command = 'SAYBATTLE !ev \n';
	socketClient.write(command);
	$('#votewin').removeClass('active');
});

$('body').on('click', '#battleroom .smallnav .navbtn', function(e) {
	$('#battleroom .smallnav .navbtn, #battleroom .smalltab').removeClass('active');
	$(this).addClass('active');

	var target = '#' + $(this).data('target');
	$(target).addClass('active');
});

$('body').on('click', '.pickarm', function(e) {
	$('#battleroom .pickcore').addClass('active');
	$(this).removeClass('active');
	utils.sendbattlestatus();

	//save prefered faction
	store.set('user.faction', 0);
});

$('body').on('click', '.pickcore', function(e) {
	$('#battleroom .pickarm').addClass('active');
	$(this).removeClass('active');
	utils.sendbattlestatus();

	//save prefered faction
	store.set('user.faction', 1);
});

$('body').on('click', '.colorpicked', function(e) {
	$('.colorpicker').toggleClass('active');
	utils.sendbattlestatus();
});

$('body').on('click', '#pickteam, #pickally', function(e) {
	$('body').addClass('picking');
});

$('body').on('change', '#pickteam', function(e) {
	var teamNo = $(this).val();
	var myusername = $('#myusername').text();
	var current_team = $('.battle-players li[data-username="' + jQuery.escapeSelector(myusername) + '"] .team').text();

	if (teamNo != current_team && teamNo >= 1 && $('body').hasClass('picking')) {
		$('.battle-players li[data-username="' + jQuery.escapeSelector(myusername) + '"] .team').text(teamNo);
		$('body').removeClass('picking');
		utils.sendbattlestatus();
	}
});

$('body').on('change', '#pickally', function(e) {
	var allyNo = $(this).val();
	var myusername = $('#myusername').text();
	var current_ally = $('.battle-players li[data-username="' + jQuery.escapeSelector(myusername) + '"] .ally').text();

	if (allyNo != current_ally && allyNo >= 1 && $('body').hasClass('picking')) {
		$('.battle-players li[data-username="' + jQuery.escapeSelector(myusername) + '"] .ally').text(allyNo);
		$('body').removeClass('picking');
		utils.sendbattlestatus();
	}
});

$('body').on('click', '.startbattle', function(e) {
	var founder = $('#battleroom .founder').text();

	if ($('.battle-players li[data-username="' + jQuery.escapeSelector(founder) + '"] .icon-user').hasClass('ingame')) {
		if ($('.specbattle').prop('checked') == true) {
			battles.launchgame();
		} else {
			battles.launchgame();
		}

		$('body').addClass('ingame');
		utils.sendstatus();
	} else {
		var command = 'SAYBATTLE !start\n';
		socketClient.write(command);
	}
});

// $('body').on('click', '#battleroom .left', function(e) {
// 	$('#chatlist').removeClass('over');
// });

$('body').on('keydown', '.battleroom_input', function(e) {
	var arrow = { left: 37, up: 38, right: 39, down: 40 };

	switch (e.which) {
		case arrow.left:
			//..
			break;
		case arrow.up:
			if (bmessages[bmcount]) {
				$('.battleroom_input').val(bmessages[bmcount]);
				if (bmessages[bmcount - 1]) {
					bmcount -= 1;
				}
			}
			break;
		case arrow.right:
			//..
			break;
		case arrow.down:
			if (bmessages[bmcount]) {
				$('.battleroom_input').val(bmessages[bmcount]);
				if (bmessages[bmcount + 1]) {
					bmcount += 1;
				}
			} else {
				$('.battleroom_input').val();
				bmcount = bmessages.length - 1;
			}
			break;
		case 9:
			e.preventDefault();
			var message = $(this).val();
			autocompleteusers(message);
	}
});

function autocompleteusers(message) {
	var lastword = message.split(' ');
	lastword = lastword[lastword.length - 1];
	if (lastword) {
		$('.battle-players li').each(function(index) {
			var username = $(this).data('username');
			if (username.startsWith(lastword)) {
				message = message.substring(0, message.length - lastword.length) + username;
				$('.battleroom_input').val(message);
			}
		});
	}
}

// battleroom chat
$('body').on('keypress', '.battleroom_input', function(e) {
	if (e.which == 13) {
		var message = $(this).val();

		// save sent messages
		bmessages.push(message);
		bmcount = bmessages.length - 1;

		if (message == '/clear') {
			utils.clear_battleroom_chat();
		} else if (message == '/autoready 1') {
			store.set('user.autoready', 1);
			$('#battleroom .readybattle').prop('checked', true);
			utils.sendbattlestatus();
		} else if (message == '/autoready 0') {
			store.set('user.autoready', 0);
			$('#battleroom .readybattle').prop('checked', false);
			utils.sendbattlestatus();
		} else if (message.startsWith('/me')) {
			var command = 'SAYBATTLEEX ' + message.replace('/me', '') + '\n';
			socketClient.write(command);
		} else {
			if ($('.rudechat').prop('checked') == true) {
				message = filter.clean(message);
			}
			var command = 'SAYBATTLE ' + message + '\n';
			socketClient.write(command);
		}
		$(this).val('');
		return false; //<---- Add this line
	}
});

// userwin in battleroom, chat and commands
$('body').on('click', '.battle-players li', function(e) {
	var username = $(this).data('username');
	var usermuted = store.get('users.' + username + '.mute');

	// create popoup
	var $userwin = $('<div class="userwin active" data-username="' + username + '"><div class="title">' + username + '</div></div>');
	var commands = '<div class="usercommands"><div class="usercommand" data-username="' + username + '" data-command="!ring">!ring</div>';
	commands += '<div class="usercommand" data-username="' + username + '" data-command="!spec">!spec</div>';
	if (usermuted) {
		commands += '<div class="unmuteuser" data-username="' + username + '">unmute</div></div>';
	} else {
		commands += '<div class="muteuser" data-username="' + username + '">mute</div></div>';
	}

	$userwin.append(commands);
	$userwin.append('<div class="floatinginput"><input type="text" class="pminput" data-username="' + username + '" placeholder="Message @' + username + '"></div>');
	$(this).append($userwin);
	$('.pminput').focus();
});

$('body').on('keypress', '.pminput', function(e) {
	if (e.which == 13) {
		var message = $(this).val();
		var username = $(this).data('username');
		if ($('.rudechat').prop('checked') == true) {
			message = filter.clean(message);
		}

		if (!$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
			utils.init_chat(username);
		}

		var command = 'SAYPRIVATE ' + username + ' ' + message + '\n';
		socketClient.write(command);
		$(this).val('');

		utils.add_message_to_chat(username, message, true);
		return false; //<---- Add this line
	}
});

$('body').on('click', '.usercommand', function(e) {
	var username = $(this).data('username');
	var command = $(this).data('command');
	socketClient.write('SAYBATTLE ' + command + ' ' + username + '\n');
});

$('body').on('click', '.muteuser', function(e) {
	var username = $(this).data('username');
	store.set('users.' + username + '.mute', 1);
	$(this)
		.addClass('unmuteuser')
		.removeClass('muteuser')
		.text('unmute');
});

$('body').on('click', '.unmuteuser', function(e) {
	var username = $(this).data('username');
	store.set('users.' + username + '.mute', 0);
	$(this)
		.addClass('muteuser')
		.removeClass('unmuteuser')
		.text('mute');
});

$(document).mouseup(function(e) {
	var container = $('.userwin.active');
	if (!container.is(e.target) && container.has(e.target).length === 0) {
		container.remove();
	}
});

// map picker
$('body').on('click', '.pickmap-btn', function(e) {
	$('.mappicker').addClass('active');
	if (!$('.local.mapscontainer .map').length) battles.loadmapspickmap();
});

$('body').on('click', '.filter.remotemaps', function(e) {
	$('.filter.localmaps, .local.mapscontainer').removeClass('active');
	$('.filter.remotemaps, .remote.mapscontainer').addClass('active');

	if (!$('.remote.mapscontainer .map').length) battles.loadremotemapspickmap();
});

$('body').on('click', '.mappicker .icon-star', function(e) {
	var prefname = 'maps.' + $(this).data('filename');
	prefname = prefname.replace('.sd7', '').replace('.sdz', '');
	if ($(this).hasClass('active')) {
		store.set(prefname, 0);
	} else {
		store.set(prefname, 1);
	}
	$(this).toggleClass('active');
});

$('body').on('click', '.mappicker .map .select', function(e) {
	var command =
		'SAYBATTLE !cv map ' +
		$(this)
			.data('mapname')
			.replace(/_/g, ' ') +
		'\n';
	socketClient.write(command);
	$('.mappicker').removeClass('active');
});

$('body').on('click', '.mappicker .map .delete', function(e) {
	var filename = $(this).data('filename');
	utils.deletemap(filename);
	$(this)
		.closest('.map')
		.remove();
});

$('body').on('click', '.pickmapclose-btn', function(e) {
	$('.mappicker').removeClass('active');
});
