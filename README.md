# NOW: not ordinary weekend

## Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

The API runs at `http://127.0.0.1:8000`. The current development backend uses an in-memory store, so MongoDB is not required for local smoke testing.

To enable Claude itinerary generation, add your Anthropic key to `.env` (keep it server-side):

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-sonnet-4-6
```

Without a key, the API uses a local sample itinerary so the UI remains testable.

## Expo client

Install Node.js 20+ and npm, then run:

```bash
npm install
EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 npm start
```

Use `i` for the iOS simulator, `a` for Android, or open the web target with `npm run web`.

To create a local user before signing in:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"secret123","name":"Your Name"}'
```
# -NOW-not-ordinary-weekend
