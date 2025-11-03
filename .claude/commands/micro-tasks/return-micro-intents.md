---
argument-hint: "<query>" "[json-save-folder-path]"
---

# Return Micro Intents

## Usage
- `/return-micro-intents "analyze shopping cart feature" "development-docs/clean-up-backups"` - Save JSON to folder
- `/return-micro-intents "analyze shopping cart feature"` - Display JSON in chat window

**Extract** the *domain*, *category*, and *primary focus* of the **user's request**. Using the extracted entites as a guide, **Deconstruct** the **user's request query** into *independent, atomic* **sub-tasks**. Ensure full coverage of the original intent while maintaining independence between tasks. For each sub-task, classify whether it represents explicit user intent or implicit intent, specify the type of implicit intent if applicable, and provide reasoning for the classification.

## Input Validation
If no query is provided ($1 is empty), respond with: "Error: Please provide a query to analyze. Usage: /return-micro-intents '<query>' '[optional-save-path]'"

<user-request-query-input>
$1
</user-request-query-input>

<output>
The expected output is a JSON object containing the extracted entities and a list of atomic sub-tasks with detailed classification.

<example-user-request-query-input>
I need to add a shopping cart feature to our e-commerce website for the upcoming Black Friday sale.
</example-user-request-query-input>

<example-json-output>
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
            "status": "to_do"
        },
        {
            "id":2,
            "task": "explore the user's implicit and explicit needs by eliciting information to focus our efforts on the most impactful needs",
            "intentType": "implicit",
            "implicitCategory": "assumption about requirements",
            "reasoning": "While the user mentioned a shopping cart feature, they didn't specify detailed requirements like payment integration, guest checkout, or specific UI elements. Clarifying these details is assumed to be necessary for proper implementation.",
            "status": "to_do"
        },
        {
            "id":3,
            "task": "based on any additional information from the user, conduct more research using web tools or file system tools",
            "intentType": "implicit",
            "implicitCategory": "required workflow step",
            "reasoning": "Additional research may be needed depending on the technology stack, existing patterns, or third-party integrations. This step is contingent but represents standard development practice.",
            "status": "to_do"
        },
        {
            "id":4,
            "task": "make sense of the information, making sure to validate all results with the user",
            "intentType": "implicit",
            "implicitCategory": "quality assurance practice",
            "reasoning": "User validation isn't explicitly requested but is implied as good practice to ensure the solution meets expectations before implementation begins.",
            "status": "to_do"
        },
        {
            "id":5,
            "task": "create a PRD section by section, doing any additional elicitation, research, and sense-making required",
            "intentType": "implicit",
            "implicitCategory": "assumption about deliverables",
            "reasoning": "The user asked for a shopping cart feature but didn't explicitly request a PRD. Creating documentation is assumed based on professional software development practices.",
            "status": "to_do"
        }
    ]
}
</example-json-output>

<example-user-request-query-input>
Help me analyze patient readmission patterns to reduce our hospital's 30-day readmission rates.
</example-user-request-query-input>

<example-json-output>
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
            "status": "to_do"
        },
        {
            "id": 2,
            "task": "clarify specific objectives and success metrics for readmission reduction",
            "intentType": "implicit",
            "implicitCategory": "requirement clarification",
            "reasoning": "While the user mentioned reducing 30-day readmission rates, they didn't specify target reduction percentages, priority patient populations, or how success will be measured.",
            "status": "to_do"
        },
        {
            "id": 3,
            "task": "ensure compliance with HIPAA regulations and patient privacy requirements",
            "intentType": "implicit",
            "implicitCategory": "regulatory compliance",
            "reasoning": "Working with patient data requires strict adherence to healthcare privacy laws. The user didn't mention this, but it's a critical implicit requirement for any healthcare data analysis.",
            "status": "to_do"
        },
        {
            "id": 4,
            "task": "extract and clean relevant patient data including demographics, diagnoses, length of stay, and readmission records",
            "intentType": "explicit",
            "implicitCategory": null,
            "reasoning": "This directly supports the user's stated goal of analyzing readmission patterns and is a necessary step explicitly implied by their request.",
            "status": "to_do"
        },
        {
            "id": 5,
            "task": "identify statistical patterns and risk factors associated with 30-day readmissions",
            "intentType": "explicit",
            "implicitCategory": null,
            "reasoning": "This is the core analytical work that the user explicitly requested - finding patterns in readmission data.",
            "status": "to_do"
        },
        {
            "id": 6,
            "task": "develop predictive models to identify high-risk patients before discharge",
            "intentType": "implicit",
            "implicitCategory": "logical extension",
            "reasoning": "While not explicitly stated, developing predictive capabilities is a logical extension of pattern analysis and directly supports the goal of reducing readmissions.",
            "status": "to_do"
        },
        {
            "id": 7,
            "task": "create actionable recommendations for clinical staff and administration",
            "intentType": "implicit",
            "implicitCategory": "deliverable expectation",
            "reasoning": "The user wants to reduce readmission rates, implying they need specific, implementable recommendations rather than just analysis results.",
            "status": "to_do"
        },
        {
            "id": 8,
            "task": "design monitoring and evaluation framework to track improvement over time",
            "intentType": "implicit",
            "implicitCategory": "quality assurance practice",
            "reasoning": "Sustainable improvement requires ongoing monitoring. This wasn't explicitly requested but is essential for validating the effectiveness of implemented changes.",
            "status": "to_do"
        }
    ]
}
</example-json-output>
</output>

## Save Instructions
If a save path is provided ($2 is not empty):
- Save the generated JSON output to the directory path specified in $2
  - File name = {{folder-name}}-micro-intents.json
- Create the directory path if it doesn't exist
- Confirm successful save with: "JSON analysis saved to: $2"

If no save path is provided ($2 is empty):
- Display the JSON output directly in the chat window
