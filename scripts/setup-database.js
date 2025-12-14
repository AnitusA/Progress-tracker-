// This script sets up the Supabase database tables
// Run with: node scripts/setup-database.js
// Make sure to set the environment variables before running:
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Please check your .env file.')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nYou can load them by running:')
  console.error('Get-Content .env | ForEach-Object { if($_ -match "^([^=]+)=(.*)$") { [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }; node scripts/setup-database.js')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const setupDatabase = async () => {
  console.log('🚀 Setting up database tables...')

  const sqlCommands = `
    -- Drop existing tables if they exist
    DROP TABLE IF EXISTS progress CASCADE;
    DROP TABLE IF EXISTS goals CASCADE;

    -- Create goals table
    CREATE TABLE goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3b82f6',
      "targetDays" INTEGER DEFAULT 30,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create progress table
    CREATE TABLE progress (
      id TEXT PRIMARY KEY,
      "goalId" TEXT NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN DEFAULT false,
      notes TEXT,
      "completedAt" TIMESTAMP WITH TIME ZONE,
      FOREIGN KEY ("goalId") REFERENCES goals(id) ON DELETE CASCADE,
      UNIQUE("goalId", date)
    );

    -- Enable Row Level Security
    ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

    -- Create policies for public access (no auth)
    CREATE POLICY "Allow public read" ON goals FOR SELECT USING (true);
    CREATE POLICY "Allow public insert" ON goals FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update" ON goals FOR UPDATE USING (true);
    CREATE POLICY "Allow public delete" ON goals FOR DELETE USING (true);

    CREATE POLICY "Allow public read" ON progress FOR SELECT USING (true);
    CREATE POLICY "Allow public insert" ON progress FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update" ON progress FOR UPDATE USING (true);
    CREATE POLICY "Allow public delete" ON progress FOR DELETE USING (true);

    -- Create indexes for performance
    CREATE INDEX idx_goals_created ON goals("createdAt" DESC);
    CREATE INDEX idx_progress_goal ON progress("goalId");
    CREATE INDEX idx_progress_date ON progress(date DESC);
    CREATE INDEX idx_progress_completed ON progress(completed);

    -- Auto-update timestamp trigger function
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger
    DROP TRIGGER IF EXISTS update_goals_timestamp ON goals;
    CREATE TRIGGER update_goals_timestamp
      BEFORE UPDATE ON goals
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
  `

  try {
    // Execute SQL using the RPC endpoint or directly
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlCommands })
    
    if (error) {
      // If RPC doesn't exist, we need to run SQL commands separately
      console.log('Running SQL commands via REST API...')
      
      // For now, let's create tables using REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: sqlCommands })
      })
      
      if (!response.ok) {
        console.log('⚠️  Could not execute SQL via API. Please run the SQL manually in Supabase SQL Editor.')
        console.log('\nSQL Commands to run:')
        console.log(sqlCommands)
        return
      }
    }

    console.log('✅ Database tables created successfully!')
    console.log('\nTables created:')
    console.log('  - goals (for storing user goals)')
    console.log('  - progress (for tracking daily completions)')
    console.log('\n🎉 Setup complete! You can now use the application.')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.log('\n📝 Please run these SQL commands manually in Supabase SQL Editor:')
    console.log(sqlCommands)
  }
}

setupDatabase().then(() => process.exit(0))