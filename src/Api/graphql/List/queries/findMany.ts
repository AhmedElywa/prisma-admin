import { queryField, arg, nonNull, list } from 'nexus'

export const ListFindManyQuery = queryField('findManyList', {
  type: nonNull(list(nonNull('List'))),
  args: {
    where: 'ListWhereInput',
    orderBy: list(arg({ type: 'ListOrderByInput' })),
    cursor: 'ListWhereUniqueInput',
    distinct: 'ListScalarFieldEnum',
    skip: 'Int',
    take: 'Int',
  },
  resolve(_parent, args, { prisma, select }) {
    return prisma.list.findMany({
      ...args,
      ...select,
    })
  },
})
