import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Configure this to your frontend URL in production
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      // Notify others about this user coming online
      this.server.emit('user_status', {
        userId,
        status: 'online',
      });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Client disconnected: ${client.id}, userId: ${userId}`);

    if (userId) {
      this.connectedUsers.delete(userId);
      // Notify others about this user going offline
      this.server.emit('user_status', {
        userId,
        status: 'offline',
      });
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: { to: string; message: string; from: string; timestamp: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${data.from} to ${data.to}: ${data.message}`);

    try {
      // Store message in database (always, for history)
      await this.prisma.message.create({
        data: {
          senderId: data.from.toString(),
          receiverId: data.to.toString(),
          content: data.message,
          createdAt: new Date(data.timestamp),
        },
      });

      // Get recipient's socket ID
      const recipientSocketId = this.connectedUsers.get(data.to);

      if (recipientSocketId) {
        // User is online - deliver immediately
        this.server.to(recipientSocketId).emit('message', {
          from: data.from,
          message: data.message,
          timestamp: data.timestamp,
        });
        this.logger.log(`Message delivered to online user ${data.to}`);
      } else {
        // User is offline - message already saved to database
        this.logger.log(
          `User ${data.to} is offline. Message saved to database.`,
        );
      }

      // Always return success since message is saved
      return { success: true, stored: true };
    } catch (error) {
      this.logger.error('Error handling message:', error);
      return { success: false, error: 'Failed to save message' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { to: string; from: string },
    @ConnectedSocket() client: Socket,
  ) {
    const recipientSocketId = this.connectedUsers.get(data.to);

    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('typing', {
        userId: data.from,
      });
    }
  }
}
