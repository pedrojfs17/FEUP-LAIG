class MyGamePanel extends CGFobject {
    constructor(scene, orchestrator) {
        super(scene)
        this.scene = scene
        this.orchestrator = orchestrator

        this.panel = new MyPlane(scene, 10, 10)

        this.buttons = new Map()

        this.gameParams = {
            player1 : {
                type: "human"
            },
            player2 : {
                type: "human"
            },
            board: {
                rows: 6,
                columns: 6
            },
            time: 30
        }

        this.addButons()
        this.initMaterials()
    }

    addButons() {
        this.buttons.set('player1H', new MyButton(this.scene, 'Human', () => {
            this.gameParams.player1 = {type: "human"}
            this.buttons.get('player1H').setState(1)
            this.buttons.get('player1Reasy').setState(-1)
            this.buttons.get('player1Rhard').setState(-1)
            this.buttons.get('player1R').setState(0)
        }))
        this.buttons.get('player1H').setState(1)
        this.buttons.set('player1R', new MyButton(this.scene, 'Robot', () => {
            this.gameParams.player1 = {type: "robot", difficulty: 1}
            this.buttons.get('player1Reasy').setState(1)
            this.buttons.get('player1Rhard').setState(0)
            this.buttons.get('player1H').setState(0)
            this.buttons.get('player1R').setState(1)
        }))
        this.buttons.set('player1Reasy', new MyButton(this.scene, 'Easy', () => {
            this.gameParams.player1 = {type: "robot", difficulty: 1}
            this.buttons.get('player1Reasy').setState(1)
            this.buttons.get('player1Rhard').setState(0)
            this.buttons.get('player1H').setState(0)
            this.buttons.get('player1R').setState(1)
        }))
        this.buttons.set('player1Rhard', new MyButton(this.scene, 'Hard', () => {
            this.gameParams.player1 = {type: "robot", difficulty: 2}
            this.buttons.get('player1Reasy').setState(0)
            this.buttons.get('player1Rhard').setState(1)
            this.buttons.get('player1H').setState(0)
            this.buttons.get('player1R').setState(1)
        }))
        
        this.buttons.set('player2H', new MyButton(this.scene, 'Human', () => {
            this.gameParams.player2 = {type: "human"}
            this.buttons.get('player2H').setState(1)
            this.buttons.get('player2Reasy').setState(-1)
            this.buttons.get('player2Rhard').setState(-1)
            this.buttons.get('player2R').setState(0)
        }))
        this.buttons.get('player2H').setState(1)
        this.buttons.set('player2R', new MyButton(this.scene, 'Robot', () => {
            this.gameParams.player2 = {type: "robot", difficulty: 1}
            this.buttons.get('player2Reasy').setState(1)
            this.buttons.get('player2Rhard').setState(0)
            this.buttons.get('player2H').setState(0)
            this.buttons.get('player2R').setState(1)
        }))
        this.buttons.set('player2Reasy', new MyButton(this.scene, 'Easy', () => {
            this.gameParams.player2 = {type: "robot", difficulty: 1}
            this.buttons.get('player2Reasy').setState(1)
            this.buttons.get('player2Rhard').setState(0)
            this.buttons.get('player2H').setState(0)
            this.buttons.get('player2R').setState(1)
        }))
        this.buttons.set('player2Rhard', new MyButton(this.scene, 'Hard', () => {
            this.gameParams.player2 = {type: "robot", difficulty: 2}
            this.buttons.get('player2Reasy').setState(0)
            this.buttons.get('player2Rhard').setState(1)
            this.buttons.get('player2H').setState(0)
            this.buttons.get('player2R').setState(1)
        }))
        
        this.buttons.set('board6x6', new MyButton(this.scene, '6x6', () => {
            this.gameParams.board = {rows: 6, columns: 6}
            this.buttons.get('board6x6').setState(1)
            this.buttons.get('board9x9').setState(0)
        }))
        this.buttons.get('board6x6').setState(1)
        this.buttons.set('board9x9', new MyButton(this.scene, '9x9', () => {
            this.gameParams.board = {rows: 9, columns: 9}
            this.buttons.get('board6x6').setState(0)
            this.buttons.get('board9x9').setState(1)
        }))
        
        this.buttons.set('time15', new MyButton(this.scene, '15s', () => {
            this.gameParams.time = 15
            this.buttons.get('time15').setState(1)
            this.buttons.get('time30').setState(0)
            this.buttons.get('time60').setState(0)
        }))
        this.buttons.set('time30', new MyButton(this.scene, '30s', () => {
            this.gameParams.time = 30
            this.buttons.get('time15').setState(0)
            this.buttons.get('time30').setState(1)
            this.buttons.get('time60').setState(0)
        }))
        this.buttons.get('time30').setState(1)
        this.buttons.set('time60', new MyButton(this.scene, '60s', () => {
            this.gameParams.time = 60
            this.buttons.get('time15').setState(0)
            this.buttons.get('time30').setState(0)
            this.buttons.get('time60').setState(1)
        }))

        this.buttons.set('play', new MyButton(this.scene, 'Play', () => {
            this.orchestrator.playGame(this.gameParams)
        }))
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
        this.scene.pushMatrix()
        
        this.panel_material.apply()
        this.scene.pushMatrix()
        this.scene.scale(12, 1, 10)
        this.panel.display()
        this.scene.popMatrix()

        this.scene.pushMatrix()
        this.scene.translate(-3, 0, -4)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(600, this.buttons.get('player1H'))
        this.buttons.get('player1H').display()
        this.scene.popMatrix()

        this.scene.pushMatrix()
        this.scene.translate(3, 0, -4)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(601, this.buttons.get('player2H'))
        this.buttons.get('player2H').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(-3, 0, -3)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(602, this.buttons.get('player1R'))
        this.buttons.get('player1R').display()
        this.scene.popMatrix()

        this.scene.pushMatrix()
        this.scene.translate(3, 0, -3)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick()
        this.scene.registerForPick(603, this.buttons.get('player2R'))
        this.buttons.get('player2R').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(-4.5, 0, -2)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(604, this.buttons.get('player1Reasy'))
        this.buttons.get('player1Reasy').display()
        this.scene.popMatrix()

        this.scene.pushMatrix()
        this.scene.translate(-1.5, 0, -2)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(605, this.buttons.get('player1Rhard'))
        this.buttons.get('player1Rhard').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(1.5, 0, -2)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(606, this.buttons.get('player2Reasy'))
        this.buttons.get('player2Reasy').display()
        this.scene.popMatrix()

        this.scene.pushMatrix()
        this.scene.translate(4.5, 0, -2)
        this.scene.scale(0.4, 0.25, 0.5)
        this.scene.registerForPick(607, this.buttons.get('player2Rhard'))
        this.buttons.get('player2Rhard').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(-3, 0, 0)
        this.scene.scale(0.8, 0.25, 1)
        this.scene.registerForPick(608, this.buttons.get('board6x6'))
        this.buttons.get('board6x6').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(3, 0, 0)
        this.scene.scale(0.8, 0.25, 1)
        this.scene.registerForPick(609, this.buttons.get('board9x9'))
        this.buttons.get('board9x9').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(3, 0, 0)
        this.scene.scale(0.8, 0.25, 1)
        this.scene.registerForPick(609, this.buttons.get('board9x9'))
        this.buttons.get('board9x9').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(-3, 0, 1.75)
        this.scene.scale(0.6, 0.25, 0.8)
        this.scene.registerForPick(610, this.buttons.get('time15'))
        this.buttons.get('time15').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(0, 0, 1.75)
        this.scene.scale(0.6, 0.25, 0.8)
        this.scene.registerForPick(611, this.buttons.get('time30'))
        this.buttons.get('time30').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(3, 0, 1.75)
        this.scene.scale(0.6, 0.25, 0.8)
        this.scene.registerForPick(612, this.buttons.get('time60'))
        this.buttons.get('time60').display()
        this.scene.popMatrix()
        
        this.scene.pushMatrix()
        this.scene.translate(0, 0, 3.5)
        this.scene.scale(0.8, 0.25, 1)
        this.scene.registerForPick(613, this.buttons.get('play'))
        this.buttons.get('play').display()
        this.scene.popMatrix()

        this.scene.popMatrix()
    }
}