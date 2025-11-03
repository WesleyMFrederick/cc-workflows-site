#!/usr/bin/env bash
# Helper script to view SessionStart hook logs

LOG_DIR="${HOME}/.claude/logs"
LOG_FILE="${LOG_DIR}/session-start-hook.log"
OUTPUT_FILE="${LOG_DIR}/session-start-last-output.json"

echo "=================================================="
echo "SessionStart Hook Log Viewer"
echo "=================================================="
echo ""

if [[ ! -f "$LOG_FILE" ]]; then
    echo "❌ No log file found at: $LOG_FILE"
    echo "   The hook hasn't run yet."
    exit 1
fi

echo "📋 Execution Log:"
echo "--------------------------------------------------"
tail -20 "$LOG_FILE"
echo ""

if [[ -f "$OUTPUT_FILE" ]]; then
    echo "📤 Last Hook Output (what Claude Code received):"
    echo "--------------------------------------------------"
    echo "File: $OUTPUT_FILE"
    echo ""
    echo "Size: $(wc -c < "$OUTPUT_FILE") bytes"
    echo ""
    echo "Content preview (first 30 lines):"
    jq -r '.hookSpecificOutput.additionalContext' "$OUTPUT_FILE" | head -30
    echo ""
    echo "... (view full output at: $OUTPUT_FILE)"
else
    echo "⚠️  No output file found at: $OUTPUT_FILE"
fi

echo ""
echo "=================================================="
echo "Commands:"
echo "  View full log:    cat $LOG_FILE"
echo "  View full output: cat $OUTPUT_FILE | jq ."
echo "  Clear logs:       rm $LOG_FILE $OUTPUT_FILE"
echo "=================================================="
