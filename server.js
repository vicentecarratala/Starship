// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Jugadores conectados
const players = {};

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substr(2, 9);

  // Estado inicial del jugador
  players[id] = {
    x: 100,
    y: 100,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    name: `Jugador-${id}`
  };

  // Enviamos el estado inicial
  ws.send(JSON.stringify({ type: 'init', id, players }));

  // Escuchamos actualizaciones del cliente
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'update') {
      players[id] = data.state;
      broadcast();
    }
  });

  ws.on('close', () => {
    delete players[id];
    broadcast();
  });

  function broadcast() {
    const snapshot = JSON.stringify({ type: 'players', players });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(snapshot);
      }
    });
  }
});

// Servir contenido estático
app.use(express.static('public'));

// Escuchar en red LAN
server.listen(3000, '0.0.0.0', () => {
  console.log('✅ Servidor listo en LAN: puerto 3000');
});