# EZAccounting Configuration Guide

EZAccounting supports configurable backend URL and database location through environment variables.

## Environment Variables

### Backend Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `EZACCOUNTING_BACKEND_URL` | `http://localhost:3000` | Backend API server URL |
| `BACKEND_URL` | `http://localhost:3000` | Alternative backend URL variable |

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `EZACCOUNTING_DB_NAME` | `ezaccounting.db` | Database filename |
| `EZACCOUNTING_DB_PATH` | User data directory | Database file path |
| `DATABASE_NAME` | `ezaccounting.db` | Alternative database name variable |
| `DATABASE_PATH` | User data directory | Alternative database path variable |

## Usage Examples

### Method 1: .env File (Development)
Create `frontend/.env`:
```bash
EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000
EZACCOUNTING_DB_PATH=C:\MyData
EZACCOUNTING_DB_NAME=myaccounting.db
```

### Method 2: Windows Command Prompt
```cmd
set EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000
set EZACCOUNTING_DB_PATH=C:\MyData
EZAccounting.exe
```

### Method 3: Windows PowerShell
```powershell
$env:EZACCOUNTING_BACKEND_URL="http://192.168.1.100:3000"
$env:EZACCOUNTING_DB_PATH="C:\MyData"
.\EZAccounting.exe
```

### Method 4: Linux/macOS Terminal
```bash
EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000 EZACCOUNTING_DB_PATH=/home/user/mydata ./EZAccounting
```

### Method 5: Windows Batch Script
Use the provided `run-custom.bat` script:
```cmd
run-custom.bat
```

### Method 6: Windows PowerShell Script
Use the provided `run-custom.ps1` script:
```powershell
.\run-custom.ps1
```

### Method 7: System Environment Variables (Permanent)
1. Open System Properties → Advanced → Environment Variables
2. Add User or System variables:
   - `EZACCOUNTING_BACKEND_URL` = `http://192.168.1.100:3000`
   - `EZACCOUNTING_DB_PATH` = `C:\MyData`

### Method 8: Docker/Container Environment
```bash
docker run -e EZACCOUNTING_BACKEND_URL=http://backend:3000 -e EZACCOUNTING_DB_PATH=/app/data ezaccounting
```

## Configuration Priority

1. **Primary variables** (prefixed with `EZACCOUNTING_`)
2. **Alternative variables** (for compatibility)
3. **Default values**

## Database Path Behavior

- **Absolute paths**: Used as-is
- **Relative paths**: Resolved relative to user data directory
- **Default**: Stored in user data directory (`%APPDATA%/Electron/` on Windows)

## Backend URL Examples

- `http://localhost:3000` - Local development
- `http://192.168.1.100:3000` - Local network server
- `https://api.mycompany.com` - Remote production server
- `http://backend:3000` - Docker container networking

## Configuration Display

The application shows current configuration in the UI:
- Backend URL
- Database path
- User data directory
- Whether custom values are being used

Click "Show Full Configuration" to see detailed configuration information including environment variable usage examples.
