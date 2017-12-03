import Random from './random.js';

export default function (empty_buckets){
		
		let calculate_total_bucket_capacity = function(){
			let limits = _buckets.map(function(bucket)
					{
						return bucket.limit;
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
		
		this.distribute_damage = function(total_damage){
			if(total_damage > _total_capacity){
				throw "too much damage to distribute";
			}
			
			for(let i = total_damage; i > 0; i--){
				let indexes = get_available_bucket_indexes(); // get the indexes of the buckets that are not full
				let selector = Math.round(Random() * (indexes.length - 1)); // pick a random index from the list
				_buckets[indexes[selector]].add_points(1); // add a point to the bucket at that index
			}
		}
		
		this.get_buckets = function(){
			return _buckets;
		}
		
		this.get_bucket_by_name = function(bucket_name){
			return _buckets.filter(function(bucket){
				return bucket.get_name() == bucket_name;
			})[0];
		}
		
		let _buckets = empty_buckets;
		let _total_capacity = calculate_total_bucket_capacity();
		
	}