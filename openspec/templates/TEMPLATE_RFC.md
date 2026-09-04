---
type: RFC
status: DRAFT # DRAFT, REVIEW, APPROVED, IMPLEMENTED, REJECTED
owner: [Name]
created: [YYYY-MM-DD]
---

# RFC-[000]: [Title]

## 1. Context & Problem Statement
*Describe the current state and why a change is needed.*

## 2. Proposed Solution
*Describe the technical approach. Use diagrams if helpful.*

### 2.1 Technical Details
* **Impact on Database**: ...
* **Impact on API**: *Indicate endpoint changes. Must create and link the contract in `openspec/contracts/` below.*
* **Impact on Frontend**: ...

### 2.2 API Contract Associated (SDD Rule 1)
* **Contract File**: `[Link to contract](file:///f:/Body-Harmony-Remake/openspec/contracts/{modulo}/{endpoint_path}.json)`
* *Verify that request/response payloads in code fully match this JSON structure.*

---

## 🚫 3. Fora de Escopo / Espaço Negativo (SDD Rule 2)
*List explicitly what is out of scope and must NOT be altered or exposed (e.g. VPS port configurations, root passwords, private SSH keys, active credentials in source).*
- [ ] SSH private keys in `openspec/tracker/Hostinger_VPS/` must remain untouched and gitignored.
- [ ] No exposure of local MySQL port 3306 to WAN (must keep 127.0.0.1 loopback only).
- [ ] ...

---

## 4. Alternatives Considered
*Why is this the best approach? What else did we consider?*

## 5. Implementation Plan (360° Checklist)
1. [ ] Step 1 (Database schema changes/migrations)
2. [ ] Step 2 (Backend controllers and endpoints validation)
3. [ ] Step 3 (Frontend components integration and loading states)
4. [ ] Step 4 (Brand identity and mobile-first verification)

## 6. Security & Privacy
*Any security implications? Hardening and access logs verification.*

