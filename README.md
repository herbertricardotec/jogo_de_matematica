# 🎮 JOGO DE MATEMÁTICA (MATHSHOW TV) — SaaS & PWA | MagnetSoftware

> Um game show educativo e interativo de matemática em blocos 3D projetado para rodar na **Amazon Fire TV Stick** (e Smart TVs), utilizando de **1 a 4 smartphones como controles remotos em tempo real** via QR Code e PIN de 4 dígitos — com **Tela Administrativa de Controle dos 4 Jogadores**, **Avatares 3D Infantil/Adolescente**, **Medalhas 3D Animadas**, **PWA (Tela Cheia)** e **Deploy na Vercel**.

![Status](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-3.2.0-blue)
![Empresa](https://img.shields.io/badge/Empresa-MagnetSoftware-orange)
![PWA](https://img.shields.io/badge/PWA-Instal%C3%A1vel%20%26%20Tela%20Cheia-purple)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Cloud%20Run%20%7C%20Node.js-black)
![Plataforma](https://img.shields.io/badge/Plataforma-Amazon%20Fire%20TV%20%7C%20Mobile%20Remote-yellow)

---

## 📋 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Características Principais](#-características-principais)
3. [Tela Administrativa — Controle dos 4 Jogadores](#-tela-administrativa--controle-dos-4-jogadores)
4. [Funcionalidades do Sistema](#-funcionalidades-do-sistema)
5. [Sistema de Conquistas e Medalhas 3D Animadas](#-sistema-de-conquistas-e-medalhas-3d-animadas)
6. [Suporte a PWA (Progressive Web App e Tela Cheia)](#-suporte-a-pwa-progressive-web-app-e-tela-cheia)
7. [Como Publicar na Vercel e Instalar na Fire TV](#-como-publicar-na-vercel-e-instalar-na-fire-tv)
8. [Interface, Design System 3D e UX](#-interface-design-system-3d-e-ux)
9. [Regras do Jogo](#-regras-do-jogo)
10. [Como Executar Localmente](#-como-executar-localmente)
11. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
12. [Estrutura de Arquivos](#-estrutura-de-arquivos)
13. [Sistema de Pontuação e Estrelas](#-sistema-de-pontuação-e-estrelas)
14. [Módulos da Trilha Educativa e Perguntas](#-módulos-da-trilha-educativa-e-perguntas)
15. [5 Dicas de Melhorias e Evolução do Jogo](#-5-dicas-de-melhorias-e-evolução-do-jogo)
16. [Segurança Infantil (Kid-Safe) e Privacidade](#-segurança-infantil-kid-safe-e-privacidade)

---

## 🎯 VISÃO GERAL

O **Jogo de Matemática (MathShow TV)** — desenvolvido sob o padrão visual **MagnetSoftware** — é uma aplicação SaaS e PWA gamificada voltada para crianças, adolescentes, escolas e famílias. O sistema transforma a televisão da sala (**Amazon Fire TV Stick**) em um palco colorido de blocos numéricos 3D e permite que **1 a 4 celulares** se conectem instantaneamente via **QR Code ou código PIN de 4 dígitos** para funcionar como controles remotos táteis.

### 🎯 Objetivo
Resolver desafios visuais de matemática empilhando e calculando blocos 3D, acumular pontos e estrelas douradas (`⭐`) através de velocidade e sequências (*streaks*), utilizar ajudas estratégicas pelo celular, conquistar **Medalhas 3D Animadas** ao final da partida e dominar os **4 Módulos da Trilha Educativa**!

---

## ✨ CARACTERÍSTICAS PRINCIPAIS

### 🧠 Gameplay Principal (TV + Celular em Tempo Real)
- ✅ Arquitetura **Dual-View**: Visão de Palco 10-foot UI na **Fire TV** + Visão de Controle Tátil enxuta e focada no **Celular**
- ✅ Conexão instantânea de **1 a 4 smartphones** via **QR Code dinâmico** ou **PIN de 4 dígitos**
- ✅ **Segredo de Resposta na TV**: Enquanto os jogadores escolhem suas alternativas no celular, a televisão exibe apenas o status *"Pronto!"* no pedestal do jogador, mantendo a resposta em segredo até que todos respondam ou o tempo acabe
- ✅ **4 Módulos Educativos** progressivos (*Conhecendo os Números*, *Somando com Blocos*, *Subtraindo e Desmontando*, *Desafio dos Símbolos*)
- ✅ **3 Níveis de Dificuldade** (*Fácil 1–10*, *Médio*, *Mestre*)
- ✅ **2 Modos de Partida**:
  - 🏆 **Competitivo**: Corrida de pontos, estrelas e medalhas 3D no pódio de 1º a 4º lugar
  - 🤝 **Cooperativo**: Toda a família/turma soma pontos junta para bater a meta da equipe

### 🛡️ Tela Administrativa — Controle dos 4 Jogadores
- ✅ Acessível diretamente pelo botão **"Painel Admin"** no topo da TV (ou clicando sobre o badge central de QR/PIN)
- ✅ Gerencia individualmente os **4 Slots de Jogadores (`Jogador 1` a `Jogador 4`)**:
  - 📱 **Slot Vazio (Jogador Não Logado)**: Exibe o **QR Code exclusivo** e o **Código PIN de 4 dígitos** para que um novo participante escaneie e entre imediatamente naquela vaga
  - 🧑‍🎓 **Slot Conectado (Jogador Logado)**: Exibe o **Avatar 3D**, **Nome do Jogador**, **Pontuação (`pts`)**, **Estrelas (`⭐`)**, **Acertos** e o botão **"Fazer Logoff (Desconectar)"** para desconectar apenas aquele jogador (ou desconectar todos de uma vez)
  - 🔄 **Botão "Gerar Novo PIN / QR Code"**: Permite rotacionar o código da sala a qualquer momento

### 🎨 Gerador de Avatares 3D (Infantil e Adolescente — Masculino e Feminino)
- ✅ Cada jogador personaliza sua **identidade visual 3D estilo Pixar/Clay** no login do celular:
  - 👦👧 **Infantil (Masculino e Feminino)**: *Léo (Infantil M)*, *Bia (Infantil F)*, *Kauã (Infantil M)* e *Sofia (Infantil F)*
  - 🧑👩 **Adolescente (Masculino e Feminino)**: *Lucas (Teen M)*, *Maya (Teen F)*, *Gui (Teen M)* e *Lara (Teen F)*
  - 🎨 **7 Cores de Roupa e Fundo 3D** + **5 Acessórios 3D** (*Natural*, *Capelo 3D*, *Óculos Gênio*, *Coroa Real*, *Fone Gamer*)

### 🔔 Efeitos Sonoros na TV & Vibração Silenciosa no Celular
- ✅ **Som Identificador de Início de Pergunta na TV (`playNewQuestion`)**: A televisão emite um chime musical estilo *Game Show* no início de cada pergunta, além de efeitos sonoros de contagem regressiva, revelação da resposta e fanfarra de medalhas
- ✅ **Celular 100% Silencioso com Tremida Háptica Suave**: O controle do celular não emite áudios (evitando eco com a TV da sala) e realiza uma **leve vibração háptica (`55ms`)** no início de cada jogada para avisar o jogador que a nova atividade começou

### 🎮 Navegação Espacial por D-Pad (Controle Físico da Fire TV)
- ✅ Suporte completo ao controle remoto físico da **Amazon Fire TV Stick** (`Setas Direcionais`, `Enter/Select`, `Esc/Back`)
- ✅ Algoritmo geométrico 2D que move o anel de foco dourado (`#FFD600`) entre todos os botões, módulos, alternativas e controles do Painel Administrativo

---

## 🛡️ TELA ADMINISTRATIVA — CONTROLE DOS 4 JOGADORES

A **Tela Administrativa** foi projetada para professores, pais e anfitriões controlarem a sala com total facilidade:

| Situação da Vaga (Slot 1 a 4) | O que aparece no Card Administrativo | Ações Disponíveis |
|-------------------------------|--------------------------------------|-------------------|
| **Aguardando Login (Vaga Livre)** | **QR Code** escaneável + **Código PIN de 4 dígitos** em destaque + instruções de acesso | Escaneamento direto pelo celular do jogador |
| **Jogador Conectado (Online/Offline)** | **Avatar 3D**, **Nome**, badge **Anfitrião**, **Pontuação (`pts`)**, **Estrelas (`⭐`)** e **Acertos** | Botão vermelho **"Fazer Logoff (Desconectar)"** que desconecta o celular do jogador e devolve o QR Code + PIN para a vaga |

> 💡 **Acesso Rápido nos Pedestais:** Além do modal **"Painel Admin"**, os 4 pedestais no rodapé da TV também contam com um botão rápido **"Logoff"** ao lado de cada jogador conectado e atalho para abrir o QR Code nas vagas livres.

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
- ✅ **Contador de Fim de Jogo (`25s`)**: Na tela final de premiação, um cronômetro automático retorna o jogo para a Tela Principal caso ninguém aperte o botão, evitando que a TV fique travada

### 🔄 Confirmação de Continuidade e Rotação Dinâmica de QR Code
- ✅ Ao término da partida (`GAME_OVER`), cada celular recebe a pergunta: **"Você quer continuar jogando na próxima partida?"**
  - ✅ **Sim, Continuar!**: Mantém o jogador confirmado no pedestal para a próxima rodada
  - 🚪 **Não, Sair e Liberar Vaga**: Faz logoff do jogador da tela principal da TV, libera a tela de login do celular e **troca automaticamente o número do PIN e o QR Code** na TV

---

## 🏅 SISTEMA DE CONQUISTAS E MEDALHAS 3D ANIMADAS

Ao final de cada partida (`GAME_OVER`), o servidor avalia o desempenho de cada participante e concede **Medalhas 3D Animadas** renderizadas com fita suspensa, aro metálico em relevo, brilho especular e animação física de mola (*spring bounce*):

| Medalha 3D | Símbolo | Critério de Desbloqueio | Cor 3D Metálica |
|------------|---------|-------------------------|-----------------|
| 🥇 **Mestre da Soma** | `+` | Alcançar **80% ou mais de precisão** nas atividades da partida | Ouro Solar (`#FFD600`) com Fita Azul |
| ⚡ **Velocista** | `⚡` | Responder corretamente com tempo médio **abaixo de 6,5 segundos** | Azul Elétrico (`#38BDF8`) com Fita Vermelha |
| 🔥 **Sequência Imparável** | `🔥` | Acertar **3 ou mais desafios seguidos** (*streak* $\ge 3$) sem errar | Laranja Fogo (`#F97316`) com Fita Dourada |
| 🧠 **Gênio sem Ajudas** | `🧠` | Acertar desafios **sem utilizar nenhum botão de ajuda** (Power-Up) | Roxo Real (`#A855F7`) com Fita Verde |
| ⭐ **Caçador de Estrelas** | `⭐` | Acumular **5 ou mais estrelas douradas** durante a partida | Esmeralda (`#22C55E`) com Fita Dourada |
| 🧱 **Construtor Dedicado** | `🧱` | Medalha de incentivo positivo garantida a todo participante que completa a trilha | Rosa Estrela (`#EC4899`) com Fita Azul |

---

## 📱 SUPORTE A PWA (PROGRESSIVE WEB APP E TELA CHEIA)

O projeto possui conformidade completa com **Progressive Web App (PWA)** via `vite-plugin-pwa` e Service Worker:
- ✅ **Web App Manifest (`manifest.webmanifest`)**: Configurado com `"display": "standalone"` e `"display_override": ["fullscreen", "standalone"]`.
- ✅ **Conjunto Completo de Ícones 3D**: `/public/icon.svg`, `/public/pwa-192x192.png`, `/public/pwa-512x512.png`, `/public/pwa-maskable-512x512.png` e `/public/apple-touch-icon.png`.

---

## ☁️ COMO PUBLICAR NA VERCEL E INSTALAR NA FIRE TV

O projeto possui **arquitetura híbrida** (`WebSocket` + Serverless REST API `/api/room` + `vercel.json`) pronta para publicação na **Vercel**.

### 1. Publicando na Vercel
1. Suba este repositório para o **GitHub**, **GitLab** ou **Bitbucket**.
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. Clique em **Deploy** (`vercel.json` configura automaticamente o build e a rota serverless `/api/room`).

### 2. Instalando na Amazon Fire TV Stick
1. Abra o navegador **Amazon Silk** na sua Fire TV Stick e acesse a URL publicada na Vercel.
2. Clique no botão **"⛶ Tela Cheia"** no topo da tela da TV.
3. Use o botão **"Painel Admin"** para visualizar os 4 QR Codes e gerenciar os jogadores conectados.

---

## 🎨 INTERFACE, DESIGN SYSTEM 3D E UX

### 🌈 Paleta de Cores Oficial (Design System MagnetSoftware)
| Token / Cor | Código Hex | Aplicação na Interface |
|-------------|------------|------------------------|
| 🔵 **Azul Primário (Céu/Topo)** | `#007AFF` / `#0284C7` | Balão do título 3D, Bloco A (`▲`), camisa do personagem Léo |
| 🟡 **Amarelo Vibrante** | `#FFD600` / `#FACC15` | Palavra "Matemática" 3D, Bloco B (`◆`), estrelas, foco D-Pad Fire TV |
| 🔴 **Vermelho Vivo** | `#EF4444` | Bloco C (`●`), botão de Logoff Administrativo, alertas de últimos 5s |
| 🟢 **Verde Limão Vibrante** | `#22C55E` / `#16A34A` | Botão principal "JOGAR", símbolo `+`, Bloco D (`■`), acertos |
| 🟠 **Laranja Vibrante** | `#F97316` | Símbolo de subtração `−`, Módulo 3, Power-Up Estrela 2x |
| 🟣 **Roxo / Lilás** | `#A855F7` / `#9333EA` | Símbolo de divisão `÷`, Bloco 5, Módulo 4, Power-Up 50/50 |

---

## 📏 REGRAS DO JOGO

1. A pergunta surge na TV acompanhada dos blocos 3D visuais e do som identificador de nova pergunta (`playNewQuestion`), enquanto os celulares vibram suavemente.
2. Enquanto os jogadores escolhem um bloco no celular, a resposta escolhida **permanece oculta na TV** até que todos respondam ou o cronômetro zere.
3. No **Módulo 1**, o número revelado preenche diretamente o cubo faltante no meio da equação (`3 + [ ? ] = 4` $\rightarrow$ `3 + [ 1 ] = 4`). Nos demais módulos, preenche o cubo de resultado (`a + b = [ ? ]`).
4. Na última rodada de cada partida, ativa-se a **⭐ Rodada Estrela em Dobro (Pontos 2x)**.

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

## 🛠️ TECNOLOGIAS UTILIZADAS

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 19.0.1 | Interface reativa da Fire TV, Painel Admin e Controle Mobile |
| **TypeScript** | 7.0.2 | Tipagem estática ponta a ponta (Cliente, Express e Serverless Vercel) |
| **Tailwind CSS** | 4.3.3 | Design System 3D MagnetSoftware e responsividade |
| **Vite + `vite-plugin-pwa`** | 8.3 / 1.2 | Bundler + geração automática de Manifesto PWA e Service Worker |
| **Express + `ws`** | 4.21 / 8.22 | Servidor autoritativo de salas via WebSockets e fallback REST `/api/room` |
| **Motion (Framer)** | 12.23 | Física de mola (*bounce*) nos cubos 3D e nas Medalhas 3D Animadas |
| **HTML5 Canvas 2D** | Nativo | Palco 60fps com *bokeh*, operadores 3D flutuantes e chuva de confetes |
| **Web Audio API** | Nativo | Sintetizador sonoro procedural na TV (início de pergunta, acertos e fanfarra) |
| **QRCode** | 1.5.4 | Geração dinâmica do QR Code de pareamento da sala |

---

## 📁 ESTRUTURA DE ARQUIVOS

```
jogo-de-matematica-tv/
├── api/
│   └── room.ts                         # Função Serverless Vercel (salas, logoff individual e rotação de PIN)
├── public/                             # Ícones PWA 3D e assets estáticos
├── server.ts                           # Servidor Express + WebSocket (salas, timers e ações administrativas)
├── vercel.json                         # Configuração de deploy na Vercel
├── vite.config.ts                      # Configuração Vite + VitePWA
├── README.md                           # Documentação completa do projeto
└── src/
    ├── App.tsx                         # Sincronização híbrida WebSocket + HTTP Polling e handlers de Admin
    ├── types/game.ts                   # Contratos TypeScript, módulos, avatares 3D Kids/Teens e medalhas
    ├── utils/sound.ts                  # Sintetizador Web Audio (som de início de pergunta na TV + vibração mobile)
    └── components/
        ├── StudioStageCanvas.tsx       # Renderizador Canvas 60fps
        ├── AvatarIcon.tsx              # Bustos 3D Infantil/Adolescente, Cubos 3D, Medalhas 3D e Selo MagnetSoftware
        ├── FireTvStageView.tsx         # Palco Fire TV + Tela Administrativa de Controle dos 4 Jogadores
        └── MobileControllerView.tsx    # Controle remoto enxuto para smartphone com vibração háptica
```

---

## 🏆 SISTEMA DE PONTUAÇÃO E ESTRELAS

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

## 💡 5 DICAS DE MELHORIAS E EVOLUÇÃO DO JOGO

Para continuar evoluindo o **Jogo de Matemática — MagnetSoftware** como um produto SaaS educacional e familiar de alto impacto, recomendamos as seguintes **5 melhorias estratégicas**:

1. **🧠 Dificuldade Adaptativa Inteligente (IA Pedagógica por Jogador)**
   - **O que é:** Ajustar dinamicamente o nível das perguntas ou o tempo de resposta individual com base na taxa de acerto da criança. Se um jogador de 6 anos estiver jogando na mesma sala que um adolescente de 13 anos, cada celular pode receber alternativas calibradas para sua faixa etária (*Handicap Equilibrado*), permitindo que irmãos de idades diferentes disputem de igual para igual na mesma TV.

2. **📊 Relatório Pedagógico para Pais e Professores (Dashboard Pós-Jogo)**
   - **O que é:** Na **Tela Administrativa**, adicionar uma aba de *"Desempenho Pedagógico"* mostrando quais operações (Adição, Subtração, Multiplicação ou Divisão) cada jogador dominou e onde teve mais dúvidas, com opção de exportar um certificado ou boletim em PDF/Imagem pelo celular dos pais.

3. **🏰 Modo "Chefe Final dos Blocos" (Boss Battle Cooperativo)**
   - **O que é:** Na última atividade do modo **Cooperativo**, criar um "Robô Gigante de Blocos 3D" na tela da TV que exige que os 4 jogadores resolvam sub-contas complementares ao mesmo tempo para desmontar o chefe em equipe, aumentando o engajamento em salas de aula e famílias.

4. **🎨 Loja de Customização com Estrelas Acumuladas (Progressão Persistente)**
   - **O que é:** Permitir que as estrelas douradas (`⭐`) ganhas nas partidas fiquem salvas no perfil do celular da criança para desbloquear novos acessórios 3D (ex.: *Capacete de Astronauta*, *Capa de Super-Herói*, *Óculos de Realidade Virtual*) e efeitos visuais de entrada no pedestal da TV.

5. **📝 Criador de Trilhas Personalizadas no Painel Administrativo (Modo Professor)**
   - **O que é:** Permitir que professores ou pais cadastrem, diretamente na **Tela Administrativa**, uma lista de contas específicas (ex.: *"Tabuada do 7 e do 8 para a prova de amanhã"*), gerando uma partida focada exatamente no conteúdo escolar da semana.

---

## 🔒 SEGURANÇA INFANTIL (KID-SAFE) E PRIVACIDADE

- ✅ **100% Kid-Safe (Zero Anúncios Externos)**: Sem banners publicitários, pop-ups ou links externos desprotegidos.
- ✅ **Parental Gate + Painel Administrativo**: O botão **"Área dos Pais"** e o **"Painel Admin"** permitem total controle sobre os jogadores logados e a duração da partida.
- ✅ **Privacidade por Design**: Nenhum dado pessoal sensível é coletado ou compartilhado com terceiros.

---

**Desenvolvido com 💛 pela MagnetSoftware para transformar o aprendizado de matemática em diversão em família!**
