#!/bin/bash
#
# Backup Verification Orchestrator
#
# Purpose: Run both Supabase and Sanity backup scripts and verify outputs
#          One-command backup verification for both data stores
#
# Prerequisites:
#   - Supabase CLI installed: npm install -g supabase
#   - Sanity CLI installed and authenticated: npm install -g @sanity/cli && sanity login
#   - SUPABASE_PROJECT_REF environment variable set
#
# Usage:
#   SUPABASE_PROJECT_REF=xxx bash scripts/verify-backups.sh
#
# This script is used by GitHub Actions for scheduled backup verification.
# It runs both backup scripts and validates that backups were created successfully.
#

set -e

echo "==========================================="
echo "=== Backup Verification Started =========="
echo "==========================================="
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Verify Supabase CLI is installed
if ! command -v supabase >/dev/null 2>&1; then
  echo "ERROR: Supabase CLI is not installed"
  echo "Install with: npm install -g supabase"
  exit 1
fi
echo "  ✓ Supabase CLI installed"

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
  echo "Usage: SUPABASE_PROJECT_REF=xxx bash scripts/verify-backups.sh"
  exit 1
fi
echo "  ✓ SUPABASE_PROJECT_REF is set"

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
