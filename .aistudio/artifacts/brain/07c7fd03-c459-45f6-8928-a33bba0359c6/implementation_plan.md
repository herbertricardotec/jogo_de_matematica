# MathShow TV — Game Show Interativo de Matemática para Fire TV & Celular

Um jogo estilo programa de auditório de TV focado em matemática básica (adição e subtração), projetado especificamente para telas de **Amazon Fire TV Stick (10-foot UI)** onde **1 a 4 celulares** se conectam instantaneamente via QR Code ou código de 4 dígitos para atuar como controles remotos de resposta em tempo real.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo foram confirmadas e estruturadas para garantir latência mínima entre o toque no celular e a reação na tela da TV, além de permitir testes rápidos tanto em múltiplos dispositivos quanto em uma única tela (modo simulador Picture-in-Picture de controle).

- **Estilo e Tema Confirmado**: **Show de Quiz estilo Programa de TV** — Palco iluminado em canvas 60fps com apresentador/pódio animado, placares luminosos, efeitos sonoros procedurais (Web Audio API) de auditório e contagem regressiva dramática.
- **Escopo Matemático Confirmado**: **Adição e Subtração** — Progressão inteligente de dificuldade ao longo das rodadas (Soma Simples $\rightarrow$ Subtração Rápida $\rightarrow$ Operações com Dezenas $\rightarrow$ Rodada Relâmpago de Múltiplos Termos).
- **Modo Multijogador Confirmado**: **1 a 4 Celulares (Cooperativo ou Competitivo na TV)** — Suporte para partida individual, duelo competitivo (quem responde certo mais rápido ganha bônus de velocidade) ou modo cooperativo (a família/turma soma pontos juntos para bater a meta do programa).
- **Conexão Confirmada**: **Pareamento Rápido via QR Code na TV e Código de 4 Dígitos** — Sincronização em tempo real via WebSockets com reconexão automática e suporte para leitura direta da câmera do celular ou digitação do PIN de 4 dígitos.

---

## 1. Overview & Core Concept

- **O Que Faz**: Transforma a TV da sala (Fire TV Stick) no palco principal de um Game Show de matemática e qualquer smartphone da casa em um buzzer/controle tátil colorido com as 4 alternativas de resposta (`A`, `B`, `C`, `D`).
- **Público-Alvo & Contexto**: Crianças, estudantes e famílias jogando na sala de estar. A tela da TV exibe a equação em tipografia gigante de alta legibilidade a 3 metros de distância, enquanto cada jogador olha para seu próprio celular para tocar rapidamente na resposta correta.
- **Valor Principal**: Elimina a lentidão de navegar por botões na tela usando o controle direcional físico da TV; o celular oferece resposta imediata com feedback tátil/visual individual, permitindo até 4 participantes simultâneos na mesma TV sem precisar comprar controles extras.

---

## 2. User Experience & Visual Design

### Fluxos Principais do Usuário

1. **Tela de Título & Lobby na Fire TV (`TITLE_MENU` / `LOBBY`)**:
   - A TV exibe um palco animado em `<canvas>` 60fps (holofotes suaves, partículas de palco e insígnia vetorial `<svg>` do **MathShow TV**).
   - No centro-direito do palco, aparece o **Card de Conexão Rápida**: um **QR Code gerado dinamicamente** (apontando para a URL do app já com `?room=XXXX`) ao lado do **Código da Sala de 4 dígitos** em fonte gigante tabular.
   - Conforme os jogadores escaneiam o QR Code nos celulares, seus avatares e nomes aparecem instantaneamente nos 4 pedestais do palco da TV com efeito sonoro de entrada.
   - O Jogo pode ser iniciado pelo celular do Jogador 1 (VIP/Host) ou pressionando `Enter`/`Select` no próprio controle do Fire TV Stick (ou ainda testando com um **Controle Virtual Embutido** para demonstração rápida em tela única).

2. **Visão do Controle no Celular (`MOBILE_CONTROLLER`)**:
   - Otimizada para uso com uma mão (Thumb-Zone Ergonomics, botões $\ge 64\text{px}$ de altura).
   - **Passo 1 (Entrada)**: Se aberto via QR Code, já preenche o código da sala; o jogador apenas digita seu apelido, escolhe um ícone de competidor e toca em `"Entrar no Palco"`.
   - **Passo 2 (Lobby)**: O Jogador 1 (Host) pode escolher no celular o **Modo de Jogo** (*Competitivo: Corrida de Pontos* ou *Cooperativo: Desafio da Equipe*), a **Dificuldade** (*Iniciante: até 20*, *Intermediário: até 100*, *Mestre do Cálculo: 3 números e dezenas*) e tocar em `"Iniciar Show"`.
   - **Passo 3 (Durante a Pergunta)**: O celular exibe a equação no topo e **4 botões grandes e táteis** com formas geométricas + letras (`▲ A`, `◆ B`, `● C`, `■ D`) e os respectivos números. Ao tocar, o botão trava a resposta escolhida com feedback imediato (`"Resposta Enviada! Aguardando revelação..."`).
   - **Passo 4 (Revelação da Rodada)**: A tela do celular fica verde (`Correto! +850 pts · Combo 3x`) ou vermelha (`Quase! A resposta certa era 42`) sincronizada com a explosão de confetes na TV.

3. **Ciclo de Rodadas na TV (`PLAYING` $\rightarrow$ `ROUND_REVEAL` $\rightarrow$ `GAME_OVER`)**:
   - **Apresentação da Equação**: A equação matemática (ex.: `38 + 25 = ?` ou `72 - 19 = ?`) surge no telão central do palco com animação de impacto.
   - **Indicadores de Resposta (Sem Spoiler)**: Quando um jogador responde pelo celular, o pedestal dele na TV acende com o selo `"Pronto!"` e um efeito sonoro de buzzer, sem revelar qual opção ele marcou até que todos respondam ou o cronômetro zere.
   - **Revelação Dramática**: As alternativas erradas escurecem, a alternativa correta brilha em verde esmeralda, uma dica visual rápida mostra o raciocínio da conta (ex.: decomposição de dezenas/unidades), e as barras de pontuação dos pedestais sobem com números tabulares.
   - **Grande Final (`GAME_OVER`)**: Pódio de premiação (1º, 2º, 3º, 4º lugar ou Troféu da Equipe no modo cooperativo), estatísticas de precisão e tempo médio de resposta, e botão de `"Jogar Novamente"` direto pelo celular ou controle da TV.

### Identidade Visual & Tema (Regra 60-30-10)

- **Direção Estética**: *Prime-Time Broadcast Studio* (Estúdio de TV noturno sofisticado, combinando iluminação de palco profunda com painéis de leitura ultra-nítidos para visão a 3 metros de distância na TV e botões táteis de alto contraste no smartphone).
- **Paleta de Cores**:
  - **60% Superfície Dominante (Arena/Estúdio)**: Velvet Midnight Navy (`#0A1128` a `#0F172A`) com iluminação de palco em canvas.
  - **30% Superfícies Estruturais (Telão e Pedestais)**: Slate Studio Panels (`#1E293B`) com bordas sutis (`#334155`) e tipografia branca pura (`#F8FAFC`).
  - **10% Acentos de Foco e Estados**:
    - Ouro de Palco / Destaque Principal: `#F59E0B` (Amber Gold)
    - Acerto / Confirmação: `#10B981` (Emerald)
    - Alerta / Tempo Acabando: `#EF4444` (Crimson)
    - Cores + Formas Acessíveis das 4 Alternativas (não depende apenas de cor):
      - Opção A (`▲`): Azul Royal (`#2563EB`)
      - Opção B (`◆`): Âmbar Dourado (`#D97706`)
      - Opção C (`●`): Roxo Violeta (`#7C3AED`)
      - Opção D (`■`): Turquesa Oceano (`#0D9488`)
- **Tipografia & Hierarquia**:
  - **Display / Equações e Placar**: `Outfit` (geométrica, números largos e altamente legíveis à distância na TV).
  - **Corpo e Interface**: `Plus Jakarta Sans` para instruções claras e rótulos de botões em uma única linha (`whitespace-nowrap`).
  - **Dados, Cronômetro e PIN**: `JetBrains Mono` com `tabular-nums` para evitar qualquer tremor horizontal durante a contagem regressiva ou atualização de pontos.

### Game Feel, Áudio Procedural & Acessibilidade

- **Sintetizador Web Audio API Embutido**: Efeitos sonoros gerados em tempo real sem arquivos externos pesados (tema de abertura do show, som de *buzzer* quando cada celular responde, tique-taque nos últimos 5 segundos, fanfarra de resposta certa, som de impacto + *camera shake* sutil no canvas, e botão de Mute no topo).
- **Suporte Nativo ao Controle Físico do Fire TV (D-Pad / Teclado)**: Além dos celulares conectados, o próprio controle remoto físico do Fire TV (`Setas`, `Enter`, `Espaço`, `Esc`) pode navegar pelo menu inicial, pausar a partida ou até jogar como um jogador local caso alguém queira jogar direto na TV.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Arquitetura Dual-View (TV + Controle Mobile) na Mesma Aplicação**
  - *Abordagem Escolhida*: Detecção automática via parâmetro de URL (`?room=XXXX` ou `?role=controller`) combinada com seletor na tela inicial (`"Modo Tela Fire TV"` vs. `"Modo Controle no Celular"`) + **Simulador de Celular Flutuante opcional** na tela da TV.
  - *Por Quê*: Permite que a TV abra a visão principal de palco enquanto os celulares escaneiam o QR Code e caem direto na interface de controle remoto, além de permitir testar toda a experiência multijogador mesmo se o usuário estiver avaliando em apenas um dispositivo.

- **Decisão 2: Servidor Autoritativo via WebSockets na Porta 3000**
  - *Abordagem Escolhida*: Servidor Express + WebSocket (`ws`) integrado na mesma porta 3000 gerenciando salas de 4 dígitos, temporizador oficial das rodadas, geração de perguntas de adição/subtração e cálculo de pontuação por velocidade.
  - *Por Quê*: Garante que todos os 4 celulares e a Fire TV estejam 100% sincronizados sem atrasos, lidando com reconexão automática caso a tela do celular apague e acenda novamente durante a partida.

---

## 4. Technical Architecture & Data Strategy

### Diagrama de Arquitetura e Fluxo em Tempo Real

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   SERVIDOR EXPRESS + WEBSOCKET (Porta 3000)                │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Gerenciador de Salas │  │ Motor de Matemática  │  │ Relógio & Score  │  │
│  │ (PIN 4 dígitos / WS) │  │ (Adição & Subtração) │  │ (Server-Driven)  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
└─────────────┼─────────────────────────┼───────────────────────┼────────────┘
              │ Estado da Sala (JSON)   │ Nova Questão / Opções │ Eventos WS
      ┌───────┴─────────────────────────┴───────────────────────┴───────┐
      ▼                                                                 ▼
┌───────────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│        VISÃO FIRE TV STICK (Palco)        │     │     VISÃO CELULAR (Controle 1 a 4x)       │
│  ┌─────────────────────────────────────┐  │     │  ┌─────────────────────────────────────┐  │
│  │ <canvas> 60fps: Palco, Holofotes,   │  │     │  │ Cabeçalho: Sala, Nome, Pontos, Rank │  │
│  │ Confetes, Shake & Animação de Pódio │  │     │  ├─────────────────────────────────────┤  │
│  ├─────────────────────────────────────┤  │     │  │ Visor Rápido da Equação Atual       │  │
│  │ HUD Low-Occlusion: Rodada, Timer,   │  │     │  ├─────────────────────────────────────┤  │
│  │ Equação Gigante & 4 Alternativas    │  │     │  │ 4 Botões Táteis Gigantes (▲ ◆ ● ■)  │  │
│  ├─────────────────────────────────────┤  │     │  │ Hitbox >= 64px · Feedback Instant.  │  │
│  │ QR Code Dinâmico + Pedestais 1 a 4  │  │     │  ├─────────────────────────────────────┤  │
│  │ + Controle Virtual PiP (Opcional)   │  │     │  │ Painel VIP (Host): Iniciar / Modo   │  │
│  └─────────────────────────────────────┘  │     │  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘     └───────────────────────────────────────────┘
```

### Modelo de Dados e Estado da Sala

- **`RoomState`**:
  - `code`: Código numérico de 4 dígitos (ex.: `"4829"`).
  - `status`: `'LOBBY' | 'QUESTION_ACTIVE' | 'ROUND_REVEAL' | 'PAUSED' | 'GAME_OVER'`.
  - `settings`: `{ mode: 'COMPETITIVE' | 'COOPERATIVE', difficulty: 'EASY' | 'MEDIUM' | 'HARD', totalRounds: number, timePerQuestion: number }`.
  - `players`: Lista de até 4 jogadores conectados (`id`, `name`, `avatar`, `color`, `score`, `streak`, `currentAnswer`, `answerTimeMs`, `connected`).
  - `currentQuestion`: `{ id, expression: string, numA: number, numB: number, numC?: number, operator: '+' | '-', correctAnswer: number, options: number[], tip: string, roundNumber: number, startedAt: number, durationMs: number }`.
  - `teamScore` & `teamTarget`: Pontuação combinada para o modo Cooperativo.

### Mapeamento de Interações e Eventos WebSocket

- `room:create` (TV $\rightarrow$ Servidor): Cria uma nova sala e retorna o código de 4 dígitos para geração do QR Code.
- `room:join` (Celular $\rightarrow$ Servidor): Conecta ou reconecta um jogador pelo código de 4 dígitos (idempotente por `playerId` salvo no `localStorage` do celular).
- `game:configure` & `game:start` (Celular Host ou Controle TV $\rightarrow$ Servidor): Atualiza dificuldade/modo e inicia a contagem da Rodada 1.
- `player:answer` (Celular $\rightarrow$ Servidor): Registra a opção escolhida (`0` a `3`), calcula o tempo exato de reação e atualiza a TV mostrando que o jogador já respondeu. Quando todos os jogadores conectados respondem, o servidor avança imediatamente para `ROUND_REVEAL` sem obrigar a esperar o resto do cronômetro.
- `game:pause` / `game:restart` (TV ou Celular Host $\rightarrow$ Servidor): Pausa o cronômetro ou reinicia uma nova partida mantendo os celulares já conectados na sala.
