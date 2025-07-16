import type { Page } from '@playwright/test';
import { ModelFormPage } from '../pages/model-form';
import { ModelListPage } from '../pages/model-list';

export interface TestPost {
  title: string;
  published: boolean;
  content?: string;
}

export class TestDataHelper {
  private page: Page;
  private formPage: ModelFormPage;
  private listPage: ModelListPage;

  constructor(page: Page) {
    this.page = page;
    this.formPage = new ModelFormPage(page);
    this.listPage = new ModelListPage(page);
  }

  async createPost(post: TestPost) {
    await this.listPage.clickCreate();

    // Wait for form to be ready
    await this.page.waitForLoadState('networkidle');

    // Fill title
    await this.formPage.fillField('Title', post.title);

    // Fill content if provided
    if (post.content) {
      await this.formPage.fillField('Content', post.content);
    }

    // Handle published checkbox - try different label variations
    try {
      await this.formPage.toggleCheckbox('Published', post.published);
    } catch (_error) {
      // Try lowercase if uppercase fails
      try {
        await this.formPage.toggleCheckbox('published', post.published);
      } catch (_error2) {
        // Try with asterisk for required field
        await this.formPage.toggleCheckbox('Published *', post.published);
      }
    }

    // Submit and wait for success
    await this.formPage.submit();
    await this.formPage.waitForSuccess();

    // Wait a bit for the record to be saved
    await this.page.waitForTimeout(500);
  }

  async createPosts(posts: TestPost[]) {
    for (const post of posts) {
      await this.createPost(post);
    }
  }

  async deleteAllPosts() {
    // Navigate to post list
    await this.page.goto('/admin/post');
    await this.page.waitForLoadState('networkidle');

    // Check if there are any posts
    const rowCount = await this.listPage.getRowCount();
    if (rowCount === 0) {
      return;
    }

    // Select all and delete
    await this.listPage.selectAllRows();
    await this.listPage.clickBulkAction('Delete Selected');

    // Confirm deletion
    await this.page.getByRole('button', { name: /confirm|yes/i }).click();

    // Wait for deletion to complete
    await this.page.waitForTimeout(1000);
  }
}

export function getTestPosts(): TestPost[] {
  return [
    { title: 'Published Post 1', published: true },
    { title: 'Published Post 2', published: true },
    { title: 'Draft Post 1', published: false },
    { title: 'Draft Post 2', published: false },
    { title: 'Draft Post 3', published: false },
  ];
}

export class TestDataGenerator {
  private static counter = 0;

  static getUniqueId(): number {
    return Date.now() + TestDataGenerator.counter++;
  }

  static generateUser() {
    const id = TestDataGenerator.getUniqueId();
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
          },
        ],
      },
    };
  }

  static generatePost() {
    const id = TestDataGenerator.getUniqueId();
    return {
      title: `Test Post ${id}`,
      content: `This is test content for post ${id}. Lorem ipsum dolor sit amet.`,
      published: Math.random() > 0.5,
      jsonField: {
        key: `value-${id}`,
        nested: {
          data: `nested-${id}`,
        },
      },
    };
  }

  static generateRandomString(length = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test-${TestDataGenerator.generateRandomString(8)}@example.com`;
  }

  static generateRandomDate(
    start: Date = new Date(2020, 0, 1),
    end: Date = new Date()
  ): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  static generateJsonData() {
    const id = TestDataGenerator.getUniqueId();
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
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
}
