# Agente Curador - Newsletter Inteligente 🚀

Este projeto é uma aplicação Full Stack desenvolvida para curadoria automática de notícias de tecnologia, utilizando um worker para busca de dados, uma API para exposição e um frontend para visualização.

## 🛠️ Tecnologias Utilizadas

* **Agente Curador (Worker):** TypeScript, Node.js, Axios, node-postgres.
* **Backend (API):** NestJS, TypeScript.
* **Frontend (SPA):** React, Vite, CSS puro.
* **Banco de Dados:** PostgreSQL (via Docker).
* **Integração:** NewsAPI.

## ⚙️ Como Executar o Projeto

Certifique-se de ter o [Node.js](https://nodejs.org/) e o [Docker](https://www.docker.com/) instalados em sua máquina.

### 1. Configurar o Banco de Dados
Na raiz do projeto, suba o contêiner do PostgreSQL:
\`\`\`bash
docker compose up -d
\`\`\`

### 2. Rodar o Agente Curador (Popular o Banco)
O agente vai buscar as notícias e salvá-las no banco. Crie um arquivo `.env` na pasta `agente-curador` com a sua `NEWS_API_KEY`.
\`\`\`bash
cd agente-curador
npm install
npx ts-node src/index.ts
\`\`\`

### 3. Iniciar a API (Backend)
Em um novo terminal, inicie o servidor NestJS:
\`\`\`bash
cd backend
npm install
npm run start:dev
\`\`\`
A API estará rodando em \`http://localhost:3000/news\`.

### 4. Iniciar a Interface (Frontend)
Em outro terminal, inicie o React:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Acesse \`http://localhost:5173\` no seu navegador para ver os cards de notícias.