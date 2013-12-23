//Global namespace
var w2t = {
    animateTime: 600,
    $showing: null,
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
        },
        terms: {
            url: '/parts/terms.html'
        }
    },

    getRoute: function (section, isPackage) {
        if (!section) return null;

        if (isPackage) {
            return {
                url: this.partsBaseUrl + '/packages/' + section + '.html'
            }
        } else {
            return this.route[section];
        }
    },

    //These functions have to be called after dom ready
    showSection: function (sectionName, args) {
        console.log(sectionName, args);
        sectionName = sectionName || 'main';
        var $section = $('#' + sectionName), animate = args && args.animate || true;

        function show() {
            w2t.$showing = w2t.$showing || $('#main');

            //$section.insertBefore($('#footer')); //this to bottom of the body, so animation is always slideUp
            
            //w2t.$showing.slideUp(animate && w2t.animateTime, w2t.screenShowEasing); //hide
            $section.slideDown(animate && w2t.animateTime, w2t.screenShowEasing); //show
            w2t.$showing.hide();
            // $('html').css('height','100%')

            w2t.$showing = $section;
        }

        if (!$section.length) {
            $.get(this.getRoute(sectionName, args && args.isPackage).url, {
                time: Math.random
            }, function (data) {
                $('.section-container').append(data);
                $section = $('#' + sectionName);

                show();

                if (args && args.callback) {
                    args.callback.apply(this);
                }

                if (sectionName === 'services') {
                    $('body').scrollspy({ target: '.w2t-services-menu', offset: 0 });

                    $('.w2t-services-menu li').click(function () {
                        $(this).siblings().removeClass('active');

                        $(this).addClass('active');
                    });

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
        var section = $(this).data('package');
        History.pushState({ section: section }, 'Way2Trip - ' + section.toUpperCase(), "?section=" + section);
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
    /*var topPx = 0, leftPx = 0, sp = 1, urlParamSection;

    function step(timestamp) {
    leftPx = leftPx % 1680 - sp;
    topPx = topPx % 1050 - sp;
    $('body').css('backgroundPosition', leftPx + 'px ' + topPx + 'px');

    requestAnimationFrame(step);
    }

    requestAnimationFrame(step);*/

    /* State Change Listener */
    History.Adapter.bind(window, 'statechange', function () {
        var State = History.getState(), section = State.data && State.data.section;
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
            case /^(d-|i-)/.test(section): //Starts with d- or i-
                w2t.showSection(section, {
                    isPackage: true
                })
                break;
            default:
                w2t.showSection(section);
                break;
        }

    });

    //On page load route to appropriate screen
    if (urlParamSection = w2t.utils.getParameterByName('section')) {
        History.replaceState({
            section: urlParamSection
        },
            'Way2Trip - ' + urlParamSection.toUpperCase(),
            window.location.protocol + "//" + window.location.host + "?section=" + urlParamSection);
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
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), searchStr = location.search || location.hash,
        results = regex.exec(searchStr);

        console.log(searchStr);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}