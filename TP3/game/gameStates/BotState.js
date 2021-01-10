class BotState extends GameState {
    constructor(gameOrchestrator) {
        super();
        this.orchestrator = gameOrchestrator;
        
        this.orchestrator.scoreBoard.startTimer()

        this.orchestrator.chooseMoveRequest()
    }

    update(deltaTime) {}

    display() {}

    updateState(event) {
        if (event === "Animation Start")
            this.orchestrator.state = new AnimatingState(this.orchestrator);
    }

    onServerResponse(response) {
        this.orchestrator.scoreBoard.stopTimer()

        let originTile = this.orchestrator.gameboard.getTileFromPosition(response[1],response[0])
        let destinTile = this.orchestrator.gameboard.getTileFromPosition(response[3],response[2])

        this.orchestrator.move(originTile, destinTile)
    }

    onObjectSelected(object, id) {}

    undo() {}

    getGameMenuButtons() {
        return []
    }
}