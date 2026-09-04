import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { api } from '../../../services/api'

const spin   = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`
const Panel  = styled.div`padding:16px 24px;border-top:1px solid #1a1a1a;`
const Title  = styled.div`color:#555;font-size:0.75rem;text-transform:uppercase;margin-bottom:12px;letter-spacing:0.05em;`
const ModRow = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 0;border-bottom:1px solid #1a1a1a;&:last-child{border-bottom:none;}
`
const ModTitle = styled.span`font-size:0.88rem;color:#ccc;font-weight:600;flex:1;`
const Toggle   = styled.button`
  padding:4px 14px;border-radius:4px;font-size:0.75rem;font-weight:700;cursor:pointer;
  background:${({$granted})=>$granted?'#3a1b1b':'#1b3a1b'};
  border:1px solid ${({$granted})=>$granted?'#b71c1c':'#2e7d32'};
  color:${({$granted})=>$granted?'#ef9a9a':'#66bb6a'};
  &:hover{opacity:0.8;}&:disabled{opacity:0.4;}
`
const Spinner = styled.div`width:12px;height:12px;border:2px solid #333;border-top-color:#ED7E13;border-radius:50%;animation:${spin} 0.6s linear infinite;display:inline-block;`
const Info     = styled.span`color:#555;font-size:0.78rem;margin-right:10px;`
const Empty    = styled.div`color:#444;font-size:0.8rem;padding:8px 0;`

export default function NexusAlunaAccessPanel({ alunaId, alunaName, onAccessChanged }) {
  const [modules, setModules]   = useState([])
  const [granted, setGranted]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [working, setWorking]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [mods, accesses] = await Promise.all([
          api.get('/v1/admin/lms/modules'),
          api.admin.alunas.accesses(alunaId),
        ])
        setModules(Array.isArray(mods) ? mods : mods?.modules || [])
        setGranted((Array.isArray(accesses) ? accesses : []).map(a => a.module_id))
      } catch { /* silence */ }
      finally { setLoading(false) }
    }
    load()
  }, [alunaId])

  const toggle = async (moduleId) => {
    setWorking(moduleId)
    try {
      if (granted.includes(moduleId)) {
        await api.admin.alunas.revokeAccess(alunaId, moduleId)
        setGranted(p => p.filter(id => id !== moduleId))
      } else {
        await api.admin.alunas.grantAccess(alunaId, { module_id: moduleId })
        setGranted(p => [...p, moduleId])
      }
      onAccessChanged?.()
    } catch { /* silence */ }
    finally { setWorking(null) }
  }

  return (
    <Panel>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <Title>📚 Cursos — {alunaName}</Title>
        <Info>{granted.length}/{modules.length} liberados</Info>
      </div>
      {loading ? (
        <Empty><Spinner /> Carregando módulos...</Empty>
      ) : modules.length === 0 ? (
        <Empty>Nenhum módulo cadastrado no LMS.</Empty>
      ) : modules.map(m => (
        <ModRow key={m.id}>
          <ModTitle>{m.title}</ModTitle>
          <Toggle
            $granted={granted.includes(m.id)}
            onClick={() => toggle(m.id)}
            disabled={working === m.id}
          >
            {working === m.id
              ? <Spinner />
              : granted.includes(m.id) ? '✕ Revogar' : '+ Conceder'
            }
          </Toggle>
        </ModRow>
      ))}
    </Panel>
  )
}
