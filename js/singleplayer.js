import { socketClient } from './socket.js';

var spawn = require('child_process').spawn,
	fs = require('fs');

const os = require('os');
const platform = os.platform();
const path = require('path');
const log = require('electron-log');

import { springdir } from './init.js';

var enginesfolder = path.resolve(springdir, 'engine'); 

fs.readdir(enginesfolder, (err, enginefiles) => {
	enginefiles.forEach(engineversion => {
					
		var dirContent = path.resolve(enginesfolder, engineversion);
		
		if (fs.statSync(dirContent).isDirectory()) {
			
			var div = '<div class="engineitem" data-engine="'+engineversion+'">';
			div += '<div class="spring"><img src="assets/images/spring.png" style="width:100px; height:100px;"></div>';
			div += '<div class="play">START SINGLEPLAYER</div><div class="engine-info" style="margin: 1em;">Engine ' + engineversion +'</div></div>';
			
			$('#enginelist').append(div);
			
		}
	});
});


$('body').on('click', '.engineitem', function(e) {	
	
	var engineversion = $(this).data('engine');
	
	if (platform == 'win32') {		
		var enginefile = springdir + 'engine\\' + engineversion + '\\spring.exe';								
	} else if (platform == 'darwin') {
		var enginefile = springdir + 'engine/' + engineversion + '/Spring_' + engineversion + '.app/Contents/MacOS/spring';
	} else if (platform == 'linux') {
		var enginefile = springdir + 'engine/' + engineversion + '/spring';
	}
	
	const bat = spawn( enginefile , {
		detached: true,
		stdio: 'ignore',
	});
	
	bat.unref();
	
});
