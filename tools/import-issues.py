#!/usr/bin/env python3
"""
Import GitHub issues from markdown files to GitHub repository.
Usage: python import-issues.py <repo-owner> <repo-name> <token> <issues-dir>
"""

import os
import re
import sys
import json
import requests

def parse_issue_file(filepath):
    """Parse a markdown issue file and extract title, body, and metadata."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract issue number from filename (e.g., "19-rust-backend-compilation.md")
    match = re.match(r'^(\d+)-', os.path.basename(filepath))
    issue_number = int(match.group(1)) if match else None
    
    # Try to extract title from first line
    lines = content.strip().split('\n')
    title = lines[0].replace('# ', '').strip() if lines else "Untitled"
    
    # Remove the title from content and get body
    body = '\n'.join(lines[1:]).strip()
    
    return {
        'title': title,
        'body': body,
        'issue_number': issue_number
    }

def import_issue(owner, repo, token, issue_data, existing_issues):
    """Create or update an issue on GitHub."""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10"
    }
    
    # Check if issue with this number already exists
    issue_number = issue_data['issue_number']
    if issue_number and issue_number in existing_issues:
        # Update existing issue
        existing = existing_issues[issue_number]
        if existing['state'] == 'open' or issue_data['body'] != existing.get('body', ''):
            # Only update if it's open or content changed
            print(f"  → Skipping #{issue_number} (already exists)")
            return
        else:
            # Issue was closed, reopen it
            print(f"  → Reopening #{issue_number}")
            data = {
                "state": "open",
                "title": issue_data['title'],
                "body": issue_data['body']
            }
            resp = requests.patch(url=f"{url}/{issue_number}", headers=headers, json=data)
            if resp.status_code == 200:
                print(f"  ✓ Reopened #{issue_number}")
            else:
                print(f"  ✗ Failed to reopen: {resp.status_code}")
    else:
        # Create new issue
        print(f"  → Creating #{issue_number or 'new'}: {issue_data['title'][:50]}...")
        data = {
            "title": issue_data['title'],
            "body": issue_data['body']
        }
        if issue_number:
            data["issue_number"] = issue_number
        
        resp = requests.post(url, headers=headers, json=data)
        
        if resp.status_code == 201:
            print(f"  ✓ Created #{issue_number or resp.json().get('number', 'new')}")
        elif resp.status_code == 422 and issue_number:
            # Issue number might already exist, try without specifying
            data.pop("issue_number", None)
            resp = requests.post(url, headers=headers, json=data)
            if resp.status_code == 201:
                print(f"  ✓ Created new issue (#{resp.json().get('number', 'unknown')})")
        else:
            print(f"  ✗ Failed: {resp.status_code} - {resp.text}")

def get_existing_issues(owner, repo, token):
    """Get all existing open issues from the repository."""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=100"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10"
    }
    
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to fetch existing issues: {resp.status_code}")
        return {}
    
    issues = {}
    for issue in resp.json():
        if 'pull_request' not in issue:  # Exclude pull requests
            issues[issue['number']] = issue
    
    return issues

def main():
    if len(sys.argv) < 5:
        print("Usage: python import-issues.py <repo-owner> <repo-name> <token> <issues-dir>")
        print("Example: python import-issues.py buildtolast mongo-compare <token> .scratch/mongo-diff-ui/issues")
        sys.exit(1)
    
    owner = sys.argv[1]
    repo = sys.argv[2]
    token = sys.argv[3]
    issues_dir = sys.argv[4]
    
    print(f"Importing issues from {issues_dir} to {owner}/{repo}")
    print()
    
    # Get existing issues
    print("Fetching existing issues...")
    existing = get_existing_issues(owner, repo, token)
    print(f"Found {len(existing)} existing open issues")
    print()
    
    # Find all issue markdown files
    issue_files = sorted([f for f in os.listdir(issues_dir) if f.endswith('.md') and re.match(r'^\d+-', f)])
    
    print(f"Found {len(issue_files)} issue files to import:")
    print()
    
    # Import each issue
    for filename in issue_files:
        filepath = os.path.join(issues_dir, filename)
        print(f"Processing {filename}...")
        issue_data = parse_issue_file(filepath)
        import_issue(owner, repo, token, issue_data, existing)
        print()
    
    print("Done!")

if __name__ == "__main__":
    main()
