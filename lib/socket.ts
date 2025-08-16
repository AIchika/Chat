// Socket.io service for real-time communication
import { io, Socket } from 'socket.io-client';

export interface SocketEvents {
  // Stream management
  'join-stream': (data: { streamId: string; userId: string; userType: 'broadcaster' | 'viewer' | 'cohost' }) => void;
  'leave-stream': (data: { streamId: string; userId: string }) => void;
  'user-joined': (data: { userId: string; userType: string; socketId: string }) => void;
  'user-left': (data: { userId: string; socketId: string }) => void;

  // WebRTC signaling
  'webrtc-offer': (data: { offer: RTCSessionDescriptionInit; fromUserId: string; toUserId: string }) => void;
  'webrtc-answer': (data: { answer: RTCSessionDescriptionInit; fromUserId: string; toUserId: string }) => void;
  'webrtc-ice-candidate': (data: { candidate: RTCIceCandidateInit; fromUserId: string; toUserId: string }) => void;

  // Chat
  'chat-message': (data: { streamId: string; userId: string; message: string; timestamp: Date }) => void;
  'new-chat-message': (data: { userId: string; message: string; timestamp: Date }) => void;

  // Stream controls
  'stream-control': (data: { streamId: string; controlType: string; value: any; userId: string }) => void;
  'stream-control-update': (data: { controlType: string; value: any; userId: string }) => void;

  // Viewer interactions
  'viewer-interaction': (data: { streamId: string; type: string; data: any; userId: string }) => void;

  // Camera controls
  'camera-switch': (data: { streamId: string; cameraType: string; userId: string }) => void;
  'camera-switched': (data: { cameraType: string; userId: string }) => void;

  // Soundscape controls
  'soundscape-control': (data: { streamId: string; mode: string; intensity: number; userId: string }) => void;
  'soundscape-update': (data: { mode: string; intensity: number; userId: string }) => void;

  // Co-host management
  'cohost-invite': (data: { streamId: string; fromUserId: string; toUserId: string }) => void;
  'cohost-invitation': (data: { fromUserId: string; toUserId: string }) => void;
  'cohost-accept': (data: { streamId: string; userId: string }) => void;
  'cohost-joined': (data: { userId: string }) => void;
}

class ChattSocket {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.connect();
  }

  connect() {
    try {
      this.socket = io('http://localhost:5001', {
        transports: ['websocket'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to Chatt Socket.io server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from Chatt Socket.io server');
        this.isConnected = false;
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.handleReconnect();
      });

    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Join a stream room
  joinStream(streamId: string, userId: string, userType: 'broadcaster' | 'viewer' | 'cohost') {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-stream', { streamId, userId, userType });
      console.log(`👥 Joining stream ${streamId} as ${userType}`);
    }
  }

  // Leave a stream room
  leaveStream(streamId: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-stream', { streamId, userId });
      console.log(`👋 Leaving stream ${streamId}`);
    }
  }

  // Send chat message
  sendChatMessage(streamId: string, userId: string, message: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat-message', { streamId, userId, message, timestamp: new Date() });
      console.log(`💬 Sending chat message in stream ${streamId}`);
    }
  }

  // WebRTC signaling
  sendWebRTCOffer(streamId: string, offer: RTCSessionDescriptionInit, fromUserId: string, toUserId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc-offer', { streamId, offer, fromUserId, toUserId });
      console.log(`📡 Sending WebRTC offer from ${fromUserId} to ${toUserId}`);
    }
  }

  sendWebRTCAnswer(streamId: string, answer: RTCSessionDescriptionInit, fromUserId: string, toUserId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc-answer', { streamId, answer, fromUserId, toUserId });
      console.log(`📡 Sending WebRTC answer from ${fromUserId} to ${toUserId}`);
    }
  }

  sendICECandidate(streamId: string, candidate: RTCIceCandidateInit, fromUserId: string, toUserId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc-ice-candidate', { streamId, candidate, fromUserId, toUserId });
      console.log(`🧊 Sending ICE candidate from ${fromUserId} to ${toUserId}`);
    }
  }

  // Stream controls
  sendStreamControl(streamId: string, controlType: string, value: any, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stream-control', { streamId, controlType, value, userId });
      console.log(`🎮 Sending stream control: ${controlType} = ${value}`);
    }
  }

  // Camera switching
  switchCamera(streamId: string, cameraType: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('camera-switch', { streamId, cameraType, userId });
      console.log(`📹 Switching camera to ${cameraType}`);
    }
  }

  // Soundscape control
  controlSoundscape(streamId: string, mode: string, intensity: number, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('soundscape-control', { streamId, mode, intensity, userId });
      console.log(`🎵 Setting soundscape to ${mode} mode at intensity ${intensity}`);
    }
  }

  // Co-host management
  inviteCoHost(streamId: string, fromUserId: string, toUserId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('cohost-invite', { streamId, fromUserId, toUserId });
      console.log(`🤝 Inviting ${toUserId} to co-host stream ${streamId}`);
    }
  }

  acceptCoHostInvitation(streamId: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('cohost-accept', { streamId, userId });
      console.log(`✅ Accepting co-host invitation for stream ${streamId}`);
    }
  }

  // Event listeners
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

export const chattSocket = new ChattSocket();
export default chattSocket;
