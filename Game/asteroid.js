export class Asteroid {
    constructor(health, sprite, x, y, speed, angleSpeed) {
        this.health = health;
        this.sprite = sprite;
        this.size = {x: 0, y: 0};
        this.x = x; 
        this.y = y;
        this.speed = speed;
        this.angleSpeed = angleSpeed;
        this.rot = 0;
    }

    Explode(particleManager) {
        //Create explosion
        const maxParticles = Math.round(Math.random() * 10 + (5 * this.health));

        for (var i = 0; i < maxParticles; i++) {
            const particleSize = Math.random() * 1.9 + 0.1;
            const shockwaveSize = Math.random() * 2 + 1;
            const particle = { 
                x: this.x + (Math.random() - 0.5) * (this.size.x / 2),
                y: this.y + (Math.random() - 0.5) * (this.size.y / 2)
            };
            const speed = { x: Math.random() * 1.75 + 0.25, y: Math.random() * 1.75 + 0.25 };

            //Spawn Debris
            particleManager.CreateParticle(document.querySelector("#debris" + Math.round(Math.random() * 2)),
                particle.x, particle.y, 
                { x: Math.sign(particle.x - this.x) * speed.x, y: Math.sign(particle.y - this.y) * speed.y },
                Math.random() * 360, Math.random() + 0.5, particleSize, particleSize,
                Math.random() * 50 + 50, Math.random() * 200
            );
            
            //Spawn Shockwaves
            particleManager.CreateParticle(document.querySelector("#titleParticle" + Math.round(Math.random())),
                particle.x, particle.y, 
                { x: Math.sign(particle.x - this.x) * speed.x / 5, y: Math.sign(particle.y - this.y) * speed.y / 5 },
                Math.random() * 360, Math.random() + 0.25, shockwaveSize, shockwaveSize,
                Math.random() * 125 + 125, Math.random() * 100
            );
        }

        //Change the sprite
        this.health --;
        if (this.health >= 1) {
            this.speed *= 0.75;
            this.sprite = document.querySelector("#rock" + this.health);
        }
    }

    Update(c, screenRatio, gameSpeed) {
        //Scale the size according to the screen ratio
        this.size.x = this.sprite.naturalWidth * screenRatio;
        this.size.y = this.sprite.naturalHeight * screenRatio;

        //Draw the asteroid
        this.Draw(c);

        //Move the asteroid
        this.y += (this.speed * gameSpeed / 10) * screenRatio;
        this.rot += this.angleSpeed;
        if (this.rot > 360) this.rot = 0;
        if (this.rot < 0) this.rot = 360;
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