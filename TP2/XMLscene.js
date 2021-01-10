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
        
        this.cameras = new Map();

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(50);

        this.loadingProgressObject=new MyRectangle(this, -1, -.1, 1, .1);
        this.loadingProgress=0;

        this.defaultAppearance=new CGFappearance(this);

        // Connects to MyInterface
        this.displayAxis = false;
        this.displayLights = true;

        this.textShader = new CGFshader(this.gl, "shaders/spritetext.vert", "shaders/spritetext.frag");

        this.spriteAnimations = [];
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        // Loads default camera before scene is loaded
        if (!this.sceneInited) {
            this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
            return;
        }

        // Loads defined cameras when scene is loaded
        for (let [id, camera] of this.graph.cameras) {
            this.createCamera(id, camera);
        }

        // Change to default camera
        this.currentCameraID = this.graph.defaultCameraID;
        this.updateCamera();
    }

    /**
     * Creates new camera object and adds it to this.cameras Map
     */
    createCamera(id, camera) {
        switch (camera.type) {
            case "perspective":
                this.cameras.set(id, new CGFcamera(camera.angle, camera.near, camera.far, camera.from, camera.to));
                return;
            case "ortho":
                this.cameras.set(id, new CGFcameraOrtho(camera.left, camera.right, camera.bottom, camera.top, camera.near, camera.far, camera.from, camera.to, camera.up));
                return;
            default:
                return;
        }
    }

    /**
     * Changes the active camera
     */
    updateCamera() {
        this.camera = this.cameras.get(this.currentCameraID);
        this.interface.setActiveCamera(this.camera);
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
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
        this.materials = new Map(); // Map that stores scene materials by ID
        this.materialStack = []; // Stack used to apply the materials when traversing graph for display
        this.materialStack.push(this.defaultAppearance);

        for (let [id, material] of this.graph.materials) {
            var mat = new CGFappearance(this);
            mat.setAmbient(...Object.values(material.ambient));
            mat.setDiffuse(...Object.values(material.diffuse));
            mat.setSpecular(...Object.values(material.specular));
            mat.setEmission(...Object.values(material.emissive));
            mat.setShininess(material.shininess);
            mat.setTextureWrap('REPEAT', 'REPEAT');
            this.materials.set(id, mat);
        }
    }

    /**
     * Initializes the scene textures with the textures specified in the XML
     */
    initTextures() {
        this.textures = new Map(); // Map that stores textures by ID
        this.textureStack = []; // Stack used to apply the textures when traversing the graph for display
        this.textureStack.push(null);

        for (let [id, texture] of this.graph.textures) {
            let tex = new CGFtexture(this, texture);
            this.textures.set(id, tex);
        }
    }

    /**
     * Initializes the scene spritesheets with the spritesheets specified in the XML
     */
    initSpritesheets() {
        this.spritesheets = new Map(); // Map that stores spritesheets by ID

        for (let [id, spritesheet] of this.graph.spritesheets) {
            let ss = new MySpriteSheet(this, spritesheet.path, spritesheet.sizeM, spritesheet.sizeN);
            this.spritesheets.set(id, ss);
        }
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
     * Initializes the scene animations with the animations specified in the XML
     */
    initAnimations() {
        this.animations = new Map();

        for (let [id, animation] of this.graph.animations) {
            let anim = new MyKeyframeAnimation(animation.keyframes);
            this.animations.set(id, anim);
        }
    }

    /** 
     * Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(...this.graph.background);

        this.setGlobalAmbientLight(...this.graph.ambient);

        this.initLights();
        this.initMaterials();
        this.initTextures();
        this.initSpritesheets();
        this.initFonts();

        this.initAnimations();

        // Create Nodes map and copy information from MySceneGraph
        this.nodes = new Map();
        for (var [id, info] of this.graph.nodes) {
            this.nodes.set(id, new Node(this, id, info));
        }

        // Process loaded nodes
        for(var [id, node] of this.nodes) {
            let children = []; // Children array

            // Process node children
            for(let child of node.nodeInfo.children) {
                if (typeof child === 'string') { // Process intermediate node
                    if (this.nodes.get(child) == undefined) {
                        this.graph.onXMLMinorError("Node '" + child + "', under node '" + id + "' hasn't been defined!");
                        continue;
                    }
                    else
                        children.push(this.nodes.get(child));
                }
                else {// Process leaf node
                    let leaf = this.createPrimitive(child);
                    if (typeof leaf === 'string') 
                        this.graph.onXMLMinorError(leaf + ", under node '" + id + "'!");
                    else if (leaf != null)
                        children.push(leaf);
                }
            }
            node.setChildren(children);

            node.setAnimation(this.animations.get(node.nodeInfo.animation));
        }

        // Check for graph anomalies, if graph OK, continue
        if (this.checkForGraphProblems() == null) {
            this.sceneInited = true;
            this.initCameras();
            this.interface.updateGui();
        }
    }

    /**
     * Creates a primitive object for a leaf node
     */
    createPrimitive(info) {
        switch(info.type) {
            case "rectangle":
                return new MyRectangle(this, info.x1, info.y1, info.x2, info.y2);
            case "triangle":
                return new MyTriangle(this, info.x1, info.y1, info.x2, info.y2, info.x3, info.y3);
            case "cylinder":
                return new MyCylinder(this, info.height, info.topRadius, info.bottomRadius, info.stacks, info.slices);
            case "sphere":
                return new MySphere(this, info.radius, info.stacks, info.slices);
            case "torus":
                return new MyTorus(this, info.inner, info.outer, info.slices, info.loops);
            case "spritetext":
                return new MySpriteText(this, info.text, this.font_spritesheet, this.font_characters);
            case "spriteanim":
                let spritesheet = this.spritesheets.get(info.ssid);
                if (spritesheet == null || spritesheet == undefined)
                    return "Spritesheet '" + info.ssid + "' hasn't been defined";
                let anim = new MySpriteAnimation(this, spritesheet, info.duration, info.startCell, info.endCell)
                this.spriteAnimations.push(anim);
                return anim;
            case "plane":
                return new MyPlane(this, info.npartsU, info.npartsV)
            case "patch":
                return new MyPatch(this, info.npointsU, info.npointsV, info.npartsU, info.npartsV, info.controlPoints)
            case "defbarrel":
                return new MyBarrel(this, info.base, info.middle, info.height, info.slices, info.stacks)
            default:
                return null;
        }
    }

    /**
     * Checks graph for anomalies, returns "Error" when anomaly is major, null when graph is OK or only minor anomalies found
     */
    checkForGraphProblems() {
        var visitedNodes = [];

        // Ensure there are no cycles in the node graph
        if (this.isGraphCyclic(visitedNodes)) {
            this.graph.onXMLError("Graph needs to be acyclic!");
            return "Error"
        }

        // Ensure every defined node is being used at least one time
        for(var [id, node] of this.nodes) {
            if (visitedNodes[id] == undefined)
                this.graph.onXMLMinorError("Node '" + id + "' is defined but never used!");
        }

        return null;
    }

    /**
     * Performs a DFS search on the graph to check for cycles
     */
    isGraphCyclic(visitedNodes) {
        var currentNodeStack = [];
        return this.visitNode(visitedNodes, currentNodeStack, this.graph.idRoot, this.nodes.get(this.graph.idRoot));   
    }

    /**
     * DFS helper function. Returns true if has a cycle, false otherwise.
     */
    visitNode(visitedNodes, currentNodeStack, id, node) {
        if(currentNodeStack[id]) // If node is in current stack, cycle detected
            return true;
        
        if(visitedNodes[id]) // If node is not in current stack and has already been visited, no need to check it again
            return false;
        
        // Updates flags
        visitedNodes[id] = true;
        currentNodeStack[id] = true;

        // Visits node children that are not leaf nodes
        for (let child of node.children) {
            if (child.id && this.visitNode(visitedNodes, currentNodeStack, child.id, child))
                return true;
        }
        
        // After all children have been visited, removes node from stack
        currentNodeStack[id] = false;

        return false;
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
        }
    }

    /**
     * Displays the scene.
     */
    display() {
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
            this.graph.displayScene();
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