import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import { api } from '../../services/api'
import styled, { keyframes } from 'styled-components'
import AlunaHeader from '../../components/PortalAluna/AlunaHeader'

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`
const Page   = styled.div`min-height:100vh;background:#0A3E60;font-family:'Montserrat',sans-serif;color:#fff;`
const Main   = styled.main`max-width:800px;margin:0 auto;padding:2.5rem 1.5rem;`
const Title  = styled.h1`color:#fff;font-size:1.5rem;font-weight:700;margin:0 0 2rem;`
const Card   = styled.div`background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:1.25rem;padding:1.5rem;animation:${fadeIn} 0.3s ease;`
const Empty  = styled.div`text-align:center;padding:4rem 2rem;opacity:0.5;p{margin:0.5rem 0;color:#fff;}`
const CertRow= styled.div`
  display:flex;align-items:center;gap:1rem;padding:1rem 0;
  &:not(:last-child){border-bottom:1px solid rgba(255,255,255,0.06);}
`
const CertIcon = styled.div`
  width:50px;height:50px;border-radius:50%;background:rgba(237,126,19,0.15);
  border:2px solid rgba(237,126,19,0.3);display:flex;align-items:center;justify-content:center;
  font-size:1.4rem;flex-shrink:0;
`
const CertInfo = styled.div`flex:1;h3{color:#fff;font-size:0.95rem;font-weight:700;margin:0 0 0.25rem;}span{font-size:0.75rem;color:rgba(255,255,255,0.4);}`
const DownBtn  = styled.a`
  background:rgba(237,126,19,0.15);border:1px solid rgba(237,126,19,0.3);color:#ED7E13;
  border-radius:0.6rem;padding:0.45rem 1rem;text-decoration:none;font-size:0.8rem;font-weight:700;
  &:hover{background:rgba(237,126,19,0.25);}
`

export default function AlunaCertificates() {
  const { aluna }  = useAlunaAuth()
  const navigate   = useNavigate()
  const [certs, setCerts]     = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const mods = await api.aluna.getModules()
        setModules(mods || [])
        // Verifica/gera certificados para módulos 100% concluídos
        const certList = []
        for (const m of (mods || [])) {
          if (m.progress_percent === 100) {
            const res = await api.aluna.getCertificate(m.id).catch(() => null)
            if (res?.certificate) certList.push({ ...res.certificate, module_id: m.id, module_title: m.title })
          }
        }
        setCerts(certList)
      } catch {
        // silêncio — exibe vazio
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Page>
      <AlunaHeader />
      <Main>
        <Title>🏆 Meus Certificados</Title>
        {loading ? (
          <Card><p style={{ opacity:0.5, textAlign:'center' }}>Buscando certificados...</p></Card>
        ) : certs.length === 0 ? (
          <Card>
            <Empty>
              <p style={{ fontSize:'2.5rem' }}>📜</p>
              <p>Nenhum certificado ainda.</p>
              <p style={{ fontSize:'0.8rem' }}>Conclua 100% das aulas de um curso para receber seu certificado.</p>
            </Empty>
          </Card>
        ) : (
          <Card>
            {certs.map(c => (
              <CertRow key={c.id}>
                <CertIcon>🎓</CertIcon>
                <CertInfo>
                  <h3>{c.module_title}</h3>
                  <span>Emitido em {new Date(c.issued_at).toLocaleDateString('pt-BR')}</span>
                </CertInfo>
                <DownBtn
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      await api.generateCertificate(c.module_id);
                    } catch (err) {
                      alert('Erro ao baixar o certificado.');
                    }
                  }}
                  href="#"
                >
                  Baixar PDF
                </DownBtn>
              </CertRow>
            ))}
          </Card>
        )}
      </Main>
    </Page>
  )
}
