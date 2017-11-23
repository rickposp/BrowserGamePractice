declare var MainLoop: any;
declare var accounting: any;

// game constants
let cost_per_factory = 100; // dollars
let factory_profit_rate = 0.02; // dollars per second
let purchase_types = ["factory"];

// game state
let slow_balance = 0;
let account_balance = 0;
let factories = 0;

// time tracking
let last_update_time = 0;

MainLoop
.setUpdate(update)
.setDraw(draw)
.setEnd(end)

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
    let e = (document.getElementById('purchase_selector') as HTMLSelectElement);
    let value = e.options[e.selectedIndex].value;
    
    switch(value){
        case 'factory':
            factories += 1;
            account_balance -= 100;
            break;
    };
};

//function scaled_update(callback, time_interval: number): void {
//    let timestamp = Date.now();
//    let elapsed_time = timestamp - last_update_time;
//    if(elapsed_time > time_interval)
//    {
//        callback();
//        last_update_time = timestamp;
//    }
//}

function update_slow_balance(){
    slow_balance = account_balance;
}

function update(delta: number){
    account_balance += factories * factory_profit_rate * delta;
    //scaled_update(update_slow_balance, 1000)
}

function draw(delta: number) {
    document.getElementById('factories').innerHTML = "factories: " + factories;
    let formatted_balance = accounting.formatMoney(slow_balance);
    document.getElementById('account_balance').innerHTML = "balance: " + formatted_balance;
    document.getElementById('fps').innerHTML = MainLoop.getFPS().toFixed(2) + " FPS";
}

function end(fps: number, panic: boolean) {
    if(panic){
        alert("Panic! The simulation has fallen too far behind.");
    }
}