export default class projectile extends PIXI.Graphics {
	
	constructor(start_point, end_point, speed, manager = null){
		super();
		this.manager = manager;
		this.start_point = start_point;
		this.end_point = end_point;
		
		if(speed < 0){
			throw "speed must be greater than 0";
		}
		
		this.position = start_point;
		//this.anchor.set(0,0);
		this.pivot.set(4/2, 35/2);
		
		this.lineStyle(1, 0x1F578A, 1);
		this.beginFill(0x66CCFF);
		this.drawRoundedRect(start_point.x, start_point.y, 4, 35, 2);

		let delta_x = this.end_point.x - this.start_point.x;
		let delta_y = this.end_point.y - this.start_point.y;
		let dist_x = Math.abs(delta_x);
		let dist_y = Math.abs(delta_y);
		let base_angle;
		if(dist_y)
		{
			base_angle = Math.atan(dist_y/dist_x);
		}
		else{
			base_angle = 0;
		}
		let angle;
		if(delta_x >= 0 && delta_y > 0)
		{
			angle = base_angle + Math.PI/2;
			this.vx = speed * Math.cos(base_angle);
			this.vy = speed * Math.sin(base_angle);
		}
		else if(delta_x <= 0 && delta_y > 0)
		{
			angle = base_angle + Math.PI;
			this.vx = -(speed * Math.cos(base_angle));
			this.vy = speed * Math.sin(base_angle);
		}
		else if(delta_x <= 0 && delta_y < 0)
		{
			angle = base_angle + Math.PI * 3/2;
			this.vx = -(speed * Math.cos(base_angle));
			this.vy = -(speed * Math.sin(base_angle));
		}
		else
		{
			angle = base_angle;
			this.vx = speed * Math.cos(base_angle);
			this.vy = -(speed * Math.sin(base_angle));
		}
		this.rotation = angle;
		
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