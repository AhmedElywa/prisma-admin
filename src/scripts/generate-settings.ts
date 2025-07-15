import path from 'node:path';
import { mergeAdminSettings } from '../lib/admin/generator';

async function main() {
  try {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const settingsPath = path.join(process.cwd(), 'adminSettings.json');

    await mergeAdminSettings(schemaPath, settingsPath);
  } catch (_error) {
    process.exit(1);
  }
}

main();
