/**
 * Body Harmony Nexus V3.1 — CRM Pure TopBar Quick-Tools, Slide-Over Drawer & Welcome Hub (PLAN-160)
 * Injetado via Nginx sub_filter em https://crm.bodyharmony.com.br
 */
(function () {
  'use strict';

  // =========================================================================
  // 1. GAVETA LATERAL DESLIZANTE (SLIDE-OVER DRAWER)
  // =========================================================================
  function createSlideOverDrawer() {
    if (document.getElementById('bh-crm-slideover')) return;

    const overlay = document.createElement('div');
    overlay.id = 'bh-crm-slideover-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(5, 26, 41, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999998;
      display: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    `;

    const drawer = document.createElement('div');
    drawer.id = 'bh-crm-slideover';
    drawer.style.cssText = `
      position: fixed;
      top: 38px;
      right: -680px;
      width: 650px;
      max-width: 90vw;
      height: calc(100vh - 38px);
      background: #FFFFFF;
      box-shadow: -5px 0 25px rgba(0, 0, 0, 0.35);
      border-left: 2px solid #ED7E13;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Outfit', 'Montserrat', sans-serif;
    `;

    drawer.innerHTML = `
      <div id="bh-slideover-header" style="
        background: linear-gradient(135deg, #0A3E60 0%, #072B44 100%);
        color: #FFFFFF;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #ED7E13;
      ">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span id="bh-slideover-icon" style="font-size: 1.1rem;">⚡</span>
          <strong id="bh-slideover-title" style="font-size: 0.95rem; font-weight: 800; color: #FFFFFF;">Ferramenta Rápida</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <a id="bh-slideover-ext-link" href="#" target="_blank" rel="noopener noreferrer" style="
            background: rgba(255,255,255,0.1);
            color: #E2E8F0;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.68rem;
            text-decoration: none;
            font-weight: 700;
          ">↗ Nova Aba</a>
          <button id="bh-slideover-close" style="
            background: transparent;
            border: none;
            color: #E2E8F0;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0 0.4rem;
            line-height: 1;
          ">✕</button>
        </div>
      </div>
      <iframe id="bh-slideover-iframe" src="about:blank" style="
        width: 100%;
        flex: 1;
        border: none;
        background: #F8FAFC;
      "></iframe>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    const closeBtn = drawer.querySelector('#bh-slideover-close');
    const closeDrawer = () => {
      drawer.style.right = '-680px';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        const frame = document.getElementById('bh-slideover-iframe');
        if (frame) frame.src = 'about:blank';
      }, 250);
    };

    closeBtn.onclick = closeDrawer;
    overlay.onclick = closeDrawer;

    window.openBhDrawer = (title, icon, url) => {
      const titleEl = document.getElementById('bh-slideover-title');
      const iconEl = document.getElementById('bh-slideover-icon');
      const frame = document.getElementById('bh-slideover-iframe');
      const extLink = document.getElementById('bh-slideover-ext-link');

      if (titleEl) titleEl.textContent = title;
      if (iconEl) iconEl.textContent = icon;
      if (extLink) extLink.href = url;
      if (frame) frame.src = url;

      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.style.opacity = '1';
        drawer.style.right = '0';
      }, 10);
    };
  }

  // =========================================================================
  // 2. TOPBAR INSTITUCIONAL FIXA (DESOBSTRUÍDA DE FILTROS)
  // =========================================================================
  function initBhTopBar() {
    if (document.getElementById('bh-crm-topbar-tools')) return;

    createSlideOverDrawer();

    const topBar = document.createElement('div');
    topBar.id = 'bh-crm-topbar-tools';
    topBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 38px;
      background: linear-gradient(90deg, #07131E 0%, #0A3E60 50%, #07131E 100%);
      border-bottom: 2px solid #ED7E13;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      font-family: 'Outfit', 'Montserrat', -apple-system, sans-serif;
      font-size: 0.72rem;
      color: #FFFFFF;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    `;

    // Lado Esquerdo: Identidade Institucional & Logo
    const leftBrand = document.createElement('div');
    leftBrand.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
    leftBrand.innerHTML = `
      <div style="
        width: 22px; 
        height: 22px; 
        border-radius: 6px; 
        background: #0A3E60; 
        border: 1px solid #ED7E13; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-weight: 900; 
        color: #ED7E13; 
        font-size: 0.65rem;
      ">BH</div>
      <span style="color: #ED7E13; font-weight: 800; letter-spacing: 0.5px;">BODY HARMONY</span>
      <span style="color: #64748B;">|</span>
      <span style="color: #94A3B8; font-weight: 600;">Central Oficial de Atendimento</span>
    `;

    // Centro: Botões de 1-Toque (Com suporte a Slide-Over)
    const centerTools = document.createElement('div');
    centerTools.style.cssText = 'display: flex; align-items: center; gap: 0.4rem;';

    const tools = [
      {
        icon: '💆',
        label: 'Agenda da Clínica',
        url: 'https://bodyharmony.com.br/portal-gestor/agenda',
        drawer: true
      },
      {
        icon: '📋',
        label: 'Fichas de Anamnese',
        url: 'https://bodyharmony.com.br/portal-gestor/onboarding',
        drawer: true
      },
      {
        icon: '👑',
        label: 'Dossiê 360º',
        url: 'https://bodyharmony.com.br/portal-gestor/licenciadas',
        drawer: true
      },
      {
        icon: '📊',
        label: 'Looker Studio',
        url: 'https://lookerstudio.google.com/',
        drawer: false
      }
    ];

    tools.forEach(tool => {
      const btn = document.createElement('a');
      btn.href = tool.url;
      if (!tool.drawer) {
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
      }
      btn.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.22rem 0.6rem;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(237, 126, 19, 0.25);
        color: #E2E8F0;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.68rem;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
      btn.onmouseenter = () => {
        btn.style.background = 'rgba(237, 126, 19, 0.25)';
        btn.style.borderColor = '#ED7E13';
        btn.style.color = '#FFFFFF';
      };
      btn.onmouseleave = () => {
        btn.style.background = 'rgba(255, 255, 255, 0.08)';
        btn.style.borderColor = 'rgba(237, 126, 19, 0.25)';
        btn.style.color = '#E2E8F0';
      };

      if (tool.drawer) {
        btn.onclick = (e) => {
          e.preventDefault();
          window.openBhDrawer(tool.label, tool.icon, tool.url);
        };
      }

      btn.innerHTML = `<span>${tool.icon}</span><span>${tool.label}</span>`;
      centerTools.appendChild(btn);
    });

    // Lado Direito: Status do Plantão Noturno Dra. Harmony IA
    const rightStatus = document.createElement('div');
    rightStatus.style.cssText = 'display: flex; align-items: center; gap: 0.4rem;';

    const now = new Date();
    const brHour = (now.getUTCHours() - 3 + 24) % 24;
    const brDay = now.getUTCDay();
    const isWeekend = brDay === 0 || brDay === 6;
    const isNight = brHour >= 18 || brHour < 8;
    const isAfterHours = isWeekend || isNight;

    rightStatus.innerHTML = `
      <span style="
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.2rem 0.55rem;
        border-radius: 12px;
        background: ${isAfterHours ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)'};
        color: ${isAfterHours ? '#C084FC' : '#34D399'};
        border: 1px solid ${isAfterHours ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.3)'};
        font-weight: 800;
        font-size: 0.65rem;
      ">
        <span>${isAfterHours ? '🌙' : '☀️'}</span>
        <span>${isAfterHours ? 'Plantão Dra. Harmony IA (Ativo)' : 'Expediente Humano (08h às 18h)'}</span>
      </span>
    `;

    topBar.appendChild(leftBrand);
    topBar.appendChild(centerTools);
    topBar.appendChild(rightStatus);

    document.body.appendChild(topBar);
  }

  // =========================================================================
  // 3. WELCOME HUB EXECUTIVO NO EMPTY STATE CENTRAL
  // =========================================================================
  function renderWelcomeHub() {
    const emptyStateEl = document.querySelector('.empty-state, .conversation--empty, div[class*="empty-state"]');
    if (!emptyStateEl || emptyStateEl.querySelector('#bh-welcome-hub')) return;

    const hub = document.createElement('div');
    hub.id = 'bh-welcome-hub';
    hub.style.cssText = `
      max-width: 640px;
      margin: 1.5rem auto;
      padding: 1.75rem;
      background: linear-gradient(135deg, #0A2234 0%, #07131E 100%);
      border: 1px solid rgba(237, 126, 19, 0.35);
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      color: #FFFFFF;
      font-family: 'Outfit', 'Montserrat', sans-serif;
      text-align: left;
    `;

    hub.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(237,126,19,0.3); padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="
            width: 38px; height: 38px; border-radius: 10px;
            background: linear-gradient(135deg, #0A3E60 0%, #071E2F 100%);
            border: 2px solid #ED7E13; display: flex; align-items: center;
            justify-content: center; font-weight: 900; color: #ED7E13; font-size: 1.1rem;
          ">BH</div>
          <div>
            <h2 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #FFFFFF;">Central de Mensagens & Atendimento</h2>
            <div style="font-size: 0.72rem; color: #94A3B8;">Selecione uma conversa ao lado para iniciar o atendimento</div>
          </div>
        </div>
        <span style="
          padding: 0.25rem 0.65rem; border-radius: 20px;
          background: rgba(16, 185, 129, 0.15); color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 800; font-size: 0.7rem;
        ">🟢 4 Linhas Online</span>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <div style="font-size: 0.72rem; font-weight: 800; color: #ED7E13; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.5px;">
          Linhas Oficiais de Atendimento (WhatsApp):
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
          <div style="background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem;">
            <div style="font-weight: 700; color: #FFFFFF;">⚖️ 1. Jurídico & Contratos</div>
            <div style="font-size: 0.68rem; color: #64748B;">Dra. Josi Silva • (18) 99619-3745</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem;">
            <div style="font-weight: 700; color: #FFFFFF;">👑 2. Suporte Licenciadas</div>
            <div style="font-size: 0.68rem; color: #64748B;">Dra. Josi Silva • (18) 99601-2050</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem;">
            <div style="font-weight: 700; color: #FFFFFF;">💼 3. Comercial & Vendas</div>
            <div style="font-size: 0.68rem; color: #64748B;">Karice / Giovanna • (18) 99635-6825</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem;">
            <div style="font-weight: 700; color: #FFFFFF;">💆 4. Clínica Matriz</div>
            <div style="font-size: 0.68rem; color: #64748B;">Cibele • Pacientes Assis/SP</div>
          </div>
        </div>
      </div>

      <div style="background: rgba(237, 126, 19, 0.08); border: 1px dashed rgba(237, 126, 19, 0.35); padding: 0.75rem; border-radius: 8px;">
        <div style="font-size: 0.72rem; font-weight: 800; color: #ED7E13; margin-bottom: 0.35rem;">
          ⚡ Atalhos Rápidos (Slash Commands no Chat):
        </div>
        <div style="font-size: 0.72rem; color: #CBD5E1; display: flex; flex-wrap: wrap; gap: 0.4rem;">
          <code style="background: #07131E; padding: 0.15rem 0.4rem; border-radius: 4px; color: #ED7E13;">/pix</code>
          <code style="background: #07131E; padding: 0.15rem 0.4rem; border-radius: 4px; color: #ED7E13;">/congresso_exp</code>
          <code style="background: #07131E; padding: 0.15rem 0.4rem; border-radius: 4px; color: #ED7E13;">/congresso_vip</code>
          <code style="background: #07131E; padding: 0.15rem 0.4rem; border-radius: 4px; color: #ED7E13;">/horarios</code>
        </div>
      </div>
    `;

    emptyStateEl.innerHTML = '';
    emptyStateEl.appendChild(hub);
  }

  // Execuções e listeners
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initBhTopBar();
      renderWelcomeHub();
    });
  } else {
    initBhTopBar();
    renderWelcomeHub();
  }

  setInterval(() => {
    initBhTopBar();
    renderWelcomeHub();
  }, 2000);
})();
