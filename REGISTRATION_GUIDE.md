# User Registration Guide - PawnFlow

## Overview
The PawnFlow system has a **secure registration feature** that allows admins to create new staff accounts. Regular users cannot register themselves - only admins can create new user accounts.

---

## Security First: Why Admin-Only Registration?

✅ **Prevents unauthorized access** - Only authorized admin staff can add new users
✅ **Protects sensitive data** - Limits who can access loan and customer information
✅ **Maintains audit trail** - Admins control who has system access
✅ **Role-based permissions** - Admins decide what level of access each user gets

---

## Step-by-Step Registration Guide

### Prerequisites
1. You must be logged in as an **ADMIN** user
2. If you're not an admin, ask your admin to register you or promote your account
3. Admins are identified with an "Admin" badge in the system

---

### How to Register a New User (ADMIN ONLY)

#### Step 1: Access Registration
1. Log in with your **admin account**
2. In the main menu, look for the registration option
3. Navigate to the **"Register New User"** or **"Create New Account"** section
   - You should see it in the top navigation or admin panel

#### Step 2: Fill in User Details

The registration form has these fields:

**📝 Username**
- What the user will use to log in
- Example: `john.smith` or `sarah_cashier`
- Requirements:
  - Must be unique (no duplicates)
  - Can contain letters, numbers, dots, underscores
  - Minimum length varies by system

**📧 Email Address**
- User's email for notifications and recovery
- Example: `john.smith@pawnshop.com`
- Requirements:
  - Must be a valid email format
  - Should be unique
  - Will be used for password recovery

**🔐 Password**
- The user's login password
- Requirements:
  - **Minimum 6 characters** required
  - Recommended: Mix of uppercase, lowercase, numbers, special characters
  - Example: `SecurePass123!`
  - Best practice: Use a strong, random password

**🔐 Confirm Password**
- Re-enter the password to confirm
- Must match the password field exactly
- If they don't match, you'll see an error

**👥 Role Selection**
- Choose what level of access the user has
- Options:

| Role | Permissions | Best For |
|------|------------|----------|
| **User** | Basic loan operations, view customers | Cashiers, data entry staff |
| **Manager** | Advanced reports, loan management | Department managers, supervisors |
| **Admin** | Full system access, user management | System administrators, owners |

#### Step 3: Validation

Before registering, the system checks:
- ✅ Username is not empty
- ✅ Email is valid format
- ✅ Password is at least 6 characters
- ✅ Passwords match
- ✅ Role is selected

#### Step 4: Submit & Confirm

1. Click the **"Register"** button
2. Wait for the success message
3. You'll see: `"User registered successfully! Redirecting to login..."`
4. The system redirects after 2 seconds

---

## Error Messages & Solutions

### "Only administrators can register new users"
**Cause:** You're not logged in as an admin
**Solution:** Log in with an admin account or ask an admin to register the user

### "Passwords do not match"
**Cause:** The password and confirm password fields are different
**Solution:** Re-enter both passwords carefully and make sure they're identical

### "Password must be at least 6 characters long"
**Cause:** The password you entered is too short
**Solution:** Use a password with at least 6 characters

### "Access Denied: Only administrators can register new users"
**Cause:** Your user account doesn't have admin privileges
**Solution:** Contact your system administrator to promote your account or register the user for you

---

## User Roles Explained

### 👤 User (Basic Access)
**What they can do:**
- Create new loans
- View active loans
- Record payments
- Access customer information
- Generate basic reports

**What they CANNOT do:**
- Register new users
- Delete loans
- Access admin panel
- View sensitive reports

**Best for:** Cashiers, loan officers, front desk staff

---

### 👔 Manager (Advanced Access)
**What they can do:**
- Everything a User can do
- Plus:
- Generate advanced reports
- Approve large transactions
- Access analytics dashboard
- View overdue loans
- Manage staff schedules (if available)

**What they CANNOT do:**
- Register new users
- Delete system data
- Modify system settings
- Promote other users

**Best for:** Branch managers, supervisors, department heads

---

### 🔧 Admin (Full Access)
**What they can do:**
- Everything in the system
- Register new users
- Modify user permissions
- Access all reports
- System configuration
- Database management (backend)
- Security settings

**What they should do:**
- Manage other admins carefully
- Keep passwords secure
- Monitor user activities
- Maintain system backups

**Best for:** System administrators, owners, IT staff

---

## Best Practices for Registration

### ✅ DO:
- ✅ Use strong, unique passwords
- ✅ Document new user information for records
- ✅ Verify the user's identity before registering
- ✅ Assign the minimum role needed for their job
- ✅ Keep login credentials secure
- ✅ Use professional email addresses
- ✅ Test the account immediately after creation

### ❌ DON'T:
- ❌ Share login credentials
- ❌ Use simple passwords like "123456" or "password"
- ❌ Register users you don't know
- ❌ Give admin access to everyone
- ❌ Leave default passwords unchanged
- ❌ Write down passwords
- ❌ Use the same password for multiple users

---

## After Registration

### Immediately After:
1. Test the new account by logging in
2. Verify all menu items appear correctly
3. Check that reports are accessible
4. Confirm database access works

### User Training:
- Show them how to navigate the system
- Explain how to create a loan
- Show them how to view reports
- Teach them password reset procedure

### Security:
- Ask user to change password on first login (recommended)
- Remind them about password security
- Document the registration in your records

---

## Password Reset for Registered Users

If a user forgets their password:

1. Admin must log in
2. Contact your system administrator or database admin
3. They can reset the password or send recovery email
4. User logs in with temporary password
5. User creates new password

**Note:** Password resets are not done through the registration form - that's for creating new accounts only.

---

## Multiple User Registration

### To Register Multiple Users Quickly:

1. Log in as admin
2. Go to Registration form
3. Register first user → Confirm success
4. Registration form resets automatically
5. Repeat for next user
6. Continue until all users are registered

### Pro Tip:
Keep a checklist of new staff with their assigned roles and responsibilities

---

## Troubleshooting

### Q: I'm an admin but the form says "Access Denied"
**A:** 
1. Log out completely
2. Clear browser cache
3. Log back in
4. If still fails, ask another admin to check your account permissions

### Q: The password field is being rejected as too short
**A:** Make sure your password has AT LEAST 6 characters:
- ❌ "12345" (5 characters - too short)
- ✅ "123456" (6 characters - acceptable)
- ✅ "MyPass123!" (10 characters - better)

### Q: New user can't log in after registration
**A:** 
1. Verify username spelling
2. Verify password was entered correctly
3. Check that caps lock is off
4. Try resetting the account

### Q: Email address shows error "already exists"
**A:** That email is already used by another account. Choose a different email address.

---

## Summary

| What | How | Who | When |
|------|-----|-----|------|
| **Register User** | Fill form → Submit | Admins only | When hiring new staff |
| **Change Role** | Contact IT/Admin | Admins | When promoting staff |
| **Reset Password** | Contact Admin | Any user | When forgotten |
| **Login** | Use registered username + password | All users | Daily |

---

## Need Help?

- **Can't register?** Check if you're logged in as admin
- **Form validation error?** Check password length and match
- **Account not working?** Wait 24 hours or ask admin
- **Forgot password?** Contact your system administrator
- **Other issues?** Document the issue and contact IT support

---

## Important Security Reminders

🔒 **Never share passwords** - Each person gets their own login
🔒 **Keep credentials safe** - Don't write them on sticky notes
🔒 **Use strong passwords** - Mix of letters, numbers, special characters
🔒 **Admin accounts are powerful** - Protect them extra carefully
🔒 **Change default passwords** - Don't leave temporary passwords
🔒 **Log out when done** - Always lock your workstation
