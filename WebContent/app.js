// game constants
cost_per_factory = 100; // dollars
factory_profit_rate = 0.002; // dollars per second
turrent_expense_rate = 0.0005; // dollars per second
purchase_types = ["factory", "defense turret"];

// game state
account_balance = 200;
defense_turrets = 0;
factories = 0;
ai_attack_imminent_time_expired = false;
ai_attack_timer_expired = false;
ai_attack_cooldown_timer_expired = false;
ai_attack_cooldown_active = false;

// calculated display values
income_rate = 0;

// Time tracking
ai_attack_imminent_timer = 1000 * 60 * 2;
ai_base_attack_timer = 1000 * 60 * 2;
ai_attack_timer_range = 1000 * 60 * 5;
ai_attack_timer = ai_base_attack_timer; // milliseconds
ai_attack_cooldown_timer = 1000 * 30;
ai_event = 0;
timers = [];

class GameEngineTimer {

  constructor(duration) {
    this.duration = duration;
    this.time_remaining = duration;
    this.running = false;
    
    this.callback_start = null;
    this.callback_start_args = null;
    this.callback_stop = null;
    this.callback_stop_args = null;
    this.callback_restart = null;
    this.callback_restart_args = null;
    this.callback_tick = null;
    this.callback_tick_args = null;
    this.callback_end = null;
    this.callback_end_args = null;
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
	  if(this.running){
		  if(this.time_remaining <= 0){
			  this.running = false;
			  this.callback_end();
		  }
		  else {
			  this.time_remaining -= delta;
		  }
	  }
	  if(this.callback_tick){
		  this.callback_tick();
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

let timer = new GameEngineTimer(ai_attack_imminent_timer);
timer.on('end', function(){ai_attack_imminent_time_expired = true});
timer.start();
register_timer(timer);

var select = document.getElementById("purchase_selector");
for(var i = 0; i < purchase_types.length; i++) {
	let opt = document.createElement("option");
	opt.value = purchase_types[i];
	opt.textContent = purchase_types[i];
	select.appendChild(opt);
}

document.getElementById("start").onclick = function () { 
	document.getElementById('start').style.visibility  = 'hidden';
	MainLoop.start(); 
	document.getElementById('stop').style.visibility  = 'visible';
};
	
document.getElementById("stop").onclick = function () { 
	document.getElementById('stop').style.visibility  = 'hidden';
	MainLoop.stop();
	document.getElementById('start').style.visibility  = 'visible';
};

document.getElementById("buy").onclick = function () {
	let e = document.getElementById('purchase_selector');
	let value = e.options[e.selectedIndex].value;
	
	switch(value){
		case 'factory':
			if(account_balance > 100){
				factories += 1;
				account_balance -= 100;
			}
			else{
				highlight_balance();
			}
			break;
		case 'defense turret':
			if(account_balance > 200){
				defense_turrets += 1;
				account_balance -= 200;
			}
			else{
				highlight_balance();
			}
	};
};

function register_timer(timer){
	timers.push(timer);
}

function process_timers(delta){
	timers.forEach( function (timer)
	{
		if(timer.running){
	    	timer.tick(delta);
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

function update(delta){
	process_timers(delta);
	income_rate = (factories * factory_profit_rate) - (defense_turrets * turrent_expense_rate);
	account_balance += income_rate * delta;
}

function draw(delta) {
	if(ai_attack_imminent_time_expired){
		console.log("attack imminent timer expired");
		let element = document.getElementById('attack_warning')
		element.innerHTML = 'WARNING! An attack is imminent!';
		element.style.visibility = 'visible';
		let timer = new GameEngineTimer(ai_attack_timer);
		timer.on('end', function(){ai_attack_timer_expired = true});
		timer.start();
		register_timer(timer);
		ai_attack_imminent_time_expired = false;
	}
	if(ai_attack_timer_expired){
		console.log("attack action timer expired");
		document.getElementById('attack_warning').innerHTML = 'ATTACK';
		let timer = new GameEngineTimer(ai_attack_cooldown_timer);
		timer.on('end', function(){ai_attack_cooldown_timer_expired = true});
		timer.start();
		register_timer(timer);
		ai_attack_timer_expired = false;
	}
	if(ai_attack_cooldown_timer_expired){
		console.log("attack cooldown timer expired");
		document.getElementById('attack_warning').style.visibility = 'hidden';
        let ai_attack_timer_duration = Math.floor((Math.random() * ai_attack_timer_range) + ai_base_attack_timer);
		let timer = new GameEngineTimer(ai_attack_timer_duration);
		timer.on('end', function(){ai_attack_imminent_time_expired = true});
		timer.start();
		register_timer(timer);
		ai_attack_cooldown_timer_expired = false;
	}
    document.getElementById('factories').innerHTML = "factories: " + factories;
    document.getElementById('defense_turrets').innerHTML = "defense turrets: " + defense_turrets;
    document.getElementById('income_rate').innerHTML = "income: " + income_rate;
    let formatted_balance = accounting.formatMoney(account_balance);
    document.getElementById('account_balance').innerHTML = "balance: " + formatted_balance;
    document.getElementById('fps').innerHTML = MainLoop.getFPS().toFixed(2) + " FPS";
}

function end(fps, panic) {
	if(panic){
		alert("Panic! The simulation has fallen too far behind.");
	}
}