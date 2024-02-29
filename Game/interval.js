export class Interval {
    constructor(callback, delay) {
        this.callbackStartTime;
        this.remaining = 0;
        this.paused = false;
        this.timerId = null;

        this.callback = callback;
        this.delay = delay;
    }

    Pause() {
        if (!this.paused) {
            this.Clear();
            this.remaining = new Date().getTime() - this.callbackStartTime;
            this.paused = true;
        }
    }

    Resume() {
        if (this.paused) {
            if (this.remaining > 0) {
                setTimeout(() => {
                    this.Run();
                    this.paused = false;
                    this.Start();
                }, this.remaining);
            } else {
                this.paused = false;
                this.Start();
            }
        }
    }

    Clear() {
        clearInterval(this.timerId);
    }

    Start() {
        this.Clear();
        this.timerId = setInterval(() => { this.Run(); }, this.delay);
    }

    Run() {
        this.callbackStartTime = new Date().getTime();
        this.callback();
    }
}

