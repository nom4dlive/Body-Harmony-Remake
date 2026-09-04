import React from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';
import CRMWorkspaceV4 from './v4/CRMWorkspaceV4';

/**
 * Body Harmony CRM Hub Page (Nexus Protocol V4.0 - REGRA 60)
 * Delega 100% para o CRMWorkspaceV4 nativo envelopado por ErrorBoundary defensivo,
 * integrando os protótipos de alta fidelidade do Google Stitch.
 */
export default function CRMHubPage() {
  return (
    <ErrorBoundary>
      <CRMWorkspaceV4 />
    </ErrorBoundary>
  );
}

