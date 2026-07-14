const { io } = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('connected:', socket.id);
  socket.emit('subscribeGame', 'space-invaders');
});

socket.on('leaderboardUpdate', (data) => {
  console.log('LIVE UPDATE:', data);
});
