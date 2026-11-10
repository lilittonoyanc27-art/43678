export interface QuestionItem {
  id: number;
  letter: string;
  prefix: string;
  questionEs: string;
  questionArm: string;
  answerEs: string;
  answerArm: string;
  acceptableAnswers: string[];
}

export const QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    letter: "P",
    prefix: "Empieza por P",
    questionEs: "¿Quién defiende la portería?",
    questionArm: "Ո՞վ է պաշտպանում դարպասը։",
    answerEs: "Portero",
    answerArm: "Դարպասապահ",
    acceptableAnswers: ["portero", "guardameta", "arquero", "porteros"]
  },
  {
    id: 2,
    letter: "E",
    prefix: "Empieza por E",
    questionEs: "¿Quién dirige los entrenamientos del equipo?",
    questionArm: "Ո՞վ է ղեկավարում թիմի մարզումները։",
    answerEs: "Entrenador",
    answerArm: "Մարզիչ",
    acceptableAnswers: ["entrenador", "tecnico", "técnico", "mister", "director tecnico", "director técnico"]
  },
  {
    id: 3,
    letter: "Á",
    prefix: "Empieza por Á",
    questionEs: "¿Quién pita las faltas durante el partido?",
    questionArm: "Ո՞վ է խաղի ընթացքում սուլոցով արձանագրում խախտումները։",
    answerEs: "Árbitro",
    answerArm: "Մրցավար",
    acceptableAnswers: ["arbitro", "árbitro", "colegiado", "referi", "réferi"]
  },
  {
    id: 4,
    letter: "C",
    prefix: "Empieza por C",
    questionEs: "¿Qué jugador lleva un brazalete especial?",
    questionArm: "Ո՞ր խաղացողն է կրում հատուկ թևկապ։",
    answerEs: "Capitán",
    answerArm: "Ավագ",
    acceptableAnswers: ["capitan", "capitán"]
  },
  {
    id: 5,
    letter: "D",
    prefix: "Empieza por D",
    questionEs: "¿Qué jugador tiene como principal misión marcar goles?",
    questionArm: "Ո՞ր խաղացողի գլխավոր նպատակն է գոլեր խփելը։",
    answerEs: "Delantero",
    answerArm: "Հարձակվող",
    acceptableAnswers: ["delantero", "ariete", "atacante", "goleador"]
  },
  {
    id: 6,
    letter: "C",
    prefix: "Empieza por C",
    questionEs: "¿Qué jugador actúa principalmente en el centro del campo?",
    questionArm: "Ո՞ր խաղացողն է հիմնականում գործում դաշտի կենտրոնում։",
    answerEs: "Centrocampista",
    answerArm: "Կիսապաշտպան",
    acceptableAnswers: ["centrocampista", "mediocampista", "medio"]
  },
  {
    id: 7,
    letter: "D",
    prefix: "Empieza por D",
    questionEs: "¿Qué jugador protege principalmente a su equipo de los ataques rivales?",
    questionArm: "Ո՞ր խաղացողն է հիմնականում պաշտպանում իր թիմը մրցակցի գրոհներից։",
    answerEs: "Defensa",
    answerArm: "Պաշտպան",
    acceptableAnswers: ["defensa", "defensor", "zaguero"]
  },
  {
    id: 8,
    letter: "B",
    prefix: "Empieza por B",
    questionEs: "¿Qué objeto golpean los futbolistas durante el juego?",
    questionArm: "Ի՞նչ առարկայի են հարվածում ֆուտբոլիստները խաղի ընթացքում։",
    answerEs: "Balón",
    answerArm: "Գնդակ",
    acceptableAnswers: ["balon", "balón", "pelota"]
  },
  {
    id: 9,
    letter: "G",
    prefix: "Empieza por G",
    questionEs: "¿Qué se marca cuando el balón entra legalmente en la portería?",
    questionArm: "Ի՞նչ է գրանցվում, երբ գնդակը կանոնների համաձայն մտնում է դարպասը։",
    answerEs: "Gol",
    answerArm: "Գոլ",
    acceptableAnswers: ["gol", "tanto"]
  },
  {
    id: 10,
    letter: "E",
    prefix: "Empieza por E",
    questionEs: "¿Qué resultado hay cuando ambos equipos marcan el mismo número de goles?",
    questionArm: "Ի՞նչ արդյունք է գրանցվում, երբ երկու թիմերն էլ նույնքան գոլ են խփում։",
    answerEs: "Empate",
    answerArm: "Ոչ-ոքի",
    acceptableAnswers: ["empate", "tablas"]
  },
  {
    id: 11,
    letter: "R",
    prefix: "Empieza por R",
    questionEs: "¿De qué color es la tarjeta de expulsión?",
    questionArm: "Ի՞նչ գույնի է հեռացման քարտը։",
    answerEs: "Roja",
    answerArm: "Կարմիր",
    acceptableAnswers: ["roja", "rojo", "tarjeta roja"]
  },
  {
    id: 12,
    letter: "A",
    prefix: "Empieza por A",
    questionEs: "¿De qué color es la tarjeta de amonestación?",
    questionArm: "Ի՞նչ գույնի է զգուշացման քարտը։",
    answerEs: "Amarilla",
    answerArm: "Դեղին",
    acceptableAnswers: ["amarilla", "amarillo", "tarjeta amarilla"]
  },
  {
    id: 13,
    letter: "P",
    prefix: "Empieza por P",
    questionEs: "¿Cómo se llama el lanzamiento desde los once metros?",
    questionArm: "Ինչպե՞ս է կոչվում տասնմեկ մետրից կատարվող հարվածը։",
    answerEs: "Penalti",
    answerArm: "Տասնմեկմետրանոց",
    acceptableAnswers: ["penalti", "penal", "penalty"]
  },
  {
    id: 14,
    letter: "C",
    prefix: "Empieza por C",
    questionEs: "¿Cómo se llama el saque que se realiza desde una esquina del campo?",
    questionArm: "Ինչպե՞ս է կոչվում դաշտի անկյունից կատարվող հարվածը։",
    answerEs: "Córner",
    answerArm: "Անկյունային",
    acceptableAnswers: ["corner", "córner", "saque de esquina", "tiro de esquina"]
  },
  {
    id: 15,
    letter: "P",
    prefix: "Empieza por P",
    questionEs: "¿Qué hace un jugador cuando envía el balón a un compañero?",
    questionArm: "Ի՞նչ է կատարում խաղացողը, երբ գնդակն ուղարկում է թիմակցին։",
    answerEs: "Pase",
    answerArm: "Փոխանցում",
    acceptableAnswers: ["pase", "pasar", "pasar el balon", "pasar el balón"]
  },
  {
    id: 16,
    letter: "A",
    prefix: "Empieza por A",
    questionEs: "¿Cómo se llama el pase que permite a un compañero marcar un gol directamente?",
    questionArm: "Ինչպե՞ս է կոչվում այն փոխանցումը, որից թիմակիցն անմիջապես գոլ է խփում։",
    answerEs: "Asistencia",
    answerArm: "Գոլային",
    acceptableAnswers: ["asistencia", "pase de gol"]
  },
  {
    id: 17,
    letter: "R",
    prefix: "Empieza por R",
    questionEs: "¿Qué movimiento permite superar a un rival sin perder el balón?",
    questionArm: "Ո՞ր հնարքն է թույլ տալիս շրջանցել մրցակցին՝ առանց գնդակը կորցնելու։",
    answerEs: "Regate",
    answerArm: "Դրիբլինգ",
    acceptableAnswers: ["regate", "drible", "gambeta", "dribling"]
  },
  {
    id: 18,
    letter: "C",
    prefix: "Empieza por C",
    questionEs: "¿Cómo se llama un ataque rápido después de recuperar el balón?",
    questionArm: "Ինչպե՞ս է կոչվում արագ գրոհը՝ գնդակը հետ ստանալուց հետո։",
    answerEs: "Contraataque",
    answerArm: "Հակագրոհ",
    acceptableAnswers: ["contraataque", "contragolpe", "contra"]
  },
  {
    id: 19,
    letter: "F",
    prefix: "Empieza por F",
    questionEs: "¿Qué se produce cuando un jugador comete una infracción durante el juego?",
    questionArm: "Ի՞նչ է արձանագրվում, երբ խաղացողը խաղի ընթացքում խախտում է կանոնները։",
    answerEs: "Falta",
    answerArm: "Խախտում",
    acceptableAnswers: ["falta", "infraccion", "infracción"]
  },
  {
    id: 20,
    letter: "G",
    prefix: "Empieza por G",
    questionEs: "¿Qué protege las manos del portero?",
    questionArm: "Ի՞նչն է պաշտպանում դարպասապահի ձեռքերը։",
    answerEs: "Guantes",
    answerArm: "Ձեռնոցներ",
    acceptableAnswers: ["guantes", "guante"]
  },
  {
    id: 21,
    letter: "E",
    prefix: "Empieza por E",
    questionEs: "¿Qué llevan los futbolistas para protegerse las espinillas?",
    questionArm: "Ի՞նչ են կրում ֆուտբոլիստները՝ սրունքները պաշտպանելու համար։",
    answerEs: "Espinilleras",
    answerArm: "Վահանիկներ",
    acceptableAnswers: ["espinilleras", "espinillera", "canilleras", "canillera"]
  },
  {
    id: 22,
    letter: "V",
    prefix: "Empieza por V",
    questionEs: "¿Dónde se cambian de ropa los jugadores?",
    questionArm: "Որտե՞ղ են խաղացողները փոխում հագուստը։",
    answerEs: "Vestuario",
    answerArm: "Հանդերձարան",
    acceptableAnswers: ["vestuario", "camerino", "vestuarios"]
  },
  {
    id: 23,
    letter: "E",
    prefix: "Empieza por E",
    questionEs: "¿Cómo se llama el recinto con gradas donde se disputan partidos?",
    questionArm: "Ինչպե՞ս է կոչվում տրիբունաներով կառույցը, որտեղ անցկացվում են խաղերը։",
    answerEs: "Estadio",
    answerArm: "Մարզադաշտ",
    acceptableAnswers: ["estadio", "cancha", "campo"]
  },
  {
    id: 24,
    letter: "R",
    prefix: "Empieza por R",
    questionEs: "¿Qué hay detrás de los postes para retener el balón?",
    questionArm: "Ի՞նչ կա դարպասաձողերի հետևում՝ գնդակը պահելու համար։",
    answerEs: "Red",
    answerArm: "Ցանց",
    acceptableAnswers: ["red", "redes", "malla"]
  },
  {
    id: 25,
    letter: "S",
    prefix: "Empieza por S",
    questionEs: "¿Cómo se llama el cambio de un jugador por otro?",
    questionArm: "Ինչպե՞ս է կոչվում մի խաղացողին մյուսով փոխելը։",
    answerEs: "Sustitución",
    answerArm: "Փոխարինում",
    acceptableAnswers: ["sustitucion", "sustitución", "cambio"]
  },
  {
    id: 26,
    letter: "V",
    prefix: "Empieza por V",
    questionEs: "¿Qué consigue el equipo que gana el partido?",
    questionArm: "Ի՞նչ է ստանում խաղը շահած թիմը։",
    answerEs: "Victoria",
    answerArm: "Հաղթանակ",
    acceptableAnswers: ["victoria", "triunfo"]
  },
  {
    id: 27,
    letter: "C",
    prefix: "Empieza por C",
    questionEs: "¿Qué suele levantar el equipo campeón al ganar un torneo?",
    questionArm: "Ի՞նչ է սովորաբար բարձրացնում չեմպիոն թիմը՝ մրցաշարում հաղթելուց հետո։",
    answerEs: "Copa",
    answerArm: "Գավաթ",
    acceptableAnswers: ["copa", "trofeo"]
  }
];

export function normalizeAnswer(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ]/gi, "");
}

export function checkAnswer(input: string, item: QuestionItem): boolean {
  const normalizedInput = normalizeAnswer(input);
  if (!normalizedInput) return false;

  const normalizedTarget = normalizeAnswer(item.answerEs);
  if (normalizedInput === normalizedTarget) return true;

  return item.acceptableAnswers.some((ans) => normalizeAnswer(ans) === normalizedInput);
}
