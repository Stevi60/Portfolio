import { Interval } from "./interval.js";

export class ParticleManager {
    constructor() {
        this.gameSpeed = 0;
        this.particles = [];

        this.timeouts = [];
    }

    CreateParticle(sprite, x, y, speed, startAngle, angleSpeed, startScale, endScale, lifetime, delay) {
        var particle = new Particle(sprite, x, y, speed, startAngle, angleSpeed, startScale, endScale, lifetime, delay);
        this.particles.push(particle);
    }

    Update(c, screenRatio, gameSpeed) {
        this.gameSpeed = gameSpeed;

        //Update the particles
        this.particles.forEach((particle, index) => {
            //Destroy out of bounds or invisible particles
            if (particle.alpha <= 0) this.particles.splice(index, 1);
            else particle.Update(c, screenRatio);

            if (particle.x + (particle.size.x / 2) < 0 || particle.x - (particle.size.x / 2) > game.width
            ||  particle.y + (particle.size.y / 2) < 0 || particle.y - (particle.size.y / 2) > game.height) {
                this.particles.splice(index, 1);
            } 
        });
    }
}

class Particle {
    constructor(sprite, x, y, speed, startAngle, angleSpeed, startScale, endScale, lifetime, delay) {
        this.size = {x: 0, y: 0};
        this.speed = speed;
        this.angleSpeed = angleSpeed;
        this.scale = startScale;
        this.startScale = startScale;
        this.endScale = endScale;
        this.x = x; this.y = y;
        this.rot = startAngle;

        this.alpha = 1;
        this.sprite = sprite;
        this.lifetime = lifetime;

        this.startDate = Date.now();
        this.delay = Date.now() + delay;
    }

    Update(c, screenRatio) {
        if (Date.now() > this.delay) {
            //Scale the size according to the screen ratio
            this.size.x = (this.sprite.naturalWidth * this.scale) * screenRatio;
            this.size.y = (this.sprite.naturalHeight * this.scale) * screenRatio;

            //Draw the particle
            this.Draw(c);

            //Scroll the particle
            this.x += this.speed.x * screenRatio;
            this.y += this.speed.y * screenRatio;
            this.rot += this.angleSpeed
            if (this.rot > 360) this.rot = 0;
            if (this.rot < 0) this.rot = 360;

            //Decrease the alpha to 0
            if (this.alpha > 0)  this.alpha -= 1 / this.lifetime;    
            else this.alpha = 0;
            this.scale = this.startScale + (1 - this.alpha) * (this.endScale - this.startScale);
        }
    }

    Draw(c) {
        c.save();
        c.globalAlpha = this.alpha;
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

