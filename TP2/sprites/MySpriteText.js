class MySpriteText {
    constructor(scene, text, spritesheet, characters) {
        this.scene = scene;
        this.text = text;
        this.spritesheet = spritesheet;
        this.characters = characters;
        this.rectangle = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);
        this.center_shift = -this.text.length / 2 + 0.5
    }

    getCharacterPosition(character) {
        return this.characters[character];
    }

    display() {
        this.scene.pushMatrix();
        this.spritesheet.activateShader();

        this.scene.translate(this.center_shift, 0, 0)

        for (let i = 0; i < this.text.length; i++) {
            this.spritesheet.activateCellp(this.getCharacterPosition(this.text.charAt(i)));
            this.rectangle.display();
            this.scene.translate(1, 0, 0);
        }

        this.scene.setActiveShaderSimple(this.scene.defaultShader);
        this.scene.popMatrix();
    }
}