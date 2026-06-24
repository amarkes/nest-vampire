# GDD — Survivors Arena

## 1. Game Overview

### Nome

Survivors Arena

### Gênero

* Action Roguelite
* Bullet Heaven
* Survival
* Progressão Permanente

### Plataforma

* Web (Desktop e Mobile)
* Futuro: Android e iOS

### Engine

* React + TypeScript
* HTML5 Canvas
* TailwindCSS
* Zustand

### Referências

* Vampire Survivors
* Brotato
* 20 Minutes Till Dawn
* Dota 2 (Nest of Thorns)

---

# 2. High Concept

O jogador entra em uma arena infestada por criaturas e deve sobreviver o maior tempo possível.

Ao derrotar inimigos:

* ganha experiência
* sobe de nível
* escolhe novas habilidades
* evolui armas
* cria combinações cada vez mais poderosas

Cada partida é única devido ao sistema de upgrades aleatórios.

---

# 3. Core Pillars

## 1. Simplicidade

Fácil de aprender.

Movimento apenas.

Ataques são automáticos.

---

## 2. Progressão Constante

A cada minuto o jogador sente evolução.

---

## 3. Build Diversity

Cada partida gera combinações diferentes.

---

## 4. Rejogabilidade

Centenas de builds possíveis.

---

# 4. Gameplay Loop

```text
Entrar
 ↓
Sobreviver
 ↓
Matar inimigos
 ↓
Ganhar XP
 ↓
Subir nível
 ↓
Escolher upgrade
 ↓
Ficar mais forte
 ↓
Enfrentar boss
 ↓
Sobreviver
 ↓
Morrer ou vencer
```

---

# 5. Controles

## Desktop

WASD

ou

Setas direcionais

---

## Mobile

Joystick virtual

---

# 6. Personagens

## Knight

### Passiva

+20% HP

### Inicial

Espada giratória

---

## Ranger

### Passiva

+15% velocidade

### Inicial

Arco automático

---

## Mage

### Passiva

+20% dano mágico

### Inicial

Bola de fogo

---

## Assassin

### Passiva

+15% crítico

### Inicial

Adagas

---

## Engineer

### Passiva

Invoca drones

### Inicial

Drone Mk1

---

# 7. Sistema de Atributos

## Primários

### Health

Vida total

### Armor

Redução de dano

### Move Speed

Velocidade

### Damage

Dano base

### Critical Chance

Chance crítica

### Critical Damage

Multiplicador crítico

### Attack Speed

Velocidade de ataque

### Cooldown Reduction

Redução de recarga

### Pickup Radius

Raio de coleta

### Luck

Influência drops raros

---

# 8. Armas

## Espada Giratória

Orbita o jogador.

### Evolução

Tempestade de Lâminas

---

## Arco

Dispara automaticamente.

### Evolução

Metralhadora Élfica

---

## Bola de Fogo

Explosão em área.

### Evolução

Meteoro Infernal

---

## Raio

Acerta múltiplos alvos.

### Evolução

Tempestade Elétrica

---

## Machado

Lançamento em arco.

### Evolução

Machados Eternos

---

## Foice

Retorna após lançamento.

### Evolução

Ceifador Supremo

---

## Drone

Ataca automaticamente.

### Evolução

Drone Omega

---

## Torreta

Invocação fixa.

### Evolução

Torreta Nuclear

---

## Aura de Gelo

Dano contínuo.

### Evolução

Nevasca Eterna

---

## Laser

Ataque perfurante.

### Evolução

Canhão Quântico

---

# 9. Passivos

## Poder

+10% dano

## Vitalidade

+20 HP

## Agilidade

+10% velocidade

## Precisão

+5% crítico

## Magnetismo

+20% coleta

## Sorte

+15% drops raros

## Armadura

+10% resistência

## Sabedoria

+20% XP

---

# 10. Sistema de Evolução

Armas:

Nível 1 → 8

Passivos:

Nível 1 → 5

Quando uma arma chega ao nível máximo e o passivo correto também está no máximo:

* libera evolução final

---

# 11. Inimigos

## Slime

Vida baixa

Muito comum

---

## Skeleton

Velocidade média

---

## Orc

Muito HP

---

## Spider

Muito rápido

---

## Necromancer

Invoca lacaios

---

## Demon

Elite

---

## Giant

Mini Boss

---

## Dragon

Boss

---

# 12. Bosses

## Goblin King

5 minutos

---

## Infernal Golem

10 minutos

---

## Frost Titan

15 minutos

---

## Shadow Reaper

20 minutos

---

## Ancient Dragon

25 minutos

---

## Void Lord

30 minutos

Boss Final

---

# 13. Mapas

## Forgotten Forest

Mapa inicial

---

## Frozen Wastes

Redução de mobilidade

---

## Desert of Bones

Mais inimigos

---

## Infernal Lands

Dano ambiental

---

## Void Realm

Mapa final

---

# 14. Drops

## XP Orb

Experiência

---

## Heal Orb

Recupera HP

---

## Gold

Moeda permanente

---

## Chest

Contém:

* upgrades
* ouro
* itens raros

---

# 15. Sistema de Raridade

Comum

Cinza

---

Incomum

Verde

---

Raro

Azul

---

Épico

Roxo

---

Lendário

Laranja

---

Mítico

Vermelho

---

# 16. Meta Progressão

Fora da partida.

## Ouro Permanente

Usado para:

* aumentar HP
* dano
* velocidade
* sorte
* XP

---

## Árvore de Talentos

50+ melhorias permanentes.

---

## Desbloqueio de Personagens

Cumprir desafios.

---

# 17. Conquistas

Exemplos:

* Sobreviver 10 minutos
* Matar 1.000 inimigos
* Derrotar Dragon
* Completar partida sem tomar dano
* Evoluir todas as armas

---

# 18. Ranking

## Global

Maior tempo

Maior nível

Maior kill count

---

## Semanal

Reset semanal.

---

# 19. Monetização (Opcional)

Apenas cosméticos.

### Skins

* Knight Dourado
* Mage Arcano
* Samurai
* Cyber Warrior

### Efeitos

* trilhas
* explosões
* animações

Sem pay-to-win.

---

# 20. Roadmap

## Versão 0.1

* Movimento
* XP
* 5 armas
* 20 upgrades
* 1 mapa

## Versão 0.2

* Bosses
* Evoluções

## Versão 0.3

* Meta progressão

## Versão 0.4

* Ranking online

## Versão 1.0

* 5 mapas
* 10 personagens
* 30 armas
* 100+ upgrades
* temporadas
* eventos
