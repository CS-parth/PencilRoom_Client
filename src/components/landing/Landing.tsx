import { Box, Button, Center, Container } from "@mantine/core"
import whitehoardImage from '../../../public/Whiteboard.png'
import ShadowImage from '../../../public/Shadow.png'
import MagicWrire from './MagicWrite';
import { motion } from "framer-motion";
import '../../assets/font.css'
const Landing = () => {
  return (
    <motion.div style={{fontFamily: 'Pacifico'}} className="max-w-screen min-h-screen flex flex-col bg-gradient-to-tr from-black to-white transition-colors duration-800">
      {/* <Box bg="var(--mantine-color-blue-light)">All elements inside Center are centered</Box> */}
      <div className="flex flex-col">
        <nav className="flex flex-col lg:flex-row mx-5 mt-2 mb-4 sm:mt-5 sm:mb-20 sm:mx-auto w-3/4 items-center">
          <div style={{fontFamily:'Dirty_Boy'}} className="text-2xl mx-4 sm:mx-40 sm:text-[50px] md:text-[70px] sm:m-10 font-extrabold">PencilRoom</div>
          <div>
            <ul className="gap-x-4 text-sm flex xl:gap-x-10 sm:text-lg lg:text-xl">
              <li>Contact</li>
              <li>About</li>
              <li>Source Code</li>
            </ul>
          </div>
        </nav>
        <div className="hero flex">
          <div className="flex flex-col hero-content m-5 xl:m-auto gap-y-20">
            <MagicWrire text={"This is the major content on the site"}/>
            <Container className="">              
              <Button className="h-6 w-20 p-0 text-xs m-2 sm:h-10 sm:w-40 md:text-xl xl:p-2 xl:h-15 xl:w-40 xl:text-xl">Create a Board</Button>
              <Button className="h-6 w-20 p-0 text-xs m-2 sm:h-10 sm:w-40 md:text-xl xl:p-2 xl:h-15 xl:w-40 xl:text-xl">Join a Board</Button>
            </Container>
          </div>
            <div className="relative w-full sm:max-w-[300px] xl:max-w-[300px] sm:ml-[200px] aspect-[7/6] m-5 xl:m-auto">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                transition={{
                  y: {
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: "easeOut",
                  },
                }}
                animate={{
                  y: ["0%", "-20%"],  // Reduced bounce height for more stability
                }}
              >
                <img 
                  className="w-full h-auto object-contain" 
                  src={whitehoardImage} 
                  alt="Whiteboard"
                />
              </motion.div>

              <motion.div
                className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-[20%] w-[40%] md:bottom-[10%] lg:bottom-[0%] xl:bottom-[-10%]"
                transition={{
                  scaleX: { 
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: "easeOut"
                  }
                }}
                animate={{ 
                  scaleX: [0.5, 1.5]  // Reduced scale range for more stability
                }}
              >
                <img 
                  className="w-full h-auto"
                  src={ShadowImage} 
                  alt="Shadow"
                />
              </motion.div>
            </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Landing