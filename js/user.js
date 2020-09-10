import {socketClient} from './socket.js'

import Battle from './battle.js';
let battles = new Battle();

import Utils from './utils.js';
let utils = new Utils();

import {trackEvent} from './init.js';

export default class User {
    
    constructor() {
    }
    
    	
	
    adduser( username, country, cpu, userID, lobbyID){
		
		var line = '<div class="icon icon-user"></div>';
		line += '<div class="flag-icon flag-icon-squared flag-icon-'+country.toLowerCase()+'"></div>';
		line += '<div class="rank icon icon-rank0"></div>';					
		line += '<div class="name">'+username+'</div>';
		line += '<div class="trueskill">–</div>';
		line += '<div class="admin icon icon-admin false"></div>';
		line += '<div class="away icon icon-away false"></div>';
		
		line += '<div class="country">'+country+'</div>';
		if (cpu != 0)				
			line += '<div class="cpu">'+cpu+'</div>';
		if (userID != 0 && userID != undefined)
			line += '<div class="userID">'+userID+'</div>';					
		if (lobbyID)
			line += '<div class="lobbyID">'+lobbyID+'</div>';
		
		line += '</div>';
		$('#chat-list').append('<li data-username="'+username+'">'+line+'</li>');					
		//$('.tab.chatlist .count').text( $('#chat-list li').length );
		
		// flag chat button (if chat exist) online
		if ( $('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').length ){
			$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').addClass('online');
		}		
		
    }
    
    
    
    addbattlestatusfields(username){
	    
	    var div = $('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .trueskill');	    
	    div.after('<div class="bonus"></div>');
	    div.after('<div class="color"></div>');
	    div.after('<div class="faction icon icon-arm"></div>');	    		
		div.after('<div class="team">–</div>');				
		div.after('<div class="ally">-</div>');
	    
    }
    
	removeuser( username ){
		$('#chat-list li[data-username="'+jQuery.escapeSelector(username)+'"]').remove();				
		// flag chat button offline
		if ( $('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').length ){
			$('#activechats .userpm-select[data-username="'+jQuery.escapeSelector(username)+'"]').removeClass('online');
		}
		
	}
    
    
    // update simple status on chatlist and battlelist
    updatestatus(username, status){
	    
	    var newStatus = {							
				inGame: (status & 1) > 0,
				away: (status & 2) > 0,
				timeRank: (status & 28) >> 2,													
				admin: (status & 32) > 0,
				lobbyBot: (status & 64) > 0,
				statusMask: status,
			};				
		
		if (newStatus.timeRank)
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .rank').addClass('icon-rank'+newStatus.timeRank );
			
		if (newStatus.inGame){
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').addClass('ingame');	
		}else{
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').removeClass('ingame');
		}
			
		
		if (newStatus.away)
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .away').removeClass('false');
			
		if (newStatus.admin)	
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .admin').removeClass('false');
		
			
		if (newStatus.lobbyBot){
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').addClass('bot');
		}else{
			$('li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').removeClass('bot');
		}	
					
		
		// any battle that start should update battle status
		if ( $('.battle-card[data-founder="'+username+'"]').length && newStatus.inGame ){
			// battle is running should change status
			$('#battleroom[data-founder="'+username+'"] .status').addClass('ingame');
			$('.battle-card[data-founder="'+username+'"] .status').addClass('ingame');
			//console.log('battle started');
			
		}else if($('.battle-card[data-founder="'+username+'"]').length && !newStatus.inGame){
			//battle ended
			$('#battleroom[data-founder="'+username+'"] .status').removeClass('ingame');
			$('.battle-card[data-founder="'+username+'"] .status').removeClass('ingame');
			// remove class so it can start again
						
		}
		
		// detect is it's my battle
		if ( username == $('#battleroom .founder').text() && newStatus.inGame ){
		
			var myusername = jQuery.escapeSelector($('#myusername').text());
			
			if (  $('.battle-playerlist li[data-username="'+myusername+'"]').length ){
				battles.launchgame();
				$('body').addClass('ingame');
				utils.sendstatus(); // ingame
				$('.readybattle').prop("checked", false);						
				console.log('Spring should launch as player');	
			}
			
			if (  $('.battle-speclist li[data-username="'+myusername+'"]').length && $('.autolaunchbattle').prop("checked") == true ){
				battles.launchgame();						
				$('body').addClass('ingame');
				utils.sendstatus(); //ingame
				console.log('Spring should launch as spec');	
			}
			
		}else if( username == $('#battleroom .founder').text() && !newStatus.inGame ){
			
			$('body').removeClass('ingame');
			$('.readybattle').prop("checked", false);
			utils.sendstatus();
			utils.sendbattlestatus();			
			
		}

		

    }
    
    
    
    
    updatebattlestatus(username, status, color){
	    /*
		b0 = undefined (reserved for future use)
		b1 = ready (0=not ready, 1=ready)
		b2..b5 = team no. (from 0 to 15. b2 is LSB, b5 is MSB)
		b6..b9 = ally team no. (from 0 to 15. b6 is LSB, b9 is MSB)
		b10 = mode (0 = spectator, 1 = normal player)
		b11..b17 = handicap (7-bit number. Must be in range 0..100). Note: Only host can change handicap values of the players in the battle (with HANDICAP command). These 7 bits are always ignored in this command. They can only be changed using HANDICAP command.
		b18..b21 = reserved for future use (with pre 0.71 versions these bits were used for team color index)
		b22..b23 = sync status (0 = unknown, 1 = synced, 2 = unsynced)
		b24..b27 = side (e.g.: arm, core, tll, ... Side index can be between 0 and 15, inclusive)
		b28..b31 = undefined (reserved for future use);
		*/
		
		if (!$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .faction').length){
			//add user battle status to players
			this.addbattlestatusfields(username);
		}
							
		var status2 = dec2bin(status);
		
		var newStatus = {
			ready : (status & 2) > 0,
			team : bin2dec(status2.substring(status2.length - 6, status2.length - 2)) + 1,
			ally : bin2dec(status2.substring(status2.length - 10, status2.length - 6)) + 1,
			spec : (status & 1024) > 0,
			bonus : bin2dec(status2.substring(status2.length - 18, status2.length - 11)),
			sync : bin2dec(status2.substring(status2.length - 24, status2.length - 22)),
			faction : bin2dec(status2.substring(status2.length - 28, status2.length - 24))
		}
		
		if ( newStatus.sync == 2 || newStatus.sync == 0){			
			$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').addClass('unsync');
		}else{
			$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').removeClass('unsync');
			if(newStatus.ready){
				$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').addClass('ready');
			}else{
				$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .icon-user').removeClass('ready');
			}
		}	
			
		if (newStatus.spec == true){
			$('#battleroom .battle-playerlist').append( $('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"]') );
			$('.battle-speclist li[data-username="'+jQuery.escapeSelector(username)+'"]').remove();			
		}else if (newStatus.spec == false){
			$('#battleroom .battle-speclist').append( $('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"]') );		
			$('.battle-playerlist li[data-username="'+jQuery.escapeSelector(username)+'"]').remove();
		}
		
		
		
		$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .team').text(newStatus.team);
		$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .ally').text(newStatus.ally).removeClass(function (index, className) {
		    return (className.match (/(^|\s)ally-\S+/g) || []).join(' ');
		}).addClass('ally-'+newStatus.ally.toString());
		
		
		var newcolor = {
			Red :  color & 255,
			Green : (color >> 8) & 255,
			Blue :  (color >> 16) & 255 }
			
		
		var csscolor = 'rgb(' + newcolor.Red +','+ newcolor.Green + ','+ newcolor.Blue + ')';		
		$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .color').css('background-color', csscolor );
		
		
		if(newStatus.bonus == 0){
			$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .bonus').text('');
		}else{
			$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .bonus').text(newStatus.bonus);
		}			
			
		
		if(newStatus.faction == 1){
			$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .faction').removeClass('icon-arm').addClass('icon-core');	
		}else{
			$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"] .faction').removeClass('icon-core').addClass('icon-arm');	
		}
		
		//update counts
		var numberofplayers = $('#battleroom .battle-playerlist li').length;
		var numberofspecs = $('#battleroom .battle-speclist li').length;		
		$('#battleroom .battle-playerlist .ui-label').text(numberofplayers + ' PLAYERS');
		$('#battleroom .battle-speclist .ui-label').text(numberofspecs + ' SPECTATORS');
		
		$('#battleroom #battle-main-info .players').text(numberofplayers);
		$('#battleroom #battle-main-info .spectatorCount').text(numberofspecs);
		
		var battlesize = 'normal';
		if (numberofplayers > 10){
			battlesize = 'big';
		}else if(numberofplayers > 12){
			battlesize = 'verybig';
		}else if(numberofplayers > 14){
			battlesize = 'huge';
		}
		$('#battleroom').data('battlesize', battlesize);
		$('#battleroom').attr('data-battlesize', battlesize);	
		
		
		
		// update gametype in battleroom				
		var mo_ffa = $('#battleroom .option.mo_ffa .val').text();
		var anon_ffa = $('#battleroom .option.anon_ffa .val').text();			
		if(mo_ffa == '1'){
			
			$('#battleroom').removeClass('teams').addClass('ffa');
			
			$('#battleroom .gametype').text('FFA');
			if(anon_ffa){
				$('#battleroom .ffatype').text('ANON');	
			}
			
		}else{
			
			$('#battleroom').removeClass('ffa').addClass('teams');
			
			var numplayers = $('.battle-playerlist li').length;					
			if (numplayers <= 2){
				$('#battleroom .gametype').text('1v1');
			}			
			if (numplayers > 2){
				$('#battleroom .gametype').text('TEAMS');
			}	
		}
		
		// update script
		if ( $('.battle-playerlist li[data-username="'+jQuery.escapeSelector(username)+'"]').length ){
			this.reorderplayer(username, newStatus.ally);			
		}
		
    }
    
    
    reorderplayer(username, ally){
		
		if (ally > 0 && ally != '' && username != ''){					
			var user = $('#battleroom .battle-players li[data-username="'+jQuery.escapeSelector(username)+'"]');	    			
		    var team = user.children('.team').text();
			user.css('order', team);
			
			var teamgroup = '<div class="team-group" data-label="TEAM' + ally+'" style="order:'+ally+';"></div>';
			if ( !$('#battleroom .team-group[data-label="TEAM' + ally+'"]').length && ally != ''){
				$('#battleroom .battle-playerlist').append(teamgroup); 
		    }
			
			//replace under team-group    	
			if ($('#battleroom .team-group[data-label="TEAM' + ally+'"]').length){
				var tmp = $('#battleroom .battle-playerlist li[data-username="'+jQuery.escapeSelector(username)+'"]');
				$('#battleroom li[data-username="'+jQuery.escapeSelector(username)+'"]').remove();
				$('#battleroom .team-group[data-label="TEAM' + ally+'"]').append(tmp);					
			}							
			
		}else{			
			//var ts = user.children('.trueskill').text();
			//$('.battle-speclist li[data-username="'+jQuery.escapeSelector(username)+'"]').css('order', ts);
		}
				
		//jQuery.unique($('.battle-players li[data-username="'+jQuery.escapeSelector(username)+'"]'));	
		$('.team-group:empty').remove();
		
    }
    
    
    
    
}

jQuery.expr[':'].Contains = function(a, i, m) {
 return jQuery(a).text().toUpperCase()
     .indexOf(m[3].toUpperCase()) >= 0;
};

// Overwrites old selecor
jQuery.expr[':'].contains = function(a, i, m) {
 return jQuery(a).text().toUpperCase()
     .indexOf(m[3].toUpperCase()) >= 0;
};

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

function bin2dec(bin){
  return parseInt(bin, 2);
}

function reverseString(str) {
    return str.split("").reverse().join("");
}