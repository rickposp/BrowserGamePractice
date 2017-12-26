import * as Timer from '../library/pixi-timer.js';
import AnimatedSprite from './animated_sprite.js';
import AnimatedSpriteManager from './animated_sprite_manager.js';

export default class spriteEmitter extends PIXI.Container {
	
	constructor(opts=null){
		super();
		this._sprite_manager = new AnimatedSpriteManager();
		this._sprite_manager.on(
				"sprite_reached_destination", 
				function(sprite){
					sprite.destroy();
				}
			);
		if(opts){
			this.configure(opts);
		}
	}
	
	configure(opts){
		this._container = opts["container"]; // container for all the children of this emitter
		this.position = opts["origin"];
		this._destination = opts["destination"];
		this._speed = opts["speed"];
		this._texture = opts["texture"];
		this._duration = opts["duration"];
		this._rate = opts["rate"];
		
		let interval = 1 / this._rate;
		let interval_count = this._duration * this._rate;
		
		this._timer = PIXI.timerManager.createTimer(interval);
		this._timer.repeat = interval_count;
		this._timer.on('repeat', this._emit);
		this._timer.sprite_emitter = this; // attaching the self to the timer object for access from the callback function
		this._configured = true;
	}
	
	_emit(){
		let sprite_emitter = this.sprite_emitter; // "this" is the timer object that initiates the callback
		let container = sprite_emitter._container;
		let start_point = sprite_emitter.position;
		let end_point = sprite_emitter._destination;
		let speed = sprite_emitter._speed;
		let texture = sprite_emitter._texture;
		let sprite_manager = sprite_emitter._sprite_manager;
		
		let sprite = sprite_manager.create(start_point, end_point, speed, texture);
		container.addChild(sprite);
	}
	
	get sprites(){
		return this._sprite_manager._sprites;
	}
	
	update(delta){
		if(this._configured && this._timer.isStarted){
			this._sprite_manager.update(delta);
		}
	}
	
	start(){
		if(this._configured){
			this._timer.start();
		}
		else{
			throw "emitter has not been configured";
		}
	}
	
	stop(){
		if(this.configured){
			this._timer.stop();
		}
		else{
			throw "emitter has not been configured";
		}
	}
}