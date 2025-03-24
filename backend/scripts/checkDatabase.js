const mongoose = require('mongoose');
const { connectDatabase, closeDatabase } = require('../config/database');

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    const dbResult = await connectDatabase();
    
    if (!dbResult.success) {
      console.error('Database connection failed:', dbResult.error);
      return;
    }
    
    console.log('Database connection successful');
    
    // List all collections
    console.log('\nCollections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found. Database may be empty.');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} documents`);
      }
    }
    
    // Check users collection in more detail if it exists
    if (collections.some(c => c.name === 'users')) {
      console.log('\nUser accounts:');
      const users = await mongoose.connection.db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
      
      if (users.length === 0) {
        console.log('No users found in the database.');
      } else {
        users.forEach(user => {
          console.log(`- ${user.name} (${user.email}) [${user.role}]`);
        });
      }
    }
    
    await closeDatabase();
  } catch (error) {
    console.error('Error checking database:', error);
    await closeDatabase();
  }
}

// Run directly if called from command line
if (require.main === module) {
  checkDatabase().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = checkDatabase;
