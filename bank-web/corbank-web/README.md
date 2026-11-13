# Core Bank — web

SPA em React 18 + Vite, integrada ao `corebank-api` (Spring Boot).

## Rodando

1. Suba o backend (porta 8080).
2. Aqui em `bank-web/corbank-web`:

```bash
npm install
npm run dev     # http://localhost:5173
```

Em desenvolvimento o Vite encaminha `/api` para `http://localhost:8080` (veja `vite.config.js`;
use `VITE_PROXY_TARGET` para outro endereço). Em produção, defina `VITE_API_URL` (veja `.env.example`)
e inclua a origem do site em `app.cors.allowed-origins` no backend.

## Endpoints usados

| Tela | Chamada |
|---|---|
| Entrar | `POST /api/autenticacao/login` |
| Abrir conta | `POST /api/autenticacao/cadastrar-se` |
| Resumo | `GET /api/usuarios/me` |
| Extrato | `GET /api/contas/{id}/transactions` |
| Transferir | `POST /api/transacoes/transferencia` |
| Depositar | `POST /api/transacoes/deposito` |
