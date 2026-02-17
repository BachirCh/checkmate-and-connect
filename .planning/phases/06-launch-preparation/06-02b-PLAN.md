---
phase: 06-launch-preparation
plan: 02b
type: execute
wave: 2
depends_on: ["06-02a"]
files_modified:
  - docs/backup-restoration-runbook.md
  - .github/workflows/backup-verification.yml
autonomous: false

must_haves:
  truths:
    - "Database backup can be restored successfully"
    - "CMS backup can be imported successfully"
    - "Backup restoration process is documented and tested"
    - "Backup verification runs on automated schedule"
  artifacts:
    - path: "docs/backup-restoration-runbook.md"
      provides: "Step-by-step recovery procedures"
      min_lines: 100
    - path: ".github/workflows/backup-verification.yml"
      provides: "Scheduled backup verification workflow"
      contains: "cron"
  key_links:
    - from: ".github/workflows/backup-verification.yml"
      to: "scripts/verify-backups.sh"
      via: "scheduled execution of backup tests"
      pattern: "verify-backups.sh"
---

<objective>
Document and automate backup restoration procedures with comprehensive runbook and scheduled verification workflow.

Purpose: Ensure disaster recovery procedures are documented, tested, and automated. Automated backups are useless if restoration has never been tested - this plan validates backup procedures work before launch.

Output: Comprehensive restoration runbook with step-by-step procedures for both data stores, GitHub Actions workflow for monthly automated verification, and human verification of restoration testing.
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

# Backup scripts from Plan 06-02a
@scripts/backup-supabase.sh
@scripts/backup-sanity.sh
@scripts/verify-backups.sh

# Existing Supabase configuration
@lib/auth/supabase.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create backup restoration runbook</name>
  <files>
    docs/backup-restoration-runbook.md
  </files>
  <action>
Create comprehensive disaster recovery documentation for both data stores.

**docs/backup-restoration-runbook.md:**

Structure in Markdown:

1. **Overview** section:
   - Purpose: Step-by-step guide for restoring from backups during disaster recovery
   - When to use: Database corruption, accidental deletion, security breach
   - RTO/RPO expectations: Supabase (PITR: 2-minute RPO, Pro plan), Sanity (depends on backup frequency)

2. **Prerequisites** section:
   - Access requirements: Supabase project access, Sanity project access, CLI tools installed
   - Environment: Terminal access, project credentials
   - Skills: Basic command line, understanding of databases

3. **Supabase Restoration** section:
   - **List Available Backups**: `supabase db dump --project-ref xxx --list`
   - **Download Specific Backup**: `supabase db dump --project-ref xxx --output backup.sql`
   - **Verify Backup Integrity**: Check file size, grep for key tables
   - **Restore to Local**: Step-by-step with `supabase start` and `psql` commands
   - **Restore to Production** (DANGEROUS): Warning about data loss, backup-before-restore, actual restoration command
   - **Verify Restoration**: Count rows in key tables (user_roles, profiles), test application login
   - **Troubleshooting**: Common errors (authentication, network, schema mismatch)

4. **Sanity Restoration** section:
   - **List Available Exports**: Check backups/sanity/ directory
   - **Verify Export Contents**: `tar -tzf backup.tar.gz` to list files
   - **Create Test Dataset**: `sanity dataset create backup-test` for safe testing
   - **Import to Test Dataset**: `sanity dataset import backup.tar.gz backup-test --replace`
   - **Verify Import**: Check document counts, spot-check member/blog data
   - **Restore to Production**: Warning, backup current production first, import command with --replace
   - **Verify Restoration**: Check document counts match, test Studio access, verify public pages render
   - **Troubleshooting**: Asset restoration issues, schema mismatches

5. **Testing Procedure** section:
   - **Quarterly Verification Schedule**: Q1, Q2, Q3, Q4 manual restoration tests
   - **Test Restoration to Non-Production**: Always test on staging/test datasets first
   - **Document Test Results**: Template for recording test date, backup date, success/failure, time taken
   - **Automation**: Reference to .github/workflows/backup-verification.yml for automated checks

6. **Emergency Contacts** section:
   - Supabase support: Dashboard link, status page
   - Sanity support: Dashboard link, status page
   - Team contacts: Admin user list (to be filled in)

7. **Appendix** section:
   - Backup retention policies: Supabase (Pro plan: 7 days PITR), Sanity (manual: 30 days)
   - Security notes: Backups contain sensitive data, secure storage requirements
   - Related scripts: Links to backup-supabase.sh, backup-sanity.sh, verify-backups.sh

Use clear headings, code blocks with syntax highlighting, warning callouts for dangerous operations, and numbered steps for procedures.
  </action>
  <verify>
1. Verify docs/backup-restoration-runbook.md exists
2. Check file has all major sections: `grep -E "^## " docs/backup-restoration-runbook.md`
3. Verify includes Supabase restoration steps: `grep "supabase db dump" docs/backup-restoration-runbook.md`
4. Verify includes Sanity restoration steps: `grep "sanity dataset import" docs/backup-restoration-runbook.md`
5. Run `wc -l docs/backup-restoration-runbook.md` and confirm >100 lines
6. Check for warning callouts: `grep -i "warning\|dangerous" docs/backup-restoration-runbook.md`
  </verify>
  <done>
Comprehensive backup restoration runbook created with step-by-step procedures for both Supabase and Sanity disaster recovery.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create GitHub Actions backup verification workflow</name>
  <files>
    .github/workflows/backup-verification.yml
  </files>
  <action>
Create scheduled GitHub Actions workflow to automatically verify backup procedures monthly.

**.github/workflows/backup-verification.yml:**

Structure:
1. Workflow name: "Backup Verification"
2. Triggers:
   - Schedule: `cron: '0 0 1 * *'` (runs 1st of every month at midnight UTC)
   - Manual trigger: `workflow_dispatch` (allows manual runs from GitHub UI)
3. Job: `verify-backups`
   - Runs on: `ubuntu-latest`
   - Steps:
     a. Checkout code: `actions/checkout@v4`
     b. Setup Node.js: `actions/setup-node@v4` with node-version 20
     c. Install Supabase CLI: `npm install -g supabase`
     d. Install Sanity CLI: `npm install -g @sanity/cli`
     e. Authenticate Sanity: Use SANITY_TOKEN from secrets
     f. Create backups directory: `mkdir -p backups/{supabase,sanity}`
     g. Run verification script: `bash scripts/verify-backups.sh`
        - Environment: `SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}`
     h. Upload backup artifacts: `actions/upload-artifact@v4`
        - Name: `backups-${{ github.run_number }}`
        - Path: `backups/`
        - Retention: 30 days
4. Add comments explaining:
   - Purpose: Automated monthly verification that backups can be created
   - Not testing restoration (too complex for automation) - manual quarterly tests per runbook
   - Artifacts stored for 30 days for verification

NOTE: This workflow requires GitHub secrets to be configured (SUPABASE_PROJECT_REF, SANITY_TOKEN). Add TODO comment for user setup.
  </action>
  <verify>
1. Verify .github/workflows/backup-verification.yml exists
2. Check cron schedule: `grep "cron:" .github/workflows/backup-verification.yml`
3. Verify calls verify-backups.sh: `grep "verify-backups.sh" .github/workflows/backup-verification.yml`
4. Check artifact upload: `grep "upload-artifact" .github/workflows/backup-verification.yml`
5. Verify environment variables: `grep "SUPABASE_PROJECT_REF" .github/workflows/backup-verification.yml`
  </verify>
  <done>
GitHub Actions workflow configured to run monthly backup verification with artifacts uploaded for review.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Complete backup and disaster recovery system for both Supabase and Sanity with automated verification and comprehensive runbook.
  </what-built>
  <how-to-verify>
**CRITICAL: Test backup restoration to verify procedures work BEFORE launch.**

**1. Install prerequisites:**
```bash
# Install Supabase CLI
npm install -g supabase

# Sanity CLI already installed (from Phase 1)
# Authenticate Sanity
sanity login
```

**2. Configure environment:**
```bash
# Get Supabase project ref from dashboard
export SUPABASE_PROJECT_REF="your-project-ref"

# Test Supabase CLI works
supabase db dump --project-ref "$SUPABASE_PROJECT_REF" --list
```

**3. Test Supabase backup:**
```bash
bash scripts/backup-supabase.sh
# Expected: Creates backups/supabase/backup-YYYY-MM-DD.sql
# Verify file exists and has content (should have CREATE TABLE statements)
ls -lh backups/supabase/
head -50 backups/supabase/backup-*.sql
```

**4. Test Sanity backup:**
```bash
bash scripts/backup-sanity.sh
# Expected: Creates backups/sanity/production-backup-YYYY-MM-DD-HHMMSS.tar.gz
# Verify file exists and has content
ls -lh backups/sanity/
tar -tzf backups/sanity/*.tar.gz | head -20
```

**5. Test full verification:**
```bash
bash scripts/verify-backups.sh
# Expected: Runs both backups and shows summary report
# Should output "✅ All backups verified successfully"
```

**6. Test restoration (NON-PRODUCTION):**

**Supabase - Restore to local:**
```bash
# Start local Supabase
supabase start

# Restore latest backup
psql postgresql://postgres:postgres@localhost:54322/postgres < backups/supabase/backup-*.sql

# Verify restoration
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM user_roles;"
# Expected: Shows count of admin users
```

**Sanity - Restore to test dataset:**
```bash
# Create test dataset
sanity dataset create backup-test-verification

# Import backup to test dataset
sanity dataset import backups/sanity/*.tar.gz backup-test-verification --replace

# Verify import
sanity dataset list
# Expected: Shows backup-test-verification with document count
```

**7. Review runbook:**
- Open docs/backup-restoration-runbook.md
- Verify all sections are complete and accurate
- Confirm restoration procedures match what you just tested
- Update Emergency Contacts section with actual team members

**8. Configure GitHub secrets (for automated workflow):**
- Go to GitHub repo → Settings → Secrets and variables → Actions
- Add: `SUPABASE_PROJECT_REF` (your project reference)
- Add: `SANITY_TOKEN` (from Sanity Manage → API → Tokens → Create token with Viewer role)

**Success criteria:**
- [ ] Supabase backup downloads successfully and contains valid SQL
- [ ] Sanity export creates valid .tar.gz with documents and assets
- [ ] Supabase backup can be restored to local development database
- [ ] Sanity backup can be imported to test dataset
- [ ] Runbook procedures match tested reality
- [ ] GitHub secrets configured for automated workflow

**CRITICAL:** If restoration fails, the backup system is not production-ready. Fix issues before launch.
  </how-to-verify>
  <resume-signal>
Type "approved" if both backup systems work and restoration procedures are verified, OR describe restoration failures that need fixing.
  </resume-signal>
</task>

</tasks>

<verification>
## Restoration Testing
- [ ] Supabase backup can be restored to local development (tested manually)
- [ ] Sanity backup can be imported to test dataset (tested manually)
- [ ] Restoration procedures documented in runbook match reality
- [ ] All SQL/CLI commands in runbook are accurate

## Documentation
- [ ] Backup restoration runbook is comprehensive (>100 lines)
- [ ] Runbook includes both Supabase and Sanity procedures
- [ ] Warning callouts for dangerous operations present
- [ ] Emergency contacts and testing schedule documented

## Automation
- [ ] GitHub Actions workflow scheduled to run monthly
- [ ] Workflow uploads backup artifacts with 30-day retention
- [ ] Required secrets documented for user configuration
</verification>

<success_criteria>
1. Backup restoration verified by manually restoring to test environments (local Supabase + test Sanity dataset)
2. Comprehensive runbook documents step-by-step procedures for disaster recovery
3. GitHub Actions workflow automates monthly backup verification with artifact storage
4. All backup procedures tested and proven to work before launch
</success_criteria>

<output>
After completion, create `.planning/phases/06-launch-preparation/06-02b-SUMMARY.md` documenting:
- Restoration testing results (successful/failed, time taken)
- Any issues encountered during restoration testing
- Backup retention policies implemented
- Schedule for ongoing backup verification (monthly automated + quarterly manual)
- GitHub secrets configuration status
</output>
