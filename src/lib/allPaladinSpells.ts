import { Spell } from "../types";

export const allPaladinSpells: Omit<Spell, "prepared">[] = [
  // 1º CÍRCULO
  {
    id: "class_divine_favor",
    name: "Auxílio Divino",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação bônus",
    range: "Pessoal",
    components: "V, S",
    duration: "Concentração, até 1 minuto",
    description: "Sua oração imbui você com poder divino. Até a magia acabar, seus ataques com armas corpo-a-corpo causam 1d4 de dano radiante extra ao atingirem."
  },
  {
    id: "class_bless",
    name: "Bênção",
    level: 1,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "9 metros",
    components: "V, S, M (um punhado de água benta)",
    duration: "Concentração, até 1 minuto",
    description: "Você abençoa até três criaturas à sua escolha dentro do alcance. Sempre que um alvo fizer uma jogada de ataque ou teste de resistência antes da magia acabar, ele pode rolar um d4 e somar o resultado ao total."
  },
  {
    id: "class_command",
    name: "Comando",
    level: 1,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "18 metros",
    components: "V",
    duration: "1 rodada",
    description: "Você profere uma palavra de comando de uma sílaba a uma criatura que possa ver dentro do alcance. O alvo deve ser bem-sucedido num teste de resistência de Sabedoria ou obedecerá ao comando no próximo turno dele. A magia não tem efeito se o alvo for um morto-vivo, se ele não entender seu idioma ou se o comando for diretamente prejudicial a ele. Comandos comuns: Aproxime-se, Soltar, Fugir, Rastejar, Parar."
  },
  {
    id: "class_cure_wounds",
    name: "Curar Ferimentos",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação",
    range: "Toque",
    components: "V, S",
    duration: "Instantânea",
    description: "Uma criatura que você tocar recupera uma quantidade de pontos de vida igual a 1d8 + seu modificador de Carisma (+4 para Percival). Esta magia não tem efeito em mortos-vivos ou constructos."
  },
  {
    id: "class_wrathful_smite",
    name: "Destruição Colérica",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação bônus",
    range: "Pessoal",
    components: "V",
    duration: "Concentração, até 1 minuto",
    description: "A próxima vez que você acertar uma criatura com um ataque com arma corpo-a-corpo durante a duração desta magia, seu ataque causa 1d6 de dano psíquico extra. Além disso, o alvo deve ser bem-sucedido em um teste de resistência de Sabedoria ou ficará amedrontado por você até a magia acabar. Com uma ação, o alvo pode fazer um teste de Sabedoria contra a CD da sua magia para tentar encerrar esse efeito."
  },
  {
    id: "class_searing_smite",
    name: "Destruição Lancinante",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação bônus",
    range: "Pessoal",
    components: "V",
    duration: "Concentração, até 1 minuto",
    description: "A próxima vez que você acertar uma criatura com um ataque com arma corpo-a-corpo durante a duração desta magia, a arma incandesce com chamas e o ataque causa 1d6 de dano de fogo extra ao alvo, fazendo-o inflamar. No início de cada um dos turnos dele, até a magia acabar, o alvo em chamas deve fazer um teste de resistência de Constituição. Se falhar, sofre 1d6 de dano de fogo. Se passar, a magia acaba. O alvo ou uma criatura adjacente pode usar uma ação para apagar as chamas."
  },
  {
    id: "class_thunderous_smite",
    name: "Destruição Trovejante",
    level: 1,
    school: "Evocação",
    castingTime: "1 ação bônus",
    range: "Pessoal",
    components: "V",
    duration: "Concentração, até 1 minuto",
    description: "A primeira vez que você atingir com um ataque de arma corpo-a-corpo durante a duração da magia, seu ataque causa 1d6 de dano trovejante extra. Além disso, se o alvo for uma criatura, ela deve ser bem-sucedida em um teste de resistência de Força ou será empurrada 3 metros para longe de você e ficará caída."
  },
  {
    id: "class_detect_evil_and_good",
    name: "Detectar o Bem e Mal",
    level: 1,
    school: "Adivinhação",
    castingTime: "1 ação",
    range: "Pessoal",
    components: "V, S",
    duration: "Concentração, até 10 minutos",
    description: "Pela duração, você sabe se existe um aberrante, celestial, corruptor, elemental, fada ou morto-vivo a até 9 metros de você, bem como onde a criatura está localizada. Você também sabe se existe um local ou objeto consagrado ou dessagrado na área."
  },
  {
    id: "class_detect_magic",
    name: "Detectar Magia",
    level: 1,
    school: "Adivinhação (Ritual)",
    castingTime: "1 ação",
    range: "Pessoal",
    components: "V, S",
    duration: "Concentração, até 10 minutos",
    description: "Pela duração, você sente a presença de magia a até 9 metros de você. Se sentir magia dessa forma, você pode usar sua ação para ver uma aura tênue ao redor de qualquer criatura ou objeto visível na área que carregue magia, e descobre sua escola de magia, se houver."
  },
  {
    id: "class_detect_poison_and_disease",
    name: "Detectar Veneno e Doença",
    level: 1,
    school: "Adivinhação (Ritual)",
    castingTime: "1 ação",
    range: "Pessoal",
    components: "V, S, M (um ramo de teixo ou uma folha de hera)",
    duration: "Concentração, até 10 minutos",
    description: "Pela duração, você sente a presença e localização de venenos, criaturas venenosas e doenças a até 9 metros de você. Você também identifica o tipo do veneno ou da doença em cada caso."
  },
  {
    id: "class_compelled_duel",
    name: "Duelo Compelido",
    level: 1,
    school: "Encantamento",
    castingTime: "1 ação bônus",
    range: "9 metros",
    components: "V",
    duration: "Concentração, até 1 minuto",
    description: "Você tenta compelir uma criatura ao duelo. Uma criatura que você possa ver dentro do alcance deve fazer um teste de resistência de Sabedoria. Se falhar, ela é atraída por você. Ela tem desvantagem em jogadas de ataque contra alvos diferentes de você e deve fazer um teste de resistência de Sabedoria para se mover para um espaço a mais de 9 metros de distância de você. A magia acaba se você atacar outra criatura ou se um aliado atacar o alvo."
  },
  {
    id: "class_shield_of_faith",
    name: "Escudo da Fé",
    level: 1,
    school: "Abjuração",
    castingTime: "1 ação bônus",
    range: "9 metros",
    components: "V, S, M (um pequeno pedaço de pergaminho sagrado)",
    duration: "Concentração, até 10 minutos",
    description: "Um campo cintilante surge e envolve uma criatura à sua escolha dentro do alcance, concedendo-lhe um bônus de +2 na CA pela duração."
  },
  {
    id: "class_heroism",
    name: "Heroísmo",
    level: 1,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "Toque",
    components: "V, S",
    duration: "Concentração, até 1 minuto",
    description: "Uma criatura voluntária que você tocar torna-se imune a ficar amedrontada e ganha pontos de vida temporários iguais ao seu modificador de Carisma (+4) no início de cada um dos turnos dela pela duração."
  },
  {
    id: "class_protection_from_evil_and_good",
    name: "Proteção contra o Bem e Mal",
    level: 1,
    school: "Abjuração",
    castingTime: "1 ação",
    range: "Toque",
    components: "V, S, M (água benta ou pó de prata e ferro, consumidos pela magia)",
    duration: "Concentração, até 10 minutos",
    description: "Até a magia acabar, uma criatura voluntária que você tocar estará protegida contra certos tipos de criaturas: aberrantes, celestiais, corruptores, elementais, fadas e mortos-vivos. O alvo não pode ser enfeitiçado, amedrontado ou possuído por elas, e elas têm desvantagem em jogadas de ataque contra o alvo."
  },
  {
    id: "class_purify_food_and_drink",
    name: "Purificar Alimentos",
    level: 1,
    school: "Transmutação (Ritual)",
    castingTime: "1 ação",
    range: "3 metros",
    components: "V, S",
    duration: "Instantânea",
    description: "Toda comida e bebida não-mágica num raio de 1,5 metro centrado num ponto à sua escolha dentro do alcance é purificada e libertada de venenos e doenças."
  },

  // 2º CÍRCULO
  {
    id: "class_aid",
    name: "Ajuda",
    level: 2,
    school: "Abjuração",
    castingTime: "1 ação",
    range: "9 metros",
    components: "V, S, M (uma pequena tira de manto branco)",
    duration: "8 horas",
    description: "Sua magia reforça seus aliados com tenacidade. Escolha até três criaturas dentro do alcance. O máximo de pontos de vida e os pontos de vida atuais de cada alvo aumentam em 5 pela duração."
  },
  {
    id: "class_magic_weapon",
    name: "Arma Mágica",
    level: 2,
    school: "Transmutação",
    castingTime: "1 ação bônus",
    range: "Toque",
    components: "V, S",
    duration: "Concentração, até 1 hora",
    description: "Você toca uma arma não-mágica. Até a magia acabar, essa arma torna-se uma arma mágica com um bônus de +1 nas jogadas de ataque e de dano."
  },
  {
    id: "class_find_steed",
    name: "Convocar Montaria",
    level: 2,
    school: "Conjuração",
    castingTime: "10 minutos",
    range: "9 metros",
    components: "V, S",
    duration: "Instantânea",
    description: "Você evoca um espírito que assume a forma de uma montaria leal e forte, criando um laço duradouro com ela. Ela aparece num espaço desocupado dentro do alcance e assume a forma de cavalo de guerra infernal (Pesadelo Sanguinário) ou outras formas. A montaria tem inteligência 6 e compreende um idioma que você fale. Vocês podem se comunicar telepaticamente a até 1,5 km. Enquanto montado, qualquer magia com alcance 'Pessoal' conjurada por você também se aplica a ela."
  },
  {
    id: "class_locate_object",
    name: "Localizar Objeto",
    level: 2,
    school: "Adivinhação",
    castingTime: "1 ação",
    range: "Pessoal",
    components: "V, S, M (um ramo bifurcado)",
    duration: "Concentração, até 10 minutos",
    description: "Descreva ou nomeie um objeto familiar para você. Você sente a direção e localização física dele dentro de 300 metros de você. A magia pode procurar por um objeto específico ou pelo tipo mais próximo de um objeto (como chaves ou uma espada). É bloqueada por chumbo."
  },
  {
    id: "class_branding_smite",
    name: "Marca da Punição",
    level: 2,
    school: "Evocação",
    castingTime: "1 ação bônus",
    range: "Pessoal",
    components: "V",
    duration: "Concentração, até 1 minuto",
    description: "A próxima vez que você acertar uma criatura com um ataque com arma durante o tempo de duração da magia, a arma brilha com uma radiação intensa. O ataque causa 2d6 de dano radiante extra e o alvo passa a emitir luz plena num raio de 1,5 metro. O alvo não pode se beneficiar de invisibilidade enquanto a magia durar."
  },
  {
    id: "class_protection_from_poison",
    name: "Proteção contra Veneno",
    level: 2,
    school: "Abjuração",
    castingTime: "1 ação",
    range: "Toque",
    components: "V, S",
    duration: "1 hora",
    description: "Você toca uma criatura. Se ela estiver envenenada, você neutraliza o veneno. Pela duração, o alvo tem vantagem em testes de resistência contra veneno e resistência a dano de veneno."
  },
  {
    id: "class_lesser_restoration",
    name: "Restauração Menor",
    level: 2,
    school: "Abjuração",
    castingTime: "1 ação",
    range: "Toque",
    components: "V, S",
    duration: "Instantânea",
    description: "Você toca uma criatura e encerra uma doença ou uma condição que a afete. A condição pode ser cego, surdo, paralisado ou envenenado."
  },
  {
    id: "class_zone_of_truth",
    name: "Zona da Verdade",
    level: 2,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "18 metros",
    components: "V, S",
    duration: "10 minutos",
    description: "Você cria uma zona mágica contra mentiras num raio de 4,5 metros. Uma criatura que entrar na área ou começar o turno dela ali deve passar num teste de resistência de Carisma. Se falhar, ela não pode proferir mentiras deliberadas na área. Você sabe se ela passou ou falhou. Ela pode se recusar a responder, mas tudo o que disser deve ser a verdade."
  }
];

export const oathSpells: Omit<Spell, "prepared">[] = [
  {
    id: "oath_bane",
    name: "Perdição",
    level: 1,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "9 metros",
    components: "V, S, M (uma gota de água benta)",
    duration: "Concentração, até 1 minuto",
    description: "[Magia de Juramento] Até três criaturas devem fazer salvamento de Carisma (CD 15) ou subtrair 1d4 de suas jogadas de ataque e salvamentos."
  },
  {
    id: "oath_hunters_mark",
    name: "Marca do Caçador",
    level: 1,
    school: "Adivinhação",
    castingTime: "1 ação bônus",
    range: "27 metros",
    components: "V",
    duration: "Concentração, até 1 hora",
    description: "[Magia de Juramento] Você marca uma criatura. Causa +1d6 de dano extra sempre que a atingir com um ataque com arma, e tem vantagem em testes para rastreá-la."
  },
  {
    id: "oath_misty_step",
    name: "Passo Nebuloso",
    level: 2,
    school: "Conjuração",
    castingTime: "1 ação bônus",
    range: "Pessoal",
    components: "V",
    duration: "Instantânea",
    description: "[Magia de Juramento] Teleporte-se por até 9 metros com uma ação bônus para um espaço vazio que possa ver."
  },
  {
    id: "oath_hold_person",
    name: "Imobilizar Pessoa",
    level: 2,
    school: "Encantamento",
    castingTime: "1 ação",
    range: "18 metros",
    components: "V, S, M (um pequeno pedaço reto de ferro)",
    duration: "Concentração, até 1 minuto",
    description: "[Magia de Juramento] Deixe um humanoide paralisado (CD 15 de Sabedoria para resistir). Ataques contra ele a até 1,5m são críticos automáticos!"
  }
];
