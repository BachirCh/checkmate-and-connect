#!/bin/bash
#
# Supabase Database Backup Script
#
# Purpose: Download Supabase database backup using Supabase CLI
#
# Prerequisites:
#   - Supabase CLI installed: npm install -g supabase
#   - SUPABASE_PROJECT_REF environment variable set
#
# Usage:
#   SUPABASE_PROJECT_REF=xxx bash scripts/backup-supabase.sh
#
# Note: Supabase Pro plan provides daily automatic backups + PITR (Point-in-Time Recovery).
#       This script is for manual backup verification and disaster recovery testing.
#

set -e

# Configuration
PROJECT_REF="${SUPABASE_PROJECT_REF}"
BACKUP_DIR="${BACKUP_DIR:-./backups/supabase}"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql"

# Validate PROJECT_REF is set
if [ -z "$PROJECT_REF" ]; then
  echo "ERROR: SUPABASE_PROJECT_REF environment variable is not set"
  echo "Usage: SUPABASE_PROJECT_REF=xxx bash scripts/backup-supabase.sh"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "=== Supabase Backup Started ==="
echo "Project: $PROJECT_REF"
echo "Date: $DATE"
echo "Output: $BACKUP_FILE"

# Download backup using Supabase CLI
echo "Downloading database backup..."
supabase db dump --project-ref "$PROJECT_REF" > "$BACKUP_FILE"

# Verify backup file is not empty
if [ ! -s "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file is empty"
  exit 1
fi

# Output success message with line count
LINE_COUNT=$(wc -l < "$BACKUP_FILE")
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "=== Backup Complete ==="
echo "File: $BACKUP_FILE"
echo "Size: $FILE_SIZE"
echo "Lines: $LINE_COUNT"
echo ""

# Optional: Test restoration to local development (commented out by default)
# Uncomment the section below to test backup restoration
#
# echo "Testing restore to local development..."
# supabase start
# supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
# psql postgresql://postgres:postgres@localhost:54322/postgres < "$BACKUP_FILE"
# echo "Restoration test complete!"

echo "Backup verified successfully!"
