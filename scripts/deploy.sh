#!/bin/bash
# FamilyChat Production Deploy
# Usage: bash scripts/deploy.sh your-domain.com admin@email.com
set -e
DOMAIN=${1:-familychat.example.com}
EMAIL=${2:-admin@example.com}
SECRET=$(openssl rand -hex 32)

echo "=== FamilyChat Deploy ==="
echo "Domain : $DOMAIN"
echo "Email  : $EMAIL"

# Patch nginx domain
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/familychat.conf

# Patch coturn secret
sed -i "s/CHANGE_THIS_SECRET_64CHARS_MIN/$SECRET/" coturn/turnserver.conf

# Write .env
cat > .env <<EOF
DOMAIN=$DOMAIN
EMAIL=$EMAIL
TURN_SECRET=$SECRET
PORT=8080
NODE_ENV=production
EOF

# Build & launch
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo ""
echo "=== Done ==="
echo "URL    : https://$DOMAIN"
echo "Health : https://$DOMAIN/health"
