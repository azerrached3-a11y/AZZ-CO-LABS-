/**
 * Migration script to add geolocation fields to visitors table
 * Run this once to update existing database schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/visitors.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
    }
    console.log('📊 Connected to database');
});

db.serialize(() => {
    // Add new geolocation columns if they don't exist
    const columns = [
        { name: 'country_code', type: 'TEXT' },
        { name: 'region', type: 'TEXT' },
        { name: 'region_code', type: 'TEXT' },
        { name: 'timezone', type: 'TEXT' },
        { name: 'latitude', type: 'REAL' },
        { name: 'longitude', type: 'REAL' },
        { name: 'isp', type: 'TEXT' }
    ];

    columns.forEach((col, index) => {
        db.run(
            `ALTER TABLE visitors ADD COLUMN ${col.name} ${col.type}`,
            (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error(`❌ Error adding column ${col.name}:`, err.message);
                } else if (!err) {
                    console.log(`✅ Added column: ${col.name}`);
                }
                
                // Close connection after last column
                if (index === columns.length - 1) {
                    db.close((err) => {
                        if (err) {
                            console.error('❌ Error closing database:', err);
                        } else {
                            console.log('✅ Migration completed');
                        }
                        process.exit(0);
                    });
                }
            }
        );
    });
});
