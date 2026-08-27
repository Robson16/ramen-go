# 📋 Backlog do Front-end: RamenGO!

Este documento mapeia todas as tarefas necessárias para atualizar a interface web do RamenGO!, integrando-a com as novas funcionalidades avançadas do Back-end (Autenticação JWT, Perfis de Usuário e Painel Administrativo).

---

## 🔐 Épico 1: Fundação e Autenticação (JWT)

**Contexto:** O sistema antigo usava uma `x-api-key` estática. O novo back-end exige autenticação real via JWT (Bearer token).

### User Story 1.1: Autenticação via JWT

> _"Como usuário, quero poder me registrar e fazer login para acessar o cardápio e fazer pedidos."_

- [x] Configurar um cliente HTTP (`axios` interceptors) para injetar o token JWT em todas as requisições autenticadas.
- [x] Criar gerenciamento de estado global (Context API ou Zustand) para armazenar os dados do usuário logado e o token.
- [x] Criar página de Cadastro (Register) integrando com `POST /accounts`.
- [x] Criar página de Login integrando com `POST /sessions`.

### User Story 1.2: Recuperação de Senha

> _"Como usuário, quero poder recuperar minha senha caso a tenha esquecido."_

- [ ] Criar tela de "Esqueci minha senha" integrando com `POST /users/password-reset` (envio de e-mail).
- [ ] Criar tela de "Redefinir senha" (acessada via link de e-mail) integrando com `PATCH /users/password-reset`.

---

## 🍜 Épico 2: Área do Cliente (Evolução do Pedido)

**Contexto:** A tela de pedidos já existe, mas precisa ser protegida e ganhar novas funcionalidades com base no perfil do usuário.

### User Story 2.1: Fluxo de Pedido Autenticado

> _"Como cliente autenticado, quero ver o cardápio e montar meu lámen."_

- [ ] Refatorar as chamadas de `GET /broths` e `GET /proteins` para usarem o token JWT (remover envio de `x-api-key`).
- [ ] Refatorar o envio do pedido (`POST /orders`) para enviar apenas `brothId` e `proteinId`, já que o back-end agora pega o `userId` pelo token.
- [ ] Atualizar a página de sucesso para buscar os detalhes do pedido usando `GET /orders/:id` com os dados completos do back-end.

### User Story 2.2: Histórico de Pedidos e Perfil

> _"Como cliente, quero ver meus pedidos anteriores e gerenciar minha conta."_

- [ ] Criar a página "Meus Pedidos" integrando com `GET /orders/me` (usando React Query para listagem).
- [ ] Criar a página de "Meu Perfil" integrando com `GET /me`.
- [ ] Adicionar formulário para edição de perfil (`PUT /me`).
- [ ] Adicionar botão "Excluir Conta" com modal de confirmação (`DELETE /me`).

---

## 🛡️ Épico 3: Infraestrutura de Proteção de Rotas (Next.js)

**Contexto:** Não podemos deixar que clientes comuns acessem rotas de administração, nem que usuários não logados acessem a área de pedidos.

### User Story 3.1: Route Guards (Middleware)

> _"Como desenvolvedor, quero proteger as rotas da aplicação garantindo que apenas usuários com as permissões corretas acessem as páginas."_

- [ ] Criar um `middleware.ts` no Next.js (ou HOCs) para redirecionar usuários não autenticados para o `/login`.
- [ ] Implementar verificação de `Role` (USER vs ADMIN) no front-end.
- [ ] Criar rota base `/admin` e bloquear acesso de usuários que não possuem a role `ADMIN`.

---

## ⚙️ Épico 4: Painel Administrativo (Backoffice)

**Contexto:** Uma área totalmente nova para o dono do restaurante gerenciar caldos, proteínas e os status dos pedidos.

### User Story 4.1: Gestão de Ingredientes (Catálogo)

> _"Como administrador, quero listar, criar, editar e excluir caldos e proteínas do sistema."_

- [ ] Criar layout base para o Painel Admin (Sidebar, Header, etc).
- [ ] Criar página de Listagem de Caldos e Proteínas em formato de tabela (CRUD - Read).
- [ ] Criar modais/páginas com formulários (React Hook Form + Zod) para Criação e Edição de Caldos/Proteínas.
- [ ] Integrar endpoints administrativos: `POST`, `PUT`, e `DELETE` para caldos e proteínas.

### User Story 4.2: Upload de Imagens

> _"Como administrador, quero fazer upload das artes (SVGs) dos ingredientes diretamente pelo painel."_

- [ ] Criar componente de _Dropzone_ (ou input file) nos formulários de criação/edição de ingredientes.
- [ ] Integrar com a rota `POST /images` para subir as versões "Ativa" e "Inativa" antes de salvar o ingrediente.

### User Story 4.3: Gestão de Pedidos (Kanban / Tabela)

> _"Como administrador, quero ver todos os pedidos dos clientes e atualizar o status deles em tempo real."_

- [ ] Criar tela de "Gestão de Pedidos" (Admin) integrando com `GET /orders/all`.
- [ ] Criar interface (botões ou selects) para alterar o status do pedido (PENDING -> PREPARING -> READY -> DELIVERED).
- [ ] Integrar ação de mudança de status com `PATCH /orders/:id/status`.

---

## 🎨 Épico 5: UI/UX e Tratamento de Erros

**Contexto:** Garantir que o sistema informe adequadamente o usuário caso a API retorne erros.

### User Story 5.1: Feedback Visual e Validações

> _"Como usuário, quero saber imediatamente se digitei uma senha errada ou se tentei acessar algo que não devo."_

- [ ] Criar sistema global de Toasts/Snackbars (ex: `sonner` ou `react-hot-toast`) para exibir mensagens de sucesso ou erro vindas da API.
- [ ] Tratar erro `401 Unauthorized` globalmente no Axios (deslogar o usuário e redirecionar para `/login` se o token expirar).
- [ ] Tratar erros `409 Conflict` (ex: "Caldo já existente" ou "Pedido já entregue") com mensagens amigáveis na UI.
