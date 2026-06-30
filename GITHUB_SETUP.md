# GitHub And Vercel Setup

## Current State

- Local Git repository has been initialized on branch `main`.
- Initial local commit:

```text
a73b01d chore: initialize birthday album project
```

- `.gitignore` now excludes local/generated folders such as `node_modules/`, `.playwright-cli/`, `test-results/`, `output/playwright/`, `.agents/`, `.codex/`, `.env*`, logs, and OS metadata.
- `output/reference/**` is intentionally kept trackable because the project docs use the reference-video contact sheets and frames for future visual comparison.
- During setup, the GitHub CLI was installed and logged in as `kkkchen12`, but the first token could not create a new repository:

```text
GraphQL: Resource not accessible by personal access token (createRepository)
```

- After refreshing GitHub CLI permissions, the private repository was created and `main` was pushed:

```text
https://github.com/kkkchen12/AAAyichun
```

## Recommended Private GitHub Repository

The private repository is:

```text
https://github.com/kkkchen12/AAAyichun
```

If the remote ever needs to be repaired, use:

```powershell
git remote set-url origin https://github.com/kkkchen12/AAAyichun.git
git push -u origin main
```

The original setup options are kept below for reference.

### Option A: Refresh `gh` Permission

Run this in PowerShell and complete the browser authorization:

```powershell
gh auth refresh -h github.com -s repo
```

Then, from this project folder:

```powershell
gh repo create AAAyichun --private --source . --remote origin --description "Private romantic birthday album and letter site" --push
```

### Option B: Create The Repo In Browser

1. Open `https://github.com/new`.
2. Repository name: `AAAyichun`.
3. Visibility: `Private`.
4. Do not add README, `.gitignore`, or license on GitHub because the local project already has them.
5. After creating it, run:

```powershell
git remote add origin https://github.com/kkkchen12/AAAyichun.git
git push -u origin main
```

If `origin` already exists later, use:

```powershell
git remote set-url origin https://github.com/kkkchen12/AAAyichun.git
git push -u origin main
```

## Vercel Deployment Notes

After the private GitHub repository is pushed:

1. Open Vercel and import `kkkchen12/AAAyichun`.
2. Framework preset: `Other`.
3. Build command: leave empty.
4. Output directory: `.`.
5. Install command: leave default or empty; this is a static site.

The repository can stay private, but the Vercel deployment URL is public to anyone who has the link. Add the private entrance before sending the final URL.

## Versioning Rule For Future Visual Work

Before any major album effect change:

```powershell
npm run check
git status -sb
git add app.js styles.css tests/visual-album.spec.js PROJECT_DOC.md PROJECT_MEMORY.md PROJECT_STABILITY_NOTE.md
git commit -m "stabilize album motion"
```

Use a clear commit message for every visual milestone. If a new effect is worse, use Git history to compare or revert that commit instead of manually guessing which code changed.
