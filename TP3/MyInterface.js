/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.lightControllers = [];

        this.initKeys();

        return true;
    }

    /**
     * Creates the GUI general buttons
     */
    drawGui() {
        let gameCommandsFolder = this.gui.addFolder("Game Commands")
        gameCommandsFolder.open()
        gameCommandsFolder.add(this.scene.gameorchestrator, 'resetGame').name('Reset Game');
        gameCommandsFolder.add(this.scene.gameorchestrator, 'undoButton').name('Undo');
        gameCommandsFolder.add(this.scene.gameorchestrator.prolog, 'disconnectServer').name('Close Server');
        gameCommandsFolder.add(this.scene,'changeToGameCamera').name('Game Camera')
        gameCommandsFolder.add(this.scene,'changeToSceneCamera').name('Scene Camera')

        let piecesFolder = this.gui.addFolder('Pieces')
        piecesFolder.add(this.scene.gameorchestrator, 'pieceGeometry', ['Cube', 'Cylinder', 'Pyramid', 'Torus']).name('Geometry')

        let animations = this.gui.addFolder("Animations")
        let cameraAnim = animations.addFolder("Camera")
        cameraAnim.add(this.scene.camera, 'easingFunction', Object.getOwnPropertyNames(EasingFunctions).filter(prop => typeof EasingFunctions[prop] === "function")).name('Function')
        cameraAnim.add(this.scene.camera, 'animationTime', 0.1, 2, 0.1).name('Time')
        let pieceAnim = animations.addFolder("Move")
        pieceAnim.add(this.scene.gameorchestrator, 'animationTime', 0.1, 2, 0.1).name('Time')

        let extrasFolder = this.gui.addFolder("Extras")
        extrasFolder.add(this.scene, 'displayAxis').name('Display Axis');
    }

    /**
     * Updates GUI controls after scene has been loaded
     */
    updateThemeGui() {
        if (this.cameras) this.gui.removeFolder(this.cameras)
        this.cameras = this.gui.addFolder("Camera")
        this.cameras.add(this.scene,'currentCameraID',Array.from(this.scene.cameras.keys())).onChange(this.scene.updateCamera.bind(this.scene)).name('Camera');
        
        if (this.lights) this.gui.removeFolder(this.lights)
        this.createLightCheckboxes();
    }

    /**
     * Updates the theme selector box with all the themes loaded
     */
    updateThemes() {
        this.gui.add(this.scene.sceneParser, 'currentTheme', Array.from(this.scene.sceneParser.sceneGraphs.keys()))
                .onChange(val => {this.scene.sceneParser.changeTheme(val)})
                .name('Theme');
        this.updateThemeGui()
    }

    /**
     * Creates a checkbox to toggle each light on/off
     */
    createLightCheckboxes() {
        this.lights = this.gui.addFolder("Lights");
        
        this.lights.add(this.scene, 'displayLights').name('Display Lights');

        var data = {}; // Used to store lights for building checkboxes

        for (let [id, light] of this.scene.graph.lights) {
            data[`light_${id}`] = light[0];
            this.lightControllers[id] = this.lights.add(data, `light_${id}`).name(`Light ${id}`).listen().onChange(val => {this.scene.toggleLight(id, val);});
        }
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}