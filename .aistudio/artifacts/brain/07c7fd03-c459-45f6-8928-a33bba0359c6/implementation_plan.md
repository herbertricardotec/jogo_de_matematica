# Evolução Pedagógica, Voz Sintetizada (TTS) e Modo Professor no Celular

Este plano detalha a implementação das quatro melhorias selecionadas para elevar a experiência de sala de aula e família no **Jogo de Matemática 3D**: controle completo do **Modo Professor pelo celular do Jogador 1 (Host)**, **leitura automática das perguntas em voz alta (TTS em Português)** com opção de silenciar, **gerador rápido de tabuada específica (1 a 10) em 1 clique** e **alternativas inteligentes (distratores pedagógicos) com avanço automático de rodada**.

## User Review & Critical Decisions

> [!IMPORTANT]
> Todas as decisões abaixo refletem diretamente as escolhas confirmadas nas perguntas anteriores. Revise o fluxo proposto e clique em **Proceed** para iniciarmos a codificação.

- **Decisão Confirmada 1 — Escopo Completo das 4 Melhorias**: Implementaremos em conjunto:
  1. Controle do Modo Professor no celular do Host (Jogador 1).
  2. Narração em voz alta (TTS) das perguntas em português.
  3. Gerador rápido de tabuada específica (1 a 10) em 1 clique + embaralhar.
  4. Alternativas inteligentes (distratores pedagógicos) e avanço automático na revelação da rodada.
- **Decisão Confirmada 2 — Modo Professor no Celular do Host**: O Jogador 1 (Líder da Sala) terá um botão **"Modo Professor (Criar Contas)"** diretamente na tela do celular durante o Lobby, sincronizando instantaneamente as contas criadas ou embaralhadas com a TV sem precisar digitar pelo controle remoto.
- **Decisão Confirmada 3 — Comportamento da Voz (TTS)**: Sempre que uma nova pergunta aparecer na tela (`QUESTION_ACTIVE`), o enunciado em português (`speechText`) será lido automaticamente usando `window.speechSynthesis` (`pt-BR`), acompanhado de um botão **Voz On/Off** independente no controle global de áudio e de um botão **"Ouvir Novamente"** no palco.

---

## 1. Overview & Core Concept

- **O Que Faz**:
  - **Modo Professor no Celular do Host**: Permite que pais e professores usem o teclado ágil do smartphone (Jogador 1) para cadastrar contas personalizadas, gerar uma tabuada inteira (1 a 10) com 1 toque, embaralhar a ordem das perguntas e iniciar a partida na TV.
  - **Narração em Voz Alta (TTS)**: Lê o enunciado da questão de forma clara e amigável em português brasileiro assim que a rodada começa, garantindo acessibilidade total para crianças em fase de alfabetização (5 a 7 anos).
  - **Gerador de Tabuada de 1 a 10 (TV & Celular)**: Adiciona botões numéricos diretos (`Tabuada do 1` até `Tabuada do 10`) tanto na TV quanto no celular do Host para carregar instantaneamente os 10 desafios daquela tabuada.
  - **Distratores Pedagógicos & Ritmo Fluido**: Substitui alternativas aleatórias óbvias por distratores plausíveis (resultados vizinhos da tabuada, erro de $\pm 1$ no fator ou inversão de dígitos) e adiciona contagem regressiva automática de 4 segundos na tela de revelação (`ROUND_REVEAL`) para avançar para a próxima atividade sem travar o ritmo.
- **Público-Alvo**: Crianças de 5 a 12 anos, pais jogando na sala de estar (Amazon Fire TV Stick / Smart TVs) e professores aplicando atividades gamificadas.
- **Valor Principal**: Elimina a fricção de digitar contas pelo controle remoto da TV, inclui crianças pequenas que ainda estão aprendendo a ler e mantém o ritmo dinâmico de *game show*.

---

## 2. User Experience & Visual Design

- **Fluxos de Usuário Principais**:
  1. **Fluxo do Professor/Pai no Celular (Host)**:
     - O Jogador 1 faz login pelo celular e visualiza o card de controle do Host no Lobby.
     - Toca em **"📚 Modo Professor (Personalizar Contas)"** para expandir a gaveta interativa no celular.
     - Escolhe um botão rápido de **Tabuada (1 a 10)**, um pacote pronto ou digita uma conta manual (`Termo A`, `Operação`, `Termo B`), toca em **"🔀 Embaralhar as contas"** se desejar e pressiona **"▶ Iniciar Partida Personalizada na TV!"**.
  2. **Fluxo de Voz Sintetizada (TTS)**:
     - Ao iniciar cada pergunta, o sintetizador de voz em português (`pt-BR`) lê o enunciado (ex.: *"Três grupos de quatro blocos formam quantos blocos?"*).
     - No topo da TV, ao lado de **Música On/Off** e **Efeitos On/Off**, o usuário conta com o botão **Voz On/Off** persistido no navegador, além de um botão compacto de repetir leitura no card da pergunta.
  3. **Fluxo de Revelação com Avanço Automático**:
     - Assim que todos os jogadores respondem (ou o tempo se esgota), a TV exibe a resposta correta e um indicador visual de avanço automático em **4 segundos**, mantendo também o botão `Enter` para avanço imediato.

- **Identidade Visual & Tema**:
  - **Direção Estética**: Palco 3D televisivo de alto contraste (*Game Show Educativo*), preservando 100% da compatibilidade com o *Viewport Scaling* (`--tv-scale`) do navegador Amazon Silk na Fire TV Stick, 1080p e 4K.
  - **Paleta de Cores (Regra 60-30-10)**:
    - *60% Canvas Dominante*: Azul Noturno Profundo (`#071936` e `#0F172A`) para conforto ocular na TV.
    - *30% Superfícies Estruturais*: Painéis 3D (`#1E293B`) com bordas nítidas e tipografia clara (`#F8FAFC`, `#BAE6FD`).
    - *10% Acentos de Ação*: Verde Esmeralda (`#22C55E`) para ações primárias de jogar, Amarelo Sol (`#FFD600`) para destaques de foco D-Pad e Azul Celeste (`#007AFF`) para ferramentas pedagógicas e embaralhamento.
  - **Tipografia & Hierarquia**: Títulos expressivos em `Fredoka` / `Baloo 2` (`font-display`), corpo legível em `Nunito` e numerais estritamente tabulares (`font-mono tabular-nums`) em todas as equações, cronômetros e placares.
- **Feedback Interativo & Movimento**: Transições suaves baseadas em `transform` e `opacity` ($\le 200\text{ms}$), com foco espacial 2D (`data-tv-focusable="true"`) sem rolagem de tela.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Síntese de Voz Nativa (`window.speechSynthesis`) com Seleção Inteligente de Voz `pt-BR`**
  - *Abordagem Escolhida*: Utilizar a Web Speech API nativa do navegador com priorização automática de vozes naturais em português (`pt-BR` / `pt_BR`), taxa de fala levemente cadenciada para crianças (`rate: 0.98`, `pitch: 1.05`) e cancelamento automático de falas anteriores ao trocar de rodada.
  - *Por Quê*: Funciona instantaneamente sem latência de rede, sem custo de API externa e opera offline no PWA e na Smart TV/celular.
  - *Alternativas Consideradas*: Áudios pré-gravados estáticos não cobririam todas as contas personalizadas criadas pelos professores no Modo Professor.

- **Decisão 2: Sincronização Bidirecional do Modo Professor (Celular Host $\leftrightarrow$ TV)**
  - *Abordagem Escolhida*: Expor a ação `ADMIN_SET_CUSTOM_QUESTIONS` tanto via WebSocket quanto via rota HTTP `/api/room` para que o celular do Host (Jogador 1) possa adicionar, remover, gerar tabuadas e embaralhar contas em tempo real, refletindo na TV imediatamente.
  - *Por Quê*: Digitar pelo celular é 10x mais rápido para pais e professores do que navegar tecla por tecla com o controle remoto da TV.

- **Decisão 3: Distratores Pedagógicos Calibrados por Operação**
  - *Abordagem Escolhida*: Na multiplicação e divisão, gerar alternativas incorretas baseadas nos múltiplos adjacentes ($a \times (b \pm 1)$), erros próximos ($\pm 1, \pm 2$) e inversão de algarismos para dezenas, mantendo sempre resultados positivos e únicos.
  - *Por Quê*: Evita que alunos acertem apenas olhando se o número é par/ímpar ou muito distante, estimulando o cálculo mental real.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Arquitetura e Fluxo de Componentes

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     MOTOR DE ÁUDIO & VOZ (Web Audio + TTS)                 │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Música de Fundo (BGM)│  │ Efeitos Sonoros (SFX)│  │ Voz Narrada (TTS)│  │
│  │   Mute Independente  │  │   Mute Independente  │  │ pt-BR + AutoRead │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
└─────────────┼─────────────────────────┼───────────────────────┼────────────┘
              │                         │                       │
              ▼                         ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   ESTADO SINCRONIZADO DA SALA (WS + HTTP)                  │
│   • settings.customQuestions[] & useCustomQuestions                        │
│   • Gerador de Tabuada (1..10) + Embaralhamento Fisher-Yates               │
│   • Gerador de Questões com Distratores Pedagógicos Inteligentes           │
└──────────────────────┬─────────────────────────────────┬───────────────────┘
                       │                                 │
                       ▼                                 ▼
┌─────────────────────────────────────────┐ ┌────────────────────────────────┐
│        PALCO DA TV (Fire TV / 4K)       │ │   CONTROLE CELULAR (Host P1)   │
│  • Leitura Automática TTS na Pergunta   │ │  • Gaveta Modo Professor       │
│  • Botão Global: Música | Efeitos | Voz │ │  • Botões Tabuada 1 a 10       │
│  • Aba Professor: Tabuadas 1 a 10       │ │  • Cadastro Manual + Embaralhar│
│  • Avanço Automático em ROUND_REVEAL    │ │  • Iniciar Partida Personaliz. │
└─────────────────────────────────────────┘ └────────────────────────────────┘
```

### Modelo de Dados e Mapeamento de Interações

1. **Controle de Voz (TTS) no `soundEngine`**:
   - Novo estado persistido `ttsMuted` (`localStorage`), integrado ao `GlobalSoundSettingsToggle` no cabeçalho da TV (`Música On/Off`, `Efeitos On/Off`, `Voz On/Off`).
   - Método `speakQuestion(text: string)` acionado automaticamente quando `roomState.status === 'QUESTION_ACTIVE'` e o `currentQuestion.id` muda, além de botão para repetir a leitura a qualquer momento.
2. **Gerador Rápido de Tabuada Específica (1 a 10)**:
   - Função utilitária compartilhada `buildMultiplicationTablePack(tableNumber: number): CustomEquationItem[]` que gera as 10 contas da tabuada escolhida ($N \times 1$ até $N \times 10$).
   - Disponível com 1 clique tanto na aba **Modo Professor** da TV quanto no painel **Modo Professor** do celular do Jogador 1, com opção de acumular ou substituir e botão **"Embaralhar as contas"**.
3. **Sincronização do Modo Professor pelo Celular do Host**:
   - O componente do controle mobile recebe o callback `onSetCustomQuestions(questions, useCustomQuestions)` conectado ao cliente WebSocket/HTTP (`ADMIN_SET_CUSTOM_QUESTIONS`), permitindo que o Jogador 1 gerencie toda a lista de contas pelo celular.
4. **Distratores Pedagógicos e Avanço Automático de Rodada**:
   - Refinamento do gerador de alternativas para priorizar múltiplos vizinhos ($a \times (b \pm 1)$, $(a \pm 1) \times b$), diferenças de dezena ($\pm 10$) e vizinhos próximos ($\pm 1, \pm 2$).
   - Temporizador automático na fase `ROUND_REVEAL` para avançar à próxima pergunta após 4 segundos (com barra/contador visual), mantendo o botão manual `Próxima Atividade Agora (Enter)`.
