import os
import subprocess
from datetime import datetime

def get_git_logs():
    # Grabs commits between the last tag and current HEAD. 
    # Format: "abbreviated_hash | subject"
    try:
        # Check for latest tag
        tag = subprocess.check_output(["git", "describe", "--tags", "--abbrev=0"], text=True).strip()
        log_range = f"{tag}..HEAD"
    except subprocess.CalledProcessError:
        log_range = "HEAD"

    cmd = ["git", "log", log_range, "--pretty=format:%h|%s"]
    commits = subprocess.check_output(cmd, text=True).splitlines()
    return commits

def parse_commits(commits):
    categories = {"Added": [], "Fixed": [], "Changed": []}
    
    for commit in commits:
        if not commit.strip():
            continue
        sha, message = commit.split("|", 1)
        msg_lower = message.lower()
        
        # Categorize based on common keywords
        if any(x in msg_lower for x in ["feat", "add", "new", "added"]):
            categories["Added"].append(f"- {message} ({sha})")
        elif any(x in msg_lower for x in ["fix", "bug", "resolve", "fixed"]):
            categories["Fixed"].append(f"- {message} ({sha})")
        else:
            # Everything else (chore, style, refactor, video routines) goes here
            categories["Changed"].append(f"- {message} ({sha})")
            
    return categories

def write_changelog(categories):
    filename = "CHANGELOG.md"
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Read existing content if it exists
    existing_content = ""
    if os.path.exists(filename):
        with open(filename, "r") as f:
            existing_content = f.read()
            
    # Build new entry
    new_entry = f"## [Unreleased] - {today}\n"
    for cat, items in categories.items():
        if items:
            new_entry += f"### {cat}\n"
            new_entry += "\n".join(items) + "\n\n"
            
    new_entry += "---\n\n"
    
    # Write back out (prepending the new changes)
    with open(filename, "w") as f:
        f.write(new_entry + existing_content)

if __name__ == "__main__":
    try:
        commits = get_git_logs()
        parsed = parse_commits(commits)
        write_changelog(parsed)
        print("CHANGELOG.md has been updated successfully.")
    except Exception as e:
        print(f"Error running script: {e}. Make sure you are in a Git repository.")