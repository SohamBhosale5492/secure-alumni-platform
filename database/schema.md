# Database Design

MongoDB collections are created by Mongoose models in the backend and security system.

## Users

```json
{
  "username": "string",
  "email": "string",
  "password": "bcrypt hash",
  "role": "alumni | student | admin",
  "status": "active | blocked | pending",
  "profileImage": "string",
  "resume": "string",
  "documents": [],
  "education": [],
  "company": "string",
  "jobTitle": "string",
  "linkedIn": "string",
  "skills": [],
  "isMentor": "boolean",
  "threatScore": 0,
  "failedLoginCount": 0,
  "captchaRequired": false,
  "cooldownUntil": "date",
  "lockedUntil": "date"
}
```

## Security Logs

```json
{
  "username": "string",
  "userId": "ObjectId",
  "ip": "string",
  "location": {
    "city": "string",
    "country": "string",
    "source": "string"
  },
  "route": "string",
  "method": "string",
  "status": "REQUEST | FAILED_LOGIN | API_ABUSE | DANGEROUS_UPLOAD",
  "statusCode": 200,
  "userAgent": "string",
  "threatScore": 0,
  "threatLevel": "Safe | Warning | Dangerous",
  "actionTaken": "Allow | Warning | Cooldown | CAPTCHA required | Temporary account lock | Temporary IP block"
}
```

## Alerts

```json
{
  "type": "Brute Force Attack",
  "message": "string",
  "severity": "Low | Medium | High | Severe | Critical",
  "actionTaken": "string",
  "ip": "string",
  "acknowledged": false,
  "timestamp": "date"
}
```

## Blocked IPs

```json
{
  "ip": "string",
  "reason": "string",
  "severity": "Critical",
  "blockedAt": "date",
  "blockedUntil": "date"
}
```

## Alumni Platform Collections

- `events`: alumni meetups and institutional events.
- `mentorshiprequests`: student-to-mentor requests and approval state.
- `opportunities`: jobs and internships posted by alumni or admins.
- `announcements`: institution messages by audience.
