# AI Commerce

Mini SaaS multi-tenant com IA, criado como desafio técnico para uma posição Fullstack.

A aplicação permite que diferentes empresas gerenciem seus próprios produtos e utilizem um agente de IA para consultar informações reais do banco de dados, mantendo isolamento entre os tenants.

## Stack

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- OpenAI API

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router

## Funcionalidades

- Registro e login com JWT
- Roles `admin` e `user`
- Isolamento multi-tenant por `company_id`
- CRUD de produtos
- Permissões por role
- Chat com IA utilizando tool calling
- Consulta de produtos reais no MongoDB
- Seed com 2 empresas e 10+ produtos por empresa
- Interface responsiva

## Estrutura

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    tools/
    scripts/

frontend/
  src/
    api/
    context/
    pages/
```

A aplicação segue uma separação simples de responsabilidades:

- Controllers recebem e respondem requisições HTTP
- Services concentram as regras de negócio
- Middlewares tratam autenticação e autorização
- Models representam os dados
- Tools representam ações executadas pelo agente de IA

A ideia foi manter a arquitetura simples e fácil de evoluir, evitando abstrações que não agregariam valor para o escopo do desafio.

## Como rodar

### 1. Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env`:

```env
PORT=3000
MONGODB_URI=sua_connection_string
JWT_SECRET=sua_chave
OPENAI_API_KEY=sua_chave_openai
```

Rode o seed:

```bash
npm run seed
```

Depois inicie a API:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

Teste rápido:

```text
GET /health
```

### 2. Frontend

Entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie:

```bash
npm run dev
```

A aplicação ficará disponível normalmente em:

```text
http://localhost:5173
```

## Usuários de teste

A senha para todos os usuários abaixo é:

```text
123456
```

### Tech Store

**Admin**

```text
admin@techstore.com
```

**User**

```text
user@techstore.com
```

### Beauty Store

**Admin**

```text
admin@beautystore.com
```

**User**

```text
user@beautystore.com
```

## Multi-tenant

O isolamento entre empresas foi tratado como uma regra de segurança da aplicação.

O `company_id` nunca é aceito do frontend como fonte de verdade.

Após a autenticação, o tenant é derivado do JWT:

```text
userId
companyId
role
```

Todas as operações de produto utilizam o `companyId` do usuário autenticado.

Por exemplo, uma busca individual utiliza:

```ts
{
  _id: productId,
  company_id: companyId
}
```

e não apenas:

```ts
{
  _id: productId
}
```

Isso impede que um usuário de uma empresa acesse um produto pertencente a outro tenant, mesmo que conheça seu `_id`.

## Autenticação e permissões

A autenticação utiliza JWT.

Existem duas roles.

### Admin

Pode:

- visualizar produtos
- criar produtos
- editar produtos
- excluir produtos
- utilizar o chat

### User

Pode:

- visualizar produtos
- utilizar o chat

A autorização é validada no backend por middleware.

A ausência dos botões administrativos no frontend é apenas uma melhoria de experiência e não representa a camada de segurança.

## Agente de IA

O endpoint:

```text
POST /chat
```

recebe uma mensagem do usuário autenticado.

O LLM possui acesso a uma tool:

```text
search_products
```

Essa tool permite buscar produtos utilizando filtros como:

- texto
- categoria
- preço mínimo
- preço máximo

O LLM pode decidir quais filtros utilizar, mas nunca controla o `company_id`.

O fluxo é:

```text
Usuário
  ↓
POST /chat
  ↓
LLM
  ↓
Tool calling
  ↓
search_products
  ↓
MongoDB
  ↓
Filtro obrigatório por company_id
  ↓
Resultado retorna ao LLM
  ↓
Resposta final
```

Essa decisão permite que a IA consulte dados reais sem ter liberdade para acessar informações de outro tenant.

## Decisões arquiteturais

### Tenant derivado da autenticação

O tenant é obtido do JWT e nunca enviado pelo cliente como parâmetro confiável.

Isso reduz o risco de acesso indevido entre empresas.

### Queries sempre escopadas por tenant

Toda operação de leitura, alteração ou exclusão de produtos utiliza `company_id` junto com o identificador do produto.

### Tool calling controlado pelo backend

A IA pode decidir o que deseja buscar, mas o backend controla onde a busca será executada.

O `company_id` não faz parte dos argumentos expostos ao modelo.

### Controllers finos

Controllers lidam apenas com a camada HTTP.

As regras ficam em services, facilitando manutenção, testes e evolução.

### Arquitetura simples

Evitei patterns e abstrações adicionais que não fossem necessários para o escopo.

A prioridade foi manter separação clara de responsabilidades e código fácil de entender e evoluir.

## O que eu faria diferente em produção

Para um ambiente de produção, eu adicionaria:

- validação mais rígida dos inputs
- refresh tokens
- rate limiting
- logs estruturados
- monitoramento e observabilidade
- tracing das chamadas ao LLM
- testes automatizados de isolamento multi-tenant
- testes de integração
- audit logs
- gerenciamento de secrets
- proteção adicional contra prompt injection
- cache onde aplicável
- índices adicionais baseados no padrão real de consultas
- CI/CD
- Docker Compose
- estratégia de escalabilidade da API
- tratamento centralizado de erros

Também avaliaria limites de uso por tenant e mecanismos de controle de custo para chamadas ao LLM.

## Testes manuais realizados

Foram validados os seguintes cenários:

- admin cria produto
- admin edita produto
- admin exclui produto
- user visualiza produtos
- user não possui ações administrativas
- empresa A não acessa produto da empresa B
- chat da Tech Store retorna apenas produtos da Tech Store
- chat da Beauty Store retorna apenas produtos da Beauty Store
- tool calling consulta dados reais do MongoDB

## Docker

Também é possível subir o MongoDB localmente com Docker:

```bash
docker compose up -d