class MyControlPanel extends CGFobject {
    constructor(scene, orchestrator, actions) {
        super(scene)
        this.scene = scene
        this.orchestrator = orchestrator

        this.actions = actions

        this.panel = new MyPlane(scene, 10, 10)

        this.buttons = new Map()

        this.width = 10
        this.bsx = 0.4
        this.bsy = 0.25
        this.bsz = 0.5

        this.addButons(actions)

        this.initMaterials()
        this.calculateSpacing()
    }

    addButons(actions) {
        for (let action in actions) {
            this.buttons.set(action, new MyButton(this.scene, actions[action][0], actions[action][1]))
        }
    }

    removeButton(id) {
        this.buttons.delete(id)
    }

    initMaterials() {
        this.panel_material = new CGFappearance(this.scene);
        this.panel_material.setAmbient(1.0,1.0,1.0,1.0);
        this.panel_material.setDiffuse(1.0,1.0,1.0,1.0);
        this.panel_material.setSpecular(1.0,1.0,1.0,1.0);
        this.panel_material.setShininess(100.0);
        this.panel_tex = new CGFtexture(this.scene, './scenes/images/panel.png')
        this.panel_material.setTexture(this.panel_tex)
    }

    display() {
        this.activeButtons = (this.orchestrator.state.getGameMenuButtons() == null)? this.activeButtons :  this.orchestrator.state.getGameMenuButtons()

        this.scene.pushMatrix()

        let i = 0
        let start = 0
        this.buttons.forEach((button, key) => {
            let state = (this.activeButtons.includes(key))? 0 : -1
            if (key === 'front') {
                state = (this.scene.currentGameCamera == 'game')? 1 : state
            } else if (key === 'top') {
                state = (this.scene.currentGameCamera == 'top')? 1 : state
            } else if (key === 'movie') {
                state = (this.orchestrator.state instanceof MovieState)? 1 : state
            }
            button.setState(state)
            start += this.displayButton(button, i, start)
            i++
        })
        
        this.panel_material.apply()
        this.scene.pushMatrix()
        this.scene.scale(1, 1, this.width)
        this.panel.display()
        this.scene.popMatrix()

        this.scene.popMatrix()
    }

    displayButton(button, i, start) {
        this.scene.pushMatrix()
        this.scene.translate(0, 0, this.width * 0.5 - this.spacing - start - button.button_size * this.bsx * 0.5)
        this.scene.rotate(Math.PI/2, 0, 1, 0)
        this.scene.scale(this.bsx, this.bsy, this.bsz)
        this.scene.registerForPick(500 + i, button)
        button.display()
        this.scene.popMatrix()
        return button.button_size * this.bsx + this.spacing
    }

    calculateSpacing() {
        let sum_bw = 0
        this.buttons.forEach((button) => {
            sum_bw += button.button_size
        })
        this.spacing = (this.width - sum_bw * this.bsx) / (this.buttons.size + 1)
    }
}