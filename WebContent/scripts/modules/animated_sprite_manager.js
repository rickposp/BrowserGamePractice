import AnimatedSprite from './animated_sprite.js';

export default class animatedSpriteManager{
	constructor(){
		this._sprites = [];
		this._queue = [];
	}
	
	add(sprite){
		this._sprites.push(sprite);
	}
	
	create(start_point, end_point, speed, texture){
		return new AnimatedSprite(start_point, end_point, speed, texture, true, this);
	}
	
	remove(sprite){
		var index = this.sprites.indexOf(sprite);
		if (index > -1) {
			this._sprites.splice(index, 1);
		}
	}
	
	update(delta){
		this._queue.forEach(function(sprite){
			sprite.update(delta);
		});
	}
	
	remove_from_queue(sprite){
		var index = this._queue.indexOf(sprite);
		if (index > -1) {
			this._queue.splice(index, 1);
		}
	}
	
	get sprites(){
		return this._sprites;
	}
}