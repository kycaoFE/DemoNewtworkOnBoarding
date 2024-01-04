import gaLocalize from "../Common/gaLocalize";
export class gaGameText {
	static getErrorMessage(errorCode: string): string {
		const messages = gaLocalize.instance;
        let msg: string;
		switch (errorCode) {
			case '0000': msg = messages.SYSTEM_ERROR; break;
			case '0001': msg = messages.NO_MONEY; break;
			case '0004': msg = messages.JOIN_GAME_FAILED; break;
			case '0007': msg = messages.NO_PLAYSESSION; break;
			case '0011': msg = messages.BET_FAILED; break;
			case '0027': msg = messages.KICK_INACTIVE_USER; break;
			case '0029': msg = messages.GROUP_MAINTAIN; break;
			case '0401': msg = messages.AUTHEN_FAILED; break;
			case '0500': msg = messages.SYSTEM_ERROR; break;
			case '0501': msg = messages.MISMATCH_DATA; break;
			case '0006':
			case 'W2001':
			case 'W2004':
			case 'W2006':
			case 'W2007':
			case 'W2008':
			case 'W2500': 
			case 'W29999': msg = messages.WALLET_ERROR; break;
            default: msg = errorCode; break;
		}
		return msg;
	}
}
