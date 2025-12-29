import { Injectable } from '@nestjs/common';
import {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} from 'agora-access-token';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  AccessToken,
  priviledges,
} = require('agora-access-token/src/AccessToken');

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
   * Note: RTM 2.x uses RTC tokens, not legacy RTM tokens
   * @param userId - User ID
   * @param expirationTimeInSeconds - Token expiration time (default: 24 hours)
   */
  generateRTMToken(
    userId: string,
    expirationTimeInSeconds: number = 86400,
  ): { token: string; appId: string } {
    try {
      if (
        !this.appId ||
        !this.appCertificate ||
        this.appId === 'YOUR_AGORA_APP_ID' ||
        this.appCertificate === 'YOUR_AGORA_APP_CERTIFICATE'
      ) {
        throw new Error(
          'Agora credentials are not set. Please configure AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables.',
        );
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Generate RTM 2.x compatible token
      // RTM 2.x uses RTC token structure (AccessToken)
      // We use userId as channelName to ensure it's not empty
      // We add both kJoinChannel and kRtmLogin to ensure compatibility
      const key = new AccessToken(
        this.appId,
        this.appCertificate,
        userId, // channelName
        userId, // uid
      );

      key.addPriviledge(priviledges.kJoinChannel, privilegeExpiredTs);
      key.addPriviledge(priviledges.kRtmLogin, privilegeExpiredTs);

      const token = key.build();

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
