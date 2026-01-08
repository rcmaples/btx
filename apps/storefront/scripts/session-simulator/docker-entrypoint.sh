#!/bin/bash
set -e

echo "================================================"
echo "BTX Session Simulator - Cloud Run Job"
echo "================================================"
echo "Started at: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Random startup delay for traffic pattern variation
# STARTUP_DELAY_MAX can be overridden via env var (in seconds, default 120 = 2 min)
MAX_DELAY=${STARTUP_DELAY_MAX:-120}
if [ "$MAX_DELAY" -gt 0 ]; then
  DELAY=$((RANDOM % MAX_DELAY))
  echo "Waiting ${DELAY} seconds before starting (randomized delay)..."
  sleep $DELAY
fi

# Randomize session count between MIN and MAX
MIN_SESSIONS=${MIN_SESSIONS:-2}
MAX_SESSIONS=${MAX_SESSIONS:-4}
RANGE=$((MAX_SESSIONS - MIN_SESSIONS + 1))
SESSION_COUNT=$((RANDOM % RANGE + MIN_SESSIONS))

echo ""
echo "Configuration:"
echo "  Sessions: ${SESSION_COUNT}"
echo "  Target URL: ${TARGET_URL:-https://batchtheory.exchange}"
echo "  Persona filter: ${PERSONA_FILTER:-all}"
echo ""
echo "Starting simulation..."
echo "================================================"
echo ""

# Build the command with optional persona filter
CMD="npx tsx scripts/session-simulator/index.ts --sessions $SESSION_COUNT --url ${TARGET_URL:-https://batchtheory.exchange}"

if [ -n "$PERSONA_FILTER" ]; then
  CMD="$CMD --persona $PERSONA_FILTER"
fi

# Execute the simulator (exec replaces shell with Node process for proper signal handling)
exec $CMD
