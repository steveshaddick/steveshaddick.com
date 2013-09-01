function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var Work = (function() {

    var $noWork = false;

    function init() {
        $noWork = $("#noWork");
        $('.me-blurry', $noWork).removeClass('out');
    }

    function getWork() {
        $.post('/work/getwork', {}, function() {
            
        });
    }

    return {
        init: init
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

        Work.init();

        SWFAddress.onChange = hashChange;

        if (params.needUrlCheck) {
            $.get('/check-urls/');
        }
    }

    function hashChange() {
        var path = SWFAddress.getPathNames();
        console.log('hash change', path);

        if (path.length > 0) {
            
            switch (path[0]) {
                case 'who':
                    $('body').addClass('page-who');
                    break;
                    
                default:
                    $('body').removeClass('page-who');
                    break;
            }
        
        } else {
            $('body').removeClass('page-who');
        }
    }

    return {
        init: init
    };

}());