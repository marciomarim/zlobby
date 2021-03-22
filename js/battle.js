var spawn = require('child_process').spawn,
	fs = require('fs'),
	https = require('https'),
	Jimp = require('jimp');

import { socketClient } from './socket.js';

import Utils from './utils.js';
let utils = new Utils();

const os = require('os');
const platform = os.platform();
const Store = require('electron-store');
const store = new Store();
const log = require('electron-log');
const sevenmin = require('7zip-min');

const crypto = require('crypto');
const { ipcRenderer } = require('electron');

import { springdir, mapsdir, minimapsdir, modsdir, chatlogsdir, infologfile, scriptfile, remotemodsurl, remotemapsurl, remotemapsurl2 } from './init.js';

import { trackEvent } from './init.js';

// var apiurl = 'https://files.balancedannihilation.com/api.php';
// https://files.balancedannihilation.com/api.php?command=getmapslist
// https://files.balancedannihilation.com/api.php?command=getminimapslist
// https://files.balancedannihilation.com/api.php?command=getimgmap&mapname=lost_v2.sdz&maptype=minimap
// https://files.balancedannihilation.com/api.php?command=getimgmap&mapname=duckquestv0.9.sdz&xmax=300&ymax=300&maptype=minimap&keepratio=true
// https://files.balancedannihilation.com/data/mapscontent/deltasiegedry_v3.sd7/maps/BAfiles_metadata/mapinfo.json
// https://files.balancedannihilation.com/data/metadata/talus_v2.sd7/mapinfo.json
//https://files.balancedannihilation.com/data/metadata/talus_v2.sd7/mapinfo.json
//var url1 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilenamebase + '.sd7/maps/BAfiles_metadata/mapinfo.json';
//var url2 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilenamebase + '.sdz/maps/BAfiles_metadata/mapinfo.json';

export default class Battle {
	constructor() {}
	
	checkengine() {
		
		var currentengine = $('#battleroom .engine')
			.text()
			.toLowerCase()
			.split(' ');
		
		var version = currentengine[1];		
		var engineexist = false;
		var battle = this;
		
		if (platform == 'win32') {
			
			var enginefile = springdir + 'engine\\' + version + '\\spring.exe';						
			log.warn(enginefile);
			var filename = 'spring.exe';
			if ( version == '103.0' ){
				var fileurl = 'https://www.springfightclub.com/data/master_103/win64/spring_103.0_win64-minimal-portable.7z';
				var zipfile = springdir + 'engine\\spring_103.0_win64-minimal-portable.7z';
				var unzipfolder = springdir + 'engine\\' + version + '\\'; 
			}else if( version == '105.0' ){
				var fileurl = 'https://www.springfightclub.com/data/105_zips/spring_105.0_win64-minimal-portable.7z';
				var zipfile = springdir + 'engine\\spring_105.0_win64-minimal-portable.7z';
				var unzipfolder = springdir + 'engine\\' + version + '\\'; 
			}
			
		} else if (platform == 'darwin') {
			
			//var enginefile = '/Applications/Spring_' + version + '.app/Contents/MacOS/spring';
			var enginefile = springdir + 'engine/' + version + '/Spring_' + version + '.app/Contents/MacOS/spring';
			
			log.warn(enginefile);
			var filename = 'spring';
			
			if ( version == '103.0' ){
				var fileurl = 'https://www.springfightclub.com/data/master_103/mac/Spring_103.0.app.7z';
				var zipfile = springdir + 'engine/Spring_103.0.app.7z';
				var unzipfolder = springdir + 'engine/' + version + '/'; 
			}else{
				//var fileurl = 'https://www.springfightclub.com/data/105_zips/mac/Spring_105.0.app.7z';
				//var zipfile = springdir + 'engine/Spring_105.0.app.7z';
				//var unzipfolder = springdir + 'engine/' + version + '/';
				var fileurl = 0;								
			}
			
		} else if (platform == 'linux') {
			
			var enginefile = springdir + 'engine/' + version + '/spring';
			log.warn(enginefile);
			var filename = 'spring';
			if ( version == '103.0' ){
				var fileurl = 'https://www.springfightclub.com/data/master_103/linux64/spring_103.0_minimal-portable-linux64-static.7z';
				var zipfile = springdir + 'engine/spring_103.0_minimal-portable-linux64-static.7z';
				var unzipfolder = springdir + 'engine/' + version + '/';
			}else{
				var fileurl = 'https://www.springfightclub.com/data/105_zips/spring_105.0_minimal-portable-linux64-static.7z';
				var zipfile = springdir + 'engine/spring_105.0_minimal-portable-linux64-static.7z';
				var unzipfolder = springdir + 'engine/' + version + '/';								
			}
		
		}
		
		// set engine path
		$('#enginepath').text(enginefile);

		if (fs.existsSync( enginefile )) {
			
			log.warn('Engine found');
			$('#battleroom .engine-download').removeClass('downloading');	
		
		}else if( fs.existsSync( zipfile ) ){
			
			log.warn('Engine unpacking');
			battle.engineunpack(zipfile, unzipfolder);
			
		} else if (fileurl){
			
			log.warn('Engine need download');
			$('#battleroom .engine-download').addClass('downloading');
			$('#battleroom .engine-download .download-title').text('Starting engine download...');
						
			if (platform == 'win32') {
				if (!fs.existsSync(springdir + '\\engine\\')) {
					fs.mkdirSync(springdir + '\\engine\\');
					log.info('Creating engine folder');
				}
				
				if (!fs.existsSync(springdir + '\\engine\\' + version + '\\')) {
					fs.mkdirSync(springdir + '\\engine\\' + version + '\\');
					log.info('Creating engine version folder');
				}												
			}else{
				if (!fs.existsSync(springdir + '/engine/')) {
					fs.mkdirSync(springdir + '/engine/');
					log.info('Creating engine folder');
				}
				
				if (!fs.existsSync(springdir + '/engine/' + version + '/')) {
					fs.mkdirSync(springdir + '/engine/' + version + '/');
					log.info('Creating engine version folder');
				}
				
			}
							
			// check if file exist first
			$.ajax({
				url: fileurl,
				type: 'HEAD',
				error: function() {
					$('#battleroom .engine-download').removeClass('downloading').addClass('failed');
					$('#battleroom .engine-download .download-title').text('Engine not found for download.');					
				},
				success: function() {
					battle.downloadengine(fileurl, zipfile, unzipfolder);
				},
			});							
			
		}else{
			// send unsync status
			$('#battleroom .engine-download').removeClass('downloading').addClass('failed');
			$('#battleroom .engine-download .download-title').text('Spring engine '+version+' not compatible with your OS.');
			utils.sendbattlestatus();
		}
	}

	downloadengine(fileurl, zipfile, unzipfolder) {
		
		const file = fs.createWriteStream( zipfile );
		var battle = this;
		
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
				$('#battleroom .engine-download .download-title').text('Downloading engine ' + status + '% ' + ' – Total size: ' + total.toFixed(2) + ' Mb');
				$('#battleroom .engine-download .progress').css('width', ((100.0 * cur) / len).toFixed(2) + '%');
			});

			response.on('end', function() {
				$('#battleroom .engine-download .download-title').text('Downloading engine: unpacking.');				
				battle.engineunpack(zipfile, unzipfolder);	
			});

			response.on('error', err => {
				fs.unlink( zipfile );
			});
		});
	}
	
	engineunpack(zipfile, unzipfolder){
		
		sevenmin.unpack(zipfile, unzipfolder, err => {
			log.info('Engine unpacked.');			
			
			// add it to preferences tab
			//$('#enginepath').val(enginepath);

			$('#battleroom .engine-download .download-title').text('Downloading engine: completed.');	
			$('#battleroom .engine-download .download-title').removeClass('downloading');
			
			setTimeout(function() {				
				utils.sendbattlestatus();
			}, 1000);						
			
		});
		
	}
	
	
	checkgame() {
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
		var modexist = false;

		if (fs.existsSync(modsdir + filename)) {
			log.info('Game found in local path');
			$('#battleroom .game-download').removeClass('downloading');			
		} else {
			var fileurl = remotemodsurl + filename;
			var battle = this;

			// check if file exist first
			$.ajax({
				url: fileurl,
				type: 'HEAD',
				error: function() {
					$('#battleroom .game-download').removeClass('downloading').addClass('failed');
					$('#battleroom .game-download .download-title').text('Game not found for download.');						
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
				setTimeout(function() {				
					utils.sendbattlestatus();
				}, 1000);					
			});

			response.on('error', err => {
				fs.unlink(modsdir + filename);
			});
		});
	}

	checkmap() {
		var currentmap = $('#battleroom .mapname')
			.text()
			.replace("'", '_')
			.toLowerCase();

		currentmap = currentmap.split(' ').join('_');
		var filename = currentmap + '.sd7';
		var filename2 = currentmap + '.sdz';
		var mapexist = false;						
		
		if (fs.existsSync(mapsdir + filename) || fs.existsSync(mapsdir + filename2)) {
			
			//this.check_file_integrity(filename);
			log.info('Map found in local path');
			$('#battleroom .map-download').removeClass('downloading');
			//utils.sendbattlestatus();		
				
		} else {
			var fileurl = remotemapsurl + filename;
			var fileurl2 = remotemapsurl + filename2;
			var fileurl3 = remotemapsurl2 + filename;
			var fileurl4 = remotemapsurl2 + filename2;
			log.info('Need map download! ' + fileurl);
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
							// try springfiles
							$.ajax({
								url: fileurl3,
								type: 'HEAD',
								error: function() {
									$.ajax({
										url: fileurl4,
										type: 'HEAD',
										error: function() {
											$('#battleroom .map-download').removeClass('downloading').addClass('failed');
											$('#battleroom .map-download .download-title').text('Map not found for download.');											
										},
										success: function() {
											log.info(fileurl4 + ' exist!');
											battle.downloadmap(fileurl4, filename2);
										},
									});
								},
								success: function() {
									log.info(fileurl2 + ' exist!');
									battle.downloadmap(fileurl3, filename);
								},
							});
						},
						success: function() {
							log.info(fileurl2 + ' exist!');
							battle.downloadmap(fileurl2, filename2);
						},
					});
				},
				success: function() {
					log.info(fileurl + ' exist!');
					battle.downloadmap(fileurl, filename);
				},
			});
		}
	}
	
	check_file_integrity( filename ){
		
		fs.readFile(mapsdir + filename, function read(err, data) {
				if (err) {
					throw err;
				}						
				var maphash = crypto.createHash('md5').update(data).digest('hex');	
				log.warn('maphash:' + maphash);							
			});
			
		// $.getJSON('https://files.balancedannihilation.com/api.php?command=getmapslist', function(data) {			
		// 	
		// 	data = data['mapslist'];
		// 	$.each(data, function(key, val) {
		// 		
		// 		if( val['filename'] == filename ){
		// 			log.info('key: ' + key + ' val: ' + val);
		// 		}				
		// 	});							
		// 	
		// });	
		
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
				setTimeout(function() {				
					utils.sendbattlestatus();
				}, 1000);
			});

			response.on('error', err => {
				fs.unlink(mapsdir + filename);
			});
		});
	}

	createbattleroom() {
		$('#battleroom').empty();
		var battlediv = $('#battleroomtemplate')
			.contents()
			.clone();
		$('#battleroom').append(battlediv);
		$('#battleroom .battleroom_input').focus();
		$('#battleroom')
			.removeClass('ffa')
			.addClass('teams');
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
			//$('#battleroom .colorpicked').css('background-color', mycolor);
			$('#topbar .status').css('background-color', mycolor);			
			
		}
	}
	
	
	

	get_map_info(battleid) {
		
		
		var battles = this;
		var mapname = $('.battle-card[data-battleid="' + battleid + '"] .mapname').text();
		log.info("Getting map info: " + mapname);
		
		var mapfilenamebase = mapname
			.toLowerCase()
			.replace("'", '_')
			.split(' ')
			.join('_');

		var url1 = 'https://files.balancedannihilation.com/data/metadata/' + mapfilenamebase + '.sd7/mapinfo.json';
		var url2 = 'https://files.balancedannihilation.com/data/metadata/' + mapfilenamebase + '.sdz/mapinfo.json';

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
		var localmmapok = true;
		var localhmapok = true;

		// check if minimaps were saved and not empty
		if (fs.existsSync(localmap)) {
			var mapstats = fs.statSync(localmap);
			if (mapstats['size'] <= 0) {
				localmapok = false;
			} else {
				if (fs.existsSync(localmmap)) {
					var mmapstats = fs.statSync(localmmap);
					if (mmapstats['size'] <= 0) {
						localmmapok = false;
					} else {
						if (fs.existsSync(localhmap)) {
							var hmapstats = fs.statSync(localhmap);
							if (hmapstats['size'] <= 0) {
								localhmapok = false;
							}
						} else {
							localhmapok = false;
						}
					}
				} else {
					localmmapok = false;
				}
			}
		} else {
			localmapok = false;
		}

		if (localmapok) {
			log.info('Local minimap found:' + filename);
			battles.appendimagedivs(battleid, mapinfo, localmap, localmmap, localhmap);
		} else {
			//&xmax=1000&ymax=1000
			var urlmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=minimap&mapname=' + filename;
			var urlmmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=metalmap&mapname=' + filename;
			var urlhmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=heightmap&mapname=' + filename;

			if (mapinfo) {
				log.info('Saving remote minimaps:' + filename);

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
			} else {
				log.info('File info is missing for:' + filename);
				battles.appendimagedivs(battleid, '', '', '', '');
			}
		}
	}

	appendimagedivs(battleid, mapinfo, localmap, localmmap, localhmap) {
		var battles = this;

		if (localmap) {
			if (mapinfo) {
				var sizeinfos = mapinfo['sizeinfos'];
				var w = sizeinfos['width'],
					h = sizeinfos['height'],
					xsmu = sizeinfos['xsmu'],
					ysmu = sizeinfos['ysmu'],
					Description = sizeinfos['Description'];
				var ratio = w / h;
				var maxwh = 220;
				battles.appendimagedivsfinal(battleid, mapinfo, localmap, localmmap, localhmap, w, h, maxwh, ratio);
			} else {
				const img = new Image();
				img.src = localmap;
				img.onload = function() {
					var w = this.width;
					var h = this.width;
					var ratio = w / h;
					var maxwh = 220;
					battles.appendimagedivsfinal(battleid, mapinfo, localmap, localmmap, localhmap, w, h, maxwh, ratio);
				};
			}
		} else {
			// no local map
			// cant save remotely
			log.info('No remote minimap');
			// remove map
			$('.battle-card[data-battleid="' + battleid + '"] .minimap').empty();
			if ($('#battleroom').data('battleid') == battleid) {
				$('#battleroom #battle-minimap').empty();
				$('#battleroom #battle-metalmap').empty();
				$('#battleroom #battle-heightmap').empty();
			}
		}
	}

	appendimagedivsfinal(battleid, mapinfo, localmap, localmmap, localhmap, w, h, maxwh, ratio) {
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
				$('#battleroom .minimaps').css('width', 'auto');
			} else {
				$('#battleroom .minimaps').css('height', '400px');
				$('#battleroom .minimaps').css('width', ratio * 400 + 'px');
			}

			if (mapinfo) {
				var sizeinfos = mapinfo['sizeinfos'],
					teamlist = mapinfo['teamslist'],
					fulltilewidth = sizeinfos['fulltilewidth'],
					fulltileheight = sizeinfos['fulltileheight'];

				if (teamlist.length) {
					// clear old points
					$('.minimaps .startpos').remove();
					teamlist.forEach(async function(item) {
						//log.info(item);
						//log.info(fulltilewidth);
						//log.info(fulltileheight);

						var xrel = (item['StartPosX'] / fulltilewidth) * 100;
						var yrel = (item['StartPosZ'] / fulltileheight) * 100;
						var teamnum = item['teamnum'] + 1;
						var point = '<div class="startpos" style="top:' + yrel + '%; left:' + xrel + '%;">' + teamnum + '</div>';
						$('#battleroom .minimaps').append(point);
					});
				}
			}
		}
	}

	addstartrect(allyNo, left, top, right, bottom) {
		// 		var target = '#battleroom .box' + (parseInt(allyNo) + 1);
		// 		//log.info('adding boxes ally ' + target);
		//
		// 		$(target + ' .boxleft').val(left / 2);
		// 		$(target + ' .boxtop').val(top / 2);
		// 		$(target + ' .boxright').val(right / 2);
		// 		$(target + ' .boxbottom').val(bottom / 2);

		var width = right / 2 - left / 2;
		var height = bottom / 2 - top / 2;
		$('.startbox.box' + allyNo).remove();
		var id = 'box' + (parseInt(allyNo) + 1);
		var startbox = '<div id="' + id + '" class="startbox box' + allyNo + '" style="left:' + left / 2 + '%; top:' + top / 2 + '%; width:' + width + '%; height:' + height + '%;"></div>';

		$('#battleroom .minimaps').append(startbox);

		$('#' + id)
			.resizable({
				containment: 'parent',
				stop: function(event, ui) {
					var parent = $('#battleroom .minimaps');

					var left = Math.round((ui.position.left / parent.width()) * 200);
					var top = Math.round((ui.position.top / parent.height()) * 200);
					var right = Math.round((ui.size.width / parent.width()) * 200) + left;
					var bottom = Math.round((ui.size.height / parent.height()) * 200) + top;

					var command = 'SAYBATTLE !addBox ' + left + ' ' + top + ' ' + right + ' ' + bottom + ' ' + (parseInt(allyNo) + 1) + ' \n';
					log.info(command);
					socketClient.write(command);
				},
			})
			.draggable({
				containment: 'parent',
				stop: function(event, ui) {
					var parent = $('#battleroom .minimaps');

					var left = Math.round((ui.position.left / parent.width()) * 200);
					var top = Math.round((ui.position.top / parent.height()) * 200);

					var right = Math.round(($(this).width() / parent.width()) * 200) + left;
					var bottom = Math.round(($(this).height() / parent.height()) * 200) + top;

					var command = 'SAYBATTLE !addBox ' + left + ' ' + top + ' ' + right + ' ' + bottom + ' ' + (parseInt(allyNo) + 1) + ' \n';
					log.info(command);
					socketClient.write(command);
				},
			});
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

				var jsonurl = 'https://files.balancedannihilation.com/data/metadata/' + filename + '/mapinfo.json';

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
			//var title = sentences[1].split(')').slice(1);
			var title = sentences[1].slice(sentences[1].indexOf(')') + 1, sentences[1].length);
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
		battlediv += '<div class="gameName">' + gameName + '</div>';
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

		// if my battle is closed, refrech interface
		if ($('#battleroom .battleid').text() == battleid) {
			$('.tab.battleroom .status').removeClass('active');
			$('#battleroom').removeClass('active');
			$('#battlelist').addClass('active');
			$('#battleroom').empty();
			$('body').removeClass('inbattleroom');
			$('.activebattle').removeClass('activebattle');
		}
	}

	updatebattleinfo(battleid, spectatorCount, locked, maphash, mapname) {
		var currentmapname = $('.battle-card[data-battleid="' + battleid + '"] .mapname').text();
		$('.battle-card[data-battleid="' + battleid + '"] .mapname').text(mapname);

		// check if map changed
		if (mapname != currentmapname || $('.battle-card[data-battleid="' + battleid + '"] .minimap').is(':empty')) {
			// check if it's battleroom
			if ($('#battleroom').data('battleid') == battleid) {
				log.info('Cleaning map boxes and size');
				$('.startbox').remove();
				$('.startpos').remove();
				$('#battleroom .minimaps').css('width', '');
				$('#battleroom .minimaps').css('height', '');
				$('#battleroom #battle-minimap').empty();
				$('#battleroom #battle-metalmap').empty();
				$('#battleroom #battle-heightmap').empty();
			}
			
			//this.load_remote_map_image(battleid);
			this.get_map_info(battleid);
		}
		
		
		$('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(spectatorCount);

		if (locked === 0) {
			$('.battle-card[data-battleid="' + battleid + '"] .locked').text('LOCKED');
		} else {
			$('.battle-card[data-battleid="' + battleid + '"] .locked').text('OPEN');
		}

		//var nUsers = parseInt($('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(), 10);
		// var nUsers = $('.battle-card[data-battleid="' + battleid + '"] .playerlist li').length;		
		// var players = nUsers - spectatorCount;				
		// var battle_order = 20*players + spectatorCount;
		// $('.battle-card[data-battleid="' + battleid + '"] .players').text(players);
		// $('.battle-card[data-battleid="' + battleid + '"]').css('order', -battle_order);

		// update options
		if ($('#battleroom').data('battleid') == battleid) {
			
			//$('#battleroom #battle-main-info .players').text(players);
			//$('#battleroom .spectatorCount').text(spectatorCount);
			
			$('#battleroom .mapname').text(mapname);

			if (locked === 0) {
				$('#battleroom .locked').text('LOCKED');
			} else {
				$('#battleroom .locked').text('OPEN');
			}			

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
		// add class joinning for spec status bypass in updatebattlestatus
		$('body').addClass('joinningbattle');
		setTimeout(function() {
			$('body').removeClass('joinningbattle');
		}, 1000);

		this.createbattleroom();
		$('#battleroom').data('battleid', battleid);
		$('body').addClass('inbattleroom');
		$('.battle-card[data-battleid="' + battleid + '"]').addClass('activebattle');

		$('.container, .tab').removeClass('active');
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

		//this.load_remote_map_image(battleid);
		this.get_map_info(battleid);

		//check if game exist
		// after game, check if map exist
		this.checkengine();
		this.checkgame();
		this.checkmap();
		utils.init_battlerrom_chat();
	}

	// when anyone joins a battle
	joinedbattle(battleid, username) {
		var myusername = $('#myusername').text();
		var nUsers = parseInt($('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(), 10) + 1;
		$('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(nUsers);

		var spectatorCount = parseInt($('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(), 10);
		var players = nUsers - spectatorCount;
		var battle_order = 20*players + spectatorCount;
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);
		$('.battle-card[data-battleid="' + battleid + '"]').css('order', -battle_order);		
		
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
			
			if (username == myusername) {
				$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('me');
				$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"] .name').before('<div class="goplay">PLAY</div><div class="gospec">SPEC</div>');
			}
		}
		
		var usermuted = store.get('users.' + username + '.mute');		
		if (usermuted) {
			$('li[data-username="' + jQuery.escapeSelector(username) + '"]').addClass('muted');
		}
	}
	
	// when bot joins a battle
	botjoinedbattle(battleid, botname, owner, battleStatus, teamColor) {
		
		var myusername = $('#myusername').text();				

		if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {			
			var bot = $('#battleroom li[data-username="' + jQuery.escapeSelector(owner) + '"]').clone().removeClass('me').addClass('mybot');
			bot.children('.goplay').remove();
			bot.children('.gospec').remove();
			bot.children('.name').text(botname);
			bot.attr('data-username', botname);
			$('#battleroom .battle-playerlist').append(bot);
		}
	}
	
	// updatebot(battleid, botname, battleStatus, teamColor) {
	// 	
	// 	var myusername = $('#myusername').text();				
	// 	if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {
	// 		var bot = $('#battleroom li[data-username="' + jQuery.escapeSelector(botname) + '"]');
	// 		bot.children('.name').text(botname);
	// 		bot.attr('data-username', botname);
	// 		$('#battleroom .battle-playerlist').append(bot);
	// 	}
	// }
	
	botremovedbattle(battleid, botname) {		
		var myusername = $('#myusername').text();

		if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {					
			$('#battleroom li[data-username="' + jQuery.escapeSelector(botname) + '"]').remove();						
		}
	}

	leftbattle(battleid, username) {
		var nUsers = parseInt($('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(), 10) - 1;
		$('.battle-card[data-battleid="' + battleid + '"] .nUsers').text(nUsers);

		var spectatorCount = parseInt($('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(), 10);
		var players = nUsers - spectatorCount;
		var battle_order = 20*players + spectatorCount;
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);
		$('.battle-card[data-battleid="' + battleid + '"]').css('order', -battle_order);		
		
		//update chatlist
		$('li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').removeClass('battle');

		// remove user from bnattle-card
		$('.battle-card li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();

		// if user is in my battle
		if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
			// print message to battleroom chat
			utils.append_message_battleroom($('#battleroom .founder').text(), '* ' + username + ' left battle.');
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
				log.info('moffa');
				$('#battleroom')
					.removeClass('teams')
					.addClass('ffa');
				$('#battleroom .gametype').text('FFA');
			} else if (parts[2] == 'mo_ffa' && val == '0') {
				log.info('team');
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
		var enginepath = $('#enginepath').text();
		
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
		var enginepath = $('#enginepath').text();
		
		var script = '[GAME]\n{\n\t';
		script += 'HostIP=' + $('.battle-main-info .ip').text() + ';\n\t' + 'HostPort=' + $('.battle-main-info .port').text() + ';\n\t' + 'IsHost=0;\n\t' + 'MyPlayerName=' + username + ';\n\t' + 'MyPasswd=' + this.generatePassword(username) + ';\n' + '}\n';

		try {
			fs.writeFileSync(scriptfile, script, 'utf-8');
		} catch (e) {
			alert('Failed to save the script file!');
			log.info(e);
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
