requirejs.config({
    baseUrl: 'scripts/library',
    paths: {
        modules: '../modules'
    }
});

// Start the main app logic.
requirejs(['modules/game'], 
function(Game) {
	Game();
});