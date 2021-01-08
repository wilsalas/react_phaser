import { useState } from "react";
import { scene } from "../class/betweenGame";
import GameContainer from "../components/gameContainer";
import { useEventListener, useEventEmitter } from 'phaser-react-tools';


const GetDataEmitter = () => {
  const [frame, setFrame] = useState(0)
  useEventListener('ON_UPDATE', (event) => {
    setFrame((frame) => (frame += 1))
  })
  return (
  <div style={{width:'100%'}}> 
  <p style={{ color: '#fff', position: 'absolute', top: 10 }}>Frame: {frame}</p>
  </div>
  )
}

const SendDataEmitter = () => {
  const emit = useEventEmitter('ON_BUTTON_CLICK');
  return (
    <button
      onClick={() => {
        emit('Button clicked!')
      }}
      style={{ position: 'absolute', top: 70}}
    >
      Emit game event
    </button>
  )
}


function App() {

  return (
    <GameContainer scene={scene}>
      <GetDataEmitter />
      <SendDataEmitter />
    </GameContainer>
  )
}

export default App;
