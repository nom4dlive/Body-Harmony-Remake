import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });

        // 🛡️ Auto-Recovery for Dynamic Chunk Mismatches
        const isChunkError = 
            error?.message?.includes('Failed to fetch dynamically imported module') ||
            error?.message?.includes('Importing a module script failed') ||
            error?.message?.includes('error loading dynamically imported module') ||
            error?.message?.includes('ChunkLoadError');

        if (isChunkError) {
            const lastReload = parseInt(window.sessionStorage.getItem('bh_eb_chunk_reload') || '0', 10);
            const now = Date.now();
            if (now - lastReload > 15000) {
                console.warn('[ErrorBoundary] Stale chunk mismatch detected. Auto-reloading to fresh version...');
                window.sessionStorage.setItem('bh_eb_chunk_reload', now.toString());
                setTimeout(() => {
                    window.location.reload();
                }, 150);
            }
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
        window.sessionStorage.removeItem('bh_eb_chunk_reload');
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isChunkError = 
                this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
                this.state.error?.message?.includes('Importing a module script failed') ||
                this.state.error?.message?.includes('error loading dynamically imported module');

            return (
                <div style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    fontFamily: 'sans-serif',
                    color: '#0A3E60',
                    maxWidth: '620px',
                    margin: '0 auto',
                    marginTop: '8vh',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 30px rgba(10, 62, 96, 0.12)'
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: isChunkError ? 'rgba(237, 126, 19, 0.15)' : '#FEE2E2',
                        color: isChunkError ? '#ED7E13' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        margin: '0 auto 1rem auto'
                    }}>
                        {isChunkError ? '✨' : '⚠️'}
                    </div>
                    <h2 style={{ color: '#0A3E60', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                        {isChunkError ? 'Nova Versão do Sistema Disponível' : 'Inconsistência de Execução'}
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
                        {isChunkError 
                            ? 'Uma atualização foi publicada em produção. Recarregando os módulos para a versão mais recente...' 
                            : 'Ocorreu um erro pontual na interface. Sua conta permanece autenticada.'}
                    </p>

                    <div style={{
                        background: '#F8FAFC',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'left',
                        overflow: 'auto',
                        marginBottom: '1.5rem',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.82rem'
                    }}>
                        <code style={{ color: '#DC2626', fontWeight: 700 }}>
                            {this.state.error && this.state.error.toString()}
                        </code>
                        {this.state.errorInfo && (
                            <details style={{ marginTop: '0.75rem', cursor: 'pointer', color: '#475569' }}>
                                <summary style={{ fontWeight: 700 }}>Detalhes Técnicos</summary>
                                <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748B' }}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                background: '#0A3E60',
                                color: 'white',
                                border: 'none',
                                padding: '10px 22px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: 700
                            }}
                        >
                            Tentar Novamente
                        </button>
                        <button
                            onClick={this.handleReload}
                            style={{
                                background: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: 700
                            }}
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
