# How to Run the Knowledge Base Service

## ✅ Issue Fixed!

The PostgreSQL authentication error has been resolved by using the `postgres` user instead of `user`.

## Quick Start

### Option 1: Use the Startup Script (Recommended)

**Windows PowerShell:**
```powershell
.\start-server.ps1
```

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

### Option 2: Manual Setup

**Windows PowerShell:**
```powershell
$env:NEO4J_URI="bolt://localhost:7687"
$env:NEO4J_USER="neo4j"
$env:NEO4J_PASSWORD="password"
$env:POSTGRES_URI="postgresql://postgres:password@localhost:5432/knowledgebase"
$env:PORT="3000"
npm start
```

**Linux/Mac:**
```bash
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="password"
export POSTGRES_URI="postgresql://postgres:password@localhost:5432/knowledgebase"
export PORT="3000"
npm start
```

## Prerequisites

1. **Start Docker services:**
   ```bash
   npm run docker:up
   # or
   docker-compose up -d
   ```

2. **Set GOOGLE_API_KEY (optional but recommended):**
   ```powershell
   # Windows
   $env:GOOGLE_API_KEY="your_api_key_here"
   
   # Linux/Mac
   export GOOGLE_API_KEY="your_api_key_here"
   ```

## Verify It's Running

```bash
# Health check
curl http://localhost:3000/api/health

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/health -UseBasicParsing
```

Expected response:
```json
{
  "status": "ok",
  "service": "AI Knowledge Base",
  "version": "1.0.0"
}
```

## What Was Fixed

- ✅ Created `postgres` superuser in PostgreSQL
- ✅ Updated default connection string to use `postgres` user
- ✅ Updated startup scripts with correct credentials
- ✅ Server now initializes successfully

## Troubleshooting

**Port already in use:**
```powershell
# Windows - Find and kill process
$process = Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess -First 1
Stop-Process -Id $process -Force
```

**Database connection errors:**
- Ensure Docker services are running: `docker-compose ps`
- Wait a few seconds after starting Docker for services to initialize
- Verify credentials match Docker setup

## Next Steps

Once the server is running, you can:
- Use the API at `http://localhost:3000/api`
- Run examples: `node examples/basic-usage.js`
- Check documentation in `README.md`

