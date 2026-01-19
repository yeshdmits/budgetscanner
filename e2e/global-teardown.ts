import { FullConfig } from '@playwright/test';
import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import { MONGODB_URI, DATABASE_NAME, TEST_PREFIX, TEST_CSV_PATH } from './utils/test-constants';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n========================================');
  console.log('Starting E2E Test Global Teardown...');
  console.log('========================================\n');

  // 1. Clean test data from database
  console.log('Step 1: Cleaning test data from database...');
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    const result = await db.collection('transactions').deleteMany({
      zkbReference: { $regex: `^${TEST_PREFIX}` }
    });

    console.log(`Cleaned ${result.deletedCount} test transactions`);
    await client.close();
  } catch (error) {
    console.warn('Failed to clean test data:', error);
  }

  // 2. Remove generated CSV file
  console.log('\nStep 2: Removing generated CSV file...');
  try {
    if (fs.existsSync(TEST_CSV_PATH)) {
      fs.unlinkSync(TEST_CSV_PATH);
      console.log('Removed generated CSV file');
    } else {
      console.log('CSV file already removed');
    }
  } catch (error) {
    console.warn('Failed to remove CSV file:', error);
  }

  // Note: We don't stop docker-compose as the user might want to keep it running
  // Uncomment if you want to stop MongoDB after tests:
  // console.log('\nStep 3: Stopping MongoDB...');
  // execSync('docker compose down', { stdio: 'inherit', cwd: process.cwd() });

  console.log('\n========================================');
  console.log('Global Teardown Complete!');
  console.log('========================================\n');
}

export default globalTeardown;
