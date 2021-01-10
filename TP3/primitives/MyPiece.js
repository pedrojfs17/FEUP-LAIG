class MyPiece extends CGFobject {
    /**
     * @method constructor
     * @param  {CGFscene} scene - MyScene object
     */
    constructor(scene, material) {
        super(scene);

        this.outsideTriangle = new MyTriangle(this.scene, -0.5, 0, 0.5, 0, 0, 1.225);
        this.insideTriangle = new MyTriangle(this.scene, 0.5, 0, -0.5, 0, 0, 1.225);
        this.rectangle = new MyRectangle(this.scene, -0.5, -0.5, 0.5, 0.5)

        this.cube = new MyUnitCube(this.scene, 1)
        this.cylinder = new MyCylinder(this.scene, 0.25, 0.5, 0.5, 20, 20)
        this.torus = new MyTorus(this.scene, 0.125, 0.35, 20, 20)
        
        this.colorId = material
        this.selectMaterial(material);
    }

    /**
     * Selects the material according to the prolog representation
     * 0 - black
     * 1 - white
     * 2 - green
     * @param {int} material material of the piece
     */
    selectMaterial(material) {
        switch (material) {
            case 0:
                this.color = 'black'
                this.material = new CGFappearance(this.scene);
                this.material.setAmbient(0.05,0.05,0.05,1.0);
                this.material.setDiffuse(0.05,0.05,0.05,1.0);
                this.material.setSpecular(1.0,1.0,1.0,1.0);
                this.material.setEmission(0.0,0.0,0.0,0.0);
                this.material.setShininess(100.0);
                break;
            case 1:
                this.color = 'white'
                this.material = new CGFappearance(this.scene);
                this.material.setAmbient(0.8,0.8,0.8,1.0);
                this.material.setDiffuse(0.8,0.8,0.8,1.0);
                this.material.setSpecular(0.6,0.6,0.6,1.0);
                this.material.setEmission(0.1,0.1,0.1,0.0);
                this.material.setShininess(100.0);
                break;
            case 2:
            default:
                this.color = 'green'
                this.material = new CGFappearance(this.scene);
                this.material.setAmbient(0.0,0.0,0.0,1.0);
                this.material.setDiffuse(0.2,0.8,0.2,1.0);
                this.material.setSpecular(1.0,1.0,1.0,1.0);
                this.material.setEmission(0.0,0.1,0.0,0.0);
                this.material.setShininess(100.0);
                break;
        }
    }

    /**
     * Displays a pyramid
     * @param {MyTriangle} triangle triangle to draw in each side
     */
    displayPyramidSides(triangle) {
        this.scene.pushMatrix();

        // Front
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.scene.rotate(-0.4205, 1, 0, 0);
        triangle.display();
        this.scene.popMatrix();

        // Back
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.rotate(-0.4205, 1, 0, 0);
        triangle.display();
        this.scene.popMatrix();

        // Right Side
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.rotate(-0.4205, 1, 0, 0);
        triangle.display();
        this.scene.popMatrix();

        // Left Side
        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0, 0);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.rotate(-0.4205, 1, 0, 0);
        triangle.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }

    /**
     * Displays a pyramid piece
     */
    displayPyramid() {
        // Outside Pyramid
        this.displayPyramidSides(this.outsideTriangle);

        // Inside Pyramid
        this.scene.pushMatrix();
        this.scene.scale(0.8, 1, 0.8);
        this.displayPyramidSides(this.insideTriangle);
        this.scene.popMatrix();

        // Base
        this.scene.pushMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.1, 1, 1);
        this.scene.translate(4.5, 0, 0);
        this.rectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.1, 1, 1);
        this.scene.translate(-4.5, 0, 0);
        this.rectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.1, 1, 1);
        this.scene.translate(4.5, 0, 0);
        this.rectangle.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.1, 1, 1);
        this.scene.translate(-4.5, 0, 0);
        this.rectangle.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }

    display() {
        this.scene.pushMatrix();

        this.material.apply();

        this.scene.scale(0.8, 0.8, 0.8);

        // Displays the piece according to the selected geometry
        switch (this.scene.gameorchestrator.pieceGeometry) {
            case "Cube":
                this.scene.scale(0.8, 0.25, 0.8)
                this.scene.translate(0, 0.5, 0)
                this.cube.display()
                break
            case "Cylinder":
                this.scene.rotate(-Math.PI / 2, 1, 0, 0)
                this.cylinder.display()
                break
            case "Pyramid":
                this.displayPyramid()
                break
            case "Torus":
                this.scene.translate(0, 0.125, 0)
                this.scene.rotate(-Math.PI / 2, 1, 0, 0)
                this.torus.display()
                break
        }

        this.scene.popMatrix();
    }
}