# Treina — Fluxograma do projeto

Visão geral do app **Treina** (Expo SDK 58 + Expo Router + Supabase): features, commits aplicados, telas,
arquitetura de dados e próximos passos. Os diagramas usam [Mermaid](https://mermaid.js.org/) e são renderizados
direto pelo GitHub.

> Estado analisado: `f21319a` na `main` (2026-11-12), 34 commits.

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
        C6 --> C7["12/11 · Fase 1 do roadmap<br/>perfil completo, desfazer, testes, CI"]
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
        N4["Fila de salvamento persistida<br/>e carregamento por período"]
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
    C7 -.-> N4
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
    commit id: "f21319a fase 1 roadmap"
```

| Período | Commits | O que entrou |
| --- | --- | --- |
| 18/10 · Base | `a71eb20`, `81a9540`, `befc2eb` | Expo Router, login (e-mail simulado + Google), splash animado, abas deslizantes próprias, tema claro/escuro. O `81a9540` foi criado localmente e unido ao `a71eb20` do GitHub pelo merge `befc2eb`. |
| 18–28/10 · Features | `33c12f6`, `d6ba8db`, `71a5680` | Dashboard do dia, aba Exercícios com ExerciseDB e cálculo de kcal por MET, tarefas com repetição e subtarefas, perfil. |
| 29–30/10 · EAS, diário e visual | `3e47e46` … `89cc59a` | Configuração do EAS e workflow de OTA, diário alimentar (TACO embarcada + Open Food Facts), refeições configuráveis, design system Material 3 gerado do ícone, tela inicial com widgets arrastáveis. |
| 02/11 · Treinadores | `5fd90b1`, `a645770`, `de10529` | Aba Treinador, perfil do treinador, pacotes de treinos, plano semanal ou em fila, sessão cronometrada com sensação, chat; limpeza de código não usado; ajustes no login. |
| 02/11 · Supabase | `39b79b9` … `090bb41` | Fase 1: camada de repositório. Fase 2: schema, RLS e seed do catálogo. Fase 3: autenticação real, confirmação e recuperação de senha. Fase 4: repositórios Supabase. Fase 5: chat em tempo real. Ajustes do build web (`bfb892c`, `98473de`). |
| 03–07/11 · Correções | `f38f27a` … `25f3a9b` | Ajustes de peso e exercícios, ícone adaptativo, tela de erro no lugar do crash (`94d5d86`), correção do `NaN` do Reanimated na lixeira (`bc153f6`) e do crash `ExpoSQLite` (`25f3a9b`): o Expo 58.0.21 trazia um runtime de módulos incompatível com o `expo-sqlite` pré-compilado; a atualização para 58.0.23 alinhou os pacotes. |
| 12/11 · Fase 1 do roadmap | `f21319a` | Tela "Complete seu perfil" para contas sem dados corporais (Google), cálculo de kcal sem peso de exemplo, confirmação ao aderir e ao sair de pacote, desfazer ao remover alimento, exercício e tarefa, confirmação ao excluir treino e ao sair da conta, 28 testes com Jest em `src/lib`, `check-env` para as variáveis e workflow que roda variáveis, lint, typecheck e testes antes do OTA. |

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
    Boot -- "ok" --> Done{"Perfil completo?"}
    Done -- "não (ex.: Google)" --> CP["Complete seu perfil<br/>nascimento, sexo, altura, peso"]
    CP --> Tabs
    Done -- "sim" --> Tabs

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
    PK -- "Aderir ao treino<br/>(confirma se há dias planejados)" --> WK
    TR -- "Conversar" --> Chat["chat/[trainerId]<br/>tempo real"]
    Tasks -- "Adicionar tarefa" --> AT["add-task"]
    Home -- "Registrar peso / meta" --> WD["Diálogos de peso"]
    Profile -- "Registrar peso / meta" --> WD
    Profile -- "Sair (confirma)" --> Guard
    Diary -- "Remover alimento" --> Undo["Snackbar com Desfazer"]
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
| Regras | `src/lib/*` | Lógica pura que continua no app (fila de treinos, repetição de tarefas, ordem das refeições, kcal por MET), agora coberta por 28 testes em `src/lib/__tests__` |
| Desfazer | `components/undo-snackbar.tsx`, `ui/confirm-dialog.tsx` | Snackbar com Desfazer para remoções simples e diálogo de confirmação para ações grandes |

---

## 5. Fluxo de autenticação

```mermaid
flowchart TD
    Open(["App abre"]) --> Restore["Lê a sessão salva<br/>(expo-sqlite / localStorage na web)"]
    Restore --> Has{"Sessão válida?"}
    Has -- "sim" --> Profile["Carrega o perfil (profiles)"] --> Check{"Perfil completo?"}
    Check -- "sim" --> App["Abas"]
    Check -- "não" --> CP["Complete seu perfil<br/>saveBodyData + pesagem"] --> App
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

## 6. Entrega (workflow do EAS)

```mermaid
flowchart LR
    Push(["push na main"]) --> Checks
    subgraph Checks["checks · ambiente preview"]
        direction TB
        E["check-env<br/>variáveis obrigatórias"] --> Li["lint"] --> Ty["typecheck"] --> Te["testes (Jest)"]
    end
    Checks -- "falhou" --> Stop["Nada é publicado"]
    Checks -- "ok" --> FP["fingerprint nativo"]
    FP --> GB{"Build preview<br/>compatível?"}
    GB -- "sim" --> OTA["Atualização OTA<br/>canal preview"]
    GB -- "não" --> Build["Novo build Android"]
```

Antes do `f21319a`, o workflow publicava a atualização direto, sem verificação; foi assim que o crash do `ExpoSQLite` chegou ao celular. Agora qualquer falha em variáveis, lint, typecheck ou testes interrompe a publicação. Ainda não há um teste do APK aberto no aparelho antes de liberar o canal.

---

## 7. O que ainda é simulado ou falta

```mermaid
flowchart TD
    Now(["Estado atual<br/>f21319a"]) --> Done["Feito na Fase 1"]
    Done --> D1["Completar perfil após Google"]
    Done --> D2["kcal sem peso de exemplo"]
    Done --> D3["Desfazer e confirmações"]
    Done --> D4["Testes + gate no workflow"]
    Done --> D5["check-env das variáveis"]

    Now --> M["Ainda simulado"]
    M --> M1["Passos: 6.840 fixos"]
    M --> M2["Metas fixas: 2.200 kcal e macros"]
    M --> M3["Chat: treinador não responde"]

    Now --> P["Fase 2 · consolidação"]
    P --> P1["Metas calculadas do perfil"]
    P --> P2["Editar registros, perfil e exercícios do treino"]
    P --> P3["Fila de salvamento persistida"]
    P --> P4["Carregamento por período e erro por aba"]
    P --> P5["Histórico e evolução de cargas"]

    Now --> L["Produção"]
    L --> L1["LGPD: consentimento e excluir conta"]
    L --> L2["Monitoramento de erros"]
    L --> L3["Smoke test do APK e iOS"]
```

| Área | Situação na `main` | Próximo passo |
| --- | --- | --- |
| Conta | Supabase Auth, Google, confirmação e recuperação de senha; perfil incompleto pede os dados antes das abas | Editar o perfil depois (só peso e meta são editáveis) |
| Dados | Persistidos por conta com RLS; fila de salvamento com nova tentativa; remoções com Desfazer | Edição de registros, fila persistida no aparelho, carregamento por período |
| Cálculos | Sem peso real, a tela pede para registrar o peso em vez de usar um valor de exemplo | Metas calculadas (kcal e macros) a partir do perfil |
| Treinadores | Catálogo do banco; aderir e sair do pacote pedem confirmação; chat em tempo real com aviso | Lado do treinador para responder e publicar |
| Tela inicial | Calorias, macros, exercício e peso reais | Passos reais e metas pessoais |
| Qualidade | 28 testes (Jest) em `src/lib`, lint e typecheck limpos, gate no workflow | Testes de `useUserStore` e dos repositórios; smoke test do APK |
| Entrega | Workflow bloqueia OTA se algo falhar; `check-env` valida as variáveis | Monitoramento de erros e configuração iOS |
