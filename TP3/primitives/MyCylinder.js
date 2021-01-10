/**
* MyCylinder
* @constructor
*/
class MyCylinder extends CGFobject {
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

        this.side = new MyCylinderSide(scene, height, topRadius, bottomRadius, stacks, slices);
        this.lid = new MyCircle(scene, slices);
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(this.bottomRadius, this.bottomRadius, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.lid.display();
        this.scene.popMatrix();

        this.side.display();

        this.scene.pushMatrix();
        this.scene.scale(this.topRadius, this.topRadius, 1);
        this.scene.translate(0, 0, this.height);
        this.lid.display();
        this.scene.popMatrix();
    }

    
}