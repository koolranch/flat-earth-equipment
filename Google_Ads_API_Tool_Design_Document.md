# Google Ads API Tool Design Document

## Organization
**Company Name:** Flat Earth Equipment  
**Contact Email:** flatearthequip@gmail.com  
**MCC Account ID:** 662-156-1929

---

## 1. Tool Overview

### Purpose
This tool integrates with the Google Ads API to provide internal campaign performance analysis and reporting for Flat Earth Equipment's advertising accounts.

### Functionality
- View campaign performance metrics (impressions, clicks, conversions, cost)
- Analyze ad creative performance
- Monitor keyword performance
- Generate custom reports using GAQL (Google Ads Query Language)
- Review account structure and settings

---

## 2. Technical Architecture

### Authentication Method
- **OAuth 2.0** for secure user authentication
- Desktop application flow with localhost redirect
- Credentials stored securely on local machine

### API Integration
- Uses Google Ads API v19 (REST)
- Read-only operations for reporting and analysis
- No automated campaign modifications

### Data Flow
```
User Request → MCP Server → Google Ads API → Response → User Display
```

---

## 3. Data Access & Usage

### Data Accessed
| Data Type | Purpose |
|-----------|---------|
| Campaign metrics | Performance analysis |
| Ad group data | Optimization insights |
| Keyword data | Search term analysis |
| Ad creative data | Creative performance review |
| Account settings | Configuration verification |

### Data Storage
- **No data is stored permanently**
- Data is fetched on-demand and displayed to the user
- No data is shared with third parties

### Data Retention
- Data is only held in memory during active sessions
- No persistent storage of Google Ads data

---

## 4. Use Case Scenarios

### Scenario 1: Campaign Performance Review
User requests campaign performance for the last 30 days to identify top-performing campaigns and optimization opportunities.

### Scenario 2: Ad Creative Analysis
User reviews ad headlines and descriptions to understand which messaging resonates best with the target audience.

### Scenario 3: Keyword Performance
User analyzes keyword performance to identify high-converting search terms and negative keyword opportunities.

---

## 5. Security Measures

- OAuth 2.0 authentication with Google's secure token flow
- Credentials stored locally, never transmitted to third parties
- No automated or bulk operations
- Single-user, desktop application use only
- Developer token restricted to authorized accounts

---

## 6. Rate Limiting & Best Practices

- Queries are made on-demand by user request only
- No automated polling or scheduled queries
- Results are limited (typically 50-200 records per query)
- Follows Google Ads API rate limiting guidelines

---

## 7. Compliance

- Tool is for internal business use only
- No resale or commercial distribution of data
- Complies with Google Ads API Terms of Service
- User data protected according to Google's policies

---

## 8. Contact Information

**Developer:** Flat Earth Equipment  
**Email:** flatearthequip@gmail.com  
**Google Ads Account:** 346-671-1027  
**Manager Account:** 662-156-1929

---

*Document Version: 1.0*  
*Date: January 2026*
