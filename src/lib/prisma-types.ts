// Prisma Where Input types
export type StringFilter = {
  equals?: string
  in?: string[]
  notIn?: string[]
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  not?: string | StringFilter
  mode?: 'default' | 'insensitive' | 'sensitive'
}

export type IntFilter = {
  equals?: number
  in?: number[]
  notIn?: number[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: number | IntFilter
}

export type FloatFilter = {
  equals?: number
  in?: number[]
  notIn?: number[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: number | FloatFilter
}

export type BoolFilter = {
  equals?: boolean
  not?: boolean | BoolFilter
}

export type DateTimeFilter = {
  equals?: Date | string
  in?: (Date | string)[]
  notIn?: (Date | string)[]
  lt?: Date | string
  lte?: Date | string
  gt?: Date | string
  gte?: Date | string
  not?: Date | string | DateTimeFilter
}

export type JsonFilter = {
  equals?: any
  not?: any
  string_contains?: string
  string_starts_with?: string
  string_ends_with?: string
  array_contains?: any
  array_starts_with?: any
  array_ends_with?: any
  lt?: any
  lte?: any
  gt?: any
  gte?: any
  path?: string[]
  mode?: 'default' | 'insensitive' | 'sensitive'
}

// Relation filters
export type RelationFilter<T> = {
  is?: T | null
  isNot?: T | null
}

export type ListRelationFilter<T> = {
  every?: T
  some?: T
  none?: T
}

// Generic where input
export type WhereInput = {
  AND?: WhereInput | WhereInput[]
  OR?: WhereInput[]
  NOT?: WhereInput | WhereInput[]
} & {
  [key: string]: 
    | string 
    | number 
    | boolean 
    | Date 
    | null
    | StringFilter
    | IntFilter
    | FloatFilter
    | BoolFilter
    | DateTimeFilter
    | JsonFilter
    | RelationFilter<any>
    | ListRelationFilter<any>
    | WhereInput
    | WhereInput[]
    | undefined
}

// Select input
export type SelectInput = {
  [key: string]: boolean | SelectInput
}

// Order by input
export type OrderByInput = {
  [key: string]: 'asc' | 'desc' | OrderByInput
}

// Generic Prisma args
export interface PrismaFindManyArgs {
  where?: WhereInput
  orderBy?: OrderByInput | OrderByInput[]
  skip?: number
  take?: number
  select?: SelectInput
  include?: SelectInput
}

export interface PrismaFindUniqueArgs {
  where: { [key: string]: any }
  select?: SelectInput
  include?: SelectInput
}

export interface PrismaCreateArgs {
  data: any
  select?: SelectInput
  include?: SelectInput
}

export interface PrismaUpdateArgs {
  where: { [key: string]: any }
  data: any
  select?: SelectInput
  include?: SelectInput
}

export interface PrismaDeleteArgs {
  where: { [key: string]: any }
}

export interface PrismaDeleteManyArgs {
  where?: WhereInput
}

// Model delegate type
export interface PrismaModelDelegate<T = any> {
  findMany(args?: PrismaFindManyArgs): Promise<T[]>
  findUnique(args: PrismaFindUniqueArgs): Promise<T | null>
  findFirst(args?: PrismaFindManyArgs): Promise<T | null>
  create(args: PrismaCreateArgs): Promise<T>
  update(args: PrismaUpdateArgs): Promise<T>
  delete(args: PrismaDeleteArgs): Promise<T>
  deleteMany(args?: PrismaDeleteManyArgs): Promise<{ count: number }>
  count(args?: { where?: WhereInput }): Promise<number>
}