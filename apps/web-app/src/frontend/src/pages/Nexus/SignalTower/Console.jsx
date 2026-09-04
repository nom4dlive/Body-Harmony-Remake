import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../../../services/api';
import { Megaphone, Trash2, Power, Plus, Search } from 'lucide-react';

const NEXUS = {
    bg: '#050A10',        // Deep Space
    surface: '#0A1A2F',   // Tactical Blue
    card: '#0D223B',      // Navy Card
    primary: '#ED7E13',   // Gold
    accent: '#00F2FF',    // Cyan Neon
    danger: '#EF4444',
    text: '#FFFFFF',
    textSec: '#94A3B8',
    border: 'rgba(237, 126, 19, 0.2)'
};

const PRESETS = [
    // 🚀 PILAR 1: Melhorias Recentes (24h)
    { title: '[SYS] Plataforma Turbo!', message: 'Nessa madrugada aceleramos os motores da Body Harmony. Seu acesso pelo celular está brutalmente mais rápido para que você não perca nem 1 segundo da técnica.', type: 'info', is_blocking: 0 },
    { title: '[SYS] Fim das Travarias!', message: 'Lembra dos vídeos engasgando? Zeramos os travamentos de aula! Acionamos uma limpeza de cache automática garantindo foco 100% no conteúdo.', type: 'info', is_blocking: 0 },
    { title: '[SYS] Visual Resiliente!', message: 'Atualizamos a infraestrutura do catálogo de fotos das licenciadas. O seu cartão de visitas para pacientes está blindado e não falha mais no Mobile.', type: 'info', is_blocking: 0 },
    { title: '[SYS] Manutenção Invisível!', message: 'A engenharia não para! Atualizamos nossa retaguarda do servidor hoje. Você atende seus pacientes e nós mantemos a tecnologia voando.', type: 'info', is_blocking: 0 },
    
    // 🔄 PILAR 2: Troubleshooting (Solução Rápida)
    { title: '[AJUDA] A Tela Ficou Branca?', message: 'Se a internet oscilar ou alguma foto falhar, dê um simples "Atualizar" na página. Nosso sistema recompõe a área para você instintivamente.', type: 'warning', is_blocking: 0 },
    { title: '[AJUDA] Problemas na Aula?', message: 'Se o vídeo tardar a carregar, antes de chamar o suporte, tente limpar o histórico de navegação e fechar abas velhas. O acúmulo de uso trava o celular!', type: 'warning', is_blocking: 0 },
    { title: '[AJUDA] O Portal Travou Meu Acesso?', message: 'Clicou em algo errado e ficou presa? Não sofra! Para qualquer entrave técnico impossível, temos nossa equipe de resgate tático 24h em stand-by.', type: 'warning', is_blocking: 0 },
    { title: '[AJUDA] O Acelerador de Vídeo', message: 'Nossos vídeos seguram facilmente a reprodução 2x. Porém, evite pular incessantemente a barra de tempo para não arrastar o carregamento no 4G.', type: 'warning', is_blocking: 0 },

    // 🛡️ PILAR 3: Segurança e Compliance
    { title: '[SEC] Segurança Bancária', message: 'Sua exclusividade é o que te destaca! A Body Harmony agora rastreia e protege seu acesso contra cópias clandestinas de maneira vitalícia.', type: 'warning', is_blocking: 0 },
    { title: '[SEC] 🛑 ACESSO ÚNICO E INTRANSFERÍVEL', message: 'Seu login possui uma impressão digital única. O uso duplo em regiões anômalas bloqueia o CPF por precaução. JAMAIS divida sua senha.', type: 'alert', is_blocking: 1 },
    { title: '[SEC] Proteção LGPD', message: 'Todo o material que você consome carrega rastreabilidade. Seus dados e a nossa metodologia estão sãos e salvos no mais alto encriptamento web.', type: 'info', is_blocking: 0 },
    { title: '[SEC] Defesa contra Pirataria', message: 'Investimos em camadas invisíveis que detectam tentativas quebras de direitos autorais, impedindo extração das nossas aulas de alta qualidade.', type: 'alert', is_blocking: 0 },
    { title: '[SEC] O Muro dos Resultados', message: 'Nossas atualizações de Segurança e Autenticação existem para manter um muro em torno da exclusividade dos resultados Premium que você vende na clínica.', type: 'info', is_blocking: 0 },

    // 👑 PILAR 4: Cultura e Boas Práticas
    { title: '[CULTURA] Padronização é Rei', message: 'O método não permite chute. Reveja as orientações de dosimetria na plataforma antes de testar correntes fora da meta corporal da paciente.', type: 'info', is_blocking: 0 },
    { title: '[CULTURA] A Cor da Especialização', message: 'Seja Premium também no Instagram! Utilize apenas paletas visuais aprovadas para mostrar que sua clínica pertence à Elite.', type: 'info', is_blocking: 0 },
    { title: '[CULTURA] Consumo Inteligente', message: 'Nosso método não é para "dar play e ir pro WhatsApp". Ouça ativamente os módulos anatômicos. O diagnóstico profundo é a alma do negócio!', type: 'info', is_blocking: 0 },

    // 🤝 PILAR 5: Suporte 24h
    { title: '[SUPORTE] Nunca Durma Com Problemas', message: 'A plataforma não abriu ou tem algum defeito de visualização tarde da noite? Acione imediatamente nossa base: wa.me/5518996959486', type: 'info', is_blocking: 0 },
    { title: '[SUPORTE] 🛠️ Engenharia a Postos!', message: 'Esqueceu a senha no meio da consulta para rever o protocolo de abdômen? Fale agora mesmo com nossa inteligência no wa.me/5518996959486', type: 'info', is_blocking: 0 },
    { title: '[SUPORTE] Help Desk VIP', message: 'Quer reportar lentidão, erro no Portal Gestor ou falha de certificado SSL em links antigos? Mande no suporte urgente: wa.me/5518996959486', type: 'info', is_blocking: 0 },
    { title: '[SUPORTE] Dúvidas que não esperam?', message: 'Salve nosso número na frente do seu teclado. Temos plantão tecnológico ativo 24 horas pronto para te atender: wa.me/5518996959486', type: 'info', is_blocking: 0 }
];

const ControlPanel = styled.div`
  background: ${NEXUS.surface};
  border: 1px solid ${NEXUS.border};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${NEXUS.primary}, ${NEXUS.accent});
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
  
  .row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    @media (max-width: 768px) { flex-direction: column; }
  }

  .field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    label { font-size: 0.75rem; color: ${NEXUS.textSec}; font-weight: 600; text-transform: uppercase; }
  }
  
  input, select, textarea {
     background: ${NEXUS.bg};
     border: 1px solid ${NEXUS.border};
     padding: 12px 16px;
     color: ${NEXUS.text};
     border-radius: 10px;
     font-family: inherit;
     transition: all 0.2s;
     font-size: 0.9rem;
     &:focus { outline: none; border-color: ${NEXUS.primary}; box-shadow: 0 0 12px ${NEXUS.primary}33; }
  }

  textarea { min-height: 80px; resize: vertical; }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;

  .search {
    position: relative;
    flex: 1;
    max-width: 300px;
    input { width: 100%; padding-left: 40px; }
    svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${NEXUS.textSec}; }
  }

  .filters {
    display: flex;
    gap: 8px;
  }
`;

const BroadcastList = styled.div`
  display: grid;
  gap: 15px;
`;

const BroadcastItem = styled.div`
  background: ${NEXUS.card};
  border: 1px solid ${props => props.$active ? `${NEXUS.primary}44` : NEXUS.border};
  border-left: 6px solid ${props => props.$active ? NEXUS.primary : '#334155'};
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    transform: translateX(4px);
    border-color: ${NEXUS.primary}88;
    background: ${NEXUS.surface};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => {
        if (props.$type === 'alert') return `${NEXUS.danger}22`;
        if (props.$type === 'warning') return `${NEXUS.primary}22`;
        return `${NEXUS.accent}22`;
    }};
  color: ${props => {
        if (props.$type === 'alert') return NEXUS.danger;
        if (props.$type === 'warning') return NEXUS.primary;
        return NEXUS.accent;
    }};
  border: 1px solid currentColor;
`;

const Button = styled.button`
  background: ${props => props.$primary ? NEXUS.primary : (props.$danger ? `${NEXUS.danger}11` : NEXUS.bg)};
  color: ${props => props.$primary ? '#000' : (props.$danger ? NEXUS.danger : NEXUS.text)};
  border: 1px solid ${props => props.$primary ? 'transparent' : (props.$danger ? `${NEXUS.danger}44` : NEXUS.border)};
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 800;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
  transition: all 0.2s;
  min-height: 44px;
  
  &:hover:not(:disabled) { 
    transform: translateY(-2px);
    background: ${props => props.$primary ? '#ff8c1a' : (props.$danger ? NEXUS.danger : NEXUS.surface)};
    color: ${props => (props.$primary || props.$danger) ? '#fff' : NEXUS.accent};
    box-shadow: 0 4px 12px ${props => props.$primary ? `${NEXUS.primary}44` : (props.$danger ? `${NEXUS.danger}33` : 'rgba(0,0,0,0.2)')};
  }
  
  &:active { transform: translateY(0); }
  
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const SignalTower = () => {
    const [broadcasts, setBroadcasts] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [newType, setNewType] = useState('info');
    const [targetRoles, setTargetRoles] = useState(['admin', 'licenciada', 'mentora']);
    const [isBlocking, setIsBlocking] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isTransmitting, setIsTransmitting] = useState(false);

    const applyPreset = (preset) => {
        setNewTitle(preset.title);
        setNewMessage(preset.message);
        setNewType(preset.type);
        setIsBlocking(preset.is_blocking === 1);
    };

    const loadBroadcasts = async () => {
        try {
            const res = await api.nexus.getBroadcasts(); // v1 returns { all_broadcasts: [...] }
            if (res && res.all_broadcasts) {
                setBroadcasts(res.all_broadcasts);
            }
        } catch (e) {
            console.error('Signal interference:', e);
        }
    };

    useEffect(() => { loadBroadcasts(); }, []);

    const handleCreate = async () => {
        if (!newTitle || !newMessage) {
            alert('❌ Título e mensagem são obrigatórios');
            return;
        }
        setIsTransmitting(true);
        try {
            await api.nexus.manageBroadcast({
                action: 'create',
                title: newTitle,
                message: newMessage,
                type: newType,
                target_roles: targetRoles,
                is_blocking: isBlocking ? 1 : 0
            });
            setNewTitle('');
            setNewMessage('');
            setIsBlocking(false);
            loadBroadcasts();
        } catch (e) {
            alert('❌ Falha na transmissão');
        } finally {
            setIsTransmitting(false);
        }
    };

    const filteredBroadcasts = broadcasts.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || b.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleToggle = async (id) => {
        await api.nexus.manageBroadcast({ action: 'toggle', id });
        loadBroadcasts();
    };

    const handleDelete = async (id) => {
        if (!confirm('Cortar sinal permanentemente?')) return;
        try {
            await api.nexus.deleteBroadcast(id);
            loadBroadcasts();
        } catch (e) {
            alert('❌ Erro ao deletar');
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <div style={{ background: NEXUS.primary, padding: '12px', borderRadius: '12px' }}>
                    <Megaphone size={32} color="#000" />
                </div>
                <div>
                    <h1 style={{ color: NEXUS.text, margin: 0, fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Signal Tower</h1>
                    <p style={{ color: NEXUS.textSec, margin: 0, fontSize: '0.9rem' }}>Centro de Operações de Transmissão Nexus</p>
                </div>
            </div>

            <ControlPanel>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: NEXUS.primary, margin: 0, textTransform: 'uppercase', fontSize: '1rem', letterSpacing: '1px' }}>Broadcast Command</h3>
                    <select
                        onChange={(e) => {
                            const preset = PRESETS.find(p => p.title === e.target.value);
                            if (preset) applyPreset(preset);
                        }}
                        defaultValue=""
                        style={{ padding: '6px 12px', fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8 }}
                    >
                        <option value="" disabled>Selecione um Preset...</option>
                        {PRESETS.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
                    </select>
                </div>

                <InputGroup>
                    <div className="row">
                        <div className="field" style={{ flex: '0 0 200px' }}>
                            <label>Signal Type</label>
                            <select value={newType} onChange={e => setNewType(e.target.value)}>
                                <option value="info">Info (Standard)</option>
                                <option value="warning">Warning (Maintenance)</option>
                                <option value="alert">Alert (Emergency)</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Signal Title</label>
                            <input
                                type="text"
                                placeholder="Ex: Atualização Importante"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>Transmission Message</label>
                        <textarea
                            placeholder="Descreva o comunicado..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ color: NEXUS.textSec, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={targetRoles.includes('admin')} onChange={e => e.target.checked ? setTargetRoles([...targetRoles, 'admin']) : setTargetRoles(targetRoles.filter(r => r !== 'admin'))} /> ADM
                            </label>
                            <label style={{ color: NEXUS.textSec, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={targetRoles.includes('licenciada')} onChange={e => e.target.checked ? setTargetRoles([...targetRoles, 'licenciada']) : setTargetRoles(targetRoles.filter(r => r !== 'licenciada'))} /> LIC
                            </label>
                            <label style={{ color: NEXUS.textSec, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={targetRoles.includes('mentora')} onChange={e => e.target.checked ? setTargetRoles([...targetRoles, 'mentora']) : setTargetRoles(targetRoles.filter(r => r !== 'mentora'))} /> MEN
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <label style={{ color: isBlocking ? NEXUS.danger : NEXUS.textSec, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800 }}>
                                <input type="checkbox" checked={isBlocking} onChange={e => setIsBlocking(e.target.checked)} /> ⚠️ BLOCKING MODE
                            </label>
                            <Button $primary onClick={handleCreate} disabled={isTransmitting}>
                                <Power size={18} /> {isTransmitting ? 'Transmitting...' : 'Initiate Broadcast'}
                            </Button>
                        </div>
                    </div>
                </InputGroup>
            </ControlPanel>

            <FilterBar>
                <div className="search">
                    <input
                        type="text"
                        placeholder="Pesquisar transmissões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    {['all', 'info', 'warning', 'alert'].map(type => (
                        <Button
                            key={type}
                            style={{
                                padding: '6px 12px',
                                minHeight: 'auto',
                                borderColor: filterType === type ? NEXUS.primary : NEXUS.border,
                                color: filterType === type ? NEXUS.primary : NEXUS.textSec
                            }}
                            onClick={() => setFilterType(type)}
                        >
                            {type}
                        </Button>
                    ))}
                </div>
            </FilterBar>

            <BroadcastList>
                {filteredBroadcasts.map(b => (
                    <BroadcastItem key={b.id} $active={b.is_active == 1}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <Badge $type={b.type}>{b.type}</Badge>
                                {b.is_blocking == 1 && <Badge $type="alert" style={{ background: NEXUS.danger, color: '#000' }}>URGENTE</Badge>}
                                <div style={{ color: NEXUS.text, fontWeight: 900, fontSize: '1.1rem' }}>{b.title}</div>
                            </div>
                            <div style={{ color: NEXUS.textSec, fontSize: '0.9rem', lineHeight: '1.6' }}>{b.message}</div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '12px', display: 'flex', gap: '15px' }}>
                                <span>🕒 {new Date(b.created_at).toLocaleString()}</span>
                                <span>🎯 Target: {Array.isArray(JSON.parse(b.target_roles || '[]')) ? JSON.parse(b.target_roles).join(', ') : 'All'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                onClick={() => handleToggle(b.id)}
                                style={{
                                    color: b.is_active == 1 ? NEXUS.danger : NEXUS.accent,
                                    borderColor: b.is_active == 1 ? NEXUS.danger : NEXUS.accent
                                }}
                            >
                                <Power size={14} /> {b.is_active == 1 ? 'Kill' : 'Restore'}
                            </Button>
                            <Button $danger onClick={() => handleDelete(b.id)}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </BroadcastItem>
                ))}
                {filteredBroadcasts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px', color: NEXUS.textSec, background: NEXUS.surface, borderRadius: '12px', border: `1px dashed ${NEXUS.border}` }}>
                        Nenhuma transmissão encontrada com os filtros atuais.
                    </div>
                )}
            </BroadcastList>
        </div>
    );
};

export default SignalTower;
