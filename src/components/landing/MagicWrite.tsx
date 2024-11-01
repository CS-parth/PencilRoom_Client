import { Container } from '@mantine/core'
import { useScramble } from 'use-scramble'
const MagicWrite = (props) => {

  const { ref } = useScramble({
    text: "Unleash Your Ideas: Real-Time Whiteboard Collaboration.",
    range: [65,125],
    speed: 0.5,
    tick: 1,
    step: 5,
    scramble: 5,
    seed: 1,
    chance: 1,
    overdrive: false,
    overflow: false,
  })
  
  return (
    <>
      <Container>
          <div className='font-extrabold text-6xl' ref={ref}></div>
      </Container>
    </>
  )
}

export default MagicWrite