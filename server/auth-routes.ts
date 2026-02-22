import { Router } from 'express';
import { registerUser, loginUser } from './auth-standalone';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * تسجيل مستخدم جديد
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const user = await registerUser(email, password, name);

    res.json({
      success: true,
      message: 'تم التسجيل بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'فشل التسجيل',
    });
  }
});

/**
 * POST /api/auth/login
 * تسجيل دخول المستخدم
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    const { user, token } = await loginUser(email, password);

    // Set JWT token in cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(401).json({
      error: error instanceof Error ? error.message : 'فشل تسجيل الدخول',
    });
  }
});

/**
 * POST /api/auth/logout
 * تسجيل خروج المستخدم
 */
authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});
