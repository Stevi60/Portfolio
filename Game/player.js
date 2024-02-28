import { Interval } from "./interval.js";

export class Player {
    constructor(particleManager) {
        this.sprite = playerSprite;
        this.size = {x: 0, y: 0};
        this.x = game.width / 2; 
        this.y = -this.sprite.naturalHeight * 2;

        this.target = {x: game.width / 2, y: game.height - 125};
        this.playerSpeed = 2;

        this.canShoot = false;
        this.shootRate = 750;
        this.bullets = [];
        this.shootInterval = new Interval(() => { this.Shoot(); }, this.shootRate);

        this.particleManager = particleManager;
        this.trailInterval = new Interval(() => {this.CreateTrail(this.particleManager)}, 20);
    }

    CreateTrail(particleManager) {
        //Create and draw trails
        particleManager.CreateParticle( playerTrail, 
            this.x, this.y + (this.size.y / 2.5), 
            {x: 0, y: particleManager.gameSpeed}, 0, 0,
            1, 0, 30
        );
        
        particleManager.CreateParticle( playerWingTrail, 
            this.x - (this.size.x / 2.5), this.y + (this.size.y / 3), 
            {x: 0, y: particleManager.gameSpeed}, 0, 0,
            1, 0, 100
        );
        particleManager.CreateParticle( playerWingTrail, 
            this.x + (this.size.x / 2.5), this.y + (this.size.y / 3), 
            {x: 0, y: particleManager.gameSpeed}, 0, 0,
            1, 0, 100
        );
    }

    Update(c, screenRatio, gameSpeed, mouseX) {
        //Scale the size according to the screen ratio
        this.target.y = game.height - (100 * screenRatio);
        this.size.x = this.sprite.naturalWidth * screenRatio;
        this.size.y = this.sprite.naturalHeight * screenRatio;

        //Draw the player
        this.Draw(c);

        //Update the bullets
        this.bullets.forEach((bullet, index) => {
            //Destroy out of bounds or invisible particles
            bullet.Update(c, screenRatio, gameSpeed);

            if (bullet.x + (bullet.size.x / 2) < -game.width || bullet.x - (bullet.size.x / 2) > game.width * 2
            ||  bullet.y + (bullet.size.y / 2) < -game.height || bullet.y - (bullet.size.y / 2) > game.height * 2) {
                bullet.trailInterval.Clear();
                this.bullets.splice(index, 1);
            } 
        });

        //Make the player slowly fall down
        if (Math.abs(this.target.y - this.y) >= 30) {
            this.y += (0.0015 * gameSpeed) * (this.target.y - this.y) * screenRatio;

            //Prevent the player from shooting
            this.canShoot = false;
            this.shootInterval.Clear();
        } else {
            //Lock the player's y location
            this.y += (0.0015 * gameSpeed) * (this.target.y - this.y) * screenRatio;
            if (Math.abs(this.target.y - this.y) <= 0.1) this.y = this.target.y;

            //Let the player control the ship
            this.target.x = mouseX;
            if (Math.abs(this.target.x - this.x) >= 0.05) {
                this.x += (0.01 * this.playerSpeed) * (this.target.x - this.x) * screenRatio;
            } else { 
                this.x = this.target.x; 
            }

            //Let the player shoot
            if (!this.canShoot) {
                this.canShoot = true;
                this.shootInterval.Start();
                this.particleManager.CreateParticle( playerShockwave, 
                    this.x, this.y,
                    {x: 0, y: 0}, 0, 30,
                    0.5, 5, 75
                );
            }
        }
    }

    Draw(c) {
        c.drawImage(
            this.sprite, this.x - (this.size.x / 2), 
            this.y - (this.size.y / 2), 
            this.size.x, this.size.y
        );
    }

    Shoot() {
        this.bullets.push(new PlayerBullet(
            playerBullet, this.x, this.y - (this.size.y / 2), 5, this.particleManager
        ));
    }
}

class PlayerBullet {
    constructor(sprite, x, y, speed, particleManager) {
        this.size = {x: 0, y: 0};
        this.speed = speed;
        this.x = x; this.y = y;

        this.sprite = sprite;
        
        this.trailInterval = new Interval(() => {this.CreateTrail(particleManager)}, 15);
        particleManager.CreateParticle( playerBulletExplosion, 
            this.x, this.y,
            {x:0,y:0}, 0, 10,
            0.5, 2.5, 30
        );
    }
    
    CreateTrail(particleManager) {
        //Create and draw trails
        particleManager.CreateParticle( playerBullet, 
            this.x, this.y + (this.size.y / 2), 
            {x: 0, y: 0}, 0, 0,
            1, 1, 20
        );
    }

    Update(c, screenRatio, gameSpeed) {
        //Scale the size according to the screen ratio
        this.size.x = this.sprite.naturalWidth * screenRatio;
        this.size.y = this.sprite.naturalHeight * screenRatio;

        //Draw the bullet
        this.Draw(c);

        //Scroll the bullet
        this.y += -this.speed * (gameSpeed / 3) * screenRatio;
    }

    Draw(c) {
        c.drawImage(
            this.sprite, this.x - (this.size.x / 2), 
            this.y - (this.size.y / 2), 
            this.size.x, this.size.y
        );
    }  
}