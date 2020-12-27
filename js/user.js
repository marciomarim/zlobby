import { socketClient } from './socket.js';

import Battle from './battle.js';
let battles = new Battle();

import Utils from './utils.js';
let utils = new Utils();

const Store = require('electron-store');
const store = new Store();
const log = require('electron-log');

import { trackEvent } from './init.js';

export default class User {
	constructor() {}

	adduser(username, country, cpu, userID, lobbyID) {
		var line = '<div class="icon icon-user"></div>';
		line += '<div class="flag-icon flag-icon-squared flag-icon-' + country.toLowerCase() + '"></div>';
		line += '<div class="rank icon icon-rank0"></div>';
		line += '<div class="name">' + username + '</div>';
		line += '<div class="trueskill">–</div>';
		line += '<div class="admin icon icon-admin false"></div>';
		line += '<div class="away icon icon-away false"></div>';

		line += '<div class="country">' + country + '</div>';
		if (cpu != 0) line += '<div class="cpu">' + cpu + '</div>';
		if (userID != 0 && userID != undefined) line += '<div class="userID">' + userID + '</div>';
		if (lobbyID) line += '<div class="lobbyID">' + lobbyID + '</div>';

		line += '</div>';
		$('#chat-list').append('<li data-username="' + username + '">' + line + '</li>');
		//$('.tab.chatlist .count').text( $('#chat-list li').length );

		// flag chat button (if chat exist) online
		if ($('#activechats .userpm-select[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
			$('#activechats .userpm-select[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('online');
		}
	}

	// add battle additional fields
	addbattlestatusfields(username) {
		var div = $('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .trueskill');
		div.after('<div class="bonus"></div>');
		div.after('<div class="color"></div>');
		div.after('<div class="faction icon icon-arm"></div>');
		div.after('<div class="team">–</div>');
		div.after('<div class="ally">-</div>');
	}

	// user disconnected
	removeuser(username) {
		$('#chat-list li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
		// flag chat button offline
		if ($('#activechats .userpm-select[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
			$('#activechats .userpm-select[data-username="' + jQuery.escapeSelector(username) + '"]').removeClass('online');
		}
	}

	// update simple status on chatlist and battlelist
	updatestatus(username, status) {
		var safe_username = jQuery.escapeSelector(username);
		var safe_myusername = jQuery.escapeSelector($('#myusername').text());
		var autoready = store.get('user.autoready');

		var newStatus = {
			inGame: (status & 1) > 0,
			away: (status & 2) > 0,
			timeRank: (status & 28) >> 2,
			admin: (status & 32) > 0,
			lobbyBot: (status & 64) > 0,
			statusMask: status,
		};

		if (newStatus.timeRank) $('li[data-username="' + safe_username + '"] .rank').addClass('icon-rank' + newStatus.timeRank);

		if (newStatus.inGame) {
			$('li[data-username="' + safe_username + '"] .icon-user').addClass('ingame');
		} else {
			$('li[data-username="' + safe_username + '"] .icon-user').removeClass('ingame');
		}

		if (newStatus.away) $('li[data-username="' + safe_username + '"] .away').removeClass('false');

		if (newStatus.admin) $('li[data-username="' + safe_username + '"] .admin').removeClass('false');

		if (newStatus.lobbyBot) {
			$('li[data-username="' + safe_username + '"] .icon-user').addClass('bot');
		} else {
			$('li[data-username="' + safe_username + '"] .icon-user').removeClass('bot');
		}

		// any battle that start should update battle status
		if ($('.battle-card[data-founder="' + safe_username + '"]').length && newStatus.inGame) {
			// battle is running should change status
			$('#battleroom[data-founder="' + safe_username + '"] .status').addClass('ingame');
			$('.battle-card[data-founder="' + safe_username + '"] .status').addClass('ingame');
			//console.log('battle started');
		} else if ($('.battle-card[data-founder="' + safe_username + '"]').length && !newStatus.inGame) {
			//battle ended
			$('#battleroom[data-founder="' + safe_username + '"] .status').removeClass('ingame');
			$('.battle-card[data-founder="' + safe_username + '"] .status').removeClass('ingame');
			// remove class so it can start again
		}

		// detect is it's my battle
		// runs for founder status
		// game start
		if (username == $('#battleroom .founder').text() && newStatus.inGame) {
			if ($('.battle-playerlist li[data-username="' + safe_myusername + '"]').length) {
				battles.launchgame();
				$('body').addClass('ingame');
				utils.sendstatus(); // ingame
				$('#battleroom .readybattle').prop('checked', false);
				$('#battleroom .pretty.ready').removeClass('active');
				log.info('Launching spring as player');
			}

			if ($('.battle-speclist li[data-username="' + safe_myusername + '"]').length && $('.autolaunchbattle').prop('checked') == true) {
				battles.launchgame();
				$('body').addClass('ingame');
				utils.sendstatus(); //ingame
				log.info('Launching spring as spec');
			}

			// game end
		} else if (username == $('#battleroom .founder').text() && !newStatus.inGame) {
			$('body').removeClass('ingame');			

			if (autoready && $('.battle-playerlist li[data-username="' + safe_myusername + '"]').length) {
				log.info('autoready true');
				$('#battleroom .readybattle').prop('checked', true);
				$('#battleroom .pretty.ready').addClass('active');
			} else {
				log.info('autoready false');
				$('#battleroom .readybattle').prop('checked', false);
				$('#battleroom .pretty.ready').removeClass('active');
			}
			setTimeout(function() {
				utils.sendstatus();
				utils.sendbattlestatus();
			}, 1000);
		}
	}

	updatebattlestatus(username, status, color) {
		
		var myusername = $('#myusername').text();
		var safe_founder = jQuery.escapeSelector( $('#battleroom .founder').text() );
		
		// AUTO UNSPEC
		// if (myusername != username && $('body').hasClass('unspecing') && $('#battleroom .battle-playerlist').length() < 16) {
		// 	utils.sendbattlestatus();
		// }

		if (!$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .faction').length) {
			//add user battle status to players
			this.addbattlestatusfields(username);
		}

		var status2 = dec2bin(status);

		var newStatus = {
			ready: (status & 2) > 0,
			team: bin2dec(status2.substring(status2.length - 6, status2.length - 2)) + 1,
			ally: bin2dec(status2.substring(status2.length - 10, status2.length - 6)) + 1,
			spec: (status & 1024) > 0,
			bonus: bin2dec(status2.substring(status2.length - 18, status2.length - 11)),
			sync: bin2dec(status2.substring(status2.length - 24, status2.length - 22)),
			faction: bin2dec(status2.substring(status2.length - 28, status2.length - 24)),
		};

		if (newStatus.sync == 2 || newStatus.sync == 0) {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').addClass('unsync');
		} else {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').removeClass('unsync');
			if (newStatus.ready) {
				$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').addClass('ready');
			} else {
				$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').removeClass('ready');
			}
		}

		if (newStatus.spec == true) {
			
			$('#battleroom .battle-playerlist').append($('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]'));
			$('.battle-speclist li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
			// if unspec really work, clear class unspecing
			if (myusername == username) {				
				setTimeout(function() {
					// check after 1sec if still in the playerlist
					if ($('#battleroom .battle-playerlist li[data-username="' + jQuery.escapeSelector(myusername) + '"]').length) {
						$('body').removeClass('unspecing');
					}
				}, 1000);
				$('#battleroom .startbattle').removeClass('inactive');	
				if ( $('li[data-username="' + safe_founder + '"] .icon-user').hasClass('ingame') ){						
					$('#battleroom .startbattle').text('Watch');
				}else{					
					$('#battleroom .startbattle').text('Start');	
				}
				
			}
		} else if (newStatus.spec == false) {
			// hide start button			
			
			// if me and not trying to unspec
			if (myusername == username && !$('body').hasClass('joinningbattle') && !$('body').hasClass('unspecing')) {
				$('#battleroom .specbattle').prop('checked', true);
				$('#battleroom .readybattle').prop('checked', false);												
			}
			if (myusername == username){
				if ( $('li[data-username="' + safe_founder + '"] .icon-user').hasClass('ingame') ){
					$('#battleroom .startbattle').removeClass('inactive');	
					$('#battleroom .startbattle').text('Watch');
				}else{
					$('#battleroom .startbattle').addClass('inactive');	
				}
			}
			$('#battleroom .battle-speclist').append($('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]'));
			$('.battle-playerlist li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
		}

		var newcolor = {
			Red: color & 255,
			Green: (color >> 8) & 255,
			Blue: (color >> 16) & 255,
		};

		var csscolor = 'rgb(' + newcolor.Red + ',' + newcolor.Green + ',' + newcolor.Blue + ')';
		$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .color').css('background-color', csscolor);

		// it's my status
		if (myusername == username) {
			$('select#pickteam')
				.val(newStatus.team)
				.change();
			$('select#pickally')
				.val(newStatus.ally)
				.change();

			$('#battleroom .colorpicked').css('background-color', csscolor);
		}

		$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .team').text(newStatus.team);
		$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .ally')
			.text(newStatus.ally)
			.removeClass(function(index, className) {
				return (className.match(/(^|\s)ally-\S+/g) || []).join(' ');
			})
			.addClass('ally-' + newStatus.ally.toString());

		if (newStatus.bonus == 0) {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .bonus').text('');
		} else {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .bonus').text(newStatus.bonus);
		}

		if (newStatus.faction == 1) {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .faction')
				.removeClass('icon-arm')
				.addClass('icon-core');
		} else {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .faction')
				.removeClass('icon-core')
				.addClass('icon-arm');
		}

		//update counts
		var numberofplayers = $('#battleroom .battle-playerlist li').length;
		var numberofspecs = $('#battleroom .battle-speclist li').length;
		$('#battleroom .battle-playerlist .ui-label').text(numberofplayers + ' PLAYERS');
		$('#battleroom .battle-speclist .ui-label').text(numberofspecs + ' SPECTATORS');

		$('#battleroom #battle-main-info .players').text(numberofplayers);
		$('#battleroom #battle-main-info .spectatorCount').text(numberofspecs);

		var battlesize = 'normal';
		if (numberofplayers > 16) {
			battlesize = 'huge';
		} else if (numberofplayers > 14) {
			battlesize = 'verybig';
		} else if (numberofplayers > 12) {
			battlesize = 'big';
		}
		$('#battleroom').data('battlesize', battlesize);
		$('#battleroom').attr('data-battlesize', battlesize);

		// update script
		if ($('.battle-playerlist li[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
			this.reorderplayer(username, newStatus.ally);
		}
	}

	reorderplayer(username, ally) {
		if (ally > 0 && ally != '' && username != '') {
			var user = $('#battleroom .battle-players li[data-username="' + jQuery.escapeSelector(username) + '"]');
			var team = user.children('.team').text();
			user.css('order', team);

			var teamgroup = '<div class="team-group" data-label="TEAM' + ally + '" style="order:' + ally + ';"></div>';
			if (!$('#battleroom .team-group[data-label="TEAM' + ally + '"]').length && ally != '') {
				$('#battleroom .battle-playerlist').append(teamgroup);
			}

			//replace under team-group
			if ($('#battleroom .team-group[data-label="TEAM' + ally + '"]').length) {
				var tmp = $('#battleroom .battle-playerlist li[data-username="' + jQuery.escapeSelector(username) + '"]');
				$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
				$('#battleroom .team-group[data-label="TEAM' + ally + '"]').append(tmp);
			}

			var seen = false;
			$('#battleroom .battle-players li[data-username="' + jQuery.escapeSelector(username) + '"]').each(function() {
				if (seen) $(this).remove();
				else seen = true;
			});
		} else {
			//var ts = user.children('.trueskill').text();
			//$('.battle-speclist li[data-username="'+jQuery.escapeSelector(username)+'"]').css('order', ts);
		}

		$('.team-group:empty').remove();
	}
}

jQuery.expr[':'].Contains = function(a, i, m) {
	return (
		jQuery(a)
			.text()
			.toUpperCase()
			.indexOf(m[3].toUpperCase()) >= 0
	);
};

// Overwrites old selecor
jQuery.expr[':'].contains = function(a, i, m) {
	return (
		jQuery(a)
			.text()
			.toUpperCase()
			.indexOf(m[3].toUpperCase()) >= 0
	);
};

function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}

function bin2dec(bin) {
	return parseInt(bin, 2);
}

function reverseString(str) {
	return str
		.split('')
		.reverse()
		.join('');
}
