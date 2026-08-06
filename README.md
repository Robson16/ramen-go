# RamenGo 🍜

Bem-vindo ao RamenGo! Uma aplicação web simples e elegante para pedir seu lámen favorito online.

## 📝 Sobre o Projeto

Este é o repositório do front-end para o projeto RamenGo. A aplicação permite que os usuários personalizem e peçam seu próprio lámen, escolhendo entre uma variedade de caldos (broths) e proteínas. Após a confirmação do pedido, o usuário é redirecionado para uma página de sucesso.

## 🎨 Layout 

O design da aplicação foi criado no Figma e pode ser acessado através do seguinte link:

[**Layout no Figma**](https://www.figma.com/design/uDdX536s8ylGc6TVSstATk/RamenGo-%5B2022%5D?node-id=1-21&t=1lJRXdvwphTCg64Q-1)

## ✨ Funcionalidades

-   Visualização de opções de caldos e proteínas com imagens, descrição e preço.
-   Seleção de um caldo e uma proteína para montar o pedido.
-   Validação de formulário em tempo real para habilitar o botão de pedido.
-   Envio do pedido para uma API backend.
-   Redirecionamento para uma página de sucesso com os detalhes do pedido.

## 🚀 Tecnologias Utilizadas

-   **Next.js:** Framework React para produção.
-   **React:** Biblioteca para construir interfaces de usuário.
-   **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
-   **Tailwind CSS:** Framework de CSS utility-first para estilização.
-   **HTML5 & CSS3:** Estrutura e estilização da página.

## ⚙️ Configuração e Instalação

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/ramen-go.git
    cd ramen-go
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo. O arquivo pode ser baseado no exemplo em `.env.example`:

    ```env
    NEXT_PUBLIC_IMAGES_BASE_URL=https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
    NEXT_PUBLIC_API_KEY=sua-chave-de-api
    ```

    Descrição de cada variável:
    - `NEXT_PUBLIC_IMAGES_BASE_URL`: URL base onde as imagens do projeto estão hospedadas.
    - `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend que o front-end vai consumir.
    - `NEXT_PUBLIC_API_KEY`: chave de autenticação enviada nas requisições para a API.

    Se você estiver usando a API localmente, mantenha as URLs apontando para `http://localhost:3333`. Se estiver usando um ambiente remoto, substitua pelos valores corretos fornecidos pelo backend.

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:3000`.

## 🌐 API

Este projeto front-end consome uma API backend para funcionar. A API deve fornecer os seguintes endpoints:

-   `GET /broths`: Retorna a lista de caldos disponíveis.
-   `GET /proteins`: Retorna a lista de proteínas disponíveis.
-   `POST /orders`: Recebe um novo pedido com `brothId` e `proteinId`.

É necessário uma chave de API (`x-api-key`) para autenticar as requisições.