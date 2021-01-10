class ChoosingState extends GameState {
    constructor(gameOrchestrator) {
        super();
        this.orchestrator = gameOrchestrator;

        this.firstSelectedTile = null;
        this.secondSelectedTile = null;
        this.waitingCamera = false

        this.orchestrator.scoreBoard.startTimer()
    }

    update(deltaTime) {}

    display() {}

    updateState(event) {
        if (event === "Animation Start") {
            if (this.firstSelectedTile) this.firstSelectedTile[0].deselectTile();
            this.orchestrator.state = new AnimatingState(this.orchestrator);
        }
        else if (event === "Updated Camera" && this.waitingCamera) {
            this.orchestrator.move(this.firstSelectedTile, this.secondSelectedTile)
            this.firstSelectedTile = null
            this.secondSelectedTile = null
            this.waitingCamera = false
        } 
        else if (event === "Time Up") {
            if (this.firstSelectedTile) this.firstSelectedTile[0].deselectTile();
            this.orchestrator.state = new GameOverState(this.orchestrator)
        }
    }

    onServerResponse(response) {
        if (response.length === 0) {
            console.warn('Invalid Move')
            this.firstSelectedTile = null
            this.secondSelectedTile = null
        }
        else {
            this.orchestrator.scoreBoard.stopTimer()
            if (this.orchestrator.inPlayerCamera()) {
                this.orchestrator.move(this.firstSelectedTile, this.secondSelectedTile)
                this.firstSelectedTile = null
                this.secondSelectedTile = null
            } else {
                this.orchestrator.setPlayerCamera()
                this.waitingCamera = true
            }
        }
    }

    onObjectSelected(object, id) {
        if (object instanceof MyButton) {
            object.onClick()
            return
        }

        const player = this.orchestrator.currentPlayer;

        // First piece selected
        if (this.firstSelectedTile == null && object instanceof MyTile) {
            if (object.getPieces().length > 0 && (object.color + 's') == player) {
                this.firstSelectedTile = [object, id];
                object.selectTile();
            }
        }
        else if (object instanceof MyTile) {
            this.firstSelectedTile[0].deselectTile();

            if (this.firstSelectedTile[1] !== id && object.getPieces().length > 0) {
                this.secondSelectedTile = [object, id]
                this.orchestrator.moveRequest(this.firstSelectedTile, this.secondSelectedTile);
            } else {
                this.firstSelectedTile = null
            }
        }
    }

    undo() {
        this.orchestrator.undoMove();
    }

    getGameMenuButtons() {
        return ['undo', 'top', 'front']
    }
}