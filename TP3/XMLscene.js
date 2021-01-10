/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();
        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initDefaultCamera();
        this.initFonts();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(1000/90.0);

        this.loadingProgressObject=new MyRectangle(this, -1, -.1, 1, .1);
        this.loadingProgress=0;

        this.defaultAppearance=new CGFappearance(this);

        // Connects to MyInterface
        this.displayAxis = false;
        this.displayLights = false;

        this.textShader = new CGFshader(this.gl, "shaders/spritetext.vert", "shaders/spritetext.frag");

        this.setPickEnabled(true);

        this.sceneParser = new MySceneParser(this)

        this.tileTexture = new CGFtexture(this, "scenes/images/boardcell.png")
        this.gameorchestrator = new MyGameOrchestrator(this);
        
    }

    /**
     * Initializes the scene cameras.
     */
    initDefaultCamera() {
        // Loads default camera before scene is loaded
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Changes the active camera
     */
    updateCamera(camera) {
        if (camera) this.currentCameraID = camera
        this.camera.changeCamera(this.cameras.get(this.currentCameraID))
    }

    /**
     * Changes the game active camera
     */
    updateGameCamera(camera) {
        this.currentGameCamera = camera
        this.camera.changeCamera(this.gameCameras.get(camera))
    }

    /**
     * Changes the active camera to the game camera
     */
    changeToSceneCamera() {
        this.updateCamera(this.graph.defaultCameraID)
    }

    /**
     * Changes the active camera to the game camera
     */
    changeToGameCamera() {
        this.currentCameraID = 'game'
        this.currentGameCamera = 'game'
        this.camera.changeCamera(this.gameCameras.get('game'))
    }

    /**
     * Orbits the game camera of each to graph when a player is switched
     */
    updateGameCameras() {
        this.sceneParser.sceneGraphs.forEach(graph => {
            graph.gameCameras.get('game').orbit(CGFcameraAxis.Y, Math.PI)
        })
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        // To change themes, lights must all be turned off
        this.lights.forEach(light => {light.disable()})

        var i = 0; // Light index in this.lights array
        this.lightsMap = new Map(); // Map that associates light id with index for use with MyInterface

        // Reads the lights from the scene graph.
        for (let [key, light] of this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebCGF on default shaders.

            // Sets light parameters
            this.lights[i].setPosition(...light[1]);
            this.lights[i].setAmbient(...light[2]);
            this.lights[i].setDiffuse(...light[3]);
            this.lights[i].setSpecular(...light[4]);
            this.lights[i].setVisible(true);
            if (light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();

            this.lightsMap.set(key, i);

            i++;
        }
    }

    /**
     * Enables or disables a light, according to val
     */
    toggleLight(lightID, val) {
        const light_idx = this.lightsMap.get(lightID);

        if (val) {
            this.lights[light_idx].enable();
        } else {
            this.lights[light_idx].disable();
        }
    }

    /**
     * Initializes the scene materials with the values read from XML
     */
    initMaterials() {
        this.materials = this.graph.materials; // Map that stores scene materials by ID
        this.materialStack = [this.defaultAppearance]; // Stack used to apply the materials when traversing graph for display
    }

    /**
     * Initializes the scene textures with the textures specified in the XML
     */
    initTextures() {
        this.textures = this.graph.textures; // Map that stores textures by ID
        this.textureStack = [null]; // Stack used to apply the textures when traversing the graph for display
    }

    /**
     * Initializes the font spritesheet
     */
    initFonts() {
        this.font_spritesheet = new MySpriteSheet(this, './scenes/images/fonts.png', 26, 5);
        this.font_characters = {'0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '!':10, '?':11, '@':12, '#':13, '$':14, '%':15, '&':16, '\'':17, '"':18, '(':19, ')':20, '+':21, '-':22, '=':23, ',':24, '.':25,
                           'A':26, 'B':27, 'C':28, 'D':29, 'E':30, 'F':31, 'G':32, 'H':33, 'I':34, 'J':35, 'K':36, 'L':37, 'M':38, 'N':39, 'O':40, 'P':41, 'Q':42, 'R':43, 'S':44, 'T':45, 'U':46, 'V':47, 'W':48, 'X':49, 'Y':50, 'Z':51,
                           'a':52, 'b':53, 'c':54, 'd':55, 'e':56, 'f':57, 'g':58, 'h':59, 'i':60, 'j':61, 'k':62, 'l':63, 'm':64, 'n':65, 'o':66, 'p':67, 'q':68, 'r':69, 's':70, 't':71, 'u':72, 'v':73, 'w':74, 'x':75, 'y':76, 'z':77,
                           '<':78, '>':79, '[':80, ']':81, '{':82, '}':83, '\\':84, '/':85, '`':86, 'á':87, 'ã':88, 'à':89, 'é':90, 'ë':91, 'è':92, 'í':93, 'ó':94, 'õ':95, 'ú':96, 'ù':97, 'ü':98, 'ñ':99, 'Ç':100, 'ç':101, '¡':102, '¿':103,
                           '©':104, '®':105, '™':106, '·':107, '§':108, '†':109, '‡':110, '‐':111, '‒':112, '¶':113, '÷':114, '°':115, '¤':116, '¢':117, 'ß':118, 'Þ':119, ':':120, ';':121, '^':122, '~':123, '♂':124, '♀':125, '♥':126, '♪':127, '♫':128, '☼':129
                          };
    }

    /**
     * Change the current scene graph 
     * @param {MySceneGraph} graph 
     */
    setGraph(graph) {
        let first = !this.graph

        if (first) {
            this.camera = graph.camera
            this.currentGameCamera = 'game'
        }

        this.graph = graph

        this.axis = new CGFaxis(this, this.graph.referenceLength);
        this.gl.clearColor(...this.graph.background);
        this.setGlobalAmbientLight(...this.graph.ambient);

        this.initLights();
        this.initMaterials();
        this.initTextures();
        
        this.spritesheets = this.graph.spritesheets
        this.animations = this.graph.animations
        this.spriteAnimations = this.graph.spriteAnimations

        this.gameCameras = this.graph.gameCameras
        this.cameras = this.graph.cameras

        if (this.currentCameraID === 'game') {
            this.camera.changeCamera(this.gameCameras.get(this.currentGameCamera))
            this.currentCameraID = 'game'
        } else {
            this.camera.changeCamera(this.cameras.get(this.graph.defaultCameraID))
            this.currentCameraID = this.graph.defaultCameraID
        }

        this.gameorchestrator.setTheme(graph)

        if (first) this.interface.drawGui()
        this.interface.updateThemeGui()

        this.sceneInited = true
    }

    /**
     * Checks for key presses and rotates camera according to WASD
     */
    checkKeys() {
        if (this.gui.isKeyPressed("KeyD")) {
            this.camera.rotate(CGFcameraAxis.Y, -0.05);
        }
        if (this.gui.isKeyPressed("KeyA")) {
            this.camera.rotate(CGFcameraAxis.Y, 0.05);
        }
        if (this.gui.isKeyPressed("KeyW")) {
            this.camera.rotate(CGFcameraAxis.X, -0.05);
        }
        if (this.gui.isKeyPressed("KeyS")) {
            this.camera.rotate(CGFcameraAxis.X, 0.05);
        }
    }

    /**
     * Called periodically as per setUpdatePeriod, used to check for key presses
     */
    update(t) {
        this.checkKeys();
        
        if (!this.time) {
            this.time = t / 1000 % 1000;
            return;
        }

		var deltaTime = (t / 1000 % 1000) - this.time;
        this.time = t / 1000 % 1000;

        if (this.sceneInited) {
            this.spriteAnimations.forEach( (animation, id) => { 
                animation.update(deltaTime); 
            });

            this.animations.forEach( (animation, id) => { 
                animation.update(deltaTime); 
            });
            
            this.gameorchestrator.update(deltaTime);
            if (this.camera instanceof MyAnimatedCamera)
                this.camera.animate(deltaTime)
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        if (this.gameorchestrator)
		    this.gameorchestrator.managePick(this.pickMode, this.pickResults);
		this.clearPickRegistration();
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.pushMatrix();

        // Displays lights and updates scene lighting
        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(this.displayLights);
            this.lights[i].update();
        }

        // Draws loaded scene or loading animation
        if (this.sceneInited) {
            // Draw axis
            if (this.displayAxis)
                this.axis.display();
 
            this.defaultAppearance.apply();

            // Displays the scene (MySceneGraph function).
            this.gameorchestrator.display();
        }
        else
        {
            // Show some "loading" visuals
            this.defaultAppearance.apply();

            this.rotate(-this.loadingProgress/10.0,0,0,1);
            
            this.loadingProgressObject.display();
            this.loadingProgress++;
        }

        this.popMatrix();

        this.gl.disable(this.gl.BLEND);  
    }
}