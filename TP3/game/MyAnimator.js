class MyAnimator {
    /**
     * Constructor for the animator
     * @param {MyGameOchestrator} orchestrator 
     * @param {MyGameSequence} sequence 
     */
    constructor(orchestrator, sequence) {
        this.orchestrator = orchestrator;
        this.sequence = sequence;
    }

    /**
     * Updates which move is going to be animated
     */
    updateCurrentMove() {
        this.move = this.sequence.getCurrentMove();
    }

    /**
     * Updates current move
     * @param {int} deltaTime - Time passed since last update
     */
    update(deltaTime) {
        this.move.update(deltaTime)
    }

    /**
     * Displays the current animation
     */
    display() {
        if (this.move) this.move.animate();
    }
}