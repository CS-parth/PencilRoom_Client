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
      <Container className='lg:mx-0 xl:p-10'>
          <div className='m-0 p-0 text-xl sm:text-2xl lg:text-3xl xl:text-4xl xl:my-5 font-extrabold' ref={ref}></div>
      </Container>
    </>
  )
}

export default MagicWrite