import {randomInt} from './random.js';
import * as Timer from '../library/pixi-timer.js';
import Button from './button.js';
import AnimatedSpriteManager from './animation_runner.js';
import SpriteEmitter from './sprite_emitter.js';
import Ship from './ship.js';
import ButtonFactory from './button_factory.js';

export default function Game(){
	'use strict';
	let game_constants = {
			"ai": {
				"attack" : {
					"first_timer" : 1000
				}
			},
			"engine": {
				"animation_width" : 800,
				"animation_height" : 600
			}
	};

	let game_state = {
			"engine": {
				"pixi_app" : null,
				"pixi_ticker" : null,
				"interface_group" : null,
				"action_group" : null,
				"sprite_emitters" : [],
				"ships" : []
			}
	};

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

		let buttonFactory = new ButtonFactory();
		let start_button = buttonFactory.createButton(
		    "start",
            new PIXI.Point(500, 50),
            game_state["engine"]["interface_group"],
            function() {
                // changing the UI directly here to control the main loop
                game_state["engine"]["play_button"].visible  = false;
                game_state["engine"]["pixi_ticker"].start();
                game_state["engine"]["stop_button"].visible = true;
            });
		game_state["engine"]["play_button"] = start_button;
		game_state["engine"]["pixi_app"].stage.addChild(start_button);
		
		let stop_button = buttonFactory.createButton(
		    "pause",
            new PIXI.Point(700, 50),
            game_state["engine"]["interface_group"],
            function() {
                game_state["engine"]["stop_button"].visible = false;
                game_state["engine"]["pixi_ticker"].stop();
                game_state["engine"]["play_button"].visible  = true;
            });
		game_state["engine"]["stop_button"] = stop_button;
		game_state["engine"]["pixi_app"].stage.addChild(stop_button);

		let timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["first_timer"]);
		timer.on('end', attack_callback);
		timer.start();

		game_state["engine"]["ship_manager"] = new AnimatedSpriteManager(game_state["engine"]["pixi_app"].stage);
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

	function draw(delta) {
		game_state["engine"]["sprite_emitters"].forEach(function(emitter){
			emitter.update(delta);
		});
		game_state["engine"]["ships"].forEach(function(ship){
			ship.update(delta);
		});
		game_state["engine"]["ship_manager"].update(delta);
	}
	
	function add_ship_to_stage(){
		let texture = PIXI.loader.resources["img/alien4.png"].texture;
		let start = new PIXI.Point(randomInt(100, game_constants["engine"]["animation_width"] - texture.width), 0 - texture.height);
		let opts = {
				"start": start,
				"end": new PIXI.Point(start.x, game_constants["engine"]["animation_height"] + texture.height),
				"speed": randomInt(1,3),
				"parent_container": game_state["engine"]["pixi_app"].stage,
				"animation_runner": game_state["engine"]["ship_manager"],
				"emitter_manager": game_state["engine"]["sprite_emitters"],
				"texture": texture,
				"target" : new PIXI.Point(400, 600)
		};
		let ship = new Ship(opts);
		game_state["engine"]["ships"].push(ship);
	}

	PIXI.loader
	.add("img/alien4.png")
	.add("img/blue_beam.png")
	.load(initialize_game);
}