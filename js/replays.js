var spawn = require('child_process').spawn,
	fs = require('fs');

import { springdir, mapsdir, minimapsdir, modsdir, replaysdir, replaysdir2, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl } from './init.js';

if (fs.existsSync(replaysdir)) {
	fs.readdir(replaysdir, (err, files) => {
		files.forEach(file => {
			var data = file.replace('_103.sdfz', '').split('_');
			var date = data[0];
			var hour = data[1];
			var mapname = data.slice(2).join('');

			var localmap =
				minimapsdir +
				mapname
					.toLowerCase()
					.split(' ')
					.join('_') +
				'.png';

			var div = '<div class="replayitem" data-path="' + replaysdir + file + '">';
			div += '<div class="infos">';
			div += '<div class="meta">' + date + '</div>';
			div += '<div class="meta">' + hour + '</div>';
			div += '<div class="meta">' + mapname + '</div>';
			div += '</div>';
			if (fs.existsSync(localmap)) div += '<div class="minimap"><img src="' + localmap + '"></div>';
			div += '</div>';
			$('#replaylist').append(div);

			/*
		    var mapfilenamebase = mapname.toLowerCase().split(' ').join('_');
		    var mapfilename1 = mapfilenamebase+'.sd7';
		    var mapfilename2 = mapfilenamebase+'.sdz';
			console.log(mapfilename1);
		    
		    var url1 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilename1 + '/maps/BAfiles_metadata/minimap_9.png';
		    var url2 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilename2 + '/maps/BAfiles_metadata/minimap_9.png';
	*/

			/*
		    $.ajax({ 
	            url: url1,             
	            type: 'HEAD', 
	            error: function()  
	            {                 
					$.ajax({ 
			            url: url2,             
			            type: 'HEAD', 
			            success: function()  
			            { 
							var imgdiv = '<img class="map" src="'+url2+'">';
							$div.append(imgdiv);				        
			            } 
			        });     
	            }, 
	            success: function()  
	            { 
					var imgdiv = '<img class="map" src="'+url1+'">';
					$div.append(imgdiv);
	            } 
	        });
	*/
		});
	});
}

if (fs.existsSync(replaysdir2)) {
	fs.readdir(replaysdir2, (err, files) => {
		files.forEach(file => {
			var data = file.replace('_103.sdfz', '').split('_');
			var date = data[0];
			var hour = data[1];
			var mapname = data.slice(2).join('');

			var localmap =
				minimapsdir +
				mapname
					.toLowerCase()
					.split(' ')
					.join('_') +
				'.png';

			var div = '<div class="replayitem" data-path="' + replaysdir2 + file + '">';
			div += '<div class="infos">';
			div += '<div class="meta">' + date + '</div>';
			div += '<div class="meta">' + hour + '</div>';
			div += '<div class="meta">' + mapname + '</div>';
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
