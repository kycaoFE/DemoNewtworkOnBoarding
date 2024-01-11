export default class gaTweenUtils {
    static fadeOut(node: cc.Node, duration: number, callback?: Function) {
        const tween = cc.tween(node)
            .to(duration, { opacity: 0 })
            .call(() => {
                if (callback) callback();
            })
            .start();
        return tween;
    }

    static fadeIn(node: cc.Node, duration: number, callback?: Function) {
        const tween = cc.tween(node)
            .to(duration, { opacity: 255 })
            .call(() => {
                if (callback) callback();
            })
            .start();
        return tween;
    }
}
