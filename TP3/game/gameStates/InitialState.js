class InitialState extends GameState {
    constructor(gameOrchestrator) {
        super();
        this.orchestrator = gameOrchestrator;
    }

    update(deltaTime) {
        if (this.animating) {
            this.orchestrator.gameboard.update(deltaTime)
        }
    }

    display() {
        if (this.animating) {
            this.orchestrator.gameboard.displayPieces()
        }
    }

    updateState(event) {
        if (event === "Start Game" && !this.animating) {
            this.start = true
        }
        else if (event === "Updated Camera" && this.start && !this.animating) {
            this.orchestrator.startGame()
            this.animating = true
        }
        else if (event === "Piece Setup Done") {
            this.orchestrator.saveInitialBoard()
            this.orchestrator.getPlayerType() === "human"
                ? this.orchestrator.state = new ChoosingState(this.orchestrator)
                : this.orchestrator.state = new BotState(this.orchestrator)
        }
    }

    onServerResponse(response) {}

    onObjectSelected(object, id) {
        if (object instanceof MyButton) {
            this.orchestrator.scene.changeToGameCamera()
            object.onClick()
            return
        }
    }

    getGameMenuButtons() {
        return []
    }
}