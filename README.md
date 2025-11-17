# HUB Logística - Frontend

Aplicação web frontend para gerenciamento logístico, controle e rastreamento de entregas em tempo real.

## Sobre o Projeto

O HUB Logística Frontend é uma aplicação web desenvolvida para gerenciar operações logísticas, permitindo o controle e rastreamento de entregas em tempo real. O sistema oferece uma interface intuitiva para que gestores e operadores possam monitorar todo o processo logístico através de um painel administrativo completo.

## Funcionalidades Principais

### Autenticação e Segurança

- Sistema de login seguro com validação de credenciais
- Gerenciamento de sessões de usuário
- Verificação de autenticação em todas as rotas protegidas
- Perfil de usuário com avatar e informações pessoais

### Rastreamento de Entregas

- Rastreamento em tempo real de entregas de múltiplas transportadoras
- Visualização detalhada de status de entregas
- Integração com transportadoras: Ouro Negro, Alfa, Princesa e outras
- Tabelas interativas com DataTables para melhor visualização
- Modal de detalhes com informações completas de cada entrega

### Painel Administrativo

- Gerenciamento completo de usuários (CRUD)
- Controle de sessões ativas
- Gestão de estados e cidades
- Cadastro e gerenciamento de transportadoras
- Configuração de faixas de peso
- Gerenciamento de rotas
- Configuração de preços por faixas de peso e rotas
- Sistema de paginação para grandes volumes de dados
- Busca e filtros em todas as entidades

### Interface do Usuário

- Sistema de abas dinâmico com drag and drop
- Sidebar responsiva e colapsável
- Notificações em tempo real
- Modais para confirmações e formulários
- Design moderno e responsivo

## Tecnologias Utilizadas

### Frontend

- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e layout responsivo
- **JavaScript (ES6+)**: Lógica da aplicação
- **Bootstrap 5**: Framework CSS para componentes
- **Font Awesome**: Ícones
- **DataTables**: Tabelas interativas e responsivas

### Backend (Servidor Express)

- **Node.js**: Ambiente de execução
- **Express.js**: Framework web para servir arquivos estáticos
- **Nodemon**: Reinicialização automática em desenvolvimento

### Testes

- **Jest**: Framework de testes
- **Jest Environment JSDOM**: Ambiente DOM para testes

## Estrutura do Projeto

```
hub-logistica/
├── public/                          # Arquivos estáticos
│   ├── assets/                      # Recursos estáticos
│   │   ├── icons/                   # Ícones SVG
│   │   └── images/                  # Imagens e logos
│   │       └── transportadoras/     # Logos das transportadoras
│   ├── html/                        # Páginas HTML
│   │   ├── login.html               # Página de login
│   │   ├── index.html               # Página principal (Dashboard)
│   │   └── administration.html      # Painel administrativo
│   ├── javascripts/                 # Scripts JavaScript
│   │   ├── admin/                   # Módulos administrativos
│   │   │   ├── api/                 # Chamadas API administrativas
│   │   │   ├── auth/                # Autenticação administrativa
│   │   │   ├── entities/            # Gerenciamento de entidades
│   │   │   ├── events/              # Eventos administrativos
│   │   │   ├── state/               # Gerenciamento de estado
│   │   │   ├── tabs/                # Sistema de abas
│   │   │   └── utils/               # Utilitários administrativos
│   │   ├── auth/                    # Sistema de autenticação
│   │   │   ├── core/                # Lógica core de autenticação
│   │   │   ├── ui/                  # Interface de autenticação
│   │   │   └── validators/          # Validadores de formulários
│   │   ├── core/                    # Módulos core da aplicação
│   │   │   ├── appInitializer.js    # Inicializador da aplicação
│   │   │   └── moduleLoader.js      # Carregador de módulos
│   │   ├── login/                   # Módulo de login
│   │   ├── rastreamento/            # Módulo de rastreamento
│   │   │   ├── api/                 # API de rastreamento
│   │   │   ├── components/          # Componentes de rastreamento
│   │   │   ├── config/              # Configurações
│   │   │   ├── events/              # Eventos
│   │   │   ├── renderers/           # Renderizadores de dados
│   │   │   └── utils/               # Utilitários
│   │   ├── tabs/                    # Sistema de abas global
│   │   ├── tools/                   # Gerenciador de ferramentas
│   │   ├── ui/                      # Componentes de UI
│   │   ├── user/                    # Módulo de usuário
│   │   └── utils/                   # Utilitários gerais
│   └── styles/                      # Arquivos CSS
│       ├── admin.css                # Estilos do painel admin
│       ├── index.css                # Estilos principais
│       ├── login.css                # Estilos da página de login
│       ├── rastreamento.css         # Estilos do rastreamento
│       └── datatables-rastreamento.css  # Estilos DataTables
├── src/                             # Código fonte para testes
│   └── __tests__/                   # Testes unitários
│       ├── auth/                    # Testes de autenticação
│       ├── rastreamento/            # Testes de rastreamento
│       └── utils/                   # Testes de utilitários
├── app.js                           # Servidor Express principal
├── jest.config.js                   # Configuração do Jest
├── jest-transformer.js              # Transformer do Jest
├── package.json                     # Dependências e scripts
└── README.md                        # Documentação
```

## Pré-requisitos

- Node.js (v14 ou superior)
- NPM ou Yarn
- Backend do HUB Logística rodando e acessível

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/arthurvieira2003/hub-logistica.git
cd hub-logistica
```

2. Instale as dependências:

```bash
npm install
```

## Configuração

O frontend se conecta ao backend através de chamadas API. Certifique-se de que:

1. O backend está rodando e acessível
2. As URLs da API estão configuradas corretamente nos arquivos JavaScript
3. O CORS está configurado no backend para permitir requisições do frontend

## Como Executar

### Modo Desenvolvimento

Para executar o servidor em modo desenvolvimento com reinicialização automática:

```bash
npm run dev
```

O servidor será iniciado e estará disponível em `http://localhost:3060`

### Modo Produção

Para executar o servidor em modo produção:

```bash
npm start
```

### Executar Testes

Para executar os testes unitários:

```bash
npm test
```

Para executar os testes em modo watch (desenvolvimento):

```bash
npm run test:watch
```

Para executar os testes em modo CI (com cobertura):

```bash
npm run test:ci
```

## Acessando o Sistema

1. Abra seu navegador e acesse:

```
http://localhost:3060
```

2. Na tela de login, utilize suas credenciais:

   - E-mail: (conforme configurado no sistema)
   - Senha: (conforme configurado no sistema)

3. Após autenticação, você será redirecionado para o Dashboard do sistema

## Páginas Disponíveis

- `/` - Página de login
- `/home` - Dashboard principal com ferramentas de fretes e rastreamento
- `/administration` - Painel administrativo completo

## Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com nodemon
- `npm test` - Executa os testes com cobertura
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:ci` - Executa os testes em modo CI

## Arquitetura

O projeto utiliza uma arquitetura modular baseada em módulos JavaScript:

- **Module Loader**: Sistema de carregamento dinâmico de módulos com dependências
- **Core Modules**: Módulos essenciais carregados primeiro (auth, helpers, UI)
- **Feature Modules**: Módulos de funcionalidades específicas (rastreamento, admin)
- **State Management**: Gerenciamento de estado local por módulo
- **Event System**: Sistema de eventos para comunicação entre módulos

## Integração com Backend

O frontend se comunica com o backend através de requisições HTTP para os seguintes endpoints:

- Autenticação: `/session`
- Usuários: `/user`
- Rastreamento: `/ouroNegro`, `/alfa`, `/princesa`, `/generic`, `/cte`
- Administração: `/estados`, `/cidades`, `/transportadoras`, `/faixas-peso`, `/rotas`, `/precos-faixas`

Todas as requisições autenticadas devem incluir o token JWT no header:

```
Authorization: Bearer {token}
```

## Desenvolvedor

- [Arthur Henrique Tscha Vieira](https://github.com/arthurvieira2003)
