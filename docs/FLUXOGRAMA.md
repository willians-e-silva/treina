# Treina — Fluxograma do projeto

Visão geral do app **Treina** (Expo SDK 58 + Expo Router + Supabase): features, commits aplicados, telas,
arquitetura de dados e próximos passos. Os diagramas usam [Mermaid](https://mermaid.js.org/) e são renderizados
direto pelo GitHub.

> Estado analisado: `25f3a9b` na `main` (2026-11-07), 33 commits.

---

## 1. Visão geral (features × telas × futuro)

```mermaid
flowchart LR
    subgraph C["Fases do projeto"]
        direction TB
        C1["18/10 · Base<br/>skeleton, login, abas"] --> C2["18–28/10 · Features<br/>dashboard, exercícios, tarefas, perfil"]
        C2 --> C3["29–30/10 · EAS + diário<br/>alimentação, Material 3"]
        C3 --> C4["02/11 · Treinadores<br/>pacotes, treinos, sessão, chat"]
        C4 --> C5["02/11 · Supabase<br/>fases 1 a 5"]
        C5 --> C6["03–07/11 · Correções Android<br/>crashes ao abrir"]
    end

    subgraph F["Features"]
        direction TB
        F1["Conta<br/>Supabase Auth + Google"]
        F2["Tela inicial personalizável"]
        F3["Diário alimentar<br/>TACO + Open Food Facts"]
        F4["Exercícios e plano de treino<br/>semanal ou fila, sessão cronometrada"]
        F5["Treinadores<br/>catálogo, pacotes, chat"]
        F6["Tarefas"]
        F7["Peso e meta"]
    end

    subgraph T["Telas"]
        direction TB
        T1["login · signup · forgot-password · auth/callback"]
        T2["Início"]
        T3["Diário · log-food · meals"]
        T4["Exercícios · log-exercise · workouts · workout-session"]
        T5["Treinador · trainer · package · chat"]
        T6["Tarefas · add-task"]
        T7["Perfil"]
    end

    subgraph N["Próximos passos"]
        direction TB
        N1["Metas calculadas do perfil"]
        N2["Passos reais"]
        N3["Editar registros"]
        N4["Testes e CI"]
        N5["Lado do treinador no chat"]
    end

    C1 --> F1
    C2 --> F2 & F4 & F6 & F7
    C3 --> F3
    C4 --> F5
    C5 -.->|persistência| F1 & F3 & F4 & F5 & F6 & F7

    F1 --> T1
    F2 --> T2
    F3 --> T3
    F4 --> T4
    F5 --> T5
    F6 --> T6
    F7 --> T7 & T2

    F2 -.-> N1 & N2
    F3 -.-> N3
    F5 -.-> N5
    C6 -.-> N4
```

---

## 2. Histórico de commits

```mermaid
gitGraph
    commit id: "a71eb20 Initial commit"
    branch local
    commit id: "81a9540 skeleton"
    checkout main
    merge local id: "befc2eb Merge"
    commit id: "33c12f6 dashboard"
    commit id: "d6ba8db exercícios"
    commit id: "71a5680 perfil + tarefas"
    commit id: "2bae5e4 diário + EAS"
    commit id: "a7d7534 Material 3"
    commit id: "89cc59a dashboard arrastável"
    commit id: "5fd90b1 treinadores + chat"
    commit id: "39b79b9 Supabase fase 1"
    commit id: "c0c98a8 fase 3: auth"
    commit id: "8a829b3 fase 4: repositórios"
    commit id: "090bb41 fase 5: realtime"
    commit id: "bc153f6 fix Reanimated"
    commit id: "25f3a9b fix ExpoSQLite"
```

| Período | Commits | O que entrou |
| --- | --- | --- |
| 18/10 · Base | `a71eb20`, `81a9540`, `befc2eb` | Expo Router, login (e-mail simulado + Google), splash animado, abas deslizantes próprias, tema claro/escuro. O `81a9540` foi criado localmente e unido ao `a71eb20` do GitHub pelo merge `befc2eb`. |
| 18–28/10 · Features | `33c12f6`, `d6ba8db`, `71a5680` | Dashboard do dia, aba Exercícios com ExerciseDB e cálculo de kcal por MET, tarefas com repetição e subtarefas, perfil. |
| 29–30/10 · EAS, diário e visual | `3e47e46` … `89cc59a` | Configuração do EAS e workflow de OTA, diário alimentar (TACO embarcada + Open Food Facts), refeições configuráveis, design system Material 3 gerado do ícone, tela inicial com widgets arrastáveis. |
| 02/11 · Treinadores | `5fd90b1`, `a645770`, `de10529` | Aba Treinador, perfil do treinador, pacotes de treinos, plano semanal ou em fila, sessão cronometrada com sensação, chat; limpeza de código não usado; ajustes no login. |
| 02/11 · Supabase | `39b79b9` … `090bb41` | Fase 1: camada de repositório. Fase 2: schema, RLS e seed do catálogo. Fase 3: autenticação real, confirmação e recuperação de senha. Fase 4: repositórios Supabase. Fase 5: chat em tempo real. Ajustes do build web (`bfb892c`, `98473de`). |
| 03–07/11 · Correções | `f38f27a` … `25f3a9b` | Ajustes de peso e exercícios, ícone adaptativo, tela de erro no lugar do crash (`94d5d86`), correção do `NaN` do Reanimated na lixeira (`bc153f6`) e do crash `ExpoSQLite` (`25f3a9b`): o Expo 58.0.21 trazia um runtime de módulos incompatível com o `expo-sqlite` pré-compilado; a atualização para 58.0.23 alinhou os pacotes. |

---

## 3. Fluxo de telas (navegação)

```mermaid
flowchart TD
    Start(["Abrir app"]) --> Splash["Splash animado<br/>fica até ler a sessão salva"]
    Splash --> Guard{"Sessão salva?<br/>Stack.Protected"}

    Guard -- "não" --> Login["/login"]
    Login -- "E-mail + senha" --> Auth["Supabase Auth"]
    Login -- "Continuar com Google" --> Google["idToken → signInWithIdToken"]
    Login -- "Esqueci minha senha" --> FP["/forgot-password<br/>e-mail"]
    FP --> FPC["/forgot-password/check-email"]
    FPC -.->|link do e-mail| FPN["/forgot-password/new-password"]
    FPN --> Login
    Login -- "Criar conta" --> SU1["/signup · conta"]
    SU1 --> SU2["/signup/details · dados corporais"]
    SU2 --> SUC["/signup/confirm<br/>confirme o e-mail"]
    SUC -.->|link do e-mail| CB["/auth/callback"]
    CB --> Guard
    Auth --> Guard
    Google --> Guard

    Guard -- "sim" --> Boot["(tabs)/_layout<br/>prepareMainFlow"]
    Boot -- "erro" --> BootErr["Tentar de novo / Sair"]
    BootErr --> Boot
    Boot -- "ok" --> Tabs

    subgraph Tabs["Abas deslizantes"]
        direction LR
        Home["Início"]
        Diary["Diário"]
        Exercise["Exercícios"]
        Trainers["Treinador"]
        Tasks["Tarefas"]
        Profile["Perfil"]
    end

    Diary -- "Adicionar alimento" --> LF["log-food<br/>busca → quantidade"]
    Diary -- "Editar refeições" --> Meals["meals"]
    Exercise -- "Adicionar exercício" --> LE["log-exercise<br/>busca → detalhes"]
    Exercise -- "Planejar treinos" --> WK["workouts<br/>plano → treino"]
    Exercise -- "Iniciar treino" --> WS["workout-session<br/>tela cheia"]
    WK -- "Adicionar exercício" --> LE
    Trainers --> TR["trainer/[id]"]
    TR --> PK["trainer/package/[id]"]
    PK --> PW["trainer/workout"]
    PK -- "Aderir ao treino" --> WK
    TR -- "Conversar" --> Chat["chat/[trainerId]<br/>tempo real"]
    Tasks -- "Adicionar tarefa" --> AT["add-task"]
    Home -- "Registrar peso / meta" --> WD["Diálogos de peso"]
    Profile -- "Registrar peso / meta" --> WD
    Profile -- "Sair" --> Guard
```

### Mapa de rotas (`src/app/`)

```mermaid
flowchart LR
    Root["_layout.tsx<br/>providers + ErrorBoundary"] --> Login["login"]
    Root --> SU["signup/<br/>index · details · confirm"]
    Root --> FP["forgot-password/<br/>index · check-email · new-password"]
    Root --> CB["auth/callback"]
    Root --> Tabs["(tabs)/<br/>index · diary · exercise · trainers · tasks · profile"]
    Root --> LF["log-food/<br/>index · [id]"]
    Root --> Meals["meals"]
    Root --> LE["log-exercise/<br/>index · [id]"]
    Root --> WK["workouts/<br/>index · [id]"]
    Root --> WS["workout-session"]
    Root --> AT["add-task"]
    Root --> TR["trainer/<br/>[id] · package/[id] · workout"]
    Root --> Chat["chat/[trainerId]"]
```

---

## 4. Arquitetura de dados

```mermaid
flowchart LR
    subgraph UI["Telas e componentes"]
        Screens["src/app · src/components"]
    end

    subgraph Ctx["Contextos (src/context)"]
        direction TB
        Session["session<br/>conta e perfil"]
        Stores["weight-log · food-log · exercise-log<br/>workout-plan · coaching · chat<br/>tasks · dashboard-layout · catalog"]
    end

    Store["useUserStore<br/>mostra na hora, salva em fila,<br/>recomeça ao trocar de conta"]
    Repo{"repositoriesFor(userId)<br/>EXPO_PUBLIC_DATA_SOURCE"}
    Local["local.ts<br/>memória (demo)"]
    SupaRepo["data/supabase/*<br/>um repositório por domínio"]

    subgraph SB["Supabase"]
        direction TB
        SAuth["Auth<br/>e-mail, Google, PKCE"]
        DB[("Postgres + RLS<br/>18 tabelas")]
        RT["Realtime<br/>chat_messages"]
    end

    subgraph Ext["Fontes externas"]
        direction TB
        EDB[("ExerciseDB")]
        OFF[("Open Food Facts")]
        TACO[("TACO embarcada")]
    end

    Lib["src/lib<br/>regras puras: fila de treinos,<br/>repetição de tarefas, refeições"]
    SQLite["expo-sqlite<br/>sessão salva no aparelho"]

    Screens --> Ctx
    Session --> SAuth
    Session --> SQLite
    Stores --> Store --> Repo
    Repo -- "local" --> Local
    Repo -- "supabase" --> SupaRepo --> DB
    SupaRepo --> RT
    Ctx --> Lib
    Screens --> EDB & OFF & TACO
```

| Camada | Arquivos | Papel |
| --- | --- | --- |
| Contextos | `src/context/*.tsx` (11) | Estado de cada domínio e ações que as telas chamam |
| Store por conta | `src/data/use-user-store.ts` | Carrega os dados da conta, mostra mudanças na hora, salva em fila ordenada e mostra "Tentar novamente" se falhar (`save-error-banner`) |
| Repositórios | `src/data/types.ts`, `local.ts`, `supabase/*` | Interface por domínio; implementação em memória (modo demo) ou Supabase |
| Supabase | `supabase/migrations/*`, `seed.sql`, `tests/rls.sql` | 18 tabelas, Row Level Security por `auth.uid()`, perfil criado no cadastro, refeições padrão, chat em tempo real |
| Regras | `src/lib/*` | Lógica pura que continua no app (fila de treinos, repetição de tarefas, ordem das refeições, kcal por MET) |

---

## 5. Fluxo de autenticação

```mermaid
flowchart TD
    Open(["App abre"]) --> Restore["Lê a sessão salva<br/>(expo-sqlite / localStorage na web)"]
    Restore --> Has{"Sessão válida?"}
    Has -- "sim" --> Profile["Carrega o perfil (profiles)"] --> App["Abas"]
    Has -- "não" --> Login["Login"]

    Login --> Mode{"EXPO_PUBLIC_AUTH_MODE"}
    Mode -- "demo" --> Demo["Entra com qualquer e-mail<br/>dados em memória"] --> App
    Mode -- "vazio" --> Real["signInWithPassword /<br/>signInWithIdToken (Google)"]
    Real -- "e-mail não confirmado" --> Confirm["/signup/confirm<br/>reenviar e-mail"]
    Real -- "ok" --> Profile

    SignUp["Cadastro em 2 etapas"] --> Create["signUp + profiles<br/>(trigger new_user_profile)"]
    Create --> Confirm
    Confirm -.->|"link treina://auth/callback?code="| Exchange["exchangeCodeForSession"] --> Profile

    App -- "Sair" --> Out["signOut<br/>stores voltam ao vazio"] --> Login
```

---

## 6. O que ainda é simulado ou falta

```mermaid
flowchart TD
    Now(["Estado atual<br/>25f3a9b"]) --> M["Ainda simulado"]
    M --> M1["Passos: 6.840 fixos<br/>(MOCK_DASHBOARD)"]
    M --> M2["Metas fixas: 2.200 kcal, macros,<br/>400 kcal de exercício"]
    M --> M3["Chat: treinador ainda não tem app<br/>para responder"]

    Now --> P["Produto"]
    P --> P1["Metas calculadas do perfil<br/>(idade, sexo, altura, peso, objetivo)"]
    P --> P2["Editar alimento, exercício<br/>e exercício do treino"]
    P --> P3["Histórico e evolução de cargas"]
    P --> P4["Passos via Health Connect / HealthKit"]
    P --> P5["Lembretes e notificações"]

    Now --> Q["Qualidade e entrega"]
    Q --> Q1["Testes de src/lib e CI<br/>antes do OTA"]
    Q --> Q2["Variáveis do Supabase e do Google<br/>no ambiente preview do EAS"]
    Q --> Q3["Configuração iOS<br/>(bundleIdentifier, URL scheme)"]
    Q --> Q4["Conferir runtime das OTA:<br/>evitar JS novo em APK antigo"]

    Now --> L["Lançamento"]
    L --> L1["Consentimento LGPD, exportar<br/>e excluir conta"]
    L --> L2["Monitoramento de erros"]
    L --> L3["Painel do treinador"]
```

| Área | Situação na `main` | Próximo passo |
| --- | --- | --- |
| Conta | Supabase Auth real, Google, confirmação e recuperação de senha, modo demo opcional | Variáveis do Google no `.env.local` e no EAS |
| Dados | Persistidos no Supabase por conta, com RLS; fila de salvamento com nova tentativa | Edição de registros nos repositórios que só têm `add`/`remove` |
| Catálogo de treinadores | Vem do banco (`trainers`, `training_packages`, seed) | Painel para o treinador publicar |
| Chat | Tempo real pelo Supabase; aviso de que o treinador ainda não responde | App ou painel do treinador |
| Tela inicial | Calorias, macros, exercício e peso reais | Passos reais e metas calculadas |
| Android | Crashes de abertura corrigidos (`bc153f6`, `25f3a9b`) | Gerar APK novo com os módulos nativos atuais e testar |
| Qualidade | Typecheck passa; sem testes | `jest-expo` + testes de `src/lib` e `supabase/tests/rls.sql` no CI |
