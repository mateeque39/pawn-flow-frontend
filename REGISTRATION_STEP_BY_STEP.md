# User Registration - Step-by-Step Walkthrough

## Complete Registration Workflow

### STEP 1: Log In As Admin ✅

**What you see:**
```
┌──────────────────────────────────────┐
│         PawnFlow Login              │
├──────────────────────────────────────┤
│                                      │
│  Username: [admin____________]       │
│                                      │
│  Password: [•••••••••]               │
│                                      │
│         [Login Button]               │
│                                      │
└──────────────────────────────────────┘
```

**What you do:**
1. Enter username: `admin`
2. Enter password: (your admin password)
3. Click **Login**

**What happens:**
- System verifies credentials
- Admin dashboard loads
- You see navigation menu

**Result:** ✅ You're logged in as admin

---

## STEP 2: Navigate to Register ✅

**What you see:**
```
┌──────────────────────────────────────┐
│    Dashboard Navigation              │
├──────────────────────────────────────┤
│                                      │
│  Welcome, Admin!                     │
│                                      │
│  [Create Loan]                       │
│  [Manage Profile & Loans]            │
│  [Edit Existing Loan]                │
│  [📝 Register New User] ← Click here!│
│  [PDF Settings]                      │
│                                      │
└──────────────────────────────────────┘
```

**What you do:**
1. Look for **"Register New User"** or **"Create Account"** option
2. Click the registration button

**What happens:**
- Registration form loads
- System checks if you're admin
- If yes → Form appears
- If no → Error message shows

**Result:** ✅ Registration form is displayed

---

## STEP 3: Check If You Have Permission ✅

**Two Possible Screens:**

### A) IF YOU'RE AN ADMIN:
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│  [Form ready to fill in]                │
│                                         │
│  Username field                         │
│  Email field                            │
│  Password field                         │
│  Confirm Password field                 │
│  Role dropdown                          │
│  [Register Button]                      │
│                                         │
└─────────────────────────────────────────┘
```

→ **Continue to STEP 4**

### B) IF YOU'RE NOT AN ADMIN:
```
┌─────────────────────────────────────────┐
│       Access Denied                    │
├─────────────────────────────────────────┤
│                                         │
│  ❌ ALERT:                              │
│                                         │
│  "Access Denied: Only administrators    │
│   can register new users. Please        │
│   contact an admin to create new        │
│   accounts."                            │
│                                         │
│  [Back Button]                          │
│                                         │
└─────────────────────────────────────────┘
```

→ **Ask an admin to register you or the user**

---

## STEP 4: Fill in Username ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ Username                                │
│ ┌───────────────────────────────────┐  │
│ │_                                  │  │
│ └───────────────────────────────────┘  │
│ Tip: Choose a username (no spaces)    │
│                                         │
│ Email field (empty)                     │
│ Password field (empty)                  │
│ Confirm Password field (empty)          │
│ Role dropdown (default)                 │
│                                         │
└─────────────────────────────────────────┘
```

**What you do:**
1. Click in Username field
2. Type the username
3. Examples: `john_smith`, `sarah_cashier`, `mike.manager`

**Requirements:**
- ✅ Unique (not used before)
- ✅ No special characters (except `_` and `.`)
- ✅ No spaces
- ✅ No empty field

**Example usernames:**
- ✅ `john_cashier` (good)
- ✅ `sarah.smith` (good)
- ❌ `john smith` (has space - bad)
- ❌ `admin` (might exist - bad)

---

## STEP 5: Fill in Email ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ Username: john_cashier (filled)         │
│                                         │
│ Email Address                           │
│ ┌───────────────────────────────────┐  │
│ │_                                  │  │
│ └───────────────────────────────────┘  │
│ Tip: Valid email format (name@...)    │
│                                         │
│ Password field (empty)                  │
│ Confirm Password field (empty)          │
│ Role dropdown (default)                 │
│                                         │
└─────────────────────────────────────────┘
```

**What you do:**
1. Click in Email field
2. Type the email address
3. Example: `john@pawnshop.com`

**Requirements:**
- ✅ Valid email format (has `@`)
- ✅ Has domain (has `.com`, `.org`, etc.)
- ✅ Typically unique (no duplicates)

**Example emails:**
- ✅ `john@pawnshop.com` (good)
- ✅ `sarah@company.com` (good)
- ❌ `johnpawnshop.com` (missing `@` - bad)
- ❌ `john@` (missing domain - bad)
- ❌ `@pawnshop.com` (missing username - bad)

---

## STEP 6: Create Password ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ Username: john_cashier (filled)         │
│ Email: john@pawnshop.com (filled)       │
│                                         │
│ Password                                │
│ ┌───────────────────────────────────┐  │
│ │••••••••••                         │  │
│ └───────────────────────────────────┘  │
│ Tip: Min 6 characters                 │
│                                         │
│ Confirm Password field (empty)          │
│ Role dropdown (default)                 │
│                                         │
└─────────────────────────────────────────┘
```

**What you do:**
1. Click in Password field
2. Type the password
3. Characters show as dots (•) for security
4. Example: Type `SecurePass123`

**Requirements:**
- ✅ Minimum 6 characters
- ✅ Can include: Letters, numbers, symbols
- ✅ Case-sensitive (CamelCase matters)

**Password Examples:**
- ✅ `SecurePass123` (strong - 12 chars, mixed case)
- ✅ `PawnShop2025!` (strong - mixed with symbol)
- ✅ `123456` (acceptable - 6 chars minimum)
- ❌ `12345` (too short - only 5 chars)
- ❌ `password` (weak - too common)

**Password Tips:**
1. Use mix of upper & lowercase
2. Include numbers
3. Add special characters (!@#$%^&*)
4. Don't use common words
5. Don't use birthdate or company name

---

## STEP 7: Confirm Password ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ Username: john_cashier (filled)         │
│ Email: john@pawnshop.com (filled)       │
│ Password: ••••••••• (filled)             │
│                                         │
│ Confirm Password                        │
│ ┌───────────────────────────────────┐  │
│ │••••••••••                         │  │
│ └───────────────────────────────────┘  │
│ Tip: Must match password above        │
│                                         │
│ Role dropdown (default)                 │
│                                         │
└─────────────────────────────────────────┘
```

**What you do:**
1. Click in Confirm Password field
2. Type the SAME password as above
3. Must be character-for-character identical

**Important:**
- ✅ Must EXACTLY match password field
- ✅ Spelling must be identical
- ✅ Case must match (uppercase/lowercase)
- ✅ Special characters must match

**Example:**
- Password: `SecurePass123`
- Confirm: `SecurePass123` ✅ MATCH

**Common Error:**
- Password: `SecurePass123`
- Confirm: `securepass123` ❌ Case doesn't match
- Error: "Passwords do not match"

---

## STEP 8: Select User Role ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ Username: john_cashier (filled)         │
│ Email: john@pawnshop.com (filled)       │
│ Password: ••••••••• (filled)             │
│ Confirm Password: ••••••••• (filled)    │
│                                         │
│ Role                                    │
│ ┌───────────────────────────────────┐  │
│ │ User                          ▼   │  │
│ └───────────────────────────────────┘  │
│                                         │
│        [Register Button]                │
│                                         │
└─────────────────────────────────────────┘
```

**What you do:**
1. Click on Role dropdown
2. Choose from options:
   - **User** (for cashiers)
   - **Manager** (for supervisors)
   - **Admin** (for system admins)

**Role Selection Guide:**

```
For new CASHIER employee?
→ Select: User

For new SUPERVISOR/TEAM LEAD?
→ Select: Manager

For new SYSTEM ADMINISTRATOR?
→ Select: Admin
```

**Role Descriptions:**

| Role | Can Do | Cannot Do | Best For |
|------|--------|-----------|----------|
| **User** | Create loans, view customers, make payments | Register users, view advanced reports | Cashiers, loan officers |
| **Manager** | Everything user can do + view advanced reports + approve transactions | Register users, system settings | Supervisors, managers |
| **Admin** | EVERYTHING in system | Nothing (full access) | System admins, owners |

**Example for our walkthrough:**
- New employee: John (Cashier)
- Select: **User** ← Click here

---

## STEP 9: Review Before Submit ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ ✓ Username: john_cashier                │
│ ✓ Email: john@pawnshop.com              │
│ ✓ Password: ••••••••• (6+ chars)        │
│ ✓ Confirm: ••••••••• (matches)          │
│ ✓ Role: User                            │
│                                         │
│        [Register Button]                │
│                                         │
└─────────────────────────────────────────┘
```

**What you check:**
- [ ] Username: Correct & unique?
- [ ] Email: Correct format?
- [ ] Password: 6+ characters?
- [ ] Confirm: Matches password?
- [ ] Role: Correct role selected?

**Before clicking Register:**
1. ✅ Verify all fields filled
2. ✅ Check no red error messages
3. ✅ Confirm username is correct
4. ✅ Confirm email is correct
5. ✅ Confirm role is appropriate

---

## STEP 10: Click Register Button ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ Username: john_cashier (filled)         │
│ Email: john@pawnshop.com (filled)       │
│ Password: ••••••••• (filled)             │
│ Confirm Password: ••••••••• (filled)    │
│ Role: User (selected)                   │
│                                         │
│ [🔄 PROCESSING - Register Button]      │
│ (Button might be disabled briefly)      │
│                                         │
└─────────────────────────────────────────┘
```

**What you do:**
1. Click the **Register** button
2. Wait for response (usually 1-2 seconds)

**What happens behind the scenes:**
1. Frontend validates all fields ✓
2. HTTP request sent to backend
3. Backend verifies admin status ✓
4. Backend validates data ✓
5. Backend hashes password ✓
6. Database inserts new user ✓
7. Success response sent back ✓

---

## STEP 11: Success! ✅

**What you see:**
```
┌─────────────────────────────────────────┐
│       Create New Account               │
├─────────────────────────────────────────┤
│                                         │
│ ✅ SUCCESS MESSAGE:                     │
│                                         │
│ "User registered successfully!          │
│  Redirecting to login in 2 seconds..."  │
│                                         │
│ New account created:                    │
│ • Username: john_cashier                │
│ • Email: john@pawnshop.com              │
│ • Role: User                            │
│ • Status: Ready to login                │
│                                         │
│ Redirecting... (2, 1...)                │
│                                         │
└─────────────────────────────────────────┘
```

**What you see:**
- ✅ Green success message
- ✅ Confirmation of details
- ✅ Countdown to redirect
- ✅ Form fields clear

**What you can do:**
1. Wait for auto-redirect (2 seconds)
2. Or manually navigate to login
3. Or register another user

---

## STEP 12: Account Ready to Login ✅

**What you see:**
```
┌──────────────────────────────────────┐
│         PawnFlow Login              │
├──────────────────────────────────────┤
│                                      │
│  Username: [_________________]       │
│                                      │
│  Password: [_________________]       │
│                                      │
│         [Login Button]               │
│                                      │
│  Status: Ready for new user to       │
│          login with credentials      │
│                                      │
└──────────────────────────────────────┘
```

**What the new user will do:**
1. Enter username: `john_cashier`
2. Enter password: `SecurePass123`
3. Click Login
4. Access PawnFlow system with User role

**Result:** ✅ Registration Complete!

---

## ⚠️ If You See an Error

### Error: "Passwords do not match"

```
┌─────────────────────────────────────────┐
│           ERROR MESSAGE                │
├─────────────────────────────────────────┤
│                                         │
│ ❌ Passwords do not match               │
│                                         │
│ The password and confirm password      │
│ fields must be identical.              │
│                                         │
│        [OK]                             │
│                                         │
└─────────────────────────────────────────┘
```

**What to do:**
1. Click OK to close error
2. Clear both password fields
3. Re-enter password carefully
4. Re-enter confirm password
5. Verify they match exactly
6. Try again

---

### Error: "Password must be at least 6 characters long"

```
┌─────────────────────────────────────────┐
│           ERROR MESSAGE                │
├─────────────────────────────────────────┤
│                                         │
│ ❌ Password too short                   │
│                                         │
│ Password must be at least 6 characters  │
│ long. You entered 4 characters.         │
│                                         │
│        [OK]                             │
│                                         │
└─────────────────────────────────────────┘
```

**What to do:**
1. Click OK to close error
2. Clear password field
3. Enter longer password (6+ chars)
4. Update confirm password to match
5. Try again

---

### Error: "Only administrators can register new users"

```
┌─────────────────────────────────────────┐
│           ERROR MESSAGE                │
├─────────────────────────────────────────┤
│                                         │
│ ❌ ACCESS DENIED                        │
│                                         │
│ Only administrators can register new    │
│ users. Your account doesn't have the   │
│ necessary permissions.                 │
│                                         │
│ Please contact an admin.                │
│                                         │
│        [OK]                             │
│                                         │
└─────────────────────────────────────────┘
```

**What to do:**
1. Click OK to close error
2. Log out
3. Ask an admin to either:
   - Register the user for you, OR
   - Promote your account to admin
4. Try again after admin action

---

## ✅ Quick Checklist

**Before You Register:**
- [ ] Logged in as admin?
- [ ] Navigation to Register?
- [ ] Form appeared?
- [ ] Have username in mind?
- [ ] Have email address?
- [ ] Know what role they need?
- [ ] Can create strong password?

**Filling The Form:**
- [ ] Username: Unique, no spaces?
- [ ] Email: Valid format (name@domain)?
- [ ] Password: 6+ characters?
- [ ] Confirm: Exactly matches password?
- [ ] Role: Selected correct role?
- [ ] All fields have values?
- [ ] No red error messages?

**After Click Register:**
- [ ] Got success message?
- [ ] New username confirmed?
- [ ] New email confirmed?
- [ ] New role confirmed?
- [ ] Page redirected to login?
- [ ] Account ready to test?

**Success Indicators:**
- ✅ Success message appeared
- ✅ Username confirmed
- ✅ Auto-redirect happened
- ✅ New account can login
- ✅ User has correct role

---

## 🎯 Summary

Registration takes **5-10 minutes** once you understand the form:

1. ✅ Log in as admin (2 min)
2. ✅ Navigate to register (1 min)
3. ✅ Fill form with user info (3 min)
4. ✅ Click register (1 min)
5. ✅ Confirm success (2 min)

**Total time:** ~10 minutes per user

**After registration:** User can login and start working!

---

## 📞 Still Have Questions?

- **About form fields?** → [REGISTRATION_GUIDE.md](./REGISTRATION_GUIDE.md)
- **Quick reference?** → [REGISTRATION_QUICK_REFERENCE.md](./REGISTRATION_QUICK_REFERENCE.md)
- **Technical details?** → [REGISTRATION_TECHNICAL_GUIDE.md](./REGISTRATION_TECHNICAL_GUIDE.md)
- **Visual flowchart?** → [REGISTRATION_VISUAL_GUIDE.md](./REGISTRATION_VISUAL_GUIDE.md)
