define(function () {

    return function GameEngineUIEvent(callback) {
    	this.trigger = callback;
    }
});