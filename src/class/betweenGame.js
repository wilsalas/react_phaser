import { Scene } from "phaser";

class SceneOne extends Scene {
    constructor() {
        super({ key: "SceneOne" });
    }
    init() {
        this.cameras.main.setBackgroundColor('#40cfcf');
    }
    preload() {
        this.load.image("plane", "/assets/Flecha.png");
    }
    create() {

        this.plane = this.add.image(340, 150, "plane");
        this.time.addEvent({
            delay: 3000,
            loop: false,
            callback: () => {
                this.scene.start("SceneTwo", {
                    "message": "Game Over"
                });
            }
        })
    }
    update() { }
}

class SceneTwo extends Scene {
    constructor() {
        super({ key: "SceneTwo" });
    }
    init(data) {
        this.cameras.main.setBackgroundColor('#f68b0d');
        this.message = data.message;
    }
    preload() { }
    create() {
        this.add.text(
            340,
            150,
            this.message,
            {
                fontSize: 50,
                color: "#FFFFFF",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.game.events.on('ON_BUTTON_CLICK', e => {
            console.log(e)
        })
        this.game.events.emit('ON_UPDATE')

    }
    update() { }
}

export const scene = [
    SceneOne,
    SceneTwo
]
