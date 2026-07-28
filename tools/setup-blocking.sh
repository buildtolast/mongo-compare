#!/bin/bash

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

echo "Setting up blocking relationships..."

# Issue 2 (01) is blocked by 1 (parent)
gh issue edit 2 --add-blocked-by 1 2>&1
echo "Issue 2: blocked by 1"

# Issue 3 (02) is blocked by 2 (01)
gh issue edit 3 --add-blocked-by 2 2>&1
echo "Issue 3: blocked by 2"

# Issue 4 (03) is blocked by 3 (02)
gh issue edit 4 --add-blocked-by 3 2>&1
echo "Issue 4: blocked by 3"

# Issue 5 (04) is blocked by 4 (03)
gh issue edit 5 --add-blocked-by 4 2>&1
echo "Issue 5: blocked by 4"

# Issue 6 (05) is blocked by 5 (04)
gh issue edit 6 --add-blocked-by 5 2>&1
echo "Issue 6: blocked by 5"

# Issue 7 (06) is blocked by 6 (05)
gh issue edit 7 --add-blocked-by 6 2>&1
echo "Issue 7: blocked by 6"

# Issue 8 (07) is blocked by 7 (06)
gh issue edit 8 --add-blocked-by 7 2>&1
echo "Issue 8: blocked by 7"

# Issue 9 (08) is blocked by 8 (07)
gh issue edit 9 --add-blocked-by 8 2>&1
echo "Issue 9: blocked by 8"

# Issue 10 (09) is blocked by 9 (08)
gh issue edit 10 --add-blocked-by 9 2>&1
echo "Issue 10: blocked by 9"

# Issue 11 (10) is blocked by 10 (09)
gh issue edit 11 --add-blocked-by 10 2>&1
echo "Issue 11: blocked by 10"

# Issue 12 (11) is blocked by 11 (10)
gh issue edit 12 --add-blocked-by 11 2>&1
echo "Issue 12: blocked by 11"

# Issue 13 (12) is blocked by 12 (11)
gh issue edit 13 --add-blocked-by 12 2>&1
echo "Issue 13: blocked by 12"

# Issue 14 (13) is blocked by 13 (12)
gh issue edit 14 --add-blocked-by 13 2>&1
echo "Issue 14: blocked by 13"

# Issue 15 (14) is blocked by 14 (13)
gh issue edit 15 --add-blocked-by 14 2>&1
echo "Issue 15: blocked by 14"

# Issue 16 (15) is blocked by 15 (14)
gh issue edit 16 --add-blocked-by 15 2>&1
echo "Issue 16: blocked by 15"

# Issue 17 (16) is blocked by 16 (15)
gh issue edit 17 --add-blocked-by 16 2>&1
echo "Issue 17: blocked by 16"

# Issue 18 (17) is blocked by 17 (16)
gh issue edit 18 --add-blocked-by 17 2>&1
echo "Issue 18: blocked by 17"

# Issue 19 (18) is blocked by 18 (17)
gh issue edit 19 --add-blocked-by 18 2>&1
echo "Issue 19: blocked by 18"

# Issue 24 (24 - CLI integration) is blocked by 7 (06)
gh issue edit 24 --add-blocked-by 7 2>&1
echo "Issue 24: blocked by 7 (06 - Diff Engine Integration)"

# Issue 25 (25 - Security Audit) is blocked by 16 (15 - Testing Suite)
gh issue edit 25 --add-blocked-by 16 2>&1
echo "Issue 25: blocked by 16 (15 - Testing Suite)"

# Issue 26 (26 - Multi-Instance) is blocked by 19 (18 - Documentation)
gh issue edit 26 --add-blocked-by 19 2>&1
echo "Issue 26: blocked by 19 (18 - Documentation and Final Polish)"

# Issue 27 (27 - Advanced Visualization) is blocked by 19 (18 - Documentation)
gh issue edit 27 --add-blocked-by 19 2>&1
echo "Issue 27: blocked by 19 (18 - Documentation and Final Polish)"

# Issue 28 (28 - Cloud Deployment) is blocked by 19 (18 - Documentation)
gh issue edit 28 --add-blocked-by 19 2>&1
echo "Issue 28: blocked by 19 (18 - Documentation and Final Polish)"

# Issue 29 (19 - Wireframe Review) - no blocking
# Issue 30 (20 - Architecture Review) - no blocking
# Issue 31 (21 - Plan Review) - no blocking
# Issue 32 (22 - Domain Model) - no blocking
# Issue 33 (23 - ADR Validation) - no blocking

echo "All blocking relationships set up!"
