import AnimationRunner from './animation_runner.js';
import Animation from './animation.js';

export default class spriteEmitter extends Animation {

	constructor(opts){
	    let start_point = opts["start_point"];
	    let end_point = opts["end_point"];
	    let speed = opts["speed"];
	    let texture = opts["texture"];
	    let manager = opts["animation_runner"];
		super(start_point, end_point, speed, texture, manager);
		this._animationRunner = manager;
		this._animationRunner.on(
				"sprite_reached_destination",
				function(animation){
					animation.destroy();
				}
			);
		this.configure(opts);
	}
	
	configure(opts){
	    this._offset_x = opts["spawn_origin_offset_x"];
	    this._offset_y = opts["spawn_origin_offset_y"];
		this._targetContainer = opts["spawn_parent_container"]; // container for all the children of this emitter
		this._destination = opts["spawn_destination"];
		this._spawn_speed = opts["spawn_speed"];
		this._spawn_texture = opts["spawn_texture"];
		this._duration = opts["spawn_duration"];
		this._rate = opts["spawn_rate"];

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
		let container = sprite_emitter._targetContainer;
		let start_point = new PIXI.Point(sprite_emitter.x + sprite_emitter._offset_x, sprite_emitter.y + sprite_emitter._offset_y);
		let end_point = sprite_emitter._destination;
		let speed = sprite_emitter._spawn_speed;
		let texture = sprite_emitter._spawn_texture;
		let animationRunner = sprite_emitter._animationRunner;

		let sprite = animationRunner.create(start_point, end_point, speed, texture);
		container.addChild(sprite);
	}

	get sprites(){
		return this._animationRunner.animations;
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
		if(this._configured){
			this._timer.stop();
		}
		else{
			throw "emitter has not been configured";
		}
	}
}