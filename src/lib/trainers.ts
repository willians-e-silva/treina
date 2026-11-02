import { normalizeText } from './taco';
import { WEEKDAYS, type NewPlannedExercise, type Weekday } from './workouts';

/** A workout of a package, copied into the user's plan when they join it. */
export type PackageWorkout = {
  name: string;
  /** One or two lines, shown on the workout's card. */
  summary: string;
  /** Shown on the workout's own screen: goal, rest, how to progress. */
  description: string;
  /** The trainer's notes go in each exercise's `note`. */
  exercises: NewPlannedExercise[];
};

export type PackageComment = {
  id: string;
  author: string;
  /** 1 to 5 stars. */
  rating: number;
  text: string;
  /** `YYYY-MM-DD`. */
  date: string;
};

export type PackageLevel = 'beginner' | 'intermediate' | 'advanced';

export const LEVEL_LABELS: Record<PackageLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

/** A program a trainer publishes: a set of workouts done in rotation. */
export type TrainingPackage = {
  id: string;
  name: string;
  description: string;
  level: PackageLevel;
  /** Suggested length of the program. */
  weeks: number;
  workouts: PackageWorkout[];
  comments: PackageComment[];
};

export type Trainer = {
  id: string;
  name: string;
  /** Square portrait. */
  photoUrl: string;
  /** Instagram username, without the `@`. */
  instagram: string;
  specialty: string;
  bio: string;
  followers: number;
  /** Average of the ratings, 0 to 5. */
  rating: number;
  ratingCount: number;
  students: number;
  packages: TrainingPackage[];
};

const strength = (
  name: string,
  sets: number,
  reps: number,
  weightKg = 0,
  note?: string,
): NewPlannedExercise => ({
  category: 'strength',
  name,
  sets,
  reps,
  weightKg,
  note,
});

const cardio = (name: string, minutes: number, met: number, note?: string): NewPlannedExercise => ({
  category: 'cardio',
  name,
  minutes,
  met,
  note,
});

/**
 * MOCK: trainers until there is a backend. Photos come from randomuser.me;
 * the avatar shows the initials when they cannot load.
 */
const TRAINERS: Trainer[] = [
  {
    id: 'ana-souza',
    name: 'Ana Souza',
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    instagram: 'anasouza.treina',
    specialty: 'Hipertrofia e força',
    bio: 'Educadora física há 10 anos, especialista em treinamento de força. Monto treinos objetivos para quem quer ganhar massa sem passar horas na academia.',
    followers: 128400,
    rating: 4.9,
    ratingCount: 2310,
    students: 1840,
    packages: [
      {
        id: 'ana-abc',
        name: 'ABC Hipertrofia',
        description:
          'Divisão clássica em três treinos para ganhar massa muscular, com volume progressivo.',
        level: 'intermediate',
        weeks: 8,
        workouts: [
          {
            name: 'A – Peito e tríceps',
            summary: 'Empurrar: peito com ênfase no supino e tríceps no final.',
            description:
              'Treino de peito e tríceps com volume moderado. Descanse 90 segundos entre as séries dos exercícios compostos e 60 segundos nos isolados. Quando completar todas as repetições com boa técnica em duas sessões seguidas, aumente a carga em 2 a 5%.',
            exercises: [
              strength(
                'Supino reto',
                4,
                10,
                40,
                'Desça a barra até tocar o peito e mantenha as escápulas juntas no banco.',
              ),
              strength('Supino inclinado com halteres', 3, 12, 16),
              strength('Crucifixo na máquina', 3, 12, 30),
              strength(
                'Tríceps na polia',
                4,
                12,
                20,
                'Cotovelos colados ao corpo; só o antebraço se move.',
              ),
            ],
          },
          {
            name: 'B – Costas e bíceps',
            summary: 'Puxar: dorsais e bíceps, com remadas pesadas.',
            description:
              'Foco na largura e na espessura das costas. Mantenha o peito aberto e puxe com os cotovelos, não com as mãos. Descanse 90 segundos nas puxadas e remadas e 60 segundos nas roscas.',
            exercises: [
              strength('Puxada frontal', 4, 10, 45),
              strength(
                'Remada curvada',
                4,
                10,
                30,
                'Tronco a 45°, coluna reta. Se a lombar cansar antes das costas, diminua a carga.',
              ),
              strength('Rosca direta', 3, 12, 12, 'Sem balançar o tronco para subir a barra.'),
              strength('Rosca martelo', 3, 12, 10),
            ],
          },
          {
            name: 'C – Pernas e ombros',
            summary: 'Membros inferiores pesados e desenvolvimento de ombros.',
            description:
              'O treino mais exigente da semana. Faça 5 minutos de aquecimento na bicicleta e duas séries leves de agachamento antes das séries válidas. Descanse 2 minutos no agachamento e no leg press.',
            exercises: [
              strength(
                'Agachamento livre',
                4,
                8,
                50,
                'Desça até as coxas ficarem paralelas ao chão, com os joelhos na direção dos pés.',
              ),
              strength(
                'Leg press',
                4,
                12,
                120,
                'Não estenda os joelhos por completo no alto do movimento.',
              ),
              strength('Cadeira extensora', 3, 15, 35),
              strength('Desenvolvimento com halteres', 3, 10, 14),
            ],
          },
        ],
        comments: [
          {
            id: 'c1',
            author: 'Rafael M.',
            rating: 5,
            text: 'Em dois meses ganhei 3 kg de massa. O treino B é o meu favorito!',
            date: '2026-10-12',
          },
          {
            id: 'c2',
            author: 'Juliana P.',
            rating: 5,
            text: 'Bem explicado e fácil de seguir. As cargas sugeridas ajudam muito no início.',
            date: '2026-09-28',
          },
          {
            id: 'c3',
            author: 'Carlos T.',
            rating: 4,
            text: 'Gostei bastante, só achei o treino de pernas um pouco longo.',
            date: '2026-09-03',
          },
        ],
      },
      {
        id: 'ana-fullbody',
        name: 'Full body para iniciantes',
        description:
          'Dois treinos de corpo inteiro para aprender os movimentos básicos com segurança.',
        level: 'beginner',
        weeks: 6,
        workouts: [
          {
            name: 'Full body 1',
            summary: 'Corpo inteiro com os movimentos básicos e um cardio leve.',
            description:
              'Primeiro treino de corpo inteiro. Use cargas leves e priorize aprender o movimento: a última repetição deve sair com esforço, mas sem perder a postura. Descanse 60 a 90 segundos entre as séries.',
            exercises: [
              strength(
                'Agachamento no banco',
                3,
                12,
                0,
                'Sente e levante do banco sem impulso, controlando a descida.',
              ),
              strength('Supino com halteres', 3, 12, 8),
              strength('Remada baixa', 3, 12, 25),
              cardio('Bicicleta ergométrica', 10, 6.8, 'Ritmo leve, só para terminar o treino.'),
            ],
          },
          {
            name: 'Full body 2',
            summary: 'Corpo inteiro com variações e core no final.',
            description:
              'Complementa o Full body 1 com outros exercícios para os mesmos músculos. Se a flexão de braço for difícil, faça com os joelhos apoiados. Descanse 60 a 90 segundos entre as séries.',
            exercises: [
              strength('Leg press', 3, 12, 60),
              strength(
                'Flexão de braço',
                3,
                10,
                0,
                'Pode apoiar os joelhos até conseguir fazer as 10 com boa forma.',
              ),
              strength('Puxada frontal', 3, 12, 30),
              strength('Prancha (segundos)', 3, 30),
            ],
          },
        ],
        comments: [
          {
            id: 'c4',
            author: 'Marina L.',
            rating: 5,
            text: 'Perfeito para quem nunca treinou. Perdi o medo da academia.',
            date: '2026-10-20',
          },
        ],
      },
    ],
  },
  {
    id: 'bruno-lima',
    name: 'Bruno Lima',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    instagram: 'brunolima.run',
    specialty: 'Emagrecimento e condicionamento',
    bio: 'Personal trainer e corredor. Combino musculação e cardio para queimar gordura e melhorar o fôlego.',
    followers: 86200,
    rating: 4.7,
    ratingCount: 1185,
    students: 960,
    packages: [
      {
        id: 'bruno-queima',
        name: 'Queima 30',
        description:
          'Treinos curtos e intensos que alternam força e cardio, para fazer em 30 minutos.',
        level: 'intermediate',
        weeks: 4,
        workouts: [
          {
            name: 'Queima – Superior',
            summary: 'Circuito de membros superiores com corda no final.',
            description:
              'Faça os três exercícios de força em circuito, um depois do outro, e descanse 60 segundos ao fim de cada volta. Termine com o pular corda em intervalos de 1 minuto forte e 30 segundos leve.',
            exercises: [
              strength('Flexão de braço', 4, 15),
              strength('Remada com halteres', 4, 12, 12),
              strength('Desenvolvimento com halteres', 3, 12, 10),
              cardio(
                'Pular corda',
                10,
                11.8,
                '1 minuto forte e 30 segundos leve, até completar o tempo.',
              ),
            ],
          },
          {
            name: 'Queima – Inferior',
            summary: 'Circuito de pernas com corrida para fechar.',
            description:
              'Circuito de pernas com pouco descanso: 30 segundos entre exercícios e 90 segundos entre as voltas. Na esteira, mantenha um ritmo em que ainda dá para falar frases curtas.',
            exercises: [
              strength(
                'Agachamento com salto',
                4,
                15,
                0,
                'Aterrisse com os joelhos flexionados para amortecer.',
              ),
              strength('Afundo alternado', 3, 12),
              strength('Stiff com halteres', 3, 12, 14),
              cardio('Corrida na esteira', 15, 9.8),
            ],
          },
        ],
        comments: [
          {
            id: 'c5',
            author: 'Fernanda R.',
            rating: 5,
            text: 'Cabe na hora do almoço e deixa a gente acabado. Recomendo!',
            date: '2026-10-25',
          },
          {
            id: 'c6',
            author: 'Diego S.',
            rating: 4,
            text: 'Muito bom, mas o pular corda no final é sofrido.',
            date: '2026-10-02',
          },
        ],
      },
      {
        id: 'bruno-corrida',
        name: 'Primeiros 5 km',
        description: 'Plano de corrida progressivo para completar 5 km sem parar.',
        level: 'beginner',
        weeks: 8,
        workouts: [
          {
            name: 'Corrida intervalada',
            summary: 'Alterne trote e caminhada para ganhar fôlego.',
            description:
              'Depois do aquecimento, alterne 2 minutos de trote com 1 minuto de caminhada. A cada semana, aumente o trote em 30 segundos. Se sentir dor, volte a caminhar.',
            exercises: [
              cardio('Caminhada (aquecimento)', 5, 3.5),
              cardio(
                'Trote e caminhada alternados',
                20,
                7,
                '2 minutos de trote e 1 minuto de caminhada.',
              ),
            ],
          },
          {
            name: 'Corrida contínua',
            summary: 'Corrida leve sem parar, em ritmo confortável.',
            description:
              'Corra em ritmo leve o tempo todo, sem se preocupar com a velocidade. O objetivo é terminar os 25 minutos sem parar; se precisar, reduza o ritmo em vez de caminhar.',
            exercises: [cardio('Caminhada (aquecimento)', 5, 3.5), cardio('Corrida leve', 25, 8.3)],
          },
        ],
        comments: [
          {
            id: 'c7',
            author: 'Patrícia N.',
            rating: 5,
            text: 'Completei minha primeira prova de 5 km graças a esse plano!',
            date: '2026-08-30',
          },
        ],
      },
    ],
  },
  {
    id: 'carla-mendes',
    name: 'Carla Mendes',
    photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    instagram: 'carlamendes.fit',
    specialty: 'Glúteos e pernas',
    bio: 'Especialista em treino de membros inferiores, com foco em técnica e prevenção de lesões.',
    followers: 254900,
    rating: 4.8,
    ratingCount: 4020,
    students: 3120,
    packages: [
      {
        id: 'carla-gluteo',
        name: 'Glúteo de aço',
        description: 'Três treinos semanais focados em glúteos e posteriores de coxa.',
        level: 'intermediate',
        weeks: 10,
        workouts: [
          {
            name: 'Glúteos – Força',
            summary: 'Cargas altas para glúteos, com elevação pélvica como base.',
            description:
              'Treino de força para glúteos. Descanse 2 minutos na elevação pélvica e no agachamento sumô. Segure 1 segundo na contração máxima de cada repetição.',
            exercises: [
              strength(
                'Elevação pélvica',
                4,
                10,
                60,
                'Segure 1 segundo no alto, apertando os glúteos.',
              ),
              strength('Agachamento sumô', 4, 10, 24),
              strength('Cadeira abdutora', 3, 15, 40),
            ],
          },
          {
            name: 'Posteriores',
            summary: 'Posteriores de coxa e glúteos com foco em técnica.',
            description:
              'Movimentos de quadril para posteriores de coxa. Desça devagar, em 3 segundos, e mantenha a coluna neutra o tempo todo. Descanse 90 segundos entre as séries.',
            exercises: [
              strength(
                'Stiff',
                4,
                10,
                40,
                'Joelhos levemente flexionados; desça até sentir o alongamento atrás da coxa.',
              ),
              strength('Mesa flexora', 4, 12, 30),
              strength(
                'Afundo búlgaro',
                3,
                10,
                8,
                'Carga por mão. Faça todas as repetições de uma perna antes de trocar.',
              ),
            ],
          },
          {
            name: 'Glúteos – Volume',
            summary: 'Mais repetições para glúteos e cardio na escada.',
            description:
              'Treino de volume com cargas moderadas e descanso curto, de 45 a 60 segundos. Finalize com a escada em ritmo constante.',
            exercises: [
              strength('Glúteo na polia', 4, 15, 15),
              strength('Passada', 3, 12, 10),
              cardio('Escada (stair climber)', 15, 9),
            ],
          },
        ],
        comments: [
          {
            id: 'c8',
            author: 'Bianca A.',
            rating: 5,
            text: 'Os resultados aparecem rápido. A Carla explica cada exercício muito bem.',
            date: '2026-10-18',
          },
          {
            id: 'c9',
            author: 'Larissa F.',
            rating: 4,
            text: 'Treino pesado, mas vale a pena.',
            date: '2026-09-21',
          },
        ],
      },
    ],
  },
  {
    id: 'diego-alves',
    name: 'Diego Alves',
    photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    instagram: 'diegoalves.cali',
    specialty: 'Calistenia',
    bio: 'Treino com o peso do corpo, em casa ou na praça. Do zero à barra fixa.',
    followers: 41300,
    rating: 4.6,
    ratingCount: 512,
    students: 430,
    packages: [
      {
        id: 'diego-casa',
        name: 'Treino em casa',
        description:
          'Sem equipamentos: dois treinos com o peso do corpo para fazer em qualquer lugar.',
        level: 'beginner',
        weeks: 4,
        workouts: [
          {
            name: 'Empurrar',
            summary: 'Peito, ombros e tríceps só com o peso do corpo.',
            description:
              'Treino de empurrar sem equipamentos. Descanse 60 segundos entre as séries. Quando fizer todas as repetições com facilidade, deixe a descida mais lenta, em 3 segundos.',
            exercises: [
              strength('Flexão de braço', 4, 12),
              strength('Mergulho no banco', 3, 12),
              strength(
                'Flexão pike',
                3,
                8,
                0,
                'Quadril alto, formando um V invertido; a cabeça desce entre as mãos.',
              ),
            ],
          },
          {
            name: 'Puxar e pernas',
            summary: 'Costas com remada australiana e pernas em alto volume.',
            description:
              'Para a remada australiana, use uma mesa firme ou uma barra baixa. Quanto mais horizontal o corpo, mais difícil. Descanse 60 segundos entre as séries.',
            exercises: [
              strength(
                'Remada australiana',
                4,
                10,
                0,
                'Corpo reto da cabeça aos pés durante todo o movimento.',
              ),
              strength('Agachamento livre', 4, 20),
              strength('Afundo alternado', 3, 12),
            ],
          },
        ],
        comments: [
          {
            id: 'c10',
            author: 'Thiago C.',
            rating: 5,
            text: 'Ótimo para manter a rotina viajando.',
            date: '2026-10-08',
          },
        ],
      },
      {
        id: 'diego-barra',
        name: 'Rumo à barra fixa',
        description: 'Progressões para fazer as primeiras barras fixas completas.',
        level: 'advanced',
        weeks: 6,
        workouts: [
          {
            name: 'Barra – Progressão',
            summary: 'Progressões para as primeiras barras fixas completas.',
            description:
              'Treino de progressão para a barra fixa. Descanse 2 minutos entre as séries: a qualidade de cada repetição importa mais que o cansaço. Quando fizer 3 barras completas, troque a barra com elástico por barras livres.',
            exercises: [
              strength(
                'Barra negativa',
                5,
                5,
                0,
                'Suba com ajuda de um banco e desça devagar, em 5 segundos.',
              ),
              strength('Barra com elástico', 4, 8),
              strength('Suspensão na barra (segundos)', 3, 30),
            ],
          },
        ],
        comments: [],
      },
    ],
  },
  {
    id: 'elisa-rocha',
    name: 'Elisa Rocha',
    photoUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
    instagram: 'elisarocha.move',
    specialty: 'Mobilidade e core',
    bio: 'Fisioterapeuta e treinadora. Treinos para fortalecer o core, melhorar a postura e se mover sem dor.',
    followers: 19800,
    rating: 4.9,
    ratingCount: 340,
    students: 275,
    packages: [
      {
        id: 'elisa-core',
        name: 'Core forte',
        description: 'Fortalecimento do abdômen e da lombar em sessões de 20 minutos.',
        level: 'beginner',
        weeks: 4,
        workouts: [
          {
            name: 'Core',
            summary: 'Abdômen e lombar em 20 minutos.',
            description:
              'Fortalecimento do core para a postura e a lombar. Respire durante as pranchas, sem prender o ar. Descanse 30 a 45 segundos entre as séries.',
            exercises: [
              strength('Prancha (segundos)', 3, 40),
              strength('Prancha lateral (segundos)', 3, 30),
              strength(
                'Perdigueiro',
                3,
                12,
                0,
                'Repetições por lado. Estenda braço e perna opostos sem girar o quadril.',
              ),
              strength('Ponte de glúteo', 3, 15),
            ],
          },
        ],
        comments: [
          {
            id: 'c11',
            author: 'Sérgio V.',
            rating: 5,
            text: 'Minha dor lombar melhorou muito em poucas semanas.',
            date: '2026-10-27',
          },
        ],
      },
    ],
  },
];

/** Training days by number of workouts in a package, Monday first. */
const TRAINING_DAYS: Record<number, Weekday[]> = {
  1: [1, 3, 5],
  2: [1, 2, 4, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
};

/**
 * Week for a package with `count` workouts: the index of the workout done on
 * each day, in rotation (A, B, A, B…); missing days are rest days. Six
 * workouts take Monday to Saturday, seven or more the whole week.
 */
export function packageWeek(count: number): Partial<Record<Weekday, number>> {
  if (count === 0) return {};
  const days = TRAINING_DAYS[count] ?? (count >= 7 ? WEEKDAYS : WEEKDAYS.slice(0, 6));
  return Object.fromEntries(days.map((day, index) => [day, index % count]));
}

export function getTrainer(id: string) {
  return TRAINERS.find((trainer) => trainer.id === id);
}

/** The package with `id` and the trainer who published it. */
export function getPackage(id: string) {
  for (const trainer of TRAINERS) {
    const pkg = trainer.packages.find((candidate) => candidate.id === id);
    if (pkg) return { trainer, pkg };
  }
  return undefined;
}

/** Trainers whose name contains every word of `query`, ignoring accents. */
export function searchTrainers(query: string) {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return TRAINERS;
  return TRAINERS.filter((trainer) => {
    const name = normalizeText(trainer.name);
    return terms.every((term) => name.includes(term));
  });
}

const compact = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** `254900` → `"254,9 mil"`, `1200000` → `"1,2 mi"`, `980` → `"980"`. */
export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${compact.format(value / 1_000_000)} mi`;
  if (value >= 1_000) return `${compact.format(value / 1_000)} mil`;
  return compact.format(value);
}

/** `4.85` → `"4,9"` */
export function formatRating(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Profile page of an Instagram username; opens the app when it is installed. */
export function instagramUrl(username: string) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

/** `"Ana Souza"` → `"AS"` */
export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return (
    (words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')
  ).toUpperCase();
}
