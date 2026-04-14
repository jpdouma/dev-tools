# UNIVERSAL CONTEXT HUB: OPERATIONS MANUAL

> **[ ⚙️ Features & Commands ](#features) | [ 📋 Standard Operating Procedures (SOPs) ](#sops)** | [ 🧠 Core Operating Concepts ](#concepts) | [ 🏛️ Governance & Architecture ](#governance)

## 1. The Agnostic Philosophy
Welcome to the Universal Context Hub (UCH). If you are a new developer joining the team, it is critical to understand *why* this tool exists.

The UCH is a centralized, local context-management engine designed to govern AI-assisted development sessions. Large Language Models (LLMs) suffer from context degradation—they forget rules, hallucinate architectures, and allow scope creep. The Hub prevents this by compiling your project's blueprint, architectural decisions, and roadmap into a single, structured payload. By maintaining a "Dual-Repository" structure, the Hub physically separates your application codebase from your agnostic context files (stored in `../context-files/<workspace>`), ensuring pure project sovereignty.

---

<a id="features"></a>
## 2. Feature & Command Reference

### A. The Project Blueprint (Main Window)
**Feature:** The absolute source of truth for the active workspace's technical documentation. This defines the architecture, tech stack, and data flow of the software you are building. It is physically stored as `blueprint.md` in your context repository.
**Command: `/UPDATE_BLUEPRINT`**
* **Usage:** Run this when you and the AI Architect agree on a fundamental change to the system's design.
* **Output:** Raw Markdown adhering to strict H1/H2/H3 hierarchy.
* **Action:** Pass the AI's output to The Coder (gemini-cli) to write directly to `blueprint.md` on your local file system. The Hub UI serves strictly as a real-time viewer.

### B. The Micro-Commit Workflow (Session Tab)
**Feature:** The Hub relies on continuous, bite-sized context updates rather than massive end-of-session summaries to maintain accurate "short-term memory."
* **Smart Wrap-Up Import (Dropzone):** Paste the AI's JSON output here to automatically append finished tasks to your Changelog and overwrite your Next Objectives.
* **Local Scratchpad:** A private text area for your own developer notes. This is *not* sent to the AI.
* **Session Queue:** Displays your completed Changelog and your FIFO (First-In, First-Out) Next Objectives.
**Command: `/state`**
* **Usage:** Run at the end of a logical loop, before switching tasks, or before ending your day.
* **Output:** A JSON diff detailing `completed_steps` and `next_objectives`.
* **Action:** Paste into the Smart Dropzone to update the Session Queue.

### C. The ADR Ledger (ADRs Tab)
**Feature:** Architectural Decision Records (ADRs) are immutable logs of engineering choices. They explicitly define the *Why* (Friction), the *What* (Ruling), and the *What Not* (Boundary). 
* **Scope:** Categorized as `[CORE_FRAMEWORK]` (applies globally) or `[INSTANCE_SPECIFIC]` (applies to a specific tenant/module).
* **Status:** Toggle to `[ARCHIVED]` once a rule is fully embedded in the codebase so it stops consuming valuable prompt tokens.
**Command: `/ADR [topic]` or `/ADR bulk`**
* **Usage:** Run immediately after resolving a friction point or architecture debate with the AI.
* **Output:** A JSON object or array representing the ADR.
* **Action:** Paste into the "+ Quick ADR" smart paste box to securely add it to the ledger.

### D. The Epic Ledger (Roadmap Tab)
**Feature:** A 4-tier Agile hierarchy that bounds the AI's cognitive scope. You can interact with nodes directly in the UI to change titles, add children, or delete tasks.
1. **Initiative:** Overarching business goal.
2. **Epic:** Large technical deliverable.
3. **Sprint:** Time-boxed execution cycle.
4. **Objective:** Atomic developer task.
* **Statuses:** Click the status badges to cycle through `[PENDING]`, `[ACTIVE]`, `[PARKED]`, and `[COMPLETED]`.
**Command: `/ROADMAP`**
* **Usage:** Run to have the AI autonomously generate or deeply restructure the project lifecycle.
* **Output:** A multi-tiered JSON array.
* **Action:** Paste into the "Toggle Raw JSON Editor" window and click "Smart Merge (Upsert)".

### E. Environment Configurations (Envs Tab)
**Feature:** Manages isolated JSON configurations for specific instances, tenants, or deployments (e.g., `ecu_medical`). Keeps environment variables and tenant data separated from core architecture.

### F. System Rules (Prompt Tab)
**Feature:** The engine room. This houses the SudoLang constraints and macros that force the LLM to behave strictly as an Expert Lead AI Architect. 

### G. Execution & Version Control Commands
**Command: `/cli`**
* **Usage:** The critical trigger to finalize reasoning and write actual code.
* **Output:** An isolated JSON script for The Coder (gemini-cli) detailing exact file target paths and edits.

**Command: `/git`**
* **Usage:** Run when ready to commit work. It enforces our Dual-Repository rule.
* **Output:** Prompts you for `git status` in both repositories, then provides exact, parallel `git add/commit/push` terminal commands.

---

<a id="sops"></a>
## 3. Standard Operating Procedures (SOPs)

> **[ ⬆️ Back to Features & Commands ](#features)** | **[ ⬇️ Core Operating Concepts ](#concepts)**

### Procedure A: Session Initialization
**Purpose:** To securely tether the AI Architect to the current project state at the start of a chat.
1. Open the Hub and ensure your target Workspace is loaded.
2. Click the dark **Prompt** button at the top right of the Hub to copy the master payload.
3. Paste the copied payload into a brand new AI chat window.
4. Wait for the AI to acknowledge its Role, confirm the System State, and await your directive.

### Procedure B: Architectural Decision Making
**Purpose:** To resolve a technical debate and permanently log the guardrails.
1. Discuss the problem with the Architect *without* generating code.
2. Reach a consensus on the architectural approach.
3. PM types: `Please formalize this as an ADR. /ADR`
4. Copy the JSON output, click **+ Quick ADR** in the Hub, paste it into the Smart Auto-Import box, and commit to the ledger.

### Procedure C: The Execution Loop
**Purpose:** To safely convert agreed-upon architecture into physical codebase changes.
1. Ensure the relevant objective is toggled to `[ACTIVE]` in the Roadmap Tab.
2. PM types: `Draft the execution steps for this feature. /cli`
3. Copy the isolated JSON block output by the Architect.
4. Pass the JSON to The Coder (gemini-cli) in your local terminal to apply the edits.
5. Review the physical codebase changes locally.

### Procedure D: State Wrap-Up & Version Control
**Purpose:** To save your "short-term memory" into the Hub and commit code to the repository.
1. PM types: `Update our session context. /state`
2. Paste the JSON into the Session Tab's Smart Wrap-Up Import.
3. PM types: `Let's commit these changes. /git`
4. Provide the requested `git status` outputs for both the app and context directories.
5. Run the generated bash commands in your terminal.

### Procedure E: CLI-Native Blueprint Updates
**Purpose:** To safely update the long-form project architecture documentation.
1. PM discusses architectural or scope changes with the Architect.
2. PM runs: `/UPDATE_BLUEPRINT`
3. PM passes the raw Markdown output to The Coder (gemini-cli) to overwrite `blueprint.md` in the context directory.
4. PM runs: `/git` to secure the new documentation baseline.

---

<a id="concepts"></a>
## 4. Core Operating Concepts

### The Shift-Left Philosophy
As an operator, you must trust the process, not the UI. The web interface is just a 'dumb' mirror of the AI's internal state. Never try to bypass the system by manually typing JSON into the dropzone or editing architecture files by hand. Always rely on the strict `/cli` to `/state` feedback loop.

### How We Make Decisions (The ADR Cycle)
When we need to change how the system works, we don't just hack the code. We follow a strict 3-step governance cycle:
1. **Discuss:** You and the AI identify friction and agree on a structural solution.
2. **ADR (The Record):** The AI generates a `/cli` command to write an Architectural Decision Record (ADR). This is a permanent historical file documenting *why* the change was made.
3. **Blueprint (The Rules):** The AI generates another `/cli` command to update the core `blueprint.md`. This separates the history from the live rules, ensuring future AI agents instantly know how the tool is supposed to operate.

---

<a id="governance"></a>
## 5. Governance & Architecture

### Dual-Pillar Context Architecture
The Hub operates on a strictly decoupled context model:
* **The Roadmap (Execution):** The hierarchical tree (Initiatives -> Epics -> Sprints -> Tasks). Parent statuses are dynamically computed bottom-up. Manual downward forcing is unconditional.
* **The ADR Ledger (Constraints):** Architecture Decision Records live outside the Roadmap tree. They are global boundaries that apply to all tasks. Never nest ADRs inside temporal Sprints.

### Blueprint Management
* **[DEPRECATED]** Raw JSON editing of the Project Blueprint is forbidden.
* **[ACTIVE]** All Blueprint modifications must be done via the Markdown parser to prevent JSON syntax crashes.
