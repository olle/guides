"use strict";
(function ($window) {
  /* ------------------------------------------------------------------------ */

  var format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
      var reg = new RegExp("\\{" + i + "\\}", "gm");
      s = s.replace(reg, arguments[i + 1]);
    }
    return s;
  };

  /* ------------------------------------------------------------------------ */

  var $$ = function (element) {
    this.element = element;
  };

  $$.prototype.css = function (key, value) {
    if (this.element) {
      this.element.style[key] = value;
    }
    return this;
  };
  $$.prototype.addClass = function (className) {
    if (this.element) {
      this.element.classList.add(className);
    }
    return this;
  };
  $$.prototype.appendTo = function (target) {
    if (this.element) {
      if (typeof target === "string") {
        document.querySelector(target).appendChild(this.element);
      } else {
        target.appendChild(this.element);
      }
    }
    return this;
  };


  $$.prototype.outerHeight = function () {
    console.log("OUTER HEIGHT OF ", this.element);
    if (!this.element) {
      return 0;
    }
  };

  var $ = function (element) {
    if (!element) {
      return new $$();
    }

    var $elements =
      typeof element === "string"
        ? document.querySelectorAll(element)
        : element;
    console.log("ELEMENTS", $elements);
    return new $$();
  };

  $.isFunction = function (arg) {
    return typeof arg === "function";
  };

  /* ------------------------------------------------------------------------ */

  var Guide = function (guide, $container, options) {
    this.guide = guide;
    this._distance = guide.distance || options.distance;
    this._color = guide.color || options.color;
    this._class = guide.cssClass || options.cssClass || "";
    this.$highlightedElement = $(guide.element).addClass(
      "guides-current-element"
    );
    this.$container = $container;
    this.init();
  };

  Guide.prototype._arrowSize = 10;
  // Mx1,y1, Cdx1,dy1,dx2,dy2,x2,y2
  // (x1,y1) - start point
  // (dx1,dy1) - curve control point 1
  // (dx2,dy2) - curve control point 2
  // (x2,y2) - end point
  Guide.prototype._path = "M{0},{1} C{2},{3},{4},{5},{6},{7}";
  Guide.prototype._arrowTemplate =
    '<svg width="{0}" height="{1}">\
      <defs>\
          <marker id="arrow" markerWidth="13" markerHeight="13" refX="2" refY="6" orient="auto">\
              <path d="M2,1 L2,{3} L{3},6 L2,2" style="fill:{4};"></path>\
          </marker>\
      </defs>\
      <path id="line" d="{2}" style="stroke:{4}; stroke-width: 1.25px; fill: none; marker-end: url(#arrow);"></path>\
  </svg>';

  Guide.prototype.init = function () {
    this.$guide = document.createElement("div");
    this.$guide.classList.add("guides-fade-in");
    this.$guide.classList.add("guides-guide");
    if (this._class) {
      this.$guide.classList.add(this._class);
    }
    this.$guide.innerHTML = `<span>${this.guide.html}</span>`;

    this.$guide = $(this.$guide);

    // this.$guide = $("<div />", {
    //   class: "guides-fade-in guides-guide " + this._class,
    //   html: "<span>" + this.guide.html + "</span>",
    // });

    this._position();
    return this;
  };

  Guide.prototype._position = function () {
    if (this.$highlightedElement && this.$highlightedElement.length > 0) {
      this._attachToElement();
      this.$guide.appendTo(this.$container);
      this._renderArrow();
    } else {
      this._center();
    }
    this._scrollIntoView();
  };

  Guide.prototype._center = function () {
    this.$guide
      .css("visibility", "hidden")
      .appendTo(this.$container)
      .addClass("guides-center")
      .css({
        left: 0,
        right: 0,
        textAlign: "center",
        top: window.innerHeight / 2 - this.$guide.outerHeight() / 2,
      })
      .css("visibility", "visible");
  };

  Guide.prototype._attachToElement = function () {
    var elOffset = this.$highlightedElement.offset(),
      docWidth = $("body").width(),
      docHeight = $("body").height(),
      leftSpace = elOffset.left,
      topSpace = elOffset.top,
      highlightedElementWidth = this.$highlightedElement.outerWidth(),
      highlightedElementHeight = this.$highlightedElement.outerHeight(),
      rightSpace = docWidth - leftSpace - highlightedElementWidth,
      bottomSpace = docHeight - topSpace - highlightedElementHeight,
      css = {
        color: this._color,
        top: docHeight / 2 > elOffset.top ? elOffset.top : "auto",
        left: docWidth / 2 > elOffset.left ? elOffset.left : "auto",
        right:
          docWidth / 2 > elOffset.left
            ? "auto"
            : docWidth - elOffset.left - highlightedElementWidth,
        bottom: docHeight / 2 > elOffset.top ? "auto" : elOffset.bottom,
      };

    switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
      case leftSpace:
        this.position = "left";
        css.paddingRight = this._distance;
        css.right = $(document).width() - elOffset.left;
        css.left = "auto";
        break;
      case topSpace:
        this.position = "top";
        css.paddingBottom = this._distance;
        css.bottom = $(document).height() - elOffset.top;
        css.top = "auto";
        break;
      case rightSpace:
        this.position = "right";
        css.paddingLeft = this._distance;
        css.left = elOffset.left + highlightedElementWidth;
        css.right = "auto";
        break;
      default:
        this.position = "bottom";
        css.paddingTop = this._distance;
        css.top = elOffset.top + highlightedElementHeight;
        css.bottom = "auto";
        break;
    }
    this.$guide.addClass("guides-" + this.position).css(css);
  };

  Guide.prototype._renderArrow = function () {
    this._width = this.$guide.outerWidth();
    this._height = this.$guide.outerHeight();
    this.$guide.append(
      format(
        this._arrowTemplate,
        this._width,
        this._distance,
        this[this.position](),
        this._arrowSize,
        this._color
      )
    );
  };

  Guide.prototype.top = function () {
    var coord = this._verticalAlign();
    return this._getPath(coord);
  };

  Guide.prototype.bottom = function () {
    var coord = this._verticalAlign(true);
    return this._getPath(coord);
  };

  Guide.prototype.left = function () {
    var coord = this._horizontalAlign();
    return this._getPath(coord);
  };

  Guide.prototype.right = function () {
    var coord = this._horizontalAlign(true);
    return this._getPath(coord);
  };

  Guide.prototype._getPath = function (coord) {
    return format(
      this._path,
      coord.x1,
      coord.y1,
      coord.dx1,
      coord.dy1,
      coord.dx2,
      coord.dy2,
      coord.x2,
      coord.y2
    );
  };

  Guide.prototype._getFluctuation = function () {
    return Math.floor(Math.random() * 20) + 10;
  };

  Guide.prototype._verticalAlign = function (bottom) {
    var x1 = this._width / 2,
      y1 = bottom ? this._distance : 0,
      x2 = Math.max(
        Math.min(
          this.$highlightedElement.offset().left +
            this.$highlightedElement.outerWidth() / 2 -
            this.$guide.offset().left,
          this._width - this._arrowSize
        ),
        this._arrowSize
      ),
      y2 = bottom ? this._arrowSize : this._distance - this._arrowSize;
    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      dx1: Math.max(
        0,
        Math.min(Math.abs(2 * x1 - x2) / 3, this._width) +
          this._getFluctuation()
      ),
      dy1: bottom
        ? Math.max(0, y2 + (Math.abs(y1 - y2) * 3) / 4)
        : Math.max(0, y1 + (Math.abs(y1 - y2) * 3) / 4),
      dx2: Math.max(
        0,
        Math.min(Math.abs(x1 - x2 * 3) / 2, this._width) -
          this._getFluctuation()
      ),
      dy2: bottom
        ? Math.max(0, y2 + (Math.abs(y1 - y2) * 3) / 4)
        : Math.max(0, y1 + (Math.abs(y1 - y2) * 3) / 4),
    };
  };

  Guide.prototype._horizontalAlign = function (right) {
    var x1 = right ? this._distance : this._width - this._distance,
      y1 = this._height / 2,
      x2 = right ? this._arrowSize : this._width - this._arrowSize,
      y2 = Math.max(
        Math.min(
          this.$highlightedElement.offset().top +
            this.$highlightedElement.outerHeight() / 2 -
            this.$guide.offset().top,
          this._height - this._arrowSize
        ),
        this._arrowSize
      );
    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      dx1: right
        ? Math.max(0, x2 + (Math.abs(x1 - x2) * 3) / 4)
        : Math.max(0, x1 + (Math.abs(x1 - x2) * 3) / 4),
      dy1: Math.max(
        0,
        Math.min(Math.abs(2 * y1 - y2) / 3, this._height) +
          this._getFluctuation()
      ),
      dx2: right
        ? Math.max(0, x2 + (Math.abs(x1 - x2) * 3) / 4)
        : Math.max(0, x1 + (Math.abs(x1 - x2) * 3) / 4),
      dy2: Math.max(
        0,
        Math.min(Math.abs(y1 - y2 * 3) / 2, this._height) +
          this._getFluctuation()
      ),
    };
  };

  Guide.prototype._scrollIntoView = function () {
    if (this.$highlightedElement.length === 0) {
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        500
      );
      return;
    }
    var guideOffset = this.$guide.offset(),
      top = guideOffset.top,
      bottom = guideOffset.top + this.$guide.outerHeight(),
      left = guideOffset.left,
      right = guideOffset.left + this.$guide.outerWidth(),
      scrollTop = $(document).scrollTop(),
      scrollLeft = $(document).scrollLeft();

    //scroll vertically to element if it is not visible in the view port
    if (scrollTop > top || scrollTop + $(window).height() < bottom) {
      $("html,body").animate(
        {
          scrollTop: this.position === "bottom" ? top - 100 : top,
        },
        500
      );
    }

    //scroll horizontally to element if it is not visible in the view port
    if (scrollLeft > left || scrollLeft + $(window).width() < right) {
      $("html,body").animate(
        {
          scrollLeft: this.position === "righ" ? left - 100 : left,
        },
        500
      );
    }
  };

  Guide.prototype.destroy = function () {
    this.$highlightedElement.removeClass("guides-current-element");
    this.$guide.remove();
  };

  /* ------------------------------------------------------------------------ */

  var Guides = function (element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = {};
    this._current = 0;
    this.setOptions(options);
    if (element) {
      this.$element.on("click.guides", $.proxy(this.start, this));
    }
  };

  Guides.DEFAULTS = {
    distance: 100,
    color: "#fff",
    cssClass: "",
    guides: [],
  };

  Guides.prototype.start = function (e) {
    if (e) {
      e.preventDefault();
    }
    if (this._isAlreadyRunning()) {
      return this;
    }
    this._current = 0;
    this._renderCanvas()
      ._renderGuide(this.options.guides[this._current])
      ._callback("start");
    return this;
  };

  Guides.prototype.end = function () {
    if (this.$canvas) {
      this.$canvas.remove();
      this.$canvas = null;
    }
    if (this._currentGuide) {
      this._currentGuide.destroy();
      this._currentGuide = null;
    }
    $(document).off("keyup.guides");
    this._callback("end");
    return this;
  };

  Guides.prototype.next = function () {
    this._renderGuide(this.options.guides[++this._current])._callback("next");
    return this;
  };

  Guides.prototype.prev = function () {
    if (!this._current) {
      return;
    }
    this._renderGuide(this.options.guides[--this._current])._callback("prev");
    return this;
  };

  Guides.prototype.setOptions = function (options) {
    if (typeof options !== "object") {
      return this;
    }
    this.options = { ...Guides.DEFAULTS, ...this.options, ...options };
  };

  Guides.prototype.destroy = function () {
    this.end();
    this.$element.off("click.guides");
    this._callback("destroy");
    return this;
  };

  Guides.prototype._callback = function (eventName) {
    var callback = this.options[eventName],
      eventObject = {
        sender: this,
      };

    if (this._currentGuide) {
      eventObject.$element = this._currentGuide.guide.element;
      eventObject.$guide = this._currentGuide.$element;
    }

    if ($.isFunction(callback)) {
      callback.apply(this, [eventObject]);
    }
  };

  Guides.prototype._isAlreadyRunning = function () {
    return !!this.$canvas;
  };

  Guides.prototype._renderCanvas = function () {
    this.$canvas = document.createElement("div");
    this.$canvas.classList.add(...["guides-canvas", "guides-fade-in"]);

    this.$canvas.innerHTML =
      '<div class="guides-overlay"></div><div class="guides-mask"></div>';

    document.querySelector("body").appendChild(this.$canvas);

    // this.$canvas = $("<div />", {
    //   class: "guides-canvas guides-fade-in",
    //   html: '<div class="guides-overlay"></div><div class="guides-mask"></div>',
    // }).appendTo("body");

    this._bindNavigation();

    return this;
  };

  Guides.prototype._renderGuide = function (guide) {
    if (!guide) {
      //no more guides
      this.end();
      return this;
    }

    if (this._currentGuide) {
      this._currentGuide.destroy();
    }

    this._callback("render", guide);

    if ($.isFunction(guide.render)) {
      guide.render.apply(this, [guide]);
    }

    this._currentGuide = new Guide(guide, this.$canvas, this.options);
    return this;
  };

  Guides.prototype._bindNavigation = function () {
    this.$canvas.addEventListener("click", this._onCanvasClick.bind(this));
    window.addEventListener("keyup", this._onDocKeyUp.bind(this));
    return this;
  };

  Guides.prototype._onCanvasClick = function (e) {
    this.next();
  };

  Guides.prototype._onDocKeyUp = function (e) {
    switch (e.which) {
      case 27: //esc
        this.end();
        break;
      case 39: //right arrow
      case 32: //space
        this.next();
        break;
      case 37: //left arrow
      case 8: //backspace
        e.preventDefault();
        this.prev();
        break;
      default:
        break;
    }
  };

  /* ------------------------------------------------------------------------ */

  $window.guides =
    $window.guides ||
    function (option, optionData) {
      if (typeof option === "object" && option) {
        return new Guides(null, option);
      }
    };
})(window);

// $.fn.guides = function (option, optionData) {

//   return this.each(function () {
//     var $this = $(this),
//       data = $this.data("guides"),
//       options = typeof option === "object" && option;

//     if (!data && typeof options == "string") return;
//     if (!data) $this.data("guides", (data = new Guides(this, options)));
//     if (typeof option == "string") data[option](optionData);
//   });
// };

// $.guides = function (options) {
//   return new Guides(null, options);
// };

// $.fn.guides.Constructor = Guides;
