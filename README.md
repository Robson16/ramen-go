# RamenGo 🍜

Bem-vindo ao RamenGo! Uma aplicação web simples e elegante para pedir seu lámen favorito online.

## 📝 Sobre o Projeto

Este é o repositório do front-end para o projeto RamenGo. A aplicação permite que os usuários personalizem e peçam seu próprio lámen, escolhendo entre uma variedade de caldos (broths) e proteínas. Após a confirmação do pedido, o usuário é redirecionado para uma página de sucesso.

## ✨ Funcionalidades

-   Visualização de opções de caldos e proteínas com imagens, descrição e preço.
-   Seleção de um caldo e uma proteína para montar o pedido.
-   Validação de formulário em tempo real para habilitar o botão de pedido.
-   Envio do pedido para uma API backend.
-   Redirecionamento para uma página de sucesso com os detalhes do pedido.

## 🚀 Tecnologias Utilizadas

-   **Vite:** Build tool para desenvolvimento web moderno.
-   **JavaScript (Vanilla):** Linguagem principal da aplicação, sem uso de frameworks.
-   **Web Components:** Para criar componentes de UI reutilizáveis e encapsulados.
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
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis, substituindo pelos valores da sua API:

    ```
    VITE_API_BASE_URL=https://api.tech.redventures.com.br
    VITE_IMAGES_BASE_URL=https://api.tech.redventures.com.br/images
    VITE_API_KEY=sua-chave-de-api-secreta
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## 🌐 API

Este projeto front-end consome uma API backend para funcionar. A API deve fornecer os seguintes endpoints:

-   `GET /broths`: Retorna a lista de caldos disponíveis.
-   `GET /proteins`: Retorna a lista de proteínas disponíveis.
-   `POST /orders`: Recebe um novo pedido com `brothId` e `proteinId`.

É necessário uma chave de API (`x-api-key`) para autenticar as requisições.