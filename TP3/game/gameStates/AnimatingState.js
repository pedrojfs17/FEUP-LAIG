class AnimatingState extends GameState {
    constructor(gameOrchestrator) {
        super();
        this.orchestrator = gameOrchestrator;

        this.orchestrator.animator.updateCurrentMove()

        this.nextState = null
    }

    update(deltaTime) {
        this.orchestrator.animator.update(deltaTime)
    }

    display() {
        this.orchestrator.animator.display();
    }

    updateState(event) {
        if (event === "Animation Done") {
            this.orchestrator.updatePoints()
            this.orchestrator.getPlayerType() === "human"
                ? this.orchestrator.state = new ChoosingState(this.orchestrator)
                : this.orchestrator.state = new BotState(this.orchestrator)
        } else if (event === "Piece Animation Done") {
            if (this.orchestrator.undo) {
                if (this.orchestrator.currentPlayer != this.orchestrator.gameSequence.undoMove.player) {
                    this.orchestrator.scene.camera.startBackwardsAnimation()
                    this.orchestrator.nextPlayer()
                } else {
                    this.updateState("Animation Done")
                }
                this.orchestrator.gameSequence.clearUndo();
                this.orchestrator.undo = false
            } else {
                this.orchestrator.nextPlayer();
                this.orchestrator.checkAvailableMoves()
            }
        }
    }

    onServerResponse(response) {
        if (response[0] == 1) {
            this.orchestrator.state = new GameOverState(this.orchestrator)
            this.orchestrator.checkWinner()
        } else {
            let moves = response[1]
            let hasMoves = false

            for (let i = 0; i < moves.length; i++) {
                if (moves[i].length > 1) {
                    hasMoves = true;
                    break
                }
            }

            if (!hasMoves) {
                console.log("Player " + this.orchestrator.currentPlayer + "dont have any moves left")
                this.orchestrator.nextPlayer()
                this.updateState("Animation Done")
            } else {
                this.orchestrator.scene.camera.startAnimation()
            }
        }
    }

    onObjectSelected(object, id) {}

    getGameMenuButtons() {
        return null
    }
}