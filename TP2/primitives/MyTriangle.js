/**
* MyTriangle
* @constructor
*/
class MyTriangle extends CGFobject {
    /**
     * @method constructor
     * @param  {CGFscene} scene - MyScene object
     * @param  {integer} slices - number of slices around Y axis
     */
    constructor(scene, x1, y1, x2, y2, x3, y3) {
        super(scene);
        this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;
        this.y1 = y1;
        this.y2 = y2;
        this.y3 = y3;

        this.a = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        this.b = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
        this.c = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));

        this.cos_a = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);
        this.sin_a = Math.sqrt(1 - Math.pow(this.cos_a, 2));

        this.initBuffers();
    }

    
    initBuffers() {
        this.vertices = [this.x1, this.y1, 0,
                         this.x2, this.y2, 0,
                         this.x3, this.y3, 0];

        this.indices = [0, 1, 2];

        this.normals = [0, 0, 1,
                        0, 0, 1,
                        0, 0, 1];

        this.texCoords = [0, 1,
                          1, 1,
                          this.c * this.cos_a, this.c * this.sin_a];
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    setTextureLengths(afs, aft) {
        this.texCoords = [
            0, 1,
            this.a/afs, 1,
			(this.c *this.cos_a)/afs, 1 - (this.c *this.sin_a)/aft
		];
		
		this.updateTexCoordsGLBuffers();
    }
}