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
| `DATABASE_URL` | `file:./prisma/dev.db` | **Primary database URL (recommended)** |
| `EZACCOUNTING_DB_NAME` | `ezaccounting.db` | Database filename (legacy) |
| `EZACCOUNTING_DB_PATH` | User data directory | Database file path (legacy) |
| `DATABASE_NAME` | `ezaccounting.db` | Alternative database name variable (legacy) |
| `DATABASE_PATH` | User data directory | Alternative database path variable (legacy) |

## Usage Examples

### Method 1: .env File (Development) - **RECOMMENDED**
Create `frontend/.env`:
```bash
# Simple database configuration
DATABASE_URL="file:./prisma/dev.db"

# Custom database location
# DATABASE_URL="file:./prisma/custom.db"
# DATABASE_URL="file:/absolute/path/to/your/database.db"

# Backend configuration
EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000
```

### Method 2: Windows Command Prompt
```cmd
set DATABASE_URL=file:./prisma/custom.db
set EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000
EZAccounting.exe
```

### Method 3: Windows PowerShell
```powershell
$env:DATABASE_URL="file:./prisma/custom.db"
$env:EZACCOUNTING_BACKEND_URL="http://192.168.1.100:3000"
.\EZAccounting.exe
```

### Method 4: Linux/macOS Terminal
```bash
DATABASE_URL="file:./prisma/custom.db" EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000 ./EZAccounting
```

### Method 5: System Environment Variables (Permanent)
1. Open System Properties → Advanced → Environment Variables
2. Add User or System variables:
   - `DATABASE_URL` = `file:./prisma/custom.db`
   - `EZACCOUNTING_BACKEND_URL` = `http://192.168.1.100:3000`

### Method 6: Docker/Container Environment
```bash
docker run -e DATABASE_URL="file:/app/data/database.db" -e EZACCOUNTING_BACKEND_URL=http://backend:3000 ezaccounting
```

## Configuration Priority

1. **DATABASE_URL** (new simplified approach - **recommended**)
2. **Legacy variables** (EZACCOUNTING_DB_PATH, DATABASE_PATH for compatibility)
3. **Default values** (prisma/dev.db for development)

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
