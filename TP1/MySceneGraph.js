const DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var VIEWS_INDEX = 1;
var ILLUMINATION_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var NODES_INDEX = 6;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * Constructor for MySceneGraph class.
     * Initializes necessary variables and starts the XML file reading process.
     * @param {string} filename - File that defines the 3D scene
     * @param {XMLScene} scene
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;
        
        this.http = new XMLHttpRequest();

        this.cameras = new Map();
        this.nodes = new Map();
        this.textures = new Map();
        this.materials = new Map();

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lsf")
            return "root tag <lsf> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <initials>
        var index;
        if ((index = nodeNames.indexOf("initials")) == -1)
            return "tag <initials> missing";
        else {
            if (index != INITIALS_INDEX)
                this.onXMLMinorError("tag <initials> out of order " + index);

            //Parse initials block
            if ((error = this.parseInitials(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <illumination>
        if ((index = nodeNames.indexOf("illumination")) == -1)
            return "tag <illumination> missing";
        else {
            if (index != ILLUMINATION_INDEX)
                this.onXMLMinorError("tag <illumination> out of order");

            //Parse illumination block
            if ((error = this.parseIllumination(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <nodes>
        if ((index = nodeNames.indexOf("nodes")) == -1)
            return "tag <nodes> missing";
        else {
            if (index != NODES_INDEX)
                this.onXMLMinorError("tag <nodes> out of order");

            //Parse nodes block
            if ((error = this.parseNodes(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <initials> block. 
     * @param {initials block element} initialsNode
     */
    parseInitials(initialsNode) {
        var children = initialsNode.children;
        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var rootIndex = nodeNames.indexOf("root");
        var referenceIndex = nodeNames.indexOf("reference");

        // Get root of the scene.
        if(rootIndex == -1)
            return "No root id defined for scene.";

        var rootNode = children[rootIndex];
        var id = this.reader.getString(rootNode, 'id');
        if (id == null)
            return "No root id defined for scene.";

        this.idRoot = id;

        // Get axis length        
        if(referenceIndex == -1)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        var refNode = children[referenceIndex];
        var axis_length = this.reader.getFloat(refNode, 'length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed initials");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseViews(viewsNode) {
        var children = viewsNode.children;

        this.defaultCameraID = this.reader.getString(viewsNode, "default");
        if (this.defaultCameraID == null)
            return "No default id defined for scene.";

        for (var i = 0; i < children.length; i++) {
            var error = null;
            if (children[i].nodeName === "perspective") 
                error = this.createPerspective(children[i]);
            else if (children[i].nodeName === "ortho")
                error = this.createOrtho(children[i]);
            else {
                this.onXMLMinorError("Unknown Views Node Name <" + children[i].nodeName + ">!");
                continue;
            }
            if (error != null) return error;
        }

        if (this.cameras.size < 1) {
            this.cameras.set(this.defaultCameraID, {type:"perspective", near:0.1, far:500, angle:0.4, from:vec3.fromValues(15, 15, 15), to:vec3.fromValues(0, 0, 0)});
            this.onXMLMinorError("At least one view is needed! Default view created!");
            return null;
        }

        if(!this.cameras.has(this.defaultCameraID))
            return "Default camera ID doesn't exist!";

        return null;
    }

    createPerspective(view) {
        var id = this.reader.getString(view, "id");

        if (this.cameras.has(id))
            return "ID must be unique for each camera (conflict: ID = " + id + ")";

        var near = this.reader.getFloat(view, "near");
        var far = this.reader.getFloat(view, "far");
        var angle = this.reader.getFloat(view, "angle");

        if (near == null || isNaN(near))
            return "Camera '" + id + "' -> Unable to parse 'near' value";
        else if (far == null || isNaN(far))
            return "Camera '" + id + "' -> Unable to parse 'far' value";
        else if (angle == null || isNaN(angle))
            return "Camera '" + id + "' -> Unable to parse 'angle' value";

        var children = view.children;
        var childNames = [];
        for (var i = 0; i < children.length; i++)
            childNames.push(children[i].nodeName);

        // Read 'from' vector
        var fromIndex = childNames.indexOf("from");
        if (fromIndex < 0)
            return "Camera '" + id + "' -> Missing node 'from'!";

        var from = this.parseCoordinates3D(children[fromIndex], "'from'");
        if (typeof from === 'string' || from instanceof String)
            return "Camera '" + id + "' -> " + from;
            
        // Read 'to' vector
        var toIndex = childNames.indexOf("to");
        if (toIndex < 0)
            return "Camera '" + id + "' -> Missing node 'to'!";

        var to = this.parseCoordinates3D(children[toIndex], "'to'");
        if (typeof to === 'string' || to instanceof String)
            return "Camera '" + id + "' -> " + to;

        this.cameras.set(id, {type:"perspective", near:near, far:far, angle:angle, from:from, to:to});

        return null;
    }

    createOrtho(view) {
        var id = this.reader.getString(view, "id");
        
        if (this.cameras.has(id))
            return "ID must be unique for each camera (conflict: ID = " + id + ")";

        var near = this.reader.getFloat(view, "near");
        var far = this.reader.getFloat(view, "far");
        var left = this.reader.getFloat(view, "left");
        var right = this.reader.getFloat(view, "right");
        var top = this.reader.getFloat(view, "top");
        var bottom = this.reader.getFloat(view, "bottom");

        if (near == null || isNaN(near))
            return "Camera '" + id + "' -> Unable to parse 'near' value";
        else if (far == null || isNaN(far))
            return "Camera '" + id + "' -> Unable to parse 'far' value";
        else if (left == null || isNaN(left))
            return "Camera '" + id + "' -> Unable to parse 'left' value";
        else if (right == null || isNaN(right))
            return "Camera '" + id + "' -> Unable to parse 'right' value";
        else if (top == null || isNaN(top))
            return "Camera '" + id + "' -> Unable to parse 'top' value";
        else if (bottom == null || isNaN(bottom))
            return "Camera '" + id + "' -> Unable to parse 'bottom' value";

        var children = view.children;
        var childNames = [];
        for (var i = 0; i < children.length; i++)
            childNames.push(children[i].nodeName);

        // Read 'from' vector
        var fromIndex = childNames.indexOf("from");
        if (fromIndex < 0)
            return "Camera '" + id + "' -> Missing node 'from'!";

        var from = this.parseCoordinates3D(children[fromIndex], "'from'");
        if (typeof from === 'string' || from instanceof String)
            return "Camera '" + id + "' -> " + from;
            
        // Read 'to' vector
        var toIndex = childNames.indexOf("to");
        if (toIndex < 0)
            return "Camera '" + id + "' -> Missing node 'to'!";

        var to = this.parseCoordinates3D(children[toIndex], "'to'");
        if (typeof to === 'string' || to instanceof String)
            return "Camera '" + id + "' -> " + to;
            
        // Read 'up' vector
        var up = [0,1,0];
        var upIndex = childNames.indexOf("up");
        if (upIndex >= 0) {
            up = this.parseCoordinates3D(children[upIndex], "'up'");
            if (typeof up === 'string' || up instanceof String)
                return "Camera '" + id + "' -> " + up;
        }

        this.cameras.set(id, {type:"ortho", near:near, far:far, left:left, right:right, top:top, bottom:bottom, from:from, to:to, up:up});

        return null;
    }

    /**
     * Parses the <illumination> node.
     * @param {illumination block element} illuminationsNode
     */
    parseIllumination(illuminationsNode) {

        var children = illuminationsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        if (ambientIndex < 0)
            return "No ambient illumination defined!"
        if (backgroundIndex < 0)
            return "No background illumination defined!"

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed Illumination.");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = new Map();
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "light") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["enable", "position", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["boolean","position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "boolean")
                        var aux = this.parseBoolean(grandChildren[attributeIndex], "value", "enabled attribute for light of ID" + lightId);
                    else if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (typeof aux === 'string')
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }
            
            numLights++;
            if (numLights > 8) {
                this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights"); 
                break;
            }
            else
                this.lights.set(lightId, global);
        }

        if (numLights == 0)
            return "at least one light must be defined";

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;

        for(let j = 0; j < children.length; j++) {

            var textureId = this.reader.getString(children[j], "id");
            var texturePath = this.reader.getString(children[j], "path");

            if (textureId == null)
                return "No ID defined for texture";

            if (this.textures.has(textureId)) 
                return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

            if (texturePath == null)
                return "No path defined for texture '" + textureId + "'";

            if (this.checkFilePath(texturePath) === false)
                this.onXMLMinorError("Texture file not found of texture '" + textureId + "'");

            this.textures.set(textureId, texturePath);
        }

        if(this.textures.size === 0) 
            return "No textures defined!";

        return null;
    }

    checkFilePath(path) {
        this.http.open('HEAD', path, false);
        this.http.send();
        return (this.http.status === 200);
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials.has(materialID))
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";


            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var shininessIndex = nodeNames.indexOf("shininess");
            var ambientIndex = nodeNames.indexOf("ambient");
            var diffuseIndex = nodeNames.indexOf("diffuse");
            var specularIndex = nodeNames.indexOf("specular");
            var emissiveIndex = nodeNames.indexOf("emissive");
            
            var shininess = this.reader.getFloat(grandChildren[shininessIndex], "value");
            var ambient = this.parseColor(grandChildren[ambientIndex], "Ambient Color");
            var diffuse = this.parseColor(grandChildren[diffuseIndex], "Diffuse Color");
            var specular = this.parseColor(grandChildren[specularIndex], "Specular Color");
            var emissive = this.parseColor(grandChildren[emissiveIndex], "Emissive Color");

            if (shininess == null || isNaN(shininess))
                return "Material '" + materialID + "' -> Unable to parse 'shininess' value";
            if (!Array.isArray(ambient))
                return "Material '" + materialID + "' -> " + ambient;
            if (!Array.isArray(diffuse))
                return "Material '" + materialID + "' -> " + diffuse;
            if (!Array.isArray(specular))
                return "Material '" + materialID + "' -> " + specular;
            if (!Array.isArray(emissive))
                return "Material '" + materialID + "' -> " + emissive;

            this.materials.set(materialID, {shininess:shininess, ambient:ambient, diffuse:diffuse, specular:specular, emissive:emissive});
        }

        if(this.materials.size === 0) 
            return "No materials defined!";

        return null;
    }

    /**
     * Parses the <nodes> block.
     * @param {nodes block element} nodesNode
     */
    parseNodes(nodesNode) {
        var children = nodesNode.children;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of nodes.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "node") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current node.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "no ID defined for nodeID";

            // Checks for repeated IDs.
            if (this.nodes.has(nodeID))
                return "ID must be unique for each node (conflict: ID = " + nodeID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationsIndex = nodeNames.indexOf("transformations");
            var materialIndex = nodeNames.indexOf("material");
            var textureIndex = nodeNames.indexOf("texture");
            var descendantsIndex = nodeNames.indexOf("descendants");

            if (nodeNames.length !== 4) {
                return "Invalid number of nodes inside node: " + nodeID;
            } else if (transformationsIndex < 0) {
                return "Missing Transformations node in node: " + nodeID;
            } else if (materialIndex < 0) {
                return "Missing Material node in node: " + nodeID;
            } else if (textureIndex < 0) {
                return "Missing Texture node in node: " + nodeID;
            } else if (descendantsIndex < 0) {
                return "Missing Descendants node in node: " + nodeID;
            }

            var error = this.parseNode(nodeID, 
                grandChildren[materialIndex], 
                grandChildren[textureIndex],
                grandChildren[transformationsIndex],
                grandChildren[descendantsIndex]);

            if (error) return error;
        }

        if (this.nodes.size === 0) 
            return "No nodes defined!";

        if (!this.nodes.has(this.idRoot))
            return "Root node defined in initials does not exist!";
    }

    parseNode(id, material, texture, transformationsNode, descendants) {
        // Material
        var materialID = this.reader.getString(material, "id");
        if (materialID != "null" && !this.materials.has(materialID))
            return "Node '" + id + "' -> " + "Material hasn't been defined!";

        // Texture
        var textureID = this.reader.getString(texture, "id");
        if (textureID != "null" && textureID != "clear" && !this.textures.has(textureID))
            return "Node '" + id + "' -> " + "Texture hasn't been defined!";

        var textureChildren = texture.children;
        var textureNodeNames = [];
        for (var j = 0; j < textureChildren.length; j++) {
            textureNodeNames.push(textureChildren[j].nodeName);
        }
        var amplificationIndex = textureNodeNames.indexOf("amplification");

        var afs = 1, aft = 1;
        if (amplificationIndex >= 0) {
            let afs_t = this.reader.getFloat(textureChildren[amplificationIndex],"afs");
            let aft_t = this.reader.getFloat(textureChildren[amplificationIndex],"aft");

            if (afs_t != null && !isNaN(afs_t) && afs_t != 0) 
                afs = afs_t; 
            else
                this.onXMLMinorError("Unable to parse afs value for node '" + id + "'; Assuming afs=1.");
            if (aft_t != null && !isNaN(aft_t) && aft_t != 0)
                aft = aft_t;
            else
                this.onXMLMinorError("Unable to parse aft value for node '" + id + "'; Assuming aft=1.");
        }

        // Transformations
        var transformations = [];
        var children = transformationsNode.children;
        var transform;
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName === "translation") {
                transform = this.parseTranslation(children[i]);
            } else if (children[i].nodeName === "rotation") {
                transform = this.parseRotation(children[i]);
            } else if (children[i].nodeName === "scale") {
                transform = this.parseScale(children[i]);
            } else {
                return "Node '" + id + "' -> " + "Invalid Transformation Name";
            }

            if (typeof transform === 'string' || transform instanceof String)
                return "Node '" + id + "' -> " + transform;

            transformations.push(transform);
        }

        // Descendants
        var children = [];
        var descendantNodes = descendants.children;
        for (var i = 0; i < descendantNodes.length; i++) {
            if (descendantNodes[i].nodeName === "noderef") {
                var childId = this.reader.getString(descendantNodes[i], "id");
                if (childId === id || childId === null)
                    return "Node '" + id + "' -> " + "Node can not be child of himself neither have a null id!";
                children.push(childId);
            } else if (descendantNodes[i].nodeName === "leaf") {
                var leaf = this.parseLeaf(descendantNodes[i]);
                if (typeof leaf === 'string' || leaf instanceof String)
                    return "Node '" + id + "' -> " + leaf;
                children.push(leaf);
            } else {
                return "Node '" + id + "' -> " + "Invalid Descendant Node Name <" + descendantNodes[i].nodeName + ">";
            }
        }
        if (!children.length) return "Node '" + id + "' -> " + "No children defined!";

        this.nodes.set(id,{material:materialID, texture:{id:textureID, afs:afs, aft:aft}, transformations:transformations, children:children});

        return null;
    }

    parseTranslation(transformation) {
        let xValue = this.reader.getFloat(transformation, "x");
        let yValue = this.reader.getFloat(transformation, "y");
        let zValue = this.reader.getFloat(transformation, "z");

        if (xValue == null || isNaN(xValue))
            return "Unable to parse x value for translation";
        else if (yValue == null || isNaN(yValue))
            return "Unable to parse y value for translation";
        else if (zValue == null || isNaN(zValue))
            return "Unable to parse z value for translation";

        return {type: "translation", x:xValue, y:yValue, z:zValue};
    }

    parseRotation(transformation) {
        let axisValue = this.reader.getString(transformation, "axis");
        let angleValue = this.reader.getFloat(transformation, "angle") * DEGREE_TO_RAD;
        
        if (axisValue == null || this.axisCoords[axisValue] == undefined)
            return "Unable to parse axis value for rotation";
        else if (angleValue == null || isNaN(angleValue))
            return "Unable to parse angle value for rotation";

        return {type: "rotation", axis:axisValue, angle:angleValue};
    }

    parseScale(transformation) {
        let sxValue = this.reader.getFloat(transformation, "sx");
        let syValue = this.reader.getFloat(transformation, "sy");
        let szValue = this.reader.getFloat(transformation, "sz");

        if (sxValue == null || isNaN(sxValue))
            return "Unable to parse sx value for scale";
        else if (syValue == null || isNaN(syValue))
            return "Unable to parse sy value for scale";
        else if (szValue == null || isNaN(szValue))
            return "Unable to parse sz value for scale";

        return {type: "scale", sx:sxValue, sy:syValue, sz:szValue};
    }

    parseLeaf(leaf) {
        var type = this.reader.getString(leaf, "type");
        if (type === "triangle") {

            var x1 = this.reader.getFloat(leaf,'x1');
            var y1 = this.reader.getFloat(leaf,'y1');
            var x2 = this.reader.getFloat(leaf,'x2');
            var y2 = this.reader.getFloat(leaf,'y2');
            var x3 = this.reader.getFloat(leaf,'x3');
            var y3 = this.reader.getFloat(leaf,'y3');

            if (x1 == null || x2 == null || x3 == null || y1 == null || y2 == null || y3 == null)
                return "Unable to parse values for triangle";
            else if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(x3) || isNaN(y3))
                return "Unable to parse values for triangle";
            
            return {type: type, x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3};

        } else if (type === "rectangle") {

            var x1 = this.reader.getFloat(leaf,'x1');
            var y1 = this.reader.getFloat(leaf,'y1');
            var x2 = this.reader.getFloat(leaf,'x2');
            var y2 = this.reader.getFloat(leaf,'y2');

            if (x1 == null || x2 == null || y1 == null || y2 == null)
                return "Unable to parse values for rectangle";
            else if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2))
                return "Unable to parse values for rectangle";
            
            return {type: type, x1:x1, y1:y1, x2:x2, y2:y2};
            
        } else if (type === "cylinder") {
            
            var height = this.reader.getFloat(leaf,'height');
            var topR = this.reader.getFloat(leaf,'topRadius');
            var bottomR = this.reader.getFloat(leaf,'bottomRadius');
            var stacks = this.reader.getFloat(leaf,'stacks');
            var slices = this.reader.getFloat(leaf,'slices');

            if (height == null || topR == null || bottomR == null || stacks == null || slices == null)
                return "Unable to parse values for cylinder";
            else if (isNaN(height) || isNaN(topR) || isNaN(bottomR) || isNaN(stacks) || isNaN(slices))
                return "Unable to parse values for cylinder";
            
            return {type: type, height:height, topRadius:topR, bottomRadius:bottomR, stacks:stacks, slices:slices};

        } else if (type === "sphere") {
            
            var radius = this.reader.getFloat(leaf,'radius');
            var stacks = this.reader.getFloat(leaf,'stacks');
            var slices = this.reader.getFloat(leaf,'slices');

            if (radius == null || stacks == null || slices == null)
                return "Unable to parse values for cylinder";
            else if (isNaN(radius) || isNaN(stacks) || isNaN(slices))
                return "Unable to parse values for cylinder";
            
            return {type: type, radius:radius, stacks:stacks, slices:slices};

        } else if (type === "torus") {
            
            var inner = this.reader.getFloat(leaf,'inner');
            var outer = this.reader.getFloat(leaf,'outer');
            var slices = this.reader.getFloat(leaf,'slices');
            var loops = this.reader.getFloat(leaf,'loops');

            if (inner == null || outer == null || slices == null || loops == null)
                return "Unable to parse values for cylinder";
            else if (isNaN(inner) || isNaN(outer) || isNaN(slices) || isNaN(loops))
                return "Unable to parse values for cylinder";
            
            return {type: type, inner:inner, outer:outer, slices:slices, loops:loops};

        } else {
            return "Invalid Primitive Type <" + type + ">";
        }
    }

    parseBoolean(node, name, messageError) {
        var boolVal = this.reader.getBoolean(node, name);
        if (!(boolVal != null && !isNaN(boolVal) && (boolVal == true || boolVal == false))) {
          this.onXMLMinorError("unable to parse value component " + messageError + "; assuming 'value = 1'");
          return true;
        }
        return boolVal;
    }
    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.scene.nodes.get(this.idRoot).display()
    }
}