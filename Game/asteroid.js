import { Interval } from "./interval.js";

export class Asteroid {
    constructor(particleManager, ) {
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
        particleManager.CreateParticle( this.sprite, 
            this.x, this.y + (this.size.y / 2.5), 
            {x: 0, y: 0}, 0, 0,
            1, 0, 30
        );
    }

    Update(c, screenRatio, gameSpeed) {
        //Scale the size according to the screen ratio
        this.size.x = this.sprite.naturalWidth * screenRatio;
        this.size.y = this.sprite.naturalHeight * screenRatio;

        //Draw the asteroid
        this.Draw(c);
    }

    Draw(c) {
        c.drawImage(
            this.sprite, this.x - (this.size.x / 2), 
            this.y - (this.size.y / 2), 
            this.size.x, this.size.y
        );
    }
}