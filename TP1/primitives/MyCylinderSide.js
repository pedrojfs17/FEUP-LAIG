/**
* MyCylinderSide
* @constructor
*/
class MyCylinderSide extends CGFobject {
    /**
     * @method constructor
     * @param  {CGFscene} scene - MyScene object
     * @param  {integer} slices - number of slices around Y axis
     */
    constructor(scene, height, topRadius, bottomRadius, stacks, slices) {
        super(scene);
        this.height = height;
        this.topRadius = topRadius;
        this.bottomRadius = bottomRadius;
        this.stacks = stacks;
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
        var hInc = this.height / this.stacks;
        var radiusInc = (this.topRadius - this.bottomRadius) / this.stacks;

        for (var slice = 0; slice <= this.slices; slice++) {
            var x = Math.cos(theta);
            var y = Math.sin(theta);
            var h = 0;
            var radius = this.bottomRadius;
            for (var stack = 0; stack <= this.stacks; stack++) {
                this.vertices.push(radius * x, radius * y, h);

                this.texCoords.push(slice * 1/this.slices, 1 - (stack * 1/this.stacks));

                this.normals.push(x, y, 0);

                h += hInc;
                radius += radiusInc;
            }
            theta += thetaInc;
        }

        for (let i = 0; i < this.slices; ++i) {
			for(let j = 0; j < this.stacks; ++j) {
				this.indices.push(
					(i+1)*(this.stacks+1) + j, i*(this.stacks+1) + j+1, i*(this.stacks+1) + j,
					i*(this.stacks+1) + j+1, (i+1)*(this.stacks+1) + j, (i+1)*(this.stacks+1) + j+1
				);
			}
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