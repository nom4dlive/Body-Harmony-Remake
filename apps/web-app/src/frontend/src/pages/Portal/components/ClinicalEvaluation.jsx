import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { FaCamera, FaMicrophone, FaUpload, FaSpinner, FaRobot, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import { api } from '../../../services/api'
import { motion, AnimatePresence } from 'framer-motion'

const EvaluationContainer = styled.div`
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(49, 107, 156, 0.2);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 500px;
`

const Header = styled.div`
  padding: 1.5rem;
  background: rgba(10, 62, 96, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #FFFFFF;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    svg { color: ${({ theme }) => theme.colors.secondary}; }
  }
`

const TabGroup = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px;
  margin: 1.5rem;
`

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  background: ${props => props.active ? 'rgba(237, 126, 19, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#ED7E13' : '#94A3B8'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover { color: #FFFFFF; }
`

const Dropzone = styled.div`
  flex: 1;
  margin: 0 1.5rem 1.5rem;
  border: 2px dashed ${props => props.isDragging ? '#ED7E13' : 'rgba(49, 107, 156, 0.4)'};
  background: ${props => props.isDragging ? 'rgba(237, 126, 19, 0.05)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #ED7E13; background: rgba(0, 0, 0, 0.15); }

  p { color: #94A3B8; font-size: 0.95rem; margin: 0; }
  span { color: #64748B; font-size: 0.8rem; }
`

const ResultArea = styled(motion.div)`
  padding: 1.5rem;
  background: rgba(10, 62, 96, 0.2);
  margin: 0 1.5rem 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${props => props.lowConfidence ? '#FACC15' : '#4ADE80'};

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    color: ${props => props.lowConfidence ? '#FACC15' : '#4ADE80'};
  }

  p { color: #E2E8F0; line-height: 1.6; margin: 0; font-size: 0.95rem; }

  .tags {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #94A3B8;
`

export function ClinicalEvaluation({ variant = 'tabs' }) {
    const [type, setType] = useState('image')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileSelect = (e, selectedType) => {
        const selected = e.target.files[0]
        if (selected) {
            setFile(selected)
            handleUpload(selected, selectedType || type)
        }
    }

    const handleUpload = async (selectedFile, currentType) => {
        try {
            setLoading(true)
            setResult(null)

            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('type', currentType)
            formData.append('notes', '')

            const res = await api.doctorHarmony.evaluate(formData)
            if (res.success) {
                setResult({ ...res, type: currentType })
            }
        } catch (err) {
            alert(err.message || 'Erro ao processar avaliação.')
        } finally {
            setLoading(false)
            setFile(null)
        }
    }

    if (variant === 'grid') {
        return (
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/40 border border-blue-500/20 rounded-2xl p-6 flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg">
                            <FaCamera /> Avaliação de Foto
                        </div>
                        <p className="text-slate-400 text-sm">Escaneie marcadores fisiológicos e receba um parecer técnico instantâneo.</p>

                        <div
                            onClick={() => { setType('image'); fileInputRef.current?.click(); }}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-blue-500/30 bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-500 hover:bg-black/30 transition-all p-4"
                        >
                            <FaUpload size={32} className="text-orange-500/60" />
                            <span className="text-slate-300 font-medium">Toque para enviar foto</span>
                            <span className="text-slate-500 text-xs">JPG, PNG (Max 5MB)</span>
                        </div>
                    </motion.div>

                    {/* Audio Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/40 border border-blue-500/20 rounded-2xl p-6 flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg">
                            <FaMicrophone /> Nota de Áudio
                        </div>
                        <p className="text-slate-400 text-sm">Fale sobre os desafios do seu caso e receba orientações estratégicas da Dra. Harmony.</p>

                        <div
                            onClick={() => { setType('audio'); fileInputRef.current?.click(); }}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-blue-500/30 bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-500 hover:bg-black/30 transition-all p-4"
                        >
                            <FaMicrophone size={32} className="text-orange-500/60" />
                            <span className="text-slate-300 font-medium">Toque para gravar/enviar</span>
                            <span className="text-slate-500 text-xs">MP3, WAV, M4A</span>
                        </div>
                    </motion.div>
                </div>

                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e, type)}
                    accept={type === 'image' ? 'image/*' : 'audio/*'}
                />

                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4"
                        >
                            <FaSpinner className="text-orange-500 animate-spin text-4xl" />
                            <div className="text-white font-bold text-xl tracking-wider">A Dra. Harmony está analisando...</div>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 bg-slate-900/60 border-l-4 border-l-green-400 rounded-xl p-6 relative overflow-hidden"
                            style={{ borderLeftColor: result.review_needed ? '#FACC15' : '#4ADE80' }}
                        >
                            <button
                                onClick={() => setResult(null)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                            <div className="flex justify-between mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: result.review_needed ? '#FACC15' : '#4ADE80' }}>
                                <span>Parecer Técnico - {result.type === 'image' ? 'Foto' : 'Áudio'}</span>
                                <span>Confiança: {Math.round(result.confidence * 100)}%</span>
                            </div>
                            <p className="text-slate-100 leading-relaxed">{result.opinion}</p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {result.muscle_groups?.map(t => <Tag key={t}>{t}</Tag>)}
                                {result.safety_warnings?.map(t => <Tag key={t} style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444' }}>{t}</Tag>)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <EvaluationContainer>
            <Header>
                <h3><FaRobot /> Doctor Harmony</h3>
                {loading && <div style={{ color: '#ED7E13', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaSpinner className="spin" /> Processando...</div>}
            </Header>

            <TabGroup>
                <Tab active={type === 'image'} onClick={() => { setType('image'); setResult(null); }}>
                    <FaCamera /> Análise de Imagem
                </Tab>
                <Tab active={type === 'audio'} onClick={() => { setType('audio'); setResult(null); }}>
                    <FaMicrophone /> Nota de Áudio
                </Tab>
            </TabGroup>

            <AnimatePresence mode="wait">
                {!result && !loading && (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Dropzone onClick={() => fileInputRef.current?.click()}>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={(e) => handleFileSelect(e)}
                                accept={type === 'image' ? 'image/*' : 'audio/*'}
                            />
                            <FaUpload size={40} color="#ED7E13" style={{ opacity: 0.6 }} />
                            <p>Toque ou arraste sua {type === 'image' ? 'foto para avaliação técnica' : 'gravação de áudio'}</p>
                            <span>{type === 'image' ? 'JPG, PNG (Max 5MB)' : 'MP3, WAV, M4A'}</span>
                        </Dropzone>
                    </motion.div>
                )}

                {result && (
                    <ResultArea key="result" lowConfidence={result.review_needed}>
                        <div className="header">
                            <span>Parecer da Doctor Harmony {result.review_needed && '(Aguardando Mentoria)'}</span>
                            <span>Confiança: {Math.round(result.confidence * 100)}%</span>
                        </div>
                        <p>{result.opinion}</p>

                        <div className="tags">
                            {result.muscle_groups?.map(t => <Tag key={t}>{t}</Tag>)}
                            {result.safety_warnings?.map(t => <Tag key={t} style={{ borderColor: '#EF4444' }}>{t}</Tag>)}
                        </div>

                        <BuyButton onClick={() => setResult(null)} style={{ marginTop: '1.5rem', background: 'rgba(237, 126, 19, 0.1)', color: '#ED7E13', borderStyle: 'solid' }}>
                            <FaTimes /> Fechar e Nova Análise
                        </BuyButton>
                    </ResultArea>
                )}
            </AnimatePresence>

            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </EvaluationContainer>
    )
}

const BuyButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: #94A3B8;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border-style: solid;
  }
`
