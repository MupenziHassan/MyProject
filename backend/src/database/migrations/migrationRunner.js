const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Migration = require('../models/Migration');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Get all migration files
const getMigrationFiles = () => {
  const migrationDir = path.join(__dirname);
  return fs.readdirSync(migrationDir)
    .filter(file => file.match(/^\d+.*\.js$/))
    .sort()
    .map(file => path.join(migrationDir, file));
};

// Run pending migrations
const runMigrations = async () => {
  await connectDB();
  
  // Get executed migrations
  const executedMigrations = await Migration.find({}).select('filename').sort('filename');
  const executedFilenames = executedMigrations.map(m => m.filename);
  
  // Get all migration files
  const migrationFiles = getMigrationFiles();
  
  // Find pending migrations
  const pendingMigrations = migrationFiles
    .filter(file => !executedFilenames.includes(path.basename(file)));
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to run.');
    process.exit(0);
  }
  
  console.log(`Running ${pendingMigrations.length} migrations...`);
  
  // Execute pending migrations
  for (const migrationFile of pendingMigrations) {
    const filename = path.basename(migrationFile);
    console.log(`Running migration: ${filename}`);
    
    try {
      // Import and execute migration
      const migration = require(migrationFile);
      await migration.up();
      
      // Record migration as executed
      await Migration.create({ filename, executedAt: new Date() });
      console.log(`Migration completed: ${filename}`);
    } catch (error) {
      console.error(`Migration failed: ${filename}`);
      console.error(error);
      process.exit(1);
    }
  }
  
  console.log('All migrations completed successfully.');
  process.exit(0);
};

// Run rollback for the last batch of migrations
const rollback = async () => {
  await connectDB();
  
  // Get last executed migration
  const lastMigration = await Migration.findOne({}).sort('-executedAt');
  
  if (!lastMigration) {
    console.log('No migrations to rollback.');
    process.exit(0);
  }
  
  console.log(`Rolling back migration: ${lastMigration.filename}`);
  
  try {
    // Import and execute rollback
    const migrationFile = path.join(__dirname, lastMigration.filename);
    const migration = require(migrationFile);
    await migration.down();
    
    // Remove migration record
    await Migration.deleteOne({ _id: lastMigration._id });
    console.log(`Rollback completed for: ${lastMigration.filename}`);
  } catch (error) {
    console.error(`Rollback failed for: ${lastMigration.filename}`);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
};

// Handle command line arguments
const command = process.argv[2];

if (command === 'rollback') {
  rollback();
} else {
  runMigrations();
}
