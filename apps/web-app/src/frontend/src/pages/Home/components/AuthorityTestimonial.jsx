import styled from 'styled-components';
import { useHomeAssets } from '../../../hooks/useHomeAssets';

// [NOTE] Parallax effect requires background-attachment: fixed
const Section = styled.section`
  padding: 140px 20px;
  background-image: ${({ overlay }) => `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay}))`}, url(${props => props.bg});
  background-size: ${({ zoom }) => zoom ? `${zoom}%` : 'cover'};
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  color: #fff;
  text-align: center;
  position: relative;
  transition: background-image 0.5s ease-in-out, background-size 0.5s ease-in-out;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const Quote = styled.blockquote`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.3;
  color: #fff;
  margin-bottom: 50px;
  font-style: italic;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);

  span {
    color: #d4af37; /* Dourado */
    font-weight: 400;
    display: block;
    margin-top: 20px;
  }
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px solid #d4af37;
    object-fit: cover;
  }

  div {
    text-align: left;
  }

  h4 {
    font-size: 1.4rem;
    color: #fff;
    margin-bottom: 5px;
    font-weight: bold;
  }

  p {
    color: #ddd;
    font-size: 1rem;
    font-weight: 300;
  }
`;

const DEFAULT_BG = '/hero-bg.jpg';

import { useData } from '../../../context/DataContext';

const AuthorityTestimonial = ({ previewBg, previewAdjustments }) => {
  const { authorityBgImage, authorityAdjustments } = useHomeAssets();
  const { siteTexts } = useData();
  
  // Logic: Preview takes precedence
  const activeBg = previewBg || authorityBgImage || DEFAULT_BG;
  const activeAdj = previewAdjustments || authorityAdjustments || {};

  const zoom = activeAdj.zoom || 100;
  const overlay = activeAdj.overlay !== undefined ? activeAdj.overlay : 0.7; // Default 0.7
  const bgSize = zoom === 100 ? 'cover' : `${zoom}%`;

  const defaultQuote = `"Foi um recomeço. Eu não sabia que não sabia nada... <span>até ver o nível absurdo de conhecimento aqui.</span>"`
  const defaultAuthor = "Lilian"
  const defaultRole = "Licenciada Body Harmony - Venda Nova"

  return (
    <Section bg={activeBg} zoom={bgSize} overlay={overlay}>
      <Container>
        <Quote dangerouslySetInnerHTML={{ __html: siteTexts?.testimonialQuote || defaultQuote }} />
        <Author>
            {/* Dynamic photo with fallback */}
            <img 
              src={siteTexts?.testimonialPhoto || "https://ui-avatars.com/api/?name=Lilian+BH&size=200&background=d4af37&color=000"} 
              alt={siteTexts?.testimonialAuthor?.replace(/<[^>]*>?/gm, '') || defaultAuthor} 
            />
          <div>
            <h4 dangerouslySetInnerHTML={{ __html: siteTexts?.testimonialAuthor || defaultAuthor }} />
            <p dangerouslySetInnerHTML={{ __html: siteTexts?.testimonialRole || defaultRole }} />
          </div>
        </Author>
      </Container>
    </Section>
  );
};

export default AuthorityTestimonial;
