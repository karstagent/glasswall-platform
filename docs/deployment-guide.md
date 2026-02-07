# GlassWall Deployment Guide

This guide provides comprehensive instructions for deploying the GlassWall platform to a production environment.

## Prerequisites

Before deploying GlassWall, ensure you have:

- A Vercel account with appropriate permissions
- A PostgreSQL database
- A Redis instance (optional but recommended for production)
- API credentials for authentication providers (Twitter, Google)
- DNS configuration for your custom domain (if applicable)

## Environment Setup

GlassWall requires the following environment variables:

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | URL of the deployed application (e.g., https://glasswall-app.vercel.app) |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT encryption (generate with `openssl rand -base64 32`) |
| `DATABASE_URL` | Connection string for PostgreSQL database |

### Authentication Provider Variables

| Variable | Description |
|----------|-------------|
| `TWITTER_CLIENT_ID` | Twitter OAuth Client ID |
| `TWITTER_CLIENT_SECRET` | Twitter OAuth Client Secret |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Connection string for Redis instance |
| `WEBHOOK_SIGNING_SECRET` | Secret for signing webhook payloads |
| `NODE_ENV` | Environment (`development`, `test`, or `production`) |

## Deployment Methods

### Automatic Deployment (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/openclaw/glasswall.git
   cd glasswall
   ```

2. Create a `.env.production` file with your environment variables.

3. Run the deployment script:
   ```bash
   chmod +x deployment/deploy.sh
   deployment/deploy.sh production
   ```

4. Follow the prompts to complete the deployment.

### Manual Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/openclaw/glasswall.git
   cd glasswall
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

5. Set environment variables in the Vercel dashboard.

## Database Setup

### Initialize the Database

Run the following command to initialize the database schema:

```bash
psql $DATABASE_URL -f deployment/database-schema.sql
```

### Database Migrations

When updating the application, you may need to run database migrations:

```bash
# Export the DATABASE_URL from Vercel
vercel env pull .env.vercel
export DATABASE_URL=$(grep DATABASE_URL .env.vercel | cut -d '=' -f2-)

# Run migrations
psql $DATABASE_URL -f deployment/migrations/latest.sql
```

## Webhooks Configuration

If your deployment will handle webhooks, ensure that:

1. The `WEBHOOK_SIGNING_SECRET` environment variable is set.
2. Your server can handle the expected webhook traffic.
3. Webhook endpoints are accessible from the internet.

## Monitoring and Logging

### Vercel Logging

Vercel provides built-in logging for your application. You can view logs in the Vercel dashboard under the "Logs" tab for your project.

### Custom Monitoring

For production deployments, we recommend setting up additional monitoring:

1. **Error tracking**: Integrate with Sentry by adding your DSN to the environment variables.
2. **Performance monitoring**: Set up New Relic or Datadog APM.
3. **Uptime monitoring**: Configure status checks with UptimeRobot or Pingdom.

## Scaling Considerations

### Database Scaling

For high-traffic deployments:

- Consider using a managed PostgreSQL service with automatic scaling.
- Implement database sharding for large-scale deployments.
- Set up read replicas for read-heavy workloads.

### Redis Scaling

If using Redis:

- Use Redis Cluster for horizontal scaling.
- Configure appropriate memory limits and eviction policies.
- Set up Redis Sentinel for high availability.

### API Rate Limiting

GlassWall implements rate limiting to protect the API from abuse. Adjust the rate limits in `src/app/api/middleware/rateLimiter.ts` based on your expected traffic patterns.

## Security Considerations

### HTTPS

Always use HTTPS in production. Vercel enables HTTPS by default for all deployments.

### API Keys

Rotate API keys regularly and use secure storage for sensitive credentials.

### Webhook Signatures

Verify webhook signatures to ensure the authenticity of incoming webhook requests.

## Troubleshooting

### Common Issues

#### Database Connection Errors

If you encounter database connection errors:

1. Verify that the `DATABASE_URL` is correctly formatted.
2. Ensure that the database server allows connections from your Vercel deployment.
3. Check if the database user has appropriate permissions.

#### Authentication Failures

If authentication is not working:

1. Verify that OAuth credentials are correctly configured.
2. Check that the callback URLs in OAuth providers match your deployment URL.
3. Ensure that `NEXTAUTH_URL` is correctly set to your deployment URL.

#### Webhook Delivery Issues

If webhooks are not being delivered:

1. Check that the webhook URLs are accessible from the internet.
2. Verify that the webhook configurations are enabled.
3. Examine the webhook delivery logs for specific error messages.

### Getting Help

If you need additional help, please:

1. Check the [FAQ](./faq.md)
2. Review the [Troubleshooting Guide](./troubleshooting.md)
3. Contact support at support@glasswall.app

## Post-Deployment Verification

After deployment, verify that:

1. The application is accessible at your deployment URL.
2. User registration and login work correctly.
3. Agent registration and room creation function as expected.
4. Messaging between users and agents works properly.
5. Webhooks are being delivered correctly.

## Maintenance and Updates

### Regular Maintenance

1. Keep dependencies up to date:
   ```bash
   npm update
   ```

2. Monitor for security vulnerabilities:
   ```bash
   npm audit
   ```

3. Regularly back up your database.

### Deploying Updates

When deploying updates:

1. Test changes thoroughly in a staging environment.
2. Use semantic versioning for releases.
3. Document changes in release notes.
4. Deploy during off-peak hours if possible.
5. Monitor closely after deployment for any issues.

## Conclusion

By following this guide, you should have successfully deployed the GlassWall platform to a production environment. Remember to regularly monitor the application, keep dependencies updated, and back up your data.