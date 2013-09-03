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
    }

    function thumbHover() {
        var $this = $(this);
        if ($this.data('isOver') === true) return;
        $this.data('isOver', true);

        var $thumbOverImg = $('<img class="thumb-over-img transition small" src="' + $('img',$this).attr('src') + '" alt="">');

        var $info = $("#cls .thumb-over-info").clone();
        $('.title', $info).html($this.attr('data-title'));
        $('.type', $info).html($this.attr('data-type'));

        $thumbOverImg.data('info', $info);

        $this.append($thumbOverImg);
        $thumbOverImg.data('to1', setTimeout(function() {
            $thumbOverImg.removeClass('small');
        },5));

        $this.append($info);
        $thumbOverImg.data('to2', setTimeout(function() {
            $info.removeClass('hold-high');
        },250));
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

    function show404() {

    }

    function showNoWork() {
        $('.me-blurry', $noWork).removeClass('out');
    }

    function getWork(slug) {
        $.post('/work/' + slug + '/', {}, function(data) {
            if (data && data.success) {

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

                currentWorkData = data;
                $currentWork = $("#cls .work-content").clone();

                $('h1', $currentWork).html(data.title);
                if (data.specs != '') {
                    $('.work-specs', $currentWork).html(data.specs);
                }
                if (data.info != '') {
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
                            //Video.playVideo(data);
                        };
                        break;

                    case 'website':
                        var urlName = data.url.replace('http://', '');
                        if (urlName.charAt(urlName.length-1) == '/') {
                            urlName = urlName.slice(0, -1);
                        }
                        $('.work-link', $currentWork).attr('href', data.url).html(urlName);

                        $webContainer = $("#cls .web-container").clone();
                        $webContainer.attr('href', data.url);
                        
                        $('.big-image', $webContainer).attr('src', data.image);
                        $currentWork.prepend($webContainer);
                        break;
                }

                $workWrapper.append($currentWork);
                setTimeout(function() {
                    $currentWork.removeClass('hold-high');
                    if (readyHandler) {
                        TransitionController.transitionEnd($currentWork, readyHandler);
                    }
                }, 10);
                

            } else {
                show404();
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

        Work.init();
        $('.nav-link.work').on('click', function() {
            if (page == 'who') {
                window.location = "/#";
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

        page = path;
        if (path.length > 0) {
            $('html, body').animate({
                scrollTop: 0
            }, 350);
            switch (path[0]) {
                case 'who':
                    $('body').addClass('page-who');
                    break;
                    
                default:
                    $('body').removeClass('page-who');
                    Work.getWork(path[0]);
                    break;
            }
        
        } else {
            $('body').removeClass('page-who');
            Work.showNoWork();
        }
        
    }

    return {
        init: init
    };

}());