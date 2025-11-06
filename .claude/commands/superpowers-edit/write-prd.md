---
description: "Use when creating requirements documents, PRDs, or epics with user stories - ensures Obsidian block anchors, wiki links for traceability, and citation-manager validation for link integrity"
argument-hint: "<whiteboard-file-path> (Optional)"
---

# Write Requirements Document / PRD

Use your `writing-requirements-documents` skill, making sure to ground the requirements in the **optional** whiteboard-file-path argument: $1

## Input Validation

If path is provided ($1 is populated), respond with: "Writing-requirements-documents skill initiated using whiteboard: $1"

<task-paths-input>
Arguments: $1
</task-paths-input>

## Load Skill & Execute Plan
1. Load `writing-requirements-documents` skill
2. If whiteboard-file-path argument provided, read @$1
3. Gather additional context

   ```bash
   citation-manager extract links $1
   ```

4. Use steps 2-3 to ground your requirements document creation
