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
        // render: {
        //     antialias: false,
        //     pixelArt: false,
        //     roundPixels: false
        // },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        input: {
            activePointers: 3
        },
        loader: {
            baseURL: '/assets/'
        },
        scene
    }
    return game;
}

export { gameConfig };