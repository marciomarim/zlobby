import { socketClient, login } from './socket.js';

const log = require('electron-log');

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
var cmd_full = '';
var cmd_memory = '';

export default class Protocol {
	constructor() {}

	reprocess_data(data) {
		cmd_memory = data;
		this.server(data);
	}

	server(data) {
		// split data into multiple line commands
		var commandlines = data.split('\n');

		commandlines.forEach(function(cmd) {
			var parts = cmd.split(' ');
			var command_name = parts[0];
			var myusername = $('#myusername').text();

			switch (command_name) {
				case 'ACCEPTED':
					// clear previous error messages
					$('#loginmessage').text('');
					// hide login pane and show disconnect pane
					$('.account #disconnectpane').addClass('active');
					$('.account #loginpane, .account #createpane, #agreementpane').removeClass('active');
					$('.account .btn').addClass('active');
					$('.container.active').removeClass('active');
					$('.tab').removeClass('active');
					// activate battlelist
					$('.tab.battlelist').addClass('active');
					$('#battlelist').addClass('active');
					break;

				case 'ADDBOT':
					//ADDBOT battleID name owner battleStatus teamColor {ai dll}
					var battleid = parts[1];
					var botname = parts[2];
					var owner = parts[3];
					var battleStatus = parts[4];
					var teamColor = parts[5];					
					battles.botjoinedbattle(battleid, botname, owner, battleStatus, teamColor);
					break;

				case 'ADDSTARTRECT':
					var allyNo = parts[1];
					var left = parts[2];
					var top = parts[3];
					var right = parts[4];
					var bottom = parts[5];
					battles.addstartrect(allyNo, left, top, right, bottom);
					break;

				case 'ADDUSER':
					var username = parts[1];
					var country = parts[2];
					var userID = parts[3];
					//var userID = parts[4];
					var lobbyID = parts.slice(4).join(' ');

					if (lobbyID) {
						// new protocol
						users.adduser(username, country, userID, lobbyID);
					} else {
						users.adduser(username, country, 0, 0, 0);
					}
					break;

				case 'AGREEMENT':
					
					var message = parts.slice(1).join(' ');
					var current_message = $('#agreementpane .agreementmessage').text();
					
					if (current_message.indexOf(message) !== -1){
						
					}else{
						$('.account #loginpane, .account #createpane').removeClass('active');
						$('#agreementpane').addClass('active');
						$('#agreementpane .agreementmessage').append(message + ' ');	
					}
					
					
					
					break;

				case 'AGREEMENTEND':
					// send first time after account creation					
					break;

				case 'BATTLECLOSED':
					var battleid = parts[1];
					battles.closebattle(battleid);

					break;

				case 'BATTLEOPENED':
					battles.openbattle(cmd, parts);
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
					channels.addchannel(chanName, userCount);

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
					$('#loginpane').addClass('active');
					var reason = parts.slice(1).join(' ');
					$('#loginmessage').text(reason);
					var notification = new Notification('Login denied:', {
						body: reason,
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

					battles.joinbattle(battleid, hashCode, channelName);

					//socketClient.write('GETUSERINFO \n');

					break;

				case 'JOINBATTLEFAILED':
					var reason = parts.slice(1).join(' ');
					log.warn('JOINBATTLEFAILED: ' + reason);
					// var notification = new Notification('Join battle failed:', {
					// 	body: reason,
					// });
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
					break;

				case 'REGISTRATIONDENIED':
					var reason = parts[1];
					var notification = new Notification('REGISTRATION DENIED', {
						body: reason,
					});
					break;

				case 'REMOVEBOT':
					var battleid = parts[1];
					var botname = parts[2];									
					battles.botremovedbattle(battleid, botname);
					break;

				case 'REMOVESCRIPTTAGS':
					break;

				case 'REMOVESTARTRECT':
					var allyNo = parts[1];
					battles.removestartrect(allyNo);
					break;

				case 'REMOVEUSER':
					var username = parts[1];
					users.removeuser(username);
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
					var username = parts[1];
					var message = parts.slice(2).join(' ');
					utils.append_message_battleroom(username, message);
					break;

				case 'SAIDBATTLEEX':
					var username = parts[1];
					var message = parts.slice(2).join(' ');
					utils.append_message_battleroom(username, message, true);
					break;

				case 'SAIDEX':
					var chanName = parts[1];
					var username = parts[2];
					var message = parts.slice(3).join(' ');
					utils.add_message_to_channel(chanName, username, message, true);
					break;

				case 'SAIDFROM':
					break;

				case 'SAIDPRIVATE':
					var username = parts[1];
					var message = parts
						.slice(2)
						.join(' ')
						.replace('<br>', '');
					message = message.replace('\n', '');
					message = $('<div/>')
						.text(message)
						.html();
					message = utils.urlify(message);
					//message = filter.clean(message);

					if (!$('.userchat[data-username="' + jQuery.escapeSelector(username) + '"]').length) {
						utils.init_chat(username);
					}
					utils.add_message_to_chat(username, message, false);

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
					break;

				case 'UDPSOURCEPORT':
					break;

				case 'UNBRIDGEDCLIENTFROM':
					break;

				case 'UNIGNORE':
					break;

				case 'UPDATEBATTLEINFO':
					var battleid = parts[1];
					var spectatorCount = parseInt(parts[2], 10);
					var locked = parts[3];
					var maphash = parts[4];
					var mapname = parts.slice(5).join(' ');
					battles.updatebattleinfo(battleid, spectatorCount, locked, maphash, mapname);
					break;

				case 'UPDATEBOT':
					var battleid = parts[1];
					var botname = parts[2];
					var battleStatus = parts[3];
					var teamColor = parts[4];
					//battles.updatebot();
					users.updatebattlestatus(botname, battleStatus, teamColor);
					break;

				default:
					//need process
					if (cmd != '') {
						log.error('CMD NOT FOUND!' + cmd);
						if (cmd_last == '') {
							
						} else {
							cmd_full = cmd_last + cmd;
							// avoid multiple calls
							if (cmd_full != cmd_memory){
								log.warn('Trying to process: ' + cmd_full);
								protocol.reprocess_data(cmd_full);	
							}														
						}
						//console.log(cache.data);
					}
			}
			// sava last cmd
			cmd_last = cmd;
		});
	}
}

let protocol = new Protocol();
