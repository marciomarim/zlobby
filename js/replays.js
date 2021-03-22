var spawn = require('child_process').spawn,
	fs = require('fs');

import { springdir, mapsdir, minimapsdir, modsdir, chatlogsdir, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

const os = require('os');
const platform = os.platform();
const path = require('path');
const log = require('electron-log');
var mapsfound = [];

var enginesfolder = path.resolve(springdir, 'engine'); 

export default class Replay {
	
	constructor() {}

	load_replays() {
		
		//clear loaded replays 
		$('#replaylist').empty();		
		
		var obj = this;
		
		fs.readdir(enginesfolder, (err, enginefiles) => {
			enginefiles.forEach(engineversion => {
							
				var dirContent = path.resolve(enginesfolder, engineversion);
				if (fs.statSync(dirContent).isDirectory()) {
					
					var demofolder = path.resolve(dirContent, 'demos');
					log.info('reading replay folder: ' + demofolder );	
					
					if (fs.existsSync(demofolder)) {
						fs.readdir(demofolder, (err, files) => {
							files.forEach(file => {
								var data = file.replace('_103.sdfz', '').split('_');
								var date = [data[0].slice(0, 4), '/', data[0].slice(4, 6), '/', data[0].slice(6)].join('');
								var hour = [data[1].slice(0, 2), ':', data[1].slice(2, 4), ':', data[1].slice(4)].join('');
								var mapname = data.slice(2).join('');
					
								var localmap =
									minimapsdir +
									mapname
										.toLowerCase()
										.split(' ')
										.join('_') +
									'.jpg';
					
								if (mapsfound.indexOf(localmap) === -1) {
									mapsfound.push(localmap);
									obj.createmapfilter(localmap, mapname);
								}
					
								var div = '<div class="replayitem" data-engine="'+engineversion+'" data-path="' + demofolder + '/' + file + '" data-mapname="' + mapname + '">';
								div += '<div class="infos">';
								div += '<div class="meta">Date: ' + date + '</div>';
								div += '<div class="meta">Time: ' + hour + '</div>';
								div += '<div class="meta">Map: ' + mapname + '</div>';
								div += '<div class="meta">Engine version: ' + engineversion + '</div>';
								div += '</div>';
								if (fs.existsSync(localmap)) div += '<div class="minimap"><img src="' + localmap + '"></div>';
								div += '</div>';
								$('#replaylist').append(div);
							});
						});
					}
						
				}

			});
		});
			
	}
	
	createmapfilter(localmap, mapname) {
		if (fs.existsSync(localmap)) {
			var div = '<div class="mapfilter" data-mapname="' + mapname + '">';
			div += '<div class="minimap"><img src="' + localmap + '"></div>';
			div += '</div>';
			$('#mapfilter').append(div);
		}
	}
		
}

let replays = new Replay();
replays.load_replays();


$('body').on('click', '.mapfilter', function(e) {
	
	log.info('filtering map');
	
	if ($(this).hasClass('active')) {
		$(this).removeClass('active');
		$('.replayitem').show();
		// $('.mapfilter').each(function(index) {
		// 	$(this).show();
		// });
	} else {
		$('.mapfilter').removeClass('active');
		$(this).addClass('active');
		var mapname = $(this).data('mapname');
		$('.replayitem').hide();
		$('.replayitem[data-mapname="' + mapname + '"]').show();
	}
});

$('body').on('click', '.replayitem', function(e) {
	
	var replaypath = $(this).data('path');
	var engineversion = $(this).data('engine');
	//var enginepath = path.resolve(enginesfolder, engineversion);	
	
	if (platform == 'win32') {		
		var enginefile = springdir + 'engine\\' + engineversion + '\\spring.exe';								
	} else if (platform == 'darwin') {
		var enginefile = springdir + 'engine/' + engineversion + '/Spring_' + engineversion + '.app/Contents/MacOS/spring';
	} else if (platform == 'linux') {
		var enginefile = springdir + 'engine/' + engineversion + '/spring';
	}
		
	log.info('launching replay: ' + replaypath);
	
	const bat = spawn(enginefile, [replaypath], {
		detached: true,
		stdio: 'ignore',
		//stdio: ['ignore', out, err],
	});

	bat.unref();
});
