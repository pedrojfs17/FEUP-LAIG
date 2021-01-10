/**
 * Class that represents the animations
 */
class MyAnimation {
    constructor(startTime, endTime, startTransformations, endTransformations) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.startTransformations = startTransformations;
        this.endTransformations = endTransformations;

        this.time = 0;

        this.finished = false;

        this.setupTranslation();
        this.setupRotation();
        this.setupScale();
        if (this.time >= this.startTime) {
            this.calculateTransformations()
        }
    }

    setupTranslation() {
        this.startTranslation = [
            this.startTransformations.translation.x,
            this.startTransformations.translation.y,
            this.startTransformations.translation.z
        ];

        this.endTranslation = [
            this.endTransformations.translation.x,
            this.endTransformations.translation.y,
            this.endTransformations.translation.z
        ];

        this.currentTranslation = vec3.create();
    }

    setupRotation() {
        this.startRotation = [
            this.startTransformations.rotationX.angle,
            this.startTransformations.rotationY.angle,
            this.startTransformations.rotationZ.angle
        ];

        this.endRotation = [
            this.endTransformations.rotationX.angle,
            this.endTransformations.rotationY.angle,
            this.endTransformations.rotationZ.angle
        ];

        this.currentRotation = vec3.create();
    }

    setupScale() {
        this.startScale = [
            this.startTransformations.scale.sx,
            this.startTransformations.scale.sy,
            this.startTransformations.scale.sz
        ]

        this.endScale = [
            this.endTransformations.scale.sx,
            this.endTransformations.scale.sy,
            this.endTransformations.scale.sz
        ];
        
        this.currentScale = vec3.create();
    }

    update(deltaTime) {
        if (this.time >= this.startTime && !this.finished) {
            this.calculateTransformations(deltaTime);
        }

        this.time += deltaTime;
    }

    calculateTransformations() {
        var percentage = this.time/this.endTime;

        if (percentage >= 1) {
            this.finished = true;
            percentage = 1;
        }

        vec3.lerp(this.currentTranslation, this.startTranslation, this.endTranslation, percentage);
        vec3.lerp(this.currentRotation, this.startRotation, this.endRotation, percentage);
        vec3.lerp(this.currentScale, this.startScale, this.endScale, percentage);
    }

    applyAnimation(scene) {
        var transformationMatrix = mat4.create();

        mat4.translate(transformationMatrix, transformationMatrix, this.currentTranslation);
        mat4.rotate(transformationMatrix, transformationMatrix, this.currentRotation[0], scene.graph.axisCoords['x']);
        mat4.rotate(transformationMatrix, transformationMatrix, this.currentRotation[1], scene.graph.axisCoords['y']);
        mat4.rotate(transformationMatrix, transformationMatrix, this.currentRotation[2], scene.graph.axisCoords['z']);
        mat4.scale(transformationMatrix, transformationMatrix, this.currentScale);

        scene.multMatrix(transformationMatrix);
    }
}