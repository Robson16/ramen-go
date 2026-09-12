# RamenGo 🍜

Bem-vindo ao RamenGo! Uma aplicação web moderna, elegante e completa para pedir seu lámen favorito online, contando também com um painel administrativo completo para gestão do restaurante.

## 📝 Sobre o Projeto

Este é o repositório do front-end para o projeto RamenGo, desenvolvido em Next.js. A aplicação permite que os usuários criem contas, autentiquem-se, personalizem e peçam seu próprio lámen (escolhendo caldos e proteínas), acompanhem seus pedidos e gerenciem o cardápio e status de pedidos através de um painel administrativo protegido.

## 🎨 Layout

O design da aplicação foi criado no Figma e pode ser acessado através do seguinte link:

[**Layout no Figma**](https://www.figma.com/design/uDdX536s8ylGc6TVSstATk/RamenGo-%5B2022%5D?node-id=1-21&t=1lJRXdvwphTCg64Q-1)

## ✨ Funcionalidades

- **Autenticação & Contas:** Cadastro de usuários, login seguro via JWT, recuperação/redefinição de senha por e-mail e edição/exclusão de perfil.
- **Cardápio Interativo:** Visualização de opções de caldos e proteínas com imagens, descrições e preços.
- **Montagem e Pedido:** Seleção interativa de caldo e proteína com validação em tempo real e redirecionamento para página de sucesso com os detalhes do pedido.
- **Histórico do Cliente:** Listagem e acompanhamento dos pedidos realizados pelo usuário autenticado.
- **Painel Administrativo (`/admin`):** 
  - Métricas gerais do restaurante.
  - Gestão completa de Caldos e Proteínas (Criação, Edição, Deleção).
  - Gerenciamento e atualização em tempo real do status dos pedidos dos clientes (`PENDING`, `PREPARING`, `READY`, `DELIVERED`).
  - Biblioteca de Mídia (Media Library) para upload e gerenciamento de imagens integradas ao Cloudflare R2.

## 🚀 Tecnologias Utilizadas

- **Next.js (App Router):** Framework React para produção com renderização híbrida.
- **React:** Biblioteca para construção de interfaces de usuário.
- **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
- **Tailwind CSS:** Framework de CSS utility-first para estilização.
- **Tanstack Query (React Query):** Gerenciamento de estado assíncrono, cache e sincronização de dados com a API.
- **Zustand:** Gerenciamento de estado global leve (autenticação).
- **Zod & React Hook Form:** Validação de formulários e schemas com tipagem segura.
- **Axios:** Cliente HTTP para comunicação com a API backend.
- **Vitest & Testing Library:** Testes unitários e de componentes.
- **Playwright:** Testes End-to-End (E2E) automatizados de fluxos de usuário.
- **Lucide React:** Biblioteca de ícones modernos.
- **Sonner:** Notificações *toast* elegantes e responsivas.

## ⚙️ Configuração e Instalação

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/Robson16/ramen-go.git](https://github.com/Robson16/ramen-go.git)
    cd ramen-go
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto com as variáveis abaixo:

    ```env
    NEXT_PUBLIC_IMAGES_BASE_URL=https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
    ```

    Descrição de cada variável:
    - `NEXT_PUBLIC_IMAGES_BASE_URL`: URL base onde as imagens do projeto estão hospedadas.
    - `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend NestJS que o front-end vai consumir (geralmente rodando na porta `3333` localmente).

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:3000`.

## 🧪 Testes

O projeto conta com uma suíte de testes robusta cobrindo componentes, páginas e fluxos críticos:

- **Testes Unitários e de Componentes (Vitest):**
  ```bash
  npm run test
  ```

  Testes End-to-End (Playwright):

  ```bash
  npx playwright test
  ```

## 🌐 API

Este front-end consome a API RESTful desenvolvida em NestJS ([ramen-go-api](https://github.com/Robson16/ramen-go-api)), comunicando-se através de rotas públicas e protegidas por autenticação baseada em Bearer Token (JWT).
