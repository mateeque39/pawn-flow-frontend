# Registration Workflow - Quick Reference

## Visual Flow

```
START: Admin User Logged In
    ↓
Navigate to Register → New User
    ↓
✅ System checks: Is user an Admin?
    ↓
    YES → Show Registration Form
    NO → Show "Access Denied" message
    ↓
Fill in Form Fields:
├─ Username (unique)
├─ Email (valid format)
├─ Password (min 6 chars)
├─ Confirm Password (must match)
└─ Role (User/Manager/Admin)
    ↓
Click "Register" Button
    ↓
System Validates:
├─ Username not empty? ✓
├─ Email valid? ✓
├─ Password ≥ 6 chars? ✓
├─ Passwords match? ✓
└─ Role selected? ✓
    ↓
Validation Passed?
    ├─ YES → Register user in database
    │         ↓
    │      Show success message
    │         ↓
    │      Auto-redirect to login (2 sec)
    │         ↓
    │      END: User account created ✅
    │
    └─ NO → Show error message
             ↓
          USER MUST FIX ERROR
             ↓
          Return to Step: Fill in Form
```

---

## Form Fields Checklist

### Before Clicking Register:

- [ ] **Username**
  - [ ] Entered? Not empty?
  - [ ] Unique (not used before)?
  - [ ] No special characters? (only letters, numbers, dots, underscores)
  - [ ] Example: `john_cashier` or `sarah.smith`

- [ ] **Email**
  - [ ] Valid email format? (contains @ and domain)
  - [ ] Unique (no duplicates)?
  - [ ] Realistic email?
  - [ ] Example: `john@company.com`

- [ ] **Password**
  - [ ] At least 6 characters?
  - [ ] Contains mix of characters (not just numbers)?
  - [ ] Easy to remember BUT hard to guess?
  - [ ] Example: `ShopPass123` (✓ Strong)
  - [ ] Example: `123456` (✗ Weak)

- [ ] **Confirm Password**
  - [ ] Exactly matches Password field?
  - [ ] Spelled identically?
  - [ ] Case-sensitive match?

- [ ] **Role**
  - [ ] Selected one role?
  - [ ] Appropriate for job?
  - [ ] Options: User / Manager / Admin

---

## Common Scenarios

### Scenario 1: Register a New Cashier

```
Admin Action:
1. Go to Register
2. Enter:
   - Username: john_cashier
   - Email: john@pawnshop.com
   - Password: PawnShop2025!
   - Confirm: PawnShop2025!
   - Role: User (Cashiers are Users)
3. Click Register
4. Success! ✅
```

### Scenario 2: Register a New Manager

```
Admin Action:
1. Go to Register
2. Enter:
   - Username: sarah_manager
   - Email: sarah@pawnshop.com
   - Password: Manager@2025
   - Confirm: Manager@2025
   - Role: Manager
3. Click Register
4. Success! ✅
```

### Scenario 3: Register Another Admin

```
IMPORTANT: Only existing admins can do this!

Admin Action:
1. Go to Register
2. Enter:
   - Username: admin_new
   - Email: admin@pawnshop.com
   - Password: AdminSecure123!
   - Confirm: AdminSecure123!
   - Role: Admin
3. Click Register
4. Success! ✅

⚠️ WARNING: Verify identity before making new admins!
```

---

## Error Reference Table

| Error Message | Means | Fix |
|---|---|---|
| Only administrators can register new users | You're not admin | Log in as admin |
| Passwords do not match | Password fields different | Re-enter both identically |
| Password must be at least 6 characters | Too short | Use 6+ characters |
| Access Denied: Only administrators... | Not authenticated as admin | Verify login status |
| Username already exists | Duplicate username | Choose different username |
| Invalid email format | Email incorrect | Use format: name@domain.com |

---

## Role Comparison

### Quick Role Picker

**For Cashiers?** → Select **User**
- Can create loans
- Can view customer info
- Cannot register other users
- Cannot access advanced reports

**For Team Lead?** → Select **Manager**
- Everything users can do
- Plus: Advanced reports
- Plus: Loan approvals
- Cannot register users

**For System Admin?** → Select **Admin**
- Everything in the system
- Can register new users
- Can manage other admins
- Full system configuration

---

## After Registration Checklist

```
☐ User registered successfully
☐ Noted username for records
☐ Password stored securely
☐ Login tested with new account
☐ New user trained on system
☐ User changed password on first login
☐ User bookmarked important pages
☐ User knows how to contact IT
☐ Permission level verified (correct role)
☐ Record added to staff registry
```

---

## Password Tips

### Strong Password Example:
```
PawnShop2025!Store
├─ Has uppercase: P, S
├─ Has lowercase: a, w, n, h, o, p, t, o, r, e
├─ Has numbers: 2, 0, 2, 5
├─ Has special char: !
└─ Length: 18 characters (excellent)
```

### Weak Password Example:
```
123456
├─ Only numbers ✗
├─ Easy to guess ✗
├─ Too short (6 chars - minimum) ✗
└─ No variety ✗
```

### Make Passwords Easy to Remember:
- Use first letters of a phrase
- Add year/special date
- Include company name
- Example: `MyJob@Pawn2025` = My Job At Pawn[shop] 2025

---

## Security Reminders

🔒 One account per person
🔒 Don't share passwords
🔒 Change default passwords immediately
🔒 Use different password than personal accounts
🔒 Admin accounts need extra protection
🔒 Log out when leaving workstation
🔒 Report suspicious activity immediately

---

## Still Need Help?

**Questions about registration?**
1. Check this guide first
2. Ask another admin
3. Contact IT support
4. Review the full REGISTRATION_GUIDE.md

**Account issues after registration?**
1. Try logging in from different browser
2. Clear browser cookies
3. Wait 5 minutes and try again
4. Contact system administrator
