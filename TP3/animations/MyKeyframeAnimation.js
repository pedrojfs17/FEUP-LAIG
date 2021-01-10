/**
 * Class that represents the keyframe animations
 */
class MyKeyframeAnimation {
    constructor(keyframes) {
        this.keyframes = keyframes;

        this.targetFrame = 0;

        if (this.keyframes.length > 1) {
            this.targetFrame = 1; 
        }

        this.currentAnimation = new MyAnimation(
            keyframes[0].instant, 
            keyframes[this.targetFrame].instant,
            keyframes[0],
            keyframes[this.targetFrame]
        );

        this.time = 0;

        this.animationDone = false;
    }

    update(deltaTime) {
        if (this.targetFrame == this.keyframes.length) {
            this.animationDone = true;
            return;
        }

        this.currentAnimation.update(deltaTime);
        this.time += deltaTime;

        if (this.time > this.keyframes[this.targetFrame].instant) {
            if (this.currentAnimation.finished) {
                // Updates the keyframe index to match the current time
                do {
                    this.targetFrame += 1;
                } while (this.targetFrame < this.keyframes.length && this.keyframes[this.targetFrame].instant < this.time);
                
                if (this.targetFrame == this.keyframes.length)
                    return;

                // Creates a new animation between two keyframes
                this.currentAnimation = new MyAnimation(
                    0, 
                    this.keyframes[this.targetFrame].instant - this.keyframes[this.targetFrame - 1].instant,
                    this.keyframes[this.targetFrame - 1],
                    this.keyframes[this.targetFrame]
                );
                this.currentAnimation.update(deltaTime)
            }
        }
    }

    applyAnimation(scene) {
        this.currentAnimation.applyAnimation(scene);
    }
    
}