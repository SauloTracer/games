export type Article = {
  slug: string;
  title: string;
  description: string;
  category: "História dos jogos" | "Tutorial de sudoku" | "Outros";
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  keywords: string[];
  localizedContentKey?: string;
  callToAction: {
    href: string;
    label: string;
  };
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
};

export const articles: Article[] = [
  {
    slug: "mude-sua-vida-controlando-seus-habitos",
    title: "Mude sua Vida Controlando seus Hábitos",
    description:
      "Entenda como hábitos moldam comportamento, conheça o ciclo de gatilho, ação e recompensa e veja três livros que ajudam a construir rotinas mais saudáveis.",
    category: "Outros",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 9,
    keywords: ["hábitos", "crescimento pessoal", "mini hábitos", "hábitos atômicos", "o poder do hábito"],
    localizedContentKey: "habitControl",
    callToAction: {
      href: "/articles",
      label: "Ver mais artigos",
    },
    sections: [],
  },
  {
    slug: "historia-do-sudoku",
    title: "A história do Sudoku: dos quadrados latinos ao passatempo global",
    description:
      "Entenda como o Sudoku nasceu de ideias matemáticas antigas, ganhou uma forma moderna em revistas japonesas e virou um clássico dos jornais e dos celulares.",
    category: "História dos jogos",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 6,
    keywords: ["história do sudoku", "sudoku", "quadrado latino", "jogo de lógica", "puzzle numérico"],
    callToAction: {
      href: "/sudoku",
      label: "Jogar Sudoku",
    },
    sections: [
      {
        heading: "Antes do nome Sudoku",
        paragraphs: [
          "O Sudoku parece um jogo de números, mas sua essência é lógica espacial. A ideia de organizar símbolos em uma grade sem repetir elementos aparece nos quadrados latinos, estudados muito antes de o passatempo chegar aos jornais. Neles, cada símbolo precisa aparecer uma vez em cada linha e em cada coluna.",
          "A diferença do Sudoku moderno está na divisão em regiões. O tabuleiro mais comum usa 9 linhas, 9 colunas e 9 blocos 3x3. Essa terceira camada muda tudo: uma decisão em um canto do tabuleiro pode limitar uma casa distante, porque linhas, colunas e blocos se cruzam o tempo todo.",
        ],
      },
      {
        heading: "A forma moderna",
        paragraphs: [
          "O formato que reconhecemos hoje ganhou força em revistas de passatempo no fim do século XX. A versão japonesa popularizou o nome Sudoku, uma abreviação ligada à ideia de que os dígitos devem permanecer únicos. O nome ficou curto, memorável e perfeito para capas de revista.",
          "Quando jornais europeus e americanos passaram a publicar desafios diários, o Sudoku encontrou seu ritual: uma grade pela manhã, uma pausa no almoço, alguns minutos antes de dormir. A regra simples permitia começar rápido; a profundidade aparecia quando o jogador tentava resolver sem adivinhar.",
        ],
      },
      {
        heading: "Por que continua atual",
        paragraphs: [
          "O Sudoku funciona porque o progresso é visível. Uma casa resolvida abre uma linha, uma linha abre um bloco, um candidato removido revela uma nova pista. Mesmo técnicas avançadas, como X-Wing ou Swordfish, seguem a mesma promessa: observar restrições e transformar incerteza em conclusão.",
          "No Puzzled, tratamos Sudoku como jogo e como estudo. O tabuleiro online permite jogar; os tutoriais ajudam a nomear padrões que muitos jogadores já percebem intuitivamente. Aprender a técnica dá vocabulário para resolver puzzles difíceis com calma.",
        ],
      },
    ],
  },
  {
    slug: "historia-do-snake",
    title: "A história do Snake: da sala de arcade ao jogo da cobrinha no bolso",
    description:
      "Conheça a trajetória do Snake, o jogo de reflexo e planejamento que atravessou arcades, computadores, celulares clássicos e navegadores modernos.",
    category: "História dos jogos",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 5,
    keywords: ["história do snake", "jogo da cobrinha", "snake online", "arcade", "jogos clássicos"],
    callToAction: {
      href: "/snake",
      label: "Jogar Snake",
    },
    sections: [
      {
        heading: "Um labirinto que cresce",
        paragraphs: [
          "Snake pertence a uma família antiga de jogos em que o jogador controla uma linha em movimento constante. A meta é simples: coletar comida, crescer e evitar colisões. Essa estrutura cria uma tensão elegante, porque cada ponto conquistado também torna o próximo movimento mais perigoso.",
          "Nos arcades e computadores, jogos de trilha já exploravam a ideia de ocupar espaço. O Snake simplificou o conceito até restar uma pergunta clara: você consegue planejar o próximo caminho antes que seu próprio corpo feche a saída?",
        ],
      },
      {
        heading: "A cobrinha dos celulares",
        paragraphs: [
          "A popularidade explodiu quando o jogo chegou a celulares de teclado físico. A tela pequena não era uma limitação; era parte do charme. As quatro direções cabiam perfeitamente no teclado, as partidas duravam poucos minutos e o recorde local virava assunto entre amigos.",
          "Essa fase transformou Snake em memória coletiva. Para muita gente, foi um dos primeiros jogos sempre disponíveis no bolso, antes das lojas de aplicativos, dos rankings online e dos gráficos complexos.",
        ],
      },
      {
        heading: "Estratégia em tempo real",
        paragraphs: [
          "Apesar da aparência minimalista, Snake recompensa leitura de espaço. Jogadores experientes evitam becos sem saída, criam rotas largas, circulam pelas bordas e só cortam caminho quando têm certeza de que a cabeça não será encurralada.",
          "A versão do Puzzled mantém essa tensão: reflexo importa, mas estratégia importa mais quando a cobra cresce. O desafio não é apenas alcançar a comida; é continuar tendo um plano depois dela.",
        ],
      },
    ],
  },
  {
    slug: "historia-do-slide-puzzle",
    title: "A história do Slide Puzzle: o desafio de deslizar peças até a ordem",
    description:
      "Do quebra-cabeça de 15 peças aos tabuleiros digitais, veja por que o Slide Puzzle continua sendo um exercício direto de ordem, espaço e planejamento.",
    category: "História dos jogos",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 5,
    keywords: ["história do slide puzzle", "racha cuca", "quebra-cabeça de 15", "puzzle deslizante"],
    callToAction: {
      href: "/slide",
      label: "Jogar Racha Cuca",
    },
    sections: [
      {
        heading: "O quebra-cabeça de 15",
        paragraphs: [
          "O Slide Puzzle clássico usa uma moldura, quinze peças numeradas e um espaço vazio. O objetivo é reorganizar as peças em sequência, movendo apenas as peças vizinhas ao espaço livre. Essa regra mínima cria uma consequência importante: não basta saber onde uma peça deve ficar, é preciso preparar caminho para que ela chegue lá.",
          "A febre do puzzle de 15 peças mostrou como um objeto pequeno podia gerar discussões enormes. Algumas configurações são resolvíveis; outras, se montadas incorretamente, não têm solução dentro das regras. Essa relação entre embaralhamento e paridade virou parte da matemática por trás do jogo.",
        ],
      },
      {
        heading: "Do bolso para a tela",
        paragraphs: [
          "A versão física depende de trilhos e peças que deslizam. A versão digital preserva o raciocínio e acrescenta cronômetro, contador de movimentos, tamanhos variados de tabuleiro e reinícios rápidos. O jogador pode tentar um método tranquilo ou perseguir uma solução cada vez mais curta.",
          "No Brasil, nomes como Racha Cuca e quebra-cabeça deslizante aparecem para descrever a mesma sensação: olhar uma ordem quase correta e descobrir qual pequeno movimento desfaz ou resolve o nó.",
        ],
      },
      {
        heading: "Como pensar o tabuleiro",
        paragraphs: [
          "Um método comum é resolver por camadas: fechar a primeira linha, depois a segunda, depois reduzir o problema até o canto final. A tentação é mover a peça desejada diretamente; o jogo ensina a pensar no conjunto, porque o espaço vazio também é uma peça estratégica.",
          "No Puzzled, o Slide Puzzle é direto: clique ou toque uma peça vizinha ao vazio e acompanhe tempo e movimentos. O desafio real está em criar ordem sem destruir a parte que você já organizou.",
        ],
      },
    ],
  },
  {
    slug: "historia-do-tetris",
    title: "A história do Tetris: peças, pressão e uma ideia que encaixou no mundo",
    description:
      "Conheça a origem do Tetris, por que os tetrominós funcionam tão bem e como o jogo virou um dos símbolos mais duradouros da cultura dos games.",
    category: "História dos jogos",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 6,
    keywords: ["história do tetris", "tetrominós", "jogos clássicos", "puzzle de ação", "arcade"],
    callToAction: {
      href: "/tetris",
      label: "Jogar Tetris",
    },
    sections: [
      {
        heading: "A força dos tetrominós",
        paragraphs: [
          "Tetris é construído com tetrominós, formas feitas por quatro quadrados conectados. Elas caem em uma matriz, podem ser movidas e rotacionadas, e desaparecem quando completam linhas. A regra cabe em uma frase; a pressão nasce porque o jogo não espera o jogador terminar de pensar.",
          "O brilho do design está no conflito entre geometria e tempo. Uma peça ruim pode virar oportunidade se preparar uma cavidade correta. Uma peça esperada pode chegar tarde demais. A pontuação recompensa limpar linhas, mas a sobrevivência exige manter o poço organizado.",
        ],
      },
      {
        heading: "De experimento a fenômeno",
        paragraphs: [
          "Criado nos anos 1980, Tetris circulou por computadores, arcades, consoles e portáteis. Sua identidade não dependia de personagens ou cenários; bastavam peças caindo, uma grade e a vontade imediata de consertar o espaço vazio.",
          "Essa portabilidade ajudou o jogo a cruzar fronteiras técnicas e culturais. Mesmo com variações de regras, velocidade, rotação e pontuação, a experiência central continua reconhecível: organizar o caos antes que ele alcance o topo.",
        ],
      },
      {
        heading: "O que aprender jogando",
        paragraphs: [
          "Tetris treina antecipação. A fila de próximas peças permite planejar; o hold permite guardar uma peça crítica; o hard drop troca margem de erro por velocidade. Quanto maior o nível, mais o jogador precisa decidir com antecedência.",
          "Na versão do Puzzled, o objetivo é manter esse ciclo legível: mover, rotacionar, limpar linhas, observar a próxima peça e recuperar a estrutura depois de um erro. Uma partida curta já mostra por que o jogo permanece intenso depois de décadas.",
        ],
      },
    ],
  },
  {
    slug: "como-jogar-sudoku",
    title: "Como jogar Sudoku: regras, candidatos e o primeiro método de resolução",
    description:
      "Um guia para começar no Sudoku: entenda linhas, colunas, blocos, números dados, candidatos e uma rotina simples para resolver sem chutar.",
    category: "Tutorial de sudoku",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 7,
    keywords: ["como jogar sudoku", "regras do sudoku", "tutorial de sudoku", "candidatos sudoku"],
    callToAction: {
      href: "/sudoku",
      label: "Praticar no Sudoku",
    },
    sections: [
      {
        heading: "A regra do jogo",
        paragraphs: [
          "No Sudoku clássico, você completa uma grade 9x9 usando os dígitos de 1 a 9. Cada linha deve conter todos os dígitos sem repetição; cada coluna também; cada bloco 3x3 também. Os números impressos no início são as pistas e não devem ser alterados.",
          "O jogo não exige cálculo. O número 7 não é maior nem melhor que o número 3; ele é apenas um símbolo que precisa ocupar uma posição válida. Por isso, Sudoku é um puzzle de eliminação e posicionamento.",
        ],
      },
      {
        heading: "Comece pelo que tem mais informação",
        paragraphs: [
          "Escolha uma linha, coluna ou bloco quase completo e pergunte: quais números ainda faltam? Depois teste esses números nas casas vazias, verificando os cruzamentos. Se uma casa pertence a uma linha que já tem 5, ela não pode receber 5. Se pertence a um bloco com 8, ela não pode receber 8.",
          "Quando uma casa só aceita um número, você encontrou um single. Quando um número só cabe em uma casa de uma região, você encontrou um single oculto. Esses dois padrões resolvem muitos sudokus fáceis e são a base para técnicas mais fortes.",
        ],
      },
      {
        heading: "Use candidatos com disciplina",
        paragraphs: [
          "Candidatos são anotações pequenas dentro das casas vazias. Eles representam possibilidades, não respostas. Ao preencher um número definitivo, remova esse número dos candidatos da mesma linha, coluna e bloco.",
          "Evite preencher candidatos sem revisar. Um candidato falso pode esconder uma conclusão; um candidato esquecido pode impedir que você enxergue um X-Wing, um Pointing Pair ou outro padrão. No Puzzled, o modo de candidatos ajuda a separar rascunho e resposta final.",
        ],
      },
    ],
  },
  {
    slug: "sudoku-pointing-pairs",
    title: "Pointing Pairs no Sudoku: como eliminar candidatos que apontam para fora do bloco",
    description:
      "Aprenda a técnica Pointing Pairs/Triples: quando todos os candidatos de um número em um bloco ficam na mesma linha ou coluna, você pode eliminar candidatos fora do bloco.",
    category: "Tutorial de sudoku",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 6,
    keywords: ["pointing pairs", "pointing triples", "técnicas de sudoku", "candidatos sudoku"],
    callToAction: {
      href: "/sudoku",
      label: "Treinar Pointing Pairs",
    },
    sections: [
      {
        heading: "A ideia central",
        paragraphs: [
          "Pointing Pair acontece quando, dentro de um bloco 3x3, todos os candidatos possíveis de um número estão alinhados na mesma linha ou na mesma coluna. Pode haver duas casas, formando um par, ou três casas, formando um triple. O nome importa menos que a lógica.",
          "Se o número 6 precisa ficar em algum lugar daquele bloco e todos os lugares possíveis estão na linha 4, então o 6 daquele bloco obrigatoriamente ocupará a linha 4. Como a linha 4 só pode ter um 6, você pode remover o candidato 6 do restante da linha, fora do bloco.",
        ],
      },
      {
        heading: "Passo a passo",
        paragraphs: [
          "Olhe bloco por bloco. Escolha um número e marque mentalmente onde ele ainda pode entrar. Se as posições se espalham pelo bloco, não há Pointing Pair. Se ficam todas no mesmo trilho horizontal ou vertical, siga esse trilho para fora do bloco e elimine o mesmo candidato.",
          "Depois de eliminar, revise as regiões afetadas. Às vezes a remoção cria um single em outra coluna; às vezes prepara uma técnica maior. O valor da técnica está na limpeza do tabuleiro, mesmo quando ela não preenche uma casa imediatamente.",
        ],
      },
      {
        heading: "Erro comum",
        paragraphs: [
          "Não basta ver dois candidatos iguais alinhados dentro do bloco. Eles precisam ser todos os candidatos daquele número dentro do bloco. Se houver um terceiro candidato do mesmo número em outra linha do mesmo bloco, a conclusão desaparece.",
        ],
      },
    ],
  },
  {
    slug: "sudoku-x-wing",
    title: "X-Wing no Sudoku: encontre o retângulo que remove candidatos",
    description:
      "Entenda a técnica X-Wing para Sudoku: quatro candidatos em duas linhas e duas colunas que travam a posição de um número e liberam eliminações.",
    category: "Tutorial de sudoku",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 7,
    keywords: ["x-wing sudoku", "técnica x-wing", "sudoku avançado", "eliminar candidatos"],
    callToAction: {
      href: "/sudoku",
      label: "Treinar X-Wing",
    },
    sections: [
      {
        heading: "O padrão",
        paragraphs: [
          "Um X-Wing ocorre quando um candidato aparece exatamente em duas casas de uma linha, e o mesmo candidato aparece exatamente nas mesmas duas colunas de outra linha. Essas quatro casas formam os cantos de um retângulo.",
          "Imagine o candidato 7 em L2C3 e L2C8; na linha 6, o 7 também só aparece em C3 e C8. O 7 da linha 2 precisa escolher uma dessas colunas; o 7 da linha 6 ficará na outra. Em qualquer cenário, as colunas 3 e 8 já estão reservadas para esses dois 7.",
        ],
      },
      {
        heading: "A eliminação",
        paragraphs: [
          "Depois de confirmar o retângulo, remova o mesmo candidato das outras casas dessas duas colunas. O raciocínio também funciona invertido: se o padrão começa em duas colunas e usa as mesmas duas linhas, você elimina das outras casas dessas linhas.",
          "O X-Wing raramente coloca um número diretamente. Ele destrava o puzzle por remoção. Após aplicar a técnica, procure singles, pares nus, pares ocultos e interações bloco-linha; o efeito costuma aparecer alguns passos depois.",
        ],
      },
      {
        heading: "Como procurar",
        paragraphs: [
          "Escolha um candidato, por exemplo o 4, e varra as linhas procurando linhas onde o 4 apareça apenas duas vezes. Anote mentalmente as colunas. Quando duas linhas compartilham o mesmo par de colunas, investigue o retângulo.",
          "No Sudoku do Puzzled, o filtro pode ajudar a destacar candidatos. Use esse destaque como apoio visual, mas mantenha a regra na cabeça: duas regiões de base, duas posições por região, mesmas regiões de cobertura.",
        ],
      },
    ],
  },
  {
    slug: "sudoku-xy-wing",
    title: "X-Y-Wing no Sudoku: a asa que conecta três casas com dois candidatos",
    description:
      "Aprenda X-Y-Wing: um padrão com pivô XY, duas asas XZ e YZ, e eliminações do candidato Z nas casas que enxergam as duas asas.",
    category: "Tutorial de sudoku",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 7,
    keywords: ["x-y-wing sudoku", "xy-wing", "sudoku avançado", "pivô sudoku", "asas sudoku"],
    callToAction: {
      href: "/sudoku",
      label: "Treinar X-Y-Wing",
    },
    sections: [
      {
        heading: "Pivô e asas",
        paragraphs: [
          "X-Y-Wing usa três casas com exatamente dois candidatos cada. A casa pivô tem candidatos X e Y. Uma asa, que enxerga o pivô, tem X e Z. A outra asa, que também enxerga o pivô, tem Y e Z. O candidato comum às asas é Z.",
          "As asas não precisam enxergar uma à outra. O requisito é que cada asa enxergue o pivô por linha, coluna ou bloco. A eliminação atinge casas que enxergam simultaneamente as duas asas.",
        ],
      },
      {
        heading: "Por que funciona",
        paragraphs: [
          "Se o pivô virar X, a asa XZ não pode ser X, então vira Z. Se o pivô virar Y, a asa YZ não pode ser Y, então vira Z. Em todos os cenários, pelo menos uma asa será Z.",
          "Portanto, qualquer casa que enxergue as duas asas não pode manter Z como candidato. Se ela fosse Z, entraria em conflito com a asa que inevitavelmente precisa conter Z.",
        ],
      },
      {
        heading: "Uma forma prática de encontrar",
        paragraphs: [
          "Filtre mentalmente as casas com dois candidatos. Escolha uma como pivô e procure duas casas relacionadas: uma compartilhando o primeiro candidato, outra compartilhando o segundo. Se as duas asas têm um terceiro candidato igual, teste as interseções.",
          "O X-Y-Wing é uma técnica de precisão. Não elimine candidatos que veem apenas uma asa. A casa alvo precisa estar na zona de influência das duas asas ao mesmo tempo.",
        ],
      },
    ],
  },
  {
    slug: "sudoku-swordfish",
    title: "Swordfish no Sudoku: o peixe de três linhas que limpa candidatos",
    description:
      "Guia da técnica Swordfish: reconheça candidatos distribuídos em três linhas e três colunas para fazer eliminações seguras em puzzles difíceis.",
    category: "Tutorial de sudoku",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 7,
    keywords: ["swordfish sudoku", "técnicas avançadas de sudoku", "fish sudoku", "candidatos"],
    callToAction: {
      href: "/sudoku",
      label: "Treinar Swordfish",
    },
    sections: [
      {
        heading: "Um X-Wing maior",
        paragraphs: [
          "Swordfish é parente do X-Wing. Em vez de duas linhas e duas colunas, ele usa três linhas e três colunas para um mesmo candidato. Nas três linhas escolhidas, todas as aparições possíveis daquele candidato devem ficar confinadas às mesmas três colunas.",
          "Quando isso acontece, os três exemplares do número ocuparão aquelas três colunas em alguma ordem. Logo, o mesmo candidato pode ser removido das outras casas dessas colunas.",
        ],
      },
      {
        heading: "Nem sempre são nove candidatos",
        paragraphs: [
          "Um Swordfish pode ter seis, sete, oito ou nove marcas, dependendo de quantas possibilidades aparecem nas linhas de base. O ponto é o confinamento: cada linha da formação tem duas ou três posições, e a união dessas posições usa exatamente três colunas.",
          "Também existe a versão por colunas. Se você encontra três colunas em que um candidato fica restrito às mesmas três linhas, elimina esse candidato das outras casas dessas linhas.",
        ],
      },
      {
        heading: "Quando procurar",
        paragraphs: [
          "Procure Swordfish depois que singles, pares, interações bloco-linha e X-Wing não renderem. A técnica é poderosa, mas exige candidatos organizados. Sem anotações limpas, o padrão fica quase invisível.",
          "Ao encontrar um possível peixe, valide antes de eliminar: é o mesmo candidato? São exatamente três regiões de base? As posições de cobertura são exatamente três? Existe candidato fora dessas posições em alguma região de base? Essas perguntas evitam a maioria dos erros.",
        ],
      },
    ],
  },
  {
    slug: "sudoku-candidatos-e-singles",
    title: "Candidatos, naked singles e hidden singles: o alicerce do Sudoku",
    description:
      "Aprenda a usar candidatos sem poluir o tabuleiro e domine os dois singles mais importantes: casa com uma possibilidade e número com uma única posição.",
    category: "Tutorial de sudoku",
    publishedAt: "2026-04-09",
    updatedAt: "2026-04-09",
    readingMinutes: 6,
    keywords: ["candidatos sudoku", "naked single", "hidden single", "tutorial sudoku"],
    callToAction: {
      href: "/sudoku",
      label: "Praticar candidatos",
    },
    sections: [
      {
        heading: "Candidatos são hipóteses controladas",
        paragraphs: [
          "Uma casa vazia pode aceitar alguns números e rejeitar outros por causa da linha, da coluna e do bloco. Anotar essas possibilidades cria o conjunto de candidatos. O objetivo não é encher a grade de marcas, e sim registrar informação suficiente para enxergar padrões.",
          "Sempre que inserir uma resposta definitiva, faça uma limpeza: o número colocado sai dos candidatos das casas relacionadas. Essa manutenção é mais importante que a velocidade.",
        ],
      },
      {
        heading: "Naked single",
        paragraphs: [
          "Um naked single aparece quando uma casa tem apenas um candidato. Se a casa só pode ser 9, ela é 9. É direto, visível e costuma surgir depois de uma sequência de eliminações.",
          "Antes de resolver técnicas avançadas, passe pelo tabuleiro procurando casas com um único candidato. Ignorar um single pode transformar um puzzle simples em uma investigação desnecessária.",
        ],
      },
      {
        heading: "Hidden single",
        paragraphs: [
          "Um hidden single aparece quando um número só tem uma posição possível dentro de uma região, mesmo que aquela casa tenha outros candidatos anotados. Por exemplo: em um bloco, apenas uma casa aceita o 4. Então essa casa é 4.",
          "Para encontrá-lo, mude a pergunta. Não olhe apenas casa por casa; olhe número por número dentro de cada linha, coluna e bloco. Onde o 1 pode entrar? Onde o 2 pode entrar? Essa varredura revela candidatos únicos escondidos.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
