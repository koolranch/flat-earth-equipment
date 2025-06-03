import Phaser from 'phaser'
import { phaserConfig, sendGameComplete } from './phaserBase'

export default function createConfig(parentId = 'phaser-module1') {
  class Module1Scene extends Phaser.Scene {
    forklift!: Phaser.Physics.Arcade.Sprite
    forks!: Phaser.GameObjects.Rectangle
    cones!: Phaser.Physics.Arcade.StaticGroup
    blind!: Phaser.Physics.Arcade.Sprite
    finish!: Phaser.GameObjects.Zone
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    keys!: Record<string, Phaser.Input.Keyboard.Key>
    voice!: Phaser.Sound.BaseSound
    score = 100
    ppeEquipped = 0
    started = false
    startTime = 0

    preload() {
      this.load.image('forklift', '/game/forklift.png')
      this.load.image('cone', '/game/cone.png')
      this.load.image('vest', '/game/ppe_vest.png')
      this.load.image('helmet', '/game/ppe_helmet.png')
      this.load.image('boots', '/game/ppe_boots.png')
      this.load.image('blind', '/game/blind_corner.png')

      this.load.audio('vo_ppe', '/game/audio/vo_ppe.mp3')
      this.load.audio('vo_horn', '/game/audio/vo_horn.mp3')
      this.load.audio('vo_brake', '/game/audio/vo_brake.mp3')
      this.load.audio('vo_finish', '/game/audio/vo_finish.mp3')
    }

    create() {
      /* ---------- PPE GATE ---------- */
      const overlay = this.add.rectangle(400, 225, 800, 450, 0x000000, 0.6)
      const ppeGroup = this.add.group()
      const icons = ['vest', 'helmet', 'boots']
      icons.forEach((key, i) => {
        const icon = this.add
          .image(300 + i * 100, 225, key)
          .setScale(0.8)
          .setInteractive()
        ppeGroup.add(icon)
        icon.on('pointerup', () => {
          icon.setAlpha(0.3)
          this.ppeEquipped++
          if (this.ppeEquipped === icons.length) this.startGame(overlay, ppeGroup)
        })
      })
      this.voice = this.sound.add('vo_ppe', { volume: 1 })
      this.voice.play()

      /* ---------- INPUT ---------- */
      this.cursors = this.input.keyboard!.createCursorKeys()
      this.keys = {
        horn: this.input.keyboard!.addKey('H'),
        forksUp: this.input.keyboard!.addKey('F'),
        forksDown: this.input.keyboard!.addKey('G'),
        brake: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      }
    }

    startGame(overlay: Phaser.GameObjects.Rectangle, ppeGroup: Phaser.GameObjects.Group) {
      overlay.destroy()
      ppeGroup.clear(true, true)
      this.sound.play('vo_ppe', { seek: 1.5 }) // quick "Let's drive!" clip

      /* ---------- PLAYFIELD ---------- */
      this.forklift = this.physics.add
        .sprite(100, 225, 'forklift')
        .setCollideWorldBounds(true)
        .setDrag(300)
        .setMaxVelocity(220)

      // invisible forks rect for height collision
      this.forks = this.add
        .rectangle(this.forklift.x, this.forklift.y + 16, 64, 8, 0xff0000, 0)
      this.physics.add.existing(this.forks)

      this.cones = this.physics.add.staticGroup()
      ;[
        [400, 100],
        [650, 225],
        [400, 350]
      ].forEach(pos => this.cones.create(pos[0], pos[1], 'cone'))

      /* blind corner */
      this.blind = this.physics.add.staticSprite(500, 225, 'blind')
      this.physics.add.overlap(this.forklift, this.blind, () => this.handleHorn(), undefined, this)

      /* finish zone */
      this.finish = this.add.zone(750, 225, 40, 120)
      this.physics.add.existing(this.finish)
      this.physics.add.overlap(this.forklift, this.finish, () => this.handleBrake(), undefined, this)

      /* collisions */
      this.physics.add.collider(this.forks, this.cones, () => this.fail('Hit a cone'))
      this.physics.add.collider(this.forklift, this.cones, () => this.fail('Hit a cone'))

      this.started = true
      this.startTime = this.time.now
    }

    /* ---------- UPDATE LOOP ---------- */
    update() {
      if (!this.started) return
      const speed = 300
      // steering
      if (this.cursors?.up.isDown) this.physics.velocityFromRotation(this.forklift.rotation, speed, this.forklift.body!.velocity)
      if (this.cursors?.down.isDown) this.physics.velocityFromRotation(this.forklift.rotation, -speed / 2, this.forklift.body!.velocity)
      if (this.cursors?.left.isDown) this.forklift.setAngularVelocity(-150)
      else if (this.cursors?.right.isDown) this.forklift.setAngularVelocity(150)
      else this.forklift.setAngularVelocity(0)

      // speed+turn penalty
      const body = this.forklift.body as Phaser.Physics.Arcade.Body
      if (body && body.speed > 180 && Math.abs(body.angularVelocity) > 0) {
        this.fail('Skidded while turning fast')
      }

      // fork height control
      if (this.keys.forksUp.isDown && this.forks.y > this.forklift.y + 4) {
        this.forks.y -= 0.5
      }
      if (this.keys.forksDown.isDown && this.forks.y < this.forklift.y + 16) {
        this.forks.y += 0.5
      }
      ;(this.forks.body as Phaser.Physics.Arcade.Body).updateFromGameObject() // keep collider

      // horn pressed?
      if (Phaser.Input.Keyboard.JustDown(this.keys.horn)) {
        this.sound.play('vo_horn')
        this.blind.destroy() // mark hazard cleared
      }
    }

    /* ---------- EVENT HANDLERS ---------- */
    handleHorn() {
      // if blind still exists and horn not pressed in 2s → penalty
      this.time.delayedCall(2000, () => {
        if (this.blind.active) this.fail('Failed to sound horn')
      })
    }

    handleBrake() {
      this.sound.play('vo_brake')
      // require full stop inside zone
      const body = this.forklift.body as Phaser.Physics.Arcade.Body
      if (this.keys.brake.isDown && body && body.speed < 5) {
        this.success()
      } else {
        this.fail('Did not stop with service brake')
      }
    }

    fail(reason: string) {
      if (!this.started) return
      this.started = false
      this.score -= 20
      this.cameras.main.shake(200, 0.01)
      this.add
        .text(400, 200, `Oops!\n${reason}\nClick to replay`, {
          fontFamily: 'Inter',
          color: '#dc2626',
          align: 'center'
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerup', () => this.scene.restart())
    }

    success() {
      if (!this.started) return
      this.started = false
      const elapsed = (this.time.now - this.startTime) / 1000
      const finalScore = Math.max(this.score - Math.floor(elapsed), 10)
      this.sound.play('vo_finish')
      this.add
        .text(400, 200, `Score ${finalScore}/100\nGreat job!`, {
          fontFamily: 'Inter',
          color: '#16a34a',
          align: 'center'
        })
        .setOrigin(0.5)
      this.time.delayedCall(2000, () => {
        sendGameComplete({ score: finalScore, time: elapsed })
      })
    }
  }

  return phaserConfig(parentId, new Module1Scene())
} 