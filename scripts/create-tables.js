// Script to create Supabase tables using service role key
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://nqqevivasvdcjffpvylr.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcWV2aXZhc3ZkY2pmZnB2eWxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY5ODAxNiwiZXhwIjoyMDgwMjc0MDE2fQ.rYdCIDNPAF5zwAjEus6LXgUINV221FXmKDru_Ew5a_M'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  console.log('🚀 Creating database tables...\n')

  const sqlCommands = [
    // Drop existing tables
    `DROP TABLE IF EXISTS progress CASCADE;`,
    `DROP TABLE IF EXISTS goals CASCADE;`,
    
    // Create goals table
    `CREATE TABLE goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3b82f6',
      "targetDays" INTEGER DEFAULT 30,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create progress table
    `CREATE TABLE progress (
      id TEXT PRIMARY KEY,
      "goalId" TEXT NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN DEFAULT false,
      notes TEXT,
      "completedAt" TIMESTAMP WITH TIME ZONE,
      FOREIGN KEY ("goalId") REFERENCES goals(id) ON DELETE CASCADE,
      UNIQUE("goalId", date)
    );`,
    
    // Enable RLS
    `ALTER TABLE goals ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE progress ENABLE ROW LEVEL SECURITY;`,
    
    // Create policies
    `CREATE POLICY "Allow public read" ON goals FOR SELECT USING (true);`,
    `CREATE POLICY "Allow public insert" ON goals FOR INSERT WITH CHECK (true);`,
    `CREATE POLICY "Allow public update" ON goals FOR UPDATE USING (true);`,
    `CREATE POLICY "Allow public delete" ON goals FOR DELETE USING (true);`,
    
    `CREATE POLICY "Allow public read" ON progress FOR SELECT USING (true);`,
    `CREATE POLICY "Allow public insert" ON progress FOR INSERT WITH CHECK (true);`,
    `CREATE POLICY "Allow public update" ON progress FOR UPDATE USING (true);`,
    `CREATE POLICY "Allow public delete" ON progress FOR DELETE USING (true);`,
    
    // Create indexes
    `CREATE INDEX idx_goals_created ON goals("createdAt" DESC);`,
    `CREATE INDEX idx_progress_goal ON progress("goalId");`,
    `CREATE INDEX idx_progress_date ON progress(date DESC);`,
    `CREATE INDEX idx_progress_completed ON progress(completed);`,
    
    // Create trigger function
    `CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`,
    
    // Create trigger
    `DROP TRIGGER IF EXISTS update_goals_timestamp ON goals;`,
    `CREATE TRIGGER update_goals_timestamp
      BEFORE UPDATE ON goals
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();`
  ]

  try {
    // Execute all SQL commands
    for (const sql of sqlCommands) {
      console.log(`Executing: ${sql.substring(0, 50)}...`)
      
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
        query: sql 
      })
      
      if (error) {
        // If exec_sql doesn't exist, try direct SQL execution
        console.log(`⚠️  RPC method not available, trying direct execution...`)
        break
      }
    }
    
    // Alternative: Create using REST API
    console.log('\n📝 Using REST API to create tables...')
    
    const fullSQL = sqlCommands.join('\n\n')
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: fullSQL })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }
    
    console.log('✅ Tables created successfully via REST API!')
    
  } catch (error) {
    console.log('\n⚠️  Automated creation failed. Creating tables using SQL Editor...\n')
    console.log('Please copy and paste the following SQL into your Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(sqlCommands.join('\n\n'))
    console.log('=' .repeat(80))
    process.exit(1)
  }
}

createTables()
  .then(() => {
    console.log('\n🎉 Setup complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
  })
