#!/usr/bin/env bash
set -euo pipefail

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
fi

if [[ -z "${SWA_CLI_DEPLOYMENT_TOKEN:-}" ]]; then
  cat >&2 <<'EOF'
Missing SWA_CLI_DEPLOYMENT_TOKEN.

Set the Azure Static Web Apps deployment token in .env.local or in your shell, then run:
  npm run deploy:azure

Example .env.local:
  SWA_CLI_DEPLOYMENT_TOKEN=your-token-here

Example temporary shell variable:
  read -rsp "Azure SWA deployment token: " SWA_CLI_DEPLOYMENT_TOKEN
  export SWA_CLI_DEPLOYMENT_TOKEN
  npm run deploy:azure
EOF
  exit 1
fi

npm run build

if [[ -x "./node_modules/.bin/swa" ]]; then
  swa_cmd=("./node_modules/.bin/swa")
elif command -v swa >/dev/null 2>&1; then
  swa_cmd=("swa")
else
  swa_cmd=("npx" "--yes" "@azure/static-web-apps-cli@latest")
fi

"${swa_cmd[@]}" deploy ./dist --env production
