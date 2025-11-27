# 🚀 Quick Commands to Push to GitHub

Your project is ready! Just follow these commands after creating your GitHub repository.

## 📝 Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `Zwiggato`
3. Description: `Full-stack food delivery platform with DevOps CI/CD`
4. Choose Public or Private
5. **⚠️ Do NOT** check "Initialize with README"
6. Click "Create repository"

## 🔗 Step 2: Add Remote and Push

**Replace `YOUR_USERNAME` with your actual GitHub username!**

```powershell
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/Zwiggato.git

# Verify remote was added
git remote -v

# Your default branch is 'master', so push with:
git push -u origin master
```

## 🔐 Step 3: Authenticate

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your password)
  - Create token: https://github.com/settings/tokens
  - Select scope: `repo` (full control)
  - Copy token and paste as password

## ✅ Verify

After pushing, visit:
```
https://github.com/YOUR_USERNAME/Zwiggato
```

You should see all your files!

---

## 🆘 If You Get Errors

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/Zwiggato.git
```

### "Authentication failed"
- Use Personal Access Token instead of password
- Create at: https://github.com/settings/tokens

### "Permission denied"
- Check repository URL is correct
- Verify you have write access to the repo

---

**That's it! Your project will be on GitHub! 🎉**



