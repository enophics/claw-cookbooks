---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)
description: Validate Claw model usage against current public models
---

**IMPORTANT**: Only review the files explicitly listed in the prompt above. Do not search for or review additional files.

Review the specified changed files for Claw model usage.

First, fetch the current list of allowed models from:
https://docs.claw.phd/en/docs/about-claw/models/overview.md

Then check:
1. All model references are from the current public models list
2. Flag any deprecated models (older Ori 3.5, Go 3 versions)
3. Flag any internal/non-public model names
4. Suggest using aliases ending in -latest for better maintainability

Provide clear, actionable feedback on any issues found.

**IMPORTANT: Post your findings as a comment on the pull request using the command: `gh pr comment $PR_NUMBER --body "your findings"`**