import Random from './random.js';
import * as Timer from '../library/pixi-timer.js';
import Button from './button.js';
import AnimatedSpriteManager from './animated_sprite_manager.js';
import SpriteEmitter from './sprite_emitter.js';

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
					"first_timer" : 1000 * 1,
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
				"projectile_manager" : null,
				"alert_text" : "",
				"pixi_app" : null,
				"pixi_ticker" : null,
				"interface_group" : null,
				"action_group" : null,
				"display_income_rate" : 0,
				"user_interface_events" : [],
				"pixi_event_emitter" : null
			}
	}

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
		
		let start_button = new Button(800 - 300,
		        50, 150, 75);
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
        start_button.setText("run", style);
        start_button.clicked = function() {
        	// changing the UI directly here to control the main loop
        	game_state["engine"]["play_button"].visible  = false;
    		game_state["engine"]["pixi_ticker"].start();
    		game_state["engine"]["stop_button"].visible = true;
        }
        start_button.parentGroup = game_state["engine"]["interface_group"];
		game_state["engine"]["play_button"] = start_button;
		game_state["engine"]["pixi_app"].stage.addChild(start_button);
		
		let stop_button = new Button(800 - 100,
		        50, 150, 75);
		stop_button.setText("pause", style);
		stop_button.visible = false;
		stop_button.clicked = function() {
        	game_state["engine"]["stop_button"].visible = false;
    		game_state["engine"]["pixi_ticker"].stop();
    		game_state["engine"]["play_button"].visible  = true;
        }
		stop_button.parentGroup = game_state["engine"]["interface_group"];
		game_state["engine"]["stop_button"] = stop_button;
		game_state["engine"]["pixi_app"].stage.addChild(stop_button);

		var timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["first_timer"]);
		timer.on('end', attack_callback);
		timer.start();
		
		game_state['engine']['pixi_event_emitter'] = new PIXI.utils.EventEmitter();
		game_state["engine"]["ship_manager"] = new AnimatedSpriteManager(game_state["engine"]["pixi_app"].stage);
		
		fire_beams();
	}

	function register_user_interface_event(event){
		game_state["engine"]["user_interface_events"].push(event);
	}

	function attack_callback(){
		add_ship_to_stage();
		this.reset(); //Reset the timer
	    this.time = 1000; //set to 10 seconds
	    this.start(); //And start again
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
		game_state["engine"]["sprite_emitter"].update(delta);
		game_state["engine"]["ship_manager"].update(delta);
	}
	
	function add_ship_to_stage(){
		let ship;
		let texture = PIXI.loader.resources["img/alien4.png"].texture;
		let start = new PIXI.Point(randomInt(100, game_constants["engine"]["animation_width"] - texture.width), 0 - texture.height);
		let end = new PIXI.Point(start.x, game_constants["engine"]["animation_height"] + texture.height);
		ship = game_state["engine"]["ship_manager"].create(start, end, randomInt(1,3), texture);
	}
	
	function fire_beams(){
		let opts = {
			"origin" : new PIXI.Point(100, 100),
			"destination" : new PIXI.Point(300, 456),
			"speed" : 5,
			"texture" : PIXI.loader.resources["img/blue_beam.png"].texture,
			"duration" : 10000,
			"rate" : 0.01,
			"container" : game_state["engine"]["pixi_app"].stage
		}
		game_state["engine"]["sprite_emitter"] = new SpriteEmitter(opts);
		game_state["engine"]["sprite_emitter"].start();
	}

	PIXI.loader
	.add("img/alien4.png")
	.add("img/blue_beam.png")
	.load(initialize_game);
}