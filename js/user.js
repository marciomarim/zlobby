import {socketClient} from './socket.js'

import Battle from './battle.js';
let battles = new Battle();

export default class User {
    
    constructor() {
    }
    
    getColor(){
		var r = 0;
		var g = 0;
		var b = 0;
		return r << 16 | g << 8 | b;
	}	
	
    adduser( username, country, cpu, userID, lobbyID){
		
		var line = '<div class="ingame icon icon-ingame false"></div>';
		line += '<div class="flag-icon flag-icon-squared flag-icon-'+country.toLowerCase()+'"></div>';
		line += '<div class="rank icon icon-rank0"></div>';					
		line += '<div class="name">'+username+'</div>';
		line += '<div class="trueskill">–</div>';														
		line += '<div class="bot icon icon-bot false"></div>';
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
		if ( $('#activechats .userpm-select[data-username="'+username+'"]').length ){
			$('#activechats .userpm-select[data-username="'+username+'"]').addClass('online');
		}		
		
    }
    
    
    
    addbattlestatusfields(username){
	    
	    var div = $('#battleroom li[data-username="'+username+'"] .trueskill');	    
	    div.after('<div class="bonus"></div>');
	    div.after('<div class="faction icon icon-arm"></div>');	    		
		div.after('<div class="team">–</div>');				
		div.after('<div class="ally">–</div>');
		div.after('<div class="ready">⚪️</div>');
		
	    
    }
    
	removeuser( username ){
		$('#chat-list li[data-username="'+username+'"]').remove();				
		// flag chat button offline
		if ( $('#activechats .userpm-select[data-username="'+username+'"]').length ){
			$('#activechats .userpm-select[data-username="'+username+'"]').removeClass('online');
		}
		
	}
    
    
    // update simple status on chatlist and battlelist
    // LAUNCH GAGME ?
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
			$('li[data-username="'+username+'"] .rank').addClass('icon-rank'+newStatus.timeRank );
			
		if (newStatus.inGame){
			$('li[data-username="'+username+'"] .ingame').addClass('battle');	
		}else{
			$('li[data-username="'+username+'"] .ingame').removeClass('battle');
		}
			
		
		if (newStatus.away)
			$('li[data-username="'+username+'"] .away').removeClass('false');
			
		if (newStatus.admin)	
			$('li[data-username="'+username+'"] .admin').removeClass('false');

		if (newStatus.lobbyBot)	
			$('li[data-username="'+username+'"] .bot').removeClass('false');
		
		//console.log(username);
		//console.log(newStatus);
		
		// any battle that start should update battle status
		if ( $('.battle-card[data-founder="'+username+'"]').length && newStatus.inGame ){
			// battle is running should change status
			$('#battleroom[data-founder="'+username+'"] .status').text('🚀');
			$('.battle-card[data-founder="'+username+'"] .status').text('🚀');
			console.log('battle started');
			
		}else if($('.battle-card[data-founder="'+username+'"]').length && !newStatus.inGame){
			//battle ended
			$('#battleroom[data-founder="'+username+'"] .status').text('🟢');
			$('.battle-card[data-founder="'+username+'"] .status').text('🟢️');
			// remove class so it can start again
						
		}
		
		// detect is it's my battle
		if ( username == $('#battleroom .founder').text() && newStatus.inGame ){
		
			var myusername = $('#myusername').text();
			
			if (  $('.battle-playerlist li[data-username="'+myusername+'"]').length ){
				battles.launchgame();
				$('body').addClass('ingame');
				this.sendstatus(); // ingame
				$('.readybattle').prop("checked", false);						
				console.log('Spring should launch as player');	
			}
			
			if (  $('.battle-speclist li[data-username="'+myusername+'"]').length && $('.autolaunchbattle').prop("checked") == true ){
				battles.launchgame();						
				$('body').addClass('ingame');
				this.sendstatus(); //ingame
				console.log('Spring should launch as spec');	
			}
			
		}else if( username == $('#battleroom .founder').text() && !newStatus.inGame ){
			
			$('body').removeClass('ingame');
			$('.readybattle').prop("checked", false);
			this.sendstatus();
			this.sendbattlestatus();			
			
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
		
		if (!$('#battleroom li[data-username="'+username+'"] .ready').length){
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
			$('#battleroom li[data-username="'+username+'"] .ready').text('🛠');
		}else if(newStatus.spec == false){
			$('#battleroom li[data-username="'+username+'"] .ready').text('👁');	
		}else if(newStatus.sync && newStatus.ready){
			$('#battleroom li[data-username="'+username+'"] .ready').text('🟢');
		}else{
			$('#battleroom li[data-username="'+username+'"] .ready').text('⚪️');
		}				
		
		if (newStatus.spec == true){			
			$('#battleroom .battle-playerlist').append( $('#battleroom li[data-username="'+username+'"]') );
		}else{
			$('#battleroom .battle-speclist').append( $('#battleroom li[data-username="'+username+'"]') );		
		}
		
		$('#battleroom li[data-username="'+username+'"] .team').text(newStatus.team);
		$('#battleroom li[data-username="'+username+'"] .ally').text(newStatus.ally).removeClass(function (index, className) {
		    return (className.match (/(^|\s)ally-\S+/g) || []).join(' ');
		}).addClass('ally-'+newStatus.ally.toString());
		
		
		
		if(newStatus.bonus == 0){
			$('#battleroom li[data-username="'+username+'"] .bonus').text('');
		}else{
			$('#battleroom li[data-username="'+username+'"] .bonus').text(newStatus.bonus);
		}			
			
		
		if(newStatus.faction == 1){
			$('#battleroom li[data-username="'+username+'"] .faction').removeClass('icon-arm').addClass('icon-core');	
		}else{
			$('#battleroom li[data-username="'+username+'"] .faction').removeClass('icon-core').addClass('icon-arm');	
		}
		
		//update counts
		var numberofplayers = $('#battleroom .battle-playerlist li').length;
		var numberofspecs = $('#battleroom .battle-speclist li').length;		
		$('#battleroom .battle-playerlist .ui-label').text(numberofplayers + ' PLAYERS');
		$('#battleroom .battle-speclist .ui-label').text(numberofspecs + ' SPECTATORS');
		
		$('#battleroom #battle-main-info .players').text(numberofplayers);
		$('#battleroom #battle-main-info .spectatorCount').text(numberofspecs);
		
		var battlesize = 'normal';
		if (numberofplayers > 12){
			battlesize = 'big';
		}else if(numberofplayers > 14){
			battlesize = 'verybig';
		}else if(numberofplayers > 16){
			battlesize = 'huge';
		}
		$('#battleroom').data('battlesize', battlesize);
		$('#battleroom').attr('data-battlesize', battlesize);	
		
		
		
		// update gametype in battleroom				
		var mo_ffa = $('#battleroom .option.mo_ffa .val').text();
		var anon_ffa = $('#battleroom .option.anon_ffa .val').text();			
		if(mo_ffa == '1'){
			
			$('#battleroom .gametype').text('FFA');
			if(anon_ffa){
				$('#battleroom .ffatype').text('ANON');	
			}
			
		}else{
			
			var numplayers = $('.battle-playerlist li').length;					
			if (numplayers <= 2){
				$('#battleroom .gametype').text('1v1');
			}			
			if (numplayers > 2){
				$('#battleroom .gametype').text('TEAMS');
			}	
		}
		
		// update script
		this.reorderplayers();		
    }
    
    
    reorderplayers(){
	    $('.battle-playerlist li').each(function( index ) {
			var team = $(this).children('.team').text();
			//var ally = $(this).children('.ally').text();
			$(this).css('order', team);
		});
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
			console.log('sending ingame for me');
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
		console.error(command);		
		socketClient.write( command );
    }
    
    sendbattlestatus(){
	    
	    var ready = 0,
			team = 0,
			ally = 0,
			spec = 0,
			synced = 1,
			faction = 0;
		
		
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
			
		var bitcode = ready*2 + spec*2**10 + 2**(23 - synced) + faction*2**24; //2**(25 - faction);
		
		var command = 'MYBATTLESTATUS ' + bitcode + ' ' + this.getColor() + '\n';										
		socketClient.write( command );
		
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