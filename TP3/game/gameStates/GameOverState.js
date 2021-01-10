class GameOverState extends GameState {
    constructor(gameOrchestrator) {
        super();
        this.orchestrator = gameOrchestrator;

        this.orchestrator.control_panel.addButons(
            {'movie' : [
                'Movie',
                () => {
                    this.orchestrator.state = new MovieState(this.orchestrator)
                    this.orchestrator.scene.updateGameCamera('top')
                    this.orchestrator.scene.currentCameraID = 'top'
                }
            ]}
        )
    }

    update(deltaTime) {}

    display() {}

    updateState(event) {
        if (event === "Animation Start")
            this.orchestrator.state = new AnimatingState(this.orchestrator);
    }

    onServerResponse(response) {
        this.orchestrator.updatePoints()
        switch (response) {
            case 0:
                console.log('Tied Game')
                break
            case 1:
                console.log('Player 1 won the game')
                break
            case 2:
                console.log('Player 2 won the game')
                break
        }

        this.orchestrator.finishedGame(response)
    }

    onObjectSelected(object, id) {
        if (object instanceof MyButton) {
            object.onClick()
            return
        }
    }

    getGameMenuButtons() {
        return ['undo', 'top', 'front', 'movie']
    }
    
    undo() {
        if (this.orchestrator.undoMove() === 0) 
            this.orchestrator.scoreBoard.removeWin()
    }
}