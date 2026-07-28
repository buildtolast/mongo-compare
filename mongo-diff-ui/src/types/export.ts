export interface ExportConfig {
  format: 'json' | 'csv' | 'html'
  filename?: string
  includeMetadata?: boolean
}
