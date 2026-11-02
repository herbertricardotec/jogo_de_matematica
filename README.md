# 🎮 JOGO DE MATEMÁTICA (MATHSHOW TV) — SaaS & PWA

> Um game show educativo e interativo de matemática em blocos 3D projetado para rodar na **Amazon Fire TV Stick** (e Smart TVs), utilizando de **1 a 4 smartphones como controles remotos em tempo real** via QR Code e PIN de 4 dígitos — com suporte completo a **PWA (Tela Cheia)**, **Medalhas 3D Animadas** e **Deploy na Vercel**.

![Status](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-3.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-Instal%C3%A1vel%20%26%20Tela%20Cheia-purple)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Cloud%20Run%20%7C%20Node.js-black)
![Plataforma](https://img.shields.io/badge/Plataforma-Amazon%20Fire%20TV%20%7C%20Mobile%20Remote-yellow)
![Tecnologia](https://img.shields.io/badge/Tecnologia-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20CSS%20%7C%20WebSockets%20%7C%20Canvas%2060fps-red)

---

## 📋 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Características Principais](#-características-principais)
3. [Funcionalidades do Sistema](#-funcionalidades-do-sistema)
4. [Sistema de Conquistas e Medalhas 3D Animadas](#-sistema-de-conquistas-e-medalhas-3d-animadas)
5. [Suporte a PWA (Progressive Web App e Tela Cheia)](#-suporte-a-pwa-progressive-web-app-e-tela-cheia)
6. [Como Publicar na Vercel e Instalar na Fire TV](#-como-publicar-na-vercel-e-instalar-na-fire-tv)
7. [Interface, Design System 3D e UX](#-interface-design-system-3d-e-ux)
8. [Regras do Jogo](#-regras-do-jogo)
9. [Como Executar Localmente](#-como-executar-localmente)
10. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
11. [Estrutura de Arquivos](#-estrutura-de-arquivos)
12. [Sistema de Pontuação e Estrelas](#-sistema-de-pontuação-e-estrelas)
13. [Módulos da Trilha Educativa e Perguntas](#-módulos-da-trilha-educativa-e-perguntas)
14. [Compatibilidade](#-compatibilidade)
15. [Solução de Problemas](#-solução-de-problemas)
16. [Segurança Infantil (Kid-Safe) e Privacidade](#-segurança-infantil-kid-safe-e-privacidade)

---

## 🎯 VISÃO GERAL

O **Jogo de Matemática (MathShow TV)** — desenvolvido sob o padrão visual **MgnetSoftware** — é uma aplicação SaaS e PWA gamificada voltada para crianças, adolescentes e famílias. O sistema transforma a televisão da sala (**Amazon Fire TV Stick**) em um palco colorido de blocos numéricos 3D e permite que **1 a 4 celulares** se conectem instantaneamente via **QR Code ou código PIN de 4 dígitos** para funcionar como controles remotos táteis.

### 🎯 Objetivo
Resolver desafios visuais de matemática empilhando e calculando blocos 3D, acumular pontos e estrelas douradas (`⭐`) através de velocidade e sequências (*streaks*), utilizar ajudas estratégicas pelo celular, conquistar **Medalhas 3D Animadas** ao final da partida e dominar os **4 Módulos da Trilha Educativa**!

---

## ✨ CARACTERÍSTICAS PRINCIPAIS

### 🧠 Gameplay Principal (TV + Celular em Tempo Real)
- ✅ Arquitetura **Dual-View**: Visão de Palco 10-foot UI na **Fire TV** + Visão de Controle Tátil no **Celular**
- ✅ Conexão instantânea de **1 a 4 smartphones** via **QR Code dinâmico** ou **PIN de 4 dígitos**
- ✅ **4 Módulos Educativos** progressivos (*Conhecendo os Números*, *Somando com Blocos*, *Subtraindo e Desmontando*, *Desafio dos Símbolos*)
- ✅ **3 Níveis de Dificuldade** (*Fácil 1–10*, *Médio*, *Mestre*)
- ✅ **2 Modos de Partida**:
  - 🏆 **Competitivo**: Corrida de pontos, estrelas e medalhas 3D no pódio de 1º a 4º lugar
  - 🤝 **Cooperativo**: Toda a família/turma soma pontos junta para bater a meta da equipe
- ✅ **Simulador de Celular Virtual (PiP)** embutido na própria tela da TV para testes rápidos em tela única

### 🎨 Estúdio Gerador de Avatares 3D no Login do Celular
- ✅ Cada jogador cria uma **identidade visual 3D única** antes de entrar no palco:
  - 🧸 **8 Modelos 3D Base**: *Cubo Feliz 3D*, *Coruja Sábia 3D*, *Raposa Estudante*, *Panda Gênio 3D*, *Gatinho Blocos*, *Robô Calculadora*, *Léo Construtor* e *Bia Estrela*
  - 🎨 **7 Cores 3D Vibrantes** com iluminação volumétrica e brilho especular
  - 🎓 **5 Acessórios Estudantes 3D**: *Capelo de Formatura*, *Óculos Gênio*, *Coroa 3D*, *Fone Gamer* ou *Natural*
  - 🎲 Botão **"Sortear 3D"** para combinação aleatória instantânea

### 🗣️ Narrador de Voz (Text-to-Speech) & Vibração Háptica
- ✅ **Apresentador de Voz em Português (`pt-BR`)**: Narra automaticamente cada nova pergunta na TV, anuncia a entrada de novos jogadores e celebra os vencedores e suas medalhas 3D
- ✅ **Feedback Háptico (`Vibration API`)**: O celular vibra ao tocar nos cubos 3D, ao ativar ajudas especiais e ao interagir com as medalhas 3D conquistadas

### 🎮 Navegação Espacial por D-Pad (Controle Físico da Fire TV)
- ✅ Suporte completo ao controle remoto físico da **Amazon Fire TV Stick** (`Setas Direcionais`, `Enter/Select`, `Esc/Back`)
- ✅ Algoritmo geométrico 2D que move o anel de foco dourado (`#FFD600`) entre todos os botões, módulos e alternativas
- ✅ **QR Code e PIN Sempre Visíveis** no topo da TV durante toda a partida (*Drop-in Multiplayer*)

---

## ⚙️ FUNCIONALIDADES DO SISTEMA

### 🎯 Sistema de Ajudas Táticas no Celular (Power-Ups)
Durante a partida, cada jogador possui **3 botões de ajuda de uso único** na parte inferior do controle do celular:
- ✂️ **Cortar 2 (50/50)** → Remove 2 blocos incorretos exclusivamente na tela do celular daquele jogador
- ❄️ **+5 Segundos** → Congela/adiciona +5 segundos ao relógio oficial da rodada para todos pensarem melhor
- ⭐ **Estrela 2x** → Dobra os pontos e estrelas ganhos pelo jogador naquela atividade

### ⏳ Animação de Passagem de Tempo e Retorno Automático
- ✅ **Tubo 3D Animado de Tempo**: Barra de progresso listrada em movimento que muda suavemente de Verde (`#22C55E`) $\rightarrow$ Amarelo (`#FFD600`) $\rightarrow$ Vermelho (`#EF4444`)
- ✅ **Transição Automática Entre Atividades**: Barra de contagem regressiva visual de 5,8 segundos após a revelação da resposta
- ✅ **Contador de Fim de Jogo (`25s`)**: Na tela final de premiação, um cronômetro automático retorna o jogo para a Tela Principal caso ninguém aperte o botão, evitando que a TV fique parada

### 🔄 Confirmação de Continuidade e Rotação Dinâmica de QR Code
- ✅ Ao término da partida (`GAME_OVER`), cada celular recebe a pergunta: **"Você quer continuar jogando na próxima partida?"**
  - ✅ **Sim, Continuar!**: Mantém o jogador confirmado no pedestal para a próxima rodada
  - 🚪 **Não, Sair e Liberar Vaga**: Remove o jogador da tela principal da TV, libera a tela de login do celular e **troca automaticamente o número do PIN e o QR Code** na TV para novos participantes

---

## 🏅 SISTEMA DE CONQUISTAS E MEDALHAS 3D ANIMADAS

Ao final de cada partida (`GAME_OVER`), o servidor avalia o desempenho de cada participante e concede **Medalhas 3D Animadas** renderizadas com fita suspensa, aro metálico em relevo, brilho especular e animação física de mola (*spring bounce*). As medalhas aparecem tanto no **Pódio da Fire TV** quanto na **Tela do Celular**, acompanhadas de **chuva de confetes 60fps** e **fanfarra musical comemorativa (`playMedalFanfare`)**.

| Medalha 3D | Símbolo | Critério de Desbloqueio | Cor 3D Metálica |
|------------|---------|-------------------------|-----------------|
| 🥇 **Mestre da Soma** | `+` | Alcançar **80% ou mais de precisão** nas atividades da partida | Ouro Solar (`#FFD600`) com Fita Azul |
| ⚡ **Velocista** | `⚡` | Responder corretamente com tempo médio **abaixo de 6,5 segundos** | Azul Elétrico (`#38BDF8`) com Fita Vermelha |
| 🔥 **Sequência Imparável** | `🔥` | Acertar **3 ou mais desafios seguidos** (*streak* $\ge 3$) sem errar | Laranja Fogo (`#F97316`) com Fita Dourada |
| 🧠 **Gênio sem Ajudas** | `🧠` | Acertar desafios **sem utilizar nenhum botão de ajuda** (Power-Up) | Roxo Real (`#A855F7`) com Fita Verde |
| ⭐ **Caçador de Estrelas** | `⭐` | Acumular **5 ou mais estrelas douradas** durante a partida | Esmeralda (`#22C55E`) com Fita Dourada |
| 🧱 **Construtor Dedicado** | `🧱` | Medalha de incentivo positivo garantida a todo participante que completa a trilha | Rosa Estrela (`#EC4899`) com Fita Azul |

> 💡 **Dica Interativa:** Na tela final da TV (ou no celular), clique sobre qualquer Medalha 3D ou no botão **"✨ Celebrar Medalhas 3D & Confete!"** para disparar uma nova salva de confetes e fanfarra de vitória!

---

## 📱 SUPORTE A PWA (PROGRESSIVE WEB APP E TELA CHEIA)

O projeto possui conformidade completa com **Progressive Web App (PWA)** via `vite-plugin-pwa` e Service Worker com cache inteligente:

- ✅ **Web App Manifest (`manifest.webmanifest`)**: Configurado com `"display": "standalone"` e `"display_override": ["fullscreen", "standalone"]`, permitindo abrir sem barra de endereços tanto na TV quanto no smartphone.
- ✅ **Conjunto Completo de Ícones 3D**:
  - `/public/icon.svg` (Ícone vetorial 3D com blocos `1`, `2`, `3`, `+`)
  - `/public/pwa-192x192.png` (192×192 px)
  - `/public/pwa-512x512.png` (512×512 px)
  - `/public/pwa-maskable-512x512.png` (512×512 px com zona de segurança *maskable* para Android/Fire OS)
  - `/public/apple-touch-icon.png` (180×180 px para iPhone/iPad)
- ✅ **Botão Nativo no Cabeçalho (`Instalar App` / `Tela Cheia`)**:
  - Em celulares Android/Chrome/Edge, exibe automaticamente o botão **"📲 Instalar App"** acionando o prompt nativo do sistema.
  - Na Fire TV e navegadores de sala, oferece o botão **"⛶ Tela Cheia"** para ocultar a barra do navegador imediatamente.

---

## ☁️ COMO PUBLICAR NA VERCEL E INSTALAR NA FIRE TV

O projeto já está ajustado com **arquitetura híbrida** (`WebSocket` + Serverless REST API `/api/room` + `vercel.json`) para funcionar automaticamente na **Vercel** sem necessidade de configurações manuais extras.

### 1. Publicando na Vercel (Passo a Passo)
1. Suba este repositório para a sua conta do **GitHub**, **GitLab** ou **Bitbucket**.
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. A Vercel detectará automaticamente o arquivo `vercel.json` com:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Serverless Function:** `/api/room.ts` (gerencia salas, perguntas, pontuação e medalhas 3D na nuvem)
4. Clique em **Deploy**. Em menos de 1 minuto você receberá seu link público (ex.: `https://jogo-matematica-tv.vercel.app`).

### 2. Instalando na Amazon Fire TV Stick
1. Ligue sua **Amazon Fire TV Stick** e abra o navegador **Amazon Silk** (caso não tenha, baixe gratuitamente na loja da Fire TV).
2. Digite o endereço do seu projeto publicado na Vercel (ex.: `https://seu-projeto.vercel.app`).
3. No topo direito da tela do jogo, clique no botão **"⛶ Tela Cheia"** usando o controle da Fire TV.
4. *(Opcional)* Aperte o botão de **Menu (☰)** no controle da Fire TV dentro do navegador Silk e selecione **"Adicionar aos Favoritos"** para abrir o jogo com 1 clique sempre que quiser!
5. Aponte a câmera de **1 a 4 celulares** para o **QR Code** na TV e comece a jogar!

---

## 🎨 INTERFACE, DESIGN SYSTEM 3D E UX

### 🌈 Paleta de Cores Oficial (Design System MgnetSoftware)
| Token / Cor | Código Hex | Aplicação na Interface |
|-------------|------------|------------------------|
| 🔵 **Azul Primário (Céu/Topo)** | `#007AFF` / `#0284C7` | Balão do título 3D, Bloco A (`▲`), camisa do personagem Léo |
| 🟡 **Amarelo Vibrante** | `#FFD600` / `#FACC15` | Palavra "Matemática" 3D, Bloco B (`◆`), estrelas, foco D-Pad Fire TV |
| 🔴 **Vermelho Vivo** | `#EF4444` | Bloco C (`●`), alertas de últimos 5 segundos |
| 🟢 **Verde Limão Vibrante** | `#22C55E` / `#16A34A` | Botão principal "JOGAR", símbolo `+`, Bloco D (`■`), acertos |
| 🟠 **Laranja Vibrante** | `#F97316` | Símbolo de subtração `−`, Módulo 3, Power-Up Estrela 2x |
| 🟣 **Roxo / Lilás** | `#A855F7` / `#9333EA` | Símbolo de divisão `÷`, Bloco 5, Módulo 4, Power-Up 50/50 |
| 🌸 **Rosa Infantil** | `#EC4899` / `#F43F5E` | Vestido e tiara da personagem Bia, destaques visuais |
| 🪵 **Madeira Quente** | `#EAB308` / `#D97706` | Mesa de estudo onde os blocos 3D são empilhados e prateleiras ao fundo |

---

## 📏 REGRAS DO JOGO

### 🧒 Abordagem Pedagógica "Sem Punições Severas"
- Erros nunca exibem mensagens negativas ou sons agressivos; o jogador recebe incentivo positivo (*"Boa tentativa! Tente de novo na próxima!"*) acompanhado de uma **Dica de Cálculo Mental** explicando passo a passo como resolver a conta.

### ⚡ Dinâmica das Rodadas
1. A pergunta surge na TV acompanhada dos blocos 3D visuais e da narração por voz.
2. No **Módulo 1**, o número escolhido preenche diretamente o cubo faltante no meio da equação (`3 + [ ? ] = 4` $\rightarrow$ `3 + [ 1 ] = 4`). Nos demais módulos, preenche o cubo de resultado (`a + b = [ ? ]`).
3. Assim que todos os celulares conectados travam suas respostas, a TV revela imediatamente o resultado sem obrigar a esperar o fim do relógio.
4. Na última rodada de cada partida, ativa-se a **⭐ Rodada Estrela em Dobro (Pontos 2x)**.

---

## 🚀 COMO EXECUTAR LOCALMENTE

### Pré-requisitos
- **Node.js** 18+ instalado

### Passo a Passo
```bash
# 1. Instalar todas as dependências
npm install

# 2. Iniciar o servidor Full-Stack (Express + WebSocket + Vite na porta 3000)
npm run dev
```

Depois acesse:
- **Visão Palco Fire TV:** `http://localhost:3000`
- **Visão Controle no Celular:** Escaneie o **QR Code** exibido na tela da TV (ou acesse `http://localhost:3000/?room=XXXX&role=controller`)

### Build para Produção
```bash
# Compilar o frontend + Service Worker PWA
npm run build

# Executar o servidor de produção
npm start
```

---

## 🛠️ TECNOLOGIAS UTILIZADAS

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 19.0.1 | Interface reativa da Fire TV e do Controle Mobile |
| **TypeScript** | 7.0.2 | Tipagem estática ponta a ponta (Cliente, Express e Serverless Vercel) |
| **Tailwind CSS** | 4.3.3 | Design System 3D, tokens de cores e responsividade |
| **Vite + `vite-plugin-pwa`** | 8.3 / 1.2 | Bundler + geração automática de Manifesto PWA e Service Worker |
| **Express + `ws`** | 4.21 / 8.22 | Servidor autoritativo de salas via WebSockets e fallback REST `/api/room` |
| **Motion (Framer)** | 12.23 | Física de mola (*bounce*) nos cubos 3D e nas Medalhas 3D Animadas |
| **HTML5 Canvas 2D** | Nativo | Palco 60fps com *bokeh*, operadores 3D flutuantes e chuva de confetes |
| **Web Audio API** | Nativo | Sintetizador sonoro procedural e fanfarra de medalhas |
| **Web Speech API** | Nativo | Narrador de voz (`pt-BR`) estilo apresentador de TV |
| **QRCode** | 1.5.4 | Geração dinâmica do QR Code de pareamento da sala |

---

## 📁 ESTRUTURA DE ARQUIVOS

```
jogo-de-matematica-tv/
│
├── api/
│   └── room.ts                         # Função Serverless para deploy na Vercel (/api/room)
├── public/
│   ├── icon.svg                        # Ícone vetorial 3D do Jogo de Matemática
│   ├── pwa-192x192.png                 # Ícone PWA 192x192
│   ├── pwa-512x512.png                 # Ícone PWA 512x512
│   ├── pwa-maskable-512x512.png        # Ícone PWA Maskable 512x512 (Android/Fire OS)
│   └── apple-touch-icon.png            # Ícone iOS 180x180
├── server.ts                           # Servidor Express + WebSocket (salas, timers, medalhas e rotação de PIN)
├── vercel.json                         # Configuração pronta para publicação na Vercel
├── vite.config.ts                      # Configuração Vite + VitePWA (Manifesto e Service Worker)
├── index.html                          # Entrypoint HTML com meta tags PWA e fontes 3D
├── README.md                           # Documentação completa do projeto
└── src/
    ├── main.tsx                        # Inicialização React
    ├── index.css                       # Tokens CSS MgnetSoftware, relevo 3D e animações de tempo
    ├── App.tsx                         # Gerenciador híbrido WebSocket + HTTP Fallback, áudio e voz
    ├── hooks/
    │   └── usePWAInstall.ts            # Hook de instalação PWA e alternância de Tela Cheia
    ├── types/
    │   └── game.ts                     # Contratos TypeScript, módulos, avatares 3D e catálogo de Medalhas 3D
    ├── utils/
    │   └── sound.ts                    # Motor Web Audio API + Fanfarra de Medalhas + Narrador TTS + Vibração
    └── components/
        ├── PWAInstallButton.tsx        # Botão de instalação PWA e modo Tela Cheia
        ├── StudioStageCanvas.tsx       # Renderizador Canvas 60fps (sala bokeh, símbolos 3D e confetes)
        ├── AvatarIcon.tsx              # Avatares 3D, Cubos 3D, Medalhas 3D Animadas (Medal3DBadge) e Splash Hero
        ├── FireTvStageView.tsx         # Interface 10-foot para Amazon Fire TV com navegação D-Pad espacial
        └── MobileControllerView.tsx    # Controle remoto para smartphone com criador de avatar e power-ups
```

---

## 🏆 SISTEMA DE PONTUAÇÃO E ESTRELAS

### Cálculo de Pontos por Resposta Correta
```
Pontos = (Pontos Base + Bônus de Velocidade + Bônus de Sequência) × Multiplicador Relâmpago × Multiplicador Power-Up 2x
```

| Componente | Valor |
|------------|-------|
| **Pontuação Base por Acerto** | `500 pontos` + `1 ⭐ Estrela` |
| **Bônus de Velocidade** | Até `+400 pontos` (proporcional à rapidez da resposta) |
| **Bônus de Sequência (Streak)** | `+100 pontos` por acerto consecutivo (até `+300 pontos`) |
| **Rodada Estrela em Dobro (Última Rodada)** | Multiplicador `×2` nos pontos |
| **Ajuda "Estrela 2x" Ativada no Celular** | Multiplicador `×2` nos pontos e `+2 ⭐ Estrelas` |

---

## 📚 MÓDULOS DA TRILHA EDUCATIVA E PERGUNTAS

| Módulo | Símbolo 3D | Título Completo | Descrição Pedagógica | Exemplo de Atividade |
|--------|------------|-----------------|----------------------|----------------------|
| **Módulo 1** | `123` | **Conhecendo os Números** | Contagem visual e completar torres de blocos (1 a 10) | *"Quantos blocos faltam para chegar no 4?"* (`3 + [ ? ] = 4`) |
| **Módulo 2** | `+` | **Somando com Blocos** | Operações divertidas de Adição (`+`) empilhando cubos | *"Qual é a soma dos blocos 6 mais 5?"* (`6 + 5 = [ ? ]`) |
| **Módulo 3** | `−` | **Subtraindo e Desmontando** | Operações de Subtração (`−`) tirando blocos da torre | *"Se tirarmos 4 blocos de 9, quantos ficam?"* (`9 - 4 = [ ? ]`) |
| **Módulo 4** | `×÷` | **Desafio dos Símbolos** | Multiplicação (`×`), Divisão (`÷`) e misturas de símbolos | *"3 grupos de 4 blocos formam quantos blocos?"* (`3 × 4 = [ ? ]`) |

---

## 💻 COMPATIBILIDADE

- ✅ **Amazon Fire TV Stick / Smart TVs** (Navegador Amazon Silk, WebAPK/PWA em Tela Cheia, controle D-Pad)
- ✅ **Smartphones Android e iOS** (Instalável na Tela Inicial via PWA, leitura nativa de QR Code)
- ✅ **Desktop & Notebooks** (Windows, macOS, Linux, ChromeOS — com simulador de celular Picture-in-Picture integrado)
- ✅ **Hospedagem Cloud**: **Vercel**, **Google Cloud Run**, **Render**, **Railway** ou servidor **Node.js**

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### O celular informa "Sala não encontrada" ao digitar o PIN
**Causa:** A sala da TV foi reiniciada ou um jogador saiu ao final da partida anterior, gerando um novo PIN por segurança.
**Solução:** Confira o número de 4 dígitos exibido no topo da tela da TV (ao lado do mini QR Code) e digite o código atualizado.

### Como deixar o jogo em Tela Cheia na Fire TV?
**Solução:** Clique no botão **"⛶ Tela Cheia"** ou **"📲 Instalar App"** localizado no canto superior direito da tela da TV.

---

## 🔒 SEGURANÇA INFANTIL (KID-SAFE) E PRIVACIDADE

- ✅ **100% Kid-Safe (Zero Anúncios Externos)**: Sem banners publicitários, pop-ups ou links externos desprotegidos.
- ✅ **Parental Gate (Bloqueio Parental)**: O botão **"Área dos Pais"** no rodapé junto ao selo **MgnetSoftware** exige a resolução de um desafio matemático (`12 × 4 = 48`) antes de liberar configurações de duração da partida.
- ✅ **Privacidade por Design**: Nenhum dado pessoal sensível é coletado ou compartilhado com terceiros.

---

**Desenvolvido com 💛 no padrão visual MgnetSoftware para transformar o aprendizado de matemática em diversão em família!**
