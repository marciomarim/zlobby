import {socketClient, login} from './socket.js'	

var Filter = require('bad-words'),
    filter = new Filter();

filter.addWords('FAGGOTS', 'DICKS', 'dickhead');
filter.removeWords('sexy');

import Utils from './utils.js';
let utils = new Utils();

import User from './user.js';
let users = new User();
	
import Battle from './battle.js';
let battles = new Battle();

import Channel from './channel.js';
let channels = new Channel();

//var cache = {};
//cache.data = [];
var cache = '';
var waitforall = false;
var cmd_first = '';
var cmd_last = '';
 
export default class Protocol {
    
    constructor() {}
    
    reprocess_data( data ){
		this.server( data );	
	}
	
    server( data ) {
        
        // split data into multiple line commands
        var commandlines = data.split("\n");
		cmd_first = commandlines[0];
		var cmd_full = cmd_last + cmd_first;
		cmd_last = commandlines[commandlines.length-1];
		
			
		commandlines.forEach( function(cmd){
					
		//$.each(commandlines, function(key, cmd){
			
			//utils.append_to_terminal(cmd);
			
			var parts = cmd.split(" ");
			var command_name = parts[0];
			var myusername = $('#myusername').text();
			
			
			
			switch(command_name) {
			  
				case 'ACCEPTED':
					
					// hide login pane and show disconnect pane
					$('.account #disconnectpane').addClass('active');
					$('.account #loginpane, .account #createpane').removeClass('active');
					$('.account .btn').addClass('active');
															
					break;			    
			    
			    
			    
			    
				case 'ADDBOT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'ADDSTARTRECT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'ADDUSER':
									
					var username = parts[1];
					var country = parts[2];					
					var cpu = parts[3];
					var userID = parts[4];
					var lobbyID = parts.slice(5).join(' ');
					
					if (lobbyID){ // new protocol
						users.adduser( username, country, cpu, userID, lobbyID );	
					}else{
						users.adduser( username, country, 0, 0, 0 );
					}																			
					break;			    			    			    
			    
			    
			    
			    
			    
			    
				case 'AGREEMENT':
					
					// send first time after account creation
					var command = 'CONFIRMAGREEMENT\n';	
					socketClient.write(command);
					login();
					break;			    
			    
			    
			    
			    
			    
				case 'AGREEMENTEND':
					
					break;			    
			    
			    
			    
			    
			    
				case 'BATTLECLOSED':
				
					var battleid = parts[1];		
					battles.closebattle( battleid );
					
					break;			    
			    
			    
			    
			    
			    
			    
			    
			    
				case 'BATTLEOPENED':
				
					battles.openbattle( cmd, parts );					
					break;
			    
			    
			    
			    
			    
				case 'BRIDGEDCLIENTFROM':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CHANGEEMAILACCEPTED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CHANGEEMAILDENIED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CHANGEEMAILREQUESTACCEPTED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CHANGEEMAILREQUESTDENIED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CHANNEL':
					
					var chanName = parts[1];
					var userCount = parts[2];															
					channels.addchannel( chanName, userCount );	
					
					break;			    
			    
			    
			    
			    
			    
				case 'CHANNELMESSAGE':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CHANNELTOPIC':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CLIENTBATTLESTATUS':

					var username = parts[1];
					var status = parseInt(parts[2]);
					var color = parts[3];
										
					users.updatebattlestatus(username, status, color);
						
					break;			    
			    
			    
			    
			    
			    
				case 'CLIENTIPPORT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CLIENTS':
					
					var chanName = parts[1];
					var clients = parts.slice(2);
					
					channels.clients(chanName, clients);
					
					break;			    
			    
			    
			    
			    
			    
				case 'CLIENTSFROM':
				
					break;			    
			    
			    
			    
			    
			    
				case 'CLIENTSTATUS':
														
					var username = parts[1];
					var status = parseInt(parts[2]);
					
					users.updatestatus(username, status);
						
					break;			    
			    
					
			    
			    
			    
				case 'COMPFLAGS':
				
					break;			    
			    
			    
			    
			    
			    
				case 'DENIED':
					
					var reason = parts[1];
					var notification = new Notification( 'Login denied:', {
					  body: reason
					});
					break;			    
			    
			    
			    
			    
			    
				case 'DISABLEUNITS':
				
					break;			    
			    
			    
			    
			    
			    
				case 'ENABLEALLUNITS':
				
					break;			    
			    
			    
			    
			    
			    
				case 'ENABLEUNITS':
				
					break;			    
			    
			    
			    
			    
			    
				case 'ENDOFCHANNELS':
				
					break;			    
			    
			    
			    
			    
			    
				case 'FAILED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'FORCEQUITBATTLE':
					
					battles.got_kicked();
					break;			    
			    
			    
			    
			    
			    
				case 'HOSTPORT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'IGNORE':
				
					break;			    
			    
			    
			    
			    
			    
				case 'IGNORELIST':
				
					break;			    
			    
			    
			    
			    
			    
				case 'IGNORELISTBEGIN':
				
					break;			    
			    
			    
			    
			    
			    
				case 'IGNORELISTEND':
				
					break;			    
			    
			    
			    
			    
			    
				case 'JOIN':
				
					break;			    
			    
			    
			    
			    
			    // WHEN I SUCESSFULLY JOIN A BATTLE
				case 'JOINBATTLE':
				
					var battleid = parts[1];
					var hashCode = parts[2];
					var channelName = parts[3];					
					
					battles.joinbattle( battleid, hashCode, channelName );
					
					//socketClient.write('GETUSERINFO \n');
					
					break;			    
			    
			    
			    
			    
			    
				case 'JOINBATTLEFAILED':
					
					var reason = parts[1];		
					var notification = new Notification( 'Join battle failed:', {
					  body: reason
					});
					break;
					
					
					
			    
			    
				case 'JOINBATTLEREQUEST':
				
					break;			    
			    
			    
			    
			    
			    
				case 'JOINED':
					
					var chanName = parts[1];
					var username = parts[2];
					
					channels.joinedchannel(chanName, username);
					
					break;			    
			    
			    
			    
			    
			    // when ANYONE JOIN A BATTLE
				case 'JOINEDBATTLE':
				
					var battleid = parts[1];
					var username = parts[2];
					
					battles.joinedbattle(battleid, username);
					
					break;			    
			    
			    
			    
			    
			    
				case 'JOINEDFROM':
				
					break;			    
			    
			    
			    
			    
			    
				case 'JOINFAILED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'JSON':
				
					break;			    
			    
			    
			    
			    
			    
				case 'KICKFROMBATTLE':
				
					break;			    
			    
			    
			    
			    
			    
				case 'LEFT':
					
					var chanName = parts[1];
					var username = parts[2];
					
					channels.leftchannel(chanName, username);
					
					break;			    
			    
			    
			    
			    
			    
				case 'LEFTBATTLE':
					
					var battleid = parts[1];
					var username = parts[2];
					
					battles.leftbattle(battleid, username);
					
					break;			    
			    
			    
			    
			    
			    
				case 'LEFTFROM':
				
					break;			    
			    
			    
			    
			    
			    
				case 'LOGININFOEND':
					
					utils.load_chats();
					
					var command = 'CHANNELS\n';	
					socketClient.write(command);					
					
					break;			    
			    
			    
			    
			    
			    
				case 'MOTD':
				
					break;			    
			    
			    
			    
			    
			    
				case 'OK':
				
					break;			    
			    
			    
			    
			    
			    
				case 'OPENBATTLE':
				
					break;			    
			    
			    
			    
			    
			    
				case 'OPENBATTLEFAILED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'PONG':
				
					break;			    
			    
			    
			    
			    
			    
				case 'REDIRECT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'REGISTRATIONACCEPTED':
					
					var notification = new Notification( 'REGISTRATION ACCEPTED', {
					  body: "Trying to login."
					});
										
					//login();
					$('#loginpane').addClass('active');
					
					break;			    
			    
			    
			    
			    
			    
				case 'REGISTRATIONDENIED':
				    
				    var reason = parts[1];
				    var notification = new Notification( 'REGISTRATION DENIED', {
					  body: reason
					});	
					break;			    
			    
			    
			    
			    
			    
				case 'REMOVEBOT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'REMOVESCRIPTTAGS':
				
					break;			    
			    
			    
			    
			    
			    
				case 'REMOVESTARTRECT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'REMOVEUSER':
									
					var username = parts[1];
					
					users.removeuser( username );					
					
					break;			    
			    
			    
			    
			    
			    
				case 'REQUESTBATTLESTATUS':
					
					utils.sendbattlestatus();						
					break;			    
			    
			    
			    
			    
			    
				case 'RESENDVERIFICATIONACCEPTED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'RESENDVERIFICATIONDENIED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'RESETPASSWORDACCEPTED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'RESETPASSWORDDENIED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'RESETPASSWORDREQUESTACCEPTED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'RESETPASSWORDREQUESTDENIED':
				
					break;			    
			    
			    
			    
			    
			    
				case 'RING':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SAID':
					
					var chanName = parts[1];
					var username = parts[2];					
					var message = parts.slice(3).join(' ');					
					
					utils.add_message_to_channel(chanName, username, message);
					
					break;			    
			    
			    
			    
			    
			    
				case 'SAIDBATTLE':
				case 'SAIDBATTLEEX':
			  	
					var username = parts[1];					
					var message = parts.slice(2).join(' ');					
					
					utils.append_message_battleroom(username, message);
					
					break;			    
			    
			    
			    
			    
			      
				
					
				case 'SAIDEX':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SAIDFROM':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SAIDPRIVATE':
					
					var username = parts[1];					
					var message = parts.slice(2).join(' ').replace('<br>', '');					
					
					message = message.replace('\n', '');
					message = $('<div/>').text(message).html();
					message = utils.urlify(message);
					//message = filter.clean(message);
					
					if ( !$('.userchat[data-username="'+username+'"]').length ){													
						utils.init_chat(username);					
					}					
					utils.add_message_to_chat(username, message, false);
					
					
					
					var notification = new Notification( username + ' said', {
					  body: message
					});
					
					notification.onclick = () => {
						$('.tab, .rcontainer, .container.active').removeClass('active');
						$('#chats').addClass('active');
						$('.userchat, .userpm-select').removeClass('active');		
						$('.userchat[data-username="'+username+'"], .userpm-select[data-username="'+username+'"]').addClass('active');
						
						if( $('.userpm-select[data-username="'+username+'"] .unread').length )
							$('.userpm-select[data-username="'+username+'"] .unread').remove();
							
						utils.update_global_unread_count();
					}
					break;		    
			    
			    
			    
			    
			    
				case 'SAIDPRIVATEEX':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SAYPRIVATE':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SAYPRIVATEEX':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SERVERMSG':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SERVERMSGBOX':
				
					break;			    
			    
			    
			    
			    
			    
				case 'SETSCRIPTTAGS':
					
					battles.setscripttags(parts);						
					
					break;			    
			    
			    
			    
			    
			    
				case 'TASSERVER':
				case 'TASServer':
					
					$('.container.active').removeClass('active');		
					$('.tab').removeClass('active');
					
					$('.tab.battlelist').addClass('active');
					$('#battlelist').addClass('active');
					
					break;			    
			    
			    
			    
			    
			    
				case 'UDPSOURCEPORT':
				
					break;			    
			    
			    
			    
			    
			    
				case 'UNBRIDGEDCLIENTFROM':
				
					break;			    
			    
			    
			    
			    
			    
				case 'UNIGNORE':
				
					break;			    
			    
			    
			    
			    
			    
				case 'UPDATEBATTLEINFO':
					
					var battleid = parts[1];					
					var spectatorCount = parseInt(parts[2],10) ;		
					var locked = parts[3];		
					var maphash = parts[4];		
					var mapname = parts.slice(5).join(' ');
					
					battles.updatebattleinfo( battleid, spectatorCount, locked, maphash, mapname );
					
					break;			    
			    
			    
			    
			    
			    
				case 'UPDATEBOT':
				
					break;			    
			    
			    
			    
			    
			    
				default:
				  	//need process
				  	if (cmd != ''){
					  	
					  	console.error('CMD NOT FOUND!'+cmd);
					  	console.log("Trying to process: " + cmd_full);
					  	protocol.reprocess_data(cmd_full);
					  	
					  	//console.log(cache.data);
				  	}
						
			    
			    
			}
	
		});
        
    }
          
}

let protocol = new Protocol();