# Security System

Reusable Express.js middleware for web application security monitoring and intrusion detection.

## Integration

```javascript
const { createSecurityMonitor, securityDashboardRoutes } = require("security-system");

app.use(createSecurityMonitor());
app.use("/api/security", authenticate, requireRole("admin"), securityDashboardRoutes({ userModel: User }));
```

## Exports

- `createSecurityMonitor(options)`
- `secureFileFilter(allowedMimeTypes)`
- `inspectFileUpload(file)`
- `securityDashboardRoutes(options)`
- `evaluateLoginDefense(options)`
- `recordFailedLogin(options)`
- `recordSuccessfulLogin(options)`
- `blockIp(ip, durationMs, reason)`
- `unblockIp(ip)`
- `isIpBlocked(ip)`

## Detection Rules

- Failed logins: 4 triggers cooldown, 8 triggers CAPTCHA, 12 triggers account lock.
- API abuse: 100 requests per minute triggers a 24-hour IP block.
- Repeated injection or XSS payloads trigger a 5-day IP block.
- Dangerous uploads are rejected and logged as alerts.
