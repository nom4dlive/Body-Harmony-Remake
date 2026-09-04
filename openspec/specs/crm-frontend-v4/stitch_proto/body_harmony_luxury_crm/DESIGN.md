---
name: Body Harmony Luxury CRM
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#42474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#72777f'
  outline-variant: '#c2c7cf'
  surface-tint: '#376286'
  primary: '#002841'
  on-primary: '#ffffff'
  primary-container: '#0a3e60'
  on-primary-container: '#80a9d1'
  inverse-primary: '#a1cbf4'
  secondary: '#944b00'
  on-secondary: '#ffffff'
  secondary-container: '#fd8a23'
  on-secondary-container: '#633000'
  tertiary: '#022740'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e3d57'
  on-tertiary-container: '#8aa8c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#a1cbf4'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#1c4a6d'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb783'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#713700'
  tertiary-fixed: '#cee5ff'
  tertiary-fixed-dim: '#abcae9'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#2b4964'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  sidebar-bg: '#072B44'
  sidebar-inactive-text: '#E2E8F0'
  sidebar-inactive-icon: '#94A3B8'
  gold-vibrant: '#FFB366'
  whisper-bg: '#FEF3C7'
  whisper-border: '#D97706'
  success-emerald: '#10B981'
  warning-amber: '#F59E0B'
  danger-ruby: '#EF4444'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  chat-message:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 250px
  inbox-list-width: 340px
  dossier-width: 380px
  gutter: 1rem
  margin: 1.5rem
---

## Brand & Style

This design system embodies the intersection of elite medical aesthetics and high-performance SaaS. It is tailored for healthcare professionals and franchise operators who demand a workspace that is both operationally dense and visually prestigious. The UI prioritizes "Zero Latency" perception and ergonomic efficiency, ensuring that high-volume sales and clinical operations feel effortless.

The visual style is **Corporate / Modern** with a high-end luxury finish. It utilizes a deep, authoritative navy foundation accented by metallic gold highlights. The interface is characterized by clean lines, sophisticated "Glassmorphism" in subtle UI overlays, and a strict adherence to accessibility standards to maintain clarity in data-dense environments.

**Design Principles:**
- **Elite Ergonomics:** Maximum information density without visual clutter; elimination of vertical waste.
- **Prestige Utility:** Functional tools presented through a premium, high-contrast lens.
- **Trustworthy Innovation:** A blend of clinical precision and modern software performance.

## Colors

The palette is anchored by **Deep Navy (#0A3E60)** and **Luxury Gold (#ED7E13)**, creating a professional yet premium atmosphere. 

**Strict Sidebar Rules:**
To ensure WCAG AAA compliance on dark surfaces, the sidebar uses **Deepest Navy (#072B44)**. Inactive text must remain **Light Slate (#E2E8F0)** and icons **Slate 400 (#94A3B8)**. Active states are marked by a gold-tinted pill (`rgba(237, 126, 19, 0.20)`), a solid gold left border, and **Gold Vibrant (#FFB366)** or pure white text.

**Functional Surfaces:**
- **App Background:** Clean Slate (#F8FAFC) for a clinical, breathable workspace.
- **Cards/Canvas:** Pure White (#FFFFFF) to provide maximum contrast for patient data.
- **Internal Notes (Whisper):** Soft Amber background with a dashed border to distinguish internal chatter from client-facing messages.

## Typography

This design system uses a dual-font strategy. **Outfit** is used for headings, KPIs, and primary buttons to inject a modern, geometric, and "luxury-tech" feel. **Inter** is the workhorse for body copy, chat messages, and data-heavy tables, chosen for its exceptional legibility and neutral tone.

Typography is scaled to maintain high density; body text often sits at 14px to allow more information to be visible without scrolling. Chat messages use a slightly larger line-height (22px) to improve readability during long-form consultation review.

## Layout & Spacing

The layout follows a **Fixed Grid** workspace model designed for 1440p+ displays, maximizing the utility of the "Workspace-First" philosophy. It utilizes a **Tri-Panel View** for the primary inbox:
1.  **Navigation Sidebar (250px):** Permanent dark-themed anchor.
2.  **Contact List (340px):** High-density list of omnichannel conversations.
3.  **Communication Canvas (Flex 1):** The central hub for active engagement.
4.  **360° Dossier (380px):** A contextual right-hand panel for Google Workspace integration and patient records.

On mobile, the layout reflows into a single-pane stack using a bottom-navigation bar for primary views, with the Sidebar transforming into a standard hamburger menu.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Subtle Shadows**. 
- **Tier 1 (Surface):** The App Background (#F8FAFC) sits at the lowest level.
- **Tier 2 (Cards):** Conversation cards and Kanban items use Pure White backgrounds with a `shadow-sm` (subtle 2px blur) and 1px borders (#E2E8F0) to define edges without adding visual weight.
- **Tier 3 (Modals/Overlays):** These utilize a more pronounced `shadow-lg` and a light backdrop blur (Glassmorphism) to focus the user's attention on specific clinical tasks or contact editing.
- **Tonal Depth:** Deep Navy headers and sidebars provide a "structural" depth, grounding the lighter workspace components.

## Shapes

The shape language is sophisticated and approachable. All primary UI elements—including buttons, input fields, and chat bubbles—use a **12px (0.75rem)** corner radius. 

- **Standard Roundedness:** 0.5rem for small chips and nested elements.
- **Large Roundedness:** 1rem for main cards and dashboard containers.
- **Pill Shapes:** Reserved exclusively for active menu indicators and status badges (e.g., "Online", "Lead VIP").

## Components

### Buttons
- **Primary CTA:** Background #ED7E13 (Luxury Gold), white text, bold Outfit typography. Used for critical actions like "+ Novo Paciente".
- **Ghost Buttons:** Transparent background with Primary Navy borders for secondary navigation within the Dossier.

### Chips & Badges
- **Channel Indicators:** Small pill-shaped badges with brand-specific colors (WhatsApp Green, Instagram Purple, Telegram Blue) appearing over user avatars.
- **Status Badges:** High-contrast background tints with dark text (e.g., Success Emerald for "Conectado").

### Chat Bubbles
- **Incoming:** White background, Slate 900 text, 1px border.
- **Outgoing:** Primary Navy background, White text.
- **Whisper (Internal):** Amber background (#FEF3C7) with a dashed gold border.

### Cards
- **Kanban Cards:** White background, 12px rounded corners, featuring a thin color-coded top border indicating the pipeline stage. Includes an avatar of the assigned agent and a quick-action WhatsApp icon.

### Inputs
- **Search & Message Fields:** 12px rounded corners, Light Slate borders, and Outfit placeholder text for a modern feel.