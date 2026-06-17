# Settings sync validation

## Objetivo

Validar manualmente que el frontend sincroniza settings contra el backend local.

## Precondiciones

- Backend FastAPI disponible en http://localhost:8000.
- Frontend Next.js disponible en http://localhost:3000.
- apps/web/.env.local contiene NEXT_PUBLIC_CYBERMAP_API_URL=http://localhost:8000.

## Checklist

- [ ] Levantar backend con uvicorn.
- [ ] Verificar GET /health.
- [ ] Verificar GET /settings.
- [ ] Levantar frontend con Next.js.
- [ ] Abrir /settings.
- [ ] Modificar un setting desde la UI.
- [ ] Confirmar que el badge pasa por syncing.
- [ ] Confirmar que el badge termina en synced.
- [ ] Confirmar en backend que llega PUT /settings 200 OK.
- [ ] Confirmar con GET /settings que el cambio quedó persistido.

## Comandos

```bash
cd apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

```bash
curl http://localhost:8000/health
curl http://localhost:8000/settings
```

```bash
npm --prefix apps/web run dev
```
