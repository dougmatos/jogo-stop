# Stop — Sorteador de Letras: Design Spec

**Data:** 2026-06-08  
**Status:** Aprovado

---

## 1. Visão Geral

Aplicação Angular 17+ que funciona como sorteador de letras para o jogo Stop. O usuário inicia um novo jogo, sorteia letras uma a uma via animação de slot machine, e visualiza quais letras já foram sorteadas numa grade A–Z. Sem categorias, sem pontuação — o app é o dado do jogo.

---

## 2. Escopo

**Inclui:**
- Tela inicial com botão "Novo Jogo"
- Tela de jogo com tambor animado (slot machine) e grade de letras
- Animação de roleta com desaceleração suave
- Grade A–Z: letras disponíveis em destaque, sorteadas com risco
- Efeitos sonoros procedurais (tick + ding + swoosh)
- Botão "Novo Jogo" na tela de jogo para reiniciar

**Fora do escopo:**
- Categorias de palavras
- Pontuação ou validação de respostas
- Multiplayer ou rede
- Persistência de dados (localStorage, backend)

---

## 3. Stack & Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework | Angular 17+ standalone | Zero config extra, signals nativos |
| Animação | Web Animations API | Controle frame-a-frame, sem dependências |
| Áudio | Web Audio API (`AudioContext`) | Sons procedurais, zero arquivos externos |
| Visuais | SVG inline nos templates | Qualidade vetorial, tema neon/dark |
| Estado | Angular Signals | Reatividade granular sem RxJS complexo |
| Roteamento | Nenhum | Duas views gerenciadas por signal no AppComponent |

---

## 4. Arquitetura de Componentes

```
src/app/
├── app.component.ts          ← Root: alterna home ↔ game via signal `view`
├── components/
│   ├── home/
│   │   └── home.component.ts         ← Logo SVG + botão "Novo Jogo"
│   ├── game/
│   │   └── game.component.ts         ← Orquestra roulette + alphabet-grid
│   ├── roulette/
│   │   └── roulette.component.ts     ← Tambor SVG + Web Animations API
│   └── alphabet-grid/
│       └── alphabet-grid.component.ts ← Grade 9×3 das 26 letras
└── services/
    ├── game.service.ts               ← Estado central com signals
    └── audio.service.ts              ← AudioContext: tick/ding/swoosh
```

### Responsabilidades

**`AppComponent`**
- Signal `view: 'home' | 'game'`
- Renderiza `HomeComponent` ou `GameComponent` via `@if`

**`HomeComponent`**
- Logo SVG animado (pulso de brilho idle)
- Botão "Novo Jogo" → chama `gameService.resetGame()` + navega para `game`

**`GameComponent`**
- Compõe `RouletteComponent` + `AlphabetGridComponent`
- Botão "Sortear" (desabilitado quando `phase !== 'idle'` ou `availableLetters` vazio)
- Botão "↺ Novo Jogo" discreto
- Mensagem "Todas as letras foram sorteadas!" quando `availableLetters.length === 0`

**`RouletteComponent`**
- Recebe `phase` e `currentLetter` via `input()` signals passados pelo `GameComponent`
- SVG do tambor: 3 slots visíveis (anterior, atual em destaque, próxima)
- `mask-image` linear-gradient para fade nas bordas
- Linha de seleção central com brilho ciano
- Executa animação Web Animations API ao detectar `phase === 'spinning'` (via `effect()`)
- Ao fim da animação, injeta `GameService` diretamente e chama `gameService.onAnimationComplete()`
- Chama `audioService` a cada tick e na parada

**`AlphabetGridComponent`**
- Recebe `drawnLetters` via input signal
- Grid CSS `repeat(9, 1fr)` com as 26 letras (+ 1 célula vazia para completar)
- Letra disponível: borda ciano, texto ciano semitransparente
- Letra sorteada: `text-decoration: line-through`, cor cinza, fundo sutilmente diferente
- Transição CSS suave ao mudar de estado

---

## 5. Estado do Jogo (`GameService`)

```typescript
// Signals expostos (readonly externamente)
availableLetters: Signal<string[]>   // começa ['A'..'Z']
drawnLetters:     Signal<string[]>   // histórico da rodada
currentLetter:    Signal<string | null>
phase:            Signal<'idle' | 'spinning' | 'result'>

// Métodos
drawLetter(): void
  // 1. sorteia letra aleatória de availableLetters
  // 2. move para drawnLetters
  // 3. define currentLetter
  // 4. muda phase para 'spinning'
  // (RouletteComponent notifica quando animação termina → phase volta para 'idle')

resetGame(): void
  // restaura availableLetters para A–Z completo
  // limpa drawnLetters e currentLetter
  // phase → 'idle'

onAnimationComplete(): void
  // chamado pelo RouletteComponent ao fim da animação
  // phase: 'spinning' → 'result' → 'idle' (após 1.5s de exibição)
```

---

## 6. Animação do Tambor (Web Animations API)

### Fases da animação (total ~2.7s)

| Fase | Duração | Easing | Descrição |
|---|---|---|---|
| Aceleração | 400ms | `ease-in` | `translateY` parte do offset atual, acelera |
| Rolagem | 1500ms | `linear` | Loop rápido de letras (~8 letras/s) |
| Desaceleração | 800ms | `cubic-bezier(0.25, 0.1, 0.1, 1.0)` | Abranda até travar na letra sorteada |

### Implementação

- Altura de cada slot: `60px`
- Janela visível: `180px` (3 slots) com `overflow: hidden`
- A letra sorteada é definida **antes** da animação iniciar
- A animação calcula o `translateY` final para centralizar a letra sorteada no slot do meio
- Ao terminar: pulso de brilho no slot central (`filter: drop-shadow(0 0 12px #00f5ff)`, 3 pulsos, 600ms)

---

## 7. Sistema de Áudio (`AudioService`)

Todos os sons são gerados proceduralmente com `AudioContext`. Nenhum arquivo de áudio externo.

| Evento | Tipo | Frequência | Duração | Forma de onda |
|---|---|---|---|---|
| Tick (letra passando) | Percussivo | 220 Hz | 40ms | `square` com decay rápido |
| Desaceleração | Ticks progressivamente mais lentos | 220 Hz | 40ms | `square` |
| Parada (ding) | Tonal | 880 Hz | 300ms | `sine` com decay suave |
| Novo jogo (swoosh) | Noise | — | 150ms | Ruído branco + filtro passa-baixa |

**Cadência dos ticks:**
- Durante aceleração/rolagem: intervalo fixo de ~125ms
- Durante desaceleração: intervalo cresce de 125ms até 400ms, espelhando o easing visual

**Gerenciamento do contexto:**
- `AudioContext` criado no primeiro clique do usuário (política de autoplay dos browsers)
- `AudioService.ensureContext()` chamado no `drawLetter()`

---

## 8. Visual & Tema Neon/Dark

### Paleta de cores

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#0d0d1a` | Fundo principal |
| `--bg-secondary` | `#080814` | Fundo do tambor |
| `--neon-cyan` | `#00f5ff` | Letras disponíveis, bordas, destaques |
| `--neon-purple` | `#bf00ff` | Botão "Sortear", acentos secundários |
| `--text-muted` | `#ffffff22` | Letras sorteadas, textos discretos |
| `--glow-cyan` | `0 0 12px #00f5ff88` | `box-shadow` / `text-shadow` neon |
| `--glow-purple` | `0 0 10px #bf00ff88` | Sombra do botão sortear |

### Fontes
- Interface e letras: `monospace` (sistema) — reforça o visual de terminal/arcade
- Títulos: `letter-spacing: 4–6px` para efeito de placa luminosa

### SVG Logo (HomeComponent)
- Círculo externo tracejado (`stroke-dasharray`) girando lentamente em idle
- Círculo interno sólido com `filter: drop-shadow` pulsando
- Letras "S!" no centro em ciano

---

## 9. Layout das Telas

### Tela Inicial
```
[Logo SVG — 110×110px, animado]
[STOP  —  letra-spacing grande]
[sorteador de letras  —  texto pequeno muted]
[  NOVO JOGO  —  botão ciano com brilho  ]
[26 LETRAS DISPONÍVEIS  —  texto muted xs]
```
Centralizado vertical e horizontalmente, fundo `#0d0d1a`.

### Tela de Jogo
```
[  Tambor slot machine — 90×110px  ]
[      ▶ SORTEAR       —  botão roxo ]
[ grade A–Z — 9 colunas × 3 linhas  ]
[  ↺ Novo Jogo  —  botão discreto   ]
```
Layout em coluna, centralizado, com espaçamento generoso.

---

## 10. Casos de Borda

| Situação | Comportamento |
|---|---|
| Clicar "Sortear" durante animação | Botão desabilitado enquanto `phase !== 'idle'` |
| Última letra disponível | Botão "Sortear" desabilitado, mensagem "Todas as letras foram sorteadas!" |
| Clicar "Novo Jogo" durante animação | Interrompe animação imediatamente, reseta estado |
| Browser sem Web Audio API | AudioService falha silenciosamente (try/catch), jogo funciona sem som |
| Browser sem Web Animations API | Fallback: troca direta de letra sem transição (graceful degradation) |
