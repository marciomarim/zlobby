var spawn = require('child_process').spawn,
	fs = require('fs'),
	https = require('https'),
	Jimp = require('jimp');

import { socketClient } from './socket.js';

import Utils from './utils.js';
let utils = new Utils();

const Store = require('electron-store');
const store = new Store();

const crypto = require('crypto');
const { ipcRenderer } = require('electron');

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

import { trackEvent } from './init.js';

var apiurl = 'https://files.balancedannihilation.com/api.php';
// https://files.balancedannihilation.com/api.php?command=getmapslist
// https://files.balancedannihilation.com/api.php?command=getminimapslist
// https://files.balancedannihilation.com/api.php?command=getimgmap&mapname=duckquestv0.9.sdz&xmax=300&ymax=300&maptype=minimap&keepratio=true
// https://files.balancedannihilation.com/data/mapscontent/deltasiegedry_v3.sd7/maps/BAfiles_metadata/mapinfo.json

export default class Battle {
	constructor() {}

	checkgame() {
		var currentmod = $('#battleroom .gameName')
			.text()
			.toLowerCase();
		var index = currentmod.lastIndexOf(' ');
		var filename = currentmod.substring(0, index).replace(' ', '_') + '-' + currentmod.substring(index).replace(' ', '') + '.sdz';
		var modexist = false;

		if (fs.existsSync(modsdir + filename)) {
			this.checkmap();
		} else {
			var fileurl = remotemodsurl + filename;
			var battle = this;

			// check if file exist first
			$.ajax({
				url: fileurl,
				type: 'HEAD',
				error: function() {
					$('#battleroom .game-download').addClass('downloading');
					$('#battleroom .game-download .download-title').text('Game not found for download.');
					battle.checkmap();
				},
				success: function() {
					battle.downloadgame(fileurl, filename);
				},
			});
		}
	}

	downloadgame(fileurl, filename) {
		$('#battleroom .game-download').addClass('downloading');

		const file = fs.createWriteStream(modsdir + filename);
		https.get(fileurl, function(response) {
			var len = parseInt(response.headers['content-length'], 10);
			var body = '';
			var cur = 0;
			var total = len / 1048576;

			response.pipe(file);

			response.on('data', function(chunk) {
				body += chunk;
				cur += chunk.length;
				var status = ((100.0 * cur) / len).toFixed(2);
				//var statusmb = (cur / 1048576).toFixed(2);
				$('#battleroom .game-download .download-title').text('Downloading game ' + status + '% ' + ' – Total size: ' + total.toFixed(2) + ' Mb');
				$('#battleroom .game-download .progress').css('width', ((100.0 * cur) / len).toFixed(2) + '%');
			});

			response.on('end', function() {
				$('#battleroom .game-download .download-title').text('Downloading game: Completed!');
				$('#battleroom .game-download').removeClass('downloading');
				utils.sendbattlestatus();
				//this.checkmap();
			});

			response.on('error', err => {
				fs.unlink(modsdir + filename);
			});
		});

		// 		ipcRenderer.send('download-game', {
		// 			url: fileurl,
		// 			properties: { directory: modsdir },
		// 		});
		//
		// 		ipcRenderer.on('download-game progress', (event, progress) => {
		// 			if ($('#battleroom .game-download .download-title').text() == 'Game not found for download.') {
		// 				var w = Math.round(progress.percent * 100) + '%';
		// 				$('#battleroom .game-download .download-title').text('Downloading game: ' + w + ' of 100%');
		// 				$('#battleroom .game-download .progress').css('width', w);
		// 			}
		// 		});
		//
		// 		ipcRenderer.on('download-game complete', (event, progress) => {
		// 			if ($('#battleroom .game-download .download-title').text() == 'Game not found for download.') {
		// 				$('#battleroom .game-download .download-title').text('Downloading game: Completed!');
		// 				utils.sendbattlestatus();
		// 				$('#battleroom .game-download').removeClass('downloading');
		// 				this.checkmap();
		// 			}
		// 		});
	}

	checkmap() {
		var currentmap = $('#battleroom .mapname')
			.text()
			.toLowerCase();
		currentmap = currentmap.split(' ').join('_');
		var filename = currentmap + '.sd7';
		var filename2 = currentmap + '.sdz';
		var mapexist = false;

		if (fs.existsSync(mapsdir + filename) || fs.existsSync(mapsdir + filename2)) {
			//console.log('Map exist');
			utils.sendbattlestatus();
		} else {
			var fileurl = remotemapsurl + filename;
			var fileurl2 = remotemapsurl + filename2;
			//console.log('Need need download! ' + fileurl);
			var battle = this;

			// check if file exist first
			$.ajax({
				url: fileurl,
				type: 'HEAD',
				error: function() {
					$.ajax({
						url: fileurl2,
						type: 'HEAD',
						error: function() {
							$('#battleroom .map-download').addClass('downloading');
							$('#battleroom .map-download .download-title').text('Map not found for download.');
						},
						success: function() {
							//console.log(fileurl2 + ' exist!');
							battle.downloadmap(fileurl2, filename2);
						},
					});
				},
				success: function() {
					battle.downloadmap(fileurl, filename);
				},
			});
		}
	}

	downloadmap(fileurl, filename) {
		$('#battleroom .map-download').addClass('downloading');
		const file = fs.createWriteStream(mapsdir + filename);
		https.get(fileurl, function(response) {
			response.pipe(file);

			var len = parseInt(response.headers['content-length'], 10);
			var body = '';
			var cur = 0;
			var total = len / 1048576;

			response.on('data', function(chunk) {
				body += chunk;
				cur += chunk.length;
				var status = ((100.0 * cur) / len).toFixed(2);
				$('#battleroom .map-download .download-title').text('Downloading map ' + status + '% ' + ' – Total size: ' + total.toFixed(2) + ' Mb');
				$('#battleroom .map-download .progress').css('width', ((100.0 * cur) / len).toFixed(2) + '%');
			});

			response.on('end', function() {
				$('#battleroom .map-download .download-title').text('Downloading map: Completed!');
				$('#battleroom .map-download').removeClass('downloading');
				utils.sendbattlestatus();
			});

			response.on('error', err => {
				fs.unlink(mapsdir + filename);
			});
		});

		// 		ipcRenderer.send('download-map', {
		// 			url: fileurl,
		// 			properties: { directory: mapsdir },
		// 		});
		//
		// 		ipcRenderer.on('download-map progress', async (event, progress) => {
		// 			$('#battleroom .map-download').addClass('downloading');
		// 			var w = Math.round(progress.percent * 100) + '%';
		// 			$('#battleroom .map-download .download-title').text('Downloading map: ' + w + ' of 100%');
		// 			$('#battleroom .map-download .progress').css('width', w);
		// 		});
		//
		// 		ipcRenderer.on('download-map complete', (event, progress) => {
		// 			$('#battleroom .map-download .download-title').text('Downloading map: Completed!');
		// 			utils.sendbattlestatus();
		//
		// 			setTimeout(function() {
		// 				$('#battleroom .map-download').removeClass('downloading');
		// 			}, 4000);
		// 		});
	}

	createbattleroom() {
		$('#battleroom').empty();
		var battlediv = $('#battleroomtemplate')
			.contents()
			.clone();
		$('#battleroom').append(battlediv);

		this.loadbattleprefs();
	}

	loadbattleprefs() {
		var preferedfaction = store.get('user.faction');
		if (preferedfaction == 0) {
			$('.pickarm').removeClass('active');
			$('.pickcore').addClass('active');
		}

		var showhostmessages = store.get('user.showhostmessages');
		if (showhostmessages == 0) {
			$('.showhostmessages').prop('checked', false);
		} else {
			$('.showhostmessages').prop('checked', true);
		}

		var autoscrollbattle = store.get('user.autoscrollbattle');
		if (autoscrollbattle == 0) {
			$('.autoscrollbattle').prop('checked', false);
		} else {
			$('.autoscrollbattle').prop('checked', true);
		}

		var mutebattleroom = store.get('user.mutebattleroom');
		if (mutebattleroom == 0 || mutebattleroom == undefined) {
			$('.mutebattleroom').prop('checked', false);
			var sound = document.getElementById('messagesound');
			sound.volume = 1;
			var ring = document.getElementById('ringsound');
			ring.volume = 1;
		} else {
			var sound = document.getElementById('messagesound');
			sound.volume = 0;
			var ring = document.getElementById('ringsound');
			ring.volume = 0;
			$('.mutebattleroom').prop('checked', true);
		}

		var mycolor = store.get('user.mycolor');
		if (mycolor) {
			$('#battleroom .colorpicked').css('background-color', mycolor);
			//$('.colorpicker').acp('color', mycolor);
		}
	}

	get_map_info(battleid) {
		var battles = this;
		var mapname = $('.battle-card[data-battleid="' + battleid + '"] .mapname').text();
		var mapfilenamebase = mapname
			.toLowerCase()
			.split(' ')
			.join('_');
		var url1 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilenamebase + '.sd7/maps/BAfiles_metadata/mapinfo.json';
		var url2 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilenamebase + '.sdz/maps/BAfiles_metadata/mapinfo.json';

		try {
			$.getJSON(url1, function(mapinfo) {
				var filename = mapfilenamebase + '.sd7';
				battles.load_map_images(battleid, mapinfo, filename, mapfilenamebase);
			}).fail(function() {
				try {
					$.getJSON(url2, function(mapinfo) {
						var filename = mapfilenamebase + '.sdz';
						battles.load_map_images(battleid, mapinfo, filename, mapfilenamebase);
					}).fail(function() {
						var filename = mapfilenamebase + '.sd7'; // tmp
						battles.load_map_images(battleid, null, filename, mapfilenamebase);
					});
				} catch (e) {}
			});
		} catch (e) {}
	}

	load_map_images(battleid, mapinfo, filename, mapfilenamebase) {
		var battles = this;
		var localmap = minimapsdir + mapfilenamebase + '.jpg';
		var localmmap = minimapsdir + mapfilenamebase + '-metalmap.jpg';
		var localhmap = minimapsdir + mapfilenamebase + '-heightmap.jpg';
		var localmapok = true;

		// check if minimaps were saved and not empty
		if (fs.existsSync(localmap)) {
			var mapstats = fs.statSync(localmap);
			if (mapstats['size'] <= 0) {
				localmapok = false;
			} else {
				if (fs.existsSync(localmmap)) {
					var mmapstats = fs.statSync(localmmap);
					if (mmapstats['size'] <= 0) {
						localmapok = false;
					} else {
						if (fs.existsSync(localhmap)) {
							var hmapstats = fs.statSync(localhmap);
							if (hmapstats['size'] <= 0) {
								localmapok = false;
							}
						}
					}
				}
			}
		} else {
			localmapok = false;
		}

		if (localmapok) {
			console.log('Local minimap found:' + filename);
			battles.appendimagedivs(battleid, mapinfo, localmap, localmmap, localhmap);
		} else {
			console.log('Saving remote minimaps:' + filename);
			//&xmax=1000&ymax=1000
			var urlmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=minimap&mapname=' + filename;
			var urlmmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=metalmap&mapname=' + filename;
			var urlhmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=heightmap&mapname=' + filename;

			var sizeinfos = mapinfo['sizeinfos'];
			var w = sizeinfos['width'],
				h = sizeinfos['height'];

			Jimp.read(urlmap).then(image => {
				// Do stuff with the image.
				image
					.resize(w, h)
					.quality(70)
					.write(localmap, function() {
						battles.appendimagedivs(battleid, mapinfo, localmap, localmmap, localhmap);
					});
			});

			Jimp.read(urlmmap).then(image => {
				image
					.resize(w, h)
					.quality(70)
					.write(localmmap);
			});
			Jimp.read(urlhmap).then(image => {
				image
					.resize(w, h)
					.quality(70)
					.write(localhmap);
			});
		}
	}

	appendimagedivs(battleid, mapinfo, localmap, localmmap, localhmap) {
		var battles = this;

		var sizeinfos = mapinfo['sizeinfos'];
		var w = sizeinfos['width'],
			h = sizeinfos['height'],
			xsmu = sizeinfos['xsmu'],
			ysmu = sizeinfos['ysmu'],
			Description = sizeinfos['Description'],
			fulltilewidth = sizeinfos['fulltilewidth'],
			fulltileheight = sizeinfos['fulltileheight'];

		var ratio = w / h;
		var maxwh = 220;

		if (w > h) {
			var map = '<img class="map" src="' + localmap + '" width="220" height="' + maxwh / ratio + '">';
		} else if (w == h) {
			var map = '<img class="map" src="' + localmap + '" width="220" height="220">';
		} else {
			var map = '<img class="map" src="' + localmap + '" width="' + maxwh * ratio + '" height="220">';
		}
		$('.battle-card[data-battleid="' + battleid + '"] .minimap').html(map);

		// if I'm on a battleroom, load metal and height maps
		if ($('#battleroom').data('battleid') == battleid) {
			var mapmap = '<img class="map" src="' + localmap + '">';
			var metalmap = '<img class="map" src="' + localmmap + '">';
			var heightmap = '<img class="map" src="' + localhmap + '">';

			$('#battleroom #battle-minimap').html(mapmap);
			$('#battleroom #battle-metalmap').html(metalmap);
			$('#battleroom #battle-heightmap').html(heightmap);

			var divwidth = $('#battleroom .minimaps').width();
			var ratiodiv = divwidth / 400;

			if (ratio > ratiodiv) {
				$('#battleroom .minimaps').css('height', divwidth / ratio);
			} else {
				$('#battleroom .minimaps').css('height', '400px');
				$('#battleroom .minimaps').css('width', ratio * 400 + 'px');
			}

			var teamlist = mapinfo['teamslist'];
			if (teamlist.length) {
				// clear old points
				$('.minimaps .startpos').remove();
				teamlist.forEach(async function(item) {
					//console.log(item);
					//console.log(fulltilewidth);
					//console.log(fulltileheight);

					var xrel = (item['StartPosX'] / fulltilewidth) * 100;
					var yrel = (item['StartPosZ'] / fulltileheight) * 100;
					var teamnum = item['teamnum'] + 1;
					var point = '<div class="startpos" style="top:' + yrel + '%; left:' + xrel + '%;">' + teamnum + '</div>';
					$('#battleroom .minimaps').append(point);
				});
			}
		}
	}

	addstartrect(allyNo, left, top, right, bottom) {
		var width = right / 2 - left / 2;
		var height = bottom / 2 - top / 2;
		$('.startbox.box' + allyNo).remove();
		var startbox = '<div class="startbox box' + allyNo + '" style="left:' + left / 2 + '%; top:' + top / 2 + '%; width:' + width + '%; height:' + height + '%;"></div>';
		$('#battleroom .minimaps').append(startbox);
	}

	removestartrect(allyNo) {
		$('.startbox.box' + allyNo).remove();
	}

	loadmapspickmap() {
		fs.readdir(mapsdir, (err, files) => {
			files.forEach(file => {
				if (file.indexOf('sd7') || file.indexOf('sdz')) {
					var mapfilenamebase = file.replace('.sd7', '').replace('.sdz', '');
					var localmap = minimapsdir + mapfilenamebase + '.jpg';

					if (fs.existsSync(localmap)) {
						var imgdiv = '<img src="' + localmap + '">';
						var stared = store.get('maps.' + mapfilenamebase);

						if (stared == 1) {
							var div = '<div class="map" data-mapname="' + mapfilenamebase + '" style="order: -1;"><div class="icon icon-star active" data-filename="' + file + '"></div><div class="delete" data-filename="' + file + '">DELETE</div><div class="select" data-mapname="' + mapfilenamebase + '">SELECT</div>' + imgdiv + '</div>';
						} else {
							var div = '<div class="map" data-mapname="' + mapfilenamebase + '"><div class="icon icon-star" data-filename="' + file + '"></div><div class="delete" data-filename="' + file + '">DELETE</div><div class="select" data-mapname="' + mapfilenamebase + '">SELECT</div>' + imgdiv + '</div>';
						}

						$('.local.mapscontainer').append(div);
					}
				}
			});
		});
	}

	loadremotemapspickmap() {
		$.getJSON('https://files.balancedannihilation.com/api.php?command=getmapslist', function(data) {
			var div = '';
			data = data['mapslist'];
			$.each(data, function(key, val) {
				var filename = val['filename'];
				var mapfilenamebase = filename.replace('.sd7', '').replace('.sdz', '');

				var jsonurl = 'https://files.balancedannihilation.com/data/mapscontent/' + filename + '/maps/BAfiles_metadata/mapinfo.json';

				$.getJSON(jsonurl, function(mapinfo) {
					var sizeinfos = mapinfo['sizeinfos'];
					var w = sizeinfos['width'],
						h = sizeinfos['height'];
					var ratio = w / h;
					var maxwh = $('.mapscontainer').width() * 0.23;

					var urlmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=minimap&mapname=' + filename;

					// map is wider
					if (w > h) {
						var imgdiv = '<img src="' + urlmap + '" width="' + maxwh + '" height="' + maxwh / ratio + '">';
					} else if (w == h) {
						var imgdiv = '<img src="' + urlmap + '" width="' + maxwh + '" height="' + maxwh + '">';
					} else {
						var imgdiv = '<img src="' + urlmap + '" width="' + maxwh * ratio + '" height="' + maxwh + '">';
					}
					var div = '<div class="map" data-mapname="' + mapfilenamebase + '"></div><div class="downloadremotemap" data-filename="' + filename + '">GET</div><div class="select" data-mapname="' + mapfilenamebase + '">SELECT</div>' + imgdiv + '</div>';

					$('.remote.mapscontainer').append(div);
				});
			});
		});
	}

	openbattle(cmd, parts) {
		var sentences = cmd.split('\t');
		parts = sentences[0].split(' ');
		var battleid = parts[1];

		if ($('.battle-card[data-battleid="' + battleid + '"]').length) {
			this.closebattle(battleid);
		}
		//var type = parts[2];
		//var natType = parts[3];
		var username = parts[4];
		var ip = parts[5];
		var port = parts[6];
		var maxPlayers = parts[7];
		var passworded = parts[8] > 0;
		var rank = parts[9];
		var maphash = parts[10];

		if (sentences.length == 3) {
			var mapname = parts.slice(11).join(' ');
			var title = sentences[1].split(')').slice(1);
			var gameName = sentences[2];
			var engine = sentences[1].slice(sentences[1].indexOf('(') + 1, sentences[1].indexOf(')'));
		} else {
			var mapname = sentences[2];
			var title = sentences[3];
			var gameName = sentences[4];
			var engine = sentences[1];
		}

		var battlediv = '<div class="header">';

		battlediv += '<div class="infos">';

		battlediv += '<div class="meta">';
		battlediv += '<div class="battleid">' + battleid + '</div>';
		battlediv += '<div class="status icon icon-user battle"></div>';
		if (passworded) {
			battlediv += '<div class="locked">️LOCKED</div>';
		} else {
			battlediv += '<div class="locked">OPEN</div>';
		}

		battlediv += '<div class="players icon icon-ingame">0</div>';
		battlediv += '<div class="spectatorCount icon icon-spec">0</div>';
		battlediv += '<div class="nUsers" style="display:none;">1</div>';
		battlediv += '<div class="maxPlayers">' + maxPlayers + '<span class="upper">MAX</span></div>';
		//battlediv += '<div class="passworded icon icon-locked '+passworded+'"></div>';
		battlediv += '<div class="ip">' + ip + '</div>';
		battlediv += '<div class="port">' + port + '</div>';
		battlediv += '<div class="maphash">' + maphash + '</div>';
		battlediv += '<div class="rank icon icon-rank' + rank + '"></div>';
		battlediv += '</div>';
		battlediv += '<div class="battletitle">' + title + '</div>';
		battlediv += '<div class="meta2">';
		battlediv += '<div class="gameName icon icon-mod">' + gameName + '</div>';
		battlediv += '<div class="mapname">' + mapname + '</div>';
		battlediv += '<div class="username founder icon icon-bot">' + username + '</div>';
		battlediv += '<div class="engine">' + engine + '</div>';
		battlediv += '</div>';
		battlediv += '</div>';
		battlediv += '<div class="minimap"></div>';
		battlediv += '</div>';
		battlediv += '<div class="playerlist"></div>';

		$('#battle-list').append('<div class="battle-card" data-battleid="' + battleid + '" data-founder="' + username + '">' + battlediv + '</div>');

		$('.tab.battlelist .count').text($('.battle-card').length);
	}

	closebattle(battleid) {
		$('.battle-card[data-battleid="' + battleid + '"]').remove();
		$('.tab.battlelist .count').text($('.battle-card').length);
	}

	updatebattleinfo(battleid, spectatorCount, locked, maphash, mapname) {
		var currentmapname = $('.battle-card[data-battleid="' + battleid + '"] .mapname').text();
		$('.battle-card[data-battleid="' + battleid + '"] .mapname').text(mapname);

		// check if map changed
		if (mapname != currentmapname || $('.battle-card[data-battleid="' + battleid + '"] .minimap').is(':empty')) {
			// check if it's battleroom
			if ($('#battleroom .battleid').text() == battleid) {
				$('.startbox').remove();
			}
		}
		//this.load_remote_map_image(battleid);
		this.get_map_info(battleid);

		$('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(spectatorCount);

		if (locked === 0) {
			$('.battle-card[data-battleid="' + battleid + '"] .locked').text('LOCKED');
		} else {
			$('.battle-card[data-battleid="' + battleid + '"] .locked').text('OPEN');
		}

		var nUsers = parseInt($('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(), 10);
		var players = nUsers - spectatorCount;
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);

		// update options
		if ($('#battleroom .battleid').text() == battleid) {
			$('#battleroom .spectatorCount').text(spectatorCount);
			$('#battleroom .mapname').text(mapname);

			if (locked === 0) {
				$('#battleroom .locked').text('LOCKED');
			} else {
				$('#battleroom .locked').text('OPEN');
			}
			$('#battleroom .players').text(players);

			//download map if doesnt have it
			var status = utils.getsyncstatus();
			if (!status) {
				// send unsync
				utils.sendbattlestatus();

				// download what is missing
				this.checkmap();
			}
		}
	}

	// when I join a battle and get a confirmation
	joinbattle(battleid, hashCode, channelName) {
		this.createbattleroom();
		$('#battleroom').data('battleid', battleid);
		$('body').addClass('inbattleroom');
		$('.battle-card[data-battleid="' + battleid + '"]').addClass('activebattle');

		$('.rcontainer, .tab').removeClass('active');
		$('.container').removeClass('active');
		$('#battleroom, .tab.battleroom').addClass('active');
		$('#battleroom input.chat').data('battleid', battleid);
		$('.tab.battleroom .status').addClass('active');

		$('#battleroom .title').text($('.battle-card[data-battleid="' + battleid + '"] .battletitle').text());

		//$('#battleroom #battle-minimap').html($('.battle-card[data-battleid="'+battleid+'"] .map').clone());

		var meta = $('.battle-card[data-battleid="' + battleid + '"] .meta').clone();
		$('#battleroom .battle-main-info').append(meta);
		$('#battleroom .battle-main-info .meta .battleid').after('<div class="hashCode">' + hashCode + '</div>');
		$('#battleroom .battle-main-info .meta .battleid').after('<div class="channelName">' + channelName + '</div>');

		var meta = $('.battle-card[data-battleid="' + battleid + '"] .meta2').clone();
		$('#battleroom .battle-main-info').append(meta);

		//add host to playerlist
		var hostname = $('.battle-card[data-battleid="' + battleid + '"] .founder').text();
		var host = $('#chat-list li[data-username="' + hostname + '"]').clone();
		$('#battleroom .battle-playerlist').append(host);

		//add users to battle
		var players = $('.battle-card[data-battleid="' + battleid + '"] .playerlist')
			.contents()
			.clone();
		$('#battleroom .battle-playerlist').append(players);

		AColorPicker.from('#battleroom .colorpicker').on('change', (picker, color) => {
			$('#battleroom .colorpicked').css('background-color', color);
			store.set('user.mycolor', color);
		});
		//AColorPicker.setColor("#5588ff", true);

		//this.load_remote_map_image(battleid);
		this.get_map_info(battleid);

		//check if game exist
		// after game, check if map exist
		this.checkgame();
		this.checkmap();
		utils.init_battlerrom_chat();
		trackEvent('User', 'joinbattle');
	}

	// when anyone joins a battle
	joinedbattle(battleid, username) {
		var nUsers = parseInt($('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(), 10) + 1;
		$('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(nUsers);

		var spectatorCount = parseInt($('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(), 10);
		var players = nUsers - spectatorCount;
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);
		$('.battle-card[data-battleid="' + battleid + '"]').css('order', -players);

		//update chatlist
		$('li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').addClass('battle');

		// append user to bnattle-card
		var user = $('#chat-list li[data-username="' + jQuery.escapeSelector(username) + '"]').clone();
		$('.battle-card[data-battleid="' + battleid + '"] .playerlist').append(user);

		if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {
			$('#battleroom .players').text(players);
			$('#battleroom .spectatorCount').text(spectatorCount);
			var user = $('#chat-list li[data-username="' + jQuery.escapeSelector(username) + '"]').clone();
			$('#battleroom .battle-playerlist').append(user);
		}
	}

	leftbattle(battleid, username) {
		var nUsers = parseInt($('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(), 10) - 1;
		$('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(nUsers);

		var spectatorCount = parseInt($('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(), 10);
		var players = nUsers - spectatorCount;
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);
		$('.battle-card[data-battleid="' + battleid + '"]').css('order', -players);

		//update chatlist
		$('li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').removeClass('battle');

		// remove user from bnattle-card
		$('.battle-card li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();

		// if user is in my battle
		if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
		}

		// if i am leaving
		if (username == $('#myusername').text()) {
			$('.tab.battleroom .status').removeClass('active');
			$('.container').removeClass('active');
			$('#battlelist').addClass('active');

			$('#battleroom').empty();

			$('body').removeClass('inbattleroom');
			$('.activebattle').removeClass('activebattle');
		}
	}

	// when client get kicked
	got_kicked() {
		$('.tab.battleroom .status').removeClass('active');
		$('.container').removeClass('active');
		$('#battlelist').addClass('active');

		$('#battleroom').empty();

		$('body').removeClass('inbattleroom');
		$('.activebattle').removeClass('activebattle');
	}

	setscripttags(parts) {
		var battles = this;

		var scriptTags = parts
			.slice(1)
			.join(' ')
			.split('\t');

		$.each(scriptTags, function(index, value) {
			var scriptTag = value.split('=');
			var val = scriptTag[1];

			var tag = scriptTag[0];
			var parts = tag.split('/');

			if (parts[0] == 'game') {
				if (parts[1] == 'players') {
					var username = parts[2];
					if (parts[3] == 'skill') {
						val = val
							.replace('#', '')
							.replace('#', '')
							.replace('(', '')
							.replace(')', '');
						$('.battle-players li:contains(' + username + ') .trueskill').text(val);
					}
				} else if (parts[1] == 'modoptions') {
					var div = '<div class="option ' + parts[2] + '">';
					div += '<div class="name">' + parts[2] + '</div>';
					div += '<div class="val">' + val + '</div>';
					div += '</div>';

					$('#battleroom .modoptions').append(div);
				} else if (parts[1] == 'mapoptions') {
					var div = '<div class="option ' + parts[2] + '">';
					div += '<div class="name">' + parts[2] + '</div>';
					div += '<div class="val">' + val + '</div>';
					div += '</div>';

					$('#battleroom .mapoptions').append(div);
				} else if (parts[0] == 'game') {
					if (parts[1] == 'startpostype') {
						if (val == 0) {
							val = 'fixed';
							$('#battleroom .minimaps').addClass('fixed');
						} else if (val == 1) {
							val = 'random';
							$('#battleroom .minimaps').addClass('random');
						} else if (val == 2) {
							val = 'choose_ingame';
							$('#battleroom .minimaps').addClass('choose_ingame');
						} else if (val == 3) {
							val = 'choose_before';
							$('#battleroom .minimaps').addClass('choose_before');
						}
					}

					var div = '<div class="option ' + parts[1] + '">';
					div += '<div class="name">' + parts[1] + '</div>';
					div += '<div class="val">' + val + '</div>';
					div += '</div>';

					$('#battleroom .gameoptions').append(div);
				} else {
					var div = '<div class="option ' + tag + '">';
					div += '<div class="name">' + tag + '</div>';
					div += '<div class="val">' + val + '</div>';
					div += '</div>';

					$('#battleroom .otheroptions').append(div);
				}
			}

			if (parts[2] == 'mo_ffa' && val == '1') {
				$('#battleroom')
					.removeClass('teams')
					.addClass('ffa');
				$('#battleroom .gametype').text('FFA');
			} else if (parts[2] == 'mo_ffa' && val == '0') {
				$('#battleroom .ffatype').text('');
				$('#battleroom')
					.removeClass('ffa')
					.addClass('teams');
				var numplayers = $('.battle-playerlist li').length;

				if (numplayers <= 2) {
					$('#battleroom .gametype').text('1v1');
				} else if (numplayers > 2) {
					$('#battleroom .gametype').text('TEAMS');
				}
			}

			if (parts[2] == 'anon_ffa' && val == '1') {
				$('#battleroom .ffatype').text('ANON');
			} else if (parts[2] == 'anon_ffa' && val == '0') {
				$('#battleroom .ffatype').text('');
			}
		});

		// copy game info, it could be done in joinbattle maybe
	}

	startasplayer() {
		var username = $('#myusername').text();

		var teams = [];
		var allys = [];

		var numplayers = $('.battle-playerlist li').length() + $('.battle-speclist li').length();
		//var numusers = numplayers+ $('.battle-speclist li').length();

		var script = '[GAME]\n{\n\t';
		script +=
			'gametype=Balanced Annihilation V11.0.0;\n\t' +
			'HostIP=' +
			$('.battle-main-info .ip').text() +
			';\n\t' +
			'HostPort=' +
			$('.battle-main-info .port').text() +
			';\n\t' +
			'IsHost=0;\n\t' +
			'MapHash=' +
			$('.battle-main-info .maphash').text() +
			';\n\t' +
			'MapName=' +
			$('.battle-main-info .mapname').text() +
			';\n\t' +
			'ModHash=2610892527;\n\t' +
			'MyPlayerName=' +
			username +
			';\n\t' +
			'numplayers=' +
			numplayers +
			';\n\t' +
			//'numrestrictions=0;\n\t'+
			//'numusers='+numusers+';\n\t'+
			'MyPasswd=' +
			this.generatePassword(username) +
			';\n\t' +
			'StartPosType=' +
			$('.gameoptions .startPosType')
				.closest('.val')
				.text() +
			';\n' +
			'}\n';

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

		$('.battle-speclist li').each(function(index) {
			//var team = $(this).children('team').text();
			//var ally = $(this).children('ally').text();
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
				'Team=0;\n\t' +
				'Spectator=1;\n' +
				'}\n';
			playercount += 1;
		});

		script += '[mapoptions]\n{\n\t';
		$('.mapoptions .option').each(function(index) {
			var name = $(this)
				.children('.name')
				.text();
			var val = $(this)
				.children('.val')
				.text();
			script += name + '=' + val + ';\n\t';
		});

		script += '}\n[modoptions]\n{\n\t';
		$('.modoptions').each(function(index) {
			var name = $(this)
				.children('.name')
				.text();
			var val = $(this)
				.children('.val')
				.text();
			script += name + '=' + val + ';\n\t';
		});
		script += '}\n';

		try {
			fs.writeFileSync(scriptfile, script, 'utf-8');
		} catch (e) {
			alert('Failed to save the script file!');
		}

		try {
			if (fs.existsSync(infologfile)) {
				//file exists
				fs.unlinkSync(infologfile);
			}
		} catch (e) {}

		// start recording logs
		var out = fs.openSync(infologfile, 'a');
		var err = fs.openSync(infologfile, 'a');

		const bat = spawn(enginepath, [scriptfile], {
			detached: true,
			stdio: ['ignore', out, err],
		});

		bat.unref();

		bat.on('close', code => {
			var command = 'MYSTATUS ' + 0 + '\n';
			socketClient.write(command);
		});
	}

	launchgame() {
		var username = $('#myusername').text();

		var script = '[GAME]\n{\n\t';
		script += 'HostIP=' + $('.battle-main-info .ip').text() + ';\n\t' + 'HostPort=' + $('.battle-main-info .port').text() + ';\n\t' + 'IsHost=0;\n\t' + 'MyPlayerName=' + username + ';\n\t' + 'MyPasswd=' + this.generatePassword(username) + ';\n' + '}\n';

		try {
			fs.writeFileSync(scriptfile, script, 'utf-8');
		} catch (e) {
			alert('Failed to save the script file!');
			console.log(e);
		}

		// 		try {
		// 			fs.unlinkSync(infologfile);
		// 		} catch (e) {}
		//
		// 		// start recording logs
		// 		var out = fs.openSync(infologfile, 'a');
		// 		var err = fs.openSync(infologfile, 'a');

		const bat = spawn(enginepath, [scriptfile], {
			detached: true,
			stdio: 'ignore',
		});

		bat.unref();

		bat.on('close', code => {
			var command = 'MYSTATUS ' + 0 + '\n';
			socketClient.write(command);
		});
	}

	generatePassword(username) {
		//var passwd = $.MD5(username);
		//crypto.createHash('md5').update(data).digest("hex");
		var passwd = crypto
			.createHash('md5')
			.update(username)
			.digest('hex');
		return passwd.substring(0, 12);
	}
}
