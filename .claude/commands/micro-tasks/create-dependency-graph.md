# Create Dependency Graph

**Review** the **previous JSON output** from the `/create-task-sequence` command in this conversation OR **process the JSON file path provided in the slash command arguments**. **Extract** the tasks array and **analyze** each task to identify dependencies between tasks. **Add** a `dependsOn` array field to each task containing the IDs of tasks that must be completed before this task can begin.

<user-request-context>
@$ARGUMENTS

1. **Previous Output**: Use JSON output from `/create-task-sequence` command in this conversation

If neither previous output nor file path is available, instruct the user to run `/create-task-sequence` first or provide a JSON file path.
</user-request-context>

<output>
The expected output enhances the task sequence JSON structure by adding a `dependsOn` field to each task while preserving all existing fields.

<dependency-analysis-methodology>
**Dependency Detection Logic**: Analyze task descriptions and sequence information to identify prerequisite relationships between tasks.

**Dependency Detection Rules**:
1. **Sequential Dependencies**: Tasks with higher sequence numbers may depend on lower-numbered tasks in the same or different phases
2. **Keyword Analysis**: Look for dependency indicators in task descriptions:
   - **Direct Dependencies**: "based on", "using", "integrate with", "ensure compatibility", "after"
   - **Foundational Dependencies**: Tasks that "understand existing" or analyze "current" systems are prerequisites
   - **Implementation Dependencies**: Tasks that create/build components depend on analysis and planning tasks
3. **Phase-Based Dependencies**:
   - Planning tasks typically depend on discovery tasks
   - Implementation tasks depend on planning and sometimes other implementation tasks
   - Validation tasks depend on implementation tasks

**Dependency Resolution Process**:
- Start with tasks that have no prerequisites (typically discovery phase)
- For each task, identify what information, components, or decisions it requires
- Map those requirements to specific predecessor tasks by ID
- Validate that dependencies respect the sequence order (dependsOn IDs should have lower sequence numbers)
</dependency-analysis-methodology>

<enhanced-output-format>
For each task in the original JSON, add the following field:

- `dependsOn`: Object containing:
  - `ids`: Array of task IDs (integers) that must be completed before this task can begin. Empty array `[]` for tasks with no dependencies.
  - `reasoning`: String explaining why these specific dependencies are required for this task.

Preserve all original fields: `id`, `task`, `intentType`, `implicitCategory`, `reasoning`, `sequence`, `phase`
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
            "sequence": 1,
            "phase": "discovery",
            "dependsOn": {
                "ids": [],
                "reasoning": "This is a foundational discovery task with no prerequisites."
            }
        },
        {
            "id": 2,
            "task": "explore the user's implicit and explicit needs by eliciting information to focus our efforts on the most impactful needs",
            "intentType": "implicit",
            "implicitCategory": "assumption about requirements",
            "reasoning": "While the user mentioned a shopping cart feature, they didn't specify detailed requirements like payment integration, guest checkout, or specific UI elements. Clarifying these details is assumed to be necessary for proper implementation.",
            "sequence": 2,
            "phase": "planning",
            "dependsOn": {
                "ids": [1],
                "reasoning": "Requires understanding of existing codebase structure from task 1 before exploring user requirements."
            }
        },
        {
            "id": 3,
            "task": "based on any additional information from the user, conduct more research using web tools or file system tools",
            "intentType": "implicit",
            "implicitCategory": "required workflow step",
            "reasoning": "Task contains 'based on' dependency keyword - must follow user information gathering.",
            "sequence": 3,
            "phase": "discovery",
            "dependsOn": {
                "ids": [2],
                "reasoning": "Based on additional information from user requirements gathering in task 2."
            }
        },
        {
            "id": 4,
            "task": "make sense of the information, making sure to validate all results with the user",
            "intentType": "implicit",
            "implicitCategory": "quality assurance practice",
            "reasoning": "User validation isn't explicitly requested but is implied as good practice to ensure the solution meets expectations before implementation begins.",
            "sequence": 4,
            "phase": "planning",
            "dependsOn": {
                "ids": [1, 3],
                "reasoning": "Needs both codebase understanding (task 1) and additional research results (task 3) to validate comprehensive information."
            }
        },
        {
            "id": 5,
            "task": "create a PRD section by section, doing any additional elicitation, research, and sense-making required",
            "intentType": "implicit",
            "implicitCategory": "assumption about deliverables",
            "reasoning": "The user asked for a shopping cart feature but didn't explicitly request a PRD. Creating documentation is assumed based on professional software development practices.",
            "sequence": 5,
            "phase": "planning",
            "dependsOn": {
                "ids": [4],
                "reasoning": "PRD creation requires validated and synthesized information from task 4."
            }
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
            "sequence": 1,
            "phase": "discovery",
            "dependsOn": {
                "ids": [],
                "reasoning": "Independent discovery task with no prerequisites."
            }
        },
        {
            "id": 2,
            "task": "clarify specific objectives and success metrics for readmission reduction",
            "intentType": "implicit",
            "implicitCategory": "requirement clarification",
            "reasoning": "While the user mentioned reducing 30-day readmission rates, they didn't specify target reduction percentages, priority patient populations, or how success will be measured.",
            "sequence": 2,
            "phase": "planning",
            "dependsOn": {
                "ids": [],
                "reasoning": "Independent planning task that can be done in parallel with infrastructure discovery."
            }
        },
        {
            "id": 3,
            "task": "ensure compliance with HIPAA regulations and patient privacy requirements",
            "intentType": "implicit",
            "implicitCategory": "regulatory compliance",
            "reasoning": "'Ensure' here means planning/defining requirements before data work begins.",
            "sequence": 3,
            "phase": "planning",
            "dependsOn": {
                "ids": [1],
                "reasoning": "Compliance planning requires understanding of current data infrastructure from task 1."
            }
        },
        {
            "id": 4,
            "task": "extract and clean relevant patient data including demographics, diagnoses, length of stay, and readmission records",
            "intentType": "explicit",
            "implicitCategory": null,
            "reasoning": "This directly supports the user's stated goal of analyzing readmission patterns and is a necessary step explicitly implied by their request.",
            "sequence": 4,
            "phase": "implementation",
            "dependsOn": {
                "ids": [1, 3],
                "reasoning": "Data extraction requires both infrastructure knowledge (task 1) and compliance framework (task 3)."
            }
        },
        {
            "id": 5,
            "task": "identify statistical patterns and risk factors associated with 30-day readmissions",
            "intentType": "explicit",
            "implicitCategory": null,
            "reasoning": "This is the core analytical work that the user explicitly requested - finding patterns in readmission data.",
            "sequence": 5,
            "phase": "implementation",
            "dependsOn": {
                "ids": [4],
                "reasoning": "Pattern analysis requires clean, extracted data from task 4."
            }
        },
        {
            "id": 6,
            "task": "develop predictive models to identify high-risk patients before discharge",
            "intentType": "implicit",
            "implicitCategory": "logical extension",
            "reasoning": "Depends on pattern identification (task 5) - models built from discovered patterns.",
            "sequence": 6,
            "phase": "implementation",
            "dependsOn": {
                "ids": [5],
                "reasoning": "Predictive models are built using patterns and risk factors identified in task 5."
            }
        },
        {
            "id": 7,
            "task": "create actionable recommendations for clinical staff and administration",
            "intentType": "implicit",
            "implicitCategory": "deliverable expectation",
            "reasoning": "The user wants to reduce readmission rates, implying they need specific, implementable recommendations rather than just analysis results.",
            "sequence": 7,
            "phase": "implementation",
            "dependsOn": {
                "ids": [5, 6],
                "reasoning": "Recommendations need both statistical patterns (task 5) and predictive models (task 6) for comprehensiveness."
            }
        },
        {
            "id": 8,
            "task": "design monitoring and evaluation framework to track improvement over time",
            "intentType": "implicit",
            "implicitCategory": "quality assurance practice",
            "reasoning": "Sustainable improvement requires ongoing monitoring. This wasn't explicitly requested but is essential for validating the effectiveness of implemented changes.",
            "sequence": 8,
            "phase": "validation",
            "dependsOn": {
                "ids": [7],
                "reasoning": "Monitoring framework is designed after actionable recommendations are created in task 7."
            }
        }
    ]
}
</example-enhanced-output>

<resilience-instructions>
**If Previous JSON Not Found**: "I don't see any previous task sequence output in this conversation. Please run `/create-task-sequence [your request]` first to generate the required task list with sequencing information or provide a JSON file path."

**If JSON Structure Is Malformed**: Attempt to extract the tasks array from whatever format is available, focusing on the core task information needed for dependency analysis.

**If Dependencies Are Unclear**: Use conservative dependency mapping:
- Discovery phase tasks typically have no dependencies or minimal dependencies
- Planning tasks depend on discovery tasks
- Implementation tasks depend on planning and may depend on other implementation tasks
- Validation tasks depend on implementation tasks

**If Sequence Numbers Are Missing**: Assign dependencies based on logical task relationships and phase progression, ensuring earlier tasks are prerequisites for later tasks.

**For Complex Scenarios**: Focus on identifying critical path dependencies first - tasks that absolutely cannot proceed without their prerequisites. Secondary dependencies can be refined in subsequent iterations.

**Validation Rule**: All task IDs in `dependsOn.ids` arrays must have sequence numbers lower than the current task's sequence number.
</resilience-instructions>
</output>
