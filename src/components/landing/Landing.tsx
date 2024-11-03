import { Box, Button, Center, Container, Modal, TextInput } from "@mantine/core"
import { useDisclosure } from '@mantine/hooks';
import whitehoardImage from '../../../public/Whiteboard.png'
import ShadowImage from '../../../public/Shadow.png'
import MagicWrire from './MagicWrite';
import { motion } from "framer-motion";
import '../../assets/font.css'
import { Link } from "react-router-dom";
import { useState } from "react";

const Landing = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [roomId, setRoomId] = useState<string>();
  
  return (
    <motion.div 
      style={{
        fontFamily: 'Pacifico',
        background: 'linear-gradient(135deg, #2c3e50, #bdc3c7)',
        position: 'relative',
        overflow: 'hidden'
      }} 
      className="min-h-screen flex flex-col"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15) 0%, transparent 50%)',
          mixBlendMode: 'overlay'
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
          e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 25%, transparent 50%)`,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />

      {/* Original content */}
      <div className="flex flex-col min-h-screen relative z-10">
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

        <div className="flex flex-col lg:flex-row items-center justify-center flex-grow w-11/12 mx-auto gap-8 lg:gap-16">
          <div className="flex flex-col w-full lg:w-1/2 space-y-8">
            <MagicWrire text={"This is the major content on the site"}/>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">              
              <Button className="w-full sm:w-auto px-6 py-2 text-sm lg:text-base xl:text-lg">
                <Link to={"/board"}>Create a Board</Link>
              </Button>
              <Button onClick={open} className="w-full sm:w-auto px-6 py-2 text-sm lg:text-base xl:text-lg">
                Join a Board
              </Button>
              <Modal opened={opened} onClose={close} title="Enter Room Identifier">
                <TextInput
                  onChange={(e)=>setRoomId(e.target.value)}
                  className="m-2"
                  placeholder="abc-xyz-pqr"
                />
                <Link to={`/board/${roomId}`}><Button className="m-2" variant="filled" color="cyan">Button</Button></Link>
              </Modal>
            </div>
          </div>

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