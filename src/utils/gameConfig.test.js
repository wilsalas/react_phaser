const gameConfig = require("./gameConfig")
// @ponicode
describe("gameConfig.gameConfig", () => {
    test("0", () => {
        let callFunction = () => {
            gameConfig.gameConfig("da7588892")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            gameConfig.gameConfig("c466a48309794261b64a4f02cfcc3d64")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            gameConfig.gameConfig("bc23a9d531064583ace8f67dad60f6bb")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            gameConfig.gameConfig(12345)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            gameConfig.gameConfig(9876)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            gameConfig.gameConfig(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
