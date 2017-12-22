import Projectile from './projectile.js';

export default class projectileManager{
	constructor(container){
		this.projectiles = [];
		this.container = container;
	}
	
	add(projectile){
		this.projectiles.push(projectile);
		this.container.addChild(projectile);
	}
	
	createProjectile(start_point, end_point, velocity){
		let projectile = new Projectile(start_point, end_point, 5, this)
		this.add(projectile);
		return projectile;
	}
	
	remove(projectile){
		var index = this.projectiles.indexOf(projectile);
		if (index > -1) {
			this.projectiles.splice(index, 1);
			this.container.removeChild(projectile);
		}
	}
	
	update(delta){
		this.projectiles.forEach(function(projectile){
			projectile.update(delta);
		});
	}
}