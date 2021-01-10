class MyPrologInterface {
    /**
     * Constructor for the prolog interface
     * @param {MyGameOrchestrator} orchestrator 
     */
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.connectServer();
    }

    /**
     * Connects to the prolog server by sending an handshake
     */
    connectServer() {
        let connectionHandler = function(data) {
            if (data.target.response == 'handshake') {
                console.log('Connected to Prolog server');
                this.interface.connected = true;
            }
            else {
                console.log('Could not connect to prolog server');
            }
        }

        this.getPrologRequest('handshake', connectionHandler);
    }

    /**
     * Disconnects from the prolog server by sending a quit
     */
    disconnectServer() {
        let quitHandler = function(data) {
            if (data.target.response == 'goodbye') {
                console.log('Disconnected from the Prolog server');
                this.interface.connected = false;
                this.orchestrator.state.updateState("Server Disconnected");
            }
            else {
                console.log('Could not disconnect to prolog server');
            }
        }

        if (this.connected) {
            this.getPrologRequest('quit', quitHandler);
        }
        else {
            console.log("Not connected to the server");
        }
    }

    /**
     * Sends a request to prolog and send its response to the game orchestrator
     * @param {string} requestString Request to be sent
     */
    sendRequestWithResponse(requestString) {
        let responseHandler = function(data) {
            let response = JSON.parse(data.target.response);
            this.orchestrator.onServerResponse(response);
        }

        if (this.connected) {
            this.getPrologRequest(requestString, responseHandler);
        }
        else {
            console.error("Not connected to the server");
        }
    }

    /**
     * Sends a prolog request
     * @param {string} requestString prolog request string
     * @param {function} onSuccess function to handke a successful response
     * @param {function} onError function to handle an error
     * @param {int} port port to be sent the request
     */
    getPrologRequest(requestString, onSuccess, onError, port) {
        var requestPort = port || 8080;
        var request = new XMLHttpRequest();

        request.addEventListener("load", onSuccess);
        request.addEventListener("error", onError); 
        
        request.interface = this; //Makes the target be able to access interface methods
        request.orchestrator = this.orchestrator; //Makes the request be able to comunicato with the orchestrator

        request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);
    
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    /**
     * Check if the player has available moves
     * @param {string} board current board in the prolog format
     * @param {string} player current player
     */
    checkAvailableMoves(board, player) {
        let requestString = 'checkAvailableMoves(' + board + ',' + player + ')';
        this.sendRequestWithResponse(requestString);
    }

    /**
     * Check the winner when the game is over
     * @param {string} board current board in the prolog format
     */
    gameOver(board) {
        let requestString = 'game_over(' + board +')';
        this.sendRequestWithResponse(requestString);
    }

    /**
     * Checks if a move is valid and moves the piece
     * @param {string} board current board in the prolog format
     * @param {string} player current player
     * @param {int} chosenPiece choosen piece index
     * @param {int} column target piece column
     * @param {int} row traget piece row
     */
    movePiece(board, player, chosenPiece, column, row) {
        let requestString = 'movePiece(' + board + ',' + player + ',' + chosenPiece + ',' + column + ',' + row + ')';
        this.sendRequestWithResponse(requestString);
    }

    /**
     * Choose a bot move
     * @param {string} board current board in the prolog format
     * @param {string} player current player
     * @param {int} level bot difficulty
     */
    chooseMove(board, player, level) {
        let requestString = 'choose_move(' + board + ',' + player + ',' + level + ')';
        this.sendRequestWithResponse(requestString);
    }

    /**
     * Count the board points and update the scoreboard
     * @param {string} board current board in the prolog format
     */
    countPoints(board) {
        let requestString = 'count_points(' + board + ')';

        let responseHandler = function(data) {
            let response = JSON.parse(data.target.response);
            this.orchestrator.scoreBoard.updatePoints(response);
        }

        if (this.connected) {
            this.getPrologRequest(requestString, responseHandler);
        }
        else {
            console.error("Not connected to the server");
        }
    }
}