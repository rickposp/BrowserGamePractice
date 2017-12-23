export default class ship extends PIXI.Sprite {
	
	constructor(start_point, end_point, velocity, texture, manager = null){
		super(texture);
		this.manager = manager;
		this.start_point = start_point;
		this.end_point = end_point;
		
		this.position = start_point;
		this.pivot = start_point;
		this.angle = this._calculate_angle();
		//this.angle += Math.PI;
		this.rotation = this.angle;
		this.vx = velocity * Math.sin(this.angle);
		this.vy = velocity * Math.cos(this.angle);
		
		if(manager){
			this.manager.add(this);
		}
	}
	
	update(delta){
		this.x += this.vx * delta;
		this.y += this.vy * delta;
		
		let x_coord_reached = false;
		if(this.vx > 0){
			x_coord_reached = (this.x > this.end_point.x)
		}
		else{
			x_coord_reached = (this.x < this.end_point.x)
		}
		
		let y_coord_reached = false;
		if(this.vy > 0){
			y_coord_reached = (this.x > this.end_point.y)
		}
		else{
			y_coord_reached = (this.x < this.end_point.y)
		}
		
		if(x_coord_reached && y_coord_reached){
			if(manager){
				this.manager.remove(this);
			}
		}
	}
	
	_calculate_angle(){
		let delta_x = this.end_point.x - this.start_point.x;
		let delta_y = this.end_point.y - this.start_point.y;
		
		if(delta_y == 0){
			return 0;
		}
		return Math.atan(delta_x/delta_y);
	}
}