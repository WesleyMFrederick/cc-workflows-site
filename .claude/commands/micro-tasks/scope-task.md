---
argument-hint: "<task-id>" "[micro-intents-file-path]"
---

# Scope Task

## Usage
- `/scope-task 1 "development-docs/update-task/update-task-micro-intents.json"` - Scope task from file
- `/scope-task 1` - Scope task from previous micro-intents output in conversation

**Analyze** the specified **task** from a **micro-intents JSON structure**. **Populate** all required schema fields including acceptanceCriteria, todoList, inputs, and dependencies. **Ensure** task completeness by defining clear deliverables in outputs.acceptanceCriteria. **Transform** task from conceptual to implementation-ready state with comprehensive scoping.

## Input Validation
If no task ID is provided ($1 is empty), respond with: "Error: Please provide a task ID to scope. Usage: /scope-task '<task-id>' '[optional-file-path]'"

<task-id-input>
$1
</task-id-input>

<file-path-input>
$2
</file-path-input>

<scoping-context>
**File Path Processing**: If $2 contains a file path, read and process that JSON file to find task $1
**Previous Output Processing**: If $2 is empty, use JSON output from `/return-micro-intents` or `/create-task-sequence` command in this conversation

If neither file path nor previous output is available, instruct the user to run `/return-micro-intents` first or provide a JSON file path.
</scoping-context>

<scoping-methodology>
**Task Completeness Assessment**: Evaluate current task definition against full schema requirements:
- Check for missing or empty required fields
- Identify incomplete field definitions (e.g., empty arrays, placeholder text)
- Assess clarity and specificity of task description
- Validate phase alignment with task nature

**Context Gathering Before Scoping**:
1. **Target Task**: Extract task $1 with all existing fields
2. **Dependencies Analysis**:
   - Read all tasks currently in dependsOn.ids array
   - Identify additional tasks that should be dependencies
   - Understand outputs from dependency tasks that become inputs
3. **Sequential Context**:
   - Review previousTask for workflow understanding
   - Consider nextTask for proper output alignment
4. **Domain Understanding**: Analyze userRequestQuery for overall project context

**Schema Population Process**:
1. **outputs.acceptanceCriteria** (CRITICAL - Must be populated):
   - Define specific, measurable deliverables
   - Include file paths for expected outputs
   - Describe the success criteria for task completion
   - Format: Array of strings with clear descriptions: ["Deliverable 1 with path: /path/to/output", "Success criteria 2"]

2. **todoList Generation**:
   - Break task into 3-8 actionable steps
   - Each item must have:
     - `task`: Specific action description
     - `useSubAgent`: Boolean flag (true for complex/autonomous work)
   - Order items by logical execution sequence
   - Include validation/testing steps where appropriate

3. **inputs Field**:
   - `summary`: Describe required inputs from dependencies and context
   - `paths`: List specific file paths needed for task execution

4. **dependsOn Refinement**:
   - `ids`: Array of task IDs this depends on
   - `reasoning`: Clear explanation of why these dependencies exist

5. **scopeNotes Addition**:
   - Technical considerations and constraints
   - Assumptions being made
   - Risks or uncertainties identified
   - Implementation hints or preferred approaches

6. **Status and Phase Validation**:
   - Update status to "ready" if fully scoped
   - Ensure phase aligns with task type:
     - "discovery" - Research/analysis tasks
     - "planning" - Design/architecture tasks  
     - "implementation" - Coding/building tasks
     - "validation" - Testing/review tasks
</scoping-methodology>

<output>
The expected output is a fully-scoped task with all schema fields populated:

<example-task-input>
Task ID: 1
Current State: Minimal definition with only basic fields
</example-task-input>

<example-scoped-output>
{
    "task": {
        "id": 1,
        "task": "clarify specific goals and success criteria for the schema update tool compared to baseline functionality",
        "intentType": "explicit",
        "implicitCategory": null,
        "reasoning": "User needs clear requirements definition before implementation can begin",
        "status": "ready",
        "phase": "discovery",
        "nextTask": 2,
        "previousTask": null,
        "dependsOn": {
            "ids": [13, 14, 15],
            "reasoning": "Needs baseline understanding from task 13, schema documentation from task 14, and improved reordering logic from task 15 to properly scope requirements"
        },
        "inputs": {
            "summary": "PRD document with current tool patterns, JSON schema definition, improved reorder script from dependencies",
            "paths": [
                "development-docs/update-task/schema-update-tool-prd.md",
                "development-docs/schemas/micro-intents-schema.json",
                "src/reorder-tasks.js"
            ]
        },
        "outputs": {
            "acceptanceCriteria": [
                "Comprehensive requirements document defining specific gaps between current and desired functionality",
                "Success criteria with measurable outcomes documented",
                "Functional requirements list with clear specifications",
                "Non-functional requirements defined",
                "Expected output file created: development-docs/update-task/requirements.md"
            ],
            "summary": "",
            "paths": []
        },
        "todoList": [
            {"task": "Review baseline schema structure from return-micro-intents command output", "useSubAgent": false},
            {"task": "Analyze target schema example from task 12 documentation", "useSubAgent": false},
            {"task": "Compare current vs desired schema to identify specific gaps", "useSubAgent": false},
            {"task": "Collaborate with user to clarify ambiguous requirements", "useSubAgent": false},
            {"task": "Document functional requirements with acceptance criteria", "useSubAgent": true},
            {"task": "Define non-functional requirements (performance, usability, maintainability)", "useSubAgent": false},
            {"task": "Create comprehensive requirements document with all findings", "useSubAgent": true},
            {"task": "Validate requirements completeness against original request", "useSubAgent": false}
        ],
        "scopeNotes": "This discovery task focuses on requirements gathering and clarification. Key considerations: 1) Must differentiate between 'nice-to-have' and 'must-have' features, 2) Should include specific examples of schema transformations, 3) Requirements should be testable and measurable, 4) Consider backward compatibility requirements, 5) Define clear boundaries of what the tool will NOT do"
    }
}

Scoping Actions Taken:
1. ✅ Populated outputs.acceptanceCriteria with specific deliverables
2. ✅ Created comprehensive 8-item todoList with subagent flags
3. ✅ Defined inputs.summary and paths based on dependencies
4. ✅ Added detailed scopeNotes with technical considerations
5. ✅ Updated status to "ready" for implementation
6. ✅ Validated phase alignment with task nature
</example-scoped-output>
</output>

## Status Management

// "enum": ["to_do", "needs_scoping", "ready", "in_progress", "in_review", "done", "blocked"]

**Status Transitions for Scoping** (following snake_case convention):
- `"to_do"` → `"needs_scoping"` - Task identified but not yet analyzed
- `"needs_scoping"` → `"ready"` - Task fully scoped and implementation-ready
- Any status → `"needs_scoping"` - Task requires additional clarification

**Scoping Completion Criteria**:
Task can only move to `"ready"` status when:
- outputs.acceptanceCriteria is populated with clear deliverables
- todoList contains actionable implementation steps
- inputs are identified and documented
- dependencies are properly defined
- scopeNotes capture key considerations

**Status Values This Command Can Set**:
- `"needs_scoping"` - Task requires further analysis
- `"ready"` - Task fully scoped and ready for implementation

**Read-Only Status Values**:
- `"in_progress"` - Set by /implement-task command
- `"in_review"` - Set when implementation complete
- `"done"` - Set after validation
- `"blocked"` - Set when dependencies unavailable

## Resilience Instructions

**If Task Not Found**: "Task ID $1 not found in micro-intents structure. Available task IDs: [list all task IDs]"

**If Task Already Fully Scoped**: "Task $1 appears to be fully scoped. Current outputs.acceptanceCriteria: '[show acceptanceCriteria]'. Would you like to refine the scope?"

**If Dependencies Not Valid**: "Warning: Task $1 references dependencies [list IDs] that don't exist in the task list. Proceeding with available tasks."

**If Circular Dependencies Detected**: "Error: Task $1 would create a circular dependency. Please review the dependency chain: [show chain]"

**If Required Fields Missing from Schema**: "Task $1 is missing required schema fields: [list fields]. Adding default structure to ensure compatibility."

**For Ambiguous Task Descriptions**: "Task $1 description is ambiguous. Generating scope based on context, but user validation recommended for: [list uncertainties]"

## Save Instructions

**For File Processing** (when $2 contains a file path):
- Update the task with all scoped fields in the JSON file
- Set status to "ready" if scoping successful
- Save modified JSON back to the original file
- Confirm with: "Task $1 successfully scoped. Status updated to 'ready' in [filename]"

**For Conversation Processing** (when $2 is empty):
- Display the fully scoped task structure
- Show before/after comparison of key fields
- Highlight the populated outputs.acceptanceCriteria field
- Present the generated todoList for validation

## Interactive Refinement

**User Collaboration Points**:
If during scoping, clarification is needed:
1. Present the ambiguity clearly
2. Offer 2-3 interpretations as options
3. Wait for user selection or clarification
4. Continue scoping with provided direction

**Scope Validation Prompts**:
After initial scoping, ask:
- "Does the outputs.acceptanceCriteria field accurately capture your expected deliverables?"
- "Should any additional tasks be included in the todoList?"
- "Are there technical constraints I should note in scopeNotes?"

This ensures collaborative scoping that aligns with user expectations while maintaining schema completeness.
