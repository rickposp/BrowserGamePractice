export default class projectile extends PIXI.Graphics {
	
	constructor(start_point, end_point, velocity, manager = null){
		super();
		this.manager = manager;
		this.start_point = start_point;
		this.end_point = end_point;
		this.angle = this._calculate_angle();
		this.rotation = this.angle;
		this.vx = velocity * Math.sin(this.angle);
		this.vy = velocity * Math.cos(this.angle);
		this.lineStyle(1, 0x1F578A, 1);
		this.beginFill(0x66CCFF);
		this.drawRoundedRect(start_point.x, start_point.y, 4, 35, 2);
		this.endFill();
		this.pivot = start_point;
		this.position = start_point;
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