var spawn  = require('child_process').spawn,
	fs = require('fs');

import {socketClient} from './socket.js';

import Utils from './utils.js';
let utils = new Utils();

const Store = require('electron-store'); 
const store = new Store();
    
const crypto = require("crypto");
const {ipcRenderer} = require("electron");

import {springdir, mapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile, scriptfile, remotemodsurl, remotemapsurl} from './init.js'

import {trackEvent} from './init.js';

export default class Battle {
    
    constructor() {
	    
    }

    checkgame(){
	    
	    var currentmod = $('#battleroom .gameName').text().toLowerCase();
	    var index = currentmod.lastIndexOf(" ");
	    var filename = currentmod.substring(0, index).replace(" ","_") + '-' + currentmod.substring(index).replace(" ","")+'.sdz';
	    var modexist = false;	 	    	       	    
	    
	    if (fs.existsSync(modsdir+filename)) {
		    console.log('Game exist');
		    this.checkmap();
		}else{
			console.log('Game need download!');
			var fileurl = remotemodsurl+filename;			
			var battle = this;
			
			// check if file exist first
			$.ajax({ 
                url: fileurl, 
                type: 'HEAD', 
                error: function()  
                { 
                    console.log(fileurl + ' doesnt exist!');
                    $('#battleroom .game-download').addClass('downloading');
                    $('#battleroom .game-download .download-title').text('Game not found for download.');	 
                    battle.checkmap();
                }, 
                success: function()  
                { 
                    console.log(fileurl + ' exist!');
                    battle.downloadgame(fileurl);
                } 
            });
			
		}
		
    }
    
    
    downloadgame(fileurl){
	    
	    $('#battleroom .game-download').addClass('downloading');
	    
	    ipcRenderer.send("download", {
		    url: fileurl,
		    properties: {directory: modsdir}
		});

		ipcRenderer.on("download progress", (event, progress) => {			
			var w = Math.round( progress.percent*100 ) + '%';
			$('#battleroom .game-download .download-title').text('Downloading game: ' + w + ' of 100%');
			$('#battleroom .game-download .progress').css('width', w);
		});
		
		ipcRenderer.on("download complete", (event, progress) => {
			$('#battleroom .game-download .download-title').text('Downloading game: Completed!');			
			$('#battleroom .game-download').removeClass('downloading');
			this.checkmap();
		});
    }
    
    
    checkmap(){
	    
	    var currentmap = $('#battleroom .mapname').text().toLowerCase();
	    currentmap = currentmap.split(' ').join('_');
	    var filename = currentmap+'.sd7';
	    var filename2 = currentmap+'.sdz';
	    var mapexist = false;	    
	    console.log(filename);
	    
	    if (fs.existsSync(mapsdir+filename) || fs.existsSync(mapsdir+filename2)) {
		    console.log('Map exist');
		}else{
			
			var fileurl = remotemapsurl+filename;
			var fileurl2 = remotemapsurl+filename2;			
			console.log('Need need download! ' + fileurl);			
			var battle = this;
			
			// check if file exist first
			$.ajax({ 
                url: fileurl, 
                type: 'HEAD', 
                error: function()  
                { 
                    console.log(fileurl + ' doesnt exist!');
                    $.ajax({ 
		                url: fileurl2, 
		                type: 'HEAD', 
		                error: function()  
		                { 
		                    console.log(fileurl2 + ' doesnt exist!');
		                    $('#battleroom .map-download').addClass('downloading');
		                    $('#battleroom .map-download .download-title').text('Map not found for download.');	
		                }, 
		                success: function()  
		                { 
		                    console.log(fileurl2 + ' exist!');
		                    battle.downloadmap(fileurl2);
		                } 
		            }); 
                }, 
                success: function()  
                { 
                    console.log(fileurl + ' exist!');
                    battle.downloadmap(fileurl);
                } 
            });
                                 
			
		}
		
    }
    
    downloadmap(fileurl){
	    
	    $('#battleroom .map-download').addClass('downloading');
	    
	    ipcRenderer.send("download", {
		    url: fileurl,
		    properties: {directory: mapsdir}
		});			
		
		ipcRenderer.on("download progress", async (event, progress) => {			
			var w = Math.round( progress.percent*100 ) + '%';
			$('#battleroom .map-download .download-title').text('Downloading map: ' + w + ' of 100%');
			$('#battleroom .map-download .progress').css('width', w);											
		});
		
		ipcRenderer.on("download complete", (event, progress) => {
			$('#battleroom .map-download .download-title').text('Downloading map: Completed!');
			setTimeout( function(){
				$('#battleroom .map-download').removeClass('downloading');
			}, 4000);
		});
		
    }
    
    
    createbattleroom(){
	    
	    $('#battleroom').empty();	    
	    var battlediv = $('#battleroomtemplate').contents().clone();
		$('#battleroom').append( battlediv );
	    
    }
    
    
        

    
    load_remote_map_image( battleid ){
	    
	    //console.log(mapname);
	    
	    var mapname = $('.battle-card[data-battleid="'+battleid+'"] .mapname').text();
	    var mapfilenamebase = mapname.toLowerCase().split(' ').join('_');
	    var mapfilename1 = mapfilenamebase+'.sd7';
	    var mapfilename2 = mapfilenamebase+'.sdz';
	    
	    var url1 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilename1 + '/maps/BAfiles_metadata/minimap_9.png';
	    var url2 = 'https://files.balancedannihilation.com/data/mapscontent/' + mapfilename2 + '/maps/BAfiles_metadata/minimap_9.png';
	    
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
						$('.battle-card[data-battleid="'+battleid+'"] .minimap').html(imgdiv);
				        if ( $('#battleroom .battleid').text() == battleid ){
				        	$('#battleroom #battle-minimap').html(imgdiv);
				        }
		            } 
		        });     
            }, 
            success: function()  
            { 
				var imgdiv = '<img class="map" src="'+url1+'">';
				$('.battle-card[data-battleid="'+battleid+'"] .minimap').html(imgdiv);
		        if ( $('#battleroom .battleid').text() == battleid ){
		        	$('#battleroom #battle-minimap').html(imgdiv);
		        }		
            } 
        });
        
        
        		
    }
    
    openbattle( cmd, parts ){
		
		var sentences = cmd.split('\t');					 
		parts = sentences[0].split(" ");		
		
		var battleid = parts[1];
		if ( $('.battle-card[data-battleid="'+battleid+'"]').length ){
			this.closebattle( battleid );
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
		
		var mapname = parts.slice(11).join(' ');
		
		var title = sentences[1].split(')').slice(1);
		var gameName = sentences[2];
		
		var engine = sentences[1].slice(sentences[1].indexOf("(") + 1, sentences[1].indexOf(")"));					    	    	    	    
	    	
		var battlediv = '<div class="header">';
				
				battlediv += '<div class="infos">';
				
					battlediv += '<div class="meta">';
					battlediv += '<div class="battleid">'+battleid+'</div>';	
					battlediv += '<div class="status">🟢</div>';
					battlediv += '<div class="locked">⚪️</div>';	
					battlediv += '<div class="players icon icon-ingame">0</div>';
					battlediv += '<div class="spectatorCount icon icon-spec">0</div>';
					battlediv += '<div class="nUsers" style="display:none;">1</div>';
					battlediv += '<div class="maxPlayers">'+maxPlayers+'<span class="upper">MAX</span></div>';
					battlediv += '<div class="passworded icon icon-locked '+passworded+'"></div>';
					battlediv += '<div class="ip">'+ip+'</div>';
					battlediv += '<div class="port">'+port+'</div>';
					battlediv += '<div class="maphash">'+maphash+'</div>';
					battlediv += '<div class="rank icon icon-rank'+rank+'"></div>';
					battlediv += '</div>';			
					
					battlediv += '<div class="battletitle">'+title+'</div>';
					
					battlediv += '<div class="meta2">';			
					battlediv += '<div class="gameName icon icon-mod">'+gameName+'</div>';
					battlediv += '<div class="mapname">'+mapname+'</div>';
					battlediv += '<div class="username founder icon icon-bot">'+username+'</div>';
					battlediv += '<div class="engine">'+engine+'</div>';
					battlediv += '</div>';
				
				battlediv += '</div>';
				
				battlediv += '<div class="minimap"></div>';
				
			battlediv += '</div>';
			
			battlediv += '<div class="playerlist"></div>';
				
		
		$('#battle-list').append('<div class="battle-card" data-battleid="'+battleid+'" data-founder="'+username+'">'+battlediv+'</div>');
		
		$('.tab.battlelist .count').text( $('.battle-card').length );
		
		//this.load_remote_map_image( battleid );
		
    }
    
    
	closebattle( battleid ){
		
		$('.battle-card[data-battleid="'+battleid+'"]').remove();				
		$('.tab.battlelist .count').text( $('.battle-card').length );
					
	}
	
	updatebattleinfo( battleid, spectatorCount, locked, maphash, mapname ){
		
		$('.battle-card[data-battleid="'+battleid+'"] .spectatorCount').text(spectatorCount);		
		$('.battle-card[data-battleid="'+battleid+'"] .mapname').text(mapname);
		
				
		this.load_remote_map_image( battleid );
		
		if(locked===0){
			$('.battle-card[data-battleid="'+battleid+'"] .locked').text('🔒');	
		}else{
			$('.battle-card[data-battleid="'+battleid+'"] .locked').text('⚪️');	
		}
						
		var nUsers = parseInt( $('.battle-card[data-battleid="'+battleid+'"] .nUsers').text(), 10);
		var players = nUsers - spectatorCount;
		$('.battle-card[data-battleid="'+battleid+'"] .players').text(players);
		
		// update options
		if ( $('#battleroom .battleid').text() == battleid ){
						
			//$('#battleroom #battle-minimap').append($('.battle-card[data-battleid="'+battleid+'"] .map').clone());
			
			$('#battleroom .spectatorCount').text(spectatorCount);	
			$('#battleroom .mapname').text(mapname);
			
			//$('#battleroom #battle-minimap').html($('.battle-card[data-battleid="'+battleid+'"] .map').clone());
			
			if(locked===0){
				$('#battleroom .locked').text('🔒');	
			}else{
				$('#battleroom .locked').text('⚪️');	
			}
			$('#battleroom .players').text(players);
			
			//download map if doesnt have it
			
			var obj = this;
			setTimeout( function(){
				if ( !$('#battleroom .game-download').hasClass('downloading') ){
					obj.checkmap();
				}
			}, 1000);
			
			
			
			
		}
		
	}
	
	
	
	// when I join a battle and get a confirmation
	joinbattle( battleid, hashCode, channelName ){
		
		trackEvent('User', 'joinbattle');
		this.createbattleroom();		
		
		$('body').addClass('inbattleroom');
		$('.battle-card[data-battleid="'+battleid+'"]').addClass('activebattle');
		
		$('.rcontainer, .tab').removeClass('active');
		$('.container').removeClass('active');
		$('#battleroom, .tab.battleroom').addClass('active');
		$('#battleroom input.chat').data('battleid', battleid);
		$('#battleroom').data('battleid', battleid);
		$('.tab.battleroom .status').addClass('active');
		
		$('#battleroom .title').text($('.battle-card[data-battleid="'+battleid+'"] .battletitle').text());
		

		$('#battleroom #battle-minimap').html($('.battle-card[data-battleid="'+battleid+'"] .map').clone());
		
		var meta = $('.battle-card[data-battleid="'+battleid+'"] .meta').clone();
		$('#battleroom .battle-main-info').append(meta);
		$('#battleroom .battle-main-info .meta .battleid').after('<div class="hashCode">'+hashCode+'</div>');
		$('#battleroom .battle-main-info .meta .battleid').after('<div class="channelName">'+channelName+'</div>');
		
		var meta = $('.battle-card[data-battleid="'+battleid+'"] .meta2').clone();
		$('#battleroom .battle-main-info').append(meta);
		
		//add host to playerlist
		var hostname = $('.battle-card[data-battleid="'+battleid+'"] .founder').text();
		var host = $('#chat-list li[data-username="'+hostname+'"]').clone();
		$('#battleroom .battle-playerlist').append(host);
		
		//add users to battle 
		var players = $('.battle-card[data-battleid="'+battleid+'"] .playerlist').contents().clone();
		$('#battleroom .battle-playerlist').append(players);
		
		
		var preferedfaction = store.get('battleroom.faction');
		if(preferedfaction == 0){
			$('.pickarm').removeClass('active');
			$('.pickcore').addClass('active');
		}				
		
		//check if game exist
		// after game, check if map exist
		this.checkgame();
		utils.init_battlerrom_chat();
		
		// maybe this solve ingame join
		utils.sendbattlestatus();
		
	}
    
    
    // when anyone joins a battle
    joinedbattle( battleid, username ){
	    
	    var nUsers = parseInt( $('.battle-card[data-battleid="'+battleid+'"] .nUsers').text(), 10) + 1;				
		$('.battle-card[data-battleid="'+battleid+'"] .nUsers').text(nUsers);
		
		var spectatorCount = parseInt( $('.battle-card[data-battleid="'+battleid+'"] .spectatorCount').text(), 10);				
		var players = nUsers - spectatorCount;
		$('.battle-card[data-battleid="'+battleid+'"] .players').text(players);					
		$('.battle-card[data-battleid="'+battleid+'"]').css('order', -players);
		
		//update chatlist
		$('#chat-list li[data-username="'+username+'"] .ingame').removeClass('false');
		
		// append user to bnattle-card
		var user = $('#chat-list li[data-username="'+username+'"]').clone();
		$('.battle-card[data-battleid="'+battleid+'"] .playerlist').append(user);
		
		
		if( $('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid') ){
			$('#battleroom .players').text(players);
			$('#battleroom .spectatorCount').text(spectatorCount);
			var user = $('#chat-list li[data-username="'+username+'"]').clone();
			$('#battleroom .battle-playerlist').append(user);	
		}				
		
    }
    
    leftbattle( battleid, username ){
	    
	    var nUsers = parseInt( $('.battle-card[data-battleid="'+battleid+'"] .nUsers').text(), 10) - 1;
		$('.battle-card[data-battleid="'+battleid+'"] .nUsers').text(nUsers);
		
		var spectatorCount = parseInt( $('.battle-card[data-battleid="'+battleid+'"] .spectatorCount').text(), 10);				
		var players = nUsers - spectatorCount;
		$('.battle-card[data-battleid="'+battleid+'"] .players').text(players);					
		$('.battle-card[data-battleid="'+battleid+'"]').css('order', -players);
		
		//update chatlist
		$('#chat-list li[data-username="'+username+'"] .ingame').addClass('false');			
		
		// remove user from bnattle-card				
		$('.battle-card li[data-username="'+username+'"]').remove();
		
		// if user is in my battle
		if( $('body').hasClass('inbattleroom') && battleid == $('#battleroom').data('battleid') ){
			$('#battleroom li[data-username="'+username+'"]').remove();						
		}
		
		// if i am leaving
		if ( username == $('#myusername').text() ){
			
			$('.tab.battleroom .status').removeClass('active');	
			$('.container').removeClass('active');
			$('#battlelist').addClass('active');
			
			
			$('#battleroom').empty();
			
			$('body').removeClass('inbattleroom');
			$('.activebattle').removeClass('activebattle');
		}
    }
    
	// when client get kicked    
    got_kicked(){
	    
	    $('.tab.battleroom .status').removeClass('active');	
		$('.container').removeClass('active');
		$('#battlelist').addClass('active');		
		
		$('#battleroom').empty();
		
		$('body').removeClass('inbattleroom');
		$('.activebattle').removeClass('activebattle');
		
    }
    
    
    setscripttags( parts ){
	    
	    var scriptTags = parts.slice(1).join(' ').split('\t');
				
		$.each( scriptTags, function( index, value ) {	
			
			var scriptTag = value.split('=');
			var val = scriptTag[1];
			
			var tag = scriptTag[0];
			var parts = tag.split('/');						
			
			if(parts[0] == 'game'){
			
				if (parts[1]=='players'){
				
					var username = parts[2];
					if(parts[3]=='skill'){
						val = val.replace('#', '').replace('#', '').replace('(', '').replace(')', '');
						$('.battle-players li:contains('+username+') .trueskill').text(val);
					}					
				
				}else 
				if(parts[1]=='modoptions'){
					
					var div = '<div class="option '+parts[2]+'">';
						div += '<div class="name">'+parts[2]+'</div>';
						div += '<div class="val">'+val+'</div>';
						div += '</div>';
					   
					$('#battleroom .modoptions').append(div);
						
				}else
				if(parts[1]=='mapoptions'){
					
					var div = '<div class="option '+parts[2]+'">';
						div += '<div class="name">'+parts[2]+'</div>';
						div += '<div class="val">'+val+'</div>';
						div += '</div>';
					   
					$('#battleroom .mapoptions').append(div);
						
				}else 
				if(parts[0]=='game'){
					
					var div = '<div class="option '+parts[1]+'">';
						div += '<div class="name">'+parts[1]+'</div>';
						div += '<div class="val">'+val+'</div>';
						div += '</div>';
					   
					$('#battleroom .gameoptions').append(div);
					
				}else{
					
					var div = '<div class="option '+tag+'">';
						div += '<div class="name">'+tag+'</div>';
						div += '<div class="val">'+val+'</div>';
						div += '</div>';
					   
					$('#battleroom .otheroptions').append(div);	
					
				}
				
			}
			
			
		});
		
		// copy game info, it could be done in joinbattle maybe
					
    }
    
    
    
    startasplayer(){

		var username = $('#myusername').text();
		
		var teams = [];
		var allys = [];
		
		var numplayers = $('.battle-playerlist li').length() + $('.battle-speclist li').length();
		//var numusers = numplayers+ $('.battle-speclist li').length();
		
		var script = '[GAME]\n{\n\t';
			script += 'gametype=Balanced Annihilation V11.0.0;\n\t'+
					'HostIP='+$('.battle-main-info .ip').text()+';\n\t'+
					'HostPort='+$('.battle-main-info .port').text()+';\n\t'+
					'IsHost=0;\n\t'+
					'MapHash='+$('.battle-main-info .maphash').text()+';\n\t'+
					'MapName='+$('.battle-main-info .mapname').text()+';\n\t'+
					'ModHash=2610892527;\n\t'+
					'MyPlayerName='+username+';\n\t'+
					'numplayers='+numplayers+';\n\t'+
					//'numrestrictions=0;\n\t'+
					//'numusers='+numusers+';\n\t'+
					'MyPasswd='+this.generatePassword(username)+';\n\t'+
					'StartPosType='+$('.gameoptions .startPosType').closest('.val').text()+';\n'+
					'}\n';
					

					
		var playercount = 0;
		$('.battle-playerlist li').each(function( index ) {
			var team = $(this).children('.team').text();
			var ally = $(this).children('.ally').text();
			var faction = 'ARM';
			if ($(this).children('.icon-core').length ){
				faction = 'CORE';
			}
			if(allys.indexOf(ally) === -1) {
			    allys.push(ally);
			}			
			script += '[PLAYER'+playercount+']\n'+
					'{\n\t'+
					'Name='+$(this).children('.name').text()+';\n\t'+
					'Team='+team+';\n\t'+
					'Spectator=0;\n'+
					'}\n';
			
			script += '[TEAM'+playercount+']\n'+
					'{\n\t'+
					'Teamleader='+playercount+';\n\t'+
					'Allyteam='+ally+';\n\t'+
					'Side='+faction+';\n\t'+
					'}\n';			
			playercount += 1;
					
		});
		
		$.each(allys, function(index, value){
				script += '[ALLYTEAM'+index+']\n'+
					'{\n\t'+
					'NumAllies='+$('.battle-playerlist li .ally:contains('+value+')').length+';\n\t'+
					'}\n';	
		});
		
		$('.battle-speclist li').each(function( index ) {
			//var team = $(this).children('team').text();
			//var ally = $(this).children('ally').text();
			script += '[PLAYER'+playercount+']\n'+
					'{\n\t'+
					'Name='+$(this).children('.name').text()+';\n\t'+
					'Team=0;\n\t'+
					'Spectator=1;\n'+
					'}\n';
			playercount += 1;		
		});
		
		
		script += '[mapoptions]\n{\n\t';
		$('.mapoptions .option').each(function( index ) {
			var name = $(this).children('.name').text();
			var val = $(this).children('.val').text();
			script += name + '=' + val + ';\n\t';
		});
		
		script += '}\n[modoptions]\n{\n\t';
		$('.modoptions').each(function( index ) {
			var name = $(this).children('.name').text();
			var val = $(this).children('.val').text();
			script += name + '=' + val + ';\n\t';
		});		
		script += '}\n';
									
		
		try { 
			fs.writeFileSync( scriptfile , script, 'utf-8' ); 
		}catch(e) { alert('Failed to save the script file!'); }		
		
		try {
		  if (fs.existsSync(infologfile)) {
		    //file exists
		    fs.unlinkSync(infologfile);
		  }
		}catch(e) { } 
		
		// start recording logs
		var out = fs.openSync( infologfile , 'a');
	    var err = fs.openSync( infologfile, 'a');

				
		const bat = spawn( enginepath , [scriptfile], {
			detached: true,
		    stdio: [ 'ignore', out, err ]
		});		
		
		bat.unref();
		
		bat.on('close', (code) => {
			var command = 'MYSTATUS ' + 0 + '\n';													
			socketClient.write( command );
		});	
		
    }
    
    
    
    
    
    
    
    
    
    
    
    
    launchgame(){

		var username = $('#myusername').text();
		
		var script = '[GAME]\n{\n\t';
			script += 'HostIP='+$('.battle-main-info .ip').text()+';\n\t'+
					'HostPort='+$('.battle-main-info .port').text()+';\n\t'+
					'IsHost=0;\n\t'+
					'MyPlayerName='+username+';\n\t'+
					'MyPasswd='+this.generatePassword(username)+';\n'+
					'}\n';		
		
		try { 
			fs.writeFileSync( scriptfile , script, 'utf-8' ); 
		}catch(e) { alert('Failed to save the script file!'); console.log(e);}			
		
		try {
		  if (fs.existsSync(infologfile)) {
		    //file exists
		    fs.unlinkSync(infologfile);
		  }
		}catch(e) { } 
		
		// start recording logs
		var out = fs.openSync( infologfile , 'a');
	    var err = fs.openSync( infologfile, 'a');
		
		const bat = spawn( enginepath , [scriptfile], {
			detached: true,
		    stdio: [ 'ignore', out, err ]
		});				
		
		bat.unref();	
		
		bat.on('close', (code) => {
			var command = 'MYSTATUS ' + 0 + '\n';													
			socketClient.write( command );
		});							
		

    }
    
    
    
    generatePassword(username) {	    
	    //var passwd = $.MD5(username);
	    //crypto.createHash('md5').update(data).digest("hex");
	    var passwd = crypto.createHash("md5").update(username).digest("hex");
	    return passwd.substring(0, 12);
	}
    
}