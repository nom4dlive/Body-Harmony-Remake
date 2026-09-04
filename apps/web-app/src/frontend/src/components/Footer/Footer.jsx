import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { useData } from '../../context/DataContext'

// Payment Icons
import visaIcon from '../../assets/icons/visa.svg'
import mastercardIcon from '../../assets/icons/mastercard.svg'
import eloIcon from '../../assets/icons/elo.svg'
import hipercardIcon from '../../assets/icons/Hipercard_logo.svg'
import amexIcon from '../../assets/icons/americanexpress.svg'
import pixIcon from '../../assets/icons/pix.svg'
import boletoIcon from '../../assets/icons/boleto-logo.svg'

const FooterWrapper = styled.footer`
  background: ${({ $style, theme }) => $style?.footerBackground || theme.colors.dark};
  color: ${({ $style, theme }) => $style?.footerText || theme.colors.white};
  padding: 3rem 1rem 2rem;
`

const FooterContent = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`

const FooterSection = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p, a {
    color: inherit; /* Use wrapper color */
    opacity: 0.9;
    margin-bottom: 0.5rem;
    display: block;
  }
  
  a:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const FooterLogo = styled(Link)`
  display: block;
  margin-bottom: 1rem;
  
  img {
    height: 50px;
    width: auto;
    max-width: 100%;
    filter: brightness(0) invert(1);
    
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      height: 40px;
    }
  }
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: ${({ theme }) => theme.transitions.normal};
    color: white !important; /* Icons always white on buttons */
    
    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`

const FooterBottom = styled.div`
  max-width: 1240px;
  margin: 2rem auto 0;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  
  p {
    color: inherit;
    opacity: 0.7;
    font-size: 0.9rem;
  }
`

const PaymentBadge = styled.div`
  margin-top: 1rem;
  
  img {
    max-width: 200px;
    opacity: 0.8;
  }
`

export default function Footer() {
  const { siteTexts, siteConfig } = useData()
  const styles = siteTexts?.style || {}

  return (
    <FooterWrapper $style={styles}>
      <FooterContent>
        <FooterSection>
          <FooterLogo to="/">
            <img src="/logo.svg" alt="Body Harmony" />
          </FooterLogo>
          <p>{siteTexts?.aboutDescription || 'Transformando vidas através da eletroestimulação. Não é somente estética: o Body Harmony trata de dentro para fora, oferecendo também SAÚDE!'}</p>
          <SocialLinks>
            <a href="https://instagram.com/bodyharmony" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://wa.me/5518996356825" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
            <a href={`mailto:${siteTexts.footerEmail}`}>
              <FaEnvelope />
            </a>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h4>Links Rápidos</h4>
          <Link to="/">Início</Link>
          {siteConfig?.showMentors !== false && <Link to="/mentores">Mentores</Link>}
          {siteConfig?.showLicentiates !== false && <Link to="/licenciadas">Licenciadas</Link>}
          {siteConfig?.showResults !== false && <Link to="/resultados">Transformações</Link>}
          {siteConfig?.showTestimonials !== false && <Link to="/depoimentos">Depoimentos</Link>}
          {siteConfig?.showContact !== false && <Link to="/contato">Contato</Link>}
        </FooterSection>

        <FooterSection>
          <h4>{siteTexts?.contactTitle || 'Contato'}</h4>
          <a href={`mailto:${siteTexts.footerEmail}`}>
            <FaEnvelope style={{ marginRight: '0.5rem' }} />
            {siteTexts.footerEmail}
          </a>
          <a href="https://wa.me/5518996356825" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp style={{ marginRight: '0.5rem' }} />
            (18) 99635-6825
          </a>
          <PaymentBadge>
            <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Pagamento seguro:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <img src={visaIcon} alt="Visa" style={{ height: '24px' }} />
              <img src={mastercardIcon} alt="Mastercard" style={{ height: '24px' }} />
              <img src={eloIcon} alt="Elo" style={{ height: '24px' }} />
              <img src={hipercardIcon} alt="Hipercard" style={{ height: '24px' }} />
              <img src={amexIcon} alt="Amex" style={{ height: '24px' }} />
              <img src={pixIcon} alt="PIX" style={{ height: '24px' }} />
              <img src={boletoIcon} alt="Boleto" style={{ height: '24px' }} />
            </div>
          </PaymentBadge>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>{siteTexts.footerCopyright}</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          Made By: <a href="https://n4labs.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>N4-Labs</a>
        </p>
      </FooterBottom>
    </FooterWrapper>
  )
}
