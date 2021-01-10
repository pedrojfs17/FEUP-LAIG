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
                else // Process leaf node
                    children.push(this.createPrimitive(child));
            }
            node.setChildren(children);
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
    }
}