import { Box, Button, Center, Container } from "@mantine/core"
import whitehoardImage from '../../../public/Whiteboard.png'
import ShadowImage from '../../../public/Shadow.png'
import MagicWrire from './MagicWrite';
import { motion } from "framer-motion";
import '../../assets/font.css'

const Landing = () => {
  return (
    <motion.div 
      style={{fontFamily: 'Pacifico'}} 
      className="min-h-screen flex flex-col bg-gradient-to-tr from-black to-white transition-colors duration-800"
    >
      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex flex-col lg:flex-row justify-between items-center w-11/12 mx-auto py-4 lg:py-8">
          <div 
            style={{fontFamily:'Dirty_Boy'}} 
            className="text-2xl lg:text-5xl xl:text-6xl font-extrabold mb-4 lg:mb-0"
          >
            PencilRoom
          </div>
          <div>
            <ul className="flex space-x-4 lg:space-x-8 text-sm lg:text-base xl:text-lg">
              <li className="hover:opacity-80 cursor-pointer">Contact</li>
              <li className="hover:opacity-80 cursor-pointer">About</li>
              <li className="hover:opacity-80 cursor-pointer">Source Code</li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-center flex-grow w-11/12 mx-auto gap-8 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col w-full lg:w-1/2 space-y-8">
            <MagicWrire text={"This is the major content on the site"}/>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">              
              <Button className="w-full sm:w-auto px-6 py-2 text-sm lg:text-base xl:text-lg">
                Create a Board
              </Button>
              <Button className="w-full sm:w-auto px-6 py-2 text-sm lg:text-base xl:text-lg">
                Join a Board
              </Button>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative w-full lg:w-1/2 max-w-md aspect-[7/6]">
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
                y: ["-5%", "-20%"],
              }}
            >
              <img 
                className="w-full h-auto object-contain" 
                src={whitehoardImage} 
                alt="Whiteboard"
              />
            </motion.div>

            <motion.div
              className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-0 w-2/5"
              transition={{
                scaleX: { 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeOut"
                }
              }}
              animate={{ 
                scaleX: [0.5, 1.8]
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
  );
}

export default Landing