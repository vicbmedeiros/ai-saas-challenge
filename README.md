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
- Zod
- Vitest

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router

## Funcionalidades

- Registro e login com JWT
- Login case-insensitive
- Roles `admin` e `user`
- Isolamento multi-tenant por `company_id`
- CRUD de produtos
- Permissões por role
- Validação de entrada com Zod
- Chat com IA utilizando tool calling
- Múltiplas rodadas de tool calling
- Histórico de conversa no chat
- Consulta de produtos reais no MongoDB
- Busca por texto, categoria e faixa de preço
- Seed com 2 empresas e 10+ produtos realistas por empresa
- Testes automatizados de isolamento multi-tenant
- Interface responsiva e moderna
- Docker Compose para MongoDB local

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
    validators/
    scripts/
    tests/

frontend/
  src/
    api/
    components/
    context/
    pages/
```

A aplicação segue uma separação simples de responsabilidades:

- Controllers recebem e respondem requisições HTTP
- Services concentram as regras de negócio
- Middlewares tratam autenticação e autorização
- Models representam os dados
- Validators validam os inputs da aplicação
- Tools representam ações executadas pelo agente de IA
- Tests validam regras críticas de segurança e isolamento

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

Inicie a API em desenvolvimento:

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

### Build do backend

```bash
npm run build
npm start
```

### Testes do backend

```bash
npm test
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

### Build do frontend

```bash
npm run build
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

### Proteção contra alteração de tenant

No create e update, o body da requisição passa por schemas Zod.

Campos não permitidos, como:

```text
company_id
_id
```

não fazem parte dos schemas de produto e não chegam ao service.

Dessa forma, um administrador não consegue mover um produto para outra empresa enviando manualmente um `company_id` no payload.

Essa regra também possui teste automatizado.

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

Os e-mails são normalizados para lowercase no registro e no login.

## Agente de IA

O endpoint:

```text
POST /chat
```

recebe:

```json
{
  "message": "Quais acessórios custam menos de 300 reais?",
  "history": []
}
```

O LLM possui acesso à tool:

```text
search_products
```

Essa tool permite buscar produtos utilizando filtros como:

- texto
- categoria
- preço mínimo
- preço máximo

O `company_id` nunca é exposto como argumento da tool.

Ele é injetado pelo backend a partir do usuário autenticado.

## Fluxo do agente

```text
Usuário
  ↓
POST /chat
  ↓
Histórico da conversa
  ↓
LLM
  ↓
Tool calling
  ↓
Validação dos argumentos com Zod
  ↓
search_products
  ↓
MongoDB
  ↓
Filtro obrigatório por company_id
  ↓
Resultado retorna ao LLM
  ↓
Nova rodada de tool calling, se necessário
  ↓
Resposta final
```

O agente pode executar múltiplas rodadas de tools, com limite de segurança.

Isso permite consultas mais complexas e perguntas de continuação como:

```text
Quais produtos custam menos de 300 reais?
```

seguido de:

```text
E qual deles é o mais barato?
```

O histórico é limitado para evitar crescimento indefinido do contexto.

## Segurança da busca

Os argumentos retornados pelo modelo são validados antes da execução.

A tool utiliza Zod para garantir os tipos esperados.

Também é feito escape dos valores usados em expressões regulares antes da consulta ao MongoDB.

Isso evita que caracteres especiais enviados pelo usuário quebrem a query ou sejam interpretados como regex não intencional.

## Decisões arquiteturais

### Tenant derivado da autenticação

O tenant é obtido do JWT e nunca enviado pelo cliente como parâmetro confiável.

Isso reduz o risco de acesso indevido entre empresas.

### Queries sempre escopadas por tenant

Toda operação de leitura, alteração ou exclusão de produtos utiliza `company_id` junto com o identificador do produto.

### Tool calling controlado pelo backend

A IA pode decidir o que deseja buscar, mas o backend controla onde a busca será executada.

O `company_id` não faz parte dos argumentos expostos ao modelo.

### Validação na fronteira da aplicação

Inputs de autenticação, produtos, chat e argumentos das tools são validados com Zod antes de chegar à lógica principal.

### Controllers finos

Controllers lidam principalmente com a camada HTTP.

As regras ficam em services, facilitando manutenção, testes e evolução.

### Arquitetura simples

Evitei patterns e abstrações adicionais que não fossem necessários para o escopo.

A prioridade foi manter separação clara de responsabilidades e código fácil de entender e evoluir.

## Testes automatizados

Os testes utilizam Vitest e MongoDB Memory Server.

Atualmente são validados cenários críticos de isolamento multi-tenant:

- Empresa B não consegue ler produto da Empresa A
- Empresa B não consegue editar produto da Empresa A
- Empresa B não consegue excluir produto da Empresa A
- `searchProducts` retorna apenas produtos do tenant autenticado
- payload de update contendo `company_id` não altera o tenant do produto

Para executar:

```bash
cd backend
npm test
```

## Testes manuais realizados

Também foram validados manualmente:

- admin cria produto
- admin edita produto
- admin exclui produto
- user visualiza produtos
- user não possui ações administrativas
- empresa A não acessa produto da empresa B
- chat da Tech Store retorna apenas produtos da Tech Store
- chat da Beauty Store retorna apenas produtos da Beauty Store
- tool calling consulta dados reais do MongoDB
- filtros por categoria e preço
- perguntas de continuação utilizando histórico
- login com e-mail utilizando letras maiúsculas e minúsculas
- IDs de produto inválidos retornam erro controlado

## Docker

Também é possível subir o MongoDB localmente com Docker:

```bash
docker compose up -d
```

O MongoDB ficará disponível em:

```text
mongodb://localhost:27017
```

Para utilizar o banco local, configure:

```env
MONGODB_URI=mongodb://localhost:27017/ai-commerce
```

## O que eu faria diferente em produção

Para um ambiente de produção, eu adicionaria:

- refresh tokens e estratégia de revogação
- revalidação de role durante sessões longas
- rate limiting por usuário e tenant
- CORS restrito aos domínios permitidos
- políticas mais rígidas para `JWT_SECRET`
- logs estruturados
- monitoramento e observabilidade
- tracing das chamadas ao LLM
- testes adicionais de integração e end-to-end
- audit logs
- gerenciamento centralizado de secrets
- proteção adicional contra prompt injection
- limites de uso por tenant
- controle de custo das chamadas ao LLM
- persistência server-side do histórico de conversa
- transactions no fluxo de criação de empresa e usuário
- convite de usuários para empresas existentes
- índices adicionais baseados no padrão real de consultas
- CI/CD
- estratégia de escalabilidade da API
- tratamento centralizado de erros
