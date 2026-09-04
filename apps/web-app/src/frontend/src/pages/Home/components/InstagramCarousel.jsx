import React from 'react'
import styled from 'styled-components'
import { FaInstagram } from 'react-icons/fa'
import { motion } from 'framer-motion'
import AnimeDivider from '../../../components/Visual/AnimeDivider'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const Section = styled.section`
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.colors.surface}; /* Light Background for contrast */
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary}; /* Blue Text on Light BG */
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  a {
    color: ${({ theme }) => theme.colors.accentGold};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    transition: all 0.3s;
    
    &:hover { opacity: 0.8; }
  }
`

const Grid = styled.div`
  display: flex;
  width: 100%;
`

const GridItem = styled.div`
  aspect-ratio: 1/1;
  background-color: #1a1a1a;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`

const DEFAULT_IMAGES = [
  'https://placehold.co/400x400/111/333',
  'https://placehold.co/400x400/111/333',
  'https://placehold.co/400x400/111/333',
  'https://placehold.co/400x400/111/333'
]

export default function InstagramCarousel() {
  const { siteConfig } = useData()

  const title = getSafeContent(siteConfig, 'home_instagram', 'title', 'Junte-se à Nossa Comunidade')
  const username = getSafeContent(siteConfig, 'home_instagram', 'username', '@bodyharmonyoficial')
  const instagramUrl = getSafeContent(siteConfig, 'home_instagram', 'instagramUrl', 'https://www.instagram.com/bodyharmonyoficial/')
  const images = siteConfig?.home_instagram?.images || DEFAULT_IMAGES

  // Infinite scroll logic: duplicate images to create seamless loop
  const displayImages = [...images, ...images, ...images].filter(Boolean)

  // Helper to get Imgur thumbnail
  const getThumbnail = (url) => {
    if (!url || !url.includes('imgur.com')) return url;
    return url.replace(/(\.[^.]+)$/, 'l$1');
  }

  return (
    <Section>
      <AnimeDivider position="top" fill="#FAFAFA" color="#D4AF37" />
      <Header>
        <h3 {...editorAttr('home_instagram', 'title')}>{title}</h3>
        <a href={instagramUrl} target="_blank" rel="noreferrer" {...editorAttr('home_instagram', 'username')}>
          <FaInstagram /> {username}
        </a>
      </Header>

      <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
        <Grid>
          <motion.div
            style={{ display: 'flex', gap: '1rem' }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 60
            }}
          >
            {displayImages.map((img, index) => (
              <GridItem key={index} style={{ minWidth: '300px', flex: '0 0 300px' }}>
                <img src={getThumbnail(img)} loading="lazy" alt={`Comunidade - ${index}`} />
              </GridItem>
            ))}
          </motion.div>
        </Grid>
      </div>
    </Section>
  )
}
