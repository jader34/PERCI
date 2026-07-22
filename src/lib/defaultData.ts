import { CharacterData } from "../types";

export const defaultCharacterData: CharacterData = {
  name: "Percival \"O Triturador\"",
  title: "Paladino do Juramento da Vingança / Sangue",
  class: "Paladino",
  level: 5,
  xp: 6500,
  hp: {
    max: 50,
    current: 50,
    temp: 0
  },
  ac: 17, // Placa-1 (17)
  speed: "9m (30ft)",
  initiativeBonus: 0,
  attributes: {
    str: { name: "Força", shortName: "str", value: 16, proficient: false }, // Saves remain Wis/Cha
    dex: { name: "Destreza", shortName: "dex", value: 10, proficient: false },
    con: { name: "Constituição", shortName: "con", value: 14, proficient: false },
    int: { name: "Inteligência", shortName: "int", value: 13, proficient: false },
    wis: { name: "Sabedoria", shortName: "wis", value: 12, proficient: true }, // Wis save
    cha: { name: "Carisma", shortName: "cha", value: 18, proficient: true }  // Cha save
  },
  skills: [
    { name: "Acrobacia", attributeShortName: "dex", proficient: false },
    { name: "Adestrar Animais", attributeShortName: "wis", proficient: false },
    { name: "Arcanismo", attributeShortName: "int", proficient: false },
    { name: "Atletismo", attributeShortName: "str", proficient: true }, // Athletics
    { name: "Atuação", attributeShortName: "cha", proficient: false },
    { name: "Enganação", attributeShortName: "cha", proficient: false },
    { name: "História", attributeShortName: "int", proficient: false },
    { name: "Intimidação", attributeShortName: "cha", proficient: true }, // Intimidation
    { name: "Intuição", attributeShortName: "wis", proficient: true },   // Insight (now proficient as per prompt)
    { name: "Investigação", attributeShortName: "int", proficient: false },
    { name: "Medicina", attributeShortName: "wis", proficient: false },
    { name: "Natureza", attributeShortName: "int", proficient: false },
    { name: "Percepção", attributeShortName: "wis", proficient: false }, // passive = 10 + 1 = 11
    { name: "Perspicácia", attributeShortName: "wis", proficient: false },
    { name: "Persuasão", attributeShortName: "cha", proficient: true }, // Persuasion
    { name: "Prestidigitação", attributeShortName: "dex", proficient: false },
    { name: "Religião", attributeShortName: "int", proficient: false }, // Not listed as proficient in prompt
    { name: "Sobrevivência", attributeShortName: "wis", proficient: false },
    { name: "Furtividade", attributeShortName: "dex", proficient: false }
  ],
  layOnHands: {
    max: 25,
    current: 25
  },
  divineSense: {
    max: 5, // 1 + CHA mod (4)
    current: 5
  },
  channelDivinity: {
    max: 1,
    current: 1
  },
  bloodBlessing: {
    max: 1,
    current: 1
  },
  spellSlots: {
    level1: { max: 4, current: 4 },
    level2: { max: 2, current: 2 },
    level3: { max: 0, current: 0 }
  },
  spells: [
    {
      id: "s1",
      name: "Bênção (Bless)",
      level: 1,
      school: "Encantamento",
      castingTime: "1 ação",
      range: "9 metros",
      components: "V, S, M",
      duration: "Concentração, até 1 minuto",
      description: "Abençoa até três criaturas. Elas adicionam 1d4 a todas as jogadas de ataque e salvamentos.",
      prepared: true
    },
    {
      id: "s2",
      name: "Comando (Command)",
      level: 1,
      school: "Encantamento",
      castingTime: "1 ação",
      range: "18 metros",
      components: "V",
      duration: "1 rodada",
      description: "Diga uma palavra de ordem de uma sílaba a uma criatura. Se falhar no salvamento de Sabedoria (CD 15), ela deve obedecer na sua próxima vez (ex: Derrubar, Parar, Fugir).",
      prepared: true
    },
    {
      id: "s3",
      name: "Curar Ferimentos (Cure Wounds)",
      level: 1,
      school: "Evocação",
      castingTime: "1 ação",
      range: "Toque",
      components: "V, S",
      duration: "Instantânea",
      description: "Uma criatura que você tocar recupera um número de pontos de vida igual a 1d8 + seu modificador de Carisma (+4).",
      prepared: true
    },
    {
      id: "s4",
      name: "Destruição Trovejante (Thunderous Smite)",
      level: 1,
      school: "Evocação",
      castingTime: "1 ação bônus",
      range: "Pessoal",
      components: "V",
      duration: "Concentração, até 1 minuto",
      description: "A primeira vez que você atingir com um ataque de arma antes da magia acabar, seu ataque causa 1d6 de dano trovejante adicional. O alvo deve fazer um salvamento de Força (CD 15) ou ser empurrado 3 metros e ficar caído.",
      prepared: true
    },
    {
      id: "s5",
      name: "Escudo da Fé (Shield of Faith)",
      level: 1,
      school: "Abjuração",
      castingTime: "1 ação bônus",
      range: "9 metros",
      components: "V, S, M",
      duration: "Concentração, até 10 minutos",
      description: "Um campo brilhante aparece cercado de preces em torno de um alvo à sua escolha, concedendo +2 de bônus na CA pelo tempo de duração.",
      prepared: true
    },
    {
      id: "s6",
      name: "Restauração Menor (Lesser Restoration)",
      level: 2,
      school: "Abjuração",
      castingTime: "1 ação",
      range: "Toque",
      components: "V, S",
      duration: "Instantânea",
      description: "Toque uma criatura e termine uma doença ou uma condição que a afete (Cego, Surdo, Paralisado ou Envenenado).",
      prepared: true
    },
    {
      id: "s7",
      name: "Perdição (Bane)",
      level: 1,
      school: "Encantamento",
      castingTime: "1 ação",
      range: "9 metros",
      components: "V, S, M",
      duration: "Concentração, até 1 minuto",
      description: "[Magia de Juramento] Até três criaturas devem fazer salvamento de Carisma (CD 15) ou subtrair 1d4 de suas jogadas de ataque e salvamentos.",
      prepared: true
    },
    {
      id: "s8",
      name: "Marca do Caçador (Hunter's Mark)",
      level: 1,
      school: "Adivinhação",
      castingTime: "1 ação bônus",
      range: "27 metros",
      components: "V",
      duration: "Concentração, até 1 hora",
      description: "[Magia de Juramento] Você marca uma criatura. Causa +1d6 de dano extra sempre que a atingir com um ataque com arma, e tem vantagem em testes para rastreá-la.",
      prepared: true
    },
    {
      id: "s9",
      name: "Passo Nebuloso (Misty Step)",
      level: 2,
      school: "Conjuração",
      castingTime: "1 ação bônus",
      range: "Pessoal",
      components: "V",
      duration: "Instantânea",
      description: "[Magia de Juramento] Teleporte-se por até 9 metros com uma ação bônus para um espaço vazio que possa ver.",
      prepared: true
    },
    {
      id: "s10",
      name: "Imobilizar Pessoa (Hold Person)",
      level: 2,
      school: "Encantamento",
      castingTime: "1 ação",
      range: "18 metros",
      components: "V, S, M",
      duration: "Concentração, até 1 minuto",
      description: "[Magia de Juramento] Deixe um humanoide paralisado (CD 15 de Sabedoria para resistir). Ataques contra ele a até 1,5m são críticos automáticos!",
      prepared: true
    }
  ],
  inventory: [
    {
      id: "i1",
      name: "Alabarda",
      quantity: 1,
      description: "Arma de haste de duas mãos. Causa 1d10 de dano cortante. Permite golpear com alcance de 3 metros.",
      weight: 2.7,
      isMagical: false,
      equipped: true
    },
    {
      id: "i2",
      name: "Armadura de Placa-1",
      quantity: 1,
      description: "Sua armadura de placa pesada, ligeiramente modificada ou danificada. Concede CA 17 fixa. Desvantagem em Furtividade.",
      weight: 30,
      isMagical: false,
      equipped: true
    },
    {
      id: "i5",
      name: "Amuleto Sagrado (Símbolo)",
      quantity: 1,
      description: "Amuleto de prata com o punho de ferro estalando relâmpagos. Serve como foco de conjuração.",
      weight: 0.5,
      isMagical: true,
      equipped: true
    },
    {
      id: "i6",
      name: "Poção de Cura Maior",
      quantity: 2,
      description: "Um líquido vermelho borbulhante. Cura 4d4 + 4 pontos de vida quando bebida.",
      weight: 0.5,
      isMagical: true,
      equipped: false
    },
    {
      id: "i7",
      name: "Saco de Dormir",
      quantity: 1,
      description: "Cobertor pesado e quente para acampamentos em relva.",
      weight: 2,
      isMagical: false,
      equipped: false
    },
    {
      id: "i8",
      name: "Rações de Viagem (Cinco dias)",
      quantity: 5,
      description: "Frutas secas, carne de sol e pão élfico de alta densidade.",
      weight: 1,
      isMagical: false,
      equipped: false
    }
  ],
  coins: {
    gp: 120,
    sp: 45,
    cp: 14
  },
  features: [
    {
      id: "f1",
      name: "Ataque Extra (Extra Attack)",
      source: "Classe - Paladino Nív 5",
      description: "Com o Ataque Extra, você agora ataca duas vezes com a ação de Ataque. Se usar a ação bônus para bater com o cabo da Alabarda, são três ataques por turno!"
    },
    {
      id: "f2",
      name: "Sentido Divino (Divine Sense)",
      source: "Classe - Paladino Nív 1",
      description: "Com uma ação, pode detectar a presença de celestiais, corruptores ou mortos-vivos, bem como locais consagrados ou dessagrados, a até 18 metros."
    },
    {
      id: "f3",
      name: "Cura pelas Mãos (Lay on Hands)",
      source: "Classe - Paladino Nív 1",
      description: "Você possui uma reserva de poder curativo (25 pontos) que se recarrega com descanso longo. Com uma ação, pode tocar uma criatura e aplicar pontos de vida da reserva, ou gastar 5 pontos para neutralizar uma doença ou veneno."
    },
    {
      id: "f4",
      name: "Estilo de Combate: Armas Grandes",
      source: "Classe - Paladino Nív 2",
      description: "Quando rolar 1 ou 2 em um dado de dano para um ataque com arma corpo-a-corpo empunhada com duas mãos, você pode rolar novamente esse dado (deve usar o novo resultado)."
    },
    {
      id: "f5",
      name: "Destruição Divina (Divine Smite)",
      source: "Classe - Paladino Nív 2",
      description: "Ao acertar um ataque corpo-a-corpo, você pode gastar um slot de magia para causar dano radiante extra de 2d8 para slot de 1º nível, +1d8 para cada nível superior (máximo 5d8), mais +1d8 se o alvo for corruptor ou morto-vivo."
    },
    {
      id: "f6",
      name: "Saúde Divina (Divine Health)",
      source: "Classe - Paladino Nív 3",
      description: "A energia divina fluindo em suas veias torna você imune a doenças naturais e mágicas."
    },
    {
      id: "f8",
      name: "Canalizar Divindade (Channel Divinity)",
      source: "Juramento de Sangue - Paladino Nív 3",
      description: "Você canaliza magia divina de sangue (1 uso por descanso curto ou longo) para alimentar um dos seguintes efeitos:\n\n1. Absorver Vitalidade (Ação): Toque uma criatura. Ela deve passar em um teste de Constituição (CD 15) ou ficará IMPEDIDA pela falta de vitalidade. Repete o salvamento ao final de cada turno dela.\n\n2. Bênção de Sangue (Ação): Imbui sua arma por 1 min. Adiciona seu mod. de Carisma (+4) às jogadas de ataque. O 1º ataque bem-sucedido causa dano Necrótico e aplica uma Marca de Sangue por 1 turno. Alvos marcados sofrem +4 de dano Necrótico no próximo ataque e a marca se move se o alvo morrer. Arma emite luz escarlate (6m) e conta como mágica."
    },
    {
      id: "f7",
      name: "Aura de Proteção (Aura of Protection)",
      source: "Classe - Paladino Nív 6 (Quase lá!)",
      description: "Você e aliados amigáveis dentro de 3 metros ganham um bônus igual ao seu modificador de Carisma (+4) em todas as jogadas de salvamento."
    }
  ],
  notes: "Percival é conhecido como 'O Triturador' e agora segue o Juramento da Vingança/Sangue. Possui um forte vínculo infernal com seu Pesadelo Sanguinário."
};
