export class TestDataGenerator {
  private static counter = 0;

  static getUniqueId(): number {
    return Date.now() + this.counter++;
  }

  static generateUser() {
    const id = this.getUniqueId();
    return {
      email: `test-user-${id}@example.com`,
      name: `Test User ${id}`,
      posts: {
        create: [
          {
            title: `Test Post ${id}-1`,
            content: `This is test content for post ${id}-1`,
            published: true,
          },
          {
            title: `Test Post ${id}-2`,
            content: `This is test content for post ${id}-2`,
            published: false,
          }
        ]
      }
    };
  }

  static generatePost() {
    const id = this.getUniqueId();
    return {
      title: `Test Post ${id}`,
      content: `This is test content for post ${id}. Lorem ipsum dolor sit amet.`,
      published: Math.random() > 0.5,
      jsonField: {
        key: `value-${id}`,
        nested: {
          data: `nested-${id}`
        }
      }
    };
  }

  static generateRandomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test-${this.generateRandomString(8)}@example.com`;
  }

  static generateRandomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static generateJsonData() {
    const id = this.getUniqueId();
    return {
      id,
      type: 'test',
      attributes: {
        name: `Item ${id}`,
        value: Math.floor(Math.random() * 1000),
        active: Math.random() > 0.5,
        tags: ['test', 'e2e', `tag-${id}`],
        metadata: {
          createdBy: 'e2e-test',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }
    };
  }
}