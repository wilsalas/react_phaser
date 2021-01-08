import Phaser, { Scene } from "phaser";

class firstGame extends Scene {
    constructor() {
        super({ key: "firstGame" });
    }
    init() {
        const { cameras } = this;
        cameras.main.setBackgroundColor('#000000');
        this.cam = {
            x: cameras.main.width,
            y: cameras.main.height
        }
    }
    preload() {
        const { load } = this;
        load.baseURL = '/assets/';
        load.image('sky', 'sky.png');
        load.image('ground', 'platform.png');
        load.image('star', 'star.png');
        load.image('bomb', 'bomb.png');
        load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
    }
    create() {
        this.setBackgroundImage();
        this.platformsGame();
        this.playerGame();
        this.starsGame();
    }
    update() {
        this.cursorsGame();
    }
    setBackgroundImage() {
        const { add, cam } = this;
        const image = add.image(cam.x / 2, cam.y / 2, 'sky');
        const scaleX = cam.x / image.width;
        const scaleY = cam.y / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
        /* initialize text score game */
        this.score = localStorage.getItem('score') ? parseFloat(localStorage.getItem('score')) : 0;
        this.scoreText = add.text(10, 10, `Score: ${this.score}`, {
            fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial'
        });
    }
    playerGame() {
        const { anims, physics, platforms } = this;
        this.player = physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        physics.add.collider(this.player, platforms);
        anims.create({
            key: 'left',
            frames: anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });
        anims.create({
            key: 'right',
            frames: anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }
    starsGame() {
        let { physics, platforms, player, score, scoreText } = this;
        const stars = physics.add.group({
            key: 'star',
            repeat: 9,
            setXY: { x: 20, y: 0, stepX: 70, stepY: -40 }
        })
        stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(.5, .2))
        });
        physics.add.collider(stars, platforms);
        physics.add.overlap(player, stars, (player, star) => {
            star.disableBody(true, true);
            score += 10
            localStorage.setItem('score', score.toString());
            scoreText.setText(`Score: ${score}`);
        }, null, this);
    }
    platformsGame() {
        const { physics, cam } = this;
        this.platforms = physics.add.staticGroup();
        const grounds = [[(cam.x / 2), (cam.y / 2) * 2], [600, 400], [50, 250], [750, 220]];
        let platformCount = 0;
        for (const item of grounds) {
            const x = platformCount === 0 ? 10 : .6;
            const y = platformCount === 0 ? 2 : .5;
            this.platforms.create(item[0], item[1], 'ground').setScale(x, y).refreshBody();
            platformCount++;
        }
    }
    cursorsGame() {
        const { input, player } = this;
        const cursors = input.keyboard.createCursorKeys();
        switch (true) {
            case cursors.left.isDown:
                player.setVelocityX(-160);
                player.anims.play('left', true);
                break;
            case cursors.right.isDown:
                player.setVelocityX(160);
                player.anims.play('right', true);
                break;
            case cursors.up.isDown && player.body.touching.down:
                player.setVelocityY(-530);
                break;
            default:
                player.setVelocityX(0);
                player.anims.play('turn');
                break;
        }
    }
}

export const scene = [
    firstGame
]
