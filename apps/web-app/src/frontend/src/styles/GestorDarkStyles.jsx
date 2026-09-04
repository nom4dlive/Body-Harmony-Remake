import { createGlobalStyle } from 'styled-components';

export const GestorDarkStyles = createGlobalStyle`
  /* ═════════════════════════════════════════════════════════════════════════
     CSS VARIABLES — GESTOR THEME ENGINE (Nexus V3.1 Luxury Protocol)
     ═════════════════════════════════════════════════════════════════════════ */
  :root {
    --bh-bg-app: #F5F5F5;
    --bh-bg-surface: #FFFFFF;
    --bh-bg-card: #FFFFFF;
    --bh-bg-card-subtle: #F8FAFC;
    --bh-bg-input: #FFFFFF;
    --bh-text-main: #0A3E60;
    --bh-text-title: #0A3E60;
    --bh-text-secondary: #64748B;
    --bh-text-muted: #94A3B8;
    --bh-border: #E2E8F0;
    --bh-border-subtle: #F1F5F9;
    --bh-border-gold: rgba(237, 126, 19, 0.2);
    --bh-gold: #ED7E13;
    --bh-gold-hover: #D96F0E;
    --bh-navy: #0A3E60;
    --bh-card-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  [data-gestor-theme="dark"],
  [data-licenciada-theme="dark"],
  [data-aluna-theme="dark"],
  [data-theme="dark"] {
    --bh-bg-app: #051524;
    --bh-bg-surface: #0A233A;
    --bh-bg-card: #0D2A44;
    --bh-bg-card-subtle: #071D30;
    --bh-bg-input: #06192B;
    --bh-text-main: #F8FAFC;
    --bh-text-title: #FFFFFF;
    --bh-text-secondary: #CBD5E1;
    --bh-text-muted: #94A3B8;
    --bh-border: rgba(255, 255, 255, 0.12);
    --bh-border-subtle: rgba(255, 255, 255, 0.06);
    --bh-border-gold: rgba(237, 126, 19, 0.35);
    --bh-gold: #ED7E13;
    --bh-gold-hover: #F98B24;
    --bh-navy: #0A3E60;
    --bh-card-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GLOBAL HIGH-CONTRAST DARK MODE ENGINE (UI/UX PRO MAX STANDARD)
     ═════════════════════════════════════════════════════════════════════════ */
  [data-gestor-theme="dark"],
  [data-licenciada-theme="dark"],
  [data-aluna-theme="dark"],
  [data-theme="dark"] {
    color-scheme: dark;

    /* ── 1. Base Layout & Canvas ────────────────────────────────────────── */
    body {
      background-color: var(--bh-bg-app);
      color: var(--bh-text-main);
    }

    main, [class*="MainContent"], [class*="PageWrapper"], [class*="Container"] {
      background-color: var(--bh-bg-app) !important;
      color: var(--bh-text-main);
      transition: background-color 0.25s ease, color 0.25s ease;
    }

    /* ── 2. Universal Headings & Titles ─────────────────────────────────── */
    h1, h2, h3, h4, h5, h6,
    [class*="Title"], [class*="title"], [class*="Heading"],
    strong, b {
      color: #FFFFFF !important;
    }

    /* ── 3. Universal Inversion for Dark Text Colors ────────────────────── */
    *[style*="color: #0A3E60"], *[style*="color: #0a3e60"],
    *[style*="color: #06263B"], *[style*="color: #06263b"],
    *[style*="color: #0F172A"], *[style*="color: #0f172a"],
    *[style*="color: #1E293B"], *[style*="color: #1e293b"],
    *[style*="color: #334155"], *[style*="color: #334155"],
    *[style*="color: #475569"], *[style*="color: #475569"],
    *[style*="color: #111827"], *[style*="color: #111827"],
    *[style*="color: #000000"], *[style*="color: #000"],
    *[style*="color: rgb(10, 62, 96)"],
    *[style*="color: rgb(15, 23, 42)"],
    *[style*="color: rgb(30, 41, 59)"],
    *[style*="color: rgb(51, 65, 85)"],
    *[style*="color: rgb(71, 85, 105)"] {
      color: var(--bh-text-main) !important;
    }

    *[style*="color: #64748B"], *[style*="color: #64748b"],
    *[style*="color: #94A3B8"], *[style*="color: #94a3b8"],
    *[style*="color: rgb(100, 116, 139)"],
    *[style*="color: rgb(148, 163, 184)"] {
      color: var(--bh-text-secondary) !important;
    }

    /* ── 4. Universal Container & Surface Inversion ─────────────────────── */
    div[style*="background: white"], div[style*="background: #FFFFFF"], div[style*="background: #ffffff"], div[style*="background: #fff"],
    div[style*="background-color: white"], div[style*="background-color: #FFFFFF"], div[style*="background-color: #ffffff"], div[style*="background-color: #fff"],
    div[style*="background: #F8FAFC"], div[style*="background: #f8fafc"], div[style*="background: #F1F5F9"], div[style*="background: #f1f5f9"],
    div[style*="background: #F5F5F5"], div[style*="background: #f5f5f5"], div[style*="background: #E2E8F0"], div[style*="background: #e2e8f0"],
    div[style*="background-color: #F8FAFC"], div[style*="background-color: #f8fafc"], div[style*="background-color: #F1F5F9"], div[style*="background-color: #f1f5f9"],
    div[style*="background: rgb(255, 255, 255)"], div[style*="background-color: rgb(255, 255, 255)"],
    section[style*="background: #FFFFFF"], article[style*="background: #FFFFFF"],
    main section,
    main article,
    main aside,
    fieldset,
    div:has(> .card-top),
    div:has(> .header),
    div:has(> .sim-header),
    div:has(> .prompt-box),
    div:has(> .tools-box),
    div:has(> .tools-title),
    div:has(> .sidebar-title),
    div:has(> .brand-title),
    div:has(> .contact-meta),
    div:has(> .card-title) {
      background-color: var(--bh-bg-surface) !important;
      border-color: var(--bh-border) !important;
      color: var(--bh-text-main) !important;
    }

    /* ── 5. KPI Cards, Metric Widgets & Bento Panels ────────────────────── */
    [class*="MetricsGrid"] [class*="MetricCard"],
    [class*="KpiGrid"] [class*="KpiCard"],
    [class*="MetricCard"],
    [class*="KpiCard"],
    [class*="BentoCard"],
    [class*="CockpitWrapper"],
    [class*="WidgetContainer"],
    [class*="StatCard"],
    [class*="Card"],
    [class*="Panel"],
    [class*="TemplateCard"] {
      background: var(--bh-bg-surface) !important;
      border: 1px solid var(--bh-border) !important;
      box-shadow: var(--bh-card-shadow) !important;
      color: var(--bh-text-main) !important;

      h1, h2, h3, h4, h5 {
        color: #FFFFFF !important;
      }
      p, span.subtitle, .description {
        color: var(--bh-text-secondary) !important;
      }
      .label, .details p {
        color: var(--bh-text-secondary) !important;
      }
      .value, .details h3 {
        color: #FFFFFF !important;
      }
      .sub {
        color: var(--bh-text-muted) !important;
      }
      .icon-wrap, .icon-wrapper {
        background: #071D30 !important;
        color: var(--bh-gold) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
    }

    /* ── 6. Control Bars, Filters & Pills ──────────────────────────────── */
    [class*="ControlBar"],
    [class*="FilterBar"],
    [class*="MainTabsNav"] {
      background: var(--bh-bg-surface) !important;
      border: 1px solid var(--bh-border) !important;
      box-shadow: var(--bh-card-shadow) !important;
      color: var(--bh-text-main) !important;
    }

    [class*="Pill"],
    [class*="pill"],
    [class*="SegmentedTab"],
    [class*="ViewTab"],
    [class*="MainTab"] {
      background: #0D2A44 !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      color: #CBD5E1 !important;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(237, 126, 19, 0.18) !important;
        border-color: #ED7E13 !important;
        color: #FFFFFF !important;
      }

      &[class*="active"], &[data-active="true"], &[active="true"] {
        background: #0A3E60 !important;
        border-color: #ED7E13 !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
      }
    }

    [class*="SegmentedFilter"],
    [class*="ViewSwitcher"],
    [class*="StatusPills"] {
      background: #06192B !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    /* ── 7. Universal Buttons & Action Links ────────────────────────────── */
    [class*="ActionButton"],
    [class*="ActionIconBtn"],
    [class*="HeaderBtn"],
    [class*="RefreshBtn"],
    [class*="PrefsBtn"],
    [class*="ThemeToggleBtn"],
    [class*="TopSearchBtn"],
    a[style*="background: #ffffff"], a[style*="background: #FFFFFF"], a[style*="background: white"],
    button[style*="background: #ffffff"], button[style*="background: #FFFFFF"], button[style*="background: white"],
    a[style*="background: #f8fafc"], button[style*="background: #f8fafc"],
    a[style*="background: #F8FAFC"], button[style*="background: #F8FAFC"] {
      background-color: #0D2A44 !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      color: #F8FAFC !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2) !important;

      svg {
        color: inherit;
      }

      &:hover {
        background-color: rgba(237, 126, 19, 0.18) !important;
        border-color: #ED7E13 !important;
        color: #FFFFFF !important;
      }
    }

    /* Special CTA Buttons */
    [class*="SandboxBtn"] {
      background: #1E1B4B !important;
      border: 1.5px solid #7C3AED !important;
      color: #C4B5FD !important;
      &:hover { background: #2E1065 !important; border-color: #A78BFA !important; }
    }

    [class*="PurgeBtn"] {
      background: #450A0A !important;
      border: 1px solid #DC2626 !important;
      color: #FCA5A5 !important;
      &:hover { background: #7F1D1D !important; }
    }

    /* ── 8. Tables, Data Grids & Table Cards ────────────────────────────── */
    table, [class*="DataTable"], [class*="Table"], [class*="TableCard"] {
      background-color: var(--bh-bg-surface) !important;
      color: var(--bh-text-main) !important;
      border-color: var(--bh-border) !important;

      thead, th {
        background-color: #071D30 !important;
        color: #94A3B8 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
      }

      tbody tr {
        background-color: var(--bh-bg-surface) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        transition: background-color 0.15s ease;

        &:hover {
          background-color: rgba(237, 126, 19, 0.08) !important;
        }

        td {
          background-color: transparent !important;
          color: var(--bh-text-main) !important;
          border-color: rgba(255, 255, 255, 0.06) !important;

          span, p, small {
            color: inherit;
          }
          strong {
            color: #FFFFFF !important;
          }
          .text-muted, [class*="muted"] {
            color: var(--bh-text-secondary) !important;
          }
        }
      }
    }

    /* ── 9. Status Badges & High-Contrast Pills ────────────────────────── */
    [class*="StatusBadge"],
    [class*="TestBadge"],
    [class*="ManagerPill"],
    [class*="CohortPill"],
    [class*="CategoryBadge"],
    [class*="badge"],
    [class*="Badge"],
    [class*="Tag"] {
      border: 1px solid rgba(255, 255, 255, 0.18);
    }

    /* Green / Success / Paid / Assinado */
    span[class*="SIGNED"], span[data-status="SIGNED"], span[status="SIGNED"],
    span[style*="background: #DCFCE7"], span[style*="background: #dcfce7"],
    span[style*="background-color: #DCFCE7"], span[style*="background-color: #dcfce7"],
    span[style*="background: #dcfce7"] {
      background-color: rgba(34, 197, 94, 0.18) !important;
      color: #4ADE80 !important;
      border: 1px solid rgba(74, 222, 128, 0.35) !important;
    }

    /* Yellow / Pending / Aguardando */
    span[class*="PENDING"], span[data-status="PENDING_SIGNATURE"], span[status="PENDING_SIGNATURE"],
    span[style*="background: #FEF9C3"], span[style*="background: #fef9c3"],
    span[style*="background-color: #FEF9C3"], span[style*="background-color: #fef9c3"],
    span[style*="background: #fef3c7"], span[style*="background-color: #fef3c7"] {
      background-color: rgba(234, 179, 8, 0.18) !important;
      color: #FACC15 !important;
      border: 1px solid rgba(250, 204, 21, 0.35) !important;
    }

    /* Red / Failed / Cancelado */
    span[style*="background: #FEE2E2"], span[style*="background: #fee2e2"],
    span[style*="background-color: #FEE2E2"], span[style*="background-color: #fee2e2"] {
      background-color: rgba(239, 68, 68, 0.18) !important;
      color: #F87171 !important;
      border: 1px solid rgba(248, 113, 113, 0.35) !important;
    }

    /* Draft / Rascunho */
    span[class*="DRAFT"], span[data-status="DRAFT"], span[status="DRAFT"],
    span[style*="background: #F1F5F9"], span[style*="background: #f1f5f9"] {
      background-color: rgba(148, 163, 184, 0.18) !important;
      color: #CBD5E1 !important;
      border: 1px solid rgba(203, 213, 225, 0.3) !important;
    }

    /* ── 10. Kanban Columns & Cards ────────────────────────────────────── */
    [class*="KanbanBoard"] [class*="ColumnWrapper"],
    [class*="ColumnWrapper"] {
      background: #071D30 !important;
      border: 1px solid var(--bh-border) !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
      color: var(--bh-text-main) !important;

      [class*="ColumnHeader"], h3, h4 { color: #FFFFFF !important; }
    }

    [class*="LeadCard"],
    [class*="CandidateCard"],
    [class*="CardContainer"] {
      background: #0A233A !important;
      border: 1px solid var(--bh-border) !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
      color: var(--bh-text-main) !important;

      h4, strong, .title { color: #FFFFFF !important; }
      p, span, small { color: var(--bh-text-secondary); }
    }

    /* ── 11. Forms, Inputs & Textareas ─────────────────────────────────── */
    input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="submit"]):not([type="button"]),
    textarea,
    select,
    [class*="SelectBox"] {
      background-color: var(--bh-bg-input) !important;
      color: var(--bh-text-main) !important;
      border: 1px solid var(--bh-border) !important;
      border-radius: 8px;

      &::placeholder {
        color: var(--bh-text-muted) !important;
        opacity: 0.8;
      }

      &:focus {
        border-color: var(--bh-gold) !important;
        box-shadow: 0 0 0 2px rgba(237, 126, 19, 0.25) !important;
        outline: none;
      }
    }

    /* ── 12. Modals & Dialogs ─────────────────────────────────────────── */
    [class*="ModalCard"],
    [class*="ModalContainer"],
    [class*="DialogCard"],
    div[role="dialog"] {
      background-color: var(--bh-bg-surface) !important;
      border: 1px solid var(--bh-border-gold) !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7) !important;
      color: var(--bh-text-main) !important;

      [class*="ModalBody"], [class*="ModalContent"] {
        background-color: var(--bh-bg-surface) !important;
        color: var(--bh-text-main) !important;
      }

      [class*="ModalFooter"] {
        background-color: var(--bh-bg-card-subtle) !important;
        border-top: 1px solid var(--bh-border) !important;
      }
    }

    /* ── 13. CRM Workspace V4 & Omnichannel Dark Protocol ──────────────── */
    [class*="WorkspaceGrid"] {
      background: var(--bh-bg-app) !important;
      border-color: var(--bh-border) !important;
      box-shadow: var(--bh-card-shadow) !important;
    }

    [class*="WorkspaceTopNav"] {
      background: var(--bh-bg-surface) !important;
      border-color: var(--bh-border) !important;
      color: var(--bh-text-main) !important;

      .nav-tabs {
        background: #06192B !important;
        border-color: var(--bh-border) !important;

        button {
          color: #94A3B8 !important;
          &:hover:not(.active) {
            color: #FFFFFF !important;
            background: rgba(255, 255, 255, 0.08) !important;
          }
          &.active {
            background: #0A3E60 !important;
            color: #FFFFFF !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
          }
        }
      }

      .status-zone .attendant-pill {
        background: #0D2A44 !important;
        color: #CBD5E1 !important;
        border-color: var(--bh-border) !important;
      }
    }

    [class*="LineRailCol"] {
      background: #051524 !important;
      border-color: var(--bh-border) !important;
    }

    [class*="ConvListCol"] {
      background: var(--bh-bg-surface) !important;
      border-color: var(--bh-border) !important;
    }

    [class*="ConvHeader"] {
      background: #071D30 !important;
      border-color: var(--bh-border) !important;
    }

    [class*="TreeTabs"] {
      background: #06192B !important;

      button {
        color: #94A3B8 !important;
        &[class*="active"], &[data-active="true"] {
          background: #0D2A44 !important;
          color: #FFFFFF !important;
        }
      }
    }

    [class*="ConvCard"] {
      background: transparent !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
      color: var(--bh-text-main) !important;

      strong, .name { color: #FFFFFF !important; }
      .preview, p, span { color: var(--bh-text-secondary) !important; }

      &:hover {
        background: rgba(237, 126, 19, 0.12) !important;
      }

      &[class*="selected"], &[data-selected="true"] {
        background: rgba(237, 126, 19, 0.18) !important;
        border-left-color: #ED7E13 !important;
      }
    }

    [class*="ChatAreaCol"] {
      background: var(--bh-bg-app) !important;
      border-color: var(--bh-border) !important;
    }

    [class*="ChatHeader"] {
      background: var(--bh-bg-surface) !important;
      border-color: var(--bh-border) !important;
      color: var(--bh-text-main) !important;

      h4, strong, .title { color: #FFFFFF !important; }
      span, p { color: var(--bh-text-secondary) !important; }
    }

    [class*="MessagesScrollArea"],
    [class*="MessageListArea"],
    [class*="ChatHistory"] {
      background: #051524 !important;
    }

    [class*="MsgBubble"],
    [class*="MessageBubble"] {
      background: #0D2A44 !important;
      color: #F8FAFC !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;

      p, span, .text {
        color: #F8FAFC !important;
      }

      .time, small {
        color: #94A3B8 !important;
      }

      &[class*="Me"], &[data-is-me="true"] {
        background: #0A3E60 !important;
        border-color: rgba(237, 126, 19, 0.35) !important;
      }

      &[class*="Bot"], &[data-is-bot="true"] {
        background: #112233 !important;
        border-left: 3px solid #ED7E13 !important;
      }
    }

    [class*="ChatInputArea"],
    [class*="InputBoxWrapper"] {
      background: var(--bh-bg-surface) !important;
      border-color: var(--bh-border) !important;
      color: var(--bh-text-main) !important;
    }

    [class*="DossierCol"],
    [class*="TelemetrySidebar"],
    [class*="DossierSidebar"] {
      background: var(--bh-bg-surface) !important;
      border-color: var(--bh-border) !important;
      color: var(--bh-text-main) !important;

      [class*="DossierHeader"],
      [class*="DossierTabs"] {
        background: #071D30 !important;
        border-color: var(--bh-border) !important;
      }

      [class*="DossierContent"],
      [class*="DossierBody"] {
        background: var(--bh-bg-surface) !important;
      }

      [class*="FieldCard"],
      [class*="TelemetryCard"],
      [class*="InfoSection"] {
        background: #0D2A44 !important;
        border: 1px solid var(--bh-border) !important;
        color: var(--bh-text-main) !important;

        h4, h5, strong { color: #FFFFFF !important; }
        span, p, label { color: var(--bh-text-secondary) !important; }
      }
    }

    /* ── 14. Custom Scrollbars ─────────────────────────────────────────── */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #051524;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(237, 126, 19, 0.4);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(237, 126, 19, 0.8);
    }
  }
`;
