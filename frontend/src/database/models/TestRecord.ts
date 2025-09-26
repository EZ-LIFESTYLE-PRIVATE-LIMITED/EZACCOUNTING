import { TestRecord as ITestRecord } from '../../types/database';

export class TestRecord implements ITestRecord {
  public id?: number;
  public name: string;
  public value: string;
  public created_at?: string;

  constructor(data: Partial<ITestRecord>) {
    this.id = data.id;
    this.name = data.name || '';
    this.value = data.value || '';
    this.created_at = data.created_at;
  }

  /**
   * Convert to plain object
   */
  public toObject(): ITestRecord {
    return {
      id: this.id,
      name: this.name,
      value: this.value,
      created_at: this.created_at
    };
  }

  /**
   * Create from database row
   */
  public static fromRow(row: any): TestRecord {
    return new TestRecord({
      id: row.id,
      name: row.name,
      value: row.value,
      created_at: row.created_at
    });
  }
}
