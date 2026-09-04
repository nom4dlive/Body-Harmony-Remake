import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global do Hls.js para evitar quebras nos testes do Player
class MockHls {
    static isSupported() { return true; }
    loadSource() {}
    attachMedia() {}
    on() {}
    destroy() {}
}

global.Hls = MockHls;

// Mock de localStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) { return store[key] || null; },
        setItem: function (key, value) { store[key] = value.toString(); },
        removeItem: function (key) { delete store[key]; },
        clear: function () { store = {}; }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
