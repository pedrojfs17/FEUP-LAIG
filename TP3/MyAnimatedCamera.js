/**
 * Animated camera has three types of moves:
 * - Position : Changes position and target
 * - Player : Obrits the camera around the center of the board in counter clockwise
 * - Undo : Obrits the camera around the center of the board in clockwise
 */
class MyAnimatedCamera extends CGFcamera {
    /**
     * Constructor
     * @param {XMLscene} scene 
     * @param {MyGameOrchestrator} orchestrator 
     * @param {int} fov 
     * @param {int} near 
     * @param {int} far 
     * @param {vec3} position 
     * @param {vec3} target 
     */
    constructor(scene, orchestrator, fov, near, far, position, target) {
        super(fov, near, far, position, target)

        this.scene = scene
        this.orchestrator = orchestrator
        this.animationTime = 1

        this.easingFunction = "easeInOutCubic"

        this.time = 0;
        this.animationType = "None"
    }

    /**
     * Starts an animation from the current position and target to the newCamera's position and target
     * @param {CGFcamera} newCamera 
     */
    changeCamera(newCamera) {
        if (newCamera.position[0] == this.position[0] &&
            newCamera.position[1] == this.position[1] &&
            newCamera.position[2] == this.position[2] &&
            newCamera.target[0] == this.target[0] && 
            newCamera.target[1] == this.target[1] && 
            newCamera.target[2] == this.target[2]) {
            this.orchestrator.state.updateState("Updated Camera")
            return;
        }

        this.animationType = "Position"
        this.time = 0

        this.translation = [this.position[0], this.position[1], this.position[2]]
        this.translationVector = [
            newCamera.position[0] - this.position[0],
            newCamera.position[1] - this.position[1],
            newCamera.position[2] - this.position[2]
        ]

        this.rotation = [this.target[0], this.target[1], this.target[2]]
        this.rotationVector = [
            newCamera.target[0] - this.target[0],
            newCamera.target[1] - this.target[1],
            newCamera.target[2] - this.target[2]
        ]
    }

    /**
     * Starts an animation to change players
     */
    startAnimation() {
        if (this.scene.currentCameraID != 'game') {
            this.orchestrator.updatePlayerCamera()
            this.orchestrator.state.updateState("Animation Done")
            return
        }

        if (this.animationType != "None") return

        this.animationType = "Player"
        this.time = 0
        this.angle = 0
    }

    /**
     * Starts an inverse animation to change players
     */
    startBackwardsAnimation() {
        if (this.scene.currentCameraID != 'game') {
            this.orchestrator.updatePlayerCamera()
            this.orchestrator.state.updateState("Animation Done")
            return
        }
        
        if (this.animationType != "None") return
        
        this.animationType = "Undo"
        this.time = 0
        this.angle = 0
    }

    /**
     * Animates the camera
     * @param {int} deltaTime time since last update
     */
    animate(deltaTime) {
        if (this.animationType == "None") return

        this.time += deltaTime

        if (this.time >= this.animationTime) {
            if (this.animationType == "Position") {
                this.setPosition([this.translation[0] + this.translationVector[0],this.translation[1] + this.translationVector[1],this.translation[2] + this.translationVector[2]])
                this.setTarget([this.rotation[0] + this.rotationVector[0],this.rotation[1] + this.rotationVector[1],this.rotation[2] + this.rotationVector[2]])
                this.orchestrator.state.updateState("Updated Camera")
            } else {
                let increment = Math.PI - this.angle
                this.orbit(CGFcameraAxis.Y, this.animationType == "Undo" ? -increment : increment)
                this.orchestrator.updatePlayerCamera()
                this.orchestrator.state.updateState("Animation Done")
            }
            this.animationType = "None"
            return
        }

        let percentage = Math.min(this.time / this.animationTime, 1);
        let animationFactor = EasingFunctions[this.easingFunction](percentage)

        if (this.animationType == "Position") {
            let x = this.translation[0] + this.translationVector[0] * animationFactor
            let y = this.translation[1] + this.translationVector[1] * animationFactor
            let z = this.translation[2] + this.translationVector[2] * animationFactor
            this.setPosition([x,y,z])

            let rx = this.rotation[0] + this.rotationVector[0] * animationFactor
            let ry = this.rotation[1] + this.rotationVector[1] * animationFactor
            let rz = this.rotation[2] + this.rotationVector[2] * animationFactor
            this.setTarget([rx,ry,rz])

        } else {
            let increment = Math.PI * animationFactor - this.angle
            
            this.orbit(CGFcameraAxis.Y, this.animationType == "Undo" ? -increment : increment)
            this.angle += increment
        }
    }
}