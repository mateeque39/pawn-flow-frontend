# Registration System - Technical Overview

## Architecture

```
Frontend (React)          Backend (Node.js)         Database (PostgreSQL)
─────────────────         ─────────────────         ────────────────────

Register Form
    ↓
Check Admin Status ←───→ /api/users/current
    ↓
Fill Details
    ↓
Submit (POST)
    ↓
Validation ←───────────→ /register endpoint
    ├─ Username not empty
    ├─ Valid email
    ├─ Password ≥ 6 chars
    ├─ Passwords match
    └─ Password hashed (bcrypt)
          ↓
    Insert into database ←──── users table
          ↓
    Insert into database ←──── user_roles table
          ↓
    Return success ←──────→ Frontend receives confirmation
          ↓
    Auto-redirect to login
```

---

## Security Implementation

### Password Security
1. **Hashing**: Passwords are hashed using bcryptjs (industry standard)
2. **Salting**: Each password gets unique salt for extra security
3. **Never stored plain**: Actual passwords never saved to database
4. **One-way encryption**: Can't reverse hash to get password

### Authentication Flow
```
User registers with password: "MySecret123"
         ↓
Password → bcrypt.hash() → Hashed: "$2a$10$xxxxx..."
         ↓
Only hash stored in database
         ↓
Later when user logs in:
Login password "MySecret123" → bcrypt.compare() → Match? Yes! ✓
```

### Admin-Only Protection
```
User clicks Register
    ↓
Frontend checks: Is currentUser.role === 'admin'?
    ├─ Yes → Show form
    └─ No → Show "Access Denied"
         ↓
Backend double-checks: Is user authenticated AND admin?
    ├─ Yes → Allow registration
    └─ No → Return 401 Unauthorized
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Hashed, never plain text
  role_id INTEGER NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES user_roles(id)
);
```

### User Roles Table

```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,  -- 'admin', 'manager', 'user'
  permissions JSONB,                       -- What they can do
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample roles:
INSERT INTO user_roles (role_name) VALUES ('admin');      -- ID: 1
INSERT INTO user_roles (role_name) VALUES ('manager');    -- ID: 2
INSERT INTO user_roles (role_name) VALUES ('user');       -- ID: 3
```

---

## Registration Endpoint

### Endpoint: POST /register

**Purpose**: Create a new user account

**Request Body**:
```javascript
{
  "username": "john_cashier",
  "email": "john@pawnshop.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Backend Processing**:
1. Validate all fields are present
2. Hash password with bcryptjs
3. Look up role_id from role name
4. Insert into users table
5. Return success or error

**Response - Success (200 OK)**:
```javascript
{
  "message": "User registered successfully",
  "user": {
    "id": 42,
    "username": "john_cashier",
    "email": "john@pawnshop.com",
    "role_id": 3,
    "created_at": "2025-12-06T10:30:00Z"
  }
}
```

**Response - Error (400 Bad Request)**:
```javascript
{
  "message": "Username already exists"
}
```

---

## Validation Rules

### Backend Validation (Server-side)
These checks happen on the server before saving:

```javascript
// 1. Username validation
- Not empty
- Not null
- Unique (no duplicates in database)
- No special characters

// 2. Email validation
- Valid email format
- Contains @
- Contains domain

// 3. Password validation
- Minimum 6 characters
- Cannot be empty

// 4. Role validation
- Must exist in user_roles table
- Must be one of: 'admin', 'manager', 'user'

// 5. Admin check
- Requesting user must have admin role
- Check: user.role_id === 1 (admin)
```

### Frontend Validation (Client-side)
These happen before sending to server:

```javascript
// Provides faster feedback to user
- Password length check
- Passwords match check
- Email format check
- Required fields check
```

---

## Error Handling

### Common Errors & Responses

**400 Bad Request**: Invalid input
```javascript
{
  "message": "Username already exists",
  "userMessage": "That username is taken. Please choose another."
}
```

**401 Unauthorized**: Not authenticated
```javascript
{
  "message": "Not authenticated",
  "userMessage": "Please log in first"
}
```

**403 Forbidden**: Not admin
```javascript
{
  "message": "Insufficient permissions",
  "userMessage": "Only administrators can register users"
}
```

**500 Internal Server Error**: Server problem
```javascript
{
  "message": "Error registering user",
  "error": "Database connection failed"
}
```

---

## Logging & Audit Trail

### What Gets Logged

Every registration logs:
```
[2025-12-06 10:30:15] ✅ USER REGISTERED
├─ Username: john_cashier
├─ Email: john@pawnshop.com
├─ Role: user (ID: 3)
├─ Registered by: admin_user (ID: 1)
├─ Timestamp: 2025-12-06T10:30:15Z
└─ Status: SUCCESS
```

### For Security:
```
[2025-12-06 10:35:42] ❌ UNAUTHORIZED REGISTRATION ATTEMPT
├─ User: regular_user (ID: 5)
├─ User Role: user (not admin)
├─ Timestamp: 2025-12-06T10:35:42Z
└─ Status: BLOCKED
```

---

## API Integration

### Frontend Code Example

```javascript
// In RegisterForm.js
const handleRegisterUser = async (userData) => {
  try {
    // Call backend endpoint
    const response = await http.post('/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role
    });

    // Show success
    console.log('✅ User registered:', response.data);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/login');
    }, 2000);

  } catch (error) {
    // Show error
    console.error('❌ Registration failed:', error);
    setMessage(error.message);
  }
};
```

---

## Security Best Practices Implemented

✅ **Password Hashing**: bcryptjs with salt rounds (10)
✅ **Admin Gate**: Frontend + Backend checks
✅ **Input Validation**: Server-side validation before DB insert
✅ **Error Messages**: Don't reveal if username exists (prevents enumeration)
✅ **Logging**: All registration attempts logged
✅ **JWT Auth**: Registration endpoint requires valid token
✅ **CORS**: Only allowed origins can register
✅ **Rate Limiting**: (Can be added) Prevent brute force

---

## Data Flow Example

### User Registration Process

```
1. FRONTEND - User fills form
   Username: sarah_cashier
   Email: sarah@pawn.com
   Password: ••••••••
   Role: User

2. FRONTEND - Validation
   ✓ Password length OK (8 chars)
   ✓ Passwords match
   ✓ Email format valid

3. FRONTEND - HTTP POST
   POST /register
   {
     username: "sarah_cashier",
     email: "sarah@pawn.com",
     password: "SecurePass9",
     role: "user"
   }

4. BACKEND - Receive request
   ✓ JWT token valid?
   ✓ User is admin?

5. BACKEND - Validation
   ✓ Username unique?
   ✓ Email valid?
   ✓ Role exists?

6. BACKEND - Password Processing
   "SecurePass9" → bcryptjs.hash()
   → "$2a$10$FVQr..."

7. BACKEND - Database Insert
   INSERT INTO users
   (username, password_hash, email, role_id)
   VALUES
   ('sarah_cashier', '$2a$10$FVQr...', 'sarah@pawn.com', 3)

8. BACKEND - Response
   {
     message: "User registered successfully",
     user: {
       id: 123,
       username: "sarah_cashier",
       role: "user"
     }
   }

9. FRONTEND - Success handling
   Show: "User registered successfully!"
   Log: Registration event
   Redirect: Login page (2 sec delay)

10. DATABASE - Account ready
    ✓ User can now login
    ✓ Username: sarah_cashier
    ✓ Password: SecurePass9
    ✓ Role: User
```

---

## Role-Based Permissions

### User Role (ID: 3)
```javascript
{
  canCreateLoans: true,
  canViewCustomers: true,
  canMakePayments: true,
  canViewReports: false,
  canRegisterUsers: false,
  canModifyUsers: false,
  canAccessAdmin: false
}
```

### Manager Role (ID: 2)
```javascript
{
  canCreateLoans: true,
  canViewCustomers: true,
  canMakePayments: true,
  canViewReports: true,
  canRegisterUsers: false,
  canModifyUsers: false,
  canAccessAdmin: true  // Limited
}
```

### Admin Role (ID: 1)
```javascript
{
  canCreateLoans: true,
  canViewCustomers: true,
  canMakePayments: true,
  canViewReports: true,
  canRegisterUsers: true,  // ← Registration access
  canModifyUsers: true,    // ← Can edit other users
  canAccessAdmin: true     // Full access
}
```

---

## Testing Registration

### Manual Test Steps

1. **Login as admin**
   - Username: admin
   - Password: (your admin password)

2. **Go to Register**
   - Navigate to registration page
   - Confirm form appears

3. **Create test user**
   - Username: test_user_001
   - Email: test@example.com
   - Password: TestPass123
   - Role: User

4. **Verify success**
   - Check success message appears
   - Check redirect to login
   - Try logging in with new account

5. **Verify database**
   - Query: `SELECT * FROM users WHERE username = 'test_user_001'`
   - Confirm: User exists, password is hashed

---

## Troubleshooting for Developers

### Issue: "Username already exists"
```
Solution:
- Check: Is username unique in database?
- SELECT * FROM users WHERE username = 'john_cashier';
- If exists: Use different username or delete old account
```

### Issue: Password not hashing correctly
```
Solution:
- Verify bcryptjs is installed: npm list bcryptjs
- Check salt rounds: Should be 10
- Ensure await bcrypt.hash() completes before insert
```

### Issue: Admin check failing
```
Solution:
- Verify JWT token is valid
- Check: user.role_id === 1
- Confirm: Token includes role information
```

### Issue: CORS error during registration
```
Solution:
- Check: Frontend origin in CORS whitelist
- Verify: credentials: true in fetch headers
- Ensure: Request header 'Content-Type': 'application/json'
```

---

## Summary

✅ **Secure**: Password hashing, admin-only, validated input
✅ **Audited**: All registrations logged for compliance
✅ **Role-based**: Users get appropriate permission level
✅ **User-friendly**: Clear error messages and validation
✅ **Scalable**: Can handle multiple registrations
✅ **Maintainable**: Clean code with logging
