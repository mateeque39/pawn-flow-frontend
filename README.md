# PawnFlow Frontend

Professional pawn shop management system frontend - production-ready React application with centralized configuration, error handling, and logging.

## Features

✅ **Production-Ready Architecture**
- Centralized HTTP client with interceptors and error handling
- Environment-based configuration (dev/staging/production)
- Structured logging with environment-aware output
- Custom error handling with user-friendly messages

✅ **Core Functionality**
- Create and manage loans with comprehensive customer data
- Search loans with multiple filter options
- Payment history tracking
- PDF generation for loan records
- Dynamic pricing calculations

✅ **Customer Data Management**
- First/Last Name separation
- Email, Home Phone, Mobile Phone
- Birthdate and referral tracking
- Identification (Type, Number, Details)
- Address (Street, City, State, Zipcode)

## Project Structure

```
src/
├── config/
│   └── apiConfig.js          # Environment-based API configuration
├── services/
│   ├── httpClient.js         # Axios instance with interceptors
│   ├── logger.js             # Centralized logging service
│   └── errorHandler.js       # Error parsing and user messages
├── CreateLoanForm.js         # Create loan form component
├── SearchLoanForm.js         # Search and manage loans component
├── App.js                    # Main app component
├── index.js                  # React entry point
└── index.css                 # Global styles

.env.example                  # Environment variable template
.env.local                    # Development configuration (git-ignored)
DEPLOYMENT.md                 # Production deployment guide
```

## Installation

```bash
# Install dependencies
npm install

# Install additional for production builds
npm install -D cross-env
```

## Development

```bash
# Start development server (http://localhost:3000)
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Configuration

### Development (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
REACT_APP_LOG_LEVEL=debug
```

### Production (.env.production.local)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
REACT_APP_LOG_LEVEL=error
```

See `.env.example` for all available options.

## Build

```bash
# Development build
npm start

# Production build (optimized)
npm run build:prod

# Staging build
npm run build:staging

# Test production build locally
npx serve -s build
```

## API Integration

All API calls use the centralized HTTP client which:
- Automatically handles authentication tokens (when implemented)
- Logs all requests/responses with duration
- Provides consistent error handling
- Applies cache-busting for fresh data
- Respects environment configuration

### Example API Call
```javascript
import { http } from '../services/httpClient';
import logger from '../services/logger';
import { getErrorMessage } from '../services/errorHandler';

try {
  const response = await http.post('/create-loan', loanData);
  logger.info('Loan created', response.data);
} catch (error) {
  const message = error.userMessage || getErrorMessage(error.parsedError);
  logger.error('Failed to create loan', error.parsedError);
}
```

## Services

### httpClient.js
Centralized Axios instance with:
- Request/response interceptors
- Automatic error enrichment
- Performance logging
- Configurable base URL and timeout

**Usage:**
```javascript
import { http } from '../services/httpClient';

http.get('/endpoint', { params: {...} });
http.post('/endpoint', data);
http.put('/endpoint', data);
http.delete('/endpoint');
```

### logger.js
Environment-aware logging:
- Suppresses debug logs in production
- Structured log formatting with timestamps
- API call logging with status and duration

**Usage:**
```javascript
import logger from '../services/logger';

logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', error);
logger.logApiCall(method, url, status, duration);
```

### errorHandler.js
Error normalization and user messaging:
- Parses Axios errors to standard format
- Detects error type (timeout, network, server, validation)
- Generates user-friendly error messages

**Usage:**
```javascript
import { parseError, getErrorMessage } from '../services/errorHandler';

try {
  // API call
} catch (error) {
  const parsed = parseError(error);
  const message = getErrorMessage(parsed);
  logger.error('Operation failed', parsed);
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- **react** (^19.2.0) - UI framework
- **react-router-dom** (^7.9.6) - Routing
- **axios** (^1.13.2) - HTTP client
- **jspdf** (^3.0.3) - PDF generation
- **react-scripts** (5.0.1) - Build tools

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Environment configuration for production
- Build optimization tips
- Deployment to Vercel/Netlify/Docker
- CI/CD setup
- Monitoring and logging
- Security best practices

## Performance

- Production build includes code minification and tree-shaking
- CSS and JS bundled and compressed
- Images optimized
- Recommended: Use CDN for static assets
- Target: < 2s initial load time

## Security

- ✅ Environment variables for sensitive config
- ✅ HTTPS enforced in production
- ✅ CORS configured for API calls
- ✅ User-friendly error messages (no stack traces exposed)
- ⚠️ Backend authentication/authorization required

## Troubleshooting

**API connection fails**
- Check `REACT_APP_API_URL` environment variable
- Verify backend is running and accessible
- Check CORS headers from backend
- See browser Network tab for details

**Build fails**
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check Node version (requires 14+)
- Review build output for specific errors

**Performance issues**
- Run `npm run build:prod` and check bundle size
- Reduce log level: `REACT_APP_LOG_LEVEL=warn`
- Check DevTools Performance tab

## Contributing

1. Clone the repository
2. Create a feature branch
3. Follow the project structure
4. Test locally before committing
5. Push and create a Pull Request

## License

Proprietary - PawnFlow Management System

## Support

For issues or deployment questions, refer to:
- `DEPLOYMENT.md` - Production setup guide
- `src/services/` - Core service implementations
- Browser console for detailed error logs
