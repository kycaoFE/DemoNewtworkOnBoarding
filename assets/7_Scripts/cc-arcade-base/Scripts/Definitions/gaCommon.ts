const ConnectNetwork = require('connectNetwork');
const connectNetwork = new ConnectNetwork();
const globalNetwork = require('globalNetwork');
const gameCommonUtils = require('gameCommonUtils');
const loadConfigAsync = require('loadConfigAsync');
const serviceRest = require('serviceRest');
const WebSoundPlayer = require('WebSoundPlayer');
const network = window['GameNetwork'] || require('game-network');
const SoundPlayerImpl = WebSoundPlayer.WebSoundPlayer;

export {
    SoundPlayerImpl, connectNetwork, gameCommonUtils, globalNetwork, loadConfigAsync, network, serviceRest
};
