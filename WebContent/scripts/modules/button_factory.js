import Button from "./button.js";

export default class buttonFactory{
    constructor(){
        this.text_style = new PIXI.TextStyle({
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
    }

    createButton(type, position, display_group, callback){
        if(type === "start"){
            let start_button = new Button(position.x, position.y, 150, 75);
            start_button.setText("run", this.text_style);
            start_button.clicked = callback;
            start_button.parentGroup = display_group;
            return start_button;
        }
        else if(type === "pause"){
            let stop_button = new Button(position.x, position.y, 150, 75);
            stop_button.setText("pause", this.text_style);
            stop_button.visible = false;
            stop_button.clicked = callback;
            stop_button.parentGroup = display_group;
            return stop_button;
        }
        else{
            throw "Unrecognized button type"
        }
    }
}