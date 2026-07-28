import type { ComparisonResult } from '@/types'

export interface ReportStatistics {
  createdCount: number
  updatedCount: number
  deletedCount: number
  totalCount: number
}

export class HtmlReportService {
  generateHTMLReport(result: ComparisonResult): string {
    const dataB64 = btoa(unescape(encodeURIComponent(JSON.stringify(result))))
    const timestamp = new Date(result.timestamp).toLocaleString()
    const stats = this.getReportStatistics(result)

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MongoDB Diff Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #1a1a2e;
      color: #eee;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 16px;
      color: #4ade80;
    }
    
    .header-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      font-size: 14px;
    }
    
    .meta-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 10px 16px;
      border-radius: 8px;
    }
    
    .meta-label {
      color: #888;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .meta-value {
      color: #eee;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .summary-card.created {
      border-left: 4px solid #4ade80;
    }
    
    .summary-card.updated {
      border-left: 4px solid #facc15;
    }
    
    .summary-card.deleted {
      border-left: 4px solid #f87171;
    }
    
    .summary-card .count {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .summary-card .created .count { color: #4ade80; }
    .summary-card .updated .count { color: #facc15; }
    .summary-card .deleted .count { color: #f87171; }
    
    .summary-card .label {
      color: #888;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .total-card {
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .total-card .total-count {
      font-size: 42px;
      font-weight: bold;
      color: #60a5fa;
      margin-bottom: 8px;
    }
    
    .total-card .label {
      color: #888;
      font-size: 14px;
    }
    
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: #0f172a;
    }
    
    .btn-secondary {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      color: #0f172a;
    }
    
    .btn-outline {
      background: transparent;
      border: 2px solid #4ade80;
      color: #4ade80;
    }
    
    .filter-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .filter-group input {
      padding: 8px 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #eee;
      font-size: 14px;
      min-width: 200px;
    }
    
    .filter-group input:focus {
      outline: none;
      border-color: #4ade80;
    }
    
    .diff-list {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .diff-header {
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .diff-header h2 {
      font-size: 18px;
      color: #eee;
    }
    
    .diff-section {
      padding: 24px;
    }
    
    .diff-section-title {
      font-size: 16px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .diff-item {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    
    .diff-item-header {
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s;
    }
    
    .diff-item-header:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .diff-item-header .identifier {
      font-family: 'Monaco', 'Consolas', monospace;
      color: #60a5fa;
      font-weight: 500;
    }
    
    .diff-item-header .type-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .type-added { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
    .type-removed { background: rgba(248, 113, 113, 0.2); color: #f87171; }
    .type-changed { background: rgba(250, 204, 21, 0.2); color: #facc15; }
    
    .diff-item-content {
      padding: 0 16px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .diff-item-content.expanded {
      max-height: 1000px;
      transition: max-height 0.3s ease;
    }
    
    .diff-content {
      padding: 16px 0;
    }
    
    .field-diff {
      display: grid;
      grid-template-columns: 1fr 2fr 2fr;
      gap: 12px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .field-path {
      font-family: 'Monaco', 'Consolas', monospace;
      color: #facc15;
      font-size: 13px;
      padding: 4px 8px;
      background: rgba(250, 204, 21, 0.1);
      border-radius: 4px;
    }
    
    .field-value {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      word-break: break-all;
    }
    
    .field-value.old {
      color: #f87171;
      text-decoration: line-through;
      background: rgba(248, 113, 113, 0.1);
    }
    
    .field-value.new {
      color: #4ade80;
      background: rgba(74, 222, 128, 0.1);
    }
    
    .side-by-side-viewer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    
    .viewer-panel {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .viewer-panel .panel-header {
      padding: 12px 16px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.05);
    }
    
    .viewer-panel .panel-header.source { color: #60a5fa; }
    .viewer-panel .panel-header.target { color: #4ade80; }
    
    .viewer-content {
      padding: 16px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .diff-list .empty {
      padding: 40px;
      text-align: center;
      color: #666;
    }
    
    .legend {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
    
    .legend-color.added { background: #4ade80; }
    .legend-color.removed { background: #f87171; }
    .legend-color.changed { background: #facc15; }
    .legend-color.neutral { background: #60a5fa; }
    
    .expand-all-btn,
    .collapse-all-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.1);
      color: #eee;
      transition: all 0.2s;
    }
    
    .expand-all-btn:hover,
    .collapse-all-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .sort-controls {
      display: flex;
      gap: 8px;
    }
    
    .sort-btn {
      padding: 6px 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      color: #eee;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    
    .sort-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .sort-btn.active {
      background: rgba(74, 222, 128, 0.2);
      border-color: #4ade80;
      color: #4ade80;
    }
    
    @media (max-width: 768px) {
      .header-meta {
        grid-template-columns: 1fr;
      }
      
      .summary {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .side-by-side-viewer {
        grid-template-columns: 1fr;
      }
      
      .field-diff {
        grid-template-columns: 1fr;
      }
      
      .controls {
        flex-direction: column;
      }
      
      .filter-group {
        width: 100%;
      }
      
      .filter-group input {
        width: 100%;
      }
    }
    
    @media (max-width: 480px) {
      .summary {
        grid-template-columns: 1fr;
      }
      
      .btn {
        width: 100%;
      }
    }
    
    .nested-fields {
      margin-top: 8px;
      padding-left: 16px;
      border-left: 2px solid rgba(255, 255, 255, 0.1);
    }
    
    .nested-field {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 11px;
    }
    
    .nested-field .path {
      color: #facc15;
    }
    
    .nested-field .old-val {
      color: #f87171;
    }
    
    .nested-field .new-val {
      color: #4ade80;
    }
    
    .toggle-expanded::before {
      content: '▼';
      display: inline-block;
      margin-right: 8px;
      transition: transform 0.2s;
    }
    
    .toggle-expanded.expanded::before {
      transform: rotate(180deg);
    }
    
    .no-differences {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .no-differences .icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .no-differences h3 {
      color: #888;
      font-size: 24px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 MongoDB Diff Report</h1>
      <div class="header-meta">
        <div class="meta-item">
          <div class="meta-label">Generated</div>
          <div class="meta-value">${timestamp}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Source Instance</div>
          <div class="meta-value">${result.sourceInstance}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Target Instance</div>
          <div class="meta-value">${result.targetInstance}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Source Database</div>
          <div class="meta-value">${result.sourceDatabase}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Target Database</div>
          <div class="meta-value">${result.targetDatabase}</div>
        </div>
      </div>
    </div>
    
    <div class="summary">
      <div class="summary-card created">
        <div class="count">${stats.createdCount}</div>
        <div class="label">Created</div>
      </div>
      <div class="summary-card updated">
        <div class="count">${stats.updatedCount}</div>
        <div class="label">Updated</div>
      </div>
      <div class="summary-card deleted">
        <div class="count">${stats.deletedCount}</div>
        <div class="label">Deleted</div>
      </div>
    </div>
    
    <div class="total-card">
      <div class="total-count">${stats.totalCount}</div>
      <div class="label">Total Differences</div>
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color added"></div>
        <span>Added (green)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color removed"></div>
        <span>Removed (red)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color changed"></div>
        <span>Changed (yellow)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color neutral"></div>
        <span>Neutral/Identifier</span>
      </div>
    </div>
    
    <div class="controls">
      <button class="btn btn-primary" id="download-report">📥 Download HTML Report</button>
      <button class="btn btn-secondary" id="open-browser">🌐 Open in Browser</button>
      <button class="btn btn-outline" id="expand-all">➕ Expand All</button>
      <button class="btn btn-outline" id="collapse-all">➖ Collapse All</button>
      <div class="filter-group">
        <input type="text" id="filter-diffs" placeholder="Filter differences...">
        <div class="sort-controls">
          <button class="sort-btn" data-sort="path">Path</button>
          <button class="sort-btn" data-sort="type">Type</button>
          <button class="sort-btn" data-sort="identifier">Identifier</button>
        </div>
      </div>
    </div>
    
    <div class="diff-list" id="diff-list">
      ${this.generateDiffSections(result)}
    </div>
  </div>
  
  <script>
    (function() {
      const data = JSON.parse(atob('${dataB64}'));
      
      function toggleExpanded(element) {
        const content = element.nextElementSibling;
        if (content) {
          content.classList.toggle('expanded');
          element.classList.toggle('expanded');
        }
      }
      
      function expandAll() {
        document.querySelectorAll('.diff-item-header').forEach(function(header) {
          const content = header.nextElementSibling;
          if (content) {
            content.classList.add('expanded');
            header.classList.add('expanded');
          }
        });
      }
      
      function collapseAll() {
        document.querySelectorAll('.diff-item-header').forEach(function(header) {
          const content = header.nextElementSibling;
          if (content) {
            content.classList.remove('expanded');
            header.classList.remove('expanded');
          }
        });
      }
      
      function filterDiffs() {
        const query = document.getElementById('filter-diffs').value.toLowerCase();
        const items = document.querySelectorAll('.diff-item');
        
        items.forEach(function(item) {
          const content = item.querySelector('.diff-content');
          const text = content ? content.innerText.toLowerCase() : '';
          if (text.includes(query)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      }
      
      function sortDiffs(criteria) {
        const list = document.getElementById('diff-list');
        const items = Array.from(list.querySelectorAll('.diff-item'));
        
        items.sort(function(a, b) {
          let valA, valB;
          
          if (criteria === 'path') {
            valA = a.querySelector('.field-path')?.innerText || '';
            valB = b.querySelector('.field-path')?.innerText || '';
          } else if (criteria === 'type') {
            valA = a.querySelector('.type-badge')?.innerText || '';
            valB = b.querySelector('.type-badge')?.innerText || '';
          } else if (criteria === 'identifier') {
            valA = a.querySelector('.identifier')?.innerText || '';
            valB = b.querySelector('.identifier')?.innerText || '';
          }
          
          return valA.localeCompare(valB);
        });
        
        items.forEach(function(item) {
          list.appendChild(item);
        });
      }
      
      document.getElementById('expand-all').addEventListener('click', expandAll);
      document.getElementById('collapse-all').addEventListener('click', collapseAll);
      document.getElementById('filter-diffs').addEventListener('input', filterDiffs);
      
      document.querySelectorAll('.sort-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.sort-btn').forEach(function(b) {
            b.classList.remove('active');
          });
          this.classList.add('active');
          sortDiffs(this.dataset.sort);
        });
      });
      
      document.querySelectorAll('.diff-item-header').forEach(function(header) {
        header.addEventListener('click', function() {
          toggleExpanded(this);
        });
      });
      
      document.getElementById('download-report').addEventListener('click', function() {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mongo-diff-report.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
      
      document.getElementById('open-browser').addEventListener('click', function() {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
      
      window.addEventListener('load', function() {
        collapseAll();
      });
    })();
  </script>
</body>
</html>`
  }

  generateDiffSections(result: ComparisonResult): string {
    const sections: string[] = []

    if (result.created.samples.length > 0) {
      sections.push(this.generateDiffSection('Created Documents', 'created', result.created.samples, 'added'))
    }

    if (result.updated.samples.length > 0) {
      sections.push(this.generateDiffSection('Updated Documents', 'updated', result.updated.samples, 'changed'))
    }

    if (result.deleted.samples.length > 0) {
      sections.push(this.generateDiffSection('Deleted Documents', 'deleted', result.deleted.samples, 'removed'))
    }

    if (sections.length === 0) {
      return `<div class="diff-section">
  <div class="diff-section-title">Differences</div>
  <div class="no-differences">
    <div class="icon">✅</div>
    <h3>No Differences Found</h3>
    <p>The source and target databases are identical.</p>
  </div>
</div>`
    }

    return sections.join('')
  }

  generateDiffSection(title: string, type: string, samples: unknown[], badgeType: string): string {
    return `<div class="diff-section">
  <div class="diff-section-title">${title}</div>
  ${samples.map((sample, index) => this.generateDiffItem(sample, badgeType)).join('')}
</div>`
  }

  generateDiffItem(sample: unknown, badgeType: string): string {
    const identifier = this.getIdentifier(sample)
    const changes = this.extractChanges(sample)
    
    let contentHtml = ''
    if (changes.length > 0) {
      contentHtml = changes.map(change => this.generateFieldDiff(change)).join('')
    } else {
      contentHtml = `<div style="font-family: 'Monaco', 'Consolas', monospace; font-size: 12px; background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; white-space: pre-wrap;">${this.escapeHtml(JSON.stringify(sample, null, 2))}</div>`
    }
    
    return `<div class="diff-item">
  <div class="diff-item-header toggle-expanded">
    <span class="identifier">${identifier}</span>
    <span class="type-badge type-${badgeType}">${badgeType}</span>
  </div>
  <div class="diff-item-content">
    <div class="diff-content">
      ${contentHtml}
    </div>
  </div>
</div>`
  }

  getIdentifier(sample: unknown): string {
    if (typeof sample === 'object' && sample !== null) {
      if ('identifier' in sample) {
        return String(sample.identifier)
      }
      if ('_id' in sample) {
        return String(sample._id)
      }
      return JSON.stringify(sample).substring(0, 50)
    }
    return String(sample)
  }

  extractChanges(sample: unknown): Array<{ path: string; oldValue: unknown; newValue: unknown; type: string }> {
    if (typeof sample === 'object' && sample !== null && 'changes' in sample) {
      return sample.changes as Array<{ path: string; oldValue: unknown; newValue: unknown; type: string }>
    }
    return []
  }

  generateFieldDiff(change: { path: string; oldValue: unknown; newValue: unknown; type: string }): string {
    const isAdded = change.type === 'added'
    const isRemoved = change.type === 'removed'
    const hasOldValue = !isAdded && change.oldValue !== null && change.oldValue !== undefined
    const hasNewValue = !isRemoved && change.newValue !== null && change.newValue !== undefined
    
    let html = `<div class="field-diff">
  <div class="field-path">${this.escapeHtml(change.path)}</div>`
    
    if (hasOldValue) {
      html += `<div class="field-value old">${this.formatValue(change.oldValue)}</div>`
    } else {
      html += `<div class="field-value old" style="opacity: 0.5">—</div>`
    }
    
    if (hasNewValue) {
      html += `<div class="field-value new">${this.formatValue(change.newValue)}</div>`
    } else {
      html += `<div class="field-value new" style="opacity: 0.5">—</div>`
    }
    
    html += `</div>`
    
    if (this.hasNestedChanges(change.oldValue) || this.hasNestedChanges(change.newValue)) {
      html += `<div class="nested-fields">
  ${this.generateNestedChanges(change.oldValue, change.newValue)}
</div>`
    }
    
    return html
  }

  hasNestedChanges(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  generateNestedChanges(oldValue: unknown, newValue: unknown): string {
    const changes: string[] = []
    
    if (typeof oldValue === 'object' && oldValue !== null) {
      for (const key of Object.keys(oldValue)) {
        const val = (oldValue as Record<string, unknown>)[key]
        if (!this.isPrimitive(val)) {
          changes.push(`<div class="nested-field">
    <span class="path">${key}</span>
    <span class="old-val">- ${this.formatValue(val)}</span>
  </div>`)
        }
      }
    }
    
    if (typeof newValue === 'object' && newValue !== null) {
      for (const key of Object.keys(newValue as Record<string, unknown>)) {
        const val = (newValue as Record<string, unknown>)[key]
        if (!this.isPrimitive(val)) {
          changes.push(`<div class="nested-field">
    <span class="path">${key}</span>
    <span class="new-val">+ ${this.formatValue(val)}</span>
  </div>`)
        }
      }
    }
    
    return changes.join('')
  }

  isPrimitive(value: unknown): boolean {
    return value === null || 
           value === undefined || 
           typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean'
  }

  formatValue(value: unknown): string {
    if (value === null) {
      return '<span style="color: #666">null</span>'
    }
    if (value === undefined) {
      return '<span style="color: #666">undefined</span>'
    }
    if (typeof value === 'string') {
      return this.escapeHtml(value)
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (Array.isArray(value)) {
      return `[${value.length} items]`
    }
    if (typeof value === 'object') {
      return `{${Object.keys(value).length} fields}`
    }
    return String(value)
  }

  escapeHtml(text: string): string {
    if (typeof document !== 'undefined' && document) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (char) => map[char])
  }

  getReportStatistics(result: ComparisonResult): ReportStatistics {
    return {
      createdCount: result.created.count,
      updatedCount: result.updated.count,
      deletedCount: result.deleted.count,
      totalCount: result.created.count + result.updated.count + result.deleted.count,
    }
  }

  getReportSize(result: ComparisonResult): number {
    const html = this.generateHTMLReport(result)
    return new TextEncoder().encode(html).length
  }

  exportReport(result: ComparisonResult): { download: string; href: string } {
    const html = this.generateHTMLReport(result)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    return {
      download: `mongo-diff-report-${this.formatTimestampForFilename(result.timestamp)}.html`,
      href: url,
    }
  }

  formatTimestampForFilename(timestamp: string): string {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`
  }
}
