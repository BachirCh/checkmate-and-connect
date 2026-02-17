# Backup & Restoration Runbook

## Overview

**Purpose:** This runbook provides step-by-step procedures for restoring data from backups during disaster recovery scenarios. Use this guide when recovering from database corruption, accidental data deletion, security breaches, or infrastructure failures.

**When to use:**
- Database corruption or data loss
- Accidental deletion of critical data
- Security breach requiring rollback to known-good state
- Infrastructure failure requiring migration to new environment
- Quarterly verification testing (non-production)

**RTO/RPO Expectations:**
- **Supabase:** Pro plan includes Point-in-Time Recovery (PITR) with 2-minute Recovery Point Objective (RPO). Recovery Time Objective (RTO) depends on database size but typically 15-30 minutes for full restoration.
- **Sanity CMS:** RPO depends on backup frequency (daily automated backups = 24-hour RPO). RTO typically 10-20 minutes for dataset import.

## Prerequisites

### Access Requirements
- Supabase project admin access (dashboard.supabase.com)
- Sanity project admin access (sanity.io/manage)
- Terminal/command line access
- Project repository access

### Required Tools
```bash
# Supabase CLI
npm install -g supabase

# Sanity CLI (should already be installed)
npm install -g @sanity/cli

# Verify installations
supabase --version
sanity --version
```

### Credentials Needed
- Supabase project reference ID
- Supabase database password (from project settings)
- Sanity authentication token (or use `sanity login`)

### Required Skills
- Basic command line navigation
- Understanding of SQL databases
- Familiarity with JSON/document databases

## Supabase Database Restoration

### List Available Backups

Check what backups are available for your project:

```bash
# Set your project reference
export SUPABASE_PROJECT_REF="your-project-ref-here"

# List all available backups
supabase db dump --project-ref "$SUPABASE_PROJECT_REF" --list
```

**Expected output:** List of backup timestamps with sizes

### Download Specific Backup

Download a backup file to your local machine:

```bash
# Create backups directory
mkdir -p backups/supabase

# Download backup (latest or specific timestamp)
supabase db dump --project-ref "$SUPABASE_PROJECT_REF" --output backups/supabase/backup.sql
```

**Note:** File size should be several MB for a database with user data.

### Verify Backup Integrity

Check that the backup file is valid and complete:

```bash
# Check file size (should be >1KB, typically several MB)
ls -lh backups/supabase/backup.sql

# Verify SQL content - check for key tables
grep -i "CREATE TABLE" backups/supabase/backup.sql
grep -i "user_roles" backups/supabase/backup.sql
grep -i "profiles" backups/supabase/backup.sql

# Count INSERT statements (indicates data, not just schema)
grep -c "INSERT INTO" backups/supabase/backup.sql
```

**Warning signs:**
- File size < 1KB = likely empty or failed backup
- No CREATE TABLE statements = incomplete backup
- No INSERT statements = schema-only backup (no data)

### Restore to Local Development

**Use this for safe testing before production restoration:**

```bash
# Start local Supabase instance
supabase start

# Get local database URL (shown in start output)
# Default: postgresql://postgres:postgres@localhost:54322/postgres

# Restore backup to local database
psql postgresql://postgres:postgres@localhost:54322/postgres < backups/supabase/backup.sql
```

**Note:** This may show errors for objects that already exist - this is normal if the backup includes CREATE statements.

### Restore to Production Database

**⚠️ DANGER: This will overwrite production data. Only proceed if you have verified the backup and have a current backup of production data.**

**Pre-restoration checklist:**
1. [ ] Backup current production database first
2. [ ] Verify backup file is correct and complete
3. [ ] Notify team that production will be temporarily unavailable
4. [ ] Test restoration on local/staging environment first
5. [ ] Have rollback plan ready

**Restoration procedure:**

```bash
# 1. Create a backup of CURRENT production state
supabase db dump --project-ref "$SUPABASE_PROJECT_REF" --output backups/supabase/pre-restore-backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Get production database connection string
# From Supabase Dashboard: Settings → Database → Connection string (Direct connection)
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# 3. Restore backup to production
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backups/supabase/backup.sql
```

**Alternative: Point-in-Time Recovery (PITR)**

For Pro plan projects with PITR enabled:

```bash
# Restore to specific timestamp (last 7 days available)
# Use Supabase Dashboard: Database → Backups → Point in Time Recovery
# Select timestamp and confirm restoration

# This creates a new database and swaps it with production
# Downtime: typically 5-15 minutes depending on database size
```

### Verify Restoration

After restoration, verify data integrity:

```bash
# Connect to database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Check key tables exist
\dt

# Count rows in critical tables
SELECT COUNT(*) FROM user_roles;
SELECT COUNT(*) FROM auth.users;

# Spot-check recent data
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
SELECT user_id, role FROM user_roles;

# Exit psql
\q
```

**Application verification:**
1. Test login flow at your application URL
2. Verify admin users can access dashboard
3. Check member data displays correctly
4. Test form submissions work

### Troubleshooting

**Error: "authentication failed"**
- Verify database password is correct
- Check project reference ID matches
- Ensure IP is whitelisted in Supabase dashboard (or use connection pooler)

**Error: "connection timed out"**
- Check network connectivity
- Verify firewall allows outbound connections on port 5432
- Try using connection pooler URL instead of direct connection

**Error: "relation already exists"**
- This may be normal if backup includes CREATE statements
- Use `--clean` flag with psql to drop existing objects first
- Or manually drop conflicting tables before restoration

**Data looks incorrect after restoration**
- Verify you restored the correct backup file
- Check backup timestamp matches expected data state
- Consider rolling back and trying an earlier backup

## Sanity CMS Restoration

### List Available Exports

Check what backup exports exist:

```bash
# List backups directory
ls -lh backups/sanity/

# Expected format: production-backup-YYYY-MM-DD-HHMMSS.tar.gz
```

**Retention policy:** Backups older than 30 days are automatically deleted.

### Verify Export Contents

Check that the export file contains expected data:

```bash
# List contents of backup archive
tar -tzf backups/sanity/production-backup-*.tar.gz

# Expected output: data.ndjson and assets directory
# data.ndjson = document data
# assets/ = uploaded images and files

# Count documents in export
tar -xzf backups/sanity/production-backup-*.tar.gz -O data.ndjson | wc -l

# Spot-check document types
tar -xzf backups/sanity/production-backup-*.tar.gz -O data.ndjson | head -5
```

**Warning signs:**
- File size < 1KB = empty or failed export
- No data.ndjson file = incomplete export
- Empty assets directory = images not included (may be intentional)

### Create Test Dataset

**Always test restoration on a non-production dataset first:**

```bash
# Authenticate with Sanity
sanity login

# Create test dataset for restoration verification
sanity dataset create backup-test-$(date +%Y%m%d)

# List datasets to confirm creation
sanity dataset list
```

### Import to Test Dataset

Restore backup to test dataset for verification:

```bash
# Import backup to test dataset
# --replace flag overwrites existing data
sanity dataset import backups/sanity/production-backup-*.tar.gz backup-test-$(date +%Y%m%d) --replace

# Expected output: Progress bar showing documents and assets imported
```

**Note:** Import time depends on dataset size. Expect 1-5 minutes for typical member directory.

### Verify Import

Check that data imported correctly:

```bash
# List datasets with document counts
sanity dataset list

# Expected: Test dataset shows similar document count to production

# Use Sanity CLI to query data
sanity documents query '*[_type == "member"]' --dataset backup-test-$(date +%Y%m%d)

# Count by document type
sanity documents query '*[_type == "member"] | length' --dataset backup-test-$(date +%Y%m%d)
sanity documents query '*[_type == "blog"] | length' --dataset backup-test-$(date +%Y%m%d)
```

**Manual verification via Studio:**
1. Open Sanity Studio: http://localhost:3000/studio
2. Switch dataset: Use dataset picker in Studio (if available)
3. Browse member documents
4. Check uploaded images load correctly

### Restore to Production Dataset

**⚠️ DANGER: This will overwrite production CMS data. Only proceed if you have verified the backup and have a current export of production data.**

**Pre-restoration checklist:**
1. [ ] Export current production dataset first
2. [ ] Verify backup file is correct and complete
3. [ ] Notify team that CMS will be temporarily unavailable
4. [ ] Test restoration on test dataset first
5. [ ] Have rollback plan ready

**Restoration procedure:**

```bash
# 1. Export CURRENT production state
bash scripts/backup-sanity.sh

# 2. Verify backup created successfully
ls -lh backups/sanity/
# Should see new backup file with current timestamp

# 3. Import backup to production dataset
# Replace "production" with your actual production dataset name
sanity dataset import backups/sanity/production-backup-[TIMESTAMP].tar.gz production --replace

# Expected output: Progress bar showing import completion
```

**Import flags explained:**
- `--replace`: Overwrites existing documents (destructive)
- Without `--replace`: Skips documents with duplicate IDs (safe but may not fully restore)

### Verify Restoration

After production restoration:

**1. Check document counts:**
```bash
# Compare counts to pre-restoration state
sanity dataset list

# Query key document types
sanity documents query '*[_type == "member"] | length'
sanity documents query '*[_type == "blog"] | length'
```

**2. Studio verification:**
1. Open Studio: http://localhost:3000/studio (or your Studio URL)
2. Browse member documents - spot-check recent additions
3. Check blog posts render correctly
4. Verify uploaded images display properly

**3. Public site verification:**
1. Visit homepage: Check member highlights section
2. Visit blog: Verify posts display
3. Test image loading: Check for broken images
4. Check member directory: Verify all profiles visible

### Troubleshooting

**Error: "Dataset not found"**
- Verify dataset name is correct (case-sensitive)
- Check project ID in sanity.cli.ts matches
- Ensure you're authenticated to correct project

**Error: "Authentication required"**
- Run `sanity login` to authenticate
- Or use token: `sanity dataset import --token YOUR_TOKEN`

**Images not displaying after restoration**
- Assets may not have been included in export
- Check backup file includes assets directory: `tar -tzf backup.tar.gz | grep assets`
- If assets missing, they're still in Sanity CDN (reference-based, not deleted)

**Document counts don't match**
- Check if `--replace` flag was used (without it, duplicates are skipped)
- Verify correct backup file was imported
- Consider re-running import with `--replace` flag

**Schema errors during import**
- Backup schema may not match current schema
- Update schema first: `sanity schema extract` and compare
- Or restore schema from backup date before importing data

## Testing Procedure

### Quarterly Verification Schedule

**Required manual testing:** Test complete restoration procedure quarterly to ensure backups work.

**Testing calendar:**
- Q1: January (week of Jan 15)
- Q2: April (week of Apr 15)
- Q3: July (week of Jul 15)
- Q4: October (week of Oct 15)

**Testing procedure:**
1. Follow "Restore to Local Development" (Supabase) section above
2. Follow "Import to Test Dataset" (Sanity) section above
3. Document results using template below
4. Update Emergency Contacts if team changes

### Test Restoration to Non-Production

**Always test on non-production environments:**
- Supabase: Use local instance (`supabase start`)
- Sanity: Use test dataset (`backup-test-YYYYMMDD`)

**Never test restoration directly on production** unless it's an actual emergency.

### Document Test Results

Use this template to record quarterly test results:

```markdown
## Backup Restoration Test - [YYYY-MM-DD]

**Tester:** [Your Name]
**Test Type:** Quarterly Verification

### Supabase Restoration
- Backup date: [YYYY-MM-DD]
- Backup size: [MB]
- Restoration target: Local development
- Time to restore: [MM:SS]
- Status: ✅ Success / ❌ Failed
- Issues encountered: [None / Description]

### Sanity Restoration
- Backup date: [YYYY-MM-DD]
- Backup size: [MB]
- Restoration target: Test dataset
- Time to restore: [MM:SS]
- Documents imported: [count]
- Assets imported: [count]
- Status: ✅ Success / ❌ Failed
- Issues encountered: [None / Description]

### Overall Assessment
- Restoration procedures accurate: ✅ / ❌
- Runbook updates needed: [Yes/No]
- Action items: [List any]

**Next test due:** [YYYY-MM-DD]
```

Save test results in: `docs/backup-tests/test-YYYY-MM-DD.md`

### Automation

Monthly automated backup verification runs via GitHub Actions:
- Workflow: `.github/workflows/backup-verification.yml`
- Schedule: 1st of every month at midnight UTC
- What it does: Creates fresh backups, verifies file integrity
- What it doesn't do: Test restoration (too complex for automation)

**Manual quarterly tests supplement automation** by validating restoration procedures work.

## Emergency Contacts

### Supabase Support
- Dashboard: https://app.supabase.com/project/[PROJECT-REF]
- Status page: https://status.supabase.com
- Support: support@supabase.io (Pro plan includes priority support)
- Documentation: https://supabase.com/docs/guides/database/backups

### Sanity Support
- Dashboard: https://sanity.io/manage
- Status page: https://status.sanity.io
- Support: support@sanity.io
- Documentation: https://www.sanity.io/docs/import-export

### Team Contacts

**Project Administrators:**
- [Name]: [Email] - [Role]
- [Name]: [Email] - [Role]
- [Name]: [Email] - [Role]

**TODO:** Update this section with actual team member contact information.

**Escalation path:**
1. Try self-service restoration following this runbook
2. Contact team administrator with relevant experience
3. Contact platform support (Supabase/Sanity) if platform issue
4. If data loss is critical and recent, check if PITR available (Supabase Pro)

## Appendix

### Backup Retention Policies

**Supabase (Pro Plan):**
- Point-in-Time Recovery (PITR): 7 days of continuous backup
- Daily snapshots: 7 days retention
- Weekly snapshots: 4 weeks retention
- All backups stored in encrypted format by Supabase

**Sanity CMS (Manual Backups):**
- Daily automated backups via GitHub Actions
- 30-day retention policy (automated cleanup)
- Backups stored in `backups/sanity/` directory
- Format: `production-backup-YYYY-MM-DD-HHMMSS.tar.gz`

**Retention policy rationale:**
- 30 days covers accidental deletions discovered within a month
- Weekly manual backups can supplement for longer retention if needed
- For compliance requirements, adjust retention in cleanup script

### Security Notes

**Backups contain sensitive data:**
- User email addresses and authentication data (Supabase)
- Member profiles including contact information (Sanity)
- Uploaded photos and personal information

**Security requirements:**
- Store backups in secure location with restricted access
- Encrypt backups at rest if stored outside platform
- Do not commit backup files to version control
- Limit access to backup files to administrators only
- Use secure transfer methods (SFTP, encrypted S3, etc.)

**Access control:**
- `.gitignore` includes `backups/` directory to prevent accidental commits
- GitHub Actions workflow artifacts are private to repository
- Backup scripts require environment variables (not hardcoded credentials)

### Related Scripts

This runbook references automated backup scripts in the repository:

- **scripts/backup-supabase.sh** - Automated Supabase database backup
- **scripts/backup-sanity.sh** - Automated Sanity dataset export
- **scripts/verify-backups.sh** - Runs both backups and validates integrity

**Script location:** `/scripts/` directory in project root

**Usage:**
```bash
# Run individual backups
bash scripts/backup-supabase.sh
bash scripts/backup-sanity.sh

# Run full backup verification
bash scripts/verify-backups.sh
```

**Automation:**
- GitHub Actions workflow: `.github/workflows/backup-verification.yml`
- Schedule: Monthly on 1st at midnight UTC
- Manual trigger: Via GitHub Actions UI

### Disaster Recovery Scenarios

**Scenario 1: Accidental deletion of member records**
1. Identify when deletion occurred
2. Download Sanity backup from before deletion
3. Restore to test dataset and verify deleted records present
4. Export only affected records from test dataset
5. Import affected records to production (merge, don't replace)

**Scenario 2: Database corruption**
1. Assess extent of corruption
2. Use Supabase PITR to restore to timestamp before corruption
3. Expected downtime: 15-30 minutes
4. Verify restoration via application testing

**Scenario 3: Security breach requiring rollback**
1. Identify last known-good timestamp
2. Create emergency backup of current state (for forensics)
3. Restore Supabase to known-good timestamp via PITR
4. Restore Sanity from known-good backup
5. Rotate all credentials and API keys
6. Analyze breached data for required notifications

**Scenario 4: Migration to new infrastructure**
1. Set up new Supabase project
2. Set up new Sanity project
3. Export from old production (using backup scripts)
4. Import to new production
5. Update application environment variables
6. Test thoroughly before DNS cutover
7. Keep old infrastructure running for 7-day rollback window

---

**Document version:** 1.0
**Last updated:** 2026-02-17
**Next review:** 2026-05-17 (quarterly)
