import SpriteEmitter from './sprite_emitter.js';

// sprite emitter factory
export default class ship{
	
	constructor(opts){
		let destination = new PIXI.Point(400, 600);
		let emitter_opts = {
		    "start_point" : opts["start"],
            "end_point" : opts["end"],
            "speed" : opts["speed"],
            "texture" : PIXI.loader.resources["img/alien4.png"].texture,
            "animation_runner" : opts["animation_runner"],
            "spawn_origin_offset_x" : 0,
            "spawn_origin_offset_y" : 100,
            "spawn_destination" : destination,
            "spawn_parent_container" : opts["parent_container"],
            "spawn_speed" : 5,
            "spawn_texture" : PIXI.loader.resources["img/blue_beam.png"].texture,
            "spawn_duration" : 500,
            "spawn_rate" : 0.005
        };
		this._emitter = new SpriteEmitter(emitter_opts);
		opts["parent_container"].addChild(this._emitter);

		// passing the method of an object as a callback requires us
		// to indicate what value to use for "this" keyword
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
		let start_emitter_callback = this._emitter.start.bind(this._emitter);
		
		let timer = PIXI.timerManager.createTimer(2 * 1000);
		timer.on('end', start_emitter_callback);
		timer.start();
	}
}