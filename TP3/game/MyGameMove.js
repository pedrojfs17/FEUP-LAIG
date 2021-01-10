class MyGameMove {
    /**
     * 
     * @param {MyGameOrchestrator} orchestrator - game orchestrator
     * @param {int} origin Origin tile picking id
     * @param {int} destin Destin tile picking id
     * @param {int} nPieces Number of moved pieces
     */
    constructor(orchestrator, origin, destin, nPieces, player) {
        this.orchestrator = orchestrator;
        this.originTile = origin;
        this.destinTile = destin;
        this.nPieces = nPieces;
        this.player = player;
        
        this.pieces = this.orchestrator.gameboard.removeNPieces(origin, nPieces);

        this.animationDone = false;

        let originOffset = this.orchestrator.gameboard.getTileOffset(this.originTile);
        let destinOffset = this.orchestrator.gameboard.getTileOffset(this.destinTile);

        this.animation = new MyPieceAnimation(
            this.orchestrator.animationTime,
            Object.assign({}, originOffset, {y:originOffset.y + 0.2}),
            Object.assign({}, destinOffset, {y:destinOffset.y + 0.2}));

    }

    /**
     * Restarts the move animation
     */
    resetAnimation() {
        this.animationDone = false
        this.pieces = this.orchestrator.gameboard.removeNPieces(this.originTile, this.nPieces)
        this.animation.resetAnimation(this.orchestrator.animationTime)
    }

    /**
     * Displays the animation
     */
    animate() {
        if (this.animationDone) return;

        this.orchestrator.scene.pushMatrix();
        this.animation.applyAnimation(this.orchestrator.scene)
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].display();
            this.orchestrator.scene.translate(0, 0.2, 0);
        }
        this.orchestrator.scene.popMatrix();
    }

    /**
     * Updates the animation
     * @param {int} deltaTime Time since last update
     */
    update(deltaTime) {
        this.animation.update(deltaTime);
        if (this.animation.finished && !this.animationDone) {
            this.animationDone = true;
            this.finishedAnimation();
        }
    }

    /**
     * Routine to run when the move animation finishes
     */
    finishedAnimation() {
        this.orchestrator.gameboard.addPieces(this.destinTile, this.pieces);
        this.orchestrator.state.updateState("Piece Animation Done")
    }
}