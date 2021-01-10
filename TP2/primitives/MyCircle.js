/**
* MyCircle
* @constructor
*/
class MyCircle extends CGFobject {
    /**
     * @method constructor
     * @param  {CGFscene} scene - MyScene object
     * @param  {integer} slices - number of slices around Y axis
     */
    constructor(scene, slices) {
        super(scene);
        this.slices = slices;

        this.initBuffers();
    }

    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        var theta = 0;
        var thetaInc = Math.PI * 2 / this.slices;

        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);

        for (var i = 0; i <= this.slices; i++) {
            var x = Math.cos(theta);
            var y = Math.sin(theta);

            this.vertices.push(x, y, 0);

            this.normals.push(0, 0, 1);

            this.texCoords.push((x+1)/2, (y+1)/2);

            if (i > 0) {
                this.indices.push(0, i, i+1);
            }

            theta += thetaInc;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateSlices(complexity) {
        this.slices = complexity;

        this.initBuffers();
        this.initNormalVizBuffers();
    }
}