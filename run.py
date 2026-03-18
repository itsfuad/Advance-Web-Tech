#!/usr/bin/env python3
import os, sys, re, random, subprocess, shutil
from datetime import datetime
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
START_DATE   = os.environ.get("START_DATE",   "2026-03-13")
FRONTEND_END = os.environ.get("FRONTEND_END", "2026-03-22")  # frontend commits up to today
AUTHOR_NAME  = os.environ.get("AUTHOR_NAME",  "Fuad Hasan")
AUTHOR_EMAIL = os.environ.get("AUTHOR_EMAIL", "fuad.cs22@gmail.com")

EXCLUDE_NAMES = {
    "node_modules", ".git", ".gitignore", ".env",
    ".DS_Store", "__pycache__", ".next", "dist", "build", ".cache"
}
EXCLUDE_EXTS  = {".log", ".lock", ".map"}

MESSAGES = [
    "initial setup",
    "add project structure",
    "add base config",
    "implement core logic",
    "refactor utilities",
    "fix edge case handling",
    "update dependencies",
    "add error handling",
    "clean up unused imports",
    "improve readability",
    "add input validation",
    "minor tweaks",
    "fix typo in comments",
    "add helper functions",
    "optimise performance",
    "handle null checks",
    "update README",
    "wire up modules",
    "finalize initial version",
]

# ── Helpers ───────────────────────────────────────────────────────────────────
def run(cmd, env=None):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, env=env)

def git_identity():
    try:
        name  = run(["git", "config", "user.name"]).stdout.strip()
        email = run(["git", "config", "user.email"]).stdout.strip()
        return name, email
    except Exception:
        return "Dev", "dev@localhost"

def collect_files(root):
    result = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune excluded dirs in-place
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_NAMES and not d.startswith(".")
        ]
        for fname in filenames:
            if fname in EXCLUDE_NAMES:
                continue
            if Path(fname).suffix in EXCLUDE_EXTS:
                continue
            full = os.path.join(dirpath, fname)
            rel  = os.path.relpath(full, root)
            result.append(rel)
    return sorted(result)

def priority(f):
    name = Path(f).name
    if re.match(r"README", name, re.I):                                  return 0
    if re.search(r"\.(toml|json|yaml|yml|cfg|ini)$", name):              return 1
    if re.search(r"\.(md|txt|rst)$", name):                              return 2
    if re.search(r"\.(js|ts|jsx|tsx|py|rb|go|rs|java|c|cpp|h)$", name): return 3
    if re.search(r"\.(css|scss|sass|less|html|vue|svelte)$", name):      return 4
    return 5

def group_files(files):
    # Split into backend-first and frontend-last
    frontend, backend = [], []
    for f in files:
        if f.startswith("frontend/") or f.startswith("frontend\\"):
            frontend.append(f)
        else:
            backend.append(f)

    def make_groups(file_list):
        file_list = sorted(file_list, key=lambda f: (priority(f), f))
        groups, i = [], 0
        while i < len(file_list):
            chunk = 1 if len(groups) < 2 else random.randint(1, 5)
            chunk = min(chunk, len(file_list) - i)
            groups.append(file_list[i:i+chunk])
            i += chunk
        return groups

    return make_groups(backend), make_groups(frontend)

def make_timestamps(n, start_ts, end_ts):
    """Spread n commits across [start_ts, end_ts] in sorted random order,
    clamped to working hours 09:00-22:00."""
    if n == 0:
        return []
    total = end_ts - start_ts
    raw = sorted(random.randint(0, total) for _ in range(n))
    timestamps = []
    for offset in raw:
        ts = start_ts + offset
        dt = datetime.fromtimestamp(ts)
        hour = dt.hour
        if hour < 9:
            ts += (9 - hour) * 3600 + random.randint(0, 1800)
        elif hour >= 22:
            ts -= (hour - 19) * 3600 + random.randint(0, 1800)
        timestamps.append(ts)
    return timestamps

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    root = os.getcwd()

    if not os.path.isdir(os.path.join(root, ".git")):
        print("[x] No .git directory found. Run from your project root.")
        sys.exit(1)

    print(f"[!] This will DESTROY the existing git history in: {root}")
    confirm = input("Type YES to continue: ").strip()
    if confirm != "YES":
        print("Aborted.")
        sys.exit(0)

    # Identity
    name, email = git_identity()
    name  = AUTHOR_NAME  or name
    email = AUTHOR_EMAIL or email

    # Collect
    print("[+] Collecting files...")
    files = collect_files(root)
    if not files:
        print("[x] No files found.")
        sys.exit(1)
    print(f"[+] Found {len(files)} files.")

    # Group — backend first, frontend after
    be_groups, fe_groups = group_files(files)
    print(f"[+] Backend: {len(be_groups)} commits, Frontend: {len(fe_groups)} commits.")

    # Timestamps — backend fills Mar 13-18, frontend starts after last backend commit
    start_ts    = int(datetime.strptime(f"{START_DATE} 09:00:00", "%Y-%m-%d %H:%M:%S").timestamp())
    backend_end = int(datetime.strptime("2026-03-18 22:00:00", "%Y-%m-%d %H:%M:%S").timestamp())
    fe_end      = int(datetime.strptime(f"{FRONTEND_END} 22:00:00", "%Y-%m-%d %H:%M:%S").timestamp())

    be_timestamps = make_timestamps(len(be_groups), start_ts, backend_end)
    # Frontend starts the day after last backend commit
    fe_start = (be_timestamps[-1] + 86400) if be_timestamps else backend_end
    fe_timestamps = make_timestamps(len(fe_groups), fe_start, fe_end)

    groups     = be_groups + fe_groups
    timestamps = be_timestamps + fe_timestamps
    n          = len(groups)

    # Nuke and reinit
    print("[+] Removing old .git...")
    shutil.rmtree(os.path.join(root, ".git"))
    run(["git", "init", "-q"])
    run(["git", "config", "user.name",  name])
    run(["git", "config", "user.email", email])

    # Commit loop
    print("[+] Committing...\n")
    env_base = os.environ.copy()
    env_base["GIT_AUTHOR_NAME"]     = name
    env_base["GIT_AUTHOR_EMAIL"]    = email
    env_base["GIT_COMMITTER_NAME"]  = name
    env_base["GIT_COMMITTER_EMAIL"] = email

    for idx, group in enumerate(groups):
        msg      = random.choice(MESSAGES)
        ts       = timestamps[idx]
        date_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%dT%H:%M:%S")
        env      = {**env_base, "GIT_AUTHOR_DATE": date_str, "GIT_COMMITTER_DATE": date_str}

        for f in group:
            try:
                subprocess.run(["git", "add", "--", f], capture_output=True, env=env)
            except Exception:
                pass

        try:
            subprocess.run(["git", "commit", "-q", "-m", msg], capture_output=True, env=env)
        except Exception:
            pass

        print(f"  [{idx+1:3d}/{n}] {date_str} -- {msg} ({len(group)} file(s))")

    print()
    print("[+] Done! Last 20 commits:")
    result = subprocess.run(["git", "log", "--oneline", "--graph"], capture_output=True, text=True)
    lines  = result.stdout.splitlines()[:20]
    print("\n".join(lines))
    print()
    result2 = subprocess.run(["git", "rev-list", "--count", "HEAD"], capture_output=True, text=True)
    print(f"[+] Total commits: {result2.stdout.strip()}")
    print("[!] Force-push if needed: git push --force")

if __name__ == "__main__":
    main()