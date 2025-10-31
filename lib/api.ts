// API service layer for Chatt app
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export interface StreamData {
  userId: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  audience: 'Public' | 'Followers' | 'Subscribers';
  latency: 'Normal' | 'Low' | 'Ultra Low';
  orientation: 'Portrait' | 'Landscape';
  resolution: '720p' | '1080p';
  chatSettings: {
    slowMode: boolean;
    followersOnly: boolean;
    emoteOnly: boolean;
  };
  recording: {
    saveVOD: boolean;
    ageRestricted: boolean;
  };
  devices: {
    camera: boolean;
    mic: boolean;
    frontCamera: boolean;
  };
}

export interface StreamResponse {
  success: boolean;
  streamId: string;
  message: string;
}

export interface WebRTCOffer {
  streamId: string;
  offer: RTCSessionDescriptionInit;
  userId: string;
}

export interface WebRTCAnswer {
  streamId: string;
  answer: RTCSessionDescriptionInit;
  userId: string;
}

export interface ICECandidate {
  streamId: string;
  candidate: RTCIceCandidateInit;
  userId: string;
}

class ChattAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Start a new stream
  async startStream(streamData: StreamData): Promise<StreamResponse> {
    try {
      const response = await fetch(`${this.baseURL}/streams/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamData),
      });
      return await response.json();
    } catch (error) {
      console.error('Start stream failed:', error);
      throw error;
    }
  }

  // End a stream
  async endStream(streamId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/streams/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamId }),
      });
      return await response.json();
    } catch (error) {
      console.error('End stream failed:', error);
      throw error;
    }
  }

  // WebRTC signaling - Offer
  async sendWebRTCOffer(offerData: WebRTCOffer): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });
      return await response.json();
    } catch (error) {
      console.error('WebRTC offer failed:', error);
      throw error;
    }
  }

  // WebRTC signaling - Answer
  async sendWebRTCAnswer(answerData: WebRTCAnswer): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });
      return await response.json();
    } catch (error) {
      console.error('WebRTC answer failed:', error);
      throw error;
    }
  }

  // WebRTC signaling - ICE Candidate
  async sendICECandidate(candidateData: ICECandidate): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/ice-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });
      return await response.json();
    } catch (error) {
      console.error('ICE candidate failed:', error);
      throw error;
    }
  }
}

export const chattAPI = new ChattAPI();
export default chattAPI;
