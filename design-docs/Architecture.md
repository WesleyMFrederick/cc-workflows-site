# Architecture

This document defines the code organization, development workflow, and coding standards for the cc-workflows-site project.

---

## Level 4 - Code

This level details the initial organization of the workspace, its file structure, and the naming conventions that will ensure consistency as the project grows.

### Code Organization and Structure

#### Directory Organization

The workspace is organized as a monorepo using NPM Workspaces. The structure separates documentation, shared packages, and individual tools into distinct top-level directories.

```plaintext
cc-workflows/
├── design-docs/                      # Project documentation (architecture, PRDs, etc.)
├── packages/                         # Shared, reusable libraries (e.g., common utilities)
│   └── shared-utils/               # (Future) For code shared between multiple tools
├── tools/                            # Houses the individual, isolated CLI tools
│   └── citation-manager/             # The first tool being migrated into the workspace
│       ├── src/                      # Source code for the tool
│       ├── test/                     # Tests specific to the tool
│       └── package.json              # Tool-specific dependencies and scripts
├── biome.json                        # Root configuration for code formatting and linting
├── package.json                      # Workspace root: shared dependencies and top-level scripts
└── vitest.config.js                  # Root configuration for the shared test framework
```

#### Tool/Package Documentation Organization

Each tool or package maintains its own `design-docs/` folder structure following the same pattern as the project root, enabling self-contained documentation and feature management:

```plaintext
tools/citation-manager/
├── design-docs/                      # Tool-level design documentation
│   ├── Overview.md                   # Tool baseline overview
│   ├── Principles.md                 # Tool-specific principles
│   ├── Architecture.md               # Tool baseline architecture
│   └── features/                     # Tool-specific features
│       └── {{YYYYMMDD}}-{{feature-name}}/
│           ├── {{feature-name}}-prd.md              # Feature PRD
│           ├── {{feature-name}}-architecture.md     # Feature architecture
│           ├── research/                            # Feature research
│           └── user-stories/                        # User stories
│               └── us{{X.Y}}-{{story-name}}/
│                   ├── us{{X.Y}}-{{story-name}}.md
│                   └── tasks/                       # Task implementation details
├── src/                              # Source code
├── test/                             # Tests
├── README.md                         # Quick start and tool summary
└── package.json                      # Package configuration
```

**Rationale**: This structure ensures each tool is self-contained with its own documentation hierarchy, enabling independent evolution while maintaining consistent organizational patterns across all workspace packages.

#### File Naming Patterns

**Action-Based Organization:** Following our [Action-Based File Organization](<../../resume-coach/design-docs/Architecture Principles.md#^action-based-file-organization-definition>) principle, files should be named by their primary transformation or operation on data.

##### Core File Types

- **Tool Scripts**: Executable entry points for tools must use **`kebab-case.js`** (e.g., `citation-manager.js`)
- **Source Modules**: Implementation files should use **`camelCase.js`** following transformation naming (e.g., `parseMarkdown.js`, `validateCitations.js`, `generateReport.js`)
- **Data Contracts**: Type definition files use **`camelCase.js`** with `Types` suffix (e.g., `citationTypes.js`, `validationTypes.js`)
- **Test Files**: Test files mirror the module name with **`.test.js`** suffix (e.g., `parseMarkdown.test.js`)
- **Configuration Files**: Standard names (`package.json`, `biome.json`, `vitest.config.js`)

##### Action-Based Naming Patterns

- **Transformation Naming**: Name files by their primary operation using verb-noun or noun-verb patterns:
  - `parseMarkdown.js` - parses markdown to AST
  - `validateCitations.js` - validates citation references
  - `extractContent.js` - extracts content from documents
  - `calculateMetrics.js` - calculates metrics from data

- **Primary Export Pattern**: Each file exports one main function matching (or closely related to) the file name:
  - `parseMarkdown.js` → `export function parseMarkdown()`
  - `validateCitations.js` → `export function validateCitations()`

- **Helper Co-location**: Supporting functions stay in the same file as their primary operation:
  - `parseMarkdown.js` contains helper functions like `normalizeWhitespace()`, `tokenizeLine()`

- **Type Separation**: Extract shared types to dedicated `*Types.js` files to prevent circular dependencies:
  - `citationTypes.js` - types used across citation validation, parsing, and reporting
  - `validationTypes.js` - types used across multiple validation modules

##### Structural Patterns

- **Component Folders**: Group related operations by level 3 component:
  - `src/core/MarkdownParser/` - all parsing operations
  - `src/core/CitationValidator/` - all validation operations
  - `src/service/Logger/` - all logging operations. IN `service/` since it is cross-cutting

- **Strategy Subfolders**: Extract variants when using strategy patterns:
  - `src/parsing/strategies/` - markdown, html, json parsers
  - `src/validation/rules/` - different validation rule implementations

---

## Development Workflow

To ensure a consistent, traceable, and agent-friendly development process, all feature work will adhere to the following workflow and organizational structure. This process creates a **single source of truth** for each user story, from its definition to its implementation details.

### Development Lifecycle

The implementation of a user story follows four distinct phases:
1. **Elicitation**: The process begins with the high-level **Architecture Document** and the **Product Requirements Document (PRD)**, which together define the strategic context and goals.
2. **Decomposition**: A specific **User Story** is created as a markdown file. This file acts as the central orchestration document for all work related to the story.
3. **Tasking**: Within the User Story file, the work is broken down into a checklist of discrete **Tasks**, each representing a verifiable step toward completing the story's acceptance criteria.
4. **Specification**: Each task in the story file links to a self-contained **Implementation Details** markdown file, which provides the specific, detailed instructions for a development agent to execute that task.

### Directory Structure Convention
All artifacts for a given user story must be organized within the `design-docs/features/` directory using the following hierarchical structure, which prioritizes discoverability and temporal context.
- **Pattern**:

 ```Plaintext
 design-docs/features/{{YYYYMMDD}}-{{feature-short-name}}/user-stories/us{{story-number}}-{{story-full-name}}/
 ```

- **Example**:

 ```Plaintext
 design-docs/features/20250926-version-based-analysis/user-stories/us1.1-version-detection-and-directory-scaffolding/
 ```

### Feature Documentation Structure

Complete feature documentation follows this hierarchical organization:

```plaintext
design-docs/features/{{YYYYMMDD}}-{{feature-short-name}}/
├── {{feature-short-name}}-prd.md              # Product Requirements Document
├── {{feature-short-name}}-architecture.md     # Architecture (impact to baseline)
├── research/                                   # Feature research and analysis
│   └── {{research-topic}}.md
└── user-stories/                              # User story implementations
    └── us{{story-number}}-{{story-full-name}}/
        ├── us{{story-number}}-{{story-full-name}}.md
        └── tasks/                             # Task implementation details (optional)
            └── us{{story-number}}-t{{task-number}}-{{task-name}}.md
```

**Example**:

```plaintext
design-docs/features/20250928-cc-workflows-workspace-scaffolding/
├── cc-workflows-workspace-prd.md
├── cc-workflows-workspace-architecture.md
├── research/
│   └── content-aggregation-research.md
└── user-stories/
    └── us1.1-establish-workspace-directory-structure-and-basic-config/
        └── us1.1-establish-workspace-directory-structure-and-basic-config.md
```

### File Naming Conventions

- **Feature PRD**: Product requirements document for the feature
  - **Pattern**: `{{feature-short-name}}-prd.md`
  - **Example**: `cc-workflows-workspace-prd.md`

- **Feature Architecture**: Architecture document showing impact to baseline
  - **Pattern**: `{{feature-short-name}}-architecture.md`
  - **Example**: `cc-workflows-workspace-architecture.md`

- **Research Documents**: Analysis and research supporting feature decisions
  - **Pattern**: `{{research-topic}}.md`
  - **Example**: `content-aggregation-research.md`

- **User Story File**: The central orchestration document for the story
  - **Pattern**: `us{{story-number}}-{{story-full-name}}.md`
  - **Example**: `us1.1-establish-workspace-directory-structure-and-basic-config.md`

- **Task Implementation Details File**: Self-contained specification for a single task (optional)
  - **Pattern**: `tasks/us{{story-number}}-t{{task-number}}-{{full-task-name}}.md`
  - **Example**: `tasks/us1.1-t2.1.1-directory-manager-interface-test.md`

---

## Coding Standards and Conventions

This project follows JavaScript/TypeScript naming conventions with one strategic exception for test methods, aligned with our [Self-Contained Naming Principles](<../../resume-coach/design-docs/Architecture Principles.md#^self-contained-naming-principles-definition>).

### JavaScript Naming Conventions

This project follows JavaScript/TypeScript naming conventions aligned with our [Action-Based File Organization](<../../resume-coach/design-docs/Architecture Principles.md#^action-based-file-organization-definition>) principle.

- **Files**: File naming depends on purpose:
  - **Tool Scripts** (executable entry points): Use **kebab-case** (e.g., `citation-manager.js`, `ask-enhanced.js`)
  - **Implementation Modules** (transformation operations): Use **camelCase** named by their primary transformation (e.g., `parseMarkdown.js`, `validateCitations.js`, `extractContent.js`)
  - **Rationale**: File names describe operations that transform data, following [Transformation Naming](<../../resume-coach/design-docs/Architecture Principles.md#^transformation-naming>)

- **Functions & Variables**: Use **camelCase** for all functions and variables (e.g., `parseMarkdown`, `extractContent`, `validationResult`)
  - **Primary Exports**: Each file's main export should match or closely relate to the file name ([Primary Export Pattern](<../../resume-coach/design-docs/Architecture Principles.md#^primary-export-pattern>))

- **Constants**: Use **UPPER_SNAKE_CASE** for constants (e.g., `MAX_DEPTH`, `DEFAULT_ENCODING`)

- **Classes**: Use **TitleCase** for class names (e.g., `CitationValidator`, `MarkdownParser`)

- **Type Files**: Use **camelCase** with `Types` suffix for shared type definitions (e.g., `citationTypes.js`, `validationTypes.js`)
  - **Rationale**: Separates data contracts (WHAT) from operations (HOW) per [Data Contracts Separate](<../../resume-coach/design-docs/Architecture Principles.md#^data-contracts-separate>)

- **Test Descriptions**: Use **natural language with spaces** for test descriptions in `it()` methods (e.g., `it('should validate citations with valid references', () => {...})`)
  - **Rationale**: Test descriptions serve as executable specifications requiring maximum clarity per our **"Names as Contracts"** philosophy

### Formatting Conventions

- **Indentation**: Use **tabs** for indentation (configured via Biome)
  - **Rationale**: Tabs allow developers to configure visual width to their preference while maintaining smaller file sizes. The existing codebase uses tabs consistently, and Biome is configured to enforce this standard.

### Code Organization

- **Modular Structure**: Each module should have a single, clear responsibility ([Single Responsibility](<../../resume-coach/design-docs/Architecture Principles.md#^single-responsibility>))
- **Interface Boundaries**: Define clear APIs between components ([Black Box Interfaces](<../../resume-coach/design-docs/Architecture Principles.md#^black-box-interfaces>))
- **Error Handling**: Implement fail-fast principles with clear error messages ([Fail Fast](<../../resume-coach/design-docs/Architecture Principles.md#^fail-fast>))

### Documentation Requirements

- **Self-Documenting Code**: Names should provide immediate understanding without lookup ([Immediate Understanding](<../../resume-coach/design-docs/Architecture Principles.md#immediate-understanding>))
- **Contextual Comments**: Include contextual comments for complex logic ([Contextual Comments](<../../resume-coach/design-docs/Architecture Principles.md#contextual-comments>))
- **Function Documentation**: Use docstrings to document public APIs and their contracts

---
