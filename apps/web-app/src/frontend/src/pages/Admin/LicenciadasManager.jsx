import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Edit, Trash2, Star, Sparkles, MapPin, Phone, MessageCircle 
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'
import AdminLayout from './components/AdminLayout'
import LicenciadaModal from './components/LicenciadaModal'
import LicenciadaDossierDrawer from '../../components/LicenciadaDossierDrawer'
import ResponsiveDataTable from '../../components/ui/ResponsiveDataTable'
import TableRowActionMenu from '../../components/ui/TableRowActionMenu'

// Styles
const PageWrapper = styled.div`
  padding: 1rem 1.25rem;
  max-width: 1300px;
  margin: 0 auto;
  padding-bottom: 90px;

  @media (max-width: 768px) {
    padding: 0.75rem;
    padding-bottom: 90px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.primary || '#0A3E60'};
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    justify-content: center;
    order: 1;
  }
`

const AddButton = styled.button`
  background: #ED7E13;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 42px;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);
  transition: all 0.15s ease;

  &:hover {
    background: #FF8F26;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.35);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    order: 3;
  }
`

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary || '#0A3E60'};
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  
  @media (max-width: 768px) {
    order: 2;
    text-align: center;
    font-size: 1.15rem;
  }
`

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #CBD5E1;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.08);
  }
`

export default function LicenciadasManager() {
  const { licenciadas, deleteLicenciada, addLicenciada, updateLicenciada, updateLicenciadaJSON, refreshData } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  // Dossier 360 State (PLAN-142)
  const [dossierLicenciadaId, setDossierLicenciadaId] = useState(null)
  const [isDossierOpen, setIsDossierOpen] = useState(false)

  const handleOpenDossier = (id) => {
    setDossierLicenciadaId(id)
    setIsDossierOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingStudent(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (licenciada) => {
    setEditingStudent(licenciada)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta licenciada?')) {
      deleteLicenciada(id)
    }
  }

  const handleSave = async (formData) => {
    if (editingStudent) {
      await updateLicenciada(editingStudent.id, formData)
    } else {
      await addLicenciada(formData)
    }
  }

  const columns = [
    {
      key: 'photo',
      label: 'Foto',
      width: '60px',
      render: (_, lic) => {
        const photoUrl = lic.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(lic.name || 'L')}&background=0A3E60&color=fff`;
        return (
          <AvatarImg
            src={photoUrl}
            alt={lic.name}
            onClick={() => handleOpenDossier(lic.id)}
            title="Abrir Dossiê 360º"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lic.name || 'L')}&background=0A3E60&color=fff`;
            }}
          />
        );
      }
    },
    {
      key: 'name',
      label: 'Nome da Licenciada',
      isTitle: true,
      truncate: true,
      maxWidth: '220px',
      render: (name, lic) => (
        <div
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          onClick={() => handleOpenDossier(lic.id)}
          title="Abrir Dossiê 360º"
        >
          <span style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.9rem' }}>{name}</span>
          <span style={{ fontSize: '0.72rem', color: '#ED7E13', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Sparkles size={11} /> Dossiê 360º
          </span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Cidade / UF',
      truncate: true,
      maxWidth: '180px',
      render: (_, lic) => (
        <span style={{ color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
          <MapPin size={13} color="#64748B" />
          {lic.location ? `${lic.location} / ` : ''}{lic.state || '—'}
        </span>
      )
    },
    {
      key: 'contact',
      label: 'Redes & Contato',
      truncate: true,
      maxWidth: '200px',
      render: (_, lic) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
          {lic.instagram && <span>@{lic.instagram.replace('@', '')}</span>}
          {lic.whatsapp && (
            <span style={{ color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <Phone size={12} /> {lic.whatsapp}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      isAction: true,
      width: '140px',
      render: (_, lic) => {
        const secondary = [
          {
            label: 'Editar Cadastro',
            icon: Edit,
            onClick: () => handleOpenEdit(lic)
          },
          {
            label: lic.pinned ? 'Desafixar do Topo' : 'Fixar no Topo',
            icon: Star,
            onClick: () => updateLicenciadaJSON(lic.id, { pinned: !lic.pinned })
          },
          {
            label: 'Excluir Licenciada',
            icon: Trash2,
            danger: true,
            onClick: () => handleDelete(lic.id)
          }
        ];

        return (
          <TableRowActionMenu
            primaryAction={{
              label: '360º',
              icon: Sparkles,
              variant: 'gold',
              onClick: () => handleOpenDossier(lic.id)
            }}
            secondaryActions={secondary}
          />
        );
      }
    }
  ];

  const renderMobileLicenciadaCard = (lic) => {
    const photoUrl = lic.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(lic.name || 'L')}&background=0A3E60&color=fff`;
    const cleanPhone = (lic.whatsapp || lic.phone || '').replace(/\D/g, '');

    return (
      <div
        key={lic.id}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          minHeight: '52px'
        }}
      >
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1, cursor: 'pointer' }}
          onClick={() => handleOpenDossier(lic.id)}
        >
          <img
            src={photoUrl}
            alt={lic.name}
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0A3E60', flexShrink: 0 }}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lic.name || 'L')}&background=0A3E60&color=fff`;
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#0A3E60', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lic.name}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
              <MapPin size={11} color="#ED7E13" /> {lic.location ? `${lic.location} / ` : ''}{lic.state || 'Brasil'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          {cleanPhone && (
            <a
              href={`https://wa.me/55${cleanPhone}?text=Olá%20${encodeURIComponent(lic.name)},%20tudo%20bem?`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
              title="Abrir WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          )}

          <button
            type="button"
            onClick={() => handleOpenDossier(lic.id)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: '8px',
              background: '#0A3E60',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              minHeight: '36px'
            }}
            title="Dossiê 360°"
          >
            <Sparkles size={13} color="#ED7E13" /> 360°
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}>
            <ArrowLeft size={16} /> Voltar ao Painel
          </BackLink>
          <PageTitle>Gerenciar Licenciadas</PageTitle>
          <AddButton onClick={handleOpenAdd}>
            <Plus size={16} /> Nova Licenciada
          </AddButton>
        </Header>

        <ResponsiveDataTable
          columns={columns}
          data={licenciadas || []}
          keyExtractor="id"
          renderMobileCard={renderMobileLicenciadaCard}
          emptyTitle="Nenhuma licenciada encontrada"
          emptyMessage="Cadastre novas unidades ou atualize a base de licenciadas."
        />
      </PageWrapper>

      <LicenciadaModal
        isOpen={isModalOpen}
        licenciada={editingStudent}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* LICENCIADA 360º DOSSIER (PLAN-142) */}
      <LicenciadaDossierDrawer
        licenciadaId={dossierLicenciadaId}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onUpdated={() => {
          if (refreshData) refreshData();
        }}
      />
    </AdminLayout>
  )
}
