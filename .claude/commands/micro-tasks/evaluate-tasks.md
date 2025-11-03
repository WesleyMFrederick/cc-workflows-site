---
argument-hint: "[json-file-path] [task-focus]"
---

# Evaluate Tasks

## Usage
- `/evaluate-tasks` - Evaluate all remaining tasks from most recent micro-intents JSON in conversation
- `/evaluate-tasks "path/to/tasks.json"` - Evaluate all remaining tasks from specific file
- `/evaluate-tasks "9,10,13"` - Focus evaluation on specific task IDs from recent conversation
- `/evaluate-tasks "path/to/tasks.json" "9,10,13"` - Focus on specific tasks from specific file
- `/evaluate-tasks "remaining"` - Evaluate only incomplete tasks from recent conversation

**ULTRATHINK**: **Analyze** the **task list** from the provided micro-intents JSON file or the most recent one mentioned in this conversation. **Re-evaluate** each task's relevance, dependencies, and priority to identify which tasks are still relevant and determine the next best task to complete. **Provide** actionable recommendations for task prioritization and scope management.

## File Processing Logic
If file path is provided ($1 is not empty):
- Read the JSON file from the provided path
- Analyze all tasks for relevance and dependencies
- Provide evaluation and recommendations

If no path provided ($1 is empty):
- Use the most recent micro-intents JSON file mentioned in this conversation
- Analyze the task list state from that context
- Provide evaluation and recommendations

<user-request-context>
Input: $1 $2

**Parameter Processing**:
1. **File Path ($1)**:
   - If contains file path → read and analyze that JSON file
   - If empty → use most recent micro-intents JSON from conversation
   - If "remaining" → analyze only incomplete tasks from recent conversation

2. **Task Focus ($2)**:
   - If comma-separated task IDs (e.g., "9,10,13") → focus evaluation on those specific tasks
   - If empty → evaluate all tasks (or all remaining if $1 is "remaining")

**Processing Logic**:
- **File + Focus**: `/evaluate-tasks "path/to/file.json" "9,10,13"` → analyze specific tasks from file
- **Focus Only**: `/evaluate-tasks "9,10,13"` → analyze specific tasks from recent conversation
- **File Only**: `/evaluate-tasks "path/to/file.json"` → analyze all tasks from file
- **Remaining Only**: `/evaluate-tasks "remaining"` → analyze incomplete tasks from recent conversation
- **No Parameters**: `/evaluate-tasks` → analyze all tasks from recent conversation

If no file path provided and no recent task list found in conversation, ask user to specify the JSON file path or provide task list information.
</user-request-context>

<output>
The expected output is a structured task evaluation with clear recommendations.

<evaluation-methodology>
**Task Relevance Analysis**: Evaluate each task against current project state and user needs.

**Evaluation Criteria** (4 key factors):
1. **Completion Status**: Current task status (completed, in_progress, not started)
2. **Dependency Readiness**: Are prerequisite tasks completed and inputs available?
3. **Value Assessment**: How critical is this task for project success?
4. **Scope Appropriateness**: Is the task well-defined and appropriately scoped?

**Priority Classification**:
- **HIGH**: Critical path tasks that are dependency-ready and well-scoped
- **MEDIUM**: Important tasks that may need refinement or have soft dependencies
- **LOW**: Nice-to-have tasks or those requiring significant scope clarification
- **DEFER**: Tasks that should be moved to backlog or removed

**Next Task Selection Logic**:
- Prioritize tasks with completed dependencies
- Consider effort vs. value ratio
- Prefer tasks that unblock other work
- Factor in current project momentum and context
</evaluation-methodology>

<structured-output-format>
## Task List Evaluation

### Current Status Summary
- **Completed**: [X/Y tasks] (list IDs)
- **In Progress**: [task IDs if any]
- **Remaining**: [X tasks] (list IDs)

### Task-by-Task Analysis
For each remaining task, provide:
- **Task ID & Title**: Brief task description
- **Status**: Current status and dependency assessment
- **Relevance**: HIGH/MEDIUM/LOW/DEFER with brief reasoning
- **Blockers**: Any impediments or missing prerequisites
- **Scope Notes**: Comments on task definition quality

### Recommendations

#### Next Best Task
**Task [ID]: [Title]**
- **Why**: Clear reasoning for selection
- **Dependencies**: What's needed to start
- **Expected Effort**: Time/complexity estimate
- **Value**: What this unlocks or completes

#### Task Prioritization
**HIGH Priority** (should complete):
- [List task IDs with brief rationale]

**MEDIUM Priority** (consider scope/timing):
- [List task IDs with brief rationale]

**LOW Priority / DEFER** (backlog or remove):
- [List task IDs with brief rationale]

#### Scope Management Suggestions
- **Tasks to Remove**: [IDs] - [reasoning]
- **Tasks to Refine**: [IDs] - [what needs clarification]
- **Tasks to Split**: [IDs] - [how to break down]
- **Tasks to Add**: [suggested new tasks if gaps identified]
</structured-output-format>

<example-evaluation-output>
## Task List Evaluation

### Current Status Summary
- **Completed**: 6/8 tasks (1, 2, 3, 4, 5, 12)
- **In Progress**: None
- **Remaining**: 6 tasks (9, 6, 7, 8, 10, 13)

### Task-by-Task Analysis

**Task 9: Create documentation and guidelines**
- **Status**: Ready to start, has all dependencies completed
- **Relevance**: HIGH - Critical for project completion and team adoption
- **Blockers**: None - infrastructure and tests are complete
- **Scope Notes**: Well-defined, leverages existing README/CLAUDE.md work

**Task 6: Configure CI/CD integration**
- **Status**: Not started, unclear dependencies on external infrastructure
- **Relevance**: MEDIUM-LOW - Good practice but scope unclear
- **Blockers**: Unknown CI/CD pipeline requirements
- **Scope Notes**: Needs clarification on target environment and requirements

### Recommendations

#### Next Best Task
**Task 9: Create documentation and guidelines**
- **Why**: Natural completion point that consolidates all work into team-usable format
- **Dependencies**: Tasks 4, 5, 12 completed (✅), existing documentation to build upon
- **Expected Effort**: Medium - can leverage existing documentation updates
- **Value**: Enables team adoption of entire testing infrastructure

#### Task Prioritization
**HIGH Priority** (should complete):
- Task 9: Documentation - Critical for project completion
- Task 10: Validation - Quality gate before declaring complete

**MEDIUM Priority** (consider scope/timing):
- Task 13: E2E CLI tests - Important for regression prevention

**LOW Priority / DEFER** (backlog or remove):
- Task 6: CI/CD integration - Scope unclear, could introduce complexity
- Task 7: Coverage reporting - Vitest already provides this
- Task 8: Test templates - Current tests serve as examples

#### Scope Management Suggestions
- **Tasks to Remove**: 7, 8 - Redundant with existing infrastructure
- **Tasks to Refine**: 6 - Needs user clarification on CI/CD requirements
- **Next Focus**: Complete high-value core tasks (9, 10, 13) before scope expansion
</example-evaluation-output>
</output>

## Processing Instructions

**Step 1: Determine Data Source**
- If $1 contains file path → read JSON file from specified path
- If $1 is "remaining" → use recent conversation JSON, filter to incomplete tasks only
- If $1 is empty → use most recent micro-intents JSON from conversation (all tasks)

**Step 2: Apply Task Focus Filter**
- If $2 contains comma-separated IDs (e.g., "9,10,13") → focus analysis on those specific tasks only
- If $2 is empty → analyze all tasks from Step 1

**Step 3: Execute Evaluation**
- Parse task IDs from $2 if provided, validate they exist in the JSON
- Apply evaluation methodology to the filtered task set
- Generate structured output with recommendations
- If focused on specific tasks, still provide context about overall task list status

**Error Handling**:
- If file path invalid → ask user to verify path
- If task IDs in $2 don't exist → list available task IDs and ask user to correct
- If no JSON found in conversation → ask user to provide file path or task list
