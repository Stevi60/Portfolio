import { Interval } from "./interval.js";

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