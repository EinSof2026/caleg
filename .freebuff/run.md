# Run Doc — suarautara (Next.js 15)

## Reproduce uncommitted artifacts

A fresh checkout needs these files in place before the server starts:

1. **Env files** — copy `.env` and `.env.local` from the main checkout into the project root:
   ```bash
   cp <main-checkout>/.env ./.env
   cp <main-checkout>/.env.local ./.env.local
   ```
   The dev server loads both (`Environments: .env.local, .env`). Ports/values may need
   adapting per worktree. Never commit these files; they are gitignored.

2. **Dependencies** — install with npm (the project's package manager, `package-lock.json` present):
   ```bash
   npm install
   ```

No build artifacts are required for `npm run dev`.

## Run the server

The dev script hardcodes port **4028** (`next dev -p 4028`). Check it is free first:
```bash
netstat -ano | grep -E ":4028\s"
```

Start it detached (Windows) — stdout and stderr must go to **different** files, and the
executable must be named exactly (`npm.cmd`, not `npm`):
```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

Confirm it survived and wait until the URL answers:
```powershell
powershell -NoProfile -Command "Get-Process -Id <pid>"
curl -s -o /dev/null -w "%{http_code}" http://localhost:4028/   # expect 200
```

The app is then viewable at **http://localhost:4028** (first load compiles the app router
routes, so allow a few seconds for a 200).
