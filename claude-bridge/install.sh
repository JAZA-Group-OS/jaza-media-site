#!/bin/sh
# Starts the JAZA Media site Claude bridge now and at every login (macOS).
# Undo: sh claude-bridge/install.sh --remove
set -e
LABEL=com.jazamedia.site-claude-bridge
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
if [ "$1" = "--remove" ]; then rm -f "$PLIST"; echo "Site Claude bridge removed."; exit 0; fi
DIR="$(cd "$(dirname "$0")" && pwd)"
NODE="$(command -v node)"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$DIR/bridge.mjs</string></array>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>$HOME/.local/bin:$(dirname "$NODE"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string><key>HOME</key><string>$HOME</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/jaza-site-claude-bridge.log</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/jaza-site-claude-bridge.log</string>
</dict></plist>
PL
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Site Claude bridge running on http://127.0.0.1:47822 (starts at login)."
