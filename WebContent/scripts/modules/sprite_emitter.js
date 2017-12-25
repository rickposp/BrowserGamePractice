import * as Timer from '../library/pixi-timer.js';
import AnimatedSprite from './animated_sprite.js';
import AnimatedSpriteManager from './animated_sprite_manager.js';

export default class spriteEmitter {
	
	constructor(opts){
		this.origin = opts["origin"];
		this.destination = opts["destination"];
		this.speed = opts["speed"];
		this.texture = opts["texture"];
		this.duration = opts["duration"];
		this.rate = opts["rate"];
		this.container = opts["container"];
		
		this.sprite_manager = new AnimatedSpriteManager(this.container);
		
		let interval = 1 / this.rate;
		let interval_count = this.duration * this.rate;
		
		this.timer = PIXI.timerManager.createTimer(interval);
		this.timer.repeat = interval_count;
		this.timer.on('repeat', this._emit);
		this.timer.sprite_emitter = this; // attaching the self to the timer object for access from the callback function
	}
	
	_emit(){
		let sprite_emitter = this.sprite_emitter; // "this" is the timer object that initiates the callback
		let start_point = sprite_emitter.origin;
		let end_point = sprite_emitter.destination;
		let speed = sprite_emitter.speed;
		let texture = sprite_emitter.texture;
		let sprite_manager = sprite_emitter.sprite_manager;
		
		sprite_manager.add(new AnimatedSprite(start_point, end_point, speed, texture));
	}
	
	update(delta){
		this.sprite_manager.update(delta);
	}
	
	start(){
		this.timer.start();
	}
	
	stop(){
		this.timer.stop();
	}
}