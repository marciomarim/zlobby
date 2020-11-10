var spawn = require('child_process').spawn,
	fs = require('fs');

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, replaysdir2, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

if (fs.existsSync(replaysdir)) {
	fs.readdir(replaysdir, (err, files) => {
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

			var div = '<div class="replayitem" data-path="' + replaysdir + file + '">';
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

if (fs.existsSync(replaysdir2)) {
	fs.readdir(replaysdir2, (err, files) => {
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

			var div = '<div class="replayitem" data-path="' + replaysdir2 + file + '">';
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

$('body').on('click', '.replayitem', function(e) {
	var replaypath = $(this).data('path');
	console.log(replaypath);

	const bat = spawn(enginepath, [replaypath], {
		detached: true,
		//stdio: ['ignore', out, err],
	});

	bat.unref();
});
