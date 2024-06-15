await new Promise(function (resolve) {
    const images = ['/image/BG.png',
        '/image/treasure-map.png',
        '/image/treasure-chest.png',
        '/image/tile/1.png',
        '/image/tile/2.png',
        '/image/tile/3.png',
        ...Array(10).fill('/image/character')
            .flatMap((value, index) => [
                `${value}/Jump__00${index}.png`,
                `${value}/Run__00${index}.png`,
                `${value}/Idle__00${index}.png`,
            ]),
        ...Array(8).fill('/image/enemy/zombiefiles/png/male')
            .flatMap((value, index) => [
                `${value}/Attack (${index + 1}).png`
            ]),
        ...Array(10).fill('/image/enemy/ninja/png')
            .flatMap((value, index) => [
                `${value}/Attack__00${index}.png`
            ]),
        ...Array(10).fill('/image/enemy/jackfree/png')
            .flatMap((value, index) => [
                `${value}/Walk (${index + 1}).png`
            ])

    ];

    for (const image of images) {
        const img = new Image();
        img.src = image;
        img.addEventListener('load', progress);
    }

    const barElm = document.getElementById('bar');
    const totalNoOfImages = images.length;

    function progress() {
        images.pop();/* remove array elements one by one*/
        barElm.style.width = `${(totalNoOfImages - images.length) / totalNoOfImages * 100}%`;
        if (!images.length) {
            /* disappear after completing progress bar */
            setTimeout(function () {
                document.getElementById('overlay').classList.add('hide');
                resolve();/* resolve after array is emptied ( all images are loaded )*/
            }, 1000);
        }
    }
});


const startBtnElm = document.getElementById('start-button');
const gameNameContainerElm = document.getElementById('game-name-container');
const startBtnContainer = document.getElementById('start-button-container');
/*after clicking start button*/
startBtnElm.addEventListener('click', () => {
    /*hide game name and start button*/
    gameNameContainerElm.classList.add('hide');
    startBtnContainer.classList.add('hide');
    startBtnContainer.classList.remove('animate__animated');
    treasureChestAppear();
    enemyStart();
});


const characterElm = document.querySelector('#character');
const enemyElm = document.getElementById('enemy-div');
const treasureChestElm = document.getElementById('treasure-chest-div');

let dx = 0; //run
let i = 0; //rendering
let enemyK = 0; //render enemy
let enemyDx = 10;
let run = false;
let jump = false;
let angle = 0;
let tmrForJump;
let tmrForRun;
let renderTmr;
let collisionTmr;
let enemyMoveTmr;
let winTmr;
let t = 0;
let previousTouch;

//rendering
/* to change the background image of character div */
renderTmr = setInterval(() => {
    if (jump) {
        /*add jump images and change in interval when jumping*/
        characterElm.style.backgroundImage = `url(/image/character/Jump__00${i++}.png)`;
        if (i === 10) i = 0;
    } else {
        if (!run) {
            /*add idle images and change in interval when not running*/
            characterElm.style.backgroundImage = `url(/image/character/Idle__00${i++}.png)`;
            if (i === 10) i = 0;
        } else {
            /*add run images and change in interval when running*/
            characterElm.style.backgroundImage = `url(/image/character/Run__00${i++}.png)`;
            if (i === 10) i = 0;
        }
    }

    //enemy render
    enemyElm.style.backgroundImage = `url(/image/enemy/ninja/png/Attack__00${enemyK++}.png)`;
    if (enemyK === 10) enemyK = 0;

}, 1000 / 30); /* 30 frames per second */


/* this is to drop from the top initially */
const dropTimer = setInterval(() => {
    /*change top value with time*/
    const top = characterElm.offsetTop + (t++ * 3);
    characterElm.style.top = `${top}px`;
    /* stop timer when reached the bottom */
    if (characterElm.offsetTop >= (innerHeight - 150 - characterElm.offsetHeight)) {
        clearInterval(dropTimer);
    }

}, 25);

function treasureChestAppear() {
    setTimeout(() => {
        treasureChestElm.style.display = 'block';
        gameWinFindingTreasure();
    }, 1000 * 60 * 10);
}

function gameWinFindingTreasure() {
    winTmr = setInterval(() => {
        if ((characterElm.offsetLeft + characterElm.offsetWidth - 50) >= treasureChestElm.offsetLeft &&
            (characterElm.offsetLeft + characterElm.offsetWidth - 50) <= (treasureChestElm.offsetLeft + treasureChestElm.offsetWidth) &&
            characterElm.offsetTop + characterElm.offsetHeight >= treasureChestElm.offsetTop + 50) {
            const youWonBannerElm = document.getElementById('you-won-banner');
            youWonBannerElm.classList.add('appear-and-expand');

            clearInterval(winTmr);
            clearInterval(renderTmr);
            clearInterval(enemyMoveTmr);
            clearInterval(collisionTmr);

        }
    }, 20);
}

function enemyStart() {
    detectCollision();

    enemyMoveTmr = setInterval(() => {
        let enemyLeft = enemyElm.offsetLeft - enemyDx;
        if (enemyLeft <= -100) {
            enemyLeft = innerWidth;
            // return;
        }
        enemyElm.style.left = `${enemyLeft}px`;
    }, 80);
}

function detectCollision() {
    collisionTmr = setInterval(() => {
        if ((characterElm.offsetLeft + characterElm.offsetWidth - 50) >= enemyElm.offsetLeft &&
            (characterElm.offsetLeft + characterElm.offsetWidth - 50) <= (enemyElm.offsetLeft + enemyElm.offsetWidth) &&
            characterElm.offsetTop + characterElm.offsetHeight >= enemyElm.offsetTop + 50) {
            makeCharacterDead();
            // alert('collision');
        }

    }, 20);
}

function makeCharacterDead() {
    i = 0;
    let deadTmr = setInterval(() => {
        characterElm.style.backgroundImage = `url(/image/character/Dead__00${i++}.png)`;
        if (i === 10) {
            /*stop game timers*/
            clearInterval(renderTmr);
            clearInterval(enemyMoveTmr);
            clearInterval(collisionTmr);
            const gameOverBannerElm = document.getElementById('game-over-banner');
            // gameOverBannerElm.style.visibility = 'visible';
            gameOverBannerElm.classList.add('appear-and-expand');
            clearInterval(deadTmr);

        }
    }, 1000 / 30);
}

function doJump() {
//jump
    if (tmrForJump) return; /* if there is no timer set , timer will start, if we don't check this new timers will be set again while we keep space key pressed*/
    i = 0; //start jump image sequence from 0
    jump = true;
    const initialTop = characterElm.offsetTop; /*get initial top value*/

    tmrForJump = setInterval(() => {
        /*for jump*/
        if (jump) {
            /* get top coordinate by sin function , this is to show a smooth jump */
            const top = initialTop - Math.sin(toRadians(angle++)) * 150;
            characterElm.style.top = `${top}px`;/*setting top value*/
            if (angle === 181) {
                clearInterval(tmrForJump);/*clear tmr after jump completed*/
                tmrForJump = undefined;
                jump = false;
                angle = 0; /* to start angle from 0 when another jump is performed */
            }
        }
    }, 1);
}

/* Utility function to convert degree to radians */
function toRadians(angle) {
    return angle * Math.PI / 180;
}

/* this is to move in horizontal direction ( run ) */
function doRun(left) {
    if (tmrForRun) return; /* return if already there is tmr for run , if not tmrforrun will be set again and again while we keep key pressed*/
    run = true;
    i = 0;
    if (left) {
        dx = -10;
        characterElm.classList.add('rotate');
    } else {
        dx = 10;
        characterElm.classList.remove('rotate');
    }
    tmrForRun = setInterval(() => {
        if (dx === 0) {
            clearInterval(tmrForRun); /* dx 0 means not running therefore stop timer */
            tmrForRun = undefined;
            run = false;
            i = 0;/*idle images start from 0*/
            return;
        }

        /*to set boundaries of movement in x direction*/
        const left = characterElm.offsetLeft + dx;
        if (left + characterElm.offsetWidth >= innerWidth || left <= 0) {
            dx = 0;
            return;
        }

        characterElm.style.left = `${left}px`;
    }, 20);
}

/* key down listener */
addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
            doRun(e.code === "ArrowLeft"); /* start running function*/
            break;
        case 'Space':
            doJump();
    }
});

/* when key is released */
addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
            dx = 0; /* no movement in x direction*/
            break;
        case 'Space':
            break;
    }
});

/* browser resizing */
addEventListener('resize', () => {
    characterElm.style.top = `${innerHeight - 120 - characterElm.offsetHeight}px`;
    enemyElm.style.top = `${innerHeight - 120 - enemyElm.offsetHeight}px`;
});

/*touch screen*/
characterElm.addEventListener('touchmove', (e) => {
    if (!previousTouch) {
        previousTouch = e.touches.item(0);
        return;
    }
    const currentTouch = e.touches.item(0);
    doRun((currentTouch.clientX - previousTouch.clientX) < 0);
    previousTouch = currentTouch;
});

characterElm.addEventListener('touchend', (e) => {
    previousTouch = null;
    dx = 0;
});