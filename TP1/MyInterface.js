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
        this.timeOfDay = "Night";

        this.initKeys();

        return true;
    }

    /**
     * Updates GUI controls after scene has been loaded
     */
    updateGui() {
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');
        this.gui.add(this.scene, 'displayLights').name('Display Lights');
        this.gui.add(this.scene,'currentCameraID',Array.from(this.scene.cameras.keys())).onChange(this.scene.updateCamera.bind(this.scene)).name('Camera');
        this.createLightCheckboxes();
    }

    /**
     * Creates a checkbox to toggle each light on/off
     */
    createLightCheckboxes() {
        var group = this.gui.addFolder("Lights");
        var data = {}; // Used to store lights for building checkboxes

        group.add(this, 'timeOfDay', ['Day', 'Night']).onChange(val => {this.changeTimeOfDay(val)}).name("Time Of Day");

        for (let [id, light] of this.scene.graph.lights) {
            data[`light_${id}`] = light[0];
            this.lightControllers[id] = group.add(data, `light_${id}`).name(`Light ${id}`).listen().onChange(val => {this.scene.toggleLight(id, val);});
        }
    }

    /**
     * Specific to native scene. Creates dropdown to change lights according to a Day/Night mood.
     * @param {*} time 
     */
    changeTimeOfDay(time) {
        if (time == "Night") {
            this.lightControllers['day'].setValue(false);
            this.lightControllers['night'].setValue(true);
            this.lightControllers['lantern'].setValue(true);
        }
        else {
            this.lightControllers['day'].setValue(true);
            this.lightControllers['night'].setValue(false);
            this.lightControllers['lantern'].setValue(false);
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