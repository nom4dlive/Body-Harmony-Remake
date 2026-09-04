import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Smartphone, Monitor } from 'lucide-react';
import { useHomeAssets } from '../../hooks/useHomeAssets';

// Components we want to preview
import HeroSection from '../../pages/Home/components/HeroSection';
import VisualStrip from '../../pages/Home/components/VisualStrip';
import FooterCTA from '../../pages/Home/components/FooterCTA';
import AuthorityTestimonial from '../../pages/Home/components/AuthorityTestimonial';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 60px;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #333;
  color: #fff;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const DeviceBtn = styled.button`
  background: ${props => props.$active ? '#d4af37' : '#333'};
  color: ${props => props.$active ? '#000' : '#fff'};
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background: #d4af37;
    color: #000;
  }
`;

const PreviewArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  padding: 20px;
`;

// Scale Container
const Sandbox = styled.div`
  background: white;
  width: ${props => props.$mode === 'mobile' ? '375px' : '100vw'}; // Full width for desktop simulation
  height: ${props => props.$mode === 'mobile' ? '667px' : '100vh'}; // Full height for desktop
  /* Desktop Mode Scaling:
     If mode is desktop, we render it at full scale inside an iframe approach OR
     we just fit it in the screen. Since components are responsive, 
     if we restrict width, they act responsive.
     For Desktop, we want to simulate 1920px but scale it down to fit.
  */
  width: ${props => props.$mode === 'desktop' ? '1440px' : '375px'};
  aspect-ratio: ${props => props.$mode === 'desktop' ? '16/9' : '9/16'};
  
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  
  transform: scale(${props => props.$scale});
  transform-origin: center center;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
  transition: width 0.3s, transform 0.3s;
`;

const LivePreviewModal = ({
  isOpen,
  onClose,
  image, // The full image object { filepath, focal_point, etc }
  slotId, // 'home_hero', 'home_strip', etc
  tempFocalPoint // {x, y} being edited
}) => {
  const [mode, setMode] = useState('desktop'); // 'desktop' or 'mobile'
  const { stripImages } = useHomeAssets(); // Get other images for context (e.g. strip)

  if (!isOpen || !image) return null;

  // Calculate Scale to fit screen
  // Desktop roughly 1440px wide. Mobile 375px.
  // We check window size
  const windowH = window.innerHeight - 100;
  const windowW = window.innerWidth - 40;

  let scale = 1;
  if (mode === 'desktop') {
    scale = Math.min(windowW / 1440, windowH / 810);
  } else {
    scale = Math.min(windowW / 375, windowH / 667);
  }

  // Determine Component to Render
  const renderContent = () => {
    // Inject image override
    // Note: image.filepath might be partial if just uploaded? 
    // Assuming image object has the correct filepath.

    // Safety check for image path
    const imgPath = image.filepath;

    // Focal Point Override
    const activeFocalPoint = tempFocalPoint || image.focal_point;

    // Adjustments Override
    const activeAdjustments = image.adjustments || { zoom: 100, overlay: 0.0 };

    switch (slotId) {
      case 'home_hero':
        return <HeroSection
          previewImage={imgPath}
          previewFocalPoint={activeFocalPoint}
          previewAdjustments={activeAdjustments}
        />;

      case 'home_cta_bg':
        return <FooterCTA previewImage={imgPath} previewAdjustments={activeAdjustments} />;

      case 'home_authority_bg':
        return <AuthorityTestimonial previewBg={imgPath} previewAdjustments={activeAdjustments} />;

      case 'home_strip':
        // For strip, we need an array. We replace the FIRST one or append?
        // We can't easily preview individual image adjustments in a list unless we refactor VisualStrip heavily.
        // For now, let's keep it simple: preview image itself. Zoom/Overlay on VisualStrip cards is tricky.
        const previewStrip = [
          { id: 999, filepath: imgPath, filename: 'Preview' },
          ...stripImages.slice(0, 2) // Take existing ones to fill the row
        ];
        return <VisualStrip images={previewStrip} />;

      default:
        return (
          <div style={{ color: 'black', padding: 20 }}>
            <h3>Sem preview disponível para este Slot ({slotId})</h3>
            <img src={imgPath} style={{ maxWidth: '100%' }} />
          </div>
        );
    }
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Header>
        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Preview: {slotId}</span>
          <span style={{ fontSize: '0.8em', color: '#888' }}>
            (Focal Point: {tempFocalPoint ? `${Math.round(tempFocalPoint.x)}%, ${Math.round(tempFocalPoint.y)}%` : 'Padrão'})
          </span>
        </div>

        <Controls>
          <DeviceBtn $active={mode === 'desktop'} onClick={() => setMode('desktop')}>
            <Monitor size={18} /> Desktop
          </DeviceBtn>
          <DeviceBtn $active={mode === 'mobile'} onClick={() => setMode('mobile')}>
            <Smartphone size={18} /> Mobile
          </DeviceBtn>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 10 }}>
            <X size={24} />
          </button>
        </Controls>
      </Header>

      <PreviewArea>
        <Sandbox $mode={mode} $scale={scale}>
          {/* We might need a wrapper to ensure font styles etc are applied if they depend on ThemeProvider which is usually higher up. 
                Assuming Admin has ThemeProvider. GlobalStyles might affect things.
            */}
          {renderContent()}
        </Sandbox>
      </PreviewArea>
    </Overlay>
  );
};

export default LivePreviewModal;
