# 🎮 SHOW DA INFORMÁTICA - SaaS

> Um jogo de quiz interativo estilo "Show do Milhão" com perguntas de informática, ambientado em uma nave espacial futurista 3D inspirada na série Star Trek.

![Status](https://img.shields.io/badge/Status-Pronto%20para%20Uso-success)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![Linguagem](https://img.shields.io/badge/Linguagem-Portugu%C3%AAs%20BR-orange)
![Tecnologia](https://img.shields.io/badge/Tecnologia-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Three.js-red)

---

## 📋 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Características Principais](#-características-principais)
3. [Funcionalidades do Sistema](#-funcionalidades-do-sistema)
4. [Interface e UX](#-interface-e-ux)
5. [Regras do Jogo](#-regras-do-jogo)
6. [Como Executar](#-como-executar)
7. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
8. [Estrutura de Arquivos](#-estrutura-de-arquivos)
9. [Sistema de Pontuação](#-sistema-de-pontuação)
10. [Conquistas](#-conquistas)
11. [Categorias e Perguntas](#-categorias-e-perguntas)
12. [Compatibilidade](#-compatibilidade)
13. [Solução de Problemas](#-solução-de-problemas)

---

## 🎯 VISÃO GERAL

O **Show da Informática** é um SaaS (Software as a Service) de quiz gamificado que testa o conhecimento dos usuários em diversas áreas da tecnologia. Com visual futurista inspirado em naves espaciais da série Star Trek, o jogo oferece uma experiência imersiva com mecânicas de gamificação avançadas como combos, conquistas, sistema de vidas e o especial "Rei da Rodada".

### 🎯 Objetivo
Responder corretamente o maior número possível de perguntas, acumular pontos através de combos e bônus, e conquistar o título de **REI DA RODADA** ao alcançar 9 acertos consecutivos!

---

## ✨ CARACTERÍSTICAS PRINCIPAIS

### 🧠 Gameplay Principal
- ✅ Quiz estilo "Show do Milhão" com perguntas de informática
- ✅ **7 categorias** distintas de conhecimento
- ✅ **140 perguntas totais** (20 por categoria)
- ✅ **10 perguntas aleatórias por rodada**
- ✅ Embaralhamento de perguntas e alternativas a cada partida
- ✅ Timer de 30 segundos por pergunta

### ❤️ Sistema de Vidas
- ✅ Jogador inicia com **3 vidas**
- ✅ Cada erro remove 1 vida
- ✅ Game Over ao perder todas as vidas
- ✅ Sem regeneração de vidas durante a partida

### 📊 Ranking Mensal Inteligente
- ✅ Mantém apenas a **maior pontuação** do jogador no mês
- ✅ Substitui automaticamente pontuações menores
- ✅ Reclassifica o ranking após cada partida
- ✅ Persistência via localStorage (com fallback seguro)

### 🔥 Sistema de Pontuação
- ✅ Pontuação base por acerto: **100 pontos**
- ✅ Sistema de Combo com multiplicadores progressivos
- ✅ Bônus de velocidade: **+50 pontos** se responder em menos de 10 segundos
- ✅ Bônus por não usar dicas (conquista "Autodidata")

### 🎯 Sistema de Dicas
- ✅ **3 tipos de dicas disponíveis:**
  - 🔄 **50/50** → remove 2 alternativas erradas
  - ⏭️ **Pular** → avança para a próxima pergunta
  - ⏱️ **+10s** → adiciona 10 segundos ao timer
- ✅ Cada dica pode ser usada **1 vez por partida**

### 🏅 Sistema de Conquistas
- 👑 **Perfeição** → 100% de acertos (10/10 com 3 vidas)
- ⚡ **Velocista** → todas as respostas em menos de 10 segundos
- 🔥 **Combo Master** → 10 acertos seguidos
- 📚 **Autodidata** → terminar sem usar dicas
- ❤️ **Sobrevivente** → terminar o jogo com apenas 1 vida

### 🎭 Personalização
- ✅ Escolha de **avatar** (20 emojis disponíveis)
- ✅ **4 temas visuais** selecionáveis em tempo real
- ✅ Persistência do perfil do jogador entre sessões

### 💎 Sistema Especial: REI DA RODADA
- ✅ **Ativação:** 9 acertos consecutivos
- ✅ **Evento:** Jogador recebe um desafio extremo
- ✅ **Resultado:**
  - ✅ Acerto → **+1000 pontos** + título de REI
  - ❌ Erro → perde toda a pontuação acumulada
- ✅ Apenas 1 REI no sistema por vez

---

## 🎨 INTERFACE E UX

### 🌌 Ambiente 3D do Jogo
O fundo do jogo é uma área 3D inspirada na visão interna de uma nave espacial futurista, baseada no estilo da série **Star Trek**.

**Elementos visuais:**
- 🌟 Painéis tecnológicos iluminados
- 📺 Telas holográficas
- 💡 Luzes suaves em tons de azul, roxo e branco
- 🌠 Sensação de profundidade (parallax e engine 3D)
- ⚡ Animação leve contínua (luzes, partículas, rotações)

**Implementação:** Three.js (WebGL) com partículas estelares, arcos de corredor, grade de piso e painéis laterais.

### 🎨 Temas Visuais Disponíveis
| Tema | Cores | Descrição |
|------|-------|-----------|
| 🌐 **Cyber** (padrão) | Neon azul/roxo | Visual futurista cyberpunk |
| 💚 **Matrix** | Verde | Inspirado no filme Matrix |
| 🎨 **Retro** | Amarelo/magenta | Estilo anos 80/90 |
| ⚪ **Minimal** | Preto/branco | Visual minimalista limpo |

### ❤️ Indicador de Vidas
- Exibição no canto superior direito
- Ícones dinâmicos:
  - ❤️ (vida ativa)
  - 🖤 (vida perdida)

### 📊 Elementos Visuais de Jogo
- Pontuação em tempo real
- Indicador de combo ao lado da pontuação
- Timer visível com anel SVG animado
- Indicador de vidas com corações

### 🎮 Animações
- 🎉 Confete ao acertar
- 💥 Efeito pulsante de combo
- 🌊 Transições suaves entre telas
- 📳 Animação de shake ao errar
- ✨ Efeito de pulse ao acertar

### 💎 Interface do "Rei da Rodada"
- Modal dourado chamativo
- Coroa animada flutuante 👑
- Efeitos brilhantes
- Mensagens dinâmicas

### 🏆 Ranking Visual
- Rei acima do 1º lugar
- Nome com 👑 REI
- Destaque dourado
- Medalhas para top 3 (🥇🥈🥉)

---

## 📏 REGRAS DO JOGO

### 📊 Ranking
- Apenas a maior pontuação mensal é válida
- Atualização automática após cada partida
- Mantém os 50 melhores registros

### ❤️ Vidas
- 3 vidas iniciais
- 3 erros = fim do jogo
- Sem regeneração durante a partida

### 🔥 Combos
- Crescem com acertos consecutivos
- Reset ao errar
- Multiplicadores:
  - **5+ acertos:** ×1.5
  - **8+ acertos:** ×2
  - **10+ acertos:** ×3

### ⚡ Bônus
- Bônus de velocidade e combo são acumulativos
- "Autodidata" só é conquistada sem uso de dicas
- Bônus de velocidade: +50 pontos (resposta em ≤10s)

### 💎 Rei da Rodada
- Ativa com 9 acertos seguidos
- Apenas 1 REI no sistema
- Só é substituído por outro vencedor do desafio
- Acerto: +1000 pontos + título
- Erro: perde toda a pontuação atual

### 🎯 Dicas
- Impactam conquistas
- Limite de 1 uso por dica por partida
- Uso de "Pular" zera o combo

---

## 🚀 COMO EXECUTAR

### Método 1: Abrir diretamente no navegador
1. Extraia o arquivo ZIP
2. Localize o arquivo `show-da-informatica.html`
3. Dê duplo clique no arquivo
4. O jogo abrirá no seu navegador padrão

### Método 2: Servidor local (recomendado para desenvolvimento)
```bash
# Usando Python 3
python3 -m http.server 8000

# Usando Node.js (com http-server)
npx http-server -p 8000

# Usando PHP
php -S localhost:8000
```
Depois acesse: `http://localhost:8000/show-da-informatica.html`

### Método 3: Hospedagem online
Faça upload do arquivo HTML para qualquer serviço de hospedagem estática:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Qualquer servidor web

---

## 🛠️ TECNOLOGIAS UTILIZADAS

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **HTML5** | - | Estrutura semântica do jogo |
| **CSS3** | - | Estilização, animações e responsividade |
| **JavaScript (ES6+)** | - | Lógica do jogo, estado e interações |
| **Three.js** | r128 | Renderização 3D do background |
| **Google Fonts** | - | Tipografia (Orbitron + Rajdhani) |
| **Web Animations API** | - | Animação de confete |
| **localStorage API** | - | Persistência de dados (com fallback seguro) |

### Bibliotecas Externas (CDN)
- **Three.js:** `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- **Google Fonts:**
  - Orbitron (títulos): `https://fonts.googleapis.com/css2?family=Orbitron`
  - Rajdhani (corpo): `https://fonts.googleapis.com/css2?family=Rajdhani`

---

## 📁 ESTRUTURA DE ARQUIVOS

```
show-da-informatica/
│
├── show-da-informatica.html    # Arquivo principal do jogo (HTML + CSS + JS)
├── README.md                   # Esta documentação
└── show-da-informatica.zip     # Pacote compactado com todos os arquivos
```

### Estrutura Interna do HTML
```
show-da-informatica.html
├── <head>
│   ├── Meta tags (charset, viewport)
│   ├── Google Fonts (Orbitron, Rajdhani)
│   ├── Three.js (CDN)
│   └── <style> (CSS completo do jogo)
│
└── <body>
    ├── <canvas id="bg-canvas">          # Background 3D
    ├── <div class="game-container">
    │   ├── <header class="game-header"> # Header com pontuação, vidas e temas
    │   ├── <div id="menu-screen">       # Tela inicial (nome + avatar)
    │   ├── <div id="category-screen">   # Tela de seleção de categoria
    │   ├── <div id="game-screen">       # Tela principal do jogo
    │   └── <div id="ranking-screen">    # Tela de ranking mensal
    ├── <div id="game-over-modal">       # Modal de fim de jogo
    ├── <div id="king-modal">            # Modal do desafio do Rei
    └── <script> (JavaScript completo)
```

---

## 🏆 SISTEMA DE PONTUAÇÃO

### Cálculo de Pontos por Resposta Correta
```
Pontos = (Pontos Base × Multiplicador Combo) + Bônus Velocidade
```

### Detalhamento
| Componente | Valor |
|------------|-------|
| **Pontuação base** | 100 pontos |
| **Combo 5+** | ×1.5 (150 pontos) |
| **Combo 8+** | ×2 (200 pontos) |
| **Combo 10+** | ×3 (300 pontos) |
| **Bônus velocidade (≤10s)** | +50 pontos |
| **Desafio do Rei (acerto)** | +1000 pontos |
| **Desafio do Rei (erro)** | Perde toda pontuação |

### Exemplo de Cálculo
- Resposta correta em 8s com combo de 10:
  - Base: 100
  - Combo ×3: 300
  - Bônus velocidade: +50
  - **Total: 350 pontos**

---

## 🎖️ CONQUISTAS

| Conquista | Ícone | Condição |
|-----------|-------|----------|
| **Perfeição** | 👑 | 100% de acertos (10/10) com 3 vidas |
| **Velocista** | ⚡ | Todas as respostas em menos de 10 segundos |
| **Combo Master** | 🔥 | 10 acertos consecutivos |
| **Autodidata** | 📚 | Terminar o jogo sem usar nenhuma dica |
| **Sobrevivente** | ❤️ | Terminar o jogo com apenas 1 vida restante |

---

## 📚 CATEGORIAS E PERGUNTAS

### Visão Geral
- **Total de perguntas:** 140
- **Categorias:** 7
- **Perguntas por categoria:** 20
- **Perguntas por rodada:** 10 (selecionadas aleatoriamente)

### Categorias Disponíveis

| Categoria | Ícone | Descrição | Nº de Perguntas |
|-----------|-------|-----------|-----------------|
| **Hardware** | 💻 | Componentes físicos, CPU, memória, placa-mãe | 20 |
| **Software** | 💾 | Sistemas operacionais, aplicativos, kernel | 20 |
| **Redes** | 🌐 | Protocolos, IPs, roteadores, modelos OSI/TCP-IP | 20 |
| **Segurança** | 🔒 | Malware, criptografia, ataques, firewalls | 20 |
| **Programação** | ⚡ | Linguagens, algoritmos, OOP, estruturas | 20 |
| **História** | 📚 | Pioneiros da computação, marcos históricos | 20 |
| **Aleatório** | 🎲 | Mistura de perguntas de todas as categorias | 140 |

### Exemplos de Perguntas

**Hardware:**
> Q: "Qual componente é considerado o cérebro do computador?"
> A: CPU ✓ | GPU | RAM | SSD

**Software:**
> Q: "O que significa SaaS?"
> A: Software as a Service ✓ | System as a Server | Security as a Solution | Storage as a Service

**Redes:**
> Q: "Qual protocolo é usado para envio de emails?"
> A: SMTP ✓ | POP3 | IMAP | HTTP

**Segurança:**
> Q: "O que é ransomware?"
> A: Malware que criptografa arquivos ✓ | Antivirus | Firewall | Atualização

**Programação:**
> Q: "Qual o resultado de 10 % 3?"
> A: 1 ✓ | 3 | 0 | 10

**História:**
> Q: "Quem é considerado o pai da computação?"
> A: Alan Turing ✓ | Bill Gates | Steve Jobs | Mark Zuckerberg

---

## 💻 COMPATIBILIDADE

### Navegadores Suportados
| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome | 80+ | ✅ Totalmente compatível |
| Firefox | 75+ | ✅ Totalmente compatível |
| Edge | 80+ | ✅ Totalmente compatível |
| Safari | 13+ | ✅ Totalmente compatível |
| Opera | 70+ | ✅ Totalmente compatível |
| Internet Explorer | - | ❌ Não suportado |

### Dispositivos
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablet (iPad, Android)
- ✅ Smartphone (iPhone, Android)
- ✅ Responsivo para todas as resoluções

### Requisitos Mínimos
- Navegador moderno com suporte a WebGL
- Conexão à internet (para carregar Three.js e Google Fonts via CDN)
- JavaScript habilitado

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### O background 3D não aparece
**Causa:** Falha ao carregar o Three.js (provável problema de conexão).
**Solução:** O jogo detecta automaticamente a falha e aplica um gradiente de fundo como fallback. O jogo continua funcionando normalmente.

### Erro "SecurityError: localStorage"
**Causa:** O ambiente (iframe sandbox, CodePen, JSFiddle) bloqueia o uso de localStorage.
**Solução:** O jogo já possui tratamento de erro com `try/catch`. Ele ignora o salvamento mas continua funcional. Para funcionalidade completa, abra o arquivo diretamente no navegador.

### Os avatares não aparecem
**Causa:** Versão antiga do navegador sem suporte a emojis.
**Solução:** Atualize para um navegador moderno.

### O jogo não inicia ao clicar na categoria
**Solução 1:** Verifique o console do navegador (F12) para erros JavaScript.
**Solução 2:** Limpe o cache do navegador.
**Solução 3:** Tente abrir em uma aba anônima.
**Solução 4:** Atualize o navegador.

### O ranking não salva entre sessões
**Causa:** localStorage desativado ou em modo privado.
**Solução:** Use o navegador em modo normal (não privado). Verifique as configurações de cookies/storage do navegador.

### O timer não decrementa
**Causa:** JavaScript desativado ou bloqueado por extensão.
**Solução:** Habilite JavaScript. Desative extensões bloqueadoras de scripts (NoScript, uBlock).

---

## 📱 RESPONSIVIDADE

O jogo é totalmente responsivo:

| Dispositivo | Comportamento |
|-------------|---------------|
| **Desktop** (>768px) | Layout completo, grid 2 colunas de respostas |
| **Tablet** (768px) | Layout adaptado, opções em coluna única |
| **Mobile** (<768px) | Layout otimizado, avatares em grid 5×4 |

### Recursos de Acessibilidade
- ✅ Suporte a `prefers-reduced-motion` (reduz animações)
- ✅ Contraste de cores adequado
- ✅ Fontes legíveis (Rajdhani para corpo, Orbitron para títulos)
- ✅ Botões com tamanho adequado para toque
- ✅ Navegação por teclado funcional

---

## 🔒 PRIVACIDADE E DADOS

- ✅ **Nenhum dado é enviado para servidores externos**
- ✅ Todos os dados (nome, avatar, ranking) ficam armazenados localmente no navegador via `localStorage`
- ✅ Não há coleta de telemetria ou analytics
- ✅ Não há rastreamento de terceiros
- ✅ O jogo funciona 100% offline após o carregamento inicial

---

## 📝 LICENÇA

Este projeto é fornecido como está, livre para uso pessoal e educacional.

---

## 👨‍💻 INFORMAÇÕES TÉCNICAS

- **Versão:** 1.0.0
- **Data de Criação:** Outubro 2026
- **Tamanho do Arquivo:** ~75 KB (HTML único)
- **Tempo de Carregamento:** < 2 segundos (com internet)
- **Performance:** 60 FPS (com Three.js habilitado)

---

## 🎯 PRÓXIMOS PASSOS SUGERIDOS

Melhorias futuras sugeridas para o projeto:
1. 🎵 Adicionar trilha sonora e efeitos sonoros
2. 🌐 Modo multiplayer online
3. 📊 Dashboard administrativo para gerenciar perguntas
4. 🏆 Sistema de torneios semanais
5. 📱 Aplicativo mobile nativo (PWA)
6. 🌍 Internacionalização (multi-idioma)
7. � Integração com redes sociais para compartilhamento de ranking

---

**Desenvolvido com 💜 para amantes da tecnologia**
