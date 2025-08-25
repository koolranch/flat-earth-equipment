# Phase 4 — Fault Codes API & Hub Integration

## Overview
Phase 4 adds comprehensive fault code search functionality to brand hubs, including a robust API, user-friendly search interface, and expanded seed data for 5 major equipment brands.

## What We Added

### 🔍 Fault Codes Search API (`/api/fault-codes/search`)
- **Endpoint**: GET `/api/fault-codes/search?brand={slug}&code={code}&model={model}&limit={n}`
- **Validation**: Zod schema with proper error handling
- **Features**:
  - Brand-based fault code lookup
  - Optional code filtering (partial matches)
  - Model pattern matching with LIKE regex conversion
  - Retrieval steps selection (most specific pattern wins)
  - Severity-based sorting (info < warn < fault < stop)
  - Graceful handling when tables don't exist

### 🎨 Fault Search UI Components
- **`FaultSearch.tsx`**: Main search interface with form inputs and results
- **`FaultTable.tsx`**: Responsive table with severity badges and copy-to-clipboard
- **Features**:
  - Real-time search with loading states
  - Retrieval instructions card
  - Color-coded severity badges
  - One-click fault code copying
  - Mobile-responsive design

### 🔗 Brand Hub Integration
- **Enhanced Fault Tab**: Integrated search interface with explanatory content
- **Contextual Help**: Brand-specific instructions and disclaimers
- **Seamless UX**: Consistent with existing brand hub design patterns

### 📊 Analytics Integration
- **`fault_search`**: Tracks search queries with brand, code, model, and result count
- **`fault_copy_code`**: Tracks when users copy fault codes for reference
- **Privacy-Safe**: No sensitive data captured, only interaction patterns

### 📈 Expanded Seed Data
- **22 Total Fault Codes**: 4-5 codes per brand across 5 brands
- **7 Retrieval Procedures**: Brand and model-specific retrieval steps
- **Rich Data Structure**: Includes causes, checks, fixes, and severity levels
- **Professional Sourcing**: Starter set with disclaimer for official verification

---

## Data Structure

### Fault Codes CSV Format
```csv
brand,model_pattern,code,title,meaning,severity,likely_causes,checks,fixes,provenance
jlg,E450%,223,Drive Enable Timeout,Controller detected no drive enable,fault,"low battery|loose drive connector","measure pack voltage|inspect drive contactor","charge battery|replace contactor","Starter set; verify with official procedures"
```

### Retrieval Steps CSV Format
```csv
brand,model_pattern,steps
jlg,E450%,"From ground, press MENU then DIAG; read last 5 codes; note hours."
```

### API Response Structure
```json
{
  "brand": "jlg",
  "query": { "code": "223", "model": "E450AJ", "limit": 50 },
  "retrieval": {
    "brand": "jlg",
    "steps": "From ground, press MENU then DIAG...",
    "model_pattern": "E450%"
  },
  "count": 1,
  "items": [
    {
      "id": "uuid",
      "code": "223",
      "title": "Drive Enable Timeout",
      "meaning": "Controller detected no drive enable",
      "severity": "fault",
      "likely_causes": ["low battery", "loose drive connector"],
      "checks": ["measure pack voltage", "inspect drive contactor"],
      "fixes": ["charge battery", "replace contactor"],
      "model_pattern": "E450%",
      "provenance": "Starter set; verify with official procedures"
    }
  ],
  "disclaimer": "Informational starter set. Always confirm with official procedures before servicing."
}
```

---

## Verification Checklist

### ✅ API Testing

1. **Basic Search**:
   ```bash
   curl "https://www.flatearthequipment.com/api/fault-codes/search?brand=jlg&code=223"
   ```
   Expected: Returns fault code 223 for JLG with retrieval steps

2. **Model-Specific Search**:
   ```bash
   curl "https://www.flatearthequipment.com/api/fault-codes/search?brand=genie&model=GS-1930"
   ```
   Expected: Returns Genie codes with GS-1930 specific retrieval steps

3. **Error Handling**:
   ```bash
   curl "https://www.flatearthequipment.com/api/fault-codes/search"
   ```
   Expected: 400 error with validation details

4. **Table Not Found**:
   - Expected: Graceful degradation with informational message

### ✅ Brand Hub Fault Tab

1. **Navigation**:
   - Visit `/brand/jlg`
   - Click "Fault Codes & Retrieval" tab
   - Verify search interface loads

2. **Search Functionality**:
   - Enter fault code: "223"
   - Click "Search Faults"
   - Verify results table appears

3. **Retrieval Instructions**:
   - Verify retrieval card shows brand-specific instructions
   - Check for model-specific variations when applicable

4. **Table Interactions**:
   - Click "Copy code" button
   - Verify clipboard receives fault code
   - Check browser dev tools for analytics event

### ✅ Analytics Verification

1. **Vercel Analytics Dashboard**:
   - Monitor `fault_search` events
   - Track `fault_copy_code` interactions
   - Analyze user engagement patterns

2. **Event Data Structure**:
   ```javascript
   // fault_search event
   {
     brand: "jlg",
     code: "223", // or null
     model: "E450AJ", // or null  
     count: 1
   }
   
   // fault_copy_code event
   {
     brand: "jlg",
     code: "223"
   }
   ```

### ✅ Mobile & Accessibility

1. **Responsive Design**:
   - Test on mobile devices
   - Verify table horizontal scrolling
   - Check input field usability

2. **Accessibility**:
   - Keyboard navigation support
   - Screen reader compatibility
   - Color contrast compliance

### ✅ Performance & SEO

1. **Lighthouse Audit**:
   - Performance: 90+ score
   - Accessibility: 100 score
   - Best Practices: 90+ score
   - SEO: 100 score

2. **API Response Times**:
   - Initial load: <500ms
   - Search queries: <200ms
   - Error responses: <100ms

---

## Brand Coverage

### 🚁 JLG (5 Fault Codes)
- **Platform models**: E450%, ES%
- **Common codes**: 223, E045, C027, C035, C041
- **Retrieval**: Platform UP+DOWN hold, MENU→DIAG

### 🚁 Genie (5 Fault Codes)  
- **Scissor models**: GS%, GS-1930%
- **Boom models**: S%
- **Common codes**: 02, 31, 45, 36, 77
- **Retrieval**: Hold UP+DOWN on power, joystick toggles

### 🚛 Toyota (4 Fault Codes)
- **Forklift models**: 8F%, 7F%
- **Common codes**: E-BO, E-A5-1, E-31, E-210
- **Retrieval**: IG ON, hold DIAG

### 🚛 JCB (4 Fault Codes)
- **Telehandler models**: 535%, 540%
- **Common codes**: E524, E105, E485, E412
- **Retrieval**: Dash → Diagnostics menu

### 🚛 Hyster (4 Fault Codes)
- **Forklift models**: H50%, J%N%
- **Common codes**: 524251-4, 100-1, 524265-1, 524190-2
- **Retrieval**: Service menu, hold Info 5s

---

## Technical Implementation

### 🔧 API Architecture
- **Framework**: Next.js 14 API Routes
- **Validation**: Zod schema validation
- **Database**: Supabase with service role access
- **Caching**: No-store for real-time results
- **Error Handling**: Graceful degradation patterns

### 🎨 Component Architecture
- **State Management**: React useState hooks
- **Data Fetching**: Native fetch with error boundaries
- **Styling**: Tailwind CSS with design system tokens
- **Analytics**: Vercel Analytics integration
- **Accessibility**: ARIA labels and keyboard support

### 📊 Data Management
- **Storage**: CSV files in `/data/faults/`
- **Processing**: Replace-by-brand seeding strategy
- **Validation**: Schema enforcement at API level
- **Backup**: Git-tracked CSV files for version control

---

## Future Enhancements

### 🎯 Data Expansion
- **More Brands**: Cat, Crown, Clark, Bobcat coverage
- **Deeper Catalogs**: 20-50 codes per brand
- **Multimedia**: Diagnostic images and videos
- **Interactive Guides**: Step-by-step troubleshooting

### 📈 Advanced Features  
- **Fuzzy Search**: Typo-tolerant code matching
- **Saved Searches**: User search history
- **PDF Export**: Printable diagnostic reports
- **Offline Mode**: Service worker caching

### 🔧 Technical Improvements
- **Full-Text Search**: ElasticSearch or Algolia integration
- **Caching Layer**: Redis for high-frequency queries
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Real-Time Updates**: WebSocket for live data synchronization

---

## Rollback Plan

If issues arise with Phase 4:

1. **API Rollback**: Revert to previous `FaultCodeSearch` component
2. **UI Fallback**: Hide fault tabs with feature flag
3. **Data Recovery**: Re-run seeder with previous CSV versions
4. **Analytics Cleanup**: Remove tracking events if needed

All changes are additive and non-destructive to existing functionality.

---

## Support & Maintenance

### 📚 Data Updates
- **CSV Editing**: Direct file modification in `/data/faults/`
- **Reseeding**: Run `npm run seed:faults` after changes
- **Validation**: Built-in schema checks prevent bad data

### 🐛 Troubleshooting
- **API Issues**: Check Supabase service role keys
- **Missing Data**: Verify table existence and RLS policies
- **UI Problems**: Review component error boundaries
- **Analytics**: Confirm Vercel Analytics configuration

### 📊 Monitoring
- **Error Tracking**: API response monitoring
- **Usage Analytics**: Search query patterns
- **Performance**: Response time and success rates
- **User Feedback**: Support ticket analysis

**Phase 4 successfully transforms brand hubs into comprehensive diagnostic resources! 🎉**
