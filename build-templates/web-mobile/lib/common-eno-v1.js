/* global SwipeUp, DeviceAtlas */
var listDomain = [];
var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null;
var isiPhone = navigator.userAgent.match(/iPhone|iPod/i) != null;
//baidu
var isBaidu = navigator.userAgent.match('baidu') != null;
//QQ browser
var isQQ = navigator.userAgent.match('MQQBrowser') != null;
//Saferi Browser
var isFirefox = navigator.userAgent.match('FxiOS') != null;
// UC Browser
var isUC = navigator.userAgent.indexOf("UCBrowser") != -1;
// Chrome 1+
var isChrome = navigator.userAgent.match('CriOS') != null;
//xiaomi
var isXiaomi = navigator.userAgent.match('XiaoMi') != null;
var isEdge = navigator.userAgent.match('Edg') != null;
var isSafari = navigator.userAgent.match('Safari') && !isBaidu && !isFirefox && !isQQ && !isChrome && !isUC && !isXiaomi && !isEdge;
var isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || window.opera);
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var loadOver = false;//是否加载完毕
var swipeUp;
var handImage;
var divFullscreen;
var enterFullscreenBtn;
var exitFullscreenBtn;
var isLandscapeCanvas = false; // in game orientation
var maxHeightLandscape = 0;
// var isShowWarning = false;
var isFullScreenIOS;
var divWarningUserRotate;
var intervalCheckSize;
var lastWindowHeight;
var isIphoneX = (window.screen.height / window.screen.width) > 2;
var settings = window._CCSettings;
var multiOrientationGame = false;
var checkFullscreenInterval;
var frameInterval;
var notScrollCount = 0;
var heighOffsetToFS = 23;
var isTouched = false;
var isChecked = false;
var iOsVersion = 0;
var loadingIcon = document.getElementById('loadingIcon');
var divIOSFullscreenManual;
var bgFullscreenPanel;
var manualTitle;
var portraitManualDesc;
var bgFullscreenBlock;
var sideBar;
var landscapeManualGif;
var landscapeManualFrame;
var portraitManualGif;
var portraitManualFrame;
var closeManualBtn;
var canClickOverlay;
var hiddenPopUpDayLimit = 7;
var currentLanguage;
var rotatingGif;
var textWarning;
var viewportHeight = window.innerHeight;
var timeOutScrollTo;
var maskEnableTimeOut = -1;

var isPortraitGame = function(){
    if(settings){
        return (settings.orientation === "portrait") || usePortraitMobile();
    }
    if(window._CCSettings){
        return window._CCSettings.orientation === "portrait";
    }
    return false;
};

var usePortraitMobile = function() {
    return (settings.orientation === "" && settings.usePortraitMobile && isMobile)
}

window.addEventListener('orientationchange', onOrientationChanged);
window.addEventListener('resize', onResize);
window.visualViewport.addEventListener('scroll', viewportHandler);
window.visualViewport.addEventListener('resize', viewportHandler);
window["commonUnitTest"] = this;

var splash = getSplash();

function getChromeVersion () {     
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : 0;
}

function checkWrongWindowSize() {
    var shouldShowMask = false;
    if(isAndroid && getChromeVersion() >= 120) {
        if(window.innerHeight > window.screen.availHeight) {
            shouldShowMask = true;
        }
        if (typeof mask !== 'undefined') {
            if(shouldShowMask) {
                mask.style.display = 'block';
                mask.style.opacity = 0.9;
            }else {
                mask.style.display = 'none';
            }
        }
    }
}
function getCorrectViewPortHeight() {
    var isLandscape = isLandscapeScreen();
    var portraitHeight = localStorage.getItem('portraitInnerHeight') || 0;
    var landscapeHeight = localStorage.getItem('landscapeInnerHeight') || 0;
    var viewPortHeight = isLandscape? landscapeHeight : portraitHeight;
    viewPortHeight = viewPortHeight > 0 ? viewPortHeight : (isLandscape? (window.screen.availHeight - 80) : (window.innerWidth * 1280/720));
    return viewPortHeight;
}
function fixWrongWindowSize() {
    if(isAndroid && getChromeVersion() >= 120 && window.innerHeight > window.screen.availHeight) {
        var viewPortHeight = getCorrectViewPortHeight();
        if(cc && cc.view) {
            if(!isLandscapeScreen()) {
                if(isPortraitGame()) {
                    cc.view.setCanvasSize(window.innerWidth, viewPortHeight);
                } else {
                    cc.view.setCanvasSize(viewPortHeight, window.innerWidth);
                }
            }else {
                overrideInitFrameSize(viewPortHeight);
                if(isPortraitGame()) {
                    cc.view.setCanvasSize(viewPortHeight, window.innerWidth);
                } else {
                    cc.view.setCanvasSize(window.innerWidth, viewPortHeight);
                }
                var canvasNode = cc.find("Canvas");
                if(canvasNode){
                    var canvasComponent = canvasNode.getComponent(cc.Canvas);
                    if(canvasComponent){
                        canvasComponent.alignWithScreen();
                        if(isPortraitGame()) {
                            canvasComponent.fitWidth = true;
                            canvasComponent.fitHeight = false;
                        } else {
                            canvasComponent.fitWidth = false;
                            canvasComponent.fitHeight = true;
                        }
                    }
                }
            }
        }
    }
}

function getSplash() {
    var landScapeSplash = document.getElementById('splash');
    var portraitSplash = document.getElementById('splashGamePortrait');
    var language = getCurrentLanguage();
    // var imageName = `splashscreen${language != 'vi' ? "_" + language : ""}.jpg`;
    var background = landScapeSplash;
    var isPortraitSplash = usePortraitMobile();
    if (isPortraitSplash) {
        background = portraitSplash;
        // imageName = `splashscreenP${language != 'vi' ? "_" + language : ""}.jpg`;
    }
    if (landScapeSplash) {
        landScapeSplash.style.display = 'none';
    }
    if (portraitSplash) {
        portraitSplash.style.display = 'none';
    }

    // const primaryImage = new Image();
    // // primaryImage.src = imageName;
    // primaryImage.onload = function() {
    //     if(!iOsVersion) iOsVersion = checkIOSVersion();
    //     background.style.background = `#171717 url(${imageName}) no-repeat center center`;
    //     updateSplashTransform((iOsVersion >= 17 &&  window.scrollY > 0) ? 500 : 200);
    // }
    // primaryImage.onerror = function() {
    //     if(!iOsVersion) iOsVersion = checkIOSVersion();
    //     // background.style.background = `#171717 url(${isPortraitSplash ? "splashscreenP.jpg" : "splashscreen.jpg"}) no-repeat center center`;
    //     updateSplashTransform((iOsVersion >= 17 &&  window.scrollY > 0) ? 500 : 200);
    // }
    return background;
}
function updateSplashTransform(delay = 1) {
    setTimeout(function() {
        var customHeight = 0;
        if(isAndroid && getChromeVersion() >= 120 && window.innerHeight > window.screen.availHeight) {
            customHeight = getCorrectViewPortHeight();;
        }
        updateSplashSize(true, customHeight);
        updateSplashRotation(customHeight);
    }, delay);
}
function onResize() {
    updateSplashSize(false);
}

function checkIOSVersion() {
    var agent = window.navigator.userAgent,
    start = agent.indexOf('OS ');
    if( ( agent.indexOf( 'iPhone' ) > -1 || agent.indexOf( 'iPad' ) > -1 ) && start > -1 ){
        return window.Number( agent.substr( start + 3, 3 ).replace( '_', '.') );
    }
    return 0;
}

function updateSplashSize(isFirstLaunched = false, customHeight = 0) {
    if (splash) {
        var bgWidth = 2024;
        var bgHeight = 1200;
        var designWidth = settings.designResolution ? settings.designResolution.width : 1280;
        var designHeight = settings.designResolution ? settings.designResolution.height: 720;
        var isLandscape = isMobile ? isLandscapeScreen() : true;
        var screenWidth = isLandscape ? window.innerWidth : (customHeight > 0? customHeight : window.innerHeight);
        var screenHeight = isLandscape ? (customHeight > 0? customHeight : window.innerHeight) : window.innerWidth;
        var _ratio = 1;

        if (multiOrientationGame){
            if(isMobile){
                designWidth = settings.designResolution.portrait.width;
                designHeight = settings.designResolution.portrait.height;
                bgWidth = settings.designResolution.portrait.bgWidth;
                bgHeight = settings.designResolution.portrait.bgHeight;
                screenWidth = isLandscape? (customHeight > 0? customHeight : document.documentElement.clientHeight) : document.documentElement.clientWidth;
                screenHeight = isLandscape? document.documentElement.clientWidth : (customHeight > 0? customHeight : document.documentElement.clientHeight);
            }
            else{
                designWidth = settings.designResolution.landscape.width;
                designHeight = settings.designResolution.landscape.height;
                bgWidth = settings.designResolution.landscape.bgWidth;
                bgHeight = settings.designResolution.landscape.bgHeight;
            }
        }
        if(isPortraitGame() && !multiOrientationGame){
            if(isFirstLaunched && typeof loadingIcon !== 'undefined' && loadingIcon != null){
                loadingIcon.style.display = 'block';
            }
            designWidth = settings.designResolution ? settings.designResolution.width : 720;;
            designHeight = settings.designResolution ? settings.designResolution.height: 1280;
            bgWidth = 960;
            bgHeight = 640;
            if(isMobile){
                screenWidth = (!isLandscape)? document.documentElement.clientWidth : (customHeight > 0? customHeight : document.documentElement.clientHeight);
                screenHeight = (!isLandscape)? (customHeight > 0? customHeight : document.documentElement.clientHeight) : document.documentElement.clientWidth;
            }
            var scaleHeightDevice = screenHeight/designHeight;
            var scaleWidthDevice = screenWidth/designHeight;
            var realScaleDevice = scaleHeightDevice > scaleWidthDevice ? scaleWidthDevice : scaleHeightDevice;
            var convertWidthBG = bgWidth * realScaleDevice;
            var convertHeightBG = bgHeight * realScaleDevice;
            var ratioW = screenWidth/convertWidthBG;
            var ratioH = screenHeight/convertHeightBG;
            _ratio = (ratioW > ratioH)? ratioW : ratioH;
            _ratio = _ratio*scaleHeightDevice;
            if(isMobile){
                _ratio = (screenHeight/bgHeight) * (screenHeight/screenWidth);
            }
        }else{
            var screenRatio = screenHeight/screenWidth;
            var designRatio = designHeight / designWidth;
            var fitWidth = (screenRatio > designRatio);
            _ratio = fitWidth?screenWidth/designWidth:screenHeight/designHeight;
        }
        splash.style.backgroundSize = (bgWidth*_ratio)+'px '+(bgHeight*_ratio)+'px';
        splash.style.width = screenWidth+'px';
        splash.style.height = screenHeight+'px';
        if (isFirstLaunched) {
            splash.style.display = 'block';
            splash.style.opacity = 1;
        }

    }
}


function updateSplashRotation(customHeight = 0) {
    var splash = document.getElementById('splash');
    var splashGamePortrait = document.getElementById('splashGamePortrait');
    var isPortraitGame = settings.orientation === "portrait";
    var isAutoOrientationGame = settings.orientation === "";


    var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null;
    var ratio = (customHeight > 0? customHeight : window.innerHeight)/window.innerWidth*50;
    splash.classList.remove("splashPortrait");
    splash.classList.remove("splashPortraitForGamePortrait");
    if(splashGamePortrait) {
        splashGamePortrait.classList.remove("splashPortrait");
        splashGamePortrait.classList.remove("splashPortraitForGamePortrait");
    }
    if(window.innerWidth < (customHeight > 0? customHeight : window.innerHeight) && isMobile && !isPortraitGame){
        ratio = window.innerWidth/(customHeight > 0? customHeight : window.innerHeight)*50;
        splash.classList.add("splashPortrait");
        splash.style.transformOrigin = ratio+'% 50%';
    }else if(window.innerWidth > (customHeight > 0? customHeight : window.innerHeight) && isMobile && (isPortraitGame || isAutoOrientationGame)){
        var _ratio = window.innerWidth/(customHeight > 0? customHeight : window.innerHeight)*50;
        splash.classList.add("splashPortrait");
        splash.style.transformOrigin = _ratio + '% 50%';
        if(splashGamePortrait) {
            splashGamePortrait.classList.add("splashPortraitForGamePortrait");
            splashGamePortrait.style.transformOrigin = '50% '+ ratio+'%';
        }
    }
}

function isSupportMultiOrientationGame(settings){
    return settings.orientation === '';
}

function getSceneNameFromPath(scenePath){
    if(scenePath){
        var splitUrls = scenePath.split('/');
        var sceneName = splitUrls[splitUrls.length-1];
        sceneName = sceneName.split('.')[0];
        return sceneName;
    }
    return null;
}

function isLandscapeScreen() {
    if(isMobile) {
        if (window.matchMedia("(orientation: landscape)").matches) {
            return true;
        }
        if (window.matchMedia("(orientation: portrait)").matches) {
            return false;
        }
    }
    return true;
}

function listenCallBack() {
    document.body.style.top = 0 + 'px';
    if(!splash){
        splash = getSplash();
    }
    var isLandscape = isLandscapeScreen();
    // console.log("==== Landscape is : "+ isLandscape);
    var mask = document.getElementById('mask');
    if (loadOver && typeof splash !== 'undefined') {
        splash.style.display = 'none';
    }
    if(typeof loadingIcon !== 'undefined' && loadingIcon != null && isPortraitGame()){
        loadingIcon.style.display = 'none';
    }

    var canvasDesignResolutionSize = cc.view.getDesignResolutionSize();
    if (canvasDesignResolutionSize) {
        isLandscapeCanvas = canvasDesignResolutionSize.width > canvasDesignResolutionSize.height;
    }

    var urlRuFS = new URL(window.location);
    var disableFullscreen = urlRuFS.searchParams.get('disableFullscreen');

    if (isMobile && isAndroid && isLandscapeCanvas && !disableFullscreen) {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "block";
            divFullscreen.style.visibility = "visible";
        }
    } else {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "none";
            divFullscreen.style.visibility = "hidden";
        }
    }

    // if(isiPhone && isSafari && iOsVersion >= 15){
    //     setTimeout(function () {
    //         var _isFullScreen = isFullScreenSafariIOS();
    //         showIOSFullScreenManual(!_isFullScreen);
    //     }, 100);
    // }

    // ! just for game portrait
    if(isMobile && isPortraitGame()) {
        if(isLandscape) {
            setTimeout(function () {
                showWarningUserRotate();
                if(isSafari && (iOsVersion < 14.2 || iOsVersion >= 17)) {
                    if(!isFullScreenSafariIOS()){
                        cc.view.setCanvasSize(window.innerHeight, window.innerWidth);
                        alignGameCanvasWithScreen(100);
                        setTimeout(function () {
                            window.scrollTo(0, 100);
                        }, 100);
                        setTimeout(function () {
                            window.scrollTo(0, 0);
                            document.body.style.top = (window.scrollY > 0? window.scrollY : 0) + 'px';
                        }, 200);
                        setTimeout(function () {
                            document.body.style.top = (window.scrollY > 60? 28 : 0) + 'px';
                        }, 300);
                    }
                }
            }, 500);
        }else {
            showWarningUserRotate();
        }
    }

    if (isMobile && isAndroid) {
        if (loadOver && splash) {
            splash.style.display = 'none';
        }
    }
    else if (isiPhone && isLandscape && isLandscapeCanvas && !isPortraitGame()) {
        if (isSafari) {
            setTimeout(function () {
                var _isFullScreen = isFullScreenSafariIOS();
                if (iOsVersion < 14.2) {
                    if(_isFullScreen) {
                        if (typeof mask !== 'undefined') {
                            mask.style.display = 'none';
                        }
                        if (typeof swipeUp !== 'undefined') {
                            swipeUp.disable();
                        }
                    } else {
                        if (typeof mask !== 'undefined') {
                            mask.style.display = 'block';
                        }
                        if (typeof swipeUp !== 'undefined') {
                            swipeUp.enable();
                        }
                    }
                    if(!_isFullScreen || (_isFullScreen && document.documentElement.clientHeight < window.innerHeight)) {
                        cc.view.setCanvasSize(window.innerWidth, window.innerHeight);
                        alignGameCanvasWithScreen(100);
                    }
                } else {
                    onIOSFullscreenChanged(_isFullScreen);
                    // if (iOsVersion < 15){
                    //     onIOSFullscreenChanged(_isFullScreen);
                    // }else {
                    //     if (typeof swipeUp !== 'undefined') {
                    //         swipeUp.disable();
                    //     }
                    //     if (typeof mask !== 'undefined') {
                    //         mask.style.display = 'none';
                    //     }
                    //     window.scrollTo(0, 0);
                    //     alignGameCanvasWithScreen(100);
                    // }
                }
            }, 100);
        } else if (isChrome && isiPhone
            && iOsVersion > 12) {
            setTimeout(function () {
                if(!isFullscreenChromeIOS() && isLandscapeScreen()){
                    onIOSFullscreenChanged(false);
                }else{
                    notScrollCount = 0;
                    if (typeof mask !== 'undefined') {
                        mask.style.opacity = 0;
                    }
                    document.body.style.overflow = "hidden";
                }
            }, 100);

            // if(!isShowWarning){
            //     isShowWarning = true;
            //     showWarningUserLockScreen();
            // }
        }
    } else {
        if (typeof swipeUp !== 'undefined') {
            swipeUp.disable();
        }
        if (typeof mask !== 'undefined') {
            mask.style.display = 'none';
        }
        if (loadOver && splash) {
            splash.style.display = 'none';
        }
        if(!isLandscape){
            setTimeout(function (){
                window.scrollTo(0,0);
                if(isPortraitGame()){
                    if(window.innerHeight == document.documentElement.clientHeight)// not fullscreen in portrait
                    {
                        document.body.style.height =  '110vh';
                    }else if(window.innerHeight - document.documentElement.clientHeight > 70)// can fullscreen in portrati
                    {
                        alignGameCanvasWithScreen(1);
                        alignGameCanvasWithScreen(1000);
                        document.body.style.height =  '100vh';
                    }
                }else if(!isLandscape) {
                    alignGameCanvasWithScreen(0.01);
                    document.body.style.height =  '100vh';
                }
            }, 100);
        }
    }

    if (isMobile && isAndroid && isLandscapeCanvas) {
        setTimeout(function () {
            if (isLandscape) {
                // Landscape Orientation
                if (typeof enterFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.classList.remove("enterFullScreen_Landscape");
                    enterFullscreenBtn.classList.remove("enterFullScreen_Portrait");
                    enterFullscreenBtn.classList.add("enterFullScreen_Landscape");
                }

                if (typeof exitFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.classList.remove("exitFullscreen_Landscape");
                    enterFullscreenBtn.classList.remove("exitFullscreen_Portrait");
                    exitFullscreenBtn.classList.add("exitFullscreen_Landscape");
                }
            }
            else {
                // Portrait Orientation
                if (typeof enterFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.classList.remove("enterFullScreen_Portrait");
                    enterFullscreenBtn.classList.remove("enterFullScreen_Landscape");
                    enterFullscreenBtn.classList.add("enterFullScreen_Portrait");
                }

                if (typeof exitFullscreenBtn !== 'undefined') {
                    exitFullscreenBtn.classList.remove("exitFullscreen_Landscape");
                    exitFullscreenBtn.classList.remove("exitFullscreen_Portrait");
                    exitFullscreenBtn.classList.add("exitFullscreen_Portrait");
                }
            }
        }, 200);
    }

    document.body.style.overflow = (isPortraitGame() || !isLandscapeScreen())? "hidden" :  "auto";
    document.body.style.position = isPortraitGame()? "fixed" : "absolute";
    if(isPortraitGame()) {
        document.body.style.height = '100vh';
    }
}

function isFullScreenSafariIOS(){
    var isLandscape = isLandscapeScreen();
    isFullScreenIOS = false;
    if (window.innerHeight == window.outerHeight) {
        //absolute fullscreen
        isFullScreenIOS = true;
    } else {
        if (window.innerHeight == document.documentElement.clientHeight) {
            if((isLandscape && window.outerHeight - window.innerHeight < 30) || (!isLandscape && window.outerHeight - window.innerHeight < 100)){
                isFullScreenIOS = true;
            }
        }
    }
    return isFullScreenIOS
}

function isFullscreenChromeIOS() {
    isFullScreenIOS = false;
    if (window.innerHeight == window.outerHeight) {
        //absolute fullscreen
        isFullScreenIOS = true;
    } else {
        if (window.outerHeight - window.innerHeight <= heighOffsetToFS) {
            //minimal top bar fullscreen
            isFullScreenIOS = true;
        }
    }
    return isFullScreenIOS;
}

function onIOSFullscreenChanged(isFullscreen){
    var mask = document.getElementById('mask');
    if (!isFullscreen) {
        document.body.style.overflow = "auto";
        document.body.style.height = isSafari? '110vh' : '140vh';
        if (typeof mask !== 'undefined') {
            mask.style.display = 'block';
            mask.style.opacity = 0;
            if(maskEnableTimeOut !== -1) {
                clearTimeout(maskEnableTimeOut);
            }
            maskEnableTimeOut = setTimeout(function() {
                mask.style.opacity = 0.5;
                maskEnableTimeOut = -1;
            }, 500);
        }
        if (typeof swipeUp !== 'undefined' && isSafari) {
            swipeUp.enable();
        }
        window.scrollTo(0,-100);
        if(!isChrome) return;
        if(checkFullscreenInterval){
            clearInterval(checkFullscreenInterval);
        }
        if(frameInterval){
            clearInterval(frameInterval);
        }
        notScrollCount = 0;
        checkFullscreenInterval = setInterval(checkFullScreenChromeIOS, 100);

        frameInterval = setInterval(updateFrame, 100);
    }
    else {
        if (typeof mask !== 'undefined') {
            if(maskEnableTimeOut !== -1) {
                clearTimeout(maskEnableTimeOut);
                maskEnableTimeOut = -1;
            }
            mask.style.display = 'none';
        }
        if (typeof swipeUp !== 'undefined' && isSafari) {
            swipeUp.disable();
        }
        if(timeOutScrollTo) {
            clearTimeout(timeOutScrollTo);
            timeOutScrollTo = null;
        }
        window.scrollTo(0,0);
        alignGameCanvasWithScreen(100);
        if(settings && settings.designResolution && settings.designResolution.width >= 1560) {
            alignGameCanvasWithScreen(500);
        }
        document.body.style.overflow = "hidden";
    }
}

function onTouchEnded(){
    var isLandscape = isLandscapeScreen();
    if(!isLandscape) return;
    var canvasHeight = 9999;
    var canvas = cc.game.canvas;
    if(canvas){
        var str = canvas.style.height.substr(0,canvas.style.height.length-2);
        canvasHeight = Number(str);
    }
    if(window.scrollX !=0 || window.scrollY>0 ||((window.innerHeight-canvasHeight)>10)){
        setTimeout(function (){
            window.scrollTo(0,0);
            alignGameCanvasWithScreen(100);
        }, 100);
    }
}
function onWindowTouchEnded(){
    isTouched = false;
    if (isSafari) {
        // return;
        if(timeOutScrollTo) {
            clearTimeout(timeOutScrollTo);
        }
        if(!isFullScreenIOS) {
            timeOutScrollTo = setTimeout(windowScrollToEdge, 200);
        }else {
            timeOutScrollTo = setTimeout(windowScrollToEdge, 100);
        }
    }
}

function onAndroidChomeTouchEnd() {
    setTimeout(saveWindowInnerHeight, 500);
}

function saveWindowInnerHeight() {
    if (typeof exitFullscreenBtn !== 'undefined' && exitFullscreenBtn.style.display == 'block') {
        return;
    }
    if(isLandscapeScreen()) {
        var landscapeHeight = localStorage.getItem('landscapeInnerHeight') || 0;
        if(Number(landscapeHeight) != window.innerHeight) {
            localStorage.setItem('landscapeInnerHeight', window.innerHeight);
        }
    } else {
        var portraitHeight = localStorage.getItem('portraitInnerHeight') || 0;
        if(Number(portraitHeight) != window.innerHeight) {
            localStorage.setItem('portraitInnerHeight', window.innerHeight);
        }
    }
}

function windowScrollToEdge(){
    window.scrollTo(0, (isFullScreenIOS) ? 0 : -100);
    setTimeout(function () {
        document.body.style.top = (window.scrollY > 60? 28 : 0) + 'px';
    }, 100);
    timeOutScrollTo = null;
}

function onWindowTouchStarted(){
    isTouched = true;
    isChecked = false;
    if(timeOutScrollTo) {
        clearTimeout(timeOutScrollTo);
        timeOutScrollTo = null;
    }
    return;
    if(!isFullScreenIOS) {
        window.scrollTo(0, -100);
    }
}

function onScroll(){
    notScrollCount = 0;
    if(!checkFullscreenInterval){
        checkFullscreenInterval = setInterval(checkFullScreenChromeIOS, 100);
    }
    if(!frameInterval){
        frameInterval = setInterval(updateFrame, 100);
    }
}
function checkFullScreenChromeIOS(){
    if(window.outerHeight-window.innerHeight<=heighOffsetToFS && !isTouched){
        if(!isChecked){
            isChecked = true;
            notScrollCount = 0;
        }
        if(notScrollCount>1){
            setTimeout(function (){
                onIOSFullscreenChanged(true);
                notScrollCount = 0;
            }, 100);
            notScrollCount = 0;
            setTimeout(function(){
                if(checkFullscreenInterval){
                    clearInterval(checkFullscreenInterval);
                    checkFullscreenInterval = false;
                }
                if(frameInterval){
                    clearInterval(frameInterval);
                    frameInterval = false;
                }
            }, 300);
        }
    }
}

function updateFrame(){
    notScrollCount++;
}

function showWarningUserLockScreen(){
    var warningText = document.createElement('div');
    document.body.appendChild(warningText);
    warningText.innerHTML = getLocalizedDescContent("warningUserLockScreen");
    warningText.style.display = "flex";
    warningText.style.justifyContent = "center";
    warningText.style.alignItems = "center";
    warningText.style.height = "15%";
    warningText.style.textAlign = "center";
    warningText.style.pointerEvents = "none";
    warningText.style.position = "fixed";
    warningText.style.top = "40%";
    warningText.style.left = "5%";
    warningText.style.right = "5%";
    warningText.style.bottom = "0px";

    warningText.style.zIndex = 1000;
    warningText.style.backgroundColor = "white";
    warningText.style.borderRadius = "15px";
    warningText.style.border = "2px solid #4a4a49";
    warningText.style.fontSize = "20px";
    warningText.style.color = "#4a4a49";
    warningText.style.overflow = "hidden";


    warningText.style.opacity = "0";
    warningText.style.transition = "opacity 1s"; // animation fade

    setTimeout(function () { // fadeIn
        warningText.style.opacity = "1";
    }, 10);

    setTimeout(function () { // fadeOut
        warningText.style.opacity = "0";
    }, 4000);
}

function showWarningUserRotate() {
    var shouldShowWarning = isAndroid? window.orientation !== 0 : true;
    if (isLandscapeScreen() && shouldShowWarning) {
        if (!divWarningUserRotate) {
            divWarningUserRotate = document.createElement("div");
            document.body.appendChild(divWarningUserRotate);
            divWarningUserRotate.style.position = "fixed";
            divWarningUserRotate.style.flexDirection = "collumn";
            divWarningUserRotate.style.top = "0px";
            divWarningUserRotate.style.left = "0px";
            divWarningUserRotate.style.width = "100vw";
            divWarningUserRotate.style.height = "100vh";
            divWarningUserRotate.style.overflow = "hidden";
            divWarningUserRotate.style.zIndex = 10000;
            divWarningUserRotate.style.backgroundColor = "black";
            divWarningUserRotate.style.opacity = "0.85";

            textWarning = document.createElement("div");
            divWarningUserRotate.appendChild(textWarning);
            textWarning.style.padding = "5px 10px";
            textWarning.style.textAlign = "center";
            textWarning.innerHTML = getLocalizedDescContent("warningUserRotate");
            textWarning.style.fontSize = "20px";
            textWarning.style.color = "white";
            textWarning.style.position = "fixed";
            textWarning.style.width = "100%";
            rotatingGif = new Image();
            rotatingGif.src = '/images/RotatePhone.gif';
            divWarningUserRotate.appendChild(rotatingGif);
            rotatingGif.style.position = "fixed";
            rotatingGif.style.display = "block";
            rotatingGif.style.zIndex = 10001;
            rotatingGif.style.width = "120px";
            rotatingGif.style.height = "120px";
            rotatingGif.style.opacity = "0.85";
        }
        var landscapeInnerHeight = Math.min(window.innerHeight, window.innerWidth);
        var landscapeInnerWidth = Math.max(window.innerHeight, window.innerWidth);
        var topPos = landscapeInnerHeight/2 - 120/2;
        rotatingGif.style.top = topPos + "px";
        var leftPos = landscapeInnerWidth/2 - 120/2;
        rotatingGif.style.left = leftPos + "px";
        textWarning.style.top = landscapeInnerHeight/2 + 60 + "px";
        divWarningUserRotate.style.display = loadOver? "block" : "none";
        document.body.style.position = "fixed";
    } else {
        if (!isPortraitGame()) {
            document.body.style.position = "absolute";
        }
        if (divWarningUserRotate) {
            divWarningUserRotate.style.display = "none";
        }
    }
}

function showIOSFullScreenManual(isShow) {
    canClickOverlay = false;
    var isLandscape = isLandscapeScreen();
    var portraitGame = isPortraitGame();
    if(!isShow) {
        var key = "manual_" + (!portraitGame? "landscape" : "portrait");
        saveToLocalStorage(key, "closed");
        var currentTime = new Date();
        var savedTime = currentTime.getTime();
        saveToLocalStorage("savedTime_" + (!portraitGame? "landscape" : "portrait"), savedTime);
    }
    var shouldShow = isShow && (isLandscape && !portraitGame);
    if(shouldShow) {
        var key = "manual_" + (!portraitGame? "landscape" : "portrait");
        var manualShowingStatus = loadFromLocalStorage(key);
        var lastSavedTime = loadFromLocalStorage("savedTime_"+ (!portraitGame? "landscape" : "portrait"));
        var dur = getDurationFromLastTime(lastSavedTime || 0);
        var durInDay = dur/1000/60/60/24;
        var enoughHiddenTime = durInDay >= hiddenPopUpDayLimit;
        if(manualShowingStatus == "closed" && !enoughHiddenTime) return;
        loadFullscreenAssets();
        updateManualAreaSize();
        divIOSFullscreenManual.style.display = "block";
        document.body.style.overflow = "hidden";
        setTimeout(function() {
            canClickOverlay = true;
        }, 2000);
    }else {
        if(divIOSFullscreenManual) divIOSFullscreenManual.style.display = "none";
    }
}

function loadFullscreenAssets() {
    if(!divIOSFullscreenManual){
        divIOSFullscreenManual = document.createElement("div");
        document.body.appendChild(divIOSFullscreenManual);
        divIOSFullscreenManual.style.position = "fixed";
        divIOSFullscreenManual.style.display = "block";
        divIOSFullscreenManual.style.flexDirection = "collumn";
        divIOSFullscreenManual.style.top = "0px";
        divIOSFullscreenManual.style.left = "0px";
        divIOSFullscreenManual.style.width = "100vw";
        divIOSFullscreenManual.style.height = "100vh";
        divIOSFullscreenManual.style.overflow = "hidden";
        divIOSFullscreenManual.style.zIndex = 10001;
        divIOSFullscreenManual.style.opacity = "1";
        divIOSFullscreenManual.addEventListener('click', onClickManualOverlay);

        var overlay = document.createElement("div");
        divIOSFullscreenManual.appendChild(overlay);
        overlay.style.position = "fixed";
        overlay.style.display = "block";
        overlay.style.flexDirection = "collumn";
        overlay.style.top = "0px";
        overlay.style.left = "0px";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.overflow = "hidden";
        overlay.style.zIndex = 10002;
        overlay.style.backgroundColor = "rgba(30, 30, 30, 0.5)";

        bgFullscreenPanel = document.createElement("div");
        divIOSFullscreenManual.appendChild(bgFullscreenPanel);
        bgFullscreenPanel.style.backgroundImage = "url('/images/rect_Panel.png')";
        bgFullscreenPanel.style.backgroundColor = "rgba(100, 100, 100, 0.9)";
        bgFullscreenPanel.style.borderRadius = "10px";
        bgFullscreenPanel.style.border = "1px solid #4a4a49";
        bgFullscreenPanel.style.padding = "0px";
        bgFullscreenPanel.style.position = "fixed";
        bgFullscreenPanel.style.display = "block";
        bgFullscreenPanel.style.zIndex = 10002;

        manualTitle = document.createElement("div");
        bgFullscreenPanel.appendChild(manualTitle);
        manualTitle.style.zIndex = 10003;
        manualTitle.style.position = "fixed";
        manualTitle.style.display = "block";
        manualTitle.style.borderRadius = "10px";
        manualTitle.style.margin = "auto";
        manualTitle.innerHTML = getLocalizedDescContent("manualTitle");
        manualTitle.style.textAlign = "center";
        manualTitle.style.fontSize = "19px";
        manualTitle.style.color = "white";

        landscapeManualGif = new Image();
        var landscapeManualGifUrl = getLocalizedAssetUrl("landscapeManualGif");
        landscapeManualGif.src = landscapeManualGifUrl? landscapeManualGifUrl : '/images/HideAddressBar_Hor_SRC.gif';
        divIOSFullscreenManual.appendChild(landscapeManualGif);
        landscapeManualGif.style.position = "fixed";
        landscapeManualGif.style.display = "block";
        landscapeManualGif.style.width = "300px";
        landscapeManualGif.style.height = "186px";
        landscapeManualGif.style.zIndex = 10003;

        landscapeManualFrame = new Image();
        landscapeManualFrame.src = '/images/Border_500x310.png';
        divIOSFullscreenManual.appendChild(landscapeManualFrame);
        landscapeManualFrame.style.position = "fixed";
        landscapeManualFrame.style.display = "block";
        landscapeManualFrame.style.width = "300px";
        landscapeManualFrame.style.height = "186px";
        landscapeManualFrame.style.zIndex = 10004;

        if(isPortraitGame()){
            portraitManualDesc = document.createElement("div");
            bgFullscreenPanel.appendChild(portraitManualDesc);
            portraitManualDesc.style.zIndex = 10003;
            portraitManualDesc.style.position = "fixed";
            portraitManualDesc.style.display = "block";
            portraitManualDesc.style.width = "100%";
            portraitManualDesc.style.borderRadius = "10px";
            portraitManualDesc.style.margin = "auto";
            portraitManualDesc.innerHTML = getLocalizedDescContent("portraitManualDesc");
            portraitManualDesc.style.textAlign = "center";
            portraitManualDesc.style.fontSize = "16px";
            portraitManualDesc.style.color = "#7e807f";

            portraitManualGif = new Image();
            var portraitManualGifUrl = getLocalizedAssetUrl("portraitManualGif");
            portraitManualGif.src = portraitManualGifUrl? portraitManualGifUrl : '/images/HideAddressBar_Ver_SRC.gif';
            divIOSFullscreenManual.appendChild(portraitManualGif);
            portraitManualGif.style.position = "fixed";
            portraitManualGif.style.display = "block";
            portraitManualGif.style.width = "216px";
            portraitManualGif.style.height = "408px";
            portraitManualGif.style.zIndex = 10003;

            portraitManualFrame = new Image();
            portraitManualFrame.src = '/images/Border_360x680.png';
            divIOSFullscreenManual.appendChild(portraitManualFrame);
            portraitManualFrame.style.position = "fixed";
            portraitManualFrame.style.display = "block";
            portraitManualFrame.style.width = "222px";
            portraitManualFrame.style.height = "414px";
            portraitManualFrame.style.zIndex = 10004;
        }

        bgFullscreenBlock = document.createElement("div");
        divIOSFullscreenManual.appendChild(bgFullscreenBlock);
        bgFullscreenBlock.style.position = "fixed";
        bgFullscreenBlock.style.display = "block";
        bgFullscreenBlock.style.zIndex = 10005;
        bgFullscreenBlock.addEventListener('click', onClickManualBG);

        sideBar = document.createElement("div");
        sideBar.style.backgroundImage = "url('/images/rect_Scoll.png')";
        sideBar.style.borderRadius = "3px";
        divIOSFullscreenManual.appendChild(sideBar);
        sideBar.style.zIndex = 10006;
        sideBar.style.position = "fixed";
        sideBar.style.display = "block";
        var sidebarBtn = document.createElement("div");
        sideBar.appendChild(sidebarBtn);
        sidebarBtn.style.width = "30px";
        sidebarBtn.style.height = "30px";
        sidebarBtn.style.zIndex = 10007;
        sidebarBtn.addEventListener('click', onClickCloseManualButton);

        closeManualBtn = new Image();
        closeManualBtn.src = '/images/Btn_Close.png';
        divIOSFullscreenManual.appendChild(closeManualBtn);
        closeManualBtn.style.position = "fixed";
        closeManualBtn.style.display = "block";
        closeManualBtn.style.width = "19px";
        closeManualBtn.style.height = "19px";
        closeManualBtn.style.zIndex = 10007;
        closeManualBtn.addEventListener('click', onClickCloseManualButton);
    }
}

function onClickCloseManualButton() {
    showIOSFullScreenManual(false);
}

function onClickManualOverlay() {
    if(!canClickOverlay) return;
    onClickCloseManualButton();
}

function onClickManualBG() {
    canClickOverlay = false;
    setTimeout(function (){
        canClickOverlay = true;
    }, 100);
}

function getDurationFromLastTime(lastTime) {
    var curDate = new Date();
    var curTime = curDate.getTime();
    var duration = Number(curTime) - Number(lastTime);
    return duration;
}

function setHiddenPopUpDayLimit(limit) {
    hiddenPopUpDayLimit =  Number(limit);
}

function onOrientationChanged(){
    var isCanvasAligned = false;
    setTimeout(function() {
        if(isiPhone){
            if(window.orientation == 90 || window.orientation == -90){
                cc.game.container && cc.game.container.style && listenChangeSize(false);
                alignGameCanvasWithScreen(500);
                if(isiPhone && isSafari && iOsVersion >= 17 && !isPortraitGame()) {
                    setTimeout(function() {
                        onIOSFullscreenChanged(isFullScreenSafariIOS());
                    }, 500);
                }
                isCanvasAligned = true;
            }else {
                listenChangeSize(true);
            }
        }
        if(isAndroid && getChromeVersion() >= 120) {
            setTimeout(function(){
                fixWrongWindowSize();
                revertOriginalInitFrameSize();
            }, 1000);
            revertOriginalInitFrameSize();
        }
        updateSplashRotation();
        updateSplashSize();
        updateManualAreaSize();
        if(!isCanvasAligned) {
            alignGameCanvasWithScreen(500);
        }
    },100);
}

function updateManualAreaSize() {
    var isLandscape = isLandscapeScreen();
    var heightOffset = isLandscape ? 0 : (window.innerHeight>600? window.innerHeight/6 : 40);
    if(isLandscape) {
        if(portraitManualDesc) {
            portraitManualDesc.style.display = "none";
        }
        if(portraitManualGif) {
            portraitManualGif.style.display = "none";
        }
        if(portraitManualFrame) {
            portraitManualFrame.style.display = "none";
        }

        if(landscapeManualGif) {
            landscapeManualGif.style.display = "block";
            landscapeManualGif.style.top = heightOffset + 54 + "px";
            landscapeManualGif.style.right = (window.innerWidth/2 - 300)/2 + "px";
        }
        if(landscapeManualFrame) {
            landscapeManualFrame.style.display = "block";
            landscapeManualFrame.style.top = heightOffset + 54 + "px";
            landscapeManualFrame.style.right = (window.innerWidth/2 - 300)/2 + "px";
        }
    }else {
        if(landscapeManualGif) {
            landscapeManualGif.style.display = "none";
        }
        if(landscapeManualFrame) {
            landscapeManualFrame.style.display = "none";
        }

        if(portraitManualDesc) {
            portraitManualDesc.style.display = "block";
            portraitManualDesc.style.top = heightOffset + 48 +"px";
        }

        if(portraitManualGif) {
            portraitManualGif.style.display = "block";
            portraitManualGif.style.top = heightOffset + 105 + "px";
            portraitManualGif.style.right = (window.innerWidth - 216)/2 + "px";
        }
        if(portraitManualFrame) {
            portraitManualFrame.style.display = "block";
            portraitManualFrame.style.top = heightOffset + 102 + "px";
            portraitManualFrame.style.right = (window.innerWidth - 222)/2 + "px";
        }
    }
    if(bgFullscreenPanel) {
        bgFullscreenPanel.style.width = isLandscape? "55%" : (window.innerWidth - 2) + "px";
        bgFullscreenPanel.style.height = isLandscape ? (window.innerHeight - 2) + "px" : "100%";
        bgFullscreenPanel.style.top = heightOffset + "px";
        bgFullscreenPanel.style.left = isLandscape? "50%" : "0%";
    }

    if(manualTitle) {
        manualTitle.style.width = isLandscape? "50%" : "100%";
        manualTitle.style.top = heightOffset + 16 +"px";
    }

    if(bgFullscreenBlock) {
        bgFullscreenBlock.style.width = isLandscape? "55%" : "100%";
        bgFullscreenBlock.style.height = "100%";
        bgFullscreenBlock.style.top = heightOffset + "px";
        bgFullscreenBlock.style.left = isLandscape? "50%" : "0%";
    }
    if(sideBar) {
        if(isLandscape) {
            sideBar.style.width = "6px";
            sideBar.style.height = "28px";
            sideBar.style.top = (window.innerHeight/2 - 14) + "px";
            sideBar.style.right = (window.innerWidth/2 - 15) + "px";
        }else {
            sideBar.style.width = "28px";
            sideBar.style.height = "6px";
            sideBar.style.top = heightOffset + 8 + "px";
            sideBar.style.right = (window.innerWidth/2 - 14) + "px";
        }
    }
    if(closeManualBtn) {
        closeManualBtn.style.top = heightOffset + 18 + "px";
        closeManualBtn.style.right = "18px";
    }
}

function alignGameCanvasWithScreen(delayTime = 0){
    setTimeout(function () {
        var canvas = cc.game.canvas;
        var container = cc.game.container;
        if (canvas && container) {
            var portraitGame = isPortraitGame();
            var isLandscape = isLandscapeScreen();
            var isNotSameOrientation = (portraitGame && isLandscape) || (!portraitGame && !isLandscape);
            if(isNotSameOrientation) {
                var pStr = canvas.style.width.substr(0,canvas.style.width.length-2);
                var canvasWidth = Number(pStr);
                if(canvasWidth > window.innerHeight) return;
            }else {
                var str = canvas.style.height.substr(0,canvas.style.height.length-2);
                var canvasHeight = Number(str);
                if(canvasHeight > window.innerHeight) return;
            }
            var _width = isNotSameOrientation? window.innerHeight : window.innerWidth;
            var _height = isNotSameOrientation? window.innerWidth : window.innerHeight;
            var _devicePxRatio = cc.view.getDevicePixelRatio();
            canvas.width = _width * _devicePxRatio;
            canvas.height = _height * _devicePxRatio;

            canvas.style.width = _width + 'px';
            canvas.style.height = _height + 'px';

            container.style.width = _width + 'px';
            container.style.height = _height + 'px';
            cc.view._viewportRect.width = _width * _devicePxRatio;
            cc.view._viewportRect.height = _height * _devicePxRatio;

            var policy = cc.view.getResolutionPolicy();
            if (policy) {
                policy.preApply(cc.view);
            }else{
                return;
            }
            cc.view._adjustViewportMeta();
            cc.view._initFrameSize();

            cc.view._frameSize.width = _width;
            cc.view._frameSize.height = _height;

            cc.game.frame.style.width = _width + "px";
            cc.game.frame.style.height = _height + "px";

            var result = policy.apply(cc.view, cc.view._designResolutionSize);

            if(result.scale && result.scale.length === 2){
                cc.view._scaleX = result.scale[0];
                cc.view._scaleY = result.scale[1];
            }

            if(result.viewport){
                var vp = cc.view._viewportRect,
                    vb = cc.view._visibleRect,
                    rv = result.viewport;

                vp.x = rv.x;
                vp.y = rv.y;
                vp.width = rv.width;
                vp.height = rv.height;

                vb.x = 0;
                vb.y = 0;
                vb.width = rv.width / cc.view._scaleX;
                vb.height = rv.height / cc.view._scaleY;
            }

            policy.postApply(cc.view);


            cc.winSize.width = cc.view._visibleRect.width;
            cc.winSize.height = cc.view._visibleRect.height;

            cc.visibleRect && cc.visibleRect.init(cc.view._visibleRect);


            cc.renderer.updateCameraViewport();
            cc.view.emit('design-resolution-changed');
            var canvasNode = cc.find("Canvas");
            if(canvasNode){
                var canvasComponent = canvasNode.getComponent(cc.Canvas);
                if(canvasComponent){
                    canvasComponent.alignWithScreen();
                    cc._widgetManager.onResized();
                }
            }else{
                console.log("do not node: Canvas");
            }
            var eventFullScreenIOs = new Event('onFullScreenIOs');
            window.dispatchEvent(eventFullScreenIOs);
        }

    }, delayTime);
}

function setFullScreen(settings) { // eslint-disable-line
    var options;
    var canvasDesignResolutionSize = cc.view.getDesignResolutionSize();
    if (canvasDesignResolutionSize) {
        isLandscapeCanvas = canvasDesignResolutionSize.width > canvasDesignResolutionSize.height;
    }
    divFullscreen = document.getElementById('div_full_screen');
    handImage = document.getElementById('handImage');
    enterFullscreenBtn = document.getElementById('enterFullscreen');
    exitFullscreenBtn = document.getElementById('exitFullscreen');
    if(isMobile){
        var gameCanvas = document.getElementById('GameCanvas');
        window.ontouchend = onWindowTouchEnded;
        window.ontouchstart = onWindowTouchStarted;
        if(iOS && isChrome) {
            if(gameCanvas) gameCanvas.ontouchend = onTouchEnded;
            window.onscroll = onScroll;
        } else if (isAndroid) {
            if(gameCanvas) gameCanvas.ontouchend = onAndroidChomeTouchEnd;
        }
    }
    var urlRuFS = new URL(window.location);
    var disableFullscreen = urlRuFS.searchParams.get('disableFullscreen');
    getCurrentLanguage(urlRuFS);
    iOsVersion = checkIOSVersion();

    if (isMobile && isAndroid && isLandscapeCanvas && !disableFullscreen) {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "block";
            divFullscreen.style.visibility = "visible";
        }

        if (typeof enterFullscreenBtn !== 'undefined') {
            enterFullscreenBtn.addEventListener("touchend", toggleFullscreen, false);
        }

        if (typeof exitFullscreenBtn !== 'undefined') {
            exitFullscreenBtn.addEventListener("touchend", toggleFullscreen, false);
        }

        if (document.addEventListener) {
            document.addEventListener('webkitfullscreenchange', onFullscreenChanged, false);
            document.addEventListener('mozfullscreenchange', onFullscreenChanged, false);
            document.addEventListener('fullscreenchange', onFullscreenChanged, false);
            document.addEventListener('MSFullscreenChange', onFullscreenChanged, false);

            document.addEventListener('fullscreenerror', onFullscreenError, false);
            document.addEventListener('mozfullscreenerror', onFullscreenError, false);
            document.addEventListener('webkitfullscreenerror', onFullscreenError, false);
            document.addEventListener('msfullscreenerror', onFullscreenError, false);

        }
    } else {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "none";
            divFullscreen.style.visibility = "hidden";
        }
    }

    if (typeof handImage !== 'undefined') {
        handImage.style.display = 'none';
    }
    if (isMobile && iOS) {
        options = {
            swipeUpContent: '',
            // expandBodyHeightTo: '115vh',
            scrollWindowToTopOnShow: true,
            html5FullScreenContent: '',
        };
    } else if (isMobile && isAndroid)
        options = {
            swipeUpContent: '',
            customCSS: '.fixedFlexBox { position: absolute; top: 0;left: 0; right: 0; bottom: 0; width: 100%;height: 100%; background: rgba(20, 20, 20, 0.001)}',
            html5FullScreenContent: '',
        };
    if (typeof SwipeUp !== 'undefined' && iOsVersion < 15) {
        swipeUp = new SwipeUp(options);
    }

    window.addEventListener('resize', listenCallBack);

    listenCallBack();

    if(isiPhone){
        window.addEventListener('gameShow', function(){
            var isLandscape = isLandscapeScreen();
            if(isFullScreenIOS && isLandscape || isPortraitGame()){
                if(cc.view._frameSize.width !== window.innerWidth || cc.view._frameSize.height !== window.innerHeight){
                    // alignGameCanvasWithScreen(500);
                }
            }
        });
        window.addEventListener('focus', function (){
            checkViewIOS();
        });
        checkViewIOS(); // !for case reload
    }

    cc.view.enableRetina(true);
    cc.view.resizeWithBrowserSize(true);

    if (cc.sys.isBrowser) {
        setLoadingDisplay();
    }

    if (cc.sys.isMobile) {
        if (settings.orientation === 'landscape') {
            cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
        }
        else if (settings.orientation === 'portrait') {
            cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        }
    }
    if(cc.game) {
        cc.game.on(cc.game.EVENT_SHOW, onGameShow);
    }

    if(cc.director) {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, onBeforeLoadScene);
    }
}

function onGameShow() {
    alignGameCanvasWithScreen(500);
    setTimeout(function() {
        fixWrongWindowSize();
        if(isAndroid && getChromeVersion() >= 120) {
            callResizeEvent();
        }
    }, 500);
}

function callResizeEvent() {
    setTimeout(function(){
        window.dispatchEvent(new Event('resize'));
    }, 200);
}

function getCurrencyFromUrl() {
    var urlRuFS = new URL(window.location);
    var currency = urlRuFS.searchParams.get('c');
    currency = currency? currency : 'vnd';
    currency = currency.toLocaleLowerCase();
    return currency;
}

function getCurrentLanguage(_urlRuFS) {
    //priority get language from settings
    if (settings.folderLanguage && settings.folderLanguage !== 'all') {
        currentLanguage = settings.folderLanguage;
        return currentLanguage;
    }
    var urlRuFS = _urlRuFS;
    if(!urlRuFS) {
        urlRuFS = new URL(window.location);
    }
    currentLanguage = urlRuFS.searchParams.get('l');
    currentLanguage = currentLanguage? currentLanguage : 'vi';
    currentLanguage = currentLanguage.toLowerCase();
    return currentLanguage;
}

function getLocalizedAssetUrl(key) {
    if(!currentLanguage) getCurrentLanguage();
    if(LocalizedAssetUrl[key]) {
        return LocalizedAssetUrl[key][currentLanguage];
    }
    return null;
}

function getLocalizedDescContent(key) {
    if(!currentLanguage) getCurrentLanguage();
    if(LocalizedDescriptionContent[key]) {
        if (LocalizedDescriptionContent[key][currentLanguage]) {
            return LocalizedDescriptionContent[key][currentLanguage];
        }
        if (LocalizedDescriptionContent[key]["vi"]) {
            return LocalizedDescriptionContent[key]["vi"];    
        }
    }
    return key;
}

function saveToLocalStorage(key, value){
    if(!localStorage) return null;
    localStorage.setItem(key, value);
    return value;
}

function loadFromLocalStorage(key){
    if(!localStorage) return null;
    return localStorage.getItem(key);
}

function overrideInitFrameSize(customHeight = 0) {
    if (!cc.view) return;
        if (!cc.view._originalInitFrameSize) {
            cc.view._originalInitFrameSize = cc.view._initFrameSize;
        }
        cc.view._initFrameSize = function () {
            var view = cc.view;
            var locFrameSize = view._frameSize;
            var w = Math.min(document.documentElement.clientWidth, window.innerWidth);
            var h = customHeight > 0? customHeight : Math.max(document.documentElement.clientHeight, window.innerHeight);
            var isLandscape = w >= h;

            if (!cc.sys.isMobile ||
                (isLandscape && this._orientation & cc.macro.ORIENTATION_LANDSCAPE) ||
                (!isLandscape && this._orientation & cc.macro.ORIENTATION_PORTRAIT)) {
                locFrameSize.width = window.innerWidth;
                locFrameSize.height = h;
                cc.game.container.style['-webkit-transform'] = 'rotate(0deg)';
                cc.game.container.style.transform = 'rotate(0deg)';
                view._isRotated = false;
            }
            else {
                locFrameSize.width = h;
                locFrameSize.height = w;
                cc.game.container.style['-webkit-transform'] = 'rotate(90deg)';
                cc.game.container.style.transform = 'rotate(90deg)';
                cc.game.container.style['-webkit-transform-origin'] = '0px 0px 0px';
                cc.game.container.style.transformOrigin = '0px 0px 0px';
                view._isRotated = true;
            }

            if (cc.view._orientationChanging) {
                setTimeout(function () {
                    cc.view._orientationChanging = false;
                }, 1000);
            }
        };
}

function revertOriginalInitFrameSize() {
    if (cc.view && cc.view._originalInitFrameSize) {
        cc.view._initFrameSize = cc.view._originalInitFrameSize;
    }
}

function checkWrongClientHeight() {
    if (document.documentElement.clientHeight > window.innerHeight) { // fix for open chrome tab from link.
        overrideInitFrameSize();
        cc.view._resizeEvent();
    }
    else {
        revertOriginalInitFrameSize();
    }
    if (window.innerHeight === window.screen.height) {
        alert(getLocalizedDescContent("warningUserRotateParallel"));
    }
}

function toggleFullscreen(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.bubbles = false;
    event.propagationStopped = true;
    event.propagationImmediateStopped = true;
    if (document.fullscreenElement || /* Standard syntax */
        document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
        document.mozFullScreenElement ||/* Firefox syntax */
        document.msFullscreenElement) {

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }

        if (typeof exitFullscreenBtn !== 'undefined') {
            exitFullscreenBtn.style.display = 'none';
        }

    } else {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.msRequestFullscreen) {
            docElm = document.body; //overwrite the element (for IE)
            docElm.msRequestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }

        if (typeof enterFullscreenBtn !== 'undefined') {
            enterFullscreenBtn.style.display = 'none';
        }
    }
    event.preventDefault();
}

function onFullscreenChanged() {
    if (isMobile && isAndroid) {
        if (document.fullscreenElement || /* Standard syntax */
            document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
            document.mozFullScreenElement ||/* Firefox syntax */
            document.msFullscreenElement) {
                revertOriginalInitFrameSize();
                setTimeout(function () {
                    if (typeof exitFullscreenBtn !== 'undefined') {
                        exitFullscreenBtn.style.display = 'block';
                    }
                    if (typeof enterFullscreenBtn !== 'undefined') {
                        enterFullscreenBtn.style.display = 'none';
                    }
                    callResizeEvent();
                }, 10);
        } else {
                setTimeout(function () {
                    if (typeof enterFullscreenBtn !== 'undefined') {
                        enterFullscreenBtn.style.display = 'block';
                    }
                    if (typeof exitFullscreenBtn !== 'undefined') {
                        exitFullscreenBtn.style.display = 'none';
                    }
                    setTimeout(saveWindowInnerHeight, 400);
                    callResizeEvent();
                }, 10);
        }
    }
}

function onFullscreenError() {
    setTimeout(function () {
        if (typeof enterFullscreenBtn !== 'undefined') {
            enterFullscreenBtn.style.display = 'block';
        }
        if (typeof exitFullscreenBtn !== 'undefined') {
            exitFullscreenBtn.style.display = 'none';
        }
    }, 10);
}

function setLoadingDisplay() {
    // var progressBar = splash.querySelector('.progress-bar span');
    // cc.loader.onProgress = function (completedCount, totalCount, item) {
    // var percent = 100 * completedCount / totalCount;
    // if (progressBar) {
    //     progressBar.style.width = percent.toFixed(2) + '%';
    // }
    // };
    // splash.style.display = 'block';
    // progressBar.style.width = '0%';
    if(typeof loadingIcon !== 'undefined' && loadingIcon != null && isPortraitGame()){
        loadingIcon.style.display = 'block';
    }
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, hideSplashOnSceneLoaded);
}

function onBeforeLoadScene(sceneName) {
    var startSceneName = getSceneNameFromPath(settings.launchScene);
    var currentSceneName = getSceneNameFromPath(sceneName);
    if(currentSceneName != startSceneName) {
        overrideInitFrameSize();
        fixWrongWindowSize();
    }
}

function hideSplashOnSceneLoaded(scene) {
    var launchScene = settings.launchScene;
    var startSceneName = getSceneNameFromPath(launchScene);
    if(multiOrientationGame){
        if(scene.name!== startSceneName){
            hideSplashByDelay(500);
        }
    }else{
        hideSplashByDelay(500);
    }
    if(scene.name!== startSceneName){
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, hideSplashOnSceneLoaded);
        fixWrongWindowSize();
        revertOriginalInitFrameSize();
    }
}

function hideSplashByDelay(delay){
    setTimeout(function () {
        if (!splash) splash = getSplash();
        if (splash) {
            splash.style.display = 'none';
        }
        if(typeof loadingIcon !== 'undefined' && loadingIcon != null && isPortraitGame()){
            loadingIcon.style.display = 'none';
        }
        loadOver = true;
        if(isMobile && !isLandscapeCanvas){
            showWarningUserRotate();
        }
    }, delay);
    // listenCallBack();
}

function getApiUrl(url)
{
    var urlPart = url.split('/');
    return urlPart[0] + "//" + urlPart[2] + "/share/lib.js";
}

function validURL(str)
{
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

var urlRu = new URL(window.location);
var paramHref = urlRu.searchParams.get('ru');
if (paramHref && validURL(paramHref))
{
    var isDomainFound = false;
    for (var i = 0; i < listDomain.length; i++) {
        if (paramHref.indexOf(listDomain[i]) > -1) {
            isDomainFound = true;
        }
    }
    if (!isDomainFound) {
        var fullUrl = getApiUrl(paramHref);
        var depositLib = document.createElement('script');
        depositLib.type = "text/javascript";
        depositLib.src = fullUrl;
        document.body.appendChild(depositLib);
    }
}

/**
 * @fix_portrait_iphone
 */
function checkViewIOS(){
    if (window.orientation == 90 || window.orientation == -90) { // landscape
        alignGameCanvasWithScreen(500);
        listenChangeSize(false);
    } else {
        listenChangeSize(true);
    }
}

function listenChangeSize(isListen) {
    lastWindowHeight = window.innerHeight;
    if (isListen) {
        if(intervalCheckSize) {
            clearInterval(intervalCheckSize);
            intervalCheckSize = void 0;
        }
        intervalCheckSize = setInterval(checkSize, 500);
    } else {
        if(intervalCheckSize){
            clearInterval(intervalCheckSize);
            intervalCheckSize = void 0;
        }
        document.body.style.top = "0px";
        if(iOsVersion >= 17) return;
        cc.view._resizeEvent();
    }
}

function checkSize() {
    if(isChrome && !isPortraitGame()){
        checkWrongClientHeight();
    }
    if (checkShowingKeyboard()) return;

    if (isSafari) {
        window.scrollTo(0, 0);
    } else if (isChrome) {
        if (window.pageYOffset !== 0) {
            window.scrollBy(0, -1 * window.pageYOffset);
        }
    }

    var isMinimalUI = checkMinimalUI();

    if (isMinimalUI) {
        var diff = Math.abs(lastWindowHeight - window.innerHeight);
        lastWindowHeight = window.innerHeight;
        if (diff > 20) { // minimal-ui: resize but keep listener
            if (isChrome) {
                var offsetY = isIphoneX ? Math.abs(window.innerHeight - document.documentElement.clientHeight) / 3
                    : Math.abs(window.innerHeight - document.documentElement.clientHeight) / 4;
                document.body.style.top = offsetY + "px";
            }
            setTimeout(function () {
                cc.view._resizeEvent();
            }, 20);
        }
    } else { // full-ui: resize and clear listener
        lastWindowHeight = window.innerHeight;
        document.body.style.top = "0px";
        if (intervalCheckSize) {
            clearInterval(intervalCheckSize);
            intervalCheckSize = void 0;
        }
        setTimeout(function () {
            cc.view._resizeEvent();
        }, 20);
    }
}

function checkMinimalUI() {
    var frameSize = cc.view.getFrameSize();
    var diffHeight = (window.innerHeight - frameSize.height);
    return diffHeight > 40;
}

function viewportHandler(event) {
    var viewport = event.target;
    viewportHeight = viewport.height;
}

function checkShowingKeyboard() {
    var outerHeight = window.outerHeight;
    var visibleAreaRatio = viewportHeight / outerHeight;
    var isLandscape = isLandscapeScreen();
    var threshold = isLandscape? 0.5 : 0.7;
    var showingKeyboard = visibleAreaRatio < threshold;
    return showingKeyboard;
}

var XORCipher = {
    encode: function(key, data) {
        data = xor_encrypt(key, data);
        return b64_encode(data);
    },
    decode: function(key, data) {
        data = b64_decode(data);
        return xor_decrypt(key, data);
    },
};

function stringToUtf8ByteArray(str) {
    var out = [], p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        } else if (
            ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
            ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
}

function utf8ByteArrayToString(bytes) { // array of bytes
    var out = [], pos = 0, c = 0;
    while (pos < bytes.length) {
        var c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
            var c2 = bytes[pos++];
            out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            var c2 = bytes[pos++]; // eslint-disable-line
            var c3 = bytes[pos++];
            var c4 = bytes[pos++];
            var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
                0x10000;
            out[c++] = String.fromCharCode(0xD800 + (u >> 10));
            out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
        } else {
            var c2 = bytes[pos++]; // eslint-disable-line
            var c3 = bytes[pos++]; // eslint-disable-line
            out[c++] =
                String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
    }
    return out.join('');
}

var b64_table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function b64_encode(data) {
    var o1, o2, o3, h1, h2, h3, h4, bits, r, i = 0, enc = "";
    if (!data) { return data; }
    do {
        o1 = data[i++];
        o2 = data[i++];
        o3 = data[i++];
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        enc += b64_table.charAt(h1) + b64_table.charAt(h2) + b64_table.charAt(h3) + b64_table.charAt(h4);
    } while (i < data.length);
    r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
}

function b64_decode(data) {
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, result = [];
    if (!data) { return data; }
    data += "";
    do {
        h1 = b64_table.indexOf(data.charAt(i++));
        h2 = b64_table.indexOf(data.charAt(i++));
        h3 = b64_table.indexOf(data.charAt(i++));
        h4 = b64_table.indexOf(data.charAt(i++));
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;
        result.push(o1);
        if (h3 !== 64) {
            result.push(o2);
            if (h4 !== 64) {
                result.push(o3);
            }
        }
    } while (i < data.length);
    return result;
}

function xor_encrypt(key, data) {
    key = stringToUtf8ByteArray(key);
    return stringToUtf8ByteArray(data).map(function(c, i) {
        return c ^ Math.floor(i % key.length);
    });
}

function xor_decrypt(key, data) {
    key = stringToUtf8ByteArray(key);
    return utf8ByteArrayToString(data.map(function(c, i) {
        return c ^ Math.floor(i % key.length);
    }));
}

var configLinkEnc = '/config-enc-v2.json';
function methodGetData(url, callback, callbackErr) {
    var request = new XMLHttpRequest();
    var timeStampBuild = window.buildTime ? parseInt(window.buildTime) : new Date().getTime();
    var fullURL = url + '?t=' + timeStampBuild;
    request.open("GET", fullURL, true);
    request.timeout = 3000;
    request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            //get status text
            if (request.responseText) {
                try {
                    const json = JSON.parse(request.responseText);
                    callback(json);
                }
                catch(e) {
                    console.warn('json invalid ' + configLinkEnc);
                }
            } else {
                handleBackGame();
            }
        } else if (request.readyState === 0) {
            callbackErr();
        }
        if (request.status !== 200) {
            callbackErr();
        }
    };
    request.ontimeout = function () {
        callbackErr();
    };
    request.onerror = function () {
        callbackErr();
    };
    request.send();
}

function encodeQueryData(data) {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}

function methodPostData(url, data, callback, callbackErr) {
    var request = new XMLHttpRequest();
    var fullURL = url;
    request.open('POST', fullURL, true);
    request.timeout = 3000;
    var dataPost = encodeQueryData(data);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            //get status text
            if (request.responseText) {
                callback(JSON.parse(request.responseText));
            } else {
                callbackErr();
            }
        } else if (request.readyState === 0) {
            callbackErr();
        }
        if (request.status !== 200) {
            callbackErr();
        }
    };
    request.ontimeout = function () {
        // callbackErr();
    };
    request.onerror = function () {
        callbackErr();
    };
    request.send(dataPost);
}

function handleBackGame(mess) {
    if (window.dataConfigM) {
        alert(mess ? mess: getLocalizedDescContent('authenticateFailed'));
        if (paramHref) {
            if (paramHref.trim() === 'close') {
                window.close();
            } else {
                window.location.href = paramHref;
            }
        } else {
            window.close();
        }
    }
}
var historyParam = urlRu.searchParams.get('history');
var trialParam = urlRu.searchParams.get('trialMode');
function handleLogin(API_URL, dataPost) {
    methodPostData(API_URL + 'auth/token/login', dataPost, function (res) {
        if (res && res.data) {
            if (res.data.displayName && res.data.token && res.data.userId && res.data.hasOwnProperty('wallet')) {
                window.dataLoginM = res.data;
            }
        }
        else if (typeof res.errors !== 'undefined' && typeof res.errors[0] !== 'undefined'
            && res.errors[0] === '4075') {
            handleBackGame();
        }
        else if (res && res.error && res.error.code === 4072) {
            handleBackGame(getLocalizedDescContent("beLockedGame") + ' ' + document.title.replace('Techplay - ', '') + '!');
        }
        else {
            // handleBackGame();
        }
    }, function () {
        // handleBackGame();
    });
}

if (!(historyParam && historyParam === 'true') && !trialParam) {
    var token = urlRu.searchParams.get('token');
    var thirdParam = urlRu.pathname.replace(/\//g, '');
    thirdParam = thirdParam.replace('kts', 'kts_').replace('ktf', 'ktf_').replace('ktc', 'ktc_').replace('ktrng', 'ktrng_');
    var dataPost = { token: token, gameId: thirdParam };
    if (!token) {
        handleBackGame();
    } else {
        methodGetData(configLinkEnc,
            function(data) {
                if (data.IS_DECODE) {
                    var keyEncrypt = 'Không Biết Đặt Tên Gì';
                    Object.keys(data).forEach(function(key) {
                        if (key === 'API_URL' || key === 'SOCKET_URL' || key.indexOf('IPMaster') > -1) {
                            if (Array.isArray(data[key])) {
                                for (let i = 0; i < data[key].length; i++) {
                                    data[key][i] = XORCipher.decode(keyEncrypt, data[key][i]);
                                }
                            } else {
                                data[key] = XORCipher.decode(keyEncrypt, data[key]);
                            }
                        }
                    });
                }
                delete data.IS_DECODE;
                window.dataConfigM = data;

                var DeviceAtlas = {
                    onPropertiesUpdate: function(properties, propertiesAsString) {
                        var req = new XMLHttpRequest();
                        req.onreadystatechange = function() {
                            if (req.readyState == XMLHttpRequest.DONE) {
                                console.log("device Alias", req.responseText);
                            }
                        }
                        req.open('GET', data.API_URL + '/deviceatlas-api-on-server-side', true);
                        req.setRequestHeader('DeviceAtlas-Client-Side-String', propertiesAsString);
                        req.send(null);
                    }
                }
                window.localStorage.setItem('applicationConfig', JSON.stringify(window.dataConfigM));

                handleLogin(data.API_URL, dataPost);
            }, function() {
                var localStoredConfig = localStorage.getItem('applicationConfig');
                if (localStoredConfig) {
                    localStoredConfig = JSON.parse(localStoredConfig);
                    handleLogin(localStoredConfig.API_URL, dataPost);
                }
            });
    }
}
var LocalizedAssetUrl = {
    "landscapeManualGif": {
        "vi" : '/images/HideAddressBar_Hor_SRC.gif',
        "en" : '/images/HideAddressBar_Hor_Eng.gif',
    },
    "portraitManualGif": {
        "vi" : '/images/HideAddressBar_Ver_SRC.gif',
        "en" : '/images/HideAddressBar_Ver_Eng.gif',
    },
};

var LocalizedDescriptionContent = {
    "warningUserLockScreen": {
        "vi": "Vui lòng khoá xoay màn hình hoặc sử dụng trình duyệt Safari để có trải nghiệm chơi game tốt nhất!",
        "en": "Please lock device orientation or open Safari browser for the best experience!",
        "th": "กรุณาล็อคการหมุนหน้าจอหรือใช้เบราว์เซอร์ซาฟารีเพื่อประสบการณ์การเล่นเกมที่ดีที่สุด!"
    },
    "warningUserRotate": {
        "vi": "Vui lòng đổi về màn hình dọc</br>để tiếp tục chơi game!",
        "en": "Please switch back to portrait mode</br>to continue the game!",
        "th": "กรุณาเปลี่ยนเป็นหน้าจอแนวตั้ง</br>เพื่อเล่นเกมต่อไป!"
    },
    "manualTitle": {
        "vi": "Trước khi bắt đầu",
        "en": "Before start",
        "th": "ก่อนเริ่ม"
    },
    "portraitManualDesc": {
        "vi": "Thử ấn thanh công cụ Safari để có</br>trải nghiệm tốt hơn",
        "en": "Press Safari Toolbar</br>for better experience",
        "th": "ลองกดแถบเครื่องมือซาฟารี</br>เพื่อรับประสบการณ์ที่ดีกว่า"
    },
    "warningUserRotateParallel": {
        "vi": "Vui lòng xoay màn hình qua lại để game hiển thị đúng",
        "en": "Please rotate device back and forth to make the game display properly",
        "th": "กรุณาหมุนหน้าจอไปมาเพื่อให้เกมแสดงผลได้อย่างถูกต้อง"
    },
    "beLockedGame": {
        "vi": "Bạn bị khoá chơi game",
        "en": "You are locked out of the game",
        "th": "ลองกดแถบเครื่องมือซาฟารีเพื่อรับมัน ประสบการณ์ที่ดีกว่า"
    },
    "authenticateFailed": {
        "vi": "Xác thực tài khoản thất bại.",
        "en": "Account authentication failed.",
        "th": "การตรวจสอบบัญชีล้มเหลว"
    },
}

const defaultSceneLoc = {
    "vi": "vi-vnd",
    "th": "th-usd",
    "en": "en-usd",
}

function findDefaultScene(lang) {
    var sceneName = defaultSceneLoc[lang];
    for (var i = 0; i < settings.scenes.length; i++) {
        if (settings.scenes[i].url.indexOf(sceneName.toUpperCase()) >= 0) {
            return settings.scenes[i].url;
        }
    }
    return null;
}

function updateMultiLanguages () {
    var lang = getCurrentLanguage();
    var currency = getCurrencyFromUrl();
    let sceneCode = lang + '-' + currency;
    if (!lang || (lang == 'vi' && !currency) || sceneCode == 'vi-vnd') {
        if (window._customTitlePage) {
            document.title = window._customTitlePage;
        }
        return;
    }

    var foundScene = false;
    for (var i = 0; i < settings.scenes.length; i++) {
        if (settings.scenes[i].url.indexOf("_"+lang) >= 0) {
            window._CCSettings.launchScene = settings.scenes[i].url;
            foundScene = true;
            break;
        }
        else if (settings.scenes[i].url.indexOf(sceneCode.toUpperCase()) >= 0) {
            window._CCSettings.launchScene = settings.scenes[i].url;
            foundScene = true;
            break;
        }
    }
    if (!foundScene) {
        var defaultScene = findDefaultScene(lang);
        if (defaultScene) {
            window._CCSettings.launchScene = defaultScene;
        }
    }
    
    var gameTitles = window._CCSettings.gameTitles;
    if (gameTitles) {
        if (gameTitles[lang]) {
            document.title = gameTitles[lang].title;
        } else {
            if (window._customTitlePage) {
                document.title = window._customTitlePage;
            }
        }
    } else {
        var handleMeta = function (data) {
            if (data[lang]) {
                document.title = data[lang].title;
            } else {
                if (window._customTitlePage) {
                    document.title = window._customTitlePage;
                }
            }
        };
    
        fetch("./i10nMeta.json")
        .then(function (response) {
            return response.clone().json();
        })
        .then(function (meta) {
            handleMeta(meta);
        })
        .catch(function (e) {
            console.log('Couldnt request meta', e);
        })
    }
}
updateMultiLanguages();