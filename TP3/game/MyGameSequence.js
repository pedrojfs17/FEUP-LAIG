class MyGameSequence {
    /**
     * Constructor for a game sequence
     */
    constructor() {
        this.moves = [];
        this.undoMove = null;
    }

    /**
     * Add a move to the game sequence and update the current move index
     * @param {MyGameMove} move Move to be added to the game sequence
     */
    addMove(move) {
        this.moves.push(move);
        this.currentMove = this.moves.length - 1;
    }

    /**
     * Creates an undo move from the last move in the sequence and removes it from the list
     */
    undo() {
        if (this.currentMove < 0) return
        let previousMove = this.moves[this.currentMove]
        this.undoMove = new MyGameMove(previousMove.orchestrator, previousMove.destinTile, previousMove.originTile, previousMove.nPieces, previousMove.player);
        this.moves.pop();
        this.currentMove--;
    }

    /**
     * When the undo move is finished, set this.undo null
     */
    clearUndo() {
        this.undoMove = null;
    }

    /**
     * Resets the animation for the next move in the sequence
     */
    replay() {
        this.currentMove++
        if (this.currentMove < this.moves.length)
            this.moves[this.currentMove].resetAnimation()
    }

    /**
     * Returns the current move from the sequence
     */
    getCurrentMove() {
        if (this.undoMove != null) return this.undoMove;
        else if (this.moves.length !== 0)
            return this.moves[this.currentMove] ? this.moves[this.currentMove] : null;
    }
}