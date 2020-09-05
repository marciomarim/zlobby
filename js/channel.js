import {socketClient} from './socket.js'

import {trackEvent} from './init.js';

export default class Channel {
    
    constructor() {}
	
    addchannel( chanName, userCount ){
		
		var line = '<div class="status"></div>';
		line += '<div class="icon icon-channel"></div>';
		line += '<div class="userCount">'+userCount+'</div>';					
		line += '<div class="chanName">'+chanName+'</div>';		
		line += '</div>';
		
		$('#channel-list').append('<li data-channame="'+chanName+'" style="order:'+userCount+';">'+line+'</li>');					
				
    }                    
  
	removechannel( chanName ){
		
		$('#channel-list li[data-channame="'+chanName+'"]').remove();		
		
	}
    
    joinedchannel( chanName, username ){	
		
		$('#channel-list li[data-channame='+chanName+'] .status').text('🟢');					
				
    }
    
    leftchannel( chanName, username ){	
		
		$('#channel-list li[data-channame='+chanName+'] .status').text('');
				
    }
    
    
    clients( chanName, clients ){	
		
		console.log(clients);
		
		$.each(clients, function( index, clientname ) {
			
			var client = $('#chat-list li[data-username='+jQuery.escapeSelector(clientname)+']').clone();
			$('.channelchat[data-channame='+chanName+'] .channelusers').append( client );	
		});
		
				
    }
    
    
}
