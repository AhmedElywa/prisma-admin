import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getModelData } from '@/lib/actions/crud';
import {
  getColumnType,
  getModelSettings,
  getTableFields,
} from '@/lib/admin/settings';
import { DataTable } from './data-table';
import { InlineCreateForm } from './inline-create-form';

interface RelationTabsProps {
  parentModel: string;
  parentId: string | number;
  relations: Array<{
    model: string;
    field: string;
    label: string;
    type: 'one-to-many' | 'many-to-many';
  }>;
}

export async function RelationTabs({
  parentModel,
  parentId,
  relations,
}: RelationTabsProps) {
  if (relations.length === 0) {
    return null;
  }

  // Load data for each relation
  const relationsWithData = await Promise.all(
    relations.map(async (relation) => {
      try {
        // Get table fields for the related model
        const fields = await getTableFields(relation.model);

        // Build columns configuration
        const columns = fields.map((field) => ({
          key: field.name,
          label: field.title,
          type: getColumnType(field),
          sortable: field.sort,
        }));

        // Get the related model to determine the relation field type
        const relatedModelSettings = await getModelSettings(relation.model);
        const relationField = relatedModelSettings?.fields.find(
          (f) => f.name === relation.field
        );

        // Convert parentId based on relation field type
        let convertedId: any = parentId;
        if (relationField?.type === 'Int' || relationField?.type === 'BigInt') {
          convertedId = Number.parseInt(parentId.toString(), 10);
        }

        // Get related data
        const { data, totalCount, page, perPage, totalPages } =
          await getModelData(relation.model, {
            page: 1,
            perPage: 10,
            filters: [
              {
                field: relation.field,
                operator: 'equals',
                value: convertedId,
                type: 'relation',
              },
            ],
          });

        return {
          ...relation,
          columns,
          data,
          totalCount,
          page,
          perPage,
          totalPages,
        };
      } catch (_error) {
        return {
          ...relation,
          columns: [],
          data: [],
          totalCount: 0,
          page: 1,
          perPage: 10,
          totalPages: 0,
        };
      }
    })
  );

  if (relations.length === 1) {
    // Single relation - no tabs needed
    const relation = relationsWithData[0];
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{relation.label}</CardTitle>
            <CardDescription>
              {relation.totalCount} related {relation.model.toLowerCase()}{' '}
              record{relation.totalCount !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Add {relation.model}</DialogTitle>
                  <DialogDescription>
                    Create a new {relation.model.toLowerCase()} linked to this{' '}
                    {parentModel.toLowerCase()}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <InlineCreateForm
                    modelName={relation.model}
                    parentField={relation.field}
                    parentId={parentId}
                    parentModel={parentModel}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Link
              href={`/admin/${relation.model.toLowerCase()}/new?${relation.field}=${parentId}`}
            >
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add {relation.model}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {relation.totalCount === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No {relation.model.toLowerCase()} records found</p>
              <p className="mt-1 text-sm">
                Create your first one using the button above
              </p>
            </div>
          ) : (
            <DataTable
              canDelete={true}
              canEdit={true}
              columns={relation.columns}
              compact={true}
              currentPage={relation.page}
              data={relation.data}
              itemsPerPage={relation.perPage}
              modelName={relation.model}
              totalItems={relation.totalCount}
              totalPages={relation.totalPages}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  // Multiple relations - use tabs
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Records</CardTitle>
        <CardDescription>
          Manage related data for this {parentModel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs className="w-full" defaultValue={relations[0].model}>
          <TabsList className={`grid w-full grid-cols-${relations.length}`}>
            {relationsWithData.map((relation) => (
              <TabsTrigger key={relation.model} value={relation.model}>
                {relation.label} ({relation.totalCount})
              </TabsTrigger>
            ))}
          </TabsList>

          {relationsWithData.map((relation) => (
            <TabsContent
              className="mt-4"
              key={relation.model}
              value={relation.model}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  {relation.totalCount} record
                  {relation.totalCount !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Quick Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add {relation.model}</DialogTitle>
                        <DialogDescription>
                          Create a new {relation.model.toLowerCase()} linked to
                          this {parentModel.toLowerCase()}
                        </DialogDescription>
                      </DialogHeader>
                      <InlineCreateForm
                        modelName={relation.model}
                        parentField={relation.field}
                        parentId={parentId}
                        parentModel={parentModel}
                      />
                    </DialogContent>
                  </Dialog>
                  <Link
                    href={`/admin/${relation.model.toLowerCase()}/new?${relation.field}=${parentId}`}
                  >
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add {relation.model}
                    </Button>
                  </Link>
                </div>
              </div>

              {relation.totalCount === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No {relation.model.toLowerCase()} records found</p>
                  <p className="mt-1 text-sm">
                    Create your first one using the button above
                  </p>
                </div>
              ) : (
                <DataTable
                  canDelete={true}
                  canEdit={true}
                  columns={relation.columns}
                  compact={true}
                  currentPage={relation.page}
                  data={relation.data}
                  itemsPerPage={relation.perPage}
                  modelName={relation.model}
                  totalItems={relation.totalCount}
                  totalPages={relation.totalPages}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
