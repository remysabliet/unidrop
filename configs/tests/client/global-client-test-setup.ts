import dotenv from 'dotenv';

export const setup = async () => {
  console.log('Setting up test environment for frontend...');

  // Load environment variables from .env.test
  const dotenvResult = dotenv.config({ path: '.env.test' });

  if (dotenvResult.error) {
    throw new Error(`Failed to load .env.test file: ${dotenvResult.error}`);
  }

  // Set default environment variable
  process.env.NEXT_PUBLIC_ENV = 'test';
};
