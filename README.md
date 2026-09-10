# ShopStack

## Run with Docker

1. Install and start Docker Desktop.
2. Copy `.env.example` to `.env` and set the PostgreSQL and Razorpay values.
3. Start the application:

```bash
docker compose up --build
```

Open the frontend at `http://localhost:5173`. The Spring Boot API is available at
`https://shopstack-backend-gjv6.onrender.com`, and PostgreSQL is available at port `5432`.

For the Vercel frontend, set the production environment variable
`VITE_API_URL` to `https://shopstack-backend-gjv6.onrender.com` and redeploy.

Stop the services with:

```bash
docker compose down
```

The PostgreSQL data is stored in the `postgres-data` Docker volume. To remove the
database data as well, run `docker compose down -v`.
# Enterprise-Multi_-vendor-E-commerce-Platform