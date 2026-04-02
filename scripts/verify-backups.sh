#!/bin/bash
#
# Backup Verification Orchestrator
#
# Purpose: Run both Supabase and Sanity backup scripts and verify outputs
#          One-command backup verification for both data stores
#
# Prerequisites:
#   - Sanity CLI installed and authenticated: npm install -g @sanity/cli && sanity login
#   - SUPABASE_PROJECT_REF environment variable set
#   - SUPABASE_DB_PASSWORD environment variable set
#   - At least one Supabase backup engine available:
#       - pg_dump
#       - supabase CLI (or local npx supabase)
#
# Usage:
#   SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy bash scripts/verify-backups.sh
#   SUPABASE_BACKUP_ENGINE=pg_dump SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy bash scripts/verify-backups.sh
#
# This script is used by GitHub Actions for scheduled backup verification.
# It runs both backup scripts and validates that backups were created successfully.
#

set -euo pipefail

SUPABASE_BACKUP_ENGINE="${SUPABASE_BACKUP_ENGINE:-auto}"

has_supabase_cli() {
  if command -v supabase >/dev/null 2>&1; then
    return 0
  fi

  if command -v npx >/dev/null 2>&1 && npx --no-install supabase --version >/dev/null 2>&1; then
    return 0
  fi

  return 1
}

if [ "$SUPABASE_BACKUP_ENGINE" != "auto" ] && [ "$SUPABASE_BACKUP_ENGINE" != "pg_dump" ] && [ "$SUPABASE_BACKUP_ENGINE" != "supabase_cli" ]; then
  echo "ERROR: Invalid SUPABASE_BACKUP_ENGINE '$SUPABASE_BACKUP_ENGINE'"
  echo "Valid values: auto, pg_dump, supabase_cli"
  exit 1
fi

echo "==========================================="
echo "=== Backup Verification Started =========="
echo "==========================================="
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
echo "  Supabase backup engine mode: $SUPABASE_BACKUP_ENGINE"

# Verify Supabase backup tooling
if [ "$SUPABASE_BACKUP_ENGINE" = "pg_dump" ]; then
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "ERROR: pg_dump is required when SUPABASE_BACKUP_ENGINE=pg_dump"
    echo "Install PostgreSQL client tools and ensure pg_dump is in PATH"
    exit 1
  fi
  echo "  ✓ pg_dump available"
elif [ "$SUPABASE_BACKUP_ENGINE" = "supabase_cli" ]; then
  if ! has_supabase_cli; then
    echo "ERROR: Supabase CLI is required when SUPABASE_BACKUP_ENGINE=supabase_cli"
    echo "Install with: npm install -g supabase"
    exit 1
  fi
  echo "  ✓ Supabase CLI available"
else
  if command -v pg_dump >/dev/null 2>&1; then
    echo "  ✓ pg_dump available (preferred)"
  elif has_supabase_cli; then
    echo "  ✓ Supabase CLI available (fallback)"
  else
    echo "ERROR: No Supabase backup engine available"
    echo "Install one of:"
    echo "  - PostgreSQL client tools (pg_dump)"
    echo "  - Supabase CLI: npm install -g supabase"
    exit 1
  fi
fi

# Verify Sanity CLI is installed
if ! command -v sanity >/dev/null 2>&1; then
  echo "ERROR: Sanity CLI is not installed"
  echo "Install with: npm install -g @sanity/cli"
  exit 1
fi
echo "  ✓ Sanity CLI installed"

# Verify SUPABASE_PROJECT_REF is set
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "ERROR: SUPABASE_PROJECT_REF environment variable is not set"
  echo "Usage: SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy bash scripts/verify-backups.sh"
  exit 1
fi
echo "  ✓ SUPABASE_PROJECT_REF is set"

if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  echo "ERROR: SUPABASE_DB_PASSWORD environment variable is not set"
  echo "Usage: SUPABASE_PROJECT_REF=xxx SUPABASE_DB_PASSWORD=yyy bash scripts/verify-backups.sh"
  exit 1
fi
echo "  ✓ SUPABASE_DB_PASSWORD is set"

echo ""
echo "All prerequisites verified!"
echo ""

# Create backup directories
echo "Creating backup directories..."
mkdir -p backups/{supabase,sanity}
echo "  ✓ Directories created"
echo ""

# Run Supabase backup
echo "==========================================="
echo "=== Running Supabase Backup =============="
echo "==========================================="
bash scripts/backup-supabase.sh
echo ""

# Run Sanity backup
echo "==========================================="
echo "=== Running Sanity Backup ================"
echo "==========================================="
bash scripts/backup-sanity.sh
echo ""

# Verify both backups exist and have content
echo "==========================================="
echo "=== Verifying Backup Outputs ============="
echo "==========================================="

# Find latest Supabase backup
SUPABASE_LATEST=$(find backups/supabase -name "*.sql" -type f -print0 | xargs -0 ls -t | head -n 1)
if [ -z "$SUPABASE_LATEST" ]; then
  echo "ERROR: No Supabase backup found"
  exit 1
fi

# Check Supabase backup size (should be > 1KB)
SUPABASE_SIZE=$(stat -f%z "$SUPABASE_LATEST" 2>/dev/null || stat -c%s "$SUPABASE_LATEST" 2>/dev/null)
if [ "$SUPABASE_SIZE" -lt 1024 ]; then
  echo "ERROR: Supabase backup is too small ($SUPABASE_SIZE bytes)"
  exit 1
fi

# Find latest Sanity backup
SANITY_LATEST=$(find backups/sanity -name "*.tar.gz" -type f -print0 | xargs -0 ls -t | head -n 1)
if [ -z "$SANITY_LATEST" ]; then
  echo "ERROR: No Sanity backup found"
  exit 1
fi

# Check Sanity backup size (should be > 1KB)
SANITY_SIZE=$(stat -f%z "$SANITY_LATEST" 2>/dev/null || stat -c%s "$SANITY_LATEST" 2>/dev/null)
if [ "$SANITY_SIZE" -lt 1024 ]; then
  echo "ERROR: Sanity backup is too small ($SANITY_SIZE bytes)"
  exit 1
fi

# Output summary report
echo ""
echo "==========================================="
echo "=== Backup Summary Report ================"
echo "==========================================="
echo ""

echo "Supabase Backup:"
echo "  File: $SUPABASE_LATEST"
echo "  Size: $(du -h "$SUPABASE_LATEST" | cut -f1)"
echo "  Lines: $(wc -l < "$SUPABASE_LATEST")"
echo ""

echo "Sanity Backup:"
echo "  File: $SANITY_LATEST"
echo "  Size: $(du -h "$SANITY_LATEST" | cut -f1)"
echo ""

echo "==========================================="
echo "✅ All backups verified successfully"
echo "==========================================="
echo ""
