import { Box, Button, Center } from "@mantine/core"
import whitehoardImage from '../../../public/Whiteboard.png'
import ShadowImage from '../../../public/Shadow.png'
import MagicWrire from './MagicWrite';
import { motion,useMotionTemplate,useMotionValue } from "framer-motion";
import '../../assets/font.css'
const Landing = () => {
  return (
    <motion.div style={{fontFamily: 'Pacifico'}} className="min-h-screen flex flex-col bg-gradient-to-tr from-black to-white transition-colors duration-800">
      {/* <Box bg="var(--mantine-color-blue-light)">All elements inside Center are centered</Box> */}
      <div className="flex flex-col">
        <nav className="flex mt-20 mb-40 w-3/4 mx-auto items-center">
          <div style={{fontFamily:'Dirty_Boy'}} className="mx-40 text-8xl font-extrabold">PencilRoom</div>
          <div>
            <ul className="flex gap-x-10 text-lg">
              <li>Contact</li>
              <li>About</li>
              <li>Source Code</li>
            </ul>
          </div>
        </nav>
        <div className="hero flex">
          <div className="flex flex-col hero-content m-auto gap-y-20">
            <MagicWrire text={"This is the major content on the site"}/>
            <div>              
              <Button className="m-2 p-2 h-20 w-60 text-2xl">Create a Board</Button>
              <Button className="m-2 p-2 h-20 w-60 text-2xl">Join a Board</Button>
            </div>
          </div>
          <div className="hero-img m-auto flex flex-col">
            <motion.span
              className=""
              transition={{
                y: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeOut",
                },
              }}
              animate={{
                y: ["0%", "-40%"],
              }}
            >
              <img className="h-[600px] w-[700px]" src={whitehoardImage} alt="Not found img"/>
            </motion.span>
            <motion.span
              layout
              transition={{
                scaleX: { 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeOut"
                }
              }}
              animate={{ 
                scaleX: [0.5,2] 
              }}
              className="absolute right-[9%] top-[68%]"
            >
              <img className="h-[300px] w-[300px]" src={ShadowImage} alt="Not found img"/>
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Landing