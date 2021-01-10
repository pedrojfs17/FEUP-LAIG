const player1 = document.querySelector('.player.blacks');
const player2 = document.querySelector('.player.whites');
const player1Score = document.querySelector('#p1-score');
const player1Points = document.querySelector('#blacks-points');
const player2Score = document.querySelector('#p2-score');
const player2Points = document.querySelector('#whites-points');
const timeRemaining = document.querySelector('#time-remaining');

class MyScoreBoard {
    /**
     * Constructor for the scoreboard
     * @param {MyGameOrchestrator} orchestrator 
     */
    constructor(orchestrator) {
        this.orchestrator = orchestrator
        this.timerStopped = false
        this.winners = []
    }

     /**
     * Updates the number of games won by the players
     * @param {int} winner 0 - tied, 1 - player 1 won, 2 - player 2 won
     */
    updateScore(winner) {
        if (!winner) return

        if (winner == 1) {
            let currentScore = parseInt(player1Score.textContent)
            player1Score.textContent = currentScore + 1
            this.winners.push(player1Score)
        } else {
            let currentScore = parseInt(player2Score.textContent)
            player2Score.textContent = currentScore + 1
            this.winners.push(player2Score)
        }
    }

    /**
     * Updates the current game points of each player
     * @param {Array<Int>} points current green pieces captured for each player
     */
    updatePoints(points) {
        player1Points.textContent = points[0];
        player2Points.textContent = points[1];
    }

    /**
     * Updates the current player
     * @param {Int} option (0 - Start Game, 1 - Switch Player, 2 - Finish Game)
     */
    updateCurrentPlayer(option) {
        if (option == 0) {
            player1.classList.add('current')
            player2.classList.remove('current')
        }
        else if (option == 1) {
            player1.classList.toggle('current')
            player2.classList.toggle('current')
        }
        else {
            this.lastTurn = player1.classList.contains('current') ? 0 : 1
            player1.classList.remove('current')
            player2.classList.remove('current')
        }
    }

    /**
     * When an undo is made after the game is finished, update the scores
     */
    removeWin() {
        let lastWinner = this.winners.pop()

        if (lastWinner) {
            let currentScore = parseInt(lastWinner.textContent)
            lastWinner.textContent = currentScore - 1
        }

        this.updateCurrentPlayer(0)
        if (this.lastTurn) this.updateCurrentPlayer(1)
    }


    /**
     * Restarts the timer information
     * @param  {Number} currentTime - current time in milliseconds
     */
    startTimer() {
        this.time = 0;
        timeRemaining.style.display = "block";
        timeRemaining.textContent = this.turnTime;
        this.timerStopped = false;
    }

    update(deltaTime) {
        if(this.timerStopped) return;

        this.time += deltaTime

        if (this.time > this.turnTime) {
            this.orchestrator.timeUp()
            this.stopTimer()
            timeRemaining.textContent = '0.00'
            return true;
        }

        timeRemaining.textContent = String(this.turnTime - this.time).substr(0, 4);
    }
    
    /**
     * Stops timer
     */
    stopTimer() {
        this.timerStopped = true;
    }
    
    /**
     * Clears timer
     */
    clearTimer() {
        timeRemaining.style.display = "none";
    }

    /**
     * Sets turn time
     */
    setTurnTime(time) {
        this.turnTime = time
    }
}