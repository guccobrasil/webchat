Markdown

# 💬 WebChat Realtime

Um aplicativo de bate-papo em tempo real moderno, responsivo e de alta performance, construído com **React**, **Vite**, **Tailwind CSS** e **Supabase Realtime**.

O sistema conta com autenticação social via **Google OAuth**, detecção de presença online, alerta de entrada de usuários e bloqueio automático de múltiplas sessões simultâneas da mesma conta.

---

## 🚀 Tecnologias Utilizadas

- **[React 18+](https://react.dev/)** — Biblioteca para construção de interfaces de usuário dinâmicas.
- **[Vite](https://vitejs.dev/)** — Build tool ultrarrápida para desenvolvimento frontend.
- **[Supabase](https://supabase.com/)** — Backend-as-a-Service (Autenticação OAuth e WebSockets Realtime/Presence).
- **[Tailwind CSS](https://tailwindcss.com/)** — Framework CSS utilitário para estilização e responsividade.

---

## ✨ Funcionalidades

- 🔒 **Autenticação com Google (OAuth):** Login seguro e sem necessidade de senhas.
- ⚡ **Chat em Tempo Real:** Comunicação instantânea via WebSockets (Supabase Broadcast).
- 🟢 **Indicador de Presença (Users Online):** Contagem dinâmica de usuários ativos na sala.
- 👋 **Notificações do Sistema:** Alertas em itálico sempre que um novo usuário entra no chat.
- ⛔ **Bloqueio de Sessão Duplicada:** Desconecta automaticamente se o mesmo e-mail for aberto em duas abas ou dispositivos simultâneos.
- 🎨 **Interface Responsiva & UI/UX Amigável:** Layout escuro (*Dark Mode*), balões de mensagens diferenciados por remetente e auto-scroll suave.
- 🧹 **Validação de Entrada:** Prevenção contra envio de mensagens vazias ou contendo apenas espaços.

---

## 📁 Arquitetura do Projeto

O projeto segue a estrutura padrão modular recomendada para ecossistemas **Vite/React**, separando responsabilidades entre componentes, hooks e configurações:

```text
src/
├── assets/          # Imagens, ícones e recursos estáticos
├── components/      # Componentes de Interface de Usuário (UI)
│   ├── Chat/
│   │   └── MessageList.jsx   # Exibição de mensagens, foto de perfil e autoscroll
│   └── Login/
│       └── LoginScreen.jsx   # Tela inicial de autenticação e feedback visual
├── config/          # Inicialização de bibliotecas externas
│   └── supabaseClient.js     # Cliente configurado do Supabase
├── hooks/           # Lógica de Negócio e Estados Globais
│   └── useChat.js            # Custom Hook com toda a inteligência do Realtime
├── App.jsx          # Orquestrador da aplicação (Roteamento de Sessão)
├── main.jsx         # Ponto de entrada do Vite
└── index.css        # Configurações globais e importações do Tailwind CSS

🛠️ Configuração e Instalação
Pré-requisitos

    Node.js (versão 18 ou superior)

    Conta cadastrada no Supabase com um projeto ativo e o provedor Google OAuth configurado.

Passo a Passo

    Clone o repositório:
    Bash

git clone [https://github.com/seu-usuario/webchat.git](https://github.com/seu-usuario/webchat.git)
cd webchat

Instale as dependências:
Bash

npm install

Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz do projeto e adicione suas credenciais do Supabase:
Snippet de código

VITE_SUPABASE_URL=[https://seu-projeto.supabase.co](https://seu-projeto.supabase.co)
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

Inicie o servidor de desenvolvimento:
Bash

    npm run dev

    Acesse a aplicação no navegador através do endereço exibido no terminal (geralmente http://localhost:5173).

🛡️ Regras de Negócio e Segurança

    Garantia de Remetente:
    Para garantir que as próprias mensagens sejam visualizadas em tempo real sem atrasos no cliente que a enviou, o canal Broadcast está configurado com self: true.

    Detecção de Sessão Duplicada via Presence:
    Através da API de Presence, o aplicativo monitora o identificador (user.id) em cada sincronização (sync). Se o identificador for detectado mais de uma vez na sala, a aba secundária força a saída (signOut) garantindo a integridade do uso individual da conta.

📌 Próximos Passos (Roadmap de Melhorias)

    [ ] Persistir o histórico de mensagens em uma tabela do PostgreSQL no Supabase (utilizando Row Level Security - RLS).

    [ ] Suporte a envio de imagens e anexos nos balões de conversa.

    [ ] Criação de múltiplas salas temáticas de chat.

    [ ] Suporte a reações com emojis nas mensagens.

📄 Licença

Este projeto está sob a licença MIT. Para mais detalhes, consulte o arquivo LICENSE.