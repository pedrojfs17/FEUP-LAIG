class MyGameboard {
    constructor(scene, orchestrator, rows, columns, controlPanel, gamePanel, board) {
        this.scene = scene;
        this.orchestrator = orchestrator

        this.rows = rows;
        this.columns = columns;
        
        this.controlPanel = controlPanel
        this.gamePanel = gamePanel

        this.initTiles();

        if (board) {
            this.pieces = [];

            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    let color = board[i][j][0];
                    let piece = new MyPiece(this.scene, color);
                    this.tiles[i][j].addPiece(piece);
                    this.pieces.push(piece);
                }
            }
        }
    }

    /**
     * Create the board tiles
     */
    initTiles() {
        this.tiles = [];
        
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.columns; j++) {
                row.push(new MyTile(this.scene, this));
            }
            this.tiles.push(row);
        }
    }

    /**
     * Create the board pieces assigning each piece to it's tile
     */
    initPieces() {
        this.pieces = [];
        this.piecesAnimations = [];

        let colors = [];
        for (let i = 0; i < this.rows * this.columns / 3; i++) {
            colors.push(0,1,2);
        }

        for (let i = 0; i < this.rows * this.columns; i++) {
            let color = colors.splice([Math.floor(Math.random() * colors.length)], 1)[0];
            let piece = new MyPiece(this.scene, color);
            this.pieces.push(piece);
            let initialTime = 0 + i * 0.1
            this.piecesAnimations.push([
                piece, 
                new MyAnimation(
                    initialTime,
                    initialTime + this.scene.gameorchestrator.animationTime,
                    {translation: {x: i % this.columns, y: 40, z: Math.floor(i / this.columns) % this.rows}, rotationX:{angle:0}, rotationY:{angle:0}, rotationZ:{angle:0}, scale:{sx:1, sy:1, sz:1}},
                    {translation: {x: i % this.columns, y: 0, z: Math.floor(i / this.columns) % this.rows}, rotationX:{angle:0}, rotationY:{angle:0}, rotationZ:{angle:0}, scale:{sx:1, sy:1, sz:1}},
                )
            ])
        }
    }

    /**
     * Clears all the pieces of the board
     */
    cleanBoard() {
        this.pieces = []

        this.tiles.forEach(row => {
            row.forEach(tile => {
                tile.clearPieces()
            })
        })
    }

    /**
     * Get a tile from its position
     * @param {int} row 
     * @param {int} column 
     */
    getTileFromPosition(row, column) {
        let id = (row * this.columns + column) + 1
        return ([this.tiles[row][column],id])
    }

    /**
     * Get a tile position from its picking id
     * @param {int} pickingId 
     */
    getPiecePosition(pickingId) {
        let pos = pickingId - 1;
        let row = Math.floor(pos / this.columns);
        let column = pos % this.columns;

        return {row:row, column:column}
    }

    /**
     * Get a tile from its picking id
     * @param {int} pickingId 
     */
    getPieceFromId(pickingId) {
        let pos = this.getPiecePosition(pickingId)
        return this.tiles[pos.row][pos.column];
    }
    
    /**
     * Removes all the pieces from the tile with the picking id sent
     * @param {int} originId 
     */
    removePieces(originId) {
        let origin = this.getPieceFromId(originId);
        let pieces = origin.getPieces();
        origin.clearPieces();
        return pieces;
    } 

    /**
     * Removes N pieces from tile with the sent picking id
     * @param {int} originId - Tile picking id
     * @param {int} n - Number of pieces to be removed
     */
    removeNPieces(originId, n) {
        let origin = this.getPieceFromId(originId);
        return origin.clearNPieces(n);
    }

    /**
     * Add pieces to a tile
     * @param {int} destinId - Tile picking id
     * @param {Array<MyPiece>} pieces - Pieces to be added
     */
    addPieces(destinId, pieces) {
        let destin = this.getPieceFromId(destinId);
        destin.addStack(pieces);
    }

    /**
     * Get the tile offset when drawing the board
     * @param {int} tileId - Tile picking id
     */
    getTileOffset(tileId) {
        let pos = tileId - 1;
        let row = Math.floor(pos / this.columns);
        let column = pos % this.columns;
        let height = this.tiles[row][column].getPieces().length;

        return {x: column, y: height * 0.2, z: row, height: height};
    }

    /**
     * From an array with the player pieces, returns the index of the selected one
     * @param {int} choosenTile - Tile picking id
     */
    getPlayerPieceIndex(choosenTile) {
        let tile = this.getPieceFromId(choosenTile)
        let color = tile.color
        let index = 0

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.tiles[i][j] === tile) 
                    return index
                else if (this.tiles[i][j].color === color) 
                    index++
            }
        }

        return index
    }

    /**
     * Transforms board into prolog readable string
     */
    toString() {
        let board = []

        for (let i = 0; i < this.rows; i++) {
            let row = []
            for (let j = 0; j < this.columns; j++) {
                row.push(this.tiles[i][j].toString())
            }
            board.push(row);
        }
        
        return JSON.stringify(board)
    }

    /**
     * Updates the initial board setup animations
     * @param {int} deltaTime time since last update
     */
    update(deltaTime) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                let piece = this.piecesAnimations[i * this.columns + j][0]
                let anim = this.piecesAnimations[i * this.columns + j][1]

                if (anim.finished) continue

                anim.update(deltaTime)

                if (anim.finished) this.tiles[i][j].addPiece(piece);
            }
        }

        if (this.piecesAnimations[this.piecesAnimations.length - 1][1].finished) {
            this.scene.gameorchestrator.state.updateState('Piece Setup Done')
            this.piecesAnimations = null
        }
    }

    /**
     * When the board is being setup, this function displays the pieces falling
     */
    displayPieces() {
        this.piecesAnimations.forEach(anim => {
            this.scene.pushMatrix()
            
            anim[1].applyAnimation(this.scene)
            anim[0].display()

            this.scene.popMatrix()
        })
    }

    /**
     * Displays the board
     */
    display() {
        // Change board position
        this.scene.multMatrix(this.scene.graph.boardTransformations)

        if (this.orchestrator.state instanceof InitialState && !this.orchestrator.state.start) {
            this.gamePanel.display()
            return
        }

        this.scene.pushMatrix()
        this.scene.translate(-this.rows / 2 - 1, 0, 0)
        this.controlPanel.display()
        this.scene.popMatrix()

        // Center the board
        this.scene.translate(-(this.columns - 1) / 2, 0, -(this.rows - 1) / 2);
        
        this.scene.pushMatrix()

        // Display Tiles
        for(let row = 0; row < this.rows; row++) {
            this.scene.pushMatrix();
            for(let column = 0; column < this.columns; column++) {
                let id = row * this.columns + column + 1;
                this.scene.registerForPick(id, this.tiles[row][column]);
                this.tiles[row][column].display();
                this.scene.translate(1, 0, 0);
            }
            this.scene.popMatrix();
            this.scene.translate(0, 0, 1);
        }

        this.scene.popMatrix();
    }
}