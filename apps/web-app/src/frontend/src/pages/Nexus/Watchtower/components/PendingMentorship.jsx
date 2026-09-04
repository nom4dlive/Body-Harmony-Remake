import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../../../services/api';
import { FaUserMd, FaExclamationCircle, FaRobot, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

const NEXUS = {
    surface: '#16161E',
    primary: '#00F2FF',
    accent: '#FF0055',
    text: '#E0E0FF',
    textSec: '#8B8B9E',
    border: '#1F1F2E',
    warning: '#FACC15'
};

const Section = styled.div`
    background: ${NEXUS.surface};
    border: 1px solid ${NEXUS.border};
    border-radius: 12px;
    padding: 24px;
    margin-top: 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        color: ${NEXUS.text};
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        svg { color: ${NEXUS.primary}; }
    }
`;

const CaseList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const CaseItem = styled.div`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid ${NEXUS.border};
    border-radius: 8px;
    padding: 16px;
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 20px;
    align-items: center;
    transition: all 0.2s;

    &:hover {
        background: rgba(0, 242, 255, 0.05);
        border-color: ${NEXUS.primary};
    }
`;

const Thumb = styled.div`
    width: 80px;
    height: 80px;
    background: #000;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${NEXUS.textSec};
    font-size: 2rem;
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; }
`;

const Content = styled.div`
    h4 { color: ${NEXUS.text}; margin: 0 0 4px; font-size: 1rem; }
    p { color: ${NEXUS.textSec}; margin: 0; font-size: 0.85rem; line-height: 1.4; }
    .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        margin-top: 5px;
        background: rgba(250, 204, 21, 0.1);
        color: ${NEXUS.warning};
    }
`;

const ReviewOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const ReviewModal = styled.div`
    background: ${NEXUS.surface};
    border: 1px solid ${NEXUS.primary};
    width: 100%;
    max-width: 600px;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 0 50px rgba(0, 242, 255, 0.2);

    h3 { margin: 0 0 20px; color: ${NEXUS.primary}; text-transform: uppercase; }
    
    textarea {
        width: 100%;
        background: #000;
        border: 1px solid ${NEXUS.border};
        color: ${NEXUS.text};
        padding: 15px;
        border-radius: 8px;
        min-height: 150px;
        margin: 15px 0;
        font-family: inherit;
        outline: none;
        &:focus { border-color: ${NEXUS.primary}; }
    }
`;

const Btn = styled.button`
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    border: 1px solid ${props => props.primary ? NEXUS.primary : NEXUS.border};
    background: ${props => props.primary ? NEXUS.primary : 'transparent'};
    color: ${props => props.primary ? '#000' : NEXUS.textSec};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.primary ? '0 5px 15px rgba(0, 242, 255, 0.4)' : 'none'};
    }
`;

export default function PendingMentorship() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await api.doctorHarmony.getPendingCases();
            if (res.success) setCases(res.cases);
        } catch (err) {
            console.error("Failed to fetch pending cases", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!notes.trim()) return;
        try {
            const res = await api.doctorHarmony.reviewCase(selectedCase.id, notes);
            if (res.success) {
                setCases(prev => prev.filter(c => c.id !== selectedCase.id));
                setSelectedCase(null);
                setNotes('');
            }
        } catch (err) {
            alert("Error submitting review");
        }
    };

    if (loading) return null;
    if (cases.length === 0) return null;

    return (
        <Section>
            <Header>
                <h2><FaUserMd /> Mentoria Pendente (Doctor Harmony <FaRobot />)</h2>
                <div style={{ color: NEXUS.warning, fontSize: '0.8rem', fontWeight: 700 }}>{cases.length} CASO(S) AGUARDANDO REVISÃO</div>
            </Header>

            <CaseList>
                {cases.map(c => (
                    <CaseItem key={c.id}>
                        <Thumb>
                            {c.case_type === 'image' ? <img src={`/api/private_uploads/ai_cases/${c.file_path}`} alt="Clinical Case" /> : <FaExclamationCircle />}
                        </Thumb>
                        <Content>
                            <h4>{c.student_name}</h4>
                            <p>{c.doctor_harmony_response ? c.doctor_harmony_response.substring(0, 100) : ''}...</p>
                            <div className="badge">Confiança: {Math.round(c.confidence_score * 100)}%</div>
                        </Content>
                        <Btn onClick={() => setSelectedCase(c)}><FaChevronRight /></Btn>
                    </CaseItem>
                ))}
            </CaseList>

            {selectedCase && (
                <ReviewOverlay>
                    <ReviewModal>
                        <h3>Revisão de Caso: {selectedCase.student_name}</h3>
                        <p style={{ color: NEXUS.textSec, fontSize: '0.9rem' }}>Parecer Atual da Doctor Harmony:</p>
                        <blockquote style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${NEXUS.primary}`, color: NEXUS.text }}>
                            {selectedCase.doctor_harmony_response}
                        </blockquote>

                        <textarea
                            placeholder="Escreva sua orientação clínica superior para a licenciada..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                            <Btn onClick={() => setSelectedCase(null)}>Cancelar</Btn>
                            <Btn primary onClick={handleSubmit}><FaCheckCircle /> Enviar Parecer Superior</Btn>
                        </div>
                    </ReviewModal>
                </ReviewOverlay>
            )}
        </Section>
    );
}
