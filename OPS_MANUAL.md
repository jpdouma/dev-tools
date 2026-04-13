# UNIVERSAL CONTEXT HUB: OPERATIONS MANUAL

## 1. The RaaS Philosophy & Architecture
Yield Force operates on a Compartmentalized Handoff Architecture. The system is decoupled into isolated logical zones (e.g., Zone 1: Explore Cluster for outbound discovery; Zone 2: Processing Unit for inbound governance). This ensures data integrity and strict architectural boundaries.

## 2. System State & Context Management
The Universal Context Hub is the central nervous system for LLM context. It compiles the `PROJECT_BLUEPRINT.md`, active `core_state.json`, `adrs.json`, and `roadmap.json` into a single SudoLang payload. This prevents the AI from hallucinating or drifting off-topic during development sessions.
* **Micro-Commits:** The legacy `/WRAPUP` command is deprecated. The AI must now yield bite-sized `[STATE_UPDATE]` payloads continuously to prevent mid-session context degradation.
* **Smart Dropzone:** Paste AI-generated JSON directly into the UI; the Hub will automatically parse and route it to the correct backend file.

## 3. The ADR Ledger
Architectural Decision Records (ADRs) are immutable logs of engineering choices. When a friction point is resolved, it is logged in the ADR tab. This ensures the AI understands *why* a system was built a certain way, preventing it from suggesting redundant refactors.

## 4. The Epic Ledger & Roadmap
The Roadmap is a 4-tier Agile hierarchy that manages the project lifecycle and bounds the AI's cognitive scope.
* **Tier 1 - Initiative:** The overarching business goal.
* **Tier 2 - Epic:** A large technical deliverable.
* **Tier 3 - Sprint:** A time-boxed execution cycle.
* **Tier 4 - Objective:** The atomic dev task.

### The Cognitive Tether: Active vs. Pending
* `[PENDING]`: The node is stored safely in the UI backlog but hidden from the AI. This prevents scope creep.
* `[ACTIVE]`: The current Work-In-Progress. Toggling a node to ACTIVE injects it directly into the AI's SudoLang rules (the `ActiveMilestone`), forcing the LLM to only write code related to this specific task.

### Raw JSON Controls
1. **Clear to []**: Resets the local text editor to an empty array, prepping it for new AI paste payloads without deleting backend data.
2. **Force Overwrite**: The destructive save. It takes the exact contents of the editor and completely overwrites the backend state. Useful for complete structural resets.
3. **Smart Merge (Upsert)**: The primary safe save. It recursively deep-merges the editor's JSON into the existing backend state, appending new Initiatives, Epics, Sprints, and Objectives without destroying previously saved nodes.

## 5. Onboarding 'Dark' Codebases
When importing an undocumented codebase, use the Hub and the Architect (AI) to autonomously synthesize the system state:

**Phase 1: Ingestion & Blueprinting**
Drop the raw code into a fresh AI session. Instruct the AI to act as a Principal Engineer and generate a `PROJECT_BLUEPRINT.md` explaining the core philosophy, logical zones, tech stack, and data flow. Do not write new code; just document the existing state. Save this file to your Hub.

**Phase 2: Reverse-Engineering ADRs**
In the same session, ask the AI to extract the 3-5 most critical architectural decisions made by previous developers, formatted strictly to the Hub's ADR JSON schema. Paste this array into the ADRs tab and click Save.

**Phase 3: Autonomous Roadmapping**
Execute the `/ROADMAP` command. The AI will analyze the new Blueprint, identify technical debt or missing features, and generate a 4-tier Agile JSON roadmap. Go to the Roadmap tab, clear the editor to `[]`, paste the payload, and click **Smart Merge (Upsert)**.

**Phase 4: The Cognitive Tether**
Your Hub is now fully populated. Toggle an Objective to `[ACTIVE]` in the Epic Ledger, click 'Copy Prompt', and begin your first development session safely tethered to the newly documented architecture.

## 6. Directory Management & Centralized Storage

**The Hub Philosophy:** The Hub is designed to manage multiple projects from a single server instance while maintaining a strict separation of concerns.

**The Centralized Context Repository:** The Hub does not store meta-data inside your application codebases. Instead, the backend automatically steps up one directory level from the server root and stores all Roadmap, ADR, and Blueprint data inside a peer directory: `~/projects/context-files/<workspace-name>/`. 

This architecture enables you to track and version-control your architectural state entirely independently of your source code, preventing repo bloat and ensuring your context files remain secure and centralized.
