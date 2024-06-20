await new Promise((resolve) => {
    document.querySelector("#start-screen > button")
        .addEventListener('click', async () => {
            await document.querySelector("html").requestFullscreen({
                navigationUI: 'hide'
            });
            document.querySelector("#start-screen").remove();
            resolve();
        });
});

await new Promise(function (resolve) {
    const images = ['/image/BG.png',
        '/image/BG-night.jpg',
        '/image/BG-treasure.jpg',
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
                `${value}/Walk00${index + 1}.png`
            ]),
        ...Array(13).fill('/image/enemy/santasprites/png')
            .flatMap((value, index) => [
                `${value}/Walk${index + 1}.png`
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
            }, 2000);
        }
    }
});

const backgroundImages = ['/image/BG.png', '/image/BG-night.jpg', '/image/BG-treasure.jpg'];
let backgroundImagesIndex = 1;


/* background music */
const backgroundMusicElement = document.getElementById("background-music");

// Play the audio
function playBackgroundMusic() {
    backgroundMusicElement.play();
    backgroundMusicElement.volume = 0.5;
    backgroundMusicElement.addEventListener("ended", () => {
        backgroundMusicElement.currentTime = 0; // Reset playback position to the beginning
        backgroundMusicElement.play(); // Start playing again
    });
}

playBackgroundMusic();

const backgroundDivElm = document.getElementById('background-div');
let backgroundTmr;

function changeBackground() {
    backgroundTmr = setTimeout(() => {
        backgroundDivElm.classList.add('change-opacity');
        backgroundDivElm.style.backgroundImage = `url("${backgroundImages[1]}")`;
        setTimeout(() => {
            backgroundDivElm.classList.remove('change-opacity');
        }, 3000);
        if (backgroundImagesIndex !== 0) scoreSpanElm.style.color = 'white';
        else scoreSpanElm.style.color = 'black';
    }, 60 * 1000 * 2.5);
}

const jumpMusicElm = document.getElementById("jump-music");
const giftMusicElm = document.getElementById("gift-music");
const loseGameMusicElm = document.getElementById("lose-game-music");
const reduceMarksMusicElm = document.getElementById("reduce-marks-music");
const winGameMusicElm = document.getElementById("win-game-music");

const startBtnElm = document.getElementById('start-button');
const replayBtnElm = document.getElementById('replay-button');
const exitBtnElm = document.getElementById('exit-button');
const gameNameContainerElm = document.getElementById('game-name-container');
const startBtnContainer = document.getElementById('start-button-container');
const scoreSpanElm = document.getElementById('score-span');
const finalScoreSpanElm = document.getElementById('final-score-span');
const gameOverBannerElm = document.getElementById('game-over-banner');
const youWonBannerElm = document.getElementById('you-won-banner');
const restartScreenElm = document.getElementById('restart-screen');


document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && startBtnContainer.style.display !== 'none') {
        startBtnElm.click();
    }
});

/* when user ask to exit */
exitBtnElm.addEventListener('click', () => {
    /* reload the game */
    location.reload();
});

/*after clicking start button*/
startBtnElm.addEventListener('click', () => {
    /*hide game name and start button*/
    gameNameContainerElm.classList.add('hide');
    startBtnContainer.classList.add('hide');
    startBtnContainer.classList.remove('animate__animated');

    dropMainCharacter();/*drop main character from top*/
    treasureChestAppear(); /*start timeout function to show treasure chest*/
    enemyStart(); /* start enemy moving */
    scoreCount(); /* start scoring */
    detectReward();/* start reward function */
    normalCharacterStart(); /* normal and reward character start moving */
    changeBackground(); /* start background change function */

    setTimeout(() => {
        startBtnContainer.style.display = 'none';
    }, 1000);
});


const characterElm = document.querySelector('#character');
const enemyElm = document.getElementById('enemy-div');
const normalCharacterElm = document.getElementById('normal-character');
const rewardCharacterElm = document.getElementById('reward-character');
const treasureChestElm = document.getElementById('treasure-chest-div');
const giftElm = document.getElementById('gift-div');
const crossElm = document.getElementById('cross-div');

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
let normalAndRewardCharMoveTmr;
let winTmr;
let scoreTmr;
let rewardTmr;
let treasureChestTmr;
let score = 0;
let charX = 5;
let charK = 1;
let rewardCharK = 1;
let rewardCharX = 20;
let t = 0;
let previousTouch;
let wonGame = false;
let gameEnded = false;

//rendering
/* to change the background image of game-character divs */
function renderCharacters() {
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

        //normal character render
        normalCharacterElm.style.backgroundImage = `url(/image/enemy/jackfree/png/Walk00${charK++}.png)`;
        if (charK === 11) charK = 1;

        //reward character render
        rewardCharacterElm.style.backgroundImage = `url(/image/enemy/santasprites/png/Walk${rewardCharK++}.png)`;
        if (rewardCharK === 14) rewardCharK = 1;

    }, 1000 / 30); /* 30 frames per second */
}

renderCharacters();

/* this is to drop from the top initially */

function dropMainCharacter() {
    const dropTimer = setInterval(() => {
        /*change top value with time*/
        const top = characterElm.offsetTop + (t++ * 3);
        characterElm.style.top = `${top}px`;
        /* stop timer when reached the bottom */
        if (characterElm.offsetTop >= (innerHeight - 150 - characterElm.offsetHeight)) {
            clearInterval(dropTimer);
        }

    }, 25);
}

function replayGame() {
    backgroundDivElm.classList.remove('change-opacity');
    scoreSpanElm.style.color = 'black';
    treasureChestElm.style.display = 'none';
    playBackgroundMusic();
    finalScoreSpanElm.style.visibility = 'hidden';
    if (wonGame) {
        youWonBannerElm.classList.add('hide');
        youWonBannerElm.classList.remove('appear-and-expand');

    } else {
        gameOverBannerElm.classList.add('hide');
        gameOverBannerElm.classList.remove('appear-and-expand');
    }

    previousTouch = undefined; /* previous touch point is none */
    gameEnded = false;
    wonGame = false;
    i = 0;/* main Character image rendering variable */
    charK = 0;/* normal Character image rendering variable */
    enemyK = 0; /* enemy Character image rendering variable */
    rewardCharK = 0; /* reward Character image rendering variable */
    t = 0; /* drop time */
    backgroundImagesIndex = 0;/*start background change from beginning*/
    backgroundDivElm.style.backgroundImage = `url("${backgroundImages[backgroundImagesIndex]}")`;

    /*character positioning*/
    characterElm.style.top = `${-20}px`;
    characterElm.style.left = `${20}px`;

    enemyElm.style.left = '-100px';

    rewardCharacterElm.style.left = '-100px';

    normalCharacterElm.style.left = '-100px';

    renderCharacters();

    /* show start button */
    startBtnContainer.style.display = 'flex';
    startBtnContainer.classList.remove('hide');
    startBtnContainer.classList.add('animate__animated');

    /* remove restart screen */
    restartScreenElm.style.display = 'none';

    /*reset score*/
    score = 0;
    scoreSpanElm.innerText = 'Score is 0';

}

replayBtnElm.addEventListener('click', replayGame);

function treasureChestAppear() {

    treasureChestTmr = setTimeout(() => {
        backgroundDivElm.classList.add('change-opacity');
        backgroundDivElm.style.backgroundImage = `url("${backgroundImages[2]}")`;
        setTimeout(() => {
            backgroundDivElm.classList.remove('change-opacity');
        }, 3000);
        treasureChestElm.style.display = 'block';
        giftMusicElm.play();
        gameWinFindingTreasure();
    }, 1000 * 60 * 5);
}

function gameWinFindingTreasure() {
    winTmr = setInterval(() => {
        if ((characterElm.offsetLeft + characterElm.offsetWidth - 50) >= treasureChestElm.offsetLeft &&
            (characterElm.offsetLeft + characterElm.offsetWidth - 50) <= (treasureChestElm.offsetLeft + treasureChestElm.offsetWidth) &&
            characterElm.offsetTop + characterElm.offsetHeight >= treasureChestElm.offsetTop + 50) {
            const youWonBannerElm = document.getElementById('you-won-banner');
            wonGame = true;
            gameEnded = true;
            backgroundMusicElement.pause(); /* pause background music */
            winGameMusicElm.play(); /* play winning music */

            /*clear the timers*/
            clearInterval(scoreTmr);
            clearInterval(winTmr);
            clearInterval(renderTmr);
            clearInterval(enemyMoveTmr);
            clearInterval(collisionTmr);
            clearInterval(normalAndRewardCharMoveTmr);
            clearInterval(rewardTmr);
            clearInterval(backgroundTmr);
            clearInterval(treasureChestTmr);

            // wait 2 seconds before showing won
            setTimeout(() => {
                const finalScoreSpanElm = document.getElementById('final-score-span');
                finalScoreSpanElm.innerText = "Final Score : " + (score <= 0 ? score : (score - 1));
                finalScoreSpanElm.style.visibility = 'visible';
                youWonBannerElm.classList.remove('hide');
                youWonBannerElm.classList.add('appear-and-expand');
                /*show restart screen*/
                restartScreenElm.style.display = 'flex';
            }, 2000);

        }
    }, 20);
}

function scoreCount() {
    scoreTmr = setInterval(() => {
        scoreSpanElm.innerText = `Score is ${score++}`;
    }, 500);
}

function normalCharacterStart() {
    normalAndRewardCharMoveTmr = setInterval(() => {
        /* movement of regular character */
        let charLeft = normalCharacterElm.offsetLeft - charX;
        if (charLeft <= -100) {
            charLeft = innerWidth;
        }
        normalCharacterElm.style.left = `${charLeft}px`;

        /* movement of reward character */
        charLeft = rewardCharacterElm.offsetLeft - Math.random() * rewardCharX;
        if (charLeft <= -100) {
            charLeft = innerWidth;
        }
        rewardCharacterElm.style.left = `${charLeft}px`;

    }, 75);
}

function enemyStart() {
    detectCollision();

    enemyMoveTmr = setInterval(() => {
        let enemyLeft = enemyElm.offsetLeft - enemyDx;
        if (enemyLeft <= -100) {
            enemyLeft = innerWidth;
        }
        enemyElm.style.left = `${enemyLeft}px`;
    }, 50);
}

function detectReward() {
    let rewarded = false; /* to detect whether this collision has been awarded once */
    let degraded = false;/* to detect whether this collision has been degraded once */
    rewardTmr = setInterval(() => {
        if ((characterElm.offsetLeft + characterElm.offsetWidth - 50) >= rewardCharacterElm.offsetLeft &&
            (characterElm.offsetLeft + characterElm.offsetWidth - 50) <= (rewardCharacterElm.offsetLeft + rewardCharacterElm.offsetWidth) &&
            characterElm.offsetTop + characterElm.offsetHeight >= rewardCharacterElm.offsetTop + 50) {

            /* do this if this collision has not already been awarded */
            if (!rewarded) {
                /*increase score*/
                score += 100;
                scoreSpanElm.innerText = `Score is ${score}`;
                giftElm.style.visibility = 'visible';/* show gift */
                rewarded = true; /* this collision is awarded */
                giftMusicElm.play();
                setTimeout(() => {
                    giftElm.style.visibility = 'hidden'; /* hide gift */
                }, 1000);
            }
        } else {
            rewarded = false;
        }

        /* reducing score */
        if ((characterElm.offsetLeft + characterElm.offsetWidth - 50) >= normalCharacterElm.offsetLeft &&
            (characterElm.offsetLeft + characterElm.offsetWidth - 50) <= (normalCharacterElm.offsetLeft + normalCharacterElm.offsetWidth) &&
            characterElm.offsetTop + characterElm.offsetHeight >= normalCharacterElm.offsetTop + 50) {

            /* do this if this collision has not already been degraded */
            if (!degraded) {
                /*decrease score*/
                score -= 50;
                scoreSpanElm.innerText = `Score is ${score}`;
                crossElm.style.visibility = 'visible';/* show cross */
                degraded = true; /* this collision is degraded */
                reduceMarksMusicElm.play();
                setTimeout(() => {
                    crossElm.style.visibility = 'hidden'; /* hide cross */
                }, 1000);
            }
        } else {
            degraded = false;
        }
    }, 20);
}

function detectCollision() {
    collisionTmr = setInterval(() => {
        if ((characterElm.offsetLeft + characterElm.offsetWidth - 50) >= enemyElm.offsetLeft &&
            (characterElm.offsetLeft + characterElm.offsetWidth - 50) <= (enemyElm.offsetLeft + enemyElm.offsetWidth) &&
            characterElm.offsetTop + characterElm.offsetHeight >= enemyElm.offsetTop + 50) {
            wonGame = false;
            gameEnded = true;
            makeCharacterDead();
        }

    }, 20);
}

function makeCharacterDead() {
    i = 0;
    let deadTmr = setInterval(() => {
        characterElm.style.backgroundImage = `url(/image/character/Dead__00${i++}.png)`;
        if (i === 10) {
            i = 9;
            /*stop game timers*/
            clearInterval(scoreTmr);
            clearInterval(renderTmr);
            clearInterval(enemyMoveTmr);
            clearInterval(collisionTmr);
            clearInterval(normalAndRewardCharMoveTmr);
            clearInterval(rewardTmr);
            clearInterval(backgroundTmr);
            clearInterval(treasureChestTmr);

            backgroundMusicElement.pause();
            loseGameMusicElm.play();

            // const gameOverBannerElm = document.getElementById('game-over-banner');
            clearInterval(deadTmr);
            /*wait 2 seconds before showing lost*/
            setTimeout(() => {
                const finalScoreSpanElm = document.getElementById('final-score-span');
                finalScoreSpanElm.innerText = "Final Score : " + (score <= 0 ? score : (score - 1));
                finalScoreSpanElm.style.visibility = 'visible';
                gameOverBannerElm.classList.remove('hide');
                gameOverBannerElm.classList.add('appear-and-expand');
                /*show restart screen*/
                restartScreenElm.style.display = 'flex';

            }, 2000);

        }
    }, 1000 / 30);
}

function doJump() {
//jump
    if (gameEnded) return;
    if (tmrForJump) return; /* if there is no timer set , timer will start, if we don't check this new timers will be set again while we keep space key pressed*/
    i = 0; //start jump image sequence from 0
    jump = true;
    jumpMusicElm.play();
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
    if (gameEnded) return;
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

const resizeFn = () => {
    /* vertical position*/
    characterElm.style.top = `${innerHeight - 120 - characterElm.offsetHeight}px`;
    enemyElm.style.top = `${innerHeight - 120 - enemyElm.offsetHeight}px`;
    normalCharacterElm.style.top = `${innerHeight - 120 - normalCharacterElm.offsetHeight}px`;

    /* horizontal position */
    if (characterElm.offsetLeft < 0) {
        characterElm.style.left = `0`;
    } else if (characterElm.offsetLeft >= innerWidth) {
        characterElm.style.left = `${innerWidth - characterElm.offsetWidth - 1}px`;
    }

    if (enemyElm.offsetLeft < 0) {
        enemyElm.style.left = `0`;
    } else if (enemyElm.offsetLeft >= innerWidth) {
        enemyElm.style.left = `${innerWidth - enemyElm.offsetWidth - 1}px`;
    }

    if (normalCharacterElm.offsetLeft < 0) {
        normalCharacterElm.style.left = `0`;
    } else if (normalCharacterElm.offsetLeft >= innerWidth) {
        normalCharacterElm.style.left = `${innerWidth - normalCharacterElm.offsetWidth - 1}px`;
    }
}

/* browser resizing */
addEventListener('resize', resizeFn);

/* screen orientation change */
screen.orientation.addEventListener('change', resizeFn);

/*touch screen*/
characterElm.addEventListener('touchmove', (e) => {
    if (!previousTouch) {
        previousTouch = e.touches.item(0);
        return;
    }
    const currentTouch = e.touches.item(0);
    doRun((currentTouch.clientX - previousTouch.clientX) < 0);
    if (currentTouch.clientY < previousTouch.clientY) doJump();
    previousTouch = currentTouch;
});

characterElm.addEventListener('touchend', (e) => {
    previousTouch = null;
    dx = 0;
});