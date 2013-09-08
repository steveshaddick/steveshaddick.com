function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var Work = (function() {

    var $workWrapper = false;
    var $thumbs = false;
    var $noWork = false;
    var $currentWork = false;
    var $videoContainer = false;
    var currentWorkData = false;
    var firstNoWork = true;

    function init() {
        $workWrapper = $("#workWrapper");
        $noWork = $("#noWork");
        $thumbs = $("#thumbsWrapper");
        $videoContainer = $("#videoPlayerContainer");
        Video.init({
            videoPath: 'http://video.steveshaddick.com'
        });
        //$videoContainer.addClass('displayNone');
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
        var pos = $this.data('info').offset();
        var $info = $this.data('info');

        $this.data('info').css({
            top: pos.top - $(window).scrollTop(),
            left: pos.left
        });
        $("#dropOverlay").append($info);
        
        $this.addClass('small');
        setTimeout(function() {
            $info.css('top', '').addClass('drop');
        }, 10);

        clearTimeout($this.data('to1'));
        clearTimeout($this.data('to2'));
        
        setTimeout(function() {
            $this.parent().data('isOver', false);
            $this.remove();
        }, 350);
        setTimeout(function() {
           $info.remove();
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
                    Video.clearVideo();
                    var $swap = $("#cls .video-swap").clone();
                    $swap.css({
                        height: $videoContainer.height(),
                        width: $videoContainer.width()
                    });

                    $("#cls").append($videoContainer);
                    $currentWork.prepend($swap);
                    break;
            }
        }

        var $oldWork = $currentWork;
        $oldWork.addClass('drop');
        TransitionController.transitionEnd($oldWork, function() {
            $oldWork.remove();
        });
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
                $currentWork.prepend($videoContainer);
                readyHandler = function() {
                    Video.playVideo(data);
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

        MailList.init();
        Work.init();
        WindowResize.addHandler(resizeHandler);


        $('.nav-link.work').on('click', function() {
            if (page === 'who') {
                window.location = "/#/" + lastPage;
            }
            $('html, body').animate({
                scrollTop: $("#thumbsWrapper").offset().top
            }, 350);
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
            $('html, body').animate({
                scrollTop: 0
            }, 350);
            switch (path[0]) {
                case 'who':
                    Video.pauseVideo();
                    if (typeof page !== "undefined") {
                        $("#whoBackLink").attr('href', '/#/' + page);
                    }
                    $('body').addClass('page-who');
                    break;
                    
                default:
                    $('body').removeClass('page-who');
                    if (lastPage !== 'who') {
                        Work.getWork(path[0]);
                    }
                    break;
            }
        
        } else {
            $('body').removeClass('page-who');
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
    }

    return {
        init: init,
        showAlert: showAlert,
        closeAlert: closeAlert
    };

}());