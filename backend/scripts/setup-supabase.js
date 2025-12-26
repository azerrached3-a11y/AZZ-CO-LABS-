/**
 * Setup script for Supabase database
 * Creates all necessary tables and enables Row Level Security
 * 
 * Usage: node scripts/setup-supabase.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ Error: POSTGRES_URL or DATABASE_URL not found in environment variables');
    console.error('Please set one of these variables in your .env file');
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function setupSupabase() {
    try {
        console.log('📊 Connecting to Supabase...');
        
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Connected to Supabase database');

        // Create all tables
        console.log('📝 Creating tables...');
        
        // Visitors table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visitors (
                id SERIAL PRIMARY KEY,
                visitor_id TEXT UNIQUE NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                referrer TEXT,
                first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                visit_count INTEGER DEFAULT 1,
                session_duration INTEGER DEFAULT 0,
                pages_visited TEXT,
                country TEXT,
                country_code TEXT,
                region TEXT,
                region_code TEXT,
                city TEXT,
                timezone TEXT,
                latitude REAL,
                longitude REAL,
                isp TEXT,
                device_type TEXT,
                browser TEXT,
                os TEXT,
                language TEXT
            )
        `);
        console.log('✅ Visitors table created');

        // Chat logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_logs (
                id SERIAL PRIMARY KEY,
                visitor_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                persona_detected TEXT,
                context_keywords TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                response_time INTEGER,
                FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Chat logs table created');

        // Page views table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS page_views (
                id SERIAL PRIMARY KEY,
                visitor_id TEXT NOT NULL,
                page_path TEXT NOT NULL,
                page_title TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                time_spent INTEGER DEFAULT 0,
                scroll_depth INTEGER DEFAULT 0,
                FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Page views table created');

        // Events table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                visitor_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                event_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Events table created');

        // Notes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                title TEXT NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                visitor_id TEXT,
                FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Notes table created');

        // Create indexes
        console.log('📊 Creating indexes...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_notes_visitor_id ON notes(visitor_id);
            CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
            CREATE INDEX IF NOT EXISTS idx_chat_logs_visitor_id ON chat_logs(visitor_id);
            CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
            CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON events(visitor_id);
        `);
        console.log('✅ Indexes created');

        // Insert sample notes data (only if table is empty)
        const existingNotes = await pool.query('SELECT COUNT(*) FROM notes');
        if (parseInt(existingNotes.rows[0].count) === 0) {
            console.log('📝 Inserting sample notes data...');
            await pool.query(`
                INSERT INTO notes (title, content)
                VALUES
                    ('Today I created a Supabase project.', 'This is a sample note about creating a Supabase project.'),
                    ('I added some data and queried it from Next.js.', 'This note describes adding and querying data from Next.js.'),
                    ('It was awesome!', 'A simple note expressing enthusiasm.')
            `);
            console.log('✅ Sample notes data inserted');
        } else {
            console.log('ℹ️  Notes table already contains data, skipping sample data insertion');
        }

        // Enable Row Level Security (RLS) on all tables
        console.log('🔒 Enabling Row Level Security...');
        const tables = ['visitors', 'chat_logs', 'page_views', 'events', 'notes'];
        
        for (const table of tables) {
            try {
                await pool.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
                console.log(`✅ RLS enabled on ${table}`);
            } catch (error) {
                console.warn(`⚠️  Could not enable RLS on ${table}:`, error.message);
            }
        }

        // Create RLS policies (optional - for public read access)
        console.log('📋 Creating RLS policies...');
        
        // Allow public read access to notes (you can customize this)
        try {
            await pool.query(`
                CREATE POLICY IF NOT EXISTS "Allow public read access to notes"
                ON notes FOR SELECT
                USING (true)
            `);
            console.log('✅ RLS policy created for notes (public read)');
        } catch (error) {
            console.warn('⚠️  Could not create RLS policy:', error.message);
        }

        console.log('✅ Supabase setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Setup error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run setup
setupSupabase()
    .then(() => {
        console.log('🎉 Supabase setup script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    });
