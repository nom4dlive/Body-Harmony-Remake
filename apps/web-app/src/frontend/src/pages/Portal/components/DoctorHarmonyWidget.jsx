import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import { api } from '../../../services/api';
import { useLocation } from 'react-router-dom';
import { useLicenciadaAuth as useStudentAuth } from '../../../context/LicenciadaAuthContext';

// Lazy loading MentorChat for better initial performance (Phase 3)
const MentorChat = React.lazy(() => import('./MentorChat'));
import widgetIcon from '../../../assets/icons/widget-icon.svg';

const FloatingButton = styled(motion.button)`
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0A3E60 0%, #051A29 100%);
    border: 2px solid rgba(237, 126, 19, 0.4);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(237, 126, 19, 0.3);
    z-index: 1000;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const DrawerContainer = styled(motion.div)`
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100vh;
    background: rgba(10, 62, 96, 0.4);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    box-shadow: -20px 0 80px rgba(0, 0, 0, 0.6), inset 1px 0 0 rgba(255, 255, 255, 0.1);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(255, 255, 255, 0.15);

    @media (max-width: 480px) {
        width: 100%;
        height: ${props => props.$isFullscreen ? '100%' : '100vh'};
        border-left: none;
    }

    /* Glow effect */
    &::after {
        content: '';
        position: absolute;
        top: 20%;
        right: 0;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(237, 126, 19, 0.15) 0%, transparent 70%);
        pointer-events: none;
        z-index: -1;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    left: -40px;
    width: 40px;
    height: 40px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 10px 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    box-shadow: -5px 0 15px rgba(239, 68, 68, 0.3);

    @media (max-width: 480px) {
        left: auto;
        right: 20px;
        border-radius: 10px;
    }
`;

const DrawerHeader = styled.div`
    padding: 2rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 1.2rem;
    background: linear-gradient(to bottom, rgba(10, 62, 96, 0.2), transparent);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-image: url('/logo.svg'); /* Assumes logo.svg is in public folder */
        background-repeat: no-repeat;
        background-position: right center;
        background-size: 150px;
        opacity: 0.05;
        pointer-events: none;
    }

    h3 {
        margin: 0;
        font-size: 1.3rem;
        color: white;
        font-weight: 700;
        letter-spacing: -0.5px;
        span { 
            color: #ED7E13; 
            font-weight: 400;
            display: block;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 2px;
        }
    }

    .icon-glow {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background: rgba(10, 62, 96, 0.5);
        border: 1px solid rgba(237, 126, 19, 0.3);
        border-radius: 12px;
        backdrop-filter: blur(2px);
        
        }
    }
`;

const SkeletonLoader = styled.div`
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    
    .skeleton-item {
        height: 80px;
        background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.03) 25%, 
            rgba(255, 255, 255, 0.08) 50%, 
            rgba(255, 255, 255, 0.03) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 12px;
    }

    @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
`;

const FullscreenButton = styled.button`
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    font-size: 1.1rem;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 5px;
    transition: color 0.2s;

    &:hover { color: #ED7E13; }

    @media (max-width: 480px) {
        display: flex;
    }
`;


class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Doctor Harmony Widget Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
                    <h3>⚠️ Algo deu errado</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>A Dra. Harmony está passando por uma manutenção rápida.</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ED7E13', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                    >
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function DoctorHarmonyWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isProactive, setIsProactive] = useState(false);
    const { student } = useStudentAuth();
    const location = useLocation();

    // Proactive Support logic (Phase 2)
    React.useEffect(() => {
        if (isOpen) {
            setIsProactive(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsProactive(true);
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearTimeout(timer);
    }, [isOpen, location.pathname]);

    // Do not show on public site, login, admin or nexus routes
    const excludedPaths = ['/', '/login', '/admin', '/nexus', '/portal-licenciada/nova-senha', '/metodo', '/mentores', '/licenciadas', '/workshop', '/resultados', '/depoimentos', '/contato'];
    const isExcluded = excludedPaths.some(path => location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));

    // Context Detection (Lesson Study)
    const lessonMatch = location.pathname.match(/\/lms\/lesson\/(\d+)/);
    const lessonId = lessonMatch ? lessonMatch[1] : null;

    const toggleDrawer = (open) => {
        setIsOpen(open);
        if (open) {
            api.doctorHarmony.logEvent('WIDGET_OPENED').catch(console.error);
        }
    };

    if (!student || isExcluded) return null;

    const notificationCount = 0; // Mock state, future integration points here

    return (
        <>
            <FloatingButton
                whileHover={{ scale: 1.05, translateY: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleDrawer(true)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: isProactive ? [0, -20, 0, -10, 0] : 0,
                    boxShadow: [
                        "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(237, 126, 19, 0.3)",
                        "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(237, 126, 19, 0.6)",
                        "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(237, 126, 19, 0.3)"
                    ]
                }}
                transition={{
                    y: isProactive ? {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 3
                    } : { duration: 0.3 },
                    boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                    }
                }}
                title="Conversar com Doctor Harmony"
            >
                <img src={widgetIcon} alt="Dra. Harmony" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                {notificationCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ED7E13',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #0A3E60'
                    }}>
                        {notificationCount}
                    </span>
                )}
            </FloatingButton>

            <AnimatePresence>
                {isOpen && (
                    <DrawerContainer
                        $isFullscreen={isFullscreen}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <CloseButton onClick={() => toggleDrawer(false)}>
                            <FaTimes />
                        </CloseButton>

                        <DrawerHeader>
                            <div className="icon-glow">
                                <img src={widgetIcon} alt="Dra. Harmony" style={{ width: '70%', height: '70%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                            </div>
                            <h3>Doctor Harmony <span>Assistente Inteligente</span></h3>
                            <div style={{ flex: 1 }} />
                            <FullscreenButton onClick={() => setIsFullscreen(!isFullscreen)}>
                                {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
                            </FullscreenButton>
                        </DrawerHeader>

                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                            <ErrorBoundary>
                                <React.Suspense fallback={
                                    <SkeletonLoader>
                                        <div className="skeleton-item" />
                                        <div className="skeleton-item" style={{ height: '120px' }} />
                                        <div className="skeleton-item" style={{ width: '80%' }} />
                                    </SkeletonLoader>
                                }>
                                    <MentorChat
                                        fullHeight={false}
                                        noBg={true}
                                        hideHeader={true}
                                        lessonId={lessonId}
                                    />
                                </React.Suspense>
                            </ErrorBoundary>
                        </div>
                    </DrawerContainer>
                )}
            </AnimatePresence>
        </>
    );
}
