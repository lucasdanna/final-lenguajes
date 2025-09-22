App Fullstack (ES)

Aplicación fullstack con backend Express y frontend React (Vite). Incluye auth JWT, CRUD de posts, comentarios en tiempo real (Socket.IO) y subida de archivos.

Requisitos
- Node.js 18+

Ejecutar

Backend:

```bash
cd backend
cp .env.example .env
npm run start
```

Frontend:

```bash
cd frontend
npm run dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

Endpoints principales
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET/POST/PUT/DELETE `/api/posts`
- GET/POST/DELETE `/api/comments`
- POST `/api/upload` (campo `file`)

