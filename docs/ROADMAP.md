# ROADMAP — Survivors Arena

> **Regra de ouro**: a próxima fase só começa após a anterior estar testada e aprovada.

## Visão Geral das Fases

| Fase | Nome | Foco | Entregável |
|------|------|------|------------|
| 0 | Instalação | Dependências e ambiente configurado | Projeto rodando no browser |
| 1 | Fundação | Scaffolding + engine base | Herói andando na tela |
| 2 | MVP Core | Loop de jogo completo | Partida jogável do início ao fim |
| 3 | Conteúdo | Personagens, armas, inimigos | Jogo com variedade real |
| 4 | Progressão | Bosses, evolução de armas, meta | Jogo com profundidade |
| 5 | Polimento | Áudio, efeitos, UI/UX | Jogo publicável |
| 6 | Online | Ranking, save em nuvem, backend | Produto completo |

---

## Fase 0 — Instalação

**Objetivo**: ambiente 100% configurado e projeto abrindo no browser sem erros.

### 0.1 — Pré-requisitos

- [ ] Node.js 20+ instalado (`node -v`)
- [ ] npm ou pnpm disponível
- [ ] Git inicializado no projeto (`git init`)

### 0.2 — Criar o projeto

```bash
npm create vite@latest survivors-arena -- --template react-ts
cd survivors-arena
```

### 0.3 — Instalar dependências

```bash
# Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# Zustand (estado global)
npm install zustand
```

### 0.4 — Configurar Tailwind

Adicionar o plugin no `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Adicionar no `src/index.css`:

```css
@import "tailwindcss";
```

### 0.5 — Configurar alias de importação

No `vite.config.ts`, adicionar:

```ts
resolve: {
  alias: { '@': '/src' }
}
```

No `tsconfig.app.json`, adicionar:

```json
"paths": { "@/*": ["./src/*"] }
```

### 0.6 — Estrutura de pastas

Criar a estrutura base:

```
src/
  game/
    engine/
    entities/
    systems/
  components/
  stores/
  pages/
  assets/
  hooks/
```

### 0.7 — Verificação

- [ ] `npm run dev` abre sem erros no terminal
- [ ] Browser abre em `localhost:5173`
- [ ] Página inicial do Vite aparece
- [ ] Tailwind funciona (testar uma classe como `bg-red-500` num elemento)
- [ ] Alias `@/` resolve sem erro de importação

**Critério de aceite**: `npm run dev` roda limpo, browser abre, Tailwind aplicado, sem erros no console.

---

## Fase 1 — Fundação

**Objetivo**: projeto rodando com herói visível na tela.

### 0.1 — Setup do projeto

- [ ] `npm create vite` com React + TypeScript
- [ ] Instalar e configurar Tailwind
- [ ] Instalar Zustand
- [ ] Estrutura de pastas conforme arquitetura (`game/`, `components/`, `stores/`)
- [ ] Alias de importação (`@/`)

### 0.2 — Game Loop base

- [ ] `GameCanvas.tsx` com `<canvas>` fullscreen
- [ ] `engine.ts` com `requestAnimationFrame` e delta time
- [ ] `loop.ts` separando update e render
- [ ] Pausa/resume do loop

### 0.3 — Jogador

- [ ] Entidade `Player` com posição e velocidade
- [ ] Input WASD + setas direcionais
- [ ] Renderização simples no canvas (sprite ou retângulo)
- [ ] Câmera centralizada no jogador

**Critério de aceite**: herói se move fluidamente com WASD.

---

## Fase 1 — MVP Core

**Objetivo**: partida completa e jogável, sem conteúdo variado.

### 1.1 — Inimigos

- [ ] Entidade `Enemy` com HP, velocidade, dano
- [ ] Spawner: inimigos nascem nas bordas da tela
- [ ] IA básica: localizar jogador e mover em direção a ele
- [ ] Colisão inimigo × jogador (dano por contato)
- [ ] Morte do inimigo ao chegar a 0 HP

### 1.2 — Arma inicial

- [ ] Projetil simples (flecha) disparado automaticamente
- [ ] Mira no inimigo mais próximo
- [ ] Colisão projétil × inimigo
- [ ] Cooldown de ataque

### 1.3 — XP e Level Up

- [ ] Inimigos dropam orbs de XP ao morrer
- [ ] Coleta automática por proximidade (pickup radius)
- [ ] Barra de XP e cálculo de nível
- [ ] Ao subir de nível: pausar jogo e exibir 3 upgrades aleatórios
- [ ] Aplicar upgrade escolhido e retomar

### 1.4 — HUD

- [ ] Barra de vida do jogador
- [ ] Barra de XP
- [ ] Nível atual
- [ ] Timer de sobrevivência

### 1.5 — Game Over

- [ ] Jogador morre ao chegar a 0 HP
- [ ] Tela de game over com:
  - Tempo sobrevivido
  - Inimigos eliminados
  - Nível alcançado
  - Botão "Jogar novamente"

### 1.6 — Tela inicial

- [ ] Menu principal simples
- [ ] Botão "Jogar"

**Critério de aceite**: dá pra jogar uma partida completa — começa, mata inimigos, sobe de nível, morre, volta ao menu.

---

## Fase 2 — Conteúdo Base

**Objetivo**: jogo com variedade de escolhas e sensação de progressão real por partida.

### 2.1 — Personagens

- [ ] Tela de seleção com 3 personagens disponíveis no MVP
- [ ] Knight — +20% HP, espada giratória
- [ ] Ranger — +15% velocidade, arco automático
- [ ] Mage — +20% dano mágico, bola de fogo
- [ ] Passivas únicas aplicadas desde o início

### 2.2 — Arsenal (5 armas)

- [ ] **Espada Giratória** — orbita o jogador, dano contínuo
- [ ] **Arco** — dispara no inimigo mais próximo
- [ ] **Bola de Fogo** — projétil com explosão em área (AoE)
- [ ] **Raio** — acerta múltiplos inimigos em cadeia
- [ ] **Aura** — dano contínuo em raio ao redor do jogador

### 2.3 — Passivos (upgrades sem arma)

- [ ] Poder (+10% dano)
- [ ] Vitalidade (+20 HP)
- [ ] Agilidade (+10% velocidade)
- [ ] Precisão (+5% crítico)
- [ ] Magnetismo (+20% raio de coleta)
- [ ] Sorte (+15% drops raros)
- [ ] Armadura (+10% resistência)
- [ ] Sabedoria (+20% XP)

### 2.4 — Inimigos variados

- [ ] **Slime** — pouca vida, muito comum
- [ ] **Skeleton** — velocidade média
- [ ] **Orc** — muito HP, lento
- [ ] **Spider** — muito rápido, pouco HP

### 2.5 — Sistema de raridade de upgrades

- [ ] Comum (cinza), Incomum (verde), Raro (azul)
- [ ] Peso de probabilidade por raridade
- [ ] Visual diferenciado nos cards de upgrade

**Critério de aceite**: cada partida parece diferente por causa das escolhas de arma/passivo.

---

## Fase 3 — Profundidade

**Objetivo**: jogo com curva de dificuldade real, bosses e builds profundas.

### 3.1 — Progressão de dificuldade

- [ ] Wave system baseado em tempo:
  - 0-5min: inimigos básicos
  - 5-10min: mais velocidade e quantidade
  - 10-15min: Elites (Necromancer, Demon)
  - 15-20min: Mini bosses (Giant)
  - 20min+: modo infinito

### 3.2 — Bosses

- [ ] Entidade `Boss` com HP alto e habilidades especiais
- [ ] **Goblin King** (5min) — ataque em área
- [ ] **Infernal Golem** (10min) — projéteis múltiplos
- [ ] **Frost Titan** (15min) — slow no jogador
- [ ] **Shadow Reaper** (20min) — teleporte
- [ ] Alerta de boss na HUD
- [ ] Barra de HP do boss exibida na tela

### 3.3 — Evolução de armas

- [ ] Cada arma tem níveis 1 a 8
- [ ] Ao selecionar a mesma arma no upgrade, ela sobe de nível
- [ ] Cada nível melhora dano, velocidade ou quantidade
- [ ] **Evolução final**: ao atingir nível 8 + passivo correto no máximo, libera forma evoluída:
  - Espada → Tempestade de Lâminas
  - Arco → Metralhadora Élfica
  - Bola de Fogo → Meteoro Infernal
  - Raio → Tempestade Elétrica
  - Aura → Nevasca Eterna

### 3.4 — Drops adicionais

- [ ] **Heal Orb** — recupera HP ao coletar
- [ ] **Gold** — moeda permanente
- [ ] **Chest** — contém upgrades, ouro ou itens raros

### 3.5 — Sistema de raridade expandido

- [ ] Épico (roxo), Lendário (laranja), Mítico (vermelho)
- [ ] Chance influenciada pelo atributo Sorte

### 3.6 — Meta progressão (entre partidas)

- [ ] Ouro permanente salvo em LocalStorage
- [ ] Loja entre partidas: melhorar HP, dano, velocidade, XP, sorte
- [ ] Árvore de talentos (50+ melhorias)
- [ ] Desbloqueio de personagens por conquistas

### 3.7 — Conquistas

- [ ] Sobreviver 10 minutos
- [ ] Matar 1.000 inimigos
- [ ] Derrotar Dragon
- [ ] Completar partida sem tomar dano
- [ ] Evoluir todas as armas

**Critério de aceite**: jogador sente evolução permanente entre partidas e estratégia dentro de cada uma.

---

## Fase 4 — Polimento

**Objetivo**: produto com qualidade de lançamento.

### 4.1 — Personagens completos

- [ ] Assassin — +15% crítico, adagas
- [ ] Engineer — drones, Drone Mk1

### 4.2 — Armas adicionais

- [ ] Machado (lançamento em arco → Machados Eternos)
- [ ] Foice (retorna após lançamento → Ceifador Supremo)
- [ ] Drone (ataque automático → Drone Omega)
- [ ] Torreta (invocação fixa → Torreta Nuclear)
- [ ] Laser (ataque perfurante → Canhão Quântico)

### 4.3 — Inimigos adicionais

- [ ] Necromancer (invoca lacaios)
- [ ] Demon (elite)
- [ ] Giant (mini boss)
- [ ] Dragon (boss)
- [ ] Ancient Dragon (25min)
- [ ] Void Lord (30min — boss final)

### 4.4 — Áudio

- [ ] Efeitos sonoros: level up, hit, kill, boss spawn, game over
- [ ] Música de combate em loop
- [ ] Música de boss
- [ ] Controles de volume na UI

### 4.5 — Efeitos visuais

- [ ] Partículas ao matar inimigos
- [ ] Flash de dano no jogador
- [ ] Animação de level up
- [ ] Explosão ao boss morrer
- [ ] Screen shake em hits pesados

### 4.6 — UI/UX

- [ ] Animação de entrada/saída nos menus
- [ ] Cards de upgrade com visual por raridade
- [ ] Tooltip de armas e passivos
- [ ] Mobile: joystick virtual na tela

### 4.7 — LocalStorage

- [ ] Salvar: melhor tempo, maior nível, total de kills, personagens desbloqueados
- [ ] Tela de estatísticas pessoais

**Critério de aceite**: jogo está pronto para publicação no Vercel.

---

## Fase 5 — Online

**Objetivo**: produto com funcionalidades sociais e backend.

### 5.1 — Múltiplos mapas

- [ ] Forgotten Forest (mapa inicial)
- [ ] Frozen Wastes (redução de mobilidade)
- [ ] Desert of Bones (mais inimigos)
- [ ] Infernal Lands (dano ambiental)
- [ ] Void Realm (mapa final)

### 5.2 — Ranking

- [ ] Placar global: maior tempo, maior nível, maior kill count
- [ ] Placar semanal com reset
- [ ] Exibição de top 10 na tela inicial

### 5.3 — Backend (PayloadCMS)

- [ ] Login social (Google/Discord)
- [ ] Cloud Save vinculado à conta
- [ ] API de ranking
- [ ] Métricas: partidas iniciadas/concluídas, tempo médio, build mais usada

### 5.4 — Cosméticos (opcional)

- [ ] Skins de personagens (Knight Dourado, Mage Arcano, Samurai, Cyber Warrior)
- [ ] Efeitos visuais (trilhas, explosões, animações)
- [ ] Battle Pass

### 5.5 — Eventos e Temporadas

- [ ] Temporadas com ranking e recompensas
- [ ] Eventos temporários com modificadores de jogo

**Critério de aceite**: jogadores de todo o mundo competem no ranking e progridem entre temporadas.

---

## Dependências entre fases

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
                     ↑
           (Fase 2 pode ser parcialmente
            paralela à Fase 1 após 1.2)
```

---

## Prioridade de implementação técnica

1. **Engine antes de conteúdo** — canvas, loop, colisão, física antes de criar inimigos novos
2. **Uma arma funcional antes de cinco** — validar o sistema antes de multiplicar
3. **Dados antes de visual** — upgrades aplicando números corretos antes de animação
4. **Canvas para entidades, React para UI** — nunca renderizar inimigos como divs
