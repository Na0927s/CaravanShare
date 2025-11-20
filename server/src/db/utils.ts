import path from 'path';
import fs from 'fs/promises';

const dbDirectory = path.join(__dirname, '..', '..', 'db');

export const readData = async <T>(fileName: string): Promise<T[]> => {
  const filePath = path.join(dbDirectory, fileName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error(`Error reading from ${fileName}:`, error);
    return [];
  }
};

export const writeData = async <T>(fileName: string, data: T[]): Promise<void> => {
  const filePath = path.join(dbDirectory, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${fileName}:`, error);
    throw error; // Re-throw the error to be handled by the caller if necessary
  }
};
