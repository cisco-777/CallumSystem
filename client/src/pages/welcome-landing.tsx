import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import benalmadenaImage from '@assets/Benalmadena port_1753265960255.jpg';

interface WelcomeLandingProps {
  onEnter: () => void;
}

export function WelcomeLanding({ onEnter }: WelcomeLandingProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url('${benalmadenaImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-light text-white mb-6 tracking-wide drop-shadow-2xl"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Marbella
          </motion.h1>
          
          <motion.h2 
            className="text-2xl md:text-3xl font-extralight text-white mb-4 tracking-wider drop-shadow-lg"
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Social Club
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl font-light text-white/80 mb-12 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            An exclusive community for those who appreciate the finer things in life
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onEnter}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-12 py-4 text-lg font-light tracking-wider rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Enter
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Subtle scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}