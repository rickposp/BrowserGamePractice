// game constants
cost_per_factory = 100; // dollars
factory_profit_rate = 0.002; // dollars per second
turrent_expense_rate = 0.0005 // dollars per second
purchase_types = ["factory", "defense turret"];

// game state
account_balance = 200;
defense_turrets = 0;
factories = 0;
ai_attack_imminent = false;
ai_attack_action = false;

// calculated display values
income_rate = 0;

// Time tracking
ai_base_attack_timer = 1000 * 60 * 2;
ai_attack_timer_range = 1000 * 60 * 5;
ai_attack_timer = ai_base_attack_timer; // milliseconds

MainLoop
.setUpdate(update)
.setDraw(draw)
.setEnd(end)

var select = document.getElementById("purchase_selector");
for(var i = 0; i < purchase_types.length; i++) {
	opt = document.createElement("option");
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
	e = document.getElementById('purchase_selector');
	value = e.options[e.selectedIndex].value;
	
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

function highlight_balance(){
	e = document.getElementById('account_balance')
	Velocity(
		e, 
		{ 
		  color: "#ff0000", // Animate the text color to the hex value for pure red.
		}, 
		200); 
	Velocity(e, "reverse", { duration: 1000 });
}

function determine_if_attack_imminent(){
	return (ai_attack_timer <= 1000 * 30)
}

function determine_if_attack_action(){
	return (ai_attack_timer <= 0)
}

function update(delta){
	income_rate = (factories * factory_profit_rate) - (defense_turrets * turrent_expense_rate)
	account_balance += income_rate * delta;
	ai_attack_timer -= delta;
	ai_attack_imminent = determine_if_attack_imminent();
	ai_attack_action = determine_if_attack_action();
	if(ai_attack_action){
		ai_attack_timer = Math.floor((Math.random() * ai_attack_timer_range) + ai_base_attack_timer);
	}
}

function draw(delta) {
	if(ai_attack_imminent){
		element = document.getElementById('attack_warning')
		element.innerHTML = 'WARNING! An attack is imminent!';
		element.style.visibility = 'visible';
	}
	
	if(ai_attack_action){
		element = document.getElementById('attack_warning').innerHTML = 'ATTACK';
	}
    document.getElementById('factories').innerHTML = "factories: " + factories;
    document.getElementById('defense_turrets').innerHTML = "defense turrets: " + defense_turrets;
    document.getElementById('income_rate').innerHTML = "income: " + income_rate;
    formatted_balance = accounting.formatMoney(account_balance);
    document.getElementById('account_balance').innerHTML = "balance: " + formatted_balance;
    document.getElementById('fps').innerHTML = MainLoop.getFPS().toFixed(2) + " FPS";
    document.getElementById('time_before_attack').innerHTML = "time before attack: " + ai_attack_timer;
}

function end(fps, panic) {
	if(panic){
		alert("Panic! The simulation has fallen too far behind.");
	}
}