class MyGameOrchestrator {
    /**
     * Constructor for a game orchestrator
     * @param {XMLscene} scene Scene
     * @param {Object} player1 Player 1 type and difficulty (in case he is a bot)
     * @param {Object} player2 Player 2 type and difficulty (in case he is a bot)
     * @param {int} boardSize Rows and columns of the board
     * @param {int} turnTime Time for each turn
     */
    constructor(scene) {
        this.state = new InitialState(this);

        this.scene = scene;

        // Default move animation time
        this.animationTime = 0.6
        // Default piece geometry
        this.pieceGeometry = "Pyramid"

        this.gameSequence = new MyGameSequence();
        this.animator = new MyAnimator(this, this.gameSequence);
        this.prolog = new MyPrologInterface(this);
        this.scoreBoard = new MyScoreBoard(this)

        this.control_panel = new MyControlPanel(this.scene, this, {
            'undo': [
                "Undo",
                ()=>{
                    this.state.undo()
                }
            ],
            'top': [
                "Top",
                ()=>{
                    this.scene.currentCameraID = 'game'
                    this.scene.updateGameCamera('top')
                }
            ],
            'front': [
                "Front",
                ()=>{
                    this.scene.currentCameraID = 'game'
                    this.scene.updateGameCamera('game')
                }
            ],
            'movie' : [
                'Movie',
                () => {
                    this.orchestrator.state = new MovieState(this.orchestrator)
                    this.orchestrator.scene.updateGameCamera('top')
                    this.orchestrator.scene.currentCameraID = 'top'
                }
            ]
        })
        this.gamePanel = new MyGamePanel(this.scene, this)
        this.gameboard = new MyGameboard(this.scene, this, 0, 0, this.control_panel, this.gamePanel)

        this.currentPlayer = 'blacks';
    }

    /**
     * Setter for the theme
     * @param {MySceneGraph} theme Current them
     */
    setTheme(theme) {
        this.theme = theme
    }

    /**
     * Switches turn
     */
    nextPlayer() {
        this.currentPlayer === 'blacks' ? this.currentPlayer = 'whites' : this.currentPlayer = 'blacks';
        this.scoreBoard.updateCurrentPlayer(1)
    }

    /**
     * Get the player type (human or bot)
     */
    getPlayerType() {
        if (this.currentPlayer === 'blacks') return this.player1.type 
        else return this.player2.type
    }

    /**
     * In case the player is a bot, returns its difficulty
     */
    getPlayerDifficulty() {
        if (this.currentPlayer === 'blacks') return this.player1.difficulty 
        else return this.player2.difficulty
    }

    /**
     * Updates the game orchestrator
     * @param {int} deltaTime Time since last update
     */
    update(deltaTime) {
        this.state.update(deltaTime)
        this.scoreBoard.update(deltaTime)
    }

    /**
     * Send the prolog received response to the current state
     * @param {*} response Prolog response
     */
    onServerResponse(response) {
        this.state.onServerResponse(response);
    }

    /**
     * Displays the scene
     */
    display() {
        // Display surrounding scene
        this.theme.displayScene();

        // Display the game board
        this.gameboard.display();

        this.state.display();
    }

    /**
     * Manages a pick
     * @param {bool} pickMode Pick mode
     * @param {Array} pickResults Picking results
     */
    managePick(pickMode, pickResults) {
        if (pickMode == false) {
			if (pickResults != null && pickResults.length > 0) {
				for (var i = 0; i < pickResults.length; i++) {
                    var obj = pickResults[i][0];
                    if (obj) {
                        var uniqueId = pickResults[i][1];
                        this.state.onObjectSelected(obj, uniqueId);
                    }
				}
				pickResults.splice(0, pickResults.length);
			}
		}
    }

    playGame(gameParams) {
        this.player1 = gameParams.player1
        this.player2 = gameParams.player2
        this.turnTime = gameParams.time
        this.boardSize = gameParams.board

        this.gameboard = new MyGameboard(this.scene, this, this.boardSize.rows, this.boardSize.columns, this.control_panel, this.gamePanel)
        this.scoreBoard.setTurnTime(this.turnTime)

        if (this.initialBoard === undefined && this.prolog.connected) {
            this.state.updateState('Start Game')
            this.scene.changeToGameCamera()
        }
    }

    /**
     * Start the pieces animation to start the game
     */
    startGame() {
        this.gameboard.initPieces()
        this.scoreBoard.updateCurrentPlayer(0)
    }

    /**
     * Saves the initial board
     */
    saveInitialBoard() {
        this.initialBoard = this.gameboard.toString()
    }

    /**
     * Resets the game
     */
    resetGame() {
        if (this.currentPlayer != "blacks") {
            this.scene.updateGameCameras()
        }
        this.initialBoard = undefined
        this.currentPlayer = 'blacks'
        this.gameboard.cleanBoard()
        this.scoreBoard.updatePoints([0,0])
        this.scoreBoard.stopTimer()
        this.scoreBoard.clearTimer()
        this.state = new InitialState(this)
        this.scene.changeToSceneCamera()
    }

    /**
     * Rebuilds the initial game board
     */
    setupInitialBoard() {
        this.gameboard = new MyGameboard(this.scene, this, this.boardSize.rows, this.boardSize.columns, this.control_panel, this.gamePanel, JSON.parse(this.initialBoard))
    }

    /**
     * Moves a piece from start tile to end tile
     * @param {int} startTile Origin tile picking id
     * @param {int} endTile Destin tile picking id
     */
    move(startTile, endTile) {
        this.gameSequence.addMove(new MyGameMove(this, startTile[1], endTile[1], startTile[0].getPieces().length, this.currentPlayer));
        this.state.updateState("Animation Start");
    }

    /**
     * Asks prolog if the move from start tie to end tile is valid
     * @param {int} startTile Origin tile picking id
     * @param {int} endTile Destin tile picking id
     */
    moveRequest(startTile, endTile) {
        let gameState = this.gameboard.toString()
        let endPosition = this.gameboard.getPiecePosition(endTile[1])
        this.prolog.movePiece(gameState, this.currentPlayer, this.gameboard.getPlayerPieceIndex(startTile[1]), endPosition.column, endPosition.row)
    }

    /**
     * Asks prolog for a valid move for the bot
     */
    chooseMoveRequest() {
        let gameState = this.gameboard.toString()
        this.prolog.chooseMove(gameState, this.currentPlayer, this.getPlayerDifficulty())
    }

    /**
     * Asks prolog if the current player has available moves
     */
    checkAvailableMoves() {
        this.prolog.checkAvailableMoves(this.gameboard.toString(), this.currentPlayer)
    }

    /**
     * Undo buttton click handler
     */
    undoButton() {
        this.state.undo();
    }

    /**
     * Undo the previous move
     */
    undoMove() {
        let previousMove = this.gameSequence.getCurrentMove()

        if (previousMove) {
            this.undo = true
            this.gameSequence.undo();
            this.state.updateState("Animation Start");
            return 0
        } else {
            console.warn('No moves to undo')
            return -1
        }
    }

    /**
     * Checks if the current camera is the game one
     */
    inPlayerCamera() {
        return this.scene.currentGameCamera === "game"
    }

    /**
     * Sets the camera to the player main view
     */
    setPlayerCamera() {
        this.scene.updateGameCamera('game')
    }

    /**
     * Updates all the graph game cameras when changing the player. 
     * If the theme is changed, the camera stays in the correct position
     */
    updatePlayerCamera() {
        this.scene.updateGameCameras()
    }

    /**
     * Asks prolog for the game winner
     */
    checkWinner() {
        this.prolog.gameOver(this.gameboard.toString())
    }

    /**
     * Updates the scoreboard when a game is finished
     * @param {int} winner 0 - tied, 1 - player1, 2 - player2
     */
    finishedGame(winner) {
        this.scoreBoard.updateScore(winner)
        this.scoreBoard.updateCurrentPlayer(2)
        this.scoreBoard.stopTimer()
    }

    /**
     * Asks prolog for the current game points
     */
    updatePoints() {
        this.prolog.countPoints(this.gameboard.toString())
    }

    /**
     * When the turn time is up, finish the game since this game does not allow passing turns
     */
    timeUp() {
        console.log('Time is up!')
        this.finishedGame(this.currentPlayer === "whites" ? 1 : 2)
        this.state.updateState('Time Up')
    }
}