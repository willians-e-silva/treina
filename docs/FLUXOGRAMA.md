# Treina — Fluxograma do projeto

Visão geral do app **Treina** (Expo SDK 57 + Expo Router): features, commits aplicados, telas e possíveis
alterações futuras. Os diagramas usam [Mermaid](https://mermaid.js.org/) e são renderizados direto pelo GitHub.

> Estado analisado: `71a5680` (2026-10-28).

---

## 1. Visão geral (features × telas × futuro)

```mermaid
flowchart LR
    subgraph C["Commits"]
        direction TB
        C1["a71eb20<br/>Initial commit"] --> C2["81a9540<br/>skeleton"]
        C2 --> C3["33c12f6<br/>home dashboard"]
        C3 --> C4["d6ba8db<br/>API de exercícios"]
        C4 --> C5["71a5680<br/>perfil + tarefas"]
    end

    subgraph F["Features"]
        direction TB
        F1["Autenticação<br/>e-mail mock + Google"]
        F2["Navegação<br/>abas deslizantes + modais"]
        F3["Dashboard do dia"]
        F4["Diário de exercícios<br/>ExerciseDB"]
        F5["Tarefas com repetição<br/>e subtarefas"]
        F6["Perfil do usuário"]
    end

    subgraph T["Telas"]
        direction TB
        T1["/login"]
        T2["(tabs)/index — Início"]
        T3["(tabs)/exercise — Exercícios"]
        T4["/log-exercise + /log-exercise/[id]"]
        T5["(tabs)/tasks + /add-task"]
        T6["(tabs)/profile — Perfil"]
        T7["(tabs)/explore · (tabs)/activity<br/>placeholders"]
    end

    subgraph N["Futuro"]
        direction TB
        N1["Backend + auth real"]
        N2["Persistência dos dados"]
        N3["Diário de alimentação"]
        N4["Explorar / Atividade"]
        N5["Editar perfil e metas"]
    end

    C2 --> F1 & F2
    C3 --> F3
    C4 --> F4
    C5 --> F5 & F6

    F1 --> T1
    F2 --> T7
    F3 --> T2
    F4 --> T3 & T4
    F5 --> T5
    F6 --> T6

    F1 -.-> N1
    F4 -.-> N2
    F5 -.-> N2
    F3 -.-> N3
    T7 -.-> N4
    F6 -.-> N5
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
    commit id: "33c12f6 home dashboard"
    commit id: "d6ba8db API de exercícios"
    commit id: "71a5680 perfil + tarefas"
```

> O `81a9540` foi criado localmente, sem relação com o `a71eb20` do GitHub; o merge `befc2eb` uniu os dois históricos.

| Commit | Data | O que entrou | Arquivos-chave |
| --- | --- | --- | --- |
| `a71eb20` Initial commit | 2026-10-18 | README inicial | `README.md` |
| `81a9540` skeleton | 2026-10-18 | Base Expo Router, login (e-mail mock + Google Sign-In), sessão, splash animado, tela de carregamento/erro do fluxo principal, abas deslizantes customizadas, tema claro/escuro, placeholders | `src/app/_layout.tsx`, `src/app/login.tsx`, `src/context/session.tsx`, `src/lib/google-auth*.ts`, `src/components/sliding-tabs/*`, `src/hooks/use-main-flow-bootstrap.ts` |
| `befc2eb` Merge | 2026-10-18 | Junta o skeleton com o `main` remoto | — |
| `33c12f6` home dashboard | 2026-10-18 | Dashboard "Hoje": calorias (anel), macros, passos/exercício, peso (gráfico) com dados mock | `src/components/dashboard/*`, `src/lib/dashboard-data.ts` |
| `d6ba8db` API de exercícios | 2026-10-26 | Aba Exercícios com seletor de dia, cardio × musculação, modal de busca no ExerciseDB (paginação, cache, 429), detalhes com GIF e estimativa de kcal por MET; dashboard passa a usar o exercício real | `src/lib/exercisedb.ts`, `src/lib/exercises.ts`, `src/context/exercise-log.tsx`, `src/app/log-exercise/*`, `src/app/(tabs)/exercise.tsx` |
| `71a5680` perfil + tarefas | 2026-10-28 | Aba Tarefas (repetição diária/semanal/a cada N, subtarefas sincronizadas), modal de nova tarefa/subtarefa, aba Perfil (idade, peso, altura, sair) | `src/lib/tasks.ts`, `src/context/tasks.tsx`, `src/app/(tabs)/tasks.tsx`, `src/app/add-task.tsx`, `src/app/(tabs)/profile.tsx`, `src/lib/profile.ts` |

---

## 3. Fluxo de telas (navegação)

```mermaid
flowchart TD
    Start(["Abrir app"]) --> Splash["Splash animado<br/>AnimatedSplashOverlay"]
    Splash --> Guard{"Há sessão?<br/>Stack.Protected"}

    Guard -- "não" --> Login["/login"]
    Login -- "E-mail + senha<br/>IS_AUTH_MOCKED = true" --> SignIn["signIn()"]
    Login -- "Entrar com Google" --> Google["signInWithGoogle()"]
    Google -- "cancelou" --> Login
    Google -- "erro" --> LoginErr["Mensagem de erro"] --> Login
    SignIn --> Guard
    Google -- "ok" --> Guard

    Guard -- "sim" --> Boot["(tabs)/_layout<br/>prepareMainFlow()"]
    Boot -- "loading" --> Loading["MainFlowLoading"]
    Boot -- "erro" --> BootErr["Tela de erro"]
    BootErr -- "Tentar de novo" --> Boot
    BootErr -- "Sair" --> SignOut
    Boot -- "ready" --> Tabs

    subgraph Tabs["Abas deslizantes (SlidingTabs)"]
        direction LR
        Home["Início<br/>dashboard"]
        Exercise["Exercícios"]
        Tasks["Tarefas"]
        Explore["Explorar<br/>SurfaceTest temporário"]
        Activity["Atividade<br/>Em breve"]
        Profile["Perfil"]
    end

    Exercise -- "+ cardio / musculação<br/>params: category, date" --> Search["Modal /log-exercise<br/>catálogo + busca"]
    Search -- "escolhe exercício" --> Details["/log-exercise/[id]<br/>GIF, MET, campos"]
    Search -- "nome personalizado<br/>id = custom" --> Details
    Details -- "Salvar → addEntry()<br/>fecha o modal" --> Exercise

    Tasks -- "Adicionar tarefa<br/>params: date" --> AddTask["Modal /add-task<br/>Nova tarefa"]
    Tasks -- "+ subtarefa<br/>params: parentId" --> AddSub["Modal /add-task<br/>Nova subtarefa"]
    AddTask -- "addTask()" --> Tasks
    AddSub -- "addSubtask()" --> Tasks

    Profile -- "Sair" --> SignOut["signOut()"]
    SignOut --> Guard
```

### Mapa de rotas (`src/app/`)

```mermaid
flowchart LR
    Root["_layout.tsx<br/>Stack raiz + providers"] --> Login["login.tsx"]
    Root --> TabsL["(tabs)/_layout.tsx"]
    Root --> LogL["log-exercise/_layout.tsx<br/>modal"]
    Root --> Add["add-task.tsx<br/>modal"]
    TabsL --> I["index.tsx"] & E["exercise.tsx"] & T["tasks.tsx"] & X["explore.tsx"] & A["activity.tsx"] & P["profile.tsx"]
    LogL --> LI["index.tsx — busca"] & LD["[id].tsx — detalhes"]
```

---

## 4. Fluxo de dados das features

```mermaid
flowchart LR
    subgraph Providers["Providers (src/context) — em memória"]
        S["SessionProvider<br/>session: e-mail"]
        EL["ExerciseLogProvider<br/>entries[]"]
        TK["TasksProvider<br/>tasks[]"]
    end

    subgraph Libs["Lógica (src/lib)"]
        GA["google-auth.ts<br/>(web: indisponível)"]
        EDB["exercisedb.ts<br/>oss.exercisedb.dev<br/>cache + estimateMet"]
        EX["exercises.ts<br/>estimateCalories, datas"]
        TL["tasks.ts<br/>isTaskDue, markDone,<br/>syncWithSubtasks"]
        DD["dashboard-data.ts<br/>MOCK_DASHBOARD"]
        PR["profile.ts<br/>MOCK_PROFILE"]
    end

    API[("ExerciseDB API")]
    GAPI[("Google Sign-In")]

    GA <--> GAPI
    S --> GA
    EDB <--> API
    EDB --> SearchScreen["/log-exercise"]
    EX --> DetailsScreen["/log-exercise/[id]"]
    DD -- "peso corporal p/ kcal" --> DetailsScreen
    DetailsScreen -- "addEntry" --> EL
    EL -- "useExerciseDay(date)" --> ExerciseTab["Aba Exercícios"]
    EL -- "kcal + minutos de hoje" --> HomeTab["Aba Início"]
    DD -- "comida, macros, passos, peso" --> HomeTab
    TL --> TK
    TK --> TasksTab["Aba Tarefas"]
    AddTaskScreen["/add-task"] -- "addTask / addSubtask" --> TK
    DD --> PR --> ProfileTab["Aba Perfil"]
    S --> ProfileTab
```

### Regras das tarefas

```mermaid
flowchart TD
    New["Nova tarefa"] --> Rep{"Repetição"}
    Rep -- "Não repete" --> OneOff["kind: none<br/>aparece todo dia até ser concluída,<br/>depois só no dia da conclusão"]
    Rep -- "Todo dia / Toda semana /<br/>A cada N dias|semanas" --> Every["kind: every<br/>devida quando dias desde startDate<br/>% (N × 1|7) = 0"]
    OneOff --> Sub{"Tem subtarefas?"}
    Every --> Sub
    Sub -- "sim" --> Sync["Tarefa concluída no dia ⇔<br/>todas as subtarefas concluídas"]
    Sub -- "não" --> Toggle["Marcar / desmarcar no dia"]
```

---

## 5. Possíveis alterações futuras

Levantadas a partir dos `TODO` / `TEMPORARY` no código e das lacunas atuais.

```mermaid
flowchart TD
    Now(["Estado atual<br/>71a5680"]) --> B["Backend / API própria"]

    B --> B1["Auth real<br/>remover IS_AUTH_MOCKED<br/>validar idToken do Google"]
    B --> B2["Persistir sessão<br/>expo-secure-store"]
    B --> B3["Persistir exercícios e tarefas<br/>hoje somem ao reiniciar"]
    B --> B4["prepareMainFlow() carregar<br/>perfil e dados iniciais"]

    Now --> D["Dados reais no dashboard"]
    D --> D1["Diário de alimentação<br/>calorias e macros"]
    D --> D2["Registro de peso<br/>usado no cálculo de kcal"]
    D --> D3["Passos via sensor<br/>expo-sensors Pedometer"]

    Now --> U["Telas pendentes"]
    U --> U1["Explorar<br/>remover SurfaceTest"]
    U --> U2["Atividade<br/>histórico e gráficos"]
    U --> U3["Editar perfil e metas"]
    U --> U4["Editar / excluir tarefas<br/>e registros de exercício"]

    Now --> Q["Qualidade"]
    Q --> Q1["Unificar idioma das mensagens<br/>login ainda em inglês"]
    Q --> Q2["Testes unitários<br/>tasks.ts, exercises.ts, profile.ts"]
    Q --> Q3["Configurar iosUrlScheme real<br/>e README do projeto"]
    Q --> Q4["Notificações de tarefas<br/>expo-notifications"]

    B1 --> B2
    B3 --> U2
    D2 --> U3
```

| Área | Onde está hoje | Sugestão |
| --- | --- | --- |
| Login por e-mail | `src/context/session.tsx` — `IS_AUTH_MOCKED = true` | Requisição real de auth e validação no `login.tsx` |
| Login Google | `session.tsx` — `TODO: send user.idToken to your backend` | Verificar o token no backend e criar sessão |
| Sessão | `useState` em memória | Persistir com `expo-secure-store` para não deslogar ao reabrir |
| Bootstrap | `src/lib/prepare-main-flow.ts` vazio | Buscar perfil/metas antes de mostrar as abas |
| Dashboard | `src/lib/dashboard-data.ts` — `MOCK_DASHBOARD` | Diário de alimentação, passos e pesagens reais |
| Peso nos cálculos | `log-exercise/[id].tsx` — `TODO: use the user's real latest weigh-in` | Usar o último peso do perfil |
| Exercícios / Tarefas | Providers em memória (`TEMPORARY`) | Persistência local (SQLite) e/ou backend |
| Perfil | `src/lib/profile.ts` — `MOCK_PROFILE` | Tela de edição de nome, nascimento, altura e metas |
| Explorar | `SurfaceTest` (`TEMPORARY`) | Voltar a `ComingSoon` ou implementar a feature |
| Atividade | `ComingSoon` | Histórico/estatísticas de treinos e tarefas |
| ExerciseDB | Nomes só em inglês, MET estimado pelo nome | Tradução dos nomes e tabela de MET mais precisa |
| Rótulos das abas | `src/constants/tabs.ts` — nomes temporários | Definir nomes/ícones finais de Explorar e Atividade |
