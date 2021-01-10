class MySceneParser {
    /**
     * Constructor for the scene parser
     * @param {XMLscene} scene 
     */
    constructor(scene) {
        this.scene = scene

        this.fileNames = [
            'Alien.xml',
            'Boat.xml',
            'Hangar.xml',
        ]

        this.sceneGraphs = new Map()

        this.loadScenes()
    }

    /**
     * Creates the graphs for each scene file
     */
    loadScenes() {
        this.fileNames.forEach(file => {
            new MySceneGraph(file, this.scene, this)
        })
    }

    /**
     * Function to handle the graph loading
     * @param {MySceneGraph} graph graph that just finished loaded
     */
    onGraphLoaded(graph) {
        this.sceneGraphs.set(graph.filename, graph)

        if (this.sceneGraphs.size === 1) {
            this.currentTheme = graph.filename
            this.scene.setGraph(graph)
        } 
        
        if (this.sceneGraphs.size === this.fileNames.length) {
            this.allGraphsLoaded()
        }
    }

    /**
     * Update the interface to be able to switch themes
     */
    allGraphsLoaded() {
        this.scene.interface.updateThemes();
    }

    /**
     * Switch to the selected theme
     * @param {string} theme theme name
     */
    changeTheme(theme) {
        this.scene.setGraph(this.sceneGraphs.get(theme))
    }
}