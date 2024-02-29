import { Interval } from "./interval.js";

export class Player {
    constructor(particleManager) {
        this.sprite = playerSprite;
        this.size = {x: 0, y: 0};
        this.x = game.width / 2; 
        this.y = -this.sprite.naturalHeight * 2;
        this.angleSpeed = 0;
        this.rot = 0;

        this.target = {x: game.width / 2, y: game.height - 125};
        this.playerSpeed = 2;

        this.isDead = false;
        this.canShoot = false;
        this.shootRate = 500;
        this.bullets = [];
        this.shootInterval = new Interval(() => { this.Shoot(); }, this.shootRate);

        this.particleManager = particleManager;
        this.trailInterval = new Interval(() => {this.CreateTrail(this.particleManager)}, 10);
        this.trailInterval.Start();
    }

    CreateTrail(particleManager) {
        //Create and draw trails
        particleManager.CreateParticle(playerTrail, 
            this.x, this.y + (this.size.y / 2.5), 
            {x: 0, y: particleManager.gameSpeed / 2}, 0, 0,
            1, 0, 30, 0
        );
        
        particleManager.CreateParticle(playerWingTrail, 
            this.x - (this.size.x / 2.5), this.y + (this.size.y / 3), 
            {x: 0, y: particleManager.gameSpeed / 2}, 0, 0,
            1, 0, 100, 0
        );
        particleManager.CreateParticle(playerWingTrail, 
            this.x + (this.size.x / 2.5), this.y + (this.size.y / 3), 
            {x: 0, y: particleManager.gameSpeed / 2}, 0, 0,
            1, 0, 100, 0
        );
    }

    Update(c, screenRatio, gameSpeed, mouseX) {
        //Scale the size according to the screen ratio
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
        if (!this.isDead) {
            this.target.y = game.height - (125 * screenRatio);

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
                    this.particleManager.CreateParticle(playerShockwave, 
                        this.x, this.y,
                        {x: 0, y: 0}, 0, 30,
                        0.5, 5,
                        75, 0
                    );
                }
            }
        } else {
            //Rotate the player
            this.angleSpeed += 0.005;
            this.rot += this.angleSpeed;
            if (this.rot > 360) this.rot = 0;
            if (this.rot < 0) this.rot = 360;

            //Prevent the player from shooting
            this.canShoot = false;
            this.shootInterval.Clear();

            //clear the trails
            this.trailInterval.Clear();

            //Create Explosions
            this.particleManager.CreateParticle(document.querySelector("#titleParticle" + Math.round(Math.random() * 4)),
                this.x + (Math.random() - 0.5) * this.size.x, this.y + (Math.random() - 0.5) * this.size.y,
                { x: 0, y: -Math.random() * 2 }, Math.random() * 360, Math.random() * 5,
                Math.random() * 0.9 + 0.1, Math.random() * 3 + 1, 
                Math.random() * 30 + 30, Math.random() * 100
            );

            this.target.y = game.height + (200 * screenRatio);
            this.y += 0.5 * (this.y / this.target.y) * screenRatio;
            
        }

    }

    Shoot() {
        this.bullets.push(new PlayerBullet(
            playerBullet, this.x, this.y - (this.size.y / 2), 5, this.particleManager
        ));
    }

    Draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rot * (Math.PI / 180));
        c.translate(-this.x, -this.y);
        c.drawImage(
            this.sprite, this.x - (this.size.x / 2), 
            this.y - (this.size.y / 2), 
            this.size.x, this.size.y
        ); 
        c.restore();
    }
}

class PlayerBullet {
    constructor(sprite, x, y, speed, particleManager) {
        this.size = {x: 0, y: 0};
        this.speed = speed;
        this.x = x; this.y = y;

        this.sprite = sprite;
        
        this.trailInterval = new Interval(() => {this.CreateTrail(particleManager)}, 10);
        this.trailInterval.Start();

        particleManager.CreateParticle(playerBulletExplosion, 
            this.x, this.y,
            {x:0,y:0}, 0, 10,
            0.5, 2.5, 
            30, 0
        );
    }
    
    CreateTrail(particleManager) {
        //Create and draw trails
        particleManager.CreateParticle(this.sprite, 
            this.x, this.y + (this.size.y / 2), 
            {x: 0, y: 0}, 0, 0,
            1, 1, 
            20, 0
        );
    }

    Explode(particleManager) {
        //Create explosion
        const maxParticles = Math.round(Math.random() * 15 + 15);

        for (var i = 0; i < maxParticles; i++) {
            const shockwaveSize = Math.random() * 2 + 1;
            const particle = { 
                x: this.x + (Math.random() - 0.5) * (this.size.x / 2),
                y: this.y + (Math.random() - 0.5) * (this.size.y / 2)
            };
            const speed = { x: Math.random() * 0.9 + 0.1, y: Math.random() * 0.9 + 0.1 };
            
            //Spawn Shockwaves
            particleManager.CreateParticle(playerBulletExplosion,
                particle.x, particle.y, 
                { x: Math.sign(particle.x - this.x) * speed.x, y: Math.sign(particle.y - this.y) * speed.y },
                Math.random() * 360, Math.random() + 0.25, shockwaveSize, shockwaveSize,
                Math.random() * 50 + 50, Math.random() * 200
            );
        }
    }

    Update(c, screenRatio, gameSpeed) {
        //Scale the size according to the screen ratio
        this.size.x = this.sprite.naturalWidth * screenRatio;
        this.size.y = this.sprite.naturalHeight * screenRatio;

        //Draw the bullet
        this.Draw(c);

        //Scroll the bullet
        this.y += -this.speed * screenRatio;
    }

    Draw(c) {
        c.drawImage(
            this.sprite, this.x - (this.size.x / 2), 
            this.y - (this.size.y / 2), 
            this.size.x, this.size.y
        );
    }  
}