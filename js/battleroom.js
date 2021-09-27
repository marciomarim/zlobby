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

$('body').on('click dblclick', '.battle-card', function(e) {
	
	var $battlecard = $(this);
	joinbattle($battlecard);
	
	// if (!$('body').hasClass('clickbattle')) {
	// 	$('body').addClass('clickbattle');
	// 	setTimeout(function() {
	// 		$('body').removeClass('clickbattle');
	// 	}, 2000);		
	// }
});	

function joinbattle( $battlecard ){
	
	var username = $('#myusername').text();
	var battleid = $battlecard.data('battleid');

	// hide map picker
	$('.mappicker').removeClass('active');

	//if I'm in, just go to battleroom
	if ( $battlecard.hasClass('activebattle') ) {
		
		$('.container, .tab').removeClass('active');
		$('#battleroom, .tab.battleroom').addClass('active');
	
	// need to leave another battle	
	} else if ($('.activebattle').length) {
		var command = 'LEAVEBATTLE \n';
		socketClient.write(command);
		var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';
		socketClient.write(command);
		
	// try to join
	} else {		
		var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';
		socketClient.write(command);
	}
		
}

// discord or other link to join battle
var joinbattlelink = setInterval(function() {
	var data = $('#externaldata').text();
	if (data) {
		data = data.split('=');
		$('#externaldata').empty();
		checkExternalData(data);
		data = '';
	}
}, 1000);

function checkExternalData(data) {
			
	console.warn(data);

	if (data[0] == 'zlobby://joinbattle') {
		
		var username = $('#myusername').text();
		var battleid = data[1];
		console.warn(battleid);
		

		if (!$('body').hasClass('clickbattle')) {
			$('body').addClass('clickbattle');
			setTimeout(function() {
				$('body').removeClass('clickbattle');
			}, 2000);

			var username = $('#myusername').text();

			// hide map picker
			$('.mappicker').removeClass('active');

			//if I'm in, just go to battleroom
			if ($('.battle-card [data-battleid="' + battleid + '"]').hasClass('activebattle')) {
				$('.container, .tab').removeClass('active');
				$('#battleroom, .tab.battleroom').addClass('active');
				// need to leave another battle
			} else if ($('.activebattle').length) {
				var command = 'LEAVEBATTLE \n';
				socketClient.write(command);
				var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';
				socketClient.write(command);
				// try to join
			} else {
				var command = 'JOINBATTLE ' + battleid + '  ' + battles.generatePassword(username) + '\n';
				socketClient.write(command);
			}
		}
	}
	
}

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
		$('#battleroom .pretty.ready').removeClass('active');
	}
	
	$('#battleroom .specbattle').prop('checked');
	utils.sendbattlestatus();
});

$('body').on('click', '.autolaunchbattle', function(e) {
	
	if ($('#battleroom .autolaunchbattle').prop('checked') == true) {		
		store.set('user.autolaunchbattle', 1);
	}else{		
		store.set('user.autolaunchbattle', 0);
	}	
	
});


$('body').on('click', '.gospec, .goplay', function(e) {
	
	if ($('#battleroom .specbattle').prop('checked') == true) {
		$('#battleroom .specbattle').prop('checked', false);
		$('body').addClass('unspecing');
	} else {
		$('body').removeClass('unspecing');
		$('#battleroom .specbattle').prop('checked', true);
	}
	
	if ($('#battleroom .readybattle').prop('checked') == true) {
		$('#battleroom .readybattle').prop('checked', false);
		$('#battleroom .pretty.ready').removeClass('active');
	}
	
	$('#battleroom .specbattle').prop('checked');
	utils.sendbattlestatus();
});

// click on ready button
$('body').on('click', '.readybattle', function(e) {
	
	if ($('#battleroom .specbattle').prop('checked') == true) {
		$('#battleroom .specbattle').prop('checked', false);		
	}
	
	if($('#battleroom .pretty.ready').hasClass('active')){		
		$('#battleroom .pretty.ready').removeClass('active');
	}else{		
		$('#battleroom .pretty.ready').addClass('active');
	}
	$(this).prop('checked');
	utils.sendbattlestatus();
	
});

// click on own user icon 
$('body').on('click', '.me .icon-user', function(e) {
	
	if ($('#battleroom .readybattle').prop('checked') == true) {
		$('#battleroom .readybattle').prop('checked', false);		
	}else{
		$('#battleroom .readybattle').prop('checked', true);
		$('#battleroom .specbattle').prop('checked', false);
	}
	
	if($('#battleroom .pretty.ready').hasClass('active')){		
		$('#battleroom .pretty.ready').removeClass('active');
	}else{		
		$('#battleroom .pretty.ready').addClass('active');
	}
	
	utils.sendbattlestatus();
	
});

// click on own user icon 
$('body').on('click', '.me .faction', function(e) {
	
	if ( $(this).hasClass('icon-arm') ){
		$(this).removeClass('icon-arm').addClass('icon-core');	
		store.set('user.faction', 1);
	}else{
		$(this).removeClass('icon-core').addClass('icon-arm');	
		store.set('user.faction', 0);
	}		
	utils.sendbattlestatus();
});

$('body').on('click', '.me .color', function(e) {	
	$('.colorpicker').toggleClass('active');	
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

$('body').on('click', '.inlinechat', function(e) {
	if ($('.inlinechat').prop('checked') == true) {
		store.set('prefs.inlinechat', 1);
		$('body').addClass('inlinechat');
	} else {
		store.set('prefs.inlinechat', 0);
		$('body').removeClass('inlinechat');
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

var promotelocked = false;

$('body').on('click', '.command', function(e) {
	
	if (!promotelocked && $(this).data('command') == '!promote' ) {
		promotelocked = true;
		promoteDiscord();
		// lock for 30 secs
		setTimeout(promoteunlock, 30000);
	}
	
	var command = 'SAYBATTLE ' + $(this).data('command') + '\n';
	socketClient.write(command);
});

function promoteunlock () {
	promotelocked = false;
}

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

$('body').on('click', '.vote.b', function(e) {
	var command = 'SAYBATTLE !vote b\n';
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




$('body').on('click', '#pickteam, #pickally', function(e) {
	$('body').addClass('picking');
});


$('body').on('click', '.addbot', function(e) {
	var myusername = $('#myusername').text();
	var count = $('mybot').length + 1;
	var command = 'ADDBOT BOT' + count + '-' + myusername + ' ' + getbattlestatus() + ' 255 \n';
	socketClient.write(command);
});

$('body').on('click', '.removebot', function(e) {
	var botname = $(this).data('username');
	var command = 'REMOVEBOT ' + botname + '\n';
	socketClient.write(command);
	console.log(command);
});

function getbattlestatus() {	

	var ready = 1,
		team = 0,
		ally = 0,
		spec = 1,
		synced = 1,
		faction = 0;
		
	var bitcode = ready * 2 + 2 ** 2 * team + 2 ** 6 * ally + spec * 2 ** 10 + 2 ** (23 - synced) + faction * 2 ** 24;
	return bitcode;
}


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
	var myusername = $('#myusername').text();
	
	if ($('.battle-players li[data-username="' + jQuery.escapeSelector(founder) + '"] .icon-user').hasClass('ingame')) {
		battles.launchgame();
		$('body').addClass('ingame');
		utils.sendstatus();
	} else {
		if ( $('.battle-playerlist li[data-username="' + jQuery.escapeSelector(myusername) + '"]').length ){
			var command = 'SAYBATTLE !start\n';
			socketClient.write(command);	
		}		
	}
});

// $('body').on('click', '#battleroom .left', function(e) {
// 	$('#chatlist').removeClass('over');
// });

$('body').on('keydown', '.battleroom_input', function(e) {
	var key = {
          left: 37,
          up: 38,
          right: 39,
          down: 40,
          tab: 9,
          enter: 13,
        };

	switch (e.which) {
		case key.left:
			//..
			break;
		case key.up:
			if (bmessages[bmcount]) {
				$('.battleroom_input').val(bmessages[bmcount]);
				if (bmessages[bmcount - 1]) {
					bmcount -= 1;
				}
			}
			break;
		case key.right:
			//..
			break;
		case key.down:
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
		case key.tab:
			e.preventDefault();
			var message = $(this).val();
			autocompleteusers(message);
                        break;
		case key.enter:
                        onSendChat();
                        break;
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

const Discord = require('discord.js');
const webhookClient = new Discord.WebhookClient('785817997013024778', 'mTgpoGg0ZwOPaxWr5Y-CpIZPcG1chsO1S3LjCfYfAOChoT1Y64TQZNsZm5e12brbVvQo');

function promoteDiscord(){	
	// bail out if not ba
	if ( !$('.serverhosturl.ba').hasClass('active') ){
		return false;
	}
	var myusername = $('#myusername').text();
	var battleid = $('#battleroom .battleid').text();
	var nplayers = $('#battleroom .battle-playerlist li').length;
	var half = nplayers / 2;
	var quotient = Math.floor(nplayers / 2) + 1;
	var remainder = nplayers % 2;
	
	var battlename = $('#battleroom #battle-right-info .title').text();
	var footermessage = 'with ' + myusername + ' on ' + $('#battleroom .mapname').text();

	if (remainder == 0) {
		var title = '2 player needed for ' + quotient + 'v' + quotient + ' in ' + battlename;
		var url = 'https://yhello.co/redirect.php?var=joinbattle&val=' + battleid;
		console.warn(url);								
		const embed = new Discord.MessageEmbed()
			.setTitle(title)
			.setURL(url)									
			.setFooter(footermessage)
			.setColor('#5588ff');
		
		webhookClient.send('', {
			username: 'Battle',
			avatarURL: 'https://yhello.co/zlobby.png',
			embeds: [embed],
		});
	} else {
		var title = '1 player needed for ' + quotient + 'v' + quotient + ' in ' + battlename;
		var url = 'https://yhello.co/redirect.php?var=joinbattle&val=' + battleid;
		console.warn(url);								
		const embed = new Discord.MessageEmbed()
			.setTitle(title)
			.setURL(url)									
			.setFooter(footermessage)
			.setColor('#5588ff');
		
		webhookClient.send('', {
			username: 'Battle',
			avatarURL: 'https://yhello.co/zlobby.png',
			embeds: [embed],
		});
		
	}
}

$('body').on('click', '.me .icon-away', function(e) {
	
	$('#myusername').toggleClass('away');
	setTimeout(function(){
		utils.sendstatus();	
	}, 500);
	
});


// battleroom chat
function onSendChat() {
    var message = $('.battleroom_input').val();

    // save sent messages
    bmessages.push(message);
    bmcount = bmessages.length - 1;

    if (message == '/clear') {
            utils.clear_battleroom_chat();
    } else if (message == '/away') {
            $('#myusername').toggleClass('away');
            setTimeout(function(){
                    utils.sendstatus();
            }, 500);
    } else if (message == '/autoready 1') {
            store.set('user.autoready', 1);
            $('#battleroom .readybattle').prop('checked', true);
            $('#battleroom .pretty.ready').addClass('active');
            utils.sendbattlestatus();
    } else if (message == '/autoready 0') {
            store.set('user.autoready', 0);
            $('#battleroom .readybattle').prop('checked', false);
            $('#battleroom .pretty.ready').removeClass('active');
            utils.sendbattlestatus();
    } else if (message.startsWith('!promote')) {
            promoteDiscord();
            var command = 'SAYBATTLE ' + message + '\n';
            socketClient.write(command);
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
    $('.battleroom_input').val('');
    return false;
};

$('body').on('click', '.resync', function(e) {
	utils.sendbattlestatus();
});

$('body').on('click', '.recheckmap', function(e) {
	battles.checkmap();
});

$('body').on('click', '.recheckgame', function(e) {
	store.set('game.' + $('#battleroom .gameName').text(), 0);
	battles.checkgame();
});

// $('body').on('click', '.mapname', function(e) {
// 	var $resync = $('<div class="hover btn" data-username="' + username + '"></div>');
// });
// 
// $('body').on('click', '.gameName', function(e) {
// 	
// });
// 
// $('body').on('click', '.engine', function(e) {
// 	
// });

// userwin in battleroom, chat and commands
$('body').on('click', '.battle-players li .name', function(e) {
	
	var username = $(this).parent('li').data('username');
	var founder = $('#battleroom .founder').text();
	// create popoup
	var $userwin = $('<div class="userwin active" data-username="' + username + '"></div>');
	
	if ( $(this).parent('li').hasClass('me') ){
		
		if ($('.battle-playerlist [data-username="' + jQuery.escapeSelector(username) + '"]').length){			
			var commands = $('.pickallyteamcontainer').html();								
		}		
	
	}else if( $(this).parent('li').hasClass('mybot') ){
		
		var commands = '<div class="usercommands"><div class="removebot btn" data-username="' + username + '">REMOVE BOT</div></div>';
			
	}else if(username == founder ){
		
		var commands = '<div class="usercommands"><div class="usercommand btn" data-username="' + username + '" data-command="!status">!status</div>';
		commands += '<div class="usercommand btn" data-username="' + username + '" data-command="!stats">!stats</div></div>';
		commands += '<div class="floatinginput"><input type="text" class="pminput" data-username="' + username + '" placeholder="Message @' + username + '"></div>';
		
	}else{			
			
		var usermuted = store.get('users.' + username + '.mute');
		var commands = '<div class="usercommands"><div class="usercommand btn" data-username="' + username + '" data-command="!ring">!ring</div>';
		commands += '<div class="usercommand btn" data-username="' + username + '" data-command="!spec">!spec</div>';
		if (usermuted) {
			commands += '<div class="unmuteuser btn" data-username="' + username + '">unmute</div></div>';
		} else {
			commands += '<div class="muteuser btn" data-username="' + username + '">mute</div></div>';
		}
		commands += '<div class="floatinginput"><input type="text" class="pminput" data-username="' + username + '" placeholder="Message @' + username + '"></div>';
				
	}
	
	if (commands){
		$userwin.append(commands);
		$(this).parent('li').append($userwin);
		$('.pminput').focus();		
	}
	
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

	if (command == '!status' || command == '!stats') {
		socketClient.write('SAYPRIVATE ' + username + ' ' + command + '\n');
		$('#chatlist').addClass('over');
		$('.userchat, .userpm-select').removeClass('active');
		$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('active');
		$('.userpm-select [data-username="' + jQuery.escapeSelector(username) + '"]').addClass('active');

		if (!$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
			utils.init_chat(username);
		}
		$('#chats .text-scroll').scrollTop($('.userchat[data-username="' + jQuery.escapeSelector(username) + '"] .messages')[0].scrollHeight);
	} else {
		socketClient.write('SAYBATTLE ' + command + ' ' + username + '\n');
	}
});

$('body').on('click', '.muteuser', function(e) {
	var username = $(this).data('username');
	store.set('users.' + username + '.mute', 1);
	$(this)
		.addClass('unmuteuser')
		.removeClass('muteuser')
		.text('unmute');
	$('li[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('muted');	
});

$('body').on('click', '.unmuteuser', function(e) {
	var username = $(this).data('username');
	store.set('users.' + username + '.mute', 0);
	$(this)
		.addClass('muteuser')
		.removeClass('unmuteuser')
		.text('mute');
	$('li[data-username="' + jQuery.escapeSelector(username) + '"]').removeClass('muted');
});

$(document).mouseup(function(e) {
	var container = $('.userwin.active');
	if (!container.is(e.target) && container.has(e.target).length === 0) {
		container.remove();
	}
	
	container = $('#battleroom .colorpicker');
	if (!container.is(e.target) && container.has(e.target).length === 0) {
		container.removeClass('active');
	}
});

// map picker
$('body').on('click', '.pickmap.btn', function(e) {
	$('.mappicker').addClass('active');
	if (!$('.local.mapscontainer .map').length) battles.loadmapspickmap();
});

$('body').on('click', '.reloadmap.btn', function(e) {	
	var battleid = $('#battleroom .battleid').text();
	battles.load_map_images(battleid);
});

$('body').on('click', '.splitmenu .btn', function(e) {	
	var command = $(this).data('command');
	socketClient.write('SAYBATTLE ' + command + '\n');
	//socketClient.write(command);
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

$('body').on('click', '.pickmapclose.btn', function(e) {
	$('.mappicker').removeClass('active');
});
