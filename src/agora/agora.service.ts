import { Injectable } from '@nestjs/common';
import {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} from 'agora-access-token';

@Injectable()
export class AgoraService {
  // Get these from environment variables or config
  private readonly appId = process.env.AGORA_APP_ID || 'YOUR_AGORA_APP_ID';
  private readonly appCertificate =
    process.env.AGORA_APP_CERTIFICATE || 'YOUR_AGORA_APP_CERTIFICATE';

  /**
   * Generate RTC Token for Video/Audio calls
   * @param channelName - Channel name
   * @param uid - User ID (0 for auto-generated)
   * @param role - User role (1 = Publisher, 2 = Subscriber)
   * @param expirationTimeInSeconds - Token expiration time (default: 24 hours)
   */
  generateRTCToken(
    channelName: string,
    uid: number = 0,
    role: number = RtcRole.PUBLISHER,
    expirationTimeInSeconds: number = 86400,
  ): { token: string; appId: string } {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Build RTC token
      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        role,
        privilegeExpiredTs,
      );

      return {
        token,
        appId: this.appId,
      };
    } catch (error) {
      console.error('Error generating RTC token:', error);
      throw error;
    }
  }

  /**
   * Generate RTM Token for Real-Time Messaging
   * @param userId - User ID
   * @param expirationTimeInSeconds - Token expiration time (default: 24 hours)
   */
  generateRTMToken(
    userId: string,
    expirationTimeInSeconds: number = 86400,
  ): { token: string; appId: string } {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Build RTM token
      const token = RtmTokenBuilder.buildToken(
        this.appId,
        this.appCertificate,
        userId,
        RtmRole.Rtm_User,
        privilegeExpiredTs,
      );

      return {
        token,
        appId: this.appId,
      };
    } catch (error) {
      console.error('Error generating RTM token:', error);
      throw error;
    }
  }

  /**
   * Generate both RTC and RTM tokens
   */
  generateTokens(
    channelName: string,
    userId: string,
    uid: number = 0,
    expirationTimeInSeconds: number = 86400,
  ): {
    rtcToken: { token: string; appId: string };
    rtmToken: { token: string; appId: string };
  } {
    return {
      rtcToken: this.generateRTCToken(
        channelName,
        uid,
        RtcRole.PUBLISHER,
        expirationTimeInSeconds,
      ),
      rtmToken: this.generateRTMToken(userId, expirationTimeInSeconds),
    };
  }
}
