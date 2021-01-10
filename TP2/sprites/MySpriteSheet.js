class MySpriteSheet {
    constructor(scene, texture, sizeM, sizeN) {
        this.scene = scene;

        this.texture = new CGFtexture(scene, texture);
        
        this.sizeM = sizeM;
        this.sizeN = sizeN;
        this.stepM = 1 / sizeM;
        this.stepN = 1 / sizeN;
    }

    activateShader() {
        this.scene.setActiveShaderSimple(this.scene.textShader);
        this.texture.bind(0);
        this.scene.textShader.setUniformsValues({ stepM : this.stepM, stepN : this.stepN, uSampler: 0 });
    }

    activateCellMN(M, N) {
        this.scene.textShader.setUniformsValues({ M : M,  N : N });   
    }

    activateCellp(p) {
        this.activateCellMN(p % this.sizeM, Math.floor(p / this.sizeM));
    }
}