/**
 * Represents a loaded markdown file with optional error state.
 * Used by build-time data loader and diff components.
 */
export interface DiffFile {
  path: string;
  content: string;
  error?: string;
}

/**
 * Build-time data structure containing all loaded prompt diff files.
 * Keyed by filename for O(1) lookup in components.
 */
export interface PromptDiffsData {
  files: Record<string, DiffFile>;
}
