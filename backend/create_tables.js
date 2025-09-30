// create_tables.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_WL9qAT5ZhcXG@ep-silent-mode-ae067yqo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  console.log('🔧 Creating tables in Neon database...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon database');
    
    // Create users table
    console.log('👥 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Create transactions table
    console.log('💰 Creating transactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
        seller_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Transactions table created');
    
    // Create disputes table (if you have one)
    console.log('⚖️ Creating disputes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id SERIAL PRIMARY KEY,
        transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
        disputer_id INT REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Disputes table created');
    
    // Create password reset tokens table
    console.log('🔑 Creating password reset tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        otp_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Password reset tokens table created');
    
    // Create index for faster lookups
    console.log('📊 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
      ON password_reset_tokens(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id 
      ON transactions(buyer_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_seller_id 
      ON transactions(seller_id)
    `);
    console.log('✅ Indexes created');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    // Show table structures
    console.log('\n📊 Table structures:');
    for (const table of tablesResult.rows) {
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      console.log(`\n🔹 ${table.table_name}:`);
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
    }
    
    client.release();
    console.log('\n🎉 All tables created successfully!');
    console.log('You can now run your application and register users.');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

createTables();