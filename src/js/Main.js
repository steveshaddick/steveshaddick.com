function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var Video = (function() {

    var instances = [],
        path = 'http://video.steveshaddick.com/';

    function init(params) {
        if (typeof params !== 'undefined') {
            if (typeof params.path !== 'undefined') {
                path = params.path;
            }
        }
    }

    function create(videoId, data) {
        var instance = videojs(videoId, {
            "controls": true, 
            "autoplay": true, 
            "preload": "auto",
            "loop": data.loop,
            "width": "100%",
            "height": "auto",
            "poster": "/static/img/video-poster.gif"
        }, function(){
            this.src(path + data.videoFile);
        });

        instance.on("fullscreenchange", fullscreenHandler);

        instances.push(instance);

        return instance;
    }

    function dispose(instance) {
        for (var i=instances.length-1; i>=0; i--) {
            if (instance == instances[i]){
                instance.pause();
                instance.off("fullscreenchange");
                instance.dispose();
                instances.splice(i,1);
                break;
            }
        }
    }

    function pause(instance) {
        var i=0,
            len;
        if (typeof instance !== "undefined") {
            for (i=0,len=instances.length; i<len; i++) {
                if (instance == instances[i]) {
                    instances[i].pause();
                }
            }
        } else {
            for (i=0,len=instances.length; i<len; i++) {
                instances[i].pause();
            }
        }
    }

    function fullscreenHandler() {
        if ($('body').hasClass('in-fullscreen')) {
            $('body').removeClass('in-fullscreen');
        } else {
            $('body').addClass('in-fullscreen');
        }
    }

    return {
        init: init,
        create: create,
        dispose: dispose,
        pause: pause
    };

}());

var Work = (function() {

   
    var $workWrapper = false;
    var $thumbs = false;
    var $noWork = false;
    var $currentWork = false;
    //var $videoContainer = false;
    var currentWorkData = false;
    var firstNoWork = true;
    var videoPlayer = false;

    function init() {
        $workWrapper = $("#workWrapper");
        $noWork = $("#noWork");
        $thumbs = $("#thumbsWrapper");
        $currentWork = $noWork.parent();

        $thumbs.on('mouseenter', '.work-thumb', thumbHover);
        $thumbs.on('mouseleave', '.thumb-over-img', thumbLeave);
        $thumbs.on('mouseleave', forceLeave);
    }

    function thumbHover() {
        var $this = $(this);
        if ($this.data('isOver') === true) return;
        $this.data('isOver', true);

        $('.thumb-over-img', $thumbs).mouseleave();
        var $thumbOverImg = $('<img class="thumb-over-img transition small" src="' + $('img',$this).attr('src') + '" alt="">');

        var $info = $("#cls .thumb-over-info").clone();
        $('.title', $info).html($this.attr('data-title'));
        $('.type', $info).html($this.attr('data-type'));

        $thumbOverImg.data('info', $info);

        $this.append($thumbOverImg);
        $this.parent().addClass('hover');

        $thumbOverImg.data('to1', setTimeout(function() {
            $thumbOverImg.removeClass('small');
        },0));

        $this.append($info);
        $thumbOverImg.data('to2', setTimeout(function() {
            $info.removeClass('hold-high');
        },250));
    }

    function forceLeave(event) {
        var $el = $(event.target);
        
        if ($el.hasClass('thumb-img')){
            $('.thumb-over-img', $el.parent()).mouseleave();
        } else if ($el.hasClass('thumbs-wrapper')) {
            $('.thumb-over-img', $thumbs).mouseleave();
        }
        //$('.thumb-over-img', $thumbs).mouseleave();
    }

    function thumbLeave() {
        var $this = $(this);
        if ($this.data('leaving')) return;
        $this.data('leaving', true);

        var pos = $this.data('info').offset();
        var $info = $this.data('info');

        $this.data('info').css({
            top: pos.top - $(window).scrollTop(),
            left: pos.left
        });
        $("#dropOverlay").removeClass('displayNone').append($info);
        
        $this.addClass('small');
        setTimeout(function() {
            $info.css('top', '').addClass('drop');
        }, 10);

        clearTimeout($this.data('to1'));
        clearTimeout($this.data('to2'));
        $this.parent().parent().removeClass('hover');
        
        setTimeout(function() {
            $this.parent().data('isOver', false);
            $this.remove();
        }, 350);
        setTimeout(function() {
            
            $info.remove();
            if ($("#dropOverlay").children().length === 0) {
                $("#dropOverlay").addClass('displayNone');
            }
        }, 500);
    }

    function showNoWork() {
        
        if (!$.contains(document.documentElement, $noWork[0])) {
            showWork({type: 'nowork'});
        }
        setTimeout(function() {
            $('.me-blurry', $noWork).removeClass('out');
        },0);
    }

    function dropOldWork() {
        if (currentWorkData) {
            $("#work_" + currentWorkData.id).removeClass('selected');
            switch (currentWorkData.type) {
                case 'video':
                    Video.pause(videoPlayer);
                    break;
            }
        }

        var $oldWork = $currentWork;
        var oldVideoPlayer = videoPlayer;
        TransitionController.transitionEnd($oldWork, function() {
            Video.dispose(oldVideoPlayer);
            $oldWork.remove();
        });
        $oldWork.addClass('drop');
    }

    function showWork(data) {

        dropOldWork();

        currentWorkData = data;
        $currentWork = $("#cls .work-content").clone();

        if (data.title) $('h1', $currentWork).html(data.title);
        if (data.specs && data.specs !== '') {
            $('.work-specs', $currentWork).html(data.specs);
        }
        if (data.info && data.info !== '') {
            $('.work-info', $currentWork).html(data.info);
        } else {
            $('.work-info', $currentWork).remove();
        }

        $("#work_" + data.id).addClass('selected');

        var readyHandler = false;
        switch (data.type) {
            case 'video':
                var $videoContainer = $("#cls .video-container").clone();
                var videoId = 'video_' + data.id;
                $('video', $videoContainer)[0].id = videoId;

                $currentWork.prepend($videoContainer);

                readyHandler = function() {
                    videoPlayer = Video.create(videoId, data); 
                };
                break;

            case 'website':
                var urlName = data.url.replace('http://', '');
                if (urlName.charAt(urlName.length-1) === '/') {
                    urlName = urlName.slice(0, -1);
                }
                $('.work-link', $currentWork).attr('href', data.url).html(urlName);

                var $webContainer = $("#cls .web-container").clone();
                $webContainer.attr('href', data.url);
                if ($('.work-specs', $currentWork).html() === '') {
                    $('.work-specs', $currentWork).html('website');
                }
                
                $('.big-image', $webContainer).attr('src', data.image);
                $currentWork.prepend($webContainer);
                break;

            case '404':
                var $404container = $("#cls .four-oh-four-container").clone();
                if (data.text) $('.text', $404container).html(data.text);
                if (data.randomWork) $('.redirect-link', $404container).attr('href', '/#/' + data.randomWork);
                
                $currentWork.prepend($404container);
                break;

            case 'nowork':
                $currentWork.prepend($noWork);
                break; 
        }

        $workWrapper.append($currentWork);
        setTimeout(function() {
            $currentWork.removeClass('hold-high');
            if (readyHandler) {
                TransitionController.transitionEnd($currentWork, readyHandler);
            }
        }, 10);

        $('.thumb-over-img', $thumbs).mouseleave();
    }

    function getWork(slug) {
        $.post('/work/' + slug + '/', {}, function(data) {
            if (data) {
                showWork(data);               
            } else {
                data = {
                    id: '4O4',
                    type: '404'
                };
                showWork(data);
            }
        });
    }

    return {
        init: init,
        getWork: getWork,
        showNoWork: showNoWork
    };

}());


var Main = (function() {

    var page = '';
    var lastPage = '';
    var $mainPage = false;
    var $whoPage = false;
    var $window = false;

    function init(params) {
        $.ajaxSetup({
            crossDomain: false,
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));
                }
            }
        });

        if (!Modernizr.csstransitions) {
            TransitionController.setAutoWait(350);
        }

        $mainPage = $("#mainPage");
        $whoPage = $("#whoPage");
        $window = $(window);

        MailList.init();
        Work.init();
        if (params.isMobile) {
            Video.init({
                path: 'http://video.steveshaddick.com/iphone/'
            });
        }
        WindowResize.addHandler(resizeHandler);

        $('.nav-link.work').on('click', function() {
            if (page === 'who') {
                if (typeof lastPage !== "undefined") {
                    window.location = "/#/" + lastPage;
                } else {
                    window.location = "/#";
                    setTimeout(function() {
                        $("#mainPage").animate({
                            scrollTop: $("#thumbsWrapper").offset().top
                        }, 350);
                    },350);
                }
            }
        });

        SWFAddress.onChange = hashChange;

        if (params.needUrlCheck) {
            $.get('/check-urls/');
        }
    }

    function hashChange() {
        var path = SWFAddress.getPathNames();

        lastPage = page;
        if (path.length > 0) {
            $('body,html').animate({
                scrollTop: 0
            }, 350);
            switch (path[0]) {
                case 'who':
                    $whoPage.animate({
                        scrollTop: 0
                    }, 350);
                    Video.pause();
                    $whoPage.removeClass('page-closed');
                    $('body').addClass('page-who');
                    $('#whoBackLink').attr('href', '/#/' + lastPage);
                    break;
                    
                default:
                    $mainPage.animate({
                        scrollTop: 0
                    }, 350);
                    $whoPage.addClass('page-closed');
                    $('body').removeClass('page-who');
                    if (lastPage !== 'who') {
                        Work.getWork(path[0]);
                    }
                    break;
            }
        
        } else {
            $('body').removeClass('page-who');
            $whoPage.addClass('page-closed');
            Work.showNoWork();
        }
        page = path[0];
    }

    function showAlert(file, complete) {

        closeAlert(true);
        var $box = $("#alertOverlayBox");

        $("#alertOverlay").removeClass('displayNone');
        $box.load(file, null, complete).addClass('transition').removeClass('reset');

    }

    function closeAlert(override) {
        var $box = $("#alertOverlayBox");

        $box.html('').removeClass('transition').addClass('reset');

        if (override !== true) {
            $("#alertOverlay").addClass('displayNone');
        }
    }

    function resizeHandler() {

        var holdTop = 0,
            $lastItem = false,
            $this = false,
            thisTop = 0,
            lineCount = 0,
            totalCount = 0;
        $('.thumb-item-wrapper').removeClass('right-side').each(function() {
            $this = $(this);
            thisTop = $this.offset().top;
            if ($lastItem) {
                if (thisTop != holdTop) {
                    $lastItem.addClass('right-side');
                    totalCount = lineCount;
                    lineCount = 0;
                }
            }
            lineCount ++;
            holdTop = thisTop;
            $lastItem = $this;
            if (lineCount == totalCount) {
                $this.addClass('right-side');
            }
        });

        var pageHeight = $window.height() - 47;
        $mainPage.css({height: pageHeight});
        $whoPage.css({height: pageHeight});
    }

    return {
        init: init,
        showAlert: showAlert,
        closeAlert: closeAlert
    };

}());