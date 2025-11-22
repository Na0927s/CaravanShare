import { readData, writeData } from '../db/utils';

export class JsonFileRepository<T extends { id: string }> {
  protected filePath: string;

  constructor(fileName: string) {
    // Assuming db files are directly in server/src/db for simplicity
    this.filePath = `db/${fileName}`;
  }

  protected async getAll(): Promise<T[]> {
    return readData<T>(this.filePath);
  }

  protected async saveAll(data: T[]): Promise<void> {
    await writeData<T>(this.filePath, data);
  }

  async findById(id: string): Promise<T | undefined> {
    const allData = await this.getAll();
    return allData.find(item => item.id === id);
  }

  async findAll(): Promise<T[]> {
    return this.getAll();
  }

  async create(item: T): Promise<T> {
    const allData = await this.getAll();
    allData.push(item);
    await this.saveAll(allData);
    return item;
  }

  async update(id: string, updatedItem: Partial<T>): Promise<T | undefined> {
    const allData = await this.getAll();
    const index = allData.findIndex(item => item.id === id);
    if (index === -1) {
      return undefined;
    }
    allData[index] = { ...allData[index], ...updatedItem };
    await this.saveAll(allData);
    return allData[index];
  }

  async delete(id: string): Promise<boolean> {
    const allData = await this.getAll();
    const initialLength = allData.length;
    const filteredData = allData.filter(item => item.id !== id);
    if (filteredData.length === initialLength) {
      return false; // No item was deleted
    }
    await this.saveAll(filteredData);
    return true;
  }
}
