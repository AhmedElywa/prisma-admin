import { extendType, stringArg } from '@nexus/schema';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { NexusGenRootTypes } from 'generated/nexus-typegen';
import './schema.json';

interface Db {
  models: NexusGenRootTypes['Model'][];
  enums: NexusGenRootTypes['Enum'][];
}

const adapter = new FileSync<Db>('src/Api/graphql/schema/schema.json');
const db = low(adapter);

export const SchemaQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('getSchema', {
      type: 'Schema',
      resolve: async () => {
        return db.value();
      },
    });
  },
});

export const SchemaMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateModel', {
      type: 'Model',
      args: {
        id: stringArg({ nullable: false }),
        data: 'UpdateModelInput',
      },
      resolve: async (_, { id, data }) => {
        return db.get('models').find({ id }).assign(data).write();
      },
    });
    t.field('updateField', {
      type: 'Field',
      args: {
        id: stringArg({ nullable: false }),
        modelId: stringArg({ nullable: false }),
        data: 'UpdateFieldInput',
      },
      resolve: async (_, { id, modelId, data }) => {
        return db.get('models').find({ id: modelId }).get('fields').find({ id }).assign(data).write();
      },
    });
  },
});