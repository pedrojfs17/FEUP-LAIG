class MyTile {
    /**
     * Constructor for a tile
     * @param {XMLscene} scene 
     * @param {MyGameBoard} gameboard 
     */
    constructor(scene, gameboard) {
        this.scene = scene;

        this.gameboard = gameboard;
        this.pieces = [];

        this.plane = new MyPlane(scene, 5, 5);

        this.material = new CGFappearance(this.scene);
        this.material.setTexture(this.scene.tileTexture)
        this.material.setAmbient(0.1,0.1,0.1,1.0);
        this.material.setDiffuse(0.5,1.0,0.5,1.0);
        this.material.setSpecular(0.2,0.2,0.2,1.0);
        this.material.setShininess(100.0);

        this.selectedMaterial = new CGFappearance(this.scene);
        this.selectedMaterial.setTexture(this.scene.tileTexture)
        this.selectedMaterial.setAmbient(0.0,0.0,0.0,1.0);
        this.selectedMaterial.setDiffuse(1.0,0.4,0.0,1.0);
        this.selectedMaterial.setSpecular(1.0,1.0,1.0,1.0);
        this.selectedMaterial.setEmission(1.0,0.4,0.0,0.0);
        this.selectedMaterial.setShininess(100.0);

        this.selected = false;

        this.color = null;
    }

    /**
     * Updates the tile color according to the top piece of the stack
     */
    updateColor() {
        this.color = this.pieces.length >= 1 ? this.pieces[this.pieces.length - 1].color : null;
    }

    /**
     * Selects the tile
     */
    selectTile() {
        this.selected = true;
    }

    /**
     * Deselect the tile
     */
    deselectTile() {
        this.selected = false;
    }

    /**
     * Add a piece to the array
     * @param {MyPiece} piece 
     */
    addPiece(piece) {
        this.pieces.push(piece);
        this.updateColor();
    }

    /**
     * Add a stack of pieces to tile
     * @param {MyPiece} pieces 
     */
    addStack(pieces) {
        pieces.forEach(piece => this.pieces.push(piece));
        this.updateColor();
    }

    /**
     * Clear the pieces
     */
    clearPieces() {
        this.pieces = [];
        this.color = null;
    }

    /**
     * Removes n pieces from the tile
     * @param {int} n number of pieces to clear
     */
    clearNPieces(n) {
        let pieces = []

        while(n) {
            pieces.unshift(this.pieces.pop());
            n--;
        }

        this.updateColor();
        return pieces
    }

    /**
     * Get the pieces from this tile
     */
    getPieces() {
        return this.pieces;
    }

    /**
     * Transform tile into a prolog readable string
     */
    toString() {
        if (this.pieces.length === 0) return [-1]

        let pieces = []
        this.pieces.forEach(piece => {pieces.unshift(piece.colorId)})

        return pieces
    }

    /**
     * Displays the tile and its pieces
     */
    display() {
        this.scene.pushMatrix();

        // Display tile itself
        this.selected ? this.selectedMaterial.apply() : this.material.apply()
        this.plane.display();
        
        if (this.selected)
            this.scene.translate(0,0.2,0);

        // Display pieces
        this.scene.pushMatrix();
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].display();
            this.scene.translate(0, 0.2, 0);
        }
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}