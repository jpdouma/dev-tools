# Hub Operations Manual

## 1. Creating & Loading Workspaces
The workspace box in the top-left is a creator. Just type the name of 
your project (e.g. `omega-protocol`) and hit **Load / Create**. The Hub 
will instantly build the isolated folder structure for you.

## 2. Linking Your Source Code
The Hub keeps its memory isolated from your real source code. To allow 
the AI to "see" your code during Handover:
1. Click the **⚙️ Tools** menu and select **🔗 Link Source Code**.
2. Drag and drop your real project folder into the box (or type the 
path).
3. The Hub will automatically generate the required bash script to scan 
your directory and inject it into the AI payload!

## 3. Linting Your SudoLang
Writing strict, declarative constraints is critical. Before deploying 
new SudoLang rules to the AI, you can audit them for architectural 
purity:
1. Open the **Prompts** tab in the Context Drawer.
2. Click the **✨ Lint SudoLang** button. This copies your code wrapped 
in an expert Linter prompt.
3. Paste it into your LLM chat. The AI will score your code and output 
a perfected, idiomatic rewrite!

## 4. The 4-Hour Context Cycle Workflow
Because LLMs experience context degradation after several hours of deep 
architectural work, the Hub acts as a "Memory Cartridge" to save your 
state. We utilize a **Bifurcated Intelligence Workflow**: the Hub/Web LLM 
acts as the *Architect*, and your local terminal (`gemini-cli`) acts as 
the *Syntax Executor*.

**Phase 1: The Boot (Minute 0)**
1. Ensure your codebase is linked and your environment is selected.
2. Click **Copy Prompt** in the Hub.
3. Paste the payload into a fresh, high-performance AI chat window to 
establish the macro-architecture baseline.

**Phase 2: The Iterative Loop (Hours 0 - 4)**
1. **Brainstorm:** Discuss logic and architecture with the Web AI. 
2. **Work Order:** The Web AI generates a strict prompt engineered for 
the CLI.
3. **Execution:** Paste the prompt into `gemini-cli` to securely edit 
local files.
4. **Govern:** If a major architectural decision is made during this loop, 
log it immediately in the Hub via **+ Quick ADR**.

**Phase 3: The Migration (Hour 4+)**
When the AI's context begins to degrade, it is time to migrate:
1. Issue the `/UPDATE_BLUEPRINT` (or `/WRAPUP`) command to the Web AI.
2. The AI will read your final `git diff` and output a mutated JSON 
Blueprint, a Session Changelog, and Next Objectives.
3. Paste the JSON into the *Blueprint* tab (under Advanced), and paste 
the text into the *Session* tab.
4. Click **Save State**. 
5. Close the degraded AI window. Your project state is now saved and 
ready for a fresh boot.

## 5. Rich Media & Math (Images & LaTeX)
The Hub natively supports local image rendering and complex 
mathematical formulas in both your Blueprints and this Manual.

**To Embed Images:**
The Hub acts as a local web server. 
1. Create an `assets` folder in the same root directory as your 
`server.js` and `index.html`.
2. Place your image inside it (e.g., `diagram.png`).
3. Use standard Markdown anywhere to render it: 
   `![My Architecture Diagram](./assets/diagram.png)`

**To Render Math (KaTeX):**
The Hub automatically sweeps your documents for LaTeX formulas and 
renders them.
* For inline math, wrap your equation in single dollar signs: 
`$E=mc^2$`
* For display/block math, wrap it in double dollar signs: `$$a^2 + b^2 
= c^2$$`