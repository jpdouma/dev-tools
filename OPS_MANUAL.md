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

## 4. The Context Cycle Workflow
1. **Compile:** Enter your Workspace. Click **Copy SudoLang Payload** 
and paste it into a fresh AI chat window.
2. **Govern:** When a decision is made, click **+ Quick ADR** to log 
the rule immediately. If the AI generated multiple ADRs, paste them in 
the Smart Import box to review and commit them one-by-one.
3. **Commit:** Type `/WRAPUP` in the chat. Paste the AI's 
changelog/objectives into the *Session* tab, paste the JSON into the 
*Blueprint* tab, and hit **Save State**.

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
