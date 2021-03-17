var spawn = require('child_process').spawn,
	fs = require('fs');

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, replaysdir2, chatlogsdir, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

const log = require('electron-log');
var mapsfound = [];
var directories = [ replaysdir, replaysdir2 ];

export default class Replay {
	
	constructor() {}

	load_replays() {
		
		//clear loaded replays 
		$('#replaylist').empty();
		//$('#mapfilter').empty();
		
		var obj = this;
		
		directories.forEach(function( directory ) {
			
			log.info('reading replay dir: ' + directory );
			
			if (fs.existsSync(directory)) {
				fs.readdir(directory, (err, files) => {
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
			
						var div = '<div class="replayitem" data-path="' + directory + file + '" data-mapname="' + mapname + '">';
						div += '<div class="infos">';
						div += '<div class="meta">Date: ' + date + '</div>';
						div += '<div class="meta">Time: ' + hour + '</div>';
						div += '<div class="meta">Map: ' + mapname + '</div>';
						div += '</div>';
						if (fs.existsSync(localmap)) div += '<div class="minimap"><img src="' + localmap + '"></div>';
						div += '</div>';
						$('#replaylist').append(div);
					});
				});
			}
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
	log.info('launching replay: ' + replaypath);

	const bat = spawn(enginepath, [replaypath], {
		detached: true,
		stdio: 'ignore',
		//stdio: ['ignore', out, err],
	});

	bat.unref();
});
