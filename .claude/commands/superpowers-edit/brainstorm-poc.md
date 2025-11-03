---
description: "Use when requirements specify risky technical assumptions before implementing full features - creates sequential POC plans with parallel research validation, design documentation, and risk mitigation for incremental confidence building"
argument-hint: "<requirements-file-or-folder-path> (Optional)"
---

# Brainstorm Proof-of-Concept Plan
Use your `brainstorm-proof-of-concept-plan` skill, making sure to ground the POC planning in the **optional** requirements-file-or-folder-path argument: $1

## Input Validation

If path is provided ($1 is populated), respond with: "POC planning skill initiated using requirements: $1"

<task-paths-input>
Arguments: $1
</task-paths-input>

## Load Skill & Execute Plan
1. Load `brainstorm-proof-of-concept-plan` skill
2. If requirements-file-or-folder-path argument provided, read @$1
3. Gather additional context

   ```bash
   npm run citation:extract:content $1
   ```

4. Use steps 2-3 to ground your POC planning
