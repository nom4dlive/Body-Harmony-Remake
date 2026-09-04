# Frontend React 18 Audit & Architectural Analysis: Gestor Agenda System
**Workspace**: `f:\Body-Harmony-Remake\apps\web-app`
**Auditor**: Explorer Subagent (Survey Phase)
**Date**: 2026-08-20
**Protocol Baseline**: Nexus Protocol V3.1 (React 18, Tailwind CSS, Vite)

---

## 1. Executive Summary & Component Topology

The **Gestor Agenda System** (implemented under PLAN-062 and PLAN-063) provides unified operational scheduling, task management, critical urgency tracking, and collaborative discussion for clinic managers.

### Component Map

```
App.jsx
  └── Route: /admin/agenda & /portal-gestor/agenda
        └── GestorAgendaPage.jsx (Root Controller)
              ├── AgendaCalendarView.jsx (Monthly Grid View)
              ├── AgendaKanbanListView.jsx (Kanban Status Columns)
              ├── EventModal.jsx (Create / Edit Dialog)
              └── EventDetailsDrawer.jsx (Subtasks, Comments, Attachments & iCal Sync)
                    └── api.js (gestorAgendaApi Service Layer)
```

---

## 2. Comprehensive Security & XSS Audit

### 2.1 Output Sanitization & Safe Rendering
* **JSX Text Encoding**: In all components (`GestorAgendaPage`, `AgendaKanbanListView`, `AgendaCalendarView`, `EventDetailsDrawer`, and `EventModal`), user-generated strings (`title`, `description`, `comment`, `admin_name`, `original_name`) are rendered as direct JSX children (e.g. `{evt.title}`, `{c.comment}`). React 18 applies automatic string escaping during DOM reconciliation.
* **`dangerouslySetInnerHTML` Check**: 0 occurrences found across all 5 Gestor Agenda components.
* **Inline CSS Attribute Safety**: Color badges use dynamic styles (`style={{ borderColor: evt.color || '#0A3E60' }}`). In React, style objects are parsed safely without arbitrary JavaScript execution vectors.
* **Attachment Name Rendering**: Attachment filenames are rendered cleanly via `{att.original_name}` without raw HTML evaluation.

### 2.2 Security Findings & Vulnerability Gaps
| Severity | Component | Finding | Impact & Recommendation |
|---|---|---|---|
| **Medium** | `api.js:1272` | `uploadAttachment` auth key mismatch (`admin_token` vs `bh_auth`) | Requests to upload attachments fail with 401 Unauthorized or send unauthenticated payloads. |
| **Low** | `EventDetailsDrawer.jsx:307` | Unrestricted `<input type="file" />` | Client lacks `accept=".pdf,.png,.jpg,.jpeg,.docx"` and file size pre-check (e.g., max 10MB) before FormData dispatch. |
| **Low** | `EventDetailsDrawer.jsx:311` | Attachment download link missing | Uploaded attachments display name and size but lack secure download URLs or safe target handlers (`rel="noopener noreferrer"`). |
| **Low** | `EventModal.jsx:50` | Whitespace validation gap | `handleSubmit` verifies `!formData.title` but does not enforce `!formData.title.trim()`, allowing whitespace-only entries. |

---

## 3. Concurrency, Race Conditions & Optimistic State Analysis

### 3.1 Checklist Toggling Concurrency Vulnerability
* **Observation** (`EventDetailsDrawer.jsx:52-60`):
  ```javascript
  const handleToggleChecklist = async (checklistId) => {
    try {
      await gestorAgendaApi.toggleChecklist(checklistId);
      fetchDetails();
      onRefresh();
    } catch (err) {
      alert('Erro ao alterar checklist: ' + err.message);
    }
  };
  ```
* **Vulnerability & Race Condition Mechanics**:
  1. **Latency Lag**: Checkbox toggle relies on completing a `PATCH` request, followed by `fetchDetails()` and `onRefresh()` roundtrips (3 network roundtrips per toggle).
  2. **Out-of-Order Resolution**: If a manager rapidly checks 2 or 3 items, 3 concurrent PATCH requests fire. If request #1 resolves after request #3, `fetchDetails()` from request #1 will overwrite the state with stale data, causing temporary rollback or visual flip-flopping.
  3. **Double Click Bubbling**: The item wrapper `div` has `onClick={() => handleToggleChecklist(item.id)}` while the child checkbox has `onChange={() => {}}`.
* **Recommended Pattern**: Implement immediate optimistic state mutation in local `details.checklists` with rollback on error, plus a per-item loading/lock state (`togglingIds: Set<id>`).

### 3.2 Polling vs Active State Clashing
* **Observation** (`GestorAgendaPage.jsx:30-52`):
  - A 15-second background polling timer (`setInterval(fetchAgendaData, 15000)`) polls `/events` and `/summary`.
  - In `fetchAgendaData()`, `setLoading(true)` is executed on every tick, causing the top refresh icon (`RefreshCw`) to animate continuously every 15s.
  - While `EventModal` isolates its own form state (preventing form wipeouts), `drawerEvent` in `GestorAgendaPage` is not refreshed if external edits happen, unless closed and reopened.

---

## 4. UI/UX Compliance with Nexus Protocol V3.1

### 4.1 Luxury Color Palette Adherence
* **Navy Blue (`#0A3E60`)**: Consistently used for page titles, active Kanban headers, drawer subtask buttons, and dark mode overlays (`bg-[#0A3E60]/30`, `bg-[#051A29]`).
* **Luxury Gold (`#ED7E13`)**: Used for primary action buttons (`hover:bg-[#d66f0e]`), icons, focus rings (`focus:ring-[#ED7E13]`), progress bars, active calendar dates, and active drawer tabs.
* **Neutral Backgrounds**: Clean `#FFFFFF`, `#F5F5F5` and Tailwind neutral slates (`dark:bg-slate-900`).
* **Prohibited Colors**: Zero generic/plain browser colors (`#ff0000`, `#0000ff`, `#00ff00`) are used.

### 4.2 Mobile-First Touch Targets (>= 44x44px)
| Component | Element | Current Size | Status | Recommended Adjustment |
|---|---|---|---|---|
| `GestorAgendaPage` | "Novo Evento" CTA | `h-11 px-5` (44px) | **PASS** | Compliant |
| `GestorAgendaPage` | Search & Select Filters | `h-11` (44px) | **PASS** | Compliant |
| `GestorAgendaPage` | Refresh Button | `p-2.5` (~36px) | **GAP** | Change to `h-11 w-11 flex items-center justify-center` (44px) |
| `GestorAgendaPage` | View Switcher Tabs | `py-2 px-4` (~32px) | **GAP** | Change to `h-10 sm:h-11` |
| `AgendaKanbanListView` | Card Action Icons (Play/Check/Edit/Trash) | `p-1.5` (~26px) | **GAP** | Enlarge hit zone to `p-2.5 min-w-[36px] min-h-[36px]` (or 44px on touch) |
| `AgendaCalendarView` | Month Navigation Buttons | `p-2` (~36px) | **GAP** | Enlarge to `h-11 w-11` |
| `AgendaCalendarView` | "Hoje" Quick Button | `px-3 py-1` (~24px) | **GAP** | Enlarge to `h-10 px-4` |
| `EventModal` | All Inputs & Action Buttons | `h-11` (44px) | **PASS** | Compliant |
| `EventDetailsDrawer` | Checklist Item Rows | `p-3` (~48px) | **PASS** | Compliant |
| `EventDetailsDrawer` | Send Comment Button | `h-9` (~36px) | **GAP** | Enlarge to `h-11 px-5` |

### 4.3 Responsive Viewport Density
* **Calendar Grid on Mobile**: `AgendaCalendarView` uses a strict 7-column grid (`grid-cols-7`). On mobile viewports (< 400px), day cells narrow down to ~45px wide, causing event titles to truncate excessively.
* **Recommendation**: Add a mobile-friendly view switcher or allow horizontal scroll / daily agenda drawer on small screens (`sm:hidden`).

---

## 5. API Communication & Error Handling Robustness

### 5.1 Critical Auth Invariant in `api.js`
In `apps/web-app/src/frontend/src/services/api.js`:
```javascript
// DEFECTIVE IMPLEMENTATION (Line 1272-1284):
uploadAttachment: async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'); // ❌ Bug: admin_token does not exist
  const response = await fetch(`${API_BASE}/v1/admin/agenda/events/${id}/attachments`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData
  });
  return response.json();
}
```
**Why this breaks**:
1. All other authenticated routes read `localStorage.getItem('bh_auth')` where `JSON.parse(adminAuth).token` is stored.
2. `request()` already has built-in support for `FormData` (omits `Content-Type` to preserve boundaries) and automatically injects `X-DEVICE-ID`, `Authorization`, and retry logic.

**Standardized Solution**:
```javascript
uploadAttachment: (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request(`/v1/admin/agenda/events/${id}/attachments`, {
    method: 'POST',
    body: formData
  });
}
```

### 5.2 Error Reporting: Alert vs Modals
Across `GestorAgendaPage` and `EventDetailsDrawer`, errors are reported via `alert('Erro: ' + err.message)`. While functional, replacing them with a non-blocking toast or Nexus Error Banner enhances the luxury user experience.
