# EZAccounting Desktop Application

This is the desktop version of EZAccounting built with Electron.js.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see main project README)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the desktop app in development mode:
```bash
npm run start:dev
```

## Building for Production

To create distributable packages:

```bash
# Build for current platform
npm run dist

# Build for all platforms (requires additional setup)
npm run pack
```

## Project Structure

```
  frontend/src/
  ├── main.ts                 # Electron main process (lifecycle only)
  ├── preload.ts             # IPC bridge
  ├── config/                # Configuration management
  │   ├── index.ts          # Main config
  │   ├── database.ts       # Database config
  │   └── app.ts            # App config
  ├── database/              # Database layer
  │   ├── index.ts          # Database exports
  │   ├── connection.ts     # Database connection
  │   ├── models/           # Data models
  │   │   ├── index.ts
  │   │   ├── TestRecord.ts
  │   │   ├── Account.ts
  │   │   └── Transaction.ts
  │   ├── migrations/       # Database migrations
  │   │   ├── index.ts
  │   │   ├── 000_migrations_table.sql
  │   │   ├── 001_initial.sql
  │   │   └── migration-runner.ts
  │   └── services/         # Database services
  │       ├── index.ts
  │       ├── TestService.ts
  │       ├── AccountService.ts
  │       └── TransactionService.ts
  ├── services/              # Business logic services
  │   ├── index.ts
  │   ├── BackendService.ts
  │   └── ConfigService.ts
  ├── pages/                 # UI pages
  │   ├── index.ts
  │   ├── HomePage.ts
  │   └── components/
  │       ├── StatusCard.ts
  │       ├── DatabaseCard.ts
  │       └── ConfigCard.ts
  ├── utils/                 # Utility functions
  │   ├── index.ts
  │   └── logger.ts
  └── types/                 # TypeScript definitions
      ├── index.ts
      ├── database.ts
      └── config.ts
```

## Features

- **Modern UI**: Clean, responsive interface built with modern web technologies
- **Backend Integration**: Connects to the EZAccounting backend API
- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Native Menus**: Full application menu with keyboard shortcuts
- **File Operations**: Built-in file dialogs for data import/export
- **Real-time Status**: Live backend connection monitoring

## Backend Connection

The desktop app connects to the backend API running on `http://localhost:3000`. Make sure the backend service is running before starting the desktop application.

## Development Notes

- The app uses context isolation for security
- All communication with the main process goes through the preload script
- The renderer process runs in a sandboxed environment
- Backend API calls are made from the main process to avoid CORS issues

## Troubleshooting

### Backend Connection Issues
- Ensure the backend service is running on port 3000
- Check that Docker containers are up and running
- Verify network connectivity between frontend and backend

### GUI Issues (Linux)
- Make sure X11 forwarding is enabled if running in a container
- Install required GUI libraries: `sudo apt-get install xvfb`

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure TypeScript compilation succeeds: `npm run build`


