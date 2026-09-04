import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { api } from '../../../services/api'
import { ShieldOff } from 'lucide-react'

const Panel  = styled.div`padding:16px 24px;border-top:1px solid #1a1a1a;`
const Title  = styled.div`color:#555;font-size:0.75rem;text-transform:uppercase;margin-bottom:12px;letter-spacing:0.05em;`
const DevRow = styled.div`
  display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:center;
  padding:8px 0;border-bottom:1px solid #1a1a1a;&:last-child{border-bottom:none;}
  font-size:0.78rem;font-family:monospace;
`
const Pill   = styled.span`padding:2px 8px;border-radius:3px;font-size:0.7rem;font-weight:700;
  background:${({$active})=>$active?'#1b3a1b':'#2a2a2a'};
  color:${({$active})=>$active?'#4caf50':'#666'};
`
const RevokeBtn = styled.button`
  background:none;border:1px solid #b71c1c;color:#ef9a9a;padding:4px 10px;
  border-radius:4px;cursor:pointer;font-size:0.75rem;display:flex;align-items:center;gap:4px;
  &:hover{background:#c62828;color:#fff;border-color:#c62828;}
`
const tokenPreview = (t) => t ? `${t.slice(0,8)}...${t.slice(-6)}` : '—'

export default function AlunaDevicePanel({ alunaId, alunaName, onRevokeAll }) {
  const [devices, setDevices]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.admin.alunas.accesses(alunaId)
      .then(() => {
        // Usa fetch direto via request para a tabela de devices — endpoint personalizado
        return api.get(`/v1/admin/alunas/${alunaId}/devices`).catch(() => [])
      })
      .catch(() => [])
      .finally(() => setLoading(false))
  }, [alunaId])

  // Fallback: usa os dados mínimos mostrados pela tela
  useEffect(() => {
    api.get(`/v1/admin/alunas/${alunaId}/devices`)
      .then(data => setDevices(Array.isArray(data) ? data : []))
      .catch(() => setDevices([]))
      .finally(() => setLoading(false))
  }, [alunaId])

  return (
    <Panel>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <Title>📱 Dispositivos de #{alunaId} — {alunaName}</Title>
        <RevokeBtn onClick={onRevokeAll}>
          <ShieldOff size={12} /> Revogar todos
        </RevokeBtn>
      </div>

      {loading ? (
        <div style={{ color:'#555', fontSize:'0.8rem', padding:'8px 0' }}>Carregando dispositivos...</div>
      ) : devices.length === 0 ? (
        <div style={{ color:'#444', fontSize:'0.8rem', padding:'8px 0' }}>
          Nenhum dispositivo registrado — ou utilize o botão "Revogar todos" acima.
        </div>
      ) : (
        <>
          <DevRow style={{ color:'#555', borderBottom:'1px solid #1a1a1a', marginBottom:4 }}>
            <span>TOKEN</span><span>IP</span><span>ÚLTIMO USO</span><span>STATUS</span>
          </DevRow>
          {devices.map(d => (
            <DevRow key={d.id} id={`device-row-${d.id}`}>
              <span title={d.device_token} style={{ color:'#888' }}>{tokenPreview(d.device_token)}</span>
              <span style={{ color:'#666' }}>{d.ip_address || '—'}</span>
              <span style={{ color:'#666' }}>{d.last_used_at ? new Date(d.last_used_at).toLocaleString('pt-BR') : '—'}</span>
              <Pill $active={d.is_active == 1}>{d.is_active == 1 ? 'ATIVO' : 'REVOGADO'}</Pill>
            </DevRow>
          ))}
        </>
      )}
    </Panel>
  )
}
