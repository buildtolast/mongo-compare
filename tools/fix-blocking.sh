#!/bin/bash

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

# Update issue 24 (blocking 6 - Diff Engine Integration)
gh issue edit 24 --add-blocking 6 2>&1
echo "Updated issue 24 blocking relationship"

# Update issue 25 (blocking 15 - Testing Suite)
gh issue edit 25 --add-blocking 15 2>&1
echo "Updated issue 25 blocking relationship"

# Update issue 26 (blocking 18 - Documentation and Final Polish)
gh issue edit 26 --add-blocking 18 2>&1
echo "Updated issue 26 blocking relationship"

# Update issue 27 (blocking 18 - Documentation and Final Polish)
gh issue edit 27 --add-blocking 18 2>&1
echo "Updated issue 27 blocking relationship"

# Update issue 28 (blocking 18 - Documentation and Final Polish)
gh issue edit 28 --add-blocking 18 2>&1
echo "Updated issue 28 blocking relationship"

echo "All blocking relationships updated!"
