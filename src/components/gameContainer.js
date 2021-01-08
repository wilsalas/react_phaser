import { GameComponent } from "phaser-react-tools";
import { gameConfig } from "../utils/gameConfig";

const GameContainer = ({ scene, children }) => (
    <GameComponent config={gameConfig(scene)}>
        {/* <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex:0}}> */}
            {children}
        {/* </div> */}
    </GameComponent>
);

export default GameContainer;