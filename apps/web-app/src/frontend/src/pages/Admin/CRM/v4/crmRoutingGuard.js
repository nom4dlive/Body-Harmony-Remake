/**
 * Body Harmony Nexus CRM V4 — Routing & Hash Guard (PLAN-206)
 * Single Source of Truth (SSOT) para resolução determinística de abas e sub-seções no CRM.
 */

export const CRM_TABS = {
  INBOX: 'INBOX',
  KANBAN: 'KANBAN',
  SETTINGS: 'SETTINGS'
};

export const SETTINGS_SECTIONS = [
  'HERMES',
  'CHANNELS',
  'TEAM',
  'GOOGLE',
  'ANALYTICS',
  'COLORS'
];

export const HASH_SECTION_MAP = {
  'settings-hermes': 'HERMES',
  'settings-channels': 'CHANNELS',
  'settings-team': 'TEAM',
  'settings-google': 'GOOGLE',
  'settings-analytics': 'ANALYTICS',
  'settings-colors': 'COLORS',
  'settings_hermes': 'HERMES',
  'settings_channels': 'CHANNELS',
  'settings_team': 'TEAM',
  'settings_google': 'GOOGLE',
  'settings_analytics': 'ANALYTICS',
  'settings_colors': 'COLORS',
  'hermes': 'HERMES',
  'channels': 'CHANNELS',
  'team': 'TEAM',
  'google': 'GOOGLE',
  'analytics': 'ANALYTICS',
  'colors': 'COLORS'
};

/**
 * Normaliza qualquer string de hash (ex: "#settings-google", "settings-google", "#KANBAN")
 */
export function sanitizeHash(rawHash) {
  if (!rawHash || typeof rawHash !== 'string') return '';
  return rawHash.replace(/^[#/]+/, '').trim().toLowerCase();
}

/**
 * Resolve a aba principal do CRM (INBOX, KANBAN, SETTINGS) a partir do hash
 */
export function resolveCrmTab(rawHash) {
  const clean = sanitizeHash(rawHash);
  if (!clean) return CRM_TABS.INBOX;

  if (clean === 'kanban') {
    return CRM_TABS.KANBAN;
  }

  if (
    clean === 'settings' ||
    clean.startsWith('settings-') ||
    clean.startsWith('settings_') ||
    Object.prototype.hasOwnProperty.call(HASH_SECTION_MAP, clean)
  ) {
    return CRM_TABS.SETTINGS;
  }

  if (clean === 'inbox') {
    return CRM_TABS.INBOX;
  }

  return CRM_TABS.INBOX;
}

/**
 * Resolve a sub-seção do painel de configurações a partir do hash
 */
export function resolveSettingsSection(rawHash) {
  const clean = sanitizeHash(rawHash);
  if (!clean) return 'HERMES';

  if (HASH_SECTION_MAP[clean]) {
    return HASH_SECTION_MAP[clean];
  }

  // Tentar extrair sufixo caso venha como "settings-algo"
  if (clean.startsWith('settings-') || clean.startsWith('settings_')) {
    const sub = clean.replace(/^settings[-_]/, '');
    if (HASH_SECTION_MAP[sub]) {
      return HASH_SECTION_MAP[sub];
    }
  }

  return 'HERMES';
}

/**
 * Formata a hash canônica para uma sub-seção de configuração
 */
export function formatSettingsHash(section) {
  if (!section) return 'settings';
  const sec = String(section).toLowerCase();
  return `settings-${sec}`;
}

/**
 * Resolve simultaneamente aba e sub-seção
 */
export function resolveCrmWorkspaceRouting(rawHash) {
  return {
    activeTab: resolveCrmTab(rawHash),
    activeSettingsSection: resolveSettingsSection(rawHash)
  };
}
