# Mobile Game Controls

## How Mobile Users Play the Forklift Game

The Phaser forklift driving game now includes full mobile support with touch controls that automatically appear when the game detects a mobile device.

### Mobile Control Layout

**Left Side (Steering):**
- ⬅ **Left Button** - Turn forklift left
- ➡ **Right Button** - Turn forklift right

**Right Side (Movement):**
- 🟢 **Forward Button** - Drive forward
- 🔴 **Reverse Button** - Drive backward

### How It Works

1. **Auto-Detection**: The game automatically detects mobile devices and shows touch controls
2. **Touch & Hold**: Players tap and hold buttons to control the forklift
3. **Visual Feedback**: Buttons change appearance when pressed
4. **Responsive Design**: Controls scale appropriately on different screen sizes

### Desktop vs Mobile

- **Desktop**: Arrow keys + optional touch controls
- **Mobile**: Touch controls only (keyboard hidden)
- **Tablet**: Both touch and keyboard work

### Technical Features

- **Touch Events**: Uses `pointerdown`, `pointerup`, and `pointerout` for reliable touch handling
- **Mobile Viewport**: Optimized scaling with `Phaser.Scale.FIT`
- **Touch Action**: CSS `touch-action: manipulation` for better responsiveness
- **No Text Selection**: `touch-none select-none` classes prevent interference

### Game Mechanics Remain the Same

- Navigate through 3 cones without collision
- Complete within 120 seconds
- Same physics and collision detection
- Same success/failure conditions 