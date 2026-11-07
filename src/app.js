import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sessionMiddleware from './config/session.js';
import { defaults } from './middleware/defaults.js';
import { flash } from './middleware/flash.js';
import { csrf } from './middleware/csrf.js';
import { attachUser } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// Render sits behind a proxy. Needed for secure cookies and rate limiting.
if (isProduction) app.set('trust proxy', 1);

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // This directive breaks plain http://localhost in some browsers.
        'upgrade-insecure-requests': isProduction ? [] : null,
      },
    },
  })
);

// Static files and body parsing
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Per-request setup. Order matters: session, then flash/csrf, then the user.
app.use(defaults);
app.use(sessionMiddleware());
app.use(flash);
app.use(csrf);
app.use(attachUser);

// Routes
app.use(routes);

// 404, then the global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
