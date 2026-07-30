import type { ComparisonResult } from '@/types'

export interface ConnectionConfig {
  connectionString: string
  username?: string
  password?: string
  authDatabase?: string
  tls?: boolean
  poolSize?: number
  connectTimeoutMS?: number
  socketTimeoutMS?: number
  serverSelectionTimeoutMS?: number
}

export interface TestConnectionRequest {
  connectionString: string
  username?: string
  password?: string
  authDatabase?: string
  tls?: boolean
}

export interface TestConnectionResponse {
  success: boolean
  message: string
}

export interface GetDatabasesRequest {
  connectionString: string
}

export interface GetDatabasesResponse {
  success: boolean
  databases: string[]
}

export interface GetCollectionsRequest {
  connectionString: string
  database: string
}

export interface GetCollectionsResponse {
  success: boolean
  collections: string[]
}

export interface GetSampleDocumentsRequest {
  connectionString: string
  database: string
  collection: string
  limit?: number
}

export interface GetSampleDocumentsResponse {
  success: boolean
  documents: Record<string, unknown>[]
}

export interface RunComparisonRequest {
  source: ConnectionConfig
  target: ConnectionConfig
  database: string
  collections: string[]
  identifierField?: string
  sampleLimit?: number
}

export interface RunComparisonResponse {
  success: boolean
  result: ComparisonResult
}

const API_BASE_URL = '/api'

const apiRequest = async <T, R>(endpoint: string, body: T): Promise<R> => {
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export const testConnection = async (
  config: TestConnectionRequest
): Promise<TestConnectionResponse> => {
  return apiRequest<TestConnectionRequest, TestConnectionResponse>(
    '/api/test-connection',
    config
  )
}

export const getDatabases = async (
  req: GetDatabasesRequest
): Promise<GetDatabasesResponse> => {
  return apiRequest<GetDatabasesRequest, GetDatabasesResponse>(
    '/api/get-databases',
    req
  )
}

export const getCollections = async (
  req: GetCollectionsRequest
): Promise<GetCollectionsResponse> => {
  return apiRequest<GetCollectionsRequest, GetCollectionsResponse>(
    '/api/get-collections',
    req
  )
}

export const getSampleDocuments = async (
  req: GetSampleDocumentsRequest
): Promise<GetSampleDocumentsResponse> => {
  return apiRequest<GetSampleDocumentsRequest, GetSampleDocumentsResponse>(
    '/api/get-sample-documents',
    req
  )
}

export const runComparison = async (
  req: RunComparisonRequest
): Promise<RunComparisonResponse> => {
  return apiRequest<RunComparisonRequest, RunComparisonResponse>(
    '/api/run-comparison',
    req
  )
}
