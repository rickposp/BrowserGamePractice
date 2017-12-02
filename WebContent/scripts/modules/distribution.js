define(function() {
	let _buckets;
	let _total_capacity;
	
	let calculate_total_bucket_capacity = function(){
		let limits = _buckets.map(function(bucket)
				{
					return bucket.get_limit();
				});
		
		let sum = limits.reduce(function(a, b)
				{
					return a + b;
				}, 0);
		
		return sum;
	}
	
	let get_available_bucket_indexes = function(){
		let indexes = [];
		for(let i = 0; i < _buckets.length; i++){
			if(!_buckets[i].at_limit()){
				indexes.push(i);
			}
		}
		return indexes;
	}
	
	let distribute_damage = function(total_damage){
		if(total_damage > _total_capacity){
			throw "too much damage to distribute";
		}
		
		for(let i = total_damage; i > 0; i--){
			let indexes = get_available_bucket_indexes(); // get the indexes of the buckets that are not full
			let selector = Math.round(Math.random() * indexes.length); // pick a random index from the list
			_buckets[indexes[selector]].add_points(1); // add a point to the bucket at that index
		}
	}
	
	let get_buckets = function(){
		return _buckets;
	}
	
	let get_bucket_by_name = function(bucket_name){
		return _buckets.filter(function(bucket){
			return bucket.get_name() == bucket_name;
		})[0];
	}
	
	return function Distribution(empty_buckets){
		_buckets = empty_buckets;
		_total_capacity = calculate_total_bucket_capacity();
	}
});