cost_per_factory = 100;
factory_profit_rate = 0.02;
purchase_types = ["factory"];

counter = 0;
account_balance = 0;
factories = 0;

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
			factories += 1;
			account_balance -= 100;
			break;
	};
};

function update(delta){
	counter += 1;
	
	account_balance += factories * factory_profit_rate * delta;
}

function draw(delta) {
    document.getElementById('counter').innerHTML = "counter: " + counter;
    document.getElementById('factories').innerHTML = "factories: " + factories;
    document.getElementById('account_balance').innerHTML = "balance: " + account_balance;
}

function end(fps, panic) {
	if(panic){
		alert("Panic! The simulation has fallen too far behind.");
	}
}