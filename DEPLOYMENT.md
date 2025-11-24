# PawnFlow Frontend - Deployment Guide

## Environment Configuration

### Environment Variables

Set these variables for your deployment environment. Create a `.env.production.local` file for production:

```bash
# Production API Configuration
REACT_APP_API_URL=https://api.yourdomain.com  # Use HTTPS in production
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=production
REACT_APP_LOG_LEVEL=error  # Suppress debug logs in production

# Optional Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

### Environment Files

- `.env.example` - Template with all available options
- `.env.local` - Local development (git-ignored)
- `.env.production.local` - Production config (git-ignored)
- `.env.staging.local` - Staging config (git-ignored)

## Build & Deployment

### Development Build
```bash
npm install
npm start
```

### Production Build
```bash
# Install dependencies
npm install

# Build for production
npm run build:prod

# Test the production build locally
npx serve -s build
```

### Staging Build
```bash
npm run build:staging
```

### Testing
```bash
# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Automatic deployments on push

### Netlify
```bash
npm install netlify-cli -g
netlify deploy --prod --dir=build
```

### Docker (for any server)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t pawnflow-frontend .
docker run -p 80:80 pawnflow-frontend
```

## Performance Optimization

- Production build automatically minifies and optimizes code
- CSS and JS are bundled and compressed
- Set `REACT_APP_LOG_LEVEL=error` to reduce console noise
- Use HTTPS and CDN for serving static assets

## Security Best Practices

1. **Never commit sensitive data** - Use `.env` files (git-ignored)
2. **API Endpoints** - Always use HTTPS in production
3. **CORS** - Configure backend to allow frontend domain only
4. **Authentication** - Implement bearer token auth (ready in `httpClient.js`)
5. **Input Validation** - Frontend validation + backend validation required

## Monitoring & Logging

- Production logging configured to capture errors only
- HTTP client logs API calls with status codes and duration
- Error responses include user-friendly messages + server details
- Check browser console in production to diagnose issues

## Troubleshooting

### API Connection Issues
- Verify `REACT_APP_API_URL` is correct and accessible
- Check CORS headers from backend
- Verify firewall/proxy allows requests

### Build Failures
- Clear `node_modules`: `rm -r node_modules && npm install`
- Check Node version: `node --version` (requires 14+)

### Performance Issues
- Run `npm run build:prod` and check bundle size
- Reduce `REACT_APP_LOG_LEVEL` to `warn` or `error`
- Enable gzip compression on web server

## Version Management

Update version in `package.json` for releases:
```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [master]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build
        run: npm run build:prod
        env:
          REACT_APP_API_URL: ${{ secrets.PRODUCTION_API_URL }}
      
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Support

For issues or questions, check:
- `src/services/` for HTTP/logging/error handling
- `src/config/` for environment configuration
- Frontend console logs for detailed error messages
