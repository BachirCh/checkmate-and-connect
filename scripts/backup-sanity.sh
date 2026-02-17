#!/bin/bash
#
# Sanity CMS Dataset Backup Script
#
# Purpose: Export Sanity CMS dataset with all documents and assets
#
# Prerequisites:
#   - Sanity CLI installed: npm install -g @sanity/cli
#   - Authenticated with Sanity: sanity login
#   - Run from project root directory
#
# Usage:
#   bash scripts/backup-sanity.sh
#   or
#   SANITY_DATASET=staging bash scripts/backup-sanity.sh
#
# Note: Enterprise Sanity plans have managed daily backups with 365-day retention.
#       This script is for Free/Growth plans or manual verification purposes.
#
# Export format:
#   .tar.gz archive containing:
#   - data.ndjson: All documents in NDJSON format
#   - files/: File asset references
#   - images/: Image asset references
#

set -e

# Configuration
DATASET="${SANITY_DATASET:-production}"
BACKUP_DIR="${BACKUP_DIR:-./backups/sanity}"
DATE=$(date +%Y-%m-%d-%H%M%S)
FILENAME="$BACKUP_DIR/$DATASET-backup-$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "=== Sanity Dataset Export Started ==="
echo "Dataset: $DATASET"
echo "Date: $DATE"
echo "Output: $FILENAME"

# Export dataset using Sanity CLI
echo "Exporting dataset..."
sanity dataset export "$DATASET" "$FILENAME"

# Verify backup file exists
if [ ! -f "$FILENAME" ]; then
  echo "ERROR: Backup file was not created"
  exit 1
fi

# Output success message with file size
FILE_SIZE=$(du -h "$FILENAME" | cut -f1)

echo ""
echo "=== Export Complete ==="
echo "File: $FILENAME"
echo "Size: $FILE_SIZE"
echo ""

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups (keeping last 30 days)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
  echo "Deleted $DELETED_COUNT old backup(s)"
else
  echo "No old backups to delete"
fi

echo ""
echo "Backup verified successfully!"
