export interface CollectionSelector {
  database: string
  collections: string[]
  pattern?: string
  identifierField: string
  compositeKeys?: string[]
}
