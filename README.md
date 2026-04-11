# 🧠 MenteLeve – Banco de Dados com Prisma + SQLite

> Projeto de Banco de Dados – Adrielly Costa, Gabrielle Oliveira e Luisa Varejão

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior instalado
- VS Code (recomendado)

---

## 🚀 Como rodar o projeto

### 1. Instale as dependências

```bash
npm install
```

### 2. Gere o Prisma Client

```bash
npx prisma generate
```

### 3. Crie o banco de dados e aplique as migrações

```bash
npx prisma migrate dev --name init
```

> Isso cria o arquivo `prisma/dev.db` (SQLite) com todas as tabelas.

### 4. Prencha o banco com dados de exemplo

```bash
node prisma/seed.js
```

### 5. Visualize o banco no navegador (Prisma Studio)

```bash
npx prisma studio
```

Abre em: **http://localhost:5555**

---

## 📁 Estrutura do projeto

```
menteleve/
├── prisma/
│   ├── schema.prisma   ← Modelagem das tabelas
│   ├── seed.js         ← Dados de exemplo
│   └── dev.db          ← Banco SQLite (gerado automaticamente)
├── .env                ← Variável DATABASE_URL
├── package.json
└── README.md
```

---

## 🗃️ Tabelas do sistema

| Tabela             | Descrição                                      |
|--------------------|------------------------------------------------|
| `usuarios`         | Usuários cadastrados na plataforma             |
| `tarefas`          | Atividades a serem realizadas                  |
| `habitos`          | Hábitos recorrentes (diário ou semanal)        |
| `registros_habito` | Histórico diário de conclusão de hábitos       |
| `metas`            | Objetivos com prazo e percentual de progresso  |
| `financas`         | Movimentações financeiras (entrada e saída)    |

---

## 💡 Regras de negócio implementadas

- **Isolamento de dados:** cada usuário acessa apenas seus próprios dados (`usuario_id` em todas as tabelas)
- **Hábito por dia:** restrição `@@unique([habitoId, data])` impede duplicidade de registros
- **Saldo dinâmico:** o saldo financeiro não é armazenado — é calculado como `Σ entradas − Σ saídas`
- **Plano premium:** campo `premium` na tabela `usuarios` controla acesso a funcionalidades avançadas
- **Progresso de metas:** campo `progressoPct` com valor entre 0 e 100

---

## 🔧 Scripts disponíveis

| Comando               | O que faz                                      |
|-----------------------|------------------------------------------------|
| `npm run db:migrate`  | Cria/atualiza as tabelas no banco              |
| `npm run db:seed`     | Insere dados de exemplo                        |
| `npm run db:studio`   | Abre o Prisma Studio no navegador              |
| `npm run db:reset`    | Apaga tudo e recria o banco do zero            |
| `npm run db:generate` | Regenera o Prisma Client após alterar o schema |
