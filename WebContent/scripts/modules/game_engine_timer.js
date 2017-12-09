export default function (duration) {
		const frame_delta = 16.67;
		this.duration = duration;
		this.time_remaining = duration;
		this.running = false;

		this.callback_start = null;
		this.callback_stop = null;
		this.callback_restart = null;
		this.callback_tick = null;
		this.callback_end = null;

		this.start = function() {
			this.running = true;
			if(this.callback_start){
				this.callback_start();
			}
		}

		this.stop = function(){
			this.running = false;
			if(this.callback_stop){
				this.callback_stop();
			}
		}

		this.restart = function(){
			this.running = true;
			this.time_remaining = this.duration; 
			if(this.callback_restart){
				this.callback_restart();
			}
		}

		this.tick = function(delta){
			self = this
			self.delta = frame_delta * delta;
			if(this.running){
				if(this.time_remaining <= 0){
					this.running = false;
					this.callback_end(self);
				}
				else {
					this.time_remaining -= self.delta;
				}
				if(this.callback_tick){
					this.callback_tick();
				}
			}
		}
		this.on = function(event, callback){
			switch(event){
			case 'start':
				this.callback_start = callback;
				break;

			case 'stop':
				this.callback_stop = callback;
				break;

			case 'tick':
				this.callback_tick = callback;
				break;

			case 'restart':
				this.callback_restart = callback;
				break;

			case 'end':
				this.callback_end = callback;
				break;
			}	
		}
	}