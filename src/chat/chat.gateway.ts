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
import { Logger } from '@nestjs/common';

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
  handleMessage(
    @MessageBody()
    data: { to: string; message: string; from: string; timestamp: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${data.from} to ${data.to}: ${data.message}`);

    // Get recipient's socket ID
    const recipientSocketId = this.connectedUsers.get(data.to);

    if (recipientSocketId) {
      // Send message to specific recipient
      this.server.to(recipientSocketId).emit('message', {
        from: data.from,
        message: data.message,
        timestamp: data.timestamp,
      });

      // Send success acknowledgment
      return { success: true };
    } else {
      this.logger.warn(`User ${data.to} is not connected`);
      // You could store offline messages in database here
      return { success: false, error: 'User is offline' };
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
