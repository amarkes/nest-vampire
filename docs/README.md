Nome do game: Next-Vampire
Baseado em: Nest of Thorns como parte do evento Crownfall do dota 2

### Frontend

- React + TypeScript
- Tailwind para UI, menus, HUD, cards de upgrade
- Canvas para o jogo em si
- Zustand para estado global
- Vite para projeto

### Jogo

- Player se move com WASD
- Inimigos nascem ao redor da tela
- A cada level game pode escolher uma magia aleatória
- XP e level up
- Tela de escolha de upgrades
- Boss por tempo
- Sistema de waves/dificuldade

> Importante: não recomendo renderizar monstros como <div> do React. Para muitos inimigos na tela, use Canvas. O React fica só para interface.

### Estrutura boa:

src/
  game/
    engine.ts
    loop.ts
    player.ts
    enemy.ts
    weapons.ts
    upgrades.ts
    collision.ts
    spawner.ts
  components/
    GameCanvas.tsx
    HUD.tsx
    UpgradeModal.tsx
    MainMenu.tsx
  stores/
    gameStore.ts

### Stack:

- Vite
- React
- Tailwind
- Zustand

### MVP inicial:

- Tela inicial para escolher 3 herois
- Herói andando
- Inimigos perseguindo
- Ataque automático
- XP dropando
- Level up com 3 upgrades
- Game over
- Timer de sobrevivência
