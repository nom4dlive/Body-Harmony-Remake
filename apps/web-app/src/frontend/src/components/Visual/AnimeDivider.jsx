import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { animate } from '../../utils/vendor/anime.esm.js';

const DividerWrapper = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  z-index: 20;
  ${({ position }) => position === 'top' ? 'top: -1px; transform: rotate(180deg);' : 'bottom: -1px;'}
  pointer-events: none;
`;

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: 80px;
  
  @media (max-width: 768px) {
    height: 40px;
  }
`;

const Path = styled.path`
  fill: none;
  stroke: ${({ color }) => color || '#D4AF37'};
  stroke-width: 2;
  opacity: 0.6;
`;

export default function AnimeDivider({ position = 'bottom', color = '#D4AF37', fill = '#FAFAFA' }) {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    
    // Anime.js V4 logic manual for strokeDashoffset
    try {
        const len = path.getTotalLength();
        if (len) {
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
            
            animate(path, {
                strokeDashoffset: [len, 0],
                easing: 'inOutSine',
                duration: 2500,
                delay: 200,
                loop: false
            });
        }
    } catch (e) {
        console.warn("AnimeDivider Animation Error:", e);
    }

  }, []);

  return (
    <DividerWrapper position={position}>
      <Svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,80 L0,40 C360,80 1080,0 1440,40 L1440,80 Z" fill={fill} />
        <Path 
            ref={pathRef}
            d="M0,40 C360,80 1080,0 1440,40"
            color={color} 
        />
      </Svg>
    </DividerWrapper>
  );
}
