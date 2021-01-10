/**
 * Class that represents the scene graph nodes
 */
class Node extends CGFobject {
    constructor(scene, graph, id, nodeInfo) {
        super(scene);

        this.graph = graph

        this.id = id;
        this.nodeInfo = nodeInfo; // Raw node info parsed from XML

        this.afs = nodeInfo.texture.afs;
        this.aft = nodeInfo.texture.aft;

        this.children = []; // Node children array, contains Nodes or other CGFobjects for primitives
        this.animation = null;

        this.transformationMatrix = null;
        this.calculateTransformationMatrix();
    }

    setChildren(children) {
        this.children = children;
    }

    setAnimation(animation) {
        this.animation = animation;
    }

    /**
     * Displays object and children, applying the transformations, materials and textures 
     */
    display() {
        this.scene.pushMatrix();

        this.applyTransformations();
        this.applyAnimationTransformations();

        this.pushMaterial();
        this.pushTexture();
        this.applyAppearance();

        for (let child of this.children) {
            if (child instanceof MyRectangle || child instanceof MyTriangle)
                child.setTextureLengths(this.afs, this.aft);
            child.display();
        }

        this.scene.popMatrix();
        this.scene.materialStack.pop();
        this.scene.textureStack.pop();
        this.applyAppearance();
    }

    /**
     * Pushes material to the materials stack
     */
    pushMaterial() {
        if (this.nodeInfo.material == "null") { // If null, material is the same as parent
            this.scene.materialStack.push(this.scene.materialStack[this.scene.materialStack.length - 1]);
        } else { // Else, use nodes own material
            this.scene.materialStack.push(this.scene.materials.get(this.nodeInfo.material));
        }
    }

    /**
     * Pushes texture to textures stack
     */
    pushTexture() {
        if (this.nodeInfo.texture.id == "null") { // If null, texture is the same as parent
            this.scene.textureStack.push(this.scene.textureStack[this.scene.textureStack.length - 1]);
        } else if (this.nodeInfo.texture.id == "clear") { // If clear, no texture is applied
            this.scene.textureStack.push(null);
        } else { // Else, use nodes own texture
            this.scene.textureStack.push(this.scene.textures.get(this.nodeInfo.texture.id));
        }
    }

    /**
     * Grabs material and texture from the stack and applies material to the scene.
     */
    applyAppearance() {
        this.scene.materialStack[this.scene.materialStack.length - 1].setTexture(
            this.scene.textureStack[this.scene.textureStack.length - 1]
        );

        this.scene.materialStack[this.scene.materialStack.length - 1].apply();
    }

    /**
     * Calculates the node transformations
     */
    calculateTransformationMatrix() {
        this.transformationMatrix = mat4.create();

        for (let t of this.nodeInfo.transformations) {
            switch(t.type) {
                case "rotation":
                    mat4.rotate(this.transformationMatrix, this.transformationMatrix, t.angle, this.graph.axisCoords[t.axis]);
                    break;
                case "translation":
                    mat4.translate(this.transformationMatrix, this.transformationMatrix, [t.x, t.y, t.z]);
                    break;
                case "scale":
                    mat4.scale(this.transformationMatrix, this.transformationMatrix, [t.sx, t.sy, t.sz]);
                    break;
            }
        }
    }

    /**
     * Applies specified transformations to object
     */
    applyTransformations() {
        this.scene.multMatrix(this.transformationMatrix);
    }

    /**
     * Applies animation transformations
     */
    applyAnimationTransformations() {
        if (this.animation == undefined)
            return;
             
        this.animation.applyAnimation(this.scene);
    }
}