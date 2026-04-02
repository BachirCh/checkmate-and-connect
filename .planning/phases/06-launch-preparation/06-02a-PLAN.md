---
phase: 06-launch-preparation
plan: 02a
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/backup-supabase.sh
  - scripts/backup-sanity.sh
  - scripts/verify-backups.sh
autonomous: true

must_haves:
  truths:
    - "Database backup can be downloaded successfully"
    - "CMS backup can be exported successfully"
    - "Backup verification orchestrator runs both scripts and validates outputs"
  artifacts:
    - path: "scripts/backup-supabase.sh"
      provides: "Automated Supabase database backup download"
      contains: "supabase db dump"
    - path: "scripts/backup-sanity.sh"
      provides: "Automated Sanity dataset export"
      contains: "sanity dataset export"
    - path: "scripts/verify-backups.sh"
      provides: "Backup restoration verification orchestrator"
      min_lines: 30
  key_links:
    - from: "scripts/verify-backups.sh"
      to: "scripts/backup-supabase.sh"
      via: "calls Supabase backup script"
      pattern: "backup-supabase.sh"
    - from: "scripts/verify-backups.sh"
      to: "scripts/backup-sanity.sh"
      via: "calls Sanity backup script"
      pattern: "backup-sanity.sh"
---

<objective>
Implement automated backup scripts for Supabase database and Sanity CMS with verification orchestrator.

Purpose: Create foundational backup infrastructure that can download and export data from both data stores. This enables disaster recovery capability and provides basis for restoration testing.

Output: Three executable bash scripts that automate backup download (Supabase), dataset export (Sanity), and verification orchestration of both backup systems.
</objective>

<execution_context>
@/Users/mac/.claude/get-shit-done/workflows/execute-plan.md
@/Users/mac/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-launch-preparation/06-RESEARCH.md
@.planning/phases/01-foundation-infrastructure/01-03-SUMMARY.md

# Existing Supabase configuration
@lib/auth/supabase.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Supabase backup script</name>
  <files>
    scripts/backup-supabase.sh
  </files>
  <action>
Create automated Supabase database backup script using Supabase CLI.

**scripts/backup-supabase.sh:**

Structure:
1. Set error handling: `set -e` (exit on any error)
2. Define variables: PROJECT_REF (from env or arg), BACKUP_DIR (./backups/supabase), DATE (YYYY-MM-DD format)
3. Create backup directory if it doesn't exist: `mkdir -p "$BACKUP_DIR"`
4. Download backup using Supabase CLI: `supabase db dump --project-ref "$PROJECT_REF" > "$BACKUP_DIR/backup-$DATE.sql"`
5. Verify backup file is not empty: check file size with `[ ! -s "$BACKUP_DIR/backup-$DATE.sql" ]` and exit with error if empty
6. Output success message with line count: `wc -l < "$BACKUP_DIR/backup-$DATE.sql"`
7. Add optional test restoration to local development (commented out by default):
   - `supabase start` (starts local Supabase)
   - `supabase db reset --db-url postgresql://...` (resets local DB)
   - `psql postgresql://... < "$BACKUP_DIR/backup-$DATE.sql"` (restores backup)
8. Make script executable: `chmod +x scripts/backup-supabase.sh`

Add header comments explaining:
- Prerequisites: Supabase CLI installed (`npm install -g supabase`)
- Usage: `SUPABASE_PROJECT_REF=xxx bash scripts/backup-supabase.sh`
- Note about Supabase Pro plan providing daily automatic backups + PITR (this script is for manual/verification purposes)

Use research patterns from 06-RESEARCH.md Pattern 3 (Supabase Backup Verification).

IMPORTANT: Script should accept PROJECT_REF from environment variable, not hardcode project-specific values.
  </action>
  <verify>
1. Verify scripts/backup-supabase.sh exists and is executable
2. Run `head -20 scripts/backup-supabase.sh` to check header comments and prerequisites
3. Verify script includes `supabase db dump` command
4. Check error handling with `grep "set -e" scripts/backup-supabase.sh`
5. Verify backup directory creation: `grep "mkdir -p" scripts/backup-supabase.sh`
  </verify>
  <done>
Supabase backup script created with automated download, verification, and optional local restoration testing.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Sanity backup script</name>
  <files>
    scripts/backup-sanity.sh
  </files>
  <action>
Create automated Sanity CMS dataset export script using Sanity CLI.

**scripts/backup-sanity.sh:**

Structure:
1. Set error handling: `set -e`
2. Define variables: DATASET (default "production"), BACKUP_DIR (./backups/sanity), DATE (YYYY-MM-DD-HHMMSS format for granularity), FILENAME
3. Create backup directory: `mkdir -p "$BACKUP_DIR"`
4. Export dataset using Sanity CLI: `sanity dataset export "$DATASET" "$FILENAME"`
5. Verify backup file exists: `[ ! -f "$FILENAME" ]` and exit with error if missing
6. Output success message with file size: `du -h "$FILENAME" | cut -f1`
7. Cleanup old backups: `find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete` (keep last 30 days)
8. Output cleanup confirmation
9. Make script executable: `chmod +x scripts/backup-sanity.sh`

Add header comments explaining:
- Prerequisites: Sanity CLI installed and authenticated (`npm install -g @sanity/cli && sanity login`)
- Usage: `bash scripts/backup-sanity.sh` (uses production dataset by default) or `SANITY_DATASET=staging bash scripts/backup-sanity.sh`
- Note about Enterprise Sanity plans having managed daily backups (this script is for Free/Growth plans or manual verification)
- Export format: .tar.gz containing data.ndjson (documents), files/ (file assets), images/ (image assets)

Use research patterns from 06-RESEARCH.md Pattern 4 (Sanity Dataset Export).

IMPORTANT: Script should work from project root and assume Sanity CLI is authenticated.
  </action>
  <verify>
1. Verify scripts/backup-sanity.sh exists and is executable
2. Run `head -20 scripts/backup-sanity.sh` to check header comments
3. Verify script includes `sanity dataset export` command
4. Check cleanup logic: `grep "find.*mtime.*delete" scripts/backup-sanity.sh`
5. Verify error handling: `grep "set -e" scripts/backup-sanity.sh`
  </verify>
  <done>
Sanity backup script created with automated export, verification, and 30-day retention policy.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create backup verification orchestrator</name>
  <files>
    scripts/verify-backups.sh
  </files>
  <action>
Create orchestrator script that runs both backup scripts and verifies their outputs.

**scripts/verify-backups.sh:**

Structure:
1. Set error handling: `set -e`
2. Add banner: echo "=== Backup Verification Started ===" with timestamp
3. Check prerequisites:
   - Verify Supabase CLI installed: `command -v supabase >/dev/null 2>&1` or exit with error message
   - Verify Sanity CLI installed: `command -v sanity >/dev/null 2>&1` or exit with error message
   - Verify SUPABASE_PROJECT_REF is set: `[ -z "$SUPABASE_PROJECT_REF" ]` and exit with usage message
4. Create root backups directory: `mkdir -p backups/{supabase,sanity}`
5. Run Supabase backup: `bash scripts/backup-supabase.sh`
6. Run Sanity backup: `bash scripts/backup-sanity.sh`
7. Verify both backups exist and have content:
   - Check latest Supabase .sql file size > 1KB
   - Check latest Sanity .tar.gz file size > 1KB
8. Output summary report:
   - Supabase backup: filename, size, line count
   - Sanity backup: filename, size
   - Success message: "✅ All backups verified successfully"
9. Make script executable

Add header comments:
- Purpose: One-command backup verification for both data stores
- Prerequisites: Both CLIs installed, Supabase PROJECT_REF set, Sanity authenticated
- Usage: `SUPABASE_PROJECT_REF=xxx bash scripts/verify-backups.sh`
- Runs: backup-supabase.sh + backup-sanity.sh + verification checks

This script is used by GitHub Actions for scheduled backup verification.
  </action>
  <verify>
1. Verify scripts/verify-backups.sh exists and is executable
2. Check script calls both backup scripts: `grep -E "(backup-supabase|backup-sanity)" scripts/verify-backups.sh`
3. Verify prerequisite checks: `grep "command -v" scripts/verify-backups.sh`
4. Check verification logic: `grep -E "(size|exists|verified)" scripts/verify-backups.sh`
5. Run `wc -l scripts/verify-backups.sh` and confirm >30 lines
  </verify>
  <done>
Backup verification orchestrator created to run both backup scripts and validate outputs for automated testing.
  </done>
</task>

</tasks>

<verification>
## Backup Scripts
- [ ] Supabase backup script downloads database dump successfully
- [ ] Sanity backup script exports dataset with all documents and assets
- [ ] Verification orchestrator runs both scripts and validates outputs
- [ ] Scripts are executable and have proper error handling

## Script Quality
- [ ] All scripts include error handling (`set -e`)
- [ ] All scripts have header comments with prerequisites and usage
- [ ] Scripts accept configuration via environment variables
- [ ] Scripts output clear success/failure messages
</verification>

<success_criteria>
1. Supabase backup script successfully downloads database dump with all tables and data
2. Sanity backup script successfully exports dataset with documents, files, and images
3. Backup verification orchestrator runs both scripts and validates outputs automatically
4. All scripts are executable and have proper error handling
5. Scripts are ready for integration into automated workflows (GitHub Actions)
</success_criteria>

<output>
After completion, create `.planning/phases/06-launch-preparation/06-02a-SUMMARY.md` documenting:
- Backup script capabilities and usage examples
- Script verification results
- Any issues encountered during script creation
- Next steps: restoration runbook and automation (Plan 06-02b)
</output>
