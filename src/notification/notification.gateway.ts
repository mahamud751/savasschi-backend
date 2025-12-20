import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3004',
      'https://korbojoy.shop',
      'https://admin.korbojoy.shop',
      'http://localhost:3001',
    ],
    credentials: true,
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  @SubscribeMessage('createNotification')
  async handleCreateNotification(
    @MessageBody() createNotificationDto: CreateNotificationDto,
  ) {
    const notification = await this.notificationService.createNotification(
      createNotificationDto,
    );

    this.server.emit('notification', notification);
    return notification;
  }

  emitNotification(notification: any) {
    this.server.emit('notification', notification);
  }
}
