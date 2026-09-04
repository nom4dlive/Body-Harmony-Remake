import styled from 'styled-components'
import { FaInstagram, FaPlay, FaWhatsapp } from 'react-icons/fa'
import InstagramGrid from '../InstagramGrid/InstagramGrid'
import ImageWithFallback from '../ImageWithFallback/ImageWithFallback'

const Card = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* Light Shadow */
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`

const Header = styled.div`
  height: 100px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.dark});
  position: relative;
`

const AvatarWrapper = styled.div`
  width: 100px;
  height: 100px;
  margin: -50px auto 0;
  position: relative;
  cursor: ${({ $hasVideo }) => $hasVideo ? 'pointer' : 'default'};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: ${({ $hasVideo }) => $hasVideo ? 'scale(1.05)' : 'none'};
  }
`

const StoriesRing = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  z-index: 1;
  display: ${({ $show }) => $show ? 'block' : 'none'};
  animation: spin 10s linear infinite;
  
  @keyframes spin { 
    100% { transform: rotate(360deg); } 
  }
`

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  position: relative;
  z-index: 2;
  overflow: hidden;
  background: white;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const PlayIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid white;
  z-index: 3;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`

const Info = styled.div`
  padding: 3rem 1.5rem 1.5rem;
  text-align: center;
`

const Name = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1B4E6B; /* Primary Blue from Reference */
  margin-bottom: 0;
  letter-spacing: 0.5px;
`

const MiniGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
`

const GalleryImage = styled.div`
  height: 80px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`

const InstagramLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #C13584; /* Insta Pink */
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  margin-top: 0.5rem;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`

const FeedBox = styled.div`
  width: 100%;
  height: 180px;
  margin-top: 0rem;
  border: 0px solid #eee;
  border-radius: 0px;
  overflow: hidden;
  position: relative;
  background: #fafafa;
`

export default function LicenciadaCard({ student, onVideoClick, onFeedClick }) {
  const hasVideo = !!student.videoUrl
  const hasGallery = student.miniGallery && student.miniGallery.length > 0
  const photoUrl = student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Licenciada')}&background=0A3E60&color=fff`

  return (
    <Card>
      <Header />

      <div style={{ position: 'relative' }}>
        <AvatarWrapper
          $hasVideo={hasVideo}
          onClick={() => hasVideo && onVideoClick(student)}
        >
          <StoriesRing $show={hasVideo} />
          <Avatar>
            <ImageWithFallback
              src={photoUrl}
              alt={student.name}
              fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Licenciada')}&background=0A3E60&color=fff`}
            />

          </Avatar>
          {hasVideo && (
            <PlayIcon>
              <FaPlay style={{ marginLeft: '2px' }} />
            </PlayIcon>
          )}
        </AvatarWrapper>

        <Info>
          {/* Header Row: Name + WhatsApp */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <Name>{student.name}</Name>
            {(student.whatsapp || '') && (
              <a
                href={`https://wa.me/${String(student.whatsapp).replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25D366', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
                title="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            )}
          </div>

          {/* Location Row + Instagram */}
          <div style={{ marginBottom: '1rem' }}>
            {student.location && (
              <p style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', marginBottom: '0.5rem' }}>
                {student.location} {student.state && <strong>- {student.state}</strong>}
              </p>
            )}

            <InstagramLink
              href={`https://instagram.com/${(student.instagram || '').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram /> {student.instagram || 'Instagram'}
            </InstagramLink>
          </div>

          <FeedBox>
            <InstagramGrid
              username={student.instagram}
              style={{
                marginTop: '-146px', /* User Validated Crop */
                height: 'calc(100% + 280px)', /* Push Footer out of view */
                alignItems: 'flex-start'
              }}
              scrolling="no"
            />
          </FeedBox>
        </Info>
      </div>
    </Card>
  )
}

