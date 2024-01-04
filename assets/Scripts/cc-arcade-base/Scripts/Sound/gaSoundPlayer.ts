import gaReferenceManager from "../Common/gaReferenceManager";
import { loadConfigAsync } from "../Definitions/gaCommon";
import logger from "../Utilities/gaLogger";

const { ccclass, property } = cc._decorator;
const WebSoundPlayer = require('WebSoundPlayer').WebSoundPlayer;

@ccclass
export default class gaSoundPlayer extends WebSoundPlayer {
    @property({type: cc.AudioClip}) lstSoundAsset: cc.AudioClip[] = [];
    public isEnableBGM: boolean = false;
    public isEnableSFX: boolean = false;

    musicVolume: number = 1;
    sfxVolume: number = 1;
    soundMap: Record<string, cc.AudioClip> = {};

    enableMusicFunc: any;
    isMuteMusic: boolean = false;
    isMuteEffect: boolean = false;
    protected musicAudioSource: cc.AudioSource = null;

    isWebSound = false;

    protected SoundStateEnum = cc.Enum({
        NONE: 0,
        PLAYING: 1
    })

    onLoad() {
        gaReferenceManager.instance.setReference("soundPlayer", this.node);

        super.onLoad();

        this.lstSoundAsset.forEach((music) => this.soundMap[music.name] = music);

        this.isWebSound = (cc.sys.isBrowser == true) && globalThis.Howl != null;

        this.loadCacheConfig();

        this.node.setSiblingIndex(9999);
    }

    onDisable() {
        this.stopAllAudio();
    }

    playMusic(id: cc.AudioClip, loop = true, volume: number = this.musicVolume, offset = 0) {
        if (!this.musicInstance || this.currentBGM != id) {
            logger.debug(`[gaSoundPlayer] Play Music ${id.name}`);
            super.playMusic(id, loop, volume, offset);
        }
    }

    playBGM(name: string, loop = true, volume: number = this.musicVolume, offset = 0): void {
        logger.debug(`[gaSoundPlayer] playBGM`, name);
        const audio = this.soundMap[name];
        if (audio) {
            this.playMusic(audio, loop, volume, offset);
        }
    }

    stopMusic() {
        logger.debug(`[gaSoundPlayer] Stop Music`);
        super.stopMusic();
    }

    pauseMusic() {
        logger.debug(`[gaSoundPlayer] Pause Music`);
        super.pauseMusic();
    }

    resumeMusic() {
        logger.debug(`[gaSoundPlayer] Resume Music`);
        super.resumeMusic();
    }

    muteMusic() {
        logger.debug(`[gaSoundPlayer] Mute Music`);
        this.isMuteMusic = true;
        this.setMusicVolume(0);
    }

    unmuteMusic() {
        logger.debug(`[gaSoundPlayer] Unmute Music`);
        if (this.isEnableBGM) {
            this.isMuteMusic = false;
            this.setMusicVolume(0.8);
            this.resumeMusic();
        }
    }

    playSfx(sfx: string, loop = false, volume?: number): string {
        volume = (!this.isEnableSFX || this.isMuteEffect) ? 0 : (volume || this.sfxVolume);
        logger.debug(`[gaSoundPlayer] Play sfx ${sfx}`);
        const id = this.soundMap[sfx];
        if (id) {
            return this.playEffect(id, loop, volume);
        }
        return null;
    }

    stopSfx(sfx: string) {
        logger.debug(`[gaSoundPlayer] Stop Sfx ${sfx}`);
        this.stopSound(sfx);
    }

    stopAllEffects() {
        logger.debug(`[gaSoundPlayer] Stop All Effects`);
        super.stopAllEffects();
    }

    muteAllEffects() {
        logger.debug(`[gaSoundPlayer] Mute All Effects`);
        this.isMuteEffect = true;
        this.setEffectVolume(0, true);
    }

    unmuteAllEffects() {
        if (this.isEnableSFX) {
            logger.debug(`[gaSoundPlayer] Unmute All Effects`);
            this.isMuteEffect = false;
            this.setEffectVolume(this.sfxVolume, true);
        }
    }

    setEffectVolume(volume: number, immediate?: boolean) {
        volume = volume < 0 ? 0 : volume;
        super.setEffectsVolume(volume, immediate);
    }

    fadeMusicTo(duration: number, volume: number) {
        super.fadeMusicTo(duration, volume);
    }

    fadeSoundTo(soundId: string, duration: number, volume: number) {
        super.fadeSoundTo(soundId, duration, volume);
    }

    playSfxOneShot(soundId: string, volume?: number, loop: boolean = false): string {
        volume = (!this.isEnableSFX || this.isMuteEffect) ? 0 : (volume || this.sfxVolume);
        return this.playSfx(soundId, loop, volume);
    }

    stopSfxOneShot(sfx: string) {
        this.stopSfx(sfx);
    }

    stopAllAudio() {
        logger.debug(`[gaSoundPlayer] Stop All Audio`);
        super.stopAllAudio();
    }

    loadCacheConfig() {
        const { ENABLE_BGM, ENABLE_SFX } = loadConfigAsync.getConfig();
        this.storageKeyBGM = ENABLE_BGM ? ENABLE_BGM : this.storageKeyBGM;
        this.storageKeySFX = ENABLE_SFX ? ENABLE_SFX : this.storageKeySFX;
        let isEnableBGM = cc.sys.localStorage.getItem(this.storageKeyBGM);
        let isEnableSFX = cc.sys.localStorage.getItem(this.storageKeySFX);
        this.isEnableBGM = (isEnableBGM != null) ? JSON.parse(isEnableBGM) : true;
        this.isEnableSFX = (isEnableSFX != null) ? JSON.parse(isEnableSFX) : true;
    }

    setBgmEnable(enable: boolean) {
        super.setBgmEnable(enable);
    }

    setEffectEnable(enable: boolean) {
        this.isEnableSFX = enable;
        if (this.node.gSlotDataStore) this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;
        if (this.isWebSoundClient2) {
            cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX ? "1" : "0");
        } else {
            cc.sys.localStorage.setItem(this.storageKeySFX, this.isEnableSFX);
        }
        if (this.isEnableSFX) {
            this.unmuteAllEffects();
        } else {
            this.muteAllEffects();
        }
    }

    playMainBGM() {
        logger.debug(`[gaSoundPlayer] playMainBGM`);
        super.playMainBGM();
    }

    playSFXClick() {
        logger.debug(`[gaSoundPlayer] playSFXClick`);
        super.playSFXClick();
    }

    _pauseMusic() {
        if (!this.webSound) {
            cc.audioEngine.pauseMusic();
            return;
        }

        // web sound ---
        if (this.musicInstance) {
            if (cc.sys.os == cc.sys.OS_IOS) {
                this.musicInstance.volume(0.001);
                this._currentOffset = this.musicInstance.seek();
            }
            else {
                this.musicInstance.pause();
            }
        }
    }

    _resumeMusic() {
        if (!this.isEnableBGM) return;
        if (!this.webSound) // audioEngine
        {
            cc.audioEngine.resumeMusic();
            cc.audioEngine.setMusicVolume(this.musicVolume);
        }
        else { // web sound ---
            if (!this.musicInstance || !this.currentBGM) return;
            let offset = 0;
            if (this._currentOffset != undefined && this._currentOffset != null) {
                offset = this._currentOffset;
            } else {
                offset = this.musicInstance.seek();
            }
            this.musicInstance.stop(this.bgMusicId);
            this.musicInstance = this.howlMap[this.currentBGM._uuid];
            this.bgMusicId = this.playHowl(this.musicInstance, { loop: false, volume: this.MUSIC_VOLUME, offset: offset });
        }
    }

    startPlayWithUserGesture() {
        const self = this;
        if (!self.isAllWebSoundLoaded) return;
        self.gameNode.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(() => {
            self.gameNode.off(cc.Node.EventType.TOUCH_END, self.startPlayWithUserGesture, this, true);
            if (self.musicInstance) {
                self.resumeMusic();
            } else {
                self.playMainBGM();
            }
        })));
    }

    waitForGesture(gameNode) {
        super.waitForGesture(gameNode);
        gameNode._touchListener && (gameNode._touchListener.swallowTouches = false);
    }

    setMusicVolume(volume) {
        volume = volume < 0.001 ? 0.001 : volume;
        this.musicVolume = volume;
        if (!this.webSound) // audioEngine
        {
            cc.audioEngine.setMusicVolume(volume);
        }
        else { // web sound ---
            if (this.musicInstance) this.musicInstance.volume(volume);
        }
    }
}
