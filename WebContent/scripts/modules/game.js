import {randomInt} from './random.js';
import * as Timer from '../library/pixi-timer.js';
import Button from './button.js';
import AnimationRunner from './animation_runner.js';
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
			},
            "control" : {
			    "w_pressed" : false,
                "a_pressed" : false,
                "s_pressed" : false,
                "d_pressed" : false
            }
	};

	function initialize_game(){
        let engine = game_state["engine"];

		//Create a Pixi Application
		engine["pixi_app"] = new PIXI.Application({
			width: game_constants["engine"]["animation_width"],
			height: game_constants["engine"]["animation_height"],
			antialiasing: true, 
			transparent: false, 
			resolution: 1
		}
		);

        let app = engine["pixi_app"];

        app.stage = new PIXI.display.Stage();
		app.stage.group.enableSort = true;

		//Add the canvas that Pixi automatically created for you to the HTML document
		document.getElementById("animation_pane").appendChild(app.view);

		engine["pixi_ticker"] = new PIXI.ticker.Ticker();

		engine["pixi_ticker"].add(delta =>
			update(delta)
		);
		engine["pixi_ticker"].add(delta =>
			draw(delta)
		);

		engine["interface_group"] = new PIXI.display.Group(1, true);
		engine["action_group"] = new PIXI.display.Group(0, true);

		engine["pixi_app"].stage.addChild(new PIXI.display.Layer(engine["interface_group"]));
		engine["pixi_app"].stage.addChild(new PIXI.display.Layer(engine["action_group"]));

		let buttonFactory = new ButtonFactory();
		let start_button = buttonFactory.createButton(
		    "start",
            new PIXI.Point(500, 50),
            engine["interface_group"],
            function() {
                // changing the UI directly here to control the main loop
                engine["play_button"].visible  = false;
                engine["pixi_ticker"].start();
                engine["stop_button"].visible = true;
            });
		engine["play_button"] = start_button;
		app.stage.addChild(start_button);
		
		let stop_button = buttonFactory.createButton(
		    "pause",
            new PIXI.Point(700, 50),
            engine["interface_group"],
            function() {
                engine["stop_button"].visible = false;
                engine["pixi_ticker"].stop();
                engine["play_button"].visible  = true;
            });
		engine["stop_button"] = stop_button;
		app.stage.addChild(stop_button);

		let timer = PIXI.timerManager.createTimer(game_constants["ai"]["attack"]["first_timer"]);
		timer.on('end', attack_callback);
		timer.start();

		engine["animation_runner"] = new AnimationRunner(app.stage);

        let listener = new window.keypress.Listener();

        listener.register_combo({
            "keys"              : "w",
            "on_keydown"        : w_down,
            "on_keyup"          : w_up,
            "this"              : undefined,
            "prevent_default"   : false,
            "prevent_repeat"    : true,
            "is_unordered"      : true,
            "is_counting"       : false,
            "is_exclusive"      : true,
            "is_solitary"       : false,
            "is_sequence"       : false
        });

        listener.register_combo({
            "keys"              : "a",
            "on_keydown"        : a_down,
            "on_keyup"          : a_up,
            "this"              : undefined,
            "prevent_default"   : false,
            "prevent_repeat"    : true,
            "is_unordered"      : true,
            "is_counting"       : false,
            "is_exclusive"      : true,
            "is_solitary"       : false,
            "is_sequence"       : false
        });

        listener.register_combo({
            "keys"              : "s",
            "on_keydown"        : s_down,
            "on_keyup"          : s_up,
            "this"              : undefined,
            "prevent_default"   : false,
            "prevent_repeat"    : true,
            "is_unordered"      : true,
            "is_counting"       : false,
            "is_exclusive"      : true,
            "is_solitary"       : false,
            "is_sequence"       : false
        });

        listener.register_combo({
            "keys"              : "d",
            "on_keydown"        : d_down,
            "on_keyup"          : d_up,
            "this"              : undefined,
            "prevent_default"   : false,
            "prevent_repeat"    : true,
            "is_unordered"      : true,
            "is_counting"       : false,
            "is_exclusive"      : true,
            "is_solitary"       : false,
            "is_sequence"       : false
        });
	}

	function w_down(){
        game_state["control"]["w_pressed"] = true;
        console.log("start moving forward");
    }

    function w_up(){
	    game_state["control"]["w_pressed"] = false;
        console.log("stop moving foward")
    }

    function a_down(){
        game_state["control"]["a_pressed"] = true;
        console.log("start moving left");
    }

    function a_up(){
        game_state["control"]["a_pressed"] = false;
        console.log("stop moving left")
    }

    function s_down(){
        game_state["control"]["s_pressed"] = true;
        console.log("start moving back");
    }

    function s_up(){
        game_state["control"]["s_pressed"] = false;
        console.log("stop moving back")
    }

    function d_down(){
        game_state["control"]["d_pressed"] = true;
        console.log("start moving right");
    }

    function d_up(){
        game_state["control"]["d_pressed"] = false;
        console.log("stop moving right")
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
		game_state["engine"]["animation_runner"].update(delta);
	}
	
	function add_ship_to_stage(){
		let texture = PIXI.loader.resources["img/alien4.png"].texture;
		let start = new PIXI.Point(randomInt(100, game_constants["engine"]["animation_width"] - texture.width), 0 - texture.height);
		let opts = {
				"start": start,
				"end": new PIXI.Point(start.x, game_constants["engine"]["animation_height"] + texture.height),
				"speed": randomInt(1,3),
				"parent_container": game_state["engine"]["pixi_app"].stage,
				"animation_runner": game_state["engine"]["animation_runner"],
		};
		let ship = new Ship(opts);
	}

	PIXI.loader
	.add("img/alien4.png")
	.add("img/blue_beam.png")
    .add("img/emitter.png")
	.load(initialize_game);
}