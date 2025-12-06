# Profile Picture Upload Issue - Diagnosis & Solution

## 🔴 Problem

Profile pictures upload, preview works, but after refresh/restart the picture disappears even though the profile data exists.

## 🔍 Root Cause

**The picture is NOT being saved to the database by your backend.**

Currently:
1. ✅ Frontend converts image to Base64
2. ✅ Sends Base64 to backend in PUT request
3. ✅ Backend receives it (check your logs)
4. ❌ **Backend is NOT storing it in the `profile_image` column**
5. ❌ Page refresh loads fresh data from DB → No image

## 📍 Frontend Code (Working Correctly)

### File: ManageCustomerProfileForm.js

**Line 264-273: Image Upload Handler**
```javascript
const handleProfileImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);        // ✅ Stores Base64
      setProfileImagePreview(reader.result); // ✅ Shows preview
    };
    reader.readAsDataURL(file);
  }
};
```

**Line 815-825: Update Request**
```javascript
const updateData = {
  ...editProfileData,
  ...(profileImage && { profile_image: profileImage })  // ✅ Includes image
};
await http.put(`/customers/${selectedProfile.id}`, updateData); // ✅ Sends to backend
```

**Status**: ✅ **WORKING - Frontend correctly sends the Base64 image string**

---

## 🔧 Backend Fix Needed

### Issue: Backend is not storing the image

### Solution 1: Store in Database (Recommended for Professional Use)

**Step 1: Update Customer Table (Database)**

Add a `profile_image` column if it doesn't exist:

```sql
-- Add this column if not present
ALTER TABLE customers ADD COLUMN profile_image LONGTEXT NULL DEFAULT NULL;

-- Or if using PostgreSQL:
ALTER TABLE customers ADD COLUMN profile_image TEXT NULL DEFAULT NULL;
```

**Step 2: Update Backend Endpoint**

Find your `/customers/:id` PUT endpoint (likely in `server.js` or a customers route file):

```javascript
// BEFORE (Not saving image):
app.put('/customers/:id', async (req, res) => {
  const { firstName, lastName, email, ...otherData } = req.body;
  
  const query = `UPDATE customers SET first_name=?, last_name=?, email=? WHERE id=?`;
  // ❌ profile_image NOT in query
});

// AFTER (Saving image):
app.put('/customers/:id', async (req, res) => {
  const { firstName, lastName, email, profile_image, ...otherData } = req.body;
  
  const query = `UPDATE customers SET 
    first_name=?, 
    last_name=?, 
    email=?,
    profile_image=?  // ✅ Add this
    WHERE id=?`;
  
  const values = [
    firstName,
    lastName, 
    email,
    profile_image,  // ✅ Include the Base64 image
    req.params.id
  ];
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Customer updated successfully', customer: result });
  });
});
```

**Step 3: Test**

1. Upload profile picture
2. Check browser DevTools → Network tab
3. Look for PUT request to `/customers/[id]`
4. Expand request body and verify `profile_image` contains long Base64 string
5. Refresh page
6. Picture should persist ✅

---

### Solution 2: Store on Disk (For Large Scale)

If storing in database causes issues (large Base64 strings), save files instead:

```javascript
const fs = require('fs');
const path = require('path');

app.put('/customers/:id', async (req, res) => {
  const { profile_image, ...otherData } = req.body;
  let imageFilename = null;

  // Save image to disk if provided
  if (profile_image && profile_image.startsWith('data:image')) {
    const matches = profile_image.match(/^data:image\/(\w+);base64,(.*)$/);
    if (matches) {
      const ext = matches[1];
      const imageBuffer = Buffer.from(matches[2], 'base64');
      imageFilename = `profile_${req.params.id}_${Date.now()}.${ext}`;
      const imagePath = path.join(__dirname, 'uploads', imageFilename);
      
      fs.writeFileSync(imagePath, imageBuffer);
    }
  }

  // Update database with just the filename, not the full Base64
  const query = `UPDATE customers SET 
    first_name=?, 
    last_name=?, 
    email=?,
    profile_image=?  // ✅ Now just filename, not Base64
    WHERE id=?`;
  
  const values = [
    firstName,
    lastName, 
    email,
    imageFilename || null,  // ✅ Store filename instead
    req.params.id
  ];
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Customer updated successfully' });
  });
});

// Serve uploaded images
app.get('/uploads/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filepath);
});
```

Frontend adjustment:

```javascript
// In ManageCustomerProfileForm.js, when displaying:
src={selectedProfile.profile_image?.startsWith('data:') 
  ? selectedProfile.profile_image 
  : `/uploads/${selectedProfile.profile_image}`}
```

---

## 🐛 How to Debug

### Check 1: Verify Data is Being Sent

Add this debug line in ManageCustomerProfileForm.js (line 815):

```javascript
const updateData = {
  ...editProfileData,
  ...(profileImage && { profile_image: profileImage })
};
console.log('Sending update with profile_image length:', updateData.profile_image?.length); // ← Add this
await http.put(`/customers/${selectedProfile.id}`, updateData);
```

If console shows a large number (like 50000+), image is being sent ✅

### Check 2: Verify Database Column Exists

Run in your database:

```sql
DESCRIBE customers;  -- MySQL
-- or
\d customers;  -- PostgreSQL
```

Look for `profile_image` column. If missing, that's your problem.

### Check 3: Check Backend Logs

When updating a profile with picture, you should see the profile_image Base64 in your server console. If you don't see it, the backend endpoint isn't even receiving it.

---

## 🚀 Summary

| Component | Status | Issue | Fix |
|-----------|--------|-------|-----|
| Frontend Upload | ✅ Works | None | None needed |
| Frontend Send | ✅ Works | None | None needed |
| Backend Receive | ❓ Unknown | Check logs | See Debug Check 3 |
| **Backend Store** | ❌ **NOT WORKING** | **Image not saved to DB** | **Update PUT endpoint to save `profile_image` column** |
| Frontend Display | ⚠️ Temp Works | Only works with local state | Automatically fixed when backend saves |
| Persistence | ❌ **BROKEN** | **No DB column update** | **Run SQL migration + update backend code** |

---

## 📋 Action Items

1. ✅ Check if `profile_image` column exists in `customers` table
   ```sql
   DESCRIBE customers;
   ```

2. ✅ If missing, create it:
   ```sql
   ALTER TABLE customers ADD COLUMN profile_image LONGTEXT NULL;
   ```

3. ✅ Update your backend `/customers/:id` PUT endpoint to include `profile_image`

4. ✅ Test by:
   - Upload picture
   - Check network tab for Base64 in request
   - Refresh page
   - Picture should persist

---

## 📞 Need Help?

Tell me:
1. **What backend technology?** (Node.js, Python, PHP, etc.)
2. **Database?** (MySQL, PostgreSQL, MongoDB, etc.)
3. **Do you have a `/customers/:id` PUT endpoint?** (Show me the code)
4. **What shows in browser console when uploading?**

I can then provide exact code to fix it!
