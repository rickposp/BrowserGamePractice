// Animation Runner
import AnimatedSprite from './animation.js';

export default class animationRunner extends PIXI.utils.EventEmitter{
	constructor(){
		super();
		this._animations = [];
	}
	
	add(animations){
		this.animations.push(animations);
	}
	
	create(start_point, end_point, speed, texture){
		return new AnimatedSprite(start_point, end_point, speed, texture, this);
	}
	
	remove(animations){
		let index = this.animations.indexOf(animations);
		if (index > -1) {
			this._animations.splice(index, 1);
		}
	}
	
	update(delta){
		this.animations.forEach(function(animation){
			if(animation.destinationReached){
				this.emit('sprite_reached_destination', animation);
			}
			animation.update(delta);
		}, this);
	}
	
	get animations(){
		return this._animations;
	}
}