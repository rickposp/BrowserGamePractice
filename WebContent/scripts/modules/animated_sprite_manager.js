// Animation Runner
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
			sprite.update(delta);
		});
	}
	
	get sprites(){
		return this._sprites;
	}
}