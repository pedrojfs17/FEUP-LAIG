class MySpriteAnimation {
    constructor(scene, spriteSheet, duration, startCell, endCell) {
        this.scene = scene;

        this.spriteSheet = spriteSheet;
        this.duration = duration;
        this.startCell = startCell;
        this.endCell = endCell;

        this.rectangle = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);
        this.spriteTime = this.duration / (this.endCell - this.startCell + 1);

        this.time = 0;
        this.cell = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;

        var animTime = this.time % this.duration;
        this.cell = this.startCell + Math.floor(animTime / this.spriteTime);
    }

    display() {
        this.spriteSheet.activateShader();
        this.spriteSheet.activateCellp(this.cell);
        this.rectangle.display();
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
    }
}