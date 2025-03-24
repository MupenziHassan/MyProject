const cron = require('node-cron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Schedule automated backups
// This runs at 2 AM every day
cron.schedule('0 2 * * *', () => {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  exec(`mongodump --uri="${process.env.MONGO_URI}" --out="${backupPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error.message}`);
      return;
    }
    
    console.log(`Backup completed successfully at ${backupPath}`);
    
    // Cleanup old backups (keep only last 7 days)
    cleanupOldBackups();
  });
});

function cleanupOldBackups() {
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error(`Error reading backup directory: ${err.message}`);
      return;
    }
    
    // Sort files by creation time
    const sortedFiles = files
      .filter(file => fs.statSync(path.join(backupDir, file)).isDirectory())
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(backupDir, file)).birthtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    // Keep only the 7 most recent backups
    if (sortedFiles.length > 7) {
      const filesToDelete = sortedFiles.slice(7);
      filesToDelete.forEach(file => {
        const filePath = path.join(backupDir, file.name);
        fs.rm(filePath, { recursive: true, force: true }, (err) => {
          if (err) {
            console.error(`Error deleting old backup ${file.name}: ${err.message}`);
          } else {
            console.log(`Deleted old backup: ${file.name}`);
          }
        });
      });
    }
  });
}

module.exports = { startScheduledBackups: () => console.log('Scheduled backups initialized') };
