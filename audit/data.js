/* Dados da auditoria. Gerado a partir das fontes; não editar à mão. */
window.AUDIT = {
 "meta": {
  "project": "Treina",
  "date": "2026-11-02",
  "commit": "5fd90b1",
  "branchAnalyzed": "main",
  "linesOfCode": 14402,
  "sourceFiles": 123,
  "routeFiles": 29,
  "commits": 18,
  "phase": "Front-end primeiro: a aplicação está sendo construída com dados simulados e estado em memória antes da integração com o backend. A auditoria avalia o front para essa fase e, separadamente, a distância até a produção.",
  "notVerified": [
   "O app não foi executado em dispositivo, emulador ou navegador durante a auditoria; tudo foi avaliado por leitura de código, lint e typecheck.",
   "O fluxo real do Google Sign-In não foi testado (depende de IDs de cliente em .env.local, que não estão no repositório).",
   "Desempenho em tempo de execução (FPS do arrastar do dashboard, troca de abas por gesto, tempo de abertura) não foi medido.",
   "Não há documento de produto, público-alvo ou métricas no repositório; posicionamento e público foram inferidos do código (idioma pt-BR, tabela TACO, treinadores com Instagram)."
  ],
  "checks": [
   {
    "name": "TypeScript (tsc --noEmit)",
    "result": "Passa",
    "detail": "Falha com 2 erros apenas quando expo-env.d.ts não existe; o arquivo é gerado por expo start e está no .gitignore. Com ele gerado, 0 erros."
   },
   {
    "name": "ESLint (expo lint)",
    "result": "1 erro",
    "detail": "src/hooks/use-color-scheme.web.ts:11, setState síncrono dentro de useEffect (regra react-hooks/set-state-in-effect)."
   },
   {
    "name": "Testes automatizados",
    "result": "Inexistentes",
    "detail": "Nenhum arquivo de teste, nenhum test runner e nenhum script de teste em package.json."
   },
   {
    "name": "CI de qualidade",
    "result": "Inexistente",
    "detail": ".eas/workflows/preview.yml só gera build ou atualização OTA Android; não roda lint, typecheck ou testes."
   }
  ]
 },
 "stack": [
  {
   "group": "Plataforma",
   "items": [
    "Expo SDK 58 (expo ~58.0.21)",
    "React Native 0.88.1",
    "React 19.3",
    "TypeScript 6.0 (strict)",
    "React Compiler habilitado (app.json → experiments.reactCompiler)",
    "Typed routes (experiments.typedRoutes)"
   ]
  },
  {
   "group": "Navegação",
   "items": [
    "Expo Router 58 (rotas em src/app)",
    "Stack.Protected para separar área logada",
    "Abas próprias com swipe (src/components/sliding-tabs) sobre react-native-gesture-handler"
   ]
  },
  {
   "group": "UI",
   "items": [
    "Design system Material 3 próprio gerado do ícone (scripts/generate-theme.mjs + @material/material-color-utilities)",
    "lucide-react-native (ícones importados por caminho)",
    "react-native-svg (gráficos do dashboard)",
    "react-native-reanimated 4 + worklets (arrastar do dashboard, teclado do chat)",
    "expo-image (GIFs de exercícios)"
   ]
  },
  {
   "group": "Estado e dados",
   "items": [
    "9 React Contexts com useState (sem biblioteca de estado)",
    "Sem persistência: nenhum AsyncStorage, SQLite, MMKV ou SecureStore",
    "Caches em memória por módulo (Map) nos clientes de API"
   ]
  },
  {
   "group": "Integrações",
   "items": [
    "ExerciseDB v1 (oss.exercisedb.dev) para catálogo de exercícios",
    "Open Food Facts search-a-licious para produtos brasileiros",
    "TACO 4ª ed. embarcada (597 alimentos, src/lib/taco-data.ts)",
    "Google Sign-In (@react-native-google-signin/google-signin)",
    "Fotos de treinadores em randomuser.me",
    "Links para Instagram (Linking.openURL)"
   ]
  },
  {
   "group": "Entrega",
   "items": [
    "EAS Build (perfis development, preview APK, production)",
    "EAS Update com runtimeVersion por fingerprint",
    "Workflow EAS: OTA ou build Android a cada push na main"
   ]
  }
 ],
 "scores": [
  {
   "key": "tech",
   "label": "Qualidade técnica",
   "score": 6.5,
   "why": "TypeScript estrito sem any, regras de domínio puras e bem comentadas em src/lib (tasks.ts, workouts.ts, dashboard-widgets.ts), tratamento de 429 e cache nos clientes de API. Perde pontos por zero testes, um erro de lint e helpers duplicados.",
   "problems": [
    "Nenhum teste automatizado (I-16)",
    "parseNumber, EMAIL_PATTERN, createId e initials duplicados (I-18)",
    "Erro de lint em use-color-scheme.web.ts (I-17)"
   ],
   "improve": [
    "Adicionar jest-expo e cobrir src/lib primeiro",
    "Extrair helpers de parsing e validação para src/lib",
    "Rodar lint e tsc em CI"
   ]
  },
  {
   "key": "arch",
   "label": "Arquitetura",
   "score": 6,
   "why": "Camadas claras (rotas → componentes → contextos → lib), domínio separado da UI. Mas cada contexto guarda os dados em useState sem uma camada de acesso a dados, os providers ficam acima do controle de sessão e dependem da ordem de aninhamento.",
   "problems": [
    "Sem camada de repositório para trocar mock por API (I-20)",
    "Dados não isolados por conta (I-02)",
    "Dependência implícita pela ordem dos providers (I-21)"
   ],
   "improve": [
    "Definir interfaces de repositório por domínio com implementação local",
    "Escopar os dados pela conta e limpar no logout",
    "Agrupar providers ou usar um store com seletores"
   ]
  },
  {
   "key": "ux",
   "label": "UX/UI",
   "score": 7,
   "why": "Material 3 aplicado de forma consistente, tema claro e escuro, estados de vazio, carregando e erro na maioria das listas e acessibilidade acima da média (labels, roles, ações de acessibilidade no arrastar). Perde por login em inglês, exclusões sem confirmação, 6 abas e números fictícios exibidos como reais.",
   "problems": [
    "Login com textos em inglês e erros de grafia (I-08)",
    "Exclusões sem confirmação ou desfazer (I-11)",
    "6 destinos na barra inferior (I-24)",
    "Passos e histórico de peso fictícios sem aviso (I-03, I-05)"
   ],
   "improve": [
    "Revisão de textos pt-BR",
    "Snackbar com Desfazer em toda exclusão",
    "Reduzir para 5 abas",
    "Estados vazios no lugar de dados simulados"
   ]
  },
  {
   "key": "features",
   "label": "Funcionalidades",
   "score": 6.5,
   "why": "Cobre os três pilares de um app de saúde (alimentação, treino, peso) e um diferencial (pacotes de treinadores). Várias features param no primeiro passo: não há edição de registros nem histórico, e as metas não são calculadas.",
   "problems": [
    "Sem edição de registros (I-12)",
    "Metas fixas apesar do cadastro (I-04)",
    "Chat sem resposta (I-14)"
   ],
   "improve": [
    "Edição em todos os registros",
    "Metas calculadas do perfil",
    "Histórico de treinos e de peso real"
   ]
  },
  {
   "key": "complete",
   "label": "Completude",
   "score": 4.5,
   "why": "Os fluxos de criação funcionam de ponta a ponta no front, mas edição, configurações, recuperação de senha, histórico e persistência faltam. O usuário perde tudo ao fechar o app.",
   "problems": [
    "Nenhuma persistência local (I-01)",
    "Perfil não editável (I-13)",
    "Sem tela de configurações ou recuperação de senha"
   ],
   "improve": [
    "Persistência local já na fase de front",
    "Fechar o ciclo criar → editar → excluir em todos os domínios"
   ]
  },
  {
   "key": "security",
   "label": "Segurança",
   "score": 2.5,
   "why": "Para produção não há autenticação real: o login por e-mail aceita qualquer valor, o idToken do Google não é verificado, a senha do cadastro não vai a lugar nenhum e não há armazenamento seguro de sessão. Na fase atual isso é esperado; a nota mede a distância até a produção.",
   "problems": [
    "IS_AUTH_MOCKED = true (I-10)",
    "Sem armazenamento seguro de token",
    "Dados de saúde sem consentimento ou política de privacidade"
   ],
   "improve": [
    "Backend de autenticação com verificação do idToken",
    "Sessão em expo-secure-store",
    "Consentimento e exclusão de conta (LGPD)"
   ]
  },
  {
   "key": "perf",
   "label": "Performance",
   "score": 7,
   "why": "Boas decisões visíveis no código: índice TACO criado sob demanda, buscas com debounce e cache, GIFs sem autoplay na lista, ícones importados um a um, React Compiler ativo. Nada foi medido em execução, e os filtros de arrays inteiros a cada render vão pesar quando houver histórico persistido.",
   "problems": [
    "Filtros O(n) por render em useFoodDay, useExerciseDay e ExerciseTile (H-01)",
    "Sem medição em dispositivo"
   ],
   "improve": [
    "Indexar registros por data ao introduzir persistência",
    "Medir com o React Native DevTools / Perf Monitor"
   ]
  },
  {
   "key": "scale",
   "label": "Escalabilidade",
   "score": 3.5,
   "why": "Estado em memória, catálogo de treinadores no código e chat local não escalam além de um usuário em uma sessão. A modelagem de tipos de domínio é boa base, mas falta contrato de API, paginação e sincronização.",
   "problems": [
    "Catálogo e comentários fixos em trainers.ts (I-22)",
    "Sem contrato de dados com o backend (I-20)"
   ],
   "improve": [
    "Contratos de API tipados por domínio",
    "Estratégia offline-first com sincronização"
   ]
  },
  {
   "key": "maint",
   "label": "Manutenibilidade",
   "score": 6.5,
   "why": "Nomes claros, comentários que explicam o porquê e arquivos curtos na maioria. Há código morto do template, um componente de 714 linhas e duplicações, e sem testes cada mudança é verificada à mão.",
   "problems": [
    "Código e dependências não usados (I-19)",
    "draggable-dashboard.tsx com 714 linhas (I-29)",
    "Sem testes (I-16)"
   ],
   "improve": [
    "Remover sobras do template",
    "Dividir o dashboard em gesto, geometria e renderização",
    "Testes nos módulos de domínio"
   ]
  },
  {
   "key": "prod",
   "label": "Prontidão para produção",
   "score": 2,
   "why": "Sem backend, persistência, autenticação real, testes, monitoramento de erros, configuração iOS ou política de privacidade. Coerente com a fase atual, mas longe de um lançamento.",
   "problems": [
    "Itens P0 de lançamento abertos (backend, auth, LGPD, persistência)",
    "iOS sem bundleIdentifier (I-23)"
   ],
   "improve": [
    "Seguir as fases 1, 2 e 5 do roadmap"
   ]
  }
 ],
 "overall": {
  "score": 5.2,
  "frontPhaseScore": 6.6,
  "maturity": "MVP inicial",
  "maturityScale": [
   "Protótipo",
   "MVP inicial",
   "MVP funcional",
   "Produto em evolução",
   "Produto pronto para produção",
   "Produto maduro"
  ],
  "maturityWhy": "Os fluxos principais (cadastrar, registrar alimento, montar e executar treino, seguir pacote, tarefas) funcionam do início ao fim dentro de uma sessão, com interface consistente. Ainda não é um MVP funcional porque nada sobrevive ao fechamento do app, os dados de contas diferentes se misturam e parte do que a tela mostra (passos, histórico de peso, metas) é fictício. Para a fase de front-first, o nível é bom; a nota 6,6 avalia só o front para essa fase.",
  "frontPhaseWhy": "Média de qualidade técnica, arquitetura de front, UX/UI, funcionalidades, completude do front, performance e manutenibilidade, sem contar segurança, escalabilidade e produção, que dependem do backend."
 },
 "architecture": {
  "layers": [
   {
    "name": "Rotas (src/app)",
    "role": "Telas e navegadores do Expo Router. Leem contextos e chamam ações.",
    "files": 29
   },
   {
    "name": "Componentes (src/components)",
    "role": "UI reutilizável: ui/ (17 primitivos M3), dashboard/, diary/, exercise/, trainers/, tasks/, sliding-tabs/.",
    "files": 59
   },
   {
    "name": "Contextos (src/context)",
    "role": "Estado global em useState e as ações de cada domínio. Também são a fonte de dados (sem armazenamento).",
    "files": 11
   },
   {
    "name": "Domínio e serviços (src/lib)",
    "role": "Tipos e regras puras (tasks, workouts, foods, dashboard-widgets), clientes de API (exercisedb, openfoodfacts), dados embarcados (taco-data, trainers).",
    "files": 15
   },
   {
    "name": "Tema (src/theme)",
    "role": "Tokens Material 3 gerados, tipografia, tema de navegação.",
    "files": 3
   }
  ],
  "providers": [
   "SessionProvider",
   "WeightLogProvider",
   "FoodLogProvider",
   "ExerciseLogProvider",
   "WorkoutPlanProvider",
   "CoachingProvider",
   "ChatProvider",
   "TasksProvider",
   "DashboardLayoutProvider"
  ],
  "providerDeps": [
   {
    "from": "WeightLogProvider",
    "to": "SessionProvider",
    "why": "logWeight chama session.setWeight"
   },
   {
    "from": "CoachingProvider",
    "to": "WorkoutPlanProvider",
    "why": "joinPackage importa treinos e define dias da semana"
   }
  ],
  "domains": [
   {
    "name": "Conta e perfil",
    "context": "session.tsx, signup.tsx",
    "lib": "profile.ts, google-auth.ts",
    "screens": [
     "login",
     "signup",
     "signup/details",
     "(tabs)/profile"
    ]
   },
   {
    "name": "Alimentação",
    "context": "food-log.tsx",
    "lib": "foods.ts, taco.ts, taco-data.ts, openfoodfacts.ts",
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
    "lib": "exercises.ts, exercisedb.ts",
    "screens": [
     "(tabs)/exercise",
     "log-exercise",
     "log-exercise/[id]"
    ]
   },
   {
    "name": "Plano de treino",
    "context": "workout-plan.tsx",
    "lib": "workouts.ts",
    "screens": [
     "workouts",
     "workouts/[id]",
     "workout-session"
    ]
   },
   {
    "name": "Treinadores",
    "context": "coaching.tsx, chat.tsx",
    "lib": "trainers.ts",
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
    "lib": "tasks.ts",
    "screens": [
     "(tabs)/tasks",
     "add-task"
    ]
   },
   {
    "name": "Peso",
    "context": "weight-log.tsx",
    "lib": "profile.ts",
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
    "name": "ExerciseDB",
    "used": "src/lib/exercisedb.ts",
    "note": "API gratuita, sem chave, limita rajadas (429). Nomes só em inglês. Dependência crítica de um serviço de terceiros sem SLA."
   },
   {
    "name": "Open Food Facts",
    "used": "src/lib/openfoodfacts.ts",
    "note": "Dados colaborativos; o cliente descarta valores impossíveis por 100 g. Envia User-Agent como a API pede."
   },
   {
    "name": "TACO embarcada",
    "used": "src/lib/taco.ts",
    "note": "597 alimentos offline, ~37 KB. Escolha certa para o público brasileiro."
   },
   {
    "name": "Google Sign-In",
    "used": "src/lib/google-auth.ts",
    "note": "Funciona só em build nativo; web mostra indisponível. iOS ainda com iosUrlScheme de exemplo."
   },
   {
    "name": "randomuser.me",
    "used": "src/lib/trainers.ts",
    "note": "Fotos de pessoas fictícias para os treinadores de exemplo."
   }
  ],
  "pros": [
   "Regras de domínio puras e sem React em src/lib, prontas para testes unitários (ex.: isTaskDue, getWorkoutForDate, moveWidget, insertMeal).",
   "Tipos discriminados bem usados (TaskRepeat, PlannedExercise com DistributiveOmit, RemoteSearch).",
   "Clientes de API com cache de promessas, descarte de respostas obsoletas e mensagens de erro em pt-BR.",
   "Design system gerado a partir do ícone, com relatório de contraste (scripts/generate-theme.mjs --report).",
   "Guard de sessão com Stack.Protected e tela de carregamento/erro antes das abas (use-main-flow-bootstrap).",
   "Comentários explicam decisões (por que a busca do ExerciseDB é só ao enviar, por que ícones são importados por caminho)."
  ],
  "cons": [
   "Contextos são ao mesmo tempo estado de tela, regra de negócio e banco de dados; trocar para API exige reescrever os 9.",
   "Providers ficam acima do Stack.Protected e sobrevivem ao logout com os dados da conta anterior.",
   "Duas fontes de verdade para o peso (profile.weightKg e weight-log).",
   "Dados de exemplo misturados ao estado real (histórico de peso começa com MOCK_DASHBOARD.weight).",
   "Nenhum teste e nenhum CI de qualidade.",
   "Sobras do template Expo (componentes e dependências sem uso, README e reset-project.js)."
  ]
 },
 "issues": [
  {
   "id": "I-01",
   "title": "Nenhuma persistência local",
   "severity": "crítico",
   "kind": "comprovado",
   "area": "Dados",
   "evidence": "src/context/*.tsx (todos com comentário TEMPORARY: in-memory); nenhuma dependência de armazenamento em package.json",
   "detail": "Diário, treinos, plano, tarefas, peso, chat, layout do dashboard e a própria sessão vivem em useState. Fechar o app apaga tudo. Mesmo na fase de front isso impede testes reais com o APK de preview, porque cada reabertura volta ao zero.",
   "fix": "Persistir os contextos localmente (expo-sqlite ou seu kv-store, conforme a documentação do SDK 58) atrás de uma interface de repositório que depois aponte para a API."
  },
  {
   "id": "I-02",
   "title": "Dados não isolados por conta",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Dados",
   "evidence": "src/app/_layout.tsx:22-45 (providers acima do Stack.Protected); src/context/session.tsx signOut só limpa session e profile",
   "detail": "Sair e entrar com outra conta mantém diário, treinos, tarefas, peso, pacote e conversas da conta anterior.",
   "fix": "Chavear os dados pelo id da conta ou remontar os providers ao trocar de sessão (ex.: key={session})."
  },
  {
   "id": "I-03",
   "title": "Histórico de peso fictício para todo usuário",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Peso",
   "evidence": "src/context/weight-log.tsx: useState(MOCK_DASHBOARD.weight)",
   "detail": "Uma conta nova com 60 kg vê no gráfico pesagens de 84,6 a 82,1 kg de julho a outubro, que nunca aconteceram, e a variação calculada a partir delas.",
   "fix": "Começar o histórico vazio ou só com o peso do cadastro; manter os dados de exemplo apenas em um modo demo explícito."
  },
  {
   "id": "I-04",
   "title": "Metas fixas apesar de o cadastro prometer cálculo",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Metas",
   "evidence": "src/lib/dashboard-data.ts (goal 2200 kcal, macros, 400 kcal de exercício, 10.000 passos); src/app/signup/details.tsx descrição 'Usamos esses dados para estimar suas calorias'",
   "detail": "Idade, sexo, altura e peso coletados no cadastro não são usados em nenhuma conta. Todo usuário recebe 2.200 kcal.",
   "fix": "Calcular TMB (Mifflin-St Jeor) × fator de atividade ± objetivo e permitir ajuste manual."
  },
  {
   "id": "I-05",
   "title": "Passos fictícios exibidos como reais",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Dashboard",
   "evidence": "src/app/(tabs)/index.tsx:37 TODO; components/dashboard/activity-tiles.tsx StepsTile recebe MOCK_DASHBOARD.steps",
   "detail": "O card mostra 6.840 passos para qualquer pessoa, sem indicação de exemplo.",
   "fix": "Esconder o widget até haver fonte real ou mostrá-lo como 'Conectar passos'."
  },
  {
   "id": "I-06",
   "title": "Aderir a um pacote apaga o plano semanal sem aviso",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/context/coaching.tsx joinPackage (setWeekday em todos os WEEKDAYS); src/app/trainer/package/[id].tsx join() só confirma se já houver pacote",
   "detail": "Quem montou o próprio Treino A na segunda e adere ao primeiro pacote perde a atribuição de todos os dias da semana sem diálogo de confirmação.",
   "fix": "Mostrar o diálogo de substituição também quando houver dias definidos pelo usuário, ou só preencher dias livres."
  },
  {
   "id": "I-07",
   "title": "Desfazer conclusão antiga desalinha a fila",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinos",
   "evidence": "src/context/workout-plan.tsx undoCompletion; components/exercise/workout-card.tsx canLog = date <= today",
   "detail": "No modo fila, desfazer a conclusão de um dia anterior volta o ponteiro uma posição, mesmo que treinos posteriores já tenham sido feitos. O ponteiro é um índice único, não derivado do histórico.",
   "fix": "Derivar o próximo treino da última conclusão registrada ou só permitir desfazer a mais recente."
  },
  {
   "id": "I-08",
   "title": "Login com textos em inglês e erros de grafia",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/login.tsx: 'Sign in', 'Show/Hide', 'Your password', 'you@example.com', 'Enter a valid email address.', 'Faca login', 'Bem vindo'",
   "detail": "Primeira tela do app em idioma misto; o resto do app está em pt-BR.",
   "fix": "Revisar e traduzir todos os textos ('Entrar', 'Mostrar', 'Faça login', 'Bem-vindo')."
  },
  {
   "id": "I-09",
   "title": "Login não normaliza o e-mail como o cadastro",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Conta",
   "evidence": "src/app/signup/index.tsx (toLowerCase); src/app/login.tsx (só trim); src/context/session.tsx accounts[email]",
   "detail": "Quem se cadastrou como maria@x.com e entra como Maria@x.com recebe o perfil genérico 'Usuário Treina'.",
   "fix": "Normalizar o e-mail em um único helper usado por login e cadastro."
  },
  {
   "id": "I-10",
   "title": "Autenticação simulada",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Segurança",
   "evidence": "src/context/session.tsx IS_AUTH_MOCKED = true; TODOs nas linhas 57, 66 e 78",
   "detail": "Esperado na fase de front: qualquer e-mail entra, a senha do cadastro é descartada e o idToken do Google não é verificado. Vira crítico no lançamento.",
   "fix": "Fase 5 do roadmap; até lá, manter a flag e esconder o que depende de servidor."
  },
  {
   "id": "I-11",
   "title": "Exclusões sem confirmação nem desfazer",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/workouts/[id].tsx deleteWorkout; components/tasks/task-section.tsx onRemove; components/diary/meal-section.tsx removeEntry; src/app/trainer/package/[id].tsx Sair do pacote",
   "detail": "Um toque na lixeira apaga treino, tarefa com subtarefas ou alimento. Sair do pacote remove todos os treinos dele.",
   "fix": "Snackbar com 'Desfazer' para itens simples e diálogo para ações de alto impacto (excluir treino, sair do pacote)."
  },
  {
   "id": "I-12",
   "title": "Registros não podem ser editados",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Funcionalidade",
   "evidence": "src/context/food-log.tsx, exercise-log.tsx, tasks.tsx expõem só add/remove; workout-plan.tsx sem updateExercise",
   "detail": "Corrigir a quantidade de um alimento, o peso de uma série, o nome de uma tarefa ou o exercício de um treino exige apagar e recriar.",
   "fix": "Adicionar update em cada contexto e reaproveitar as telas de criação no modo edição."
  },
  {
   "id": "I-13",
   "title": "Perfil não editável",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Conta",
   "evidence": "src/context/session.tsx (só setWeight); src/app/(tabs)/profile.tsx",
   "detail": "Nome, idade, sexo e altura ficam como no cadastro. A idade é um número fixo e não envelhece (Profile.age).",
   "fix": "Tela de edição de perfil; guardar data de nascimento em vez da idade."
  },
  {
   "id": "I-14",
   "title": "Chat sem resposta e sem aviso",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/context/chat.tsx ('trainers never answer'); src/app/chat/[trainerId].tsx texto vazio 'tire suas dúvidas'",
   "detail": "O usuário envia mensagens a um treinador que nunca responde; a tela não informa que é uma prévia.",
   "fix": "Marcar como prévia ou simular respostas no modo demo até existir backend em tempo real."
  },
  {
   "id": "I-15",
   "title": "Duas fontes de verdade para o peso",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Peso",
   "evidence": "src/context/weight-log.tsx logWeight → session.setWeight; src/lib/profile.ts MOCK_PROFILE.weightKg",
   "detail": "O peso atual existe no perfil e no histórico. Hoje são sincronizados à mão; ao persistir ou editar uma pesagem antiga, divergem.",
   "fix": "Peso atual = última pesagem; perfil não guarda peso."
  },
  {
   "id": "I-16",
   "title": "Nenhum teste automatizado",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "package.json sem jest nem script de teste; nenhum *.test.* no repositório",
   "detail": "Regras com casos de borda (repetição de tarefas, fila de treinos, mover widgets, sincronização de subtarefas) não têm rede de segurança.",
   "fix": "jest-expo + testes de src/lib primeiro, depois de contextos com @testing-library/react-native."
  },
  {
   "id": "I-17",
   "title": "Erro de lint",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "src/hooks/use-color-scheme.web.ts:11",
   "detail": "setState síncrono em useEffect (código herdado do template).",
   "fix": "Usar useSyncExternalStore ou o padrão recomendado pela regra."
  },
  {
   "id": "I-18",
   "title": "Helpers duplicados",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "parseNumber em log-food/[id].tsx e log-exercise/[id].tsx + parseDecimal em lib/profile.ts; EMAIL_PATTERN em login.tsx e lib/profile.ts; createId em 6 contextos; initials (trainers.ts) e getInitials (profile.ts); componente Field em log-exercise/[id].tsx e workout-session.tsx",
   "detail": "Mesmas regras escritas mais de uma vez com pequenas diferenças (parseNumber não faz trim antes do replace).",
   "fix": "Mover para src/lib/format e src/lib/ids; um Field compartilhado em components/ui."
  },
  {
   "id": "I-19",
   "title": "Código e dependências sem uso",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "Sem import: components/coming-soon.tsx, external-link.tsx, hint-row.tsx, web-badge.tsx, ui/collapsible.tsx; pacotes @expo/ui, expo-glass-effect, expo-symbols, expo-device; scripts/reset-project.js; README do template",
   "detail": "Aumenta o tempo de instalação, a superfície de atualização do SDK e confunde quem chega ao projeto.",
   "fix": "Remover e reescrever o README com instruções do projeto."
  },
  {
   "id": "I-20",
   "title": "Sem camada de acesso a dados",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Arquitetura",
   "evidence": "Todos os contextos criam e alteram arrays com setState diretamente (ex.: food-log.tsx addEntry, workout-plan.tsx importWorkouts)",
   "detail": "Para a estratégia front-first este é o ponto mais importante: o contrato com o backend não existe, então cada tela depende do formato interno do contexto e a integração exigirá reescrita.",
   "fix": "Interfaces de repositório por domínio (ex.: FoodLogRepository.list/add/update/remove) com implementação local agora e HTTP depois; considerar TanStack Query para cache e estados de carregamento."
  },
  {
   "id": "I-21",
   "title": "Dependência implícita entre providers",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Arquitetura",
   "evidence": "weight-log.tsx e coaching.tsx ('Must sit inside ...'); _layout.tsx com 9 níveis de aninhamento",
   "detail": "Reordenar providers quebra em tempo de execução, não de compilação.",
   "fix": "Um provider de composição ou um store único com fatias por domínio."
  },
  {
   "id": "I-22",
   "title": "Catálogo de treinadores fixo no código",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/lib/trainers.ts (677 linhas, 4 treinadores, fotos de randomuser.me, números de seguidores e notas inventados)",
   "detail": "Esperado na fase, mas os números (seguidores, alunos, nota) aparecem como reais e as fotos são de pessoas fictícias de um serviço externo.",
   "fix": "Mover para JSON de fixture servido pelo repositório mock; marcar como exemplo no modo demo."
  },
  {
   "id": "I-23",
   "title": "Configuração iOS incompleta",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Entrega",
   "evidence": "app.json:40 iosUrlScheme 'com.googleusercontent.apps.YOUR_IOS_CLIENT_ID'; sem ios.bundleIdentifier; .eas/workflows/preview.yml só Android",
   "detail": "Build iOS não está pronto e o Google Sign-In no iOS não funcionaria com o valor de exemplo.",
   "fix": "Definir bundleIdentifier, URL scheme real e um job iOS no workflow quando houver conta Apple."
  },
  {
   "id": "I-24",
   "title": "Seis destinos na barra de navegação",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/constants/tabs.ts (Início, Diário, Exercícios, Treinador, Tarefas, Perfil)",
   "detail": "A barra de navegação do Material 3 prevê de 3 a 5 destinos; com 6, os rótulos ficam apertados em telas pequenas e o peso de cada aba diminui.",
   "fix": "Levar Tarefas para a tela inicial (já existe o widget) ou Perfil para o cabeçalho."
  },
  {
   "id": "I-25",
   "title": "Busca de exercícios inconsistente com a de alimentos",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/log-exercise/index.tsx (busca só ao enviar, 'Tente um termo em inglês'); src/hooks/use-food-search.ts (ao digitar com debounce)",
   "detail": "Duas buscas parecidas com comportamentos diferentes, e a de exercícios exige inglês num app em português.",
   "fix": "Dicionário pt→en de termos comuns e busca com debounce respeitando o limite da API."
  },
  {
   "id": "I-26",
   "title": "Ícone errado no botão de tentar novamente",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/log-exercise/index.tsx ListFooterComponent: icon={Plus}",
   "detail": "O mesmo botão na busca de alimentos usa RotateCw.",
   "fix": "Trocar por RotateCw."
  },
  {
   "id": "I-27",
   "title": "Registro em datas futuras inconsistente",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Regras",
   "evidence": "components/exercise/day-selector.tsx sem limite; exercise-section.tsx e meal-section.tsx permitem adicionar; workout-card.tsx bloqueia (canLog)",
   "detail": "Dá para registrar alimento e exercício avulso em dias futuros, mas não concluir um treino.",
   "fix": "Decidir a regra (planejar refeições pode fazer sentido) e aplicá-la igual em todos os diários."
  },
  {
   "id": "I-28",
   "title": "Calorias de exercício pouco confiáveis",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Regras",
   "evidence": "src/lib/exercisedb.ts estimateMet (regex sobre o nome); workout-session.tsx e workout-card.tsx registram 0 kcal quando não há MET",
   "detail": "Exercícios digitados à mão ou sem correspondência na tabela entram com 0 kcal no treino, e o saldo calórico da tela inicial fica errado.",
   "fix": "Pedir MET ou intensidade ao criar exercício manual; usar um MET padrão por categoria."
  },
  {
   "id": "I-29",
   "title": "Componente de dashboard com 714 linhas",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "src/components/dashboard/draggable-dashboard.tsx",
   "detail": "Gestos, geometria, auto-rolagem, lixeira e acessibilidade no mesmo arquivo.",
   "fix": "Extrair o cálculo de alvo de soltura (função pura, testável) e a lixeira."
  },
  {
   "id": "I-30",
   "title": "Quantidade de alimento sem limite",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Validação",
   "evidence": "src/app/log-food/[id].tsx valid = gramsValue > 0",
   "detail": "Aceita 99.999 g; um erro de digitação distorce o dia inteiro.",
   "fix": "Limite razoável (ex.: 5.000 g) com mensagem."
  },
  {
   "id": "I-31",
   "title": "Typecheck depende de arquivo gerado",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "tsconfig.json inclui expo-env.d.ts, que está no .gitignore",
   "detail": "Em um clone novo, tsc falha até rodar expo start. Um CI precisaria gerar o arquivo.",
   "fix": "Gerar o arquivo no passo de CI ou declarar os tipos de CSS em um .d.ts versionado."
  },
  {
   "id": "I-32",
   "title": "Sessão de treino perdida ao sair do app",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinos",
   "evidence": "src/app/workout-session.tsx (startedAt e performed em useState da tela)",
   "detail": "Se o sistema encerrar o app no meio do treino (comum ao trocar para música ou câmera), o tempo e as séries somem.",
   "fix": "Persistir a sessão em andamento e oferecer retomar."
  },
  {
   "id": "I-33",
   "title": "Sair do pacote apaga o histórico ligado a ele",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/context/coaching.tsx leavePackage → removeWorkout; src/lib/workouts.ts getWorkoutForDate procura o treino concluído pelo id",
   "detail": "As conclusões continuam apontando para treinos removidos; o dia concluído deixa de mostrar o treino e o resumo da sessão.",
   "fix": "Arquivar treinos de pacotes em vez de apagá-los ou guardar um snapshot na conclusão."
  }
 ],
 "hypotheses": [
  {
   "id": "H-01",
   "title": "Filtros por render vão pesar com histórico",
   "detail": "useFoodDay, useExerciseDay e ExerciseTile filtram todos os registros a cada render (ExerciseTile faz filter com some dentro, O(n·m)). Irrelevante hoje com dados de uma sessão; com meses persistidos pode afetar a troca de dia. Não medido."
  },
  {
   "id": "H-02",
   "title": "Valores de contexto recriados a cada render",
   "detail": "Os providers passam objetos novos em value. Com o React Compiler ativo isso pode ser memoizado automaticamente; não foi verificado em execução."
  },
  {
   "id": "H-03",
   "title": "Conflito entre arrastar widgets e swipe de abas",
   "detail": "Existe swipe-lock para isso (sliding-tabs/swipe-lock.tsx), mas a interação não foi testada em dispositivo."
  }
 ],
 "missing": [
  {
   "name": "Persistência local dos dados",
   "priority": "P0",
   "area": "Gestão de dados",
   "why": "Sem ela o front não pode ser testado por usuários reais nem demonstrado de um dia para o outro; é pré-requisito para histórico, progresso e qualquer métrica de retenção."
  },
  {
   "name": "Isolamento de dados por conta",
   "priority": "P0",
   "area": "Privacidade",
   "why": "Dados de saúde de uma pessoa aparecem para a próxima que entrar no mesmo aparelho (I-02)."
  },
  {
   "name": "Camada de repositório e contratos de API",
   "priority": "P0",
   "area": "Escalabilidade",
   "why": "É o que permite à estratégia front-first terminar em integração, e não em reescrita (I-20)."
  },
  {
   "name": "Backend com autenticação real e sessão segura",
   "priority": "P0",
   "area": "Segurança",
   "why": "Bloqueia o lançamento: hoje qualquer pessoa entra com qualquer e-mail."
  },
  {
   "name": "Consentimento, política de privacidade, exportar e excluir conta",
   "priority": "P0",
   "area": "Segurança e privacidade",
   "why": "O app coleta peso, alimentação e dados corporais, que a LGPD trata como dados sensíveis de saúde; as lojas exigem exclusão de conta dentro do app."
  },
  {
   "name": "Metas calculadas a partir do perfil",
   "priority": "P1",
   "area": "Personalização",
   "why": "O cadastro promete estimar calorias e não estima; sem isso o anel de calorias e os macros não têm significado para o usuário (I-04)."
  },
  {
   "name": "Edição de registros, treinos, tarefas e perfil",
   "priority": "P1",
   "area": "Fluxos incompletos",
   "why": "Corrigir erro de digitação é a ação mais comum em um diário; hoje exige apagar e recriar (I-12, I-13)."
  },
  {
   "name": "Tela de configurações",
   "priority": "P1",
   "area": "Personalização",
   "why": "Não há lugar para metas, unidades, notificações, conta, privacidade e sair; 'Sair' fica solto no perfil."
  },
  {
   "name": "Recuperação de senha",
   "priority": "P1",
   "area": "Autenticação",
   "why": "Fluxo obrigatório de qualquer login por e-mail e senha; ausente na tela de login."
  },
  {
   "name": "Histórico e progressão de treinos",
   "priority": "P1",
   "area": "Relatórios",
   "why": "O app já registra séries, cargas e sensação, mas não mostra a evolução; é o principal motivo para quem treina voltar ao app."
  },
  {
   "name": "Testes automatizados e CI",
   "priority": "P1",
   "area": "Qualidade",
   "why": "As regras de repetição, fila e sincronização já têm casos de borda reais (I-07); sem testes, a integração com backend vai regredir sem ninguém ver."
  },
  {
   "name": "Monitoramento de erros",
   "priority": "P1",
   "area": "Operação",
   "why": "Com OTA ativa, um erro publicado chega a todos os usuários; hoje só há console.warn."
  },
  {
   "name": "Timer de descanso e registro por série",
   "priority": "P2",
   "area": "Treino",
   "why": "A sessão registra um único número de séries, repetições e carga por exercício; quem treina varia carga por série e cronometra descanso."
  },
  {
   "name": "Recentes, favoritos e copiar refeição",
   "priority": "P2",
   "area": "Retenção",
   "why": "Reduz o atrito diário do registro de alimentos, que é repetitivo."
  },
  {
   "name": "Leitura de código de barras",
   "priority": "P2",
   "area": "Integrações",
   "why": "O Open Food Facts já é indexado por código de barras (id off:<barcode>); a câmera completaria o fluxo para produtos industrializados."
  },
  {
   "name": "Lembretes e notificações locais",
   "priority": "P2",
   "area": "Notificações",
   "why": "Tarefas repetitivas e treinos do dia sem lembrete dependem de o usuário abrir o app sozinho."
  },
  {
   "name": "Passos via Health Connect / HealthKit",
   "priority": "P2",
   "area": "Integrações",
   "why": "O widget de passos já existe com dado fictício; precisa de fonte real ou deve sair."
  },
  {
   "name": "Relatório semanal de progresso",
   "priority": "P2",
   "area": "Relatórios",
   "why": "Junta peso, calorias médias e aderência ao plano, que hoje só aparecem dia a dia."
  },
  {
   "name": "Avaliar e comentar pacotes",
   "priority": "P3",
   "area": "Engajamento",
   "why": "Os comentários exibidos são fixos; deixar o aluno avaliar após concluir o programa dá credibilidade ao catálogo."
  },
  {
   "name": "Painel e onboarding do treinador",
   "priority": "P3",
   "area": "Marketplace",
   "why": "Para o catálogo deixar de ser fixo, treinadores precisam publicar pacotes e responder alunos."
  },
  {
   "name": "Pagamento de pacotes",
   "priority": "P3",
   "area": "Monetização",
   "why": "Só se o modelo de negócio prever pacotes pagos; não há indício no código, então depende de decisão de produto."
  }
 ],
 "flows": [
  {
   "name": "Primeiro acesso e cadastro",
   "steps": [
    {
     "label": "Splash animado",
     "kind": "ok"
    },
    {
     "label": "Login",
     "kind": "friction",
     "note": "Textos em inglês; sem recuperar senha"
    },
    {
     "label": "Criar conta: nome, e-mail, senha",
     "kind": "ok"
    },
    {
     "label": "Sobre você: idade, sexo, altura, peso",
     "kind": "friction",
     "note": "Dados não usados para metas"
    },
    {
     "label": "Carregando",
     "kind": "ok"
    },
    {
     "label": "Início com dados de exemplo",
     "kind": "break",
     "note": "Passos e histórico de peso fictícios"
    },
    {
     "label": "Onboarding de objetivo",
     "kind": "missing",
     "note": "Não existe"
    }
   ],
   "notes": "O cadastro é curto e bem validado, mas termina em uma tela inicial que mostra números que o usuário não registrou e metas que não são dele."
  },
  {
   "name": "Registrar uma refeição",
   "steps": [
    {
     "label": "Diário",
     "kind": "ok"
    },
    {
     "label": "Adicionar alimento na refeição",
     "kind": "ok"
    },
    {
     "label": "Buscar (TACO na hora, Open Food Facts após pausa)",
     "kind": "ok"
    },
    {
     "label": "Quantidade e refeição",
     "kind": "ok"
    },
    {
     "label": "Adicionar → volta ao diário",
     "kind": "ok"
    },
    {
     "label": "Corrigir quantidade",
     "kind": "missing",
     "note": "Só apagar e recriar"
    },
    {
     "label": "Repetir refeição de ontem",
     "kind": "missing"
    }
   ],
   "notes": "Fluxo mais maduro do app. Faltam edição e atalhos para registros repetidos."
  },
  {
   "name": "Montar e executar um treino",
   "steps": [
    {
     "label": "Exercícios → Planejamento",
     "kind": "ok"
    },
    {
     "label": "Novo treino (Treino A)",
     "kind": "ok"
    },
    {
     "label": "Adicionar exercício (busca ExerciseDB)",
     "kind": "friction",
     "note": "Busca só ao enviar, termos em inglês"
    },
    {
     "label": "Definir dias ou fila",
     "kind": "ok"
    },
    {
     "label": "Iniciar treino (cronômetro)",
     "kind": "ok"
    },
    {
     "label": "Concluir exercícios e sensação",
     "kind": "friction",
     "note": "Sem descanso nem carga por série"
    },
    {
     "label": "Ver evolução das cargas",
     "kind": "missing"
    }
   ],
   "notes": "Planejamento flexível (semanal ou fila) e sessão cronometrada bem feitos; falta o retorno de progresso que justifica registrar."
  },
  {
   "name": "Seguir um treinador",
   "steps": [
    {
     "label": "Aba Treinador → buscar",
     "kind": "ok"
    },
    {
     "label": "Perfil do treinador",
     "kind": "ok"
    },
    {
     "label": "Pacote: treinos e comentários",
     "kind": "ok"
    },
    {
     "label": "Aderir ao treino",
     "kind": "break",
     "note": "Sobrescreve dias do plano próprio sem aviso"
    },
    {
     "label": "Planejamento com treinos bloqueados",
     "kind": "ok"
    },
    {
     "label": "Conversar",
     "kind": "break",
     "note": "Treinador nunca responde"
    },
    {
     "label": "Avaliar o pacote",
     "kind": "missing"
    }
   ],
   "notes": "É o diferencial do produto, mas ainda sem a outra ponta (treinador real, respostas, avaliações)."
  },
  {
   "name": "Tarefas do dia",
   "steps": [
    {
     "label": "Tarefas → +",
     "kind": "ok"
    },
    {
     "label": "Nome, repetição, subtarefas",
     "kind": "ok"
    },
    {
     "label": "Marcar feito por dia",
     "kind": "ok"
    },
    {
     "label": "Editar tarefa",
     "kind": "missing"
    },
    {
     "label": "Lembrete no horário",
     "kind": "missing"
    },
    {
     "label": "Excluir",
     "kind": "friction",
     "note": "Sem confirmação"
    }
   ],
   "notes": "Lógica de repetição sólida, mas a feature é genérica e não se liga a metas de saúde."
  },
  {
   "name": "Peso e meta",
   "steps": [
    {
     "label": "Perfil ou card de peso",
     "kind": "ok"
    },
    {
     "label": "Registrar peso de hoje",
     "kind": "ok"
    },
    {
     "label": "Definir meta",
     "kind": "ok"
    },
    {
     "label": "Gráfico de tendência",
     "kind": "break",
     "note": "Começa com histórico fictício"
    },
    {
     "label": "Registrar peso de outro dia",
     "kind": "missing"
    }
   ],
   "notes": "Dialog bem validado (30 a 400 kg), mas só registra a data de hoje e mistura histórico de exemplo."
  },
  {
   "name": "Sair e trocar de conta",
   "steps": [
    {
     "label": "Perfil → Sair",
     "kind": "friction",
     "note": "Sem confirmação"
    },
    {
     "label": "Login com outra conta",
     "kind": "ok"
    },
    {
     "label": "Dados da conta anterior aparecem",
     "kind": "break",
     "note": "Providers não são limpos"
    }
   ],
   "notes": "Falha de privacidade comprovada no código (I-02)."
  },
  {
   "name": "Recuperação de erros",
   "steps": [
    {
     "label": "Falha ao preparar app → Tentar de novo / Sair",
     "kind": "ok"
    },
    {
     "label": "Busca de alimentos offline → mensagem + Tentar novamente",
     "kind": "ok"
    },
    {
     "label": "ExerciseDB 429 → mensagem",
     "kind": "ok"
    },
    {
     "label": "App fechado no meio do treino",
     "kind": "break",
     "note": "Sessão perdida"
    },
    {
     "label": "Reabrir app",
     "kind": "break",
     "note": "Todos os dados perdidos"
    }
   ],
   "notes": "Erros de rede são bem tratados; perda de estado não."
  }
 ],
 "benchmark": {
  "caveat": "Não há documento de posicionamento no repositório. O público foi inferido do código: brasileiros (pt-BR, tabela TACO, produtos filtrados por Brasil) que treinam com acompanhamento de personal trainers que divulgam programas no Instagram. As referências abaixo vêm de conhecimento público sobre esses apps e não foram verificadas nesta auditoria; preços e recursos premium mudam com frequência.",
  "competitors": [
   {
    "name": "MyFitnessPal",
    "segment": "Diário alimentar",
    "strengths": "Base de alimentos enorme, leitor de código de barras, metas calculadas, refeições salvas, integrações com wearables.",
    "treinaVs": "Treina tem TACO offline, mais confiável para comida brasileira genérica; falta código de barras, recentes, metas calculadas e edição.",
    "opportunity": "Diário rápido com TACO + produtos BR, sem anúncios e ligado ao treino."
   },
   {
    "name": "FatSecret / Tecnonutri",
    "segment": "Contagem de calorias no Brasil",
    "strengths": "Base brasileira, comunidade, diário fotográfico.",
    "treinaVs": "Mesmo público; Treina ainda não tem histórico nem relatórios.",
    "opportunity": "Unir dieta e treino em um único painel, o que esses apps fazem pouco."
   },
   {
    "name": "Hevy / Strong",
    "segment": "Registro de musculação",
    "strengths": "Registro por série, timer de descanso, histórico e recordes pessoais, rotinas compartilháveis.",
    "treinaVs": "Treina tem plano semanal ou fila e sessão cronometrada, mas registra um único valor por exercício e não mostra evolução.",
    "opportunity": "Progressão de carga por exercício e relatório de volume semanal."
   },
   {
    "name": "MFIT Personal / Tecnofit / Trainerize",
    "segment": "Plataforma personal ↔ aluno",
    "strengths": "Prescrição pelo treinador, chat, cobrança recorrente, avaliação física.",
    "treinaVs": "Treina tem o lado do aluno (pacotes, adesão, chat) mas não o lado do treinador.",
    "opportunity": "Marketplace de programas de influenciadores com execução guiada dentro do app; o diferencial mais claro do Treina."
   },
   {
    "name": "Samsung Health / Google Fit / Apple Saúde",
    "segment": "Atividade e passos",
    "strengths": "Passos e sono automáticos.",
    "treinaVs": "Treina mostra passos fictícios.",
    "opportunity": "Integrar em vez de competir: ler passos e gasto via Health Connect / HealthKit."
   }
  ],
  "differentiators": [
   "Diário, treino e treinador no mesmo app, com o treino do pacote virando o 'treino do dia' automaticamente.",
   "TACO embarcada: busca instantânea e offline de alimentos brasileiros.",
   "Plano em fila, para quem não treina em dias fixos.",
   "Tela inicial personalizável por arrastar."
  ],
  "doNotCopy": [
   "Feed social e desafios públicos: não há sinal no produto de que seja o objetivo, e custa moderação.",
   "Base própria de alimentos colaborativa: TACO + Open Food Facts já cobrem bem o caso brasileiro.",
   "Tarefas genéricas como app de produtividade: é melhor transformar em hábitos de saúde do que competir com apps de tarefas."
  ]
 },
 "gallery": {
  "note": "Capturas do app real, exportado para web (expo export -p web) e navegado com Playwright num viewport de 390 × 844 em 2 de novembro de 2026. Os dados foram criados pela própria interface: cadastro, alimentos, adesão a um pacote, treino próprio, tarefas e uma mensagem. A versão web é uma aproximação do app nativo: fontes, sombras e gestos podem diferir no Android e no iOS. O ambiente da auditoria bloqueia ExerciseDB, Open Food Facts e randomuser.me, por isso essas partes aparecem em estado de erro ou com iniciais no lugar das fotos.",
  "missing": [
   {
    "screen": "bootstrap",
    "why": "A tela de carregamento aparece por um único quadro, porque prepareMainFlow ainda resolve na hora, e a tela de erro só surge se ele falhar. Não dá para capturar nenhuma das duas sem alterar o código."
   }
  ],
  "images": [
   {
    "screen": "login",
    "file": "screens/login.jpg",
    "id": "login",
    "caption": "Login com os textos em inglês e 'Faca login' sem cedilha (I-08)."
   },
   {
    "screen": "signup-account",
    "file": "screens/signup-account.jpg",
    "id": "signup-account",
    "caption": "Etapa 1 do cadastro preenchida."
   },
   {
    "screen": "signup-details",
    "file": "screens/signup-details.jpg",
    "id": "signup-details",
    "caption": "Etapa 2: idade, sexo, altura e peso. A descrição promete estimar calorias (I-04)."
   },
   {
    "screen": "home",
    "file": "screens/home.jpg",
    "id": "home",
    "caption": "Início depois de registrar alimentos: calorias e macros reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (I-04, I-05)."
   },
   {
    "screen": "home",
    "file": "screens/home-edit.jpg",
    "id": "home-edit",
    "caption": "Modo de edição da tela inicial, com botão de remover em cada widget."
   },
   {
    "screen": "home",
    "file": "screens/home-dark.jpg",
    "id": "home-dark",
    "caption": "Tema escuro gerado pelo design system, numa conta nova sem registros."
   },
   {
    "screen": "diary",
    "file": "screens/diary.jpg",
    "id": "diary",
    "caption": "Diário com café da manhã e almoço registrados."
   },
   {
    "screen": "log-food",
    "file": "screens/log-food.jpg",
    "id": "log-food",
    "caption": "Busca 'pao frances': resultados da TACO na hora. A parte online aparece com erro porque o ambiente da auditoria bloqueia o Open Food Facts."
   },
   {
    "screen": "food-details",
    "file": "screens/food-details.jpg",
    "id": "food-details",
    "caption": "Quantidade em gramas, troca de refeição e nutrientes recalculados."
   },
   {
    "screen": "meals",
    "file": "screens/meals.jpg",
    "id": "meals",
    "caption": "Refeições do diário, refeições padrão e personalizada."
   },
   {
    "screen": "exercise",
    "file": "screens/exercise.jpg",
    "id": "exercise",
    "caption": "Exercícios com o treino do dia vindo do pacote de Ana Souza."
   },
   {
    "screen": "log-exercise",
    "file": "screens/log-exercise.jpg",
    "id": "log-exercise",
    "caption": "Catálogo do ExerciseDB em estado de erro: a API está bloqueada no ambiente da auditoria."
   },
   {
    "screen": "exercise-details",
    "file": "screens/exercise-details.jpg",
    "id": "exercise-details",
    "caption": "Exercício digitado à mão: 30 minutos e 0 kcal, porque não há MET (I-28)."
   },
   {
    "screen": "workouts",
    "file": "screens/workouts.jpg",
    "id": "workouts",
    "caption": "Planejamento depois de aderir ao pacote: treinos do treinador distribuídos na semana."
   },
   {
    "screen": "workout",
    "file": "screens/workout.jpg",
    "id": "workout",
    "caption": "Treino próprio com um exercício de cardio manual."
   },
   {
    "screen": "session",
    "file": "screens/session.jpg",
    "id": "session",
    "caption": "Sessão cronometrada com o primeiro exercício concluído."
   },
   {
    "screen": "session",
    "file": "screens/dialog-leave-session.jpg",
    "id": "dialog-leave-session",
    "caption": "Confirmação ao sair da sessão no meio do treino."
   },
   {
    "screen": "trainers",
    "file": "screens/trainers.jpg",
    "id": "trainers",
    "caption": "Lista de treinadores. As fotos (randomuser.me) estão bloqueadas no ambiente, então aparecem as iniciais."
   },
   {
    "screen": "trainer",
    "file": "screens/trainer.jpg",
    "id": "trainer",
    "caption": "Perfil do treinador com números fixos e pacotes."
   },
   {
    "screen": "package",
    "file": "screens/package.jpg",
    "id": "package",
    "caption": "Pacote com treinos, comentários fixos e botão de aderir."
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
    "caption": "Mensagem enviada ao treinador; nunca haverá resposta (I-14)."
   },
   {
    "screen": "tasks",
    "file": "screens/tasks.jpg",
    "id": "tasks",
    "caption": "Tarefa diária com subtarefas e uma tarefa avulsa."
   },
   {
    "screen": "add-task",
    "file": "screens/add-task.jpg",
    "id": "add-task",
    "caption": "Nova tarefa com repetição diária e duas subtarefas."
   },
   {
    "screen": "profile",
    "file": "screens/profile.jpg",
    "id": "profile",
    "caption": "Perfil da conta criada no cadastro."
   },
   {
    "screen": "profile",
    "file": "screens/dialog-weight.jpg",
    "id": "dialog-weight",
    "caption": "Diálogo de registrar peso."
   }
  ]
 },
 "screens": [
  {
   "id": "login",
   "name": "Login",
   "route": "/login",
   "group": "Autenticação",
   "files": [
    "src/app/login.tsx",
    "src/context/session.tsx",
    "src/lib/google-auth.ts"
   ],
   "objective": "Entrar com e-mail e senha ou com Google.",
   "context": "Primeira tela de quem não tem sessão.",
   "importance": "Alta",
   "works": [
    "Login simulado por e-mail entra com qualquer valor",
    "Google Sign-In em build nativo (web mostra indisponível)",
    "Mostrar/ocultar senha",
    "Estados de carregamento separados para e-mail e Google",
    "Link para criar conta"
   ],
   "partial": [
    "Validação de e-mail e senha existe, mas fica desligada por IS_AUTH_MOCKED"
   ],
   "visual": [],
   "redundant": [
    "EMAIL_PATTERN redefinido aqui e em src/lib/profile.ts"
   ],
   "ux": [
    "- Textos em inglês: 'Sign in', 'Show', 'Your password', 'you@example.com' e mensagens de erro",
    "- 'Faca login' sem cedilha e 'Bem vindo' sem hífen",
    "- Sem 'Esqueci minha senha'",
    "+ Erro anunciado com accessibilityRole='alert'",
    "+ Botão Google segue a identidade visual do Google nos dois temas",
    "+ KeyboardAvoidingView e retorno do teclado encadeando campos"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim (guard troca a tela)"
   },
   "tech": [
    "Não normaliza o e-mail para minúsculas, ao contrário do cadastro (I-09)",
    "Estado de envio por booleanos separados; simples e correto",
    "Erro do Google tipado (GoogleSignInError) com mensagem própria"
   ],
   "opportunities": [
    "Traduzir e revisar todos os textos",
    "Adicionar recuperação de senha antes do backend, já com a tela pronta",
    "Usar um helper único de normalização e validação de e-mail"
   ],
   "issues": [
    "I-08",
    "I-09",
    "I-10"
   ],
   "scores": {
    "tech": 6,
    "ux": 5,
    "complete": 4,
    "maturity": 3
   },
   "justify": {
    "tech": "Estrutura limpa e estados corretos, mas validação duplicada e e-mail não normalizado.",
    "ux": "Idioma misto e erros de grafia na primeira impressão do app.",
    "complete": "Falta recuperação de senha e a validação está desligada.",
    "maturity": "Depende inteiramente do mock de autenticação."
   }
  },
  {
   "id": "signup-account",
   "name": "Criar conta: sua conta",
   "route": "/signup",
   "group": "Autenticação",
   "files": [
    "src/app/signup/index.tsx",
    "src/components/signup/step-screen.tsx",
    "src/context/signup.tsx"
   ],
   "objective": "Coletar nome, e-mail e senha (etapa 1 de 2).",
   "context": "Novo usuário vindo do login.",
   "importance": "Alta",
   "works": [
    "Exige nome e sobrenome",
    "Valida e-mail e senha com pelo menos 6 caracteres",
    "Guarda os dados ao voltar da etapa 2 (SignupProvider)",
    "Indicador de etapa com rótulo de acessibilidade"
   ],
   "partial": [
    "A senha é coletada e descartada em session.signUp"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Mensagens de erro claras em pt-BR",
    "+ Foco passa automaticamente entre campos",
    "- Erro único no rodapé em vez de junto ao campo",
    "- Sem mostrar senha, ao contrário do login"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Validação simples e correta",
    "StepScreen reaproveitado entre as duas etapas",
    "Exigir sobrenome pode barrar nomes de uma palavra (hipótese de produto, não erro de código)"
   ],
   "opportunities": [
    "Erros por campo",
    "Botão de mostrar senha",
    "Termos de uso e consentimento de dados de saúde nesta etapa"
   ],
   "issues": [
    "I-10"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 5
   },
   "justify": {
    "tech": "Código curto, reaproveita StepScreen e valida bem.",
    "ux": "Fluxo claro e em português; erro centralizado no rodapé.",
    "complete": "Cumpre a etapa; faltam termos e consentimento.",
    "maturity": "A senha não tem destino até existir backend."
   }
  },
  {
   "id": "signup-details",
   "name": "Criar conta: sobre você",
   "route": "/signup/details",
   "group": "Autenticação",
   "files": [
    "src/app/signup/details.tsx",
    "src/components/ui/picker-field.tsx",
    "src/lib/profile.ts"
   ],
   "objective": "Coletar idade, sexo, altura e peso (etapa 2 de 2) e criar a conta.",
   "context": "Continuação do cadastro.",
   "importance": "Alta",
   "works": [
    "Seletores de idade (13 a 120) e altura (100 a 250 cm)",
    "Peso validado entre 30 e 400 kg com vírgula ou ponto",
    "Redireciona para a etapa 1 se aberta sem ela",
    "Cria a conta e entra direto"
   ],
   "partial": [
    "A descrição promete estimar calorias, mas os dados não são usados em nenhuma meta (I-04)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Seletores evitam digitação inválida",
    "+ Opção 'Não informar' para sexo",
    "- Não pergunta objetivo (perder, manter, ganhar) nem nível de atividade, necessários para a promessa da própria tela",
    "- Guarda idade e não data de nascimento"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Redirect de proteção bem pensado para web",
    "Arredondamento do peso a 0,1 kg",
    "Profile.age fixo envelhece errado com o tempo (I-13)"
   ],
   "opportunities": [
    "Adicionar objetivo e nível de atividade",
    "Usar os dados para calcular metas",
    "Trocar idade por data de nascimento"
   ],
   "issues": [
    "I-04",
    "I-13"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Validação e proteção de rota corretas.",
    "ux": "Boa entrada de dados, mas a promessa da tela não se cumpre.",
    "complete": "Faltam objetivo e atividade para o cálculo de metas.",
    "maturity": "Dados ficam só na memória da sessão."
   }
  },
  {
   "id": "bootstrap",
   "name": "Carregando o app / erro de carregamento",
   "route": "(tabs)/_layout",
   "group": "Autenticação",
   "files": [
    "src/app/(tabs)/_layout.tsx",
    "src/hooks/use-main-flow-bootstrap.ts",
    "src/lib/prepare-main-flow.ts",
    "src/components/main-flow-loading.tsx"
   ],
   "objective": "Preparar os dados do usuário antes de mostrar as abas.",
   "context": "Logo após cada login.",
   "importance": "Média",
   "works": [
    "Estados loading, ready e error",
    "Tentar de novo e Sair na tela de erro",
    "Ignora respostas após logout (cancelled)"
   ],
   "partial": [
    "prepareMainFlow está vazio por enquanto, de propósito"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Mensagem de erro útil em pt-BR",
    "+ Sempre abre na primeira aba"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Padrão correto para o futuro carregamento do backend",
    "console.warn como único registro de erro"
   ],
   "opportunities": [
    "Ligar ao monitoramento de erros",
    "Carregar perfil e metas aqui quando houver API"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 5,
    "maturity": 5
   },
   "justify": {
    "tech": "Hook pequeno, cancelável e com retry.",
    "ux": "Estados claros com saída para o usuário.",
    "complete": "Ainda não carrega nada.",
    "maturity": "Pronto para receber a integração."
   }
  },
  {
   "id": "home",
   "name": "Início (dashboard)",
   "route": "/(tabs)",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/index.tsx",
    "src/components/dashboard/draggable-dashboard.tsx",
    "src/components/dashboard/*.tsx",
    "src/context/dashboard-layout.tsx",
    "src/lib/dashboard-widgets.ts",
    "src/lib/dashboard-data.ts"
   ],
   "objective": "Resumo do dia: calorias, macros, passos, exercício, tarefas e peso.",
   "context": "Tela de abertura do app.",
   "importance": "Alta",
   "works": [
    "Calorias consumidas e macros vêm do diário real",
    "Calorias e minutos de exercício vêm do registro real",
    "Progresso do treino do dia",
    "Tarefas do dia com marcação",
    "Modo edição: adicionar, remover e reordenar widgets por arrastar, com lixeira e ações de acessibilidade",
    "Dois widgets por linha em versão compacta, três ou mais viram carrossel"
   ],
   "partial": [
    "Card de peso usa histórico com dados de exemplo (I-03)",
    "Metas de calorias, macros e exercício são fixas (I-04)"
   ],
   "visual": [
    "Passos: 6.840 de 10.000 para qualquer usuário (I-05)"
   ],
   "redundant": [
    "Remover widget existe por arrastar à lixeira e pelo botão na barra de edição; aceitável como alternativa acessível"
   ],
   "ux": [
    "+ Hierarquia clara: 'Hoje' e cards por importância",
    "+ Estado vazio com ação 'Adicionar itens'",
    "+ Prévia não interativa no modo edição evita toques acidentais",
    "- Números fictícios ao lado de números reais, sem distinção",
    "- Sem navegação para outros dias no dashboard"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Arrastar com Reanimated, auto-rolagem e trava do swipe de abas: implementação avançada",
    "draggable-dashboard.tsx com 714 linhas (I-29)",
    "moveWidget é função pura e testável",
    "Layout não persiste (I-01)"
   ],
   "opportunities": [
    "Esconder ou marcar widgets sem dado real",
    "Calcular metas do perfil",
    "Persistir o layout",
    "Tocar em um card leva à aba correspondente"
   ],
   "issues": [
    "I-03",
    "I-04",
    "I-05",
    "I-29",
    "I-01"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 5,
    "maturity": 5
   },
   "justify": {
    "tech": "Engenharia sofisticada no arrastar, mas concentrada em um arquivo grande.",
    "ux": "Visual organizado e personalizável; confunde ao misturar dado real e fictício.",
    "complete": "Metade dos números ainda não vem de dados do usuário.",
    "maturity": "Funciona na sessão, mas perde o layout ao reiniciar."
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
   "objective": "Ver e registrar alimentos por refeição em cada dia.",
   "context": "Uso diário, várias vezes ao dia.",
   "importance": "Alta",
   "works": [
    "Seletor de dia (Hoje, Ontem, Amanhã)",
    "Totais de kcal e macros do dia",
    "Seções por refeição com total e lista",
    "Remover alimento",
    "Refeições removidas continuam aparecendo nos dias em que têm alimentos"
   ],
   "partial": [
    "Sem editar quantidade ou mudar de refeição (I-12)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Rótulos encolhem em vez de quebrar em telas estreitas",
    "+ Botão de adicionar por refeição já leva a refeição certa",
    "- Remover sem confirmação nem desfazer (I-11)",
    "- Totais sem comparação com a meta do dia",
    "- Aceita registro em datas futuras (I-27)"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "useFoodDay recalcula seções a cada render (H-01)",
    "sumNutrients descarta fibra no total do dia"
   ],
   "opportunities": [
    "Mostrar quanto falta para a meta",
    "Editar registro ao tocar",
    "Copiar refeição de outro dia",
    "Recentes e favoritos"
   ],
   "issues": [
    "I-11",
    "I-12",
    "I-27"
   ],
   "scores": {
    "tech": 7,
    "ux": 8,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Modelagem cuidadosa (mealName guardado para refeições removidas).",
    "ux": "Leitura rápida e ações bem posicionadas.",
    "complete": "Falta editar e comparar com a meta.",
    "maturity": "Fluxo completo dentro da sessão."
   }
  },
  {
   "id": "log-food",
   "name": "Adicionar alimento (busca)",
   "route": "/log-food",
   "group": "Modais",
   "files": [
    "src/app/log-food/index.tsx",
    "src/hooks/use-food-search.ts",
    "src/lib/taco.ts",
    "src/lib/openfoodfacts.ts"
   ],
   "objective": "Encontrar um alimento genérico ou produto industrializado.",
   "context": "Aberto a partir de uma refeição do diário.",
   "importance": "Alta",
   "works": [
    "TACO filtra a cada tecla, offline, com busca por prefixo sem acento",
    "Open Food Facts após 600 ms e 3 letras, só produtos do Brasil",
    "Respostas obsoletas ignoradas",
    "Erro com Tentar novamente",
    "Lista única das duas fontes"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Estado vazio ilustrado e foco automático na busca",
    "+ Indicador de carregamento só para a parte online",
    "- Não diferencia visualmente TACO e produto de marca além do detalhe",
    "- Sem recentes quando o campo está vazio"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Hook bem resolvido com chave por tentativa e debounce",
    "Cache de promessas e descarte de falhas para permitir retry",
    "Filtro de valores impossíveis por 100 g"
   ],
   "opportunities": [
    "Recentes e favoritos no estado vazio",
    "Leitor de código de barras",
    "Selo da fonte do dado"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 6
   },
   "justify": {
    "tech": "Melhor código do projeto: debounce, cache, descarte e validação de dados externos.",
    "ux": "Rápida e com todos os estados.",
    "complete": "Faltam atalhos de recorrência.",
    "maturity": "Produtos online somem da memória ao reiniciar."
   }
  },
  {
   "id": "food-details",
   "name": "Quantidade do alimento",
   "route": "/log-food/[id]",
   "group": "Modais",
   "files": [
    "src/app/log-food/[id].tsx",
    "src/lib/foods.ts"
   ],
   "objective": "Definir gramas e refeição e ver os nutrientes antes de adicionar.",
   "context": "Após escolher o alimento.",
   "importance": "Alta",
   "works": [
    "Porção do rótulo e 100 g como atalhos",
    "Troca de refeição por chips",
    "Nutrientes recalculados ao digitar, incluindo fibra quando existe",
    "Fecha o modal inteiro ao salvar"
   ],
   "partial": [
    "Sem limite superior de gramas (I-30)"
   ],
   "visual": [],
   "redundant": [
    "parseNumber local duplica parseDecimal de lib/profile (I-18)"
   ],
   "ux": [
    "+ Prévia imediata dos nutrientes",
    "+ Botão desabilitado com valor inválido",
    "- Sem medidas caseiras (colher, unidade, xícara), comuns na TACO"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim (alimento não encontrado)",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Depende do cache em memória para produtos do Open Food Facts; após reload mostra 'não encontrado'",
    "Validação mínima de entrada"
   ],
   "opportunities": [
    "Medidas caseiras",
    "Modo edição para registros existentes",
    "Limite e aviso para quantidades altas"
   ],
   "issues": [
    "I-18",
    "I-30"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Correto e simples; duplica helper.",
    "ux": "Clara, mas só em gramas.",
    "complete": "Faltam medidas caseiras e edição.",
    "maturity": "Funciona de ponta a ponta na sessão."
   }
  },
  {
   "id": "meals",
   "name": "Refeições",
   "route": "/meals",
   "group": "Modais",
   "files": [
    "src/app/meals.tsx",
    "src/lib/foods.ts (insertMeal)"
   ],
   "objective": "Escolher quais refeições aparecem no diário.",
   "context": "Configuração ocasional.",
   "importance": "Baixa",
   "works": [
    "Remover refeição (sempre mantém pelo menos uma)",
    "Adicionar refeições padrão na ordem do dia",
    "Refeição personalizada com detecção de nome duplicado",
    "Digitar o nome de uma refeição padrão adiciona a padrão"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Explica que alimentos de refeições removidas continuam no diário",
    "- Não permite reordenar nem renomear refeições",
    "- Remoção sem confirmação"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "sim (duplicado)",
    "success": "sim"
   },
   "tech": [
    "insertMeal mantém a ordem do dia: regra pura e testável"
   ],
   "opportunities": [
    "Reordenar e renomear",
    "Horário sugerido por refeição para lembretes"
   ],
   "issues": [
    "I-11"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 8,
    "maturity": 6
   },
   "justify": {
    "tech": "Regras pequenas e bem pensadas.",
    "ux": "Simples; faltam reordenar e renomear.",
    "complete": "Cumpre o objetivo.",
    "maturity": "Configuração perdida ao reiniciar."
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
    "src/components/exercise/exercise-section.tsx",
    "src/context/exercise-log.tsx"
   ],
   "objective": "Ver o treino do dia e os exercícios registrados.",
   "context": "Dias de treino.",
   "importance": "Alta",
   "works": [
    "Seletor de dia e totais (kcal, minutos, quantidade)",
    "Treino do dia conforme plano semanal ou fila",
    "Marcar exercícios do treino individualmente",
    "Concluir sem cronômetro ou iniciar sessão",
    "Desfazer conclusão",
    "Seções cardio e musculação com registros avulsos",
    "Acesso ao planejamento"
   ],
   "partial": [
    "Futuro só mostra prévia do treino, mas exercícios avulsos podem ser registrados no futuro (I-27)"
   ],
   "visual": [],
   "redundant": [
    "Duas formas de concluir (cronometrado e sem cronômetro) é proposital e útil"
   ],
   "ux": [
    "+ Treino do dia em destaque acima dos registros",
    "+ Resumo de sessão (duração e sensação) no card concluído",
    "- Total de 'Minutos' conta só cardio",
    "- Registros avulsos sem edição"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "getWorkoutForDate centraliza a regra do dia",
    "Desfazer em dia antigo desalinha a fila (I-07)",
    "Calorias 0 quando não há MET (I-28)"
   ],
   "opportunities": [
    "Mostrar histórico de cargas do exercício",
    "Minutos totais incluindo musculação via duração da sessão"
   ],
   "issues": [
    "I-07",
    "I-12",
    "I-27",
    "I-28"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Regra do dia bem isolada; bug de fila e calorias zeradas.",
    "ux": "Boa hierarquia; métricas incompletas.",
    "complete": "Faltam edição e histórico.",
    "maturity": "Funciona na sessão."
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
   "objective": "Escolher um exercício do catálogo ExerciseDB ou digitar um próprio.",
   "context": "Registro avulso ou montagem de treino.",
   "importance": "Alta",
   "works": [
    "Catálogo paginado por categoria com carregamento ao rolar",
    "Busca remota ao enviar",
    "Adicionar manualmente com o nome digitado",
    "Miniatura sem animação para economizar",
    "Tratamento de 429 e falha de rede"
   ],
   "partial": [
    "Termos e nomes só em inglês (I-25)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Duas ações claras sob a busca (buscar ou adicionar manualmente)",
    "- Busca não acontece ao digitar, diferente da de alimentos",
    "- Ícone '+' em 'Tentar novamente' (I-26)",
    "- Nomes em inglês num app em pt-BR"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "useCatalog com eslint-disable de exhaustive-deps justificado",
    "Respostas obsoletas ignoradas com contador",
    "Dependência de API gratuita de terceiros sem SLA"
   ],
   "opportunities": [
    "Tradução de nomes e músculos",
    "Busca com debounce respeitando o limite",
    "Filtros por músculo e equipamento"
   ],
   "issues": [
    "I-25",
    "I-26"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Paginação e erros bem tratados.",
    "ux": "Barreira de idioma e busca diferente do resto.",
    "complete": "Cobre catálogo, busca e manual.",
    "maturity": "Depende de serviço externo frágil."
   }
  },
  {
   "id": "exercise-details",
   "name": "Detalhes do exercício",
   "route": "/log-exercise/[id]",
   "group": "Modais",
   "files": [
    "src/app/log-exercise/[id].tsx",
    "src/lib/exercises.ts"
   ],
   "objective": "Definir duração e calorias (cardio) ou séries, repetições e carga (musculação).",
   "context": "Após escolher o exercício.",
   "importance": "Alta",
   "works": [
    "GIF de demonstração",
    "Estimativa de kcal por MET com o peso do perfil",
    "Calorias editáveis",
    "Modo 'adicionar ao treino' sem calorias"
   ],
   "partial": [
    "Exercício manual sem MET entra com 0 kcal (I-28)",
    "Sempre abre com 30 min ou 3 × 10, mesmo para exercício já feito antes"
   ],
   "visual": [],
   "redundant": [
    "Field local duplicado em workout-session (I-18)"
   ],
   "ux": [
    "+ Dica 'Estimativa para X kg' deixa claro de onde vem o número",
    "- Uma carga para todas as séries",
    "- Sem lembrar o último valor usado"
   ],
   "states": {
    "loading": "n/a",
    "empty": "parcial",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Validação inline em uma expressão longa de difícil leitura",
    "Dois destinos (diário ou treino) na mesma tela via workoutId: funciona, mas aumenta ramificações"
   ],
   "opportunities": [
    "Lembrar últimos valores",
    "Carga por série",
    "Intensidade para exercícios manuais"
   ],
   "issues": [
    "I-18",
    "I-28"
   ],
   "scores": {
    "tech": 6,
    "ux": 6,
    "complete": 7,
    "maturity": 5
   },
   "justify": {
    "tech": "Funciona, mas concentra ramificações e duplica Field.",
    "ux": "Clara, porém genérica demais para musculação.",
    "complete": "Cobre os dois tipos de exercício.",
    "maturity": "Calorias pouco confiáveis em casos comuns."
   }
  },
  {
   "id": "workouts",
   "name": "Planejamento",
   "route": "/workouts",
   "group": "Modais",
   "files": [
    "src/app/workouts/index.tsx",
    "src/context/workout-plan.tsx",
    "src/lib/workouts.ts"
   ],
   "objective": "Criar treinos e definir quando acontecem (semanal ou fila).",
   "context": "Configuração do plano de treino.",
   "importance": "Alta",
   "works": [
    "Criar treino com nome automático (Treino A, B…)",
    "Modo semanal com diálogo por dia",
    "Modo fila: adicionar, mover, remover e escolher o próximo",
    "Treinos de treinador identificados com avatar"
   ],
   "partial": [
    "Botão Confirmar só volta (o plano já salva ao mudar); pode sugerir que algo não salvo se perde"
   ],
   "visual": [],
   "redundant": [
    "'Confirmar' é redundante com salvar automático"
   ],
   "ux": [
    "+ Explicação de cada modo em uma frase",
    "+ Acessibilidade boa na fila (dicas e rótulos)",
    "- Reordenar só por setas, sem arrastar",
    "- Dias da semana ficam desabilitados até existir um treino; a dica fica em outra seção"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Lógica de fila com casos de borda cuidados (removeFromQueue, moveInQueue)",
    "Ponteiro único da fila é frágil (I-07)"
   ],
   "opportunities": [
    "Renomear 'Confirmar' para 'Concluir' ou remover",
    "Arrastar para reordenar como no dashboard"
   ],
   "issues": [
    "I-07"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Regras de fila bem pensadas, mas sem testes.",
    "ux": "Flexível e explicada.",
    "complete": "Cobre os dois modos.",
    "maturity": "Plano perdido ao reiniciar."
   }
  },
  {
   "id": "workout",
   "name": "Treino (edição)",
   "route": "/workouts/[id]",
   "group": "Modais",
   "files": [
    "src/app/workouts/[id].tsx",
    "src/components/trainers/workout-source.tsx"
   ],
   "objective": "Renomear o treino e gerenciar seus exercícios.",
   "context": "Dentro do planejamento.",
   "importance": "Média",
   "works": [
    "Renomear com salvamento imediato",
    "Adicionar musculação ou cardio",
    "Remover exercício",
    "Excluir treino",
    "Treino de treinador bloqueado com explicação"
   ],
   "partial": [
    "Não edita séries, repetições ou carga de um exercício já adicionado (I-12)",
    "Não reordena exercícios"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Excluir treino sem confirmação (I-11)",
    "- Nome pode ficar vazio",
    "+ Notas do treinador aparecem junto ao exercício"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "sim (não encontrado)",
    "success": "sim"
   },
   "tech": [
    "updateWorkout ignora silenciosamente treinos de treinador: correto, mas sem feedback se chamado"
   ],
   "opportunities": [
    "Editar e reordenar exercícios",
    "Duplicar treino",
    "Confirmação ao excluir"
   ],
   "issues": [
    "I-11",
    "I-12"
   ],
   "scores": {
    "tech": 6,
    "ux": 6,
    "complete": 5,
    "maturity": 5
   },
   "justify": {
    "tech": "Simples, mas falta updateExercise no contexto.",
    "ux": "Ações destrutivas sem proteção.",
    "complete": "Edição parcial do treino.",
    "maturity": "Depende de apagar e recriar."
   }
  },
  {
   "id": "session",
   "name": "Sessão de treino",
   "route": "/workout-session",
   "group": "Modais",
   "files": [
    "src/app/workout-session.tsx",
    "src/components/ui/feeling-picker.tsx"
   ],
   "objective": "Executar o treino com cronômetro e registrar o que foi feito.",
   "context": "Durante o treino, com o celular na mão.",
   "importance": "Alta",
   "works": [
    "Cronômetro desde a abertura, baseado em timestamps",
    "Valores planejados pré-preenchidos e editáveis",
    "Concluir ou desfazer cada exercício",
    "Revisão com escala de sensação 0 a 5",
    "Confirmação ao sair no meio, inclusive gesto de voltar (usePreventRemove)",
    "Substitui registros rápidos anteriores do mesmo exercício"
   ],
   "partial": [
    "Sessão perdida se o app for encerrado (I-32)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Diálogo de saída explica o que será descartado",
    "+ Cronômetro com rótulo de acessibilidade",
    "- Sem timer de descanso",
    "- Uma linha por exercício, sem séries individuais",
    "- Tela não fica ligada (sem keep-awake)"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim (treino não encontrado)",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Uso correto de usePreventRemove e ref para ação pendente",
    "Validação de inteiros e decimais separada",
    "Field duplicado (I-18)"
   ],
   "opportunities": [
    "Timer de descanso entre séries",
    "Registro por série com última carga",
    "Manter a tela ligada (expo-keep-awake)",
    "Retomar sessão interrompida"
   ],
   "issues": [
    "I-18",
    "I-32"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Fluxo de saída e tempo bem resolvidos.",
    "ux": "Boa base; falta o que se usa durante a série.",
    "complete": "Sem descanso nem séries.",
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
    "src/components/trainers/trainer-card.tsx",
    "src/lib/trainers.ts"
   ],
   "objective": "Encontrar treinadores e seus programas.",
   "context": "Descoberta de conteúdo.",
   "importance": "Média",
   "works": [
    "Busca por nome sem acento",
    "Estado vazio com o termo buscado",
    "Abrir perfil"
   ],
   "partial": [],
   "visual": [
    "Lista fixa de 4 treinadores com fotos de randomuser.me e números inventados (I-22)"
   ],
   "redundant": [],
   "ux": [
    "+ Busca simples e imediata",
    "- Sem filtros por especialidade, nível ou objetivo",
    "- Rótulo da aba no singular ('Treinador') para uma lista"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "searchTrainers busca só no nome",
    "Dados de fixture dentro do código"
   ],
   "opportunities": [
    "Filtros por objetivo e nível",
    "Destacar o treinador que o usuário segue"
   ],
   "issues": [
    "I-22"
   ],
   "scores": {
    "tech": 6,
    "ux": 7,
    "complete": 4,
    "maturity": 3
   },
   "justify": {
    "tech": "Simples e correto para fixture.",
    "ux": "Limpa, mas sem filtros.",
    "complete": "Catálogo estático.",
    "maturity": "Totalmente dependente de dados de exemplo."
   }
  },
  {
   "id": "trainer",
   "name": "Perfil do treinador",
   "route": "/trainer/[id]",
   "group": "Treinadores",
   "files": [
    "src/app/trainer/[id].tsx",
    "src/components/trainers/trainer-avatar.tsx"
   ],
   "objective": "Apresentar o treinador e seus pacotes.",
   "context": "Decisão de seguir um programa.",
   "importance": "Média",
   "works": [
    "Foto, especialidade, números e bio",
    "Abrir Instagram",
    "Conversar (abre o chat)",
    "Lista de pacotes com 'Você aderiu'"
   ],
   "partial": [],
   "visual": [
    "Seguidores, alunos e nota são valores fixos"
   ],
   "redundant": [],
   "ux": [
    "+ Rótulos de acessibilidade descritivos nos números",
    "+ CTA principal claro",
    "- 'Conversar' leva a um chat que não responde (I-14)"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim (não encontrado)",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Linking.openURL sem tratar falha",
    "Formatação compacta pt-BR (254,9 mil)"
   ],
   "opportunities": [
    "Esconder 'Conversar' até haver resposta real ou marcar como prévia"
   ],
   "issues": [
    "I-14",
    "I-22"
   ],
   "scores": {
    "tech": 6,
    "ux": 7,
    "complete": 4,
    "maturity": 3
   },
   "justify": {
    "tech": "Correto; pequenos pontos sem tratamento de erro.",
    "ux": "Bem apresentado.",
    "complete": "Conteúdo e chat ainda simulados.",
    "maturity": "Depende do backend para ter sentido."
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
   "objective": "Mostrar treinos, comentários e permitir aderir ao programa.",
   "context": "Decisão de compra ou adesão.",
   "importance": "Alta",
   "works": [
    "Detalhes de nível, semanas e treinos",
    "Comentários com estrelas e média",
    "Aderir copia treinos para o plano e distribui na semana",
    "Diálogo ao trocar de pacote",
    "Sair do pacote e ver planejamento"
   ],
   "partial": [
    "Aderir sem pacote anterior apaga os dias do plano próprio sem aviso (I-06)",
    "Sair do pacote apaga o histórico ligado a ele (I-33)",
    "Duração em semanas não é acompanhada"
   ],
   "visual": [
    "Comentários fixos; não é possível avaliar"
   ],
   "redundant": [],
   "ux": [
    "+ Diálogo de substituição bem escrito",
    "+ Rodapé fixo com a ação principal",
    "- 'Sair do pacote' sem confirmação",
    "- Nenhuma informação de preço, acesso ou vigência"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "sim (não encontrado)",
    "success": "sim"
   },
   "tech": [
    "joinPackage chama leavePackage e importWorkouts em sequência com updates funcionais: correto",
    "Regra de distribuição na semana isolada em packageWeek"
   ],
   "opportunities": [
    "Confirmar quando houver plano próprio",
    "Progresso no programa (semana 3 de 8)",
    "Avaliação pelo aluno"
   ],
   "issues": [
    "I-06",
    "I-11",
    "I-33"
   ],
   "scores": {
    "tech": 6,
    "ux": 7,
    "complete": 5,
    "maturity": 4
   },
   "justify": {
    "tech": "Boa composição de contextos, mas com perda de dados em dois caminhos.",
    "ux": "Clara, com uma ação destrutiva desprotegida.",
    "complete": "Sem acompanhamento do programa nem avaliação.",
    "maturity": "Diferencial ainda unilateral."
   }
  },
  {
   "id": "package-workout",
   "name": "Treino do pacote",
   "route": "/trainer/workout",
   "group": "Treinadores",
   "files": [
    "src/app/trainer/workout.tsx",
    "src/components/trainers/workout-exercise-list.tsx"
   ],
   "objective": "Ver descrição e exercícios de um treino antes de aderir.",
   "context": "Avaliação do pacote.",
   "importance": "Baixa",
   "works": [
    "Descrição, exercícios e notas do treinador"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Leitura simples",
    "- Sem GIF ou demonstração dos exercícios do pacote"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim (não encontrado)",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Identifica o treino por índice no array (index=String(i)); frágil se o pacote mudar no backend"
   ],
   "opportunities": [
    "Usar id estável do treino",
    "Demonstração dos exercícios"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 4
   },
   "justify": {
    "tech": "Pequena e reaproveita a lista.",
    "ux": "Objetiva.",
    "complete": "Sem demonstração.",
    "maturity": "Rota por índice precisa mudar com API."
   }
  },
  {
   "id": "chat",
   "name": "Chat com o treinador",
   "route": "/chat/[trainerId]",
   "group": "Treinadores",
   "files": [
    "src/app/chat/[trainerId].tsx",
    "src/context/chat.tsx"
   ],
   "objective": "Tirar dúvidas com o treinador.",
   "context": "Durante o programa.",
   "importance": "Média",
   "works": [
    "Enviar mensagens com horário",
    "Campo que cresce até 5 linhas",
    "Composer acompanha o teclado (useAnimatedKeyboard)",
    "Lista invertida com estado vazio"
   ],
   "partial": [],
   "visual": [
    "Conversa só de ida: o treinador nunca responde (I-14)"
   ],
   "redundant": [],
   "ux": [
    "+ Detalhe de campo que cresce e encolhe como no Instagram",
    "- Nenhum aviso de que é prévia",
    "- Sem status de envio ou leitura"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "parcial"
   },
   "tech": [
    "Medição do texto com cópia oculta para contornar limitação do Android: solução engenhosa e comentada",
    "Limite de 1.000 caracteres"
   ],
   "opportunities": [
    "Marcar como prévia ou resposta automática no modo demo",
    "Contrato de mensagens pronto para tempo real"
   ],
   "issues": [
    "I-14"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 2,
    "maturity": 2
   },
   "justify": {
    "tech": "Composer bem feito e comentado.",
    "ux": "Boa interface, sem expectativa ajustada.",
    "complete": "Sem a outra ponta da conversa.",
    "maturity": "Não cumpre o objetivo sem backend."
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
    "src/context/tasks.tsx",
    "src/lib/tasks.ts"
   ],
   "objective": "Checklist diário com tarefas repetidas e avulsas.",
   "context": "Rotina diária.",
   "importance": "Média",
   "works": [
    "Tarefas que repetem a cada N dias ou semanas",
    "Tarefas avulsas ficam até serem feitas",
    "Subtarefas sincronizadas com a tarefa",
    "Contador feito/total",
    "Adicionar subtarefa pela linha"
   ],
   "partial": [
    "Sem editar tarefa (I-12)"
   ],
   "visual": [],
   "redundant": [
    "Widget Tarefas no Início repete esta aba"
   ],
   "ux": [
    "+ Checkbox com role e estado de acessibilidade",
    "- Excluir sem confirmação (I-11)",
    "- Sem horário ou lembrete",
    "- Não se conecta a metas de saúde: é um gerenciador de tarefas genérico dentro de um app de treino"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Regras de repetição puras, com cuidado com horário de verão (daysBetween arredondado)",
    "Lógica de subtarefas espelhada em contexto e lib"
   ],
   "opportunities": [
    "Reposicionar como hábitos (água, sono, suplementos, alongamento)",
    "Lembretes",
    "Data de término"
   ],
   "issues": [
    "I-11",
    "I-12",
    "I-24"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Domínio bem modelado.",
    "ux": "Funciona, mas sem lembretes e com exclusão desprotegida.",
    "complete": "Sem edição e horário.",
    "maturity": "Valor de produto ainda indefinido."
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
   "objective": "Criar tarefa com repetição e subtarefas, ou uma subtarefa.",
   "context": "A partir da aba Tarefas.",
   "importance": "Média",
   "works": [
    "Repetição: não repete, todo dia, toda semana, personalizada",
    "Data de início = dia selecionado",
    "Subtarefas adicionadas na criação, incluindo a digitada e não confirmada",
    "Modo subtarefa com explicação"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Radio group acessível",
    "+ Mostra 'Começa em quinta-feira, 6 de novembro'",
    "- Intervalo personalizado inválido só desabilita o botão, sem mensagem"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Uma tela atende dois casos via parentId; ok neste tamanho",
    "key={index} na lista de subtarefas do rascunho"
   ],
   "opportunities": [
    "Mensagem para intervalo inválido",
    "Dias específicos da semana (seg, qua, sex)"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Clara e enxuta.",
    "ux": "Bom formulário; feedback de erro silencioso.",
    "complete": "Falta repetição por dias da semana e horário.",
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
    "src/components/weight/weight-dialog.tsx",
    "src/context/weight-log.tsx"
   ],
   "objective": "Dados pessoais, peso, meta e sair.",
   "context": "Consulta ocasional.",
   "importance": "Média",
   "works": [
    "Iniciais, nome, e-mail e sexo",
    "Idade, peso e altura",
    "Registrar peso de hoje e definir/remover meta (diálogo validado)",
    "Progresso até a meta",
    "Sair"
   ],
   "partial": [
    "Nada além do peso pode ser editado (I-13)"
   ],
   "visual": [],
   "redundant": [
    "Registrar peso também existe no card do Início; aceitável"
   ],
   "ux": [
    "+ Diálogo de peso com validação 30 a 400 kg e erro anunciado",
    "- Sem configurações, privacidade, notificações ou excluir conta",
    "- 'Sair' sem confirmação",
    "- Usa MOCK_PROFILE como fallback de tela"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim (sem meta)",
    "error": "sim (diálogo)",
    "success": "sim"
   },
   "tech": [
    "Fallback para MOCK_PROFILE em vez de estado de erro",
    "Peso duplicado entre perfil e histórico (I-15)"
   ],
   "opportunities": [
    "Editar perfil",
    "Tela de configurações",
    "Exportar dados e excluir conta"
   ],
   "issues": [
    "I-13",
    "I-15",
    "I-03"
   ],
   "scores": {
    "tech": 6,
    "ux": 6,
    "complete": 4,
    "maturity": 4
   },
   "justify": {
    "tech": "Diálogo bom; modelo de peso duplicado.",
    "ux": "Informativo, sem área de conta.",
    "complete": "Faltam edição e configurações.",
    "maturity": "Depende de perfil mock."
   }
  }
 ],
 "features": [
  {
   "id": "F-01",
   "name": "Login por e-mail e Google",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 5,
   "priority": "P1",
   "problem": "Identificar o usuário e proteger seus dados.",
   "fit": "Sim, todo app com dados pessoais precisa.",
   "implementation": "Mock por e-mail; Google real no Android; textos em inglês; e-mail não normalizado.",
   "intuitive": "Sim, padrão conhecido.",
   "missingStep": "Recuperar senha.",
   "absence": "Sem conta não há como sincronizar dados entre aparelhos.",
   "screens": [
    "login"
   ],
   "issues": [
    "I-08",
    "I-09",
    "I-10"
   ],
   "images": [
    "login"
   ]
  },
  {
   "id": "F-02",
   "name": "Cadastro em duas etapas com dados corporais",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P1",
   "problem": "Criar conta e coletar dados para personalização.",
   "fit": "Sim.",
   "implementation": "Bem validado, mas os dados corporais não alimentam nenhum cálculo.",
   "intuitive": "Sim.",
   "missingStep": "Objetivo e nível de atividade; termos e consentimento.",
   "absence": "Sem os dados corporais não há metas pessoais.",
   "screens": [
    "signup-account",
    "signup-details"
   ],
   "issues": [
    "I-04"
   ],
   "images": [
    "signup-account",
    "signup-details"
   ]
  },
  {
   "id": "F-03",
   "name": "Preparação pós-login com erro e retry",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 7,
   "priority": "P3",
   "problem": "Evitar abas vazias enquanto os dados carregam.",
   "fit": "Sim, já prepara a integração.",
   "implementation": "Correta; hoje não carrega nada.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma na fase.",
   "absence": "Telas piscariam vazias após o login.",
   "screens": [
    "bootstrap"
   ],
   "issues": [],
   "images": [],
   "noImage": "Sem captura: a tela de carregamento dura um quadro (prepareMainFlow resolve na hora)."
  },
  {
   "id": "F-04",
   "name": "Dashboard do dia",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P0",
   "problem": "Mostrar em uma tela como está o dia.",
   "fit": "Sim, é a tela de abertura.",
   "implementation": "Calorias e exercício reais; passos, metas e histórico de peso fictícios.",
   "intuitive": "Sim.",
   "missingStep": "Metas pessoais; ver outros dias.",
   "absence": "O usuário teria de abrir cada aba para saber como está.",
   "screens": [
    "home"
   ],
   "issues": [
    "I-03",
    "I-04",
    "I-05"
   ],
   "images": [
    "home"
   ]
  },
  {
   "id": "F-05",
   "name": "Personalização do dashboard por arrastar",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 7,
   "priority": "P3",
   "problem": "Deixar o usuário escolher o que vê primeiro.",
   "fit": "Útil, mas não central nesta fase.",
   "implementation": "Avançada, acessível e sem persistência; 714 linhas.",
   "intuitive": "Sim, com modo edição explícito.",
   "missingStep": "Persistir o layout.",
   "absence": "Baixo: um layout padrão bem escolhido atenderia a maioria.",
   "screens": [
    "home"
   ],
   "issues": [
    "I-29",
    "I-01"
   ],
   "images": [
    "home-edit"
   ]
  },
  {
   "id": "F-06",
   "name": "Diário alimentar por refeição",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 8,
   "priority": "P1",
   "problem": "Registrar o que foi comido e acompanhar calorias e macros.",
   "fit": "Sim, pilar do produto.",
   "implementation": "Fluxo completo de adicionar e remover; sem edição.",
   "intuitive": "Sim.",
   "missingStep": "Editar, copiar refeição, recentes.",
   "absence": "O app perde metade da proposta.",
   "screens": [
    "diary",
    "food-details"
   ],
   "issues": [
    "I-12",
    "I-11"
   ],
   "images": [
    "diary",
    "food-details"
   ]
  },
  {
   "id": "F-07",
   "name": "Busca de alimentos TACO + Open Food Facts",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P2",
   "problem": "Encontrar rápido alimentos brasileiros e produtos de marca.",
   "fit": "Sim, combinação muito adequada ao público.",
   "implementation": "Melhor implementação do projeto.",
   "intuitive": "Sim.",
   "missingStep": "Código de barras.",
   "absence": "Registro manual de nutrientes, inviável no dia a dia.",
   "screens": [
    "log-food"
   ],
   "issues": [],
   "images": [
    "log-food"
   ]
  },
  {
   "id": "F-08",
   "name": "Refeições configuráveis",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Adaptar o diário à rotina (pré e pós-treino, ceia).",
   "fit": "Sim, combina com quem treina.",
   "implementation": "Correta.",
   "intuitive": "Sim.",
   "missingStep": "Reordenar e renomear.",
   "absence": "Baixo.",
   "screens": [
    "meals"
   ],
   "issues": [],
   "images": [
    "meals"
   ]
  },
  {
   "id": "F-09",
   "name": "Registro de exercício avulso (ExerciseDB)",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 6,
   "priority": "P2",
   "problem": "Registrar atividade fora do plano.",
   "fit": "Sim.",
   "implementation": "Catálogo e busca funcionam; inglês e calorias pouco confiáveis.",
   "intuitive": "Parcial, pela barreira de idioma.",
   "missingStep": "Edição; busca em português.",
   "absence": "Atividades fora do plano não entrariam no saldo calórico.",
   "screens": [
    "exercise",
    "log-exercise",
    "exercise-details"
   ],
   "issues": [
    "I-25",
    "I-28"
   ],
   "images": [
    "exercise-details",
    "log-exercise"
   ]
  },
  {
   "id": "F-10",
   "name": "Plano de treino semanal ou em fila",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Saber qual treino fazer hoje.",
   "fit": "Sim; o modo fila é um diferencial real.",
   "implementation": "Boa, com bug de ponteiro ao desfazer e sem editar exercícios.",
   "intuitive": "Sim, com explicação de cada modo.",
   "missingStep": "Editar e reordenar exercícios.",
   "absence": "O app vira só um registro, sem orientação.",
   "screens": [
    "workouts",
    "workout"
   ],
   "issues": [
    "I-07",
    "I-12"
   ],
   "images": [
    "workouts",
    "workout"
   ]
  },
  {
   "id": "F-11",
   "name": "Sessão de treino cronometrada",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Guiar e registrar o treino em execução.",
   "fit": "Sim.",
   "implementation": "Cronômetro e saída protegida bons; sem descanso, séries ou retomada.",
   "intuitive": "Sim.",
   "missingStep": "Timer de descanso, séries individuais, tela ligada.",
   "absence": "O registro voltaria a ser manual e depois do treino.",
   "screens": [
    "session"
   ],
   "issues": [
    "I-32"
   ],
   "images": [
    "session",
    "dialog-leave-session"
   ]
  },
  {
   "id": "F-12",
   "name": "Treino do dia no card de Exercícios",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P2",
   "problem": "Marcar exercícios feitos sem abrir a sessão.",
   "fit": "Sim.",
   "implementation": "Correta, salvo o desfazer em dia antigo.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma relevante.",
   "absence": "Quem não quer cronômetro teria de registrar avulso.",
   "screens": [
    "exercise"
   ],
   "issues": [
    "I-07"
   ],
   "images": [
    "exercise"
   ]
  },
  {
   "id": "F-13",
   "name": "Catálogo e busca de treinadores",
   "importance": "IMPORTANTE",
   "state": "Apenas visual",
   "quality": 5,
   "priority": "P2",
   "problem": "Descobrir programas de profissionais.",
   "fit": "Sim, é o diferencial aparente do produto.",
   "implementation": "Dados fixos no código.",
   "intuitive": "Sim.",
   "missingStep": "Filtros e dados reais.",
   "absence": "O produto vira um diário comum.",
   "screens": [
    "trainers",
    "trainer"
   ],
   "issues": [
    "I-22"
   ],
   "images": [
    "trainers",
    "trainer"
   ]
  },
  {
   "id": "F-14",
   "name": "Aderir a pacote de treinos",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 6,
   "priority": "P1",
   "problem": "Transformar o programa do treinador no plano do aluno.",
   "fit": "Sim, é o elo entre catálogo e treino.",
   "implementation": "Copia e distribui bem; apaga o plano próprio sem aviso e perde histórico ao sair.",
   "intuitive": "Sim.",
   "missingStep": "Progresso no programa; confirmação.",
   "absence": "O catálogo seria só leitura.",
   "screens": [
    "package",
    "package-workout"
   ],
   "issues": [
    "I-06",
    "I-33"
   ],
   "images": [
    "package",
    "package-workout"
   ]
  },
  {
   "id": "F-15",
   "name": "Comentários e notas de pacotes",
   "importance": "COMPLEMENTAR",
   "state": "Apenas visual",
   "quality": 5,
   "priority": "P3",
   "problem": "Dar prova social ao programa.",
   "fit": "Sim, quando forem reais.",
   "implementation": "Leitura de dados fixos.",
   "intuitive": "Sim.",
   "missingStep": "O aluno avaliar.",
   "absence": "Baixo nesta fase.",
   "screens": [
    "package"
   ],
   "issues": [],
   "images": [
    "package"
   ]
  },
  {
   "id": "F-16",
   "name": "Chat com o treinador",
   "importance": "QUESTIONÁVEL",
   "state": "Não funcional",
   "quality": 3,
   "priority": "P1",
   "problem": "Tirar dúvidas sobre o programa.",
   "fit": "Sim no futuro; hoje cria expectativa que não se cumpre.",
   "implementation": "Interface boa, sem a outra ponta.",
   "intuitive": "Sim.",
   "missingStep": "Respostas, notificações, status.",
   "absence": "Nenhum impacto hoje; ausência é melhor que mensagens sem resposta.",
   "screens": [
    "chat"
   ],
   "issues": [
    "I-14"
   ],
   "images": [
    "chat"
   ]
  },
  {
   "id": "F-17",
   "name": "Tarefas com repetição e subtarefas",
   "importance": "QUESTIONÁVEL",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Organizar uma rotina diária.",
   "fit": "Pouco: é genérica e não conversa com dieta, treino ou peso.",
   "implementation": "Lógica de repetição sólida, sem edição nem lembrete.",
   "intuitive": "Sim.",
   "missingStep": "Lembretes, edição, ligação com metas.",
   "absence": "Baixo para a proposta; ocupa uma aba inteira.",
   "screens": [
    "tasks",
    "add-task"
   ],
   "issues": [
    "I-11",
    "I-12",
    "I-24"
   ],
   "images": [
    "tasks",
    "add-task"
   ]
  },
  {
   "id": "F-18",
   "name": "Registro de peso e meta",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 6,
   "priority": "P0",
   "problem": "Acompanhar a principal métrica de resultado.",
   "fit": "Sim.",
   "implementation": "Diálogo bom; histórico começa fictício e o peso tem duas fontes.",
   "intuitive": "Sim.",
   "missingStep": "Registrar outra data, editar pesagem.",
   "absence": "Sem medida de progresso.",
   "screens": [
    "profile",
    "home"
   ],
   "issues": [
    "I-03",
    "I-15"
   ],
   "images": [
    "profile",
    "dialog-weight",
    "home"
   ]
  },
  {
   "id": "F-19",
   "name": "Perfil do usuário",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 5,
   "priority": "P1",
   "problem": "Ver e manter dados pessoais.",
   "fit": "Sim.",
   "implementation": "Somente leitura, exceto peso.",
   "intuitive": "Sim.",
   "missingStep": "Editar, configurações, excluir conta.",
   "absence": "Dados errados no cadastro ficariam para sempre.",
   "screens": [
    "profile"
   ],
   "issues": [
    "I-13"
   ],
   "images": [
    "profile"
   ]
  },
  {
   "id": "F-20",
   "name": "Design system Material 3 gerado do ícone",
   "importance": "IMPORTANTE",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Consistência visual e tema escuro.",
   "fit": "Sim.",
   "implementation": "Tokens gerados, relatório de contraste, 17 componentes base.",
   "intuitive": "n/a",
   "missingStep": "Documentar os componentes.",
   "absence": "Telas inconsistentes.",
   "screens": [],
   "issues": [],
   "images": [
    "home",
    "home-dark"
   ]
  },
  {
   "id": "F-21",
   "name": "Abas com swipe (6 destinos)",
   "importance": "COMPLEMENTAR",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P2",
   "problem": "Navegar entre áreas principais.",
   "fit": "Sim, mas com destinos demais.",
   "implementation": "Pager próprio com trava de swipe.",
   "intuitive": "Sim.",
   "missingStep": "Reduzir para 5.",
   "absence": "n/a",
   "screens": [],
   "issues": [
    "I-24"
   ],
   "images": [
    "home",
    "exercise"
   ]
  },
  {
   "id": "F-22",
   "name": "Entrega contínua EAS (OTA por fingerprint)",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Colocar versões de teste no celular sem loja.",
   "fit": "Sim, ideal para a fase front-first.",
   "implementation": "Android pronto; iOS não configurado.",
   "intuitive": "n/a",
   "missingStep": "Lint, typecheck e testes antes do OTA; iOS.",
   "absence": "Testes só locais.",
   "screens": [],
   "issues": [
    "I-23",
    "I-31"
   ],
   "images": [],
   "noImage": "Sem interface: é configuração de build e atualização (eas.json, .eas/workflows/preview.yml)."
  }
 ],
 "roadmap": [
  {
   "phase": 1,
   "name": "Correções críticas",
   "goal": "Tornar o front confiável para testes reais com o APK de preview.",
   "tasks": [
    {
     "id": "R-01",
     "title": "Isolar dados por conta",
     "problem": "Dados de uma conta aparecem para a próxima (I-02).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Sair e entrar com outra conta mostra diário, treinos, tarefas e peso vazios."
    },
    {
     "id": "R-02",
     "title": "Remover dados fictícios do estado do usuário",
     "problem": "Histórico de peso, passos e metas inventados (I-03, I-05).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Conta nova vê só o peso do cadastro; widget de passos oculto ou 'Conectar'; dados de exemplo só num modo demo explícito."
    },
    {
     "id": "R-03",
     "title": "Camada de repositório por domínio",
     "problem": "Contextos são o banco de dados; integração exigiria reescrita (I-20).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "Cada contexto lê e grava via interface (list/add/update/remove) com implementação local; telas não mudam."
    },
    {
     "id": "R-04",
     "title": "Persistência local",
     "problem": "Tudo some ao fechar o app (I-01, I-32).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-03",
     "done": "Reabrir o app mantém sessão, diário, plano, sessão de treino em andamento e layout do dashboard."
    },
    {
     "id": "R-05",
     "title": "Confirmar substituição do plano ao aderir a pacote",
     "problem": "Plano próprio apagado sem aviso (I-06).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Diálogo aparece sempre que algum dia da semana já tiver treino."
    },
    {
     "id": "R-06",
     "title": "Revisão de textos e normalização de e-mail no login",
     "problem": "Idioma misto e perfil não encontrado (I-08, I-09).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Login 100% pt-BR; um helper normaliza e valida e-mail em login e cadastro."
    },
    {
     "id": "R-07",
     "title": "Testes de domínio e CI",
     "problem": "Sem rede de segurança (I-16, I-17, I-31).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "jest-expo configurado; testes para tasks, workouts, foods, dashboard-widgets e taco; workflow roda lint, tsc e testes antes do OTA."
    }
   ]
  },
  {
   "phase": 2,
   "name": "Consolidação das funcionalidades essenciais",
   "goal": "Fechar o ciclo criar, editar e excluir e cumprir as promessas do cadastro.",
   "tasks": [
    {
     "id": "R-08",
     "title": "Metas calculadas do perfil",
     "problem": "2.200 kcal para todos (I-04).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-04",
     "done": "Cadastro coleta objetivo e atividade; metas de kcal e macros calculadas e ajustáveis."
    },
    {
     "id": "R-09",
     "title": "Edição de registros, treinos e tarefas",
     "problem": "Corrigir exige apagar e recriar (I-12).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-03",
     "done": "Tocar em alimento, exercício, tarefa ou exercício do treino abre a tela no modo edição."
    },
    {
     "id": "R-10",
     "title": "Editar perfil e tela de configurações",
     "problem": "Perfil fixo e sem área de conta (I-13).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-08",
     "done": "Editar nome, nascimento, altura, sexo, objetivo; configurações com metas, conta e sair."
    },
    {
     "id": "R-11",
     "title": "Peso com uma fonte de verdade",
     "problem": "Perfil e histórico divergem (I-15).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-03",
     "done": "Peso atual é sempre a última pesagem; dá para registrar e editar pesagens de outras datas."
    },
    {
     "id": "R-12",
     "title": "Histórico e progressão de treinos",
     "problem": "Registros sem retorno ao usuário.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-04",
     "done": "Tela por exercício com cargas ao longo do tempo e lista de sessões com duração e sensação."
    },
    {
     "id": "R-13",
     "title": "Fila de treinos derivada do histórico",
     "problem": "Ponteiro desalinha ao desfazer (I-07).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-07",
     "done": "Teste cobre desfazer fora de ordem; próximo treino continua correto."
    },
    {
     "id": "R-14",
     "title": "Preservar histórico ao sair de pacote",
     "problem": "Dias concluídos perdem o treino (I-33).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-03",
     "done": "Conclusões guardam snapshot ou treinos são arquivados."
    }
   ]
  },
  {
   "phase": 3,
   "name": "Melhorias de UX/UI",
   "goal": "Reduzir atrito e alinhar a navegação à proposta.",
   "tasks": [
    {
     "id": "R-15",
     "title": "Desfazer e confirmações em ações destrutivas",
     "problem": "Exclusões com um toque (I-11).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Snackbar com Desfazer em itens; diálogo para excluir treino, sair do pacote e sair da conta."
    },
    {
     "id": "R-16",
     "title": "Chat marcado como prévia",
     "problem": "Mensagens sem resposta (I-14).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Aviso visível ou resposta automática no modo demo até existir backend."
    },
    {
     "id": "R-17",
     "title": "Navegação com 5 destinos e Tarefas como hábitos",
     "problem": "6 abas e feature genérica (I-24).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-09",
     "done": "Barra com 5 abas; tarefas reposicionadas como hábitos de saúde acessíveis pelo Início."
    },
    {
     "id": "R-18",
     "title": "Busca de exercícios em português",
     "problem": "Barreira de idioma e busca inconsistente (I-25, I-26).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "—",
     "done": "Termos comuns em pt-BR encontram resultados; nomes e músculos exibidos traduzidos; busca com debounce."
    },
    {
     "id": "R-19",
     "title": "Sessão de treino completa",
     "problem": "Sem descanso, séries ou tela ligada.",
     "priority": "P2",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-04",
     "done": "Timer de descanso, registro por série com última carga, tela permanece ligada, sessão retomável."
    },
    {
     "id": "R-20",
     "title": "Atalhos no diário",
     "problem": "Registro repetitivo.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-04",
     "done": "Recentes e favoritos na busca; copiar refeição de outro dia; medidas caseiras."
    },
    {
     "id": "R-21",
     "title": "Onboarding pós-cadastro",
     "problem": "Usuário cai num dashboard sem contexto.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-08",
     "done": "Duas ou três telas explicam metas calculadas, diário e treino, com opção de pular."
    },
    {
     "id": "R-22",
     "title": "Limpeza do template",
     "problem": "Código e dependências sem uso (I-18, I-19).",
     "priority": "P3",
     "impact": "Baixo",
     "complexity": "Baixa",
     "deps": "R-07",
     "done": "Componentes e pacotes não usados removidos; helpers unificados; README do projeto."
    }
   ]
  },
  {
   "phase": 4,
   "name": "Recursos adicionais e diferenciais",
   "goal": "Aumentar retenção e reforçar o diferencial do treinador.",
   "tasks": [
    {
     "id": "R-23",
     "title": "Leitor de código de barras",
     "problem": "Produtos industrializados exigem busca por nome.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-20",
     "done": "Câmera lê EAN e abre o produto do Open Food Facts."
    },
    {
     "id": "R-24",
     "title": "Lembretes locais",
     "problem": "Treinos e hábitos dependem de o usuário lembrar.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-17",
     "done": "Lembrete de treino do dia, refeições e hábitos configurável nas configurações."
    },
    {
     "id": "R-25",
     "title": "Passos via Health Connect / HealthKit",
     "problem": "Widget de passos sem fonte.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Alta",
     "deps": "R-02",
     "done": "Passos reais no dashboard em build de desenvolvimento; permissão explicada."
    },
    {
     "id": "R-26",
     "title": "Relatório semanal",
     "problem": "Sem visão de tendência.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-12",
     "done": "Semana com peso, média de kcal, treinos feitos versus planejados."
    },
    {
     "id": "R-27",
     "title": "Progresso no programa e avaliação do pacote",
     "problem": "Pacote sem acompanhamento nem prova social real.",
     "priority": "P3",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-14",
     "done": "Mostra semana atual do programa; ao concluir, aluno avalia."
    }
   ]
  },
  {
   "phase": 5,
   "name": "Preparação para escala e produção",
   "goal": "Integrar o backend e cumprir requisitos de loja e privacidade.",
   "tasks": [
    {
     "id": "R-28",
     "title": "Backend, autenticação real e sessão segura",
     "problem": "Login simulado (I-10).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Alta",
     "deps": "R-03",
     "done": "IS_AUTH_MOCKED removido; idToken verificado no servidor; token em expo-secure-store com renovação; recuperação de senha."
    },
    {
     "id": "R-29",
     "title": "Sincronização offline-first",
     "problem": "Dados só no aparelho.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Alta",
     "deps": "R-04, R-28",
     "done": "Registros feitos offline sincronizam ao reconectar sem duplicar."
    },
    {
     "id": "R-30",
     "title": "Privacidade e LGPD",
     "problem": "Dados de saúde sem consentimento nem exclusão.",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-28",
     "done": "Consentimento no cadastro, política acessível, exportar dados e excluir conta dentro do app."
    },
    {
     "id": "R-31",
     "title": "Catálogo de treinadores e chat pelo backend",
     "problem": "Catálogo fixo e chat local (I-14, I-22).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Alta",
     "deps": "R-28",
     "done": "Treinadores e pacotes vindos da API com ids estáveis; chat em tempo real com notificação push."
    },
    {
     "id": "R-32",
     "title": "Monitoramento e analytics",
     "problem": "Erros em OTA invisíveis.",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Crashes e erros de API reportados com versão do update; eventos de funil do cadastro e do registro."
    },
    {
     "id": "R-33",
     "title": "Configuração iOS e workflow completo",
     "problem": "iOS não configurado (I-23).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-28",
     "done": "bundleIdentifier, URL scheme do Google e job iOS no workflow EAS."
    }
   ]
  }
 ],
 "counts": {
  "screens": 23,
  "dialogs": 5,
  "features": 22,
  "issues": 33,
  "hypotheses": 3,
  "tasks": 33,
  "missing": 21
 }
};
