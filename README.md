# 🏠 FamilyChat P2P

[![Deploy](https://img.shields.io/badge/deploy-docker-blue)](#)

> Семейный мессенджер на WebRTC. Без VPN, без облака, сообщения идут напрямую между устройствами через WebRTC DataChannel.

## Сервисы

| Сервис | Описание |
|---|---|
| `familychat` | Node.js signaling server + Web frontend |
| `coturn` | TURN/STUN сервер для NAT traversal |
| `nginx` | Reverse proxy + TLS |
| `certbot` | Автообновление Let's Encrypt |

## Быстрый деплой

```bash
git clone https://github.com/vadimgubenko-jpg/familychat-p2p
cd familychat-p2p
bash scripts/deploy.sh your-domain.com admin@email.com
```

## Порты

| Порт | Протокол | Назначение |
|---|---|---|
| 80 | TCP | HTTP → HTTPS redirect |
| 443 | TCP | HTTPS (nginx) |
| 3478 | UDP/TCP | TURN/STUN |
| 5349 | UDP/TCP | TURNS+TLS |
| 10000-20000 | UDP | WebRTC relay |

## Как работает

```
Устройство A ──► (SDP offer) ──► Signaling server ──► (SDP answer) ──► Устройство B
                          ↕ (только 1 раз!)
Устройство A ↔──────── WebRTC P2P ────────↔ Устройство B
```

## Локальный запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
# Открыть http://localhost:8080
```
