# SmartFeedback AI Backend

The backend API for SmartFeedback AI, an application for generating feedback, managing contacts, sending messages, and viewing engagement analytics.

## Requirements

- Node.js with ES module support
- MongoDB, either local or hosted
- npm

Optional provider credentials are needed to enable live AI generation, email delivery, or SMS delivery.

## Getting started

From this directory (`backend`):

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env` with your MongoDB connection string and a unique JWT secret. `.env.example` is a blank template; the application has development defaults for some settings, but production deployments must supply their own secrets and service credentials.

Start the API in development mode:

```powershell
npm run dev
```

Or start it without the file watcher:

```powershell
npm start
```

By default, the API listens on `http://localhost:5001`. The MongoDB default is `mongodb://127.0.0.1:27017/smartfeedback`.

## Configuration

All settings are optional in development unless stated otherwise. Add only the settings you need to `.env`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `5001` |
| `NODE_ENV` | Runtime mode (`development`, `test`, or `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/smartfeedback` |
| `JWT_SECRET` | Secret used to sign authentication tokens; set a unique strong value, especially in production | Development fallback |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `HF_API_TOKEN` | Hugging Face token for live AI inference | Empty in the environment template |
| `GEMINI_API_KEY` | Gemini API key for integrations that use Gemini | Empty |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Empty |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | Empty |
| `TWILIO_PHONE_NUMBER` | Sender number for SMS | Empty |
| `GMAIL_USER` | Gmail address for email delivery | Empty |
| `GMAIL_APP_PASSWORD` | Gmail app password | Empty |
| `SMTP_HOST` | Custom SMTP host; when set, custom SMTP is used | Empty |
| `SMTP_PORT` | Custom SMTP port | `587` |
| `SMTP_SECURE` | Use a secure SMTP connection (`true` or `false`) | `false` |
| `SMTP_USER` | Custom SMTP username | Empty |
| `SMTP_PASS` | Custom SMTP password | Empty |
| `EMAIL_FROM_NAME` | Sender display name | `SmartFeedback AI` |
| `MAX_FEEDBACK_COUNT` | Maximum requested feedback items | `50` |
| `AI_REQUESTS_PER_MINUTE` | AI generation requests allowed per minute | `10` |
| `MAX_RECIPIENTS_PER_SEND` | Maximum recipients in one send request | `100` |
| `MAX_MESSAGES_PER_MINUTE` | Message sends allowed per minute | `20` |

Email delivery uses either the custom SMTP settings or Gmail credentials. SMS uses Twilio when configured. Without delivery credentials, those integrations may return mock results and will not deliver real messages.

## API

All endpoints are prefixed with `/api`. JSON request bodies are supported. Protected endpoints require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api` | No | API status and version |
| `GET` | `/api/health` | No | Health and MongoDB connection status |
| `POST` | `/api/auth/register` | No | Register an account |
| `POST` | `/api/auth/login` | No | Log in |
| `POST` | `/api/auth/forgot-password` | No | Request password recovery |
| `GET` | `/api/auth/me` | Yes | Get the current account |
| `POST` | `/api/auth/logout` | Yes | Log out |
| `GET` | `/api/feedback` | Yes | List feedback |
| `GET`, `PUT`, `DELETE` | `/api/feedback/:id` | Yes | Read, update, or delete feedback |
| `POST` | `/api/feedback/generate` | Yes | Generate feedback |
| `POST` | `/api/feedback/:id/regenerate` | Yes | Regenerate feedback |
| `POST` | `/api/feedback/:id/approve` | Yes | Approve feedback |
| `GET`, `POST` | `/api/contacts` | Yes | List or create contacts |
| `GET`, `PUT`, `DELETE` | `/api/contacts/:id` | Yes | Read, update, or delete a contact |
| `POST` | `/api/contacts/import` | Yes | Import contacts from a CSV file (`file` form field; maximum 5 MB) |
| `POST` | `/api/messages/send` | Yes | Send a message |
| `GET` | `/api/messages/history` | Yes | List message history |
| `GET` | `/api/messages/history/:id` | Yes | Read a message history entry |
| `GET` | `/api/analytics`, `/api/analytics/overview` | Yes | Get analytics overview |
| `GET` | `/api/analytics/charts` | Yes | Get chart data |
| `GET` | `/api/analytics/dashboard` | Yes | Get dashboard data |
| `GET` | `/api/analytics/generation` | Yes | Get generation analytics |
| `GET` | `/api/analytics/messages` | Yes | Get messaging analytics |
| `GET`, `PUT` | `/api/user/profile` | Yes | Read or update the profile |
| `PUT` | `/api/user/preferences` | Yes | Update preferences |
| `PUT` | `/api/user/password` | Yes | Update the password |

Authentication endpoints return a token on successful login or registration. Use that token as a Bearer token for protected routes.

## Tests

Run the backend tests with:

```powershell
npm test
```

## Security and deployment

- Keep `.env` out of version control. The repository ignores environment files; use `.env.example` as the safe template.
- Configure a strong, unique `JWT_SECRET` and production MongoDB credentials before deploying.
- Configure `CLIENT_URL` to the deployed frontend origin.
- Set real provider credentials before using email, SMS, or AI integrations in production; mock delivery results are not proof that a message was sent.
