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

    //Change the canvas according to the window screen
    window.addEventListener('resize', () => {   
        game.width = window.innerWidth;
        game.height = window.innerHeight - 50;
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
        backX += -scrollSpeed;
        backY += scrollSpeed;

        if (Math.abs(backX) >= 1526) backX = 0;
        if (Math.abs(backY) >= 1526) backY = 0;

        if (Math.abs(targetRotation - rotation) >= 0.1) 
            rotation += Math.sign(targetRotation - rotation) * 0.45;
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
    var screenRatio = (game.height / 640);
    var particleManager = new ParticleManager();
    var player = null;

    //create Asteroids
    var asteroids = [];

    //Update the canvas
    function Update() { 
        requestAnimationFrame(Update);

        //Clear the canvas after every frame
        c.clearRect(0, 0, game.width, game.height);

        if (visible) {
            //Resume the intervals
            if (gameState === 2) {
                gameState = 3;
                player = new Player(particleManager);

                
                var asteroidInterval = new Interval(
                    function() { 
                        var health = Math.round(Math.random() * 2 + 1);
                        asteroids.push(new Asteroid(
                            health, document.querySelector("#rock" + health),
                            Math.random() * game.width, -500, Math.random() * (5 / health) + 1, 
                            Math.random() 
                        )) 
                    }, 10000 / gameSpeed
                );  asteroidInterval.Start();
                
                player.shootInterval.Start();
                player.trailInterval.Start();
                player.bullets.forEach((bullet) => {
                    bullet.trailInterval.Start();
                });
            }
            
            if (gameState === 3) {
                //Update the player
                player.Update(c, screenRatio, gameSpeed, mouseX);

                //Update Particles
                particleManager.Update(c, screenRatio, gameSpeed);
                
                //Update the asteroids
                asteroids.forEach((asteroid, index) => {
                    asteroid.Update(c, screenRatio, gameSpeed);

                    if (asteroid.y - (asteroid.size.y / 2) > game.height * 2) {
                        asteroid.trailInterval.Clear();
                        this.asteroids.splice(index, 1);
                    }
                });
            }
        } else {
            if (gameState > 0) StopGame();
        }
    } 
    
    Update();

    function StopGame() {
        gameState = 0;

        //Rotate the background back
        IsOnScreen();

        if (player != null || player != undefined) {
            player.shootInterval.Clear();
            player.trailInterval.Clear();

            player.bullets.forEach((bullet) => { bullet.trailInterval.Clear(); });
            player.bullets.splice(0, player.bullets.length);
            particleManager.particles.splice(0, particleManager.particles.length);

            player = null;
        }

        //Show the header
        document.querySelectorAll(".game_title h1")[0].classList.remove("reverse");
        document.querySelectorAll(".game_title p")[0].classList.remove("reverse");
        document.querySelectorAll(".game_title h1")[1].classList.remove("reverse");
        document.querySelectorAll(".game_title p")[1].classList.remove("reverse");

        header_logo.classList.remove("ship");
        header_logo.classList.add("not_ship");
    }

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

                    header_logo.classList.remove("not_ship");
                    header_logo.classList.add("ship");

                    //Start the game
                    setTimeout(function() { gameState = 2; }, 4000);
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

