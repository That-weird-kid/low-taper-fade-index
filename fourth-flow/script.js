   let gameOver = false;
   let keys = {};
   // Global array to store platform data
   let platforms = [];

   // Maximum health value
   const MAX_HEALTH = 80;

   // Function to generate random platforms at the start of the match
   function generatePlatforms() {
       const gameContainer = document.getElementById("gameContainer");
       const containerWidth = gameContainer.offsetWidth;
       const containerHeight = gameContainer.offsetHeight;
       const numberOfPlatforms = 5; // Adjust the number of platforms as desired
       for (let i = 0; i < numberOfPlatforms; i++) {
           let platform = document.createElement("div");
           platform.classList.add("platform");
           const width = Math.floor(Math.random() * 100) + 100;
           const height = 10;
           platform.style.width = width + "px";
           platform.style.height = height + "px";
           const left = Math.floor(Math.random() * (containerWidth - width));
           const bottom = Math.floor(Math.random() * (containerHeight - 150)) + 50;
           platform.style.left = left + "px";
           platform.style.bottom = bottom + "px";
           gameContainer.appendChild(platform);
           platforms.push({ left, bottom, width, height });
       }
   }

   // Array to store active power-ups
   let powerUps = [];

   const powerUpTypes = [
       { type: "health", healthRestore: 30, color: "green" },
       { type: "speed", speedBoost: 3, color: "blue" },
       { type: "shield", shieldDuration: 3000, color: "yellow" }
   ];
   function spawnPowerUp() {
       const gameContainer = document.getElementById("gameContainer");
       const containerWidth = gameContainer.offsetWidth;
       const containerHeight = gameContainer.offsetHeight;
       let randomIndex = Math.floor(Math.random() * powerUpTypes.length);
       let selectedType = powerUpTypes[randomIndex];
       let powerUp = document.createElement("div");
       powerUp.classList.add("power-up");
       powerUp.style.width = "30px";
       powerUp.style.height = "30px";
       powerUp.style.border = "2px solid white";
       powerUp.style.borderRadius = "50%";
       powerUp.style.position = "absolute";
       powerUp.style.backgroundColor = selectedType.color;
       const left = Math.floor(Math.random() * (containerWidth - 30));
       const bottom = Math.floor(Math.random() * (containerHeight - 30));
       powerUp.style.left = left + "px";
       powerUp.style.bottom = bottom + "px";
       powerUp.effect = selectedType;
       gameContainer.appendChild(powerUp);
       powerUps.push(powerUp);
       setTimeout(() => {
           if (powerUp.parentElement) {
               powerUp.parentElement.removeChild(powerUp);
               powerUps = powerUps.filter(p => p !== powerUp);
           }
       }, 10000);
   }

   class Player {
       constructor(id, startX, keys) {
           this.element = document.getElementById(id);
           this.rangeIndicator = document.getElementById(id + "Range");
           this.x = startX;
           this.y = 0;
           this.speed = 5;
           this.jumpPower = 15;
           this.velocityY = 0;
           this.gravity = -0.6;
           this.grounded = true;
           this.keys = keys;
           this.health = MAX_HEALTH;
           this.lives = 3;
           this.healthBar = document.getElementById(id === "player1" ? "health1" : "health2");
           this.ultimateBar = document.getElementById(id === "player1" ? "ultimate1" : "ultimate2");
           this.livesIndicator = document.getElementById(id === "player1" ? "lives1" : "lives2");
           this.ultimateCharge = 0;
           this.attackCooldown = false;
           this.heavyAttackCooldown = false;
           this.fastAttackCooldown = false;
           this.lastDamageTime = 0;
           this.shieldActive = false;
       }

       moveLeft() {
           if (!gameOver) this.x = Math.max(0, this.x - this.speed);
       }

       moveRight() {
           if (!gameOver) this.x = Math.min(750, this.x + this.speed);
       }

       jump() {
           if (!gameOver && this.grounded) {
               this.velocityY = this.jumpPower;
               this.grounded = false;
           }
       }

       applyGravity() {
           if (!gameOver) {
               let previousY = this.y;
               this.y += this.velocityY;
               this.velocityY += this.gravity;
               if (this.y <= 0) {
                   this.y = 0;
                   this.grounded = true;
                   this.velocityY = 0;
               }
               if (this.velocityY <= 0) {
                   for (let p of platforms) {
                       if (this.x + 50 > p.left && this.x < p.left + p.width) {
                           let platformTop = p.bottom + p.height;
                           if (previousY >= platformTop && this.y < platformTop) {
                               this.y = platformTop;
                               this.grounded = true;
                               this.velocityY = 0;
                           }
                       }
                   }
               }
           }
       }

       takeDamage(amount, attacker) {
           if (this.shieldActive) return;
           if (this.lives <= 0) return;
           this.ultimateCharge = Math.min(100, this.ultimateCharge + 10);
           this.ultimateBar.style.width = this.ultimateCharge + '%';
           this.ultimateBar.style.background = `linear-gradient(to right, rgb(${255 - this.ultimateCharge * 2.5}, ${100 + this.ultimateCharge * 1.5}, 0), gold)`;
           this.ultimateBar.style.backgroundColor = `rgb(${255 - this.ultimateCharge * 2.5}, ${150 + this.ultimateCharge * 1.0}, 0)`;
        
           let currentTime = Date.now();
           if (currentTime - this.lastDamageTime < 500) return;
           this.lastDamageTime = currentTime;
        
           this.health = Math.max(0, this.health - amount);
           this.healthBar.style.width = (this.health / MAX_HEALTH * 100) + "%";
        
           if (this.health <= 0) {
               this.lives--;
               this.livesIndicator.innerText = "Vies: " + this.lives;
            
               this.element.classList.add("fade-away");
               setTimeout(() => {
                   this.element.classList.remove("fade-away");
                   this.element.style.opacity = "1";
               }, 800);
            
               if (this.lives > 0) {
                   this.health = MAX_HEALTH;
                   this.healthBar.style.width = "100%";
               } else {
                   declareWinner(attacker);
               }
           }
       }

       lightAttack(opponent) {
           if (!gameOver && !this.attackCooldown) {
               this.attackCooldown = true;
               this.animateAttack(1.2);
               setTimeout(() => {
                   if (this.collidesWith(opponent)) {
                       opponent.takeDamage(10, this);
                   }
               }, 100);
               setTimeout(() => { this.attackCooldown = false; }, 500);
           }
       }

       heavyAttack(opponent) {
           if (!gameOver && !this.heavyAttackCooldown) {
               this.heavyAttackCooldown = true;
               this.animateAttack(1.5);
               setTimeout(() => {
                   if (this.collidesWith(opponent)) {
                       opponent.takeDamage(30, this);
                   }
               }, 500);
               setTimeout(() => { this.heavyAttackCooldown = false; }, 2000);
           }
       }

       ultraFastAttack(opponent) {
           if (!gameOver && !this.fastAttackCooldown) {
               this.fastAttackCooldown = true;
               this.animateAttack(1.1);
               setTimeout(() => {
                   if (this.collidesWith(opponent, 50)) {
                       opponent.takeDamage(5, this);
                   }
               }, 50);
               setTimeout(() => { this.fastAttackCooldown = false; }, 300);
           }
       }

       useUltimate(opponent) {
           if (this.ultimateCharge >= 100) {
               this.ultimateCharge = 0;
               this.ultimateBar.style.width = "0%";
               const gameContainer = document.getElementById("gameContainer");

               if (this.element.id === "player1") {
                   // New Ultimate for Player 1: Solar Flare
                   // Creates an expanding orange flare that deals heavy damage and slows the opponent
                   let flare = document.createElement("div");
                   flare.classList.add("ultimate-animation-flare");
                   flare.style.left = (this.x + 25 - 30) + "px"; // center flare over player
                   flare.style.bottom = (this.y + 25 - 30) + "px";
                   gameContainer.appendChild(flare);
                   setTimeout(() => { flare.remove(); }, 1000);
                   opponent.takeDamage(80, this);
                   // Slow down opponent temporarily
                   let originalSpeed = opponent.speed;
                   opponent.speed = Math.max(1, opponent.speed - 2);
                   setTimeout(() => { opponent.speed = originalSpeed; }, 2000);
               } else {
                   // New Ultimate for Player 2: Lightning Strike
                   // Creates a lightning bolt effect that deals damage and stuns the opponent
                   let lightning = document.createElement("div");
                   lightning.classList.add("ultimate-animation-lightning");
                   lightning.style.left = (this.x + 25 - 10) + "px";
                   lightning.style.bottom = (this.y + 25 - 50) + "px";
                   gameContainer.appendChild(lightning);
                   setTimeout(() => { lightning.remove(); }, 800);
                   opponent.takeDamage(60, this);
                   // Stun opponent: freeze movement temporarily
                   let originalSpeed = opponent.speed;
                   opponent.speed = 0;
                   setTimeout(() => { opponent.speed = originalSpeed; }, 2000);
               }
           }
       }

       animateAttack(scale = 1.2) {
           this.element.style.transform = `scale(${scale})`;
           setTimeout(() => {
               this.element.style.transform = "scale(1)";
           }, 200);
       }

       collidesWith(opponent, extraRange = 0) {
           let rect1 = this.element.getBoundingClientRect();
           let rect2 = opponent.element.getBoundingClientRect();
           return rect1.right + extraRange > rect2.left &&
                  rect1.left - extraRange < rect2.right &&
                  rect1.bottom > rect2.top &&
                  rect1.top < rect2.bottom;
       }

       updatePosition() {
           this.element.style.left = this.x + "px";
           this.element.style.bottom = this.y + "px";
           this.rangeIndicator.style.left = (this.x - 25) + "px";
           this.rangeIndicator.style.bottom = "-25px";
       }
   }

   function declareWinner(winnerPlayer) {
       gameOver = true;
       let winnerName = winnerPlayer.element.id === "player1" ? "Joueur 1 (Rouge)" : "Joueur 2 (Bleu)";
       document.getElementById("winnerMessage").innerText = winnerName + " a gagné avec " + winnerPlayer.lives + " vies restantes!";
   }

   function checkPowerUpCollection(player) {
       let playerRect = player.element.getBoundingClientRect();
       powerUps.forEach((powerUp, index) => {
           let powerUpRect = powerUp.getBoundingClientRect();
           if (playerRect.right > powerUpRect.left &&
               playerRect.left < powerUpRect.right &&
               playerRect.bottom > powerUpRect.top &&
               playerRect.top < powerUpRect.bottom) {
               switch(powerUp.effect.type) {
                   case "health":
                       player.health = Math.min(MAX_HEALTH, player.health + powerUp.effect.healthRestore);
                       player.healthBar.style.width = (player.health / MAX_HEALTH * 100) + "%";
                       break;
                   case "speed":
                       let originalSpeed = player.speed;
                       player.speed += powerUp.effect.speedBoost;
                       setTimeout(() => {
                           player.speed = originalSpeed;
                       }, 3000);
                       break;
                   case "shield":
                       player.shieldActive = true;
                       player.element.style.boxShadow = "0 0 15px 5px yellow";
                       setTimeout(() => {
                           player.shieldActive = false;
                           player.element.style.boxShadow = "none";
                       }, powerUp.effect.shieldDuration);
                       break;
               }
               if (powerUp.parentElement) {
                   powerUp.parentElement.removeChild(powerUp);
               }
               powerUps.splice(index, 1);
           }
       });
   }

   let player1 = new Player("player1", 100, { left: "a", right: "d", jump: "w", light: "f", heavy: "q", ultraFast: "e" });
   let player2 = new Player("player2", 500, { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp", light: "Shift", heavy: "Enter", ultraFast: "/" });

   document.addEventListener("keydown", (event) => {
       keys[event.key] = true;
   });
   document.addEventListener("keyup", (event) => {
       keys[event.key] = false;
   });


   function increaseUltimateBars() {
       if (!gameOver) {
           player1.ultimateCharge = Math.min(100, player1.ultimateCharge + 0.1);
           player1.ultimateBar.style.width = player1.ultimateCharge + '%';
           player2.ultimateCharge = Math.min(100, player2.ultimateCharge + 0.1);
           player2.ultimateBar.style.width = player2.ultimateCharge + '%';
           setTimeout(increaseUltimateBars, 100);
       }
   }
   increaseUltimateBars();

   function gameLoop() {
       if (!gameOver) {
           if (keys[player1.keys.left]) player1.moveLeft();
           if (keys[player1.keys.right]) player1.moveRight();
           if (keys[player1.keys.jump]) player1.jump();
           if (keys[player1.keys.light]) player1.lightAttack(player2);
           if (keys[player1.keys.heavy]) player1.heavyAttack(player2);
           if (keys[player1.keys.ultraFast]) player1.ultraFastAttack(player2);
           if (keys[player1.keys.heavy] && keys[player1.keys.light]) player1.useUltimate(player2);
           if (keys[player2.keys.left]) player2.moveLeft();
           if (keys[player2.keys.right]) player2.moveRight();
           if (keys[player2.keys.jump]) player2.jump();
           if (keys[player2.keys.light]) player2.lightAttack(player1);
           if (keys[player2.keys.heavy]) player2.heavyAttack(player1);
           if (keys[player2.keys.ultraFast]) player2.ultraFastAttack(player1);
           if (keys[player2.keys.heavy] && keys[player2.keys.light]) player2.useUltimate(player1);
        
           player1.applyGravity();
           player2.applyGravity();
           checkPowerUpCollection(player1);
           checkPowerUpCollection(player2);
           player1.updatePosition();
           player2.updatePosition();
           requestAnimationFrame(gameLoop);
       }
   }
   function run(){
      gameLoop();
  generatePlatforms();
setInterval(spawnPowerUp, 10000);
   }
run()
