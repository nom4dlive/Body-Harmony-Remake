import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import AlunaLessonPlayer from '../src/pages/PortalAluna/AlunaLessonPlayer';
import { api } from '../src/services/api';

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock da fila de progresso
vi.mock('../src/hooks/useProgressQueue', () => ({
    useProgressQueue: () => ({
        saveProgress: vi.fn()
    })
}));

// Mock dos serviços de API
vi.mock('../src/services/api', () => ({
    api: {
        aluna: {
            signUrl: vi.fn(),
            getModules: vi.fn(),
            getLessons: vi.fn(),
            updateProgress: vi.fn()
        }
    }
}));

// Mock do hls.js no nível de módulo ES
vi.mock('hls.js', () => {
    return {
        default: class MockHls {
            static isSupported() { return true; }
            static Events = {
                MANIFEST_PARSED: 'manifestParsed',
                ERROR: 'hlsError'
            };
            static ErrorTypes = {
                NETWORK_ERROR: 'networkError',
                MEDIA_ERROR: 'mediaError'
            };
            constructor(options) {
                if (global.__onHlsConstructor) {
                    global.__onHlsConstructor(options);
                }
            }
            loadSource(src) {}
            attachMedia(media) {}
            recoverMediaError() {}
            on(event, handler) {
                if (global.__onHlsOn) {
                    global.__onHlsOn(event, handler);
                }
            }
            destroy() {}
        }
    };
});

describe('AlunaLessonPlayer - Teste de Resiliência HLS (PLAN-033/PLAN-034)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Reset callbacks globais de mock
        global.__onHlsConstructor = null;
        global.__onHlsOn = null;

        // Mock de respostas padrão da API
        api.aluna.signUrl.mockResolvedValue({
            url: 'https://cdn.test/lesson1.m3u8',
            is_hls: true
        });

        api.aluna.getModules.mockResolvedValue([
            { id: 10, title: 'Modulo 1' }
        ]);

        api.aluna.getLessons.mockResolvedValue({
            lessons: [
                {
                    id: 1,
                    title: 'Aula de Teste Resiliente',
                    video_ref: 'lessons/test.mp4',
                    is_completed: false,
                    progress_percent: 0
                }
            ]
        });
    });

    it('deve inicializar o Hls.js com buffers otimizados e sem lowLatencyMode', async () => {
        let instantiatedOptions = null;
        global.__onHlsConstructor = (options) => {
            instantiatedOptions = options;
        };

        await act(async () => {
            render(<AlunaLessonPlayer />);
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        expect(instantiatedOptions).not.toBeNull();
        expect(instantiatedOptions.maxBufferLength).toBe(30);
        expect(instantiatedOptions.maxMaxBufferLength).toBe(60);
        expect(instantiatedOptions.lowLatencyMode).toBeUndefined();
    });

    it('deve executar o fallback para stream.php após 3 falhas fatais de decodificação de mídia', async () => {
        let errorHandler = null;
        global.__onHlsOn = (event, handler) => {
            if (event === 'hlsError') {
                errorHandler = handler;
            }
        };

        // Mock para signUrl de fallback
        api.aluna.signUrl.mockImplementation(async (id, fallback) => {
            if (fallback) {
                return {
                    url: 'https://cdn.test/stream.php?lesson_id=1&signed=1',
                    is_hls: false
                };
            }
            return {
                url: 'https://cdn.test/lesson1.m3u8',
                is_hls: true
            };
        });

        await act(async () => {
            render(<AlunaLessonPlayer />);
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        expect(errorHandler).not.toBeNull();

        // Simular 3 MEDIA_ERROR fatais
        for (let i = 0; i < 3; i++) {
            await act(async () => {
                errorHandler('hlsError', {
                    fatal: true,
                    type: 'mediaError',
                    details: 'bufferStalledError'
                });
            });
        }

        // 4ª falha fatal de mídia -> Deve estourar o limite de 3 tentativas e chamar fallbackToStream
        await act(async () => {
            errorHandler('hlsError', {
                fatal: true,
                type: 'mediaError',
                details: 'bufferStalledError'
            });
        });

        expect(api.aluna.signUrl).toHaveBeenCalledWith(1, true);
    });
});
