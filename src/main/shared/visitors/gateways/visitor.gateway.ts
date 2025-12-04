import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VisitorService } from '../services/visitor.service';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/ws',
})
export class VisitorGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private visitorService: VisitorService) {}

  async handleConnection(client: Socket) {
    void client;
    this.server.emit('visitors:count', {
      active: this.visitorService.getActiveCount(),
    });
  }

  async handleDisconnect(client: Socket) {
    await this.visitorService.endSession(client.id);

    this.server.emit('visitors:count', {
      active: this.visitorService.getActiveCount(),
    });

    const stats = await this.visitorService.getStats();
    this.server.emit('visitors:stats', stats);
  }

  @SubscribeMessage('visit:start')
  async onVisitStart(
    @MessageBody() data: { page?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const ip =
      ((client.handshake.headers['x-forwarded-for'] as string) ||
        client.handshake.address) ??
      '0.0.0.0';

    const userAgent =
      (client.handshake.headers['user-agent'] as string) || null;

    const page = data?.page || '/';

    await this.visitorService.createSession(
      client.id,
      ip,
      userAgent ?? '',
      page,
    );

    const stats = await this.visitorService.getStats();

    this.server.emit('visitors:stats', stats);
    this.server.emit('visitors:count', {
      active: this.visitorService.getActiveCount(),
    });

    return { ok: true, sessionId: client.id };
  }

  @SubscribeMessage('visit:end')
  async onVisitEnd(@ConnectedSocket() client: Socket) {
    await this.visitorService.endSession(client.id);

    const stats = await this.visitorService.getStats();
    this.server.emit('visitors:stats', stats);

    this.server.emit('visitors:count', {
      active: this.visitorService.getActiveCount(),
    });

    return { ok: true };
  }
}
