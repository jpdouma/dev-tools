# UNIVERSAL CONTEXT HUB: OPERATIONS MANUAL
> **[ ⚙️ Features & Commands ](#2-feature--command-reference) | [ 📋 Standard Operating Procedures ](#3-standard-operating-procedures-sops)**

## 1. The Agnostic Philosophy
The Universal Context Hub (UCH) is a centralized, local context-management engine designed to govern AI-assisted development sessions. It compiles project blueprints, architectural decisions, and roadmaps into a structured payload, preventing LLM context degradation, scope creep, and architectural hallucinations.

---

## 2. Feature & Command Reference

### A. The Project Blueprint (Main Window)
**Feature:** The technical documentation for the active workspace. This defines the architecture, tech stack, and data flow of the software you are building. It is saved in `core_state.json`.
**Command: `/UPDATE_BLUEPRINT`**
* **Usage:** Tell the Architect what architectural logic changed.
* **Output:** Raw Markdown with strict H1/H2/H3 headers.
* **Action:** Pass the output to The Coder (gemini-cli) to write directly to `PROJECT_BLUEPRINT.md` on your local file system. The web UI editor is deprecated.

### B. The Micro-Commit Workflow (Session Tab)
**Feature:** The "Smart Wrap-Up Import" dropzone. The Hub relies on continuous, bite-sized context updates rather than massive end-of-session summaries.
**Command: `/state`**
* **Usage:** Run at the end of a logical loop or before switching tasks.
* **Output:** A JSON diff detailing `completed_steps` and `next_objectives`.
* **Action:** Paste into the Smart Dropzone to automatically update the Session Queue.

### C. The ADR Ledger (ADRs Tab)
**Feature:** Architectural Decision Records (ADRs) are immutable logs of engineering choices defining the Why, What, and strict Boundary of a technical decision.
**Command: `/ADR [topic]` or `/ADR bulk`**
* **Usage:** Run after resolving a friction point or architecture debate.
* **Output:** A JSON object or array representing the ADR.
* **Action:** Paste into the "+ Quick ADR" smart paste box to add to the ledger. Toggle to `[ARCHIVED]` once fully implemented in code so it stops consuming prompt tokens.

### D. The Epic Ledger & Roadmap (Roadmap Tab)
**Feature:** A 4-tier Agile hierarchy (Initiative > Epic > Sprint > Objective) that bounds the AI's cognitive scope using statuses: `[PENDING]`, `[ACTIVE]`, `[PARKED]`, and `[COMPLETED]`.
**Command: `/ROADMAP`**
* **Usage:** Run to auto-generate or deeply restructure the project lifecycle.
* **Output:** A multi-tiered JSON array.
* **Action:** Paste into the Raw JSON Editor and click "Smart Merge (Upsert)".

### E. Execution & Version Control Commands
**Command: `/cli`**
* **Usage:** The trigger to finalize reasoning and write actual code.
* **Output:** An isolated JSON script for The Coder (gemini-cli) detailing exact file edits.

**Command: `/git`**
* **Usage:** Run when ready to commit work to the repository.
* **Output:** Prompts the PM for `git status`, then provides exact `git add/commit/push` terminal commands.

---

## 3. Standard Operating Procedures (SOPs)

### Procedure A: Session Initialization
**Purpose:** To securely tether the AI Architect to the current project state and activate SudoLang constraints.
1. Update SudoLang rules in the **Prompts** tab if necessary and click "Save Rules".
2. Click the dark **Copy Prompt** button at the top right of the Hub.
3. Paste the copied payload into a new AI chat window.
4. Wait for the AI to acknowledge its Role and the System State.

### Procedure B: Architectural Decision Making
**Purpose:** To resolve a technical debate and permanently log the guardrails so the AI does not deviate in the future.
1. Discuss the problem with the Architect without generating code.
2. Reach a consensus on the approach.
3. PM types: `Please formalize this as an ADR. /ADR`
4. Copy the JSON output, click **+ Quick ADR** in the Hub, paste it into the Smart Dropzone, and commit to the ledger.

### Procedure C: The Execution Loop
**Purpose:** To safely convert architecture into codebase changes via The Coder.
1. Ensure the relevant objective is toggled to `[ACTIVE]` in the Epic Ledger.
2. PM types: `Draft the execution steps for this feature. /cli`
3. Copy the isolated JSON block output by the Architect.
4. Pass the JSON to The Coder (gemini-cli) in your local terminal.
5. Review the codebase changes.

### Procedure D: State Wrap-Up & Version Control
**Purpose:** To save the project state into the Hub and commit code to the repository.
1. PM types: `Update our session context. /state`
2. Paste the JSON into the Session Tab's Smart Wrap-Up Import.
3. PM types: `Let's commit these changes. /git`
4. Provide `git status` when asked.
5. Run the generated `git` commands in your terminal.

### Procedure E: CLI-Native Blueprint Updates
**Purpose:** To safely update the project architecture via the CLI.
1. PM discusses architectural changes with the Architect.
2. PM runs: `/UPDATE_BLUEPRINT`
3. PM passes the raw Markdown output to The Coder (gemini-cli) to overwrite the local file.
4. PM runs: `/git` to secure the new baseline.
