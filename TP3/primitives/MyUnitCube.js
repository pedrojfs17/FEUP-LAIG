class MyUnitCube extends CGFobject {
    constructor(scene, ndiv) {
        super(scene)
        this.scene = scene

        this.plane = new MyPlane(scene, ndiv, ndiv)
    }

    display() {
        // FRONT
        this.scene.pushMatrix()
        this.scene.translate(0, 0, 0.5)
        this.scene.rotate(Math.PI/2, 1, 0, 0)
        this.plane.display()
        this.scene.popMatrix()

        // TOP
        this.scene.pushMatrix()
        this.scene.translate(0, 0.5, 0)
        this.plane.display()
        this.scene.popMatrix()

        // BACK
        this.scene.pushMatrix()
        this.scene.translate(0, 0, -0.5)
        this.scene.rotate(-Math.PI/2, 1, 0, 0)
        this.plane.display()
        this.scene.popMatrix()

        // BOTTOM
        this.scene.pushMatrix()
        this.scene.translate(0, -0.5, 0)
        this.scene.rotate(Math.PI, 1, 0, 0)
        this.plane.display()
        this.scene.popMatrix()
        
        // LEFT
        this.scene.pushMatrix()
        this.scene.translate(-0.5, 0, 0)
        this.scene.rotate(Math.PI/2, 0, 0, 1)
        this.plane.display()
        this.scene.popMatrix()

        // RIGHT
        this.scene.pushMatrix()
        this.scene.translate(0.5, 0, 0)
        this.scene.rotate(-Math.PI/2, 0, 0, 1)
        this.plane.display()
        this.scene.popMatrix()
    }
}