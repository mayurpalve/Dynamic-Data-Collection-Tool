# Dynamic Data Collection Tool Frontend

## Environment

Create a `.env` file from `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For deployment, point it to your hosted backend:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
```

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy Notes

- Set `VITE_API_BASE_URL` in your frontend hosting platform.
- The backend must allow your frontend URL in `CLIENT_URLS`.
- Public forms and admin/user dashboards will use the deployed backend automatically once `VITE_API_BASE_URL` is set.
