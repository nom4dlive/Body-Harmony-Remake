import React from 'react';
import styled from 'styled-components';
import NexusLayout from '../NexusLayout';
import FaqEditor from './FaqEditor';
import { Database } from 'lucide-react';

const VaultDashboard = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ color: '#fff', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={28} /> The Vault // CMS
            </h1>

            <FaqEditor />

            {/* Future: GalleryManager */}
        </div>
    );
};

export default VaultDashboard;
