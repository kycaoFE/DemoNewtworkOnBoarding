const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
@requireComponent(cc.ParticleSystem)
export default class ParticleSpriteAnimator extends cc.Component {

    @property(cc.ParticleSystem) particleSystem: cc.ParticleSystem = null;
    @property(cc.Float) duration: number = -1;
    @property(cc.SpriteFrame) spriteFrames: cc.SpriteFrame[] = [];

    durationPerFrame: number = 0;

    onLoad() {
        this.particleSystem = this.node.getComponent(cc.ParticleSystem);
        this.particleSystem._simulator.updateUVs = function () { };
        this.particleSystem._simulator.stop = this._stop.bind(this);
        if (this.spriteFrames.length > 0) {
            this.particleSystem.spriteFrame = this.spriteFrames[0];
            this.durationPerFrame = this._getDuration() / this.spriteFrames.length;
        }
    }

    update() {
        const simulator = this.particleSystem._simulator;
        if (simulator.sys._buffer && simulator.sys._renderSpriteFrame) {
            const particleCount = simulator.particles.length;
            const FLOAT_PER_PARTICLE = 4 * simulator.sys._vertexFormat._bytes / 4;
            let vbuf = simulator.sys._buffer._vData;
            for (let index = 0; index < particleCount; index++) {
                const spriteFrame = this._getSpriteFrame(this.particleSystem.life - simulator.particles[index].timeToLive);
                const uv = spriteFrame.uv;
                let offset = index * FLOAT_PER_PARTICLE;
                vbuf[offset + 2] = uv[0];
                vbuf[offset + 3] = uv[1];
                vbuf[offset + 7] = uv[2];
                vbuf[offset + 8] = uv[3];
                vbuf[offset + 12] = uv[4];
                vbuf[offset + 13] = uv[5];
                vbuf[offset + 17] = uv[6];
                vbuf[offset + 18] = uv[7];
            }
            simulator._uvFilled = particleCount;
        }
    }

    _stop() {
        const simulator = this.particleSystem._simulator;
        simulator.reset();
        simulator.active = false;
        simulator.elapsed = simulator.sys.duration;
        simulator.emitCounter = 0;
    }

    _getDuration() {
        if (this.duration <= 0) {
            return this.particleSystem.life;
        }
        return this.duration;
    }

    _getSpriteFrame(time: number) {
        if (time <= 0) {
            time = 0;
        }
        return this.spriteFrames[Math.floor(time / this.durationPerFrame) % this.spriteFrames.length] || this.particleSystem.spriteFrame;
    }
}
