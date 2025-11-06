# Research: The 9x Problem - `/output-style` Deprecation Case Study

## Primary Sources

### GitHub Issues
- [GitHub Issue #10671](https://github.com/anthropics/claude-code/issues/10671) - "Please keep output-style"
- [GitHub Issue #10721](https://github.com/anthropics/claude-code/issues/10721) - "Output style alternatives"

### Reddit Discussions
- [r/ClaudeCode output-style search](https://www.reddit.com/r/ClaudeCode/search/?q=output-style)

### Academic Framework
- [Eager Sellers and Stony Buyers: Understanding the Psychology of New-Product Adoption](https://hbr.org/2006/06/eager-sellers-and-stony-buyers-understanding-the-psychology-of-new-product-adoption) - John T. Gourville, Harvard Business Review, June 2006

### Technical Reference
- Source material: [[Claude Code Output Style Depricated]]

---

## Timeline of Events

**October 31, 2025 (v2.0.30)**
- Anthropic deprecated `/output-style` command
- Deprecation message: "Review options in /output-style and use CLAUDE.md or plugins instead"
- Proposed alternatives: `--system-prompt-file`, `--system-prompt`, `--append-system-prompt`, SessionStart hooks

**November 5, 2025**
- Planned date for automatic conversion of user-level output styles to plugins
- Peak of community backlash
- GitHub Issue #10671 received 64 upvotes and 26 comments
- Multiple duplicate issues filed

**Shortly After (v2.0.32)**
- Anthropic reversed decision: "Un-deprecate output styles based on community feedback"
- Feature fully restored to core product

**Total Duration**: Less than 7 days from deprecation to complete reversal

---

## Eager Sellers and Stony Buyers Framework

### Core Thesis: The 9x Mismatch

**The fundamental disconnect:**
- **Consumers** overvalue existing products by ~3x due to loss aversion and endowment effect
- **Executives** overvalue their innovations by ~3x due to "curse of knowledge"
- **Result**: 9x mismatch between what innovators think consumers want and what consumers truly desire

### The Two Axes Framework

**Horizontal axis**: Product change (how much the innovation differs technically)
**Vertical axis**: Behavior change (how much consumers must alter their habits)

**Key insight**: "Companies create value through product change, but they capture that value best by minimizing behavior change."

### Four Innovation Categories

1. **Easy Sells**: Limited product and behavior change
   - Examples: Angled toothbrushes, improved detergents
   - High adoption but modest benefits

2. **Sure Failures**: Limited innovation with significant behavior demands
   - Examples: Dvorak keyboard
   - Should be avoided entirely

3. **Long Hauls**: Major technological leaps requiring substantial behavior change
   - Examples: Cellular phones, satellite radio (when first introduced)
   - Slow adoption but eventual success possible

4. **Smash Hits**: Great benefits with minimal behavior change
   - Examples: Google's familiar interface with superior algorithm
   - Best short and long-term prospects

### Psychological Biases Affecting Adoption

**Loss Aversion**: People feel losses ~2-3x more acutely than equivalent gains
- Switching products means losing familiar benefits
- Carries disproportionate psychological weight

**Endowment Effect**: People demand 2-4x more compensation to surrender something they own than they'd pay to acquire it
- Classic experiment: Coffee mug sellers priced at $7.12 vs choosers willing to pay only $3.12

**Status Quo Bias**: ~90% of people prefer keeping what they have over switching
- Even when alternatives are objectively better
- Strengthens over time: bias magnitude rises from 2x to 4x

### Why Removing Features is Harder Than Adding Them

When adopting new products, consumers mentally categorize trade-offs:
- **New benefits** = perceived gains
- **Lost familiar features** = perceived losses

Since losses loom larger psychologically, removing features creates resistance disproportionate to adding equivalent value elsewhere.

### Strategies for Overcoming Resistance

**For Unavoidable Behavior Change:**
1. **Be patient**: Accept slow adoption cycles
2. **Achieve 10x improvement**: Make benefits so compelling they overcome loss aversion (Andy Grove's rule)
3. **Eliminate incumbent products**: Remove the old option entirely (if feasible)

**To Minimize Required Behavior Change:**
1. **Build compatibility**: Preserve familiar workflows while adding value
2. **Target the unendowed**: Find users without existing habits/solutions
3. **Find believers**: Target consumers for whom switching costs are genuinely lower

---

## User Complaints: Detailed Analysis

### 1. Loss of Core Workflow Functionality

**Quote**: "Output styles are NOT just funny little instructions...They are crucial to my workflow."

**Context**: Users relied on output styles for:
- Controlling verbosity levels
- Switching personas mid-session
- Managing Claude's chattiness
- Critical daily operations

**Impact**: Core workflows broken overnight

### 2. Technical Superiority of System Prompt Injection

**Quote**: "Output styles are 'baked into system prompt' for stronger instruction following"

**Technical understanding**: Users correctly identified that:
- Output styles modified system prompt directly (highest priority)
- SessionStart hooks are "prompt injection which will for sure loses its power after several rounds"
- System prompt > system-reminder tags in the priority hierarchy

**Impact**: Users anticipated (correctly) degraded adherence with alternatives

### 3. Simplicity vs. Complexity Trade-off

**Quote**: "Output styles enable instant persona switching without difficult configuration"

**Comparison**:
- **Output-style**: `/output-style learning` = 19 keystrokes, works immediately
- **Plugin alternative**: Edit JSON config file + restart Claude
- **CLI alternative**: Create shell alias + restart session

**Impact**: Significant regression in UX - zero-config became multi-step process

### 4. Loss of Ability to Turn Off Engineering Defaults

**Quote**: "I am forced to have the software engineering system prompt in the main agent always"

**Technical issue**:
- Non-coding users lost ability to disable Claude Code's software engineering-specific system prompt
- Output styles could REMOVE conflicting sections
- Alternatives could only APPEND
- Using sub-agents as workaround was "unwieldy and frankly impossible"

**Impact**: Genuinely lost capability, not just workflow preference

### 5. Perceived Degradation in Adherence

**Quote**: "A session start hook is a clunky alternative to output styles, and adherence won't be as good."

**User experience**: Alternatives didn't provide the same level of consistent behavior across conversation turns

**Technical validation**: System prompt hierarchy proves this correct (see technical deep-dive)

---

## Anthropic's Position

### Stated Rationale

1. **Low usage**: "Less than 1% of people actively used output styles"
2. **Architectural equivalence**: "Can be recreated through more powerful extension points and via plugins"
3. **Philosophy**: "Shipping fast and learning, while keeping it intuitive and simple"
4. **Scalability**: Plugin architecture enables community-contributed styles

### Proposed Alternatives

1. **CLAUDE.md files** - Project-level instructions
2. **CLI flags**: `--system-prompt-file`, `--system-prompt`, `--append-system-prompt`
3. **SessionStart hooks** - Via plugins
4. **Dedicated sub-agents** - With particular output styles
5. **Official plugins** - explanatory-output-style, learning-output-style

### Technical Claim

"These alternatives are 'the same thing' as output styles - functionally equivalent approaches to modifying Claude's behavior."

---

## Technical Deep-Dive: What `/output-style` Actually Did

### The Hidden Dual Capability

Output-style performed TWO operations:

1. ✅ **APPEND** content to system prompt (documented, understood)
2. ✅ **REMOVE** conflicting sections from base prompt (undocumented but critical)

**This is the smoking gun** - none of the alternatives could replicate capability #2.

### System Prompt Architecture Hierarchy

**Priority from highest to lowest:**
1. **System prompt** (earliest position, highest weight)
2. **Tool descriptions** (~15-20K tokens - creates "semantic distance")
3. **SessionStart hooks** (injected as `<system-reminder>` tags)
4. **Recent messages** (recency bias)
5. **Earlier messages** (progressively lower weight)

### Concrete Example: Learning Mode Conflict

**Base system prompt includes**: "Professional objectivity" section
**Learning mode wants**: "Collaborative and encouraging" tone

**With `/output-style learning`:**
- ✅ Removed "Professional objectivity" section
- ✅ Appended Learning mode instructions
- ✅ Result: Clean, non-conflicting instructions at highest priority level

**With SessionStart hook alternative:**
- ❌ "Professional objectivity" section remains
- ✅ Appended Learning mode instructions via `<system-reminder>`
- ❌ Result: Conflicting instructions at different priority levels
- ❌ Claude receives contradictory guidance → inconsistent behavior

### Tool Description Buffer Theory

Between system prompt and SessionStart hooks sits ~15-20K tokens of tool descriptions, creating "semantic distance" that weakens instruction following over multiple conversation turns.

This explains user observation: "loses its power after several rounds"

### Validation of User Complaints

**Complaint #1: "Adherence won't be as good"**
- ✅ VALIDATED: System prompt > system-reminder tags in priority hierarchy
- ✅ VALIDATED: Tool descriptions create semantic buffer
- ✅ VALIDATED: Cannot remove conflicting base prompt sections

**Complaint #2: "Can't turn off engineering defaults"**
- ✅ VALIDATED: Alternatives can only APPEND, not REMOVE
- ✅ VALIDATED: Non-coding users genuinely lost capability

**Complaint #3: "Instant switching is gone"**
- ✅ VALIDATED: All alternatives require session restart
- ✅ VALIDATED: Objectively more complex workflow (zero-config → multi-step)

---

## The Framework Analysis: Why This Failed

### Mapping `/output-style` to Eager Sellers Framework

**Anthropic's Position (Eager Seller Mindset):**
- "Less than 1% use it" = perceived low value
- "Can be recreated through plugins/hooks" = focus on functional equivalence
- Emphasis on architectural elegance (plugins > slash commands)
- Belief: alternatives ARE the same thing (~3x overvalue their innovation)

**User Reality (Stony Buyer Resistance):**
- Users had ALREADY solved their problem with existing solution
- Existing solution required ZERO configuration
- Users understood technical superiority (system prompt > prompt injection)
- Critical capability loss (REMOVE conflicts, not just APPEND)
- (~3x overvalue existing solution due to endowment effect)

### The Value-Added vs. Ease-of-Use Matrix

**Value added by alternatives**: ~0
- Anthropic claimed functional equivalence
- No new capabilities, just different implementation

**Ease of use**: NEGATIVE
- Simple command (19 keystrokes) → complex config/CLI flags/restarts
- Zero setup → multi-step configuration
- Mid-session switching → session restart required

**Behavior change required**: HIGH
- Complete workflow disruption
- New mental models (plugins, hooks, CLI flags)
- Lost familiar capabilities

### Framework Classification: "Sure Failure"

This deprecation falls into the "Sure Failure" quadrant:
- Limited/no innovation (functionally "the same thing")
- Significant behavior change required
- Removes beloved familiar capability
- Formula for user rebellion

### The 9x Perception Gap

**Engineering perspective** (3x overvalue innovation):
- "We have functional parity through plugins/hooks/CLI"
- "This is architecturally superior"
- "Users will adapt"

**User perspective** (3x overvalue existing solution):
- "My workflow is destroyed"
- "The alternatives don't work as well"
- "You took away unique capabilities"

**Result**: 9x mismatch → Community crisis in <7 days

---

## The Reversal: Why It Worked

### Anthropic's Response

**What they did**: Complete reversal in v2.0.32
- Un-deprecated `/output-style` command
- Restored full functionality
- Based explicitly "on community feedback"

**What they didn't do**:
- ❌ Compromise with half-measures
- ❌ Insist users were wrong
- ❌ Force migration timeline

### Why This Was the Right Move

**Recognized the 9x problem**:
- Technical team saw "functional parity" (eager seller)
- Users experienced "workflow destruction" (stony buyer)
- 9x perception gap = existential crisis for power users

**Validated user expertise**:
- Users were RIGHT about technical differences
- Users were RIGHT about workflow regression
- Users were RIGHT about unique capabilities

**Rebuilt trust quickly**:
- Showed willingness to listen
- Demonstrated "ship fast, learn fast" philosophy in action
- Turned potential disaster into case study in user-centric development

---

## Key Lessons

### Product Adoption Insights

1. **"Technically equivalent" ≠ "psychologically equivalent"** for user adoption
2. **Deprecation asymmetry**: Rolling out features 9x easier than removing them
3. **Baseline solutions matter**: Users already achieved their goals - change must overcome massive inertia
4. **Low usage % doesn't mean low value**: <1% of users may have mission-critical workflows
5. **Technical details validate feelings**: When users say "it's not the same," investigate architecture before assuming resistance to change

### Successful Deprecation Requires

1. **10x improvement** in replacement to overcome loss aversion, OR
2. **Minimal behavior change** to preserve workflows, OR
3. **Patience** for slow adoption curves

Anthropic's deprecation offered:
- ❌ No improvement (claimed "same thing")
- ❌ Significant behavior change (simple → complex)
- ❌ No patience (forced migration timeline)

Result: Predictable failure per framework

### The Win-Win Outcome

**Anthropic demonstrated maturity**:
- Shipped fast, learned from feedback (not stubborn)
- Acknowledged user experience > internal architectural preferences
- Preserved power-user workflows while still offering plugin path for those who want it

**Users got validation**:
- Technical concerns were real, not imagined
- Workflow expertise was respected
- Quick reversal rebuilt trust

---

## Current State (November 2025)

**Status**: `/output-style` command fully restored and functional
- Built-in output styles (Explanatory, Learning, etc.) remain available
- Official plugin alternatives exist for users who prefer that approach
- Documentation shows both approaches as valid
- Feature no longer marked as deprecated

**Architectural reality preserved**: Output styles can still REMOVE conflicting portions of the base system prompt - a unique capability that validates user insistence that "it's not the same thing."

---

## Citations & References

- Gourville, J. T. (2006). "Eager Sellers and Stony Buyers: Understanding the Psychology of New-Product Adoption." Harvard Business Review, June 2006.
- GitHub Issue #10671: <https://github.com/anthropics/claude-code/issues/10671>
- GitHub Issue #10721: <https://github.com/anthropics/claude-code/issues/10721>
- r/ClaudeCode community discussions on output-style deprecation
- Claude Code technical documentation and source material analysis
