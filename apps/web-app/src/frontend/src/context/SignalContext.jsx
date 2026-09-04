import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useLicenciadaAuth } from './LicenciadaAuthContext';
import { useAlunaAuth } from './AlunaAuthContext';

const SignalContext = createContext();

export const SignalProvider = ({ children }) => {
    const [signals, setSignals] = useState([]);
    const [history, setHistory] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [lastCheck, setLastCheck] = useState(0);
    const { student, loading: authLoading } = useLicenciadaAuth();
    const { aluna, loading: alunaLoading } = useAlunaAuth();

    const currentUser = student || aluna;
    const loading = authLoading || alunaLoading;

    const fetchSignals = useCallback(async () => {
        const isAluna = !!aluna || localStorage.getItem('bh_aluna_token') || window.location.pathname.startsWith('/portal-aluna');
        if (!currentUser || isAluna) return;

        try {
            const res = await api.nexus.getActiveBroadcasts();
            if (res && res.broadcasts) {
                setSignals(res.broadcasts);
                setLastCheck(Date.now());
            }

            const histRes = await api.nexus.getBroadcastHistory();
            if (histRes && histRes.history) {
                setHistory(histRes.history);
            }
        } catch (e) {
            console.error('[SignalContext] Failed to fetch signals:', e);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!loading && currentUser) {
            fetchSignals();
            // Polling inteligente: a cada 5 minutos
            const interval = setInterval(fetchSignals, 300000);
            return () => clearInterval(interval);
        }
    }, [fetchSignals, loading, currentUser]);

    const acknowledge = async (signalId) => {
        try {
            await api.nexus.acknowledgeBroadcast(signalId);
            setSignals(prev => prev.filter(s => s.id !== signalId));
            setHistory(prev => prev.map(s => s.id === signalId ? { ...s, is_read: true } : s));
        } catch (e) {
            console.error('[SignalContext] Failed to acknowledge signal:', e);
            setSignals(prev => prev.filter(s => s.id !== signalId));
            setHistory(prev => prev.map(s => s.id === signalId ? { ...s, is_read: true } : s));
        }
    };

    const unreadCount = signals.length;

    return (
        <SignalContext.Provider value={{
            signals,
            history,
            unreadCount,
            isDrawerOpen,
            setIsDrawerOpen,
            acknowledge,
            refresh: fetchSignals
        }}>
            {children}
        </SignalContext.Provider>
    );
};

export const useSignals = () => {
    const context = useContext(SignalContext);
    if (!context) {
        throw new Error('useSignals must be used within a SignalProvider');
    }
    return context;
};
