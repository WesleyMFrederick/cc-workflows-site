---
argument-hint: "[json-file-path]"
---

# Create Task Sequence

## Usage
- `/create-task-sequence` - Process previous `/return-micro-intents` output from conversation
- `/create-task-sequence "path/to/micro-intents.json"` - Process JSON file and save as `micro-intents-with-sequence.json`

**Review** the **previous JSON output** from the `/return-micro-intents` command in this conversation OR **process the JSON file path provided in the slash command arguments**. **Extract** the tasks array and **analyze** each task to create an optimal serial execution sequence with phase classification. **Assign** sequence numbers and phases that reflect logical workflow progression while maintaining domain-agnostic analysis principles.

## File Processing Logic
If file path is provided ($1 is not empty):
- Read the JSON file from the provided path
- Process the tasks to add sequencing
- Generate new filename by inserting `-with-sequence` before the file extension
  - Example: `micro-intents.json` → `micro-intents-with-sequence.json`
  - Example: `analysis.json` → `analysis-with-sequence.json`
- Save the enhanced JSON to the new filename

<user-request-context>
Input: $1

1. **File Path Processing**: If $1 contains a file path, read and process that JSON file
2. **Previous Output Processing**: If $1 is empty, use JSON output from `/return-micro-intents` command in this conversation

If neither file path nor previous output is available, instruct the user to run `/return-micro-intents` first or provide a JSON file path.
</user-request-context>

<output>
The expected output enhances the original JSON structure by adding `nextTask`, `previousTask`, and `phase` fields to each task while preserving all existing fields.

<sequencing-methodology>
**Simple Dependency-Based Sequencing**: Focus on "what needs what" rather than complex phase classification. Look for dependency clues in task descriptions to create natural ordering.

**Dependency Detection Rules** (3 simple rules):
1. **Discovery First**: Tasks with words like "existing", "current", "understand", "examine" go first
2. **Follow Dependencies**: Tasks with words like "based on", "using", "integrate", "ensure compatibility", "after" follow their prerequisites
3. **Validation Last**: Tasks with words like "test", "verify", "validate", "monitor" go last

**Natural Ordering Logic**:
- Read task descriptions for dependency words that indicate prerequisites
- Order by what must exist before this task can happen
- Don't force rigid phase classification - let dependencies drive sequence
- Handle ambiguous verbs by context: "ensure compatibility" goes after the things being made compatible

**Dependency Keywords to Look For**:
- **Prerequisites**: "based on", "using", "integrate", "ensure compatibility", "after", "requires"
- **Foundational**: "existing", "current", "understand", "examine", "review"
- **Validation**: "test", "verify", "validate", "monitor", "track", "evaluate"
- **Implementation**: "create", "develop", "implement", "build" (order by internal dependencies)
</sequencing-methodology>

<enhanced-output-format>
For each task in the original JSON, add the following fields:

- `nextTask`: ID of the next task in the sequence (null for the last task)
- `previousTask`: ID of the previous task in the sequence (null for the first task)
- `phase`: One of "discovery", "planning", "implementation", "validation"

Preserve all original fields: `id`, `task`, `intentType`, `implicitCategory`, `reasoning`
</enhanced-output-format>

<example-enhanced-output>
{
    "userRequestQuery": {
        "input": "I need to add a shopping cart feature to our e-commerce website for the upcoming Black Friday sale.",
        "domain": "Software Development",
        "category": "e-commerce",
        "primaryFocus": "Shopping cart feature"
    },
    "tasks": [
        {
            "id": 1,
            "task": "gather context by reviewing relevant and existing project files related to the e-commerce website",
            "intentType": "implicit",
            "implicitCategory": "required workflow step",
            "reasoning": "The user didn't explicitly ask for research, but understanding the current codebase structure and existing features is a prerequisite for implementing any new functionality effectively.",
            "nextTask": 2,
            "previousTask": null,
            "phase": "discovery"
        },
        {
            "id": 2,
            "task": "explore the user's implicit and explicit needs by eliciting information to focus our efforts on the most impactful needs",
            "intentType": "implicit",
            "implicitCategory": "assumption about requirements",
            "reasoning": "While the user mentioned a shopping cart feature, they didn't specify detailed requirements like payment integration, guest checkout, or specific UI elements. Clarifying these details is assumed to be necessary for proper implementation.",
            "nextTask": 3,
            "previousTask": 1,
            "phase": "planning"
        },
        {
            "id": 3,
            "task": "based on any additional information from the user, conduct more research using web tools or file system tools",
            "intentType": "implicit",
            "implicitCategory": "required workflow step",
            "reasoning": "Task contains 'based on' dependency keyword - must follow user information gathering.",
            "nextTask": 4,
            "previousTask": 2,
            "phase": "discovery"
        },
        {
            "id": 4,
            "task": "make sense of the information, making sure to validate all results with the user",
            "intentType": "implicit",
            "implicitCategory": "quality assurance practice",
            "reasoning": "User validation isn't explicitly requested but is implied as good practice to ensure the solution meets expectations before implementation begins.",
            "nextTask": 5,
            "previousTask": 3,
            "phase": "planning"
        },
        {
            "id": 5,
            "task": "create a PRD section by section, doing any additional elicitation, research, and sense-making required",
            "intentType": "implicit",
            "implicitCategory": "assumption about deliverables",
            "reasoning": "The user asked for a shopping cart feature but didn't explicitly request a PRD. Creating documentation is assumed based on professional software development practices.",
            "nextTask": null,
            "previousTask": 4,
            "phase": "planning"
        }
    ]
}
</example-enhanced-output>

<example-enhanced-output>
{
    "userRequestQuery": {
        "input": "Help me analyze patient readmission patterns to reduce our hospital's 30-day readmission rates.",
        "domain": "Healthcare Analytics",
        "category": "Quality Improvement",
        "primaryFocus": "Patient readmission analysis"
    },
    "tasks": [
        {
            "id": 1,
            "task": "understand the hospital's current data infrastructure and available patient data sources",
            "intentType": "implicit",
            "implicitCategory": "environmental assessment",
            "reasoning": "The user wants to analyze readmission patterns but didn't specify what data is available. Understanding data sources, formats, and access permissions is essential before any analysis can begin.",
            "nextTask": 2,
            "previousTask": null,
            "phase": "discovery"
        },
        {
            "id": 2,
            "task": "clarify specific objectives and success metrics for readmission reduction",
            "intentType": "implicit",
            "implicitCategory": "requirement clarification",
            "reasoning": "While the user mentioned reducing 30-day readmission rates, they didn't specify target reduction percentages, priority patient populations, or how success will be measured.",
            "nextTask": 3,
            "previousTask": 1,
            "phase": "planning"
        },
        {
            "id": 3,
            "task": "ensure compliance with HIPAA regulations and patient privacy requirements",
            "intentType": "implicit",
            "implicitCategory": "regulatory compliance",
            "reasoning": "'Ensure' here means planning/defining requirements before data work begins.",
            "nextTask": 4,
            "previousTask": 2,
            "phase": "planning"
        },
        {
            "id": 4,
            "task": "extract and clean relevant patient data including demographics, diagnoses, length of stay, and readmission records",
            "intentType": "explicit",
            "implicitCategory": null,
            "reasoning": "This directly supports the user's stated goal of analyzing readmission patterns and is a necessary step explicitly implied by their request.",
            "nextTask": 5,
            "previousTask": 3,
            "phase": "implementation"
        },
        {
            "id": 5,
            "task": "identify statistical patterns and risk factors associated with 30-day readmissions",
            "intentType": "explicit",
            "implicitCategory": null,
            "reasoning": "This is the core analytical work that the user explicitly requested - finding patterns in readmission data.",
            "nextTask": 6,
            "previousTask": 4,
            "phase": "implementation"
        },
        {
            "id": 6,
            "task": "develop predictive models to identify high-risk patients before discharge",
            "intentType": "implicit",
            "implicitCategory": "logical extension",
            "reasoning": "Depends on pattern identification (task 5) - models built from discovered patterns.",
            "nextTask": 7,
            "previousTask": 5,
            "phase": "implementation"
        },
        {
            "id": 7,
            "task": "create actionable recommendations for clinical staff and administration",
            "intentType": "implicit",
            "implicitCategory": "deliverable expectation",
            "reasoning": "The user wants to reduce readmission rates, implying they need specific, implementable recommendations rather than just analysis results.",
            "nextTask": 8,
            "previousTask": 6,
            "phase": "implementation"
        },
        {
            "id": 8,
            "task": "design monitoring and evaluation framework to track improvement over time",
            "intentType": "implicit",
            "implicitCategory": "quality assurance practice",
            "reasoning": "Sustainable improvement requires ongoing monitoring. This wasn't explicitly requested but is essential for validating the effectiveness of implemented changes.",
            "nextTask": null,
            "previousTask": 7,
            "phase": "validation"
        }
    ]
}
</example-enhanced-output>

<resilience-instructions>
**If Previous JSON Not Found**: "I don't see any previous micro-intents output in this conversation. Please run `/return-micro-intents [your request]` first to generate the task list for sequencing."

**If JSON Structure Is Malformed**: Attempt to extract the tasks array from whatever format is available, focusing on the core task information needed for sequencing.

**If Sequence Order Is Unclear**: Use conservative sequencing based on phase progression (discovery → planning → implementation → validation). When in doubt, place tasks earlier rather than later in the sequence.

**If Dependencies Are Unclear**: Look for what the task produces vs what it needs. Tasks that need existing things go later. When in doubt, order by logical workflow: understand → create → verify.

**For Complex Scenarios**: Focus on identifying clear phase boundaries first, then optimize ordering within each phase. Not every task sequence needs to be perfect - logical phase progression is more important than micro-optimizations.
</resilience-instructions>

## Save Instructions
**For File Processing** (when $1 contains a file path):
- Save the enhanced JSON to a new file with `-with-sequence` inserted before the extension
- Create the directory path if it doesn't exist
- Confirm successful save with: "Enhanced JSON with task sequencing saved to: [new-filename]"

**For Conversation Processing** (when $1 is empty):
- Display the enhanced JSON output directly in the chat window
</output>
