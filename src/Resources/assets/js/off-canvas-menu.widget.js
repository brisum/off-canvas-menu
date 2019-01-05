define(['jquery', 'lib-widget', 'lib-source-loader', 'lib-bundle-loader', 'lib-require-init'],
function($,        Widget,       SourceLoader,        BundleLoader,        RequireInit) {
    var MenuMobileWidget = function () {
        Widget.apply(this, arguments);
    };

    MenuMobileWidget.prototype = Object.create(Widget.prototype);
    MenuMobileWidget.prototype.constructor = MenuMobileWidget;

    MenuMobileWidget.prototype._init = function () {
        var self = this;

        SourceLoader.loadScripts(
            [
                Theme.url.theme + '/assets/src/thirdparty/dlmenu/js/modernizr.custom.js?' + Theme.ASSETS_VERSION,
                Theme.url.theme + '/assets/src/thirdparty/dlmenu/js/jquery.dlmenu.custom.js?' + Theme.ASSETS_VERSION
            ], function () {
                self.$element.load(
                    '/?tpl-part=template-part/menu/mobile',
                    function (response) {
                        self.$element.dlmenu({
                            animationClasses: {
                                classin: 'dl-animate-in-left',
                                classout: 'dl-animate-out-left'
                            }
                        });

                        $('body').on('click', '#mobile-menu-toogle .toggleButton', function () {
                            self.$element.data('dlmenu').openMenu();
                        });
                    }
                );
            });
    };

    return MenuMobileWidget;
});
