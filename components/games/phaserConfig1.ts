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
    hornPressed = false

    // Mobile controls
    controls = {
      up: false,
      down: false,
      left: false,
      right: false,
      horn: false,
      forksUp: false,
      forksDown: false,
      brake: false
    }
    mobileButtons: { [key: string]: Phaser.GameObjects.Graphics } = {}

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

      // Add mobile controls if on touch device
      const isMobile = this.input.manager.touch
      if (isMobile) {
        this.createMobileControls()
      }

      // Add instructions
      const instructionText = isMobile ? 'Use touch controls below' : 'Use arrow keys, H for horn, F/G for forks, SPACE to brake'
      this.add.text(400, 30, instructionText, {
        fontFamily: 'Inter',
        fontSize: '12px',
        color: '#6b7280'
      }).setOrigin(0.5)

      this.started = true
      this.startTime = this.time.now
    }

    createMobileControls() {
      const buttonSize = 45
      const smallButton = 35
      
      // Driving controls (left side)
      // Left/Right steering
      this.mobileButtons.left = this.add.graphics()
      this.mobileButtons.left.fillStyle(0x374151, 0.8)
      this.mobileButtons.left.fillRoundedRect(20, 350, buttonSize, buttonSize, 8)
      this.mobileButtons.left.lineStyle(2, 0x6b7280)
      this.mobileButtons.left.strokeRoundedRect(20, 350, buttonSize, buttonSize, 8)
      this.mobileButtons.left.setInteractive(new Phaser.Geom.Rectangle(20, 350, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)

      this.mobileButtons.right = this.add.graphics()
      this.mobileButtons.right.fillStyle(0x374151, 0.8)
      this.mobileButtons.right.fillRoundedRect(75, 350, buttonSize, buttonSize, 8)
      this.mobileButtons.right.lineStyle(2, 0x6b7280)
      this.mobileButtons.right.strokeRoundedRect(75, 350, buttonSize, buttonSize, 8)
      this.mobileButtons.right.setInteractive(new Phaser.Geom.Rectangle(75, 350, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)

      // Forward/Reverse (right side)
      this.mobileButtons.up = this.add.graphics()
      this.mobileButtons.up.fillStyle(0x059669, 0.8)
      this.mobileButtons.up.fillRoundedRect(680, 300, buttonSize + 10, buttonSize, 8)
      this.mobileButtons.up.lineStyle(2, 0x047857)
      this.mobileButtons.up.strokeRoundedRect(680, 300, buttonSize + 10, buttonSize, 8)
      this.mobileButtons.up.setInteractive(new Phaser.Geom.Rectangle(680, 300, buttonSize + 10, buttonSize), Phaser.Geom.Rectangle.Contains)

      this.mobileButtons.down = this.add.graphics()
      this.mobileButtons.down.fillStyle(0xdc2626, 0.8)
      this.mobileButtons.down.fillRoundedRect(680, 355, buttonSize + 10, buttonSize, 8)
      this.mobileButtons.down.lineStyle(2, 0xb91c1c)
      this.mobileButtons.down.strokeRoundedRect(680, 355, buttonSize + 10, buttonSize, 8)
      this.mobileButtons.down.setInteractive(new Phaser.Geom.Rectangle(680, 355, buttonSize + 10, buttonSize), Phaser.Geom.Rectangle.Contains)

      // Control buttons (center)
      // Horn button
      this.mobileButtons.horn = this.add.graphics()
      this.mobileButtons.horn.fillStyle(0xf59e0b, 0.8)
      this.mobileButtons.horn.fillRoundedRect(300, 350, smallButton, smallButton, 6)
      this.mobileButtons.horn.lineStyle(2, 0xd97706)
      this.mobileButtons.horn.strokeRoundedRect(300, 350, smallButton, smallButton, 6)
      this.mobileButtons.horn.setInteractive(new Phaser.Geom.Rectangle(300, 350, smallButton, smallButton), Phaser.Geom.Rectangle.Contains)

      // Fork controls
      this.mobileButtons.forksUp = this.add.graphics()
      this.mobileButtons.forksUp.fillStyle(0x8b5cf6, 0.8)
      this.mobileButtons.forksUp.fillRoundedRect(345, 330, smallButton, smallButton, 6)
      this.mobileButtons.forksUp.lineStyle(2, 0x7c3aed)
      this.mobileButtons.forksUp.strokeRoundedRect(345, 330, smallButton, smallButton, 6)
      this.mobileButtons.forksUp.setInteractive(new Phaser.Geom.Rectangle(345, 330, smallButton, smallButton), Phaser.Geom.Rectangle.Contains)

      this.mobileButtons.forksDown = this.add.graphics()
      this.mobileButtons.forksDown.fillStyle(0x8b5cf6, 0.8)
      this.mobileButtons.forksDown.fillRoundedRect(345, 370, smallButton, smallButton, 6)
      this.mobileButtons.forksDown.lineStyle(2, 0x7c3aed)
      this.mobileButtons.forksDown.strokeRoundedRect(345, 370, smallButton, smallButton, 6)
      this.mobileButtons.forksDown.setInteractive(new Phaser.Geom.Rectangle(345, 370, smallButton, smallButton), Phaser.Geom.Rectangle.Contains)

      // Brake button
      this.mobileButtons.brake = this.add.graphics()
      this.mobileButtons.brake.fillStyle(0xef4444, 0.8)
      this.mobileButtons.brake.fillRoundedRect(390, 350, smallButton + 10, smallButton, 6)
      this.mobileButtons.brake.lineStyle(2, 0xdc2626)
      this.mobileButtons.brake.strokeRoundedRect(390, 350, smallButton + 10, smallButton, 6)
      this.mobileButtons.brake.setInteractive(new Phaser.Geom.Rectangle(390, 350, smallButton + 10, smallButton), Phaser.Geom.Rectangle.Contains)

      // Button labels
      this.add.text(42, 372, '⬅', { fontFamily: 'Inter', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(97, 372, '➡', { fontFamily: 'Inter', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(690, 322, '↑', { fontFamily: 'Inter', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(690, 377, '↓', { fontFamily: 'Inter', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(317, 367, '♪', { fontFamily: 'Inter', fontSize: '12px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(362, 347, '↑F', { fontFamily: 'Inter', fontSize: '10px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(362, 387, '↓G', { fontFamily: 'Inter', fontSize: '10px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(405, 367, 'BRAKE', { fontFamily: 'Inter', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5)

      // Touch event handlers
      this.mobileButtons.left.on('pointerdown', () => { this.controls.left = true })
      this.mobileButtons.left.on('pointerup', () => { this.controls.left = false })
      this.mobileButtons.left.on('pointerout', () => { this.controls.left = false })

      this.mobileButtons.right.on('pointerdown', () => { this.controls.right = true })
      this.mobileButtons.right.on('pointerup', () => { this.controls.right = false })
      this.mobileButtons.right.on('pointerout', () => { this.controls.right = false })

      this.mobileButtons.up.on('pointerdown', () => { this.controls.up = true })
      this.mobileButtons.up.on('pointerup', () => { this.controls.up = false })
      this.mobileButtons.up.on('pointerout', () => { this.controls.up = false })

      this.mobileButtons.down.on('pointerdown', () => { this.controls.down = true })
      this.mobileButtons.down.on('pointerup', () => { this.controls.down = false })
      this.mobileButtons.down.on('pointerout', () => { this.controls.down = false })

      this.mobileButtons.horn.on('pointerdown', () => { this.controls.horn = true })
      this.mobileButtons.horn.on('pointerup', () => { this.controls.horn = false })
      this.mobileButtons.horn.on('pointerout', () => { this.controls.horn = false })

      this.mobileButtons.forksUp.on('pointerdown', () => { this.controls.forksUp = true })
      this.mobileButtons.forksUp.on('pointerup', () => { this.controls.forksUp = false })
      this.mobileButtons.forksUp.on('pointerout', () => { this.controls.forksUp = false })

      this.mobileButtons.forksDown.on('pointerdown', () => { this.controls.forksDown = true })
      this.mobileButtons.forksDown.on('pointerup', () => { this.controls.forksDown = false })
      this.mobileButtons.forksDown.on('pointerout', () => { this.controls.forksDown = false })

      this.mobileButtons.brake.on('pointerdown', () => { this.controls.brake = true })
      this.mobileButtons.brake.on('pointerup', () => { this.controls.brake = false })
      this.mobileButtons.brake.on('pointerout', () => { this.controls.brake = false })
    }

    /* ---------- UPDATE LOOP ---------- */
    update() {
      if (!this.started) return
      const speed = 300
      
      // Combine keyboard and touch controls
      const up = (this.cursors?.up.isDown) || this.controls.up
      const down = (this.cursors?.down.isDown) || this.controls.down
      const left = (this.cursors?.left.isDown) || this.controls.left
      const right = (this.cursors?.right.isDown) || this.controls.right
      
      // steering
      if (up) this.physics.velocityFromRotation(this.forklift.rotation, speed, this.forklift.body!.velocity)
      if (down) this.physics.velocityFromRotation(this.forklift.rotation, -speed / 2, this.forklift.body!.velocity)
      if (left) this.forklift.setAngularVelocity(-150)
      else if (right) this.forklift.setAngularVelocity(150)
      else this.forklift.setAngularVelocity(0)

      // speed+turn penalty
      const body = this.forklift.body as Phaser.Physics.Arcade.Body
      if (body && body.speed > 180 && Math.abs(body.angularVelocity) > 0) {
        this.fail('Skidded while turning fast')
      }

      // fork height control (keyboard + touch)
      if ((this.keys.forksUp.isDown || this.controls.forksUp) && this.forks.y > this.forklift.y + 4) {
        this.forks.y -= 0.5
      }
      if ((this.keys.forksDown.isDown || this.controls.forksDown) && this.forks.y < this.forklift.y + 16) {
        this.forks.y += 0.5
      }
      ;(this.forks.body as Phaser.Physics.Arcade.Body).updateFromGameObject() // keep collider

      // horn pressed? (keyboard + touch)
      if (Phaser.Input.Keyboard.JustDown(this.keys.horn) || (this.controls.horn && !this.hornPressed)) {
        this.sound.play('vo_horn')
        this.blind.destroy() // mark hazard cleared
        this.hornPressed = true
      }
      if (!this.controls.horn) {
        this.hornPressed = false
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
      // require full stop inside zone (keyboard + touch)
      const body = this.forklift.body as Phaser.Physics.Arcade.Body
      if ((this.keys.brake.isDown || this.controls.brake) && body && body.speed < 5) {
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