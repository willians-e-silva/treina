/* Dados da auditoria. Gerado a partir das fontes; não editar à mão. */
window.AUDIT = {
 "meta": {
  "project": "Treina",
  "date": "2026-11-12",
  "commit": "f21319a",
  "branchAnalyzed": "main",
  "linesOfCode": 17925,
  "sourceFiles": 161,
  "routeFiles": 35,
  "commits": 34,
  "previousAudit": "5fd90b1 (02/11/2026)",
  "phase": "A instrução desta auditoria diz que o foco é ter o front funcional antes de conectar o backend. O código da main já tem o backend conectado: Supabase com autenticação real, 18 tabelas com Row Level Security, repositórios por domínio e chat em tempo real (commits de 02/11 em diante). A auditoria avalia o código como ele está; o modo demo (EXPO_PUBLIC_AUTH_MODE=demo) mantém o front utilizável sem backend e foi o usado nas capturas. Esta edição avalia a main em f21319a (12/11), que já inclui correções da auditoria anterior; ela substitui a edição intermediária 7356157, feita sobre 25f3a9b antes dessas correções.",
  "notVerified": [
   "O app não foi executado em Android ou iOS nativos; as capturas vêm da versão web em modo demo, e o resto por leitura de código, lint, typecheck e testes.",
   "Nenhuma chamada real ao Supabase foi feita: este ambiente não tem acesso ao projeto nem às chaves. Autenticação, RLS e Realtime foram avaliados pelo código, pelas migrações e por supabase/tests/rls.sql, sem executar.",
   "Google Sign-In, envio de emails de confirmação e recuperação de senha não foram testados de ponta a ponta.",
   "Desempenho em execução (abertura, troca de abas, arrastar do dashboard) não foi medido.",
   "Não há documento de produto ou público-alvo no repositório; o posicionamento foi inferido do código (pt-BR, TACO, treinadores com Instagram)."
  ],
  "checks": [
   {
    "name": "TypeScript (tsc --noEmit)",
    "result": "Passa",
    "detail": "0 erros com expo-env.d.ts gerado. Sem ele, falha nos tipos de CSS; o workflow do EAS cria o arquivo antes de rodar."
   },
   {
    "name": "ESLint (expo lint)",
    "result": "Passa",
    "detail": "0 erros e 0 avisos. O erro de use-color-scheme.web.ts da auditoria anterior foi corrigido."
   },
   {
    "name": "Testes (jest-expo)",
    "result": "28 passando",
    "detail": "4 suítes em src/lib/__tests__ (profile, tasks, weight, workouts). Nada cobre contextos, repositórios, useUserStore ou telas. supabase/tests/rls.sql existe, mas não roda no CI."
   },
   {
    "name": "CI (EAS Workflow)",
    "result": "Parcial",
    "detail": "Antes de publicar: variáveis (check-env), lint, typecheck e testes. Não verifica compatibilidade dos pacotes nativos com o SDK, o que deixou passar o crash do ExpoSQLite corrigido em 25f3a9b."
   }
  ]
 },
 "stack": [
  {
   "group": "Plataforma",
   "items": [
    "Expo SDK 58 (expo ~58.0.23)",
    "React Native 0.88",
    "React 19.3 com React Compiler",
    "TypeScript 6 strict",
    "Typed routes"
   ]
  },
  {
   "group": "Navegação",
   "items": [
    "Expo Router 58",
    "Stack.Protected para área logada",
    "Abas próprias com swipe (sliding-tabs)"
   ]
  },
  {
   "group": "UI",
   "items": [
    "Design system Material 3 gerado do ícone",
    "lucide-react-native",
    "react-native-svg",
    "Reanimated 4 + Worklets",
    "expo-image"
   ]
  },
  {
   "group": "Backend",
   "items": [
    "Supabase: Auth (e-mail, Google por idToken, PKCE), Postgres com 18 tabelas e RLS, Realtime no chat",
    "@supabase/supabase-js 2",
    "Migrações e seed versionados em supabase/",
    "Testes de RLS em SQL"
   ]
  },
  {
   "group": "Estado e dados",
   "items": [
    "10 contexts React + UndoProvider",
    "useUserStore: carga por conta, atualização otimista, fila de salvamento",
    "Repositórios por domínio (local para demo, Supabase)",
    "expo-sqlite para a sessão; expo-crypto para ids"
   ]
  },
  {
   "group": "Integrações",
   "items": [
    "ExerciseDB (oss.exercisedb.dev)",
    "Open Food Facts",
    "TACO embarcada",
    "Google Sign-In",
    "Instagram (links)"
   ]
  },
  {
   "group": "Qualidade e entrega",
   "items": [
    "jest-expo (28 testes)",
    "ESLint",
    "EAS Build/Update com fingerprint",
    "Workflow: check-env, lint, typecheck, testes → OTA ou build"
   ]
  }
 ],
 "scores": [
  {
   "key": "tech",
   "label": "Qualidade técnica",
   "score": 7.5,
   "why": "Lint e typecheck limpos, 28 testes de domínio no CI, erros do Supabase traduzidos para pt-BR (src/lib/auth.ts), fluxos de link cuidadosos. Perde por cobertura só de src/lib, helpers ainda duplicados e fallbacks com dados de exemplo em telas reais.",
   "problems": [
    "Testes não cobrem contextos, repositórios nem useUserStore (N-23)",
    "parseNumber duplicado e MOCK_PROFILE como fallback (N-16, N-17)",
    "draggable-dashboard.tsx com 718 linhas (N-20)"
   ],
   "improve": [
    "Testar useUserStore e um repositório com mocks do Supabase",
    "Unificar parsing em src/lib",
    "Remover fallbacks de exemplo das telas"
   ]
  },
  {
   "key": "arch",
   "label": "Arquitetura",
   "score": 7.5,
   "why": "A camada de repositório com useUserStore é a decisão certa: telas não conhecem o Supabase, o modo demo usa a mesma interface e cada conta é isolada. Perde pelo carregamento tudo ou nada, pela carga do histórico inteiro e pela fila de salvamento só em memória.",
   "problems": [
    "Um domínio com erro bloqueia o app (N-09)",
    "Histórico completo carregado na abertura (N-10)",
    "Fila de salvamento perdida se o app fechar (N-11)",
    "10 providers aninhados com dependência de ordem"
   ],
   "improve": [
    "Carregamento por domínio com erro local",
    "Consultas por período",
    "Persistir a fila no aparelho"
   ]
  },
  {
   "key": "ux",
   "label": "UX/UI",
   "score": 7.5,
   "why": "Material 3 consistente, tudo em pt-BR, desfazer e confirmações nas ações destrutivas, fluxos de cadastro e senha completos com estados de erro e reenvio. Perde por metas e passos fictícios na tela inicial, 6 abas, perfil sem edição e sem tela de configurações.",
   "problems": [
    "Metas fixas e passos fictícios (N-01, N-02)",
    "Perfil e registros sem edição (N-03, N-04)",
    "6 destinos na barra (N-15)"
   ],
   "improve": [
    "Metas calculadas e widget de passos só com fonte real",
    "Edição por toque em cada registro",
    "Configurações e 5 abas"
   ]
  },
  {
   "key": "features",
   "label": "Funcionalidades",
   "score": 7,
   "why": "Alimentação, treino, peso, treinadores e chat funcionam com dados reais por conta. Faltam as partes que dão retorno ao usuário: metas pessoais, histórico de treinos e edição.",
   "problems": [
    "Metas não usam o perfil (N-01)",
    "Sem histórico de cargas",
    "Chat sem o lado do treinador"
   ],
   "improve": [
    "Metas calculadas",
    "Histórico e progressão",
    "Painel do treinador"
   ]
  },
  {
   "key": "complete",
   "label": "Completude",
   "score": 6,
   "why": "Criar, ver e excluir funcionam em todos os domínios; editar só existe para tarefas internamente (sem tela). Não há configurações, exclusão de conta nem exportação.",
   "problems": [
    "Sem edição de registros (N-03)",
    "Sem exclusão de conta (N-05)",
    "Sem configurações (N-04)"
   ],
   "improve": [
    "Fechar o ciclo criar, editar, excluir",
    "Área de conta com excluir e exportar"
   ]
  },
  {
   "key": "security",
   "label": "Segurança",
   "score": 7,
   "why": "RLS em todas as tabelas do usuário com testes em SQL, catálogo só leitura, aluno só envia mensagens como aluno, chave publicável no app, PKCE. Perde pela falta de exclusão de conta e consentimento para dados de saúde e pelo signOut global.",
   "problems": [
    "Sem exclusão de conta nem consentimento (N-05)",
    "Sair desconecta todos os aparelhos (N-12)",
    "rls.sql não roda no CI"
   ],
   "improve": [
    "Excluir conta e política de privacidade",
    "signOut com escopo local",
    "Rodar rls.sql no CI"
   ]
  },
  {
   "key": "perf",
   "label": "Performance",
   "score": 6.5,
   "why": "TACO indexada sob demanda, buscas com cache e debounce, React Compiler, GIFs sem autoplay. A abertura espera 9 cargas e cada uma traz o histórico inteiro, o que piora com o uso. Nada foi medido em aparelho.",
   "problems": [
    "Histórico completo na abertura (N-10)",
    "Abertura bloqueada por 9 cargas (N-09)"
   ],
   "improve": [
    "Carregar só o período visível",
    "Mostrar abas com o que já carregou"
   ]
  },
  {
   "key": "scale",
   "label": "Escalabilidade",
   "score": 6,
   "why": "Postgres com RLS e índices por usuário é base sólida. O cliente lê tudo de uma vez, salva em fila só na memória e não tem sincronização offline.",
   "problems": [
    "selectAll em food_entries, exercise_entries e chat (N-10)",
    "Fila em memória (N-11)"
   ],
   "improve": [
    "Paginação por data",
    "Fila persistida e sincronização ao reconectar"
   ]
  },
  {
   "key": "maint",
   "label": "Manutenibilidade",
   "score": 7.5,
   "why": "Código comentado com o porquê, tipos gerados do banco, migrações versionadas, CI com checagens. Arquivos grandes e helpers repetidos ainda existem.",
   "problems": [
    "Componente de 718 linhas (N-20)",
    "Duplicações pequenas (N-16)",
    "Variável de ambiente sem uso (N-18)"
   ],
   "improve": [
    "Dividir o dashboard",
    "Limpeza de duplicações e config morta"
   ]
  },
  {
   "key": "prod",
   "label": "Prontidão para produção",
   "score": 4.5,
   "why": "Funciona de ponta a ponta no Android, mas um crash de abertura chegou ao aparelho por incompatibilidade nativa, não há monitoramento de erros, iOS não está configurado e faltam requisitos de loja e LGPD.",
   "problems": [
    "Sem verificação nativa no CI (N-13)",
    "Sem monitoramento de erros",
    "iOS não configurado (N-14)",
    "Sem exclusão de conta (N-05)"
   ],
   "improve": [
    "Fase 1 e Fase 5 do roadmap"
   ]
  }
 ],
 "overall": {
  "score": 6.7,
  "frontPhaseScore": 7.3,
  "maturity": "MVP funcional",
  "maturityScale": [
   "Protótipo",
   "MVP inicial",
   "MVP funcional",
   "Produto em evolução",
   "Produto pronto para produção",
   "Produto maduro"
  ],
  "maturityWhy": "Desde a auditoria anterior (MVP inicial) o app ganhou autenticação real, persistência por conta com RLS, desfazer nas exclusões, testes e CI. Hoje um usuário consegue criar conta, registrar alimentação, peso e treinos e encontrá-los em outro aparelho. Ainda não é um produto em evolução porque as metas da tela principal não são pessoais, não há edição de registros nem histórico de treinos, e faltam monitoramento, iOS e requisitos de privacidade.",
  "frontPhaseWhy": "Média de qualidade técnica, arquitetura, UX/UI, funcionalidades, completude, performance e manutenibilidade, sem segurança, escalabilidade e prontidão, que dependem de decisões de backend e operação.",
  "previousScore": 5.2
 },
 "architecture": {
  "layers": [
   {
    "name": "Rotas (src/app)",
    "role": "35 arquivos de rota do Expo Router: telas e navegadores.",
    "files": 35
   },
   {
    "name": "Componentes (src/components)",
    "role": "UI reutilizável: ui/ (primitivos M3, confirm-dialog), dashboard/, diary/, exercise/, trainers/, tasks/, auth/, signup/, undo-snackbar, save-error-banner, app-error-boundary.",
    "files": 62
   },
   {
    "name": "Contextos (src/context)",
    "role": "Estado e ações por domínio; cada um usa useUserStore para carregar e salvar.",
    "files": 11
   },
   {
    "name": "Dados (src/data)",
    "role": "Interfaces de repositório, useUserStore, implementação local (demo) e Supabase, tipos gerados do banco, perfil.",
    "files": 18
   },
   {
    "name": "Domínio e serviços (src/lib)",
    "role": "Regras puras testadas, clientes de ExerciseDB e Open Food Facts, TACO, cliente Supabase, auth.",
    "files": 25
   },
   {
    "name": "Supabase (supabase/)",
    "role": "5 migrações, seed do catálogo, testes de RLS, config.",
    "files": 9
   }
  ],
  "providers": [
   "SessionProvider",
   "CatalogProvider",
   "WeightLogProvider",
   "FoodLogProvider",
   "ExerciseLogProvider",
   "WorkoutPlanProvider",
   "CoachingProvider",
   "ChatProvider",
   "TasksProvider",
   "DashboardLayoutProvider",
   "UndoProvider"
  ],
  "providerDeps": [
   {
    "from": "CatalogProvider … DashboardLayoutProvider",
    "to": "SessionProvider",
    "why": "useUserStore carrega e descarta os dados pela conta da sessão"
   },
   {
    "from": "CoachingProvider",
    "to": "WorkoutPlanProvider",
    "why": "aderir importa treinos e define os dias"
   },
   {
    "from": "CoachingProvider",
    "to": "CatalogProvider",
    "why": "busca o pacote e o treinador"
   },
   {
    "from": "WeightLogProvider",
    "to": "SessionProvider",
    "why": "atualiza o peso do perfil"
   }
  ],
  "domains": [
   {
    "name": "Conta e perfil",
    "context": "session.tsx, signup.tsx",
    "lib": "auth.ts, profile.ts, supabase.ts, data/profile.ts",
    "screens": [
     "login",
     "signup",
     "signup/details",
     "signup/confirm",
     "forgot-password/*",
     "auth/callback",
     "(tabs)/profile"
    ]
   },
   {
    "name": "Alimentação",
    "context": "food-log.tsx",
    "lib": "foods.ts, taco.ts, openfoodfacts.ts, data/supabase/food-log.ts",
    "screens": [
     "(tabs)/diary",
     "log-food",
     "log-food/[id]",
     "meals"
    ]
   },
   {
    "name": "Exercício avulso",
    "context": "exercise-log.tsx",
    "lib": "exercises.ts, exercisedb.ts, data/supabase/exercise-log.ts",
    "screens": [
     "(tabs)/exercise",
     "log-exercise",
     "log-exercise/[id]"
    ]
   },
   {
    "name": "Plano de treino",
    "context": "workout-plan.tsx",
    "lib": "workouts.ts, data/supabase/workout-plan.ts",
    "screens": [
     "workouts",
     "workouts/[id]",
     "workout-session"
    ]
   },
   {
    "name": "Treinadores",
    "context": "catalog.tsx, coaching.tsx, chat.tsx",
    "lib": "trainers.ts, chat.ts, data/supabase/catalog.ts, coaching.ts, chat.ts",
    "screens": [
     "(tabs)/trainers",
     "trainer/[id]",
     "trainer/package/[id]",
     "trainer/workout",
     "chat/[trainerId]"
    ]
   },
   {
    "name": "Tarefas",
    "context": "tasks.tsx",
    "lib": "tasks.ts, data/supabase/tasks.ts",
    "screens": [
     "(tabs)/tasks",
     "add-task"
    ]
   },
   {
    "name": "Peso",
    "context": "weight-log.tsx",
    "lib": "weight.ts, data/supabase/weight.ts",
    "screens": [
     "(tabs)/index",
     "(tabs)/profile"
    ]
   },
   {
    "name": "Tela inicial",
    "context": "dashboard-layout.tsx",
    "lib": "dashboard-widgets.ts, dashboard-data.ts",
    "screens": [
     "(tabs)/index"
    ]
   }
  ],
  "external": [
   {
    "name": "Supabase",
    "used": "src/lib/supabase.ts, src/data/supabase/*",
    "note": "Auth, Postgres com RLS e Realtime. Cliente com chave publicável; sem chaves, mostra aviso em vez de travar."
   },
   {
    "name": "ExerciseDB",
    "used": "src/lib/exercisedb.ts",
    "note": "API gratuita sem SLA, nomes em inglês, limita rajadas. EXPO_PUBLIC_FITEXERCISEDB_API_KEY está no .env.example, mas o código não usa."
   },
   {
    "name": "Open Food Facts",
    "used": "src/lib/openfoodfacts.ts",
    "note": "Produtos do Brasil, valores impossíveis descartados."
   },
   {
    "name": "TACO embarcada",
    "used": "src/lib/taco.ts",
    "note": "597 alimentos offline."
   },
   {
    "name": "Google Sign-In",
    "used": "src/lib/google-auth.ts",
    "note": "Android com idToken; iOS com URL scheme de exemplo."
   }
  ],
  "pros": [
   "Camada de repositório com uma interface por domínio e duas implementações (demo e Supabase): o front evolui sem depender do backend, e as telas não importam o Supabase.",
   "useUserStore isola os dados por conta, mostra mudanças na hora e salva em ordem, com aviso e nova tentativa quando um salvamento falha.",
   "RLS em todas as tabelas do usuário, testado em supabase/tests/rls.sql; o perfil e as refeições padrão são criados por trigger no cadastro.",
   "Fluxos de autenticação completos e robustos: PKCE, link expirado, link aberto em outro aparelho, reenvio com espera, recuperação que não entra no app antes da nova senha.",
   "Regras de negócio puras em src/lib com testes no CI; erros do Supabase traduzidos para mensagens em pt-BR.",
   "Workflow do EAS bloqueia OTA se variáveis, lint, typecheck ou testes falharem."
  ],
  "cons": [
   "Abertura tudo ou nada: se qualquer um dos 9 domínios falhar ao carregar, o app inteiro mostra erro (src/app/(tabs)/_layout.tsx, use-user-data-status.ts).",
   "Cada domínio carrega o histórico completo da conta na abertura (selectAll), o que cresce sem limite.",
   "A fila de salvamento vive em memória: mudanças mostradas e não salvas somem se o app fechar sem conexão.",
   "Telas reais ainda usam dados de exemplo: metas e passos de MOCK_DASHBOARD, peso de MOCK_PROFILE como reserva.",
   "Nenhuma verificação de compatibilidade nativa no CI; o crash do ExpoSQLite chegou ao aparelho por isso.",
   "11 providers aninhados no layout raiz, com dependências implícitas pela ordem."
  ]
 },
 "issues": [
  {
   "id": "N-01",
   "title": "Metas fixas apesar do perfil completo",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Metas",
   "evidence": "src/app/(tabs)/index.tsx:38 (data = MOCK_DASHBOARD); src/lib/dashboard-data.ts (2.200 kcal, macros, 400 kcal de exercício)",
   "detail": "O cadastro e a tela Complete seu perfil dizem 'Usamos esses dados para estimar suas calorias', mas toda conta vê meta de 2.200 kcal e os mesmos macros.",
   "fix": "Calcular TMB (Mifflin-St Jeor) com nascimento, sexo, altura e peso, mais objetivo e nível de atividade, com ajuste manual."
  },
  {
   "id": "N-02",
   "title": "Passos fictícios na tela inicial",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Dashboard",
   "evidence": "src/app/(tabs)/index.tsx:37 (TODO) e StepsTile com MOCK_DASHBOARD.steps",
   "detail": "6.840 de 10.000 passos aparecem para qualquer usuário, inclusive na conta criada nas capturas.",
   "fix": "Ocultar o widget até haver fonte real (Health Connect / HealthKit) ou mostrar 'Conectar passos'."
  },
  {
   "id": "N-03",
   "title": "Registros não podem ser editados",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Funcionalidade",
   "evidence": "src/data/types.ts: FoodLogRepository e ExerciseLogRepository só têm add/remove; tasks.update é usado só para marcar feito; workout-plan sem edição de exercício planejado",
   "detail": "Corrigir gramas, refeição, minutos, séries ou o nome de uma tarefa exige excluir e recriar. Com o desfazer novo, o atalho fica menos arriscado, mas continua em dois passos.",
   "fix": "Adicionar update nos repositórios e abrir a tela de criação em modo edição ao tocar no item."
  },
  {
   "id": "N-04",
   "title": "Perfil sem edição e sem configurações",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Conta",
   "evidence": "src/app/(tabs)/profile.tsx (só registrar peso, meta e sair); CompleteProfile só aparece com perfil incompleto",
   "detail": "Nome, nascimento, sexo e altura ficam como no cadastro. Não há lugar para metas, unidades, notificações, privacidade ou conta.",
   "fix": "Tela de edição de perfil reaproveitando BodyDataStep e uma tela de configurações."
  },
  {
   "id": "N-05",
   "title": "Sem exclusão de conta, exportação ou consentimento",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Privacidade",
   "evidence": "Busca por 'excluir conta', 'deleteUser' e 'exportar' sem resultados em src/ e supabase/",
   "detail": "O app guarda peso, alimentação e dados corporais. A LGPD trata dados de saúde como sensíveis, e a Play Store exige exclusão de conta dentro do app.",
   "fix": "Função no Supabase para excluir a conta e os dados, consentimento no cadastro, política acessível e exportação."
  },
  {
   "id": "N-06",
   "title": "Desfazer conclusão antiga desalinha a fila",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinos",
   "evidence": "src/context/workout-plan.tsx:225 undoCompletion (queueIndex − 1 sem olhar a ordem das conclusões)",
   "detail": "No modo fila, desfazer um dia anterior volta o ponteiro mesmo que treinos posteriores já tenham sido feitos.",
   "fix": "Derivar o próximo treino da última conclusão ou só permitir desfazer a mais recente; cobrir com teste em workouts.test.ts."
  },
  {
   "id": "N-07",
   "title": "Sair do pacote apaga o histórico ligado a ele",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/context/coaching.tsx:58 leavePackage → removeWorkout; src/lib/workouts.ts:132 procura o treino concluído pelo id",
   "detail": "Os dias concluídos com treinos do pacote deixam de mostrar o treino e o resumo da sessão.",
   "fix": "Arquivar treinos de pacote em vez de excluir ou guardar um resumo na conclusão."
  },
  {
   "id": "N-08",
   "title": "Exercício manual entra com 0 kcal",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Regras",
   "evidence": "src/app/workout-session.tsx:148 e captura exercise-details (Bicicleta ergométrica, 30 min, 0 kcal)",
   "detail": "Sem MET, o exercício digitado à mão não queima calorias no saldo da tela inicial.",
   "fix": "MET padrão por categoria ou campo de intensidade ao criar exercício manual."
  },
  {
   "id": "N-09",
   "title": "Abertura tudo ou nada",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Arquitetura",
   "evidence": "src/app/(tabs)/_layout.tsx (erro em qualquer store mostra a tela de erro); src/hooks/use-user-data-status.ts",
   "detail": "Uma falha ao carregar só o chat ou só o catálogo impede o uso do diário e do treino.",
   "fix": "Mostrar as abas assim que sessão e perfil carregarem e tratar erro e carregamento por seção."
  },
  {
   "id": "N-10",
   "title": "Histórico completo carregado na abertura",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Escalabilidade",
   "evidence": "src/data/supabase/food-log.ts, exercise-log.ts e chat.ts usam selectAll paginando todas as linhas da conta",
   "detail": "Depois de meses de uso, a abertura baixa todos os alimentos, exercícios e mensagens já registrados.",
   "fix": "Carregar por período (dia ou semana visível) e buscar o resto sob demanda."
  },
  {
   "id": "N-11",
   "title": "Fila de salvamento só em memória",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Dados",
   "evidence": "src/data/use-user-store.ts (queue em useRef)",
   "detail": "Se a conexão cair, a mudança aparece na tela e o aviso de erro surge, mas, se o app for fechado antes de tentar de novo, a mudança some.",
   "fix": "Persistir a fila no expo-sqlite e reenviar ao abrir ou ao reconectar."
  },
  {
   "id": "N-12",
   "title": "Sair desconecta todos os aparelhos",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Segurança",
   "evidence": "src/context/session.tsx:258 supabase.auth.signOut() sem scope; o padrão do auth-js 2.118 é 'global' (GoTrueClient.d.ts)",
   "detail": "Sair no celular encerra também a sessão na web e em outros aparelhos. Faz sentido na troca de senha (já usa global de propósito), não no Sair comum.",
   "fix": "signOut({ scope: 'local' }) no Sair."
  },
  {
   "id": "N-13",
   "title": "CI não verifica compatibilidade nativa",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Entrega",
   "evidence": ".eas/workflows/preview.yml (sem expo install --check ou expo-doctor); commit 25f3a9b descreve o crash do ExpoSQLite por runtime incompatível",
   "detail": "Um conjunto de versões incompatível passou por lint, typecheck e testes e fechou o app na abertura em aparelhos reais.",
   "fix": "Rodar npx expo install --check e npx expo-doctor no job de checks, e um smoke test do build quando o fingerprint mudar."
  },
  {
   "id": "N-14",
   "title": "iOS não configurado",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Entrega",
   "evidence": "app.json:38 iosUrlScheme de exemplo; sem ios.bundleIdentifier; workflow só Android",
   "detail": "Não há build iOS possível hoje e o Google Sign-In no iOS não funcionaria.",
   "fix": "bundleIdentifier, URL scheme real e job iOS quando houver conta Apple."
  },
  {
   "id": "N-15",
   "title": "Seis destinos na barra de navegação",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/constants/tabs.ts",
   "detail": "A barra do Material 3 prevê de 3 a 5 destinos; nas capturas, 'Exercícios' e 'Treinador' ficam colados.",
   "fix": "Levar Tarefas para o Início (já há widget) ou Perfil para o cabeçalho."
  },
  {
   "id": "N-16",
   "title": "Parsing de números duplicado",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "parseNumber em src/app/log-food/[id].tsx:19 e src/app/log-exercise/[id].tsx:32; parseDecimal em src/lib/profile.ts",
   "detail": "Mesma regra em três lugares.",
   "fix": "Usar parseDecimal em todos."
  },
  {
   "id": "N-17",
   "title": "Dados de exemplo como reserva em telas reais",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "profile?.weightKg ?? MOCK_PROFILE.weightKg em workout-card.tsx:43, weight-dialog.tsx:41, workout-session.tsx:74, log-exercise/[id].tsx:42; profile.tsx:35",
   "detail": "Se o perfil vier sem peso, cálculos de kcal usam o peso de exemplo silenciosamente. CompleteProfile torna isso raro, mas o caminho existe.",
   "fix": "Tratar perfil ausente explicitamente em vez de usar o mock."
  },
  {
   "id": "N-18",
   "title": "Variável de ambiente sem uso",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Configuração",
   "evidence": "EXPO_PUBLIC_FITEXERCISEDB_API_KEY em scripts/check-env.mjs e .env.example; nenhum uso em src/",
   "detail": "Confunde quem configura o ambiente.",
   "fix": "Remover ou usar."
  },
  {
   "id": "N-19",
   "title": "Typecheck depende de arquivo gerado",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "tsconfig.json inclui expo-env.d.ts (git-ignored); o workflow cria o arquivo com echo",
   "detail": "Em clone novo, npm run typecheck falha até rodar expo start.",
   "fix": "Declarar os tipos de CSS num .d.ts versionado ou gerar no script typecheck."
  },
  {
   "id": "N-20",
   "title": "Componente de dashboard com 718 linhas",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "src/components/dashboard/draggable-dashboard.tsx",
   "detail": "Gesto, geometria, rolagem, lixeira e acessibilidade no mesmo arquivo; o bug de NaN corrigido em bc153f6 nasceu ali.",
   "fix": "Extrair o cálculo do alvo de soltura (testável) e a lixeira."
  },
  {
   "id": "N-21",
   "title": "Quantidade de alimento sem limite",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Validação",
   "evidence": "src/app/log-food/[id].tsx:46 valid = gramsValue > 0",
   "detail": "Aceita valores absurdos por erro de digitação.",
   "fix": "Limite com mensagem (ex.: 5.000 g)."
  },
  {
   "id": "N-22",
   "title": "Busca de exercícios em inglês e frágil",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/lib/exercisedb.ts (oss.exercisedb.dev, sem chave); log-exercise/index.tsx busca ao enviar",
   "detail": "Nomes e termos em inglês num app em pt-BR; serviço gratuito sem SLA.",
   "fix": "Cache próprio no Supabase com nomes traduzidos."
  },
  {
   "id": "N-23",
   "title": "Testes só no domínio puro",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "src/lib/__tests__ (4 suítes); supabase/tests/rls.sql fora do CI",
   "detail": "A parte mais delicada (fila de salvamento, troca de conta, mapeamento dos repositórios) não tem teste.",
   "fix": "Testes de useUserStore e dos repositórios com cliente Supabase simulado; rls.sql no CI com supabase start."
  },
  {
   "id": "N-24",
   "title": "Sessão de treino não sobrevive ao fechamento",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Treinos",
   "evidence": "src/app/workout-session.tsx (estado na tela)",
   "detail": "Se o sistema encerrar o app no meio do treino, tempo e séries se perdem.",
   "fix": "Persistir a sessão em andamento e oferecer retomar."
  },
  {
   "id": "N-25",
   "title": "Ícone e textos pequenos inconsistentes",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/log-exercise/index.tsx:275 'Tentar novamente' com ícone de +; src/app/(tabs)/trainers.tsx mostra 'Nenhum treinador encontrado para “”' com catálogo vazio e sem busca",
   "detail": "Detalhes que passam impressão de inacabado.",
   "fix": "RotateCw no botão; texto próprio para catálogo vazio."
  },
  {
   "id": "N-26",
   "title": "Remover refeição sem desfazer",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/meals.tsx:65 onRemove={() => removeMeal(meal.id)}",
   "detail": "Único item removível sem desfazer nem confirmação; os alimentos continuam, mas a refeição sai do diário.",
   "fix": "Usar o mesmo showUndo dos outros diários."
  }
 ],
 "hypotheses": [
  {
   "id": "H-01",
   "title": "Abertura lenta com histórico grande",
   "detail": "Consequência provável de N-09 e N-10 em contas antigas; não medido."
  },
  {
   "id": "H-02",
   "title": "Conflito de edição entre aparelhos",
   "detail": "As gravações substituem o registro inteiro (ex.: tasks.update, saveWorkouts) sem controle de versão; duas edições simultâneas em aparelhos diferentes podem se sobrescrever. Não reproduzido."
  },
  {
   "id": "H-03",
   "title": "OTA em binário antigo",
   "detail": "O incidente do ExpoSQLite mostrou o mesmo binário recebendo JS novo por vários dias. Com fingerprint isso não deveria ocorrer; a origem (update manual ou build local) não foi verificada."
  }
 ],
 "missing": [
  {
   "name": "Exclusão de conta, exportação e consentimento",
   "priority": "P0",
   "area": "Privacidade",
   "why": "Requisito da Play Store e da LGPD para um app que guarda dados de saúde (N-05)."
  },
  {
   "name": "Verificação nativa e monitoramento de erros",
   "priority": "P0",
   "area": "Operação",
   "why": "Um crash de abertura chegou ao aparelho e só foi diagnosticado por relatório de bugs manual (N-13). Sem isso, cada OTA é um risco invisível."
  },
  {
   "name": "Metas calculadas do perfil",
   "priority": "P1",
   "area": "Personalização",
   "why": "O app coleta os dados e promete estimar; o anel de calorias e os macros não têm significado com valores fixos (N-01)."
  },
  {
   "name": "Edição de registros e do perfil",
   "priority": "P1",
   "area": "Fluxos incompletos",
   "why": "Corrigir é a ação mais comum num diário (N-03, N-04)."
  },
  {
   "name": "Tela de configurações",
   "priority": "P1",
   "area": "Personalização",
   "why": "Sem lugar para metas, conta, privacidade e notificações."
  },
  {
   "name": "Histórico e progressão de treinos",
   "priority": "P1",
   "area": "Relatórios",
   "why": "Séries, cargas e sensação já são gravadas no banco e não aparecem em lugar nenhum."
  },
  {
   "name": "Carregamento por período e fila persistida",
   "priority": "P1",
   "area": "Escalabilidade",
   "why": "Evita abertura cada vez mais lenta e perda de mudanças offline (N-10, N-11)."
  },
  {
   "name": "Lado do treinador no chat",
   "priority": "P1",
   "area": "Marketplace",
   "why": "O chat grava mensagens reais que ninguém lê; ou se constrói o painel, ou o chat deve sair da tela do aluno."
  },
  {
   "name": "Timer de descanso e registro por série",
   "priority": "P2",
   "area": "Treino",
   "why": "A sessão registra um único valor por exercício."
  },
  {
   "name": "Recentes, favoritos e copiar refeição",
   "priority": "P2",
   "area": "Retenção",
   "why": "Reduz o atrito diário do registro."
  },
  {
   "name": "Leitor de código de barras",
   "priority": "P2",
   "area": "Integrações",
   "why": "Open Food Facts já é indexado por código de barras."
  },
  {
   "name": "Lembretes locais",
   "priority": "P2",
   "area": "Notificações",
   "why": "Treino do dia e tarefas dependem de o usuário abrir o app."
  },
  {
   "name": "Passos via Health Connect / HealthKit",
   "priority": "P2",
   "area": "Integrações",
   "why": "Substitui o número fictício (N-02)."
  },
  {
   "name": "Relatório semanal",
   "priority": "P2",
   "area": "Relatórios",
   "why": "Peso, média de kcal e aderência ao plano numa visão só."
  },
  {
   "name": "Build e login no iOS",
   "priority": "P2",
   "area": "Plataforma",
   "why": "Sem build iOS hoje e com o Google Sign-In configurado só para Android (N-14); necessário se o público incluir usuários de iPhone."
  },
  {
   "name": "Avaliação de pacotes pelos alunos",
   "priority": "P3",
   "area": "Engajamento",
   "why": "Os comentários exibidos vêm do seed."
  },
  {
   "name": "Pagamento de pacotes",
   "priority": "P3",
   "area": "Monetização",
   "why": "Só se o modelo de negócio previr pacotes pagos; não há indício no código."
  }
 ],
 "flows": [
  {
   "name": "Primeiro acesso e cadastro",
   "steps": [
    {
     "label": "Splash até ler a sessão",
     "kind": "ok"
    },
    {
     "label": "Login → Criar conta",
     "kind": "ok"
    },
    {
     "label": "Conta: nome, e-mail, senha e confirmação",
     "kind": "ok"
    },
    {
     "label": "Sobre você: nascimento, sexo, altura, peso",
     "kind": "friction",
     "note": "Promete estimar calorias e não estima"
    },
    {
     "label": "Confirme seu e-mail",
     "kind": "friction",
     "note": "Exige abrir o e-mail no mesmo celular"
    },
    {
     "label": "Link → entra no app",
     "kind": "ok"
    },
    {
     "label": "Início com meta fixa e passos fictícios",
     "kind": "break",
     "note": "N-01, N-02"
    },
    {
     "label": "Onboarding de objetivo",
     "kind": "missing"
    }
   ],
   "notes": "O cadastro ficou completo e seguro; o fim do fluxo ainda entrega números que não são do usuário."
  },
  {
   "name": "Recuperação de senha",
   "steps": [
    {
     "label": "Esqueci minha senha",
     "kind": "ok"
    },
    {
     "label": "E-mail (vem preenchido do login)",
     "kind": "ok"
    },
    {
     "label": "Verifique seu e-mail, reenviar em 60 s",
     "kind": "ok"
    },
    {
     "label": "Link → nova senha",
     "kind": "ok"
    },
    {
     "label": "Volta ao login com e-mail preenchido",
     "kind": "ok"
    }
   ],
   "notes": "Fluxo completo, inclusive link expirado e link aberto em outro aparelho. Indisponível no modo demo, com mensagem."
  },
  {
   "name": "Login com Google",
   "steps": [
    {
     "label": "Continuar com Google",
     "kind": "ok"
    },
    {
     "label": "idToken → Supabase",
     "kind": "ok"
    },
    {
     "label": "Complete seu perfil",
     "kind": "ok",
     "note": "Pede os dados corporais que o Google não traz"
    },
    {
     "label": "iOS",
     "kind": "missing",
     "note": "URL scheme de exemplo"
    }
   ],
   "notes": "Bem resolvido no Android; não verificado de ponta a ponta."
  },
  {
   "name": "Registrar uma refeição",
   "steps": [
    {
     "label": "Diário → Adicionar alimento",
     "kind": "ok"
    },
    {
     "label": "Busca TACO + Open Food Facts",
     "kind": "ok"
    },
    {
     "label": "Quantidade e refeição",
     "kind": "ok"
    },
    {
     "label": "Salvo no Supabase em segundo plano",
     "kind": "ok"
    },
    {
     "label": "Remover com Desfazer",
     "kind": "ok"
    },
    {
     "label": "Corrigir quantidade",
     "kind": "missing",
     "note": "N-03"
    },
    {
     "label": "Repetir refeição de ontem",
     "kind": "missing"
    }
   ],
   "notes": "O fluxo mais maduro; faltam edição e atalhos."
  },
  {
   "name": "Montar e executar um treino",
   "steps": [
    {
     "label": "Planejar treinos",
     "kind": "ok"
    },
    {
     "label": "Adicionar exercício (catálogo ou manual)",
     "kind": "friction",
     "note": "Inglês; manual com 0 kcal"
    },
    {
     "label": "Dias da semana ou fila",
     "kind": "ok"
    },
    {
     "label": "Iniciar treino",
     "kind": "ok"
    },
    {
     "label": "Concluir e registrar sensação",
     "kind": "friction",
     "note": "Sem descanso nem séries"
    },
    {
     "label": "Ver evolução das cargas",
     "kind": "missing"
    }
   ],
   "notes": "Planejamento flexível; falta o retorno de progresso."
  },
  {
   "name": "Seguir um treinador",
   "steps": [
    {
     "label": "Treinador → perfil",
     "kind": "ok"
    },
    {
     "label": "Pacote → Aderir (confirma se há plano)",
     "kind": "ok"
    },
    {
     "label": "Treinos no planejamento",
     "kind": "ok"
    },
    {
     "label": "Conversar",
     "kind": "friction",
     "note": "Aviso de que ainda não responde"
    },
    {
     "label": "Sair do pacote (confirma)",
     "kind": "break",
     "note": "Apaga histórico (N-07)"
    },
    {
     "label": "Avaliar o pacote",
     "kind": "missing"
    }
   ],
   "notes": "Proteções novas resolveram a perda do plano; falta o lado do treinador."
  },
  {
   "name": "Sair e trocar de conta",
   "steps": [
    {
     "label": "Perfil → Sair (confirma)",
     "kind": "ok"
    },
    {
     "label": "Desconecta todos os aparelhos",
     "kind": "friction",
     "note": "N-12"
    },
    {
     "label": "Outra conta vê só os próprios dados",
     "kind": "ok"
    }
   ],
   "notes": "O vazamento entre contas da auditoria anterior foi resolvido."
  },
  {
   "name": "Recuperação de erros",
   "steps": [
    {
     "label": "Falha ao carregar → Tentar de novo / Sair",
     "kind": "friction",
     "note": "Bloqueia o app todo (N-09)"
    },
    {
     "label": "Falha ao salvar → aviso com Tentar novamente",
     "kind": "ok"
    },
    {
     "label": "App fechado com mudanças não salvas",
     "kind": "break",
     "note": "N-11"
    },
    {
     "label": "Erro de tela → Algo deu errado",
     "kind": "ok"
    },
    {
     "label": "Erro antes das rotas (módulo nativo)",
     "kind": "break",
     "note": "Fecha o app (N-13)"
    }
   ],
   "notes": "Bem melhor que antes, com dois buracos: mudanças offline e erros nativos."
  },
  {
   "name": "Configurações e conta",
   "steps": [
    {
     "label": "Editar perfil",
     "kind": "missing"
    },
    {
     "label": "Metas e unidades",
     "kind": "missing"
    },
    {
     "label": "Excluir conta / exportar dados",
     "kind": "missing",
     "note": "N-05"
    }
   ],
   "notes": "Área inexistente."
  }
 ],
 "benchmark": {
  "caveat": "Não há documento de posicionamento no repositório. O público foi inferido do código: brasileiros (pt-BR, TACO, produtos do Brasil) que treinam com programas de personal trainers divulgados no Instagram. As referências vêm de conhecimento público sobre esses apps e não foram verificadas nesta auditoria.",
  "competitors": [
   {
    "name": "MyFitnessPal",
    "segment": "Diário alimentar",
    "strengths": "Base enorme, código de barras, metas calculadas, refeições salvas.",
    "treinaVs": "TACO offline é melhor para comida brasileira; faltam metas calculadas, edição, recentes e código de barras.",
    "opportunity": "Diário rápido e brasileiro ligado ao treino."
   },
   {
    "name": "FatSecret / Tecnonutri",
    "segment": "Calorias no Brasil",
    "strengths": "Base brasileira, comunidade.",
    "treinaVs": "Mesmo público; o Treina já sincroniza entre aparelhos, mas não tem relatórios.",
    "opportunity": "Dieta e treino num painel só."
   },
   {
    "name": "Hevy / Strong",
    "segment": "Musculação",
    "strengths": "Registro por série, descanso, histórico e recordes.",
    "treinaVs": "Plano semanal ou fila e sessão cronometrada; um valor por exercício e nenhum histórico visível.",
    "opportunity": "Progressão de carga por exercício."
   },
   {
    "name": "MFIT Personal / Tecnofit / Trainerize",
    "segment": "Personal ↔ aluno",
    "strengths": "Prescrição, chat, cobrança.",
    "treinaVs": "Lado do aluno pronto (pacotes, adesão, chat em tempo real); lado do treinador inexistente.",
    "opportunity": "Programas de influenciadores com execução guiada; o diferencial mais claro."
   },
   {
    "name": "Samsung Health / Google Fit / Apple Saúde",
    "segment": "Atividade",
    "strengths": "Passos e sono automáticos.",
    "treinaVs": "Passos fictícios.",
    "opportunity": "Integrar via Health Connect / HealthKit."
   }
  ],
  "differentiators": [
   "Diário, treino e treinador no mesmo app, com o treino do pacote virando o treino do dia.",
   "TACO embarcada: busca instantânea e offline de alimentos brasileiros.",
   "Plano em fila para quem não treina em dias fixos.",
   "Dados sincronizados por conta com proteção por usuário no banco."
  ],
  "doNotCopy": [
   "Feed social e desafios públicos: sem sinal de que seja o objetivo, e custa moderação.",
   "Base própria de alimentos colaborativa: TACO + Open Food Facts já cobrem bem.",
   "Tarefas genéricas como app de produtividade: melhor transformar em hábitos de saúde."
  ]
 },
 "gallery": {
  "note": "Capturas do app real exportado para web em modo demo (EXPO_PUBLIC_AUTH_MODE=demo, dados em memória) e navegado com Playwright num viewport de 390 × 844 em 12/11/2026. Os dados foram criados pela própria interface. A versão web aproxima o app nativo; fontes, sombras e gestos podem diferir. O ambiente da auditoria bloqueia ExerciseDB, Open Food Facts e as fotos dos treinadores; essas partes aparecem com erro ou iniciais. Telas abertas por link (confirmação e nova senha) foram abertas sem código, por isso mostram o estado de link inválido.",
  "missing": [
   {
    "screen": "bootstrap",
    "why": "O carregamento dura poucos quadros e o erro exige uma falha real do Supabase; não dá para capturar sem alterar o código."
   },
   {
    "screen": "complete-profile",
    "why": "Só aparece para contas criadas com Google, que não funciona no modo demo da versão web."
   }
  ],
  "images": [
   {
    "screen": "login",
    "file": "screens/login.jpg",
    "id": "login",
    "caption": "Login em pt-BR com Esqueci minha senha e Google."
   },
   {
    "screen": "forgot-password",
    "file": "screens/forgot-password.jpg",
    "id": "forgot-password",
    "caption": "Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível."
   },
   {
    "screen": "forgot-check-email",
    "file": "screens/forgot-check-email.jpg",
    "id": "forgot-check-email",
    "caption": "Verifique seu e-mail, com reenvio liberado após 60 s."
   },
   {
    "screen": "forgot-new-password",
    "file": "screens/forgot-new-password.jpg",
    "id": "forgot-new-password",
    "caption": "Nova senha aberta sem código: estado de link inválido com ação para pedir outro."
   },
   {
    "screen": "signup-account",
    "file": "screens/signup-account.jpg",
    "id": "signup-account",
    "caption": "Cadastro, etapa 1: nome, e-mail, senha e confirmação."
   },
   {
    "screen": "signup-details",
    "file": "screens/signup-details.jpg",
    "id": "signup-details",
    "caption": "Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01)."
   },
   {
    "screen": "signup-confirm",
    "file": "screens/signup-confirm.jpg",
    "id": "signup-confirm",
    "caption": "Confirme seu e-mail, com reenvio."
   },
   {
    "screen": "auth-callback",
    "file": "screens/auth-callback.jpg",
    "id": "auth-callback",
    "caption": "Link de confirmação sem código: erro com orientação para entrar com a senha."
   },
   {
    "screen": "home",
    "file": "screens/home.jpg",
    "id": "home",
    "caption": "Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."
   },
   {
    "screen": "home",
    "file": "screens/home-edit.jpg",
    "id": "home-edit",
    "caption": "Modo de edição da tela inicial."
   },
   {
    "screen": "home",
    "file": "screens/home-dark.jpg",
    "id": "home-dark",
    "caption": "Tema escuro numa conta nova."
   },
   {
    "screen": "diary",
    "file": "screens/diary.jpg",
    "id": "diary",
    "caption": "Diário com café da manhã e almoço."
   },
   {
    "screen": "diary",
    "file": "screens/diary-undo.jpg",
    "id": "diary-undo",
    "caption": "Alimento removido com snackbar de Desfazer."
   },
   {
    "screen": "log-food",
    "file": "screens/log-food.jpg",
    "id": "log-food",
    "caption": "Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria."
   },
   {
    "screen": "food-details",
    "file": "screens/food-details.jpg",
    "id": "food-details",
    "caption": "Quantidade, refeição e nutrientes."
   },
   {
    "screen": "meals",
    "file": "screens/meals.jpg",
    "id": "meals",
    "caption": "Refeições do diário; remover não tem desfazer (N-26)."
   },
   {
    "screen": "exercise",
    "file": "screens/exercise.jpg",
    "id": "exercise",
    "caption": "Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante."
   },
   {
    "screen": "log-exercise",
    "file": "screens/log-exercise.jpg",
    "id": "log-exercise",
    "caption": "Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria."
   },
   {
    "screen": "exercise-details",
    "file": "screens/exercise-details.jpg",
    "id": "exercise-details",
    "caption": "Exercício manual: 30 min e 0 kcal, sem MET (N-08)."
   },
   {
    "screen": "workouts",
    "file": "screens/workouts.jpg",
    "id": "workouts",
    "caption": "Planejamento depois de aderir ao pacote."
   },
   {
    "screen": "workout",
    "file": "screens/workout.jpg",
    "id": "workout",
    "caption": "Treino próprio com cardio manual."
   },
   {
    "screen": "session",
    "file": "screens/session.jpg",
    "id": "session",
    "caption": "Sessão cronometrada com um exercício concluído."
   },
   {
    "screen": "session",
    "file": "screens/dialog-leave-session.jpg",
    "id": "dialog-leave-session",
    "caption": "Confirmação ao sair da sessão."
   },
   {
    "screen": "trainers",
    "file": "screens/trainers.jpg",
    "id": "trainers",
    "caption": "Catálogo de treinadores carregado do seed."
   },
   {
    "screen": "trainer",
    "file": "screens/trainer.jpg",
    "id": "trainer",
    "caption": "Perfil do treinador."
   },
   {
    "screen": "package",
    "file": "screens/package.jpg",
    "id": "package",
    "caption": "Pacote com treinos, comentários e Aderir."
   },
   {
    "screen": "package-workout",
    "file": "screens/package-workout.jpg",
    "id": "package-workout",
    "caption": "Treino do pacote com notas do treinador."
   },
   {
    "screen": "chat",
    "file": "screens/chat.jpg",
    "id": "chat",
    "caption": "Chat com aviso de que o treinador ainda não responde pelo app."
   },
   {
    "screen": "tasks",
    "file": "screens/tasks.jpg",
    "id": "tasks",
    "caption": "Tarefa diária com subtarefas e tarefa avulsa."
   },
   {
    "screen": "add-task",
    "file": "screens/add-task.jpg",
    "id": "add-task",
    "caption": "Nova tarefa com repetição diária."
   },
   {
    "screen": "profile",
    "file": "screens/profile.jpg",
    "id": "profile",
    "caption": "Perfil com idade calculada e meta de peso."
   },
   {
    "screen": "profile",
    "file": "screens/dialog-weight.jpg",
    "id": "dialog-weight",
    "caption": "Registrar peso com data da medição."
   },
   {
    "screen": "profile",
    "file": "screens/dialog-signout.jpg",
    "id": "dialog-signout",
    "caption": "Confirmação de saída; no modo demo avisa que os dados se perdem."
   }
  ]
 },
 "evolution": [
  {
   "id": "I-01",
   "title": "Nenhuma persistência local",
   "status": "Resolvido",
   "note": "Dados por conta no Supabase; sessão salva com expo-sqlite. O modo demo continua em memória de propósito."
  },
  {
   "id": "I-02",
   "title": "Dados não isolados por conta",
   "status": "Resolvido",
   "note": "useUserStore recomeça do vazio quando a conta muda."
  },
  {
   "id": "I-03",
   "title": "Histórico de peso fictício",
   "status": "Resolvido",
   "note": "Pesagens vêm do repositório; a primeira é criada no cadastro."
  },
  {
   "id": "I-04",
   "title": "Metas fixas",
   "status": "Aberto",
   "note": "Continua: 2.200 kcal, macros e 400 kcal de exercício de MOCK_DASHBOARD (N-01)."
  },
  {
   "id": "I-05",
   "title": "Passos fictícios",
   "status": "Aberto",
   "note": "Continua: 6.840 passos (N-02)."
  },
  {
   "id": "I-06",
   "title": "Pacote apagava o plano sem aviso",
   "status": "Resolvido",
   "note": "Diálogo também quando há dias planejados."
  },
  {
   "id": "I-07",
   "title": "Desfazer conclusão desalinha a fila",
   "status": "Aberto",
   "note": "undoCompletion inalterado (N-06)."
  },
  {
   "id": "I-08",
   "title": "Login em inglês",
   "status": "Resolvido",
   "note": "Textos em pt-BR."
  },
  {
   "id": "I-09",
   "title": "E-mail sem normalização",
   "status": "Resolvido",
   "note": "normalizeEmail em src/lib/auth.ts."
  },
  {
   "id": "I-10",
   "title": "Autenticação simulada",
   "status": "Resolvido",
   "note": "Supabase Auth com PKCE; demo só por variável."
  },
  {
   "id": "I-11",
   "title": "Exclusões sem proteção",
   "status": "Parcial",
   "note": "Desfazer em alimentos, exercícios e tarefas; confirmação em treino, pacote e conta. Remover refeição continua sem proteção (N-26)."
  },
  {
   "id": "I-12",
   "title": "Registros não editáveis",
   "status": "Aberto",
   "note": "Repositórios de alimento e exercício só têm add/remove (N-03)."
  },
  {
   "id": "I-13",
   "title": "Perfil não editável",
   "status": "Parcial",
   "note": "Idade agora vem da data de nascimento; dados continuam sem edição (N-04)."
  },
  {
   "id": "I-14",
   "title": "Chat sem resposta e sem aviso",
   "status": "Parcial",
   "note": "Aviso na tela; o treinador ainda não tem como responder."
  },
  {
   "id": "I-15",
   "title": "Duas fontes do peso",
   "status": "Resolvido",
   "note": "Peso atual = última pesagem."
  },
  {
   "id": "I-16",
   "title": "Nenhum teste",
   "status": "Parcial",
   "note": "28 testes de src/lib no CI; nada para contextos, repositórios ou telas (N-23)."
  },
  {
   "id": "I-17",
   "title": "Erro de lint",
   "status": "Resolvido",
   "note": "Lint limpo."
  },
  {
   "id": "I-18",
   "title": "Helpers duplicados",
   "status": "Parcial",
   "note": "EMAIL_PATTERN e normalização unificados; parseNumber ainda duplicado (N-16)."
  },
  {
   "id": "I-19",
   "title": "Código e dependências sem uso",
   "status": "Resolvido",
   "note": "Removidos em a645770."
  },
  {
   "id": "I-20",
   "title": "Sem camada de dados",
   "status": "Resolvido",
   "note": "Repositórios por domínio com implementação local e Supabase."
  },
  {
   "id": "I-21",
   "title": "Dependência implícita entre providers",
   "status": "Aberto",
   "note": "Agora 11 providers aninhados."
  },
  {
   "id": "I-22",
   "title": "Catálogo fixo no código",
   "status": "Resolvido",
   "note": "Vem das tabelas do Supabase; o arquivo antigo é fixture do modo demo."
  },
  {
   "id": "I-23",
   "title": "iOS não configurado",
   "status": "Aberto",
   "note": "iosUrlScheme de exemplo e sem bundleIdentifier (N-14)."
  },
  {
   "id": "I-24",
   "title": "Seis abas",
   "status": "Aberto",
   "note": "Inalterado (N-15)."
  },
  {
   "id": "I-25",
   "title": "Busca de exercícios inconsistente",
   "status": "Parcial",
   "note": "Filtro por categoria; continua em inglês e só ao enviar (N-22)."
  },
  {
   "id": "I-26",
   "title": "Ícone errado em Tentar novamente",
   "status": "Aberto",
   "note": "Ainda Plus (N-25)."
  },
  {
   "id": "I-27",
   "title": "Registro em datas futuras inconsistente",
   "status": "Aberto",
   "note": "Diário e exercícios avulsos aceitam datas futuras; o card de treino bloqueia."
  },
  {
   "id": "I-28",
   "title": "Calorias de exercício manual",
   "status": "Aberto",
   "note": "Continua 0 kcal sem MET (N-08)."
  },
  {
   "id": "I-29",
   "title": "Dashboard com 714 linhas",
   "status": "Aberto",
   "note": "Agora 718 linhas (N-20)."
  },
  {
   "id": "I-30",
   "title": "Quantidade sem limite",
   "status": "Aberto",
   "note": "Inalterado (N-21)."
  },
  {
   "id": "I-31",
   "title": "Typecheck depende de arquivo gerado",
   "status": "Parcial",
   "note": "O CI cria o arquivo; localmente continua (N-19)."
  },
  {
   "id": "I-32",
   "title": "Sessão de treino perdida",
   "status": "Aberto",
   "note": "Inalterado (N-24)."
  },
  {
   "id": "I-33",
   "title": "Sair do pacote apaga histórico",
   "status": "Aberto",
   "note": "Inalterado (N-07)."
  }
 ],
 "screens": [
  {
   "id": "login",
   "name": "Login",
   "route": "/login",
   "group": "Autenticação",
   "files": [
    "src/app/login.tsx",
    "src/context/session.tsx",
    "src/lib/auth.ts",
    "src/lib/google-auth.ts"
   ],
   "objective": "Entrar com e-mail e senha ou com Google.",
   "context": "Quem não tem sessão salva.",
   "importance": "Alta",
   "works": [
    "Login real no Supabase com erros traduzidos (e-mail ou senha incorretos, sem conexão)",
    "Conta não confirmada leva à tela de confirmação com reenvio",
    "Google com idToken",
    "Mostrar/ocultar senha",
    "Link para recuperar senha com e-mail preenchido",
    "E-mail normalizado"
   ],
   "partial": [
    "Google só no Android; no iOS o URL scheme é de exemplo (N-14)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Textos em pt-BR e hierarquia clara",
    "+ Erro anunciado com role alert",
    "+ Mensagem após redefinir senha",
    "- Sem indicar quando o Supabase não está configurado antes de tentar"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Erros mapeados por código em src/lib/auth.ts",
    "Validação e normalização centralizadas"
   ],
   "opportunities": [
    "Entrar com Apple quando houver iOS",
    "Biometria para reabrir"
   ],
   "issues": [
    "N-14"
   ],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Código limpo, erros tipados e traduzidos.",
    "ux": "Clara e completa em pt-BR.",
    "complete": "Cobre e-mail, Google e recuperação; iOS pendente.",
    "maturity": "Pronta para uso real no Android."
   }
  },
  {
   "id": "forgot-password",
   "name": "Esqueceu a senha",
   "route": "/forgot-password",
   "group": "Autenticação",
   "files": [
    "src/app/forgot-password/index.tsx"
   ],
   "objective": "Pedir o link de redefinição.",
   "context": "Usuário que esqueceu a senha.",
   "importance": "Alta",
   "works": [
    "Valida e normaliza o e-mail",
    "Envia o link do Supabase",
    "Erro claro no modo demo"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ E-mail vem preenchido do login",
    "+ Etapa 1 de 3 indicada"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Reaproveita StepScreen e helpers de auth"
   ],
   "opportunities": [
    "Nada crítico"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 9,
    "maturity": 8
   },
   "justify": {
    "tech": "Simples e correta.",
    "ux": "Direta.",
    "complete": "Cumpre o passo.",
    "maturity": "Depende só do e-mail configurado no Supabase."
   }
  },
  {
   "id": "forgot-check-email",
   "name": "Verifique seu e-mail (senha)",
   "route": "/forgot-password/check-email",
   "group": "Autenticação",
   "files": [
    "src/app/forgot-password/check-email.tsx",
    "src/components/auth/resend-email.tsx"
   ],
   "objective": "Orientar a abrir o link e permitir reenvio.",
   "context": "Após pedir o link.",
   "importance": "Média",
   "works": [
    "Reenvio com espera de 60 s",
    "Voltar para o login"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Texto não confirma se a conta existe (boa prática)",
    "- Pede para abrir no mesmo celular sem explicar o motivo (PKCE)"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "ResendEmail reaproveitado com cadastro"
   ],
   "opportunities": [
    "Explicar por que precisa ser o mesmo aparelho"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 8,
    "maturity": 8
   },
   "justify": {
    "tech": "Componente reaproveitado.",
    "ux": "Clara; restrição pouco explicada.",
    "complete": "Completa.",
    "maturity": "Estável."
   }
  },
  {
   "id": "forgot-new-password",
   "name": "Nova senha",
   "route": "/forgot-password/new-password",
   "group": "Autenticação",
   "files": [
    "src/app/forgot-password/new-password.tsx",
    "src/context/session.tsx"
   ],
   "objective": "Criar a nova senha a partir do link.",
   "context": "Aberta pelo link do e-mail.",
   "importance": "Alta",
   "works": [
    "Troca o código pelo usuário sem entrar no app",
    "Senha e confirmação validadas",
    "Encerra a sessão em todos os aparelhos após trocar",
    "Link expirado ou inválido com ação para pedir outro"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Estados de link (conferindo, pronto, inválido)",
    "+ Volta ao login com aviso"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Fluxo de recuperação isolado da sessão normal (recovery ref)",
    "Cancelamento ao desmontar"
   ],
   "opportunities": [
    "Medidor de força da senha"
   ],
   "issues": [],
   "scores": {
    "tech": 9,
    "ux": 8,
    "complete": 9,
    "maturity": 8
   },
   "justify": {
    "tech": "Trata casos de borda raros com cuidado.",
    "ux": "Clara em todos os estados.",
    "complete": "Completa.",
    "maturity": "Não testada de ponta a ponta aqui."
   }
  },
  {
   "id": "signup-account",
   "name": "Criar conta: sua conta",
   "route": "/signup",
   "group": "Autenticação",
   "files": [
    "src/app/signup/index.tsx",
    "src/components/signup/step-screen.tsx"
   ],
   "objective": "Nome, e-mail, senha e confirmação.",
   "context": "Novo usuário.",
   "importance": "Alta",
   "works": [
    "Nome completo, e-mail e senha validados",
    "Confirmação de senha",
    "Mostrar senha"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Etapas indicadas",
    "- Erro único no rodapé, não junto ao campo",
    "- Sem termos de uso e consentimento (N-05)"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "StepScreen compartilhado"
   ],
   "opportunities": [
    "Consentimento de dados de saúde aqui"
   ],
   "issues": [
    "N-05"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Validação correta.",
    "ux": "Boa; erros centralizados.",
    "complete": "Falta consentimento.",
    "maturity": "Pronta, menos o requisito legal."
   }
  },
  {
   "id": "signup-details",
   "name": "Criar conta: sobre você",
   "route": "/signup/details",
   "group": "Autenticação",
   "files": [
    "src/app/signup/details.tsx",
    "src/components/signup/body-data-step.tsx"
   ],
   "objective": "Nascimento, sexo, altura e peso.",
   "context": "Etapa 2 do cadastro.",
   "importance": "Alta",
   "works": [
    "Data de nascimento com máscara",
    "Altura por seletor e peso validado",
    "Dados enviados no signUp e gravados por trigger (perfil + primeira pesagem)"
   ],
   "partial": [
    "Promete estimar calorias e as metas continuam fixas (N-01)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ BodyDataStep reaproveitado em Complete seu perfil",
    "- Não pergunta objetivo nem nível de atividade"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Trigger on_auth_user_created evita perfil sem dados"
   ],
   "opportunities": [
    "Objetivo e atividade para calcular metas"
   ],
   "issues": [
    "N-01"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 6,
    "maturity": 7
   },
   "justify": {
    "tech": "Boa divisão entre app e banco.",
    "ux": "Clara, com promessa não cumprida.",
    "complete": "Faltam dados para metas.",
    "maturity": "Grava corretamente no banco."
   }
  },
  {
   "id": "signup-confirm",
   "name": "Confirme seu e-mail",
   "route": "/signup/confirm",
   "group": "Autenticação",
   "files": [
    "src/app/signup/confirm.tsx",
    "src/components/auth/resend-email.tsx"
   ],
   "objective": "Pedir a confirmação pelo link.",
   "context": "Após cadastro ou login de conta não confirmada.",
   "importance": "Alta",
   "works": [
    "Reenvio com espera",
    "Texto diferente quando vem do login",
    "Redireciona ao cadastro sem e-mail"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Explica o próximo passo",
    "- 'Já confirmei, entrar' só volta ao login; não tenta entrar"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Simples e correta"
   ],
   "opportunities": [
    "Abrir o app de e-mail"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 8,
    "maturity": 8
   },
   "justify": {
    "tech": "Correta.",
    "ux": "Botão com texto que promete mais do que faz.",
    "complete": "Completa.",
    "maturity": "Estável."
   }
  },
  {
   "id": "auth-callback",
   "name": "Confirmando e-mail (link)",
   "route": "/auth/callback",
   "group": "Autenticação",
   "files": [
    "src/app/auth/callback.tsx"
   ],
   "objective": "Trocar o código do link pela sessão.",
   "context": "Aberta pelo link de confirmação.",
   "importance": "Média",
   "works": [
    "Entra automaticamente",
    "Erro com orientação de entrar com a senha",
    "Aberto em outro aparelho: o e-mail já fica confirmado e a tela orienta entrar com a senha"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Mensagens específicas por código de erro"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Troca de código única por link (exchangeOnce)"
   ],
   "opportunities": [
    "Nada crítico"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 9,
    "maturity": 8
   },
   "justify": {
    "tech": "Evita troca duplicada.",
    "ux": "Clara.",
    "complete": "Completa.",
    "maturity": "Não testada ponta a ponta aqui."
   }
  },
  {
   "id": "bootstrap",
   "name": "Carregando / erro ao carregar",
   "route": "(tabs)/_layout",
   "group": "Autenticação",
   "files": [
    "src/app/(tabs)/_layout.tsx",
    "src/hooks/use-main-flow-bootstrap.ts",
    "src/hooks/use-user-data-status.ts",
    "src/components/main-flow-loading.tsx"
   ],
   "objective": "Carregar perfil e os 9 domínios antes das abas.",
   "context": "Após login e a cada abertura com sessão.",
   "importance": "Alta",
   "works": [
    "Carrega perfil (profiles + última pesagem)",
    "Espera os 9 domínios",
    "Erro com Tentar de novo e Sair"
   ],
   "partial": [
    "Tudo ou nada: um domínio com erro bloqueia o app (N-09)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Mensagem clara",
    "- Sem indicação de qual parte falhou"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Agregação de status em use-user-data-status",
    "Histórico completo de cada domínio na abertura (N-10)"
   ],
   "opportunities": [
    "Mostrar abas com erro por seção"
   ],
   "issues": [
    "N-09",
    "N-10"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Simples, mas acopla todos os domínios.",
    "ux": "Falha genérica.",
    "complete": "Faz o necessário.",
    "maturity": "Piora com o crescimento dos dados."
   }
  },
  {
   "id": "complete-profile",
   "name": "Complete seu perfil",
   "route": "(tabs)/_layout → CompleteProfile",
   "group": "Autenticação",
   "files": [
    "src/components/complete-profile.tsx",
    "src/data/profile.ts"
   ],
   "objective": "Pedir dados corporais que faltam (contas Google).",
   "context": "Primeiro acesso com Google.",
   "importance": "Média",
   "works": [
    "Salva nascimento, sexo e altura no profiles",
    "Peso vira pesagem do dia",
    "Sair disponível"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Reaproveita o passo do cadastro",
    "- Mesma promessa de estimar calorias (N-01)"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Acessa o Supabase direto por src/data/profile.ts, fora da interface de repositórios"
   ],
   "opportunities": [
    "Mover o perfil para um repositório"
   ],
   "issues": [
    "N-01"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Funciona; fura a abstração de repositório.",
    "ux": "Clara.",
    "complete": "Cumpre o objetivo.",
    "maturity": "Sem captura: só aparece para contas Google, indisponível no modo demo web."
   }
  },
  {
   "id": "home",
   "name": "Início (dashboard)",
   "route": "/(tabs)",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/index.tsx",
    "src/components/dashboard/*",
    "src/context/dashboard-layout.tsx"
   ],
   "objective": "Resumo do dia.",
   "context": "Tela de abertura.",
   "importance": "Alta",
   "works": [
    "Calorias, macros e exercício reais do dia",
    "Peso com gráfico por período",
    "Tarefas do dia",
    "Layout personalizável e salvo por conta"
   ],
   "partial": [
    "Metas fixas (N-01)"
   ],
   "visual": [
    "Passos 6.840 fixos (N-02)"
   ],
   "redundant": [
    "Widget de tarefas repete a aba Tarefas"
   ],
   "ux": [
    "+ Hierarquia clara e modo edição explícito",
    "- Dado fictício ao lado de dado real",
    "- Não navega para outros dias"
   ],
   "states": {
    "loading": "sim (no carregamento geral)",
    "empty": "sim",
    "error": "geral",
    "success": "sim"
   },
   "tech": [
    "Arrastar com Reanimated em componente de 718 linhas (N-20)",
    "Correção do NaN da lixeira em bc153f6"
   ],
   "opportunities": [
    "Metas calculadas",
    "Tocar no card abre a aba"
   ],
   "issues": [
    "N-01",
    "N-02",
    "N-20"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Avançado, concentrado num arquivo.",
    "ux": "Boa, com números enganosos.",
    "complete": "Metas e passos não são reais.",
    "maturity": "Layout persistido; dados centrais ainda mock."
   }
  },
  {
   "id": "diary",
   "name": "Diário alimentar",
   "route": "/(tabs)/diary",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/diary.tsx",
    "src/components/diary/meal-section.tsx",
    "src/context/food-log.tsx"
   ],
   "objective": "Ver e registrar alimentos por refeição.",
   "context": "Uso diário.",
   "importance": "Alta",
   "works": [
    "Seletor de dia e totais",
    "Seções por refeição",
    "Remover com Desfazer",
    "Salvo por conta no Supabase"
   ],
   "partial": [
    "Sem edição (N-03)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Snackbar de desfazer",
    "- Totais sem comparação com a meta",
    "- Sem atalhos (recentes, copiar)"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "aviso de salvamento",
    "success": "sim"
   },
   "tech": [
    "Atualização otimista com fila"
   ],
   "opportunities": [
    "Editar ao tocar",
    "Copiar refeição"
   ],
   "issues": [
    "N-03"
   ],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 7,
    "maturity": 8
   },
   "justify": {
    "tech": "Bem integrado ao store.",
    "ux": "Leitura rápida e desfazer.",
    "complete": "Falta editar.",
    "maturity": "Persistido e seguro."
   }
  },
  {
   "id": "log-food",
   "name": "Adicionar alimento (busca)",
   "route": "/log-food",
   "group": "Modais",
   "files": [
    "src/app/log-food/index.tsx",
    "src/hooks/use-food-search.ts"
   ],
   "objective": "Buscar alimento genérico ou produto.",
   "context": "A partir do diário.",
   "importance": "Alta",
   "works": [
    "TACO na hora e offline",
    "Open Food Facts após pausa",
    "Erro com Tentar novamente"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Estado vazio e foco automático",
    "- Sem recentes no estado vazio"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Debounce, cache e descarte de respostas antigas"
   ],
   "opportunities": [
    "Recentes e código de barras"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 8
   },
   "justify": {
    "tech": "Melhor implementação de busca.",
    "ux": "Rápida.",
    "complete": "Faltam atalhos.",
    "maturity": "Estável."
   }
  },
  {
   "id": "food-details",
   "name": "Quantidade do alimento",
   "route": "/log-food/[id]",
   "group": "Modais",
   "files": [
    "src/app/log-food/[id].tsx"
   ],
   "objective": "Gramas, refeição e nutrientes.",
   "context": "Após escolher o alimento.",
   "importance": "Alta",
   "works": [
    "Porção e 100 g como atalhos",
    "Troca de refeição",
    "Nutrientes ao digitar"
   ],
   "partial": [
    "Sem limite de gramas (N-21)"
   ],
   "visual": [],
   "redundant": [
    "parseNumber local (N-16)"
   ],
   "ux": [
    "+ Prévia imediata",
    "- Só gramas, sem medidas caseiras"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Validação mínima"
   ],
   "opportunities": [
    "Medidas caseiras",
    "Modo edição"
   ],
   "issues": [
    "N-16",
    "N-21"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Correto; duplica helper.",
    "ux": "Clara.",
    "complete": "Sem medidas caseiras.",
    "maturity": "Funciona."
   }
  },
  {
   "id": "meals",
   "name": "Refeições",
   "route": "/meals",
   "group": "Modais",
   "files": [
    "src/app/meals.tsx"
   ],
   "objective": "Escolher refeições do diário.",
   "context": "Configuração ocasional.",
   "importance": "Baixa",
   "works": [
    "Adicionar padrão ou personalizada",
    "Remover (mantém ao menos uma)",
    "Salvo por conta"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Remover sem desfazer, diferente dos outros diários (N-26)",
    "- Sem reordenar ou renomear"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "insertMeal mantém ordem do dia"
   ],
   "opportunities": [
    "Desfazer e reordenar"
   ],
   "issues": [
    "N-26"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 8,
    "maturity": 8
   },
   "justify": {
    "tech": "Regras pequenas e corretas.",
    "ux": "Inconsistente no remover.",
    "complete": "Cumpre.",
    "maturity": "Persistida."
   }
  },
  {
   "id": "exercise",
   "name": "Exercícios",
   "route": "/(tabs)/exercise",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/exercise.tsx",
    "src/components/exercise/workout-card.tsx",
    "src/components/exercise/exercise-list.tsx"
   ],
   "objective": "Treino do dia e exercícios registrados.",
   "context": "Dias de treino.",
   "importance": "Alta",
   "works": [
    "Treino do dia pelo plano (semanal ou fila)",
    "Iniciar sessão ou concluir sem cronômetro",
    "Lista única de exercícios com Desfazer",
    "FAB para adicionar"
   ],
   "partial": [
    "Desfazer em dia antigo desalinha a fila (N-06)",
    "Manual com 0 kcal (N-08)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Lista única mais simples que as duas seções antigas",
    "- Minutos contam só cardio"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "aviso",
    "success": "sim"
   },
   "tech": [
    "getWorkoutForDate centraliza a regra"
   ],
   "opportunities": [
    "Histórico de cargas"
   ],
   "issues": [
    "N-06",
    "N-08"
   ],
   "scores": {
    "tech": 7,
    "ux": 8,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Bom, com bug de fila.",
    "ux": "Mais limpa que antes.",
    "complete": "Falta histórico.",
    "maturity": "Persistida."
   }
  },
  {
   "id": "log-exercise",
   "name": "Adicionar exercício (busca)",
   "route": "/log-exercise",
   "group": "Modais",
   "files": [
    "src/app/log-exercise/index.tsx",
    "src/lib/exercisedb.ts"
   ],
   "objective": "Escolher do ExerciseDB ou digitar.",
   "context": "Registro ou montagem de treino.",
   "importance": "Alta",
   "works": [
    "Filtro Todos/Cardio/Musculação",
    "Catálogo paginado",
    "Adicionar manualmente"
   ],
   "partial": [
    "Termos em inglês (N-22)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Filtro por categoria",
    "- Busca só ao enviar",
    "- Ícone + em Tentar novamente (N-25)"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Depende de API gratuita sem SLA"
   ],
   "opportunities": [
    "Cache traduzido no Supabase"
   ],
   "issues": [
    "N-22",
    "N-25"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Erros tratados.",
    "ux": "Barreira de idioma.",
    "complete": "Cobre catálogo e manual.",
    "maturity": "Serviço externo frágil (bloqueado nas capturas)."
   }
  },
  {
   "id": "exercise-details",
   "name": "Detalhes do exercício",
   "route": "/log-exercise/[id]",
   "group": "Modais",
   "files": [
    "src/app/log-exercise/[id].tsx"
   ],
   "objective": "Duração/calorias ou séries/carga.",
   "context": "Após escolher.",
   "importance": "Alta",
   "works": [
    "Categoria escolhível para exercício manual",
    "Estimativa por MET com peso do perfil",
    "Modo adicionar ao treino"
   ],
   "partial": [
    "Manual sem MET = 0 kcal (N-08)"
   ],
   "visual": [],
   "redundant": [
    "parseNumber local (N-16)"
   ],
   "ux": [
    "+ Dica de estimativa",
    "- Uma carga para todas as séries"
   ],
   "states": {
    "loading": "n/a",
    "empty": "parcial",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Fallback de peso para MOCK_PROFILE (N-17)"
   ],
   "opportunities": [
    "MET padrão por categoria",
    "Lembrar últimos valores"
   ],
   "issues": [
    "N-08",
    "N-16",
    "N-17"
   ],
   "scores": {
    "tech": 6,
    "ux": 6,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Ramificações e mock de reserva.",
    "ux": "Genérica para musculação.",
    "complete": "Cobre os dois tipos.",
    "maturity": "Calorias pouco confiáveis."
   }
  },
  {
   "id": "workouts",
   "name": "Planejamento",
   "route": "/workouts",
   "group": "Modais",
   "files": [
    "src/app/workouts/index.tsx",
    "src/context/workout-plan.tsx"
   ],
   "objective": "Criar treinos e definir semana ou fila.",
   "context": "Configuração do plano.",
   "importance": "Alta",
   "works": [
    "Treinos com nome automático",
    "Semana por diálogo",
    "Fila com mover, remover e próximo",
    "Persistido por conta"
   ],
   "partial": [],
   "visual": [],
   "redundant": [
    "Botão Confirmar com salvamento automático"
   ],
   "ux": [
    "+ Explicação de cada modo",
    "- Reordenar só por setas"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "aviso",
    "success": "sim"
   },
   "tech": [
    "Regras de fila com casos de borda"
   ],
   "opportunities": [
    "Arrastar para reordenar"
   ],
   "issues": [
    "N-06"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Bom, ponteiro frágil.",
    "ux": "Flexível.",
    "complete": "Cobre os dois modos.",
    "maturity": "Persistido."
   }
  },
  {
   "id": "workout",
   "name": "Treino (edição)",
   "route": "/workouts/[id]",
   "group": "Modais",
   "files": [
    "src/app/workouts/[id].tsx"
   ],
   "objective": "Nome e exercícios do treino.",
   "context": "Dentro do planejamento.",
   "importance": "Média",
   "works": [
    "Renomear",
    "Adicionar musculação ou cardio",
    "Remover exercício",
    "Excluir treino com confirmação",
    "Treino de treinador bloqueado"
   ],
   "partial": [
    "Não edita séries, carga ou minutos de exercício já adicionado (N-03)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Confirmação ao excluir",
    "- Sem reordenar exercícios"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "saveWorkouts substitui o treino inteiro (H-02)"
   ],
   "opportunities": [
    "Editar e reordenar exercícios",
    "Duplicar treino"
   ],
   "issues": [
    "N-03"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 7
   },
   "justify": {
    "tech": "Correto.",
    "ux": "Protegido.",
    "complete": "Edição parcial.",
    "maturity": "Persistido."
   }
  },
  {
   "id": "session",
   "name": "Sessão de treino",
   "route": "/workout-session",
   "group": "Modais",
   "files": [
    "src/app/workout-session.tsx"
   ],
   "objective": "Executar o treino com cronômetro.",
   "context": "Durante o treino.",
   "importance": "Alta",
   "works": [
    "Cronômetro por timestamps",
    "Valores planejados editáveis",
    "Concluir/desfazer exercício",
    "Sensação 0–5",
    "Confirmação ao sair"
   ],
   "partial": [
    "Perdida se o app fechar (N-24)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Saída protegida",
    "- Sem descanso, séries ou tela ligada"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "usePreventRemove bem aplicado",
    "0 kcal sem MET (N-08)"
   ],
   "opportunities": [
    "Descanso, séries, keep-awake, retomar"
   ],
   "issues": [
    "N-08",
    "N-24"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Fluxo de saída correto.",
    "ux": "Falta o essencial da série.",
    "complete": "Sem descanso e séries.",
    "maturity": "Estado só na tela."
   }
  },
  {
   "id": "trainers",
   "name": "Treinador (lista)",
   "route": "/(tabs)/trainers",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/trainers.tsx",
    "src/context/catalog.tsx",
    "src/data/supabase/catalog.ts"
   ],
   "objective": "Encontrar treinadores.",
   "context": "Descoberta.",
   "importance": "Média",
   "works": [
    "Catálogo do banco (seed)",
    "Busca por nome"
   ],
   "partial": [],
   "visual": [
    "Treinadores, números e fotos são dados de seed"
   ],
   "redundant": [],
   "ux": [
    "- Sem filtros",
    "- Texto de vazio com aspas vazias (N-25)"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "geral",
    "success": "sim"
   },
   "tech": [
    "Catálogo carregado com os dados da conta"
   ],
   "opportunities": [
    "Filtros por objetivo"
   ],
   "issues": [
    "N-25"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Vem do banco.",
    "ux": "Simples.",
    "complete": "Sem filtros.",
    "maturity": "Conteúdo ainda de exemplo."
   }
  },
  {
   "id": "trainer",
   "name": "Perfil do treinador",
   "route": "/trainer/[id]",
   "group": "Treinadores",
   "files": [
    "src/app/trainer/[id].tsx"
   ],
   "objective": "Apresentar o treinador e os pacotes.",
   "context": "Decisão de seguir.",
   "importance": "Média",
   "works": [
    "Bio, números, Instagram",
    "Conversar",
    "Pacotes com Você aderiu"
   ],
   "partial": [],
   "visual": [
    "Números do seed"
   ],
   "redundant": [],
   "ux": [
    "+ Rótulos de acessibilidade",
    "- Conversar leva a chat sem resposta"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "geral",
    "success": "sim"
   },
   "tech": [
    "Linking sem tratamento de falha"
   ],
   "opportunities": [
    "Mostrar tempo de resposta quando houver"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Correto.",
    "ux": "Bem apresentado.",
    "complete": "Sem treinador real.",
    "maturity": "Conteúdo de seed."
   }
  },
  {
   "id": "package",
   "name": "Pacote de treinos",
   "route": "/trainer/package/[id]",
   "group": "Treinadores",
   "files": [
    "src/app/trainer/package/[id].tsx",
    "src/context/coaching.tsx"
   ],
   "objective": "Treinos, comentários e adesão.",
   "context": "Decisão de seguir o programa.",
   "importance": "Alta",
   "works": [
    "Aderir com confirmação se houver plano",
    "Sair com confirmação",
    "Ver planejamento",
    "Adesão salva por conta"
   ],
   "partial": [
    "Sair apaga histórico (N-07)",
    "Duração em semanas não acompanhada"
   ],
   "visual": [
    "Comentários do seed"
   ],
   "redundant": [],
   "ux": [
    "+ Diálogos bem escritos",
    "- Sem preço, vigência ou progresso"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Composição de contextos correta"
   ],
   "opportunities": [
    "Progresso no programa",
    "Avaliar"
   ],
   "issues": [
    "N-07"
   ],
   "scores": {
    "tech": 7,
    "ux": 8,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Bem composto, perde histórico.",
    "ux": "Protegido e claro.",
    "complete": "Sem acompanhamento.",
    "maturity": "Persistido."
   }
  },
  {
   "id": "package-workout",
   "name": "Treino do pacote",
   "route": "/trainer/workout",
   "group": "Treinadores",
   "files": [
    "src/app/trainer/workout.tsx"
   ],
   "objective": "Ver um treino antes de aderir.",
   "context": "Avaliação.",
   "importance": "Baixa",
   "works": [
    "Descrição e exercícios com notas"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Sem demonstração dos exercícios"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Rota por índice do treino no pacote"
   ],
   "opportunities": [
    "Id estável"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Pequena.",
    "ux": "Objetiva.",
    "complete": "Sem demonstração.",
    "maturity": "Índice frágil se o pacote mudar."
   }
  },
  {
   "id": "chat",
   "name": "Chat com o treinador",
   "route": "/chat/[trainerId]",
   "group": "Treinadores",
   "files": [
    "src/app/chat/[trainerId].tsx",
    "src/context/chat.tsx",
    "src/data/supabase/chat.ts"
   ],
   "objective": "Tirar dúvidas.",
   "context": "Durante o programa.",
   "importance": "Média",
   "works": [
    "Mensagens gravadas no banco e recebidas em tempo real",
    "Aviso de que o treinador ainda não responde",
    "Composer que cresce"
   ],
   "partial": [
    "Ninguém do outro lado lê ou responde"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Expectativa ajustada pelo aviso",
    "- Sem status de envio por mensagem"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "aviso",
    "success": "sim"
   },
   "tech": [
    "RLS só permite enviar como aluno",
    "Histórico inteiro carregado (N-10)"
   ],
   "opportunities": [
    "Painel do treinador e push"
   ],
   "issues": [
    "N-10"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 4,
    "maturity": 5
   },
   "justify": {
    "tech": "Realtime e RLS corretos.",
    "ux": "Honesta com o usuário.",
    "complete": "Falta o destinatário.",
    "maturity": "Infra pronta, produto não."
   }
  },
  {
   "id": "tasks",
   "name": "Tarefas",
   "route": "/(tabs)/tasks",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/tasks.tsx",
    "src/components/tasks/task-section.tsx",
    "src/context/tasks.tsx"
   ],
   "objective": "Checklist diário.",
   "context": "Rotina.",
   "importance": "Média",
   "works": [
    "Repetição por dias ou semanas",
    "Subtarefas sincronizadas",
    "Remover com Desfazer",
    "Persistido"
   ],
   "partial": [
    "Sem tela de edição (N-03)"
   ],
   "visual": [],
   "redundant": [
    "Widget no Início"
   ],
   "ux": [
    "+ Desfazer",
    "- Sem lembrete",
    "- Genérica para um app de treino"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "aviso",
    "success": "sim"
   },
   "tech": [
    "Regras testadas em tasks.test.ts"
   ],
   "opportunities": [
    "Hábitos de saúde e lembretes"
   ],
   "issues": [
    "N-03",
    "N-15"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 6,
    "maturity": 7
   },
   "justify": {
    "tech": "Domínio testado.",
    "ux": "Funciona; sem lembrete.",
    "complete": "Sem edição.",
    "maturity": "Persistida."
   }
  },
  {
   "id": "add-task",
   "name": "Nova tarefa / subtarefa",
   "route": "/add-task",
   "group": "Modais",
   "files": [
    "src/app/add-task.tsx"
   ],
   "objective": "Criar tarefa com repetição.",
   "context": "A partir de Tarefas.",
   "importance": "Média",
   "works": [
    "Não repete, diária, semanal, personalizada",
    "Subtarefas na criação",
    "Modo subtarefa"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Radio acessível",
    "- Intervalo inválido só desabilita o botão"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Uma tela para dois casos"
   ],
   "opportunities": [
    "Dias específicos da semana",
    "Horário"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 7
   },
   "justify": {
    "tech": "Enxuta.",
    "ux": "Feedback silencioso.",
    "complete": "Sem dias específicos e horário.",
    "maturity": "Sem modo edição."
   }
  },
  {
   "id": "profile",
   "name": "Perfil",
   "route": "/(tabs)/profile",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/profile.tsx",
    "src/components/weight/weight-dialog.tsx"
   ],
   "objective": "Dados pessoais, peso, meta e sair.",
   "context": "Consulta ocasional.",
   "importance": "Média",
   "works": [
    "Idade calculada da data de nascimento",
    "Registrar peso com data da medição",
    "Meta de peso",
    "Sair com confirmação"
   ],
   "partial": [
    "Nada além de peso e meta é editável (N-04)"
   ],
   "visual": [],
   "redundant": [
    "Registrar peso também no Início"
   ],
   "ux": [
    "+ Diálogos de peso e saída claros",
    "- Sem configurações, privacidade ou excluir conta (N-05)"
   ],
   "states": {
    "loading": "geral",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Fallback para MOCK_PROFILE (N-17)",
    "signOut global (N-12)"
   ],
   "opportunities": [
    "Editar perfil e configurações"
   ],
   "issues": [
    "N-04",
    "N-05",
    "N-12",
    "N-17"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 5,
    "maturity": 6
   },
   "justify": {
    "tech": "Peso com data agora; fallback de mock.",
    "ux": "Sem área de conta.",
    "complete": "Faltam edição e conta.",
    "maturity": "Persistido."
   }
  }
 ],
 "features": [
  {
   "id": "F-01",
   "name": "Conta com e-mail e senha (Supabase)",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P2",
   "problem": "Identificar o usuário e proteger seus dados.",
   "fit": "Sim.",
   "implementation": "Login, cadastro com confirmação por link, erros traduzidos, PKCE.",
   "intuitive": "Sim.",
   "missingStep": "Consentimento e termos no cadastro.",
   "absence": "Sem conta não há sincronização.",
   "screens": [
    "login",
    "signup-account",
    "signup-confirm",
    "auth-callback"
   ],
   "issues": [
    "N-05"
   ],
   "images": [
    "login",
    "signup-account",
    "signup-confirm"
   ]
  },
  {
   "id": "F-02",
   "name": "Login com Google",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P2",
   "problem": "Entrar sem criar senha.",
   "fit": "Sim.",
   "implementation": "Android com idToken e Complete seu perfil; iOS não configurado.",
   "intuitive": "Sim.",
   "missingStep": "iOS e variáveis no EAS.",
   "absence": "Mais atrito no cadastro.",
   "screens": [
    "login",
    "complete-profile"
   ],
   "issues": [
    "N-14"
   ],
   "images": [
    "login"
   ]
  },
  {
   "id": "F-03",
   "name": "Recuperação de senha por link",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 9,
   "priority": "P3",
   "problem": "Voltar a acessar a conta.",
   "fit": "Sim.",
   "implementation": "Três etapas, link expirado tratado, encerra sessões após trocar.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma.",
   "absence": "Contas perdidas.",
   "screens": [
    "forgot-password",
    "forgot-check-email",
    "forgot-new-password"
   ],
   "issues": [],
   "images": [
    "forgot-password",
    "forgot-check-email",
    "forgot-new-password"
   ]
  },
  {
   "id": "F-04",
   "name": "Cadastro com dados corporais e Complete seu perfil",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Coletar dados para personalizar.",
   "fit": "Sim.",
   "implementation": "Dados gravados por trigger; não alimentam nenhum cálculo de meta.",
   "intuitive": "Sim.",
   "missingStep": "Objetivo e nível de atividade.",
   "absence": "Sem base para metas pessoais.",
   "screens": [
    "signup-details",
    "complete-profile"
   ],
   "issues": [
    "N-01"
   ],
   "images": [
    "signup-details"
   ]
  },
  {
   "id": "F-05",
   "name": "Sessão salva e preparação pós-login",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Abrir o app já logado com os dados prontos.",
   "fit": "Sim.",
   "implementation": "Sessão no expo-sqlite; carrega perfil e 9 domínios antes das abas, tudo ou nada.",
   "intuitive": "Sim.",
   "missingStep": "Erro por seção.",
   "absence": "Login a cada abertura.",
   "screens": [
    "bootstrap"
   ],
   "issues": [
    "N-09",
    "N-10"
   ],
   "images": [],
   "noImage": "Sem captura: o carregamento dura poucos quadros e o erro exige falha real do Supabase."
  },
  {
   "id": "F-06",
   "name": "Sincronização por conta (repositórios + fila)",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Guardar e recuperar dados em qualquer aparelho.",
   "fit": "Sim.",
   "implementation": "Atualização otimista, fila ordenada, aviso com Tentar novamente; fila só em memória e histórico inteiro.",
   "intuitive": "Sim, invisível ao usuário.",
   "missingStep": "Fila persistida e carga por período.",
   "absence": "Dados perdidos ao fechar o app.",
   "screens": [
    "diary",
    "exercise",
    "tasks"
   ],
   "issues": [
    "N-10",
    "N-11"
   ],
   "images": [
    "diary-undo"
   ]
  },
  {
   "id": "F-07",
   "name": "Modo demo",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Usar e testar o front sem backend.",
   "fit": "Sim para a estratégia de front primeiro e para demonstrações.",
   "implementation": "Mesma interface de repositórios, dados em memória, aviso ao sair.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma.",
   "absence": "Front dependeria do Supabase para qualquer teste.",
   "screens": [
    "profile"
   ],
   "issues": [],
   "images": [
    "dialog-signout"
   ]
  },
  {
   "id": "F-08",
   "name": "Dashboard do dia",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P1",
   "problem": "Ver como está o dia.",
   "fit": "Sim.",
   "implementation": "Consumo, exercício e peso reais; metas fixas e passos fictícios.",
   "intuitive": "Sim.",
   "missingStep": "Metas pessoais e passos reais.",
   "absence": "Teria de abrir cada aba.",
   "screens": [
    "home"
   ],
   "issues": [
    "N-01",
    "N-02"
   ],
   "images": [
    "home"
   ]
  },
  {
   "id": "F-09",
   "name": "Personalização do dashboard",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 7,
   "priority": "P3",
   "problem": "Escolher o que ver primeiro.",
   "fit": "Útil, não central.",
   "implementation": "Arrastar acessível, layout salvo por conta; arquivo de 718 linhas.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma.",
   "absence": "Baixo.",
   "screens": [
    "home"
   ],
   "issues": [
    "N-20"
   ],
   "images": [
    "home-edit"
   ]
  },
  {
   "id": "F-10",
   "name": "Diário alimentar",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 8,
   "priority": "P1",
   "problem": "Registrar o que foi comido.",
   "fit": "Sim.",
   "implementation": "Adicionar, remover com desfazer, sincronizado; sem edição.",
   "intuitive": "Sim.",
   "missingStep": "Editar e copiar refeição.",
   "absence": "Metade da proposta.",
   "screens": [
    "diary",
    "food-details"
   ],
   "issues": [
    "N-03"
   ],
   "images": [
    "diary",
    "food-details"
   ]
  },
  {
   "id": "F-11",
   "name": "Busca TACO + Open Food Facts",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P2",
   "problem": "Encontrar alimentos brasileiros e produtos.",
   "fit": "Sim.",
   "implementation": "Instantânea e offline na TACO, online com debounce.",
   "intuitive": "Sim.",
   "missingStep": "Código de barras e recentes.",
   "absence": "Registro manual inviável.",
   "screens": [
    "log-food"
   ],
   "issues": [],
   "images": [
    "log-food"
   ]
  },
  {
   "id": "F-12",
   "name": "Refeições configuráveis",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 7,
   "priority": "P3",
   "problem": "Adaptar o diário à rotina.",
   "fit": "Sim.",
   "implementation": "Correta; remover sem desfazer.",
   "intuitive": "Sim.",
   "missingStep": "Reordenar.",
   "absence": "Baixo.",
   "screens": [
    "meals"
   ],
   "issues": [
    "N-26"
   ],
   "images": [
    "meals"
   ]
  },
  {
   "id": "F-13",
   "name": "Exercício avulso (catálogo ou manual)",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 6,
   "priority": "P2",
   "problem": "Registrar atividade fora do plano.",
   "fit": "Sim.",
   "implementation": "Filtro por categoria, manual com categoria; inglês e 0 kcal sem MET.",
   "intuitive": "Parcial.",
   "missingStep": "Edição e busca em português.",
   "absence": "Saldo calórico incompleto.",
   "screens": [
    "exercise",
    "log-exercise",
    "exercise-details"
   ],
   "issues": [
    "N-08",
    "N-22"
   ],
   "images": [
    "log-exercise",
    "exercise-details"
   ]
  },
  {
   "id": "F-14",
   "name": "Plano semanal ou em fila",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Saber o treino de hoje.",
   "fit": "Sim; a fila é diferencial.",
   "implementation": "Persistido; ponteiro da fila frágil; exercícios não editáveis.",
   "intuitive": "Sim.",
   "missingStep": "Editar e reordenar exercícios.",
   "absence": "App vira só registro.",
   "screens": [
    "workouts",
    "workout"
   ],
   "issues": [
    "N-03",
    "N-06"
   ],
   "images": [
    "workouts",
    "workout"
   ]
  },
  {
   "id": "F-15",
   "name": "Sessão cronometrada",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Guiar o treino em execução.",
   "fit": "Sim.",
   "implementation": "Cronômetro, sensação, saída protegida; sem descanso, séries ou retomada.",
   "intuitive": "Sim.",
   "missingStep": "Descanso e séries.",
   "absence": "Registro só depois do treino.",
   "screens": [
    "session"
   ],
   "issues": [
    "N-24"
   ],
   "images": [
    "session",
    "dialog-leave-session"
   ]
  },
  {
   "id": "F-16",
   "name": "Catálogo de treinadores",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P2",
   "problem": "Descobrir programas.",
   "fit": "Sim, diferencial do produto.",
   "implementation": "Vem do banco, conteúdo de seed, sem filtros.",
   "intuitive": "Sim.",
   "missingStep": "Treinadores reais e filtros.",
   "absence": "Produto vira diário comum.",
   "screens": [
    "trainers",
    "trainer"
   ],
   "issues": [
    "N-25"
   ],
   "images": [
    "trainers",
    "trainer"
   ]
  },
  {
   "id": "F-17",
   "name": "Aderir a pacote",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P2",
   "problem": "Transformar o programa em plano.",
   "fit": "Sim.",
   "implementation": "Confirmações corretas; sair apaga histórico.",
   "intuitive": "Sim.",
   "missingStep": "Progresso no programa.",
   "absence": "Catálogo só leitura.",
   "screens": [
    "package",
    "package-workout"
   ],
   "issues": [
    "N-07"
   ],
   "images": [
    "package",
    "package-workout"
   ]
  },
  {
   "id": "F-18",
   "name": "Comentários de pacotes",
   "importance": "COMPLEMENTAR",
   "state": "Apenas visual",
   "quality": 5,
   "priority": "P3",
   "problem": "Prova social.",
   "fit": "Quando forem reais.",
   "implementation": "Leitura do seed; aluno não avalia.",
   "intuitive": "Sim.",
   "missingStep": "Avaliar.",
   "absence": "Baixo.",
   "screens": [
    "package"
   ],
   "issues": [],
   "images": [
    "package"
   ]
  },
  {
   "id": "F-19",
   "name": "Chat em tempo real",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P1",
   "problem": "Tirar dúvidas com o treinador.",
   "fit": "Sim, com o lado do treinador.",
   "implementation": "Realtime e RLS prontos; ninguém responde; aviso na tela.",
   "intuitive": "Sim.",
   "missingStep": "Painel do treinador e push.",
   "absence": "Hoje, nenhuma; o aviso evita frustração.",
   "screens": [
    "chat"
   ],
   "issues": [
    "N-10"
   ],
   "images": [
    "chat"
   ]
  },
  {
   "id": "F-20",
   "name": "Tarefas com repetição",
   "importance": "QUESTIONÁVEL",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Organizar rotina.",
   "fit": "Pouco: genérica e fora do domínio de saúde.",
   "implementation": "Regras testadas e persistidas; sem edição nem lembrete.",
   "intuitive": "Sim.",
   "missingStep": "Lembretes e ligação com metas.",
   "absence": "Baixo; ocupa uma aba.",
   "screens": [
    "tasks",
    "add-task"
   ],
   "issues": [
    "N-03",
    "N-15"
   ],
   "images": [
    "tasks",
    "add-task"
   ]
  },
  {
   "id": "F-21",
   "name": "Peso e meta",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Acompanhar o resultado principal.",
   "fit": "Sim.",
   "implementation": "Pesagem com data, meta, gráfico por período, fonte única.",
   "intuitive": "Sim.",
   "missingStep": "Editar pesagem.",
   "absence": "Sem medida de progresso.",
   "screens": [
    "profile",
    "home"
   ],
   "issues": [],
   "images": [
    "profile",
    "dialog-weight",
    "home"
   ]
  },
  {
   "id": "F-22",
   "name": "Perfil e conta",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 5,
   "priority": "P0",
   "problem": "Manter dados pessoais e a conta.",
   "fit": "Sim.",
   "implementation": "Somente leitura; sem configurações, exclusão ou exportação.",
   "intuitive": "Sim.",
   "missingStep": "Editar, configurar, excluir conta.",
   "absence": "Bloqueia publicação na loja.",
   "screens": [
    "profile"
   ],
   "issues": [
    "N-04",
    "N-05",
    "N-12"
   ],
   "images": [
    "profile",
    "dialog-signout"
   ]
  },
  {
   "id": "F-23",
   "name": "Desfazer e confirmações",
   "importance": "IMPORTANTE",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Evitar perdas por toque acidental.",
   "fit": "Sim.",
   "implementation": "Snackbar em alimentos, exercícios e tarefas; diálogos em ações de alto impacto; falta em refeições.",
   "intuitive": "Sim.",
   "missingStep": "Refeições.",
   "absence": "Perdas acidentais.",
   "screens": [
    "diary",
    "exercise",
    "tasks",
    "profile"
   ],
   "issues": [
    "N-26"
   ],
   "images": [
    "diary-undo",
    "dialog-leave-session",
    "dialog-signout"
   ]
  },
  {
   "id": "F-24",
   "name": "Design system Material 3",
   "importance": "IMPORTANTE",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Consistência e tema escuro.",
   "fit": "Sim.",
   "implementation": "Tokens gerados do ícone.",
   "intuitive": "n/a",
   "missingStep": "Documentação.",
   "absence": "Inconsistência.",
   "screens": [
    "home"
   ],
   "issues": [],
   "images": [
    "home",
    "home-dark"
   ]
  },
  {
   "id": "F-25",
   "name": "Abas com swipe (6)",
   "importance": "COMPLEMENTAR",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P2",
   "problem": "Navegar entre áreas.",
   "fit": "Sim, destinos demais.",
   "implementation": "Pager próprio.",
   "intuitive": "Sim.",
   "missingStep": "Reduzir para 5.",
   "absence": "n/a",
   "screens": [
    "home",
    "exercise"
   ],
   "issues": [
    "N-15"
   ],
   "images": [
    "home",
    "exercise"
   ]
  },
  {
   "id": "F-26",
   "name": "Entrega EAS com checagens",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P0",
   "problem": "Publicar com segurança.",
   "fit": "Sim.",
   "implementation": "check-env, lint, typecheck e testes antes do OTA; sem checagem nativa; só Android.",
   "intuitive": "n/a",
   "missingStep": "expo install --check, expo-doctor, monitoramento.",
   "absence": "Crashes chegando ao aparelho.",
   "screens": [],
   "issues": [
    "N-13",
    "N-14"
   ],
   "images": [],
   "noImage": "Sem interface: configuração de build e atualização (.eas/workflows/preview.yml)."
  }
 ],
 "roadmap": [
  {
   "phase": 1,
   "name": "Correções críticas",
   "goal": "Impedir que um erro feche o app no aparelho sem ninguém saber.",
   "tasks": [
    {
     "id": "R-01",
     "title": "Verificação nativa no CI",
     "problem": "O crash do ExpoSQLite passou por todos os checks (N-13).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Job de checks roda npx expo install --check e npx expo-doctor e falha com versão incompatível."
    },
    {
     "id": "R-02",
     "title": "Monitoramento de erros",
     "problem": "O último crash só foi diagnosticado por relatório de bugs manual.",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Crashes e erros de API chegam a um painel com a versão do update."
    },
    {
     "id": "R-03",
     "title": "Carregamento por seção",
     "problem": "Um domínio com erro bloqueia o app (N-09).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "Abas abrem com sessão e perfil; cada seção mostra seu próprio carregando e erro."
    },
    {
     "id": "R-04",
     "title": "Sair só deste aparelho",
     "problem": "Sair encerra todas as sessões (N-12).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "signOut({ scope: 'local' }) no Sair; troca de senha continua global."
    },
    {
     "id": "R-05",
     "title": "Fila de treinos e histórico do pacote",
     "problem": "Ponteiro desalinha ao desfazer e histórico some ao sair do pacote (N-06, N-07).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Testes cobrem desfazer fora de ordem; conclusões mantêm nome e resumo após sair do pacote."
    },
    {
     "id": "R-06",
     "title": "Calorias de exercício manual",
     "problem": "Manual entra com 0 kcal (N-08).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "MET padrão por categoria ou intensidade escolhida."
    }
   ]
  },
  {
   "phase": 2,
   "name": "Consolidação das funcionalidades essenciais",
   "goal": "Cumprir as promessas do cadastro e fechar o ciclo dos registros.",
   "tasks": [
    {
     "id": "R-07",
     "title": "Metas calculadas",
     "problem": "2.200 kcal para todos (N-01).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "Objetivo e atividade no cadastro; metas de kcal e macros calculadas, ajustáveis e salvas por conta."
    },
    {
     "id": "R-08",
     "title": "Edição de registros",
     "problem": "Corrigir exige excluir e recriar (N-03).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "Alimento, exercício, tarefa e exercício do treino editáveis ao toque, com update nos repositórios."
    },
    {
     "id": "R-09",
     "title": "Perfil, configurações e excluir conta",
     "problem": "Perfil fixo, sem área de conta e sem exclusão (N-04, N-05).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-07",
     "done": "Editar dados corporais e objetivo; configurações; excluir conta remove todos os dados."
    },
    {
     "id": "R-10",
     "title": "Histórico de treinos",
     "problem": "Cargas e sensação gravadas e invisíveis.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "Tela por exercício com evolução e lista de sessões."
    },
    {
     "id": "R-11",
     "title": "Carga por período",
     "problem": "Histórico inteiro na abertura (N-10).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-03",
     "done": "Diário, exercícios e chat carregam só o período visível e buscam mais sob demanda."
    },
    {
     "id": "R-12",
     "title": "Fila de salvamento persistida",
     "problem": "Mudanças offline somem ao fechar (N-11).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "—",
     "done": "Fila guardada no expo-sqlite e reenviada ao abrir ou reconectar."
    },
    {
     "id": "R-13",
     "title": "Testes de dados e RLS no CI",
     "problem": "Fila, troca de conta e repositórios sem teste (N-23).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "—",
     "done": "Testes de useUserStore e repositórios; rls.sql roda no CI."
    }
   ]
  },
  {
   "phase": 3,
   "name": "Melhorias de UX/UI",
   "goal": "Reduzir atrito e alinhar a navegação à proposta.",
   "tasks": [
    {
     "id": "R-14",
     "title": "5 abas e Tarefas como hábitos",
     "problem": "6 destinos e feature genérica (N-15).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-08",
     "done": "Barra com 5 abas; hábitos de saúde a partir do Início."
    },
    {
     "id": "R-15",
     "title": "Sessão de treino completa",
     "problem": "Sem descanso, séries, tela ligada ou retomada (N-24).",
     "priority": "P2",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-12",
     "done": "Timer de descanso, carga por série, keep-awake e retomar sessão."
    },
    {
     "id": "R-16",
     "title": "Exercícios em português",
     "problem": "Busca em inglês e serviço frágil (N-22).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "—",
     "done": "Catálogo em cache no Supabase com nomes traduzidos."
    },
    {
     "id": "R-17",
     "title": "Atalhos do diário",
     "problem": "Registro repetitivo.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-11",
     "done": "Recentes, favoritos, copiar refeição e medidas caseiras."
    },
    {
     "id": "R-18",
     "title": "Passos reais ou widget oculto",
     "problem": "6.840 passos fictícios (N-02).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Widget oculto ou 'Conectar passos' até haver fonte real."
    },
    {
     "id": "R-19",
     "title": "Limpeza",
     "problem": "Duplicações, mocks de reserva, env sem uso, detalhes de UI (N-16 a N-21, N-25, N-26).",
     "priority": "P3",
     "impact": "Baixo",
     "complexity": "Baixa",
     "deps": "—",
     "done": "parseDecimal único, sem MOCK_PROFILE nas telas, env removida, ícone e textos corrigidos, desfazer em refeições."
    }
   ]
  },
  {
   "phase": 4,
   "name": "Recursos adicionais e diferenciais",
   "goal": "Retenção e reforço do diferencial do treinador.",
   "tasks": [
    {
     "id": "R-20",
     "title": "Painel do treinador",
     "problem": "Chat sem destinatário, catálogo de seed.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Alta",
     "deps": "R-02",
     "done": "Treinador publica pacotes e responde mensagens; aluno recebe push."
    },
    {
     "id": "R-21",
     "title": "Lembretes locais",
     "problem": "Treino e hábitos dependem de abrir o app.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-14",
     "done": "Lembretes configuráveis nas configurações."
    },
    {
     "id": "R-22",
     "title": "Código de barras",
     "problem": "Produtos exigem busca por nome.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-17",
     "done": "Câmera lê EAN e abre o produto."
    },
    {
     "id": "R-23",
     "title": "Health Connect / HealthKit",
     "problem": "Sem passos reais.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Alta",
     "deps": "R-18",
     "done": "Passos no dashboard com permissão explicada."
    },
    {
     "id": "R-24",
     "title": "Relatório semanal e avaliação de pacotes",
     "problem": "Sem visão de tendência; comentários de seed.",
     "priority": "P3",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-10",
     "done": "Resumo semanal e avaliação ao concluir o programa."
    }
   ]
  },
  {
   "phase": 5,
   "name": "Preparação para escala e produção",
   "goal": "Cumprir requisitos de loja e privacidade e abrir outras plataformas.",
   "tasks": [
    {
     "id": "R-25",
     "title": "LGPD e consentimento",
     "problem": "Dados de saúde sem consentimento nem exportação (N-05).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-09",
     "done": "Consentimento no cadastro, política acessível, exportar dados."
    },
    {
     "id": "R-26",
     "title": "iOS",
     "problem": "Sem build e Google no iOS (N-14).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-01",
     "done": "bundleIdentifier, URL scheme, Entrar com Apple e job iOS."
    },
    {
     "id": "R-27",
     "title": "Controle de conflitos",
     "problem": "Gravações substituem o registro inteiro (H-02).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-12",
     "done": "updated_at com checagem ou merge por campo."
    },
    {
     "id": "R-28",
     "title": "Métricas de abertura e uso",
     "problem": "Performance não medida.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-02",
     "done": "Tempo de abertura e funis de cadastro e registro acompanhados."
    }
   ]
  }
 ],
 "counts": {
  "screens": 29,
  "dialogs": 9,
  "features": 26,
  "issues": 26,
  "hypotheses": 3,
  "tasks": 28,
  "missing": 17
 }
};
