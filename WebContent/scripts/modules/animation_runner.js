// Animation Runner
import AnimatedSprite from './animation.js';

export default class animationRunner extends PIXI.utils.EventEmitter{
	constructor(){
		super();
		this._sprites = [];
	}
	
	add(sprite){
		this._sprites.push(sprite);
	}
	
	create(start_point, end_point, speed, texture){
		return new AnimatedSprite(start_point, end_point, speed, texture, this);
	}
	
	remove(sprite){
		var index = this.sprites.indexOf(sprite);
		if (index > -1) {
			this._sprites.splice(index, 1);
		}
	}
	
	update(delta){
		this._sprites.forEach(function(sprite){
			if(sprite.destinationReached){
				this.emit('sprite_reached_destination', sprite);
			}
			sprite.update(delta);
		}, this);
	}
	
	get sprites(){
		return this._sprites;
	}
}