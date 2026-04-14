# ADR 001: The Dual-Repository Architecture

**Status:** `[ACTIVE]`
**Scope:** `[CORE_FRAMEWORK]`
**Date:** April 14, 2026

## 1. Context & Friction (The "Why")
In AI-assisted development workflows, project context scales rapidly. Storing these meta-files inside the actual application code repository creates severe friction:
* It pollutes the application's git commit history with purely AI-related planning data.
* It risks accidental deployment of sensitive AI prompts, raw JSON states, or architectural notes into production environments.
* It degrades LLM performance by forcing the Context Compiler to parse its own instructional state alongside the actual source code it is meant to analyze and edit.

## 2. Ruling (The "What")
The system will enforce a strict physical separation of concerns via a Dual-Repository Pattern.
* **Repo A (Application Code):** Contains strictly the execution code, standard package management, and traditional application architecture.
* **Repo B (Context Repository):** A dedicated, standalone local directory that houses `blueprint.md`, `roadmap.json`, `system_prompts.json`, ADRs, and session archives.

The Node/Express backend will strictly bind its read/write governance operations to Repo B.

## 3. Boundaries (The "What Not")
The application code repository (Repo A) must *never* contain AI governance files. The separation must remain absolute at the file-system level.