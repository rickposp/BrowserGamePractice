export default class animatedSprite extends PIXI.Sprite {
	
	constructor(start_point, end_point, speed, texture, manager = null){
		super(texture);
		this.manager = manager;
		this.start_point = start_point;
		this.end_point = end_point;
		this.speed = speed;
		
		if(speed <= 0){
			throw "speed must be greater than 0";
		}
		
		this.position = start_point;
		this.anchor.set(0,0);
		this.pivot.set(this.width/2, this.height/2);
		
		if(manager){
			this.manager.add(this);
		}
	}
	
	update(delta){
		let delta_x = this.end_point.x - this.start_point.x;
		let delta_y = this.end_point.y - this.start_point.y;
		let dist_x = Math.abs(delta_x);
		let dist_y = Math.abs(delta_y);
		let base_angle;
		let angle;
		if((dist_x != 0) && (dist_y != 0))
		{
			base_angle = Math.atan(dist_y/dist_x);
			//console.log(base_angle);
			if(delta_x > 0 && delta_y > 0)
			{
				angle = base_angle + Math.PI * 1/2;
				this.vx = this.speed * Math.cos(base_angle);
				this.vy = this.speed * Math.sin(base_angle);
			}
			else if(delta_x < 0 && delta_y > 0)
			{
				angle = base_angle + Math.PI;
				this.vx = -(this.speed * Math.cos(base_angle));
				this.vy = this.speed * Math.sin(base_angle);
			}
			else if(delta_x < 0 && delta_y < 0)
			{
				angle = base_angle + Math.PI * 3/2;
				this.vx = -(this.speed * Math.cos(base_angle));
				this.vy = -(this.speed * Math.sin(base_angle));
			}
			else
			{
				angle = Math.PI * 1/2 - base_angle;
				this.vx = this.speed * Math.cos(base_angle);
				this.vy = -(this.speed * Math.sin(base_angle));
			}
		}
		else if(delta_x == 0){
			if(delta_y > 0)
			{
				this.vx = 0;
				this.vy = this.speed;
				angle = Math.PI;
			}
			else
			{
				this.vx = 0;
				this.vy = -this.speed;
				angle = 0;
			}
		}
		else{
			if(delta_x > 0){
				this.vx = this.speed;
				this.vy = 0;
				angle = Math.PI * 1/2;
			}
			else
			{
				this.vx = -this.speed;
				this.vy = 0;
				angle = Math.PI * 3/2;
			}
		}
		this.rotation = angle;
		
		this.x += this.vx * delta;
		this.y += this.vy * delta;
		
		let x_coord_reached = false;
		if(this.vx > 0){
			x_coord_reached = (this.x >= this.end_point.x)
		}
		else{
			x_coord_reached = (this.x <= this.end_point.x)
		}
		
		let y_coord_reached = false;
		if(this.vy > 0){
			y_coord_reached = (this.y >= this.end_point.y)
		}
		else{
			y_coord_reached = (this.y <= this.end_point.y)
		}
		
		if(x_coord_reached && y_coord_reached){
			if(this.manager){
				this.manager.remove(this);
			}
		}
	}
}