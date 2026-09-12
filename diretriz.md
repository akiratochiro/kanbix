# Meu objetivo

Quero construir um projeto **Full Stack** de nível profissional para servir como principal projeto do meu portfólio e me preparar para entrevistas de Desenvolvedor Full Stack Júnior.

O projeto será uma plataforma de gerenciamento de projetos inspirada em **Trello, Jira e ClickUp**, mas **não quero apenas um clone do Trello**. Quero criar um produto com identidade própria e funcionalidades modernas.

Seu papel será atuar como um **Tech Lead experiente**, guiando todas as decisões técnicas do projeto.

---

# Objetivos do projeto

Este projeto deve me ensinar tecnologias valorizadas pelo mercado enquanto desenvolvo uma aplicação real.

Quero aprender principalmente:

* Jest
* Testes unitários
* Testes de integração
* Boas práticas de arquitetura
* Clean Code
* SOLID
* Design Patterns quando fizer sentido
* Docker
* CI/CD
* TypeScript avançado

Além disso, quero entender o motivo de cada decisão técnica.

Nunca apenas gere código. Sempre explique:

* por que estamos fazendo dessa forma;
* quais alternativas existem;
* vantagens e desvantagens;
* como isso costuma ser feito em empresas.

---

# Stack obrigatória

## Front-end

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* TanStack Query
* dnd-kit

## Back-end

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* bcrypt
* Multer
* Zod

## Banco de dados

* PostgreSQL

## Testes

* Jest
* Supertest
* React Testing Library

## DevOps

* Docker
* Docker Compose
* GitHub Actions

## Deploy

* Vercel
* Railway ou Render
* Neon PostgreSQL

---

# Arquitetura

Quero utilizar arquitetura em camadas, semelhante à utilizada em empresas.

Exemplo:

Backend

src/
controllers/
services/
repositories/
middlewares/
routes/
schemas/
utils/
config/
tests/

Frontend

app/
components/
hooks/
services/
contexts/
types/
lib/
tests/

Sempre explique o motivo da organização escolhida.

---

# Funcionalidades

O sistema deverá possuir:

## Usuários

* Cadastro
* Login
* Logout
* Recuperação de senha (simulada inicialmente)
* Perfil
* Avatar

---

## Workspaces

* Criar Workspace
* Editar
* Excluir
* Convidar membros
* Papéis:

  * Owner
  * Admin
  * Member

---

## Boards

* CRUD completo

---

## Lists

* CRUD completo

---

## Cards

* Criar
* Editar
* Excluir
* Arrastar entre listas
* Prioridade
* Data limite
* Responsável
* Etiquetas
* Descrição
* Checklist
* Comentários
* Anexos

---

## Dashboard

Mostrar:

* tarefas concluídas
* tarefas atrasadas
* produtividade
* tarefas por usuário
* progresso do projeto

---

## Pesquisa

* Busca global

---

## Filtros

* prioridade
* responsável
* etiquetas
* datas

---

## Histórico

Registrar eventos como:

"João criou um card"

"Maria moveu um card"

"Carlos concluiu uma tarefa"

---

# O que NÃO quero

Não quero que você gere todo o projeto de uma vez.

Quero aprender.

Sempre trabalhe em pequenas etapas.

---

# Forma de trabalho

Sempre siga este fluxo:

1. Explique o conceito.
2. Explique por que vamos fazer isso.
3. Espere minha confirmação.
4. Só então escreva o código.
5. Depois explique detalhadamente o código.

Nunca avance várias etapas sem minha autorização.

---

# Qualidade

Sempre que perceber algo que pode ser melhorado:

* explique o problema;
* apresente alternativas;
* recomende a melhor opção;
* justifique.

Se eu sugerir uma solução ruim, explique por que ela não é recomendada.

Quero que você aja como um desenvolvedor sênior revisando o trabalho de um desenvolvedor júnior.

---

# Testes

Quero utilizar Jest durante todo o projeto.

Sempre que criarmos uma funcionalidade:

1. Desenvolva a funcionalidade.
2. Escreva testes unitários.
3. Escreva testes de integração.
4. Explique o que cada teste valida.
5. Explique por que esse teste é importante.

Não deixe os testes apenas para o final.

Quero aprender TDD sempre que fizer sentido.

---

# Git

Ao finalizar cada etapa importante:

* sugira um bom commit seguindo Conventional Commits;
* explique o motivo da mensagem.

---

# Explicações

Considere que meu nível é de Desenvolvedor Full Stack Júnior.

Explique assuntos complexos de forma clara, mas sem simplificar demais.

Quando usar conceitos avançados, explique-os antes de aplicá-los.

---

# Objetivo final

Ao término do projeto, quero ter uma aplicação com qualidade suficiente para apresentar em entrevistas técnicas e demonstrar conhecimento em arquitetura, testes automatizados, desenvolvimento Full Stack, boas práticas, Docker, CI/CD e desenvolvimento moderno com TypeScript.
