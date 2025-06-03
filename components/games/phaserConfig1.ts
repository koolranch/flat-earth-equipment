import Phaser from 'phaser'
import { sendGameComplete, phaserConfig } from './phaserBase'

export default function createConfig(parentId = 'phaser-module1') {
  class DemoScene extends Phaser.Scene {
    forklift!: Phaser.Physics.Arcade.Sprite
    cones!: Phaser.Physics.Arcade.StaticGroup
    timer!: Phaser.Time.TimerEvent
    finished = false
    startTime = 0
    conesHit = 0
    
    // Mobile controls
    controls = {
      up: false,
      down: false,
      left: false,
      right: false
    }
    mobileButtons: { [key: string]: Phaser.GameObjects.Graphics } = {}

    preload() {
      this.load.image('forklift', '/game/forklift.png')
      this.load.image('cone', '/game/cone.png')
    }

    create() {
      this.startTime = Date.now()
      
      // Create forklift sprite
      this.forklift = this.physics.add.sprite(100, 225, 'forklift')
      this.forklift.setCollideWorldBounds(true).setDrag(300).setMaxVelocity(200)

      // Create cones to navigate through
      this.cones = this.physics.add.staticGroup()
      this.cones.create(400, 100, 'cone')
      this.cones.create(650, 225, 'cone')
      this.cones.create(400, 350, 'cone')

      // Add collision detection - restart on collision
      this.physics.add.collider(this.forklift, this.cones, () => {
        if (!this.finished) {
          this.add.text(400, 150, 'Collision! Restarting...', { 
            fontFamily: 'Inter', 
            fontSize: '24px',
            color: '#ff0000' 
          }).setOrigin(0.5)
          
          this.time.delayedCall(1000, () => {
            this.scene.restart()
          })
        }
      })

      // Timer for 2 minutes (120 seconds)
      this.timer = this.time.delayedCall(120_000, () => this.gameOver(false))

      // Overlap detection for passing through cones
      this.cones.children.iterate((child) => {
        const cone = child as Phaser.Physics.Arcade.Sprite
        this.physics.add.overlap(this.forklift, cone, () => {
          if (!cone.getData('hit')) {
            cone.setData('hit', true)
            cone.setTint(0x00ff00) // Green tint when passed
            this.conesHit++
            
            if (this.conesHit === 3) {
              this.gameOver(true)
            }
          }
        })
        return true
      })

      // Add instructions
      this.add.text(400, 30, 'Navigate through all 3 cones without collision!', {
        fontFamily: 'Inter',
        fontSize: '18px',
        color: '#374151'
      }).setOrigin(0.5)

      // Detect if mobile/touch device
      const isMobile = this.input.manager.touch
      const instructionText = isMobile ? 'Use touch controls below' : 'Use arrow keys to drive'
      
      this.add.text(400, 420, instructionText, {
        fontFamily: 'Inter',
        fontSize: '14px',
        color: '#6b7280'
      }).setOrigin(0.5)

      // Create mobile touch controls if on mobile device
      if (isMobile) {
        this.createMobileControls()
      }
    }

    createMobileControls() {
      const buttonSize = 50
      const buttonSpacing = 10
      const baseY = 370
      
      // Create mobile control buttons
      // Left button
      this.mobileButtons.left = this.add.graphics()
      this.mobileButtons.left.fillStyle(0x374151, 0.7)
      this.mobileButtons.left.fillRoundedRect(50, baseY, buttonSize, buttonSize, 8)
      this.mobileButtons.left.lineStyle(2, 0x6b7280)
      this.mobileButtons.left.strokeRoundedRect(50, baseY, buttonSize, buttonSize, 8)
      this.mobileButtons.left.setInteractive(new Phaser.Geom.Rectangle(50, baseY, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)

      // Right button  
      this.mobileButtons.right = this.add.graphics()
      this.mobileButtons.right.fillStyle(0x374151, 0.7)
      this.mobileButtons.right.fillRoundedRect(110, baseY, buttonSize, buttonSize, 8)
      this.mobileButtons.right.lineStyle(2, 0x6b7280)
      this.mobileButtons.right.strokeRoundedRect(110, baseY, buttonSize, buttonSize, 8)
      this.mobileButtons.right.setInteractive(new Phaser.Geom.Rectangle(110, baseY, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains)

      // Forward button
      this.mobileButtons.up = this.add.graphics()
      this.mobileButtons.up.fillStyle(0x059669, 0.8)
      this.mobileButtons.up.fillRoundedRect(650, baseY - 60, buttonSize + 20, buttonSize, 8)
      this.mobileButtons.up.lineStyle(2, 0x047857)
      this.mobileButtons.up.strokeRoundedRect(650, baseY - 60, buttonSize + 20, buttonSize, 8)
      this.mobileButtons.up.setInteractive(new Phaser.Geom.Rectangle(650, baseY - 60, buttonSize + 20, buttonSize), Phaser.Geom.Rectangle.Contains)

      // Reverse button
      this.mobileButtons.down = this.add.graphics()
      this.mobileButtons.down.fillStyle(0xdc2626, 0.8)
      this.mobileButtons.down.fillRoundedRect(650, baseY, buttonSize + 20, buttonSize, 8)
      this.mobileButtons.down.lineStyle(2, 0xb91c1c)
      this.mobileButtons.down.strokeRoundedRect(650, baseY, buttonSize + 20, buttonSize, 8)
      this.mobileButtons.down.setInteractive(new Phaser.Geom.Rectangle(650, baseY, buttonSize + 20, buttonSize), Phaser.Geom.Rectangle.Contains)

      // Add button labels
      this.add.text(75, baseY + 25, '⬅', { fontFamily: 'Inter', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(135, baseY + 25, '➡', { fontFamily: 'Inter', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(660, baseY - 35, 'Forward', { fontFamily: 'Inter', fontSize: '12px', color: '#ffffff' }).setOrigin(0.5)
      this.add.text(660, baseY + 25, 'Reverse', { fontFamily: 'Inter', fontSize: '12px', color: '#ffffff' }).setOrigin(0.5)

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
    }

    update() {
      if (this.finished) return

      // Get keyboard input
      const cursors = this.input.keyboard?.createCursorKeys()
      if (!this.forklift.body) return

      const speed = 300
      const body = this.forklift.body as Phaser.Physics.Arcade.Body
      
      // Combine keyboard and touch controls
      const up = (cursors?.up.isDown) || this.controls.up
      const down = (cursors?.down.isDown) || this.controls.down
      const left = (cursors?.left.isDown) || this.controls.left
      const right = (cursors?.right.isDown) || this.controls.right
      
      if (up) {
        this.physics.velocityFromRotation(this.forklift.rotation, speed, body.velocity)
      }
      if (down) {
        this.physics.velocityFromRotation(this.forklift.rotation, -speed / 2, body.velocity)
      }
      if (left) {
        this.forklift.setAngularVelocity(-150)
      } else if (right) {
        this.forklift.setAngularVelocity(150)
      } else {
        this.forklift.setAngularVelocity(0)
      }

      // Update timer display
      const elapsed = Date.now() - this.startTime
      const remaining = Math.max(0, 120000 - elapsed)
      const seconds = Math.ceil(remaining / 1000)
      
      // Clear previous timer text
      const existingTimer = this.children.getByName('timer')
      if (existingTimer) {
        existingTimer.destroy()
      }
      this.add.text(700, 30, `Time: ${seconds}s`, {
        fontFamily: 'Inter',
        fontSize: '16px',
        color: '#374151'
      }).setName('timer')
    }

    gameOver(passed: boolean) {
      this.finished = true
      this.timer.destroy()
      
      if (passed) {
        const elapsed = Date.now() - this.startTime
        this.add.text(400, 225, 'Success! Well done!', { 
          fontFamily: 'Inter', 
          fontSize: '32px',
          color: '#10b981' 
        }).setOrigin(0.5)
        
        // Send completion event
        sendGameComplete({ score: 100, time: elapsed })
      } else {
        this.add.text(400, 225, 'Time up! Reload to retry.', { 
          fontFamily: 'Inter', 
          fontSize: '24px',
          color: '#ef4444' 
        }).setOrigin(0.5)
      }
    }
  }

  return phaserConfig(parentId, new DemoScene())
} 