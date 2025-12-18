# Progress Tracker - Security Setup Guide

## Environment Variables Security

This project uses environment variables to securely store sensitive credentials like database connection strings and API keys. **Never commit credentials directly in your code.**

## Files Structure

### Environment Files

- **`.env`** - Contains your actual credentials (***DO NOT COMMIT THIS***)
- **`.env.example`** - Template with placeholder values (safe to commit)
- **`.gitignore`** - Ensures `.env` files are not tracked by git

### Database

- **`scripts/setup-database.js`** - Sets up Supabase database tables
- **`scripts/create-tables.js`** - Alternative script to create tables
- **`run-setup-database.ps1`** - PowerShell helper to load env vars and run setup
- **`run-create-tables.ps1`** - PowerShell helper to load env vars and run create tables in neon with the env commemnts 
## Quick Start

### 1. Set Up Environment Variables

Copy the example file and fill in your actual values:

```bash
copy .env.example .env
```

Edit `.env` with your actual credentials:

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Running Database Setup

#### Option A: Using PowerShell Helper Scripts (Recommended)

```powershell
# For database setup
.\run-setup-database.ps1

# For creating tables
.\run-create-tables.ps1
```

#### Option B: Manual Environment Loading

```powershell
# Load environment variables and run setup
Get-Content .env | ForEach-Object { if($_ -match "^([^=]+)=(.*)$") { [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }; node scripts/setup-database.js
```

## Security Best Practices

### ✅ What We Do Right

1. **Environment Variables**: All sensitive data is stored in `.env` files
2. **Git Ignore**: `.env` files are excluded from version control
3. **Template File**: `.env.example` shows required variables without exposing values
4. **Runtime Validation**: Scripts check for required environment variables
5. **Clear Separation**: No hardcoded credentials in source code

### 🚫 What to Never Do

- **Never** commit `.env` files to git
- **Never** hardcode credentials in source code
- **Never** share `.env` files via email, chat, or other insecure channels
- **Never** use production credentials in development

### 📝 Additional Security Tips

1. **Rotate Keys Regularly**: Change your API keys periodically
2. **Use Different Keys Per Environment**: Dev, staging, and production should have separate keys
3. **Limit Key Permissions**: Use service accounts with minimal required permissions
4. **Monitor Key Usage**: Keep track of API key usage and watch for unusual activity

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_BASE_URL` | Your application's base URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | `eyJhbGciOiJIUzI1Ni...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) | Yes | `eyJhbGciOiJIUzI1Ni...` |

## Troubleshooting

### Missing Environment Variables Error

If you see "Missing environment variables" error:

1. Ensure `.env` file exists in project root
2. Check that all required variables are set
3. Verify no extra spaces around variable names
4. Make sure you're running scripts from the project root directory

### PowerShell Execution Policy

If you can't run PowerShell scripts:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Development Workflow

1. **Clone Repository**: Never includes sensitive data
2. **Copy Environment Template**: `copy .env.example .env`
3. **Fill In Credentials**: Add your actual values to `.env`
4. **Run Setup**: Use helper scripts to initialize database
5. **Start Development**: All credentials loaded from environment

---

**Remember**: Keeping credentials secure is everyone's responsibility. When in doubt, ask for help rather than risk exposing sensitive data.