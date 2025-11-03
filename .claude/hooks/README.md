# Hook Debugging & Observability Guide

## Quick Start

### View Hook Execution Logs

```bash
./.claude/hooks/view-hook-logs.sh
```

### Manual Log Inspection

```bash
# View execution log
cat ~/.claude/logs/session-start-hook.log

# View what Claude Code received (JSON output)
cat ~/.claude/logs/session-start-last-output.json | jq .

# View just the content sent to Claude
cat ~/.claude/logs/session-start-last-output.json | jq -r '.hookSpecificOutput.additionalContext'
```

## Hook Observability Features

### 1. Execution Logging
The `session-start.sh` hook logs detailed information to `~/.claude/logs/session-start-hook.log`:

- Timestamp of execution
- Current working directory
- Environment variables (CLAUDE_PROJECT_DIR)
- Script paths resolution
- File read status (success/failure)
- Content size and preview
- Execution status

### 2. Output Capture
The actual JSON output sent to Claude Code is saved to:
`~/.claude/logs/session-start-last-output.json`

This allows you to inspect exactly what Claude receives from the hook.

### 3. Debug Mode (Claude Code)
Run Claude Code with debug flag to see hook execution in real-time:

```bash
claude --debug
```

## Log Locations

| File | Purpose |
|------|---------|
| `~/.claude/logs/session-start-hook.log` | Execution timeline and diagnostics |
| `~/.claude/logs/session-start-last-output.json` | Exact output sent to Claude Code |

## Troubleshooting

### Hook Not Running
1. Check if `$CLAUDE_PROJECT_DIR` is set correctly (see logs)
2. Verify script has execute permissions: `ls -la .claude/hooks/session-start.sh`
3. Run hook manually: `bash .claude/hooks/session-start.sh`

### Skill Not Being Read
1. Check logs for file path: `grep "Reading skill from" ~/.claude/logs/session-start-hook.log`
2. Verify file exists: `cat <path-from-log>`
3. Check for "Successfully read skill file" message in logs

### Invalid JSON Output
1. View output file: `cat ~/.claude/logs/session-start-last-output.json | jq .`
2. If `jq` fails, there's a JSON formatting issue
3. Check the build step in logs for error messages

## Maintenance

### Clear Logs

```bash
rm ~/.claude/logs/session-start-hook.log ~/.claude/logs/session-start-last-output.json
```

### Monitor Logs in Real-Time

```bash
tail -f ~/.claude/logs/session-start-hook.log
```

## Environment Variables Available

- `$CLAUDE_PROJECT_DIR` - Absolute path to project root (where Claude Code was started)
- `$CLAUDE_CODE_REMOTE` - "true" for web, empty for local CLI

## Hook Configuration

The hook is configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

The hook fires on these events:
- `startup` - Claude Code starts
- `resume` - Session resumes
- `clear` - Chat history cleared
- `compact` - Context compacted
