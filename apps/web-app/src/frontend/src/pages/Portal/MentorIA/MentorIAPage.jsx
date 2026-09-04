import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ClinicalEvaluation } from '../components/ClinicalEvaluation';
import { AiCreditsWidget } from '../components/AiCreditsWidget';
import { FaRobot, FaInfoCircle } from 'react-icons/fa';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';

const MentorChat = lazy(() => import('../components/MentorChat'));

const PageContainer = styled.div`
    padding: 2rem 4%;
    min-height: 100vh;
    background: #051A29;
    background-image: 
        radial-gradient(circle at 0% 0%, rgba(49, 107, 156, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, rgba(237, 126, 19, 0.05) 0%, transparent 50%),
        linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
    background-attachment: fixed;
    color: #FFFFFF;
    padding-bottom: 100px;
    
    @media (max-width: 768px) {
        padding: 1rem 4% 120px;
    }
`;

const Header = styled.div`
    margin-bottom: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1.5rem;

    .title-group {
        h1 {
            color: #FFFFFF;
            font-size: clamp(1.8rem, 4vw, 2.5rem);
            margin: 0;
            font-family: ${({ theme }) => theme.fonts.heading};
            text-transform: uppercase;
            letter-spacing: -1px;
            
            span {
                font-weight: 300;
                display: block;
                font-size: 0.9rem;
                color: #ED7E13;
                text-transform: uppercase;
                letter-spacing: 3px;
                margin-bottom: 0.5rem;
            }
        }
    }

    .credits-wrapper {
        min-width: 280px;
        @media (max-width: 768px) {
            width: 100%;
        }
    }
`;

const GridSection = styled.section`
    margin-bottom: 3rem;
`;

const ChatSection = styled.section`
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(49, 107, 156, 0.2);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    height: 700px;
    display: flex;
    flex-direction: column;
    overscroll-behavior-y: contain;

    @media (max-width: 768px) {
        height: 600px;
    }

    .chat-header {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(10, 62, 96, 0.2);

        h2 {
            margin: 0;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            svg { color: #ED7E13; }
        }
    }
`;

const InfoBox = styled.div`
    background: rgba(49, 107, 156, 0.1);
    border: 1px solid rgba(49, 107, 156, 0.2);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: #94A3B8;

    svg { color: #316B9C; flex-shrink: 0; }
`;

export default function MentorIAPage() {
    return (
        <PageContainer>
            <Header>
                <div className="title-group">
                    <h1>
                        <span>Consultoria Técnica</span>
                        Doctor Harmony
                    </h1>
                </div>
                <div className="credits-wrapper">
                    <AiCreditsWidget />
                </div>
            </Header>

            <InfoBox>
                <FaInfoCircle size={20} />
                <p>Use a IA para validar suas avaliações ou tirar dúvidas rápidas. Para casos complexos, seu histórico é revisado periodicamente por nossas mentoras masters.</p>
            </InfoBox>

            <GridSection>
                <ClinicalEvaluation variant="grid" />
            </GridSection>

            <ChatSection>
                <div className="chat-header">
                    <h2><FaRobot /> Chat de Mentoria Livre</h2>
                </div>
                <Suspense fallback={<div className="p-10 text-center text-slate-500">Iniciando interface neural...</div>}>
                    <MentorChat
                        fullHeight={false}
                        noBg={true}
                        hideHeader={true}
                    />
                </Suspense>
            </ChatSection>

            <BottomNavbar />
        </PageContainer>
    );
}
