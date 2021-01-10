class GameState {
    /**
     * Constructor for a gamee state
     */
    constructor() {
        if (this.constructor == GameState) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * Update method
     * @param {int} deltaTime - Time passed from the last update
     */
    update(deltaTime) {
        throw new Error("Method 'update()' must be implemented.");
    }

    /**
     * Display the state specific objects
     */
    display() {
        throw new Error("Method 'display()' must be implemented.");
    }

    /**
     * Updates current orchestrator state according to the event received
     * @param {string} event - Received event
     */
    updateState(event) {
        throw new Error("Method 'updateState()' must be implemented.");
    }

    /**
     * Handles a prolog response
     * @param {*} response 
     */
    onServerResponse(response) {
        throw new Error("Method 'onServerResponse()' must be implemented.");
    }

    /**
     * Handles picking for a game state
     * @param {*} object 
     * @param {int} id 
     */
    onObjectSelected(object, id) {
        throw new Error("Method 'onObjectSelected()' must be implemented.");
    }

    /**
     * Undo function
     */
    undo() {}

    getGameMenuButtons() {}

    buttonActive(id) {
        return this.getGameMenuButtons() == null || this.getGameMenuButtons().includes(id)
    }
}