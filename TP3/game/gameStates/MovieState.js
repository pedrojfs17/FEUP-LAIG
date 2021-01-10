class MovieState extends GameState {
    constructor(gameOrchestrator) {
        super();
        this.orchestrator = gameOrchestrator;
        
        this.nMoves = this.orchestrator.gameSequence.moves.length
        this.animating = false

        this.orchestrator.setupInitialBoard()
    }

    update(deltaTime) {
        if (this.animating) {
            if (this.orchestrator.gameSequence.currentMove < this.nMoves)
                this.orchestrator.animator.update(deltaTime)
            else {
                this.orchestrator.gameSequence.currentMove--
                this.updateState('Movie Ended')
            }
        }
    }

    display() {
        this.orchestrator.animator.display();
    }

    updateState(event) {
        if (event === 'Updated Camera') {
            this.animating = true
            this.orchestrator.gameSequence.currentMove = -1
            this.orchestrator.gameSequence.replay()
            this.orchestrator.animator.updateCurrentMove()
        }
        else if (event === "Piece Animation Done") {
            this.orchestrator.gameSequence.replay()
            this.orchestrator.animator.updateCurrentMove()
        }
        else if (event === "Movie Ended") {
            this.animating = false
            this.orchestrator.state = new GameOverState(this.orchestrator)
        }
    }

    onServerResponse(response) {}

    onObjectSelected(object, id) {}

    getGameMenuButtons() {
        return []
    }
}