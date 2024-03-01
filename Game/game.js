import { Player } from "./player.js";
import { Asteroid } from "./asteroid.js";
import { ParticleManager } from "./particle.js";
import { Interval } from "./interval.js";

window.addEventListener('load', () => {
    var eventName;
    var visible = true;

    //Initialize Game canvas
    const c = game.getContext('2d');
    game.width = window.innerWidth;
    game.height = window.innerHeight - 50;

    //Screen ratios
    var screenRatio = game.height / 640;
    var screenWidthRatio = game.width / 1138;

    //Change the canvas according to the window screen
    window.addEventListener('resize', () => {   
        game.width = window.innerWidth;
        game.height = window.innerHeight - 50;
        screenRatio = game.height / 640;
        screenWidthRatio = game.width / 1138;
    });

    //Record the coordinates of the mouse
    var mouseX = game.width / 2;
    window.addEventListener('mousemove', function(event) {
        if (visible) mouseX = event.x;
    });
    window.addEventListener('touchmove', function(event) {
        if (visible) mouseX = event.changedTouches[0].clientX;
    });

    //Initialize variables
    var lastFrame = performance.now();
    var updateFrames = [];
    var fps = 0;
    var deltaTime = 0;

    var gameState = 0;
    var clicks = 0;
    var gameSpeed = 5;

    var backX = 0;
    var backY = 0;
    var rotation = 0;
    var targetRotation = 0;
    var scrollSpeed = 0;
    var targetSpeed = 0.25;

    //Check if the window is still on screen
    function IsOnScreen() {
        var gameTop = $('#game').offset().top;
        var gameBottom = gameTop + $('#game').height();
        
        if (gameBottom > 100 &&  gameTop < $(window).height() - 100 && gameState > 0) { visible = true; } 
        else { visible = false; }
        RotateBackground();
    }

    function RotateBackground() {
        if (visible) { targetRotation = -45; targetSpeed = gameSpeed / 4; }
        else { targetRotation = 0; targetSpeed = 0.25; }
    }

    document.body.addEventListener("scroll", IsOnScreen);
    IsOnScreen();

    //Animate the background
    function UpdateBackground() {
        //Calculate frameRate
        if (visible) {
            var newFrame = performance.now();
            deltaTime = (newFrame - lastFrame) / 10;
            lastFrame = newFrame;
            updateFrames.push(deltaTime);
            if (updateFrames.length > 10) updateFrames.splice(0, 1);

            var totalDelta = 0;
            updateFrames.forEach((frame) => { totalDelta += frame; });
            fps = 1000 / (totalDelta / updateFrames.length);
        } else {
            lastFrame = performance.now();
        }


        //Scroll the background
        if (visible) {
            backX += -scrollSpeed * deltaTime;
            backY += scrollSpeed * deltaTime;            
        } else {
            backX += -scrollSpeed;
            backY += scrollSpeed;    
        }

        if (Math.abs(backX) >= 1526) backX = 0;
        if (Math.abs(backY) >= 1526) backY = 0;

        if (Math.abs(targetRotation - rotation) >= 0.1) 
            rotation += (Math.sign(targetRotation - rotation) * 0.45) * deltaTime;
        else rotation = targetRotation;

        if (scrollSpeed != targetSpeed) scrollSpeed += Math.sign(targetSpeed - scrollSpeed) * 0.1;

        $('.background').css({
            "transform": "rotate(" + rotation + "deg)",
            "background-position-x": backX + "px",
            "background-position-y": backY + "px"
        });

        requestAnimationFrame(UpdateBackground);
    } UpdateBackground();

    //-------------------------------------------------------------
    //-------------------------------------------------------------
    //-------------------------------------------------------------

    //Initialize variables

    var scoreText = game_score.innerHTML;
    var levelTextEn = game_levelEn.innerHTML;
    var levelTextFr = game_levelFr.innerHTML;

    var score = 0;
    var particleManager = new ParticleManager();
    var player = null;

    //create Asteroids
    var asteroids = [];
    var asteroidInterval = new Interval(
        function() { 
            for (var i = 0; i < Math.round(Math.random() * (gameSpeed / 5) + 1); i++) {
                var health = Math.round(Math.random() * 2 + 1);

                asteroids.push(new Asteroid(
                    health, document.querySelector("#rock" + health),
                    Math.random() * game.width, -document.querySelector("#rock" + health).naturalHeight, 
                    Math.random() * (5 / health) + 0.5, Math.random() / (health / 2)
                ));
                console.log("New!");
            }
            
        }, 0
    );

    //Increase the speed of the game
    var gameStartTimeout;
    var gameInterval = new Interval(
        function() { 
            gameSpeed += 0.05;
            RotateBackground();

            //Add score
            score += Math.round(gameSpeed * 2);
        }, 750
    );

    //Update the canvas
    function Update() { 
        requestAnimationFrame(Update);

        //Update the game info
        game_score.innerHTML = scoreText + score;
        game_levelEn.innerHTML = levelTextEn + Math.round(gameSpeed / 5);
        game_levelFr.innerHTML = levelTextFr + Math.round(gameSpeed / 5);

        //Clear the canvas after every frame
        c.clearRect(0, 0, game.width, game.height);

        //change the spawn time according to the size of the screen
        asteroidInterval.delay = (10000  / screenWidthRatio) / gameSpeed;

        if (visible) {
            //Resume the intervals
            if (gameState === 2) {
                gameState = 3;
                player = new Player(particleManager);

                asteroidInterval.Start();
                gameInterval.Start();
            }
            
            if (gameState === 3) {
                //Update the player
                player.Update(c, deltaTime, screenRatio, gameSpeed, mouseX);

                //Handle player death
                if (player.isDead && Math.abs(player.target.y - player.y) < 10) {
                    StopGame();
                }
                
                //Update the asteroids
                asteroids.forEach((asteroid, index) => {
                    if (asteroid.y - (asteroid.size.y / 2) > game.height) {
                        asteroids.splice(index, 1);
                    } else {
                        asteroid.Update(c, deltaTime, screenRatio, gameSpeed);
                    }

                    //Collide with the player
                    if (!player.isDead && Math.abs(player.x - asteroid.x) < asteroid.size.x / 1.5
                    &&  Math.abs(player.y - asteroid.y) < asteroid.size.y / 1.75) {
                        //Destroy player
                        player.isDead = true;

                        //Stop counting the score
                        asteroidInterval.Clear();
                        gameInterval.Clear();

                        //Explode asteroid
                        asteroid.Explode(particleManager);
                        if (asteroid.health < 1) asteroids.splice(index, 1);
                    }

                    //Collide with bullets
                    player.bullets.forEach((bullet, bulletIndex) => {
                        if (Math.abs(bullet.x - asteroid.x) < asteroid.size.x / 2
                        &&  Math.abs(bullet.y - asteroid.y) < asteroid.size.y / 2) {
                            //Destroy bullet
                            bullet.Explode(particleManager);
                            bullet.trailInterval.Clear();
                            player.bullets.splice(bulletIndex, 1); 

                            //Explode asteroid
                            asteroid.Explode(particleManager);
                            if (asteroid.health < 1) asteroids.splice(index, 1);

                            //Add to score
                            score += 100 * Math.round(gameSpeed / 5);
                        }
                    });
                });

                //Update Particles
                particleManager.Update(c, deltaTime, screenRatio, gameSpeed);
            }
        } else {
            clearTimeout(gameStartTimeout);
            if (gameState > 0) StopGame();
        }
    } 
    
    Update();

    function StopGame() {
        clearTimeout(gameStartTimeout);
        gameState = 0;
        gameSpeed = 5;

        score = 0;

        //Rotate the background back
        IsOnScreen();

        if (player != null || player != undefined) {
            player.shootInterval.Clear();
            player.trailInterval.Clear();
            
            asteroidInterval.Clear();
            gameInterval.Clear();

            player.bullets.forEach((bullet) => { bullet.trailInterval.Clear(); });
            player.bullets.splice(0, player.bullets.length);
            asteroids.splice(0, asteroids.length);

            particleManager.timeouts.forEach((timeout) => { clearTimeout(timeout); });
            particleManager.timeouts.splice(0, particleManager.timeouts.length);
            particleManager.particles.splice(0, particleManager.particles.length);

            player = null;
        }

        //Show the header
        document.querySelectorAll(".game_title h1")[0].classList.remove("reverse");
        document.querySelectorAll(".game_title p")[0].classList.remove("reverse");
        document.querySelectorAll(".game_title h1")[1].classList.remove("reverse");
        document.querySelectorAll(".game_title p")[1].classList.remove("reverse");
        
        document.querySelectorAll(".game_info div").forEach((element) => {
            element.classList.add("reverse");
        });

        header_logo.classList.remove("ship");
        header_logo.classList.add("not_ship");
    } StopGame();

    //Check when the window is focused or not to prevent lag
    var propName = "hidden";
    if (propName in document) eventName = "visibilitychange";
    else if ((propName = "msHidden") in document) eventName = "msvisibilitychange";
    else if ((propName = "mozHidden") in document) eventName = "mozvisibilitychange";
    else if ((propName = "webkitHidden") in document) eventName = "webkitvisibilitychange";
    if (eventName) document.addEventListener(eventName, handleChange);

    if ("onfocusin" in document) document.onfocusin = document.onfocusout = handleChange; //IE 9
    window.onpageshow = window.onpagehide = window.onfocus = window.onblur = handleChange;// Changing tab with alt+tab

    // Initialize state if Page Visibility API is supported
    if (document[propName] !== undefined) handleChange({ type: document[propName] ? "blur" : "focus" });

    function handleChange(evt) {
        evt = evt || window.event;
        
        if (visible && (["blur", "focusout", "pagehide"].includes(evt.type) || (this && this[propName]))){
            visible = false;
            StopGame();
        } else if (!visible && (["focus", "focusin", "pageshow"].includes(evt.type) || (this && !this[propName]))){
            setTimeout(() => { visible = true; }, 200);
        }
    }

    
    //Create particles when clicking on the logo
    if (document.body.animate) {
        //Reset the click count when the player doesn't click after a while
        var clickTimeout = new Interval(
            function() { 
                clicks = 0; 
                clickTimeout.Clear();
            }, 2000
        );

        clickTimeout.Clear();

        //Spawn the exploding particles
        header_logo.addEventListener("mousedown",function(event) {
            if (header_logo.classList.contains("not_ship")) {
                //Start the click reset timer when clicking
                clickTimeout.Start();

                clicks ++;
                if (clicks > 1) { 
                    //Clear the reset timer when there are enough clicks
                    clickTimeout.Clear(); 
                    clicks = 0;

                    //Rotate the background
                    gameState = 1;
                    RotateBackground();
                    IsOnScreen();

                    //Hide the header
                    document.querySelectorAll(".game_title h1")[0].classList.add("reverse");
                    document.querySelectorAll(".game_title p")[0].classList.add("reverse");
                    document.querySelectorAll(".game_title h1")[1].classList.add("reverse");
                    document.querySelectorAll(".game_title p")[1].classList.add("reverse");

                    document.querySelectorAll(".game_info div").forEach((element) => {
                        element.classList.remove("reverse");
                    });

                    header_logo.classList.remove("not_ship");
                    header_logo.classList.add("ship");

                    //Start the game
                    gameStartTimeout = setTimeout(function() { gameState = 2; }, 4000);
                }

                if (header_logo.classList.contains("not_ship")) {
                    const maxParticles = Math.round(Math.random() * 10 + 10);
                    for (var i = 0; i < maxParticles; i++) {
                        const position = {
                            x: header_logo.getBoundingClientRect().x + (header_logo.getBoundingClientRect().width / 2),
                            y: header_logo.getBoundingClientRect().y + (header_logo.getBoundingClientRect().height / 2),
                        }; CreateParticle(position.x, position.y, Math.round(Math.random() * 4 + 2), 8);
                    }
                } else if (header_logo.classList.contains("ship")) {
                    const maxParticles = Math.round(Math.random() * 20 + 20);
                    for (var i = 0; i < maxParticles; i++) {
                        const position = {
                            x: header_logo.getBoundingClientRect().x + (header_logo.getBoundingClientRect().width / 2),
                            y: header_logo.getBoundingClientRect().y + (header_logo.getBoundingClientRect().height / 2),
                        }; CreateParticle(position.x, position.y, Math.round(Math.random() * 6 + 4), 12);
                    }  
                }
            }
        });
        

        //Create Particles
        function CreateParticle(x, y, size, speed) {
            const particle = document.createElement('particle');
            document.body.appendChild(particle);

            
            particle.style.width = `${size}rem`;
            particle.style.height = `${size}rem`;
            particle.style.background = `url('Game/Sprites/titleParticle${Math.round(Math.random() * 4)}.png')`;
            particle.style.backgroundSize = "cover";

            const finalPos = { 
                x: ((Math.random() - 0.5) * 2) * speed, 
                y: ((Math.random() - 0.5) * 2) * speed 
            };

            const animation = particle.animate(
                //Keyframes
                [
                    //Keyframe 0
                    {
                        transform: `translate(calc(${x}px - ${size / 2}rem), calc(${y}px - ${size / 2}rem))`,
                        opacity: 1
                    },
                    //Keyframe 1
                    { opacity: 1 },
                    //Keyframe 2
                    {
                        transform: `translate(
                            calc((${x}px - ${size / 2}rem) + ${finalPos.x}rem), 
                            calc((${y}px - ${size / 2}rem) + ${finalPos.y}rem)
                        )`,
                        opacity: 0
                    },
                ],
                //Timing properties
                {
                    duration: 500 + Math.random() * 1500,
                    easing: 'cubic-bezier(0, .9, .57, 1)',
                    delay: Math.random() * 150
                }
            );

            animation.onfinish = () => { particle.remove(); };
        }
    }
});

