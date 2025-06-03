import Phaser from 'phaser'

export interface GameCompletePayload { 
  score: number
  time: number 
}

export const sendGameComplete = (payload: GameCompletePayload) => {
  window.dispatchEvent(new CustomEvent('GameComplete', { detail: payload }))
}

export function phaserConfig(
  parent: string,
  scene: Phaser.Scene
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 450,
    backgroundColor: '#f3f4f6', // gray-100 to match Tailwind
    scene,
    physics: { default: 'arcade', arcade: { debug: false } },
    input: {
      touch: true,
      mouse: true
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 450
    },
    dom: {
      createContainer: true
    }
  }
} 