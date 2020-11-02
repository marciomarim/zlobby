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

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

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

$('body').on('click', '#singleplayer .smallnav .navbtn', function(e) {
	$('.smallnav .navbtn, .smalltab').removeClass('active');
	$(this).addClass('active');

	var target = '#' + $(this).data('target');
	$(target).addClass('active');
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
