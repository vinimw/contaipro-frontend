# Contaí Pro v2 Frontend

Frontend do Contaí Pro v2 construído com Next.js 16, App Router, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios, Recharts e Lucide.

## Requisitos

- Node.js 20+
- npm 10+
- Backend rodando localmente em `http://127.0.0.1:8000`

## Instalação

```bash
npm install
```

## Configuração

1. Crie seu arquivo local de ambiente a partir do exemplo:

```bash
cp .env.local.example .env.local
```

2. Garanta que a variável esteja assim:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

Importante:

- Use `NEXT_PUBLIC_API_URL`
- Não use `VITE_API_URL`

## Rodando localmente

```bash
npm run dev
```

Abra:

```txt
http://localhost:3000
```

## Build de produção

```bash
npm run build
```

## Como o frontend se conecta ao backend

- Backend base: `http://127.0.0.1:8000`
- API: `http://127.0.0.1:8000/api/v1`
- Swagger: `http://127.0.0.1:8000/docs`

O client HTTP centralizado fica em `src/lib/api.ts`.

Ele já:

- lê a base URL de `NEXT_PUBLIC_API_URL`
- envia `Authorization: Bearer TOKEN`
- limpa a sessão em `401`
- redireciona para `/auth/login` quando a sessão expira

## Estrutura principal

```txt
src/
  app/
    auth/
    app/
  components/
  hooks/
  lib/
  services/
  types/
```

## Fluxo recomendado para testar

1. Acesse `/auth/register`
2. Faça o cadastro com nome, e-mail e telefone
3. Confirme o e-mail com o token recebido
4. Crie a senha em `/auth/set-password`
5. Faça login em `/auth/login`
6. Abra `/app/dashboard`
7. Cadastre uma conta em `/app/bills/new`
8. Marque um pagamento como pago no dashboard
9. Crie um gasto rápido em `/app/expenses` ou pelo modal do dashboard
10. Cadastre uma renda extra em `/app/income`
11. Atualize nome ou senha em `/app/settings`

## Funcionalidades entregues

- Autenticação com cadastro, login, confirmação de e-mail e criação de senha
- Rotas privadas com validação de sessão
- Dashboard com cards, lista de pagamentos, gráfico e atalho para gasto rápido
- Cadastro, edição e remoção de contas
- Gestão de renda mensal e rendas extras
- Gestão de gastos rápidos
- Configurações de perfil e senha
- Manifest PWA básico em `src/app/manifest.ts`

## Observações

- O token fica centralizado em helper para facilitar futura troca de `localStorage` para cookies/sessão mais segura.
- O frontend não expõe secrets e só usa `NEXT_PUBLIC_API_URL` como variável pública.
- Os ícones temporários do web app ficam em `public/icons`.
