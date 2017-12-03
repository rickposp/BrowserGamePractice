export default class Bucket {
	  constructor(name, limit) {
	    this._name = name;
	    this._limit = limit;
	    this._points = 0;
	  }
	  
	get name(){
  		return this._name;
  	}
  	
  	get limit(){
  		return this._limit;
  	}
  	
  	get points(){
  		return this._points;
  	}
  	
  	at_limit(){
  		return this._points >= this._limit;
  	}
  	
  	add_points(points){
  		this._points += points;
  	}
}