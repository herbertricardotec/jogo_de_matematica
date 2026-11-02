# 🎮 JOGO DE MATEMÁTICA (MATHSHOW TV) — SaaS & PWA | MagnetSoftware

> Um game show educativo e interativo de matemática em blocos 3D projetado para rodar na **Amazon Fire TV Stick** (Navegador Amazon Silk), **Smart TVs 1080p e 4K**, utilizando de **1 a 4 smartphones como controles remotos em tempo real** via QR Code e PIN de 4 dígitos — com **Viewport Scaling Automático**, **Modo 1 Jogador vs. Máquina**, **Seletor de Avatares 3D Exclusivos (Animais, Blocos Sorridentes e Crianças/Teens)**, **Dicas Visuais 3D Animadas**, **Painel Administrativo (Modo Professor & Relatório Pedagógico)**, **Medalhas 3D** e **PWA Instalável**.

![Status](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-3.6.0-blue)
![Empresa](https://img.shields.io/badge/Empresa-MagnetSoftware-orange)
![PWA](https://img.shields.io/badge/PWA-Instal%C3%A1vel%20%26%20Tela%20Cheia-purple)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Cloud%20Run%20%7C%20Node.js-black)
![Plataforma](https://img.shields.io/badge/Plataforma-Amazon%20Fire%20TV%20Stick%20%7C%201080p%20%7C%204K-yellow)

---

## 📋 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Novidades da Versão 3.6.0](#-novidades-da-versão-360)
3. [Viewport Scaling para Amazon Fire TV Stick (Silk), 1080p e 4K](#-viewport-scaling-para-amazon-fire-tv-stick-silk-1080p-e-4k)
4. [Tela Administrativa Compacta & Modo Professor no Celular do Host](#-tela-administrativa-compacta--modo-professor-no-celular-do-host)
5. [Narração em Voz Alta (TTS em Português) e Controles Independentes de Áudio](#-narração-em-voz-alta-tts-em-português-e-controles-independentes-de-áudio)
6. [Seletor de Avatares 3D com Identidade Única na TV](#-seletor-de-avatares-3d-com-identidade-única-na-tv)
7. [Modo 1 Jogador: Disputar contra a Máquina (Robô 3D)](#-modo-1-jogador-disputar-contra-a-máquina-robô-3d)
8. [Sistema de Dicas Visuais 3D (Contagem Animada de Blocos)](#-sistema-de-dicas-visuais-3d-contagem-animada-de-blocos)
9. [Sistema de Conquistas e Medalhas 3D Animadas](#-sistema-de-conquistas-e-medalhas-3d-animadas)
10. [Arquitetura Anti-Travamento e Verificação de Buffer (Vercel & WebSocket)](#-arquitetura-anti-travamento-e-verificação-de-buffer-vercel--websocket)
11. [Suporte a PWA (Progressive Web App e Tela Cheia)](#-suporte-a-pwa-progressive-web-app-e-tela-cheia)
12. [Como Publicar na Vercel e Instalar na Fire TV Stick](#-como-publicar-na-vercel-e-instalar-na-fire-tv-stick)
13. [Como Executar Localmente](#-como-executar-localmente)
14. [Tecnologias Utilizadas e Estrutura de Arquivos](#-tecnologias-utilizadas-e-estrutura-de-arquivos)
15. [Sistema de Pontuação e Módulos Educativos](#-sistema-de-pontuação-e-módulos-educativos)
16. [Modo Demonstração & Rodízio Automático na TV (Attract Mode)](#-modo-demonstração--rodízio-automático-na-tv-attract-mode)
17. [5 Dicas de Evolução Futura do Jogo](#-5-dicas-de-evolução-futura-do-jogo)
18. [Segurança Infantil (Kid-Safe) e Privacidade](#-segurança-infantil-kid-safe-e-privacidade)

---

## 🎯 VISÃO GERAL

O **Jogo de Matemática (MathShow TV)** — desenvolvido sob o padrão visual **MagnetSoftware** — é uma plataforma SaaS e PWA gamificada voltada para crianças, adolescentes, escolas e famílias. O sistema transforma a televisão da sala (**Amazon Fire TV Stick** ou Smart TV) em um palco interativo de blocos numéricos 3D e permite que **1 a 4 celulares** se conectem instantaneamente via **QR Code ou código PIN de 4 dígitos** para funcionar como controles remotos táteis.

---

## 🚀 NOVIDADES DA VERSÃO 3.6.0

- ✅ **Controle do Modo Professor pelo Celular do Host (Jogador 1)**: O anfitrião não precisa mais usar o controle remoto da TV para cadastrar contas! Diretamente da tela do seu celular, o Jogador 1 pode abrir a gaveta **"Modo Professor no Celular"**, gerar tabuadas de 1 a 10 com um toque, digitar contas manualmente, **embaralhar as contas** e iniciar a partida personalizada na TV.
- ✅ **Feedback Sonoro Narrado nas Perguntas (TTS em Português `pt-BR`)**:
  - **Ao iniciar a pergunta**: Lê automaticamente a fórmula matemática no formato **"Quanto é [N] [equação] [N]?"** (ex.: *"Quanto é 7 vezes 8?"*, *"Quanto é 6 mais 5?"*, *"Quanto é 9 menos 4?"*, *"Quanto é 12 dividido por 3?"*).
  - **Ao revelar a resposta**: Narra automaticamente **"Resposta certa [N]"** (ex.: *"Resposta certa 56"*).
  - Conta com controle global independente **Voz On / Voz Off** e botão **"🔊 Ouvir"** na TV e no celular.
- ✅ **Gerador Rápido de Tabuada Específica (1 a 10) em 1 Clique**: Adicionados 10 botões rápidos (`×1` a `×10`) tanto no Painel Admin da TV quanto no celular do Host para carregar instantaneamente os 10 desafios da tabuada escolhida.
- ✅ **Alternativas Inteligentes (Distratores Pedagógicos) e Avanço Rápido (4s)**: As 3 alternativas incorretas agora utilizam distratores pedagógicos reais (múltiplos vizinhos da mesma tabuada, erro de dezena $\pm 10$, inversão de dígitos e vizinhos próximos), evitando chutes óbvios. Além disso, o intervalo de revelação entre rodadas foi otimizado para **4 segundos** com avanço automático fluido.
- ✅ **Viewport Scaling Automático para Navegador Amazon Silk (Fire TV Stick), 1080p e 4K**: A interface inteira ajusta-se automaticamente ao viewport real da TV (`--tv-scale`), impedindo cortes ou rolagens indesejadas (`preventScroll: true`).
- ✅ **Seletor de Avatares 3D Exclusivos + Modo 1 Jogador vs. Máquina + Dicas Visuais 3D**: Identidade visual única por jogador na TV, Robô 3D com precisão oculta sorteada e contagem animada de blocos após 2 erros na mesma questão.

---

## 📺 VIEWPORT SCALING PARA AMAZON FIRE TV STICK (SILK), 1080p E 4K

O navegador **Amazon Silk** no Fire TV Stick opera nativamente com uma resolução CSS reduzida (`960×540` ou `~960×450` quando a barra de endereço superior está visível), enquanto TVs Full HD e 4K operam em `1920×1080` e `3840×2160`.

Para garantir enquadramento 100% perfeito em qualquer tela:
1. **Bloqueio de Rolagem e Overscroll (`html.tv-mode-lock` & `.tv-viewport-root`)**: Fixa o palco em `100vw × 100vh` com `overflow: hidden !important` e `overscroll-behavior: none`.
2. **Escalonamento Proporcional Dinâmico (`.tv-scaled-stage`)**: Calcula em tempo real a variável CSS `--tv-scale` com base em `window.visualViewport`:
   - **Redução proporcional** no navegador Amazon Silk (`960×540` / barra de URL aberta).
   - **Ampliação proporcional** em telas **1080p (`1.5x`)** e **4K UHD (`3.0x`)**.
3. **Navegação D-Pad Sem Deslocamento de Página**: Todos os comandos de foco do controle remoto da Fire TV utilizam `focus({ preventScroll: true })` e `window.scrollTo(0, 0)`.
4. **Botão "Tela Cheia TV" no Topo**: Permite ocultar a barra de endereços do navegador Amazon Silk com apenas 1 clique no controle remoto.

---

## 🛡️ TELA ADMINISTRATIVA COMPACTA & MODO PROFESSOR NO CELULAR DO HOST

Acessível pelo botão **"Painel Admin"** no topo da TV (ou diretamente pelo **celular do Jogador 1 — Host**):

### 1. Aba: Controle dos 4 Jogadores (`grid-cols-4`)
Exibe os 4 slots sempre lado a lado na tela da TV:
- **Vaga Livre (Jogador Não Logado)**: Exibe o **QR Code exclusivo** e o **Código PIN de 4 dígitos** da vaga.
- **Jogador Conectado (Online)**: Exibe o **Avatar 3D**, **Nome**, **Pontuação (`pts`)**, **Estrelas (`⭐`)**, **Acertos** e o botão vermelho **"Fazer Logoff (Desconectar)"**.
- Conta também com os botões **"Instalar App (PWA)"**, **"Testar Celular na Tela"**, **"Novo PIN"** e **"Logoff Todos"** na barra superior do painel.

### 2. Aba: Modo Professor · Partidas Personalizadas (Na TV e no Celular do Host)
- **Gerador Rápido de Tabuada (1 a 10) em 1 Clique**: Botões dedicados `×1` a `×10` que geram imediatamente as 10 contas da tabuada escolhida.
- **Pacotes Prontos (1 Clique)**: *Tabuada do 7 e 8*, *Tabuada do 2, 3 e 4*, *Tabuada do 5, 6 e 9* e *Divisão Exata (÷)*.
- **Cadastro Manual de Contas**: Permite digitar qualquer operação (`+`, `-`, `×`, `÷`) com validação automática de resultados inteiros no teclado ágil do celular ou na TV.
- **Botão "Embaralhar as contas"**: Mistura instantaneamente a sequência das contas cadastradas com algoritmo Fisher-Yates para que os alunos não decorem a ordem das perguntas.

### 3. Aba: Relatório Pedagógico Pós-Jogo (`+`, `−`, `×`, `÷`)
- Mostra a **Precisão Geral (%)**, **Tempo Médio de Resposta (s)** e barras de progresso individuais por operação matemática (**Adição `+`**, **Subtração `−`**, **Multiplicação `×`** e **Divisão `÷`**) para cada jogador, classificando o status em *🌟 Dominado*, *📈 Em Evolução* ou *🎯 Reforçar*.

---

## 🔊 NARRAÇÃO EM VOZ ALTA (TTS EM PORTUGUÊS) E CONTROLES INDEPENDENTES DE ÁUDIO

- **Leitura da Fórmula Matemática (`QUESTION_ACTIVE`)**: Assim que uma nova atividade começa na TV, o sintetizador de voz (`window.speechSynthesis` em `pt-BR`) lê diretamente a fórmula matemática no padrão:
  > **"Quanto é [N] [equação] [N]?"**  
  > *(Exemplos: "Quanto é 7 vezes 8?", "Quanto é 6 mais 5?", "Quanto é 9 menos 4?", "Quanto é 12 dividido por 3?")*
- **Leitura da Resposta Certa (`ROUND_REVEAL`)**: Ao encerrar o tempo ou quando os jogadores respondem e a resposta correta é revelada no palco, o sistema narra automaticamente:
  > **"Resposta certa [N]"**  
  > *(Exemplo: "Resposta certa 56")*
- **3 Controles Independentes na Barra Superior**:
  1. **Música On / Música Off**: Ativa ou silencia a trilha sonora ambiente em loop.
  2. **Efeitos On / Efeitos Off**: Ativa ou silencia os efeitos sonoros de acerto, erro, relógio e fanfarra.
  3. **Voz On / Voz Off**: Ativa ou silencia a leitura em voz alta das perguntas e respostas (salvo no `localStorage`).
- **Botão "🔊 Ouvir" na TV e no Celular**: Repete a fórmula `"Quanto é [N] [equação] [N]?"` durante a pergunta ativa ou a frase completa `"Quanto é [N] [equação] [N]? Resposta certa [N]"` durante a revelação da rodada.

---

## 🎨 SELETOR DE AVATARES 3D COM IDENTIDADE ÚNICA NA TV

Durante o login no celular, o jogador escolhe seu personagem 3D dividido em **3 categorias**:
1. **🐾 Animais 3D**: *Raposa Cientista*, *Coruja Sabida*, *Panda Gênio* e *Gatinha Astro*.
2. **🧱 Blocos Sorridentes 3D**: *Cubo Sorridente*, *Bloco Estrela*, *Cubo Gênio* e *Robô Calculadora*.
3. **👧👦 Crianças & Teens 3D**: *Ricardo*, *Vania*, *Kauã*, *Sofia*, *Lucas*, *Maya*, *Gui* e *Lara*.

- **Exclusividade Garantida**: Se outro jogador já estiver usando um avatar na sala, ele aparece marcado como **"Em uso na TV"** no seletor do celular e o servidor garante que cada pedestal tenha uma identidade visual única.

---

## 🤖 MODO 1 JOGADOR: DISPUTAR CONTRA A MÁQUINA (ROBÔ 3D)

Quando há **apenas 1 jogador conectado** na sala:
- Aparece na TV e no celular a opção **"Disputar contra a Máquina (Robô 3D)"**.
- Ao iniciar a partida, o sistema **sorteia automaticamente e em segredo** o objetivo de acertos da Máquina para aquele teste entre:
  - `100% de acertos`
  - `60% de acertos`
  - `40% de acertos`
  - `20% de acertos`
- O **Robô da Matemática 3D** ocupa o Pedestal #2 na TV e responde às questões em tempo real, competindo rodada a rodada com o jogador!

---

## 💡 SISTEMA DE DICAS VISUAIS 3D (CONTAGEM ANIMADA DE BLOCOS)

Pensado para o aprendizado ativo sem frustração:
1. Quando o jogador está praticando sozinho e erra uma alternativa, a opção incorreta fica marcada como *"Tentado"* e ele pode tentar novamente na mesma questão.
2. **Ao errar a mesma questão duas vezes**, o sistema desbloqueia o botão **"💡 Ativar Dica Visual 3D"**.
3. Ao ativar a dica, a TV e o celular exibem uma **animação 3D interativa** que conta os blocos numerados um por um (ou agrupa-os na multiplicação/divisão), ajudando a criança a compreender visualmente a lógica da operação antes de escolher o bloco correto.

---

## 🏅 SISTEMA DE CONQUISTAS E MEDALHAS 3D ANIMADAS

Ao final de cada partida (`GAME_OVER`), os jogadores recebem **Medalhas 3D Animadas** na TV com chuva de confetes e fanfarra comemorativa:

| Medalha 3D | Símbolo | Critério de Desbloqueio |
|------------|---------|-------------------------|
| 🥇 **Mestre da Soma** | `+` | Alcançar **80% ou mais de precisão** nas atividades da partida |
| ⚡ **Velocista** | `⚡` | Responder corretamente com tempo médio **abaixo de 6,5 segundos** |
| 🔥 **Sequência Imparável** | `🔥` | Acertar **3 ou mais desafios seguidos** (*streak* $\ge 3$) sem errar |
| 🧠 **Gênio sem Ajudas** | `🧠` | Acertar desafios **sem utilizar nenhum botão de ajuda** (Power-Up) |
| ⭐ **Caçador de Estrelas** | `⭐` | Acumular **5 ou mais estrelas douradas** durante a partida |
| 🧱 **Construtor Dedicado** | `🧱` | Medalha de incentivo positivo garantida a todo participante que completa a trilha |

---

## 🛡️ ARQUITETURA ANTI-TRAVAMENTO E VERIFICAÇÃO DE BUFFER (VERCEL & WEBSOCKET)

Para operar com estabilidade máxima tanto em servidor dedicado Node.js quanto em ambiente **Serverless na Vercel**:
- **Detecção Automática de Ambiente Serverless**: Em domínios `.vercel.app` (onde conexões WebSocket não são suportadas por funções serverless), o cliente ativa diretamente o motor HTTP Polling otimizado sem gerar erros de WebSocket no console.
- **Verificação de Buffer (`ws.bufferedAmount`)**: O servidor e o cliente verificam o tamanho do buffer antes de transmitir pacotes, descartando quadros redundantes caso a conexão esteja congestionada.
- **In-Flight Request Lock + Timeout (`AbortController`)**: Impede o empilhamento de requisições `/api/room` em conexões Wi-Fi lentas.
- **Auto-Recuperação de Sala (`ensureRoom`)**: Caso uma instância serverless da Vercel recicle a memória entre rodadas, a sala com o código PIN de 4 dígitos é reconstruída automaticamente sem retornar `404`.

---

## 📱 SUPORTE A PWA (PROGRESSIVE WEB APP E TELA CHEIA)

- ✅ **Web App Manifest (`manifest.webmanifest`)**: Configurado com `"display": "standalone"` e `"display_override": ["fullscreen", "standalone"]`.
- ✅ **Conjunto Completo de Ícones 3D**: `/public/icon.svg`, `/public/pwa-192x192.png`, `/public/pwa-512x512.png`, `/public/pwa-maskable-512x512.png` e `/public/apple-touch-icon.png`.

---

## ☁️ COMO PUBLICAR NA VERCEL E INSTALAR NA FIRE TV STICK

### 1. Publicando na Vercel
1. Suba este repositório para o **GitHub**, **GitLab** ou **Bitbucket**.
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. Clique em **Deploy** (`vercel.json` configura automaticamente o build e a rota serverless `/api/room`).

### 2. Executando na Amazon Fire TV Stick (Navegador Silk)
1. Abra o navegador **Amazon Silk** na sua Fire TV Stick e acesse a URL publicada na Vercel.
2. O sistema aplicará automaticamente o **Viewport Scaling (`--tv-scale`)** para enquadrar 100% da tela.
3. Clique no botão **"Tela Cheia TV"** no topo da tela para ocultar a barra de endereços do navegador Silk.
4. Use o botão **"Painel Admin"** para visualizar os 4 QR Codes lado a lado, ativar o **Modo Professor** ou acompanhar o **Relatório Pedagógico**.

---

## 🚀 COMO EXECUTAR LOCALMENTE

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor Full-Stack (Express + WebSocket + Vite na porta 3000)
npm run dev
```

- **Visão Palco Fire TV:** `http://localhost:3000`
- **Visão Controle no Celular:** Escaneie o **QR Code** exibido na tela da TV ou no **Painel Admin**

---

## 🛠️ TECNOLOGIAS UTILIZADAS E ESTRUTURA DE ARQUIVOS

```
jogo-de-matematica-tv/
├── api/
│   └── room.ts                         # Função Serverless Vercel (salas, Robô 3D, dicas visuais e Modo Professor)
├── public/                             # Ícones PWA 3D e assets estáticos
├── server.ts                           # Servidor Express + WebSocket com verificação de buffer
├── vercel.json                         # Configuração de deploy na Vercel
├── vite.config.ts                      # Configuração Vite + VitePWA
├── README.md                           # Documentação completa do projeto
└── src/
    ├── App.tsx                         # Sincronização híbrida c/ controle de buffer, AbortController e Backoff
    ├── index.css                       # Design System 3D + Regras CSS de Viewport Scaling (Silk, 1080p e 4K)
    ├── types/game.ts                   # Contratos TypeScript, Avatares 3D exclusivos, Robô 3D e Medalhas
    ├── utils/sound.ts                  # Sintetizador Web Audio (som de início de pergunta na TV + vibração mobile)
    └── components/
        ├── StudioStageCanvas.tsx       # Renderizador Canvas 60fps
        ├── AvatarIcon.tsx              # Avatares 3D (Animais, Blocos Sorridentes, Kids/Teens) e Animador 3D de Dicas
        ├── FireTvStageView.tsx         # Palco Fire TV auto-escalonável + Painel Admin compacto de 4 colunas
        └── MobileControllerView.tsx    # Controle remoto para smartphone com seletor de avatares 3D únicos
```

---

## 🏆 SISTEMA DE PONTUAÇÃO E MÓDULOS EDUCATIVOS

| Módulo | Símbolo 3D | Título Completo | Descrição Pedagógica | Exemplo de Atividade |
|--------|------------|-----------------|----------------------|----------------------|
| **Módulo 1** | `123` | **Conhecendo os Números** | Contagem visual e completar torres de blocos (1 a 10) | *"Quantos blocos faltam para chegar no 4?"* (`3 + [ ? ] = 4`) |
| **Módulo 2** | `+` | **Somando com Blocos** | Operações divertidas de Adição (`+`) empilhando cubos | *"Qual é a soma dos blocos 6 mais 5?"* (`6 + 5 = [ ? ]`) |
| **Módulo 3** | `−` | **Subtraindo e Desmontando** | Operações de Subtração (`−`) tirando blocos da torre | *"Se tirarmos 4 blocos de 9, quantos ficam?"* (`9 - 4 = [ ? ]`) |
| **Módulo 4** | `×÷` | **Desafio dos Símbolos** | Multiplicação (`×`), Divisão (`÷`) e misturas de símbolos | *"3 grupos de 4 blocos formam quantos blocos?"* (`3 × 4 = [ ? ]`) |

---

## 📺 MODO DEMONSTRAÇÃO & RODÍZIO AUTOMÁTICO NA TV (ATTRACT MODE)

- **Inatividade Inteligente**: Se a TV permanecer na Tela Principal por mais de **25 segundos** sem interação do controle remoto ou toque, o sistema entra em **Rodízio Automático**.
- **Ciclo de 20 Segundos**: Alterna automaticamente a cada **20 segundos** entre a Tela de Boas-Vindas (`JOGO DE MATEMÁTICA`) e o **Hall da Fama (Recordes da Sala)**.
- **Botão JOGAR Alinhado**: Em ambas as telas, o botão **JOGAR** permanece rigorosamente nas mesmas coordenadas visuais, permitindo iniciar a partida instantaneamente com o controle da TV (D-pad/Enter) ou toque.
- **Retorno Instantâneo**: Qualquer interação com o controle Fire TV, toque na tela ou mouse restaura a tela principal imediatamente e reinicia o cronômetro.

---

## 💡 5 DICAS DE EVOLUÇÃO FUTURA DO JOGO

1. **🧠 Dificuldade Adaptativa Individual por Idade (Handicap Equilibrado)**
   - Permitir que cada jogador selecione sua idade no login do celular para que crianças menores e adolescentes disputem juntos na mesma partida com tempo e bônus equilibrados.
2. **🏰 Modo "Chefe Final dos Blocos" (Boss Battle Cooperativo)**
   - Na última atividade do modo Cooperativo, exibir um "Robô Gigante de Blocos 3D" na TV que exige que os 4 jogadores resolvam sub-contas complementares em equipe.
3. **🎨 Loja de Customização com Estrelas Acumuladas (Progressão no Celular)**
   - Salvar as estrelas douradas (`⭐`) ganhas nas partidas no `localStorage` do celular para desbloquear novos efeitos de entrada no pedestal da TV.
4. **📄 Exportação do Boletim Pedagógico em PDF / Imagem (QR Code para Pais)**
   - Gerar um QR Code na aba de *Relatório Pedagógico* do Painel Admin para que pais ou professores baixem no celular o boletim de evolução da turma.
5. **🏅 Torneio Escolar em Chaveamento (Modo Copa da Matemática)**
   - Criar um modo de torneio para salas de aula com mais de 4 alunos, alternando grupos de 4 jogadores na TV e exibindo o ranking geral da turma ao final.

---

## 🔒 SEGURANÇA INFANTIL (KID-SAFE) E PRIVACIDADE

- ✅ **100% Kid-Safe (Zero Anúncios Externos)**: Sem banners publicitários, pop-ups ou links externos desprotegidos.
- ✅ **Parental Gate + Painel Administrativo**: Controle completo sobre os jogadores logados, duração da partida e trilhas pedagógicas.
- ✅ **Privacidade por Design**: Nenhum dado pessoal sensível é coletado ou compartilhado com terceiros.

---

**Desenvolvido com 💛 pela MagnetSoftware para transformar o aprendizado de matemática em diversão em família!**
