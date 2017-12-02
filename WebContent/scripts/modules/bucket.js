export default function (name, limit) {
 
    	this.get_name = function(){
    		return _name;
    	}
    	
    	this.get_limit = function(){
    		return _limit;
    	}
    	
    	this.get_points = function(){
    		return _points;
    	}
    	
    	this.at_limit = function(){
    		return _points >= limit;
    	}
    	
    	this.add_points = function(points){
    		_points += points;
    	}
    	
    	let _name = name;
    	let _limit = limit;
    	let _points = 0;
    }