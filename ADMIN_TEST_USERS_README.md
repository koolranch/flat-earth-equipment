# Admin Test User Creation API

A secure server-only API for quickly provisioning QA/test learner accounts with magic login links for development and testing workflows.

## 🔐 Security

- **Protected Route**: Requires `x-admin-token` header matching `ADMIN_EXPORT_TOKEN` environment variable
- **Server-Only**: Uses `supabaseService()` with service role permissions
- **No Key Leaks**: All sensitive operations are server-side only

## 🚀 Quick Start

### Environment Setup

```bash
# Required: Admin token for API access
ADMIN_EXPORT_TOKEN=your-secure-admin-token-here

# Optional: Default redirect URL for magic links
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Basic Usage

```bash
# Create simple test user
curl -X POST http://localhost:3000/api/admin/dev/create-test-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

## 📋 API Reference

### POST `/api/admin/dev/create-test-user`

Creates or retrieves a test user account with optional org membership and course enrollment.

#### Headers

```
Content-Type: application/json
x-admin-token: {ADMIN_EXPORT_TOKEN}
```

#### Request Body

```typescript
{
  email: string;           // Required: User email address
  password?: string;       // Optional: User password (min 6 chars)
  orgId?: string;         // Optional: Organization UUID to join
  courseId?: string;      // Optional: Course UUID to enroll in (requires orgId)
  role?: 'owner' | 'trainer' | 'learner'; // Optional: Org role (default: learner)
  redirectTo?: string;    // Optional: Magic link redirect URL
}
```

#### Response (Success - 201)

```typescript
{
  ok: true;
  userId: string;         // Supabase user ID
  email: string;          // User email
  enrollmentId: string | null;  // Enrollment ID if course provided
  magicLink: string;      // One-click login URL
  orgInfo: {              // Org details if orgId provided
    id: string;
    name: string;
  } | null;
  courseInfo: {           // Course details if courseId provided
    id: string;
    title: string;
  } | null;
  role: string | null;    // Assigned org role
  duration: string;       // Processing time
}
```

#### Response (Error - 400/401)

```typescript
{
  error: string;          // Error message
  duration?: string;      // Processing time
}
```

### GET `/api/admin/dev/create-test-user`

Health check endpoint for verifying API availability and configuration.

#### Response

```typescript
{
  ok: true;
  service: 'create-test-user';
  timestamp: string;      // ISO timestamp
  env: {
    hasAdminToken: boolean;
    siteUrl: string;
  };
}
```

## 🎯 Usage Examples

### 1. Simple Test User

Creates a basic user account with magic login link:

```bash
curl -X POST http://localhost:3000/api/admin/dev/create-test-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-token" \
  -d '{
    "email": "qa-user@example.com",
    "password": "secure123"
  }'
```

### 2. User with Organization

Creates user and adds them to an organization:

```bash
curl -X POST http://localhost:3000/api/admin/dev/create-test-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-token" \
  -d '{
    "email": "trainer@company.com",
    "orgId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "trainer"
  }'
```

### 3. Full Setup (User + Org + Course)

Creates user, adds to org, and enrolls in course:

```bash
curl -X POST http://localhost:3000/api/admin/dev/create-test-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-token" \
  -d '{
    "email": "learner@company.com",
    "orgId": "550e8400-e29b-41d4-a716-446655440000",
    "courseId": "660e8400-e29b-41d4-a716-446655440001",
    "role": "learner",
    "redirectTo": "https://your-app.com/dashboard-simple"
  }'
```

### 4. JavaScript/Node.js

```javascript
async function createTestUser(email, options = {}) {
  const response = await fetch('/api/admin/dev/create-test-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': process.env.ADMIN_EXPORT_TOKEN
    },
    body: JSON.stringify({
      email,
      password: 'test123456',
      ...options
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Magic link:', data.magicLink);
    return data;
  } else {
    throw new Error(data.error);
  }
}

// Usage
const user = await createTestUser('test@example.com', {
  orgId: 'your-org-id',
  courseId: 'your-course-id',
  redirectTo: 'https://your-app.com/dashboard'
});
```

## 🧪 Testing

### Test Script

Run the included test script to verify functionality:

```bash
# Basic test
node test-create-user.mjs

# Test with specific org/course
node test-create-user.mjs --org-id=uuid --course-id=uuid

# Test against different environment
node test-create-user.mjs --base-url=https://staging.example.com
```

### Manual Testing

1. **Health Check**:
   ```bash
   curl -H "x-admin-token: your-token" \
     http://localhost:3000/api/admin/dev/create-test-user
   ```

2. **Create User**:
   ```bash
   curl -X POST -H "x-admin-token: your-token" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}' \
     http://localhost:3000/api/admin/dev/create-test-user
   ```

3. **Test Magic Link**:
   - Copy the `magicLink` from the response
   - Open it in a browser
   - Should automatically sign in and redirect

## 🔄 Workflow Integration

### QA Testing Workflow

```bash
#!/bin/bash
# Create test user for QA session
RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/dev/create-test-user \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_EXPORT_TOKEN" \
  -d '{
    "email": "qa-session-'$(date +%s)'@example.com",
    "orgId": "'$QA_ORG_ID'",
    "courseId": "'$QA_COURSE_ID'",
    "redirectTo": "http://localhost:3000/dashboard-simple"
  }')

MAGIC_LINK=$(echo $RESPONSE | jq -r '.magicLink')
echo "🔗 QA User Magic Link: $MAGIC_LINK"

# Optionally open in browser
open "$MAGIC_LINK"
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Create Test User
  run: |
    RESPONSE=$(curl -X POST ${{ secrets.APP_URL }}/api/admin/dev/create-test-user \
      -H "Content-Type: application/json" \
      -H "x-admin-token: ${{ secrets.ADMIN_EXPORT_TOKEN }}" \
      -d '{
        "email": "ci-test-${{ github.run_id }}@example.com",
        "orgId": "${{ secrets.TEST_ORG_ID }}",
        "courseId": "${{ secrets.TEST_COURSE_ID }}"
      }')
    
    echo "TEST_USER_ID=$(echo $RESPONSE | jq -r '.userId')" >> $GITHUB_ENV
    echo "MAGIC_LINK=$(echo $RESPONSE | jq -r '.magicLink')" >> $GITHUB_ENV
```

## 🔍 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   ```
   Error: Unauthorized
   ```
   - Check `ADMIN_EXPORT_TOKEN` environment variable is set
   - Verify `x-admin-token` header matches exactly
   - Ensure no extra whitespace in token

2. **400 Bad Request - Invalid Email**
   ```
   Error: Invalid email format
   ```
   - Verify email format is valid
   - Check for typos in email address

3. **400 Bad Request - Organization Not Found**
   ```
   Error: Organization {uuid} not found
   ```
   - Verify organization UUID exists in database
   - Check organization is active/not deleted

4. **400 Bad Request - Course Not Found**
   ```
   Error: Course {uuid} not found
   ```
   - Verify course UUID exists in database
   - Check course is published/active

5. **Magic Link Not Working**
   - Ensure `NEXT_PUBLIC_SITE_URL` is set correctly
   - Check client has `detectSessionInUrl: true` in Supabase config
   - Verify redirect URL is whitelisted in Supabase Auth settings

### Debug Mode

Enable detailed logging by checking server logs when making requests. The API includes comprehensive logging for troubleshooting.

### Security Considerations

1. **Token Management**
   - Use strong, unique tokens for `ADMIN_EXPORT_TOKEN`
   - Rotate tokens regularly
   - Never commit tokens to version control

2. **Environment Isolation**
   - Use different tokens for dev/staging/prod
   - Restrict API access to trusted networks if possible
   - Monitor API usage for suspicious activity

3. **User Cleanup**
   - Consider implementing user cleanup for test accounts
   - Use recognizable email patterns for test users
   - Document test user creation for audit trails

## 📊 Performance

**Typical Response Times:**
- Simple user creation: 200-500ms
- With org membership: 300-600ms  
- With org + course enrollment: 400-800ms
- Magic link generation: 100-200ms

**Rate Limits:**
- No built-in rate limiting
- Consider adding rate limiting for production use
- Supabase has its own API rate limits

---

**Security Note**: This API is designed for development and QA environments. Use appropriate security measures and access controls in production environments.
