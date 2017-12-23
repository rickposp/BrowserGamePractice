import Ship from './ship.js';

export default class shipManager{
	constructor(container){
		this.ships = [];
		this.container = container;
	}
	
	add(ship){
		this.ships.push(ship);
		this.container.addChild(ship);
	}
	
	createShip(start_point, end_point, velocity, texture){
		let ship = new Ship(start_point, end_point, velocity, texture, this)
		return ship;
	}
	
	remove(ship){
		var index = this.ships.indexOf(ship);
		if (index > -1) {
			this.ships.splice(index, 1);
			this.container.removeChild(ship);
		}
	}
	
	update(delta){
		this.ships.forEach(function(ship){
			ship.update(delta);
		});
	}
}