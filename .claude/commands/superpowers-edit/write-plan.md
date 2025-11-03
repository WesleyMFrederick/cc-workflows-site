---
description: "Use when design is complete and you need detailed implementation tasks - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps"
argument-hint: "<design-file-or-folder-path> (Optional)"
---

# Write Implementation Plan
Use your `writing-plans` skill, making sure to ground the plan in the **optional** design-file-or-folder-path argument: $1

## Input Validation

If path is provided ($1 is populated), respond with: "Writing-plans skill initiated using design plan: $1

<task-paths-input>
Arguments: $1
</task-paths-input>

## Load Skill & Execute Plan
1. Load `writing-plans` skill
2. If design-file-or-folder-path argument provided, read @$1
3. Gather additional context

   ```bash
   npm run citation:extract:content $1
   ```

4. Use steps 2-3 to ground your implementation plan
