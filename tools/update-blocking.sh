#!/bin/bash

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

# Update issues 19-23 to add ready-for-human label
for i in 19 20 21 22 23; do
  gh issue edit $i --add-label "ready-for-human" 2>&1
  echo "Updated issue $i"
done

# Update issue 24 (blocking 6 - Diff Engine Integration)
gh issue edit 24 --blocking 6 2>&1
echo "Updated issue 24 blocking relationship"

# Update issue 25 (blocking 15 - Testing Suite)
gh issue edit 25 --blocking 15 2>&1
echo "Updated issue 25 blocking relationship"

# Update issue 26 (blocking 18 - Documentation and Final Polish)
gh issue edit 26 --blocking 18 2>&1
echo "Updated issue 26 blocking relationship"

# Update issue 27 (blocking 18 - Documentation and Final Polish)
gh issue edit 27 --blocking 18 2>&1
echo "Updated issue 27 blocking relationship"

# Update issue 28 (blocking 18 - Documentation and Final Polish)
gh issue edit 28 --blocking 18 2>&1
echo "Updated issue 28 blocking relationship"

echo "All blocking relationships updated!"
