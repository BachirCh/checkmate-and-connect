#!/bin/bash
#
# Supabase Database Backup Script
#
# Purpose: Download Supabase database backup with engine fallback.
#
# Prerequisites:
#   - SUPABASE_PROJECT_REF environment variable set
#   - SUPABASE_DB_PASSWORD environment variable set
#   - One backup engine available:
#       - pg_dump (preferred, Docker-independent)
#       - supabase db dump (fallback, may require Docker in some environments)
#
# Usage:
#   SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy bash scripts/backup-supabase.sh
#   SUPABASE_BACKUP_ENGINE=pg_dump SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy bash scripts/backup-supabase.sh
#
# Note: Supabase Pro plan provides daily automatic backups + PITR (Point-in-Time Recovery).
#       This script is for manual backup verification and disaster recovery testing.
#

set -euo pipefail

# Configuration
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"
BACKUP_DIR="${BACKUP_DIR:-./backups/supabase}"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql"
TMP_BACKUP_FILE="$BACKUP_FILE.tmp"
BACKUP_ENGINE="${SUPABASE_BACKUP_ENGINE:-auto}"

SUPABASE_CMD=()

usage() {
  echo "Usage: SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy [SUPABASE_BACKUP_ENGINE=auto|pg_dump|supabase_cli] bash scripts/backup-supabase.sh"
}

urlencode() {
  local raw="$1"
  local encoded=""
  local i
  local char

  for ((i = 0; i < ${#raw}; i++)); do
    char="${raw:i:1}"
    case "$char" in
      [a-zA-Z0-9.~_-]) encoded+="$char" ;;
      *) printf -v encoded '%s%%%02X' "$encoded" "'$char" ;;
    esac
  done

  printf '%s' "$encoded"
}

# Validate PROJECT_REF is set
if [ -z "$PROJECT_REF" ]; then
  echo "ERROR: SUPABASE_PROJECT_REF environment variable is not set"
  usage
  exit 1
fi

# Validate DB_PASSWORD is set
if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: SUPABASE_DB_PASSWORD environment variable is not set"
  usage
  exit 1
fi

# Validate engine choice
if [ "$BACKUP_ENGINE" != "auto" ] && [ "$BACKUP_ENGINE" != "pg_dump" ] && [ "$BACKUP_ENGINE" != "supabase_cli" ]; then
  echo "ERROR: Invalid SUPABASE_BACKUP_ENGINE '$BACKUP_ENGINE'"
  echo "Valid values: auto, pg_dump, supabase_cli"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
rm -f "$TMP_BACKUP_FILE"

echo "=== Supabase Backup Started ==="
echo "Project: $PROJECT_REF"
echo "Date: $DATE"
echo "Output: $BACKUP_FILE"
echo "Requested Engine: $BACKUP_ENGINE"

# Resolve available engines
HAS_PG_DUMP=false
HAS_SUPABASE_CLI=false

if command -v pg_dump >/dev/null 2>&1; then
  HAS_PG_DUMP=true
fi

if command -v supabase >/dev/null 2>&1; then
  SUPABASE_CMD=(supabase)
  HAS_SUPABASE_CLI=true
elif command -v npx >/dev/null 2>&1 && npx --no-install supabase --version >/dev/null 2>&1; then
  SUPABASE_CMD=(npx --no-install supabase)
  HAS_SUPABASE_CLI=true
fi

# Select engine
SELECTED_ENGINE="$BACKUP_ENGINE"
if [ "$BACKUP_ENGINE" = "auto" ]; then
  if [ "$HAS_PG_DUMP" = true ]; then
    SELECTED_ENGINE="pg_dump"
  elif [ "$HAS_SUPABASE_CLI" = true ]; then
    SELECTED_ENGINE="supabase_cli"
  else
    echo "ERROR: No backup engine available."
    echo "Install one of:"
    echo "  - PostgreSQL client tools (pg_dump)"
    echo "  - Supabase CLI (npm install --save-dev supabase)"
    exit 1
  fi
fi

# Enforce engine prerequisites
if [ "$SELECTED_ENGINE" = "pg_dump" ] && [ "$HAS_PG_DUMP" != true ]; then
  echo "ERROR: pg_dump is not available in PATH."
  echo "Install PostgreSQL client tools, then re-run."
  exit 1
fi

if [ "$SELECTED_ENGINE" = "supabase_cli" ] && [ "$HAS_SUPABASE_CLI" != true ]; then
  echo "ERROR: Supabase CLI is not available."
  echo "Install with: npm install --save-dev supabase"
  exit 1
fi

DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
ENCODED_DB_PASSWORD="$(urlencode "$DB_PASSWORD")"
DB_URL="postgresql://${DB_USER}:${ENCODED_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Selected Engine: $SELECTED_ENGINE"
echo "Downloading database backup..."

if [ "$SELECTED_ENGINE" = "pg_dump" ]; then
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    --host "$DB_HOST" \
    --port "$DB_PORT" \
    --username "$DB_USER" \
    --dbname "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --file "$TMP_BACKUP_FILE"
else
  set +e
  SUPABASE_OUTPUT="$("${SUPABASE_CMD[@]}" db dump --db-url "$DB_URL" -f "$TMP_BACKUP_FILE" 2>&1)"
  DUMP_EXIT_CODE=$?
  set -e

  if [ "$DUMP_EXIT_CODE" -ne 0 ]; then
    echo "$SUPABASE_OUTPUT"

    if echo "$SUPABASE_OUTPUT" | grep -qi "Cannot connect to the Docker daemon"; then
      echo ""
      echo "ERROR: Supabase CLI dump failed because Docker daemon is not available."
      echo "Start Docker Desktop and retry, or use the Docker-independent engine:"
      echo "SUPABASE_BACKUP_ENGINE=pg_dump bash scripts/backup-supabase.sh"
    fi

    rm -f "$TMP_BACKUP_FILE"
    exit "$DUMP_EXIT_CODE"
  fi
fi

# Verify backup file is not empty
if [ ! -s "$TMP_BACKUP_FILE" ]; then
  echo "ERROR: Backup file is empty"
  rm -f "$TMP_BACKUP_FILE"
  exit 1
fi

FILE_BYTES=$(wc -c < "$TMP_BACKUP_FILE")
if [ "$FILE_BYTES" -lt 1024 ]; then
  echo "ERROR: Backup file is unexpectedly small (${FILE_BYTES} bytes)"
  rm -f "$TMP_BACKUP_FILE"
  exit 1
fi

if ! grep -qi "CREATE TABLE" "$TMP_BACKUP_FILE"; then
  echo "ERROR: Backup is missing CREATE TABLE statements"
  rm -f "$TMP_BACKUP_FILE"
  exit 1
fi

if ! grep -Eqi "INSERT INTO|COPY [^ ]+ \\(" "$TMP_BACKUP_FILE"; then
  echo "ERROR: Backup appears to contain schema only (no data statements found)"
  rm -f "$TMP_BACKUP_FILE"
  exit 1
fi

mv "$TMP_BACKUP_FILE" "$BACKUP_FILE"

# Output success message with line count
LINE_COUNT=$(wc -l < "$BACKUP_FILE")
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "=== Backup Complete ==="
echo "Engine: $SELECTED_ENGINE"
echo "File: $BACKUP_FILE"
echo "Size: $FILE_SIZE"
echo "Lines: $LINE_COUNT"
echo ""

# Optional: Test restoration to local development (commented out by default)
# Uncomment the section below to test backup restoration
#
# echo "Testing restore to local development..."
# npx supabase start
# npx supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
# psql postgresql://postgres:postgres@localhost:54322/postgres < "$BACKUP_FILE"
# echo "Restoration test complete!"

echo "Backup verified successfully!"
