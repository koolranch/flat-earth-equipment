import crisp from '../lib/crisp/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testCrispConnection() {
  try {
    // Test the connection by getting website information
    const website = await crisp.website.getWebsite();
    console.log('Successfully connected to Crisp!');
    console.log('Website name:', website.name);
    console.log('Website domain:', website.domain);
  } catch (error) {
    console.error('Error connecting to Crisp:', error);
  }
}

testCrispConnection(); 