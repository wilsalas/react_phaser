import { Scene } from "phaser";
import ControllerButton from '../components/ControllerButton';


class SceneOne extends Scene {
    constructor() {
        super({ key: "SceneOne" });
    }
    init() {
        this.cameras.main.setBackgroundColor('#000000');
    }
    preload() {
        const { load } = this;
        load.baseURL = '/assets/';
        load.image('btnDown', 'down.png');
    }
    create() {
        this.poin1 = 0
        this.poin2 = 0
        this.text1 = this.add.text(10, 10, `Text1: `, {
            fontSize: '15px', color: '#FFFFFF', fontFamily: 'Arial'
        });
        this.text2 = this.add.text(10, 30, `Text2: `, {
            fontSize: '15px', color: '#FFFFFF', fontFamily: 'Arial'
        });

        this.button1 = this.add.image(300, 200, 'btnDown');
        this.button1.scale = .2;
        // new ControllerButton(this.button1);
        this.button2 = this.add.image(400, 200, 'btnDown');
        this.button2.scale = .2;
        // new ControllerButton(this.button2);


        this.button1.setInteractive()
        this.button1.on('pointerdown', () => {
            this.poin1++
            this.text1.setText(`Text1: ${this.poin1}`)
        })


        this.button2.setInteractive()
        this.button2.on('pointerdown', () => {
            this.poin2++
            this.text2.setText(`Text2: ${this.poin2}`)
        })



    }
    update() {
        // const leftDown = ControllerButton.getComponent(this.button1).isDown;
        // const rightDown = ControllerButton.getComponent(this.button2).isDown;
        // if (leftDown) {
        //     this.poin1++
        //     this.text1.setText(`Text1: ${this.poin1}`)
        // }  
        // if (rightDown) {
        //     this.poin2++
        //     this.text2.setText(`Text2: ${this.poin2}`)
        // }
    }
}



export const scene = [
    SceneOne
]
