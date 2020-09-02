import {socketClient} from './socket.js'

import {trackEvent} from './init.js';

export default class Channel {
    
    constructor() {
    }
	
    addchannel( chanName, userCount ){
		
		var line = '<div class="icon icon-channel"></div>';
		line += '<div class="userCount">'+userCount+'</div>';					
		line += '<div class="chanName">'+chanName+'</div>';		
		line += '</div>';
		
		$('#channel-list').append('<li data-channame="'+chanName+'" style="order:'+userCount+';">'+line+'</li>');					
				
		
    }
    
            
  
	removechannel( chanName ){
		$('#channel-list li[data-channame="'+chanName+'"]').remove();		
	}
    
    
    
    
}
