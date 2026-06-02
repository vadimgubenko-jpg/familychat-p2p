import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID, createHmac } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app    = express();
const server = createServer(app);
const wss    = new WebSocketServer({ server, path: "/ws" });
const PORT   = process.env.PORT || 8080;
const TURN_SECRET = process.env.TURN_SECRET || "dev-secret";
const rooms  = new Map();
const clients= new Map();

function turnCredentials() {
  const ttl  = Math.floor(Date.now() / 1000) + 86400;
  const user = `${ttl}:familychat`;
  const pass = createHmac("sha1", TURN_SECRET).update(user).digest("base64");
  return { username: user, credential: pass };
}

app.use(express.static(path.join(__dirname, "public")));
app.get("/health",  (_, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/ice-config", (_, res) => {
  const cred = turnCredentials();
  res.json({
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
      { urls: [`turn:${process.env.DOMAIN || "localhost"}:3478`], ...cred },
      { urls: [`turns:${process.env.DOMAIN || "localhost"}:5349`], ...cred },
    ]
  });
});

function send(ws, data){ if(ws.readyState===1) ws.send(JSON.stringify(data)); }

wss.on("connection", ws => {
  const id = randomUUID().slice(0,8);
  clients.set(id, { ws, room: null, name: "Гость" });
  send(ws, { type: "welcome", id });

  ws.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    const client = clients.get(id);
    if(!client) return;

    if(msg.type === "join") {
      client.room = msg.room;
      client.name = msg.name || "Гость";
      if(!rooms.has(client.room)) rooms.set(client.room, new Set());
      rooms.get(client.room).add(id);
      const peers = [...(rooms.get(client.room)||[])].filter(x=>x!==id)
        .map(x=>({ id: x, name: clients.get(x)?.name || "?" }));
      send(ws, { type:"peers", peers });
      peers.forEach(p=>{ send(clients.get(p.id).ws, { type:"peer-joined", id, name:client.name }); });
      return;
    }

    if(["offer","answer","ice"].includes(msg.type) && msg.to && clients.has(msg.to)) {
      send(clients.get(msg.to).ws, { ...msg, from: id, name: client.name });
    }
  });

  ws.on("close", () => {
    const client = clients.get(id);
    if(client?.room && rooms.has(client.room)) {
      rooms.get(client.room).delete(id);
      [...(rooms.get(client.room)||[])].forEach(pid=>{
        const peer = clients.get(pid);
        if(peer) send(peer.ws, { type:"peer-left", id });
      });
      if(rooms.get(client.room).size === 0) rooms.delete(client.room);
    }
    clients.delete(id);
  });
});

server.listen(PORT, ()=>console.log(`FamilyChat signaling :${PORT}`));
