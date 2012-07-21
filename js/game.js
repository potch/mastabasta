(function() {
    var WIDTH   = 160,
        HEIGHT  = 200,
        SCALE   = 2,
        running = false,
        kb      = new KeyboardControls(),
        buffer, canvas,
        board,
        viewX = 0, viewY = 0,
        sprite,
        lastTick,
        bufferCtx,
        screenCtx,
        lsSprite = {
            size: 2,
            tileSize: 5,
            types: {},
            data: 'foo.png'
        },
        bullets = new Array(100),
        bulletTick = 0,
        enemies = new Array(20),
        enemiesTick = 0,
        score = 0,
        oscore = 0,
        x, y,
        i, j,
        nx, ny, d, dx, dy, b, e;

    var requestFrame = (function() {
        return window.requestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               function(callback) {
                   setTimeout(callback, 30);
               };
    })();

    function len(x, y) {
        return Math.sqrt(x*x + y*y);
    }
    function dist(x, y, x2, y2) {
        return len(x2-x, y2-y);
    }

    function tick() {
        // move our hero
        nx = x;
        ny = y;
        d = 2;
        dx = 0;
        dy = 0;
        if (kb.keys[kb.LEFT]) {
            nx-=d; dx--;
        }
        if (kb.keys[kb.RIGHT]) {
            nx+=d; dx++;
        }
        if (kb.keys[kb.UP]) {
            ny-=d; dy--;
        }
        if (kb.keys[kb.DOWN]) {
            ny+=d; dy++;
        }

        bulletTick++;
        if (kb.letter('a') && bulletTick > 6) {
            bulletTick = 0;
            spawnBullet(x + 12, y + 12);
            spawnBullet(x + 22, y + 12);
        }

        nx = Math.min(WIDTH-32, Math.max(0, nx))
        ny = Math.min(HEIGHT-32, Math.max(0, ny))
        x = nx;
        y = ny;

        // move our bullets
        for (i=0; i<100; i++) {
            if (bullets[i]) {
                b = bullets[i];
                b[1] += 4;
                if (b[1] > HEIGHT) {
                    bullets[i] = false;
                }
            }
        }

        // spawn enemies maybe
        enemiesTick++;
        if (enemiesTick > 50) {
            enemiesTick = 0;
            spawnEnemy();
        }
        for (i=0; i<20; i++) {
            if (enemies[i]) {
                e = enemies[i];
                e[1] -= 1;
                if (e[1] < -32) {
                    enemies[i] = false;
                }
            }
        }

        // check bullet collisions with enemies
        for (i=0; i<20; i++) {
            if (enemies[i]) {
                e = enemies[i];
                for (j=0; j<100; j++) {
                    if (bullets[j]) {
                        b = bullets[j];
                        if (dist(b[0],b[1]+8,e[0]+16,e[1]+16) < 12) {
                            enemies[i] = false;
                            bullets[j] = false;
                            score += 1;
                        }
                    }
                }
            }
        }
    }

    function spawnBullet(x, y) {
        // find new bullet space
        for (var i=0; i<100; i++) {
            if (!bullets[i]) {
                bullets[i] = [x, y];
                break;
            }
        }
    }

    function spawnEnemy(x, y) {
        for (var i=0; i<20; i++) {
            if (!enemies[i]) {
                enemies[i] = [
                    ~~(Math.random() * (WIDTH-32)),
                    HEIGHT,
                    ~~(Math.random()*2),
                ];
                break;
            }
        }
    }

    function start() {
        running = true;
        lastTick = (new Date()).getTime();
        loop();
    }

    function loop() {
        tick();
        render();
        if (running) {
            requestFrame(loop, canvas);
        }
    }

    function stop() {
        running = false;
    }

    function render() {
        bufferCtx.fillRect(0,0,WIDTH,HEIGHT);

        for (i=0; i<20; i++) {
            if (enemies[i]) {
                e = enemies[i];
                sheet.put(bufferCtx,e[0],e[1],e[2]+1);
            }
        }

        if (score != oscore) {
            oscore = score;
            $('#score').text(score);
        }

        sheet.put(bufferCtx,x,y,0);

        // draw bullets
        bufferCtx.beginPath();
        bufferCtx.strokeStyle = "#4c4";
        for (i=0; i<100; i++) {
            if (bullets[i]) {
                b = bullets[i];
                bufferCtx.moveTo(b[0], b[1]);
                bufferCtx.lineTo(b[0], b[1]+8);
            }
        }
        bufferCtx.stroke();

        screenCtx.drawImage(buffer, 0, 0);
    }

    function init() {
        x = 0;
        y = 0;

        buffer = document.createElement('canvas');
        buffer.width = WIDTH * SCALE;
        buffer.height = HEIGHT * SCALE;

        canvas = document.createElement('canvas');
        canvas.width = WIDTH * SCALE;
        canvas.height = HEIGHT * SCALE;

        sheet = new SpriteSheet(lsSprite.size,
                                lsSprite.tileSize,
                                $('img')[0],
                                lsSprite.types);

        bufferCtx = buffer.getContext('2d');
        bufferCtx.mozImageSmoothingEnabled = false;
        bufferCtx.webkitImageSmoothingEnabled = false;
        bufferCtx.scale(SCALE, SCALE);

        screenCtx = canvas.getContext('2d');
        $("#game").append(canvas);

        start();
    }

    $(function() {
        $('img')[0].onload = init;
        $('img')[0].src = lsSprite.data;
    });
})();