import SpriteEmitter from './sprite_emitter.js';

export default class ship{
	
	constructor(opts = {}){
		let _start = opts["start"];
		let _end = opts["end"];
		let _speed = opts["speed"];
		let _parent_container = opts["parent_container"];
		let _ship_manager = opts["ship_manager"];
		let _emitter_manager = opts["emitter_manager"];
		let _texture = opts["texture"];
		let _target = opts["target"];
		
		this.ship = _ship_manager.create(_start, _end, _speed, _texture);
		_parent_container.addChild(this.ship);
		
		let emitter_opts = {
				"container" : _parent_container,
				"origin" : new PIXI.Point(100, 100), // anchor is in the middle of the ship
				"destination" : _target,
				"speed" : 5,
				"texture" : PIXI.loader.resources["img/blue_beam.png"].texture,
				"duration" : 500,
				"rate" : 0.005
			}
		this.emitter = new SpriteEmitter(emitter_opts);
		_emitter_manager.push(this.emitter);
		
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
		let bound_function = this.emitter.start.bind(this.emitter);
		
		var timer = PIXI.timerManager.createTimer(1 * 1000);
		timer.on('end', bound_function);
		timer.start();
	}
	
	update(delta){
		// move the sprite and the emitter in unison
		this.emitter.position.copy(this.ship.position);
	}
	
}