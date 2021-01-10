/**
* MyTorus
* @constructor
*/
class MyTorus extends CGFobject {
    /**
     * @method constructor
     * @param  {CGFscene} scene - MyScene object
     * @param  {integer} slices - number of slices around Y axis
     */
    constructor(scene, innerRadius, outerRadius, slices, loops) {
        super(scene);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        var theta = 0;
        var thetaInc = Math.PI * 2 / this.loops;
        var phi = 0;
        var phiInc = Math.PI * 2 / this.slices;

        for (var loop = 0; loop <= this.loops; loop++) {
            var cosTheta = Math.cos(theta);
            var sinTheta = Math.sin(theta);

            for (var slice = 0; slice <= this.slices; slice++) {
                var cosPhi = Math.cos(phi);
                var sinPhi = Math.sin(phi);

                var x = (this.outerRadius + this.innerRadius * cosPhi) * cosTheta;
                var y = (this.outerRadius + this.innerRadius * cosPhi) * sinTheta;
                var z = this.innerRadius * Math.sin(phi);
                this.vertices.push(x, y, z);

                const u = 1 - (slice / this.slices);
                const v = 1 - (loop / this.loops);
                this.texCoords.push(u, v);

                var normalx = x - cosTheta*this.outerRadius;
                var normaly = y - sinTheta*this.outerRadius;
                var normalz = z;
                var magn = Math.sqrt(Math.pow(normalx, 2) + Math.pow(normaly,2) + Math.pow(normalz,2));
                this.normals.push(normalx/magn, normaly/magn, normalz/magn);

                phi += phiInc;
            }
            theta += thetaInc;
        }

        var loopVerts = this.slices + 1;        
        for (let loop = 0; loop < this.loops; loop++) {
			for(let slice = 0; slice < this.slices; slice++) {
                const first = loop * loopVerts + slice;
                const second = first + loopVerts;

                this.indices.push(first, second, first+1);
                this.indices.push(second, second+1, first+1);    
			}
		}

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}