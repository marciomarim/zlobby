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
	  return string.replace("(", "<br/>(");
	}
	
	append_to_terminal( message ) {
		
		if (message == 'PONG' || message == '\n' || message == ' ' || message == '')
			return false;
			
		$('#server').append('<li>'+message+'</li>');	
	  
	}
	
	
	create_chat_window( username ){
		
		$('.userchat.active').removeClass('active');
		
		var chat = '<div class="userchat active" data-username="'+username+'">';
		chat += '<div class="actions">';
		chat += '<div class="clearchat" data-username="'+username+'">CLEAR</div>';
		chat += '<div class="closewin" data-username="'+username+'">CLOSE</div>';
		chat += '</div>';
		chat += '<div class="title">'+username+'</div>';
		chat += '<div class="text-scroll"><ul class="messages"></ul></div>';
		chat += '<div class="bottom-input"><input type="text" class="userchat_input" data-username="'+username+'"/ placeholder="Message @'+username+'"></div>';
		chat += '</div>';		
		
		$('#chats').append(chat);
		
	}
	
	init_chat( username ){
		
		// if chat doesnt exit, create
		if ( !$('.userchat[data-username="'+username+'"]').length ){						
			this.create_chat_window(username);							
		}else{
			if(!$('.userchat[data-username="'+username+'"]').hasClass('active')){
				$('.userchat.active').removeClass('active');
				$('.userchat[data-username="'+username+'"]').addClass('active');	
			}							
		}
		$('.active .userchat_input').focus();
		
		fs.readFile( chatlogsdir + 'pm-'+username+'.log', function (err, data) {
			if (err) throw err;
			if(data)
				$('.userchat[data-username="'+username+'"] .messages').html(data.toString());
		});
		
		// create active chats button
		if (!$('#activechats .userpm-select[data-username="'+username+'"]').length ){
			//check if user is online
			if ( $('#chat-list li[data-username="'+username+'"]').length ){
				var div = '<div class="userpm-select online" data-username="'+username+'">'+username+'</div>';
			}else{
				var div = '<div class="userpm-select" data-username="'+username+'">'+username+'</div>';
			}			
			
			$('#activechats').append(div);
		}
				
		$('.userchat[data-username="'+username+'"] .text-scroll').scrollTop($('.userchat[data-username="'+username+'"] .messages')[0].scrollHeight); 
		
	}
	
	
	add_message_to_chat(username, message, me){
		
		// if user not online, mark messages as unsent
		var user_online = $('#chat-list li[data-username="'+username+'"]').length;		
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
					
		$('.userchat[data-username="'+username+'"] .messages').append($bubble);    	
    	$('.userchat[data-username="'+username+'"] .text-scroll').scrollTop($('.userchat[data-username="'+username+'"] .messages')[0].scrollHeight);    	    	
				
		// save chat info
		var container = $bubble.wrap('<p/>').parent().html();
		fs.appendFileSync( chatlogsdir + 'pm-'+username+'.log', container );
		
		//reorder active chats
		$('#activechats .userpm-select').each(function( index ) {
			$(this).css('order', index+1);
		});
		$('#activechats .userpm-select[data-username="'+username+'"]').css('order', '0').addClass('active');
		
		// update unread messages count if not mine
		if (!me){
			if ($('#activechats .userpm-select[data-username="'+username+'"] .unread').text()){
				var unread = parseInt($('#activechats .userpm-select[data-username="'+username+'"] .unread').text());
				unread += 1;	
				$('#activechats .userpm-select[data-username="'+username+'"] .unread').text(unread);
			}else{
				var unread = 1;
				$('#activechats .userpm-select[data-username="'+username+'"]').append('<div class="unread">'+unread+'</div>');
			}				
			this.update_global_unread_count();	
		}
		
		// show chat 
		// $('.rcontainer').removeClass('active');
		// $('#chats').addClass('active');											
		
	}
	
	
	send_unsent_message(username, html){
		
		//var newhtml = html.replace('offline', '');
		console.log('here');
		fs.readFile(chatlogsdir + 'pm-'+username+'.log', function (err, data) {
		    if (err) throw err;
		    var content = data.toString().replace(html, '');
		    //console.log(content);
		    console.log();
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
		$('.userchat[data-username="'+username+'"] .messages').empty();
		
	}
	
	
	// load all chats at startup
	load_chats(){
		fs.readdir( chatlogsdir , (err, files) => {
			files.forEach(file => {
				
				if (file.startsWith("pm")){
					var username = file.replace('pm-', '').replace('.log', '');
					//console.log(username);
					if ( !$('.userpm-select[data-username="'+username+'"]').length ){						
						if ( $('#chat-list li[data-username="'+username+'"]').length ){
							var div = '<div class="userpm-select online" data-username="'+username+'">'+username+'</div>';
						}else{
							var div = '<div class="userpm-select" data-username="'+username+'">'+username+'</div>';
						}
						$('#activechats').append(div);	
					}
					
				}
		
			});
		});
	}
	
	
	
	
	init_battlerrom_chat(){
		
		var battleid = $('#battleroom .battleid').text();
		fs.readFile(chatlogsdir + 'battleroom-'+battleid+'.log', function (err, data) {
			if (err) throw err;
			if(data)
				$('#battle-room').html(data.toString());
		});
		
	}
	
	
	append_message_battleroom( username, message ){
		
		var ring = message.startsWith("* Ringing");
		var talkingabout = message.indexOf( myusername );					
		var ishost = message.startsWith("* ");
		var hasvote = message.startsWith("* Vote in progress");
		
		if(ring && talkingabout >= 0){
			console.log('ringing');
			$('#ringsound')[0].play();
		}
		message = message.replace('\n', ' ');					
		message = $('<div/>').text(message).html();					
		message = this.urlify(message);					
		message = message.replace(/<br\s*\/?>/gi,' ');					
		//message = filter.clean(message);
		
		var $bubble = $('<li></li>');
		var last_user_msg = $('#battle-room li .userspeaking').last().text();
		console.log(last_user_msg);
		
		if(username == last_user_msg){
			$bubble.append('<div class="messageinfo hidden"><div class="userspeaking">'+username + '</div><div class="time">'+this.timenow+'</div></div><div class="message">' +message+'</div>');	
		}else{
			$bubble.append('<div class="messageinfo"><div class="userspeaking">'+username + '</div><div class="time">'+this.timenow+'</div></div><div class="message">' +message+'</div>');
		}
		
		
		if( username == $('#myusername').text() ){						
			$bubble.addClass('mine');						
		}else if( ishost ){
			$bubble.addClass('ishost');												
			if ($('.showhostmessages').prop("checked") == false){
				setTimeout(function() {
				  $bubble.addClass('hidemessage');
				}, 5000);
			}
		}					
		if (talkingabout >= 0){
			$bubble.addClass('talkingabout');
		}					
		$('#battle-room').append($bubble);																														
				
		// scroll to bottom
		if ($('.autoscrollbattle ').prop("checked") == true){
			$('#battleroom .text-scroll').scrollTop($('#battle-room')[0].scrollHeight);	
		}
		
		// save battle log
		var battleid = $('#battleroom .battleid').text();
		var container = $bubble.wrap('<p/>').parent().html();
		fs.appendFileSync(chatlogsdir + 'battleroom-'+battleid+'.log', container );
		
					
	}
	
	
	clear_battleroom_chat(){
		var battleid = $('#battleroom .battleid').text();
		fs.unlinkSync(chatlogsdir + 'battleroom-'+battleid+'.log');		
		$('#battle-room').empty();
	}
	
	
    
}

