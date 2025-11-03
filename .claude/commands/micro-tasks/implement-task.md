---
argument-hint: "<task-id>" "[micro-intents-file-path]"
---

# Implement Task

## Usage
- `/implement-task 1 "development-docs/update-task/update-task-micro-intents.json"` - Implement task from file
- `/implement-task 1` - Implement task from previous micro-intents output in conversation

**Implement** the specified **task** from a **micro-intents JSON structure**. **Validate** task readiness, **gather** context from dependencies and related tasks, and **execute** the implementation following the task's todoList roadmap. **Track** progress systematically and **update** task status upon completion.

## Input Validation
If no task ID is provided ($1 is empty), respond with: "Error: Please provide a task ID to implement. Usage: /implement-task '<task-id>' '[optional-file-path]'"

<task-id-input>
$1
</task-id-input>

<file-path-input>
$2
</file-path-input>

<implementation-context>
**File Path Processing**: If $2 contains a file path, read and process that JSON file to find task $1
**Previous Output Processing**: If $2 is empty, use JSON output from `/return-micro-intents` or `/create-task-sequence` command in this conversation

If neither file path nor previous output is available, instruct the user to run `/return-micro-intents` first or provide a JSON file path.
</implementation-context>

<implementation-methodology>
**Task Status Validation**: The task status must be "ready" to proceed. If status is not "ready":
- Display current status and blockers
- Offer to change status to "ready" with explicit user validation
- Proceed only after confirmation
- **Valid Status Updates**: Command can only update status to "needs_scoping", "in_progress", or "in_review"

**Context Analysis Before Implementation**:
1. **Target Task**: Extract task $1 with full definition including inputs, outputs, todoList, scopeNotes
2. **Dependencies**: Read all tasks listed in dependsOn.ids array to understand prerequisites
3. **Previous Task**: Review task referenced by previousTask field for workflow continuity
4. **Next Task**: Consider task referenced by nextTask field to ensure proper handoff
5. **Input Files**: Process all file paths listed in inputs.paths array
6. **CRITICAL**: Extract and re-iterate the outputs.targets specification - this defines exactly what must be delivered

**Implementation Execution**:
1. **Create TodoWrite list** from the task's todoList array to track progress
2. **CRITICAL**: Display the outputs.targets specification prominently to ensure clear understanding of expected deliverables
3. **Process each todo item** sequentially:
   - Items with `"useSubAgent": false` → Implement directly
   - Items with `"useSubAgent": true` → Follow Sub-Agent Validation Process (see below)
4. **Update targets field** with intended deliverables (do not populate outputs until work is complete)

**Sub-Agent Validation Process**:
When a todoList item has `"useSubAgent": true`:
1. **Write the prompt** for the sub-agent that includes:
   - **Required Todo Items to Complete**: List all specific todo items with `"useSubAgent": true` that the sub-agent must accomplish
   - **Task requirements and context** from the main task definition
   - **Expected deliverables** from outputs.targets specification
   - **Input paths** and relevant background information
2. **Present the prompt to the user** for validation with clear formatting
3. **HALT and wait** for explicit user approval or modifications
4. **Only after validation**, pass the prompt EXACTLY as approved to the Task tool with appropriate agent type

**Todo Item Delegation Pattern**: Sub-agents should receive the specific work breakdown from the orchestrator's planning to ensure systematic, comprehensive execution. This minimizes information loss and guarantees all delegated items are completed thoroughly.
</implementation-methodology>

<output>
The expected output is the successful implementation of the specified task with:
- All todoList items completed
- Task status updated to "in_review" for validation
- Proper documentation of changes made
- Outputs populated only after actual deliverables are created

<example-task-input>
Task ID: 1
File: "development-docs/update-task/update-task-micro-intents.json"
</example-task-input>

<example-implementation-flow>
{
    "task": {
        "id": 1,
        "task": "clarify specific goals and success criteria for the schema update tool compared to baseline functionality",
        "status": "ready",
        "phase": "discovery",
        "dependsOn": {
            "ids": [13, 14, 15],
            "reasoning": "Needs baseline understanding from task 13, schema documentation from task 14, and improved reordering logic from task 15"
        },
        "inputs": {
            "summary": "PRD document with current tool patterns, JSON schema definition, improved reorder script",
            "paths": [
                "/path/to/prd.md",
                "/path/to/schema.json",
                "/path/to/reorder-tasks.js"
            ]
        },
        "targets": {
            "summary": "Clarified goals, success criteria, and functional requirements document",
            "paths": ["/path/to/requirements.md"]
        },
        "outputs": {
            "summary": "",
            "paths": []
        },
        "todoList": [
            {"task": "Review baseline schema from return-micro-intents command", "useSubAgent": false},
            {"task": "Examine target schema example from task 12", "useSubAgent": false},
            {"task": "Collaborate with user to clarify specific goals", "useSubAgent": false},
            {"task": "Document agreed-upon requirements", "useSubAgent": true}
        ]
    }
}

Implementation Steps:
1. Validate task 1 status is "ready" ✓
2. Read dependency tasks 13, 14, 15 for context
3. Process all input files from inputs.paths
4. **CRITICAL**: Display outputs.targets specification prominently
5. Create TodoWrite list with 4 items from todoList
6. Execute each todo item:
   - Items 1-3: Implement directly (useSubAgent: false)
   - Item 4: Follow Sub-Agent Validation Process (useSubAgent: true)
     - Write prompt including specific todo items
     - Present prompt to user for validation
     - HALT and wait for approval
     - Pass approved prompt EXACTLY to Task tool

**Example Sub-Agent Prompt Format**:

```text
Document agreed-upon requirements using [agent-type] sub-agent. You need to complete the following specific todo item as part of this task:

**Required Todo Items to Complete:**
4. Document agreed-upon requirements

**Context**: [Task context and background]

**Expected Deliverable**: [From outputs.targets specification]

**Input Paths to Process**: [From inputs.paths array]

**Constraints**: [Any specific constraints or patterns to follow]
```

1. Update status to "in_review" for user validation
2. **CRITICAL**: Update outputs.paths array with exact file paths of all files created/modified during implementation
3. Update outputs.summary with description of actual deliverables created
</example-implementation-flow>
</output>

## Status Management

// "enum": ["to_do", "needs_scoping", "ready", "in_progress", "in_review", "done", "blocked"]

**Available Status Values for Updates** (following snake_case convention):
- `"needs_scoping"` - Task requires further clarification
- `"in_progress"` - Task implementation is underway  
- `"in_review"` - Task completed and ready for validation

**Other Status Values** (read-only for this command):
- `"ready"` - Task is ready for implementation (required to start)
- `"done"` - Task successfully completed (set by reviewer)
- `"blocked"` - Task cannot proceed due to dependencies

**Status Transition Rules**:
- Only implement tasks with status `"ready"`
- Offer to transition from other statuses with user consent
- Update to `"in_review"` upon successful implementation
- Command cannot set status to `"done"` - reserved for reviewer validation

## Resilience Instructions
**If Task Not Found**: "Task ID $1 not found in micro-intents structure. Available task IDs: [list all task IDs]"

**If Dependencies Not Complete**: "Warning: Task $1 depends on tasks [list IDs] which are not marked as 'done'. Review dependency status before proceeding."

**If Input Files Missing**: "Warning: Cannot access input file [path]. Proceeding with available resources."

**If TodoList Not Present**: "Task $1 does not have a todoList. Implementing based on task description and outputs specification."

**For Complex Implementations**: When `"useSubAgent": true` appears in todoList, always use the Task tool with appropriate agent type (general-purpose, test-writer, application-tech-lead, etc.)

## Save Instructions
**For File Processing** (when $2 contains a file path):
- Update the task status in the JSON file to "in_review" after successful implementation
- Save any modified JSON back to the original file
- Confirm completion with: "Task $1 implementation complete. Status updated to 'in_review' in [filename]"

**For Conversation Processing** (when $2 is empty):
- Display the implementation summary and changes made
- Show the updated task with status "in_review"
