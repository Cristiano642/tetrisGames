// Seleciona o canvas e define o contexto para 2D
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
// Seleciona os botões de controle
const controls = document.querySelectorAll(".controls i");

// Seleciona o canvas e define o contexto para 2D
context.scale(20, 20);

// Função que varre a arena e remove as linhas completamente preenchidas
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        // Se a linha estiver completamente preenchida, remove-a e adiciona uma nova linha vazia na parte superior
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        // Atualiza a pontuação do jogador
        player.score += rowCount * 10;
                clearedLines += rowCount;

        // Aumenta a velocidade de queda após cada linha limpa
            dropInterval = baseDropInterval / Math.pow(1.2, clearedLines);
    }
}

// Verifica se há colisões entre o jogador e a arena
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
        // Verifica se alguma célula da matriz do jogador está ocupada pela arena
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
// Cria uma matriz com as dimensões especificadas
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
// Cria uma peça com o tipo especificado
function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}
// Desenha uma matriz na tela usando um deslocamento
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}
 // Limpa o canvas e desenha a arena e a peça atual
function draw() {
    context.fillStyle = 'rgba(0,0,0,1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}
 // Move a peça atual para baixo e une-a na arena se colidir
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        checkHighScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}
   // Reseta a posição da peça atual e seleciona uma nova aleatoriamente
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
        dropInterval = baseDropInterval;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

const baseDropInterval = 1000;
let dropCounter = 0;
let clearedLines = 0;
let dropInterval = baseDropInterval;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

let highScore = 0;

// Verifica se já existe um highScore salvo no localStorage
if (localStorage.getItem("highScore")) {
 highScore = localStorage.getItem("highScore");
}

// Atualiza a pontuação e o highScore na tela
function updateScore() {
 document.getElementById('score').innerText = `Score: ${player.score}`;
 document.getElementById('highScore').innerText = `High Score: ${highScore}`;
}

// Verifica se o jogador bateu o highScore
function checkHighScore() {
 if (player.score > highScore) {
 highScore = player.score;
 localStorage.setItem("highScore", highScore);
 }
}

controls.forEach(button => button.addEventListener("click", () => changeDirection
    ({ key: button.dataset.key })));

const changeDirection = e => {
    switch (e.key) {
        case "ArrowUp":
            playerRotate(-1);
            break;
        case "ArrowDown":
            playerDrop();
            break;
        case "ArrowLeft":
            playerMove(-1);
            break;
        case "ArrowRight":
            playerMove(1);
            break;
    }
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate(-1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

var musica = document.getElementById("musica");
musica.loop = true; 
function togglePlay() {
  if (musica.paused) {
    musica.play();
  } else {
    musica.pause();
  }
}

playerReset();
updateScore();
update();
