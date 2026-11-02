# 🎮 JOGO DE MATEMÁTICA (MATHSHOW TV) — SaaS

> Um game show educativo e interativo de matemática em blocos 3D projetado para rodar na **Amazon Fire TV Stick**, utilizando de **1 a 4 smartphones como controles remotos em tempo real** via QR Code e PIN de 4 dígitos.

![Status](https://img.shields.io/badge/Status-Pronto%20para%20Uso-success)
![Versão](https://img.shields.io/badge/Versão-2.0.0-blue)
![Linguagem](https://img.shields.io/badge/Linguagem-Portugu%C3%AAs%20BR-orange)
![Plataforma](https://img.shields.io/badge/Plataforma-Amazon%20Fire%20TV%20%7C%20Mobile%20Remote-yellow)
![Tecnologia](https://img.shields.io/badge/Tecnologia-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20CSS%20%7C%20WebSockets%20%7C%20Canvas%2060fps-red)

---

## 📋 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Características Principais](#-características-principais)
3. [Funcionalidades do Sistema](#-funcionalidades-do-sistema)
4. [Interface, Design System 3D e UX](#-interface-design-system-3d-e-ux)
5. [Regras do Jogo](#-regras-do-jogo)
6. [Como Executar](#-como-executar)
7. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
8. [Estrutura de Arquivos](#-estrutura-de-arquivos)
9. [Sistema de Pontuação e Estrelas](#-sistema-de-pontuação-e-estrelas)
10. [Ajudas Táticas (Power-Ups) e Conquistas](#-ajudas-táticas-power-ups-e-conquistas)
11. [Módulos da Trilha Educativa e Perguntas](#-módulos-da-trilha-educativa-e-perguntas)
12. [Compatibilidade](#-compatibilidade)
13. [Solução de Problemas](#-solução-de-problemas)
14. [Segurança Infantil (Kid-Safe) e Privacidade](#-segurança-infantil-kid-safe-e-privacidade)

---

## 🎯 VISÃO GERAL

O **Jogo de Matemática (MathShow TV)** — desenvolvido sob o padrão visual **MgnetSoftware** — é uma aplicação SaaS gamificada voltada para crianças, adolescentes e famílias. O sistema transforma a televisão da sala (**Amazon Fire TV Stick**) em um palco colorido de blocos numéricos 3D e permite que **1 a 4 celulares** se conectem instantaneamente via **QR Code ou código PIN de 4 dígitos** para funcionar como controles remotos táteis.

### 🎯 Objetivo
Resolver desafios visuais de matemática empilhando e calculando blocos 3D, acumular pontos e estrelas douradas (`⭐`) através de velocidade e sequências (*streaks*), utilizar ajudas estratégicas pelo celular e dominar os **4 Módulos da Trilha Educativa**!

---

## ✨ CARACTERÍSTICAS PRINCIPAIS

### 🧠 Gameplay Principal (TV + Celular em Tempo Real)
- ✅ Arquitetura **Dual-View**: Visão de Palco 10-foot UI na **Fire TV** + Visão de Controle Tátil no **Celular**
- ✅ Conexão instantânea de **1 a 4 smartphones** via **QR Code dinâmico** ou **PIN de 4 dígitos**
- ✅ **4 Módulos Educativos** progressivos (*Conhecendo os Números*, *Somando com Blocos*, *Subtraindo e Desmontando*, *Desafio dos Símbolos*)
- ✅ **3 Níveis de Dificuldade** (*Fácil 1–10*, *Médio*, *Mestre*)
- ✅ **2 Modos de Partida**:
  - 🏆 **Competitivo**: Corrida de pontos e estrelas no pódio de 1º a 4º lugar
  - 🤝 **Cooperativo**: Toda a família/turma soma pontos junta para bater a meta da equipe
- ✅ **Simulador de Celular Virtual (PiP)** embutido na própria tela da TV para testes rápidos em tela única

### 🎨 Estúdio Gerador de Avatares 3D no Login do Celular
- ✅ Cada jogador cria uma **identidade visual 3D única** antes de entrar no palco:
  - 🧸 **8 Modelos 3D Base**: *Cubo Feliz 3D*, *Coruja Sábia 3D*, *Raposa Estudante*, *Panda Gênio 3D*, *Gatinho Blocos*, *Robô Calculadora*, *Léo Construtor* e *Bia Estrela*
  - 🎨 **7 Cores 3D Vibrantes** com iluminação volumétrica e brilho especular
  - 🎓 **5 Acessórios Estudantes 3D**: *Capelo de Formatura*, *Óculos Gênio*, *Coroa 3D*, *Fone Gamer* ou *Natural*
  - 🎲 Botão **"Sortear 3D"** para combinação aleatória instantânea

### 🗣️ Narrador de Voz (Text-to-Speech) & Vibração Háptica
- ✅ **Apresentador de Voz em Português (`pt-BR`)**: Narra automaticamente cada nova pergunta na TV, anuncia a entrada de novos jogadores e celebra as respostas corretas
- ✅ **Feedback Háptico (`Vibration API`)**: O celular vibra ao tocar nos cubos 3D, ao ativar ajudas especiais e ao revelar o resultado da rodada

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

### 🧱 Cenário 3D & Elementos Visuais (Canvas 60fps)
- **Ambiente de Sala de Estudo (*Bokeh*)**: Prateleiras desfocadas suaves ao fundo com partículas luminosas e bancada de madeira natural na base da TV
- **Símbolos Matemáticos 3D Flutuantes**: Medalhões tridimensionais (`+`, `−`, `×`, `÷`) animados continuamente no palco
- **Cubos Numéricos 3D Empilháveis**: Representação visual concreta das quantidades em cada pergunta (ex.: `Temos 3 blocos` + `Meta: 4 blocos`)
- **Botão de Retorno Rápido à TV**: Na visão do celular conectado, o cabeçalho conta com o botão **"📺 Apresentação na TV"** para alternar instantaneamente em dispositivos de tela única

---

## 📏 REGRAS DO JOGO

### 🧒 Abordagem Pedagógica "Sem Punições Severas"
- Erros nunca exibem mensagens negativas ou sons agressivos; o jogador recebe incentivo positivo (*"Boa tentativa! Tente de novo na próxima!"*) acompañado de uma **Dica de Cálculo Mental** explicando passo a passo como resolver a conta.

### ⚡ Dinâmica das Rodadas
1. A pergunta surge na TV acompanhada dos blocos 3D visuais e da narração por voz.
2. No **Módulo 1**, o número escolhido preenche diretamente o cubo faltante no meio da equação (`3 + [ ? ] = 4` $\rightarrow$ `3 + [ 1 ] = 4`). Nos demais módulos, preenche o cubo de resultado (`a + b = [ ? ]`).
3. Assim que todos os celulares conectados travam suas respostas, a TV revela imediatamente o resultado sem obrigar a esperar o fim do relógio.
4. Na última rodada de cada partida, ativa-se a **⭐ Rodada Estrela em Dobro (Pontos 2x)**.

---

## 🚀 COMO EXECUTAR

### Pré-requisitos
- **Node.js** 18+ instalado

### Passo a Passo (Desenvolvimento e Produção)
```bash
# 1. Instalar todas as dependências
npm install

# 2. Iniciar o servidor Full-Stack (Express + WebSocket + Vite na porta 3000)
npm run dev
```

Depois acesse no navegador da Fire TV ou computador:
- **Visão Palco Fire TV:** `http://localhost:3000`
- **Visão Controle no Celular:** Escaneie o **QR Code** exibido na tela da TV (ou acesse `http://localhost:3000/?room=XXXX&role=controller`)

### Build para Produção
```bash
# Compilar o frontend otimizado
npm run build

# Executar o servidor de produção
npm start
```

---

## 🛠️ TECNOLOGIAS UTILIZADAS

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 19.0.1 | Interface reativa da Fire TV e do Controle Mobile |
| **TypeScript** | 7.0.2 | Tipagem estática ponta a ponta (Cliente e Servidor) |
| **Tailwind CSS** | 4.3.3 | Design System 3D, tokens de cores e responsividade |
| **Express + `ws`** | 4.21 / 8.22 | Servidor autoritativo de salas e sincronização em tempo real via WebSockets |
| **Motion (Framer)** | 12.23 | Física de mola (*bounce*) nos cubos 3D e transições |
| **HTML5 Canvas 2D** | Nativo | Palco 60fps com *bokeh*, operadores 3D flutuantes e confetes/estrelas |
| **Web Audio API** | Nativo | Sintetizador sonoro procedural (sem arquivos MP3 externos pesados) |
| **Web Speech API** | Nativo | Narrador de voz (`pt-BR`) estilo apresentador de TV |
| **QRCode** | 1.5.4 | Geração dinâmica do QR Code de pareamento da sala |

---

## 📁 ESTRUTURA DE ARQUIVOS

```
jogo-de-matematica-tv/
│
├── server.ts                           # Servidor Express + WebSocket (salas, perguntas, timers e rotação de PIN)
├── index.html                          # Entrypoint HTML com fontes Fredoka, Nunito, Outfit e JetBrains Mono
├── package.json                        # Scripts e dependências do projeto
├── metadata.json                       # Metadados da aplicação
├── README.md                           # Documentação completa do projeto
└── src/
    ├── main.tsx                        # Inicialização React
    ├── index.css                       # Tokens CSS MgnetSoftware, relevo 3D e animações de tempo
    ├── App.tsx                         # Gerenciador de conexão WebSocket, áudio/voz e roteamento TV/Celular
    ├── types/
    │   └── game.ts                     # Contratos TypeScript, módulos, avatares 3D e power-ups
    ├── utils/
    │   └── sound.ts                    # Motor Web Audio API + Narrador Text-to-Speech + Vibração Háptica
    └── components/
        ├── StudioStageCanvas.tsx       # Renderizador Canvas 60fps (sala bokeh, símbolos 3D e partículas)
        ├── AvatarIcon.tsx              # Gerador SVG 3D de Avatares, Cubos 3D, Splash Hero e selo MgnetSoftware
        ├── FireTvStageView.tsx         # Interface 10-foot para Amazon Fire TV com navegação D-Pad espacial
        └── MobileControllerView.tsx    # Controle remoto para smartphone com criador de avatar e power-ups
```

---

## 🏆 SISTEMA DE PONTUAÇÃO E ESTRELAS

### Cálculo de Pontos por Resposta Correta
```
Pontos = (Pontos Base + Bônus de Velocidade + Bônus de Sequência) × Multiplicador Relâmpago × Multiplicador Power-Up 2x
```

### Detalhamento
| Componente | Valor |
|------------|-------|
| **Pontuação Base por Acerto** | `500 pontos` + `1 ⭐ Estrela` |
| **Bônus de Velocidade** | Até `+400 pontos` (proporcional à rapidez da resposta) |
| **Bônus de Sequência (Streak)** | `+100 pontos` por acerto consecutivo (até `+300 pontos`) |
| **Rodada Estrela em Dobro (Última Rodada)** | Multiplicador `×2` nos pontos |
| **Ajuda "Estrela 2x" Ativada no Celular** | Multiplicador `×2` nos pontos e `+2 ⭐ Estrelas` |

---

## 🎖️ AJUDAS TÁTICAS (POWER-UPS) E CONQUISTAS

| Recurso / Destaque | Ícone | Efeito na Partida |
|--------------------|-------|-------------------|
| **Cortar 2 (50/50)** | ✂️ | Elimina duas opções incorretas na tela do celular do jogador |
| **Congelar Tempo (+5s)** | ❄️ | Acrescenta 5 segundos imediatos ao cronômetro da atividade atual |
| **Estrela em Dobro (2x)** | ⭐ | Dobra a pontuação e concede 2 estrelas caso o jogador acerte |
| **Sequência em Chamas** | 🔥 | Destaque especial no pedestal para 2 ou mais acertos seguidos |
| **Líder do Palco** | 👑 | Coroa dourada atribuída ao 1º colocado no pódio final |

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

### Dispositivos e Plataformas Suportadas
- ✅ **Amazon Fire TV Stick / Smart TVs** (Navegador Amazon Silk, Android TV WebView, navegadores 1080p/4K com controle D-Pad)
- ✅ **Smartphones Android e iOS** (Chrome, Safari, Samsung Internet — leitura nativa de QR Code)
- ✅ **Desktop & Notebooks** (Windows, macOS, Linux, ChromeOS — com simulador de celular Picture-in-Picture integrado)
- ✅ **Tablets / iPads** (Modo tela da sala ou modo controle tátil)

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### O celular informa "Sala não encontrada" ao digitar o PIN
**Causa:** A sala da TV foi reiniciada ou um jogador saiu ao final da partida anterior, gerando um novo PIN por segurança.
**Solução:** Confira o número de 4 dígitos exibido no topo da tela da TV (ao lado do mini QR Code) e digite o código atualizado.

### O narrador de voz não está falando na TV
**Causa:** O áudio do navegador pode estar silenciado ou o botão de voz desativado.
**Solução:** Clique no botão **Voz** (ícone de microfone verde) no canto superior direito da tela da TV e interaja com o botão **JOGAR** para liberar a síntese de voz do navegador.

### Quero voltar da tela do controle para a tela de apresentação da TV no mesmo aparelho
**Solução:** Toque no botão amarelo **"📺 Apresentação na TV"** localizado no topo direito do controle conectado.

---

## 🔒 SEGURANÇA INFANTIL (KID-SAFE) E PRIVACIDADE

- ✅ **100% Kid-Safe (Zero Anúncios Externos)**: Sem banners publicitários, pop-ups ou links externos desprotegidos.
- ✅ **Parental Gate (Bloqueio Parental)**: O botão **"Área dos Pais"** no rodapé junto ao selo **MgnetSoftware** exige a resolução de um desafio matemático (`12 × 4 = 48`) antes de liberar configurações de duração da partida.
- ✅ **Privacidade por Design**: Nenhum dado pessoal sensível é coletado ou compartilhado com terceiros; as salas utilizam códigos temporários de 4 dígitos que são renovados automaticamente quando jogadores deixam a sessão.

---

**Desenvolvido com 💛 no padrão visual MgnetSoftware para transformar o aprendizado de matemática em diversão em família!**
