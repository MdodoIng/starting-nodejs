import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class LeaderboardGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribeGame')
  handleSubscribeGame(
    @MessageBody() gameName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`game:${gameName}`);
  }

  @SubscribeMessage('subscribeGlobal')
  handleSubscribeGlobal(@ConnectedSocket() client: Socket) {
    client.join('global');
  }

  // Called by ScoreService after every successful submission.
  emitLeaderboardUpdate(gameName: string, payload: unknown) {
    this.server.to(`game:${gameName}`).emit('leaderboardUpdate', payload);
    this.server.to('global').emit('leaderboardUpdate', payload);
  }
}
