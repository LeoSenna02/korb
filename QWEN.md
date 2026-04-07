# Korb — Contexto do Projeto

## Visão Geral

**Korb** é um aplicativo web progressivo (PWA) para rastreamento da rotina de bebês, construído com **Next.js 16** (App Router) e **React 19**. O app permite que pais registrem e acompanhem mamadas, trocas de fralda, sono, crescimento, vacinas, marcos de desenvolvimento e consultas médicas.

### Características Principais

- **Offline-first**: Dados armazenados localmente via IndexedDB com sincronização automática para Supabase quando online
- **PWA**: Instalável, com service worker, manifest e suporte a tela cheia
- **Multi-bebê**: Suporte a registro e seleção de múltiplos bebês por conta
- **Autenticação**: Login/registro via Supabase Auth com proteção de rotas via middleware
- **Design mobile-first**: Interface otimizada para dispositivos móveis com Tailwind CSS v4

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 16.2 (App Router) |
| **UI** | React 19.2 |
| **Linguagem** | TypeScript 5 (strict mode) |
| **Estilização** | Tailwind CSS v4 + PostCSS |
| **Banco local** | IndexedDB (via `idb`) |
| **Backend/BaaS** | Supabase (Auth + Database + SSR) |
| **Validação** | Zod (server-side) |
| **Formulários** | React Hook Form + `@hookform/resolvers` |
| **Animações** | Framer Motion |
| **Ícones** | Lucide React |
| **Linting** | ESLint 9 + `eslint-config-next` |
| **Fontes** | Next/font (DM Sans + DM Mono) |

## Estrutura de Arquivos

```
korb/
├── src/
│   ├── app/                    # App Router — rotas e páginas
│   │   ├── (auth)/             # Grupo de rotas: login e registro
│   │   ├── baby/               # Registro/seleção de bebê
│   │   ├── dashboard/          # Dashboard principal e sub-rotas
│   │   │   ├── consultas/      # Consultas médicas
│   │   │   ├── growth/         # Crescimento
│   │   │   ├── history/        # Histórico
│   │   │   ├── profile/        # Perfil do usuário
│   │   │   └── reports/        # Relatórios
│   │   ├── milestones/         # Marcos de desenvolvimento
│   │   ├── offline/            # Página de estado offline
│   │   ├── sleep/              # Registro de sono
│   │   ├── vaccines/           # Vacinas
│   │   ├── layout.tsx          # Root layout com providers
│   │   ├── globals.css         # Estilos globais
│   │   └── page.tsx            # Landing page / redirect
│   ├── components/             # UI reutilizável e genérica
│   │   ├── auth/               # ProtectedRoute
│   │   ├── branding/           # BrandLogo
│   │   ├── charts/             # Utilitários de gráficos canvas
│   │   ├── layout/             # BottomNav
│   │   ├── pwa/                # PWARegistrar
│   │   ├── providers/          # SyncEngineProvider
│   │   └── ui/                 # Componentes de UI (Button, Input, Sheet, etc.)
│   ├── contexts/               # Contextos React globais
│   │   ├── AuthContext.tsx
│   │   ├── BabyContext.tsx
│   │   ├── BabySelectionContext.tsx
│   │   └── SleepContext.tsx
│   ├── features/               # Módulos por domínio
│   │   ├── consultas/          # components/, hooks/
│   │   ├── dashboard/          # components/
│   │   ├── growth/             # components/, hooks/
│   │   ├── history/            # hooks/
│   │   ├── milestones/         # components/, hooks/
│   │   ├── profile/            # components/, hooks/
│   │   ├── reports/            # hooks/
│   │   ├── sleep/              # components/
│   │   └── vaccines/           # components/, hooks/
│   ├── lib/                    # Utilitários e configurações
│   │   ├── db/                 # IndexedDB setup
│   │   ├── supabase/           # Client e server Supabase
│   │   └── sync/               # Motor de sincronização offline
│   │       ├── repositories/   # Mapeamento stores → tabelas
│   │       ├── engine.ts       # SyncEngine (queue + retry)
│   │       ├── queue.ts        # Fila de sincronização
│   │       ├── mappers.ts      # Mapeamento store → tabela
│   │       └── types.ts        # Tipos do sync
│   └── middleware.ts           # Proteção de rotas com Supabase Auth
├── public/                     # Assets estáticos
│   ├── icons/                  # Ícones PWA
│   ├── assets/images/          # Imagens do app
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── plans/                      # Planos de desenvolvimento
├── package.json
├── next.config.ts              # Config + security headers
├── tsconfig.json
├── tailwind.config (v4 inline)
└── eslint.config.mjs
```

## Comandos Principais

```bash
# Desenvolvimento
npm run dev           # Inicia servidor dev em localhost:3000

# Build
npm run build         # Build de produção

# Produção
npm start             # Inicia servidor de produção

# Linting
npm run lint          # ESLint
```

## Arquitetura de Dados

### Offline-First com Sincronização

O projeto utiliza um padrão **offline-first**:

1. **IndexedDB** (`src/lib/db/`) armazena todos os dados localmente
2. **SyncEngine** (`src/lib/sync/engine.ts`) gerencia a sincronização com Supabase
3. **Fila de retry** (`src/lib/sync/queue.ts`) registra operações pendentes quando offline
4. **Repositories** (`src/lib/sync/repositories/`) mapeiam stores locais para tabelas remotas

Fluxo de escrita:
- Dados são salvos primeiro no IndexedDB
- SyncEngine tenta enviar para Supabase se online
- Se offline ou falha, entra na fila de retry
- Ao reconectar, `drainQueue()` processa todas as entradas pendentes

### Autenticação

- Supabase Auth com cookies via `@supabase/ssr`
- Middleware protege rotas em `/dashboard`, `/baby`, `/sleep`, `/milestones`, `/vaccines`
- Usuários autenticados são redirecionados de `/login` e `/registro` para `/dashboard`

### Features (Módulos por Domínio)

Cada feature em `src/features/` segue a estrutura:
```
features/[feature]/
├── components/       # Componentes específicos do domínio
├── hooks/            # Custom hooks do domínio
├── actions/          # Server Actions (quando aplicável)
└── types.ts          # Tipos locais (quando aplicável)
```

## Convenções de Desenvolvimento

- **Server Components por padrão** — `"use client"` apenas quando necessário (estado, efeitos, event handlers)
- **TypeScript strict mode** — sem `any`, tipagem forte em tudo
- **Validação com Zod** — obrigatório para dados de entrada no servidor
- **Named exports** — evitar `default export` em componentes
- **SRP** — componentes com responsabilidade única, máximo ~80-100 linhas
- **Path aliases** — `@/*` mapeado para `./src/*`
- **Security headers** — configurados em `next.config.ts` (HSTS, X-Frame-Options, CSP, etc.)

## Domínios do Aplicativo

| Feature | Descrição |
|---|---|
| **Auth** | Login, registro, gestão de perfil, troca de senha |
| **Baby** | Registro e seleção de bebês, resumo com dados (nome, nascimento, gênero, tipo sanguíneo) |
| **Dashboard** | Visão geral, atividades recentes, acessos rápidos a registros |
| **Feeding** | Registro de mamadas (peito, mamadeira, sólida) |
| **Diaper** | Registro de trocas de fralda (seco, xixi, cocô) |
| **Sleep** | Registro de sonecas e ciclos de sono |
| **Growth** | Registro de peso, altura e perímetro cefálico |
| **Milestones** | Marcos de desenvolvimento do bebê |
| **Vaccines** | Controle de vacinação |
| **Consultas** | Agendamento e acompanhamento de consultas médicas |
| **Reports** | Relatórios e visualizações da rotina |
| **History** | Histórico completo de atividades |

## PWA

O app é configurado como Progressive Web App com:
- `manifest.json` com ícones e tema
- Service worker customizado (`public/sw.js`)
- Página de fallback offline (`/offline`)
- Componente `PWARegistrar` para gerenciamento

## Observações Importantes

- **Variáveis de ambiente**: Arquivos `.env*` estão no `.gitignore`. São necessários `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para funcionar
- **Ngrok suportado**: `next.config.ts` permite origens de desenvolvimento via ngrok para testes mobile/remoto
- **Arquivo `stack.md`**: Contém regras arquiteturais obrigatórias que devem ser seguidas em todo desenvolvimento (SRP, estrutura de pastas, Server Components por padrão, etc.)
