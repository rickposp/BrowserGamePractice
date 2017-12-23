import AnimatedSprite from './animated_sprite.js';

export default class animatedSpriteManager{
	constructor(container){
		this.sprites = [];
		this.container = container;
	}
	
	add(sprite){
		this.sprites.push(sprite);
		this.container.addChild(sprite);
	}
	
	create(start_point, end_point, speed, texture){
		let sprite = new AnimatedSprite(start_point, end_point, speed, texture, this)
		return sprite;
	}
	
	remove(sprite){
		var index = this.sprites.indexOf(sprite);
		if (index > -1) {
			this.sprites.splice(index, 1);
			this.container.removeChild(sprite);
		}
	}
	
	update(delta){
		this.sprites.forEach(function(sprite){
			sprite.update(delta);
		});
	}
}