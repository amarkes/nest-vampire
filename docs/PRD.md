# PRD — Survivors Arena

## 1. Visão Geral

### Objetivo

Criar um jogo web 2D estilo Survivor Arena onde o jogador controla um herói que deve sobreviver o máximo possível contra hordas crescentes de inimigos.

O jogo será desenvolvido utilizando:

* React
* TypeScript
* TailwindCSS
* HTML5 Canvas
* Zustand

### Público-alvo

* Jogadores casuais

---

# 2. MVP

## Funcionalidades

### Movimento

* WASD
* Setas do teclado


### Combate

* Ataques automáticos
* Não existe botão de ataque
* Jogador apenas movimenta o personagem

### Inimigos

* Spawn contínuo
* IA simples:

  * localizar jogador
  * mover até jogador
  * causar dano ao encostar

### Experiência

* Inimigos dropam XP
* XP é coletada ao aproximar
* Barra de experiência

### Level Up

Ao subir de nível:

* Pausar jogo
* Exibir 3 opções aleatórias

Exemplos:

* +10% dano
* +15% velocidade
* +1 projétil
* +20% alcance
* +25% XP obtida

### Game Over

Quando HP chegar a 0:

* Exibir tempo sobrevivido
* Quantidade de inimigos mortos
* Nível alcançado
* Botão jogar novamente

---

# 3. Gameplay

## Loop Principal

1. Jogador entra
2. Inimigos aparecem
3. Mata inimigos
4. Ganha XP
5. Sobe nível
6. Escolhe upgrade
7. Sobrevive
8. Enfrenta minibosses
9. Morre ou vence

---

# 4. Sistema de Personagem

## Atributos

### Vida

```typescript
health: number
maxHealth: number
```

### Movimento

```typescript
moveSpeed: number
```

### Ataque

```typescript
damage: number
attackSpeed: number
criticalChance: number
criticalMultiplier: number
```

### Progressão

```typescript
level: number
experience: number
```

---

# 5. Sistema de Armas

## Espada Giratória

Orbita o jogador.

## Flecha

Dispara automaticamente no inimigo mais próximo.

## Bola de Fogo

Explode ao atingir alvo.

## Raio

Acerta múltiplos inimigos.

## Aura

Dano contínuo ao redor do jogador.

---

# 6. Sistema de Evolução

Cada arma possui:

* Nível 1 a 8

Exemplo:

Espada

Nível 1

* 1 espada

Nível 8

* 5 espadas
* velocidade dobrada
* dano aumentado

---

# 7. Sistema de Inimigos

## Comum

* Pouca vida
* Grande quantidade

## Elite

* Mais HP
* Mais dano

## Boss

* Grande HP
* Habilidades especiais

---

# 8. Progressão da Partida

## Minutos 0-5

* Inimigos básicos

## Minutos 5-10

* Mais velocidade
* Mais quantidade

## Minutos 10-15

* Elites

## Minutos 15-20

* Bosses

## Minutos 20+

* Modo sobrevivência infinita

---

# 9. HUD

## Topo

* Tempo de sobrevivência
* Nível
* Barra XP

## Inferior

* Vida
* Armas equipadas
* Passivos

---

# 10. Áudio

## Efeitos

* Level up
* Hit
* Kill
* Boss spawn
* Game over

## Música

* Loop de combate
* Música de boss

---

# 11. Salvar Progresso

LocalStorage

Salvar:

* Melhor tempo
* Maior nível
* Total de eliminações
* Personagens desbloqueados

---

# 12. Métricas

* Partidas iniciadas
* Partidas concluídas
* Tempo médio
* Build mais utilizada
* Armas mais escolhidas

---

# 13. Tecnologias

Frontend:

* React
* TypeScript
* TailwindCSS
* Zustand
* Vite

Game Engine:

* HTML5 Canvas
* requestAnimationFrame

Persistência:

* LocalStorage

Deploy:

* Vercel

---

# 14. Roadmap Pós-MVP

Fase 2

* Múltiplos mapas
* Sistema de ouro
* Loja

Fase 3

* Equipamentos
* Talentos permanentes
* Conquistas

Fase 4

* Ranking online
* Temporadas
* Multiplayer cooperativo

Fase 5

* Backend PayloadCMS
* Login social
* Cloud Save
* Battle Pass



# Arquitetura recomendada
src/
 ├── game/
 │   ├── engine/
 │   ├── entities/
 │   │   ├── player/
 │   │   ├── enemy/
 │   │   ├── projectile/
 │   │   └── boss/
 │   ├── systems/
 │   │   ├── collision/
 │   │   ├── spawn/
 │   │   ├── combat/
 │   │   ├── xp/
 │   │   └── upgrades/
 │   └── maps/
 │
 ├── components/
 ├── stores/
 ├── pages/
 ├── assets/
 └── hooks/
