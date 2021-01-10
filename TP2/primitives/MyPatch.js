class MyPatch extends CGFobject {
    constructor(scene, npointsU, npointsV, divU, divV, controlVerts) {
		super(scene);
        this.scene = scene
        this.degU = npointsU - 1
        this.degV = npointsV - 1
        this.divU = divU
        this.divV = divV
        this.controlVerts = controlVerts;

        this.initBuffers()
    }

    initBuffers() {
        var nurbsSurface = new CGFnurbsSurface(this.degU, this.degV, this.controlVerts)

        this.object = new CGFnurbsObject(this.scene, this.divU, this.divV, nurbsSurface)
    }

    display() {
        this.object.display()
    }
}