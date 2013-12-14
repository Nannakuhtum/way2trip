//Global namespace
var w2t = {
    animateTime: 600,
    $showing: $('#main'),
    screenShowEasing: 'easeOutExpo',

    partsBaseUrl: 'parts/',
    route: {
        main: {
            url: '/'
        },
        international: {
            url: '/parts/packages-i.html'
        },
        domestic: {
            url: '/parts/packages-d.html'
        },
        services: {
            url: '/parts/services.html'
        },
        contactUs: {
            url: '/parts/contact-us.html'
        },
        packageDesc: {
            url: '/parts/packages-desc.html'
        }
    },

    //These functions have to be called after dom ready
    showSection: function (sectionName, args) {
        sectionName = sectionName || 'main';
        var $section = $('#' + sectionName), animate = args && args.animate || true; ;

        function show() {
            $section.slideDown(animate && w2t.animateTime, w2t.screenShowEasing);
            w2t.$showing.slideUp(animate && w2t.animateTime, w2t.screenShowEasing);

            w2t.$showing = $section;
        }

        if (!$section.length) {
            $.get(this.route[sectionName].url, {
                time: new Date()
            }, function (data) {
                $('body').append(data);
                $section = $('#' + sectionName);

                show();

                if (args && args.callback) {
                    args.callback.apply(this);
                }
            });
        } else {
            if ($section.css('display') == 'none') {
                show();
            }
        }
    },

    columnHover: function () {
        console.log($(this));
        $(this).hoverdir({
            hoverDelay: 75
        });
    },

    packageClick: function () {
        var thisPackage = $(this).data('package');

        switch (true) {
            case thisPackage && thisPackage.toLowerCase() === 'dubai':
                w2t.showSection('packageDesc');
                break;
            default:
                console.log('no package defined');
                break;
        }
    }
};

//rAF polyfill
(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
} ());

//Dom On Ready
$(function () {
    var topPx = 0, leftPx = 0, sp = 0.1, urlParamSection;

    /*function step(timestamp) {
        leftPx = leftPx % 1680 - sp;
        topPx = topPx % 1050 - sp;
        $('body').css('backgroundPosition', leftPx + 'px ' + topPx + 'px');

        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);*/

    /* State Change Listener */
    History.Adapter.bind(window, 'statechange', function () {
        var State = History.getState(), section = State.data && State.data.section;
        console.log(State);
        switch (true) {
            case section === 'international' || section === 'domestic':
                w2t.showSection(section, {
                    callback: function () {
                        $(' figure ')
                            .click(w2t.packageClick)
                            .each(w2t.columnHover);
                    }
                })
                break;
            default:
                w2t.showSection(section);
                break;
        }

    });

    //On page load route to appropriate screen
    if(urlParamSection = w2t.utils.getParameterByName('section')){
        History.replaceState({
                section: urlParamSection
            }, 
            'Way2Trip - ' + urlParamSection.toUpperCase(), 
            window.location.protocol+"//"+window.location.host + "?section=" + urlParamSection);
    }

    /*UI Initializations & Listeners*/
    $('.menu').click(function (e) {
        e.preventDefault();
        var section = $(this).data('section');
        History.pushState({ section: section }, 'Way2Trip - ' + section.toUpperCase(), "?section=" + section);
    });
});

//Utils
w2t.utils = {
    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}