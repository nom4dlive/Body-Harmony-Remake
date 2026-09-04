import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { RefreshCw, FileText, AlertTriangle, CheckCircle, Shield, Download } from 'lucide-react';

const ForensicsLogsTable = ({ onSelectHash }) => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.nexus.getForensicsLogs();
            setLogs(response.logs || (Array.isArray(response) ? response : []));
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && logs.length === 0) return <div className="p-4 text-center text-gray-400">Carregando logs recentes...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Erro: {error}</div>;

    return (
        <div className="bg-[#050A10]/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-gradient-to-r from-black/20 to-transparent">
                <h3 className="text-gold font-cinzel text-lg tracking-widest flex items-center gap-3">
                    <div className="p-2 bg-gold/10 rounded-lg">
                        <Shield size={20} className="text-gold" />
                    </div>
                    Downloads Recentes <span className="text-[10px] text-white/30 font-sans tracking-normal opacity-50 ml-2">(Forensics Audit)</span>
                </h3>
                <button
                    onClick={fetchLogs}
                    className="group p-2 hover:bg-gold/10 rounded-xl transition-all duration-300 border border-transparent hover:border-gold/20"
                    title="Atualizar Logs"
                >
                    <RefreshCw size={18} className={`${loading ? "animate-spin text-gold" : "text-gray-500 group-hover:text-gold"} transition-colors`} />
                </button>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-[10px] text-white/40 uppercase tracking-[0.2em] bg-black/40 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Data/Hora</th>
                            <th className="px-6 py-4 font-semibold">Licenciada</th>
                            <th className="px-6 py-4 font-semibold">Arquivo</th>
                            <th className="px-6 py-4 font-semibold text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {logs.map((log) => (
                            <tr
                                key={log.id}
                                className="group hover:bg-gold/[0.02] transition-all duration-300 cursor-pointer"
                                onClick={() => onSelectHash && onSelectHash(log.file_hash)}
                            >
                                <td className="px-6 py-4">
                                    {log.action === 'DOWNLOAD_PROTECTED' ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                                <CheckCircle size={10} /> Protegido
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                                            <AlertTriangle size={10} /> RAW (Fallback)
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white/80 font-mono text-xs">
                                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-white/30 text-[10px] font-mono mt-0.5">
                                        {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium group-hover:text-gold transition-colors">{log.student_name}</div>
                                    <div className="text-[10px] text-white/30 font-mono tracking-tighter mt-0.5">{log.student_cpf}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-cyan-400/80 group-hover:text-cyan-400 transition-colors">
                                        <div className="p-1.5 bg-cyan-400/5 rounded border border-cyan-400/10">
                                            <FileText size={14} />
                                        </div>
                                        <span className="font-medium truncate max-w-[180px]" title={log.details?.file}>
                                            {log.details?.file || 'Arquivo Desconhecido'}
                                        </span>
                                    </div>
                                    {log.details?.error && (
                                        <div className="text-[9px] text-red-400/60 mt-1 flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                                            {log.details.error}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelectHash && onSelectHash(log.file_hash); }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gold text-white/50 hover:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border border-white/10 hover:border-gold group-hover:opacity-100 opacity-40 shadow-lg hover:shadow-gold/20"
                                    >
                                        <Shield size={12} /> Inspecionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center gap-4 border-t border-white/5 bg-black/20">
                        <div className="p-4 bg-white/5 rounded-full text-white/10">
                            <RefreshCw size={32} />
                        </div>
                        <p className="text-white/20 text-xs font-medium tracking-widest uppercase">
                            Nenhum download registrado nas últimas 24h.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForensicsLogsTable;
