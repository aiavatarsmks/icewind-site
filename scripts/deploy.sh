#!/usr/bin/env bash
# One command from a committed change to a verified production deploy.
#
#   scripts/deploy.sh              validate, push, deploy, health-check, notify IndexNow
#   scripts/deploy.sh --all        same, but submit every canonical URL to IndexNow
#   scripts/deploy.sh --no-push    deploy without pushing to origin
#
# Railway serves this site from the CLI, not from a GitHub connection: a push alone
# changes nothing in production. That is why deploying and pushing live in one script.
set -euo pipefail

cd "$(dirname "$0")/.."

ORIGIN="https://icewind.uk"
STATE_FILE=".git/icewind-last-deploy"   # inside .git, so it is never committed
SUBMIT_ALL=""
PUSH=1

for argument in "$@"; do
  case "$argument" in
    --all) SUBMIT_ALL="--all" ;;
    --no-push) PUSH=0 ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }

step "Checking the working tree"
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes present. Commit them first — a deploy ships the working tree," >&2
  echo "so anything uncommitted would reach production without a matching commit." >&2
  git status --short >&2
  exit 1
fi
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HEAD_SHA=$(git rev-parse HEAD)
echo "$BRANCH at ${HEAD_SHA:0:7} — $(git log -1 --pretty=%s)"

step "Validating"
node scripts/validate-structured-data.mjs
node scripts/validate-domain-migration.mjs

if [ "$PUSH" -eq 1 ]; then
  step "Pushing to origin"
  git push origin "$BRANCH"
fi

step "Deploying to Railway"
railway up --detach

step "Waiting for the deployment"
DEADLINE=$((SECONDS + 900))
STATUS=""
while [ "$SECONDS" -lt "$DEADLINE" ]; do
  STATUS=$(railway status --json 2>/dev/null | node -e '
    let raw = "";
    process.stdin.on("data", (chunk) => { raw += chunk; }).on("end", () => {
      try {
        const status = JSON.parse(raw).environments.edges
          .flatMap((environment) => environment.node.serviceInstances.edges)
          .flatMap((instance) => instance.node.activeDeployments ?? [])
          .map((deployment) => deployment.status)[0];
        console.log(status ?? "UNKNOWN");
      } catch { console.log("UNKNOWN"); }
    });
  ' || echo "UNKNOWN")
  case "$STATUS" in
    SUCCESS) echo "SUCCESS"; break ;;
    FAILED|CRASHED) echo "Deployment $STATUS — production not updated." >&2; exit 1 ;;
    *) printf '  %s\n' "$STATUS"; sleep 6 ;;
  esac
done
if [ "$STATUS" != "SUCCESS" ]; then
  echo "Timed out waiting for Railway. Check the dashboard before assuming anything shipped." >&2
  exit 1
fi

step "Health checks"
for path in "/" "/sitemap.xml" "/robots.txt"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "${ORIGIN}${path}")
  printf '  %-14s %s\n' "$path" "$code"
  [ "$code" = "200" ] || { echo "Expected 200 for ${ORIGIN}${path}" >&2; exit 1; }
done

step "Notifying IndexNow"
if [ -n "$SUBMIT_ALL" ]; then
  node scripts/submit-indexnow.mjs --all
elif [ -f "$STATE_FILE" ] && git cat-file -e "$(cat "$STATE_FILE")^{commit}" 2>/dev/null; then
  node scripts/submit-indexnow.mjs --since "$(cat "$STATE_FILE")"
else
  # No record of what was last deployed — fall back to the pages in the newest commit.
  node scripts/submit-indexnow.mjs
fi

printf '%s\n' "$HEAD_SHA" > "$STATE_FILE"

step "Done"
echo "${BRANCH} ${HEAD_SHA:0:7} is live on ${ORIGIN}"
