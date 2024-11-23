import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import Config from 'src/config/config';

@WebSocketGateway()
export class UrlGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(UrlGateway.name);

  @WebSocketServer() io: Server;
  private pendingAcks = new Map<string, NodeJS.Timeout>();

  afterInit(server: any) {
    this.logger.log('Initialized Socket IO ready to use');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('url_shortener')
  handleMessage(client: Socket, payload: string): void {
    this.io.emit('url_shortener', payload);
  }

  @SubscribeMessage('acknowledgment')
  handleAcknowledgment(client: Socket, payload: { originalUrl: string }): void {
    const ackKey = `ack-${payload.originalUrl}`;
    this.logger.log(`Processing key for: ${ackKey}`);

    if (this.pendingAcks.has(ackKey)) {
      clearInterval(this.pendingAcks.get(ackKey)!);
      this.pendingAcks.delete(ackKey);

      this.logger.log(`Acknowledgment received for: ${payload.originalUrl}`);
    } else {
      this.logger.warn(
        `Acknowledgment received for unknown URL: ${payload.originalUrl}`,
      );
    }
  }

  broadcastUrl(shortenedUrl: string, originalUrl: string): void {
    const ackKey = `ack-${originalUrl}`;
    this.logger.log(`Creating key for: ${ackKey}`);
    this.io.emit('url_shortener', JSON.stringify({ shortenedUrl }));

    const retry = () => {
      this.logger.warn(`Retrying delivery of: ${shortenedUrl}`);
      this.io.emit('url_shortener', JSON.stringify({ shortenedUrl }));
    };

    const timeout = setInterval(retry, Config().app.interval);
    this.pendingAcks.set(ackKey, timeout);
  }
}
