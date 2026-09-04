import styled from 'styled-components'

const Section = styled.section`
  padding: 0;
  background: #000;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 400px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const VisualItem = styled.div`
  position: relative;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  /* Gradiente suave */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  }
`

const VisualStrip = ({ images = [] }) => {
  // If no images provided, render nothing or a safe placeholder
  if (!images || images.length === 0) return null;

  return (
    <Section>
      <Grid>
        {images.map((img, i) => (
          <VisualItem key={img.id || i}>
            <img src={img.filepath} alt={img.filename || 'Body Harmony Visual'} loading="lazy" />
          </VisualItem>
        ))}
      </Grid>
    </Section>
  )
}

export default VisualStrip
