# Deployment Guide

## Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (your PostgreSQL connection string)
3. Deploy! Railway will automatically run `npm run build` and `npm start`

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (your PostgreSQL connection string)
3. Deploy! Vercel will use the `vercel.json` configuration

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production"
- `PORT`: Will be set automatically by the platform

## Build Process

The application builds to:
- Frontend: `dist/public/` (static files)
- Backend: `dist/index.js` (Node.js server)

The server automatically serves static files in production mode.