import React from 'react';
import { FaFilePdf, FaFileArchive, FaFileImage, FaTrash, FaCheck, FaTimes, FaUsers, FaDownload } from 'react-icons/fa';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  
  &:hover {
    border-color: #0A3E60;
    box-shadow: 0 4px 12px rgba(10, 62, 96, 0.05);
  }
`;

const StatusBadge = styled.span`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
  background: ${props => {
        if (props.$status === 'approved') return '#e6f4ea';
        if (props.$status === 'rejected') return '#fce8e6';
        return '#fef7e0';
    }};
  color: ${props => {
        if (props.$status === 'approved') return '#1e8e3e';
        if (props.$status === 'rejected') return '#d93025';
        return '#f29900';
    }};
`;

const CategoryBadge = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: #0A3E60;
  background: #f0f7ff;
  padding: 1px 6px;
  border-radius: 4px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 1px solid #cbd5e1;

  .text-red-500 {
    color: #ef4444;
  }
  .text-orange-500 {
    color: #f97316;
  }
  .text-blue-500 {
    color: #3b82f6;
  }
  .text-gray-400 {
    color: #94a3b8;
  }
`;

const TitleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  h4 {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.875rem;
    line-height: 1.25;
    margin: 0;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
      font-size: 10px;
      color: #94a3b8;
      font-weight: 500;
    }
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #cbd5e1;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
`;

const FooterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ApproveBtn = styled.button`
  padding: 0.375rem;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #dcfce7;
  }
`;

const RejectBtn = styled.button`
  padding: 0.375rem;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

const DistributeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  background: #ED7E1333;
  color: #ED7E13;
  border-radius: 6px;
  border: 1px solid #ED7E1333;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ED7E1355;
  }
`;

const DownloadBtn = styled.button`
  padding: 0.375rem;
  color: #94a3b8;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #0A3E60;
    background: #f8fafc;
  }
`;

const DeleteBtn = styled.button`
  padding: 0.375rem;
  color: #cbd5e1;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
`;

const ResourceCard = ({ resource, onApprove, onReject, onGrant, onDelete }) => {
    const getIcon = (type) => {
        if (type?.includes('pdf')) return <FaFilePdf className="text-red-500" />;
        if (type?.includes('zip') || type?.includes('rar')) return <FaFileArchive className="text-orange-500" />;
        if (type?.includes('image')) return <FaFileImage className="text-blue-500" />;
        return <FaFilePdf className="text-gray-400" />;
    };

    const fileSize = (bytes) => {
        if (!bytes) return '0 KB';
        const kb = bytes / 1024;
        return kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';
    };

    return (
        <Card>
            <CardHeader>
                <HeaderLeft>
                    <IconWrapper>
                        {getIcon(resource.file_type)}
                    </IconWrapper>
                    <TitleInfo>
                        <h4>{resource.title}</h4>
                        <div className="meta">
                            <CategoryBadge>{resource.category}</CategoryBadge>
                            <span>
                                {resource.file_type.split('/')[1]?.toUpperCase() || 'FILE'} • {fileSize(resource.size_bytes)}
                            </span>
                        </div>
                    </TitleInfo>
                </HeaderLeft>
                <StatusBadge $status={resource.status}>{resource.status}</StatusBadge>
            </CardHeader>

            <CardFooter>
                <FooterGroup>
                    {resource.status === 'pending' && (
                        <>
                            <ApproveBtn
                                onClick={() => onApprove(resource.id)}
                                title="Aprovar"
                            >
                                <FaCheck size={12} />
                            </ApproveBtn>
                            <RejectBtn
                                onClick={() => onReject(resource.id)}
                                title="Rejeitar"
                            >
                                <FaTimes size={12} />
                            </RejectBtn>
                        </>
                    )}
                    {resource.status === 'approved' && (
                        <DistributeBtn
                            onClick={() => onGrant(resource)}
                        >
                            <FaUsers size={12} /> DISTRIBUIR
                        </DistributeBtn>
                    )}
                </FooterGroup>

                <FooterGroup>
                    <DownloadBtn
                        onClick={() => window.open(`${import.meta.env.VITE_API_BASE || '/api'}/../${resource.file_path}`, '_blank')}
                        title="Ver / Download"
                    >
                        <FaDownload size={14} />
                    </DownloadBtn>
                    <DeleteBtn
                        onClick={() => onDelete(resource.id)}
                        title="Excluir"
                    >
                        <FaTrash size={14} />
                    </DeleteBtn>
                </FooterGroup>
            </CardFooter>
        </Card>
    );
};

export default ResourceCard;
