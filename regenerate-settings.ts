import { mergeAdminSettings } from './src/lib/admin/generator';

async function regenerate() {
  try {
    await mergeAdminSettings();

    // Read and display a sample of the settings to verify
    const fs = await import('node:fs/promises');
    const settings = JSON.parse(
      await fs.readFile('./adminSettings.json', 'utf-8')
    );

    // Find a relation field to verify
    const postModel = settings.models.find((m: any) => m.id === 'Post');
    if (postModel) {
      const _authorField = postModel.fields.find(
        (f: any) => f.name === 'author'
      );
      const _tagsField = postModel.fields.find((f: any) => f.name === 'tags');
    }
  } catch (_error) {}
}

regenerate();
