// Animation
export default class animation extends PIXI.Sprite {
	
	constructor(start_point, end_point, speed, texture, animation_runner = null){
		super(texture);
		this._animation_runner = animation_runner;
		this._start_point = new PIXI.Point();
		this._start_point.copy(start_point);
		this._end_point = new PIXI.Point();
		this._end_point.copy(end_point);
		this._speed = speed;
		this._moving = false;
		this._destination_reached = false;
		
		this.vx = 0;
		this.vy = 0;
		
		if(speed <= 0){
			throw "speed must be greater than 0";
		}
		
		this.position = start_point;
		this.pivot.set(this.width/2, this.height/2);
		
		if(this._animation_runner){
			this._animation_runner.add(this);
		}
	}
	
	get moving(){
		return this._moving;
	}
	
	get destinationReached(){
		return this._destination_reached;
	}
	
	update(delta){
		if(this._destination_reached){
			return;
		}
		let delta_x = this._end_point.x - this._start_point.x;
		let delta_y = this._end_point.y - this._start_point.y;
		let dist_x = Math.abs(delta_x);
		let dist_y = Math.abs(delta_y);
		let base_angle;
		let angle;
		if((dist_x !== 0) && (dist_y !== 0))
		{
			base_angle = Math.atan(dist_y/dist_x);
			if(delta_x > 0 && delta_y > 0)
			{
				angle = base_angle + Math.PI * 1/2;
				this.vx = this._speed * Math.cos(base_angle);
				this.vy = this._speed * Math.sin(base_angle);
			}
			else if(delta_x < 0 && delta_y > 0)
			{
				angle = Math.PI * 1/2 - base_angle;
				this.vx = -(this._speed * Math.cos(base_angle));
				this.vy = this._speed * Math.sin(base_angle);
			}
			else if(delta_x < 0 && delta_y < 0)
			{
				angle = base_angle + Math.PI * 3/2;
				this.vx = -(this._speed * Math.cos(base_angle));
				this.vy = -(this._speed * Math.sin(base_angle));
			}
			else
			{
				angle = Math.PI * 1/2 - base_angle;
				this.vx = this._speed * Math.cos(base_angle);
				this.vy = -(this._speed * Math.sin(base_angle));
			}
		}
		else if(delta_x === 0){
			if(delta_y > 0)
			{
				this.vx = 0;
				this.vy = this._speed;
				angle = Math.PI;
			}
			else
			{
				this.vx = 0;
				this.vy = -this._speed;
				angle = 0;
			}
		}
		else{
			if(delta_x > 0){
				this.vx = this._speed;
				this.vy = 0;
				angle = Math.PI * 1/2;
			}
			else
			{
				this.vx = -this._speed;
				this.vy = 0;
				angle = Math.PI * 3/2;
			}
		}
		this.rotation = angle;
		this.x += this.vx * delta;
		this.y += this.vy * delta;
		
		let x_coord_reached = false;
		if(this.vx > 0){
			x_coord_reached = (this.x >= this._end_point.x)
		}
		else{
			x_coord_reached = (this.x <= this._end_point.x)
		}
		
		let y_coord_reached = false;
		if(this.vy > 0){
			y_coord_reached = (this.y >= this._end_point.y)
		}
		else{
			y_coord_reached = (this.y <= this._end_point.y)
		}
		
		if(x_coord_reached && y_coord_reached){
			this._destination_reached = true;
			this._moving = false;
		}
		
		if(((this.vx !== 0) ||
		   (this.vy !== 0)) &&
		   !this._destination_reached){
			this._moving = true;
		}
	}
}