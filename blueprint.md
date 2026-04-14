# Universal Context Hub (UCH)

## Part I: Core Philosophy & Architecture

### Chapter 1: The Agnostic Context Engine
The Universal Context Hub (UCH) is a centralized, local context-management engine designed to govern AI-assisted development sessions. It compiles project blueprints, architectural decisions, and roadmaps into a structured payload. This architecture strictly bounds the AI's cognitive scope, preventing LLM context degradation, scope creep, and architectural hallucinations.

### Chapter 2: The Dual-Repository Structure
The UCH operates on a strict separation of concerns to prevent context bloat and ensure project sovereignty:
* **The Application Codebase:** Houses the execution logic, including the Node.js/Express backend and the Vanilla JS/Tailwind frontend.
* **The Context Repository:** An external, agnostic directory (`../context-files/dev-tools`) that stores all state files and documentation (`core_state.json`, `roadmap.json`, `system_prompts.json`, `config.json`, `blueprint.md`, `adrs.json`).

## Part II: System Components

### Chapter 1: The Stack
* **Frontend:** Vanilla HTML/JS, Tailwind CSS (via CDN), Marked.js for rendering markdown, Katex for mathematical formatting.
* **Backend:** Node.js, Express.js (serving API endpoints, routing configurations, and handling local file system operations).
* **Storage:** Flat JSON files with localized timestamped backups routed to an `/archives/` directory.

### Chapter 2: The UI Dashboard
The frontend acts as a localized dashboard containing specialized ledgers:
* **Session Tab:** Handles micro-commits, scratchpads, and a FIFO session queue for continuous state management.
* **Roadmap Tab:** Manages the 4-tier Epic Ledger.
* **ADRs Tab:** Interface for managing and reviewing Architectural Decision Records.
* **Envs Tab:** Manages instance-specific environment JSON configurations.
* **Prompt Tab:** SudoLang rules engine dictating the AI Architect's behavior and constraints.

## Part III: Data Flow & Workflows

### Chapter 1: CLI-Native Documentation
To maintain perfect synchronization between the Hub and the local Git repository, web-based text editing for the blueprint is deprecated. All architectural changes are discussed with the AI Architect, generated via the `/UPDATE_BLUEPRINT` command, and passed to a local CLI tool (The Coder) to directly overwrite the local Markdown files. The Hub serves strictly as a viewer for the blueprint.

### Chapter 2: The Epic Ledger & Roadmap
Project execution is governed by a 4-tier Agile hierarchy:
1. **Initiative:** The overarching business or product goal.
2. **Epic:** A large technical deliverable.
3. **Sprint:** A time-boxed execution cycle.
4. **Objective:** The atomic development task.

**The Smart Merge (Upsert) Engine**
To safely integrate AI-generated roadmap updates without overwriting existing progress, the Hub utilizes a recursive deep merge architecture:
* **Diffing by Title:** The engine compares incoming JSON objects against the live `roadmap.json` by matching their `"title"` strings.
* **Preservation & Injection:** Matching nodes dive deeper to merge nested children while preserving active UI statuses. Unmatched titles are seamlessly appended as brand new nodes.
* **State Archival:** Prior to writing the new physical file, the Node backend automatically generates a timestamped backup within the context repository's `/archives/` directory.
* **Instant Reactivity:** Following the backend commit, the frontend instantly repaints the interactive Epic Ledger and the sidebar Table of Contents without requiring a browser refresh.

### Chapter 3: Architectural Decision Records (ADRs)
Technical decisions are permanently logged as ADRs to define the "Why" (Friction), the "What" (Ruling), and the "What Not" (Boundary). ADRs are categorized by scope (`[CORE_FRAMEWORK]` or `[INSTANCE_SPECIFIC]`) and status (`[ACTIVE]` or `[ARCHIVED]`). Archived ADRs are excluded from the active prompt payload to conserve context tokens once a rule is fully embedded in the codebase.

### Chapter 4: Backend Security & File Integrity
To protect the dual-repository architecture from hallucinated payloads or malformed manual requests, the Node.js backend enforces strict operational boundaries:
* **Schema Validation (Ajv):** All state-mutating API routes (`/update-state`, `/roadmap`, `/prompts`, `/adrs`) pass incoming JSON payloads through compiled schema validators before executing file system writes, averting structural file corruption.
* **Execution Guardrails:** The `/api/:project/execute` endpoint asserts command strings and utilizes regex rejection lists to actively block path traversal (`cd ..`) and destructive shell operations (`rm -rf`, `mkfs`, `sudo`), triggering 403 Security Violations upon breach.

### Chapter 5: The Verification Loop (Anti-Hallucination)
To eliminate "hallucinated success" and prevent context drift, the UCH enforces a strict trust-but-verify mechanism:
* **Anti-Drift Execution Blocker:** The UI monitors local execution terminal outcomes. If a `/cli` execution yields a non-zero exit code or fails, the Smart Session Dropzone is physically locked. A pulsing visual alert is triggered on the terminal toggle, blocking session `/state` updates until the execution error is cleared.
* **Live Git Telemetry:** The engine integrates real-time visibility into physical file alterations via the `/api/:project/run-context` endpoint, guaranteeing the AI operates on actual file deltas rather than predicted outputs.
* **Payload Integrity:** Critical configuration files (e.g., `system_prompts.json`) undergo rigorous front-to-back validation. The frontend blocks malformed JSON via pre-flight checks, and the backend acts as the final gatekeeper to protect the AI's core constraint logic.
