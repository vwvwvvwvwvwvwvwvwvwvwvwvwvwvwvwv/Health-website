const { execSync } = require('child_process');

try {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set, skipping database migration');
    process.exit(0);
  }
  
  console.log('✅ DATABASE_URL found, proceeding with build');
  process.exit(0);
} catch (error) {
  console.log('⚠️  Database check failed, continuing build without migration');
  process.exit(0);
}




