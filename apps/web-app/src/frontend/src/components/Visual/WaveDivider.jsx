import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const Wrapper = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  z-index: 2;
  /* Top or Bottom positioning via props */
  ${({ position }) => position === 'top' ? 'top: -1px;' : 'bottom: -1px;'}
  transform: ${({ position }) => position === 'top' ? 'rotate(180deg)' : 'none'};
`

const Svg = styled(motion.svg)`
  display: block;
  width: calc(100% + 1.3px);
  height: 60px; /* Adjustable height */
  
  @media (max-width: 768px) {
    height: 30px;
  }
`

const Path = styled(motion.path)`
  fill: ${({ fill }) => fill || '#FFFFFF'};
`

export default function WaveDivider({ position = 'bottom', fill = '#FFFFFF' }) {
  // Simple wave path
  const pathData = "M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"

  return (
    <Wrapper position={position}>
      <Svg 
        viewBox="0 0 1440 320" 
        preserveAspectRatio="none"
        initial={{ x: 0 }}
        // Subtle floating loop
        animate={{ 
            y: [0, 5, 0],
            scaleY: [1, 1.05, 1]
        }}
        transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
      >
        <Path d={pathData} fill={fill} />
      </Svg>
    </Wrapper>
  )
}
