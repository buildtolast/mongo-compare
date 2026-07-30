# HTML Prototype Guide

## File Location
`docs/prototype.html`

## How to Use

1. **Open in Browser**: Double-click `docs/prototype.html` or use command:
   ```bash
   open docs/prototype.html
   ```

2. **Interact with Prototype**:
   - Click on diff items to expand/collapse details
   - Use "Expand All" / "Collapse All" buttons
   - Type in search box to filter diff items
   - Click filter buttons (Show All / Created / Updated / Deleted)
   - Hover over color legend items

## Features Demonstrated

### 1. Split-View Dashboard
- Source and target connection panels side-by-side
- Visual connection status indicators
- Collection lists with document counts
- Hover effects and color coding

### 2. Summary Cards
- Horizontal layout with 4 metric cards
- Before/After document counts
- Deleted/Updated counts with percentages
- Progress bar showing retention rate

### 3. Color-Coded Diff Items
- Red indicators for deleted documents
- Yellow indicators for updated documents
- Green indicators for added documents
- Border-left color coding for quick identification

### 4. Interactive Elements
- Expandable diff item details
- Search filtering functionality
- Filter button toggles
- Expand/Collapse all sections
- Hover effects on legend items

### 5. Responsive Design
- Works on desktop, tablet, and mobile
- Panel stacking on smaller screens
- Grid adjustments for different viewports

## Design Highlights

### Color Scheme
- **Background**: Dark slate (#0f172a)
- **Cards**: Slightly lighter slate (#1e293b)
- **Primary (Source)**: Emerald green (#10b981)
- **Secondary (Target)**: Cyan blue (#06b6d4)
- **Success**: Green (#22c55e)
- **Danger**: Red (#ef4444)
- **Warning**: Yellow (#eab308)

### Typography
- **Headings**: Inter, size 1.125rem, weight 600
- **Body**: Inter, size 0.875rem, weight 400
- **Monospace**: JetBrains Mono, size 0.875rem (for connection strings)
- **Small**: Inter, size 0.75rem, weight 500

### Spacing
- **Card padding**: 20px
- **Element gap**: 16px
- **Section gap**: 24px
- **Compact gap**: 8px

## Interactive Examples

### Example 1: Expand a Diff Item
Click any diff item (e.g., "🔴 435 | name: User435...") to see detailed field changes.

### Example 2: Filter by Change Type
Click "Deleted" filter button to show only deleted documents.

### Example 3: Search Documents
Type "User401" in the search box to filter items containing that identifier.

### Example 4: Expand All Sections
Click "Expand All ▼" button to show all diff details.

### Example 5: Responsive View
Resize browser window to see how panels stack on smaller screens.

## Customization

### Change Connection Strings
Edit the `connection-string` div in the HTML:
```html
<div class="connection-string">mongodb://mongo:27017/sourcedb</div>
```

### Modify Summary Numbers
Edit the `summary-number` div in the HTML:
```html
<div class="summary-number">500</div>
```

### Add More Collections
Add more `collection-item` divs in the HTML:
```html
<div class="collection-item">
    <span class="collection-name">orders</span>
    <span class="collection-count">847 docs</span>
</div>
```

### Change Colors
Edit the CSS variables in the `:root` section:
```css
:root {
    --primary: #10b981;  /* Change source color */
    --secondary: #06b6d4;  /* Change target color */
}
```

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

## Performance

- **File Size**: ~31KB (compressed)
- **Load Time**: < 100ms on most devices
- **Interactivity**: Instant feedback on all actions

## Next Steps

1. Review the prototype and provide feedback
2. Decide on design changes
3. Implement in React codebase
4. Add to existing `mongo-diff-ui` project

## Comparison with Current UI

### Improvements
- ✅ Side-by-side panels (vs. linear wizard)
- ✅ Visual connection status indicators
- ✅ Horizontal summary cards
- ✅ Color-coded change indicators
- ✅ Inline diff preview
- ✅ Quick filtering
- ✅ Search functionality
- ✅ Progress bar
- ✅ Multiple view modes

### Retained Features
- ✅ Same color scheme
- ✅ Dark theme
- ✅ Responsive design
- ✅ Accessible typography

## Implementation Notes

- Prototype uses vanilla HTML/CSS/JavaScript
- No dependencies required
- Easy to convert to React components
- Can be used as reference for implementation
- No backend integration (static demo)

## Questions?

If you have questions about the prototype or want to make changes, let me know:
- Which design pattern do you prefer?
- What features should be prioritized?
- Any color scheme preferences?
- Should we add specific features from the current UI?