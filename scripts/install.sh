#!/usr/bin/env bash
set -e

INSTALL_DIR="$HOME/.quid/bin"
REPO="your-username/quid-cli"

echo "[Quid Setup] Installing Quid CLI..."

mkdir -p "$INSTALL_DIR"

# Download distribution executable from GitHub Releases
curl -fsSL "https://raw.githubusercontent.com/$REPO/main/dist/index.js" -o "$INSTALL_DIR/quid.js"

# Create a executable shell wrapper
cat << 'EOF' > "$INSTALL_DIR/quid"
#!/usr/bin/env bash
node "$HOME/.quid/bin/quid.js" "$@"
EOF

chmod +x "$INSTALL_DIR/quid"

echo "[Quid Setup] Successfully installed!"
echo "Add the following to your .bashrc / .zshrc:"
echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
