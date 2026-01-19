import { FullConfig } from '@playwright/test';
import { MongoClient } from 'mongodb';
import { execSync } from 'child_process';
import { generateAndSaveTestCSV } from './fixtures/test-data-generator';
import { MONGODB_URI, DATABASE_NAME, TEST_PREFIX } from './utils/test-constants';

async function waitForMongo(maxRetries = 30, delay = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      await client.close();
      console.log('MongoDB is ready');
      return;
    } catch (error) {
      console.log(`Waiting for MongoDB... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('MongoDB failed to start');
}

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n========================================');
  console.log('Starting E2E Test Global Setup...');
  console.log('========================================\n');

  // 1. Start MongoDB via docker-compose
  console.log('Step 1: Starting MongoDB via docker compose...');
  try {
    execSync('docker compose up -d', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Failed to start docker compose. Make sure Docker is running.');
    throw error;
  }

  // 2. Wait for MongoDB to be ready
  console.log('\nStep 2: Waiting for MongoDB to be ready...');
  await waitForMongo();

  // 3. Generate test CSV file
  console.log('\nStep 3: Generating test transactions CSV...');
  generateAndSaveTestCSV();

  // 4. Clean any existing test data
  console.log('\nStep 4: Cleaning existing test data...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DATABASE_NAME);

  const deleteResult = await db.collection('transactions').deleteMany({
    zkbReference: { $regex: `^${TEST_PREFIX}` }
  });

  console.log(`Cleaned ${deleteResult.deletedCount} existing test transactions`);
  await client.close();

  console.log('\n========================================');
  console.log('Global Setup Complete!');
  console.log('========================================\n');
}

export default globalSetup;
