import {socketClient} from './socket.js'

import {springdir, mapsdir, modsdir, replaysdir, chatlogsdir, enginepath, infologfile} from './init.js'

var fs = require('fs');	

var Filter = require('bad-words'),
    filter = new Filter();
    

//const { spawn } = require('child_process');
	
export default class Utils {
    
    constructor() {}
    
    
    get timenow() {
        var today = new Date();
        return today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes() +  ":" + (today.getSeconds()<10?'0':'') + today.getSeconds();
    }
    
    
    urlify(string){
	  const urls = string.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g);
	  if (urls) {
	    urls.forEach(function (url) {
	      string = string.replace(url, '<a class="open-in-browser" target="_blank" href="' + url + '">' + url + "</a>");
	    });
	  }
	  return string.replace("<br/>", "");
	}
	
	
	append_to_terminal( message ) {
		
		if (message == 'PONG' || message == '\n' || message == ' ' || message == '')
			return false;
			
		$('#server').append('<li>'+message+'</li>');	
	  
	}
	
/*
	filter_battles(){
		
		if ($('.gamefilter').prop("checked") == true){
			var game = 'Balanced Annihilation V';
		}
		
	}
*/
	
	create_chat_window( username ){
				
		$('.userchat.active').removeClass('active');
		
		var chat = '<div class="userchat active" data-username="'+username+'">';
		chat += '<div class="actions">';
		chat += '<div class="clearchat" data-username="'+username+'">CLEAR</div>';
		chat += '<div class="closewin" data-username="'+username+'">CLOSE</div>';
		chat += '<div class="deletechat" data-username="'+username+'">DELETE</div>';
		chat += '</div>';
		//chat += '<div class="title">'+username+'</div>';
		chat += '<div class="text-scroll"><ul class="messages"></ul></div>';
		chat += '<div class="bottom-input"><input type="text" class="userchat_input" data-username="'+username+'"/ placeholder="Message @'+username+'"></div>';
		chat += '</div>';		
		
		$('#chats').append(chat);
		
	}
	
	init_chat( username ){
		
		var safe_username = jQuery.escapeSelector( username );
		console.log(username);
		
		// if chat doesnt exit, create
		if ( !$('.userchat[data-username="'+safe_username+'"]').length ){						
			this.create_chat_window(username);							
		}else{
			if(!$('.userchat[data-username="'+safe_username+'"]').hasClass('active')){
				$('.userchat.active').removeClass('active');
				$('.userchat[data-username="'+safe_username+'"]').addClass('active');	
			}							
		}
		$('.active .userchat_input').focus();
		
		fs.readFile( chatlogsdir + 'pm-'+username+'.log', function (err, data) {
			if (err) throw err;
			if(data)
				$('.userchat[data-username="'+safe_username+'"] .messages').html(data.toString());
		});
		
		// create active chats button
		if (!$('#activechats .userpm-select[data-username="'+safe_username+'"]').length ){
			//check if user is online
			if ( $('#chat-list li[data-username="'+safe_username+'"]').length ){
				var div = '<div class="userpm-select online" data-username="'+username+'">'+username+'</div>';
			}else{
				var div = '<div class="userpm-select" data-username="'+username+'">'+username+'</div>';
			}			
			
			$('#activechats .buttons').append(div);
		}
		
		setTimeout( function(){
			$('.userchat[data-username="'+safe_username+'"] .text-scroll').scrollTop($('.userchat[data-username="'+safe_username+'"] .messages')[0].scrollHeight); 	
		}, 500);
		
		
	}
	
	
	add_message_to_chat(username, message, me){
		
		
		// if user not online, mark messages as unsent
		var user_online = $('#chat-list li[data-username="'+jQuery.escapeSelector(username)+'"]').length;		
		var $bubble = $('<li></li>');				

		if (me){			
			$bubble.addClass('mine');
			$bubble.append('<div class="messageinfo"><div class="userspeaking">Me</div><div class="time">' + this.timenow +'</div></div><div class="message">' +message+'</div>');
		}else{
			$bubble.append('<div class="messageinfo"><div class="userspeaking">'+username+'</div><div class="time">' + this.timenow +'</div></div><div class="message">' +message+'</div>');
		}
			
		if (!user_online){
			$bubble.addClass('offline');
		}
					
		$('.userchat[data-username="'+jQuery.escapeSelector(username)+'"] .messages').append($bubble);    	
    	$('.userchat[data-username="'+jQuery.escapeSelector(username)+'"] .text-scroll').scrollTop($('.userchat[data-username="'+jQuery.escapeSelector(username)+'"] .messages')[0].scrollHeight);    	    	
				
		// save chat info
		var container = $bubble.wrap('<p/>').parent().html();

		// save if not bot
		if ( !$('#chat-list li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').hasClass('bot') )
			fs.appendFileSync( chatlogsdir + 'pm-'+username+'.log', container );
		
		//reorder active chats
		$('#activechats .userpm-select').each(function( index ) {
			$(this).css('order', index+1);
		});
		$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').css('order', '0').addClass('active');
		
		// update unread messages count if not mine
		if ( $('#chatlist').hasClass('active') && $('.userchat[data-username="'+jQuery.escapeSelector(username)+'"]').hasClass('active') && $('body').hasClass('focus') ){								
			// chat is open and active
		}else{
			if (!me){
				if ($('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text()){
					var unread = parseInt($('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text());
					unread += 1;	
					$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text(unread);
				}else{
					var unread = 1;
					$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').append('<div class="unread">'+unread+'</div>');
				}				
				this.update_global_unread_count();
				
				$('#messagesound')[0].play();
				
				var notification = new Notification( username + ' said', {
				  body: message
				});
				
				notification.onclick = () => {
					$('.tab, .rcontainer, .container.active').removeClass('active');
					$('#chatlist, #chats').addClass('active');
					$('.userchat, .userpm-select').removeClass('active');		
					$('.userchat[data-username="'+jQuery.escapeSelector(username)+'"], .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').addClass('active');
					
					if( $('.userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').length )
						$('.userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').remove();
					
					$('.userchat[data-username="'+jQuery.escapeSelector(username)+'"] .text-scroll').scrollTop($('.userchat[data-username="'+jQuery.escapeSelector(username)+'"] .messages')[0].scrollHeight);	
					this.update_global_unread_count();
				}	
			}
		}										
		
	}
	
	
	send_unsent_message(username, html){
		
		//var newhtml = html.replace('offline', '');		
		fs.readFile(chatlogsdir + 'pm-'+username+'.log', function (err, data) {
		    if (err) throw err;
		    var content = data.toString().replace(html, '');
		    fs.writeFileSync(chatlogsdir + 'pm-'+username+'.log', content);
		});		
				
	}
	
	update_global_unread_count(){
		var count = 0;
		$('#activechats .userpm-select .unread').each( function(){
			count += parseInt( $(this).text());
		});
		if ( count == 0 )
			count = '';
		$('.tab.chatlist .count').text( count );
	}
	
	
	clear_user_chat(username){
		
		fs.unlinkSync(chatlogsdir + 'pm-'+username+'.log');		
		$('.userchat[data-username="'+jQuery.escapeSelector(username)+'"] .messages').empty();
		
	}
	
	
	// load all chats at startup
	load_chats(){
		fs.readdir( chatlogsdir , (err, files) => {
			files.forEach(file => {
				
				if (file.startsWith("pm")){
					var username = file.replace('pm-', '').replace('.log', '');
					//console.log(username);
					if ( !$('.userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').length ){						
						if ( $('#chat-list li[data-username="'+jQuery.escapeSelector(username)+'"]').length ){
							var div = '<div class="userpm-select online" data-username="'+username+'">'+username+'</div>';
						}else{
							var div = '<div class="userpm-select" data-username="'+username+'">'+username+'</div>';
						}
						$('#activechats .buttons').append(div);	
					}
					
				}
		
			});
		});
	}
	
	
	
	
	create_channel_window( chanName ){
		
		$('.channelchat.active').removeClass('active');
		
		var channel = '<div class="channelchat active" data-channame="'+chanName+'">';
			
			channel += '<div class="channelusers">';
			
			channel += '</div>';	
			
			channel += '<div class="right">';		
				channel += '<div class="actions">';
				channel += '<div class="clearchannel" data-channame="'+chanName+'">CLEAR</div>';
				channel += '<div class="closewin" data-channame="'+chanName+'">LEAVE</div>';
				channel += '</div>';
				channel += '<div class="text-scroll"><ul class="messages"></ul></div>';
				channel += '<div class="bottom-input"><input type="text" class="channelchat_input" data-channame="'+chanName+'"/ placeholder="Message @'+chanName+'"></div>';
			channel += '</div>';			
		
		channel += '</div>';		
		
		$('#channels').append(channel);
		
	}
	
	init_channel( chanName ){
		
		// if chat doesnt exit, create
		if ( !$('.channelchat[data-channame="'+chanName+'"]').length ){						
			this.create_channel_window(chanName);							
		}else{
			if(!$('.channelchat[data-channame="'+chanName+'"]').hasClass('active')){
				$('.channelchat.active').removeClass('active');
				$('.channelchat[data-channame="'+chanName+'"]').addClass('active');	
			}							
		}
		$('.active .channelchat_input').focus();
		
		fs.readFile( chatlogsdir + 'channel-'+chanName+'.log', function (err, data) {
			if (err) throw err;
			if(data)
				$('.channelchat[data-channame="'+chanName+'"] .messages').html(data.toString());
		});
		
		setTimeout( function(){
			$('.channelchat[data-channame="'+chanName+'"] .text-scroll').scrollTop($('.channelchat[data-channame="'+chanName+'"] .messages')[0].scrollHeight); 	
		}, 500);
				
	}
	
	clear_channel_chat(chanName){
		
		fs.unlinkSync(chatlogsdir + 'channel-'+chanName+'.log');		
		$('.channelchat[data-channame="'+chanName+'"] .messages').empty();
		
	}
	
	
	add_message_to_channel(chanName, username, message){
		
		var $bubble = $('<li></li>');				
		
		var me = false;
		if ( username == $('#myusername').text() ){
			me = true;
		}
		
		if (me){			
			$bubble.addClass('mine');
			$bubble.append('<div class="messageinfo"><div class="userspeaking">Me</div><div class="time">' + this.timenow +'</div></div><div class="message">' +message+'</div>');
		}else{
			$bubble.append('<div class="messageinfo"><div class="userspeaking">'+username+'</div><div class="time">' + this.timenow +'</div></div><div class="message">' +message+'</div>');
		}					
					
		$('.channelchat[data-channame="'+chanName+'"] .messages').append($bubble);    	
    	$('.channelchat[data-channame="'+chanName+'"] .text-scroll').scrollTop($('.channelchat[data-channame="'+chanName+'"] .messages')[0].scrollHeight);    	    	
				
		// save chat info
		var container = $bubble.wrap('<p/>').parent().html();
		fs.appendFileSync( chatlogsdir + 'channel-'+chanName+'.log', container );
		
		//reorder active chats
/*
		$('#activechats .userpm-select').each(function( index ) {
			$(this).css('order', index+1);
		});
		$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').css('order', '0').addClass('active');
*/
		
		// update unread messages count if not mine
/*
		if ( $('#channels').hasClass('active') && $('.channelchat[data-channame="'+chanName+'"]').hasClass('active') ){								
			// chat is open and active
		}else{
			if (!me){
				if ($('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text()){
					var unread = parseInt($('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text());
					unread += 1;	
					$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"] .unread').text(unread);
				}else{
					var unread = 1;
					$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').append('<div class="unread">'+unread+'</div>');
				}				
				this.update_global_unread_count();	
			}
		}	
*/									
		
	}
	
	
	
	
	
	
	
	
	
	init_battlerrom_chat(){
		
		var battleid = $('#battleroom .battleid').text();
		fs.readFile(chatlogsdir + 'battleroom-'+battleid+'.log', function (err, data) {
			if (err) throw err;
			if(data)
				$('#battle-room').html(data.toString());				
		});
						
		setTimeout( function(){
			if ($('.showhostmessages').prop("checked") == true){			
				$('.ishost').removeClass('hidemessage');			
			}else{
				$('.ishost').addClass('hidemessage');			
			}
			$('#battleroom .text-scroll').scrollTop($('#battle-room')[0].scrollHeight);			
		}, 1000 );
		
		
	}
	
	
	append_message_battleroom( username, message ){
		
		var myusername = $('#myusername').text();
		var amiplaying = false;
		
		if ( $('.battle-playerlist li[data-username="'+jQuery.escapeSelector(myusername)+'"]').length )
			amiplaying = true;
			
		var ring = message.startsWith("* Ringing");
		var talkingabout = message.toUpperCase().indexOf( myusername.toUpperCase() );					
		var ishost = message.startsWith("* ");
		var winner = -1;
		var vote = -1;
		var endvote = -1;
		var myvote = -1;
		
		if (ishost >= 0){
			winner = message.indexOf('won!');
			vote = message.indexOf('called a vote for command');	
			endvote = message.indexOf('* Vote cancelled');
			myvote = message.indexOf('by '+myusername);
			//var endvote = message.indexOf('Vote for command');	
		}		
		
		if(ring && talkingabout >= 0 && myvote < 1){
			//console.log('ringing');
			$('#ringsound')[0].play();
		}
		message = message.replace('\n', ' ');					
		message = $('<div/>').text(message).html();					
		message = this.urlify(message);					
		message = message.replace(/<br\s*\/?>/gi,' ');	
		if ($('.rudechat').prop("checked") == true){				
			message = filter.clean(message);
		}
		
		var $bubble = $('<li></li>');
		var last_user_msg = $('#battle-room li .userspeaking').last().text();
		//console.log(last_user_msg);
		
		if(username == last_user_msg){
			$bubble.append('<div class="messageinfo hidden"><div class="userspeaking">'+username + '</div><div class="time">'+this.timenow+'</div></div><div class="message">' +message+'</div>');	
		}else{
			$bubble.append('<div class="messageinfo"><div class="userspeaking">'+username + '</div><div class="time">'+this.timenow+'</div></div><div class="message">' +message+'</div>');
		}
		
		
		if( username == myusername ){						
			$bubble.addClass('mine');						
		}else if( ishost ){
			$bubble.addClass('ishost');												
			if ($('.showhostmessages').prop("checked") == false){
				setTimeout(function() {
				  $bubble.addClass('hidemessage');
				}, 8000);
			}
		}
							
		if (talkingabout >= 0){
			$bubble.addClass('talkingabout');
			if( !$('body').hasClass('ingame') )
				$('#messagesound')[0].play();
		}
		
		if (winner  >= 0){
			$bubble.addClass('winner');
		}
		
		if (vote >= 0 && amiplaying){
			$('#messagesound')[0].play();
			$bubble.addClass('vote');
			$('#votewin').addClass('active');
			
			$('#votefor').text(message.replace('[!vote y, !vote n, !vote b]', ''));
			
			setTimeout(function(){
				$('#votewin').removeClass('active');	
			}, 45000);
		}
		
		if (endvote >= 0){	
			$('#votewin').removeClass('active');
		}	
		
/*
		if (endvote >= 0){
			$('#votewin').removeClass('active');
		}
*/
		
		$('#battle-room').append($bubble);																														
				
		// scroll to bottom
		if ($('.autoscrollbattle ').prop("checked") == true){
			$('#battleroom .text-scroll').scrollTop($('#battle-room')[0].scrollHeight);	
		}
		
		// save battle log
		if ($('.savechats').prop("checked") == true){
			var battleid = $('#battleroom .battleid').text();
			var container = $bubble.wrap('<p/>').parent().html();
			fs.appendFileSync(chatlogsdir + 'battleroom-'+battleid+'.log', container );
		}
		
					
	}
	
	
	clear_battleroom_chat(){
		
		var battleid = $('#battleroom .battleid').text();
		fs.unlinkSync(chatlogsdir + 'battleroom-'+battleid+'.log');		
		$('#battle-room').empty();
		
	}
	
	
	getColor(){
		var r = 0;
		var g = 0;
		var b = 0;
		
		var color = $('.colorpicked').css("background-color").replace('rgb(', '').replace(')','').split(',');
		if(color.length == 3){
			r = color[0];
			g = color[1];
			b = color[2];	
		}				
		return b << 16 | g << 8 | r;
	}
	
	

	
	// to do
    sendstatus(){
		/*
	    b0 = in game (0 - normal, 1 - in game)
		b1 = away status (0 - normal, 1 - away)
		b2-b4 = rank (see Account class implementation for description of rank) - client is not allowed to change rank bits himself (only server may set them).
		b5 = access status (tells us whether this client is a server moderator or not) - client is not allowed to change this bit himself (only server may set them).
		b6 = bot mode (0 - normal user, 1 - automated bot). This bit is copied from user's account and can not be changed by the client himself. Bots differ from human 
		players in that they are fully automated and that some anti-flood limitations do not apply to them.
		*/
	    var ingame = 0,
			away = 0,
			bot = 0;
		
		if ($('body').hasClass("ingame") == true){
			ingame = 1;
		}else{
			ingame = 0; //unspec
		}
		
		/*
		if ($('.meaway').prop("checked") == true){
			away = 1;
		}else{
			away = 0; 
		}
		*/
			
		var bitcode = ingame + away*2;		
		var command = 'MYSTATUS ' + bitcode + '\n';
		socketClient.write( command );
    }
    
    
    
    sendbattlestatus(){
	    
	    var myusername = $('#myusername').text();
	    //b2..b5 = team no. (from 0 to 15. b2 is LSB, b5 is MSB)
		//b6..b9 = ally team no. (from 0 to 15. b6 is LSB, b9 is MSB)						
		
		
	    var ready = 0,
			team = 0,
			ally = 0,
			spec = 0,
			synced = 1,
			faction = 0;
		
		synced = this.getsyncstatus();
		
		ally = $('#battleroom li[data-username="'+jQuery.escapeSelector(myusername)+'"] .ally').text();		
		if (ally >= 1){
			ally = ally - 1;
		}else{
			ally = 0;
		}
			
		
		team = $('#battleroom li[data-username="'+jQuery.escapeSelector(myusername)+'"] .team').text();		
		if (team >= 1){
			team = team -1;
		}else{
			team = 0;
		}
			
		
		if ($('.specbattle').prop("checked") == true){
			spec = 0;
		}else{
			spec = 1; //unspec
		}
		
		if ($('.readybattle').prop("checked") == true){
			ready = 1;
			spec = 1; //try to unspec 
		}
		
		if ($('.pickarm').hasClass("active")){
			faction = 0;
		}else{
			faction = 1;
		}

		// team*2**3  + ally*2**7
		var bitcode = ready*2 + 2**2*(team) + 2**6*(ally) + spec*2**10 + 2**(23 - synced) + faction*2**24 ; //2**(25 - faction);			
		var command = 'MYBATTLESTATUS ' + bitcode + ' ' + this.getColor() + '\n';										
		socketClient.write( command );
		
    }
    
    
    
    getsyncstatus(){
	    
	    var currentmod = $('#battleroom .gameName').text().toLowerCase();
	    var index = currentmod.lastIndexOf(" ");
	    var filename = currentmod.substring(0, index).replace(" ","_") + '-' + currentmod.substring(index).replace(" ","")+'.sdz';
	    
	    if (fs.existsSync(modsdir+filename)) {
		    //console.log('STATUS: GAME OK');
			var currentmap = $('#battleroom .mapname').text().toLowerCase();
		    currentmap = currentmap.split(' ').join('_');
		    var filename = currentmap+'.sd7';
		    var filename2 = currentmap+'.sdz';		    
		    
		    if (fs.existsSync(mapsdir+filename) || fs.existsSync(mapsdir+filename2)) {
			    //console.log('STATUS: MAP OK');
			    return 1;
			}else{
				//console.error('STATUS: MAP MISSING');
				return 0;	
			}
			        
		}else{
			//console.error('STATUS: GAME MISSING');
			return 0;
		}
		
    }
    
	
	
    
}

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}