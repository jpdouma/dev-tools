# ADR 002: CLI-Native Blueprint Markdown Pattern

**Status:** `[ACTIVE]`
**Scope:** `[CORE_FRAMEWORK]`
**Date:** April 14, 2026

## 1. Context & Friction (The "Why")
Historically, managing system blueprints through web UI textareas creates significant vulnerabilities. Browsers can crash, textareas lack native version control, and forcing an LLM to rewrite a massive Markdown file to change a single sentence frequently results in hallucinations or truncated text. 

## 2. Ruling (The "What")
The Universal Context Hub will enforce a CLI-Native pattern for all core documentation updates.
* **No UI Editing:** We will not build or use WYSIWYG editors or massive textareas in the frontend to edit `blueprint.md` or ADRs.
* **CLI Patches:** All modifications to core context files must be executed via discrete, targeted JSON patches applied directly to the file system by the local execution agent (The Coder).

## 3. Consequences
This ensures a perfect, Git-tracked paper trail of how the architecture evolves, prevents accidental data loss from UI glitches, and keeps the AI's generation payload lean, fast, and highly accurate.