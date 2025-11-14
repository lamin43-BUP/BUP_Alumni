const db = require('./config/database');

async function testAlumniData() {
    try {
        console.log('🔍 Testing alumni database...');
        
        // Test connection
        const [test] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful');

        // Check if alumni table exists and has data
        const [alumni] = await db.execute('SELECT COUNT(*) as count FROM alumni');
        console.log(`📊 Alumni records in database: ${alumni[0].count}`);

        // Show some sample data
        const [sample] = await db.execute('SELECT alumni_id, name, department, batch FROM alumni LIMIT 5');
        console.log('📋 Sample alumni data:', sample);

    } catch (error) {
        console.error('❌ Database test failed:', error);
    }
}

testAlumniData();