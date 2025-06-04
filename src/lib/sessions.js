// Updated sessions.js for iron-session v7+
import { getIronSession } from 'iron-session';

export const sessionOptions = {
  password: 'process.env.SESSION_SECRETscetvebhb',
  cookieName: 'myapp_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Helper for API routes
export function withSessionRoute(handler) {
  return async function sessionRoute(req, res) {
    req.session = await getIronSession(req, res, sessionOptions);
    return handler(req, res);
  };
}

// Helper for SSR
export function withSessionSsr(handler) {
  return async function sessionSsr(context) {
    context.req.session = await getIronSession(
      context.req,
      context.res,
      sessionOptions
    );
    return handler(context);
  };
}