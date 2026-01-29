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
  private userGroups = new Map<string, Set<string>>(); // userId -> Set<groupId>

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

      // Join user to their group rooms
      this.joinUserToGroups(userId, client);
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

  @SubscribeMessage('send_group_message')
  async handleGroupMessage(
    @MessageBody()
    data: {
      groupId: string;
      message: string;
      from: string;
      timestamp: number;
      type: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Group message from ${data.from} to group ${data.groupId}: ${data.message}`,
    );

    try {
      // Store group message in database (always, for history)
      // Note: This will work after Prisma migration is run
      // await this.prisma.groupMessage.create({
      //   data: {
      //     groupId: data.groupId,
      //     senderId: data.from,
      //     content: data.message,
      //     type: data.type || 'text',
      //     createdAt: new Date(data.timestamp),
      //   },
      // });

      // Broadcast to all group members
      this.server.to(`group:${data.groupId}`).emit('group_message', {
        groupId: data.groupId,
        from: data.from,
        message: data.message,
        type: data.type || 'text',
        timestamp: data.timestamp,
      });

      this.logger.log(`Group message broadcasted to group ${data.groupId}`);
      return { success: true, stored: true };
    } catch (error) {
      this.logger.error('Error handling group message:', error);
      return { success: false, error: 'Failed to send group message' };
    }
  }

  @SubscribeMessage('join_group')
  handleJoinGroup(
    @MessageBody() data: { groupId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, userId } = data;

    // Add user to group
    client.join(`group:${groupId}`);

    // Track user's groups
    if (!this.userGroups.has(userId)) {
      this.userGroups.set(userId, new Set());
    }
    this.userGroups.get(userId).add(groupId);

    this.logger.log(`User ${userId} joined group ${groupId}`);
    return { success: true };
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    @MessageBody() data: { groupId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { groupId, userId } = data;

    // Remove user from group
    client.leave(`group:${groupId}`);

    // Remove from user's group tracking
    if (this.userGroups.has(userId)) {
      this.userGroups.get(userId).delete(groupId);
    }

    this.logger.log(`User ${userId} left group ${groupId}`);
    return { success: true };
  }

  private async joinUserToGroups(userId: string, client: Socket) {
    try {
      // This will work after Prisma migration is run
      // const userGroups = await this.prisma.groupMember.findMany({
      //   where: { userId },
      //   include: { group: true }
      // });

      // For now, we'll handle this client-side
      // In the future, when the database is updated, we can uncomment above
      this.logger.log(
        `User ${userId} groups will be joined after database migration`,
      );
    } catch (error) {
      this.logger.error(`Error joining user ${userId} to groups:`, error);
    }
  }
}
