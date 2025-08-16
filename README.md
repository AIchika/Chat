# �� Chat - Live Streaming App

A modern, feature-rich live streaming application built with React Native, Expo, and Node.js. Chat enables users to create, manage, and participate in live streams with advanced interactive features.

## ✨ Features

### �� Live Streaming
- **Real-time video streaming** with WebRTC support
- **Multi-camera views** (main, close-up, keyboard, director's cut)
- **Stream quality options** (720p, 1080p)
- **Orientation support** (Portrait, Landscape)
- **Latency options** (Normal, Low, Ultra Low)

### 💬 Interactive Chat
- **Real-time messaging** during streams
- **Chat moderation** (slow mode, followers only, emote only)
- **Viewer interactions** (gaming, power-ups, voting)
- **Co-host management** with invitations

### 🎮 Advanced Features
- **Dynamic soundscapes** (horror mode, chill mode, etc.)
- **Multi-view camera switching**
- **AI-powered live subtitling** (placeholder)
- **Viewer engagement tools**

### �� Technical Features
- **Socket.io integration** for real-time communication
- **WebRTC signaling** for peer-to-peer connections
- **MongoDB database** for data persistence
- **JWT authentication** system
- **RESTful API** architecture

## 🏗️ Architecture

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Router** for navigation
- **Zustand** for state management

### Backend
- **Node.js** with Express
- **Socket.io** for real-time features
- **MongoDB** with Mongoose
- **JWT** for authentication
- **WebRTC** signaling server

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm
- MongoDB (local or cloud)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Chat
```

2. **Install frontend dependencies**
```bash
bun install
# or
npm install
```

3. **Install backend dependencies**
```bash
cd backend
bun install
# or
npm install
cd ..
```

4. **Set up environment variables**
```bash
# Create backend/.env file
cp backend/.env.example backend/.env
# Edit with your configuration
```

5. **Start the backend server**
```bash
cd backend
bun start
# or
npm start
```

6. **Start the frontend**
```bash
# In a new terminal
bun start
# or
npx expo start
```

## 📱 Mobile Testing

### Expo Go App
1. Install **Expo Go** from App Store/Google Play
2. Scan the QR code displayed in your terminal
3. Test the app on your device

### Development Build
```bash
npx expo start --tunnel
# Use tunnel mode for testing from anywhere
```

## 🔧 Configuration

### Environment Variables

Create `backend/.env` file:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8081
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=redis://localhost:6379
```

### Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Create database**: `chat-app`
3. **Collections will be created automatically**

## 📁 Project Structure

```
Chat/
├── app/                    # Expo Router screens
│   ├── (tabs)/           # Tab navigation
│   ├── (auth)/           # Authentication screens
│   ├── go-live.tsx       # Stream creation
│   └── stream/           # Stream viewing
├── components/            # Reusable components
├── providers/             # Context providers
├── lib/                  # Utility libraries
│   ├── api.ts           # Backend API client
│   └── socket.ts        # Socket.io client
├── backend/              # Node.js server
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Express middleware
│   └── server.js        # Main server file
├── assets/              # Images, fonts, etc.
└── package.json         # Frontend dependencies
```

## 🎯 API Endpoints

### Streams
- `POST /api/streams/start` - Start a new stream
- `POST /api/streams/end` - End a stream
- `GET /api/streams` - Get all streams

### WebRTC Signaling
- `POST /api/webrtc/offer` - Send WebRTC offer
- `POST /api/webrtc/answer` - Send WebRTC answer
- `POST /api/webrtc/ice-candidate` - Send ICE candidate

### Health
- `GET /api/health` - Server health check

## 🔌 Socket.io Events

### Stream Management
- `join-stream` - Join a stream room
- `leave-stream` - Leave a stream room
- `user-joined` - User joined notification
- `user-left` - User left notification

### WebRTC Signaling
- `webrtc-offer` - WebRTC offer exchange
- `webrtc-answer` - WebRTC answer exchange
- `webrtc-ice-candidate` - ICE candidate exchange

### Chat & Interactions
- `chat-message` - Send chat message
- `new-chat-message` - Receive chat message
- `viewer-interaction` - Handle viewer interactions
- `stream-control` - Stream control updates

## 🚧 Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic streaming infrastructure
- [x] Real-time chat system
- [x] WebRTC signaling
- [x] Stream management

### Phase 2: Advanced Features 🚧
- [ ] WebRTC video streaming implementation
- [ ] Multi-camera support
- [ ] AI subtitling integration
- [ ] Advanced viewer interactions

### Phase 3: Production Ready 🚧
- [ ] User authentication system
- [ ] Payment integration
- [ ] Content moderation
- [ ] Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �� Acknowledgments

- **Expo** for the amazing React Native platform
- **Socket.io** for real-time communication
- **WebRTC** for peer-to-peer video streaming
- **MongoDB** for the database solution

## 📞 Support

If you have any questions or need help:
- Create an issue in this repository
- Check the documentation
- Join our community discussions

---

**Built with ❤️ for the streaming community**
