(function(){
	'use strict';
	let game_constants = {
			  "ai": {
				    "attack" : {
				    	"base_damage" : 2,
				    	"damage_range" : 10,
				    	"imminent_base_timer" : 1000 * 60 * 2
				    }
			  },
			  "economy": {
			    "small_factory": {
			      "cost": 100,
			      "profit_rate": .002
			    },
			    "big_factory": {
			      "cost": 400,
			      "profit_rate": .010
			    }
			  },
			  "military": {
			    "light_turret": {
			      "cost": 200,
			      "expense_rate": 0.0005,
			      "counter_rate": 2
			    },
			    "heavy_turret": {
			      "cost": 800,
			      "expense_rate": .0020,
			      "counter_rate": 10
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
			    "big_factories": 0
			  },
			  "military": {
			    "light_turrets": 0,
			    "heavy_turrets": 0
			  }
			}
	
	let purchase_types = ["small factory", "big factory", "light turret", "heavy turret"];
	
	// game state
	let heavy_turrets = 0;
	
	// calculated display values
	let income_rate = 0;
	
	// Time tracking
	let ai_base_attack_timer = 1000 * 60 * 2;
	let ai_attack_timer_range = 1000 * 60 * 5;
	let ai_attack_timer = ai_base_attack_timer; // milliseconds
	let ai_attack_cooldown_timer = 1000 * 30;
	let timers = [];
	
	// event tracking
	let user_interface_events = [];
	
	class GameEngineUIEvent {
		constructor(callback){
			this.trigger = callback;
		}
	}
	
	class GameEngineTimer {
	
	  constructor(duration) {
	    this.duration = duration;
	    this.time_remaining = duration;
	    this.running = false;
	    
	    this.callback_start = null;
	    this.callback_stop = null;
	    this.callback_restart = null;
	    this.callback_tick = null;
	    this.callback_end = null;
	  }
	
	  start() {
		  this.running = true;
		  if(this.callback_start){
			  this.callback_start();
		  }
	  }
	  
	  stop(){
		 this.running = false;
		  if(this.callback_stop){
			  this.callback_stop();
		  }
	  }
	  
	  restart(){
		 this.running = true;
		 this.time_remaining = this.duration; 
		 if(this.callback_restart){
			 this.callback_restart();
		 }
	  }
	  
	  tick(delta){
		  self = this
		  self.delta = delta
		  if(this.running){
			  if(this.time_remaining <= 0){
				  this.running = false;
				  this.callback_end(self);
			  }
			  else {
				  this.time_remaining -= delta;
			  }
			  if(this.callback_tick){
				  this.callback_tick();
			  }
		  }
	  }
	  
	  on(event, callback){
		  switch(event){
		  	case 'start':
		  		this.callback_start = callback;
		  	break;
		  	
		  	case 'stop':
		  		this.callback_stop = callback;
		  	break;
		  	
		  	case 'tick':
		  		this.callback_tick = callback;
		  	break;
		  	
		  	case 'restart':
		  		this.callback_restart = callback;
		  	break;
		  	
		  	case 'end':
		  		this.callback_end = callback;
		  	break;
		 }	
	  }
	
	}
	
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
	
	var select = document.getElementById("purchase_selector");
	for(var i = 0; i < purchase_types.length; i++) {
		let opt = document.createElement("option");
		opt.value = purchase_types[i];
		opt.textContent = purchase_types[i];
		select.appendChild(opt);
	}
	
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
	
	document.getElementById("buy").onclick = function () {
		let e = document.getElementById('purchase_selector');
		let value = e.options[e.selectedIndex].value;
		
		switch(value){
			case 'small factory':
				if(game_state["economy"]["account_balance"] > 100){
					game_state["economy"]["small_factories"] += 1;
					game_state["economy"]["account_balance"] -= 100;
				}
				else{
					highlight_balance();
				}
				break;
			case 'light turret':
				if(game_state["economy"]["account_balance"] > 200){
					game_state["military"]["light_turrets"] += 1;
					game_state["economy"]["account_balance"] -= 200;
				}
				else{
					highlight_balance();
				}
		};
	};
	
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
	
	function attack(){
		let damage = Math.floor((Math.random() * game_constants["ai"]["attack"]["damage_range"]) + game_constants["ai"]["attack"]["base_damage"]);
		let uncountered_damage = Math.max(damage - (game_state["military"]["light_turrets"] * game_constants["military"]["light_turret"]["counter_rate"]), 0);
		let defense_turret_damage = Math.min(game_state["military"]["light_turrets"], uncountered_damage);
		let factory_damage = Math.min(game_state["economy"]["small_factories"], uncountered_damage - defense_turret_damage);
		
		game_state["military"]["light_turrets"] -= defense_turret_damage;
		game_state["economy"]["small_factories"] -= factory_damage;
		
		console.log("attack did " + damage + " damage");
		
		if((game_state["economy"]["small_factories"] == 0) && (uncountered_damage - defense_turret_damage - factory_damage >= 0)){
			console.log("colony destroyed")
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
		income_rate = (game_state["economy"]["small_factories"] * game_constants["economy"]["small_factory"]["profit_rate"]) - (game_state["military"]["light_turrets"] * game_constants["military"]["light_turret"]["expense_rate"]);
		game_state["economy"]["account_balance"] += income_rate * time_elapsed_from_last_update;
	}
	
	function account_balance_update_callback(){
		account_balance_update(game_constants["engine"]["account_balance_update_interval"])
		
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
	    document.getElementById('light_turrets').innerHTML = "light turrets: " + game_state["military"]["light_turrets"];
	    document.getElementById('heavy_turrets').innerHTML = "heavy turrets: " + heavy_turrets;
	    document.getElementById('income_rate').innerHTML = "income: " + income_rate;
	    let formatted_balance = accounting.formatMoney(game_state["economy"]["account_balance"]);
	    document.getElementById('account_balance').innerHTML = "balance: " + formatted_balance;
	    document.getElementById('fps').innerHTML = MainLoop.getFPS().toFixed(2) + " FPS";
	}
	
	function end(fps, panic) {
		if(panic){
			alert("Panic! The simulation has fallen too far behind.");
		}
	}
})();