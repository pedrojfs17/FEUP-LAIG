/**
 * Class that representsa a move animations
 */
class MyPieceAnimation {
    constructor(duration, startPosition, endPosition) {
        this.duration = duration;
        this.startPosition = startPosition;
        this.translationVector = [
            endPosition.x - startPosition.x,
            endPosition.y - startPosition.y + 1,
            endPosition.z - startPosition.z
        ];

        this.time = 0;

        this.finished = false;
        
        this.currentPosition = vec3.create();
        this.calculateTransformations();
    }

    /**
     * Updates the animation
     * @param {int} deltaTime time since last update
     */
    update(deltaTime) {
        this.time += deltaTime;

        if (!this.finished) {
            this.calculateTransformations();
        }
    }

    /**
     * Calculates the current animation transformations
     */
    calculateTransformations() {
        var percentage = this.time/this.duration;

        if (percentage >= 1) {
            this.finished = true;
            percentage = 1;
        }

        this.currentPosition[0] = this.startPosition.x + this.translationVector[0] * percentage;
        this.currentPosition[2] = this.startPosition.z + this.translationVector[2] * percentage;

        if (percentage <= 0.8)
            this.currentPosition[1] = this.startPosition.y + this.translationVector[1] * EasingFunctions.easeOutCirc(percentage/0.8);
        else {
            this.currentPosition[1] = this.startPosition.y + this.translationVector[1] - EasingFunctions.easeOutCirc((percentage-0.8)/0.2);
        }
    }

    /**
     * Applies the animation transformations
     * @param {XMLscene} scene 
     */
    applyAnimation(scene) {
        scene.translate(this.currentPosition[0],this.currentPosition[1],this.currentPosition[2]);
    }

    /**
     * Resets the animation and sets a new duration
     * @param {int} duration new animation duration
     */
    resetAnimation(duration) {
        this.finished = false
        this.time = 0;
        this.duration = duration

        this.currentPosition = vec3.create();
        this.calculateTransformations();
    }
}