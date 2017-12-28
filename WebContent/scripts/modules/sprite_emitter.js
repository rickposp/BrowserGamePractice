import AnimationRunner from './animation_runner.js';

export default class spriteEmitter extends PIXI.Sprite {
	
	constructor(opts=null){
		super();
		this._animationRunner = new AnimationRunner();
		this._animationRunner.on(
				"sprite_reached_destination",
				function(animation){
					animation.destroy();
				}
			);
		if(opts){
			this.configure(opts);
		}
	}
	
	configure(opts){
	    this._sprite_origin = opts["origin"];
		this._targetContainer = opts["targetContainer"]; // container for all the children of this emitter
		this._destination = opts["destination"];
		this._speed = opts["speed"];
		this._spawn_texture = opts["spawn_texture"];
		this._duration = opts["duration"];
		this._rate = opts["rate"];

        this.sprite_origin = this._sprite_origin;

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
		let start_point = sprite_emitter._sprite_origin;
		let end_point = sprite_emitter._destination;
		let speed = sprite_emitter._speed;
		let texture = sprite_emitter._spawn_texture;
		let animationRunner = sprite_emitter._animationRunner;

		let sprite = animationRunner.create(start_point, end_point, speed, texture);
		container.addChild(sprite);
	}

	get sprites(){
		return this._animationRunner.animations;
	}

	update(delta){
		if(this._configured && this._timer.isStarted){
			this._animationRunner.update(delta);
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
		if(this._configured){
			this._timer.stop();
		}
		else{
			throw "emitter has not been configured";
		}
	}
}