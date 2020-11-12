import { socketClient } from './socket.js';

import Utils from './utils.js';
let utils = new Utils();

var spawn = require('child_process').spawn,
	fs = require('fs');

const Store = require('electron-store');
const store = new Store();

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

$('body').on('click', '#singleplayer .smallnav .navbtn', function(e) {
	$('.smallnav .navbtn, .smalltab').removeClass('active');
	$(this).addClass('active');

	var target = '#' + $(this).data('target');
	$(target).addClass('active');
});

// load mods
if (fs.existsSync(modsdir)) {
	fs.readdir(modsdir, (err, files) => {
		var count = 1;
		files.forEach(file => {
			if (!file.startsWith('.')) {
				if (file.indexOf('sd7') || file.indexOf('sdz')) {
					var modfilenamebase = file.replace('.sd7', '').replace('.sdz', '');
					var moddiv = '<option value="' + modfilenamebase + '">' + modfilenamebase + '</option>';
					$('#spickmod').append(moddiv);
				}
			}
		});
	});
}

if (fs.existsSync(mapsdir)) {
	fs.readdir(mapsdir, (err, files) => {
		files.forEach(file => {
			if (file.indexOf('sd7') || file.indexOf('sdz')) {
				var mapfilenamebase = file.replace('.sd7', '').replace('.sdz', '');
				var localmap = minimapsdir + mapfilenamebase + '.jpg';

				if (fs.existsSync(localmap)) {
					var imgdiv = '<img src="' + localmap + '">';
					var stared = store.get('maps.' + mapfilenamebase);

					if (stared == 1) {
						var div = '<div class="map smap" data-mapname="' + mapfilenamebase + '" style="order: -1;"><div class="icon icon-star active" data-filename="' + file + '"></div><div class="delete" data-filename="' + file + '">DELETE</div><div class="select" data-mapname="' + mapfilenamebase + '">SELECT</div>' + imgdiv + '</div>';
					} else {
						var div = '<div class="map smap" data-mapname="' + mapfilenamebase + '"><div class="icon icon-star" data-filename="' + file + '"></div><div class="delete" data-filename="' + file + '">DELETE</div><div class="select" data-mapname="' + mapfilenamebase + '">SELECT</div>' + imgdiv + '</div>';
					}

					$('.smapscontainer').append(div);
				}
			}
		});
	});
}

$('body').on('click', '.smap', function(e) {
	if (!$(this).hasClass('active')) {
		$('.smap').removeClass('active');
		$(this).addClass('active');
		$('#singleplayer .minimaps').css('width', '100%');

		var mapname = $(this).data('mapname');
		var localmap = minimapsdir + mapname + '.jpg';
		var localmmap = minimapsdir + mapname + '-metalmap.jpg';
		var localhmap = minimapsdir + mapname + '-heightmap.jpg';

		if (fs.existsSync(localmap)) {
			var mapmap = '<img class="map" src="' + localmap + '">';
			var metalmap = '<img class="map" src="' + localmmap + '">';
			var heightmap = '<img class="map" src="' + localhmap + '">';

			$('#singleplayer-minimap').html(mapmap);
			$('#singleplayer-metalmap').html(metalmap);
			$('#singleplayer-heightmap').html(heightmap);

			var mw = $('#singleplayer-minimap img').width();
			var mh = $('#singleplayer-minimap img').height();

			setTimeout(function() {
				$('#singleplayer .minimaps').css('width', mw);
				$('#singleplayer .smallnav').css('width', mw);
			}, 1000);

			//$('#singleplayer-metalmap img').css('height', mh);
		}
	}
});

$('body').on('click', '.startsinglebattle', function(e) {
	var username = $('#myusername').text();

	var teams = [];
	var allys = [];

	var numplayers = 1;

	var script = '[GAME]\n{\n\t';
	script += 'gametype=Balanced Annihilation V11.0.2;\n\t' + 'IsHost=1;\n\t' + 'MapName=' + $('.smap.active').data('mapname') + ';\n\t' + 'MyPlayerName=' + username + ';\n\t' + 'numplayers=' + numplayers + ';\n\t';

	var playercount = 0;
	$('.battle-playerlist li').each(function(index) {
		var team = $(this)
			.children('.team')
			.text();
		var ally = $(this)
			.children('.ally')
			.text();
		var faction = 'ARM';
		if ($(this).children('.icon-core').length) {
			faction = 'CORE';
		}
		if (allys.indexOf(ally) === -1) {
			allys.push(ally);
		}
		script +=
			'[PLAYER' +
			playercount +
			']\n' +
			'{\n\t' +
			'Name=' +
			$(this)
				.children('.name')
				.text() +
			';\n\t' +
			'Team=' +
			team +
			';\n\t' +
			'Spectator=0;\n' +
			'}\n';

		script += '[TEAM' + playercount + ']\n' + '{\n\t' + 'Teamleader=' + playercount + ';\n\t' + 'Allyteam=' + ally + ';\n\t' + 'Side=' + faction + ';\n\t' + '}\n';
		playercount += 1;
	});

	$.each(allys, function(index, value) {
		script += '[ALLYTEAM' + index + ']\n' + '{\n\t' + 'NumAllies=' + $('.battle-playerlist li .ally:contains(' + value + ')').length + ';\n\t' + '}\n';
	});

	// 	script += '[mapoptions]\n{\n\t';
	// 	$('.mapoptions .option').each(function(index) {
	// 		var name = $(this)
	// 			.children('.name')
	// 			.text();
	// 		var val = $(this)
	// 			.children('.val')
	// 			.text();
	// 		script += name + '=' + val + ';\n\t';
	// 	});
	//
	// 	script += '}\n[modoptions]\n{\n\t';
	// 	$('.modoptions').each(function(index) {
	// 		var name = $(this)
	// 			.children('.name')
	// 			.text();
	// 		var val = $(this)
	// 			.children('.val')
	// 			.text();
	// 		script += name + '=' + val + ';\n\t';
	// 	});
	script += '}\n';

	// try {
	// 	fs.writeFileSync(scriptfile, script, 'utf-8');
	// } catch (e) {
	// 	alert('Failed to save the script file!');
	// }

	var scriptfile = springdir + 's-script.txt';
	var enginepath = store.get('paths.enginepath');
	console.log(enginepath);
	const bat = spawn(enginepath, [scriptfile], {
		detached: true,
	});

	bat.unref();
});
