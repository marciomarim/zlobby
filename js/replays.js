var spawn  = require('child_process').spawn,
	fs = require('fs');	

import {springdir, mapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl} from './init.js'


fs.readdir(replaysdir, (err, files) => {
	files.forEach(file => {
		
		var data = file.replace('_103.sdfz','').split('_');
		var date = data[0];
		var hour = data[1];
		var mapname = data.slice(2).join('');
		
		var div = '<div class="replayitem">';
				div += '<div class="infos">';
					div += '<div class="meta">'+date+'</div>';
					div += '<div class="meta">'+hour+'</div>';
					div += '<div class="meta">'+mapname+'</div>';
				div += '</div>';
				//div += '<div class="minimap">';
				//div += '</div>';
			div += '</div>';
		$('#replaylist').append(div);
		
/*
		if (file == '20200819_192404_Dworld Acidic_103.sdfz'){
			var replaydata = fs.readFileSync(replaysdir + file );
			console.log(replaydata);	
		}
*/
		
		
		//const contents = fs.readFileSync(replaysdir + file, {encoding: 'base64'});
	});
});



$('body').on('click', '.replayitem', function(e) {
	
	var replaypath = replaysdir + $(this).text();
	
	try {
		  if (fs.existsSync(infologfile)) {
		    //file exists
		    fs.unlinkSync(infologfile);
		  }
		}catch(e) { } 
		
		// start recording logs
		var out = fs.openSync( infologfile , 'a');
	    var err = fs.openSync( infologfile, 'a');	
    
	const bat = spawn( enginepath , [replaypath], {
			detached: true,
		    stdio: [ 'ignore', out, err ]
		});		
		
		bat.unref();
	
});