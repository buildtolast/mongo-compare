import type { ChangedField, ComparisonResult, DocumentDiff } from '@/types'

export enum DiffStrategy {
  All,
  Whitelist,
  Blacklist,
  DeepEquality,
}

export interface DiffEngineOptions {
  sampleLimit?: number
}

export class DiffEngine {
  compare(
    sourceDocs: Record<string, unknown>[],
    targetDocs: Record<string, unknown>[],
    identifierField: string | string[],
    strategy: DiffStrategy,
    fields: string[] = [],
    sampleLimit: number = 0
  ): ComparisonResult {
    const identifierFields = Array.isArray(identifierField) ? identifierField : [identifierField]
    
    const sourceMap = this.indexByIdentifier(sourceDocs, identifierFields)
    const targetMap = this.indexByIdentifier(targetDocs, identifierFields)
    
    const createdDocs: Record<string, unknown>[] = []
    const updatedDocs: DocumentDiff[] = []
    const deletedDocs: Record<string, unknown>[] = []
    
    const targetIds = new Set(Object.keys(targetMap))
    
    let deletedCount = 0
    for (const id of Object.keys(sourceMap)) {
      if (!targetIds.has(id)) {
        deletedCount++
        if (sampleLimit === 0 || deletedDocs.length < sampleLimit) {
          deletedDocs.push(sourceMap[id])
        }
      }
    }
    
    let createdCount = 0
    let updatedCount = 0
    for (const id of Object.keys(targetMap)) {
      const targetDoc = targetMap[id]
      
      if (!sourceMap.hasOwnProperty(id)) {
        createdCount++
        if (sampleLimit === 0 || createdDocs.length < sampleLimit) {
          createdDocs.push(targetDoc)
        }
      } else {
        const sourceDoc = sourceMap[id]
        const diff = this.findFieldDiffs(
          sourceDoc,
          targetDoc,
          identifierFields,
          strategy,
          fields
        )
        
        if (diff.changes.length > 0) {
          updatedCount++
          if (sampleLimit === 0 || updatedDocs.length < sampleLimit) {
            updatedDocs.push({
              identifier: this.getIdentifierValue(targetDoc, identifierFields),
              changes: diff.changes,
            })
          }
        }
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      sourceInstance: '',
      targetInstance: '',
      sourceDatabase: '',
      targetDatabase: '',
      created: {
        count: createdCount,
        samples: sampleLimit > 0 ? createdDocs.slice(0, sampleLimit) : createdDocs,
      },
      updated: {
        count: updatedCount,
        samples: sampleLimit > 0 ? updatedDocs.slice(0, sampleLimit) : updatedDocs,
      },
      deleted: {
        count: deletedCount,
        samples: sampleLimit > 0 ? deletedDocs.slice(0, sampleLimit) : deletedDocs,
      },
    }
  }
  
  private indexByIdentifier(
    docs: Record<string, unknown>[],
    identifierFields: string[]
  ): Record<string, Record<string, unknown>> {
    const map: Record<string, Record<string, unknown>> = {}
    
    for (const doc of docs) {
      const id = this.getIdentifierValue(doc, identifierFields)
      if (id) {
        map[id] = doc
      }
    }
    
    return map
  }
  
  private getIdentifierValue(
    doc: Record<string, unknown>,
    identifierFields: string[]
  ): string {
    const values = identifierFields.map(field => {
      const value = doc[field]
      return value !== undefined && value !== null ? String(value) : ''
    })
    return values.join('|')
  }
  
  private findFieldDiffs(
    sourceDoc: Record<string, unknown>,
    targetDoc: Record<string, unknown>,
    identifierFields: string[],
    strategy: DiffStrategy,
    fields: string[]
  ): { changes: ChangedField[] } {
    const changes: ChangedField[] = []
    
    switch (strategy) {
      case DiffStrategy.All:
        this.diffAllFields(sourceDoc, targetDoc, [], changes, identifierFields)
        break
      case DiffStrategy.Whitelist:
        this.diffWhitelistFields(sourceDoc, targetDoc, [], changes, identifierFields, fields)
        break
      case DiffStrategy.Blacklist:
        this.diffBlacklistFields(sourceDoc, targetDoc, [], changes, identifierFields, fields)
        break
      case DiffStrategy.DeepEquality:
        this.diffDeepEquality(sourceDoc, targetDoc, [], changes, identifierFields)
        break
    }
    
    return { changes }
  }
  
  private diffAllFields(
    sourceDoc: Record<string, unknown>,
    targetDoc: Record<string, unknown>,
    path: string[],
    changes: ChangedField[],
    identifierFields: string[]
  ): void {
    const allKeys = new Set([
      ...Object.keys(sourceDoc),
      ...Object.keys(targetDoc),
    ])
    
    for (const key of allKeys) {
      if (identifierFields.includes(key)) {
        continue
      }
      
      const currentValue = targetDoc[key]
      const previousValue = sourceDoc[key]
      
      if (previousValue === undefined) {
        if (currentValue !== undefined && !this.isObject(currentValue)) {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: null,
            newValue: currentValue,
            type: 'added',
          })
        }
      } else if (currentValue === undefined) {
        if (!this.isObject(previousValue)) {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: previousValue,
            newValue: null,
            type: 'removed',
          })
        }
      } else if (!this.jsonEqual(previousValue, currentValue)) {
        if (this.isObject(previousValue) && this.isObject(currentValue)) {
          this.diffAllFields(
            previousValue as Record<string, unknown>,
            currentValue as Record<string, unknown>,
            [...path, key],
            changes,
            identifierFields
          )
        } else {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: previousValue,
            newValue: currentValue,
            type: 'changed',
          })
        }
      }
    }
  }
  
  private diffWhitelistFields(
    sourceDoc: Record<string, unknown>,
    targetDoc: Record<string, unknown>,
    path: string[],
    changes: ChangedField[],
    identifierFields: string[],
    fields: string[]
  ): void {
    for (const field of fields) {
      if (identifierFields.includes(field)) {
        continue
      }
      
      const valueBefore = this.getNestedValue(sourceDoc, field)
      const valueAfter = this.getNestedValue(targetDoc, field)
      
      if (valueBefore !== undefined && valueAfter !== undefined) {
        if (!this.jsonEqual(valueBefore, valueAfter)) {
          if (this.isObject(valueBefore) && this.isObject(valueAfter)) {
            this.diffWhitelistFields(
              valueBefore as Record<string, unknown>,
              valueAfter as Record<string, unknown>,
              [...path, field],
              changes,
              identifierFields,
              fields
            )
          } else {
            changes.push({
              path: [...path, field].join('.'),
              oldValue: valueBefore,
              newValue: valueAfter,
              type: 'changed',
            })
          }
        }
      } else if (valueBefore === undefined && valueAfter !== undefined) {
        if (!this.isObject(valueAfter)) {
          changes.push({
            path: [...path, field].join('.'),
            oldValue: null,
            newValue: valueAfter,
            type: 'added',
          })
        }
      }
    }
  }
  
  private diffBlacklistFields(
    sourceDoc: Record<string, unknown>,
    targetDoc: Record<string, unknown>,
    path: string[],
    changes: ChangedField[],
    identifierFields: string[],
    blacklist: string[]
  ): void {
    const allKeys = new Set([
      ...Object.keys(sourceDoc),
      ...Object.keys(targetDoc),
    ])
    
    for (const key of allKeys) {
      if (identifierFields.includes(key) || blacklist.includes(key)) {
        continue
      }
      
      const currentValue = targetDoc[key]
      const previousValue = sourceDoc[key]
      
      if (previousValue === undefined) {
        if (currentValue !== undefined && !this.isObject(currentValue)) {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: null,
            newValue: currentValue,
            type: 'added',
          })
        }
      } else if (currentValue === undefined) {
        if (!this.isObject(previousValue)) {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: previousValue,
            newValue: null,
            type: 'removed',
          })
        }
      } else if (!this.jsonEqual(previousValue, currentValue)) {
        if (this.isObject(previousValue) && this.isObject(currentValue)) {
          this.diffBlacklistFields(
            previousValue as Record<string, unknown>,
            currentValue as Record<string, unknown>,
            [...path, key],
            changes,
            identifierFields,
            blacklist
          )
        } else {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: previousValue,
            newValue: currentValue,
            type: 'changed',
          })
        }
      }
    }
  }
  
  private diffDeepEquality(
    sourceDoc: Record<string, unknown>,
    targetDoc: Record<string, unknown>,
    path: string[],
    changes: ChangedField[],
    identifierFields: string[]
  ): void {
    const allKeys = new Set([
      ...Object.keys(sourceDoc),
      ...Object.keys(targetDoc),
    ])
    
    for (const key of allKeys) {
      if (identifierFields.includes(key)) {
        continue
      }
      
      const currentValue = targetDoc[key]
      const previousValue = sourceDoc[key]
      
      if (previousValue === undefined) {
        if (currentValue !== undefined && !this.isObject(currentValue)) {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: null,
            newValue: currentValue,
            type: 'added',
          })
        }
      } else if (currentValue === undefined) {
        if (!this.isObject(previousValue)) {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: previousValue,
            newValue: null,
            type: 'removed',
          })
        }
      } else if (!this.jsonEqual(previousValue, currentValue)) {
        if (this.isObject(previousValue) && this.isObject(currentValue)) {
          continue
        } else {
          changes.push({
            path: [...path, key].join('.'),
            oldValue: previousValue,
            newValue: currentValue,
            type: 'changed',
          })
        }
      }
    }
  }
  
  private getNestedValue(doc: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.')
    let current: unknown = doc
    
    for (const part of parts) {
      if (current === undefined || current === null || !this.isObject(current)) {
        return undefined
      }
      current = (current as Record<string, unknown>)[part]
    }
    
    return current
  }
  
  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
  
  private jsonEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
      return true
    }
    
    if (a === null || b === null || typeof a !== typeof b) {
      return false
    }
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (!this.jsonEqual(a[i], b[i])) {
          return false
        }
      }
      return true
    }
    
    if (this.isObject(a) && this.isObject(b)) {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      
      if (keysA.length !== keysB.length) {
        return false
      }
      
      for (const key of keysA) {
        if (!keysB.includes(key) || !this.jsonEqual(a[key], b[key])) {
          return false
        }
      }
      
      return true
    }
    
    return false
  }
}
