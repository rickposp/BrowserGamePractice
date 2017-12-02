define(['accounting', 'velocity', 'mainloop', 'modules/game_engine_timer', 'modules/game_engine_ui_event'], 
function(accounting, Velocity, MainLoop, GameEngineTimer, GameEngineUIEvent){
	return function Game(){
			'use strict';
			let game_constants = {
					  "ai": {
						    "attack" : {
						    	"base_damage" : 2,
						    	"damage_range" : 10,
						    	"imminent_base_timer" : 1000 * 60 * 2
						    },
							"ships" : {
								"damage" : 1
							}
					  },
					  "economy": {
					    "small_factory": {
					      "cost": 100,
					      "profit_rate": .002,
					      "health" : 1
					    },
					    "large_factory": {
					      "cost": 400,
					      "profit_rate": .010,
					      "health" : 1
					    }
					  },
					  "military": {
					    "light_turret": {
					      "cost": 200,
					      "expense_rate": 0.0005,
					      "counter_rate": 2,
					      "health" : 1
					    },
					    "heavy_turret": {
					      "cost": 800,
					      "expense_rate": .0020,
					      "counter_rate": 10,
					      "health" : 1
					    }
					  },
					  "engine": {
						  "account_balance_update_interval": 1000
					  }
					};
			
			let game_state = {
					  "ai": {
						  },
					  "economy": {
					    "account_balance": 200,
					    "small_factories": 0,
					    "large_factories": 0
					  },
					  "military": {
					    "light_turrets": 0,
					    "heavy_turrets": 0
					  }
					}
			
			let purchase_types = ["small factory", "big factory", "light turret", "heavy turret"];
			
			// calculated display values
			let display_income_rate = 0;
			
			// Time tracking (units are in milliseconds)
			let ai_base_attack_timer = 1000 * 60 * 2;
			let ai_attack_timer_range = 1000 * 60 * 5;
			let ai_attack_timer = 1000 * 30
			let ai_attack_cooldown_timer = 1000 * 10;
			let timers = [];
			
			// event tracking
			let user_interface_events = [];
			
			document.getElementById("start").onclick = function () { 
				// changing the UI directly here to control the main loop
				document.getElementById('start').style.visibility  = 'hidden';
				MainLoop.start(); 
				document.getElementById('stop').style.visibility  = 'visible';
			};
				
			document.getElementById("stop").onclick = function () { 
				// changing the UI directly here to control the main loop
				document.getElementById('stop').style.visibility  = 'hidden';
				MainLoop.stop();
				document.getElementById('start').style.visibility  = 'visible';
			};
			
			document.getElementById("buy_small_factory").onclick = function () {
				if(game_state["economy"]["account_balance"] >= game_constants["economy"]["small_factory"]["cost"]){
					game_state["economy"]["small_factories"] += 1;
					game_state["economy"]["account_balance"] -= game_constants["economy"]["small_factory"]["cost"];
				}
				else{
					highlight_balance();
				}
			};
			
			document.getElementById("buy_large_factory").onclick = function () {
				if(game_state["economy"]["account_balance"] >= game_constants["economy"]["large_factory"]["cost"]){
					game_state["economy"]["large_factories"] += 1;
					game_state["economy"]["account_balance"] -= game_constants["economy"]["large_factory"]["cost"];
				}
				else{
					highlight_balance();
				}
			};
			
			document.getElementById("buy_light_turret").onclick = function () {
				if(game_state["economy"]["account_balance"] >= game_constants["military"]["light_turret"]["cost"]){
					game_state["military"]["light_turrets"] += 1;
					game_state["economy"]["account_balance"] -= game_constants["military"]["light_turret"]["cost"];
				}
				else{
					highlight_balance();
				}
			};
			
			document.getElementById("buy_heavy_turret").onclick = function () {
				if(game_state["economy"]["account_balance"] >= game_constants["military"]["heavy_turret"]["cost"]){
					game_state["military"]["heavy_turrets"] += 1;
					game_state["economy"]["account_balance"] -= game_constants["military"]["heavy_turret"]["cost"];
				}
				else{
					highlight_balance();
				}
			};
			
			function initialize_game(){
				MainLoop
				.setUpdate(update)
				.setDraw(draw)
				.setEnd(end)
				
				let initial_attack_imminent_timer = new GameEngineTimer(game_constants["ai"]["attack"]["imminent_base_timer"]);
				initial_attack_imminent_timer.on('end', attack_imminent_callbck);
				initial_attack_imminent_timer.start();
				register_timer(initial_attack_imminent_timer);
				
				let initial_account_balance_update_timer = new GameEngineTimer(game_constants["engine"]["account_balance_update_interval"]);
				initial_account_balance_update_timer.on('end', account_balance_update_callback);
				initial_account_balance_update_timer.start();
				register_timer(initial_account_balance_update_timer);	
			}
			
			function register_user_interface_event(event){
				user_interface_events.push(event);
			}
			
			function register_timer(timer){
				timers.push(timer);
			}
			
			function process_timers(delta){
				timers.forEach( function (timer, index)
				{
					if(timer.running){
				    	timer.tick(delta);
					}
					else{
						timers.splice(index, 1);
					}
				});
			}
			
			function highlight_balance(){
				let e = document.getElementById('account_balance')
				Velocity(
					e, 
					{ 
					  color: "#ff0000", // Animate the text color to the hex value for pure red.
					}, 
					200); 
				Velocity(e, "reverse", { duration: 1000 });
			}
			
			function calculate_attack_size(){
				return Math.floor((Math.random() * game_constants["ai"]["attack"]["damage_range"]) + game_constants["ai"]["attack"]["base_damage"]);
			}
			
			function calculate_defense_counter(){
				let counter = 0;
				counter += game_constants["military"]["light_turret"]["counter_rate"] * game_state["military"]["light_turrets"];
				counter += game_constants["military"]["heavy_turret"]["counter_rate"] * game_state["military"]["heavy_turrets"];
				return counter;
			}
			
			function distribute_turret_damage(damage, light_turret_health, heavy_turret_health){
				if(damage > light_turret_health + heavy_turret_health){
					throw "too much damage to distribute";
				}
				let light_turret_damage = 0;
				let heavy_turret_damage = 0;
				// this is an inefficient algorithm for distributing the damage randomly across buckets
				for (let i = damage; i > 0; i--) { 
					let light_turrets_bucket_full = (light_turret_damage >= light_turret_health);
					let heavy_turrets_bucket_full = (heavy_turret_damage >= heavy_turret_health);
					
					if(light_turrets_bucket_full){
						heavy_turret_damage += damage;
						break;
					}
					
					if(heavy_turrets_bucket_full){
						light_turret_damage += damage;
						break;
					}

					let bucket = Math.round(Math.random());
					if(bucket == 0){
						light_turret_damage++;
					}
					else{
						heavy_turret_damage++;
					}
				}
				return {
					"light_turret_damage" : light_turret_damage,
					"heavy_turret_damage" : heavy_turret_damage
				}
			}
			
			function distribute_factory_damage(damage, small_factory_health, large_factory_health){
				if(damage > small_factory_health + large_factory_health){
					throw "too much damage to distribute";
				}
				let small_factory_damage = 0;
				let large_factory_damage = 0;
				// this is an inefficient algorithm for distributing the damage randomly across buckets
				for (i = damage; i > 0; i--) { 
					let small_factory_bucket_full = (small_factory_damage >= small_factory_health);
					let large_factory_bucket_full = (large_factory_damage >= large_factory_health);
					
					if(small_factory_bucket_full){
						large_factory_damage += damage;
						break;
					}
					
					if(large_factory_bucket_full){
						small_factory_damage += damage;
						break;
					}

					let bucket = Math.round(Math.random());
					if(bucket == 0){
						small_factory_damage++;
					}
					else{
						large_factory_damage++;
					}
				}
				return {
					"small_factory_damage" : small_factory_damage,
					"large_factory_damage" : large_factory_damage
				}
			}
			
			function attack(){
				let enemy_ships = calculate_attack_size();
				console.log("The enemy attacked with " + enemy_ships + " ships.");
				let remaining_enemy_ships = Math.max(enemy_ships - calculate_defense_counter(), 0);
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
				else {
					let distribution = distribute_turret_damage(total_defense_damage, light_turret_health, heavy_turret_health);
					light_turret_damage = distribution['light_turret_damage'];
					heavy_turret_damage = distribution['heavy_turret_damage'];
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
					else{
						let distribution = distribute_factory_damage(total_economy_damage, small_factory_health, large_factory_health);
						small_factory_damage = distribution['small_factory_damage'];
						large_factory_damage = distribution['large_factory_damage'];
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
							MainLoop.stop();
						}
					}
				}
			}
			
			function attack_imminent_callbck(){
				console.log("attack imminent timer expired");
				let timer = new GameEngineTimer(ai_attack_timer);
				timer.on('end', attack_callback);
				timer.start();
				register_timer(timer);
				let event = new GameEngineUIEvent(function(){
					let element = document.getElementById('attack_warning')
					element.innerHTML = 'WARNING! An attack is imminent!';
					element.style.visibility = 'visible';
				});
				register_user_interface_event(event);
			}
			
			function attack_callback(){
				console.log("attack action timer expired");
				let timer = new GameEngineTimer(ai_attack_cooldown_timer);
				timer.on('end', cooldown_callback);
				timer.start();
				register_timer(timer);
				let event = new GameEngineUIEvent(function(){
					document.getElementById('attack_warning').innerHTML = 'ATTACK';
				});
				register_user_interface_event(event);
			}
			
			function cooldown_callback(){
				console.log("attack cooldown timer expired");
				attack();
				let ai_attack_timer_duration = Math.floor((Math.random() * ai_attack_timer_range) + ai_base_attack_timer);
				let timer = new GameEngineTimer(ai_attack_timer_duration);
				timer.on('end', attack_imminent_callbck);
				timer.start();
				register_timer(timer);	
				let event = new GameEngineUIEvent(function(){
					document.getElementById('attack_warning').style.visibility = 'hidden';
				});
				register_user_interface_event(event);	
			}
			
			function account_balance_update(time_elapsed_from_last_update){
				let income_rate = 0;
				income_rate += game_state["economy"]["small_factories"] * game_constants["economy"]["small_factory"]["profit_rate"];
				income_rate += game_state["economy"]["large_factories"] * game_constants["economy"]["large_factory"]["profit_rate"];
				income_rate -= game_state["military"]["light_turrets"] * game_constants["military"]["light_turret"]["expense_rate"];
				income_rate -= game_state["military"]["heavy_turrets"] * game_constants["military"]["heavy_turret"]["expense_rate"];
				game_state["economy"]["account_balance"] += income_rate * time_elapsed_from_last_update;
				display_income_rate = income_rate * time_elapsed_from_last_update;
			}
			
			function account_balance_update_callback(){
				account_balance_update(game_constants["engine"]["account_balance_update_interval"]);
				let timer = new GameEngineTimer(game_constants["engine"]["account_balance_update_interval"]);
				timer.on('end', account_balance_update_callback);
				timer.start();
				register_timer(timer);	
			}
			
			function update(delta){
				process_timers(delta);
			}
			
			function process_user_interface_events(){
				user_interface_events.forEach( function (event, index)
						{
							event.trigger();
							user_interface_events.splice(index, 1);
						});
			}
			
			function draw(delta) {
				process_user_interface_events();
				
			    document.getElementById('small_factories').innerHTML = "small factories: " + game_state["economy"]["small_factories"];
			    document.getElementById('large_factories').innerHTML = "large factories: " + game_state["economy"]["large_factories"];
			    document.getElementById('light_turrets').innerHTML = "light turrets: " + game_state["military"]["light_turrets"];
			    document.getElementById('heavy_turrets').innerHTML = "heavy turrets: " + game_state["military"]["heavy_turrets"];
			    document.getElementById('income_rate').innerHTML = "income: " + display_income_rate;
			    let formatted_balance = accounting.formatMoney(game_state["economy"]["account_balance"]);
			    document.getElementById('account_balance').innerHTML = "balance: " + formatted_balance;
			    document.getElementById('fps').innerHTML = MainLoop.getFPS().toFixed(2) + " FPS";
			}
			
			function end(fps, panic) {
				if(panic){
					alert("Panic! The simulation has fallen too far behind.");
				}
			}
			
			initialize_game()
		}
	
});