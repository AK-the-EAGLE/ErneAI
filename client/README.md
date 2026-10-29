# Erne AI client

The React/Vite client is connected to the Express API in `../server`. For full setup, MongoDB configuration, API routes, and practice mode details, see the [project setup guide](../README.md).

## Run the client

```powershell
npm install
npm run dev
```

By default, the client calls `http://localhost:5000`. Set `VITE_API_URL` in `.env.local` if the API runs at another address. Do not put database credentials, authentication secrets, or AI provider keys in client environment variables.

The client uses credentialed browser requests for HTTP-only session cookies. Login state is restored from `GET /api/auth/me`; authentication and learning data are not stored as local demo records.
