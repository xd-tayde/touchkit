(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Touchkit = factory());
}(this, (function () { 'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof$1 = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _ = {
    getLength: function getLength(v1) {
        if ((typeof v1 === 'undefined' ? 'undefined' : _typeof$1(v1)) !== 'object') {
            console.error('getLength error!');
            return;
        }
        return Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    },
    getAngle: function getAngle(v1, v2) {
        if ((typeof v1 === 'undefined' ? 'undefined' : _typeof$1(v1)) !== 'object' || (typeof v2 === 'undefined' ? 'undefined' : _typeof$1(v2)) !== 'object') {
            console.error('getAngle error!');
            return;
        }
        // 判断方向，顺时针为 1 ,逆时针为 -1；
        var direction = v1.x * v2.y - v2.x * v1.y > 0 ? 1 : -1,


        // 两个向量的模；
        len1 = this.getLength(v1),
            len2 = this.getLength(v2),
            mr = len1 * len2,
            dot = void 0,
            r = void 0;
        if (mr === 0) return 0;
        // 通过数量积公式可以推导出：
        // cos = (x1 * x2 + y1 * y2)/(|a| * |b|);
        dot = v1.x * v2.x + v1.y * v2.y;
        r = dot / mr;
        if (r > 1) r = 1;
        if (r < -1) r = -1;
        // 解值并结合方向转化为角度值；
        return Math.acos(r) * direction * 180 / Math.PI;
    },
    getBasePoint: function getBasePoint(el) {
        if (!el) return { x: 0, y: 0 };
        var offset = this.getOffset(el);
        var x = offset.left + el.getBoundingClientRect().width / 2,
            y = offset.top + el.getBoundingClientRect().width / 2;
        return { x: Math.round(x), y: Math.round(y) };
    },
    extend: function extend(obj1, obj2) {
        for (var k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                if (_typeof$1(obj2[k]) == 'object' && !(obj2[k] instanceof Node)) {
                    if (_typeof$1(obj1[k]) !== 'object') {
                        obj1[k] = {};
                    }
                    this.extend(obj1[k], obj2[k]);
                } else {
                    obj1[k] = obj2[k];
                }
            }
        }
        return obj1;
    },
    getVector: function getVector(p1, p2) {
        if ((typeof p1 === 'undefined' ? 'undefined' : _typeof$1(p1)) !== 'object' || (typeof p2 === 'undefined' ? 'undefined' : _typeof$1(p2)) !== 'object') {
            console.error('getvector error!');
            return;
        }
        var x = Math.round(p1.x - p2.x),
            y = Math.round(p1.y - p2.y);
        return { x: x, y: y };
    },
    getPoint: function getPoint(ev, index) {
        if (!ev || !ev.touches[index]) {
            console.error('getPoint error!');
            return;
        }
        return {
            x: Math.round(ev.touches[index].pageX),
            y: Math.round(ev.touches[index].pageY)
        };
    },
    getOffset: function getOffset(el) {
        el = typeof el == 'string' ? document.querySelector(el) : el;
        var rect = el.getBoundingClientRect();
        var offset = {
            left: rect.left + document.body.scrollLeft,
            top: rect.top + document.body.scrollTop,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
        return offset;
    },
    matrixTo: function matrixTo(matrix) {
        var arr = matrix.replace('matrix(', '').replace(')', '').split(',');
        var cos = arr[0],
            sin = arr[1],
            tan = sin / cos,
            rotate = Math.atan(tan) * 180 / Math.PI,
            scale = cos / Math.cos(Math.PI / 180 * rotate),
            trans = void 0;
        trans = {
            x: parseInt(arr[4]),
            y: parseInt(arr[5]),
            scale: scale,
            rotate: rotate
        };
        return trans;
    },
    getUseName: function getUseName(evName) {
        var useName = evName.replace('start', '');
        var end = useName.indexOf('rotate') !== -1 ? 'nd' : 'end';
        useName = useName.replace(end, '');
        return useName;
    },
    domify: function domify(DOMString) {
        var htmlDoc = document.implementation.createHTMLDocument();
        htmlDoc.body.innerHTML = DOMString;
        return htmlDoc.body.children;
    },
    getEl: function getEl(el) {
        if (!el) {
            console.error('el error,there must be a el!');
            return;
        }
        var _el = void 0;
        if (typeof el == 'string') {
            _el = document.querySelector(el);
        } else if (el instanceof Node) {
            _el = el;
        } else {
            console.error('el error,there must be a el!');
            return;
        }
        return _el;
    },
    data: function data(el, key) {
        el = this.getEl(el);
        return el.getAttribute('data-' + key);
    },
    include: function include(str1, str2) {
        if (str1.indexOf) {
            return str1.indexOf(str2) !== -1;
        } else {
            return false;
        }
    },
    getPos: function getPos(el) {
        if (!el) return;
        el = this.getEl(el);
        var defaulTrans = void 0;
        var style = window.getComputedStyle(el, null);
        var cssTrans = style.transform || style.webkitTransform;

        if (window.getComputedStyle && cssTrans !== 'none') {
            defaulTrans = this.matrixTo(cssTrans);
        } else {
            defaulTrans = {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0
            };
        }
        return JSON.parse(el.getAttribute('data-mtouch-status')) || defaulTrans;
    }
};

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var HandlerBus = function () {
    function HandlerBus(el) {
        _classCallCheck(this, HandlerBus);

        this.handlers = [];
        this.el = el;
    }

    _createClass(HandlerBus, [{
        key: 'add',
        value: function add(handler) {
            this.handlers.push(handler);
            return this;
        }
    }, {
        key: 'del',
        value: function del(handler) {
            var _this = this;

            if (!handler) {
                this.handlers = [];
            } else {
                this.handlers.forEach(function (value, index) {
                    if (value === handler) {
                        _this.handlers.splice(index, 1);
                    }
                });
            }
            return this;
        }
    }, {
        key: 'fire',
        value: function fire() {
            var _this2 = this,
                _arguments = arguments;

            if (!this.handlers || !this.handlers.length === 0) return;
            this.handlers.forEach(function (handler) {
                if (typeof handler === 'function') handler.apply(_this2.el, _arguments);
            });
            return this;
        }
    }]);

    return HandlerBus;
}();

var _slicedToArray = function () {
    function sliceIterator(arr, i) {
        var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;_e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }return _arr;
    }return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

var EVENT$1 = ['touchstart', 'touchmove', 'touchend', 'drag', 'dragstart', 'dragend', 'pinch', 'pinchstart', 'pinchend', 'rotate', 'rotatestart', 'rotatend', 'singlePinchstart', 'singlePinch', 'singlePinchend', 'singleRotate', 'singleRotatestart', 'singleRotatend'];

var ORIGINEVENT = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

function MTouch() {
    var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    // 兼容不使用 new 的方式；
    if (!(this instanceof MTouch)) return new MTouch(el);
    // 开关；
    // 初始化时关闭，在调用 on 函数时对应开启；
    this.use = {
        drag: false,
        pinch: false,
        rotate: false,
        singlePinch: false,
        singleRotate: false
    };
    // 获取容器元素；
    this.operator = this.el = _.getEl(el);
    // 状态记录；
    this.draging = this.pinching = this.rotating = this.singlePinching = this.singleRotating = false;
    // 全局参数记录；
    this.fingers = 0;
    this.startScale = 1;
    this.startPoint = {};
    this.secondPoint = {};
    this.pinchStartLength = null;
    this.singlePinchStartLength = null;
    this.vector1 = {};
    this.singleBasePoint = {};

    // 初始化注册事件队列；
    this._driveBus();
    // 监听原生 touch 事件；
    this._bind();
}

MTouch.prototype._driveBus = function () {
    var _this = this;

    EVENT$1.forEach(function (evName) {
        _this[evName] = new HandlerBus(_this.el);
    });
};

MTouch.prototype._bind = function () {
    var _this2 = this;

    ORIGINEVENT.forEach(function (evName) {
        var fn = evName == 'touchcancel' ? 'end' : evName.replace('touch', '');
        // 需要存下 bind(this) 后的函数指向，用于 destroy;
        _this2['_' + fn + '_bind'] = _this2['_' + fn].bind(_this2);
        _this2.el.addEventListener(evName, _this2['_' + fn + '_bind'], false);
    });
};
MTouch.prototype.destroy = function () {
    var _this3 = this;

    ORIGINEVENT.forEach(function (evName) {
        var fn = evName == 'touchcancel' ? 'end' : evName.replace('touch', '');
        _this3.el.removeEventListener(evName, _this3['_' + fn + '_bind'], false);
    });
};
MTouch.prototype._start = function (e) {
    if (!e.touches || e.type !== 'touchstart') return;
    // 记录手指数量；
    this.fingers = e.touches.length;
    // 记录第一触控点；
    this.startPoint = _.getPoint(e, 0);
    // 计算单指操作时的基础点；
    this.singleBasePoint = _.getBasePoint(this.operator);
    // 双指操作时
    if (this.fingers > 1) {
        // 第二触控点；
        this.secondPoint = _.getPoint(e, 1);
        // 计算双指向量；
        this.vector1 = _.getVector(this.secondPoint, this.startPoint);
        // 计算向量模；
        this.pinchStartLength = _.getLength(this.vector1);
    } else if (this.use.singlePinch) {
        // 单指且监听 singlePinch 时，计算向量模；
        var pinchV1 = _.getVector(this.startPoint, this.singleBasePoint);
        this.singlePinchStartLength = _.getLength(pinchV1);
    }
    // 触发 touchstart 事件；
    this.touchstart.fire({ origin: e, eventType: 'touchstart' });
};
MTouch.prototype._move = function (ev) {
    if (!ev.touches || ev.type !== 'touchmove') return;
    // 判断触控点是否为 singlebutton 区域；
    var isSingleButton = _.data(ev.target, 'singleButton'),
        curFingers = ev.touches.length,
        curPoint = _.getPoint(ev, 0),
        singlePinchLength = void 0,
        pinchLength = void 0,
        rotateV1 = void 0,
        rotateV2 = void 0,
        pinchV2 = void 0;
    // 当从原先的两指到一指的时候，可能会出现基础手指的变化，导致跳动；
    // 因此需屏蔽掉一次错误的touchmove事件，待重新设置基础指后，再继续进行；
    if (curFingers < this.fingers) {
        this.startPoint = curPoint;
        this.fingers = curFingers;
        return;
    }
    // 两指先后触摸时，只会触发第一指一次 touchstart，第二指不会再次触发 touchstart；
    // 因此会出现没有记录第二指状态，需要在touchmove中重新获取参数；
    if (curFingers > 1 && (!this.secondPoint || !this.vector1 || !this.pinchStartLength)) {
        this.secondPoint = _.getPoint(ev, 1);
        this.vector1 = _.getVector(this.secondPoint, this.startPoint);
        this.pinchStartLength = _.getLength(this.vector1);
    }
    // 双指时，需触发 pinch 和 rotate 事件；
    if (curFingers > 1) {
        var curSecPoint = _.getPoint(ev, 1),
            vector2 = _.getVector(curSecPoint, curPoint);
        // 触发 pinch 事件；
        if (this.use.pinch) {
            pinchLength = _.getLength(vector2);
            this._eventFire('pinch', {
                delta: {
                    scale: pinchLength / this.pinchStartLength
                },
                origin: ev
            });
            this.pinchStartLength = pinchLength;
        }
        // 触发 rotate 事件；
        if (this.use.rotate) {
            this._eventFire('rotate', {
                delta: {
                    rotate: _.getAngle(this.vector1, vector2)
                },
                origin: ev
            });
            this.vector1 = vector2;
        }
    } else {
        // 触发 singlePinch 事件;
        if (this.use.singlePinch && isSingleButton) {
            pinchV2 = _.getVector(curPoint, this.singleBasePoint);
            singlePinchLength = _.getLength(pinchV2);
            this._eventFire('singlePinch', {
                delta: {
                    scale: singlePinchLength / this.singlePinchStartLength
                },
                origin: ev
            });
            this.singlePinchStartLength = singlePinchLength;
        }
        // 触发 singleRotate 事件;
        if (this.use.singleRotate && isSingleButton) {
            rotateV1 = _.getVector(this.startPoint, this.singleBasePoint);
            rotateV2 = _.getVector(curPoint, this.singleBasePoint);
            this._eventFire('singleRotate', {
                delta: {
                    rotate: _.getAngle(rotateV1, rotateV2)
                },
                origin: ev
            });
        }
    }
    // 触发 drag 事件；
    if (this.use.drag) {
        if (!isSingleButton) {
            this._eventFire('drag', {
                delta: {
                    deltaX: curPoint.x - this.startPoint.x,
                    deltaY: curPoint.y - this.startPoint.y
                },
                origin: ev
            });
        }
    }
    this.startPoint = curPoint;
    // 触发 touchmove 事件；
    this.touchmove.fire({ eventType: 'touchmove', origin: ev });
    ev.preventDefault();
};
MTouch.prototype._end = function (ev) {
    var _this4 = this;

    if (!ev.touches && ev.type !== 'touchend' && ev.type !== 'touchcancel') return;
    // 触发 end 事件；
    ['pinch', 'drag', 'rotate', 'singleRotate', 'singlePinch'].forEach(function (evName) {
        _this4._eventEnd(evName, { origin: ev });
    });
    this.touchend.fire({ eventType: 'touchend', origin: ev });
};
MTouch.prototype._eventFire = function (evName, ev) {
    var ing = evName + 'ing',
        start = evName + 'start';
    if (!this[ing]) {
        ev.eventType = start;
        this[start].fire(ev);
        this[ing] = true;
    } else {
        ev.eventType = evName;
        this[evName].fire(ev);
    }
};
MTouch.prototype._eventEnd = function (evName, ev) {
    var ing = evName + 'ing',
        end = void 0;
    if (evName == 'rotate' || evName == 'singleRotate') {
        end = evName + 'nd';
    } else {
        end = evName + 'end';
    }
    if (this[ing]) {
        ev.eventType = end;
        this[end].fire(ev);
        this[ing] = false;
    }
};
// 添加 button 区域；
// 背景样式由业务方定制；
MTouch.prototype._addButton = function (el) {
    var _$domify = _.domify('<div class="mtouch-singleButton" data-singleButton=\'true\' style=\'position:absolute;right:-15px;bottom: -15px;width:30px;height: 30px;background-size: 100% 100%;\'></div>'),
        _$domify2 = _slicedToArray(_$domify, 1),
        button = _$domify2[0],
        _style = void 0;

    el.appendChild(button);
    el.setAttribute('data-mtouch-addButton', true);
    if (getComputedStyle && window.getComputedStyle(el, null).position === 'static') {
        _style = el.style || '';
        el.style = _style + 'position:relative';
    }
};
// 切换 operator;
MTouch.prototype.switch = function (el) {
    var addButton = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var _el = void 0;
    if (!el) {
        this.operator = this.el;
        return;
    }
    this.operator = _el = _.getEl(el);
    if (!_.data(_el, 'mtouch-addButton') && (this.use.singleRotate || this.use.singlePinch) && addButton) {
        this._addButton(_el);
    }
};
MTouch.prototype.on = function (evName) {
    var _this5 = this;

    var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
    var operator = arguments[2];

    if (_.include(evName, ' ')) {
        evName.split(' ').forEach(function (v) {
            _this5._on(v, handler, operator);
        });
    } else {
        this._on(evName, handler, operator);
    }
    return this;
};
MTouch.prototype._on = function (evName, handler, operator) {
    this.use[_.getUseName(evName)] = true;
    this[evName].add(handler);
    this.switch(operator);
};
MTouch.prototype.off = function (evName, handler) {
    this[evName].del(handler);
};

var _typeof2$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof$2 = typeof Symbol === "function" && _typeof2$1(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2$1(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2$1(obj);
};

var _$1 = {
    extend: function extend(obj1, obj2) {
        for (var k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                if (_typeof$2(obj2[k]) == 'object') {
                    if (_typeof$2(obj1[k]) !== 'object' || obj1[k] === null) {
                        obj1[k] = {};
                    }
                    this.extend(obj1[k], obj2[k]);
                } else {
                    obj1[k] = obj2[k];
                }
            }
        }
        return obj1;
    },
    loadImage: function loadImage(image, loaded, error) {
        var img = new Image();
        if (image.indexOf('http') == 0) {
            img.crossOrigin = '*';
        }
        img.onload = function () {
            loaded(img);
        };
        img.onerror = function () {
            error('img load error');
        };
        img.src = image;
    },
    isArr: function isArr(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    getImage: function getImage(image, cbk) {
        if (typeof image == 'string') {
            this.loadImage(image, function (img) {
                cbk(img);
            }, function (err) {
                console.log(err);
            });
        } else if ((typeof image === 'undefined' ? 'undefined' : _typeof$2(image)) == 'object') {
            cbk(image);
        } else {
            console.log('add image error');
            return;
        }
    },
    forin: function forin(obj, cbk) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                cbk(k, obj[k]);
            }
        }
    }
};

function MCanvas(cwidth, cheight) {

    // 兼容不使用 new 的方式；
    if (!(this instanceof MCanvas)) return new MCanvas(cwidth, cheight);

    // 配置canvas初始大小；
    // cwidth：画布宽度，Number,选填，默认为 500;
    // cheight: 画布高度，Number，选填，默认与宽度一致；
    this.ops = {
        width: cwidth || 500,
        height: cheight || cwidth
    };
    // 全局画布；
    this.canvas = null;
    this.ctx = null;

    // 绘制函数队列；
    this.queue = [];
    // 最后执行的函数；
    this.end = null;

    // 文字绘制数据；
    this.textData = {};

    // 背景图数据;
    this.bgConfig = null;

    // 初始化创建画布；
    this._init();
}

MCanvas.prototype._init = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.ops.width;
    this.canvas.height = this.ops.height;
    this.ctx = this.canvas.getContext('2d');
};

// --------------------------------------------------------
// 绘制背景部分；
// --------------------------------------------------------

MCanvas.prototype.background = function (bg) {
    var _this = this;

    if (!bg && this.bgConfig) bg = this.bgConfig;
    this.bgConfig = bg;
    this.queue.push(function () {
        if (bg.color) {
            _this.ctx.fillStyle = bg.color;
            _this.ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
        }
        if (bg.image) {
            _$1.getImage(bg.image, function (img) {
                _this._background(img, bg);
            });
        } else {
            console.error('background image error!');
        }
    });
    return this;
};

MCanvas.prototype._background = function (img, bg) {
    // 图片与canvas的长宽比；
    var iRatio = img.naturalWidth / img.naturalHeight;
    var cRatio = this.canvas.width / this.canvas.height;
    // 背景绘制参数；
    var sx = void 0,
        sy = void 0,
        swidth = void 0,
        sheight = void 0,
        dx = void 0,
        dy = void 0,
        dwidth = void 0,
        dheight = void 0;
    switch (bg.type) {
        // 裁剪模式，固定canvas大小，原图铺满，超出的部分裁剪；
        case 'crop':
            sx = bg.left || 0;
            sy = bg.top || 0;
            if (iRatio > cRatio) {
                swidth = img.naturalHeight * cRatio;
                sheight = img.naturalHeight;
            } else {
                swidth = img.naturalWidth;
                sheight = swidth / cRatio;
            }
            dy = dx = 0;
            dheight = this.canvas.height;
            dwidth = this.canvas.width;
            break;
        // 包含模式，固定canvas大小，包含背景图；
        case 'contain':
            sy = sx = 0;
            swidth = img.naturalWidth;
            sheight = img.naturalHeight;
            if (iRatio > cRatio) {
                dwidth = this.canvas.width;
                dheight = dwidth / iRatio;
                dx = bg.left || 0;
                dy = bg.top || bg.top == 0 ? bg.top : (this.canvas.height - dheight) / 2;
            } else {
                dheight = this.canvas.height;
                dwidth = dheight * iRatio;
                dy = bg.top || 0;
                dx = bg.left || bg.left == 0 ? bg.left : (this.canvas.width - dwidth) / 2;
            }
            break;
        // 原图模式：canvas与原图大小一致，忽略初始化 传入的宽高参数；
        // 同时，background 传入的 left/top 均被忽略；
        case 'origin':
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            sx = sy = 0;
            swidth = img.naturalWidth;
            sheight = img.naturalHeight;
            dx = dy = 0;
            dwidth = this.canvas.width;
            dheight = this.canvas.height;
            break;
        default:
            console.error('background type error!');
    }
    this.ctx.drawImage(img, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    this._next();
};
// --------------------------------------------------------
// 绘制图层部分；
// --------------------------------------------------------

// 绘制水印；基于 add 函数封装；
MCanvas.prototype.watermark = function () {
    var image = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ops = arguments[1];

    if (!image) {
        console.log('there is not image of watermark');
        return;
    }
    // 参数默认值；
    var _ops$width = ops.width,
        width = _ops$width === undefined ? '40%' : _ops$width,
        _ops$pos = ops.pos,
        pos = _ops$pos === undefined ? 'rightbottom' : _ops$pos,
        _ops$margin = ops.margin,
        margin = _ops$margin === undefined ? 20 : _ops$margin;

    var position = {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0
    };
    switch (pos) {
        case 'leftTop':
            position.x = 'left:' + margin;
            position.y = 'top:' + margin;
            break;
        case 'leftBottom':
            position.x = 'left:' + margin;
            position.y = 'bottom:' + margin;
            break;
        case 'rightTop':
            position.x = 'right:' + margin;
            position.y = 'top:' + margin;
            break;
        case 'rightBottom':
            position.x = 'right:' + margin;
            position.y = 'bottom:' + margin;
            break;
        default:
    }
    this.add(image, {
        width: width,
        pos: position
    });
    return this;
};

// 通用绘制图层函数；
// 使用方式：
// 多张图: add([{image:'',options:{}},{image:'',options:{}}]);
// 单张图: add(image,options);
MCanvas.prototype.add = function () {
    var _this2 = this;

    var image = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments[1];

    // 默认参数；
    var def = {
        width: '100%',
        crop: {
            x: 0,
            y: 0,
            width: '100%',
            height: '100%'
        },
        pos: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        }
    };

    if (!_$1.isArr(image)) image = [{ image: image, options: options }];

    image.forEach(function (v) {
        // 将封装好的 add函数 推入队列中待执行；
        // 参数经过 _handleOps 加工；
        _this2.queue.push(function () {
            _$1.getImage(v.image, function (img) {
                _this2._add(img, _this2._handleOps(_$1.extend(def, v.options), img));
            });
        });
    });

    return this;
};

MCanvas.prototype._add = function (img, ops) {
    var ratio = img.naturalWidth / img.naturalHeight;
    // 画布canvas参数；
    var cdx = void 0,
        cdy = void 0,
        cdw = void 0,
        cdh = void 0;
    // 素材canvas参数；
    var _ops$crop = ops.crop,
        lsx = _ops$crop.x,
        lsy = _ops$crop.y,
        lsw = _ops$crop.width,
        lsh = _ops$crop.height;

    var ldx = void 0,
        ldy = void 0,
        ldw = void 0,
        ldh = void 0;
    // 素材canvas的绘制;
    var lcvs = document.createElement('canvas');
    var lctx = lcvs.getContext('2d');
    // 图片宽高比 * 1.4 是一个最安全的宽度，旋转任意角度都不会被裁剪；
    // 没有旋转却长宽比很高大的图，会导致放大倍数太大，因此甚至了最高倍数为5；
    var lctxScale = ratio * 1.4 > 5 ? 5 : ratio * 1.4;
    var spaceX = void 0,
        spaceY = void 0;

    lcvs.width = img.naturalWidth * lctxScale;
    lcvs.height = img.naturalHeight * lctxScale;

    // 从素材canvas的中心点开始绘制；
    ldx = -img.naturalWidth / 2;
    ldy = -img.naturalHeight / 2;
    ldw = img.naturalWidth;
    ldh = img.naturalHeight;

    lctx.translate(lcvs.width / 2, lcvs.height / 2);
    lctx.rotate(ops.pos.rotate);
    lctx.drawImage(img, lsx, lsy, lsw, lsh, ldx, ldy, ldw, ldh);
    //
    // lcvs.style = 'width:300px';
    // document.querySelector('body').appendChild(lcvs);

    // 获取素材最终的宽高;
    cdw = ops.width * lctxScale;
    cdh = cdw / ratio;

    spaceX = (lctxScale - 1) * ops.width / 2;
    spaceY = spaceX / ratio;

    // 获取素材的位置；
    //    配置的位置 - 缩放的影响 - 绘制成正方形的影响；
    cdx = ops.pos.x + cdw * (1 - ops.pos.scale) / 2 - spaceX;
    cdy = ops.pos.y + cdh * (1 - ops.pos.scale) / 2 - spaceY;

    cdw *= ops.pos.scale;
    cdh *= ops.pos.scale;

    this.ctx.drawImage(lcvs, cdx, cdy, cdw, cdh);

    lcvs = lctx = null;
    this._next();
};
// 参数加工函数；
MCanvas.prototype._handleOps = function (ops, img) {
    var cw = this.canvas.width,
        ch = this.canvas.height,
        iw = img.naturalWidth,
        ih = img.naturalHeight;

    // 图片宽高比；
    var ratio = iw / ih;

    // 根据参数计算后的绘制宽度；
    var width = this._get(cw, iw, ops.width, 'pos');

    // 裁剪的最大宽高；
    var maxLsw = void 0,
        maxLsh = void 0;

    // 裁剪参数；
    var _ops$crop2 = ops.crop,
        cropx = _ops$crop2.x,
        cropy = _ops$crop2.y,
        cropw = _ops$crop2.width,
        croph = _ops$crop2.height;

    var crop = {
        x: this._get(cw, iw, cropx, 'crop'),
        y: this._get(ch, ih, cropy, 'crop'),
        width: this._get(cw, iw, cropw, 'crop'),
        height: this._get(ch, ih, croph, 'crop')
    };
    // 最大值判定；
    if (crop.x > iw) crop.x = iw;
    if (crop.y > ih) crop.y = ih;
    maxLsw = img.naturalWidth - crop.x;
    maxLsh = img.naturalHeight - crop.y;
    if (crop.width > maxLsw) crop.width = maxLsw;
    if (crop.height > maxLsh) crop.height = maxLsh;

    // 位置参数；
    var _ops$pos2 = ops.pos,
        px = _ops$pos2.x,
        py = _ops$pos2.y,
        pr = _ops$pos2.rotate,
        ps = _ops$pos2.scale;

    var pos = {
        x: this._get(cw, width, px, 'pos'),
        y: this._get(ch, width / ratio, py, 'pos'),
        scale: ps,
        rotate: parseFloat(pr) * Math.PI / 180
    };
    return { width: width, crop: crop, pos: pos };
};

// --------------------------------------------------------
// 绘制文字部分；
// --------------------------------------------------------
MCanvas.prototype.text = function () {
    var _this3 = this;

    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ops = arguments[1];

    // 默认字体；
    var fontFamily = 'helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif';
    // 默认的字体大小;
    var size = this.canvas.width / 20;

    this.queue.push(function () {
        var option = {
            width: 300,
            align: 'left',
            smallStyle: {
                font: size * 0.8 + 'px ' + fontFamily,
                color: '#000',
                lineheight: size * 0.9
            },
            normalStyle: {
                font: size + 'px ' + fontFamily,
                color: '#000',
                lineheight: size * 1.1
            },
            largeStyle: {
                font: size * 1.3 + 'px ' + fontFamily,
                color: '#000',
                lineheight: size * 1.4
            },
            pos: {
                x: 0,
                y: 0
            }
        };
        option = _$1.extend(option, ops);

        // 解析字符串模板后，调用字体绘制函数；
        _this3._text(_this3._parse(context), option);
        _this3._next();
    });
    return this;
};
// 字符串模板解析函数
// 解析 <s></s> <b></b>
MCanvas.prototype._parse = function (context) {
    var arr = context.split(/<s>|<b>/);
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        var value = arr[i];
        if (/<\/s>|<\/b>/.test(value)) {
            var splitTag = /<\/s>/.test(value) ? '</s>' : '</b>',
                type = /<\/s>/.test(value) ? 'small' : 'large';
            var tmp = arr[i].split(splitTag);
            result.push({
                type: type,
                text: tmp[0]
            });
            tmp[1] && result.push({
                type: 'normal',
                text: tmp[1]
            });
            continue;
        }
        arr[i] && result.push({
            text: arr[i],
            type: 'normal'
        });
    }
    return result;
};
MCanvas.prototype._text = function (textArr, option) {
    var _this4 = this;

    // 处理宽度参数；
    option.width = this._get(this.canvas.width, 0, option.width, 'pos');

    var style = void 0,
        line = 1,
        length = 0,
        lineheight = getLineHeight(textArr, option),
        x = this._get(this.canvas.width, option.width, option.pos.x, 'pos'),
        y = this._get(this.canvas.height, 0, option.pos.y, 'pos') + lineheight;

    // data:字体数据；
    // lineWidth:行宽；
    this.textData[line] = {
        data: [],
        lineWidth: 0
    };

    // 生成字体数据；
    textArr.forEach(function (v) {
        style = option[v.type + 'Style'];
        _this4.ctx.font = style.font;
        var width = _this4.ctx.measureText(v.text).width;

        // 处理 <br> 换行，先替换成 '|',便于单字绘图时进行判断；
        var context = v.text.replace(/<br>/g, '|');

        // 先进行多字超出判断，超出宽度后再进行单字超出判断；
        if (length + width > option.width || context.indexOf('|') !== -1) {
            for (var i = 0, fontLength = context.length; i < fontLength; i++) {
                var font = context[i];
                width = _this4.ctx.measureText(font).width;

                // 当字体的计算宽度 > 设置的宽度 || 内容中包含换行时,进入换行逻辑；
                if (length + width > option.width || font == '|') {
                    length = 0;
                    x = _this4._get(_this4.canvas.width, option.width, option.pos.x, 'pos');
                    y += lineheight;
                    line += 1;
                    _this4.textData[line] = {
                        data: [],
                        lineWidth: 0
                    };
                    if (font == '|') continue;
                }
                _this4.textData[line]['data'].push({
                    context: font, x: x, y: y, style: style, width: width
                });
                length += width;
                x += width;
                _this4.textData[line]['lineWidth'] = length;
            }
        } else {
            _this4.textData[line]['data'].push({
                context: context, x: x, y: y, style: style, width: width
            });
            length += width;
            x += width;
            _this4.textData[line]['lineWidth'] = length;
        }
    });

    // 通过字体数据进行文字的绘制；
    _$1.forin(this.textData, function (k, v) {
        // 增加 align 的功能；
        var add = 0;
        if (v.lineWidth < option.width) {
            if (option.align == 'center') {
                add = (option.width - v.lineWidth) / 2;
            } else if (option.align == 'right') {
                add = option.width - v.lineWidth;
            }
        }
        v.data.forEach(function (text) {
            text.x += add;
            _this4._fillText(text);
        });
    });

    // 获取行高；
    function getLineHeight(textArr, option) {
        var lh = 0,
            vlh = void 0;
        textArr.forEach(function (v) {
            vlh = option[v.type + 'Style'].lineheight;
            if (vlh > lh) lh = vlh;
        });
        return lh;
    }
};
MCanvas.prototype._fillText = function (text) {
    var context = text.context,
        x = text.x,
        y = text.y,
        style = text.style;

    this.ctx.font = style.font;
    this.ctx.textAlign = style.align;
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillStyle = style.color;
    this.ctx.fillText(context, x, y);
};

// --------------------------------------------------------
// 业务功能函数部分
// --------------------------------------------------------

// 参数加工函数；
// 兼容 5 种 value 值：
// x:250, x:'250px', x:'100%', x:'left:250',x:'center',
// width:100,width:'100px',width:'100%'
MCanvas.prototype._get = function (par, child, str, type) {
    var result = str;
    if (typeof str === 'string') {
        if (str.indexOf(':') !== -1 && type == 'pos') {
            var arr = str.split(':');
            switch (arr[0]) {
                case 'left':
                case 'top':
                    result = +arr[1].replace('px', '');
                    break;
                case 'right':
                case 'bottom':
                    result = par - +arr[1].replace('px', '') - child;
                    break;
                default:
            }
        } else if (str.indexOf('px') !== -1) {
            result = +str.replace('px', '');
        } else if (str.indexOf('%') !== -1) {
            if (type == 'crop') {
                result = child * +str.replace('%', '') / 100;
            } else {
                result = par * +str.replace('%', '') / 100;
            }
        } else if (str == 'center') {
            result = (par - child) / 2;
        } else {
            result = +str;
        }
    }
    return result;
};

// 绘制函数；
MCanvas.prototype.draw = function () {
    var _this5 = this;

    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

    var b64 = void 0;
    this.end = function () {
        setTimeout(function () {
            b64 = _this5.canvas.toDataURL('image/png');
            fn(b64);
        }, 0);
    };
    this._next();
    return this;
};
MCanvas.prototype._next = function () {
    if (this.queue.length > 0) {
        this.queue.shift()();
    } else {
        this.end();
    }
};

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var sheet = void 0;
var _$2 = {
    setPos: function setPos(el, transform) {
        var str = JSON.stringify(transform);
        var value = 'translate3d(' + transform.x + 'px,' + transform.y + 'px,0px) scale(' + transform.scale + ') rotate(' + transform.rotate + 'deg)';
        el = this.getEl(el);
        el.style.transform = value;
        el.style.webkitTransform = value;
        el.setAttribute('data-mtouch-status', str);
    },
    getPos: function getPos(el) {
        if (!el) return;
        var defaulTrans = void 0;
        var style = window.getComputedStyle(el, null);
        var cssTrans = style.transform || style.webkitTransform;

        if (window.getComputedStyle && cssTrans !== 'none') {
            defaulTrans = this.matrixTo(cssTrans);
        } else {
            defaulTrans = {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0
            };
        }
        return JSON.parse(el.getAttribute('data-mtouch-status')) || defaulTrans;
    },
    extend: function extend(obj1, obj2) {
        for (var k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                if (_typeof$3(obj2[k]) == 'object' && !(obj2[k] instanceof Node)) {
                    if (_typeof$3(obj1[k]) !== 'object' || obj1[k] === null) {
                        obj1[k] = {};
                    }
                    this.extend(obj1[k], obj2[k]);
                } else {
                    obj1[k] = obj2[k];
                }
            }
        }
        return obj1;
    },
    getOffset: function getOffset(el) {
        el = this.getEl(el);
        var offset = {};
        offset.width = el.clientWidth || el.offsetWidth;
        offset.height = el.clientHeight || el.offsetHeight;
        return offset;
    },
    matrixTo: function matrixTo(matrix) {
        // 解析 matrix 字符串，分割成数组；
        var arr = matrix.replace('matrix(', '').replace(')', '').split(',');
        // 根据不等式计算出 rotate 和 scale；
        var cos = arr[0],
            sin = arr[1],
            tan = sin / cos,
            rotate = Math.atan(tan) * 180 / Math.PI,
            scale = cos / Math.cos(Math.PI / 180 * rotate),
            trans = void 0;
        // 传入翻译后的各项参数；
        trans = {
            x: parseInt(arr[4]),
            y: parseInt(arr[5]),
            scale: scale,
            rotate: rotate
        };
        return trans;
    },
    domify: function domify(DOMString) {
        var htmlDoc = document.implementation.createHTMLDocument();
        htmlDoc.body.innerHTML = DOMString;
        return htmlDoc.body.children;
    },
    getEl: function getEl(el) {
        if (!el) {
            console.error('el error,there must be a el!');
            return;
        }
        var _el = void 0;
        if (typeof el == 'string') {
            _el = document.querySelector(el);
        } else if (el instanceof Node) {
            _el = el;
        } else {
            console.error('el error,there must be a el!');
            return;
        }
        return _el;
    },
    addClass: function addClass(el, cls) {
        var _cls = void 0;
        el = this.getEl(el);
        _cls = this.trim(el.className) || '';
        if (_cls.indexOf(cls) == -1) {
            if (_cls.length == 0) {
                el.className = cls;
            } else {
                el.className = _cls + (' ' + cls);
            }
        }
        return this;
    },
    trim: function trim(str) {
        if (typeof str == 'string') {
            return str.replace(/(^\s*)|(\s*$)/g, '');
        }
    },
    removeClass: function removeClass(el, cls) {
        var _cls = void 0;
        el = this.getEl(el);
        _cls = el.className || '';
        if (_cls.indexOf(cls) !== -1) {
            el.className = _cls.replace(new RegExp(cls, 'g'), '');
        }
    },
    hasClass: function hasClass(el, cls) {
        el = this.getEl(el);
        return el.className.indexOf(cls) !== -1;
    },
    forin: function forin(obj, cbk) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                cbk(k, obj[k]);
            }
        }
    },
    data: function data(el, key, value) {
        el = this.getEl(el);
        if (!value) {
            return el.getAttribute('data-' + key);
        } else {
            el.setAttribute('data-' + key, value);
            return this;
        }
    },
    include: function include(str1, str2) {
        if (str1.indexOf) {
            return str1.indexOf(str2) !== -1;
        } else {
            return false;
        }
    },
    delegate: function delegate(par, evName, child) {
        var _this = this;

        var fn = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

        var _par = this.getEl(par);
        _par.addEventListener(evName, function (ev) {
            var target = ev.target;
            while (target !== _par) {
                if (child.indexOf('.') == 0) {
                    if (_this.include(target.className, child.substring(1))) {
                        ev.delegateTarget = target;
                        fn.bind(target)(ev);
                        break;
                    }
                } else if (child.indexOf('#') == 0) {
                    if (target.id == child.substring(1)) {
                        ev.delegateTarget = target;
                        fn.bind(target)(ev);
                        break;
                    }
                } else {
                    if (target.tagName.toLowerCase() == child) {
                        ev.delegateTarget = target;
                        fn.bind(target)(ev);
                        break;
                    }
                }
                target = target.parentNode;
            }
        });
    },
    addCssRule: function addCssRule(selector, rules) {
        if (!sheet) {
            sheet = createStyleSheet();
        }
        sheet.insertRule(selector + '{' + rules + '}', sheet.rules.length);
    },
    remove: function remove(el) {
        var _par = el.parentNode || el.parentElement;
        _par.removeChild(el);
    },
    loadImage: function loadImage(image, success, error) {
        var img = new Image();
        var loaded = false;
        if (image.indexOf('http') == 0) {
            img.crossOrigin = '*';
        }
        img.onload = function () {
            if (!loaded) {
                loaded = true;
                success(img);
            }
        };
        img.onerror = function () {
            error('img load error');
        };
        img.src = image;
    },
    getImage: function getImage(image, cbk) {
        if (typeof image == 'string') {
            this.loadImage(image, function (img) {
                cbk(img);
            }, function (err) {
                console.log(err);
            });
        } else if ((typeof image === 'undefined' ? 'undefined' : _typeof$3(image)) == 'object' && image instanceof Node) {
            cbk(image);
        } else {
            console.log('add image error');
            return;
        }
    },
    isArr: function isArr(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }
};

function createStyleSheet() {
    var style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    return style.sheet;
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 素材层级管理系统；
var ZIndex = function () {
    function ZIndex(config) {
        _classCallCheck$1(this, ZIndex);

        this.config = {
            'min': 50,
            'max': 100
        };
        this.config = _$2.extend(this.config, config);
        this.topIndex = this.config.min;
        this.zIndexArr = [];
    }

    _createClass$1(ZIndex, [{
        key: 'init',
        value: function init() {
            this.zIndexArr = [];
            this.topIndex = this.config.min;
        }
    }, {
        key: 'setIndex',
        value: function setIndex(id) {
            this.zIndexArr.push(id);
            if (this.topIndex > this.config.max) {
                this.resetIndex();
            } else {
                var el = document.querySelector('#' + id);
                el.style.zIndex = this.topIndex;
                this.topIndex++;
            }
        }
    }, {
        key: 'removeIndex',
        value: function removeIndex(id) {
            this.zIndexArr.forEach(function (value, index, arr) {
                if (value == id) {
                    arr.splice(index, 1);
                }
            });
        }
    }, {
        key: 'resetIndex',
        value: function resetIndex() {
            var _this = this;

            this.zIndexArr.forEach(function (id, index) {
                var el = document.querySelector('#' + id);
                el.style.zIndex = _this.config.min + index;
            });
            this.topIndex = this.zIndexArr.length + this.config.min;
        }
    }, {
        key: 'toTop',
        value: function toTop(id) {
            if (id !== this.zIndexArr[this.zIndexArr.length - 1]) {
                this.removeIndex(id);
                this.setIndex(id);
            }
        }
    }]);

    return ZIndex;
}();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var EVENT = ['touchstart', 'touchmove', 'touchend', 'drag', 'dragstart', 'dragend', 'pinch', 'pinchstart', 'pinchend', 'rotate', 'rotatestart', 'rotatend', 'singlePinchstart', 'singlePinch', 'singlePinchend', 'singleRotate', 'singleRotatestart', 'singleRotatend'];

window.requestAnimFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
}();

function Touchkit(ops) {
    // 兼容不使用 new 的方式；
    if (!(this instanceof Touchkit)) return new Touchkit(ops);

    this._ops = {
        el: null,
        use: {
            drag: false,
            pinch: false,
            rotate: false,
            singlePinch: false,
            singleRotate: false
        },
        limit: false,
        // event
        event: {
            touchstart: function touchstart() {},
            touchmove: function touchmove() {},
            touchend: function touchend() {},
            dragstart: function dragstart() {},
            drag: function drag() {},
            dragend: function dragend() {},
            pinchstart: function pinchstart() {},
            pinch: function pinch() {},
            pinchend: function pinchend() {},
            rotatestart: function rotatestart() {},
            rotate: function rotate() {},
            rotatend: function rotatend() {},
            singlePinchstart: function singlePinchstart() {},
            singlePinch: function singlePinch() {},
            singlePinchend: function singlePinchend() {},
            singleRotatestart: function singleRotatestart() {},
            singleRotate: function singleRotate() {},
            singleRotatend: function singleRotatend() {}
        }
    };

    if ((typeof ops === 'undefined' ? 'undefined' : _typeof(ops)) == 'object') {
        this._ops = _$2.extend(this._ops, ops);
    } else if (typeof ops == 'string') {
        this._ops.el = ops;
    }

    // 手势容器；
    this.el = _$2.getEl(this._ops.el);
    // 容器宽高，优先使用clientWidth，避免边框等因素的影响；
    this.elStatus = {
        width: this.el.clientWidth || this.el.offsetWidth,
        height: this.el.clientHeight || this.el.offsetHeight
    };
    this._init();

    // 初始化mtouch；
    this.mt = MTouch(this.el);

    this._bind();

    this._insertCss();
}

Touchkit.prototype._init = function () {
    // 操作元素
    this.operator = null;
    this.operatorStatus = null;

    this.transform = null;
    this.freezed = false;
    // 子元素仓库，index用于标记子元素；
    this._childs = {};
    this._childIndex = 0;
    this._activeChild = null;
    // 管理子元素之间的zindex层级关系；
    this._zIndexBox = new ZIndex();
};

Touchkit.prototype.background = function (ops) {
    var _this = this;

    var _ops = {
        // 背景图片，type: url/HTMLImageElement/HTMLCanvasElement
        image: '',
        // 绘制方式: crop / contain
        // crop : 裁剪模式，背景图自适应铺满画布，多余部分裁剪；
        // contain : 包含模式, 类似于 background-size:contain; 可通过left/top值进行位置的控制；
        type: 'contain',
        // 背景图片距离画布左上角的距离，
        left: 0,
        top: 0,
        // 在type=crop时使用，背景图只需启动拖动操作；
        use: {
            drag: true
        }
    };
    _ops = _$2.extend(_ops, ops);
    _$2.getImage(_ops.image, function (img) {
        // 背景图真实宽高及宽高比；
        var iw = img.naturalWidth,
            ih = img.naturalHeight,
            iratio = iw / ih;
        // 容器宽高及宽高比；
        var pw = _this.elStatus.width,
            ph = _this.elStatus.height,
            pratio = pw / ph;

        var left = void 0,
            top = void 0,
            width = void 0,
            height = void 0;
        var minX = 0,
            minY = 0;
        var ratio = void 0;

        // 初始化背景图属性；
        _$2.addClass(img, 'mt-background').data(img, 'mt-index', 'background').data(img, 'mt-bg-type', _ops.type);

        if (_ops.type == 'contain') {
            if (iratio > pratio) {
                left = _ops.left || 0;
                top = _ops.top || (ph - pw / iratio) / 2;
                width = pw;
                height = pw / iratio;
                ratio = iw / width;
            } else {
                left = _ops.left || (pw - ph * iratio) / 2;
                top = _ops.top || 0;
                width = ph * iratio;
                height = ph;
                ratio = ih / height;
            }
        } else if (_ops.type == 'crop') {
            left = 0;
            top = 0;
            if (iratio > pratio) {
                width = ph * iratio;
                height = ph;
                minX = (width - pw) / width;
                ratio = ih / height;
            } else {
                width = pw;
                height = pw / iratio;
                minY = (height - ph) / height;
                ratio = iw / width;
            }
            _ops.limit = {
                x: minX,
                y: minY,
                maxScale: 1,
                minScale: 1
            };
        }
        img.style = 'width:' + width + 'px;height:' + height + 'px;left:' + left + 'px;top:' + top + 'px';
        _this.el.appendChild(img);

        // 记录背景图参数；
        _ops.ratio = ratio;
        _ops.left = left;
        _ops.top = top;

        _this._childs.background = {
            el: img,
            ops: _ops
        };
    });
    return this;
};

Touchkit.prototype.add = function (ops) {
    var _this2 = this;

    var _ops = {
        image: '',
        width: '',
        use: {
            drag: false,
            pinch: false,
            rotate: false,
            singlePinch: false,
            singleRotate: false
        },
        limit: false,
        pos: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        },
        close: false
    };

    if (!_$2.isArr(ops)) ops = [ops];

    ops.forEach(function (v) {
        _$2.getImage(v.image, function (img) {
            _this2._add(img, _$2.extend(_ops, v));
        });
    });
    return this;
};

Touchkit.prototype._add = function (img, ops) {
    var iw = img.naturalWidth,
        ih = img.naturalHeight,
        iratio = iw / ih;
    var _templateEl = img;
    var _ele = _$2.domify('<div class="mt-child" id="mt-child-' + this._childIndex + '" data-mt-index="' + this._childIndex + '"></div>')[0];
    var originWidth = this._get('hor', ops.width),
        originHeight = originWidth / iratio;
    var spaceX = (ops.pos.scale - 1) * originWidth / 2,
        spaceY = (ops.pos.scale - 1) * originHeight / 2;
    _ele.style = 'width:' + originWidth + 'px;height:' + originHeight + 'px';
    _$2.addClass(_templateEl, 'mt-image');
    _ele.appendChild(_templateEl);
    // 是否添加关闭按钮；
    if (ops.close || this._ops.close) {
        _ele.appendChild(_$2.domify('<div class="mt-close-btn"></div>')[0]);
    }
    this.el.appendChild(_ele);
    // 记录数据；
    this._childs[this._childIndex] = {
        el: _ele,
        ops: ops
    };
    // 根据id进行zIndex的设置；
    this._zIndexBox.setIndex('mt-child-' + this._childIndex);

    // 没有开启单指操作时，不添加单指按钮；
    var addButton = ops.use.singlePinch || this._ops.use.singlePinch || ops.use.singleRotate || this._ops.use.singleRotate ? true : false;
    // 切换operator到新添加的元素上；
    this.switch(_ele, addButton);

    // space 为因为缩放造成的偏移误差；
    this._setTransform(_ele, {
        x: this._get('hor', ops.pos.x) + spaceX,
        y: this._get('ver', ops.pos.y) + spaceY,
        scale: ops.pos.scale,
        rotate: ops.pos.rotate
    });
    this._childIndex++;
};
// 使用 mcanvas 合成图片后导出 base64;
Touchkit.prototype.exportImage = function (cbk) {
    var cwidth = this.elStatus.width,
        cheight = this.elStatus.height;
    var bg = this._childs.background;
    var bgLeft = void 0,
        bgTop = void 0;
    var ratio = bg.ops.ratio;
    var mc = new MCanvas(cwidth * ratio, cheight * ratio);
    var addChilds = [];
    this._zIndexBox.zIndexArr.forEach(function (v) {
        var child = document.querySelector('#' + v);
        var image = child.querySelector('.mt-image');
        var childPos = JSON.parse(_$2.data(child, 'mtouch-status'));
        var width = image.clientWidth || image.offsetWidth;
        childPos.x *= ratio;
        childPos.y *= ratio;
        addChilds.push({
            image: image,
            options: {
                width: width * ratio,
                pos: childPos
            }
        });
    });
    if (bg.ops.type == 'crop') {
        var bgPos = JSON.parse(_$2.data(bg.el, 'mtouch-status')) || { left: 0, top: 0, scale: 1, rotate: 0 };
        bgLeft = -bgPos.x;
        bgTop = -bgPos.y;
    } else {
        bgLeft = bg.ops.left;
        bgTop = bg.ops.top;
    }
    mc.background({
        image: bg.el,
        type: bg.ops.type,
        left: bgLeft * ratio,
        top: bgTop * ratio
    }).add(addChilds).draw(function (b64) {
        cbk(b64);
    });
};

Touchkit.prototype._bind = function () {
    var _this3 = this;

    // 绑定所有事件；
    EVENT.forEach(function (evName) {
        if (!_this3[evName]) {
            _this3[evName] = function () {
                _this3._ops.event[evName]();
            };
        }
        _this3.mt.on(evName, _this3[evName].bind(_this3));
    });

    // 点击子元素外的区域失去焦点；
    this.el.addEventListener('click', function (ev) {
        if (!_this3._isAdd(ev.target)) {
            _this3.switch(null);
        }
        // 如果背景为裁剪模式，则切换到操作背景图；
        if (_$2.hasClass(ev.target, 'mt-background') && _$2.data(ev.target, 'mt-bg-type') == 'crop') {
            _this3.switch(ev.target);
        }
    });

    // 切换子元素；
    _$2.delegate(this.el, 'click', '.mt-child', function (ev) {
        var el = ev.delegateTarget,
            _ops = _this3._getOperatorOps(el),
            _addButton = _ops.use.singlePinch || _this3._ops.use.singlePinch || _ops.use.singleRotate || _this3._ops.use.singleRotate ? true : false;
        _this3.switch(el, _addButton);
        _this3._zIndexBox.toTop(el.id);
    });

    // 关闭按钮事件；
    _$2.delegate(this.el, 'click', '.mt-close-btn', function (ev) {
        var _el = ev.delegateTarget;
        var _child = _el.parentNode || _el.parentElement;
        _this3._zIndexBox.removeIndex(_child.id);
        _$2.remove(_child);
    });
};

Touchkit.prototype.touchstart = function (ev) {
    if (!this.freezed) {
        if (this.operator) {
            this.transform = _$2.getPos(this.operator);
        }
        this._ops.event.touchstart(ev);
    }
};

Touchkit.prototype.drag = function (ev) {
    if (!this.freezed) {
        if (this.operator) {
            var ops = this._getOperatorOps();
            if (ops.use.drag || this._ops.use.drag) {
                this.transform.x += ev.delta.deltaX;
                this.transform.y += ev.delta.deltaY;
                this._setTransform();
            }
        }
        this._ops.event.drag(ev);
    }
};

Touchkit.prototype.pinch = function (ev) {
    if (!this.freezed) {
        if (this.operator) {
            var ops = this._getOperatorOps();
            if (ops.use.pinch || this._ops.use.pinch) {
                this.transform.scale *= ev.delta.scale;
                this._setTransform();
            }
        }
        this._ops.event.pinch(ev);
    }
};
Touchkit.prototype.rotate = function (ev) {
    if (!this.freezed) {
        if (this.operator) {
            var ops = this._getOperatorOps();
            if (ops.use.rotate || this._ops.use.rotate) {
                this.transform.rotate += ev.delta.rotate;
                this._setTransform();
            }
        }
        this._ops.event.rotate(ev);
    }
};
Touchkit.prototype.singlePinch = function (ev) {
    if (!this.freezed) {
        if (this.operator) {
            var ops = this._getOperatorOps();
            if (ops.use.singlePinch || this._ops.use.singlePinch) {
                this.transform.scale *= ev.delta.scale;
                this._setTransform();
            }
        }
        this._ops.event.singlePinch(ev);
    }
};
Touchkit.prototype.singleRotate = function (ev) {
    if (!this.freezed) {
        if (this.operator) {
            var ops = this._getOperatorOps();
            if (ops.use.singleRotate || this._ops.use.singleRotate) {
                this.transform.rotate += ev.delta.rotate;
                this._setTransform();
            }
        }
        this._ops.event.singleRotate(ev);
    }
};
Touchkit.prototype._setTransform = function () {
    var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.operator;
    var transform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.transform;

    var trans = JSON.parse(JSON.stringify(transform));
    var ops = this._getOperatorOps();

    var defaulLimit = this._ops.limit && _typeof(this._ops.limit) == 'object' ? _$2.extend({
        x: 0.5,
        y: 0.5,
        maxScale: 3,
        minScale: 0.4
    }, this._ops.limit) : {
        x: 0.5,
        y: 0.5,
        maxScale: 3,
        minScale: 0.4
    };

    var _limit = ops.limit && ops.limit !== true ? _$2.extend(defaulLimit, ops.limit) : defaulLimit;
    if (ops.limit || this._ops.limit) {
        trans = this._limitOperator(trans, _limit);
    }
    if (ops.use.singlePinch || this._ops.use.singlePinch) {
        var singlePinchBtn = el.querySelector('.mtouch-singleButton');
        singlePinchBtn.style.transform = 'scale(' + 1 / trans.scale + ')';
        singlePinchBtn.style.webkitTransform = 'scale(' + 1 / trans.scale + ')';
    }
    if (ops.use.singleRotate || this._ops.use.singleRotate) {
        var singleRotateBtn = el.querySelector('.mtouch-singleButton');
        singleRotateBtn.style.transform = 'scale(' + 1 / trans.scale + ')';
        singleRotateBtn.style.webkitTransform = 'scale(' + 1 / trans.scale + ')';
    }
    if (ops.close || this._ops.close) {
        var closeBtn = el.querySelector('.mt-close-btn');
        closeBtn.style.transform = 'scale(' + 1 / trans.scale + ')';
        closeBtn.style.webkitTransform = 'scale(' + 1 / trans.scale + ')';
    }
    window.requestAnimFrame(function () {
        _$2.setPos(el, trans);
    });
};
Touchkit.prototype._limitOperator = function (transform, limit) {
    // 实时获取操作元素的状态；
    var minScale = limit.minScale,
        maxScale = limit.maxScale;

    if (minScale && transform.scale < minScale) {
        transform.scale = minScale;
    }
    if (maxScale && transform.scale > maxScale) {
        transform.scale = maxScale;
    }
    var operatorStatus = _$2.getOffset(this.operator);
    // 因缩放产生的间隔；
    var spaceX = operatorStatus.width * (transform.scale - 1) / 2;
    var spaceY = operatorStatus.height * (transform.scale - 1) / 2;
    // 参数设置的边界值；
    var boundaryX = operatorStatus.width * transform.scale * limit.x;
    var boundaryY = operatorStatus.height * transform.scale * limit.y;
    // 4个边界状态；
    var minX = spaceX - boundaryX;
    var minY = spaceX - boundaryY;
    var maxX = this.elStatus.width - operatorStatus.width * transform.scale + spaceX + boundaryX;
    var maxY = this.elStatus.height - operatorStatus.height * transform.scale + spaceY + boundaryY;

    if (limit.x || limit.x == 0) {
        if (transform.x >= maxX) transform.x = maxX;
        if (transform.x < minX) transform.x = minX;
    }
    if (limit.y || limit.y == 0) {
        if (transform.y > maxY) transform.y = maxY;
        if (transform.y < minY) transform.y = minY;
    }
    return transform;
};
Touchkit.prototype.switch = function (el, addButton) {
    if (!this.mt || this.freezed) return;
    if (el) {
        el = _$2.getEl(el);
    }
    _$2.forin(this._childs, function (k, v) {
        _$2.removeClass(v.el, 'mt-active');
    });
    // 转换操作元素后，也需要重置 mtouch 中的单指缩放基本点 singleBasePoint;
    this.mt.switch(el, addButton);
    // 切换operator;
    this.operator = el;

    if (el) {
        _$2.addClass(el, 'mt-active');
        this._activeChild = el;
    }
    return this;
};

Touchkit.prototype._getOperatorOps = function (target) {
    var _tar = target || this.operator;
    var index = _$2.data(_tar, 'mt-index');
    return this._childs[index].ops;
};

// 冻结手势容器，暂停所有操作，且失去焦点；
// 解冻后恢复最后状态；
Touchkit.prototype.freeze = function (boolean) {
    if (boolean) {
        _$2.forin(this._childs, function (k, v) {
            _$2.removeClass(v.el, 'mt-active');
        });
    } else {
        _$2.addClass(this._activeChild, 'mt-active');
    }
    this.freezed = boolean ? true : false;
    return this;
};

// 重置所有状态到初始化阶段；
Touchkit.prototype.reset = function () {
    _$2.forin(this._childs, function (k, v) {
        _$2.remove(v.el);
    });
    this._init();
};

// 销毁，但保持原有样式，失去焦点与事件绑定；
Touchkit.prototype.destory = function () {
    _$2.forin(this._childs, function (k, v) {
        _$2.removeClass(v.el, 'mt-active');
    });
    this.mt && this.mt.destroy();
    this.mt = null;
};
// 参数加工函数；
// 兼容 5 种 value 值：
// x:250, x:'250px', x:'100%', x:'left:250',x:'center',
// width:100,width:'100px',width:'100%'
Touchkit.prototype._get = function (drection, str) {
    var result = str;
    var k = void 0,
        par = void 0,
        child = void 0;
    if (document.body && document.body.clientWidth) {
        k = drection == 'hor' ? 'clientWidth' : 'clientHeight';
    } else {
        k = drection == 'hor' ? 'offsetWidth' : 'offsetHeight';
    }
    par = this.el[k];
    child = this.operator ? this.operator[k] : 0;
    if (typeof str === 'string') {
        if (_$2.include(str, ':')) {
            var arr = str.split(':');
            switch (arr[0]) {
                case 'left':
                case 'top':
                    result = +arr[1].replace('px', '');
                    break;
                case 'right':
                case 'bottom':
                    result = par - +arr[1].replace('px', '') - child;
                    break;
                default:
            }
        } else if (_$2.include(str, 'px')) {
            result = +str.replace('px', '');
        } else if (_$2.include(str, '%')) {
            result = par * +str.replace('%', '') / 100;
        } else if (str == 'center') {
            result = (par - child) / 2;
        } else {
            result = +str;
        }
    }
    return result;
};

Touchkit.prototype._isAdd = function (el) {
    var target = el;
    while (target !== this.el || target.tagName.toLowerCase() == 'body') {
        if (_$2.include(target.className, 'mt-child')) {
            return true;
        }
        target = target.parentNode;
    }
    return false;
};

Touchkit.prototype._insertCss = function () {
    _$2.addCssRule('.mtouch-singleButton', 'display: none;');
    _$2.addCssRule('.mt-child.mt-active', 'z-index: 99;outline:2px solid hsla(0,0%,100%,.5);');
    _$2.addCssRule('.mt-active .mtouch-singleButton,.mt-active .mt-close-btn', 'display: inline-block;');
    _$2.addCssRule('.mt-child', 'position:absolute;text-align:left;');
    _$2.addCssRule('.mt-image', 'width:100%;height:100%;position:absolute;text-align:left;');
    _$2.addCssRule('.mt-close-btn', 'position:absolute;width:30px;height:30px;top:-15px;right:-15px;background-size:100%;display:none;');
    _$2.addCssRule('.mt-background', 'position:absolute;left:0;top:0;');
};

return Touchkit;

})));
//# sourceMappingURL=touchkit.js.map
