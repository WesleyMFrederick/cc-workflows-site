---
description: "Execute implement plan using your `subagent-driven-development` skill"
argument-hint: "<task-file-or-folder-path>"
---

# Execute Tasks
Execute implement plan using your `subagent-driven-development` skill.

## Input Validation

If no path is provided ($1 is empty), respond with: "Error: Please provide at least task file. Usage: /execute-tasks '<path>'"

<task-paths-input>
Arguments: $1
</task-paths-input>

## Load Skill & Execute Plan
1. Load `subagent-driven-development` skill
2. Implement tasks for @$1
