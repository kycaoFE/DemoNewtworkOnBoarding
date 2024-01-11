const { ccclass, property } = cc._decorator;
const { loadAvatarFacebook } = require('utils');

@ccclass
export default class gaAvatarProvider extends cc.Component {
    @property(cc.SpriteAtlas) private avatarAtlas: cc.SpriteAtlas = null;

    private static _instance: gaAvatarProvider = null;
    public static get instance(): gaAvatarProvider {
        return gaAvatarProvider._instance;
    }

    public loadAvatarFrame(sprite: cc.Sprite, av: string): void {
        if (this.avatarAtlas && loadAvatarFacebook) {
            if (av && av.indexOf('Avatar') === 0) {
                av = av.replace('Avatar', '');
            }
            loadAvatarFacebook(sprite, av, this.avatarAtlas, 'avatar_', 2);
        }
    }

    protected onLoad(): void {
        gaAvatarProvider._instance = this;
    }

    protected onDestroy(): void {
        gaAvatarProvider._instance = null;
    }
}