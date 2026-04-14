# Project Blueprint: Universal Context Hub

## 1. Core Architecture

The Universal Context Hub serves as a central governance layer for AI-assisted development. It manages project context, architectural decisions, and roadmaps across various projects.

### Architectural Constraints

* **Dual-Repository Enforcement:** The Universal Context Hub operates strictly on Repo B (Context Files). It must never write AI state, ADRs, or roadmaps into Repo A (Application Code) per ADR-001.
* **CLI-Native Modifications:** All updates to this blueprint and related architectural documents must be executed via CLI patches, not manual UI textboxes, ensuring a verifiable and version-controlled paper trail.

## System Governance Constraints

### 1. Shift-Left Trust Model
The application UI is stateless and unauthorized to act as a source of truth. All state synchronization relies strictly on the `/cli` execution -> `/state` output procedural loop. Manual UI state overrides or direct file manipulations outside of CLI patches are strictly forbidden.

### 2. ADR Governance Cycle
Architectural mutations must strictly adhere to the pipeline: Discussion -> ADR Drafting (Historical Case Law) -> Blueprint Update (Live Constitution). No manual edits to `blueprint.md` are permitted.
