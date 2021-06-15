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
const path = require('path');
const MapParser = require("spring-map-parser").MapParser;
const crypto = require('crypto');
const { ipcRenderer } = require('electron');

import { springdir, mapsdir, minimapsdir, modsdir, chatlogsdir, infologfile, scriptfile, remotemodsurl, remotemapsurl, remotemapsurl2 } from './init.js';

export default class Battle {
	constructor() {}
	
	checkengine() {
		
		var currentengine = $('#battleroom .engine')
			.text()
			.toLowerCase()
			.split(' ');
		
		var bar = false;
		
		if (currentengine[0] == 'spring'){
			var version = currentengine[1];
		}else{
			var version = currentengine[0];
			bar = true;
		}		
		
		log.warn('Spring engine: ' + $('#battleroom .engine').text() );
		log.warn('Spring version: ' + version);
		
		var battle = this;
		
		if (platform == 'win32') {
			
			var enginefile = springdir + 'engine\\' + version + '\\spring.exe';						
			log.warn(enginefile);
			
			if ( version == '103.0' ){
				var fileurl = 'https://www.springfightclub.com/data/master_103/win64/spring_103.0_win64-minimal-portable.7z';
				var zipfile = springdir + 'engine\\spring_103.0_win64-minimal-portable.7z';
				var unzipfolder = springdir + 'engine\\' + version + '\\'; 
			}else if( version == '105.0' ){
				var fileurl = 'https://www.springfightclub.com/data/105_zips/spring_105.0_win64-minimal-portable.7z';
				var zipfile = springdir + 'engine\\spring_105.0_win64-minimal-portable.7z';
				var unzipfolder = springdir + 'engine\\' + version + '\\'; 				
			}else if( bar ){
				var fileurl = 'https://github.com/beyond-all-reason/spring/releases/download/spring_bar_%7BBAR%7D'+version+'/spring_bar_.BAR.'+version+'_windows-64-minimal-portable.7z';
				var zipfile = springdir + 'engine\\spring_bar_.BAR.'+version+'_windows-64-minimal-portable.7z';
				var unzipfolder = springdir + 'engine\\' + version + '\\';
			}
			
		} else if (platform == 'darwin') {
			
			//var enginefile = '/Applications/Spring_' + version + '.app/Contents/MacOS/spring';
			var enginefile = springdir + 'engine/' + version + '/Spring_' + version + '.app/Contents/MacOS/spring';
			log.warn(enginefile);
			
			if ( version == '103.0' ){
				var fileurl = 'https://www.springfightclub.com/data/master_103/mac/Spring_103.0.app.7z';
				var zipfile = springdir + 'engine/Spring_103.0.app.7z';
				var unzipfolder = springdir + 'engine/' + version + '/'; 
			}else if( version == '105.0') {
				//var fileurl = 'https://www.springfightclub.com/data/105_zips/mac/Spring_105.0.app.7z';
				//var zipfile = springdir + 'engine/Spring_105.0.app.7z';
				//var unzipfolder = springdir + 'engine/' + version + '/';
				var fileurl = 0;
			}else if( bar ){
				// var fileurl = 'https://github.com/beyond-all-reason/spring/releases/download/spring_bar_%7BBAR%7D'+version+'/spring_bar_.BAR.'+version+'_windows-64-minimal-portable.7z';
				// var zipfile = springdir + 'engine/spring_bar_.BAR.'+version+'_windows-64-minimal-portable.7z';
				// var unzipfolder = springdir + 'engine/' + version + '/';
				var fileurl = 0;
			}
			
		} else if (platform == 'linux') {
			
			var enginefile = springdir + 'engine/' + version + '/spring';
			log.warn(enginefile);

			if ( version == '103.0' ){
				var fileurl = 'https://www.springfightclub.com/data/master_103/linux64/spring_103.0_minimal-portable-linux64-static.7z';
				var zipfile = springdir + 'engine/spring_103.0_minimal-portable-linux64-static.7z';
				var unzipfolder = springdir + 'engine/' + version + '/';
			}else if(version == '105.0'){
				var fileurl = 'https://www.springfightclub.com/data/105_zips/spring_105.0_minimal-portable-linux64-static.7z';
				var zipfile = springdir + 'engine/spring_105.0_minimal-portable-linux64-static.7z';
				var unzipfolder = springdir + 'engine/' + version + '/';								
			}else if (bar){
				var fileurl = 'https://github.com/beyond-all-reason/spring/releases/download/spring_bar_%7BBAR%7D'+version+'/spring_bar_.BAR.'+version+'_linux-64-minimal-portable.7z';
				var zipfile = springdir + 'engine/spring_bar_.BAR.'+version+'_linux-64-minimal-portable.7z';
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
			
			if ( !bar ){
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
				battle.downloadenginebar(fileurl, zipfile, unzipfolder);
			}	
										
			
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
	
	downloadenginebar(fileurl, zipfile, unzipfolder){
		
		var enginedir = path.resolve(springdir, 'engine');
		var battle = this;
		
		ipcRenderer.send('download', {
			  url: fileurl,
			  properties: { directory: enginedir },
		  });
	
		  ipcRenderer.on('download progress', async (event, progress) => {
			  var w = Math.round(progress.percent * 100) + '%';
			  log.info('Downloading update: ' + w + ' of 100%');
			  $('#battleroom .engine-download .download-title').text('Downloading engine: ' + w + ' of 100%');	
			  $('#battleroom .engine-download .progress').css('width', w );
		  });
	
		  ipcRenderer.on('download complete', (event, progress) => {
			  log.info('Download completed, unpacking...');
			  $('#battleroom .engine-download .download-title').text('Download completed, unpacking...');
			  // unpack
			  battle.engineunpack(zipfile, unzipfolder);			  			  
		  });
		  
	}
	
	engineunpack(zipfile, unzipfolder){
		
		console.warn(zipfile);
		console.warn(unzipfolder);
		
		sevenmin.unpack(zipfile, unzipfolder, err => {
			log.info('Engine unpacked.');			

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
		
		
			
		// check for local file of for rapid download
		if ( fs.existsSync(modsdir + filename) || store.get('game.' + $('#battleroom .gameName').text() ) ) {
			log.info('Game already downloaded.');
			$('#battleroom .game-download').removeClass('downloading');			
		} else {
			var fileurl = remotemodsurl + filename;
			var battle = this;

			// check if file exist first
			$.ajax({
				url: fileurl,
				type: 'HEAD',
				error: function() {
					log.warn('Game download via rapid');										
					battle.downloadgamepr( $('#battleroom .gameName').text() );					
				},
				success: function() {
					log.warn('Game download via http');										
					battle.downloadgame(fileurl, filename);
				},
			});
		}
	}
	
	downloadgamepr( gamename ){
						
		const { exec } = require('child_process');
		$('#battleroom .game-download .download-title').text('Checking game...');
		$('#battleroom .game-download').addClass('downloading');

		if (platform == 'win32') {			
			var pr = path.join(path.dirname(__dirname), 'extraResources','pr-downloader.exe');
		}else if (platform == 'darwin'){
			var pr = path.join(path.dirname(__dirname), 'zlobby/extraResources','pr-downloader-mac');
		}else{
			var pr = path.join(path.dirname(__dirname), 'extraResources','pr-downloader');			
		}		
		
		const prdownloader = exec( pr + ' --download-game ' + '"'+gamename+'"' );
		
		
		prdownloader.stdout.on('data', (data) => {
			var status = data.split(' ');			
			log.warn(data);	
			
			if(status[0] == '[Progress]'){
				var progress = '0%';
				if ( status[1].indexOf('%') !== -1 ){
					progress = status[1];
				}else if(status[2].indexOf('%') !== -1){
					progress = status[2];
				}else if(status[3].indexOf('%') !== -1){
					progress = status[3];
				}
				
				$('#battleroom .game-download').addClass('downloading');
				$('#battleroom .game-download .download-title').text('Downloading ' + gamename + ' status: ' + progress);	
				$('#battleroom .game-download .progress').css('width', progress.toString() );
				
				if (progress == '100%'){
					$('#battleroom .game-download').removeClass('downloading');					
				}				
			}
			
			if( data.indexOf('Download complete!') !== -1){
				$('#battleroom .game-download .download-title').text('Download complete!');
				$('#battleroom .game-download').removeClass('downloading');
				store.set('game.' + gamename, 1);			
			}
			
		});
		
		prdownloader.stderr.on('data', (data) => {
		  log.error(data);
		  //$('#battleroom .game-download').removeClass('downloading').addClass('failed');
		  //$('#battleroom .game-download .download-title').text('Game not found for download or error on downloading');
		});
		
		prdownloader.on('close', (code) => {		  
			
			$('#battleroom .game-download').removeClass('downloading');	
				  
			log.warn('Download closed:' + code);
			
			if (code == 'null' || code == '1'){
				
				store.set('game.' + gamename, 0);
				setTimeout(function() {				
				  utils.sendbattlestatus();
				}, 1000);
				
			}else if(code == '0' || code == '2'){
				
				$('#battleroom .game-download').removeClass('downloading');
				store.set('game.' + gamename, 1);
				setTimeout(function() {				
					utils.sendbattlestatus();
				}, 1000);
				
			}
			
		});
		
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
				
		
		if (currentmap == ''){
			return;
		}		
		
		currentmap = currentmap.split(' ').join('_');
		var filename = currentmap + '.sd7';
		var filename2 = currentmap + '.sdz';
		var mapexist = false;						
		var fileurl = remotemapsurl + filename;
		var fileurl2 = remotemapsurl + filename2;
		var fileurl3 = remotemapsurl2 + filename;
		var fileurl4 = remotemapsurl2 + filename2;
		
		if (fs.existsSync(mapsdir + filename) || fs.existsSync(mapsdir + filename2)) {
			
			$('#battleroom .map-download').removeClass('downloading');
			log.info('Map found in local path, checking file size.');
			
			if (fs.existsSync(mapsdir + filename)){
				this.check_map_size(filename);				
			}else{
				this.check_map_size(filename2);			
			}						
				
		} else {
			
			log.info('Looking for map in repos.');
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
							// try ba repo
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
											log.info('Map found @ ' + fileurl4);
											battle.downloadmap(fileurl4, filename2);
										},
									});
								},
								success: function() {
									log.info('Map found @ ' + fileurl3);
									battle.downloadmap(fileurl3, filename);
								},
							});
						},
						success: function() {
							log.info('Map found @ ' + fileurl2);
							battle.downloadmap(fileurl2, filename2);
						},
					});
				},
				success: function() {
					log.info('Map found @ ' + fileurl);
					battle.downloadmap(fileurl, filename);
				},
			});
		}
	}
	
	check_map_size( filename ){
				
		var remote = require('remote-file-size');				
		var fileurl1 = remotemapsurl + filename;		
		var fileurl2 = remotemapsurl2 + filename;		
		
		var mapstats = fs.statSync( mapsdir + filename );
		var localsize = parseInt(mapstats['size'], 10);
		var remotesize = 0;
		
		log.warn('local map size: ' + localsize);
		
		remote(fileurl1, function(err, o) {
			remotesize = parseInt(o, 10);			
			
			if (remotesize == 0){
				
				remote(fileurl2, function(err, o) {
					remotesize = parseInt(o, 10);
					
					if ( remotesize != localsize && remotesize > 100 ) {
												
						log.warn( 'local map has a problem, re-downloading');			
													
						// delete map and redownload
						fs.unlinkSync( mapsdir + filename );			
						
						// re-download map			
						this.checkmap();
						
					}
					
					// send battle status sync
					utils.sendbattlestatus();
					
				});
					
			}else{
				log.warn('remote size: ' + remotesize);				
				
				if ( remotesize != localsize && remotesize > 100 ) {
											
					log.warn( 'local map has a problem, re-downloading');			
												
					// delete map and redownload
					fs.unlinkSync( mapsdir + filename );			
					
					// re-download map			
					this.checkmap();
					
				}
				// send battle status sync
				utils.sendbattlestatus();

			}
			
		});		
		
	}
	
	downloadmap(fileurl, filename) {
		
		$('#battleroom .map-download').addClass('downloading');		
		const file = fs.createWriteStream(mapsdir + filename);
		var battleid = $('#battleroom .battleid').text();
		var battles = this;
		
		https.get(fileurl, function(response) {
			
			response.pipe(file);

			var len = parseInt(response.headers['content-length'], 10);
			var body = '';
			var cur = 0;
			var total = len / 1048576;
			var status = 0;

			response.on('data', function(chunk) {
				body += chunk;
				cur += chunk.length;
				status = ((100.0 * cur) / len).toFixed(2);
				$('#battleroom .map-download .download-title').text('Downloading map ' + status + '% ' + ' – Total size: ' + total.toFixed(2) + ' Mb');
				$('#battleroom .map-download .progress').css('width', ((100.0 * cur) / len).toFixed(2) + '%');
			});

			response.on('end', function() {
				
				console.warn('Ending with status: ' + status);
				
				$('#battleroom .map-download .download-title').text('Downloading map: Completed!');
				$('#battleroom .map-download').removeClass('downloading');				
				
				setTimeout(function() {				
					battles.load_map_images(battleid);
				}, 1000);
				
				// setTimeout(function() {				
				// 	utils.sendbattlestatus();
				// }, 1000);
				battles.check_map_size( filename );					
				
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
			$('#battleroom .showhostmessages').prop('checked', false);
		} else {
			$('#battleroom .showhostmessages').prop('checked', true);
		}

		var autoscrollbattle = store.get('user.autoscrollbattle');
		if (autoscrollbattle == 0) {
			$('#battleroom .autoscrollbattle').prop('checked', false);
		} else {
			$('#battleroom .autoscrollbattle').prop('checked', true);
		}
		
		var autolaunchbattle = store.get('user.autolaunchbattle');
		if (autolaunchbattle == 0) {
			$('#battleroom .autolaunchbattle').prop('checked', false);
		} else {
			$('#battleroom .autolaunchbattle').prop('checked', true);
		}
		
		var inlinechat = store.get('prefs.inlinechat');
		if (inlinechat == 0) {
			$('#battleroom .inlinechat').prop('checked', false);			
		} else {
			$('#battleroom .inlinechat').prop('checked', true);
			$('body').addClass('inlinechat');
		}

		var mutebattleroom = store.get('user.mutebattleroom');
		if (mutebattleroom == 0 || mutebattleroom == undefined) {
			$('#battleroom .mutebattleroom').prop('checked', false);
			var sound = document.getElementById('messagesound');
			sound.volume = 1;
			var ring = document.getElementById('ringsound');
			ring.volume = 1;
		} else {
			var sound = document.getElementById('messagesound');
			sound.volume = 0;
			var ring = document.getElementById('ringsound');
			ring.volume = 0;
			$('#battleroom .mutebattleroom').prop('checked', true);
		}

		var mycolor = store.get('user.mycolor');
		if (mycolor) {
			//$('#battleroom .colorpicked').css('background-color', mycolor);
			$('#topbar .status').css('background-color', mycolor);			
			
		}
	}
	
	
	

	//load_map_images(battleid, mapinfo, filename, mapfilenamebase) {
	load_map_images(battleid) {
		
		log.info('loading minimap');
		var battles = this;
		
		var mapname = $('.battle-card[data-battleid="' + battleid + '"] .mapname').text();		
		var mapfilenamebase = mapname
			.toLowerCase()
			.replace("'", '_')
			.split(' ')
			.join('_');
		
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
			battles.appendimage(battleid, localmap, localmmap, localhmap);
		}else{
			battles.create_minimap( battleid );	
		}				
		
	
	}

	downloadminimap( battleid, mapfilenamebase, localmap, localhmap, localmmap ){				
				
		var url1 = 'https://files.balancedannihilation.com/data/metadata/' + mapfilenamebase + '.sd7/mapinfo.json';
		var url2 = 'https://files.balancedannihilation.com/data/metadata/' + mapfilenamebase + '.sdz/mapinfo.json';
		var battles = this;	
		
		try {
			$.getJSON(url1, function(mapinfo) {
				var filename = mapfilenamebase + '.sd7';
				//&xmax=1000&ymax=1000
				var urlmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=minimap&mapname=' + filename;
				var urlmmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=metalmap&mapname=' + filename;
				var urlhmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=heightmap&mapname=' + filename;		
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
								
			}).fail(function() {
				try {
					$.getJSON(url2, function(mapinfo) {
						var filename = mapfilenamebase + '.sdz';						
						//&xmax=1000&ymax=1000
						var urlmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=minimap&mapname=' + filename;
						var urlmmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=metalmap&mapname=' + filename;
						var urlhmap = 'https://files.balancedannihilation.com/api.php?command=getimgmap&maptype=heightmap&mapname=' + filename;		
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
					}).fail(function() {
						// generate from local	
						battles.generateminimap( battleid, mapfilenamebase, localmap, localhmap, localmmap );					
					});
				} catch (e) {}
			});
		} catch (e) {}
		
		
		
	}
	
	generateminimap( battleid, mapfilenamebase, localmap, localhmap, localmmap ){
		
		var battles = this;	
		
		// save local maps for later						
		(async () => {
			
			const mapPath1 = path.resolve(springdir, 'maps/'+mapfilenamebase+'.sd7');
			const mapPath2 = path.resolve(springdir, 'maps/'+mapfilenamebase+'.sdz');
			var mapPath = '';			
			
			if (fs.existsSync(mapPath1)) {
				mapPath = mapPath1;	
			}else if(fs.existsSync(mapPath2)){
				mapPath = mapPath2;	
			}
			
			if (mapPath != ''){
				const parser = new MapParser({ verbose: true, mipmapSize: 4, skipSmt: false });		
				const map = await parser.parseMap(mapPath);		
				console.log(map.info);																												
				await map.textureMap.quality(70).writeAsync(localmap);
				await map.heightMap.quality(70).resize(600, -1).writeAsync(localmmap); // -1 here means preserve aspect ratio
				await map.metalMap.quality(70).resize(600, -1).writeAsync(localhmap);						
				
				var remotemap = 'https://github.com/marciomarim/lobby-minimaps/raw/master/minimaps/' + mapfilenamebase + '.jpg';
				//check if minimap exist in github repo, if not, create from map file
				$.ajax({
					url: remotemap,
					type: 'HEAD',
					error: function() {
						battles.appendimage(battleid, localmap, localmmap, localhmap);
					},					
				});
				
			}			
			
		})();
	}
		
	create_minimap( battleid ){										
		
		var mapname = $('.battle-card[data-battleid="' + battleid + '"] .mapname').text();		
		var battles = this;		
		var mapfilenamebase = mapname
			.toLowerCase()
			.replace("'", '_')
			.split(' ')
			.join('_');
		
		var localmap = minimapsdir + mapfilenamebase + '.jpg';
		var localmmap = minimapsdir + mapfilenamebase + '-metalmap.jpg';
		var localhmap = minimapsdir + mapfilenamebase + '-heightmap.jpg';		
		var remotemap = 'https://github.com/marciomarim/lobby-minimaps/raw/master/minimaps/' + mapfilenamebase + '.jpg';		
		var remotemmap = 'https://github.com/marciomarim/lobby-minimaps/raw/master/minimaps/' + mapfilenamebase + '-metalmap.jpg';
		var remotehmap = 'https://github.com/marciomarim/lobby-minimaps/raw/master/minimaps/' + mapfilenamebase + '-heightmap.jpg';
		
		log.info('Appending remote maps');				
		battles.appendimage(battleid, remotemap, remotemmap, remotehmap);						
	
		// if I'm on a battleroom, generate local minimap
		if ($('#battleroom').data('battleid') == battleid) {			
			battles.downloadminimap( battleid, mapfilenamebase, localmap, localhmap, localmmap );
		}
		
		
		
		//check if minimap exist in github repo, if not, create from map file
		// $.ajax({
		// 	url: remotemap,
		// 	type: 'HEAD',
		// 	error: function() {
		// 		
		// 		const MapParser = require("spring-map-parser").MapParser;				
		// 		(async () => {
		// 			
		// 			const mapPath1 = path.resolve(springdir, 'maps/'+mapfilenamebase+'.sd7');
		// 			const mapPath2 = path.resolve(springdir, 'maps/'+mapfilenamebase+'.sdz');
		// 			var mapPath = '';
		// 			
		// 			if (fs.existsSync(mapPath1)) {
		// 				mapPath = mapPath1;	
		// 			}else if(fs.existsSync(mapPath2)){
		// 				mapPath = mapPath2;	
		// 			}
		// 			
		// 			if (mapPath != ''){
		// 				const parser = new MapParser({ verbose: true, mipmapSize: 4, skipSmt: false });		
		// 				const map = await parser.parseMap(mapPath);		
		// 				console.log(map.info);																												
		// 				await map.textureMap.quality(70).writeAsync(localmap);
		// 				await map.heightMap.quality(70).resize(600, -1).writeAsync(localmmap); // -1 here means preserve aspect ratio
		// 				await map.metalMap.quality(70).resize(600, -1).writeAsync(localhmap);						
		// 				
		// 				battles.appendimage(battleid, localmap, localmmap, localhmap);
		// 			}			
		// 			
		// 		})();
		// 			
		// 	},
		// 	success: function() {				
		// 		// append remote maps to fast render
		// 		log.info('Appending remote maps');				
		// 		battles.appendimage(battleid, remotemap, remotemmap, remotehmap);
		// 		
		// 		// save remote maps for later
		// 		var minimapfile = fs.createWriteStream(localmap);
		// 		var minimaprequest = http.get(remotemap, function(response) {
		// 			log.info('Piping remote map');				
		// 			response.pipe(minimapfile);
		// 		});
		// 		
		// 		var metalmapfile = fs.createWriteStream(localmmap);
		// 		var metalmaprequest = http.get(remotemmap, function(response) {
		// 			log.info('Piping remote metalmap');
		// 			response.pipe(metalmapfile);
		// 		});
		// 		
		// 		var heightmapfile = fs.createWriteStream(localhmap);
		// 		var heightmaprequest = http.get(remotehmap, function(response) {
		// 			log.info('Piping remote heightmap');
		// 			response.pipe(heightmapfile);
		// 		});		
		// 	},
		// });
				
	}	
	
	appendimage(battleid, localmap, localmmap, localhmap){
		
		var map = '<img class="map" src="' + localmap + '">';
	
		$('.battle-card[data-battleid="' + battleid + '"] .minimap').html(map);
		
		// if I'm on a battleroom, load metal and height maps
		if ($('#battleroom').data('battleid') == battleid) {
			
			var maxw = $('.battle-main-info').width();
			
			var mapmap = '<img class="map" src="' + localmap + '" style="max-width:'+maxw+'px;">';
			var metalmap = '<img class="map" src="' + localmmap + '" style="max-width:'+maxw+'px;">';
			var heightmap = '<img class="map" src="' + localhmap + '" style="max-width:'+maxw+'px;">';
			
			$('#battleroom #battle-minimap').html(mapmap);
			$('#battleroom #battle-metalmap').html(metalmap);
			$('#battleroom #battle-heightmap').html(heightmap);
						
			var maxh = $('#battle-minimap img').height();
			if (maxh > 0){
				$('#battleroom .minimaps').css('max-height', maxh + 'px');	
			}else{
				$('#battleroom .minimaps').css('max-height', '');
			}
			
			
			
// 			if (mapinfo) {
// 				var sizeinfos = mapinfo['sizeinfos'],
// 					teamlist = mapinfo['teamslist'],
// 					fulltilewidth = sizeinfos['fulltilewidth'],
// 					fulltileheight = sizeinfos['fulltileheight'];
// 
// 				if (teamlist.length) {
// 					// clear old points
// 					$('.minimaps .startpos').remove();
// 					teamlist.forEach(async function(item) {
// 						//log.info(item);
// 						//log.info(fulltilewidth);
// 						//log.info(fulltileheight);
// 
// 						var xrel = (item['StartPosX'] / fulltilewidth) * 100;
// 						var yrel = (item['StartPosZ'] / fulltileheight) * 100;
// 						var teamnum = item['teamnum'] + 1;
// 						var point = '<div class="startpos" style="top:' + yrel + '%; left:' + xrel + '%;">' + teamnum + '</div>';
// 						$('#battleroom .minimaps').append(point);
// 					});
// 				}
// 			}
		}
		
	}

// 	appendimagedivsfinal(battleid, mapinfo, localmap, localmmap, localhmap, w, h, maxwh, ratio) {
// 		if (w > h) {
// 			var map = '<img class="map" src="' + localmap + '" width="220" height="' + maxwh / ratio + '">';
// 		} else if (w == h) {
// 			var map = '<img class="map" src="' + localmap + '" width="220" height="220">';
// 		} else {
// 			var map = '<img class="map" src="' + localmap + '" width="' + maxwh * ratio + '" height="220">';
// 		}
// 		$('.battle-card[data-battleid="' + battleid + '"] .minimap').html(map);
// 
// 		// if I'm on a battleroom, load metal and height maps
// 		if ($('#battleroom').data('battleid') == battleid) {
// 			var mapmap = '<img class="map" src="' + localmap + '">';
// 			var metalmap = '<img class="map" src="' + localmmap + '">';
// 			var heightmap = '<img class="map" src="' + localhmap + '">';
// 
// 			$('#battleroom #battle-minimap').html(mapmap);
// 			$('#battleroom #battle-metalmap').html(metalmap);
// 			$('#battleroom #battle-heightmap').html(heightmap);
// 
// 			var divwidth = $('#battleroom .minimaps').width();
// 			var ratiodiv = divwidth / 400;
// 
// 			if (ratio > ratiodiv) {
// 				$('#battleroom .minimaps').css('height', divwidth / ratio);
// 				$('#battleroom .minimaps').css('width', 'auto');
// 			} else {
// 				$('#battleroom .minimaps').css('height', '400px');
// 				$('#battleroom .minimaps').css('width', ratio * 400 + 'px');
// 			}
// 
// 			if (mapinfo) {
// 				var sizeinfos = mapinfo['sizeinfos'],
// 					teamlist = mapinfo['teamslist'],
// 					fulltilewidth = sizeinfos['fulltilewidth'],
// 					fulltileheight = sizeinfos['fulltileheight'];
// 
// 				if (teamlist.length) {
// 					// clear old points
// 					$('.minimaps .startpos').remove();
// 					teamlist.forEach(async function(item) {
// 						//log.info(item);
// 						//log.info(fulltilewidth);
// 						//log.info(fulltileheight);
// 
// 						var xrel = (item['StartPosX'] / fulltilewidth) * 100;
// 						var yrel = (item['StartPosZ'] / fulltileheight) * 100;
// 						var teamnum = item['teamnum'] + 1;
// 						var point = '<div class="startpos" style="top:' + yrel + '%; left:' + xrel + '%;">' + teamnum + '</div>';
// 						$('#battleroom .minimaps').append(point);
// 					});
// 				}
// 			}
// 		}
// 	}

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
		
		// bail out if undefined
		if (title == 'undefined'){
			return false;
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
		battlediv += '<div class="nUsers" style="display:none;">0</div>';
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
		
		if (passworded) {
			var finaldiv = '<div class="battle-card locked" data-battleid="' + battleid + '" data-founder="' + username + '">' + battlediv + '</div>';
		}else{
			var finaldiv = '<div class="battle-card" data-battleid="' + battleid + '" data-founder="' + username + '">' + battlediv + '</div>';
		}
		
		$('#battle-list').append(finaldiv);

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
			this.load_map_images(battleid);
		}
				
		$('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text(spectatorCount - 1);
		
		var players = $('.battle-card[data-battleid="' + battleid + '"] .playerlist li').length - (spectatorCount - 1);
		if (players < 0){
			players = 0;
		}
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);		

		if (locked == 0) {
			$('.battle-card[data-battleid="' + battleid + '"] .locked').text('OPEN');
			$('.battle-card[data-battleid="' + battleid + '"]').removeClass('locked');
		} else {
			$('.battle-card[data-battleid="' + battleid + '"] .locked').text('LOCKED');
			$('.battle-card[data-battleid="' + battleid + '"]').addClass('locked');
		}

		// update options
		if ($('#battleroom').data('battleid') == battleid) {
			
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
		this.load_map_images(battleid);

		//check if game exist
		// after game, check if map exist
		this.checkengine();
		this.checkgame();
		//this.checkmap();
		utils.init_battlerrom_chat();
	}

	// when anyone joins a battle
	joinedbattle(battleid, username) {
		var myusername = $('#myusername').text();				
		
		//update chatlist
		$('li[data-username="' + jQuery.escapeSelector(username) + '"] .icon-user').addClass('battle');

		// append user to battle-card
		var user = $('#chat-list li[data-username="' + jQuery.escapeSelector(username) + '"]').clone();
		// first remove if already appended
		$('.battle-card li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
		// then append
		$('.battle-card[data-battleid="' + battleid + '"] .playerlist').append(user);

		if ($('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid')) {
			
			// first remove if already appended
			$('#battleroom li[data-username="' + jQuery.escapeSelector(username) + '"]').remove();
			
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
		
		this.updatebattleorder(battleid);
		
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
		
		this.updatebattleorder(battleid);
		
	}
	
	// update player count and battle order in battle list
	updatebattleorder(battleid){
		
		var spectatorCount = $('.battle-card[data-battleid="' + battleid + '"] .spectatorCount').text();				
		var players = $('.battle-card[data-battleid="' + battleid + '"] .playerlist li').length - spectatorCount;
		if (players < 0){
			players = 0;
		}
		$('.battle-card[data-battleid="' + battleid + '"] .players').text(players);
		var battle_order = 20*players + spectatorCount;
		$('.battle-card[data-battleid="' + battleid + '"]').css('order', -battle_order);
		
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
