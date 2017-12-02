import Bucket from './bucket.js';
import Distribution from './distribution.js';
export default function () {
	
	let calculate_attack_size = function(game_constants){
		return Math.floor((Math.random() * game_constants["ai"]["attack"]["damage_range"]) + game_constants["ai"]["attack"]["base_damage"]);
	}
	
	let calculate_defense_counter = function(game_state, game_constants){
		let counter = 0;
		counter += game_constants["military"]["light_turret"]["counter_rate"] * game_state["military"]["light_turrets"];
		counter += game_constants["military"]["heavy_turret"]["counter_rate"] * game_state["military"]["heavy_turrets"];
		return counter;
	}

    return function AIAttack(game_state, game_constants) {
    	
    	let enemy_ships = calculate_attack_size(game_constants);
		console.log("The enemy attacked with " + enemy_ships + " ships.");
		let remaining_enemy_ships = Math.max(enemy_ships - calculate_defense_counter(game_state, game_constants), 0);
		console.log(remaining_enemy_ships + " ships remaining");
		let total_defense_damage = remaining_enemy_ships * game_constants['ai']['ships']['damage'];

		let light_turret_health = game_state["military"]["light_turrets"] * game_constants["military"]["light_turret"]["health"];
		let heavy_turret_health = game_state["military"]["heavy_turrets"] * game_constants["military"]["heavy_turret"]["health"];
		let total_defense_health = 0;
		total_defense_health += light_turret_health;
		total_defense_health += heavy_turret_health;
		
		let light_turret_damage = 0;
		let heavy_turret_damage = 0;
		if(total_defense_damage > total_defense_health){
			light_turret_damage = light_turret_health;
			heavy_turret_damage = heavy_turret_health;
		}
		else if (total_defense_damage == 0){
			return
		}
		else {
			let buckets = [];
			buckets.push(
					new Bucket("light_turret", light_turret_health)
			);
			buckets.push(
					new Bucket("heavy_turret", heavy_turret_health)
			);
			let distribution = new Distribution(buckets);
			distribution.distribute_damage(total_defense_damage);
			light_turret_damage = distribution.get_bucket_by_name("light_turret").get_points();
			heavy_turret_damage = distribution.get_bucket_by_name("heavy_turret").get_points();
		}
		console.log("light turret damage: " + light_turret_damage);
		console.log("heavy turret damage: " + heavy_turret_damage);
		
		let remaining_light_turret_health = light_turret_health - light_turret_damage;
		let remaining_heavy_turret_health = heavy_turret_health - heavy_turret_damage;
		game_state["military"]["light_turrets"] = Math.ceil(remaining_light_turret_health/game_constants["military"]["light_turret"]["health"]);
		game_state["military"]["heavy_turrets"] = Math.ceil(remaining_heavy_turret_health/game_constants["military"]["heavy_turret"]["health"]);
		
		if((game_state["military"]["light_turrets"] == 0) &&
		   (game_state["military"]["heavy_turrets"] == 0)){
			console.log("defenses overwhelmed");
			let total_economy_damage = total_defense_damage - light_turret_damage - heavy_turret_damage;
			console.log("Damage to economy: " + total_economy_damage);
			
			let small_factory_health = game_state["economy"]["small_factories"] * game_constants["economy"]["small_factory"]["health"];
			let large_factory_health = game_state["economy"]["large_factories"] * game_constants["economy"]["large_factory"]["health"];
			let total_economy_health = 0;
			total_economy_health += small_factory_health;
			total_economy_health += large_factory_health;
			
			let small_factory_damage = 0;
			let large_factory_damage = 0;
			if(total_economy_damage > total_economy_health){
				small_factory_damage = small_factory_health;
				large_factory_damage = large_factory_health;
			}
			else if(total_economy_damage == 0){
				return;
			}
			else{
				let buckets = [];
				buckets.push(
						new Bucket("small_factory", small_factory_health)
				);
				buckets.push(
						new Bucket("large_factory", large_factory_health)
				);
				let distribution = new Distribution(buckets);
				distribution.distribute_damage(total_economy_damage);
				small_factory_damage = distribution.get_bucket_by_name("small_factory").get_points();
				large_factory_damage = distribution.get_bucket_by_name("large_factory").get_points();
			}
			console.log("small factory damage: " + small_factory_damage);
			console.log("big factory damage: " + large_factory_damage);
			
			let remaining_small_factory_health = small_factory_health - small_factory_damage;
			let remaining_large_factory_health = large_factory_health - large_factory_damage;
			game_state["economy"]["small_factories"] = Math.ceil(remaining_small_factory_health/game_constants["economy"]["small_factory"]["health"]);
			game_state["economy"]["large_factories"] = Math.ceil(remaining_large_factory_health/game_constants["economy"]["large_factory"]["health"]);
			
			if((game_state['economy']['small_factories'] == 0) &&
			   (game_state['economy']['large_factories'] == 0)){
				console.log("economy destroyed");
				if(game_state['economy']['account_balance'] < game_constants["military"]["light_turret"]["cost"]){
					console.log("game lost");
				}
			}
		}
    }
}