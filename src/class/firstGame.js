import Phaser, { Scene } from "phaser";

class firstGame extends Scene {
    constructor() {
        super({
            key: "firstGame",
            pack: {
                files: [
                    {
                        type: 'image',
                        key: 'sky2',
                        url: 'sky2.png'
                    }
                ]
            }
        });
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
        load.image('sky', 'sky.png');
        load.image('ground', 'platform.png');
        load.image('star', 'star.png');
        load.image('bomb', 'bomb.png');
        load.image('btnLeft', 'left.png');
        load.image('btnRight', 'right.png');
        load.image('btnDown', 'down.png');
        load.image('gameover', 'gameover.png');
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
        this.progressBarGame();
    }
    create() {
        this.setBackgroundImage();
        this.gameOverGame()
        this.platformsGame();
        this.playerGame();
        this.starsGame();
        this.enemiesGame();
        this.configButtons();
    }
    update() {
        this.movePlayerGame();
    }

    progressBarGame() {
        const { add, cam, load } = this;
        let center = {
            x: cam.x / 2,
            y: cam.y / 2
        }
        const image = add.image(center.x, center.y, 'sky2');
        const scaleX = cam.x / image.width;
        const scaleY = cam.y / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
        const progressBox = add.graphics();
        const progressBar = add.graphics();
        const loadingText = add.text(center.x, (center.y - 50), 'Loading...', {
            fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial'
        });
        const percentText = add.text(center.x, (center.y - 5), '0%', {
            fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial'
        });
        const assetText = add.text(center.x, (center.y + 50), '', {
            fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial'
        });
        loadingText.setOrigin(.5, .5);
        percentText.setOrigin(.5, .5);
        assetText.setOrigin(.5, .5);
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(percentText.x / 2, percentText.y + 90, percentText.x, 20);
        load.on('progress', value => {
            percentText.setText(`${parseInt(value * 100)}%`);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(percentText.x / 2, percentText.y + 90, parseFloat(value * percentText.x), 20);
        });
        load.on('fileprogress', file => {
            assetText.setText(`Loading asset: ${file.key}`);
        });
        load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
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
        }).setScrollFactor(0);
        
        this.bgSound = sound.add('bgSound');
        this.bgSound.play({
            loop: true
        });


    }
    playerGame() {
        const { anims, physics, platforms, cam } = this;
        this.player = physics.add.sprite(100, cam.y / 2, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.scale = .9;
        physics.add.collider(this.player, platforms);
        // cameras.main.startFollow(this.player)
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
        const { bombs, physics, platforms, player, bgSound, sound, gameOver, textGameOver, tweens } = this;
        physics.add.collider(bombs, platforms);
        physics.add.collider(player, bombs, (itemPlayer, itemBomb) => {
            itemPlayer.anims.play('turn');
            physics.pause();
            bgSound.stop();
            sound.add('deathSound').play();
            itemPlayer.disableBody(true);
            itemBomb.destroy();
            gameOver.setVisible(true);
            textGameOver.setVisible(true);
            gameOver.alpha = 0;
            tweens.add({
                targets: [gameOver],
                duration: 900,
                alpha: 1
            });
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
            btn.setScrollFactor(0);
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
    gameOverGame() {
        const { add, cam, scene } = this;
        this.gameOver = add.image(cam.x / 2, cam.y / 2, 'gameover');
        this.gameOver.setDisplaySize(cam.x, cam.y);
        this.gameOver.setVisible(false);
        this.gameOver.setDepth(1);
        this.textGameOver = add.text(cam.x / 2, cam.y / 2 + 80, 'PRESS START AGAIN', {
            fontSize: 50
        }).setOrigin(.5, .5)
        this.textGameOver.setVisible(false);
        this.textGameOver.setDepth(1);
        this.gameOver.setInteractive();
        this.gameOver.on('pointerdown', () => {
            scene.restart();
        });
        this.textGameOver.setScrollFactor(0);
        this.gameOver.setScrollFactor(0);
    }
}

export const scene = [
    firstGame
]




