/* Dados da auditoria. Gerado a partir das fontes; não editar à mão. */
window.AUDIT = {
 "meta": {
  "project": "Treina",
  "date": "2026-11-12",
  "commit": "25f3a9b",
  "branchAnalyzed": "main",
  "previousAudit": "5fd90b1 (02/11/2026)",
  "linesOfCode": 18084,
  "sourceFiles": 154,
  "routeFiles": 35,
  "commits": 33,
  "phase": "O objetivo declarado é ter um front funcional antes de depender do backend. Na prática, a main já tem os dois caminhos: o modo demo, com dados em memória e sem servidor, e o Supabase, com autenticação e persistência reais, escolhido por variáveis de ambiente. A auditoria avalia o front nos dois modos e mede separadamente a distância até a produção.",
  "notVerified": [
   "O app não foi executado em Android ou iOS nesta auditoria. As capturas vêm da versão web exportada (expo export -p web) em modo demo, com dados criados pela interface.",
   "O Supabase real não foi acessado: as migrações, as políticas RLS e o teste supabase/tests/rls.sql foram lidos, mas não executados contra um banco.",
   "O fluxo real de e-mail (confirmação e recuperação de senha) e o Google Sign-In não puderam ser testados de ponta a ponta. As telas foram abertas diretamente pelo endereço.",
   "Desempenho em aparelho não foi medido.",
   "Continua sem documento de produto ou público-alvo no repositório; o posicionamento foi inferido do código."
  ],
  "checks": [
   {
    "name": "TypeScript (tsc --noEmit)",
    "result": "Passa",
    "detail": "0 erros com o expo-env.d.ts gerado pelo expo start (o arquivo está no .gitignore, então um clone novo falha até gerá-lo)."
   },
   {
    "name": "ESLint (expo lint)",
    "result": "1 erro",
    "detail": "O mesmo da auditoria anterior: src/hooks/use-color-scheme.web.ts:11, setState síncrono em useEffect."
   },
   {
    "name": "Testes automatizados",
    "result": "Só SQL",
    "detail": "supabase/tests/rls.sql verifica as políticas RLS com duas contas numa transação desfeita no fim. Nenhum teste JavaScript nem test runner."
   },
   {
    "name": "CI de qualidade",
    "result": "Inexistente",
    "detail": ".eas/workflows/preview.yml publica OTA ou gera build Android a cada push na main, sem lint, typecheck, testes ou teste do APK."
   }
  ]
 },
 "stack": [
  {
   "group": "Plataforma",
   "items": [
    "Expo SDK 58 (expo ~58.0.23)",
    "React Native 0.88.1 · React 19.3",
    "TypeScript 6 estrito",
    "React Compiler e typed routes habilitados"
   ]
  },
  {
   "group": "Navegação",
   "items": [
    "Expo Router 58, 35 arquivos de rota",
    "Stack.Protected separa as pilhas com e sem sessão",
    "Abas próprias com swipe (sliding-tabs)"
   ]
  },
  {
   "group": "UI",
   "items": [
    "Design system Material 3 gerado do ícone",
    "17 componentes base em components/ui (inclui password-field)",
    "lucide-react-native, react-native-svg, Reanimated 4 + Worklets, expo-image"
   ]
  },
  {
   "group": "Dados",
   "items": [
    "9 contextos de domínio sobre useUserStore (estado por conta + fila de salvamento)",
    "Repositórios por domínio: local (memória) ou Supabase (src/data)",
    "expo-sqlite guarda a sessão no aparelho; expo-crypto gera ids"
   ]
  },
  {
   "group": "Backend",
   "items": [
    "Supabase: Auth (e-mail, Google, PKCE), Postgres com 18 tabelas e RLS, Realtime no chat",
    "5 migrações versionadas, seed do catálogo e teste SQL de RLS"
   ]
  },
  {
   "group": "Integrações",
   "items": [
    "ExerciseDB (catálogo de exercícios)",
    "Open Food Facts (produtos brasileiros)",
    "TACO embarcada (597 alimentos)",
    "Google Sign-In",
    "Fotos de exemplo em randomuser.me"
   ]
  },
  {
   "group": "Entrega",
   "items": [
    "EAS Build (development, preview APK, production)",
    "EAS Update com runtime por fingerprint",
    "Workflow: OTA ou build Android a cada push na main"
   ]
  }
 ],
 "scores": [
  {
   "key": "tech",
   "label": "Qualidade técnica",
   "score": 7.5,
   "why": "A camada nova é sólida: repositórios com contrato claro (src/data/types.ts), store por conta com fila ordenada de salvamento e nova tentativa (use-user-store.ts), fluxos de autenticação completos e tratados, schema com checks e RLS testado em SQL. Continua sem nenhum teste JavaScript, com o erro de lint antigo e helpers duplicados.",
   "problems": [
    "Zero testes JavaScript (I-16)",
    "parseNumber duplicado e initials/getInitials (I-18)",
    "Fallback silencioso para 82 kg nos cálculos (N-02)"
   ],
   "improve": [
    "jest-expo com testes de src/lib e de use-user-store",
    "Unificar parsing e iniciais em src/lib",
    "Bloquear o cálculo de kcal sem peso real"
   ]
  },
  {
   "key": "arch",
   "label": "Arquitetura",
   "score": 7.5,
   "why": "O principal problema da auditoria anterior foi resolvido: telas → contextos → useUserStore → repositórios (local ou Supabase), com dados isolados por conta. Restam 11 providers aninhados com dependência pela ordem, um carregamento tudo-ou-nada e o histórico inteiro carregado no login.",
   "problems": [
    "Carregamento bloqueante de 9 stores (N-05)",
    "Histórico inteiro carregado no login (N-04)",
    "Dependência implícita entre providers (I-21)"
   ],
   "improve": [
    "Carregar cada domínio sob demanda e por período",
    "Deixar falhas de um domínio não bloquearem o app",
    "Compor os providers num único ponto"
   ]
  },
  {
   "key": "ux",
   "label": "UX/UI",
   "score": 7,
   "why": "Textos agora consistentes em pt-BR, fluxos de conta completos (confirmação, reenvio com contagem, recuperação de senha, aviso de senha alterada), aviso honesto no chat e registro de peso com data. Perde por exclusões sem confirmação, 6 abas, metas e passos fictícios exibidos como reais e ausência de onboarding e de edição de perfil.",
   "problems": [
    "Exclusões sem confirmação nem desfazer (I-11)",
    "Metas e passos fictícios (I-04, I-05)",
    "Sem completar perfil após Google (N-01)",
    "6 abas (I-24)"
   ],
   "improve": [
    "Snackbar com Desfazer",
    "Metas calculadas e passos ocultos até haver fonte",
    "Tela de completar perfil",
    "5 abas"
   ]
  },
  {
   "key": "features",
   "label": "Funcionalidades",
   "score": 7,
   "why": "Os pilares estão de pé com dados persistidos: conta, diário alimentar, plano de treino e sessão, treinadores com pacotes e chat em tempo real, tarefas, peso com histórico. Faltam edição de registros, histórico de treinos e metas pessoais.",
   "problems": [
    "Sem edição de registros (I-12)",
    "Metas fixas (I-04)",
    "Chat só de ida (I-14)"
   ],
   "improve": [
    "Editar alimento, exercício e exercício do treino",
    "Metas calculadas",
    "Histórico de cargas"
   ]
  },
  {
   "key": "complete",
   "label": "Completude",
   "score": 5.5,
   "why": "Persistência, autenticação e isolamento de dados foram fechados. Continuam abertos: edição, perfil editável, onboarding, configurações, exclusão de conta, histórico e o lado do treinador.",
   "problems": [
    "Perfil não editável e sem completar após Google (I-13, N-01)",
    "Sem configurações nem exclusão de conta",
    "Mudanças pendentes se perdem ao fechar (N-03)"
   ],
   "improve": [
    "Fechar criar → editar → excluir em todos os domínios",
    "Configurações com conta e privacidade"
   ]
  },
  {
   "key": "security",
   "label": "Segurança",
   "score": 6.5,
   "why": "Autenticação real com PKCE, chave publicável no app, RLS em todas as tabelas do usuário com teste SQL, catálogo só leitura, saída de todos os aparelhos ao trocar a senha e e-mail de recuperação que não revela se a conta existe. Faltam consentimento e exclusão de conta (dados de saúde), e a configuração de ambiente não é versionada.",
   "problems": [
    "Sem consentimento LGPD nem exclusão de conta (M-04)",
    "Variáveis do EAS fora do repositório (N-06)"
   ],
   "improve": [
    "Consentimento no cadastro e exclusão de conta no app",
    "Documentar e validar as variáveis no build"
   ]
  },
  {
   "key": "perf",
   "label": "Performance",
   "score": 7,
   "why": "Mantém as boas decisões (TACO sob demanda, debounce e cache, GIFs sem autoplay, React Compiler) e mostra mudanças antes de salvar. Mas o login baixa todo o histórico de todos os domínios em páginas (selectAll), o que cresce sem limite com o uso. Nada foi medido em aparelho.",
   "problems": [
    "Histórico inteiro no login (N-04)",
    "Filtros por render sobre o histórico (H-01)"
   ],
   "improve": [
    "Carregar por período (ex.: últimos 30 dias) e sob demanda",
    "Medir em aparelho de entrada"
   ]
  },
  {
   "key": "scale",
   "label": "Escalabilidade",
   "score": 5.5,
   "why": "Postgres com RLS e índices de chave estrangeira escala bem para muitos usuários. O cliente não: carrega tudo da conta no login e mantém a fila de salvamento só em memória. O catálogo e o chat dependem de um lado do treinador que não existe.",
   "problems": [
    "Carregamento total por conta (N-04)",
    "Sem modo offline nem fila persistente (N-03)"
   ],
   "improve": [
    "Paginação por período",
    "Fila de salvamento persistida no aparelho"
   ]
  },
  {
   "key": "maint",
   "label": "Manutenibilidade",
   "score": 7,
   "why": "Código morto do template removido, comentários que explicam decisões e referenciam problemas da auditoria, contratos de repositório claros. Pesam a falta de testes, o componente de dashboard com 718 linhas e a dependência de variáveis de ambiente não documentadas no build.",
   "problems": [
    "Sem testes (I-16)",
    "draggable-dashboard.tsx com 718 linhas (I-29)"
   ],
   "improve": [
    "Testes de domínio e de repositório local",
    "Extrair o cálculo de soltura do dashboard"
   ]
  },
  {
   "key": "prod",
   "label": "Prontidão para produção",
   "score": 4.5,
   "why": "O backend existe e os crashes de abertura no Android foram corrigidos, mas o crash do ExpoSQLite chegou ao aparelho por OTA sem nenhum teste antes, e ainda faltam testes automatizados, CI antes da publicação, consentimento e exclusão de conta, configuração iOS e monitoramento de erros.",
   "problems": [
    "OTA publicada sem verificação (N-07)",
    "Sem LGPD (M-04)",
    "iOS não configurado (I-23)"
   ],
   "improve": [
    "Gate de CI e smoke test do APK antes do OTA",
    "Monitoramento de erros",
    "Requisitos de loja"
   ]
  }
 ],
 "overall": {
  "score": 6.5,
  "frontPhaseScore": 6.9,
  "previousScore": 5.2,
  "maturity": "MVP funcional",
  "maturityScale": [
   "Protótipo",
   "MVP inicial",
   "MVP funcional",
   "Produto em evolução",
   "Produto pronto para produção",
   "Produto maduro"
  ],
  "maturityWhy": "Subiu um nível desde a auditoria anterior. Os fluxos principais funcionam com conta real, dados persistidos e isolados por usuário, e o modo demo continua permitindo usar o front sem servidor. Ainda não é um produto em evolução porque falta fechar ciclos básicos (editar registros, editar e completar o perfil), metas e passos seguem fictícios, não há testes nem verificação antes das atualizações, e o último build Android fechava ao abrir até o commit 25f3a9b.",
  "frontPhaseWhy": "Média de qualidade técnica, arquitetura, UX/UI, funcionalidades, completude, performance e manutenibilidade, sem contar segurança, escalabilidade e prontidão, que medem a distância até a produção."
 },
 "architecture": {
  "layers": [
   {
    "name": "Rotas (src/app)",
    "role": "35 arquivos: telas, layouts e o ErrorBoundary raiz. Leem contextos e chamam ações.",
    "files": 35
   },
   {
    "name": "Componentes (src/components)",
    "role": "UI reutilizável: ui/, auth/, dashboard/, diary/, exercise/, trainers/, tasks/, weight/, sliding-tabs/, save-error-banner.",
    "files": 58
   },
   {
    "name": "Contextos (src/context)",
    "role": "session + 9 domínios + signup. Cada domínio usa useUserStore e chama os repositórios.",
    "files": 11
   },
   {
    "name": "Dados (src/data)",
    "role": "useUserStore, contratos de repositório, implementação local (memória) e Supabase, carregamento do perfil, tipos gerados do banco.",
    "files": 19
   },
   {
    "name": "Domínio e serviços (src/lib)",
    "role": "Regras puras (tarefas, treinos, refeições, peso), clientes ExerciseDB e Open Food Facts, TACO, auth, cliente Supabase.",
    "files": 21
   },
   {
    "name": "Supabase (supabase/)",
    "role": "Migrações, RLS, trigger de perfil, refeições padrão, realtime do chat, seed e teste SQL.",
    "files": 8
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
   "DashboardLayoutProvider"
  ],
  "providerDeps": [
   {
    "from": "Todos os domínios",
    "to": "SessionProvider",
    "why": "useUserStore é chaveado pelo id da conta"
   },
   {
    "from": "WeightLogProvider",
    "to": "SessionProvider",
    "why": "logWeight atualiza o peso do perfil na tela"
   },
   {
    "from": "CoachingProvider",
    "to": "WorkoutPlanProvider",
    "why": "aderir importa treinos e define a semana"
   },
   {
    "from": "CoachingProvider",
    "to": "CatalogProvider",
    "why": "busca o pacote e o treinador"
   }
  ],
  "domains": [
   {
    "name": "Conta e perfil",
    "context": "session.tsx, signup.tsx",
    "lib": "auth.ts, google-auth.ts, profile.ts, supabase.ts, data/profile.ts",
    "screens": [
     "login",
     "signup/*",
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
     "log-food/*",
     "meals"
    ]
   },
   {
    "name": "Exercício avulso",
    "context": "exercise-log.tsx",
    "lib": "exercises.ts, exercisedb.ts, data/supabase/exercise-log.ts",
    "screens": [
     "(tabs)/exercise",
     "log-exercise/*"
    ]
   },
   {
    "name": "Plano de treino",
    "context": "workout-plan.tsx",
    "lib": "workouts.ts, data/supabase/workout-plan.ts",
    "screens": [
     "workouts/*",
     "workout-session"
    ]
   },
   {
    "name": "Treinadores",
    "context": "catalog.tsx, coaching.tsx, chat.tsx",
    "lib": "trainers.ts, chat.ts, data/supabase/catalog.ts, coaching.ts, chat.ts",
    "screens": [
     "(tabs)/trainers",
     "trainer/*",
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
    "note": "Auth com PKCE e sessão no expo-sqlite; Postgres com RLS; Realtime no chat. Chave publicável no app; service role nunca usada."
   },
   {
    "name": "ExerciseDB",
    "used": "src/lib/exercisedb.ts",
    "note": "API gratuita sem SLA, nomes só em inglês, MET estimado pelo nome."
   },
   {
    "name": "Open Food Facts",
    "used": "src/lib/openfoodfacts.ts",
    "note": "Produtos do Brasil; valores impossíveis descartados."
   },
   {
    "name": "TACO embarcada",
    "used": "src/lib/taco.ts",
    "note": "597 alimentos offline."
   },
   {
    "name": "Google Sign-In",
    "used": "src/lib/google-auth.ts",
    "note": "idToken enviado ao Supabase (signInWithIdToken). Exige os client IDs no ambiente; iOS ainda com URL scheme de exemplo."
   },
   {
    "name": "randomuser.me",
    "used": "supabase/seed.sql, src/lib/trainers.ts",
    "note": "Fotos de pessoas fictícias no catálogo de exemplo."
   }
  ],
  "pros": [
   "Camada de repositório com contrato por domínio e duas implementações (memória e Supabase), escolhida por EXPO_PUBLIC_DATA_SOURCE.",
   "useUserStore: dados de uma conta nunca aparecem para outra, mudanças aparecem na hora e são salvas em ordem, com banner de nova tentativa.",
   "Schema com checks de domínio (pesos 30–400 kg, altura 100–250 cm, gramas > 0) e RLS em todas as tabelas, verificado por supabase/tests/rls.sql.",
   "Fluxos de conta completos e cuidadosos: troca de código uma única vez, recuperação que não loga o app até a senha nova, saída global após trocar a senha.",
   "Perfil com data de nascimento (idade sempre correta) e peso atual derivado da última pesagem.",
   "Modo demo preserva o objetivo de front funcional sem servidor."
  ],
  "cons": [
   "O app só abre depois que os 9 domínios carregam; uma falha em qualquer um bloqueia tudo.",
   "O login baixa o histórico completo de alimentos, exercícios, pesagens e chat.",
   "A fila de salvamento fica só em memória: mudanças pendentes se perdem se o app fechar.",
   "Ainda sem testes JavaScript e sem CI antes de publicar OTA.",
   "11 providers aninhados que dependem da ordem.",
   "Parte da configuração (variáveis do EAS, client IDs do Google) fica fora do repositório e falha só em tempo de execução."
  ]
 },
 "evolution": [
  {
   "id": "I-01",
   "title": "Nenhuma persistência local",
   "status": "Parcial",
   "note": "Resolvido no modo Supabase. No modo demo/local os dados ainda ficam só em memória."
  },
  {
   "id": "I-02",
   "title": "Dados não isolados por conta",
   "status": "Resolvido",
   "note": "useUserStore recomeça do vazio ao trocar de conta; repositórios locais por usuário."
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
   "note": "Meta base de 2.200 kcal, macros e 400 kcal de exercício continuam em dashboard-data.ts."
  },
  {
   "id": "I-05",
   "title": "Passos fictícios",
   "status": "Aberto",
   "note": "6.840 passos para todos (index.tsx:37)."
  },
  {
   "id": "I-06",
   "title": "Aderir apaga o plano sem aviso",
   "status": "Aberto",
   "note": "O diálogo só aparece quando já existe outro pacote."
  },
  {
   "id": "I-07",
   "title": "Desfazer conclusão antiga desalinha a fila",
   "status": "Aberto",
   "note": "undoCompletion ainda recua o ponteiro sempre."
  },
  {
   "id": "I-08",
   "title": "Login em inglês",
   "status": "Resolvido",
   "note": "Textos em pt-BR, 'Esqueci minha senha' incluído."
  },
  {
   "id": "I-09",
   "title": "E-mail não normalizado",
   "status": "Resolvido",
   "note": "normalizeEmail usado em login, cadastro e recuperação."
  },
  {
   "id": "I-10",
   "title": "Autenticação simulada",
   "status": "Resolvido",
   "note": "Supabase Auth real; o modo demo é opcional."
  },
  {
   "id": "I-11",
   "title": "Exclusões sem confirmação",
   "status": "Aberto",
   "note": "Excluir treino, sair do pacote, remover alimento e tarefa seguem com um toque."
  },
  {
   "id": "I-12",
   "title": "Registros não editáveis",
   "status": "Aberto",
   "note": "Repositórios de alimento e exercício só têm add/remove."
  },
  {
   "id": "I-13",
   "title": "Perfil não editável",
   "status": "Parcial",
   "note": "Data de nascimento substituiu a idade fixa, mas nada além do peso pode ser editado."
  },
  {
   "id": "I-14",
   "title": "Chat sem resposta",
   "status": "Parcial",
   "note": "Tempo real e aviso visível; o treinador ainda não tem como responder."
  },
  {
   "id": "I-15",
   "title": "Duas fontes de peso",
   "status": "Resolvido",
   "note": "Peso atual = última pesagem (data/profile.ts)."
  },
  {
   "id": "I-16",
   "title": "Nenhum teste",
   "status": "Parcial",
   "note": "Teste SQL de RLS; nenhum teste JavaScript."
  },
  {
   "id": "I-17",
   "title": "Erro de lint",
   "status": "Aberto",
   "note": "Mesmo erro em use-color-scheme.web.ts."
  },
  {
   "id": "I-18",
   "title": "Helpers duplicados",
   "status": "Parcial",
   "note": "EMAIL_PATTERN e createId unificados; parseNumber e initials continuam duplicados."
  },
  {
   "id": "I-19",
   "title": "Código sem uso",
   "status": "Resolvido",
   "note": "Removido no a645770; nenhum módulo sem importador."
  },
  {
   "id": "I-20",
   "title": "Sem camada de dados",
   "status": "Resolvido",
   "note": "src/data com contratos e duas implementações."
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
   "status": "Parcial",
   "note": "Vem do banco no modo Supabase; o modo local usa trainers.ts e as fotos seguem de randomuser.me."
  },
  {
   "id": "I-23",
   "title": "iOS não configurado",
   "status": "Aberto",
   "note": "iosUrlScheme de exemplo e sem bundleIdentifier."
  },
  {
   "id": "I-24",
   "title": "Seis abas",
   "status": "Aberto",
   "note": "Mesmas 6 abas."
  },
  {
   "id": "I-25",
   "title": "Busca de exercícios em inglês",
   "status": "Parcial",
   "note": "Filtros por categoria adicionados; busca continua só ao enviar e em inglês."
  },
  {
   "id": "I-26",
   "title": "Ícone errado em Tentar novamente",
   "status": "Aberto",
   "note": "log-exercise/index.tsx ainda usa Plus."
  },
  {
   "id": "I-27",
   "title": "Datas futuras inconsistentes",
   "status": "Aberto",
   "note": "Diário e exercícios avulsos aceitam o futuro; o treino não."
  },
  {
   "id": "I-28",
   "title": "0 kcal sem MET",
   "status": "Aberto",
   "note": "Visível na captura de exercício manual."
  },
  {
   "id": "I-29",
   "title": "Dashboard com 714 linhas",
   "status": "Aberto",
   "note": "Agora 718 linhas."
  },
  {
   "id": "I-30",
   "title": "Gramas sem limite",
   "status": "Aberto",
   "note": "App aceita qualquer valor > 0; o banco aceita até 999.999,9 g."
  },
  {
   "id": "I-31",
   "title": "Typecheck depende de arquivo gerado",
   "status": "Aberto",
   "note": "expo-env.d.ts continua no .gitignore."
  },
  {
   "id": "I-32",
   "title": "Sessão de treino perdida ao fechar",
   "status": "Aberto",
   "note": "Estado só na tela."
  },
  {
   "id": "I-33",
   "title": "Sair do pacote apaga o histórico",
   "status": "Aberto",
   "note": "leavePackage remove os treinos; conclusões perdem a referência."
  }
 ],
 "issues": [
  {
   "id": "N-01",
   "title": "Quem entra com Google nunca informa os dados corporais",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Conta",
   "evidence": "supabase/migrations/20261102000300_new_user_profile.sql:3-6 ('the app asks for the rest later'); nenhuma tela de completar perfil em src/app; perfil não editável (src/app/(tabs)/profile.tsx)",
   "detail": "O trigger cria o perfil só com o nome para contas do Google. Nascimento, sexo, altura e peso ficam nulos e não há fluxo para preencher: o perfil mostra traços e qualquer cálculo usa valores de exemplo.",
   "fix": "Tela de completar perfil logo após o primeiro login (reaproveitando signup/details) e edição de perfil."
  },
  {
   "id": "N-02",
   "title": "Cálculo de kcal usa 82 kg de exemplo quando falta o peso",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Regras",
   "evidence": "MOCK_PROFILE.weightKg como fallback em app/log-exercise/[id].tsx:42, app/workout-session.tsx:74, components/exercise/workout-card.tsx:43, components/weight/weight-dialog.tsx:41",
   "detail": "Sem pesagem (caso de N-01), as calorias de cardio são estimadas para uma pessoa de 82 kg sem nenhum aviso, e o saldo calórico do dia fica errado.",
   "fix": "Exigir o peso antes de estimar, ou mostrar a estimativa como indisponível com atalho para registrar o peso."
  },
  {
   "id": "N-03",
   "title": "Mudanças ainda não salvas se perdem ao fechar o app",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Dados",
   "evidence": "src/data/use-user-store.ts: a fila (queue) é um useRef em memória",
   "detail": "Sem internet ou com o servidor lento, o app mostra a mudança e guarda o salvamento na fila. Se o app for fechado antes, a mudança some sem aviso. Também não há modo offline de leitura.",
   "fix": "Persistir a fila no expo-sqlite e reenviar ao abrir; avisar quando houver pendências."
  },
  {
   "id": "N-04",
   "title": "Login baixa todo o histórico da conta",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Performance",
   "evidence": "src/data/supabase/client.ts selectAll; food-log.ts, exercise-log.ts, weight.ts e chat.ts carregam todas as linhas do usuário",
   "detail": "Cada abertura percorre todas as páginas de alimentos, exercícios, pesagens e mensagens. Com meses de uso, a abertura fica lenta e consome dados móveis.",
   "fix": "Carregar uma janela (ex.: 30 dias) e buscar o resto sob demanda ao navegar no seletor de dia."
  },
  {
   "id": "N-05",
   "title": "Uma falha em qualquer domínio bloqueia o app inteiro",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Resiliência",
   "evidence": "src/hooks/use-user-data-status.ts; src/app/(tabs)/_layout.tsx mostra a tela de erro se qualquer store falhar",
   "detail": "Se o chat ou o catálogo não carregarem, o diário e o treino também ficam inacessíveis.",
   "fix": "Bloquear só no perfil; cada aba mostra o próprio estado de carregamento e erro."
  },
  {
   "id": "N-06",
   "title": "Configuração de ambiente fora do repositório",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Entrega",
   "evidence": ".env.example lista 7 variáveis; o build do EAS depende das variáveis cadastradas no expo.dev; o .env.local do autor não tinha os client IDs do Google",
   "detail": "Um build sem as variáveis abre normalmente mas falha no login (Supabase não configurado) ou no Google. Nada valida isso antes de publicar.",
   "fix": "Checagem das variáveis obrigatórias no início do build ou do app, e documentação no README."
  },
  {
   "id": "N-07",
   "title": "OTA publicada sem verificação levou um crash ao aparelho",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Entrega",
   "evidence": ".eas/workflows/preview.yml (OTA a cada push na main); logcat do autor de 03/11 a 05/11 com o mesmo r8-map-id e 'Cannot find native module ExpoSQLite'; corrigido em 25f3a9b",
   "detail": "O mesmo binário recebeu várias atualizações de JavaScript que dependiam de um módulo nativo incompatível. A causa (runtime do expo-modules-core) foi corrigida, mas o processo continua publicando sem lint, testes ou abertura do app.",
   "fix": "Job de lint, typecheck e testes antes do update, e um teste de fumaça do APK (abrir e chegar ao login) antes de liberar para o canal."
  },
  {
   "id": "N-08",
   "title": "Texto de recuperação fala em código, o fluxo usa link",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/forgot-password/index.tsx: 'Não foi possível enviar o código'",
   "detail": "As outras telas do fluxo falam em link.",
   "fix": "Trocar por 'Não foi possível enviar o link'."
  },
  {
   "id": "N-09",
   "title": "Reenviar confirmação não checa o modo demo nem a configuração",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Conta",
   "evidence": "src/context/session.tsx resendConfirmation (sem IS_AUTH_MOCKED nem assertConfigured, ao contrário das outras ações)",
   "detail": "Sem chaves ou no modo demo, a tela de confirmação mostra um erro genérico em vez da mensagem clara usada nas outras ações.",
   "fix": "Aplicar as mesmas guardas de requestPasswordReset."
  },
  {
   "id": "I-04",
   "title": "Metas fixas apesar de o cadastro prometer cálculo",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Metas",
   "evidence": "src/lib/dashboard-data.ts; src/app/signup/details.tsx ('Usamos esses dados para estimar suas calorias')",
   "detail": "Continua igual: 2.200 kcal para todos, mesmo com nascimento, sexo, altura e peso no banco.",
   "fix": "Calcular TMB × atividade ± objetivo e permitir ajuste."
  },
  {
   "id": "I-05",
   "title": "Passos fictícios exibidos como reais",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Dashboard",
   "evidence": "src/app/(tabs)/index.tsx:37-38 (MOCK_DASHBOARD)",
   "detail": "6.840 passos para qualquer conta, sem indicação de exemplo.",
   "fix": "Ocultar ou mostrar 'Conectar passos'."
  },
  {
   "id": "I-06",
   "title": "Aderir a um pacote apaga o plano semanal sem aviso",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/context/coaching.tsx:63-71; src/app/trainer/package/[id].tsx:61-63",
   "detail": "Sem pacote anterior, os dias definidos pelo usuário são sobrescritos sem diálogo.",
   "fix": "Confirmar sempre que houver dias com treino."
  },
  {
   "id": "I-11",
   "title": "Exclusões sem confirmação nem desfazer",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/workouts/[id].tsx:49; src/app/trainer/package/[id].tsx:168; meal-section.tsx; exercise-list.tsx:61; task-section.tsx",
   "detail": "Agora os dados são permanentes no servidor, o que torna o toque acidental mais grave.",
   "fix": "Snackbar com Desfazer e diálogo nas ações grandes."
  },
  {
   "id": "I-12",
   "title": "Registros não podem ser editados",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Funcionalidade",
   "evidence": "src/data/types.ts: FoodLogRepository e ExerciseLogRepository só têm add/remove; workout sem edição de exercício",
   "detail": "Corrigir uma quantidade exige apagar e recriar.",
   "fix": "Adicionar update e reaproveitar as telas de criação."
  },
  {
   "id": "I-13",
   "title": "Perfil não editável",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Conta",
   "evidence": "src/app/(tabs)/profile.tsx (só peso e meta)",
   "detail": "Nome, nascimento, sexo e altura ficam como no cadastro ou nulos (N-01).",
   "fix": "Tela de edição de perfil."
  },
  {
   "id": "I-16",
   "title": "Sem testes JavaScript",
   "severity": "alto",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "package.json sem test runner; só supabase/tests/rls.sql",
   "detail": "A camada nova (fila de salvamento, troca de conta, fluxos de auth) tem casos de borda sem cobertura.",
   "fix": "jest-expo: src/lib, useUserStore e repositório local."
  },
  {
   "id": "I-07",
   "title": "Desfazer conclusão antiga desalinha a fila",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinos",
   "evidence": "src/context/workout-plan.tsx:225-237",
   "detail": "Sem mudança desde a auditoria anterior.",
   "fix": "Derivar o próximo treino da última conclusão."
  },
  {
   "id": "I-33",
   "title": "Sair do pacote apaga o histórico ligado a ele",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinadores",
   "evidence": "src/context/coaching.tsx:58-61",
   "detail": "Agora apaga também no servidor.",
   "fix": "Arquivar treinos ou guardar snapshot na conclusão."
  },
  {
   "id": "I-28",
   "title": "Calorias 0 sem MET",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Regras",
   "evidence": "app/workout-session.tsx:145; components/exercise/workout-card.tsx:59",
   "detail": "Exercícios manuais entram com 0 kcal (visível na captura).",
   "fix": "MET padrão por categoria ou intensidade informada."
  },
  {
   "id": "I-32",
   "title": "Sessão de treino perdida ao fechar o app",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Treinos",
   "evidence": "src/app/workout-session.tsx:77-78",
   "detail": "Tempo e séries ficam só no estado da tela.",
   "fix": "Persistir a sessão e oferecer retomar."
  },
  {
   "id": "I-24",
   "title": "Seis destinos na barra de navegação",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/constants/tabs.ts",
   "detail": "O Material 3 prevê de 3 a 5 destinos.",
   "fix": "Levar Tarefas para o Início ou o Perfil para o cabeçalho."
  },
  {
   "id": "I-23",
   "title": "Configuração iOS incompleta",
   "severity": "médio",
   "kind": "comprovado",
   "area": "Entrega",
   "evidence": "app.json:38 (iosUrlScheme de exemplo); sem ios.bundleIdentifier",
   "detail": "Sem mudança.",
   "fix": "bundleIdentifier, URL scheme e job iOS."
  },
  {
   "id": "I-25",
   "title": "Busca de exercícios em inglês e só ao enviar",
   "severity": "médio",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/log-exercise/index.tsx:204, 257",
   "detail": "Os filtros por categoria ajudam, mas a busca continua exigindo inglês.",
   "fix": "Termos em pt-BR mapeados e debounce."
  },
  {
   "id": "I-21",
   "title": "Dependência implícita entre 11 providers",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Arquitetura",
   "evidence": "src/app/_layout.tsx",
   "detail": "Reordenar quebra em execução.",
   "fix": "Provider de composição."
  },
  {
   "id": "I-29",
   "title": "Dashboard com 718 linhas",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "src/components/dashboard/draggable-dashboard.tsx",
   "detail": "Gestos, geometria, lixeira e acessibilidade juntos.",
   "fix": "Extrair o cálculo de soltura (testável)."
  },
  {
   "id": "I-18",
   "title": "Helpers ainda duplicados",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Código",
   "evidence": "parseNumber em log-food/[id].tsx:19 e log-exercise/[id].tsx:33; initials (trainers.ts:673) e getInitials (profile.ts:85)",
   "detail": "Menos duplicação que antes, mas persiste.",
   "fix": "Mover para src/lib."
  },
  {
   "id": "I-27",
   "title": "Registro em datas futuras inconsistente",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Regras",
   "evidence": "day-selector sem limite; workout-card bloqueia (canLog)",
   "detail": "Sem mudança.",
   "fix": "Definir a regra e aplicar igual."
  },
  {
   "id": "I-30",
   "title": "Quantidade de alimento sem limite realista",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Validação",
   "evidence": "src/app/log-food/[id].tsx:46; schema: grams numeric(7,1)",
   "detail": "Aceita 99.999 g.",
   "fix": "Limite e aviso."
  },
  {
   "id": "I-26",
   "title": "Ícone '+' em Tentar novamente",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "UX",
   "evidence": "src/app/log-exercise/index.tsx:273-275",
   "detail": "Sem mudança.",
   "fix": "RotateCw."
  },
  {
   "id": "I-17",
   "title": "Erro de lint",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "src/hooks/use-color-scheme.web.ts:11",
   "detail": "Sem mudança.",
   "fix": "useSyncExternalStore."
  },
  {
   "id": "I-31",
   "title": "Typecheck depende de arquivo gerado",
   "severity": "baixo",
   "kind": "comprovado",
   "area": "Qualidade",
   "evidence": "tsconfig.json inclui expo-env.d.ts (ignorado)",
   "detail": "Um CI precisaria gerar o arquivo.",
   "fix": "Gerar no CI ou versionar os tipos de CSS."
  }
 ],
 "hypotheses": [
  {
   "id": "H-01",
   "title": "Filtros por render sobre o histórico",
   "detail": "useFoodDay, useExerciseDay e o ExerciseTile filtram todas as entradas a cada render. Com o histórico inteiro carregado (N-04), isso tende a pesar com o tempo. Não medido."
  },
  {
   "id": "H-02",
   "title": "Realtime do chat depende só da RLS para filtrar",
   "detail": "A assinatura filtra por trainer_id e confia na RLS de chat_messages para limitar ao usuário. A política existe e está coberta pelo teste SQL, mas o comportamento do Realtime com RLS não foi verificado contra um banco real."
  },
  {
   "id": "H-03",
   "title": "Redirecionamentos de e-mail em produção",
   "detail": "supabase/config.toml define site_url localhost e treina://** para desenvolvimento local. A configuração equivalente no projeto remoto não está no repositório e não pôde ser conferida."
  }
 ],
 "missing": [
  {
   "name": "Completar perfil após Google e editar perfil",
   "priority": "P0",
   "area": "Conta",
   "why": "Sem isso, contas do Google ficam sem dados corporais e os cálculos usam valores de exemplo (N-01, N-02)."
  },
  {
   "name": "Consentimento, política de privacidade, exportar e excluir conta",
   "priority": "P0",
   "area": "Privacidade",
   "why": "Os dados de saúde agora ficam no servidor; LGPD e as lojas exigem consentimento e exclusão de conta no app."
  },
  {
   "name": "Testes e CI antes de cada OTA",
   "priority": "P0",
   "area": "Qualidade",
   "why": "Um crash de abertura chegou ao aparelho por OTA sem nenhum teste (N-07)."
  },
  {
   "name": "Metas calculadas a partir do perfil",
   "priority": "P1",
   "area": "Personalização",
   "why": "O cadastro coleta os dados e promete estimar calorias, mas todos recebem 2.200 kcal (I-04)."
  },
  {
   "name": "Edição de registros e de exercícios do treino",
   "priority": "P1",
   "area": "Fluxos",
   "why": "Corrigir é a ação mais comum num diário; hoje exige apagar e recriar (I-12)."
  },
  {
   "name": "Desfazer e confirmação em exclusões",
   "priority": "P1",
   "area": "UX",
   "why": "Exclusões agora são permanentes no servidor (I-11)."
  },
  {
   "name": "Fila de salvamento persistida e leitura offline",
   "priority": "P1",
   "area": "Dados",
   "why": "Mudanças pendentes se perdem ao fechar o app (N-03); academia costuma ter sinal fraco."
  },
  {
   "name": "Carregamento por período",
   "priority": "P1",
   "area": "Performance",
   "why": "O login baixa todo o histórico (N-04)."
  },
  {
   "name": "Histórico e evolução de cargas",
   "priority": "P1",
   "area": "Relatórios",
   "why": "A sessão já registra séries, cargas e sensação, mas não há onde ver a evolução."
  },
  {
   "name": "Monitoramento de erros",
   "priority": "P1",
   "area": "Operação",
   "why": "O crash do ExpoSQLite só foi descoberto com relatório de bugs manual."
  },
  {
   "name": "Configurações",
   "priority": "P1",
   "area": "Personalização",
   "why": "Não há lugar para metas, conta, privacidade e notificações."
  },
  {
   "name": "Timer de descanso e registro por série",
   "priority": "P2",
   "area": "Treino",
   "why": "A sessão registra um valor por exercício."
  },
  {
   "name": "Recentes, favoritos e copiar refeição",
   "priority": "P2",
   "area": "Retenção",
   "why": "Reduz o registro repetitivo."
  },
  {
   "name": "Leitor de código de barras",
   "priority": "P2",
   "area": "Integrações",
   "why": "O Open Food Facts já indexa por código."
  },
  {
   "name": "Lembretes e notificações",
   "priority": "P2",
   "area": "Notificações",
   "why": "Treinos e hábitos dependem de o usuário lembrar; o chat precisa de push quando o treinador responder."
  },
  {
   "name": "Passos via Health Connect / HealthKit",
   "priority": "P2",
   "area": "Integrações",
   "why": "O widget mostra número fictício."
  },
  {
   "name": "Relatório semanal",
   "priority": "P2",
   "area": "Relatórios",
   "why": "Junta peso, calorias e aderência ao plano."
  },
  {
   "name": "Lado do treinador (responder, publicar pacotes)",
   "priority": "P2",
   "area": "Marketplace",
   "why": "O chat e o catálogo dependem dele para deixar de ser só de ida."
  },
  {
   "name": "Avaliar pacotes",
   "priority": "P3",
   "area": "Engajamento",
   "why": "Os comentários do catálogo são de exemplo."
  },
  {
   "name": "Pagamento de pacotes",
   "priority": "P3",
   "area": "Monetização",
   "why": "Só se o modelo de negócio previr; não há indício no código."
  }
 ],
 "flows": [
  {
   "name": "Primeiro acesso e cadastro por e-mail",
   "steps": [
    {
     "label": "Splash até ler a sessão",
     "kind": "ok"
    },
    {
     "label": "Login",
     "kind": "ok"
    },
    {
     "label": "Sua conta (nome, e-mail, senha, confirmação)",
     "kind": "ok"
    },
    {
     "label": "Sobre você (nascimento, sexo, altura, peso)",
     "kind": "friction",
     "note": "Dados não usados nas metas"
    },
    {
     "label": "Confirme seu e-mail (reenvio com contagem)",
     "kind": "friction",
     "note": "Exige abrir o e-mail no mesmo celular"
    },
    {
     "label": "Link → auth/callback → abas",
     "kind": "ok"
    },
    {
     "label": "Início com metas e passos fictícios",
     "kind": "break",
     "note": "2.200 kcal e 6.840 passos para todos"
    },
    {
     "label": "Onboarding",
     "kind": "missing"
    }
   ],
   "notes": "O fluxo de conta ficou completo e bem tratado. O valor do produto ainda não aparece no fim dele, porque as metas não são pessoais."
  },
  {
   "name": "Entrar com Google",
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
     "label": "Perfil só com o nome",
     "kind": "break",
     "note": "Nascimento, sexo, altura e peso nulos"
    },
    {
     "label": "Completar perfil",
     "kind": "missing",
     "note": "Prometido no trigger, não existe"
    },
    {
     "label": "Calorias com 82 kg de exemplo",
     "kind": "break"
    }
   ],
   "notes": "Caminho mais curto de entrada e o que deixa o perfil incompleto (N-01, N-02)."
  },
  {
   "name": "Recuperar senha",
   "steps": [
    {
     "label": "Esqueci minha senha (e-mail já preenchido)",
     "kind": "ok"
    },
    {
     "label": "Verifique seu e-mail (não revela se existe conta)",
     "kind": "ok"
    },
    {
     "label": "Link → nova senha (app continua deslogado)",
     "kind": "ok"
    },
    {
     "label": "Login com aviso 'Senha alterada'",
     "kind": "ok"
    },
    {
     "label": "Link expirado → pedir novo",
     "kind": "ok"
    }
   ],
   "notes": "Fluxo completo e seguro; só a mensagem de erro fala em 'código' (N-08)."
  },
  {
   "name": "Registrar uma refeição",
   "steps": [
    {
     "label": "Diário",
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
     "label": "Salvo na hora, enviado em fila",
     "kind": "ok"
    },
    {
     "label": "Corrigir quantidade",
     "kind": "missing"
    },
    {
     "label": "Fechar o app sem internet",
     "kind": "break",
     "note": "Mudança pendente se perde"
    }
   ],
   "notes": "Melhor fluxo do app; faltam edição e fila persistente."
  },
  {
   "name": "Montar e executar treino",
   "steps": [
    {
     "label": "Planejamento (semanal ou fila)",
     "kind": "ok"
    },
    {
     "label": "Adicionar exercício (filtros de categoria)",
     "kind": "friction",
     "note": "Busca em inglês"
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
     "label": "Ver evolução",
     "kind": "missing"
    }
   ],
   "notes": "Sem mudança relevante de fluxo desde a auditoria anterior; agora persiste."
  },
  {
   "name": "Seguir treinador e conversar",
   "steps": [
    {
     "label": "Catálogo do banco",
     "kind": "ok"
    },
    {
     "label": "Pacote",
     "kind": "ok"
    },
    {
     "label": "Aderir",
     "kind": "break",
     "note": "Sobrescreve o plano próprio sem aviso"
    },
    {
     "label": "Chat em tempo real com aviso",
     "kind": "friction",
     "note": "Treinador ainda não responde"
    },
    {
     "label": "Avaliar pacote",
     "kind": "missing"
    }
   ],
   "notes": "O aviso no chat corrigiu a expectativa; o lado do treinador segue ausente."
  },
  {
   "name": "Recuperação de erros",
   "steps": [
    {
     "label": "Falha ao carregar → Tentar de novo / Sair",
     "kind": "friction",
     "note": "Qualquer domínio bloqueia o app todo"
    },
    {
     "label": "Falha ao salvar → banner 'Tentar novamente'",
     "kind": "ok"
    },
    {
     "label": "Erro de tela → 'Algo deu errado'",
     "kind": "ok"
    },
    {
     "label": "Módulo nativo ausente",
     "kind": "break",
     "note": "Fecha antes do ErrorBoundary (caso ExpoSQLite)"
    }
   ],
   "notes": "Bem melhor que antes; o caso nativo depende de processo de entrega (N-07)."
  }
 ],
 "benchmark": {
  "caveat": "Continua sem documento de posicionamento no repositório. O público foi inferido do código: brasileiros que treinam com acompanhamento de personal trainers que divulgam programas no Instagram. As referências vêm de conhecimento público e não foram verificadas nesta auditoria.",
  "competitors": [
   {
    "name": "MyFitnessPal",
    "segment": "Diário alimentar",
    "strengths": "Base enorme, código de barras, metas calculadas, refeições salvas.",
    "treinaVs": "Treina tem TACO offline e agora persiste os dados, mas não calcula metas nem permite editar registros.",
    "opportunity": "Diário rápido com TACO + produtos BR, ligado ao treino."
   },
   {
    "name": "FatSecret / Tecnonutri",
    "segment": "Calorias no Brasil",
    "strengths": "Base brasileira, comunidade.",
    "treinaVs": "Mesmo público; Treina não tem histórico nem relatórios.",
    "opportunity": "Unir dieta e treino num painel só."
   },
   {
    "name": "Hevy / Strong",
    "segment": "Musculação",
    "strengths": "Registro por série, descanso, recordes, histórico.",
    "treinaVs": "Treina tem fila e sessão cronometrada, sem séries nem evolução.",
    "opportunity": "Progressão de carga por exercício."
   },
   {
    "name": "MFIT Personal / Tecnofit / Trainerize",
    "segment": "Personal ↔ aluno",
    "strengths": "Prescrição, chat, cobrança.",
    "treinaVs": "Treina tem o lado do aluno (pacotes, adesão, chat em tempo real), não o do treinador.",
    "opportunity": "Programas de influenciadores com execução guiada no app."
   },
   {
    "name": "Samsung Health / Google Fit / Apple Saúde",
    "segment": "Atividade",
    "strengths": "Passos e sono automáticos.",
    "treinaVs": "Treina mostra passos fictícios.",
    "opportunity": "Integrar via Health Connect / HealthKit."
   }
  ],
  "differentiators": [
   "Diário, treino e treinador no mesmo app, com o treino do pacote virando o treino do dia.",
   "TACO embarcada para comida brasileira, offline.",
   "Plano em fila para quem não treina em dias fixos.",
   "Modo demo que permite usar o app inteiro sem conta (útil para testes e demonstrações)."
  ],
  "doNotCopy": [
   "Feed social e desafios públicos: custam moderação e não há sinal de que sejam objetivo.",
   "Base própria colaborativa de alimentos: TACO + Open Food Facts já cobrem o caso brasileiro.",
   "Tarefas genéricas de produtividade: melhor transformar em hábitos de saúde."
  ]
 },
 "gallery": {
  "note": "Capturas do app exportado para web (expo export -p web) em modo demo (EXPO_PUBLIC_AUTH_MODE=demo, dados em memória), navegado com Playwright num viewport de 390 × 844 em 12/11/2026. As telas logadas usaram dados criados pela interface; as de recuperação de senha e confirmação foram abertas pelo endereço, sem e-mail real. A versão web aproxima o app nativo. O ambiente da auditoria bloqueia ExerciseDB, Open Food Facts e randomuser.me.",
  "missing": [
   {
    "screen": "bootstrap",
    "why": "No modo demo os dados carregam na hora, então a tela de carregamento dura um quadro e a de erro só aparece se um domínio falhar. Não dá para capturar sem alterar o código."
   }
  ],
  "images": [
   {
    "screen": "login",
    "file": "screens/login.jpg",
    "id": "login",
    "caption": "Login em pt-BR com 'Esqueci minha senha' (I-08 resolvido)."
   },
   {
    "screen": "signup-account",
    "file": "screens/signup-account.jpg",
    "id": "signup-account",
    "caption": "Etapa 1 de 3, agora com confirmação de senha."
   },
   {
    "screen": "signup-details",
    "file": "screens/signup-details.jpg",
    "id": "signup-details",
    "caption": "Etapa 2: data de nascimento no lugar da idade. A descrição ainda promete estimar calorias (I-04)."
   },
   {
    "screen": "signup-confirm",
    "file": "screens/signup-confirm.jpg",
    "id": "signup-confirm",
    "caption": "Etapa 3: confirmar o e-mail, com reenvio e contagem regressiva."
   },
   {
    "screen": "forgot-password",
    "file": "screens/forgot-password.jpg",
    "id": "forgot-password",
    "caption": "Recuperação de senha. No modo demo, avisa que não está disponível."
   },
   {
    "screen": "forgot-check-email",
    "file": "screens/forgot-check-email.jpg",
    "id": "forgot-check-email",
    "caption": "Confirmação de envio que não revela se a conta existe."
   },
   {
    "screen": "forgot-new-password",
    "file": "screens/forgot-new-password.jpg",
    "id": "forgot-new-password",
    "caption": "Nova senha aberta sem código: estado de link inválido com 'Pedir novo link'."
   },
   {
    "screen": "auth-callback",
    "file": "screens/auth-callback.jpg",
    "id": "auth-callback",
    "caption": "Callback de confirmação sem código: link expirado ou já usado."
   },
   {
    "screen": "home",
    "file": "screens/home.jpg",
    "id": "home",
    "caption": "Início com dados reais de alimentação e exercício; meta fixa de 2.200 kcal e 6.840 passos fictícios (I-04, I-05)."
   },
   {
    "screen": "home",
    "file": "screens/home-edit.jpg",
    "id": "home-edit",
    "caption": "Modo de edição da tela inicial, agora salvo por conta."
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
    "screen": "log-food",
    "file": "screens/log-food.jpg",
    "id": "log-food",
    "caption": "Busca com resultados da TACO; a parte online aparece com erro porque o ambiente da auditoria bloqueia o Open Food Facts."
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
    "caption": "Refeições do diário."
   },
   {
    "screen": "exercise",
    "file": "screens/exercise.jpg",
    "id": "exercise",
    "caption": "Aba Exercícios: treino do dia (descanso) e lista única de exercícios, com botão flutuante."
   },
   {
    "screen": "log-exercise",
    "file": "screens/log-exercise.jpg",
    "id": "log-exercise",
    "caption": "Filtros por categoria (novos); o catálogo aparece com erro porque o ambiente bloqueia o ExerciseDB."
   },
   {
    "screen": "exercise-details",
    "file": "screens/exercise-details.jpg",
    "id": "exercise-details",
    "caption": "Exercício manual com categoria escolhida e 0 kcal, sem MET (I-28)."
   },
   {
    "screen": "workouts",
    "file": "screens/workouts.jpg",
    "id": "workouts",
    "caption": "Planejamento após aderir ao pacote."
   },
   {
    "screen": "workout",
    "file": "screens/workout.jpg",
    "id": "workout",
    "caption": "Treino próprio com exercício manual."
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
    "caption": "Catálogo de treinadores (fotos de exemplo bloqueadas no ambiente, iniciais no lugar)."
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
    "caption": "Pacote com treinos, comentários e 'Aderir ao treino'."
   },
   {
    "screen": "package-workout",
    "file": "screens/package-workout.jpg",
    "id": "package-workout",
    "caption": "Treino do pacote com notas."
   },
   {
    "screen": "chat",
    "file": "screens/chat.jpg",
    "id": "chat",
    "caption": "Chat com aviso de que o treinador ainda não responde (I-14 parcial)."
   },
   {
    "screen": "tasks",
    "file": "screens/tasks.jpg",
    "id": "tasks",
    "caption": "Tarefas com subtarefas."
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
    "caption": "Perfil com idade pela data de nascimento."
   },
   {
    "screen": "profile",
    "file": "screens/dialog-weight.jpg",
    "id": "dialog-weight",
    "caption": "Registrar peso, agora com data da medição."
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
    "src/lib/auth.ts",
    "src/components/ui/password-field.tsx"
   ],
   "objective": "Entrar com e-mail e senha ou Google.",
   "context": "Quem não tem sessão salva.",
   "importance": "Alta",
   "works": [
    "Supabase Auth com e-mail e senha",
    "Google via idToken (build nativo)",
    "Conta não confirmada leva à tela de confirmação",
    "Esqueci minha senha com o e-mail já preenchido",
    "Aviso 'Senha alterada' após recuperação",
    "Modo demo entra sem servidor"
   ],
   "partial": [
    "Google depende dos client IDs no ambiente; sem eles mostra erro"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Todo em pt-BR e com grafia correta",
    "+ Mostrar senha com ícone e rótulo de acessibilidade",
    "+ Erros anunciados como alerta",
    "- Sem indicação visual de modo demo quando ativo"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim (guard troca a tela)"
   },
   "tech": [
    "normalizeEmail e EMAIL_PATTERN compartilhados com cadastro e recuperação",
    "Formulário remontado por key após troca de senha: simples e correto"
   ],
   "opportunities": [
    "Selo 'Modo demo' quando IS_AUTH_MOCKED",
    "Validar as variáveis do Google no início do app"
   ],
   "issues": [
    "N-06"
   ],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Estados e erros bem tratados, helpers compartilhados.",
    "ux": "Claro e consistente; resolveu os problemas de idioma.",
    "complete": "Cobre e-mail, Google, recuperação e conta não confirmada.",
    "maturity": "Depende de configuração de ambiente não validada."
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
   "objective": "Nome, e-mail, senha e confirmação (etapa 1 de 3).",
   "context": "Novo usuário.",
   "importance": "Alta",
   "works": [
    "Exige nome completo",
    "Valida e-mail e senha mínima",
    "Confirmação de senha",
    "Mostrar senha nos dois campos",
    "Dados preservados ao voltar"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Indicador de 3 etapas",
    "+ Foco encadeado entre campos",
    "- Erro único no rodapé",
    "- Sem termos de uso e consentimento"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "StepScreen reaproveitado em cadastro e recuperação"
   ],
   "opportunities": [
    "Consentimento de dados de saúde nesta etapa",
    "Erros por campo"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Curto e reaproveitável.",
    "ux": "Claro; erro centralizado.",
    "complete": "Falta consentimento.",
    "maturity": "Integrado ao Auth real."
   }
  },
  {
   "id": "signup-details",
   "name": "Criar conta: sobre você",
   "route": "/signup/details",
   "group": "Autenticação",
   "files": [
    "src/app/signup/details.tsx",
    "src/lib/profile.ts",
    "supabase/migrations/20261102000300_new_user_profile.sql"
   ],
   "objective": "Nascimento, sexo, altura e peso (etapa 2 de 3).",
   "context": "Continuação do cadastro.",
   "importance": "Alta",
   "works": [
    "Data de nascimento DD/MM/AAAA validada (dia real, idade mínima)",
    "Altura em seletor, peso 30–400 kg",
    "Dados enviados no signUp e gravados pelo trigger (perfil e primeira pesagem)"
   ],
   "partial": [
    "A descrição promete estimar calorias, mas as metas são fixas (I-04)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Data de nascimento no lugar da idade",
    "- Sem objetivo nem nível de atividade",
    "- Data digitada à mão, sem seletor de data"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "parseDate rejeita datas impossíveis",
    "Trigger ignora valores inválidos sem falhar (testado em rls.sql)"
   ],
   "opportunities": [
    "Objetivo e atividade",
    "Usar os dados nas metas",
    "Reaproveitar a tela para completar perfil do Google"
   ],
   "issues": [
    "I-04",
    "N-01"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 6,
    "maturity": 7
   },
   "justify": {
    "tech": "Validação boa no app e no banco.",
    "ux": "Promessa da tela não cumprida.",
    "complete": "Faltam objetivo e atividade.",
    "maturity": "Persistido de verdade."
   }
  },
  {
   "id": "signup-confirm",
   "name": "Confirme seu e-mail",
   "route": "/signup/confirm",
   "group": "Autenticação",
   "files": [
    "src/app/signup/confirm.tsx",
    "src/components/auth/*"
   ],
   "objective": "Pedir que o usuário abra o link de confirmação (etapa 3 de 3).",
   "context": "Após o cadastro, ou ao entrar com conta não confirmada.",
   "importance": "Alta",
   "works": [
    "Texto diferente para recém-cadastrado e para conta antiga não confirmada",
    "Reenviar com contagem regressiva",
    "Redireciona ao cadastro se aberta sem e-mail"
   ],
   "partial": [
    "Reenviar não checa modo demo nem configuração (N-09)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Explica que o link deve ser aberto no mesmo celular",
    "- 'Já confirmei, entrar' só volta ao login; o usuário digita a senha de novo"
   ],
   "states": {
    "loading": "sim (reenvio)",
    "empty": "n/a",
    "error": "sim",
    "success": "sim (contagem)"
   },
   "tech": [
    "Componente ResendEmail compartilhado com a recuperação"
   ],
   "opportunities": [
    "Abrir o app de e-mail",
    "Manter o e-mail e a senha para entrar direto após confirmar"
   ],
   "issues": [
    "N-09"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Simples; uma guarda faltando.",
    "ux": "Clara, com um passo a mais no fim.",
    "complete": "Cobre os dois casos de entrada.",
    "maturity": "Depende do e-mail real (não testado)."
   }
  },
  {
   "id": "forgot-password",
   "name": "Esqueceu a senha?",
   "route": "/forgot-password",
   "group": "Autenticação",
   "files": [
    "src/app/forgot-password/index.tsx"
   ],
   "objective": "Pedir o link de redefinição.",
   "context": "A partir do login.",
   "importance": "Média",
   "works": [
    "E-mail preenchido a partir do login",
    "Validação e envio pelo Supabase",
    "No modo demo, avisa que não está disponível"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Etapa 1 de 3 clara",
    "- Mensagem de erro fala em 'código' (N-08)"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim (próxima etapa)"
   },
   "tech": [
    "Mesmos helpers de e-mail do login"
   ],
   "opportunities": [
    "Corrigir o texto"
   ],
   "issues": [
    "N-08"
   ],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Curta e correta.",
    "ux": "Objetiva.",
    "complete": "Faz o que promete.",
    "maturity": "E-mail real não testado."
   }
  },
  {
   "id": "forgot-check-email",
   "name": "Verifique seu e-mail",
   "route": "/forgot-password/check-email",
   "group": "Autenticação",
   "files": [
    "src/app/forgot-password/check-email.tsx"
   ],
   "objective": "Confirmar o envio sem revelar se a conta existe.",
   "context": "Após pedir o link.",
   "importance": "Baixa",
   "works": [
    "Texto que não confirma a existência da conta",
    "Reenviar com contagem",
    "Voltar para o login"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Cuidado de privacidade bem comunicado"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Reaproveita ResendEmail e StepScreen"
   ],
   "opportunities": [],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Reaproveitamento limpo.",
    "ux": "Clara.",
    "complete": "Completa.",
    "maturity": "E-mail real não testado."
   }
  },
  {
   "id": "forgot-new-password",
   "name": "Nova senha",
   "route": "/forgot-password/new-password",
   "group": "Autenticação",
   "files": [
    "src/app/forgot-password/new-password.tsx",
    "src/context/session.tsx (startPasswordReset, resetPassword)"
   ],
   "objective": "Definir a senha nova a partir do link.",
   "context": "Aberta pelo link do e-mail.",
   "importance": "Média",
   "works": [
    "Troca o código uma única vez",
    "App continua deslogado durante a troca",
    "Confirmação de senha",
    "Sai de todos os aparelhos após trocar",
    "Estado de link inválido ou expirado com 'Pedir novo link'"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Estados de abrindo, inválido e pronto bem distintos"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim (login com aviso)"
   },
   "tech": [
    "Fluxo de recuperação isolado por ref (recovery) para não logar o app",
    "Mapeia error_code do Supabase para mensagens"
   ],
   "opportunities": [],
   "issues": [],
   "scores": {
    "tech": 9,
    "ux": 8,
    "complete": 9,
    "maturity": 7
   },
   "justify": {
    "tech": "Melhor tratamento de fluxo do app.",
    "ux": "Estados claros.",
    "complete": "Cobre sucesso e expiração.",
    "maturity": "Não testado com e-mail real."
   }
  },
  {
   "id": "auth-callback",
   "name": "Confirmação pelo link",
   "route": "/auth/callback",
   "group": "Autenticação",
   "files": [
    "src/app/auth/callback.tsx"
   ],
   "objective": "Trocar o código do link de confirmação pela sessão.",
   "context": "Aberta pelo e-mail de confirmação.",
   "importance": "Média",
   "works": [
    "Troca o código e entra",
    "Link expirado ou sem código mostra erro com 'Ir para o login'"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Mensagem clara de link usado ou expirado"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Fica fora dos dois guards, de propósito (comentado no layout)"
   ],
   "opportunities": [
    "Oferecer reenviar o link a partir do erro"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Simples e correta.",
    "ux": "Erro claro, sem atalho para reenviar.",
    "complete": "Faz o essencial.",
    "maturity": "Não testado com e-mail real."
   }
  },
  {
   "id": "bootstrap",
   "name": "Carregando / erro de carregamento",
   "route": "(tabs)/_layout",
   "group": "Autenticação",
   "files": [
    "src/app/(tabs)/_layout.tsx",
    "src/hooks/use-main-flow-bootstrap.ts",
    "src/hooks/use-user-data-status.ts",
    "src/components/main-flow-loading.tsx"
   ],
   "objective": "Carregar perfil e os 9 domínios antes das abas.",
   "context": "A cada login ou abertura com sessão.",
   "importance": "Alta",
   "works": [
    "Carrega o perfil (profiles + última pesagem)",
    "Espera os 9 domínios",
    "Tentar de novo e Sair"
   ],
   "partial": [
    "Qualquer domínio que falhe bloqueia o app inteiro (N-05)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Mensagem útil",
    "- Tela de carregamento cresce com o histórico (N-04)"
   ],
   "states": {
    "loading": "sim",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Agrega status de todos os stores",
    "Carrega o histórico completo de cada domínio"
   ],
   "opportunities": [
    "Bloquear só no perfil",
    "Carregar por período"
   ],
   "issues": [
    "N-04",
    "N-05"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Correto, mas tudo-ou-nada.",
    "ux": "Espera e falhas globais.",
    "complete": "Carrega o necessário e mais.",
    "maturity": "Não escala com o histórico."
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
    "src/context/dashboard-layout.tsx",
    "src/lib/dashboard-data.ts"
   ],
   "objective": "Resumo do dia.",
   "context": "Tela de abertura.",
   "importance": "Alta",
   "works": [
    "Calorias consumidas, macros, exercício e peso reais",
    "Layout personalizável e agora persistido",
    "Card de peso com período configurável"
   ],
   "partial": [
    "Metas fixas (I-04)"
   ],
   "visual": [
    "Passos 6.840 de 10.000 para todos (I-05)"
   ],
   "redundant": [],
   "ux": [
    "+ Layout salvo por conta",
    "+ Estado vazio com ação",
    "- Números fictícios ao lado de reais"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "via bootstrap",
    "success": "sim"
   },
   "tech": [
    "draggable-dashboard.tsx com 718 linhas (I-29)",
    "Bug do NaN da lixeira corrigido (bc153f6)"
   ],
   "opportunities": [
    "Metas calculadas",
    "Ocultar passos sem fonte"
   ],
   "issues": [
    "I-04",
    "I-05",
    "I-29"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Sofisticado, num arquivo grande.",
    "ux": "Bom, com dados fictícios.",
    "complete": "Metas e passos não são do usuário.",
    "maturity": "Persistido; ainda mistura exemplo e real."
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
    "src/context/food-log.tsx",
    "src/data/supabase/food-log.ts"
   ],
   "objective": "Registrar alimentos por refeição.",
   "context": "Várias vezes ao dia.",
   "importance": "Alta",
   "works": [
    "Totais do dia, seções por refeição",
    "Remover alimento",
    "Persistido por conta"
   ],
   "partial": [
    "Sem edição (I-12)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Leitura rápida",
    "- Remover sem desfazer (I-11)",
    "- Sem comparação com a meta"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "banner de salvamento",
    "success": "sim"
   },
   "tech": [
    "Mudança mostrada na hora e salva em fila"
   ],
   "opportunities": [
    "Editar ao tocar",
    "Copiar refeição",
    "Mostrar quanto falta"
   ],
   "issues": [
    "I-11",
    "I-12",
    "N-03"
   ],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Boa modelagem e persistência.",
    "ux": "Clara.",
    "complete": "Sem edição.",
    "maturity": "Real, sem fila persistente."
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
   "objective": "Achar alimento genérico ou produto.",
   "context": "A partir de uma refeição.",
   "importance": "Alta",
   "works": [
    "TACO a cada tecla",
    "Open Food Facts após pausa",
    "Erro com tentar novamente"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Todos os estados",
    "- Sem recentes"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Debounce, cache e descarte de respostas obsoletas"
   ],
   "opportunities": [
    "Recentes e favoritos",
    "Código de barras"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 8,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Excelente.",
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
   "objective": "Gramas e refeição antes de adicionar.",
   "context": "Após escolher o alimento.",
   "importance": "Alta",
   "works": [
    "Porção e 100 g",
    "Troca de refeição",
    "Nutrientes recalculados"
   ],
   "partial": [
    "Sem limite de gramas (I-30)"
   ],
   "visual": [],
   "redundant": [
    "parseNumber duplicado (I-18)"
   ],
   "ux": [
    "+ Prévia imediata",
    "- Sem medidas caseiras"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Produto online some após recarregar (cache em memória)"
   ],
   "opportunities": [
    "Medidas caseiras",
    "Modo edição"
   ],
   "issues": [
    "I-18",
    "I-30"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Correto; helper duplicado.",
    "ux": "Só gramas.",
    "complete": "Sem edição.",
    "maturity": "Persiste."
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
   "objective": "Escolher as refeições do diário.",
   "context": "Configuração.",
   "importance": "Baixa",
   "works": [
    "Adicionar padrão ou personalizada",
    "Remover (mínimo uma)",
    "Persistido (refeições padrão criadas pelo banco)"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Sem reordenar ou renomear"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "insertMeal mantém a ordem do dia"
   ],
   "opportunities": [
    "Reordenar e renomear"
   ],
   "issues": [
    "I-11"
   ],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 8,
    "maturity": 7
   },
   "justify": {
    "tech": "Simples.",
    "ux": "Sem reordenar.",
    "complete": "Cumpre.",
    "maturity": "Persistido."
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
    "Totais do dia",
    "Treino do dia (semanal ou fila) com descanso explícito",
    "Lista única de exercícios do dia",
    "Botão flutuante de adicionar"
   ],
   "partial": [
    "Desfazer conclusão antiga desalinha a fila (I-07)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Lista única no lugar das duas seções",
    "- Remover sem desfazer"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "banner",
    "success": "sim"
   },
   "tech": [
    "Calorias 0 sem MET (I-28)",
    "Peso de exemplo quando falta (N-02)"
   ],
   "opportunities": [
    "Histórico de cargas"
   ],
   "issues": [
    "I-07",
    "I-28",
    "N-02"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Regras isoladas; bugs antigos.",
    "ux": "Mais simples que antes.",
    "complete": "Sem edição e histórico.",
    "maturity": "Persistido."
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
   "objective": "Escolher exercício do catálogo ou digitar.",
   "context": "Registro ou montagem de treino.",
   "importance": "Alta",
   "works": [
    "Filtros Todos, Cardiovascular e Musculação",
    "Catálogo paginado",
    "Busca ao enviar",
    "Adicionar manualmente"
   ],
   "partial": [
    "Busca em inglês (I-25)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Filtros por categoria",
    "- Ícone '+' em tentar novamente (I-26)"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "API gratuita sem SLA"
   ],
   "opportunities": [
    "Termos em pt-BR",
    "Debounce"
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
    "tech": "Paginação e erros bons.",
    "ux": "Barreira de idioma.",
    "complete": "Cobre os casos.",
    "maturity": "Depende de serviço externo."
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
   "objective": "Duração e calorias ou séries, repetições e carga.",
   "context": "Após escolher.",
   "importance": "Alta",
   "works": [
    "Escolha de categoria para exercício manual",
    "Estimativa por MET",
    "Modo adicionar ao treino"
   ],
   "partial": [
    "0 kcal sem MET (I-28)",
    "Peso de exemplo (N-02)"
   ],
   "visual": [],
   "redundant": [
    "parseNumber duplicado"
   ],
   "ux": [
    "+ Categoria explícita",
    "- Uma carga para todas as séries"
   ],
   "states": {
    "loading": "n/a",
    "empty": "parcial",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Fallback para MOCK_PROFILE.weightKg"
   ],
   "opportunities": [
    "Intensidade para manuais",
    "Últimos valores usados"
   ],
   "issues": [
    "I-28",
    "N-02",
    "I-18"
   ],
   "scores": {
    "tech": 6,
    "ux": 6,
    "complete": 7,
    "maturity": 6
   },
   "justify": {
    "tech": "Fallback silencioso.",
    "ux": "Genérica para musculação.",
    "complete": "Dois tipos cobertos.",
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
   "objective": "Criar treinos e agendar (semanal ou fila).",
   "context": "Configuração do plano.",
   "importance": "Alta",
   "works": [
    "Criar treino",
    "Semanal com diálogo por dia",
    "Fila com mover, remover e próximo",
    "Persistido"
   ],
   "partial": [
    "Ponteiro da fila frágil (I-07)"
   ],
   "visual": [],
   "redundant": [
    "'Confirmar' só volta"
   ],
   "ux": [
    "+ Explicação de cada modo",
    "- Reordenar só por setas"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "banner",
    "success": "sim"
   },
   "tech": [
    "Salva o plano inteiro a cada mudança"
   ],
   "opportunities": [
    "Arrastar para reordenar"
   ],
   "issues": [
    "I-07"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 7,
    "maturity": 7
   },
   "justify": {
    "tech": "Regras boas, sem testes.",
    "ux": "Flexível.",
    "complete": "Dois modos.",
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
    "Excluir treino",
    "Treino de treinador bloqueado"
   ],
   "partial": [
    "Não edita nem reordena exercícios (I-12)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Excluir sem confirmação (I-11)"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Sem updateExercise"
   ],
   "opportunities": [
    "Editar e reordenar",
    "Duplicar treino"
   ],
   "issues": [
    "I-11",
    "I-12"
   ],
   "scores": {
    "tech": 6,
    "ux": 6,
    "complete": 5,
    "maturity": 6
   },
   "justify": {
    "tech": "Simples, incompleta.",
    "ux": "Destrutiva sem proteção.",
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
    "Cronômetro",
    "Concluir exercícios com valores reais",
    "Sensação 0 a 5",
    "Confirmação ao sair"
   ],
   "partial": [
    "Sessão perdida ao fechar (I-32)"
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
    "usePreventRemove correto",
    "Peso de exemplo (N-02)"
   ],
   "opportunities": [
    "Descanso",
    "Séries",
    "Retomar"
   ],
   "issues": [
    "I-32",
    "N-02"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Bem resolvida.",
    "ux": "Falta o essencial da série.",
    "complete": "Sem descanso.",
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
    "Catálogo vindo do banco (Supabase) ou de trainers.ts (local)",
    "Busca sem acento"
   ],
   "partial": [],
   "visual": [
    "Dados e fotos de exemplo (seed)"
   ],
   "redundant": [],
   "ux": [
    "- Sem filtros"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "via bootstrap",
    "success": "sim"
   },
   "tech": [
    "CatalogProvider com status próprio"
   ],
   "opportunities": [
    "Filtros por objetivo"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 5
   },
   "justify": {
    "tech": "Catálogo real.",
    "ux": "Sem filtros.",
    "complete": "Conteúdo de exemplo.",
    "maturity": "Sem lado do treinador."
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
   "objective": "Apresentar o treinador.",
   "context": "Decisão.",
   "importance": "Média",
   "works": [
    "Dados do banco",
    "Instagram",
    "Conversar",
    "Pacotes"
   ],
   "partial": [],
   "visual": [
    "Seguidores, alunos e nota de exemplo"
   ],
   "redundant": [],
   "ux": [
    "+ Rótulos de acessibilidade"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Linking sem tratar falha"
   ],
   "opportunities": [],
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
    "complete": "Conteúdo de exemplo.",
    "maturity": "Sem lado do treinador."
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
   "objective": "Aderir a um programa.",
   "context": "Decisão.",
   "importance": "Alta",
   "works": [
    "Treinos e comentários",
    "Aderir copia para o plano",
    "Diálogo ao trocar de pacote",
    "Adesão persistida (coaching_memberships)"
   ],
   "partial": [
    "Sobrescreve plano próprio sem aviso (I-06)",
    "Sair apaga histórico (I-33)"
   ],
   "visual": [
    "Comentários de exemplo"
   ],
   "redundant": [],
   "ux": [
    "- Sair sem confirmação"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "sim",
    "success": "sim"
   },
   "tech": [
    "Composição de contextos com store.latest para mudanças seguidas"
   ],
   "opportunities": [
    "Confirmar sempre",
    "Progresso no programa"
   ],
   "issues": [
    "I-06",
    "I-33",
    "I-11"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Boa composição, dois bugs de dados.",
    "ux": "Ações destrutivas.",
    "complete": "Sem progresso nem avaliação.",
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
   "objective": "Ver um treino do pacote.",
   "context": "Avaliação.",
   "importance": "Baixa",
   "works": [
    "Descrição e exercícios com notas"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Sem demonstração"
   ],
   "states": {
    "loading": "n/a",
    "empty": "sim",
    "error": "n/a",
    "success": "sim"
   },
   "tech": [
    "Treino identificado por índice"
   ],
   "opportunities": [
    "Id estável"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Simples.",
    "ux": "Objetiva.",
    "complete": "Sem demo.",
    "maturity": "Índice frágil."
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
    "Mensagens persistidas",
    "Realtime (recebe inserções)",
    "Aviso de que o treinador ainda não responde"
   ],
   "partial": [
    "Sem a outra ponta (I-14)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Expectativa ajustada pelo aviso",
    "- Sem status de envio"
   ],
   "states": {
    "loading": "sim",
    "empty": "sim",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "Canal com tópico único por montagem",
    "Depende da RLS para filtrar (H-02)"
   ],
   "opportunities": [
    "App do treinador",
    "Push"
   ],
   "issues": [],
   "scores": {
    "tech": 8,
    "ux": 7,
    "complete": 4,
    "maturity": 5
   },
   "justify": {
    "tech": "Realtime bem feito.",
    "ux": "Honesto.",
    "complete": "Só de ida.",
    "maturity": "Falta o treinador."
   }
  },
  {
   "id": "tasks",
   "name": "Tarefas",
   "route": "/(tabs)/tasks",
   "group": "Abas",
   "files": [
    "src/app/(tabs)/tasks.tsx",
    "src/context/tasks.tsx"
   ],
   "objective": "Checklist diário.",
   "context": "Rotina.",
   "importance": "Média",
   "works": [
    "Repetição, subtarefas, marcação por dia",
    "Persistido"
   ],
   "partial": [
    "Sem edição pela interface"
   ],
   "visual": [],
   "redundant": [
    "Widget no Início"
   ],
   "ux": [
    "- Excluir sem confirmação",
    "- Sem lembretes",
    "- Genérica para um app de treino"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "banner",
    "success": "sim"
   },
   "tech": [
    "Repositório com update usado nas marcações"
   ],
   "opportunities": [
    "Reposicionar como hábitos",
    "Lembretes"
   ],
   "issues": [
    "I-11",
    "I-24"
   ],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Bem modelada.",
    "ux": "Sem lembretes.",
    "complete": "Sem edição.",
    "maturity": "Valor de produto indefinido."
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
   "objective": "Criar tarefa ou subtarefa.",
   "context": "Da aba Tarefas.",
   "importance": "Média",
   "works": [
    "Repetições",
    "Subtarefas na criação",
    "Modo subtarefa"
   ],
   "partial": [],
   "visual": [],
   "redundant": [],
   "ux": [
    "+ Radio acessível",
    "- Intervalo inválido sem mensagem"
   ],
   "states": {
    "loading": "n/a",
    "empty": "n/a",
    "error": "parcial",
    "success": "sim"
   },
   "tech": [
    "key={index} nas subtarefas do rascunho"
   ],
   "opportunities": [
    "Dias específicos da semana"
   ],
   "issues": [],
   "scores": {
    "tech": 7,
    "ux": 7,
    "complete": 6,
    "maturity": 6
   },
   "justify": {
    "tech": "Enxuta.",
    "ux": "Erro silencioso.",
    "complete": "Sem horário.",
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
   "objective": "Dados, peso, meta e sair.",
   "context": "Consulta.",
   "importance": "Média",
   "works": [
    "Idade pela data de nascimento",
    "Valores ausentes mostrados como traço",
    "Registrar peso com data",
    "Meta de peso"
   ],
   "partial": [
    "Não edita nome, nascimento, sexo nem altura (I-13)"
   ],
   "visual": [],
   "redundant": [],
   "ux": [
    "- Sem configurações, privacidade ou excluir conta",
    "- 'Sair' sem confirmação"
   ],
   "states": {
    "loading": "via bootstrap",
    "empty": "sim",
    "error": "sim (diálogo)",
    "success": "sim"
   },
   "tech": [
    "Fallback para MOCK_PROFILE se não houver perfil"
   ],
   "opportunities": [
    "Editar e completar perfil",
    "Configurações"
   ],
   "issues": [
    "I-13",
    "N-01"
   ],
   "scores": {
    "tech": 7,
    "ux": 6,
    "complete": 4,
    "maturity": 5
   },
   "justify": {
    "tech": "Melhorou com nulos tratados.",
    "ux": "Sem área de conta.",
    "complete": "Sem edição.",
    "maturity": "Perfil do Google incompleto."
   }
  }
 ],
 "features": [
  {
   "id": "F-01",
   "name": "Login por e-mail e Google (Supabase Auth)",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P2",
   "problem": "Identificar o usuário e proteger os dados.",
   "fit": "Sim.",
   "implementation": "Real, com PKCE e sessão no aparelho; Google depende dos client IDs no ambiente.",
   "intuitive": "Sim.",
   "missingStep": "Validar a configuração do Google no build.",
   "absence": "Sem sincronização entre aparelhos.",
   "screens": [
    "login"
   ],
   "issues": [
    "N-06"
   ],
   "images": [
    "login"
   ]
  },
  {
   "id": "F-02",
   "name": "Cadastro em 3 etapas com confirmação de e-mail",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Criar conta verificada e coletar dados corporais.",
   "fit": "Sim.",
   "implementation": "Completo e validado no app e no banco; os dados corporais não alimentam metas.",
   "intuitive": "Sim.",
   "missingStep": "Objetivo, atividade, consentimento.",
   "absence": "Contas não verificadas e sem dados para personalizar.",
   "screens": [
    "signup-account",
    "signup-details",
    "signup-confirm",
    "auth-callback"
   ],
   "issues": [
    "I-04",
    "N-09"
   ],
   "images": [
    "signup-account",
    "signup-details",
    "signup-confirm",
    "auth-callback"
   ]
  },
  {
   "id": "F-03",
   "name": "Recuperação de senha por link",
   "importance": "IMPORTANTE",
   "state": "Completa",
   "quality": 9,
   "priority": "P3",
   "problem": "Recuperar acesso sem suporte.",
   "fit": "Sim, obrigatório para login com senha.",
   "implementation": "Cuidadosa: não revela contas, não loga o app no meio, sai de todos os aparelhos.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma.",
   "absence": "Usuário bloqueado ao esquecer a senha.",
   "screens": [
    "forgot-password",
    "forgot-check-email",
    "forgot-new-password"
   ],
   "issues": [
    "N-08"
   ],
   "images": [
    "forgot-password",
    "forgot-check-email",
    "forgot-new-password"
   ]
  },
  {
   "id": "F-04",
   "name": "Modo demo (sem servidor)",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 7,
   "priority": "P3",
   "problem": "Usar e demonstrar o front sem backend.",
   "fit": "Sim, alinhado ao foco front-first.",
   "implementation": "Entra com qualquer e-mail, dados por conta em memória; perde tudo ao fechar.",
   "intuitive": "Não há indicação visual de que está ativo.",
   "missingStep": "Selo de modo demo.",
   "absence": "Testes do front dependeriam do Supabase.",
   "screens": [
    "login"
   ],
   "issues": [],
   "images": [],
   "noImage": "Sem imagem própria: o modo demo é o mesmo login, sem indicação visual (todas as capturas foram feitas nele)."
  },
  {
   "id": "F-05",
   "name": "Persistência por conta com fila de salvamento",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Guardar os dados e mostrar mudanças sem esperar o servidor.",
   "fit": "Sim.",
   "implementation": "Store por conta, salvamento em ordem e banner de nova tentativa; fila só em memória e histórico completo no login.",
   "intuitive": "Transparente para o usuário.",
   "missingStep": "Fila persistida e carregamento por período.",
   "absence": "Nada sobreviveria ao fechar o app.",
   "screens": [
    "bootstrap"
   ],
   "issues": [
    "N-03",
    "N-04",
    "N-05"
   ],
   "images": [],
   "noImage": "Sem interface própria: funciona por trás das telas; o banner de erro de salvamento só aparece quando o servidor falha."
  },
  {
   "id": "F-06",
   "name": "Dashboard do dia",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P0",
   "problem": "Ver o dia numa tela.",
   "fit": "Sim.",
   "implementation": "Calorias, macros, exercício e peso reais; metas e passos fictícios.",
   "intuitive": "Sim.",
   "missingStep": "Metas pessoais.",
   "absence": "Abrir cada aba para saber o dia.",
   "screens": [
    "home"
   ],
   "issues": [
    "I-04",
    "I-05"
   ],
   "images": [
    "home"
   ]
  },
  {
   "id": "F-07",
   "name": "Personalização do dashboard",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Escolher o que ver primeiro.",
   "fit": "Útil.",
   "implementation": "Arrastar acessível, agora salvo por conta.",
   "intuitive": "Sim.",
   "missingStep": "Nenhuma.",
   "absence": "Baixo.",
   "screens": [
    "home"
   ],
   "issues": [
    "I-29"
   ],
   "images": [
    "home-edit"
   ]
  },
  {
   "id": "F-08",
   "name": "Diário alimentar",
   "importance": "ESSENCIAL",
   "state": "Parcialmente implementada",
   "quality": 8,
   "priority": "P1",
   "problem": "Registrar o que foi comido.",
   "fit": "Sim.",
   "implementation": "Persistido; sem edição.",
   "intuitive": "Sim.",
   "missingStep": "Editar, copiar refeição.",
   "absence": "Metade da proposta.",
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
   "id": "F-09",
   "name": "Busca de alimentos TACO + Open Food Facts",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P2",
   "problem": "Achar alimentos brasileiros e produtos.",
   "fit": "Sim.",
   "implementation": "Melhor implementação do app.",
   "intuitive": "Sim.",
   "missingStep": "Código de barras.",
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
   "id": "F-10",
   "name": "Refeições configuráveis",
   "importance": "COMPLEMENTAR",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Adaptar o diário à rotina.",
   "fit": "Sim.",
   "implementation": "Persistido; refeições padrão criadas pelo banco.",
   "intuitive": "Sim.",
   "missingStep": "Reordenar.",
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
   "id": "F-11",
   "name": "Exercício avulso (ExerciseDB)",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 6,
   "priority": "P2",
   "problem": "Registrar atividade fora do plano.",
   "fit": "Sim.",
   "implementation": "Filtros por categoria novos; inglês, 0 kcal sem MET e peso de exemplo.",
   "intuitive": "Parcial.",
   "missingStep": "Edição; pt-BR.",
   "absence": "Atividades fora do saldo.",
   "screens": [
    "exercise",
    "log-exercise",
    "exercise-details"
   ],
   "issues": [
    "I-25",
    "I-28",
    "N-02"
   ],
   "images": [
    "log-exercise",
    "exercise-details"
   ]
  },
  {
   "id": "F-12",
   "name": "Plano de treino semanal ou em fila",
   "importance": "ESSENCIAL",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P1",
   "problem": "Saber o treino de hoje.",
   "fit": "Sim; a fila é diferencial.",
   "implementation": "Persistido; bug do desfazer e sem editar exercícios.",
   "intuitive": "Sim.",
   "missingStep": "Editar e reordenar exercícios.",
   "absence": "Sem orientação.",
   "screens": [
    "workouts",
    "workout",
    "exercise"
   ],
   "issues": [
    "I-07",
    "I-12"
   ],
   "images": [
    "workouts",
    "workout",
    "exercise"
   ]
  },
  {
   "id": "F-13",
   "name": "Sessão de treino cronometrada",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Guiar e registrar o treino.",
   "fit": "Sim.",
   "implementation": "Cronômetro e saída protegida; sem descanso, séries ou retomada.",
   "intuitive": "Sim.",
   "missingStep": "Descanso e séries.",
   "absence": "Registro manual depois.",
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
   "id": "F-14",
   "name": "Catálogo de treinadores",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Descobrir programas.",
   "fit": "Sim, diferencial.",
   "implementation": "Do banco com seed de exemplo; sem lado do treinador.",
   "intuitive": "Sim.",
   "missingStep": "Treinadores publicarem.",
   "absence": "Diário comum.",
   "screens": [
    "trainers",
    "trainer"
   ],
   "issues": [],
   "images": [
    "trainers",
    "trainer"
   ]
  },
  {
   "id": "F-15",
   "name": "Aderir a pacote",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 6,
   "priority": "P1",
   "problem": "Levar o programa ao plano.",
   "fit": "Sim.",
   "implementation": "Persistido; sobrescreve plano sem aviso e apaga histórico ao sair.",
   "intuitive": "Sim.",
   "missingStep": "Confirmação e progresso.",
   "absence": "Catálogo só leitura.",
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
   "id": "F-16",
   "name": "Chat com o treinador (tempo real)",
   "importance": "IMPORTANTE",
   "state": "Parcialmente implementada",
   "quality": 6,
   "priority": "P2",
   "problem": "Tirar dúvidas.",
   "fit": "Sim, agora com expectativa ajustada.",
   "implementation": "Persistido e em tempo real, com aviso; o treinador não tem como responder.",
   "intuitive": "Sim.",
   "missingStep": "Lado do treinador e push.",
   "absence": "Contato só por fora do app.",
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
   "name": "Tarefas com repetição",
   "importance": "QUESTIONÁVEL",
   "state": "Parcialmente implementada",
   "quality": 7,
   "priority": "P2",
   "problem": "Rotina diária.",
   "fit": "Pouco: genérica e fora das metas de saúde.",
   "implementation": "Persistida; sem edição nem lembretes.",
   "intuitive": "Sim.",
   "missingStep": "Lembretes e ligação com metas.",
   "absence": "Baixo; ocupa uma aba.",
   "screens": [
    "tasks",
    "add-task"
   ],
   "issues": [
    "I-11",
    "I-24"
   ],
   "images": [
    "tasks",
    "add-task"
   ]
  },
  {
   "id": "F-18",
   "name": "Peso, histórico e meta",
   "importance": "ESSENCIAL",
   "state": "Completa",
   "quality": 8,
   "priority": "P2",
   "problem": "Acompanhar o resultado.",
   "fit": "Sim.",
   "implementation": "Pesagem com data, peso atual derivado, período no gráfico, meta persistida.",
   "intuitive": "Sim.",
   "missingStep": "Editar ou apagar uma pesagem.",
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
   "id": "F-19",
   "name": "Perfil do usuário",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 5,
   "priority": "P0",
   "problem": "Ver e manter dados pessoais.",
   "fit": "Sim.",
   "implementation": "Leitura com nulos tratados; sem edição; contas do Google ficam incompletas.",
   "intuitive": "Sim.",
   "missingStep": "Completar e editar perfil, configurações, excluir conta.",
   "absence": "Dados errados ou ausentes para sempre.",
   "screens": [
    "profile"
   ],
   "issues": [
    "I-13",
    "N-01"
   ],
   "images": [
    "profile"
   ]
  },
  {
   "id": "F-20",
   "name": "Design system Material 3",
   "importance": "IMPORTANTE",
   "state": "Completa",
   "quality": 8,
   "priority": "P3",
   "problem": "Consistência e tema escuro.",
   "fit": "Sim.",
   "implementation": "Tokens gerados do ícone, 17 componentes base.",
   "intuitive": "n/a",
   "missingStep": "Documentar.",
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
   "name": "Tratamento de erros (tela de erro e banner de salvamento)",
   "importance": "IMPORTANTE",
   "state": "Completa",
   "quality": 7,
   "priority": "P2",
   "problem": "Não fechar o app nem perder mudanças em silêncio.",
   "fit": "Sim.",
   "implementation": "ErrorBoundary raiz e banner 'Tentar novamente'; não cobre erros nativos.",
   "intuitive": "Sim.",
   "missingStep": "Monitoramento remoto.",
   "absence": "App fecharia em erros de tela.",
   "screens": [
    "bootstrap"
   ],
   "issues": [
    "N-07"
   ],
   "images": [],
   "noImage": "A tela 'Algo deu errado' e o banner de salvamento só aparecem em erro; não foram provocados."
  },
  {
   "id": "F-22",
   "name": "Abas com swipe (6 destinos)",
   "importance": "COMPLEMENTAR",
   "state": "Com problemas identificados",
   "quality": 7,
   "priority": "P2",
   "problem": "Navegar.",
   "fit": "Sim, com destinos demais.",
   "implementation": "Pager próprio.",
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
   "id": "F-23",
   "name": "Entrega EAS (OTA por fingerprint)",
   "importance": "IMPORTANTE",
   "state": "Com problemas identificados",
   "quality": 5,
   "priority": "P0",
   "problem": "Levar versões ao celular.",
   "fit": "Sim.",
   "implementation": "Publica a cada push sem verificação; levou um crash ao aparelho.",
   "intuitive": "n/a",
   "missingStep": "Gate de qualidade e smoke test.",
   "absence": "Testes só locais.",
   "screens": [],
   "issues": [
    "N-07",
    "N-06",
    "I-23"
   ],
   "images": [],
   "noImage": "Sem interface: configuração de build e atualização."
  }
 ],
 "roadmap": [
  {
   "phase": 1,
   "name": "Correções críticas",
   "goal": "Proteger quem já usa o app e as próximas atualizações.",
   "tasks": [
    {
     "id": "R-01",
     "title": "Gate de qualidade antes do OTA",
     "problem": "Crash de abertura chegou ao aparelho por OTA (N-07).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Workflow roda lint, typecheck e testes antes do job de update e falha se algo quebrar."
    },
    {
     "id": "R-02",
     "title": "Completar perfil após Google",
     "problem": "Contas do Google sem dados corporais (N-01).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Primeiro login sem nascimento, sexo, altura ou peso abre a etapa 'Sobre você' e grava no perfil."
    },
    {
     "id": "R-03",
     "title": "Remover o peso de exemplo dos cálculos",
     "problem": "Calorias estimadas para 82 kg (N-02).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-02",
     "done": "Sem peso real, a estimativa aparece como indisponível com atalho para registrar."
    },
    {
     "id": "R-04",
     "title": "Confirmar substituição ao aderir a pacote",
     "problem": "Plano próprio apagado (I-06).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Diálogo sempre que houver dias com treino."
    },
    {
     "id": "R-05",
     "title": "Desfazer e confirmação em exclusões",
     "problem": "Exclusões permanentes com um toque (I-11).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Snackbar com Desfazer e diálogo para excluir treino, sair do pacote e sair da conta."
    },
    {
     "id": "R-06",
     "title": "Testes de domínio e do store",
     "problem": "Sem testes JavaScript (I-16).",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "—",
     "done": "jest-expo com testes de src/lib, useUserStore e repositório local rodando no R-01."
    },
    {
     "id": "R-07",
     "title": "Validar variáveis de ambiente",
     "problem": "Builds sem chaves falham só no uso (N-06).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "App e build avisam claramente quando falta uma variável obrigatória; README documenta o expo.dev."
    }
   ]
  },
  {
   "phase": 2,
   "name": "Consolidação das funcionalidades essenciais",
   "goal": "Fechar os ciclos básicos e personalizar.",
   "tasks": [
    {
     "id": "R-08",
     "title": "Metas calculadas do perfil",
     "problem": "2.200 kcal para todos (I-04).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-02",
     "done": "Objetivo e atividade no cadastro; kcal e macros calculados e ajustáveis."
    },
    {
     "id": "R-09",
     "title": "Edição de registros e exercícios do treino",
     "problem": "Apagar e recriar (I-12).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-06",
     "done": "update nos repositórios e telas de criação no modo edição."
    },
    {
     "id": "R-10",
     "title": "Editar perfil e configurações",
     "problem": "Perfil fixo (I-13).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-02",
     "done": "Editar nome, nascimento, sexo, altura; configurações com metas, conta e sair."
    },
    {
     "id": "R-11",
     "title": "Fila de salvamento persistida",
     "problem": "Mudanças pendentes se perdem (N-03).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-06",
     "done": "Pendências gravadas no expo-sqlite e reenviadas ao abrir."
    },
    {
     "id": "R-12",
     "title": "Carregamento por período e por aba",
     "problem": "Histórico completo no login e bloqueio global (N-04, N-05).",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-06",
     "done": "Login carrega só o perfil e uma janela recente; cada aba tem seu estado de erro."
    },
    {
     "id": "R-13",
     "title": "Histórico e evolução de cargas",
     "problem": "Sem retorno ao usuário.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-12",
     "done": "Tela por exercício com cargas e lista de sessões."
    },
    {
     "id": "R-14",
     "title": "Fila de treinos derivada do histórico",
     "problem": "Desfazer desalinha (I-07).",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-06",
     "done": "Teste cobre desfazer fora de ordem."
    },
    {
     "id": "R-15",
     "title": "Preservar histórico ao sair do pacote",
     "problem": "I-33.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Treinos arquivados ou snapshot na conclusão."
    }
   ]
  },
  {
   "phase": 3,
   "name": "Melhorias de UX/UI",
   "goal": "Reduzir atrito e alinhar a navegação.",
   "tasks": [
    {
     "id": "R-16",
     "title": "Passos fora do dashboard até haver fonte",
     "problem": "Número fictício (I-05).",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Widget oculto ou 'Conectar passos'."
    },
    {
     "id": "R-17",
     "title": "5 abas e Tarefas como hábitos",
     "problem": "I-24 e feature genérica.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-09",
     "done": "Barra com 5 destinos."
    },
    {
     "id": "R-18",
     "title": "Busca de exercícios em português",
     "problem": "I-25, I-26.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "—",
     "done": "Termos comuns em pt-BR encontram resultados."
    },
    {
     "id": "R-19",
     "title": "Sessão de treino completa",
     "problem": "Sem descanso, séries ou retomada (I-32).",
     "priority": "P2",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-11",
     "done": "Descanso, séries, tela ligada e retomar."
    },
    {
     "id": "R-20",
     "title": "Atalhos no diário",
     "problem": "Registro repetitivo.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-09",
     "done": "Recentes, favoritos, copiar refeição, medidas caseiras."
    },
    {
     "id": "R-21",
     "title": "Onboarding e selo de modo demo",
     "problem": "Usuário cai no dashboard sem contexto.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-08",
     "done": "Duas ou três telas puláveis e indicação de demo."
    },
    {
     "id": "R-22",
     "title": "Pequenas correções",
     "problem": "N-08, N-09, I-17, I-18, I-26, I-30, I-31.",
     "priority": "P3",
     "impact": "Baixo",
     "complexity": "Baixa",
     "deps": "R-01",
     "done": "Lint limpo, helpers unificados, textos corrigidos."
    }
   ]
  },
  {
   "phase": 4,
   "name": "Recursos adicionais e diferenciais",
   "goal": "Retenção e o lado do treinador.",
   "tasks": [
    {
     "id": "R-23",
     "title": "Lado do treinador (responder e publicar)",
     "problem": "Chat e catálogo só de ida (I-14).",
     "priority": "P2",
     "impact": "Alto",
     "complexity": "Alta",
     "deps": "R-12",
     "done": "Treinador responde mensagens e publica pacotes com políticas próprias."
    },
    {
     "id": "R-24",
     "title": "Notificações",
     "problem": "Sem lembretes nem aviso de resposta.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-23",
     "done": "Lembrete de treino e push de mensagem."
    },
    {
     "id": "R-25",
     "title": "Código de barras",
     "problem": "Produtos por nome.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-20",
     "done": "Câmera abre o produto do Open Food Facts."
    },
    {
     "id": "R-26",
     "title": "Passos via Health Connect / HealthKit",
     "problem": "Sem fonte de passos.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Alta",
     "deps": "R-16",
     "done": "Passos reais em build de desenvolvimento."
    },
    {
     "id": "R-27",
     "title": "Relatório semanal",
     "problem": "Sem tendência.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Média",
     "deps": "R-13",
     "done": "Peso, média de kcal, treinos feitos vs. planejados."
    }
   ]
  },
  {
   "phase": 5,
   "name": "Preparação para escala e produção",
   "goal": "Requisitos de loja, privacidade e operação.",
   "tasks": [
    {
     "id": "R-28",
     "title": "LGPD: consentimento, exportar e excluir conta",
     "problem": "Dados de saúde no servidor sem consentimento.",
     "priority": "P0",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-10",
     "done": "Consentimento no cadastro, política acessível, exclusão de conta no app apagando todas as linhas."
    },
    {
     "id": "R-29",
     "title": "Monitoramento de erros",
     "problem": "Crash só visto por relatório manual.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Baixa",
     "deps": "—",
     "done": "Crashes JS e nativos reportados com a versão do update."
    },
    {
     "id": "R-30",
     "title": "Smoke test do APK antes de liberar o canal",
     "problem": "N-07.",
     "priority": "P1",
     "impact": "Alto",
     "complexity": "Média",
     "deps": "R-01",
     "done": "Build de preview aberto automaticamente até a tela de login antes do update."
    },
    {
     "id": "R-31",
     "title": "Configuração iOS",
     "problem": "I-23.",
     "priority": "P1",
     "impact": "Médio",
     "complexity": "Baixa",
     "deps": "R-07",
     "done": "bundleIdentifier, URL scheme e job iOS."
    },
    {
     "id": "R-32",
     "title": "Leitura offline",
     "problem": "Sem uso sem rede.",
     "priority": "P2",
     "impact": "Médio",
     "complexity": "Alta",
     "deps": "R-11, R-12",
     "done": "Dados recentes disponíveis sem internet."
    }
   ]
  }
 ],
 "counts": {
  "screens": 28,
  "dialogs": 6,
  "features": 23,
  "issues": 31,
  "hypotheses": 3,
  "tasks": 32,
  "missing": 20
 }
};
