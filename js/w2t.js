//Global namespace
var w2t = {
    animateTime: 2000,
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
        sectionName = sectionName || 'main';
        var $section = $('#' + sectionName), animate = args && args.animate || true;
        var $sectionContainer = $('.section-container'), $overlay = $('#overlay');

        function flyPlane() {
            var $airPlane = $('#airPlane'), $titleFlag = $('#titleFlag'), $pageHeader = $section.find($('.page-header'));
            var minScreenWidth = 768, w = $airPlane.outerWidth(), h = $airPlane.outerHeight();
            var planeH = planeW = 256, headerH = 60;
            //w = w < minScreenWidth ? minScreenWidth : w;
            var bgX = (w - planeW) / 2, bgY = h - (headerH + planeH + 20);

            //Set initial position 
            $airPlane.css('top', h + 120);
            $titleFlag.append($pageHeader.find('h1'));

            //Set bg position
            $airPlane.css('backgroundPosition', bgX + 'px ' + bgY + 'px');
            //Position title flag div
            $titleFlag.css('top', (h - 60) + 'px').css('left', ((w - $titleFlag.width()) / 2) + 'px');

            $airPlane.animate({
                //backgroundPosition: '50% 0%'
                top: -h + (headerH * 2)
            }, {
                duration: 2000,
                complete: function () {
                    //console.log('completed');
                    $pageHeader.append($('#titleFlag > h1'));
                }
            });
        }

        function show() {
            w2t.$showing = w2t.$showing || $('#main');
            $sectionContainer.append($section); // move to last to slide always slides up

            flyPlane();

            w2t.$showing.slideUp(animate && w2t.animateTime, w2t.screenShowEasing); //hide
            //w2t.$showing.hide();
            $section.slideDown(animate && w2t.animateTime, w2t.screenShowEasing); //show
            
            window.scrollTo(0, 0);

            w2t.$showing = $section;
        }

        if (!$section.length) {
            $overlay.show();

            $.get(this.getRoute(sectionName, args && args.isPackage).url,
            function (data) {
                $sectionContainer.append(data);
                $section = $('#' + sectionName);

                $overlay.hide();
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
                } else if (sectionName === 'contactUs') {
                    w2t.loadMap();
                }
            });
        } else {
            if ($section.css('display') == 'none') {
                //setTimeout(show, 5000);
                show();
            }
        }
    },

    columnHover: function () {
        $(this).hoverdir({
            hoverDelay: 75
        });
    },

    packageClick: function () {
        var section = $(this).data('package');
        History.pushState({ section: section }, 'Way2Trip - ' + section.toUpperCase(), "?section=" + section);
    },

    loadMap: function () {
        var myLatlng = new google.maps.LatLng(13.037856, 80.224157);

        var myOptions = {
            zoom: 16,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: "Way2Trip"
        });

    }
};

//Dom On Ready
$(function () {
    var urlParamSection;

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
    urlParamSection = w2t.utils.getParameterByName('section');
    if (urlParamSection) {
        History.replaceState({
            section: urlParamSection
        },
            'Way2Trip - ' + urlParamSection.toUpperCase(),
            window.location.protocol + "//" + window.location.host + "?section=" + urlParamSection);
    }

    /*UI Initializations & Listeners*/
    $('.menu').click(function (e) {
        var section = $(this).data('section');
        History.pushState({ section: section }, 'Way2Trip - ' + section.toUpperCase(), "?section=" + section);

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    });

    $(document).on('click', '.navbar-collapse.in', function (e) {
        if ($(e.target).is('a')) {
            $(this).collapse('hide');
        }
    });
});

//Utils
w2t.utils = {
    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), searchStr = location.search || location.hash,
        results = regex.exec(searchStr);

        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}