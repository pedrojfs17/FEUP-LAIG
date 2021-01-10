class MyPlane extends CGFobject {
    constructor(scene, divU, divV) {
		super(scene);
        this.scene = scene
        this.divU = divU
        this.divV = divV

        this.initBuffers()
    }

    initBuffers() {
        let controlVerts = [
            [ // U : 0
                [-0.5, 0, 0.5, 1], // V : 0
                [-0.5, 0, -0.5, 1], // V : 1
            ],
            [ // U : 1
                [0.5, 0, 0.5, 1], // V : 0
                [0.5, 0, -0.5, 1], // V : 1
            ]
        ]

        var nurbsSurface = new CGFnurbsSurface(1, 1, controlVerts)

        this.object = new CGFnurbsObject(this.scene, this.divU, this.divV, nurbsSurface)
    }

    display() {
        this.object.display()
    }
}