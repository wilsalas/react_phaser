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
        load.image('btnLeft', 'left.png');
        load.image('btnRight', 'right.png');
        load.image('btnDown', 'down.png');
        load.spritesheet('dude', 'dude.png', {
            frameWidth: 32,
            frameHeight: 48
        });
        load.spritesheet('btn', 'button_sprite_sheet.png', {
            frameWidth: 193,
            frameHeight: 71
        })
        load.audio('bgSound', 'audio/bg.mp3');
        load.audio('deathSound', 'audio/playerDeath.mp3');
        load.audio('starSound', 'audio/star.wav');
    }
    create() {
        this.setBackgroundImage();
        this.platformsGame();
        this.playerGame();
        this.starsGame();
        this.enemiesGame();
        this.configButtons();
    }
    update() {
        this.movePlayerGame();
    }
    setBackgroundImage() {
        const { add, cam, sound } = this;
        const image = add.image(cam.x / 2, cam.y / 2, 'sky');
        const scaleX = cam.x / image.width;
        const scaleY = cam.y / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
        /* initialize text score game */
        this.score = localStorage.getItem('score') ? parseFloat(localStorage.getItem('score')) : 0;
        this.scoreText = add.text(10, 10, `Score: ${this.score}`, {
            fontSize: '15px', color: '#FFFFFF', fontFamily: 'Arial'
        });
        this.bgSound = sound.add('bgSound');
        // this.bgSound.play({
        //     loop: true
        // });

    }
    playerGame() {
        const { anims, physics, platforms } = this;
        this.player = physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.scale = .9;
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
    enemiesGame() {
        const { bombs, physics, platforms, player, scene, bgSound, sound } = this;
        physics.add.collider(bombs, platforms);
        physics.add.collider(player, bombs, () => {
            player.anims.play('turn');
            scene.pause();
            bgSound.stop();
            sound.add('deathSound').play();
        }, null, this);
    }
    starsGame() {
        let { bombs, physics, platforms, player, score, scoreText, sound } = this;
        const stars = physics.add.group({
            key: 'star',
            repeat: 4,
            setXY: { x: 20, y: 0, stepX: 100, stepY: -40 },
            setScale: { x: .8, y: .8 }
        })
        physics.add.collider(stars, platforms);
        physics.add.overlap(player, stars, (player, star) => {
            star.disableBody(true, true);
            this.createParticle('star', star);
            score += 10;
            localStorage.setItem('score', score.toString());
            scoreText.setText(`Score: ${score}`);
            sound.add('starSound').play()
            stars.children.iterate(child => {
                child.setBounceY(Phaser.Math.FloatBetween(1, .2))
            });
            if (stars.countActive(true) === 0) {
                stars.children.iterate(child => {
                    child.enableBody(true, child.x, 0, true, true);
                });
                var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                var bomb = bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                this.createParticle('bomb', bomb);
            }
        }, null, this);


    }
    platformsGame() {
        const { physics, cam } = this;
        this.platforms = physics.add.staticGroup();
        let platformCount = 0;
        new Array(5).fill().forEach(() => {
            let setX, setY, scaleX, scaleY;
            if (platformCount === 0) {
                /* Platorm ground */
                setX = scaleX = cam.x;
                setY = cam.y;
                scaleY = 4
            } else {
                /* All platforms group scene */
                setX = Phaser.Math.Between(0, cam.x);
                setY = Phaser.Math.Between(30, cam.y + 40);
                scaleX = .050;
                scaleY = .1;
            }
            this.platforms.create(setX, setY, 'ground').setScale(scaleX, scaleY).refreshBody();
            platformCount++;
        })
        /* Generate group bombs */
        this.bombs = physics.add.group();
    }
    configButtons() {
        this.onPressed = false;
        this.typeButton = [false, false, false];
        const { add, cam } = this;
        const buttons = [
            {
                key: 'btnLeft',
                position: {
                    x: 30
                }
            },
            {
                key: 'btnRight',
                position: {
                    x: 100
                }
            },
            {
                key: 'btnDown',
                position: {
                    x: cam.x - 30
                }
            }
        ];
        const scaleButton = (btn, scaleX = .20, scaleY = .20) => {
            btn.scaleX = scaleX
            btn.scaleY = scaleY
        }
        buttons.forEach((item, i) => {
            const btn = add.image(item.position.x, (cam.y - 30), item.key);
            btn.setInteractive();
            scaleButton(btn);
            btn.on('pointerdown', () => {
                // this.onPressed = true;
                this.typeButton[i] = true;
                scaleButton(btn, .21, .21);
            }).on('pointerout', () => {
                this.typeButton[i] = false;
                scaleButton(btn);
            });
        });
    }
    movePlayerGame() {
        const { input, player, typeButton } = this;
        const cursors = input.keyboard.createCursorKeys();
        switch (true) {
            case cursors.left.isDown || typeButton[0]:
                player.setVelocityX(-160);
                player.anims.play('left', true);
                break;
            case cursors.right.isDown || typeButton[1]:
                player.setVelocityX(160);
                player.anims.play('right', true);
                break;
            default:
                player.setVelocityX(0);
                player.anims.play('turn');
                break;
        }
        if ((cursors.up.isDown || typeButton[2]) && player.body.touching.down) {
            player.setVelocityY(-530);
        }
    }
    createParticle(key, elem) {
        const { add } = this;
        const newParticle = add.particles(key);
        newParticle.createEmitter({
            x: 0,
            y: 0,
            speed: 200,
            lifespan: 300,
            blendMode: 'ADD',
            quantity: 20,
            maxParticles: 1000,
            scale: { min: .4, max: .10 },
            on: false
        }).emitParticleAt(elem.x, elem.y);
    }
}

export const scene = [
    firstGame
]



