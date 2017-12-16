import AIAttack from './ai_attack.js';
import Random from './random.js';
import * as Timer from '../library/pixi-timer.js';
import Button from './button.js';

export default function Game(){
	'use strict';
	let game_constants = {
			"ai": {
				"attack" : {
					"base_damage" : 2,
					"damage_range" : 10,
					"imminent_base_timer" : 1000 * 60 * 2,
					"base_timer" : 1000 * 60 * 2,
					"timer_range" : 1000 * 60 * 5,
					"first_timer" : 1000 * 30,
					"cooldown_timer" : 1000 * 10,
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
				"account_balance_update_interval": 1000,
				"animation_width" : 800,
				"animation_height" : 600
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
			},
			"engine": {
				"ship_sprites" : [],
				"alert_text" : "",
				"pixi_app" : null,
				"pixi_ticker" : null,
				"interface_group" : null,
				"action_group" : null,
				"display_income_rate" : 0,
				"timers" : [],
				"user_interface_events" : [],
				"pixi_event_emitter" : null
			}
	}

	document.getElementById("start").onclick = function () { 
		// changing the UI directly here to control the main loop
		document.getElementById('start').style.visibility  = 'hidden';
		game_state["engine"]["pixi_ticker"].start();
		document.getElementById('stop').style.visibility  = 'visible';
	};

	document.getElementById("stop").onclick = function () { 
		// changing the UI directly here to control the main loop
		document.getElementById('stop').style.visibility  = 'hidden';
		game_state["engine"]["pixi_ticker"].stop();
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

	//The `randomInt` helper function
	function randomInt(min, max) {
		return Math.floor(Random() * (max - min + 1)) + min;
	}

	function initialize_game(){
		//Create a Pixi Application
		game_state["engine"]["pixi_app"] = new PIXI.Application({ 
			width: game_constants["engine"]["animation_width"], 
			height: game_constants["engine"]["animation_height"],                       
			antialiasing: true, 
			transparent: false, 
			resolution: 1
		}
		);

		//specify display list component
		game_state["engine"]["pixi_app"].stage = new PIXI.display.Stage();
		game_state["engine"]["pixi_app"].stage.group.enableSort = true;

		//Add the canvas that Pixi automatically created for you to the HTML document
		document.getElementById("animation_pane").appendChild(game_state["engine"]["pixi_app"].view);

		//load an image and run the `setup` function when it's done
		PIXI.loader
		.add("img/alien4.png")
		.load();

		game_state["engine"]["pixi_ticker"] = new PIXI.ticker.Ticker();

		game_state["engine"]["pixi_ticker"].add(delta =>
		update(delta)
		);
		game_state["engine"]["pixi_ticker"].add(delta =>
		draw(delta)
		);

		game_state["engine"]["interface_group"] = new PIXI.display.Group(1, true);
		game_state["engine"]["action_group"] = new PIXI.display.Group(0, true);

		game_state["engine"]["pixi_app"].stage.addChild(new PIXI.display.Layer(game_state["engine"]["interface_group"]));
		game_state["engine"]["pixi_app"].stage.addChild(new PIXI.display.Layer(game_state["engine"]["action_group"]));

		let text = new PIXI.Text('',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
		game_state["engine"]["alert_text"] = text;
		text.visible = false;
		text.parentGroup = game_state["engine"]["interface_group"];
		game_state["engine"]["pixi_app"].stage.addChild(text);
		
		let button = new Button(800 * 0.5,
		        600 * 0.5, 150, 75);
        let style = new PIXI.TextStyle({
            fontFamily: 'Arial', // Font Family
            fontSize: 22, // Font Size
            fontStyle: 'italic',// Font Style
            fontWeight: 'bold', // Font Weight
            fill: ['#ffffff', '#F8A9F9'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
        });
        button.setText("Play!", style);
        button.clicked = function() {
            console.log('I am clicked');
        }
		button.parentGroup = game_state["engine"]["interface_group"];
		game_state["engine"]["play_button"] = button;
		game_state["engine"]["pixi_app"].stage.addChild(button);

		var timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["imminent_base_timer"]);
		timer.on('end', attack_imminent_callback);
		timer.start();

		timer = PIXI.timerManager.createTimer(game_constants["engine"]["account_balance_update_interval"]);
		timer.loop = true;
		timer.on('repeat', account_balance_update_callback);
		timer.start();
		
		game_state['engine']['pixi_event_emitter'] = new PIXI.utils.EventEmitter();
	}

	function register_user_interface_event(event){
		game_state["engine"]["user_interface_events"].push(event);
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

	function attack_imminent_callback(){
		let timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["first_timer"]);
		timer.on('end', attack_callback);
		timer.start();

		game_state['engine']['pixi_event_emitter'].once('ui_event', function(){
			let element = document.getElementById('attack_warning')
			game_state["engine"]["alert_text"].text = 'WARNING! An attack is imminent!';
			game_state["engine"]["alert_text"].visible = true;
		});
	}

	function attack_callback(){
		console.log("attack action timer expired");
		add_ships_to_stage(10);

		let timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["cooldown_timer"]);
		timer.on('end', cooldown_callback);
		timer.start();

		game_state['engine']['pixi_event_emitter'].once('ui_event', function(){
			game_state["engine"]["alert_text"].text = 'ATTACK';
		});
	}

	function cooldown_callback(){
		console.log("attack cooldown timer expired");
		remove_ships_from_stage();
		AIAttack(game_state, game_constants);
		let ai_attack_timer_duration = Math.floor((Math.random() * game_constants["ai"]["attack"]["timer_range"]) + game_constants["ai"]["attack"]["base_timer"]);

		let timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["imminent_base_timer"]);
		timer.on('end', attack_imminent_callback);
		timer.start();
		
		game_state['engine']['pixi_event_emitter'].once('ui_event', function(){
			game_state["engine"]["alert_text"].visible = false;
		});	
	}

	function account_balance_update(time_elapsed_from_last_update){
		let income_rate = 0;
		income_rate += game_state["economy"]["small_factories"] * game_constants["economy"]["small_factory"]["profit_rate"];
		income_rate += game_state["economy"]["large_factories"] * game_constants["economy"]["large_factory"]["profit_rate"];
		income_rate -= game_state["military"]["light_turrets"] * game_constants["military"]["light_turret"]["expense_rate"];
		income_rate -= game_state["military"]["heavy_turrets"] * game_constants["military"]["heavy_turret"]["expense_rate"];
		game_state["economy"]["account_balance"] += income_rate * time_elapsed_from_last_update;
		game_state["engine"]["display_income_rate"] = income_rate * time_elapsed_from_last_update;
	}

	function account_balance_update_callback(){
		account_balance_update(game_constants["engine"]["account_balance_update_interval"]);
	}

	function update(delta){
		const frame_delta = .01667; // length of a frame in seconds
		PIXI.timerManager.update(frame_delta * delta); // update takes argument in seconds
	}

	function process_user_interface_events(){
		game_state['engine']['pixi_event_emitter'].emit('ui_event');
	}

	function draw(delta) {
		process_user_interface_events();

		game_state["engine"]["ship_sprites"].forEach(function(ship){
			ship.y += ship.vy * delta;
			if(ship.y >= game_constants["engine"]["animation_width"]){
				ship.x = randomInt(100, game_constants["engine"]["animation_width"]);
				ship.y = 0;
			}
		});

		document.getElementById('small_factories').innerHTML = "small factories: " + game_state["economy"]["small_factories"];
		document.getElementById('large_factories').innerHTML = "large factories: " + game_state["economy"]["large_factories"];
		document.getElementById('light_turrets').innerHTML = "light turrets: " + game_state["military"]["light_turrets"];
		document.getElementById('heavy_turrets').innerHTML = "heavy turrets: " + game_state["military"]["heavy_turrets"];
		document.getElementById('income_rate').innerHTML = "income: " + game_state["engine"]["display_income_rate"];
		let formatted_balance = accounting.formatMoney(game_state["economy"]["account_balance"]);
		document.getElementById('account_balance').innerHTML = "balance: " + formatted_balance;
		document.getElementById('fps').innerHTML = game_state["engine"]["pixi_ticker"].FPS.toFixed(2) + " FPS";
	}

	function remove_ships_from_stage(){
		game_state["engine"]["ship_sprites"].forEach(function(ship){
			game_state["engine"]["pixi_app"].stage.removeChild(ship);
		});
	}

	function add_ships_to_stage(num_ships){
		for(let i = 0; i < num_ships; i++){
			let ship;
			ship = new PIXI.Sprite(PIXI.loader.resources["img/alien4.png"].texture);
			ship.x = randomInt(100, game_constants["engine"]["animation_width"]);
			ship.y = 0;
			ship.rotation = 3.14159;
			ship.vy = randomInt(1, 3);
			ship.parentGroup = game_state["engine"]["action_group"];
			game_state["engine"]["ship_sprites"].push(ship);
			game_state["engine"]["pixi_app"].stage.addChild(ship);
		}
	}

	initialize_game()
}