// EnemyManager.js - For creating and managing enemies
import { WalkerEnemy, JumperEnemy, FlyerEnemy, ShooterEnemy, BossEnemy,
         FlipperEnemy, WalkingShooterEnemy, BigWalkerEnemy, FastWalkerEnemy, 
         ChaserEnemy, RangedAttackEnemy } from './Enemy.js';

class EnemyManager {
  constructor() {
    this.enemies = [];
    this.lastUpdate = performance.now();
  }

  // Create an enemy based on type and position
  createEnemy(type, x, y) {
    let enemy;
    
    switch (type) {
      case 'walker':
        enemy = new WalkerEnemy(x, y);
        break;
      case 'jumper':
        enemy = new JumperEnemy(x, y);
        break;
      case 'flyer':
        enemy = new FlyerEnemy(x, y);
        break;
      case 'shooter':
        enemy = new ShooterEnemy(x, y);
        break;
      case 'boss':
        enemy = new BossEnemy(x, y);
        break;
      case 'flipper':
        enemy = new FlipperEnemy(x, y);
        break;
      case 'walkingshooter':
        enemy = new WalkingShooterEnemy(x, y);
        break;
      case 'bigwalker':
        enemy = new BigWalkerEnemy(x, y);
        break;
      case 'fastwalker':
        enemy = new FastWalkerEnemy(x, y);
        break;
      case 'chaser':
        enemy = new ChaserEnemy(x, y);
        break;
      case 'rangedattack':
        enemy = new RangedAttackEnemy(x, y);
        break;
      default:
        enemy = new WalkerEnemy(x, y); // Default type
    }
    
    this.enemies.push(enemy);
    return enemy;
  }

  // Update all enemies
  update(platforms, player) {
    const currentTime = performance.now();
    const delta = currentTime - this.lastUpdate;
    this.lastUpdate = currentTime;
    
    // Update each enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      try {
        // Update enemy - this should happen in world space, not camera space
        enemy.update(delta, platforms, player);
        
        // Remove inactive enemies
        if (!enemy.isActive) {
          this.enemies.splice(i, 1);
        }
      } catch (error) {
        console.error('Error updating enemy:', error);
      }
    }
  }

  // Draw all enemies - camera is only used for culling, not position translation
  // The camera translation is already applied in game.js
  draw(ctx, camera) {
    // Only draw enemies that are in the camera view
    for (const enemy of this.enemies) {
      if (enemy.x + enemy.width < camera.x || 
          enemy.x > camera.x + camera.width ||
          enemy.y + enemy.height < camera.y || 
          enemy.y > camera.y + camera.height) {
        continue; // Skip if off screen
      }
      
      try {
        // Camera translation is handled in game.js, so we just need to draw
        enemy.draw(ctx, camera);
      } catch (error) {
        console.error('Error drawing enemy:', error);
      }
    }
  }

  // Create a batch of enemies based on a level definition
  createEnemiesFromLevel(levelData) {
    // Clear any existing enemies
    this.enemies = [];
    
    // Create new enemies based on level data
    if (levelData.enemies) {
      for (const enemyDef of levelData.enemies) {
        this.createEnemy(enemyDef.type, enemyDef.x, enemyDef.y);
      }
    }
  }

  // Check if any enemies are touching a given hitbox
  checkCollisions(hitbox) {
    for (const enemy of this.enemies) {
      // Simple AABB collision
      if (hitbox.x + hitbox.width > enemy.x &&
          hitbox.x < enemy.x + enemy.width &&
          hitbox.y + hitbox.height > enemy.y &&
          hitbox.y < enemy.y + enemy.height) {
        return enemy;
      }
    }
    
    return null;
  }

  // Get enemy count by type
  getEnemyCountByType(type) {
    return this.enemies.filter(enemy => 
      (type === 'walker' && enemy instanceof WalkerEnemy) ||
      (type === 'jumper' && enemy instanceof JumperEnemy) ||
      (type === 'flyer' && enemy instanceof FlyerEnemy) ||
      (type === 'shooter' && enemy instanceof ShooterEnemy) ||
      (type === 'boss' && enemy instanceof BossEnemy) ||
      (type === 'flipper' && enemy instanceof FlipperEnemy) ||
      (type === 'walkingshooter' && enemy instanceof WalkingShooterEnemy) ||
      (type === 'bigwalker' && enemy instanceof BigWalkerEnemy) ||
      (type === 'fastwalker' && enemy instanceof FastWalkerEnemy) ||
      (type === 'chaser' && enemy instanceof ChaserEnemy) ||
      (type === 'rangedattack' && enemy instanceof RangedAttackEnemy)
    ).length;
  }

  // Get total enemy count
  getEnemyCount() {
    return this.enemies.length;
  }

  // Remove all enemies
  clearEnemies() {
    this.enemies = [];
  }

  // Hurt all enemies within a certain radius (for explosions, etc.)
  hurtEnemiesInRadius(x, y, radius, damage) {
    for (const enemy of this.enemies) {
      const dx = (enemy.x + enemy.width / 2) - x;
      const dy = (enemy.y + enemy.height / 2) - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        enemy.getHurt(damage);
      }
    }
  }
}

export default EnemyManager;
