# CC Workflows Workspace - Architecture

**Critial LLM Initialization Instructions**: When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

**Purpose**:
- Provide a **centralized** **workspace** that acts as a **single source of truth** for development tools by establishing shared infrastructure for testing and builds.
- Accelerate development by providing a refined and repeatable platform for building new tools and workflows.

**User Value Statement:** Eliminates the manual and repetitive effort of porting workflow improvements across different projects, significantly reducing time spent on "meta-work".

> **Note**: This document is intended to be a living document. Update the document immediately when code changes affect architecture.

## Target Users

**Primary User**s:
- **Technical Product Manager** (Wesley) - Eliminating fragmented workflow development and establishing a refined, repeatable framework for building AI-assisted development tools
- **AI Coding Assistants** - Leveraging centralized semantic tools, testing frameworks, and standardized configurations to deliver consistent, reliable automation across development workflows

**Secondary Users**:
- **Future Team Members**: Learning established patterns and contributing to the centralized toolkit
- **AI-Assisted Developers**: Understanding architecture that scales beyond simple projects and supports complex semantic tooling
- **Community Members**: Adapt patterns for their own workflows

---
## Core Architectural Principles

The system's design is guided by core principles that prioritize **simplicity, maintainability, and extensibility** through a **modular, CLI-first architecture.**

### [Minimum Viable Product (MVP) Principles](<../../resume-coach/design-docs/Architecture Principles.md#Minimum Viable Product (MVP) Principles>)

- **Key Concept**: **Validate the core concept** of a centralized workspace by delivering value quickly. Every architectural decision is weighed against the goal of avoiding over-engineering to accelerate learning and iteration.
  
- **Implementation Approach**: We are implementing this by choosing **native, low-overhead tooling** like NPM Workspaces and focusing strictly on the functionality required to migrate and enhance a single tool, `citation-manager`, as defined in the PRD.

### [Modular Design Principles](<../../resume-coach/design-docs/Architecture Principles.md#Modular Design Principles>)

- **Key Concept**: The system's architecture must support a collection of **independent, reusable, and replaceable tools**. This modularity is foundational to achieving the project's long-term goals of maintainability and extensibility as new tools are added to the workspace.
  
- **Implementation Approach**: We are enforcing modularity by structuring the workspace with **NPM Workspaces**, where each tool lives in an isolated package with its own explicit dependencies and API boundaries.

### [Foundation Reuse](<../../resume-coach/design-docs/Architecture Principles.md#^foundation-reuse>)

- **Key Concept**: This principle directly addresses the core business problem of **eliminating duplicated effort and inconsistent quality**. The workspace must serve as the single, authoritative repository for all development tools and workflows.

- **Implementation Approach**: The **centralized mono-repository structure** is the direct implementation of this principle, ensuring that any improvements to a tool like `citation-manager` are immediately available to all consumers without manual porting.

### [Deterministic Offloading Principles](<../../resume-coach/design-docs/Architecture Principles.md#Deterministic Offloading Principles>)

- **Key Concept**: The tools within this workspace are defined as **predictable, mechanical processors** that handle repeatable tasks. This clarifies their role and boundaries within a larger development workflow that may also involve non-deterministic AI agents.

- **Implementation Approach**: The `citation-manager` exemplifies this by performing verifiable, deterministic operations like **parsing markdown and validating file paths**, leaving semantic interpretation to other systems.

---
## Document Overview

This document captures the baseline architecture of the CC Workflows Workspace to enable centralized development, testing, and deployment of semantic and deterministic tooling. When implementing improvements or new capabilities, this baseline serves as the reference point for identifying which containers, components, and code files require modification.

### C4 Methodology

The C4 model decomposes complex architecture by drilling down through four levels: **Context** (system boundaries), **Containers** (deployable units), **Components** (grouped functionality), and **Code** (implementation details). This structured approach enables understanding of the system at appropriate levels of detail, from high-level system interactions down to specific file and class implementations.

---
## Core Architectural Style

### Architectural and System Design

- **Architecture Pattern:** Monorepo (multi-package workspace) — a single repo acting as a [centralized, single source of truth](<../../resume-coach/design-docs/Architecture Principles.md#^foundation-reuse>) for multiple, distinct development utilities. The first tool is the `citation-manager`.

- **System Design:** tooling monorepo hosting a multi-command CLI with shared packages for test/build. This is a toolkit of independent tools that consume common services like [testing (FR2)](cc-workflows-workspace-prd.md#^FR2) and [builds (FR3)](cc-workflows-workspace-prd.md#^FR3)—not a single linear pipeline.

#### Architectural Pattern Implementations
- `Monorepo` implemented via `npm workspaces` ([NPM Workspaces vs Alternatives](<research/content-aggregation-research.md#2.1 NPM Workspaces vs Alternatives>))
- `cli multi-command` implemented via `commander` (initial). Clear upgrade path to `oclif` if/when plugin-based extensibility is required.

### Key Software Design Patterns

- [**Modular Component Design**](<../../resume-coach/design-docs/Architecture Principles.md#Modular Design Principles>): - each tool (e.g., citation-manager) is isolated for independent evolution and migration, while shared utilities live in shared packages.

### Key Characteristics
- **Interaction Style**: CLI-based, with commands executed via root-level NPM scripts.
- **Runtime Model**: Local, on-demand execution of individual Node.js tool scripts.
- **Deployment Model**: Fully self-contained within a version-controlled repository; no external deployment is required.
- **Scaling Approach**: Scales by adding new, isolated tool packages to the workspace, with a clear migration path to more advanced tooling if the package count grows significantly. Start with `npm workspaces`; if growth demands, adopt `Nx/Turborepo` for caching & task orchestration.

### Rationale
- [**Simplicity First:**](<../../resume-coach/design-docs/Architecture Principles.md#^simplicity-first>) Native Node.js + npm integration minimizes tooling overhead.
- **Right-Sized Performance:** Optimized for ~5–10 tools/packages—fast installs/builds without premature complexity.
- **Less Meta-Work:** Shared dependencies and scripts reduce coordination cost while keeping each tool|package independently maintainable.
- [ADR-001: NPM Workspaces for Monorepo Management](#ADR-001%20NPM%20Workspaces%20for%20Monorepo%20Management)

---
## Level 1 - System Context Diagram
This diagram shows the **CC Workflows Workspace** as a central system used by developers to create and manage a toolkit of reusable components. These components are then consumed by external **Developer Projects** and automated **AI Coding Assistants**. The workspace itself relies on Git for version control and NPM for managing its internal dependencies.

### System Context Diagram

```mermaid
graph TD
    Developer("<b style='font-size: 1.15em;'>Technical PM / Developer</b><br/>[Person]<br/><br/>Builds and maintains the reusable development toolkit")@{ shape: notch-rect }

    AiAssistants("<b style='font-size: 1.15em;'>AI/LLM</b><br/>[Software System]<br/><br/>Automated coding agents that consume tools and configurations to perform development tasks")@{ shape: notch-rect }

    Workspace("<b style='font-size: 1.15em;'>CC Workflows Workspace</b><br/>[Software System]<br/><br/>Centralized environment for creating, testing, and managing reusable development tools and AI configurations")

    DevProjects("<b style='font-size: 1.15em;'>Developer Projects</b><br/>[Software System]<br/><br/>External projects that consume the tools and workflows provided by the workspace")

    Developer -.->|"<div>Builds, tests, and manages tools USING</div>"| Workspace
    AiAssistants -.->|"<div>Leverage semantic tools and configurations FROM</div>"| Workspace
    Workspace -.->|"<div>Provisions tools and configurations FOR</div>"| DevProjects

    %% Color coding for C4 diagram clarity
    classDef person stroke:#052e56, stroke-width:2px, color:#ffffff, fill:#08427b
    classDef softwareSystemFocus stroke:#444444, stroke-width:2px, color:#444444, fill:transparent
    classDef softwareSystemExternal fill:#999999,stroke:#6b6b6b,color:#ffffff, stroke-width:2px

    class Developer person
    class Workspace softwareSystemFocus
    class AiAssistants,DevProjects softwareSystemExternal

    linkStyle default color:#555555
```

---
## Level 2 - Containers

### Container Diagram

```mermaid
graph LR
    subgraph systemBoundary ["CC Workflows Workspace"]
        direction LR
        style systemBoundary fill:#fafafa, stroke:#555555

        subgraph infrastructure ["Infrastructure"]
            direction TB
            style infrastructure fill:transparent, stroke:#555555

            workspace["<div style='font-weight: bold'>Workspace</div><div style='font-size: 85%; margin-top: 0px'>[Node.js, NPM Workspaces, Vitest, Biome]</div><div style='font-size: 85%; margin-top:10px'>Infrastructure platform managing dependencies, orchestrating execution, and enforcing quality</div>"]
            style workspace fill:#438dd5,stroke:#2e6295,color:#ffffff
        end

        subgraph tools ["Tools"]
            direction TB
            style tools fill:transparent, stroke:#555555

            toolPackages["<div style='font-weight: bold'>Tool Packages</div><div style='font-size: 85%; margin-top: 0px'>[Node.js, Commander]</div><div style='font-size: 85%; margin-top:10px'>CLI tools for workflow automation (citation-manager, etc.)</div>"]
            style toolPackages fill:#438dd5,stroke:#2e6295,color:#ffffff
        end

        
    end

    developer["<div style='font-weight: bold'>Developer</div><div style='font-size: 85%; margin-top: 0px'>[Person]</div><div style='font-size: 85%; margin-top:10px'>Builds and maintains the reusable development toolkit</div>"]@{ shape: circle }
    style developer fill:#08427b,stroke:#052e56,color:#ffffff

    aiAssistants["<div style='font-weight: bold'>AI Coding Assistants</div><div style='font-size: 85%; margin-top: 0px'>[Software System]</div><div style='font-size: 85%; margin-top:10px'>Automated agents that consume tools and configurations</div>"]@{ shape: notch-rect }
    style aiAssistants fill:#999999,stroke:#6b6b6b,color:#ffffff

    devProjects["<div style='font-weight: bold'>Developer Projects</div><div style='font-size: 85%; margin-top: 0px'>[Software System]</div><div style='font-size: 85%; margin-top:10px'>External projects that consume the tools and workflows</div>"]
    style devProjects fill:#999999,stroke:#6b6b6b,color:#ffffff
 
    developer-. "<div>Builds, tests, and manages tools USING</div><div style='font-size: 85%'>[CLI commands]</div>" .->workspace
    aiAssistants-. "<div>Builds, tests, and manages tools USING</div><div style='font-size: 85%'>[CLI commands]</div>" .->workspace
    
    workspace-. "<div>Manages (orchestration, testing, quality, build)</div><div style='font-size: 85%'>[npm]</div>" .->toolPackages
    
    tools<-. "<div>IS USED BY</div><div style='font-size: 85%'>[CLI commands]</div>" .->devProjects

    linkStyle default color:#555555

    classDef softwareSystemFocus stroke-width:2px, fill:transparent
    class workspace,toolPackages softwareSystemFocus
```

### CC Workflows Workspace
- **Name:** CC Workflows Workspace
- **Technology:** `Node.js`, `NPM Workspaces`, `Vitest`, `Biome`
- **Technology Status:** Prototype
- **Description:** Development infrastructure platform that:
  - Manages dependencies and workspace configuration via NPM Workspaces
  - Orchestrates tool execution through centralized npm scripts
  - Runs automated tests for all tools via shared Vitest framework
  - Enforces code quality standards via Biome linting and formatting
  - Provides monorepo directory structure (`tools/`, `packages/`) for tool isolation
- **User Value:** Centralized workspace with shared infrastructure vs. scattered tools across projects, eliminating duplicated effort and reducing "meta-work" tax
- **Interactions:**
  - _is used by_ Developer (synchronous)
  - _manages_ Tool Packages (orchestration, testing, quality, build) (synchronous)
  - _provides tools and configurations for_ Developer Projects and AI Assistants

### Tool Packages
- **Name:** Tool Packages
- **Technology:** `Node.js`, `Commander` (varies by tool)
- **Technology Status:** Prototype
- **Description:** Individual CLI tools for development workflow automation:
  - Markdown validation and processing
  - Content transformation and extraction
  - Code analysis and formatting
  - _Citation Manager is the first MVP tool in this container_
- **User Value:** Reusable, tested tools vs. scattered, inconsistent scripts across projects
- **Interactions:**
  - _is used by_ Developer and AI Assistants

---

## Level 3 - Components

Component-level architecture (C4 Level 3) is defined within each tool's own architecture documentation, not at the workspace level. This approach enforces our **Modular Design Principles** by treating each tool as a self-contained container, keeping the workspace architecture focused on system-level boundaries.

See the [content-aggregation-architecture](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-architecture.md)  for a reference implementation.

---
## Component Interfaces and Data Contracts

Component interfaces and data contracts are internal details of each tool container. To maintain a clean separation of concerns and treat each tool as a "black box," these specifications are defined within the respective tool's architecture document and are intentionally excluded from the parent workspace architecture.

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
- **Inline Comments**: Include contextual comments for complex logic ([Contextual Comments](<../../resume-coach/design-docs/Architecture Principles.md#contextual-comments>))
- **Function Documentation**: Use docstrings to document public APIs and their contracts

---

## Testing Strategy

### Philosophy and Principles

- **MVP-Focused Testing**: We will maintain a lean **target test-to-code ratio of 0.3:1 to 0.5:1**. The primary goal is to **prove that functionality works** as specified in the user story's acceptance criteria, not to achieve 100% test coverage.
- **Integration-Driven Development**: We start by writing a **failing integration test** that validates a user story, then build the minimum code required to make it pass.
- **Real Systems, Fake Fixtures**:
  - _Real Systems:_
    - Tests will run against the **real file system**, execute **real shell commands**, and inject real **Components**
  - _Fake Fixtures:_
    - Test fixture files (not production documents). You can copy a production document into the fixture folders
    - We have a zero-tolerance policy for mocking.
    - Static, Not Dynamic: Fixtures created once and checked into repo

### Workspace Testing Approach

The workspace provides a **shared Vitest configuration** and **common testing principles**, but each tool maintains its own independent test suite. Fulfills the requirement for a shared, centralized testing framework \[[FR2](cc-workflows-workspace-prd.md#^FR2)\]

**Current State (MVP):**
- No shared test utilities or helpers
- Each tool creates its own fixtures and test infrastructure
- Tools are completely self-contained

**Future State:**
- Shared test utilities will be promoted to workspace-level when patterns emerge across multiple tools
- Will follow cross-cutting testing investment level (comprehensive coverage of shared infrastructure)

### Testing Categories

Our strategy distinguishes between cross-cutting workspace functionality and tool-specific functionality, allowing us to invest testing effort appropriately.

#### Cross-Cutting Testing (Validating Shared Infrastructure)
- **Scope**: Shared workspace functionality that multiple tools depend on, such as configuration management, dependency resolution, or future shared utilities.
- **Goal**: To prove shared infrastructure is **rock-solid and trustworthy**. The focus is on testing the component's public API, success paths, and expected failure modes.
- **Investment Level**: Test **every public method or function** against its defined behavior—primary success path, known failure modes, and critical edge cases.
- **Current Status**: As of MVP, the workspace has minimal cross-cutting functionality (Vitest config, Biome config, NPM workspace setup). Cross-cutting test patterns will be documented as shared workspace infrastructure emerges.

#### Tool-Level Testing (Outcome Validation)
- **Scope**: Validation of tool-specific functionality and user story acceptance criteria.
- **Goal**: To **prove the tool's functionality works as specified**. Treat the tool as a system and verify it produces expected results.
- **Investment**: Minimal and focused, adhering to the lean **0.3:1 to 0.5:1 test-to-code ratio.**
- **Reference Implementation**: See citation-manager test suite as the established pattern for tool-level testing.

### Test Implementation and Conventions

#### Testing Naming Conventions

Test method names follow our [Self-Contained Naming Principles](<../../resume-coach/design-docs/Architecture Principles.md#^self-contained-naming-principles-definition>) with a specific exception to optimize for readability and clarity:

##### Test Description Naming: Natural Language Convention
- **Convention**: Use **natural language with spaces** for test descriptions in `it()` method strings
- **Examples**:
  - `it('should authenticate user with valid credentials', () => {...})`
  - `it('should reject payment processing with insufficient funds', () => {...})`
  - `it('should run migrated test suite from root test command', () => {...})`

**Rationale:**
- **Maximum Readability**: Natural language with spaces reads exactly like documentation
- **Self-Documenting**: Test descriptions serve as executable specifications that anyone can understand immediately
- **Immediate Understanding**: Test descriptions benefit from natural sentence structure per our **"Names as Contracts"** philosophy
- **String Literal Context**: Since test descriptions are string literals in `it()` methods, they can use spaces without language constraints

**Implementation Examples:**

```javascript
// Preferred: Natural language with spaces for clear test intent
describe('PaymentProcessor', () => {
  it('should succeed when processing payment with valid card', () => {
    // Given: Valid payment data and authenticated user
    // When: Payment is processed through gateway
    // Then: Transaction succeeds and receipt is generated
  });

  it('should retry when timeout occurs during gateway communication', () => {
    // Given: Network timeout simulation
    // When: Payment gateway times out
    // Then: System retries with exponential backoff
  });
});
```

This naming convention aligns with our **"Names as Contracts"** philosophy ([Descriptive Labels](<../../resume-coach/design-docs/Architecture Principles.md#^descriptive-labels>), [Immediate Understanding](<../../resume-coach/design-docs/Architecture Principles.md#^immediate-understanding>)) by prioritizing communication clarity and natural readability.

#### BDD-Style Test Structure (Given-When-Then)

All tests **must** be structured with comments that follow the Behavior-Driven Development (BDD) style of **Given-When-Then**. This practice makes the intent of each test unambiguous and serves as clear documentation.
- **Given**: This block describes the initial context or preconditions. It sets up the state of the system before the action under test occurs.
- **When**: This block describes the specific action, event, or operation being tested. It should ideally be a single, focused action.
- **Then**: This block contains the assertions that verify the expected outcome, result, or state change.

**Code Example:** _This is how the convention should be applied within a Vitest test file_

```javascript
describe('MyUtility', () => {
  it('should return true when conditions are met', () => {
    // Given: A specific setup or initial state.
    const utility = new MyUtility({ config: 'enabled' });
    const input = 'valid_input';

    // When: The method under test is called.
    const result = utility.checkConditions(input);

    // Then: The outcome is asserted.
    expect(result).toBe(true);
  });
});
```

#### Testing Examples

The workspace uses two complementary testing approaches based on what's being validated:

##### CLI Integration Testing (No DI Required)

When testing CLI entry points, use `execSync()` to test the entire system from the outside. No dependency injection needed - the CLI creates its own components.

```javascript
import { strict as assert } from 'node:assert';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, test } from 'node:test';

describe('Citation Manager Integration Tests', () => {
  test('should validate citations in valid-citations.md successfully', async () => {
    // Given: A markdown file with valid citations exists in test fixtures
    const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

    // When: The validate command executes against the test file
    // Note: No DI needed - CLI creates its own components internally
    const output = execSync(
      `node "${citationManagerPath}" validate "${testFile}"`,
      { encoding: 'utf8' }
    );

    // Then: The validation report confirms all citations are valid
    assert(output.includes('✅ ALL CITATIONS VALID'), 'Should report all citations as valid');
    assert(output.includes('Total citations:'), 'Should show citation count');
    assert(output.includes('Validation time:'), 'Should show validation time');
  });
});
```

**When to use:** Testing user-facing behavior and acceptance criteria.

###### Technical Debt: CLI Subprocess Testing Buffer Limits

**Issue**: The current CLI integration testing pattern using `execSync()` to spawn subprocesses creates a 64KB stdio pipe buffer limit on macOS. When CLI output exceeds this limit (e.g., large JSON validation results with 100+ citations producing 92KB+ output), the data gets truncated, resulting in malformed JSON and test failures.

**Root Cause**: Node.js `child_process` stdio pipes have OS-level buffer limits (~64KB on macOS). Tests that spawn the CLI as a subprocess are subject to these limits, while production CLI usage (writing directly to terminal stdout) is not affected.

**Current Workaround**: Shell redirection to temporary files bypasses pipe buffers but adds complexity to test infrastructure.

**Recommended Mitigation**: Refactor tests to import CLI functions directly instead of spawning subprocesses:
- Import `validateFile()`, `formatAsJSON()` from CLI Orchestrator component
- Reserve subprocess testing for true E2E scenarios (argument parsing, exit codes)
- Aligns test architecture with production architecture (both use same code path)

**Reference**: [Bug 3: Buffer Limit Resolution](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/user-stories/us1.8-implement-validation-enrichment-pattern/bug3-buffer-limit-resolution.md)

###### CLI Testing: stdout/stderr Separation Pattern

**Architectural Decision**: CLI tools must maintain strict separation between data output (stdout) and diagnostic messages (stderr). This separation ensures:
- JSON output remains parseable (no warnings/errors mixed in)
- Real-world CLI usage patterns work correctly (piping, redirection)
- Tests accurately reflect production behavior

**Implementation Pattern**:

CLI tools should route output based on type:
- **stdout**: Structured data (JSON), primary command output
- **stderr**: Warnings, diagnostics, validation errors, progress messages

**Test Helper Pattern**:

The `cli-runner.js` helper supports both capture modes:

```javascript
// For JSON output - capture only stdout (default: captureStderr=true)
const output = runCLI(
  `node citation-manager.js validate file.md --format json`,
  { captureStderr: false }  // Don't mix stderr into stdout
);
const result = JSON.parse(output); // Clean JSON parsing

// For text output - capture both streams
const output = runCLI(
  `node citation-manager.js validate file.md`,
  { captureStderr: true }  // Merge stderr for full output
);
expect(output).toContain('Validation errors found'); // Check errors
```

**Example - Citation Manager**:

```javascript
// Production code correctly separates streams
if (options.format === 'json') {
  console.log(JSON.stringify(result, null, 2));  // stdout
} else {
  console.log(formatTextReport(result));         // stdout
}
console.error('Validation errors found:');       // stderr
```

**Test Pattern**:

```javascript
it('should validate with JSON format', () => {
  // Given: Test file with citations
  const testFile = join(FIXTURES_DIR, 'test.md');

  // When: Execute with JSON format (stderr not captured)
  const output = runCLI(
    `node citation-manager.js validate "${testFile}" --format json`,
    { captureStderr: false }
  );

  // Then: Clean JSON can be parsed without warnings
  const result = JSON.parse(output);
  expect(result.summary.total).toBeGreaterThan(0);
});
```

**Rationale**: This pattern matches real-world usage where users pipe JSON to other tools (`citation-manager validate file.md --format json | jq .summary`) or redirect output (`citation-manager validate file.md > report.txt 2> errors.log`). Tests must verify this separation works correctly.

##### Component Integration Testing (DI Required)

When testing component collaboration, use constructor dependency injection to pass in real dependencies (not mocks).

**Note:** This example represents the target architecture after refactoring citation-manager to implement DI ([technical debt](<../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-architecture.md#Lack of Dependency Injection>)) and factory pattern ([mitigation strategy](#Constructor-Based%20DI%20Wiring%20Overhead)).

**Production Code - USES Factory:**

```javascript
// File: tools/citation-manager/src/citation-manager.js (CLI entry point)
import { createCitationValidator } from './factories/componentFactory.js';

const validator = createCitationValidator(scopeDirectory);
const results = await validator.validateFile(filePath);
```

**Test Code - DEFAULT USES Factory:**
Use factory as the default. This aligns with our integraiton testing strategy

```javascript
// File: tools/citation-manager/test/validation.test.js
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { createCitationValidator } from '../src/factories/componentFactory.js';

describe('CitationValidator Integration Tests', () => {
  it('should validate citations using factory-created dependencies', () => {
    // Given: Factory creates validator with standard production dependencies
    const validator = createCitationValidator(join(__dirname, 'fixtures'));
    const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

    // When: Validator processes file using factory-created components
    const result = validator.validateFile(testFile);

    // Then: Integration of real components produces expected result
    expect(result.isValid).toBe(true);
    expect(result.citations).toHaveLength(5);
    expect(result.errors).toHaveLength(0);
  });
});
```

**Test Code - Option 2: BYPASSES Factory:**
Use only when you need to mock a dependency for more comprehensive unit testing (i.e. a cross cutting concern). Otherwise, we favor integration testing to deliver quickly.

```javascript
// File: tools/citation-manager/test/validation.test.js
import { join } from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { CitationValidator } from '../src/CitationValidator.js';
import { MarkdownParser } from '../src/MarkdownParser.js';
import { FileCache } from '../src/FileCache.js';

describe('CitationValidator Integration Tests', () => {
  let validator;

  beforeEach(() => {
    // Given: Real component dependencies created explicitly (bypass factory)
    const parser = new MarkdownParser();  // Real parser, not mock
    const cache = new FileCache(join(__dirname, 'fixtures'));  // Real cache, not mock

    // Direct constructor injection for explicit dependency control
    validator = new CitationValidator(parser, cache);
  });

  it('should validate citations using explicitly injected dependencies', () => {
    // Given: Test fixture with known citation structure
    const testFile = join(__dirname, 'fixtures', 'valid-citations.md');

    // When: Validator processes file using explicitly injected dependencies
    const result = validator.validateFile(testFile);

    // Then: Integration of real components produces expected result
    expect(result.isValid).toBe(true);
    expect(result.citations).toHaveLength(5);
    expect(result.errors).toHaveLength(0);
  });
});
```

**The ONLY difference:** How the validator is created. The factory just wires dependencies - assertions are identical.

**Factory Location:** Tool-level (`tools/citation-manager/src/factories/`). Only promotes to workspace-level when multiple tools share component instantiation patterns.

**Key Distinction:** CLI tests use `execSync()` to test from outside (no DI needed). Component tests use constructor injection to validate collaboration with real dependencies (DI required).

### Citation-Manager: Reference Test Structure

The citation-manager tool provides the established pattern for tool-level testing within the workspace. See [Citation Manager Testing Strategy](<../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-architecture.md#Testing Strategy>) for complete test structure and principles.

---

## Technology Stack

|Technology/Library|Category|Version|Module|Purpose in the System|Used By (Container.Component)|
|---|---|---|---|---|---|
|**Node.js**|**Runtime**|>=18.0.0|`node`|Provides the JavaScript execution environment for all tools and scripts.|TBD|
|**NPM Workspaces**|**Build & Dependency Management**|npm 7+|`npm` (CLI)|The core mechanism for managing the monorepo, handling dependency hoisting, and enabling script execution across packages.|TBD|
|**Vitest**|**Testing Framework**|latest|`vitest`|Provides the shared testing framework for running unit and integration tests across all packages in the workspace.|TBD|
|**Biome**|**Code Quality**|latest|`@biomejs/biome`|Enforces consistent code formatting and linting standards across the entire monorepo from a single, root configuration.|TBD|

---
## Cross-Cutting Concerns
These are system-wide responsibilities that affect multiple components and tools within the workspace.

### Configuration Management
Workspace behavior is configured through three root-level files that provide shared infrastructure for all tools. This centralized approach ensures consistency and avoids configuration duplication.

- **Workspace Structure**: The root `package.json` file defines the monorepo structure using the `workspaces` array, which specifies glob patterns (`tools/*`, `packages/*`) for package discovery. NPM automatically hoists shared dependencies to the root `node_modules/` directory.
- **Code Quality**: The `biome.json` file centralizes all linting and formatting rules, ensuring that any tool in the workspace inherits these standards automatically.
- **Testing Framework**: The `vitest.config.js` file defines test discovery patterns, the execution environment, and coverage settings for the entire workspace.

**Key settings within `biome.json`:**

| Key | Type | Description |
|-----|------|-------------|
| `formatter.indentStyle` | `string` | Indentation standard (tabs). Allows developer preference configuration while maintaining smaller file sizes. |
| `javascript.formatter.quoteStyle` | `string` | String quote convention (double quotes). Ensures consistency across all JavaScript files. |
| `linter.rules.recommended` | `boolean` | Enables Biome's recommended ruleset for code quality enforcement. |
| `organizeImports.enabled` | `boolean` | Automatic import sorting and organization on format operations. |
| `files.include` | `array(string)` | Glob patterns defining which files Biome processes (default: all files). |
| `files.ignore` | `array(string)` | Directories excluded from linting (node_modules, dist, build artifacts). |

**Key settings within `vitest.config.js`:**

| Key | Type | Description |
|-----|------|-------------|
| `test.environment` | `string` | Execution environment (node). Optimized for file system and CLI testing. |
| `test.include` | `array(string)` | Test discovery patterns supporting both legacy locations and workspace packages. |
| `test.pool` | `string` | Process isolation strategy (forks). Ensures proper CommonJS module isolation. |
| `test.globals` | `boolean` | Disables global test functions (false). Requires explicit imports for clarity. |
| `coverage.provider` | `string` | Coverage collection tool (c8). Native Node.js coverage without instrumentation overhead. |

### Code Quality and Consistency

All code quality enforcement is centralized through **Biome**, which provides both **linting and formatting** from a single tool. Quality checks are run from the repository root and apply to all workspace packages.

- **Formatting Standards**: The workspace enforces **tab indentation** and **double-quote strings** to reduce file size and allow for developer-specific display preferences.
- **Linting Enforcement**: Biome's recommended ruleset is enabled to detect common errors and enforce consistent coding patterns.
- **Validation Pattern**: Quality checks are run via `npx biome check .` from the repository root. This command discovers all relevant files across the workspace and validates them against the centralized configuration.

### Testing Infrastructure

The workspace provides a **shared Vitest testing framework** that discovers and executes tests across all packages from a single root command, fulfilling the requirement for a centralized testing framework.

- **Test Discovery**: Vitest is configured with multiple glob patterns to discover tests in both legacy locations (`src/tests/**/*.test.js`) and new workspace packages (`tools/**/test/**/*.test.js`). This multi-pattern approach is a deliberate strategy to support the incremental migration of existing tools like `citation-manager`.
- **Testing Principles**: All tests must adhere to the **"Real Systems, Fake Fixtures"** principle, which mandates a zero-tolerance policy for mocking application components and favors testing against real file system operations. Tests must also follow the **BDD Given-When-Then** comment structure and use **`snake_case`** for test method names for clarity and improved AI comprehension.

### Dependency Management

**NPM Workspaces** manages all dependencies through a centralized installation process that **hoists** shared packages to the root level while supporting package-specific requirements.

- **Hoisting Strategy**: Shared development dependencies like `vitest` and `@biomejs/biome` are installed once at the root `node_modules/` directory to ensure version consistency and reduce installation overhead.
- **Installation Process**: A single `npm install` command from the repository root installs dependencies for all workspace packages. The root `package-lock.json` file ensures deterministic dependency resolution across the entire workspace.

### CLI Execution Pattern

The workspace establishes a consistent pattern for executing tool CLIs through **root-level npm scripts**, providing centralized command discovery and parameter passing.

- **Root Script Orchestration**: The root `package.json` defines npm scripts that execute workspace package CLIs directly via `node` commands (e.g., `"mock:run": "node tools/mock-tool/src/mock-tool.js"`). This makes all tool commands discoverable via `npm run`.
- **Parameter Passing**: CLI arguments are passed to the target script using the standard `--` separator convention (e.g., `npm run mock:run -- Alice`).

### Error Handling and Logging

The current workspace establishes foundational error handling at the infrastructure level, with individual tools remaining responsible for their own specific error management. A more comprehensive, centralized logging strategy is planned for the future.

- **Configuration Validation**: Schema validation for configuration files occurs at tool startup. For instance, schema issues in `biome.json` were discovered and corrected during the Story 1.1 implementation.
- **Test Execution Errors**: Vitest provides detailed reporting for test failures, including stack traces and assertion messages.
- **CLI Error Reporting**: Individual tools are expected to handle their own errors and report them to `stderr` with appropriate non-zero exit codes, a pattern that enables reliable script composition.

### Dependency Injection and Testing Strategy

Use **Dependency Injection (DI)** as a foundational pattern to achieve a modular architecture. DI is the practice of providing a component with its dependencies from an external source, rather than having the component create them internally. This approach is the primary mechanism for supporting our core principles of **Modularity**, **Replaceable Parts**, and **Dependency Abstraction**. By decoupling components, we make them easier to test, reuse, and replace without causing ripple effects across the system.

While DI makes it possible to inject mock dependencies for isolated unit testing, our testing philosophy explicitly prioritizes integration tests that verify real component interactions. Therefore, the workspace adheres to the **"Real Systems, Fake Fixtures"** principle, which includes a **"zero-tolerance policy for mocking"** application components. Our strategy is to use DI to inject _real_ dependencies during testing to gain the highest confidence that our components work together correctly.

For example, the `CitationValidator` should receive its `MarkdownParser` dependency via its constructor. During testing, we will pass in the _real_ `MarkdownParser` to ensure the validation logic works with the actual parsing output. This gives us confidence that the integrated system functions as expected. The existing `citation-manager` code, which does not fully use DI, has been [identified as technical debt](<../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-architecture.md#Lack of Dependency Injection>) to be refactored to align with this principle.

### Tool Distribution and Linking

The workspace supports sharing tools with external projects through **npm link**, enabling local development workflows where external projects can consume workspace tools without publishing them to a registry. This pattern is particularly valuable for iterating on tools while testing them in real-world usage contexts.

#### npm link Pattern

**Use Cases:**
- Local development iteration across multiple projects
- Testing tool changes in external projects before release
- Sharing tools with projects outside the workspace (e.g., cc-workflows-site, ResumeCoach)

**Implementation:**

The npm link pattern creates symlinks in two steps:

1. **Create Global Link** (from tool directory):

   ```bash
   cd /path/to/cc-workflows/tools/citation-manager
   npm link
   ```

   Creates symlink: `/opt/homebrew/lib/node_modules/@cc-workflows/citation-manager` → tool directory

2. **Link to External Project** (from consuming project):

   ```bash
   cd /path/to/external-project
   npm link "@cc-workflows/citation-manager"
   ```

   Creates symlink: `node_modules/@cc-workflows/citation-manager` → global package

**Result:** Changes to the tool in cc-workflows workspace are immediately available in the external project without rebuilding or republishing.

#### Symlink Execution Detection

**Technical Implementation:** Workspace tools must properly detect when executed via symlink (npm link or `node_modules/.bin`). The CLI entry point uses `realpathSync()` to resolve symlinks before comparing execution paths:

```javascript
// citation-manager.js
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

const realPath = realpathSync(process.argv[1]);
const realPathAsUrl = pathToFileURL(realPath).href;

if (import.meta.url === realPathAsUrl) {
  program.parse();
}
```

**Rationale:** The naive comparison `import.meta.url === \`file://${process.argv[1]}\`` fails with symlinks because `process.argv[1]` contains the symlink path while `import.meta.url` resolves to the real path. Using `realpathSync()` ensures proper detection regardless of how the tool is invoked.

**Test Coverage:** The `cli-execution-detection.test.js` test suite validates symlink execution for all command types (help, validate, extract) to prevent regression.

**Reference:** See [Linking CC-Workflows Tools to External Projects](guides/linking-cc-workflows-tools-to-external-projects.md) for complete setup guide, troubleshooting, and alternative patterns.

---
## Known Risks and Technical Debt

---

## Architecture Decision Records (ADRs)

### ADR-001: NPM Workspaces for Monorepo Management

- **Status**: Accepted
- **Date**: 2025-09-25
- **Context**: The project requires a monorepo structure to centralize multiple development tools and eliminate code duplication, starting with the `citation-manager`. The solution needed to have low initial overhead and strong performance for a small number of packages (5-10) while integrating natively with the Node.js ecosystem.
- **Decision**: We will use **NPM Workspaces** as the foundational technology for managing the `cc-workflows` monorepo. It will be the primary mechanism for handling shared dependencies, running scripts across packages, and linking local packages together.
- **Consequences**:
  - **Positive**: The approach has **low overhead**, as it requires no third-party dependencies and aligns with our **Simplicity First** principle.
  - **Positive**: The performance is **well-suited for our scale**, with research confirming excellent installation and build times for repositories with 5-10 packages.
  - **Positive**: It provides a **streamlined developer experience** with a unified installation process (`npm install`) and simple script execution (`npm run <script> --workspaces`).
  - **Negative**: The solution has **known scaling limitations**, with research indicating potential performance degradation if the workspace grows beyond 70+ packages. ^cc-workflows-workspace-adr-001
  - **Negative**: It **lacks advanced features** like built-in task dependency graphing and computation caching, which may require supplemental tooling (e.g., Nx, Turborepo) if future complexity increases.

---

## Appendices

### Glossary

**Semantic Tools:** AI agent definitions and configurations that require evaluation frameworks rather than traditional unit testing

**Deterministic Tools:** Standard code-based utilities that can be tested with conventional testing frameworks

**Meta-Work Tax:** The 2-4 day overhead of planning, impact analysis, and manual file management required before any actual feature development can begin

**Centralized Workspace:** Single repository containing all reusable development tools, shared testing infrastructure, and common build processes

### References & Further Reading

**Related Architecture Documents:**
- [CC Workflows PRD](cc-workflows-workspace-prd.md): Product requirements and epic breakdown for MVP implementation
- [Content Aggregation Research](research/content-aggregation-research.md): Industry patterns and technical recommendations for workspace management
- [C4 Model Framework Overview](/Users/wesleyfrederick/Documents/ObsidianVaultNew/Technical KnowledgeBase/AI Coding Assistants/Concepts/C4 Framework Overview.md): Architectural documentation methodology used in this document
- [Psuedocode Style Guide](<Psuedocode Style Guide.md>): Pseudocode syntax reference used in this document
- [citation-guidelines](../../../agentic-workflows/rules/citation-guidelines.md): Citation and reference formatting standards used in this document
- [WORKSPACE-SETUP](../../../WORKSPACE-SETUP.md): Validated workspace patterns for workspace configuration and development

**External References:**
- [NPM Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces): Foundation pattern for package management
- [C4 Model Documentation](https://c4model.com/): Architectural documentation methodology used in this document

### Architecture Change Log

| Date       | Version | Level          | Change Description                                            | Author |
| ---------- | ------- | -------------- | ------------------------------------------------------------- | ------ |
| 2025-09-23 | 1.0     | System Context | Initial baseline architecture through Level 1 context diagram | Wesley |
| 2025-10-04 | 2.0     | Baseline       | Copied from workspace feature to Basline arch doc             | Wesley |
