# 📧 EmailJS Setup Instructions

## ✅ Code Updated!
Your contact form is now ready to use EmailJS. Just follow these steps to complete the setup.

---

## 🚀 STEP 1: Create EmailJS Account

1. Go to **[https://www.emailjs.com](https://www.emailjs.com)**
2. Click **"Sign Up"** (top right)
3. Sign up with Google/GitHub or email
4. Verify your email address

---

## 📮 STEP 2: Add Email Service

1. Login to EmailJS dashboard
2. Go to **"Email Services"** (left sidebar)
3. Click **"Add New Service"**
4. Choose **Gmail** (or your preferred email provider)
5. Click **"Connect Account"** and authorize
6. **📋 COPY the Service ID** (example: `service_abc1234`)
7. Keep this tab open - you'll need this ID!

---

## 📝 STEP 3: Create Email Template

1. Go to **"Email Templates"** (left sidebar)
2. Click **"Create New Template"**
3. Fill in the template:

### Template Name:
```
Portfolio Contact Form
```

### Email Subject:
```
New Contact from Portfolio - {{subject}}
```

### Email Body (Content):
```html
<h2>New Contact Form Submission</h2>

<p><strong>From:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Subject:</strong> {{subject}}</p>

<hr>

<h3>Message:</h3>
<p>{{message}}</p>

<hr>
<p><small>Sent from your portfolio website on {{reply_to}}</small></p>
```

### Settings Section:
- **From Name:** `{{from_name}}`
- **Reply To:** `{{from_email}}`
- **To Email:** Your email (e.g., `ghiridhars@example.com`)

4. Click **"Save"**
5. **📋 COPY the Template ID** (example: `template_xyz5678`)

---

## 🔑 STEP 4: Get Your Public Key

1. Go to **"Account"** → **"General"** (left sidebar)
2. Scroll to **"Public Key"** section
3. **📋 COPY your Public Key** (example: `aBcD1234EfGh5678`)

---

## 💻 STEP 5: Update Your Code

Now you have these 3 values:
- ✅ Service ID
- ✅ Template ID
- ✅ Public Key

**Open:** `js/contact.js`

**Find this section (around line 9-13):**
```javascript
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',      // Replace with your Public Key from EmailJS
    serviceID: 'YOUR_SERVICE_ID',       // Replace with your Service ID
    templateID: 'YOUR_TEMPLATE_ID'      // Replace with your Template ID
};
```

**Replace with YOUR actual values:**
```javascript
const EMAILJS_CONFIG = {
    publicKey: 'aBcD1234EfGh5678',      // Your actual Public Key
    serviceID: 'service_abc1234',       // Your actual Service ID
    templateID: 'template_xyz5678'      // Your actual Template ID
};
```

**Save the file!**

---

## 🧪 STEP 6: Test Your Contact Form

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Add EmailJS integration to contact form"
   git push origin main
   ```

2. **Wait for GitHub Pages to deploy** (usually 1-2 minutes)

3. **Visit your contact page**

4. **Fill out and submit the form**

5. **Check your email inbox!** 📬

---

## ✨ Expected Result

When someone submits your contact form:

1. ✅ Form shows "Sending..." button
2. ✅ Email is sent via EmailJS
3. ✅ You receive email with:
   - Sender's name
   - Sender's email
   - Subject
   - Message
4. ✅ Form shows success message
5. ✅ Form resets automatically

---

## 🔒 Security Note

Your EmailJS Public Key is safe to include in frontend code because:
- ✅ It can ONLY send emails TO your verified email
- ✅ It cannot be used to spam others
- ✅ EmailJS has rate limiting built-in
- ✅ You can add domain restrictions in EmailJS dashboard

**Optional Security:** Add allowed domain in EmailJS dashboard:
1. Go to Account → Security
2. Add `ghiridhars.github.io` to allowed domains
3. Now your key only works on YOUR website!

---

## 📊 Monitor Your Usage

- Free tier: **200 emails/month**
- Check usage: EmailJS Dashboard → Account → Usage
- You'll get email alerts at 80% and 100% usage

---

## 🆘 Troubleshooting

### Form shows "Email service not configured"
- ❌ You haven't updated the IDs in `contact.js`
- ✅ Update EMAILJS_CONFIG with your actual IDs

### Email not received
- ❌ Check spam/junk folder
- ❌ Verify email in EmailJS template settings
- ❌ Check EmailJS dashboard for failed emails
- ✅ Test again with verified email

### "Failed to send email" error
- ❌ Wrong Service ID or Template ID
- ❌ EmailJS service disconnected
- ✅ Check browser console for error details
- ✅ Verify all IDs are correct

### Browser console shows errors
- ❌ EmailJS SDK not loaded (check contact.html)
- ❌ Public Key incorrect
- ✅ Open browser DevTools → Console for details

---

## 🎉 You're Done!

Once you update the 3 IDs in `contact.js`, your contact form will be fully functional!

**Questions?** Check [EmailJS Documentation](https://www.emailjs.com/docs/)

---

## 📈 Next Steps (Optional)

### Add Auto-Reply to Users
1. In EmailJS dashboard, create second template
2. Use it to send confirmation to the user
3. Update code to send 2 emails (one to you, one to them)

### Add reCAPTCHA
1. Get reCAPTCHA keys from Google
2. Add to your form
3. Update EmailJS settings

### Custom Email Templates
1. Edit template in EmailJS dashboard
2. Add CSS styling
3. Make emails prettier!

---

**Happy coding! 🚀**
