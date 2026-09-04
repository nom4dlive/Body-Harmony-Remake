import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaShieldAlt, FaUserGraduate, FaClipboardCheck, FaExclamationTriangle,
    FaEye, FaCheck, FaTimes, FaRobot, FaSearch
} from 'react-icons/fa';
import { api } from '../../../services/api';

const NEXUS = {
    bg: '#0D0D12',
    card: 'rgba(20, 20, 25, 0.7)',
    border: 'rgba(255, 255, 255, 0.05)',
    accent: '#ED7E13',
    success: '#10B981',
    error: '#EF4444',
    text: '#E2E8F0',
    textSec: '#94A3B8'
};

const Container = styled.div`
    padding: 2rem;
    color: ${NEXUS.text};
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    .title {
        display: flex;
        align-items: center;
        gap: 1rem;
        svg { font-size: 2rem; color: ${NEXUS.accent}; }
        h1 { margin: 0; font-size: 1.8rem; letter-spacing: 2px; text-transform: uppercase; }
    }
`;

const CaseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
`;

const CaseCard = styled(motion.div)`
    background: ${NEXUS.card};
    border: 1px solid ${NEXUS.border};
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

/**
 * LicenciadaReviewHub (Legacy: ALunaReviewHub)
 * Auditoria de atendimentos da Mentoria IA (Doctor Harmony)
 * Nexus V52 Nomenclature Sync
 */
export default function LicenciadaReviewHub() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);
    const [mentorNotes, setMentorNotes] = useState('');

    useEffect(() => { loadCases(); }, []);

    const loadCases = async () => {
        try {
            setLoading(true);
            const res = await api.doctorHarmony.getPendingCases();
            if (res && res.success) {
                setCases(res.cases || []);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleSubmitReview = async () => {
        if (!mentorNotes) return;
        try {
            const res = await api.doctorHarmony.reviewCase(selectedCase.id, mentorNotes);
            if (res && res.success) {
                setSelectedCase(null);
                setMentorNotes('');
                loadCases();
            }
        } catch (err) { alert("Erro ao enviar revisão."); }
    };

    return (
        <Container>
            <Header>
                <div className="title">
                    <FaShieldAlt />
                    <h1>Doctor Harmony Watchtower</h1>
                </div>
            </Header>
            <CaseGrid>
                {cases.map(item => (
                    <CaseCard key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><FaUserGraduate /> {item.licenciada_name || item.student_name}</span>
                            <span>{Math.round(item.confidence_score * 100)}%</span>
                        </div>
                        <p style={{ color: NEXUS.textSec }}>{item.doctor_harmony_response ? item.doctor_harmony_response.substring(0, 100) : ''}...</p>
                        <button onClick={() => setSelectedCase(item)} style={{ background: NEXUS.accent, border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>
                            Analisar
                        </button>
                    </CaseCard>
                ))}
            </CaseGrid>
            {selectedCase && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: NEXUS.bg, padding: '2rem', borderRadius: '12px', width: '400px', border: `1px solid ${NEXUS.border}` }}>
                        <h3 style={{ color: NEXUS.accent }}>Revisão: {selectedCase.licenciada_name || selectedCase.student_name}</h3>
                        <textarea
                            style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)', color: 'white', border: `1px solid ${NEXUS.border}`, borderRadius: '4px', padding: '0.5rem', margin: '1rem 0' }}
                            value={mentorNotes}
                            onChange={e => setMentorNotes(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={handleSubmitReview} style={{ background: NEXUS.success, color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Enviar</button>
                            <button onClick={() => setSelectedCase(null)} style={{ background: 'transparent', color: NEXUS.textSec, border: `1px solid ${NEXUS.border}`, padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
}
