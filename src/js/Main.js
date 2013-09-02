function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var Work = (function() {

    var $workWrapper = false;
    var $noWork = false;
    var $currentWork = false;
    var $videoContainer = false;
    var currentWorkData = false;

    function init() {
        $workWrapper = $("#workWrapper");
        $noWork = $("#noWork");
        $videoContainer = $("#videoPlayerContainer");
        Video.init({
            videoPath: 'http://video.steveshaddick.com'
        });
        //$videoContainer.addClass('displayNone');
        $currentWork = $noWork.parent();
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
                    switch (currentWorkData.type) {
                        case 'video':
                            Video.clearVideo();
                            var $swap = $("#cls .video-swap").clone();
                            $swap.css({
                                height: $videoContainer.height(),
                                width: $videoContainer.width()
                            });

                            $("cls").append($videoContainer);
                            $('.video-container', $currentWork).append($swap);
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

                var readyHandler = false;
                switch (data.type) {
                    case 'video':
                        $('.video-container', $currentWork).append($videoContainer);
                        readyHandler = function() {
                            //Video.playVideo(data);
                        };
                        break;

                    case 'website':
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

        SWFAddress.onChange = hashChange;

        if (params.needUrlCheck) {
            $.get('/check-urls/');
        }
    }

    function hashChange() {
        var path = SWFAddress.getPathNames();

        if (path.length > 0) {
            
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