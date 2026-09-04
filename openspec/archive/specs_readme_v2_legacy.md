# OpenSpec System (v2)

This repository uses **OpenSpec v2** to manage software specifications. 
The system separates the **Source of Truth (Master)** from **Proposed Changes (Deltas)** and **Decisions (ADR)**.

## Directory Structure

### 📂 `master/` (The Source of Truth)
Contains the current, authoritative state of the system documentation.
- **Rule:** Never edit directly without an approved Delta (for big changes) or strict review (for hotfixes).
- **Goal:** Should always reflect *what is currently deployed*.

### 📂 `deltas/` (Proposals & Plans)
Contains active RFCs (Request for Comments) and Implementation Plans.
- **Workflow:**
    1. Copy `templates/TEMPLATE_RFC.md` to `deltas/RFC-001-my-feature.md`.
    2. Discuss and refine.
    3. Implement code.
    4. **Merge:** Update `master/` docs to reflect the new reality.
    5. **Archive:** Move delta to `archive/`.

### 📂 `decisions/` (Architecture Decision Records)
Contains immutable records of significant architectural choices.
- **Rule:** Once accepted, ADRs are never deleted, only superseded.
- **Goal:** Understand *why* the system is built this way.

### 📂 `tracker/`
Contains project tracking files (`PENDING_TASKS.md`, `ROADMAP.md`).

### 📂 `templates/`
Standard templates for consistency.

---

## Workflow

1. **New Feature?** -> Create `deltas/RFC-00X-feature.md`.
2. **Architecture Change?** -> Create `deltas/RFC-00X...` -> Convert to `decisions/ADR-00X...` upon approval.
3. **Docs Update?** -> Edit `master/` directly (small) or via Delta (large).
