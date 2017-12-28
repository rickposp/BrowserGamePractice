import SpriteEmitter from './sprite_emitter.js';

export default class ship{
	
	constructor(opts){
		let _start = opts["start"];
		let _end = opts["end"];
		let _speed = opts["speed"];
		let _parent_container = opts["parent_container"];
		let _animation_runner = opts["animation_runner"];
		let _emitter_manager = opts["emitter_manager"];
		let _texture = opts["texture"];
		let _target = opts["target"];
		
		this._animation = _animation_runner.create(_start, _end, _speed, _texture);
		_parent_container.addChild(this._animation);

		//let destination = _target;
		let destination = this._animation.toLocal(_target, this._animation);
		let emitter_opts = {
				"targetContainer" : _parent_container,
				"origin" : this._animation.position,
				"destination" : destination,
				"speed" : 5,
				"spawn_texture" : PIXI.loader.resources["img/blue_beam.png"].texture,
				"duration" : 500,
				"rate" : 0.005
			};
		this._emitter = new SpriteEmitter(emitter_opts);
		this._emitter.texture = PIXI.loader.resources["img/emitter.png"].texture;
        this._emitter.scale.x = 0.1;
        this._emitter.scale.y = 0.1;
        this._animation.addChild(this._emitter);
		_emitter_manager.push(this._emitter);
		console.log(this._emitter);

		// passing the method of an object as a callback requires us
		// to indicate what value to use for "this" keyword
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
		let start_emitter_callback = this._emitter.start.bind(this._emitter);
		
		let timer = PIXI.timerManager.createTimer(2 * 1000);
		timer.on('end', start_emitter_callback);
		timer.start();
	}
	
	update(delta){
		// move the sprite and the emitter in unison
		//this._emitter.position.copy(this._animation.position);
	}
	
}