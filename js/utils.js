import { socketClient } from './socket.js';

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, chatlogsdir, infologfile } from './init.js';

var fs = require('fs');
const log = require('electron-log');
var win = require('electron').remote.getCurrentWindow();

var Filter = require('bad-words'),
	filter = new Filter();

const os = require('os');
const platform = os.platform();
const Store = require('electron-store');
const store = new Store();

var votetimerId;
var votestarted;
//const { spawn } = require('child_process');


export default class Utils {
	constructor() {}

	get timenow() {
		var today = new Date();
		return today.getHours() + ':' + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes() + ':' + (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
	}

	get fulltimenow() {
		var today = new Date();
		return today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + ' ' + today.getHours() + ':' + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes() + ':' + (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
	}

	urlify(string) {
		const urls = string.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g);
		if (urls) {
			urls.forEach(function(url) {
				string = string.replace(url, '<a class="open-in-browser" target="_blank" href="' + url + '">' + url + '</a>');
			});
		}
		return string.replace('<br/>', '');
	}

	append_to_terminal(message) {
		if (message == 'PONG' || message == '\n' || message == ' ' || message == '') return false;
		$('#server').append('<li>' + message + '</li>');
	}

	create_chat_window(username) {
		$('.userchat.active').removeClass('active');

		var chat = '<div class="userchat active" data-username="' + username + '">';
		chat += '<div class="actions">';
		chat += '<div class="closewin" data-username="' + username + '">CLOSE</div>';
		chat += '<div class="clearchat" data-username="' + username + '">CLEAR</div>';
		chat += '<div class="deletechat" data-username="' + username + '">DELETE</div>';
		chat += '</div>';
		//chat += '<div class="title">'+username+'</div>';
		chat += '<div class="text-scroll"><ul class="messages"></ul></div>';
		chat += '<div class="bottom-input"><input type="text" class="userchat_input" data-username="' + username + '"/ placeholder="Message @' + username + '"><div class="emojibtn">✋🏽</div></div>';
		chat += '</div>';

		$('#chats').append(chat);
	}

	init_chat(username) {
		var safe_username = jQuery.escapeSelector(username);

		// if chat doesnt exit, create
		if (!$('.userchat[data-username="' + safe_username + '"]').length) {
			this.create_chat_window(username);
		} else {
			if (!$('.userchat[data-username="' + safe_username + '"]').hasClass('active')) {
				$('.userchat.active').removeClass('active');
				$('.userchat[data-username="' + safe_username + '"]').addClass('active');
			}
		}
		$('.active .userchat_input').focus();

		if (!fs.existsSync(chatlogsdir + 'pm-' + username + '.log')) {
			fs.appendFileSync(chatlogsdir + 'pm-' + username + '.log', ' ');
		}

		fs.readFile(chatlogsdir + 'pm-' + username + '.log', function(err, data) {
			if (err) throw err;
			if (data) $('.userchat[data-username="' + safe_username + '"] .messages').html(data.toString());

			// create active chats button
			if (!$('#activechats .userpm-select[data-username="' + safe_username + '"]').length) {
				//check if user is online
				if ($('#chat-list li[data-username="' + safe_username + '"]').length) {
					var div = '<div class="userpm-select online" data-username="' + username + '">' + username + '</div>';
				} else {
					var div = '<div class="userpm-select" data-username="' + username + '">' + username + '</div>';
				}

				$('#activechats .buttons').append(div);
			}

			// add timestamp to userpm-select
			var timestamp = $('.userchat[data-username="' + safe_username + '"] .message')
				.last()
				.data('timestamp');

			if (timestamp) {
				$('#activechats .userpm-select[data-username="' + safe_username + '"]').css('order', -timestamp);
			}

			// scroll bottom
			$('.userchat[data-username="' + safe_username + '"] .text-scroll').scrollTop($('.userchat[data-username="' + safe_username + '"] .messages')[0].scrollHeight);
		});
	}

	add_message_to_chat(username, message, me) {
		var safe_username = jQuery.escapeSelector(username);
		var datenow = Math.floor(Date.now() / 1000);
		var datelast = $('.userchat[data-username="' + safe_username + '"] .message')
			.last()
			.data('timestamp');

		var deltat = datenow - datelast;

		// if user not online, mark messages as unsent
		var chatnotifications = store.get('prefs.chatnotifications');
		var user_online = $('#chat-list li[data-username="' + safe_username + '"]').length;
		var $bubble = $('<li></li>');

		if (me) {
			$bubble.addClass('mine');
			// add label only if last message is longer than 5 minutes
			if (deltat > 300) {
				$bubble.append('<div class="messageinfo"><div class="userspeaking">Me</div><div class="time">' + this.fulltimenow + '</div></div>');
			}
			$bubble.append('<div class="message" data-timestamp="' + datenow + '">' + message + '</div>');
		} else {
			if (deltat > 300) {
				$bubble.append('<div class="messageinfo"><div class="userspeaking">' + username + '</div><div class="time">' + this.fulltimenow + '</div></div>');
			}
			// check if it comes from a host
			if ($('.battle-card[data-founder="' + safe_username + '"]').length) {
				$bubble.append('<div class="message ishost" data-timestamp="' + datenow + '">' + message + '</div>');
			} else {
				$bubble.append('<div class="message" data-timestamp="' + datenow + '">' + message + '</div>');
			}
		}

		if (!user_online) {
			$bubble.addClass('offline');
		}

		$('.userchat[data-username="' + safe_username + '"] .messages').append($bubble);
		$('.userchat[data-username="' + safe_username + '"] .text-scroll').scrollTop($('.userchat[data-username="' + safe_username + '"] .messages')[0].scrollHeight);

		// save chat info
		var container = $bubble
			.wrap('<p/>')
			.parent()
			.html();

		// save if not bot
		if (!$('#chat-list li[data-username="' + safe_username + '"] .icon-user').hasClass('bot')) {
			fs.appendFileSync(chatlogsdir + 'pm-' + username + '.log', container);
		}

		$('#activechats .userpm-select[data-username="' + safe_username + '"]')
			.css('order', -datenow)
			.addClass('active');

		// update unread messages count if not mine
		if ($('#chatlist').hasClass('active') && $('.userchat[data-username="' + safe_username + '"]').hasClass('active') && $('body').hasClass('focus')) {
			// chat is open and active
		} else {
			win.flashFrame(true);
			if (!me) {
				if ($('#activechats .userpm-select[data-username="' + safe_username + '"] .unread').text()) {
					var unread = parseInt($('#activechats .userpm-select[data-username="' + safe_username + '"] .unread').text());
					unread += 1;
					$('#activechats .userpm-select[data-username="' + safe_username + '"] .unread').text(unread);
				} else {
					var unread = 1;
					$('#activechats .userpm-select[data-username="' + safe_username + '"]').append('<div class="unread">' + unread + '</div>');
				}
				this.update_global_unread_count();

				if (chatnotifications) {
					var notification = new Notification(username + ' said', {
						body: message,
					});
					notification.onclick = () => {
						$('.tab, .container.active').removeClass('active');
						$('#chatlist, #chats').addClass('active');
						$('.userchat, .userpm-select').removeClass('active');
						$('.userchat[data-username="' + safe_username + '"], .userpm-select[data-username="' + safe_username + '"]').addClass('active');

						if ($('.userpm-select[data-username="' + safe_username + '"] .unread').length) $('.userpm-select[data-username="' + safe_username + '"] .unread').remove();

						$('.userchat[data-username="' + safe_username + '"] .text-scroll').scrollTop($('.userchat[data-username="' + safe_username + '"] .messages')[0].scrollHeight);
						this.update_global_unread_count();
					};
				}
			}
		}
	}

	send_unsent_message(username, html) {
		log.info('sending unsent message: ' + html);
		fs.readFile(chatlogsdir + 'pm-' + username + '.log', function(err, data) {
			if (err) throw err;
			var content = data.toString().replace(html, '');
			fs.writeFileSync(chatlogsdir + 'pm-' + username + '.log', content);
		});
	}

	delete_unsent_message(username, html) {
		log.info('deleting unsent message: ' + html);
		fs.readFile(chatlogsdir + 'pm-' + username + '.log', function(err, data) {
			if (err) throw err;
			var content = data.toString().replace(html, '');
			fs.writeFileSync(chatlogsdir + 'pm-' + username + '.log', content);
		});
	}

	update_global_unread_count() {
		var count = 0;
		$('#activechats .userpm-select .unread').each(function() {
			count += parseInt($(this).text());
		});
		if (count == 0) count = '';
		$('.tab.chatlist .count').text(count);
	}

	clear_user_chat(username) {
		fs.unlinkSync(chatlogsdir + 'pm-' + username + '.log');
		$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"] .messages').empty();
	}

	// load all chats at startup
	load_chats() {
		log.info('loading chats');
		fs.readdir(chatlogsdir, (err, files) => {
			files.forEach(file => {
				if (file.startsWith('pm')) {
					var username = file.replace('pm-', '').replace('.log', '');
					
					if (!$('.userpm-select[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
						if ($('#chat-list li[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
							var div = '<div class="userpm-select online" data-username="' + username + '">' + username + '</div>';
						} else {
							var div = '<div class="userpm-select" data-username="' + username + '">' + username + '</div>';
						}
						$('#activechats .buttons').append(div);
					}

					this.init_chat(username);
				}
			});
		});
	}

	create_channel_window(chanName) {
		$('.channelchat.active').removeClass('active');

		var channel = '<div class="channelchat active" data-channame="' + chanName + '">';

		channel += '<div class="channelusers">';
		channel += '</div>';

		channel += '<div class="right">';
		channel += '<div class="actions">';
		channel += '<div class="clearchannel" data-channame="' + chanName + '">CLEAR</div>';
		channel += '<div class="closewin" data-channame="' + chanName + '">LEAVE</div>';
		channel += '</div>';
		channel += '<div class="text-scroll"><ul class="messages"></ul></div>';
		channel += '<div class="bottom-input"><input type="text" class="channelchat_input" data-channame="' + chanName + '"/ placeholder="Message @' + chanName + '"></div>';
		channel += '</div>';

		channel += '</div>';

		$('#channels').append(channel);
	}

	init_channel(chanName) {
		// if chat doesnt exit, create
		if (!$('.channelchat[data-channame="' + chanName + '"]').length) {
			this.create_channel_window(chanName);
		} else {
			if (!$('.channelchat[data-channame="' + chanName + '"]').hasClass('active')) {
				$('.channelchat.active').removeClass('active');
				$('.channelchat[data-channame="' + chanName + '"]').addClass('active');
			}
		}
		$('.active .channelchat_input').focus();

		fs.readFile(chatlogsdir + 'channel-' + chanName + '.log', function(err, data) {
			if (err) throw err;
			if (data) $('.channelchat[data-channame="' + chanName + '"] .messages').html(data.toString());
		});

		setTimeout(function() {
			$('.channelchat[data-channame="' + chanName + '"] .text-scroll').scrollTop($('.channelchat[data-channame="' + chanName + '"] .messages')[0].scrollHeight);
		}, 500);
	}

	clear_channel_chat(chanName) {
		fs.unlinkSync(chatlogsdir + 'channel-' + chanName + '.log');
		$('.channelchat[data-channame="' + chanName + '"] .messages').empty();
		$('.channelchat[data-channame="' + chanName + '"] .channelusers').empty();
	}

	add_message_to_channel(chanName, username, message, is_ex) {
		var $bubble = $('<li></li>');

		var me = false;
		if (username == $('#myusername').text()) {
			me = true;
		}

		if (me) {
			$bubble.addClass('mine');
			$bubble.append('<div class="messageinfo"><div class="userspeaking">Me</div><div class="time">' + this.timenow + '</div></div><div class="message">' + message + '</div>');
		} else {
			$bubble.append('<div class="messageinfo"><div class="userspeaking">' + username + '</div><div class="time">' + this.timenow + '</div></div><div class="message">' + message + '</div>');
		}

		if (is_ex) {
			$bubble.addClass('talkingabout');
		}

		$('.channelchat[data-channame="' + chanName + '"] .messages').append($bubble);
		$('.channelchat[data-channame="' + chanName + '"] .text-scroll').scrollTop($('.channelchat[data-channame="' + chanName + '"] .messages')[0].scrollHeight);

		// save chat info
		var container = $bubble
			.wrap('<p/>')
			.parent()
			.html();
		fs.appendFileSync(chatlogsdir + 'channel-' + chanName + '.log', container);

		//reorder active chats
		/*
		$('#activechats .userpm-select').each(function( index ) {
			$(this).css('order', index+1);
		});
		$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').css('order', '0').addClass('active');
*/

		// update unread messages count if not mine
		/*
		if ( $('#channels').hasClass('active') && $('.channelchat[data-channame="'+chanName+'"]').hasClass('active') ){								
			// chat is open and active
		}else{
			if (!me){
				if ($('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text()){
					var unread = parseInt($('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text());
					unread += 1;	
					$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text(unread);
				}else{
					var unread = 1;
					$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').append('<div class="unread">'+unread+'</div>');
				}				
				this.update_global_unread_count();	
			}
		}	
*/
	}

	init_battlerrom_chat() {
		var battleid = $('#battleroom .battleid').text();
		if (fs.existsSync(chatlogsdir + 'battleroom-' + battleid + '.log')) {
			fs.readFile(chatlogsdir + 'battleroom-' + battleid + '.log', function(err, data) {
				if (err) throw err;
				if (data) $('#battle-room').html(data.toString());
			});
		}

		setTimeout(function() {
			if ($('.showhostmessages').prop('checked') == true) {
				$('.ishost').removeClass('hidemessage');
			} else {
				$('.ishost').addClass('hidemessage');
			}
			$('#battleroom .text-scroll').scrollTop($('#battle-room')[0].scrollHeight);
		}, 1000);
	}

	append_message_battleroom(username, message, is_ex) {
		var usermuted = store.get('users.' + username + '.mute');

		var myusername = $('#myusername').text();
		var amiplaying = false;

		if ($('.battle-playerlist li[data-username="' + jQuery.escapeSelector(myusername) + '"]').length) amiplaying = true;

		var ring = message.startsWith('* Ringing');
		var messageUp = message.toUpperCase();
		var talkingabout = messageUp.indexOf(myusername.toUpperCase());
		var ishost = message.startsWith('* ');
		var winner = -1;
		var vote = -1;
		var endvote = -1;
		var votepassed = -1;
		var myvote = -1;
		var votemap = -1;
		var byme = -1;

		if (ishost >= 0) {
			winner = message.indexOf('won!');
			vote = message.indexOf('called a vote for command');
			votepassed = message.indexOf('" passed.');
			endvote = message.indexOf('* Vote cancelled');
			myvote = message.indexOf(myusername + ' called a vote');
			votemap = message.indexOf('vote for command "set map');
			byme = message.indexOf('(by ' + myusername + ')');
			if (byme >= 0) {
				talkingabout = -1;
			}
			//var endvote = message.indexOf('Vote for command');
		}

		// (ring && !$('li[data-username="' + jQuery.escapeSelector(myusername) + '"] .icon-user').hasClass('ready'))
		if (ring && talkingabout > 0) {
			$('#ringsound')[0].play();
			win.flashFrame(true);
		}

		message = message.replace('\n', ' ');
		message = $('<div/>')
			.text(message)
			.html();
		message = this.urlify(message);
		message = message.replace(/<br\s*\/?>/gi, ' ');
		if ($('.rudechat').prop('checked') == true) {
			message = filter.clean(message);
		}

		var $bubble = $('<li></li>');
		var last_user_msg = $('#battle-room li .userspeaking')
			.last()
			.text();		

		if (username == last_user_msg) {
			$bubble.append('<div class="messageinfo hidden"><div class="userspeaking">' + username + '</div><div class="time">' + this.timenow + '</div></div><div class="message">' + message + '</div>');
			if (usermuted) {
				// avoid muted user spam
				return false;
			}
		} else {
			$bubble.append('<div class="messageinfo"><div class="userspeaking">' + username + '</div><div class="time">' + this.timenow + '</div></div><div class="message">' + message + '</div>');
			if (usermuted) {
				$bubble.addClass('muted');
			}
		}

		if (username == myusername) {
			$bubble.addClass('mine');
		} else if (ishost) {
			$bubble.addClass('ishost');
			if ($('.showhostmessages').prop('checked') == false) {
				setTimeout(function() {
					$bubble.addClass('hidemessage');
				}, 8000);
			}
		}

		if (talkingabout > 0) {
			$bubble.addClass('talkingabout');
		}

		// if (is_ex > 0) {
		// 	$bubble.addClass('talkingabout');
		// }

		if (winner >= 0) {
			$bubble.addClass('winner');
		}

		if (vote >= 0 && amiplaying) {
			// will ring me too
			$bubble.addClass('vote');
			$('#battleroom #votewin').addClass('active');
			if (myvote > 1) {
				$('#battleroom #votewin').addClass('myvote');
			} else {
				$('#battleroom #votewin').removeClass('myvote');
			}
			$('#battleroom #votefor').text(message.replace('[!vote y, !vote n, !vote b]', ''));
			if (votemap >= 0) {
				var mapfilenamebase = message.match(/"(.*?)"/)[1].replace('set map ');
				mapfilenamebase = mapfilenamebase
					.split(' ')
					.join('_')
					.toLowerCase()
					.replace('undefined', '');
				var localmap = 'minimaps/' + mapfilenamebase + '.jpg';
				var imgdiv = '<div class="map"><img src="' + localmap + '"></div>';
				$('#battleroom .voteformap').html(imgdiv);
			} else {
				$('#battleroom .voteformap').empty();
			}

			votestarted = Math.floor(Date.now() / 1000);
			votetimerId = setInterval(this.votecountdown, 1000);
		}

		if (endvote >= 0 || votepassed >= 0) {
			$('#battleroom #votewin').removeClass('active');
		}

		$('#battle-room').append($bubble);

		// scroll to bottom
		if ($('.autoscrollbattle ').prop('checked') == true) {
			$('#battleroom .text-scroll').scrollTop($('#battle-room')[0].scrollHeight);
		}

		// save battle log
		if ($('.savechats').prop('checked') == true) {
			var battleid = $('#battleroom .battleid').text();
			var container = $bubble
				.wrap('<p/>')
				.parent()
				.html();
			fs.appendFileSync(chatlogsdir + 'battleroom-' + battleid + '.log', container);
		}
	}

	votecountdown() {
		var votecounter = 45 - (Math.floor(Date.now() / 1000) - votestarted);
		if (votecounter <= 0) {
			clearTimeout(votetimerId);
			$('#battleroom #votewin').removeClass('active');
		} else {
			$('#battleroom #votecountdown').text(votecounter);
		}
	}

	clear_battleroom_chat() {
		var battleid = $('#battleroom .battleid').text();
		fs.unlinkSync(chatlogsdir + 'battleroom-' + battleid + '.log');
		$('#battle-room').empty();
	}

	getColor() {
		var r = 0;
		var g = 0;
		var b = 0;

		var color = $('#topbar .status')
			.css('background-color')
			.replace('rgb(', '')
			.replace(')', '')
			.split(',');
		if (color.length == 3) {
			r = color[0];
			g = color[1];
			b = color[2];
		}
		return (b << 16) | (g << 8) | r;
	}

	// to do
	sendstatus() {
		/*
	    b0 = in game (0 - normal, 1 - in game)
		b1 = away status (0 - normal, 1 - away)
		b2-b4 = rank (see Account class implementation for description of rank) - client is not allowed to change rank bits himself (only server may set them).
		b5 = access status (tells us whether this client is a server moderator or not) - client is not allowed to change this bit himself (only server may set them).
		b6 = bot mode (0 - normal user, 1 - automated bot). This bit is copied from user's account and can not be changed by the client himself. Bots differ from human 
		players in that they are fully automated and that some anti-flood limitations do not apply to them.
		*/
		var ingame = 0,
			away = 0,
			bot = 0;

		if ($('body').hasClass('ingame') == true) {
			ingame = 1;
		} else {
			ingame = 0; //unspec
		}
		
		if ( $('#myusername').hasClass('away') ){
			away = 1;
		}else{
			away = 0;			
		}		

		var bitcode = ingame + away * 2;
		var command = 'MYSTATUS ' + bitcode + '\n';
		socketClient.write(command);
	}

	sendbattlestatus() {
		var myusername = $('#myusername').text();

		var ready = 0,
			team = 0,
			ally = 0,
			spec = 0,
			synced = 1,
			faction = 0;

		synced = this.getsyncstatus();

		ally = $('#battleroom li[data-username="' + jQuery.escapeSelector(myusername) + '"] .ally').text();
		if (ally >= 1) {
			ally = ally - 1;
		} else {
			ally = 0;
		}

		team = $('#battleroom li[data-username="' + jQuery.escapeSelector(myusername) + '"] .team').text();
		if (team >= 1) {
			team = team - 1;
		} else {
			team = 0;
		}

		if ($('.specbattle').prop('checked') == true) {
			spec = 0;
		} else {
			spec = 1; //unspec
		}

		if ($('.readybattle').prop('checked') == true) {
			ready = 1;
			spec = 1; //try to unspec
		}

		if ($('#battleroom .me .faction').hasClass('icon-arm')) {
			faction = 0;
		} else {
			faction = 1;
		}

		var bitcode = ready * 2 + 2 ** 2 * team + 2 ** 6 * ally + spec * 2 ** 10 + 2 ** (23 - synced) + faction * 2 ** 24;
		var command = 'MYBATTLESTATUS ' + bitcode + ' ' + this.getColor() + '\n';
		socketClient.write(command);
	}

	getsyncstatus() {
		
		// get engine sync info 
		var currentengine = $('#battleroom .engine')
			.text()
			.toLowerCase()
			.split(' ');
		
		var version = currentengine[1];		
		var engineexist = false;
		
		if (platform == 'win32') {
			var enginefile = springdir + 'engine\\' + version + '\\spring.exe';			
		} else if (platform == 'darwin') {
			var enginefile = springdir + 'engine/' + version + '/Spring_'+version+'.app';
		} else if (platform == 'linux') {
			var enginefile = springdir + 'engine/' + version + '/spring';			
		}
			
			
		if (fs.existsSync( enginefile ) && !$('#battleroom .engine-download').hasClass('downloading') ) {
			
			log.info('Engine sync');	
			
			var currentmod = $('#battleroom .gameName')
				.text()
				.toLowerCase();
			var index = currentmod.lastIndexOf(' ');
			var filename =
				currentmod
					.substring(0, index)
					.split(' ')
					.join('_') +
				'-' +
				currentmod
					.substring(index)
					.split(' ')
					.join('') +
				'.sdz';
	
			if (fs.existsSync(modsdir + filename) && !$('#battleroom .game-download').hasClass('downloading')) {
				log.info('Game sync');
				var currentmap = $('#battleroom .mapname')
					.text()
					.replace("'", '_')
					.toLowerCase();
				currentmap = currentmap.split(' ').join('_');
				var filename = currentmap + '.sd7';
				var filename2 = currentmap + '.sdz';
	
				if ((fs.existsSync(mapsdir + filename) || fs.existsSync(mapsdir + filename2)) && !$('#battleroom .map-download').hasClass('downloading')) {				
					log.info('Map sync');
					return 1;
				} else {
					log.info('Map unsync');
					return 0;
				}
			} else {
				log.info('Game unsync');
				return 0;
			}
								
		}else{
			log.info('Engine unsync');
			log.warn('Engine not found at: ' + enginefile);
			return 0;
		}
	
	
		
	}

	deletemap(filename) {
		fs.unlinkSync(mapsdir + filename);
	}
}

function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}
