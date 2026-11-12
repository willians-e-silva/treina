# Auditoria do Treina — análise técnica

Commit analisado: `f21319a` (branch `main`), 2026-11-12. 17.925 linhas em 161 arquivos de `src/` (sem os tipos gerados do banco), 34 commits. Auditoria anterior: 5fd90b1 (02/11/2026).

> **Contexto da fase.** A instrução desta auditoria diz que o foco é ter o front funcional antes de conectar o backend. O código da main já tem o backend conectado: Supabase com autenticação real, 18 tabelas com Row Level Security, repositórios por domínio e chat em tempo real (commits de 02/11 em diante). A auditoria avalia o código como ele está; o modo demo (EXPO_PUBLIC_AUTH_MODE=demo) mantém o front utilizável sem backend e foi o usado nas capturas. Esta edição avalia a main em f21319a (12/11), que já inclui correções da auditoria anterior; ela substitui a edição intermediária 7356157, feita sobre 25f3a9b antes dessas correções.

O relatório visual interativo está em [`index.html`](index.html). Este documento traz as mesmas conclusões em texto, com as evidências.

## Resumo

| Indicador | Valor |
|---|---|
| Nota geral (produção) | **6,7 / 10** |
| Nota do front para a fase atual | **7,3 / 10** |
| Maturidade | **MVP funcional** |
| Telas analisadas | 29 (+ 9 diálogos) |
| Features identificadas | 26 |
| Problemas comprovados | 26 (+ 3 hipóteses) |
| Tarefas de roadmap | 28 |
| Features ausentes recomendadas | 17 |

**Por que MVP funcional.** Desde a auditoria anterior (MVP inicial) o app ganhou autenticação real, persistência por conta com RLS, desfazer nas exclusões, testes e CI. Hoje um usuário consegue criar conta, registrar alimentação, peso e treinos e encontrá-los em outro aparelho. Ainda não é um produto em evolução porque as metas da tela principal não são pessoais, não há edição de registros nem histórico de treinos, e faltam monitoramento, iOS e requisitos de privacidade.

**Nota da fase.** Média de qualidade técnica, arquitetura, UX/UI, funcionalidades, completude, performance e manutenibilidade, sem segurança, escalabilidade e prontidão, que dependem de decisões de backend e operação.

## O que foi verificado e o que não foi

- **TypeScript (tsc --noEmit):** Passa. 0 erros com expo-env.d.ts gerado. Sem ele, falha nos tipos de CSS; o workflow do EAS cria o arquivo antes de rodar.
- **ESLint (expo lint):** Passa. 0 erros e 0 avisos. O erro de use-color-scheme.web.ts da auditoria anterior foi corrigido.
- **Testes (jest-expo):** 28 passando. 4 suítes em src/lib/__tests__ (profile, tasks, weight, workouts). Nada cobre contextos, repositórios, useUserStore ou telas. supabase/tests/rls.sql existe, mas não roda no CI.
- **CI (EAS Workflow):** Parcial. Antes de publicar: variáveis (check-env), lint, typecheck e testes. Não verifica compatibilidade dos pacotes nativos com o SDK, o que deixou passar o crash do ExpoSQLite corrigido em 25f3a9b.

- Não verificado: O app não foi executado em Android ou iOS nativos; as capturas vêm da versão web em modo demo, e o resto por leitura de código, lint, typecheck e testes.
- Não verificado: Nenhuma chamada real ao Supabase foi feita: este ambiente não tem acesso ao projeto nem às chaves. Autenticação, RLS e Realtime foram avaliados pelo código, pelas migrações e por supabase/tests/rls.sql, sem executar.
- Não verificado: Google Sign-In, envio de emails de confirmação e recuperação de senha não foram testados de ponta a ponta.
- Não verificado: Desempenho em execução (abertura, troca de abas, arrastar do dashboard) não foi medido.
- Não verificado: Não há documento de produto ou público-alvo no repositório; o posicionamento foi inferido do código (pt-BR, TACO, treinadores com Instagram).

## Evolução desde a auditoria anterior

A auditoria de 5fd90b1 (02/11/2026) (nota 5,2) listou 33 problemas. Situação no código atual:

| ID anterior | Problema | Situação | Observação |
|---|---|---|---|
| I-01 | Nenhuma persistência local | Resolvido | Dados por conta no Supabase; sessão salva com expo-sqlite. O modo demo continua em memória de propósito. |
| I-02 | Dados não isolados por conta | Resolvido | useUserStore recomeça do vazio quando a conta muda. |
| I-03 | Histórico de peso fictício | Resolvido | Pesagens vêm do repositório; a primeira é criada no cadastro. |
| I-04 | Metas fixas | Aberto | Continua: 2.200 kcal, macros e 400 kcal de exercício de MOCK_DASHBOARD (N-01). |
| I-05 | Passos fictícios | Aberto | Continua: 6.840 passos (N-02). |
| I-06 | Pacote apagava o plano sem aviso | Resolvido | Diálogo também quando há dias planejados. |
| I-07 | Desfazer conclusão desalinha a fila | Aberto | undoCompletion inalterado (N-06). |
| I-08 | Login em inglês | Resolvido | Textos em pt-BR. |
| I-09 | E-mail sem normalização | Resolvido | normalizeEmail em src/lib/auth.ts. |
| I-10 | Autenticação simulada | Resolvido | Supabase Auth com PKCE; demo só por variável. |
| I-11 | Exclusões sem proteção | Parcial | Desfazer em alimentos, exercícios e tarefas; confirmação em treino, pacote e conta. Remover refeição continua sem proteção (N-26). |
| I-12 | Registros não editáveis | Aberto | Repositórios de alimento e exercício só têm add/remove (N-03). |
| I-13 | Perfil não editável | Parcial | Idade agora vem da data de nascimento; dados continuam sem edição (N-04). |
| I-14 | Chat sem resposta e sem aviso | Parcial | Aviso na tela; o treinador ainda não tem como responder. |
| I-15 | Duas fontes do peso | Resolvido | Peso atual = última pesagem. |
| I-16 | Nenhum teste | Parcial | 28 testes de src/lib no CI; nada para contextos, repositórios ou telas (N-23). |
| I-17 | Erro de lint | Resolvido | Lint limpo. |
| I-18 | Helpers duplicados | Parcial | EMAIL_PATTERN e normalização unificados; parseNumber ainda duplicado (N-16). |
| I-19 | Código e dependências sem uso | Resolvido | Removidos em a645770. |
| I-20 | Sem camada de dados | Resolvido | Repositórios por domínio com implementação local e Supabase. |
| I-21 | Dependência implícita entre providers | Aberto | Agora 11 providers aninhados. |
| I-22 | Catálogo fixo no código | Resolvido | Vem das tabelas do Supabase; o arquivo antigo é fixture do modo demo. |
| I-23 | iOS não configurado | Aberto | iosUrlScheme de exemplo e sem bundleIdentifier (N-14). |
| I-24 | Seis abas | Aberto | Inalterado (N-15). |
| I-25 | Busca de exercícios inconsistente | Parcial | Filtro por categoria; continua em inglês e só ao enviar (N-22). |
| I-26 | Ícone errado em Tentar novamente | Aberto | Ainda Plus (N-25). |
| I-27 | Registro em datas futuras inconsistente | Aberto | Diário e exercícios avulsos aceitam datas futuras; o card de treino bloqueia. |
| I-28 | Calorias de exercício manual | Aberto | Continua 0 kcal sem MET (N-08). |
| I-29 | Dashboard com 714 linhas | Aberto | Agora 718 linhas (N-20). |
| I-30 | Quantidade sem limite | Aberto | Inalterado (N-21). |
| I-31 | Typecheck depende de arquivo gerado | Parcial | O CI cria o arquivo; localmente continua (N-19). |
| I-32 | Sessão de treino perdida | Aberto | Inalterado (N-24). |
| I-33 | Sair do pacote apaga histórico | Aberto | Inalterado (N-07). |

Os abertos e parciais aparecem abaixo com nova numeração (N-xx).

## 1. Mapeamento

### Stack

- **Plataforma:** Expo SDK 58 (expo ~58.0.23); React Native 0.88; React 19.3 com React Compiler; TypeScript 6 strict; Typed routes
- **Navegação:** Expo Router 58; Stack.Protected para área logada; Abas próprias com swipe (sliding-tabs)
- **UI:** Design system Material 3 gerado do ícone; lucide-react-native; react-native-svg; Reanimated 4 + Worklets; expo-image
- **Backend:** Supabase: Auth (e-mail, Google por idToken, PKCE), Postgres com 18 tabelas e RLS, Realtime no chat; @supabase/supabase-js 2; Migrações e seed versionados em supabase/; Testes de RLS em SQL
- **Estado e dados:** 10 contexts React + UndoProvider; useUserStore: carga por conta, atualização otimista, fila de salvamento; Repositórios por domínio (local para demo, Supabase); expo-sqlite para a sessão; expo-crypto para ids
- **Integrações:** ExerciseDB (oss.exercisedb.dev); Open Food Facts; TACO embarcada; Google Sign-In; Instagram (links)
- **Qualidade e entrega:** jest-expo (28 testes); ESLint; EAS Build/Update com fingerprint; Workflow: check-env, lint, typecheck, testes → OTA ou build

### Telas e rotas

| Tela | Rota | Grupo | Importância | Arquivo principal |
|---|---|---|---|---|
| Login | `/login` | Autenticação | Alta | `src/app/login.tsx` |
| Esqueceu a senha | `/forgot-password` | Autenticação | Alta | `src/app/forgot-password/index.tsx` |
| Verifique seu e-mail (senha) | `/forgot-password/check-email` | Autenticação | Média | `src/app/forgot-password/check-email.tsx` |
| Nova senha | `/forgot-password/new-password` | Autenticação | Alta | `src/app/forgot-password/new-password.tsx` |
| Criar conta: sua conta | `/signup` | Autenticação | Alta | `src/app/signup/index.tsx` |
| Criar conta: sobre você | `/signup/details` | Autenticação | Alta | `src/app/signup/details.tsx` |
| Confirme seu e-mail | `/signup/confirm` | Autenticação | Alta | `src/app/signup/confirm.tsx` |
| Confirmando e-mail (link) | `/auth/callback` | Autenticação | Média | `src/app/auth/callback.tsx` |
| Carregando / erro ao carregar | `(tabs)/_layout` | Autenticação | Alta | `src/app/(tabs)/_layout.tsx` |
| Complete seu perfil | `(tabs)/_layout → CompleteProfile` | Autenticação | Média | `src/components/complete-profile.tsx` |
| Início (dashboard) | `/(tabs)` | Abas | Alta | `src/app/(tabs)/index.tsx` |
| Diário alimentar | `/(tabs)/diary` | Abas | Alta | `src/app/(tabs)/diary.tsx` |
| Adicionar alimento (busca) | `/log-food` | Modais | Alta | `src/app/log-food/index.tsx` |
| Quantidade do alimento | `/log-food/[id]` | Modais | Alta | `src/app/log-food/[id].tsx` |
| Refeições | `/meals` | Modais | Baixa | `src/app/meals.tsx` |
| Exercícios | `/(tabs)/exercise` | Abas | Alta | `src/app/(tabs)/exercise.tsx` |
| Adicionar exercício (busca) | `/log-exercise` | Modais | Alta | `src/app/log-exercise/index.tsx` |
| Detalhes do exercício | `/log-exercise/[id]` | Modais | Alta | `src/app/log-exercise/[id].tsx` |
| Planejamento | `/workouts` | Modais | Alta | `src/app/workouts/index.tsx` |
| Treino (edição) | `/workouts/[id]` | Modais | Média | `src/app/workouts/[id].tsx` |
| Sessão de treino | `/workout-session` | Modais | Alta | `src/app/workout-session.tsx` |
| Treinador (lista) | `/(tabs)/trainers` | Abas | Média | `src/app/(tabs)/trainers.tsx` |
| Perfil do treinador | `/trainer/[id]` | Treinadores | Média | `src/app/trainer/[id].tsx` |
| Pacote de treinos | `/trainer/package/[id]` | Treinadores | Alta | `src/app/trainer/package/[id].tsx` |
| Treino do pacote | `/trainer/workout` | Treinadores | Baixa | `src/app/trainer/workout.tsx` |
| Chat com o treinador | `/chat/[trainerId]` | Treinadores | Média | `src/app/chat/[trainerId].tsx` |
| Tarefas | `/(tabs)/tasks` | Abas | Média | `src/app/(tabs)/tasks.tsx` |
| Nova tarefa / subtarefa | `/add-task` | Modais | Média | `src/app/add-task.tsx` |
| Perfil | `/(tabs)/profile` | Abas | Média | `src/app/(tabs)/profile.tsx` |

Diálogos e avisos: registrar peso com data e meta (`components/weight/weight-dialog.tsx`), período do gráfico (`weight-range-dialog.tsx`), treino do dia da semana (`app/workouts/index.tsx`), substituir planejamento e sair do pacote (`app/trainer/package/[id].tsx`), sair do treino (`app/workout-session.tsx`), excluir treino (`app/workouts/[id].tsx`), sair da conta (`app/(tabs)/profile.tsx`), snackbar de desfazer (`components/undo-snackbar.tsx`) e aviso de falha ao salvar (`components/save-error-banner.tsx`).

A documentação da arquitetura, dos domínios e das integrações está em [`architecture.md`](architecture.md).

### Galeria de telas

Capturas do app real exportado para web em modo demo (EXPO_PUBLIC_AUTH_MODE=demo, dados em memória) e navegado com Playwright num viewport de 390 × 844 em 12/11/2026. Os dados foram criados pela própria interface. A versão web aproxima o app nativo; fontes, sombras e gestos podem diferir. O ambiente da auditoria bloqueia ExerciseDB, Open Food Facts e as fotos dos treinadores; essas partes aparecem com erro ou iniciais. Telas abertas por link (confirmação e nova senha) foram abertas sem código, por isso mostram o estado de link inválido.

**Login** (`/login`)

<p><img src="screens/login.jpg" width="200" alt="Login em pt-BR com Esqueci minha senha e Google."></p>

- *login:* Login em pt-BR com Esqueci minha senha e Google.

**Esqueceu a senha** (`/forgot-password`)

<p><img src="screens/forgot-password.jpg" width="200" alt="Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível."></p>

- *forgot-password:* Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível.

**Verifique seu e-mail (senha)** (`/forgot-password/check-email`)

<p><img src="screens/forgot-check-email.jpg" width="200" alt="Verifique seu e-mail, com reenvio liberado após 60 s."></p>

- *forgot-check-email:* Verifique seu e-mail, com reenvio liberado após 60 s.

**Nova senha** (`/forgot-password/new-password`)

<p><img src="screens/forgot-new-password.jpg" width="200" alt="Nova senha aberta sem código: estado de link inválido com ação para pedir outro."></p>

- *forgot-new-password:* Nova senha aberta sem código: estado de link inválido com ação para pedir outro.

**Criar conta: sua conta** (`/signup`)

<p><img src="screens/signup-account.jpg" width="200" alt="Cadastro, etapa 1: nome, e-mail, senha e confirmação."></p>

- *signup-account:* Cadastro, etapa 1: nome, e-mail, senha e confirmação.

**Criar conta: sobre você** (`/signup/details`)

<p><img src="screens/signup-details.jpg" width="200" alt="Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01)."></p>

- *signup-details:* Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01).

**Confirme seu e-mail** (`/signup/confirm`)

<p><img src="screens/signup-confirm.jpg" width="200" alt="Confirme seu e-mail, com reenvio."></p>

- *signup-confirm:* Confirme seu e-mail, com reenvio.

**Confirmando e-mail (link)** (`/auth/callback`)

<p><img src="screens/auth-callback.jpg" width="200" alt="Link de confirmação sem código: erro com orientação para entrar com a senha."></p>

- *auth-callback:* Link de confirmação sem código: erro com orientação para entrar com a senha.

**Carregando / erro ao carregar** (`(tabs)/_layout`)

*Sem captura:* O carregamento dura poucos quadros e o erro exige uma falha real do Supabase; não dá para capturar sem alterar o código.

**Complete seu perfil** (`(tabs)/_layout → CompleteProfile`)

*Sem captura:* Só aparece para contas criadas com Google, que não funciona no modo demo da versão web.

**Início (dashboard)** (`/(tabs)`)

<p><img src="screens/home.jpg" width="200" alt="Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."> <img src="screens/home-edit.jpg" width="200" alt="Modo de edição da tela inicial."> <img src="screens/home-dark.jpg" width="200" alt="Tema escuro numa conta nova."></p>

- *home:* Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02).
- *home-edit:* Modo de edição da tela inicial.
- *home-dark:* Tema escuro numa conta nova.

**Diário alimentar** (`/(tabs)/diary`)

<p><img src="screens/diary.jpg" width="200" alt="Diário com café da manhã e almoço."> <img src="screens/diary-undo.jpg" width="200" alt="Alimento removido com snackbar de Desfazer."></p>

- *diary:* Diário com café da manhã e almoço.
- *diary-undo:* Alimento removido com snackbar de Desfazer.

**Adicionar alimento (busca)** (`/log-food`)

<p><img src="screens/log-food.jpg" width="200" alt="Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria."></p>

- *log-food:* Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria.

**Quantidade do alimento** (`/log-food/[id]`)

<p><img src="screens/food-details.jpg" width="200" alt="Quantidade, refeição e nutrientes."></p>

- *food-details:* Quantidade, refeição e nutrientes.

**Refeições** (`/meals`)

<p><img src="screens/meals.jpg" width="200" alt="Refeições do diário; remover não tem desfazer (N-26)."></p>

- *meals:* Refeições do diário; remover não tem desfazer (N-26).

**Exercícios** (`/(tabs)/exercise`)

<p><img src="screens/exercise.jpg" width="200" alt="Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante."></p>

- *exercise:* Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante.

**Adicionar exercício (busca)** (`/log-exercise`)

<p><img src="screens/log-exercise.jpg" width="200" alt="Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria."></p>

- *log-exercise:* Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria.

**Detalhes do exercício** (`/log-exercise/[id]`)

<p><img src="screens/exercise-details.jpg" width="200" alt="Exercício manual: 30 min e 0 kcal, sem MET (N-08)."></p>

- *exercise-details:* Exercício manual: 30 min e 0 kcal, sem MET (N-08).

**Planejamento** (`/workouts`)

<p><img src="screens/workouts.jpg" width="200" alt="Planejamento depois de aderir ao pacote."></p>

- *workouts:* Planejamento depois de aderir ao pacote.

**Treino (edição)** (`/workouts/[id]`)

<p><img src="screens/workout.jpg" width="200" alt="Treino próprio com cardio manual."></p>

- *workout:* Treino próprio com cardio manual.

**Sessão de treino** (`/workout-session`)

<p><img src="screens/session.jpg" width="200" alt="Sessão cronometrada com um exercício concluído."> <img src="screens/dialog-leave-session.jpg" width="200" alt="Confirmação ao sair da sessão."></p>

- *session:* Sessão cronometrada com um exercício concluído.
- *dialog-leave-session:* Confirmação ao sair da sessão.

**Treinador (lista)** (`/(tabs)/trainers`)

<p><img src="screens/trainers.jpg" width="200" alt="Catálogo de treinadores carregado do seed."></p>

- *trainers:* Catálogo de treinadores carregado do seed.

**Perfil do treinador** (`/trainer/[id]`)

<p><img src="screens/trainer.jpg" width="200" alt="Perfil do treinador."></p>

- *trainer:* Perfil do treinador.

**Pacote de treinos** (`/trainer/package/[id]`)

<p><img src="screens/package.jpg" width="200" alt="Pacote com treinos, comentários e Aderir."></p>

- *package:* Pacote com treinos, comentários e Aderir.

**Treino do pacote** (`/trainer/workout`)

<p><img src="screens/package-workout.jpg" width="200" alt="Treino do pacote com notas do treinador."></p>

- *package-workout:* Treino do pacote com notas do treinador.

**Chat com o treinador** (`/chat/[trainerId]`)

<p><img src="screens/chat.jpg" width="200" alt="Chat com aviso de que o treinador ainda não responde pelo app."></p>

- *chat:* Chat com aviso de que o treinador ainda não responde pelo app.

**Tarefas** (`/(tabs)/tasks`)

<p><img src="screens/tasks.jpg" width="200" alt="Tarefa diária com subtarefas e tarefa avulsa."></p>

- *tasks:* Tarefa diária com subtarefas e tarefa avulsa.

**Nova tarefa / subtarefa** (`/add-task`)

<p><img src="screens/add-task.jpg" width="200" alt="Nova tarefa com repetição diária."></p>

- *add-task:* Nova tarefa com repetição diária.

**Perfil** (`/(tabs)/profile`)

<p><img src="screens/profile.jpg" width="200" alt="Perfil com idade calculada e meta de peso."> <img src="screens/dialog-weight.jpg" width="200" alt="Registrar peso com data da medição."> <img src="screens/dialog-signout.jpg" width="200" alt="Confirmação de saída; no modo demo avisa que os dados se perdem."></p>

- *profile:* Perfil com idade calculada e meta de peso.
- *dialog-weight:* Registrar peso com data da medição.
- *dialog-signout:* Confirmação de saída; no modo demo avisa que os dados se perdem.

## 2. Análise por tela

### Login — `/login`

**Objetivo:** Entrar com e-mail e senha ou com Google. **Contexto:** Quem não tem sessão salva. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/login.tsx`, `src/context/session.tsx`, `src/lib/auth.ts`, `src/lib/google-auth.ts`

<p><img src="screens/login.jpg" width="200" alt="Login em pt-BR com Esqueci minha senha e Google."></p>

- *login:* Login em pt-BR com Esqueci minha senha e Google.

**Funciona**

- Login real no Supabase com erros traduzidos (e-mail ou senha incorretos, sem conexão)
- Conta não confirmada leva à tela de confirmação com reenvio
- Google com idToken
- Mostrar/ocultar senha
- Link para recuperar senha com e-mail preenchido
- E-mail normalizado

**Parcial**

- Google só no Android; no iOS o URL scheme é de exemplo (N-14)

**UX/UI (+ positivo, − negativo)**

- + Textos em pt-BR e hierarquia clara
- + Erro anunciado com role alert
- + Mensagem após redefinir senha
- − Sem indicar quando o Supabase não está configurado antes de tentar

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Erros mapeados por código em src/lib/auth.ts
- Validação e normalização centralizadas

**Oportunidades**

- Entrar com Apple quando houver iOS
- Biometria para reabrir

Problemas relacionados: N-14 (iOS não configurado)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Código limpo, erros tipados e traduzidos. |
| UX/UI | 8 | Clara e completa em pt-BR. |
| Completude funcional | 8 | Cobre e-mail, Google e recuperação; iOS pendente. |
| Maturidade | 7 | Pronta para uso real no Android. |

### Esqueceu a senha — `/forgot-password`

**Objetivo:** Pedir o link de redefinição. **Contexto:** Usuário que esqueceu a senha. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/forgot-password/index.tsx`

<p><img src="screens/forgot-password.jpg" width="200" alt="Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível."></p>

- *forgot-password:* Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível.

**Funciona**

- Valida e normaliza o e-mail
- Envia o link do Supabase
- Erro claro no modo demo

**UX/UI (+ positivo, − negativo)**

- + E-mail vem preenchido do login
- + Etapa 1 de 3 indicada

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Reaproveita StepScreen e helpers de auth

**Oportunidades**

- Nada crítico

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Simples e correta. |
| UX/UI | 8 | Direta. |
| Completude funcional | 9 | Cumpre o passo. |
| Maturidade | 8 | Depende só do e-mail configurado no Supabase. |

### Verifique seu e-mail (senha) — `/forgot-password/check-email`

**Objetivo:** Orientar a abrir o link e permitir reenvio. **Contexto:** Após pedir o link. **Importância no fluxo principal:** Média.

Arquivos: `src/app/forgot-password/check-email.tsx`, `src/components/auth/resend-email.tsx`

<p><img src="screens/forgot-check-email.jpg" width="200" alt="Verifique seu e-mail, com reenvio liberado após 60 s."></p>

- *forgot-check-email:* Verifique seu e-mail, com reenvio liberado após 60 s.

**Funciona**

- Reenvio com espera de 60 s
- Voltar para o login

**UX/UI (+ positivo, − negativo)**

- + Texto não confirma se a conta existe (boa prática)
- − Pede para abrir no mesmo celular sem explicar o motivo (PKCE)

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- ResendEmail reaproveitado com cadastro

**Oportunidades**

- Explicar por que precisa ser o mesmo aparelho

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Componente reaproveitado. |
| UX/UI | 7 | Clara; restrição pouco explicada. |
| Completude funcional | 8 | Completa. |
| Maturidade | 8 | Estável. |

### Nova senha — `/forgot-password/new-password`

**Objetivo:** Criar a nova senha a partir do link. **Contexto:** Aberta pelo link do e-mail. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/forgot-password/new-password.tsx`, `src/context/session.tsx`

<p><img src="screens/forgot-new-password.jpg" width="200" alt="Nova senha aberta sem código: estado de link inválido com ação para pedir outro."></p>

- *forgot-new-password:* Nova senha aberta sem código: estado de link inválido com ação para pedir outro.

**Funciona**

- Troca o código pelo usuário sem entrar no app
- Senha e confirmação validadas
- Encerra a sessão em todos os aparelhos após trocar
- Link expirado ou inválido com ação para pedir outro

**UX/UI (+ positivo, − negativo)**

- + Estados de link (conferindo, pronto, inválido)
- + Volta ao login com aviso

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Fluxo de recuperação isolado da sessão normal (recovery ref)
- Cancelamento ao desmontar

**Oportunidades**

- Medidor de força da senha

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 9 | Trata casos de borda raros com cuidado. |
| UX/UI | 8 | Clara em todos os estados. |
| Completude funcional | 9 | Completa. |
| Maturidade | 8 | Não testada de ponta a ponta aqui. |

### Criar conta: sua conta — `/signup`

**Objetivo:** Nome, e-mail, senha e confirmação. **Contexto:** Novo usuário. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/signup/index.tsx`, `src/components/signup/step-screen.tsx`

<p><img src="screens/signup-account.jpg" width="200" alt="Cadastro, etapa 1: nome, e-mail, senha e confirmação."></p>

- *signup-account:* Cadastro, etapa 1: nome, e-mail, senha e confirmação.

**Funciona**

- Nome completo, e-mail e senha validados
- Confirmação de senha
- Mostrar senha

**UX/UI (+ positivo, − negativo)**

- + Etapas indicadas
- − Erro único no rodapé, não junto ao campo
- − Sem termos de uso e consentimento (N-05)

Estados: carregando **n/a** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- StepScreen compartilhado

**Oportunidades**

- Consentimento de dados de saúde aqui

Problemas relacionados: N-05 (Sem exclusão de conta, exportação ou consentimento)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Validação correta. |
| UX/UI | 7 | Boa; erros centralizados. |
| Completude funcional | 7 | Falta consentimento. |
| Maturidade | 7 | Pronta, menos o requisito legal. |

### Criar conta: sobre você — `/signup/details`

**Objetivo:** Nascimento, sexo, altura e peso. **Contexto:** Etapa 2 do cadastro. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/signup/details.tsx`, `src/components/signup/body-data-step.tsx`

<p><img src="screens/signup-details.jpg" width="200" alt="Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01)."></p>

- *signup-details:* Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01).

**Funciona**

- Data de nascimento com máscara
- Altura por seletor e peso validado
- Dados enviados no signUp e gravados por trigger (perfil + primeira pesagem)

**Parcial**

- Promete estimar calorias e as metas continuam fixas (N-01)

**UX/UI (+ positivo, − negativo)**

- + BodyDataStep reaproveitado em Complete seu perfil
- − Não pergunta objetivo nem nível de atividade

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Trigger on_auth_user_created evita perfil sem dados

**Oportunidades**

- Objetivo e atividade para calcular metas

Problemas relacionados: N-01 (Metas fixas apesar do perfil completo)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Boa divisão entre app e banco. |
| UX/UI | 7 | Clara, com promessa não cumprida. |
| Completude funcional | 6 | Faltam dados para metas. |
| Maturidade | 7 | Grava corretamente no banco. |

### Confirme seu e-mail — `/signup/confirm`

**Objetivo:** Pedir a confirmação pelo link. **Contexto:** Após cadastro ou login de conta não confirmada. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/signup/confirm.tsx`, `src/components/auth/resend-email.tsx`

<p><img src="screens/signup-confirm.jpg" width="200" alt="Confirme seu e-mail, com reenvio."></p>

- *signup-confirm:* Confirme seu e-mail, com reenvio.

**Funciona**

- Reenvio com espera
- Texto diferente quando vem do login
- Redireciona ao cadastro sem e-mail

**UX/UI (+ positivo, − negativo)**

- + Explica o próximo passo
- − 'Já confirmei, entrar' só volta ao login; não tenta entrar

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Simples e correta

**Oportunidades**

- Abrir o app de e-mail

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Correta. |
| UX/UI | 7 | Botão com texto que promete mais do que faz. |
| Completude funcional | 8 | Completa. |
| Maturidade | 8 | Estável. |

### Confirmando e-mail (link) — `/auth/callback`

**Objetivo:** Trocar o código do link pela sessão. **Contexto:** Aberta pelo link de confirmação. **Importância no fluxo principal:** Média.

Arquivos: `src/app/auth/callback.tsx`

<p><img src="screens/auth-callback.jpg" width="200" alt="Link de confirmação sem código: erro com orientação para entrar com a senha."></p>

- *auth-callback:* Link de confirmação sem código: erro com orientação para entrar com a senha.

**Funciona**

- Entra automaticamente
- Erro com orientação de entrar com a senha
- Aberto em outro aparelho: o e-mail já fica confirmado e a tela orienta entrar com a senha

**UX/UI (+ positivo, − negativo)**

- + Mensagens específicas por código de erro

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Troca de código única por link (exchangeOnce)

**Oportunidades**

- Nada crítico

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Evita troca duplicada. |
| UX/UI | 8 | Clara. |
| Completude funcional | 9 | Completa. |
| Maturidade | 8 | Não testada ponta a ponta aqui. |

### Carregando / erro ao carregar — `(tabs)/_layout`

**Objetivo:** Carregar perfil e os 9 domínios antes das abas. **Contexto:** Após login e a cada abertura com sessão. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/(tabs)/_layout.tsx`, `src/hooks/use-main-flow-bootstrap.ts`, `src/hooks/use-user-data-status.ts`, `src/components/main-flow-loading.tsx`

**Funciona**

- Carrega perfil (profiles + última pesagem)
- Espera os 9 domínios
- Erro com Tentar de novo e Sair

**Parcial**

- Tudo ou nada: um domínio com erro bloqueia o app (N-09)

**UX/UI (+ positivo, − negativo)**

- + Mensagem clara
- − Sem indicação de qual parte falhou

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Agregação de status em use-user-data-status
- Histórico completo de cada domínio na abertura (N-10)

**Oportunidades**

- Mostrar abas com erro por seção

Problemas relacionados: N-09 (Abertura tudo ou nada), N-10 (Histórico completo carregado na abertura)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Simples, mas acopla todos os domínios. |
| UX/UI | 6 | Falha genérica. |
| Completude funcional | 7 | Faz o necessário. |
| Maturidade | 6 | Piora com o crescimento dos dados. |

### Complete seu perfil — `(tabs)/_layout → CompleteProfile`

**Objetivo:** Pedir dados corporais que faltam (contas Google). **Contexto:** Primeiro acesso com Google. **Importância no fluxo principal:** Média.

Arquivos: `src/components/complete-profile.tsx`, `src/data/profile.ts`

**Funciona**

- Salva nascimento, sexo e altura no profiles
- Peso vira pesagem do dia
- Sair disponível

**UX/UI (+ positivo, − negativo)**

- + Reaproveita o passo do cadastro
- − Mesma promessa de estimar calorias (N-01)

Estados: carregando **sim** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- Acessa o Supabase direto por src/data/profile.ts, fora da interface de repositórios

**Oportunidades**

- Mover o perfil para um repositório

Problemas relacionados: N-01 (Metas fixas apesar do perfil completo)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Funciona; fura a abstração de repositório. |
| UX/UI | 7 | Clara. |
| Completude funcional | 8 | Cumpre o objetivo. |
| Maturidade | 7 | Sem captura: só aparece para contas Google, indisponível no modo demo web. |

### Início (dashboard) — `/(tabs)`

**Objetivo:** Resumo do dia. **Contexto:** Tela de abertura. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/(tabs)/index.tsx`, `src/components/dashboard/*`, `src/context/dashboard-layout.tsx`

<p><img src="screens/home.jpg" width="200" alt="Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."> <img src="screens/home-edit.jpg" width="200" alt="Modo de edição da tela inicial."> <img src="screens/home-dark.jpg" width="200" alt="Tema escuro numa conta nova."></p>

- *home:* Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02).
- *home-edit:* Modo de edição da tela inicial.
- *home-dark:* Tema escuro numa conta nova.

**Funciona**

- Calorias, macros e exercício reais do dia
- Peso com gráfico por período
- Tarefas do dia
- Layout personalizável e salvo por conta

**Parcial**

- Metas fixas (N-01)

**Apenas visual ou demonstrativo**

- Passos 6.840 fixos (N-02)

**Redundâncias e simplificações**

- Widget de tarefas repete a aba Tarefas

**UX/UI (+ positivo, − negativo)**

- + Hierarquia clara e modo edição explícito
- − Dado fictício ao lado de dado real
- − Não navega para outros dias

Estados: carregando **sim (no carregamento geral)** · vazio **sim** · erro **geral** · sucesso **sim**

**Técnica**

- Arrastar com Reanimated em componente de 718 linhas (N-20)
- Correção do NaN da lixeira em bc153f6

**Oportunidades**

- Metas calculadas
- Tocar no card abre a aba

Problemas relacionados: N-01 (Metas fixas apesar do perfil completo), N-02 (Passos fictícios na tela inicial), N-20 (Componente de dashboard com 718 linhas)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Avançado, concentrado num arquivo. |
| UX/UI | 7 | Boa, com números enganosos. |
| Completude funcional | 6 | Metas e passos não são reais. |
| Maturidade | 6 | Layout persistido; dados centrais ainda mock. |

### Diário alimentar — `/(tabs)/diary`

**Objetivo:** Ver e registrar alimentos por refeição. **Contexto:** Uso diário. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/(tabs)/diary.tsx`, `src/components/diary/meal-section.tsx`, `src/context/food-log.tsx`

<p><img src="screens/diary.jpg" width="200" alt="Diário com café da manhã e almoço."> <img src="screens/diary-undo.jpg" width="200" alt="Alimento removido com snackbar de Desfazer."></p>

- *diary:* Diário com café da manhã e almoço.
- *diary-undo:* Alimento removido com snackbar de Desfazer.

**Funciona**

- Seletor de dia e totais
- Seções por refeição
- Remover com Desfazer
- Salvo por conta no Supabase

**Parcial**

- Sem edição (N-03)

**UX/UI (+ positivo, − negativo)**

- + Snackbar de desfazer
- − Totais sem comparação com a meta
- − Sem atalhos (recentes, copiar)

Estados: carregando **geral** · vazio **sim** · erro **aviso de salvamento** · sucesso **sim**

**Técnica**

- Atualização otimista com fila

**Oportunidades**

- Editar ao tocar
- Copiar refeição

Problemas relacionados: N-03 (Registros não podem ser editados)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Bem integrado ao store. |
| UX/UI | 8 | Leitura rápida e desfazer. |
| Completude funcional | 7 | Falta editar. |
| Maturidade | 8 | Persistido e seguro. |

### Adicionar alimento (busca) — `/log-food`

**Objetivo:** Buscar alimento genérico ou produto. **Contexto:** A partir do diário. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/log-food/index.tsx`, `src/hooks/use-food-search.ts`

<p><img src="screens/log-food.jpg" width="200" alt="Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria."></p>

- *log-food:* Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria.

**Funciona**

- TACO na hora e offline
- Open Food Facts após pausa
- Erro com Tentar novamente

**UX/UI (+ positivo, − negativo)**

- + Estado vazio e foco automático
- − Sem recentes no estado vazio

Estados: carregando **sim** · vazio **sim** · erro **sim** · sucesso **sim**

**Técnica**

- Debounce, cache e descarte de respostas antigas

**Oportunidades**

- Recentes e código de barras

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Melhor implementação de busca. |
| UX/UI | 8 | Rápida. |
| Completude funcional | 8 | Faltam atalhos. |
| Maturidade | 8 | Estável. |

### Quantidade do alimento — `/log-food/[id]`

**Objetivo:** Gramas, refeição e nutrientes. **Contexto:** Após escolher o alimento. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/log-food/[id].tsx`

<p><img src="screens/food-details.jpg" width="200" alt="Quantidade, refeição e nutrientes."></p>

- *food-details:* Quantidade, refeição e nutrientes.

**Funciona**

- Porção e 100 g como atalhos
- Troca de refeição
- Nutrientes ao digitar

**Parcial**

- Sem limite de gramas (N-21)

**Redundâncias e simplificações**

- parseNumber local (N-16)

**UX/UI (+ positivo, − negativo)**

- + Prévia imediata
- − Só gramas, sem medidas caseiras

Estados: carregando **n/a** · vazio **sim** · erro **parcial** · sucesso **sim**

**Técnica**

- Validação mínima

**Oportunidades**

- Medidas caseiras
- Modo edição

Problemas relacionados: N-16 (Parsing de números duplicado), N-21 (Quantidade de alimento sem limite)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Correto; duplica helper. |
| UX/UI | 7 | Clara. |
| Completude funcional | 7 | Sem medidas caseiras. |
| Maturidade | 7 | Funciona. |

### Refeições — `/meals`

**Objetivo:** Escolher refeições do diário. **Contexto:** Configuração ocasional. **Importância no fluxo principal:** Baixa.

Arquivos: `src/app/meals.tsx`

<p><img src="screens/meals.jpg" width="200" alt="Refeições do diário; remover não tem desfazer (N-26)."></p>

- *meals:* Refeições do diário; remover não tem desfazer (N-26).

**Funciona**

- Adicionar padrão ou personalizada
- Remover (mantém ao menos uma)
- Salvo por conta

**UX/UI (+ positivo, − negativo)**

- − Remover sem desfazer, diferente dos outros diários (N-26)
- − Sem reordenar ou renomear

Estados: carregando **n/a** · vazio **n/a** · erro **sim** · sucesso **sim**

**Técnica**

- insertMeal mantém ordem do dia

**Oportunidades**

- Desfazer e reordenar

Problemas relacionados: N-26 (Remover refeição sem desfazer)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Regras pequenas e corretas. |
| UX/UI | 7 | Inconsistente no remover. |
| Completude funcional | 8 | Cumpre. |
| Maturidade | 8 | Persistida. |

### Exercícios — `/(tabs)/exercise`

**Objetivo:** Treino do dia e exercícios registrados. **Contexto:** Dias de treino. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/(tabs)/exercise.tsx`, `src/components/exercise/workout-card.tsx`, `src/components/exercise/exercise-list.tsx`

<p><img src="screens/exercise.jpg" width="200" alt="Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante."></p>

- *exercise:* Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante.

**Funciona**

- Treino do dia pelo plano (semanal ou fila)
- Iniciar sessão ou concluir sem cronômetro
- Lista única de exercícios com Desfazer
- FAB para adicionar

**Parcial**

- Desfazer em dia antigo desalinha a fila (N-06)
- Manual com 0 kcal (N-08)

**UX/UI (+ positivo, − negativo)**

- + Lista única mais simples que as duas seções antigas
- − Minutos contam só cardio

Estados: carregando **geral** · vazio **sim** · erro **aviso** · sucesso **sim**

**Técnica**

- getWorkoutForDate centraliza a regra

**Oportunidades**

- Histórico de cargas

Problemas relacionados: N-06 (Desfazer conclusão antiga desalinha a fila), N-08 (Exercício manual entra com 0 kcal)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Bom, com bug de fila. |
| UX/UI | 8 | Mais limpa que antes. |
| Completude funcional | 7 | Falta histórico. |
| Maturidade | 7 | Persistida. |

### Adicionar exercício (busca) — `/log-exercise`

**Objetivo:** Escolher do ExerciseDB ou digitar. **Contexto:** Registro ou montagem de treino. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/log-exercise/index.tsx`, `src/lib/exercisedb.ts`

<p><img src="screens/log-exercise.jpg" width="200" alt="Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria."></p>

- *log-exercise:* Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria.

**Funciona**

- Filtro Todos/Cardio/Musculação
- Catálogo paginado
- Adicionar manualmente

**Parcial**

- Termos em inglês (N-22)

**UX/UI (+ positivo, − negativo)**

- + Filtro por categoria
- − Busca só ao enviar
- − Ícone + em Tentar novamente (N-25)

Estados: carregando **sim** · vazio **sim** · erro **sim** · sucesso **sim**

**Técnica**

- Depende de API gratuita sem SLA

**Oportunidades**

- Cache traduzido no Supabase

Problemas relacionados: N-22 (Busca de exercícios em inglês e frágil), N-25 (Ícone e textos pequenos inconsistentes)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Erros tratados. |
| UX/UI | 6 | Barreira de idioma. |
| Completude funcional | 7 | Cobre catálogo e manual. |
| Maturidade | 6 | Serviço externo frágil (bloqueado nas capturas). |

### Detalhes do exercício — `/log-exercise/[id]`

**Objetivo:** Duração/calorias ou séries/carga. **Contexto:** Após escolher. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/log-exercise/[id].tsx`

<p><img src="screens/exercise-details.jpg" width="200" alt="Exercício manual: 30 min e 0 kcal, sem MET (N-08)."></p>

- *exercise-details:* Exercício manual: 30 min e 0 kcal, sem MET (N-08).

**Funciona**

- Categoria escolhível para exercício manual
- Estimativa por MET com peso do perfil
- Modo adicionar ao treino

**Parcial**

- Manual sem MET = 0 kcal (N-08)

**Redundâncias e simplificações**

- parseNumber local (N-16)

**UX/UI (+ positivo, − negativo)**

- + Dica de estimativa
- − Uma carga para todas as séries

Estados: carregando **n/a** · vazio **parcial** · erro **parcial** · sucesso **sim**

**Técnica**

- Fallback de peso para MOCK_PROFILE (N-17)

**Oportunidades**

- MET padrão por categoria
- Lembrar últimos valores

Problemas relacionados: N-08 (Exercício manual entra com 0 kcal), N-16 (Parsing de números duplicado), N-17 (Dados de exemplo como reserva em telas reais)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 6 | Ramificações e mock de reserva. |
| UX/UI | 6 | Genérica para musculação. |
| Completude funcional | 7 | Cobre os dois tipos. |
| Maturidade | 6 | Calorias pouco confiáveis. |

### Planejamento — `/workouts`

**Objetivo:** Criar treinos e definir semana ou fila. **Contexto:** Configuração do plano. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/workouts/index.tsx`, `src/context/workout-plan.tsx`

<p><img src="screens/workouts.jpg" width="200" alt="Planejamento depois de aderir ao pacote."></p>

- *workouts:* Planejamento depois de aderir ao pacote.

**Funciona**

- Treinos com nome automático
- Semana por diálogo
- Fila com mover, remover e próximo
- Persistido por conta

**Redundâncias e simplificações**

- Botão Confirmar com salvamento automático

**UX/UI (+ positivo, − negativo)**

- + Explicação de cada modo
- − Reordenar só por setas

Estados: carregando **geral** · vazio **sim** · erro **aviso** · sucesso **sim**

**Técnica**

- Regras de fila com casos de borda

**Oportunidades**

- Arrastar para reordenar

Problemas relacionados: N-06 (Desfazer conclusão antiga desalinha a fila)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Bom, ponteiro frágil. |
| UX/UI | 7 | Flexível. |
| Completude funcional | 8 | Cobre os dois modos. |
| Maturidade | 7 | Persistido. |

### Treino (edição) — `/workouts/[id]`

**Objetivo:** Nome e exercícios do treino. **Contexto:** Dentro do planejamento. **Importância no fluxo principal:** Média.

Arquivos: `src/app/workouts/[id].tsx`

<p><img src="screens/workout.jpg" width="200" alt="Treino próprio com cardio manual."></p>

- *workout:* Treino próprio com cardio manual.

**Funciona**

- Renomear
- Adicionar musculação ou cardio
- Remover exercício
- Excluir treino com confirmação
- Treino de treinador bloqueado

**Parcial**

- Não edita séries, carga ou minutos de exercício já adicionado (N-03)

**UX/UI (+ positivo, − negativo)**

- + Confirmação ao excluir
- − Sem reordenar exercícios

Estados: carregando **n/a** · vazio **sim** · erro **sim** · sucesso **sim**

**Técnica**

- saveWorkouts substitui o treino inteiro (H-02)

**Oportunidades**

- Editar e reordenar exercícios
- Duplicar treino

Problemas relacionados: N-03 (Registros não podem ser editados)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Correto. |
| UX/UI | 7 | Protegido. |
| Completude funcional | 6 | Edição parcial. |
| Maturidade | 7 | Persistido. |

### Sessão de treino — `/workout-session`

**Objetivo:** Executar o treino com cronômetro. **Contexto:** Durante o treino. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/workout-session.tsx`

<p><img src="screens/session.jpg" width="200" alt="Sessão cronometrada com um exercício concluído."> <img src="screens/dialog-leave-session.jpg" width="200" alt="Confirmação ao sair da sessão."></p>

- *session:* Sessão cronometrada com um exercício concluído.
- *dialog-leave-session:* Confirmação ao sair da sessão.

**Funciona**

- Cronômetro por timestamps
- Valores planejados editáveis
- Concluir/desfazer exercício
- Sensação 0–5
- Confirmação ao sair

**Parcial**

- Perdida se o app fechar (N-24)

**UX/UI (+ positivo, − negativo)**

- + Saída protegida
- − Sem descanso, séries ou tela ligada

Estados: carregando **n/a** · vazio **sim** · erro **parcial** · sucesso **sim**

**Técnica**

- usePreventRemove bem aplicado
- 0 kcal sem MET (N-08)

**Oportunidades**

- Descanso, séries, keep-awake, retomar

Problemas relacionados: N-08 (Exercício manual entra com 0 kcal), N-24 (Sessão de treino não sobrevive ao fechamento)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Fluxo de saída correto. |
| UX/UI | 7 | Falta o essencial da série. |
| Completude funcional | 6 | Sem descanso e séries. |
| Maturidade | 6 | Estado só na tela. |

### Treinador (lista) — `/(tabs)/trainers`

**Objetivo:** Encontrar treinadores. **Contexto:** Descoberta. **Importância no fluxo principal:** Média.

Arquivos: `src/app/(tabs)/trainers.tsx`, `src/context/catalog.tsx`, `src/data/supabase/catalog.ts`

<p><img src="screens/trainers.jpg" width="200" alt="Catálogo de treinadores carregado do seed."></p>

- *trainers:* Catálogo de treinadores carregado do seed.

**Funciona**

- Catálogo do banco (seed)
- Busca por nome

**Apenas visual ou demonstrativo**

- Treinadores, números e fotos são dados de seed

**UX/UI (+ positivo, − negativo)**

- − Sem filtros
- − Texto de vazio com aspas vazias (N-25)

Estados: carregando **geral** · vazio **sim** · erro **geral** · sucesso **sim**

**Técnica**

- Catálogo carregado com os dados da conta

**Oportunidades**

- Filtros por objetivo

Problemas relacionados: N-25 (Ícone e textos pequenos inconsistentes)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Vem do banco. |
| UX/UI | 7 | Simples. |
| Completude funcional | 6 | Sem filtros. |
| Maturidade | 5 | Conteúdo ainda de exemplo. |

### Perfil do treinador — `/trainer/[id]`

**Objetivo:** Apresentar o treinador e os pacotes. **Contexto:** Decisão de seguir. **Importância no fluxo principal:** Média.

Arquivos: `src/app/trainer/[id].tsx`

<p><img src="screens/trainer.jpg" width="200" alt="Perfil do treinador."></p>

- *trainer:* Perfil do treinador.

**Funciona**

- Bio, números, Instagram
- Conversar
- Pacotes com Você aderiu

**Apenas visual ou demonstrativo**

- Números do seed

**UX/UI (+ positivo, − negativo)**

- + Rótulos de acessibilidade
- − Conversar leva a chat sem resposta

Estados: carregando **geral** · vazio **sim** · erro **geral** · sucesso **sim**

**Técnica**

- Linking sem tratamento de falha

**Oportunidades**

- Mostrar tempo de resposta quando houver

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Correto. |
| UX/UI | 7 | Bem apresentado. |
| Completude funcional | 6 | Sem treinador real. |
| Maturidade | 5 | Conteúdo de seed. |

### Pacote de treinos — `/trainer/package/[id]`

**Objetivo:** Treinos, comentários e adesão. **Contexto:** Decisão de seguir o programa. **Importância no fluxo principal:** Alta.

Arquivos: `src/app/trainer/package/[id].tsx`, `src/context/coaching.tsx`

<p><img src="screens/package.jpg" width="200" alt="Pacote com treinos, comentários e Aderir."></p>

- *package:* Pacote com treinos, comentários e Aderir.

**Funciona**

- Aderir com confirmação se houver plano
- Sair com confirmação
- Ver planejamento
- Adesão salva por conta

**Parcial**

- Sair apaga histórico (N-07)
- Duração em semanas não acompanhada

**Apenas visual ou demonstrativo**

- Comentários do seed

**UX/UI (+ positivo, − negativo)**

- + Diálogos bem escritos
- − Sem preço, vigência ou progresso

Estados: carregando **geral** · vazio **sim** · erro **sim** · sucesso **sim**

**Técnica**

- Composição de contextos correta

**Oportunidades**

- Progresso no programa
- Avaliar

Problemas relacionados: N-07 (Sair do pacote apaga o histórico ligado a ele)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Bem composto, perde histórico. |
| UX/UI | 8 | Protegido e claro. |
| Completude funcional | 6 | Sem acompanhamento. |
| Maturidade | 6 | Persistido. |

### Treino do pacote — `/trainer/workout`

**Objetivo:** Ver um treino antes de aderir. **Contexto:** Avaliação. **Importância no fluxo principal:** Baixa.

Arquivos: `src/app/trainer/workout.tsx`

<p><img src="screens/package-workout.jpg" width="200" alt="Treino do pacote com notas do treinador."></p>

- *package-workout:* Treino do pacote com notas do treinador.

**Funciona**

- Descrição e exercícios com notas

**UX/UI (+ positivo, − negativo)**

- − Sem demonstração dos exercícios

Estados: carregando **n/a** · vazio **sim** · erro **n/a** · sucesso **sim**

**Técnica**

- Rota por índice do treino no pacote

**Oportunidades**

- Id estável

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Pequena. |
| UX/UI | 7 | Objetiva. |
| Completude funcional | 7 | Sem demonstração. |
| Maturidade | 6 | Índice frágil se o pacote mudar. |

### Chat com o treinador — `/chat/[trainerId]`

**Objetivo:** Tirar dúvidas. **Contexto:** Durante o programa. **Importância no fluxo principal:** Média.

Arquivos: `src/app/chat/[trainerId].tsx`, `src/context/chat.tsx`, `src/data/supabase/chat.ts`

<p><img src="screens/chat.jpg" width="200" alt="Chat com aviso de que o treinador ainda não responde pelo app."></p>

- *chat:* Chat com aviso de que o treinador ainda não responde pelo app.

**Funciona**

- Mensagens gravadas no banco e recebidas em tempo real
- Aviso de que o treinador ainda não responde
- Composer que cresce

**Parcial**

- Ninguém do outro lado lê ou responde

**UX/UI (+ positivo, − negativo)**

- + Expectativa ajustada pelo aviso
- − Sem status de envio por mensagem

Estados: carregando **geral** · vazio **sim** · erro **aviso** · sucesso **sim**

**Técnica**

- RLS só permite enviar como aluno
- Histórico inteiro carregado (N-10)

**Oportunidades**

- Painel do treinador e push

Problemas relacionados: N-10 (Histórico completo carregado na abertura)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Realtime e RLS corretos. |
| UX/UI | 7 | Honesta com o usuário. |
| Completude funcional | 4 | Falta o destinatário. |
| Maturidade | 5 | Infra pronta, produto não. |

### Tarefas — `/(tabs)/tasks`

**Objetivo:** Checklist diário. **Contexto:** Rotina. **Importância no fluxo principal:** Média.

Arquivos: `src/app/(tabs)/tasks.tsx`, `src/components/tasks/task-section.tsx`, `src/context/tasks.tsx`

<p><img src="screens/tasks.jpg" width="200" alt="Tarefa diária com subtarefas e tarefa avulsa."></p>

- *tasks:* Tarefa diária com subtarefas e tarefa avulsa.

**Funciona**

- Repetição por dias ou semanas
- Subtarefas sincronizadas
- Remover com Desfazer
- Persistido

**Parcial**

- Sem tela de edição (N-03)

**Redundâncias e simplificações**

- Widget no Início

**UX/UI (+ positivo, − negativo)**

- + Desfazer
- − Sem lembrete
- − Genérica para um app de treino

Estados: carregando **geral** · vazio **sim** · erro **aviso** · sucesso **sim**

**Técnica**

- Regras testadas em tasks.test.ts

**Oportunidades**

- Hábitos de saúde e lembretes

Problemas relacionados: N-03 (Registros não podem ser editados), N-15 (Seis destinos na barra de navegação)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 8 | Domínio testado. |
| UX/UI | 7 | Funciona; sem lembrete. |
| Completude funcional | 6 | Sem edição. |
| Maturidade | 7 | Persistida. |

### Nova tarefa / subtarefa — `/add-task`

**Objetivo:** Criar tarefa com repetição. **Contexto:** A partir de Tarefas. **Importância no fluxo principal:** Média.

Arquivos: `src/app/add-task.tsx`

<p><img src="screens/add-task.jpg" width="200" alt="Nova tarefa com repetição diária."></p>

- *add-task:* Nova tarefa com repetição diária.

**Funciona**

- Não repete, diária, semanal, personalizada
- Subtarefas na criação
- Modo subtarefa

**UX/UI (+ positivo, − negativo)**

- + Radio acessível
- − Intervalo inválido só desabilita o botão

Estados: carregando **n/a** · vazio **n/a** · erro **parcial** · sucesso **sim**

**Técnica**

- Uma tela para dois casos

**Oportunidades**

- Dias específicos da semana
- Horário

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Enxuta. |
| UX/UI | 7 | Feedback silencioso. |
| Completude funcional | 6 | Sem dias específicos e horário. |
| Maturidade | 7 | Sem modo edição. |

### Perfil — `/(tabs)/profile`

**Objetivo:** Dados pessoais, peso, meta e sair. **Contexto:** Consulta ocasional. **Importância no fluxo principal:** Média.

Arquivos: `src/app/(tabs)/profile.tsx`, `src/components/weight/weight-dialog.tsx`

<p><img src="screens/profile.jpg" width="200" alt="Perfil com idade calculada e meta de peso."> <img src="screens/dialog-weight.jpg" width="200" alt="Registrar peso com data da medição."> <img src="screens/dialog-signout.jpg" width="200" alt="Confirmação de saída; no modo demo avisa que os dados se perdem."></p>

- *profile:* Perfil com idade calculada e meta de peso.
- *dialog-weight:* Registrar peso com data da medição.
- *dialog-signout:* Confirmação de saída; no modo demo avisa que os dados se perdem.

**Funciona**

- Idade calculada da data de nascimento
- Registrar peso com data da medição
- Meta de peso
- Sair com confirmação

**Parcial**

- Nada além de peso e meta é editável (N-04)

**Redundâncias e simplificações**

- Registrar peso também no Início

**UX/UI (+ positivo, − negativo)**

- + Diálogos de peso e saída claros
- − Sem configurações, privacidade ou excluir conta (N-05)

Estados: carregando **geral** · vazio **sim** · erro **sim** · sucesso **sim**

**Técnica**

- Fallback para MOCK_PROFILE (N-17)
- signOut global (N-12)

**Oportunidades**

- Editar perfil e configurações

Problemas relacionados: N-04 (Perfil sem edição e sem configurações), N-05 (Sem exclusão de conta, exportação ou consentimento), N-12 (Sair desconecta todos os aparelhos), N-17 (Dados de exemplo como reserva em telas reais)

| Critério | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7 | Peso com data agora; fallback de mock. |
| UX/UI | 6 | Sem área de conta. |
| Completude funcional | 5 | Faltam edição e conta. |
| Maturidade | 6 | Persistido. |

## 3. Features

| ID | Feature | Importância | Estado | Qualidade | Prioridade |
|---|---|---|---|---|---|
| F-01 | Conta com e-mail e senha (Supabase) | ESSENCIAL | Completa | 8/10 | P2 |
| F-02 | Login com Google | IMPORTANTE | Parcialmente implementada | 6/10 | P2 |
| F-03 | Recuperação de senha por link | ESSENCIAL | Completa | 9/10 | P3 |
| F-04 | Cadastro com dados corporais e Complete seu perfil | ESSENCIAL | Com problemas identificados | 7/10 | P1 |
| F-05 | Sessão salva e preparação pós-login | ESSENCIAL | Com problemas identificados | 7/10 | P1 |
| F-06 | Sincronização por conta (repositórios + fila) | ESSENCIAL | Com problemas identificados | 7/10 | P1 |
| F-07 | Modo demo | COMPLEMENTAR | Completa | 8/10 | P3 |
| F-08 | Dashboard do dia | ESSENCIAL | Parcialmente implementada | 6/10 | P1 |
| F-09 | Personalização do dashboard | COMPLEMENTAR | Completa | 7/10 | P3 |
| F-10 | Diário alimentar | ESSENCIAL | Parcialmente implementada | 8/10 | P1 |
| F-11 | Busca TACO + Open Food Facts | ESSENCIAL | Completa | 8/10 | P2 |
| F-12 | Refeições configuráveis | COMPLEMENTAR | Completa | 7/10 | P3 |
| F-13 | Exercício avulso (catálogo ou manual) | IMPORTANTE | Com problemas identificados | 6/10 | P2 |
| F-14 | Plano semanal ou em fila | ESSENCIAL | Com problemas identificados | 7/10 | P1 |
| F-15 | Sessão cronometrada | IMPORTANTE | Parcialmente implementada | 7/10 | P2 |
| F-16 | Catálogo de treinadores | IMPORTANTE | Parcialmente implementada | 6/10 | P2 |
| F-17 | Aderir a pacote | IMPORTANTE | Com problemas identificados | 7/10 | P2 |
| F-18 | Comentários de pacotes | COMPLEMENTAR | Apenas visual | 5/10 | P3 |
| F-19 | Chat em tempo real | IMPORTANTE | Parcialmente implementada | 6/10 | P1 |
| F-20 | Tarefas com repetição | QUESTIONÁVEL | Parcialmente implementada | 7/10 | P2 |
| F-21 | Peso e meta | ESSENCIAL | Completa | 8/10 | P3 |
| F-22 | Perfil e conta | IMPORTANTE | Parcialmente implementada | 5/10 | P0 |
| F-23 | Desfazer e confirmações | IMPORTANTE | Completa | 8/10 | P3 |
| F-24 | Design system Material 3 | IMPORTANTE | Completa | 8/10 | P3 |
| F-25 | Abas com swipe (6) | COMPLEMENTAR | Com problemas identificados | 7/10 | P2 |
| F-26 | Entrega EAS com checagens | IMPORTANTE | Com problemas identificados | 7/10 | P0 |

#### F-01 · Conta com e-mail e senha (Supabase)

- **Problema que resolve:** Identificar o usuário e proteger seus dados.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Login, cadastro com confirmação por link, erros traduzidos, PKCE.
- **Intuitiva:** Sim.
- **Etapa faltando:** Consentimento e termos no cadastro.
- **Impacto da ausência:** Sem conta não há sincronização.
- **Problemas:** N-05

<p><img src="screens/login.jpg" width="200" alt="Login em pt-BR com Esqueci minha senha e Google."> <img src="screens/signup-account.jpg" width="200" alt="Cadastro, etapa 1: nome, e-mail, senha e confirmação."> <img src="screens/signup-confirm.jpg" width="200" alt="Confirme seu e-mail, com reenvio."></p>

- *login:* Login em pt-BR com Esqueci minha senha e Google.
- *signup-account:* Cadastro, etapa 1: nome, e-mail, senha e confirmação.
- *signup-confirm:* Confirme seu e-mail, com reenvio.

#### F-02 · Login com Google

- **Problema que resolve:** Entrar sem criar senha.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Android com idToken e Complete seu perfil; iOS não configurado.
- **Intuitiva:** Sim.
- **Etapa faltando:** iOS e variáveis no EAS.
- **Impacto da ausência:** Mais atrito no cadastro.
- **Problemas:** N-14

<p><img src="screens/login.jpg" width="200" alt="Login em pt-BR com Esqueci minha senha e Google."></p>

- *login:* Login em pt-BR com Esqueci minha senha e Google.

#### F-03 · Recuperação de senha por link

- **Problema que resolve:** Voltar a acessar a conta.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Três etapas, link expirado tratado, encerra sessões após trocar.
- **Intuitiva:** Sim.
- **Etapa faltando:** Nenhuma.
- **Impacto da ausência:** Contas perdidas.

<p><img src="screens/forgot-password.jpg" width="200" alt="Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível."> <img src="screens/forgot-check-email.jpg" width="200" alt="Verifique seu e-mail, com reenvio liberado após 60 s."> <img src="screens/forgot-new-password.jpg" width="200" alt="Nova senha aberta sem código: estado de link inválido com ação para pedir outro."></p>

- *forgot-password:* Esqueceu a senha: no modo demo, a recuperação mostra que não está disponível.
- *forgot-check-email:* Verifique seu e-mail, com reenvio liberado após 60 s.
- *forgot-new-password:* Nova senha aberta sem código: estado de link inválido com ação para pedir outro.

#### F-04 · Cadastro com dados corporais e Complete seu perfil

- **Problema que resolve:** Coletar dados para personalizar.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Dados gravados por trigger; não alimentam nenhum cálculo de meta.
- **Intuitiva:** Sim.
- **Etapa faltando:** Objetivo e nível de atividade.
- **Impacto da ausência:** Sem base para metas pessoais.
- **Problemas:** N-01

<p><img src="screens/signup-details.jpg" width="200" alt="Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01)."></p>

- *signup-details:* Cadastro, etapa 2: data de nascimento, sexo, altura e peso. A descrição promete estimar calorias (N-01).

#### F-05 · Sessão salva e preparação pós-login

- **Problema que resolve:** Abrir o app já logado com os dados prontos.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Sessão no expo-sqlite; carrega perfil e 9 domínios antes das abas, tudo ou nada.
- **Intuitiva:** Sim.
- **Etapa faltando:** Erro por seção.
- **Impacto da ausência:** Login a cada abertura.
- **Problemas:** N-09, N-10

*Sem captura: o carregamento dura poucos quadros e o erro exige falha real do Supabase.*

#### F-06 · Sincronização por conta (repositórios + fila)

- **Problema que resolve:** Guardar e recuperar dados em qualquer aparelho.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Atualização otimista, fila ordenada, aviso com Tentar novamente; fila só em memória e histórico inteiro.
- **Intuitiva:** Sim, invisível ao usuário.
- **Etapa faltando:** Fila persistida e carga por período.
- **Impacto da ausência:** Dados perdidos ao fechar o app.
- **Problemas:** N-10, N-11

<p><img src="screens/diary-undo.jpg" width="200" alt="Alimento removido com snackbar de Desfazer."></p>

- *diary-undo:* Alimento removido com snackbar de Desfazer.

#### F-07 · Modo demo

- **Problema que resolve:** Usar e testar o front sem backend.
- **Faz sentido para o produto:** Sim para a estratégia de front primeiro e para demonstrações.
- **Implementação:** Mesma interface de repositórios, dados em memória, aviso ao sair.
- **Intuitiva:** Sim.
- **Etapa faltando:** Nenhuma.
- **Impacto da ausência:** Front dependeria do Supabase para qualquer teste.

<p><img src="screens/dialog-signout.jpg" width="200" alt="Confirmação de saída; no modo demo avisa que os dados se perdem."></p>

- *dialog-signout:* Confirmação de saída; no modo demo avisa que os dados se perdem.

#### F-08 · Dashboard do dia

- **Problema que resolve:** Ver como está o dia.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Consumo, exercício e peso reais; metas fixas e passos fictícios.
- **Intuitiva:** Sim.
- **Etapa faltando:** Metas pessoais e passos reais.
- **Impacto da ausência:** Teria de abrir cada aba.
- **Problemas:** N-01, N-02

<p><img src="screens/home.jpg" width="200" alt="Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."></p>

- *home:* Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02).

#### F-09 · Personalização do dashboard

- **Problema que resolve:** Escolher o que ver primeiro.
- **Faz sentido para o produto:** Útil, não central.
- **Implementação:** Arrastar acessível, layout salvo por conta; arquivo de 718 linhas.
- **Intuitiva:** Sim.
- **Etapa faltando:** Nenhuma.
- **Impacto da ausência:** Baixo.
- **Problemas:** N-20

<p><img src="screens/home-edit.jpg" width="200" alt="Modo de edição da tela inicial."></p>

- *home-edit:* Modo de edição da tela inicial.

#### F-10 · Diário alimentar

- **Problema que resolve:** Registrar o que foi comido.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Adicionar, remover com desfazer, sincronizado; sem edição.
- **Intuitiva:** Sim.
- **Etapa faltando:** Editar e copiar refeição.
- **Impacto da ausência:** Metade da proposta.
- **Problemas:** N-03

<p><img src="screens/diary.jpg" width="200" alt="Diário com café da manhã e almoço."> <img src="screens/food-details.jpg" width="200" alt="Quantidade, refeição e nutrientes."></p>

- *diary:* Diário com café da manhã e almoço.
- *food-details:* Quantidade, refeição e nutrientes.

#### F-11 · Busca TACO + Open Food Facts

- **Problema que resolve:** Encontrar alimentos brasileiros e produtos.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Instantânea e offline na TACO, online com debounce.
- **Intuitiva:** Sim.
- **Etapa faltando:** Código de barras e recentes.
- **Impacto da ausência:** Registro manual inviável.

<p><img src="screens/log-food.jpg" width="200" alt="Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria."></p>

- *log-food:* Busca 'pao frances': TACO na hora; Open Food Facts bloqueado no ambiente da auditoria.

#### F-12 · Refeições configuráveis

- **Problema que resolve:** Adaptar o diário à rotina.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Correta; remover sem desfazer.
- **Intuitiva:** Sim.
- **Etapa faltando:** Reordenar.
- **Impacto da ausência:** Baixo.
- **Problemas:** N-26

<p><img src="screens/meals.jpg" width="200" alt="Refeições do diário; remover não tem desfazer (N-26)."></p>

- *meals:* Refeições do diário; remover não tem desfazer (N-26).

#### F-13 · Exercício avulso (catálogo ou manual)

- **Problema que resolve:** Registrar atividade fora do plano.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Filtro por categoria, manual com categoria; inglês e 0 kcal sem MET.
- **Intuitiva:** Parcial.
- **Etapa faltando:** Edição e busca em português.
- **Impacto da ausência:** Saldo calórico incompleto.
- **Problemas:** N-08, N-22

<p><img src="screens/log-exercise.jpg" width="200" alt="Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria."> <img src="screens/exercise-details.jpg" width="200" alt="Exercício manual: 30 min e 0 kcal, sem MET (N-08)."></p>

- *log-exercise:* Filtro por categoria; ExerciseDB bloqueado no ambiente da auditoria.
- *exercise-details:* Exercício manual: 30 min e 0 kcal, sem MET (N-08).

#### F-14 · Plano semanal ou em fila

- **Problema que resolve:** Saber o treino de hoje.
- **Faz sentido para o produto:** Sim; a fila é diferencial.
- **Implementação:** Persistido; ponteiro da fila frágil; exercícios não editáveis.
- **Intuitiva:** Sim.
- **Etapa faltando:** Editar e reordenar exercícios.
- **Impacto da ausência:** App vira só registro.
- **Problemas:** N-03, N-06

<p><img src="screens/workouts.jpg" width="200" alt="Planejamento depois de aderir ao pacote."> <img src="screens/workout.jpg" width="200" alt="Treino próprio com cardio manual."></p>

- *workouts:* Planejamento depois de aderir ao pacote.
- *workout:* Treino próprio com cardio manual.

#### F-15 · Sessão cronometrada

- **Problema que resolve:** Guiar o treino em execução.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Cronômetro, sensação, saída protegida; sem descanso, séries ou retomada.
- **Intuitiva:** Sim.
- **Etapa faltando:** Descanso e séries.
- **Impacto da ausência:** Registro só depois do treino.
- **Problemas:** N-24

<p><img src="screens/session.jpg" width="200" alt="Sessão cronometrada com um exercício concluído."> <img src="screens/dialog-leave-session.jpg" width="200" alt="Confirmação ao sair da sessão."></p>

- *session:* Sessão cronometrada com um exercício concluído.
- *dialog-leave-session:* Confirmação ao sair da sessão.

#### F-16 · Catálogo de treinadores

- **Problema que resolve:** Descobrir programas.
- **Faz sentido para o produto:** Sim, diferencial do produto.
- **Implementação:** Vem do banco, conteúdo de seed, sem filtros.
- **Intuitiva:** Sim.
- **Etapa faltando:** Treinadores reais e filtros.
- **Impacto da ausência:** Produto vira diário comum.
- **Problemas:** N-25

<p><img src="screens/trainers.jpg" width="200" alt="Catálogo de treinadores carregado do seed."> <img src="screens/trainer.jpg" width="200" alt="Perfil do treinador."></p>

- *trainers:* Catálogo de treinadores carregado do seed.
- *trainer:* Perfil do treinador.

#### F-17 · Aderir a pacote

- **Problema que resolve:** Transformar o programa em plano.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Confirmações corretas; sair apaga histórico.
- **Intuitiva:** Sim.
- **Etapa faltando:** Progresso no programa.
- **Impacto da ausência:** Catálogo só leitura.
- **Problemas:** N-07

<p><img src="screens/package.jpg" width="200" alt="Pacote com treinos, comentários e Aderir."> <img src="screens/package-workout.jpg" width="200" alt="Treino do pacote com notas do treinador."></p>

- *package:* Pacote com treinos, comentários e Aderir.
- *package-workout:* Treino do pacote com notas do treinador.

#### F-18 · Comentários de pacotes

- **Problema que resolve:** Prova social.
- **Faz sentido para o produto:** Quando forem reais.
- **Implementação:** Leitura do seed; aluno não avalia.
- **Intuitiva:** Sim.
- **Etapa faltando:** Avaliar.
- **Impacto da ausência:** Baixo.

<p><img src="screens/package.jpg" width="200" alt="Pacote com treinos, comentários e Aderir."></p>

- *package:* Pacote com treinos, comentários e Aderir.

#### F-19 · Chat em tempo real

- **Problema que resolve:** Tirar dúvidas com o treinador.
- **Faz sentido para o produto:** Sim, com o lado do treinador.
- **Implementação:** Realtime e RLS prontos; ninguém responde; aviso na tela.
- **Intuitiva:** Sim.
- **Etapa faltando:** Painel do treinador e push.
- **Impacto da ausência:** Hoje, nenhuma; o aviso evita frustração.
- **Problemas:** N-10

<p><img src="screens/chat.jpg" width="200" alt="Chat com aviso de que o treinador ainda não responde pelo app."></p>

- *chat:* Chat com aviso de que o treinador ainda não responde pelo app.

#### F-20 · Tarefas com repetição

- **Problema que resolve:** Organizar rotina.
- **Faz sentido para o produto:** Pouco: genérica e fora do domínio de saúde.
- **Implementação:** Regras testadas e persistidas; sem edição nem lembrete.
- **Intuitiva:** Sim.
- **Etapa faltando:** Lembretes e ligação com metas.
- **Impacto da ausência:** Baixo; ocupa uma aba.
- **Problemas:** N-03, N-15

<p><img src="screens/tasks.jpg" width="200" alt="Tarefa diária com subtarefas e tarefa avulsa."> <img src="screens/add-task.jpg" width="200" alt="Nova tarefa com repetição diária."></p>

- *tasks:* Tarefa diária com subtarefas e tarefa avulsa.
- *add-task:* Nova tarefa com repetição diária.

#### F-21 · Peso e meta

- **Problema que resolve:** Acompanhar o resultado principal.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Pesagem com data, meta, gráfico por período, fonte única.
- **Intuitiva:** Sim.
- **Etapa faltando:** Editar pesagem.
- **Impacto da ausência:** Sem medida de progresso.

<p><img src="screens/profile.jpg" width="200" alt="Perfil com idade calculada e meta de peso."> <img src="screens/dialog-weight.jpg" width="200" alt="Registrar peso com data da medição."> <img src="screens/home.jpg" width="200" alt="Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."></p>

- *profile:* Perfil com idade calculada e meta de peso.
- *dialog-weight:* Registrar peso com data da medição.
- *home:* Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02).

#### F-22 · Perfil e conta

- **Problema que resolve:** Manter dados pessoais e a conta.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Somente leitura; sem configurações, exclusão ou exportação.
- **Intuitiva:** Sim.
- **Etapa faltando:** Editar, configurar, excluir conta.
- **Impacto da ausência:** Bloqueia publicação na loja.
- **Problemas:** N-04, N-05, N-12

<p><img src="screens/profile.jpg" width="200" alt="Perfil com idade calculada e meta de peso."> <img src="screens/dialog-signout.jpg" width="200" alt="Confirmação de saída; no modo demo avisa que os dados se perdem."></p>

- *profile:* Perfil com idade calculada e meta de peso.
- *dialog-signout:* Confirmação de saída; no modo demo avisa que os dados se perdem.

#### F-23 · Desfazer e confirmações

- **Problema que resolve:** Evitar perdas por toque acidental.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Snackbar em alimentos, exercícios e tarefas; diálogos em ações de alto impacto; falta em refeições.
- **Intuitiva:** Sim.
- **Etapa faltando:** Refeições.
- **Impacto da ausência:** Perdas acidentais.
- **Problemas:** N-26

<p><img src="screens/diary-undo.jpg" width="200" alt="Alimento removido com snackbar de Desfazer."> <img src="screens/dialog-leave-session.jpg" width="200" alt="Confirmação ao sair da sessão."> <img src="screens/dialog-signout.jpg" width="200" alt="Confirmação de saída; no modo demo avisa que os dados se perdem."></p>

- *diary-undo:* Alimento removido com snackbar de Desfazer.
- *dialog-leave-session:* Confirmação ao sair da sessão.
- *dialog-signout:* Confirmação de saída; no modo demo avisa que os dados se perdem.

#### F-24 · Design system Material 3

- **Problema que resolve:** Consistência e tema escuro.
- **Faz sentido para o produto:** Sim.
- **Implementação:** Tokens gerados do ícone.
- **Intuitiva:** n/a
- **Etapa faltando:** Documentação.
- **Impacto da ausência:** Inconsistência.

<p><img src="screens/home.jpg" width="200" alt="Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."> <img src="screens/home-dark.jpg" width="200" alt="Tema escuro numa conta nova."></p>

- *home:* Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02).
- *home-dark:* Tema escuro numa conta nova.

#### F-25 · Abas com swipe (6)

- **Problema que resolve:** Navegar entre áreas.
- **Faz sentido para o produto:** Sim, destinos demais.
- **Implementação:** Pager próprio.
- **Intuitiva:** Sim.
- **Etapa faltando:** Reduzir para 5.
- **Impacto da ausência:** n/a
- **Problemas:** N-15

<p><img src="screens/home.jpg" width="200" alt="Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02)."> <img src="screens/exercise.jpg" width="200" alt="Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante."></p>

- *home:* Início com consumo e exercício reais, meta fixa de 2.200 kcal e 6.840 passos fictícios (N-01, N-02).
- *exercise:* Exercícios com treino do dia (descanso hoje) e lista única com botão flutuante.

#### F-26 · Entrega EAS com checagens

- **Problema que resolve:** Publicar com segurança.
- **Faz sentido para o produto:** Sim.
- **Implementação:** check-env, lint, typecheck e testes antes do OTA; sem checagem nativa; só Android.
- **Intuitiva:** n/a
- **Etapa faltando:** expo install --check, expo-doctor, monitoramento.
- **Impacto da ausência:** Crashes chegando ao aparelho.
- **Problemas:** N-13, N-14

*Sem interface: configuração de build e atualização (.eas/workflows/preview.yml).*

## 4. Features ausentes

### P0

- **Exclusão de conta, exportação e consentimento** (Privacidade): Requisito da Play Store e da LGPD para um app que guarda dados de saúde (N-05).
- **Verificação nativa e monitoramento de erros** (Operação): Um crash de abertura chegou ao aparelho e só foi diagnosticado por relatório de bugs manual (N-13). Sem isso, cada OTA é um risco invisível.

### P1

- **Metas calculadas do perfil** (Personalização): O app coleta os dados e promete estimar; o anel de calorias e os macros não têm significado com valores fixos (N-01).
- **Edição de registros e do perfil** (Fluxos incompletos): Corrigir é a ação mais comum num diário (N-03, N-04).
- **Tela de configurações** (Personalização): Sem lugar para metas, conta, privacidade e notificações.
- **Histórico e progressão de treinos** (Relatórios): Séries, cargas e sensação já são gravadas no banco e não aparecem em lugar nenhum.
- **Carregamento por período e fila persistida** (Escalabilidade): Evita abertura cada vez mais lenta e perda de mudanças offline (N-10, N-11).
- **Lado do treinador no chat** (Marketplace): O chat grava mensagens reais que ninguém lê; ou se constrói o painel, ou o chat deve sair da tela do aluno.

### P2

- **Timer de descanso e registro por série** (Treino): A sessão registra um único valor por exercício.
- **Recentes, favoritos e copiar refeição** (Retenção): Reduz o atrito diário do registro.
- **Leitor de código de barras** (Integrações): Open Food Facts já é indexado por código de barras.
- **Lembretes locais** (Notificações): Treino do dia e tarefas dependem de o usuário abrir o app.
- **Passos via Health Connect / HealthKit** (Integrações): Substitui o número fictício (N-02).
- **Relatório semanal** (Relatórios): Peso, média de kcal e aderência ao plano numa visão só.
- **Build e login no iOS** (Plataforma): Sem build iOS hoje e com o Google Sign-In configurado só para Android (N-14); necessário se o público incluir usuários de iPhone.

### P3

- **Avaliação de pacotes pelos alunos** (Engajamento): Os comentários exibidos vêm do seed.
- **Pagamento de pacotes** (Monetização): Só se o modelo de negócio previr pacotes pagos; não há indício no código.

## 5. Problemas comprovados

Cada item foi confirmado no código. Severidade considera a fase de front-first.

| ID | Severidade | Área | Problema | Evidência |
|---|---|---|---|---|
| N-01 | alto | Metas | Metas fixas apesar do perfil completo | src/app/(tabs)/index.tsx:38 (data = MOCK_DASHBOARD); src/lib/dashboard-data.ts (2.200 kcal, macros, 400 kcal de exercício) |
| N-03 | alto | Funcionalidade | Registros não podem ser editados | src/data/types.ts: FoodLogRepository e ExerciseLogRepository só têm add/remove; tasks.update é usado só para marcar feito; workout-plan sem edição de exercício planejado |
| N-05 | alto | Privacidade | Sem exclusão de conta, exportação ou consentimento | Busca por 'excluir conta', 'deleteUser' e 'exportar' sem resultados em src/ e supabase/ |
| N-13 | alto | Entrega | CI não verifica compatibilidade nativa | .eas/workflows/preview.yml (sem expo install --check ou expo-doctor); commit 25f3a9b descreve o crash do ExpoSQLite por runtime incompatível |
| N-02 | médio | Dashboard | Passos fictícios na tela inicial | src/app/(tabs)/index.tsx:37 (TODO) e StepsTile com MOCK_DASHBOARD.steps |
| N-04 | médio | Conta | Perfil sem edição e sem configurações | src/app/(tabs)/profile.tsx (só registrar peso, meta e sair); CompleteProfile só aparece com perfil incompleto |
| N-06 | médio | Treinos | Desfazer conclusão antiga desalinha a fila | src/context/workout-plan.tsx:225 undoCompletion (queueIndex − 1 sem olhar a ordem das conclusões) |
| N-07 | médio | Treinadores | Sair do pacote apaga o histórico ligado a ele | src/context/coaching.tsx:58 leavePackage → removeWorkout; src/lib/workouts.ts:132 procura o treino concluído pelo id |
| N-08 | médio | Regras | Exercício manual entra com 0 kcal | src/app/workout-session.tsx:148 e captura exercise-details (Bicicleta ergométrica, 30 min, 0 kcal) |
| N-09 | médio | Arquitetura | Abertura tudo ou nada | src/app/(tabs)/_layout.tsx (erro em qualquer store mostra a tela de erro); src/hooks/use-user-data-status.ts |
| N-10 | médio | Escalabilidade | Histórico completo carregado na abertura | src/data/supabase/food-log.ts, exercise-log.ts e chat.ts usam selectAll paginando todas as linhas da conta |
| N-11 | médio | Dados | Fila de salvamento só em memória | src/data/use-user-store.ts (queue em useRef) |
| N-14 | médio | Entrega | iOS não configurado | app.json:38 iosUrlScheme de exemplo; sem ios.bundleIdentifier; workflow só Android |
| N-15 | médio | UX | Seis destinos na barra de navegação | src/constants/tabs.ts |
| N-23 | médio | Qualidade | Testes só no domínio puro | src/lib/__tests__ (4 suítes); supabase/tests/rls.sql fora do CI |
| N-12 | baixo | Segurança | Sair desconecta todos os aparelhos | src/context/session.tsx:258 supabase.auth.signOut() sem scope; o padrão do auth-js 2.118 é 'global' (GoTrueClient.d.ts) |
| N-16 | baixo | Código | Parsing de números duplicado | parseNumber em src/app/log-food/[id].tsx:19 e src/app/log-exercise/[id].tsx:32; parseDecimal em src/lib/profile.ts |
| N-17 | baixo | Código | Dados de exemplo como reserva em telas reais | profile?.weightKg ?? MOCK_PROFILE.weightKg em workout-card.tsx:43, weight-dialog.tsx:41, workout-session.tsx:74, log-exercise/[id].tsx:42; profile.tsx:35 |
| N-18 | baixo | Configuração | Variável de ambiente sem uso | EXPO_PUBLIC_FITEXERCISEDB_API_KEY em scripts/check-env.mjs e .env.example; nenhum uso em src/ |
| N-19 | baixo | Qualidade | Typecheck depende de arquivo gerado | tsconfig.json inclui expo-env.d.ts (git-ignored); o workflow cria o arquivo com echo |
| N-20 | baixo | Código | Componente de dashboard com 718 linhas | src/components/dashboard/draggable-dashboard.tsx |
| N-21 | baixo | Validação | Quantidade de alimento sem limite | src/app/log-food/[id].tsx:46 valid = gramsValue > 0 |
| N-22 | baixo | UX | Busca de exercícios em inglês e frágil | src/lib/exercisedb.ts (oss.exercisedb.dev, sem chave); log-exercise/index.tsx busca ao enviar |
| N-24 | baixo | Treinos | Sessão de treino não sobrevive ao fechamento | src/app/workout-session.tsx (estado na tela) |
| N-25 | baixo | UX | Ícone e textos pequenos inconsistentes | src/app/log-exercise/index.tsx:275 'Tentar novamente' com ícone de +; src/app/(tabs)/trainers.tsx mostra 'Nenhum treinador encontrado para “”' com catálogo vazio e sem busca |
| N-26 | baixo | UX | Remover refeição sem desfazer | src/app/meals.tsx:65 onRemove={() => removeMeal(meal.id)} |

**N-01 · Metas fixas apesar do perfil completo** (alto). O cadastro e a tela Complete seu perfil dizem 'Usamos esses dados para estimar suas calorias', mas toda conta vê meta de 2.200 kcal e os mesmos macros. *Correção sugerida:* Calcular TMB (Mifflin-St Jeor) com nascimento, sexo, altura e peso, mais objetivo e nível de atividade, com ajuste manual.

**N-02 · Passos fictícios na tela inicial** (médio). 6.840 de 10.000 passos aparecem para qualquer usuário, inclusive na conta criada nas capturas. *Correção sugerida:* Ocultar o widget até haver fonte real (Health Connect / HealthKit) ou mostrar 'Conectar passos'.

**N-03 · Registros não podem ser editados** (alto). Corrigir gramas, refeição, minutos, séries ou o nome de uma tarefa exige excluir e recriar. Com o desfazer novo, o atalho fica menos arriscado, mas continua em dois passos. *Correção sugerida:* Adicionar update nos repositórios e abrir a tela de criação em modo edição ao tocar no item.

**N-04 · Perfil sem edição e sem configurações** (médio). Nome, nascimento, sexo e altura ficam como no cadastro. Não há lugar para metas, unidades, notificações, privacidade ou conta. *Correção sugerida:* Tela de edição de perfil reaproveitando BodyDataStep e uma tela de configurações.

**N-05 · Sem exclusão de conta, exportação ou consentimento** (alto). O app guarda peso, alimentação e dados corporais. A LGPD trata dados de saúde como sensíveis, e a Play Store exige exclusão de conta dentro do app. *Correção sugerida:* Função no Supabase para excluir a conta e os dados, consentimento no cadastro, política acessível e exportação.

**N-06 · Desfazer conclusão antiga desalinha a fila** (médio). No modo fila, desfazer um dia anterior volta o ponteiro mesmo que treinos posteriores já tenham sido feitos. *Correção sugerida:* Derivar o próximo treino da última conclusão ou só permitir desfazer a mais recente; cobrir com teste em workouts.test.ts.

**N-07 · Sair do pacote apaga o histórico ligado a ele** (médio). Os dias concluídos com treinos do pacote deixam de mostrar o treino e o resumo da sessão. *Correção sugerida:* Arquivar treinos de pacote em vez de excluir ou guardar um resumo na conclusão.

**N-08 · Exercício manual entra com 0 kcal** (médio). Sem MET, o exercício digitado à mão não queima calorias no saldo da tela inicial. *Correção sugerida:* MET padrão por categoria ou campo de intensidade ao criar exercício manual.

**N-09 · Abertura tudo ou nada** (médio). Uma falha ao carregar só o chat ou só o catálogo impede o uso do diário e do treino. *Correção sugerida:* Mostrar as abas assim que sessão e perfil carregarem e tratar erro e carregamento por seção.

**N-10 · Histórico completo carregado na abertura** (médio). Depois de meses de uso, a abertura baixa todos os alimentos, exercícios e mensagens já registrados. *Correção sugerida:* Carregar por período (dia ou semana visível) e buscar o resto sob demanda.

**N-11 · Fila de salvamento só em memória** (médio). Se a conexão cair, a mudança aparece na tela e o aviso de erro surge, mas, se o app for fechado antes de tentar de novo, a mudança some. *Correção sugerida:* Persistir a fila no expo-sqlite e reenviar ao abrir ou ao reconectar.

**N-12 · Sair desconecta todos os aparelhos** (baixo). Sair no celular encerra também a sessão na web e em outros aparelhos. Faz sentido na troca de senha (já usa global de propósito), não no Sair comum. *Correção sugerida:* signOut({ scope: 'local' }) no Sair.

**N-13 · CI não verifica compatibilidade nativa** (alto). Um conjunto de versões incompatível passou por lint, typecheck e testes e fechou o app na abertura em aparelhos reais. *Correção sugerida:* Rodar npx expo install --check e npx expo-doctor no job de checks, e um smoke test do build quando o fingerprint mudar.

**N-14 · iOS não configurado** (médio). Não há build iOS possível hoje e o Google Sign-In no iOS não funcionaria. *Correção sugerida:* bundleIdentifier, URL scheme real e job iOS quando houver conta Apple.

**N-15 · Seis destinos na barra de navegação** (médio). A barra do Material 3 prevê de 3 a 5 destinos; nas capturas, 'Exercícios' e 'Treinador' ficam colados. *Correção sugerida:* Levar Tarefas para o Início (já há widget) ou Perfil para o cabeçalho.

**N-16 · Parsing de números duplicado** (baixo). Mesma regra em três lugares. *Correção sugerida:* Usar parseDecimal em todos.

**N-17 · Dados de exemplo como reserva em telas reais** (baixo). Se o perfil vier sem peso, cálculos de kcal usam o peso de exemplo silenciosamente. CompleteProfile torna isso raro, mas o caminho existe. *Correção sugerida:* Tratar perfil ausente explicitamente em vez de usar o mock.

**N-18 · Variável de ambiente sem uso** (baixo). Confunde quem configura o ambiente. *Correção sugerida:* Remover ou usar.

**N-19 · Typecheck depende de arquivo gerado** (baixo). Em clone novo, npm run typecheck falha até rodar expo start. *Correção sugerida:* Declarar os tipos de CSS num .d.ts versionado ou gerar no script typecheck.

**N-20 · Componente de dashboard com 718 linhas** (baixo). Gesto, geometria, rolagem, lixeira e acessibilidade no mesmo arquivo; o bug de NaN corrigido em bc153f6 nasceu ali. *Correção sugerida:* Extrair o cálculo do alvo de soltura (testável) e a lixeira.

**N-21 · Quantidade de alimento sem limite** (baixo). Aceita valores absurdos por erro de digitação. *Correção sugerida:* Limite com mensagem (ex.: 5.000 g).

**N-22 · Busca de exercícios em inglês e frágil** (baixo). Nomes e termos em inglês num app em pt-BR; serviço gratuito sem SLA. *Correção sugerida:* Cache próprio no Supabase com nomes traduzidos.

**N-23 · Testes só no domínio puro** (médio). A parte mais delicada (fila de salvamento, troca de conta, mapeamento dos repositórios) não tem teste. *Correção sugerida:* Testes de useUserStore e dos repositórios com cliente Supabase simulado; rls.sql no CI com supabase start.

**N-24 · Sessão de treino não sobrevive ao fechamento** (baixo). Se o sistema encerrar o app no meio do treino, tempo e séries se perdem. *Correção sugerida:* Persistir a sessão em andamento e oferecer retomar.

**N-25 · Ícone e textos pequenos inconsistentes** (baixo). Detalhes que passam impressão de inacabado. *Correção sugerida:* RotateCw no botão; texto próprio para catálogo vazio.

**N-26 · Remover refeição sem desfazer** (baixo). Único item removível sem desfazer nem confirmação; os alimentos continuam, mas a refeição sai do diário. *Correção sugerida:* Usar o mesmo showUndo dos outros diários.

### Hipóteses (não comprovadas)

- **H-01 · Abertura lenta com histórico grande:** Consequência provável de N-09 e N-10 em contas antigas; não medido.
- **H-02 · Conflito de edição entre aparelhos:** As gravações substituem o registro inteiro (ex.: tasks.update, saveWorkouts) sem controle de versão; duas edições simultâneas em aparelhos diferentes podem se sobrescrever. Não reproduzido.
- **H-03 · OTA em binário antigo:** O incidente do ExpoSQLite mostrou o mesmo binário recebendo JS novo por vários dias. Com fingerprint isso não deveria ocorrer; a origem (update manual ou build local) não foi verificada.

## 6. Fluxos de usuário

Legenda: ✅ funciona · ⚠️ fricção · ❌ quebra · ⬜ etapa inexistente

### Primeiro acesso e cadastro

```mermaid
flowchart LR
  s0["✅ Splash até ler a sessão"]
  s1["✅ Login → Criar conta"]
  s0 --> s1
  s2["✅ Conta: nome, e-mail, senha e confirmação"]
  s1 --> s2
  s3["⚠️ Sobre você: nascimento, sexo, altura, peso"]
  s2 --> s3
  s4["⚠️ Confirme seu e-mail"]
  s3 --> s4
  s5["✅ Link → entra no app"]
  s4 --> s5
  s6["❌ Início com meta fixa e passos fictícios"]
  s5 --> s6
  s7["⬜ Onboarding de objetivo"]
  s6 --> s7
```

- ⚠️ **Sobre você: nascimento, sexo, altura, peso:** Promete estimar calorias e não estima
- ⚠️ **Confirme seu e-mail:** Exige abrir o e-mail no mesmo celular
- ❌ **Início com meta fixa e passos fictícios:** N-01, N-02

O cadastro ficou completo e seguro; o fim do fluxo ainda entrega números que não são do usuário.

### Recuperação de senha

```mermaid
flowchart LR
  s0["✅ Esqueci minha senha"]
  s1["✅ E-mail (vem preenchido do login)"]
  s0 --> s1
  s2["✅ Verifique seu e-mail, reenviar em 60 s"]
  s1 --> s2
  s3["✅ Link → nova senha"]
  s2 --> s3
  s4["✅ Volta ao login com e-mail preenchido"]
  s3 --> s4
```


Fluxo completo, inclusive link expirado e link aberto em outro aparelho. Indisponível no modo demo, com mensagem.

### Login com Google

```mermaid
flowchart LR
  s0["✅ Continuar com Google"]
  s1["✅ idToken → Supabase"]
  s0 --> s1
  s2["✅ Complete seu perfil"]
  s1 --> s2
  s3["⬜ iOS"]
  s2 --> s3
```

- ✅ **Complete seu perfil:** Pede os dados corporais que o Google não traz
- ⬜ **iOS:** URL scheme de exemplo

Bem resolvido no Android; não verificado de ponta a ponta.

### Registrar uma refeição

```mermaid
flowchart LR
  s0["✅ Diário → Adicionar alimento"]
  s1["✅ Busca TACO + Open Food Facts"]
  s0 --> s1
  s2["✅ Quantidade e refeição"]
  s1 --> s2
  s3["✅ Salvo no Supabase em segundo plano"]
  s2 --> s3
  s4["✅ Remover com Desfazer"]
  s3 --> s4
  s5["⬜ Corrigir quantidade"]
  s4 --> s5
  s6["⬜ Repetir refeição de ontem"]
  s5 --> s6
```

- ⬜ **Corrigir quantidade:** N-03

O fluxo mais maduro; faltam edição e atalhos.

### Montar e executar um treino

```mermaid
flowchart LR
  s0["✅ Planejar treinos"]
  s1["⚠️ Adicionar exercício (catálogo ou manual)"]
  s0 --> s1
  s2["✅ Dias da semana ou fila"]
  s1 --> s2
  s3["✅ Iniciar treino"]
  s2 --> s3
  s4["⚠️ Concluir e registrar sensação"]
  s3 --> s4
  s5["⬜ Ver evolução das cargas"]
  s4 --> s5
```

- ⚠️ **Adicionar exercício (catálogo ou manual):** Inglês; manual com 0 kcal
- ⚠️ **Concluir e registrar sensação:** Sem descanso nem séries

Planejamento flexível; falta o retorno de progresso.

### Seguir um treinador

```mermaid
flowchart LR
  s0["✅ Treinador → perfil"]
  s1["✅ Pacote → Aderir (confirma se há plano)"]
  s0 --> s1
  s2["✅ Treinos no planejamento"]
  s1 --> s2
  s3["⚠️ Conversar"]
  s2 --> s3
  s4["❌ Sair do pacote (confirma)"]
  s3 --> s4
  s5["⬜ Avaliar o pacote"]
  s4 --> s5
```

- ⚠️ **Conversar:** Aviso de que ainda não responde
- ❌ **Sair do pacote (confirma):** Apaga histórico (N-07)

Proteções novas resolveram a perda do plano; falta o lado do treinador.

### Sair e trocar de conta

```mermaid
flowchart LR
  s0["✅ Perfil → Sair (confirma)"]
  s1["⚠️ Desconecta todos os aparelhos"]
  s0 --> s1
  s2["✅ Outra conta vê só os próprios dados"]
  s1 --> s2
```

- ⚠️ **Desconecta todos os aparelhos:** N-12

O vazamento entre contas da auditoria anterior foi resolvido.

### Recuperação de erros

```mermaid
flowchart LR
  s0["⚠️ Falha ao carregar → Tentar de novo / Sair"]
  s1["✅ Falha ao salvar → aviso com Tentar novamente"]
  s0 --> s1
  s2["❌ App fechado com mudanças não salvas"]
  s1 --> s2
  s3["✅ Erro de tela → Algo deu errado"]
  s2 --> s3
  s4["❌ Erro antes das rotas (módulo nativo)"]
  s3 --> s4
```

- ⚠️ **Falha ao carregar → Tentar de novo / Sair:** Bloqueia o app todo (N-09)
- ❌ **App fechado com mudanças não salvas:** N-11
- ❌ **Erro antes das rotas (módulo nativo):** Fecha o app (N-13)

Bem melhor que antes, com dois buracos: mudanças offline e erros nativos.

### Configurações e conta

```mermaid
flowchart LR
  s0["⬜ Editar perfil"]
  s1["⬜ Metas e unidades"]
  s0 --> s1
  s2["⬜ Excluir conta / exportar dados"]
  s1 --> s2
```

- ⬜ **Excluir conta / exportar dados:** N-05

Área inexistente.

## 7. Benchmark

> Não há documento de posicionamento no repositório. O público foi inferido do código: brasileiros (pt-BR, TACO, produtos do Brasil) que treinam com programas de personal trainers divulgados no Instagram. As referências vêm de conhecimento público sobre esses apps e não foram verificadas nesta auditoria.

| App | Segmento | Pontos fortes | Treina hoje | Oportunidade |
|---|---|---|---|---|
| MyFitnessPal | Diário alimentar | Base enorme, código de barras, metas calculadas, refeições salvas. | TACO offline é melhor para comida brasileira; faltam metas calculadas, edição, recentes e código de barras. | Diário rápido e brasileiro ligado ao treino. |
| FatSecret / Tecnonutri | Calorias no Brasil | Base brasileira, comunidade. | Mesmo público; o Treina já sincroniza entre aparelhos, mas não tem relatórios. | Dieta e treino num painel só. |
| Hevy / Strong | Musculação | Registro por série, descanso, histórico e recordes. | Plano semanal ou fila e sessão cronometrada; um valor por exercício e nenhum histórico visível. | Progressão de carga por exercício. |
| MFIT Personal / Tecnofit / Trainerize | Personal ↔ aluno | Prescrição, chat, cobrança. | Lado do aluno pronto (pacotes, adesão, chat em tempo real); lado do treinador inexistente. | Programas de influenciadores com execução guiada; o diferencial mais claro. |
| Samsung Health / Google Fit / Apple Saúde | Atividade | Passos e sono automáticos. | Passos fictícios. | Integrar via Health Connect / HealthKit. |

**Diferenciais a reforçar**

- Diário, treino e treinador no mesmo app, com o treino do pacote virando o treino do dia.
- TACO embarcada: busca instantânea e offline de alimentos brasileiros.
- Plano em fila para quem não treina em dias fixos.
- Dados sincronizados por conta com proteção por usuário no banco.

**O que não copiar**

- Feed social e desafios públicos: sem sinal de que seja o objetivo, e custa moderação.
- Base própria de alimentos colaborativa: TACO + Open Food Facts já cobrem bem.
- Tarefas genéricas como app de produtividade: melhor transformar em hábitos de saúde.

## 8. Scorecard

| Indicador | Nota | Justificativa |
|---|---|---|
| Qualidade técnica | 7,5 | Lint e typecheck limpos, 28 testes de domínio no CI, erros do Supabase traduzidos para pt-BR (src/lib/auth.ts), fluxos de link cuidadosos. Perde por cobertura só de src/lib, helpers ainda duplicados e fallbacks com dados de exemplo em telas reais. |
| Arquitetura | 7,5 | A camada de repositório com useUserStore é a decisão certa: telas não conhecem o Supabase, o modo demo usa a mesma interface e cada conta é isolada. Perde pelo carregamento tudo ou nada, pela carga do histórico inteiro e pela fila de salvamento só em memória. |
| UX/UI | 7,5 | Material 3 consistente, tudo em pt-BR, desfazer e confirmações nas ações destrutivas, fluxos de cadastro e senha completos com estados de erro e reenvio. Perde por metas e passos fictícios na tela inicial, 6 abas, perfil sem edição e sem tela de configurações. |
| Funcionalidades | 7 | Alimentação, treino, peso, treinadores e chat funcionam com dados reais por conta. Faltam as partes que dão retorno ao usuário: metas pessoais, histórico de treinos e edição. |
| Completude | 6 | Criar, ver e excluir funcionam em todos os domínios; editar só existe para tarefas internamente (sem tela). Não há configurações, exclusão de conta nem exportação. |
| Segurança | 7 | RLS em todas as tabelas do usuário com testes em SQL, catálogo só leitura, aluno só envia mensagens como aluno, chave publicável no app, PKCE. Perde pela falta de exclusão de conta e consentimento para dados de saúde e pelo signOut global. |
| Performance | 6,5 | TACO indexada sob demanda, buscas com cache e debounce, React Compiler, GIFs sem autoplay. A abertura espera 9 cargas e cada uma traz o histórico inteiro, o que piora com o uso. Nada foi medido em aparelho. |
| Escalabilidade | 6 | Postgres com RLS e índices por usuário é base sólida. O cliente lê tudo de uma vez, salva em fila só na memória e não tem sincronização offline. |
| Manutenibilidade | 7,5 | Código comentado com o porquê, tipos gerados do banco, migrações versionadas, CI com checagens. Arquivos grandes e helpers repetidos ainda existem. |
| Prontidão para produção | 4,5 | Funciona de ponta a ponta no Android, mas um crash de abertura chegou ao aparelho por incompatibilidade nativa, não há monitoramento de erros, iOS não está configurado e faltam requisitos de loja e LGPD. |

**Qualidade técnica (7,5)** — Problemas: Testes não cobrem contextos, repositórios nem useUserStore (N-23); parseNumber duplicado e MOCK_PROFILE como fallback (N-16, N-17); draggable-dashboard.tsx com 718 linhas (N-20). Como melhorar: Testar useUserStore e um repositório com mocks do Supabase; Unificar parsing em src/lib; Remover fallbacks de exemplo das telas.

**Arquitetura (7,5)** — Problemas: Um domínio com erro bloqueia o app (N-09); Histórico completo carregado na abertura (N-10); Fila de salvamento perdida se o app fechar (N-11); 10 providers aninhados com dependência de ordem. Como melhorar: Carregamento por domínio com erro local; Consultas por período; Persistir a fila no aparelho.

**UX/UI (7,5)** — Problemas: Metas fixas e passos fictícios (N-01, N-02); Perfil e registros sem edição (N-03, N-04); 6 destinos na barra (N-15). Como melhorar: Metas calculadas e widget de passos só com fonte real; Edição por toque em cada registro; Configurações e 5 abas.

**Funcionalidades (7)** — Problemas: Metas não usam o perfil (N-01); Sem histórico de cargas; Chat sem o lado do treinador. Como melhorar: Metas calculadas; Histórico e progressão; Painel do treinador.

**Completude (6)** — Problemas: Sem edição de registros (N-03); Sem exclusão de conta (N-05); Sem configurações (N-04). Como melhorar: Fechar o ciclo criar, editar, excluir; Área de conta com excluir e exportar.

**Segurança (7)** — Problemas: Sem exclusão de conta nem consentimento (N-05); Sair desconecta todos os aparelhos (N-12); rls.sql não roda no CI. Como melhorar: Excluir conta e política de privacidade; signOut com escopo local; Rodar rls.sql no CI.

**Performance (6,5)** — Problemas: Histórico completo na abertura (N-10); Abertura bloqueada por 9 cargas (N-09). Como melhorar: Carregar só o período visível; Mostrar abas com o que já carregou.

**Escalabilidade (6)** — Problemas: selectAll em food_entries, exercise_entries e chat (N-10); Fila em memória (N-11). Como melhorar: Paginação por data; Fila persistida e sincronização ao reconectar.

**Manutenibilidade (7,5)** — Problemas: Componente de 718 linhas (N-20); Duplicações pequenas (N-16); Variável de ambiente sem uso (N-18). Como melhorar: Dividir o dashboard; Limpeza de duplicações e config morta.

**Prontidão para produção (4,5)** — Problemas: Sem verificação nativa no CI (N-13); Sem monitoramento de erros; iOS não configurado (N-14); Sem exclusão de conta (N-05). Como melhorar: Fase 1 e Fase 5 do roadmap.

## 9. Roadmap

Plano completo em [`roadmap.md`](roadmap.md).
