var Video = (function() {
    
    var $container;
    var $jPlayer;
    var $gui;
    
    var player;
    
    var isInit = false;
    var playTimeout;
    var playhead;

    var videoFolder = '/';
    
    function init(params) {

        if (typeof params.nativeControls === "undefined") params.nativeControls = false;
        if (typeof params.trueFullscreen === "undefined") params.trueFullscreen = true;
        if (typeof params.fullscreenHandler === "undefined") params.fullscreenHandler = function(){};
        if (typeof params.normalscreenHandler === "undefined") params.normalscreenHandler = function(){};
        if (typeof params.videoPath === "undefined") params.videoPath = '';

        player = new SimpleVideo("simpleVideo", {
            nativeControls: params.nativeControls,
            allowFullscreen: Modernizr.fullscreen,
            //trueFullscreen: (GLOBAL.userAgent != 'safari'),
            trueFullscreen: params.trueFullscreen,
            onFullscreen: params.fullscreenHandler,
            onNormalscreen: params.normalscreenHandler
        });

        videoFolder = params.videoPath + '/';
        /*if (GLOBAL.userAgent == 'iPhone') {
            videoFolder = GLOBAL.videoPath + 'iphone/';
        }*/
    }
    
    
    function playVideo(workData) {
        
        if (!isInit){
            player.init(function() {
                isInit = true;
            });
            
            clearTimeout(playTimeout);
            setTimeout(function(){
                playVideo(workData);
            }, 100);
            return;
        }
        
        player.setFile([
             // one content, multiple formats
             {src:videoFolder + workData.videoFile, type: 'video/mp4'}
         ], (workData.type === 'audio'));
        
        if (typeof workData.allowScrub === "undefined") workData.allowScrub = true; 
        player.setScrub(workData.allowScrub);

        if (typeof workData.hasAudio === "undefined") workData.hasAudio = true; 
        player.setHasAudio(workData.hasAudio);

        player.setRepeat(workData.loop);
        player.play();
    }
    
    function pauseVideo() {
        if (!isInit) return;
        player.pause();
    }
    
    function resumeVideo() {
        if (!isInit) return;
        player.play();
    }
    
    function restartVideo() {
        if (!isInit) return;
        player.seek(0);
    }
    
    function clearVideo() {
        if (!isInit) return;
        player.clear();
    }
    
    return {
        init: init,
        playVideo: playVideo,
        clearVideo: clearVideo,
        pauseVideo: pauseVideo,
        resumeVideo: resumeVideo
    };
    
}());