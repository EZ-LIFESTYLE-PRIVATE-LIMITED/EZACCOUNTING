# EZAccounting - Desktop Application

A modern desktop accounting application built with Electron.js, featuring a clean UI and backend API integration.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (v16+) - for local development
- Git

### Running the Application

1. **Start the backend services:**
```bash
docker-compose up --build
```

2. **Start the desktop application:**
```bash
cd frontend
npm install
npm run start:dev
```

## 📁 Project Structure

```
EZAccounting/
├── backend/                 # Backend API (Express.js)
│   ├── src/index.ts        # Main backend server
│   └── Dockerfile          # Backend container config
├── frontend/               # Desktop Application (Electron.js)
│   ├── src/
│   │   ├── main.ts         # Main Electron process
│   │   ├── preload.ts      # Secure IPC bridge
│   │   └── renderer/       # UI components
│   │       └── index.html  # Main application UI
│   ├── Dockerfile          # Frontend container config
│   └── package.json        # Desktop app dependencies
├── docker-compose.yml      # Multi-service orchestration
└── README.md              # This file
```

## 🖥️ Desktop Application Features

- **Modern Interface**: Clean, responsive UI with gradient backgrounds and smooth animations
- **Real-time Backend Monitoring**: Live connection status to the backend API
- **Native Menus**: Full application menu with keyboard shortcuts
- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Secure Architecture**: Context isolation and sandboxed renderer process
- **File Operations**: Built-in dialogs for data import/export

## 🔧 Development

### Backend Development
The backend runs as a Docker container and provides REST API endpoints for the desktop application.

**Key endpoints:**
- `GET /health` - Health check
- `GET /` - API status

### Frontend Development
The frontend is built with Electron.js and provides a native desktop experience.

**Key files:**
- `src/main.ts` - Main Electron process (window management, menus, IPC)
- `src/preload.ts` - Secure bridge between main and renderer processes
- `src/renderer/index.html` - Main UI with embedded CSS and JavaScript

### Running in Development Mode

1. **Backend only:**
```bash
docker-compose up backend postgres
```

2. **Desktop app only (requires backend running):**
```bash
cd frontend
npm run dev
```

## 🐳 Docker Setup

The application uses Docker Compose to orchestrate multiple services:

- **Backend**: Express.js API server
- **PostgreSQL**: Database for data persistence
- **Frontend**: Electron desktop application (development mode)

### Docker Commands

```bash
# Start all services
docker-compose up --build

# Start only backend services
docker-compose up backend postgres

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📦 Building for Production

### Desktop Application

To create distributable packages for the desktop app:

```bash
cd frontend
npm run dist
```

This will create platform-specific installers in the `dist-electron/` directory.

### Backend Deployment

The backend can be deployed using the provided Dockerfile:

```bash
docker build -t ezaccounting-backend ./backend
```

## 🔗 Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐    SQL     ┌─────────────────┐
│   Desktop App   │ ──────────► │   Backend API   │ ─────────► │   PostgreSQL    │
│   (Electron)    │             │   (Express.js)  │            │   (Database)    │
└─────────────────┘             └─────────────────┘            └─────────────────┘
```

- **Desktop App**: Provides the user interface and communicates with the backend via HTTP
- **Backend API**: Handles business logic, data processing, and database operations
- **Database**: Stores application data persistently

## 🛠️ Technology Stack

### Frontend (Desktop)
- **Electron.js**: Cross-platform desktop application framework
- **TypeScript**: Type-safe JavaScript development
- **HTML/CSS/JavaScript**: Modern web technologies for UI
- **IPC (Inter-Process Communication)**: Secure communication between processes

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe development
- **PostgreSQL**: Relational database

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## 🚨 Troubleshooting

### Desktop App Won't Start
1. Ensure Node.js is installed (v16+)
2. Run `npm install` in the frontend directory
3. Check that the backend is running on port 3000

### Backend Connection Issues
1. Verify Docker containers are running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Test API endpoint: `curl http://localhost:3000/health`

### GUI Issues (Linux)
1. Install X11 libraries: `sudo apt-get install xvfb`
2. Enable X11 forwarding if running in containers

## 📝 License

ISC License - See individual package.json files for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions, please check the troubleshooting section above or create an issue in the repository.


