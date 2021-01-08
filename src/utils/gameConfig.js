import Phaser from 'phaser';

const gameConfig = scene => {
    const game = {
        width: '100%',
        height: '100%',
        type: Phaser.CANVAS,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%',
        },
        render: {
            antialias: false,
            pixelArt: true,
            roundPixels: true
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 400 },
                debug: false
            }
        },
        scene
    }
    return game;
}

export { gameConfig };