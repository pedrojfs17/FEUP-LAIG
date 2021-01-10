class MyButton extends CGFobject {
    constructor(scene, text, action) {
        super(scene)
        
        this.scene = scene
        this.text = new MySpriteText(scene, text, scene.font_spritesheet, scene.font_characters)
        this.button = new MyUnitCube(scene, 10)

        this.action = action

        this.button_size = 1 + text.length

        this.state = 0 

        this.initMaterials()
    }

    initMaterials() {
        this.panel_material = new CGFappearance(this.scene);
        this.panel_material.setAmbient(1.0,1.0,1.0,1.0);
        this.panel_material.setDiffuse(1.0,1.0,1.0,1.0);
        this.panel_material.setSpecular(1.0,1.0,1.0,1.0);
        this.panel_material.setShininess(100.0);
        this.panel_tex = new CGFtexture(this.scene, './scenes/images/wood_2.jpg')
        this.panel_material.setTexture(this.panel_tex)
        
        this.button_material_active = new CGFappearance(this.scene);
        this.button_material_active.setAmbient(0.1,0.1,0.1,1.0);
        this.button_material_active.setDiffuse(0.08,0.196,0.125,1.0);
        this.button_material_active.setSpecular(1.0,1.0,1.0,1.0);
        this.button_material_active.setShininess(100.0);
                
        this.button_material_inactive = new CGFappearance(this.scene);
        this.button_material_inactive.setAmbient(0.25,0.25,0.25,1.0);
        this.button_material_inactive.setDiffuse(0.25,0.25,0.25,1.0);
        this.button_material_inactive.setSpecular(1.0,1.0,1.0,1.0);
        this.button_material_inactive.setShininess(100.0);

        this.button_material_selected = new CGFappearance(this.scene);
        this.button_material_selected.setAmbient(0.2,0.03,0.25,1.0);
        this.button_material_selected.setDiffuse(0.246,0.047,0.379,1.0);
        this.button_material_selected.setSpecular(1.0,1.0,1.0,1.0);
        this.button_material_selected.setShininess(100.0);
    }

    onClick() {
        if (this.state != -1) this.action()
    }

    setState(state) {
        this.state = state
    }

    display() {
        if (this.state == 0) {
            this.button_material_active.apply()
        } else if (this.state == 1) {
            this.button_material_selected.apply()
        } else {
            this.button_material_inactive.apply()
        }

        this.scene.pushMatrix()
        this.scene.scale(this.button_size, 1, 1)
        this.button.display()
        this.scene.popMatrix()
  
        this.scene.pushMatrix()
        this.scene.translate(0, 0.51, 0)
        this.scene.rotate(-Math.PI/2, 1, 0, 0)
        this.text.display()
        this.scene.popMatrix()
    }
}