import MT from 'mtouch';
import MC from 'mcanvas';
import removeBtn from './removeBtn';
import ZIndex from './zIndex';
import _ from './utils';

const EVENT = ['touchstart','touchmove','touchend','drag','dragstart','dragend','pinch','pinchstart','pinchend','rotate','rotatestart','rotatend','singlePinchstart','singlePinch','singlePinchend','singleRotate','singleRotatestart','singleRotatend'];
const noop = function () {};

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

export default function Touchkit(ops) {
    // 兼容不使用 new 的方式；
    if (!(this instanceof Touchkit))
        return new Touchkit(ops);

    this._ops = {
        el: null,
        use:{
            drag:false,
            pinch:false,
            rotate:false,
            singlePinch:false,
            singleRotate:false,
        },
        limit:false,
        // event
        event: {},
    };

    EVENT.map(eventName => this._ops.event[eventName] = noop);

    if(typeof ops == 'object'){
        this._ops = _.extend(this._ops, ops);
    }else if(typeof ops == 'string'){
        this._ops.el = ops;
    }

    // 手势容器；
    this.el = _.getEl(this._ops.el);

    _.addClass(this.el,'mt-touch-box');
    // 容器宽高，优先使用clientWidth，避免边框等因素的影响；
    this.elStatus = {
        width:this.el.clientWidth || this.el.offsetWidth,
        height:this.el.clientHeight || this.el.offsetHeight,
    };

    // 初始化mtouch；
    this.mt = MT(this.el);
    this._insertCss()._init()._bind();

}

Touchkit.prototype._init = function(childs = {}){
    // 操作元素
    this.operator = null;
    this.operatorStatus = null;

    this._cropBox = false;

    this.transform = null;
    this.freezed = false;
    // 子元素仓库，index用于标记子元素；
    this._childs = childs;
    this._childIndex = 0;
    this._activeChild = null;
    // 管理子元素之间的zindex层级关系；
    this._zIndexBox = new ZIndex();
    return this;
};

Touchkit.prototype.background = function(ops){
    let _ops = {
        // 背景图片，type: url/HTMLImageElement/HTMLCanvasElement
        image:'' ,
        // 绘制方式: crop / contain
            // crop : 裁剪模式，背景图自适应铺满画布，多余部分裁剪；
            // contain : 包含模式, 类似于 background-size:contain; 可通过left/top值进行位置的控制；
        type:'contain',
        // 背景图片距离画布左上角的距离，
        left:0,
        top:0,
        // 在type=crop时使用，背景图只需启动拖动操作；
        use:{},
        static:false,
        success(){},
        error(){},
    };
    _ops = _.extend(_ops,ops);
    _.getImage(_ops.image, img => {
        // 背景图真实宽高及宽高比；
        let {iw,ih} = this._getSize(img);
        let iratio = iw / ih;
        // 容器宽高及宽高比；
        let pw = this.elStatus.width,
            ph = this.elStatus.height,
            pratio = pw / ph;

        let left,top,width,height;
        let minX = 0 , minY = 0;
        let ratio;

        let template = _.domify(`<div class="mt-background" data-mt-index="background" data-mt-bg-type=${_ops.type}><div class="mt-prevent"></div></div>`)[0];

        // 初始化背景图属性；
        _.addClass(img,'mt-image');
        template.appendChild(img);

        if(_ops.type == 'contain'){
            if(iratio > pratio){
                left = _ops.left || 0;
                top = _ops.top || (ph - pw/iratio) / 2;
                width = pw;
                height = pw / iratio;
                ratio = iw / width;
            }else{
                left = _ops.left || (pw - ph*iratio) / 2;
                top = _ops.top || 0;
                width = ph*iratio;
                height = ph;
                ratio = ih / height;
            }
            if(!ops.static){
                _ops.use = {
                    drag:true,
                    pinch:true,
                    rotate:true,
                };
            }
        }else if(_ops.type == 'crop'){
            left = 0;
            top = 0;
            if(iratio > pratio){
                width = ph*iratio;
                height = ph;
                minX = (width - pw)/width;
                ratio = ih / height;
            }else{
                width = pw;
                height = pw/iratio;
                minY = (height - ph)/height;
                ratio = iw / width;
            }
            _ops.limit = {
                x:minX,
                y:minY,
                maxScale:1,
                minScale:1,
            };
            if(!ops.static){
                _ops.use = {
                    drag : true,
                };
            }
        }
        _.setStyle(template,{
            width:`${width}px`,
            height:`${height}px`,
            transform:`translate(${left}px,${top}px)`,
            webkitTransform:`translate(${left}px,${top}px)`,
        });

        _ops.pos = {width,height,left,top};

        this.el.appendChild(template);

        // 记录背景图参数；
        _ops.ratio = ratio;

        this._childs.background = {
            el:template,
            ops: _ops,
            type:'background',
        };
        _ops.success(this);
    },(err)=>{
        _ops.error(err);
    });
    return this;
};

Touchkit.prototype.add = function(ops){
    let _ops = {
        image:'',
        width:'',
        use:{
            drag:false,
            pinch:false,
            rotate:false,
            singlePinch:false,
            singleRotate:false,
        },
        limit:false,
        pos:{
            x:0,
            y:0,
            scale:1,
            rotate:0,
        },
        close:false,
        success(){},
        error(){},
    };

    if(!_.isArr(ops))ops = [ops];

    ops.forEach(v=>{
        _.getImage(v.image,img=>{
            if(v.use == 'all'){
                v.use ={
                    drag:true,
                    pinch:true,
                    rotate:true,
                    singlePinch:true,
                    singleRotate:true,
                };
            }
            this._add(img,_.extend(_ops,v));
        },err=>{
            _ops.error(err);
        });
    });
    return this;
};

Touchkit.prototype._add = function(img,ops){
    let {iw,ih} = this._getSize(img);
    let iratio = iw / ih;
    let _templateEl = img;
    let _ele = _.domify(`<div class="mt-child" id="mt-child-${this._childIndex}" data-mt-index="${this._childIndex}"><div class="mt-prevent"></div></div>`)[0];
    let originWidth = this._get('hor',ops.width),
        originHeight = originWidth / iratio;
    // space 为因为缩放造成的偏移误差；
    let spaceX = (ops.pos.scale - 1) * originWidth/2,
        spaceY = (ops.pos.scale - 1) * originHeight/2;
    _.setStyle(_ele,{
        width:`${originWidth}px`,
        height:`${originHeight}px`,
    });

    _.addClass(_templateEl,'mt-image');
    _ele.appendChild(_templateEl);
    // 是否添加关闭按钮；
    if(ops.close || this._ops.close){
        _ele.appendChild(_.domify(`<div class="mt-close-btn"></div>`)[0]);
    }
    this.el.appendChild(_ele);

    ops.pos ={
        x:this._get('hor',ops.pos.x) + spaceX,
        y:this._get('ver',ops.pos.y) + spaceY,
        scale:ops.pos.scale,
        rotate:ops.pos.rotate,
    };

    // 记录数据；
    this._childs[this._childIndex] = {
        el:_ele,
        ops: ops,
        type:'element',
    };
    // 根据id进行zIndex的设置；
    this._zIndexBox.setIndex(`mt-child-${this._childIndex}`);

    // 没有开启单指操作时，不添加单指按钮；
    let addButton = ((ops.use.singlePinch || this._ops.use.singlePinch) || (ops.use.singleRotate || this._ops.use.singleRotate)) ? true : false;
    // 切换operator到新添加的元素上；
    this.switch(_ele,addButton);

    this._setTransform('all', _ele , ops.pos);

    _.setStyle(_ele,{
        visibility:'visible',
    });

    this._childIndex++;
    ops.success(this);
};
Touchkit.prototype.cropBox = function(){
    let cropBox = _.domify(`<div class="mt-crop-box" data-mt-index="cropBox"><div class="mt-close-btn"></div></div>`)[0];
    this.el.appendChild(cropBox);
    this.switch(cropBox);
    this._cropBox = true;
    this._childs['cropBox'] = {
        el:cropBox,
        type:'cropBox',
        ops: {
            width:cropBox.offsetWidth,
            height:cropBox.offsetHeight,
            use:{
                drag:true,
                pinch:false,
                rotate:false,
                singlePinch:true,
                singleRotate:false,
            },
            limit:{
                x:0,
                y:0,
                maxScale:1,
                minScale:0.2,
            },
        },
    };
};
// 使用 mcanvas 合成图片后导出 base64;
Touchkit.prototype.exportImage = function(cbk,cropOps){
    let cwidth = this.elStatus.width,
        cheight = this.elStatus.height;
    let ratio = 1;
    let addChilds =[];

    if(this._childs.background){
        let bg = this._childs.background;
        ratio = bg.ops.ratio;
        let image = bg.el.querySelector('.mt-image');
        let bgPos = _.xRatio(_.getPos(bg.el),ratio);
        addChilds.push({
            image:image,
            options:{
                width:image.width * ratio,
                pos:bgPos,
            },
        });
    }

    let mc = new MC(cwidth*ratio,cheight*ratio,'#ffffff');

    this._zIndexBox.zIndexArr.forEach(v=>{
        let child = document.querySelector('#'+v);
        let image = child.querySelector('.mt-image');
        let childPos = _.xRatio(_.getPos(child),ratio);
        let width = image.clientWidth || image.offsetWidth;
        addChilds.push({
            image:image,
            options:{
                width: width * ratio,
                pos:childPos,
            },
        });
    });
    mc.add(addChilds).draw(b64=>{
        if(this._cropBox){
            let cropBoxOps = this._childs.cropBox;
            let cropBox = cropBoxOps.el;
            let cropBoxPos = _.getPos(cropBox);
            let corpBoxMc = new MC(cropBoxOps.ops.width * ratio,cropBoxOps.ops.height * ratio);
            corpBoxMc.add(mc.canvas,{
                width:mc.canvas.width,
                pos:{
                    x: -cropBoxPos.x * ratio,
                    y: -cropBoxPos.y * ratio,
                    scale:1,
                    rotate:0,
                },
            }).draw(b64=>{
                cbk(b64);
            });
        }else if(cropOps){
            let _default = {
                x:0,
                y:0,
                width:'100%',
                height:'100%',
            };
            cropOps = _.extend(_default,cropOps);
            cropOps.width = this._get('hor',cropOps.width,(mc.canvas.width-cropOps.x));
            cropOps.height = this._get('ver',cropOps.height,(mc.canvas.height-cropOps.y));
            let cropMc = new MC(cropOps.width,cropOps.height);
            cropMc.add(mc.canvas,{
                width:mc.canvas.width,
                pos:{
                    x: -cropOps.x ,
                    y: -cropOps.y,
                    scale:1,
                    rotate:0,
                },
            }).draw(b64=>{
                cbk(b64);
            });
        }else{
            cbk(b64);
        }
    });
};

Touchkit.prototype._bind = function(){
    // 绑定所有事件；
    EVENT.forEach(evName=>{
        if(!this[evName]){
            this[evName] = () =>{
                this._ops.event[evName]();
            };
        }
        this.mt.on(evName,this[evName].bind(this));
    });

    // 切换子元素；
    let bgStart,childStart;
    _.delegate(this.el,'touchstart','.mt-background',()=>{
        bgStart = new Date().getTime();
    });

    _.delegate(this.el,'touchend','.mt-background',ev=>{
        if(new Date().getTime() - bgStart > 300 || ev.touches.length)return;
        this.switch(ev.delegateTarget,false);
    });

    _.delegate(this.el,'touchend','.mt-crop-box',ev=>{
        if(ev.touches.length > 0)return;
        this.switch(ev.delegateTarget);
    });

    // 点击子元素外的区域失去焦点；
    this.el.addEventListener('click',ev=>{
        if(!this._isAdd(ev.target)){
            this.switch(null);
        }
    });

    _.delegate(this.el,'touchstart','.mt-child',()=>{
        childStart = new Date().getTime();
    });

    // 切换子元素；
    _.delegate(this.el,'touchend','.mt-child',ev=>{
        if(new Date().getTime() - childStart > 300 || ev.touches.length > 0)return;
        let el = ev.delegateTarget,
            _ops = this._getOperatorOps(el),
            _addButton = ((_ops.use.singlePinch || this._ops.use.singlePinch) || (_ops.use.singleRotate || this._ops.use.singleRotate)) ? true : false;
        this.switch(el,_addButton);
        this._zIndexBox.toTop(el.id);
    });

    // 关闭按钮事件；
    _.delegate(this.el,'click','.mt-close-btn',ev=>{
        let _el = ev.delegateTarget;
        let _child = _el.parentNode || _el.parentElement;
        let index = _.data(_child,'mt-index');
        if(index == 'cropBox'){
            this.switch(null);
            this._cropBox = false;
        }else{
            this._zIndexBox.removeIndex(_child.id);
        }
        _.remove(_child);
        this._childs[index] = null;
    });

    return this;
};

Touchkit.prototype.touchstart = function(ev){
    if(!this.freezed){
        if(this.operator){
            this.transform = _.getPos(this.operator);
        }
        this._ops.event.touchstart(ev);
    }
};

Touchkit.prototype.drag = function(ev){
    if(!this.freezed){
        if(this.operator){
            let ops = this._getOperatorOps();
            if(ops.use.drag || this._ops.use.drag){
                this.transform.x += ev.delta.deltaX;
                this.transform.y += ev.delta.deltaY;
                this._setTransform('drag');
            }
        }
        this._ops.event.drag(ev);
    }
};

Touchkit.prototype.pinch = function(ev){
    if(!this.freezed){
        if(this.operator){
            let ops = this._getOperatorOps();
            if(ops.use.pinch || this._ops.use.pinch){
                this.transform.scale *= ev.delta.scale;
                this._setTransform('pinch');
            }
        }
        this._ops.event.pinch(ev);
    }
};
Touchkit.prototype.rotate = function(ev){
    if(!this.freezed){
        if(this.operator){
            let ops = this._getOperatorOps();
            if(ops.use.rotate || this._ops.use.rotate){
                this.transform.rotate += ev.delta.rotate;
                this._setTransform('rotate');
            }
        }
        this._ops.event.rotate(ev);
    }
};
Touchkit.prototype.singlePinch = function(ev){
    if(!this.freezed){
        if(this.operator){
            let ops = this._getOperatorOps();
            if(_.data(this.operator,'mt-index') == 'cropBox'){
                if(ops.use.singlePinch || this._ops.use.singlePinch){
                    let cropBoxPos = _.getPos(this.operator);
                    if((ops.width + ev.delta.deltaX + cropBoxPos.x) < this.elStatus.width){
                        ops.width += ev.delta.deltaX;
                    }
                    if((ops.height + ev.delta.deltaY + cropBoxPos.y) < this.elStatus.height){
                        ops.height += ev.delta.deltaY;
                    }
                    _.setStyle(this.operator,{
                        width:`${ops.width}px`,
                        height:`${ops.height}px`,
                    });
                }
            }else{
                if(ops.use.singlePinch || this._ops.use.singlePinch){
                    this.transform.scale *= ev.delta.scale;
                    this._setTransform('pinch');
                }
            }
        }
        this._ops.event.singlePinch(ev);
    }
};
Touchkit.prototype.singleRotate = function(ev){
    if(!this.freezed){
        if(this.operator){
            let ops = this._getOperatorOps();
            if(ops.use.singleRotate || this._ops.use.singleRotate){
                this.transform.rotate += ev.delta.rotate;
                this._setTransform('rotate');
            }
        }
        this._ops.event.singleRotate(ev);
    }
};
Touchkit.prototype._setTransform = function(type, el = this.operator, transform = this.transform) {
    let trans = JSON.parse(JSON.stringify(transform));
    let ops = this._getOperatorOps();
    let defaulLimit = (this._ops.limit && typeof this._ops.limit == 'object') ? _.extend({
        x:0.5,
        y:0.5,
        maxScale:3,
        minScale:0.4,
    },this._ops.limit) : {
        x:0.5,
        y:0.5,
        maxScale:3,
        minScale:0.4,
    };
    let _limit = (ops.limit && ops.limit !== true) ? _.extend(defaulLimit,ops.limit) : defaulLimit;

    if(ops.limit || this._ops.limit){
        trans = this._limitOperator(trans,_limit);
    }
    if((ops.use.singlePinch || this._ops.use.singlePinch) && (type == 'all' || type == 'pinch')){
        let singlePinchBtn = el.querySelector(`.mtouch-singleButton`);
        _.setStyle(singlePinchBtn,{
            transform:`scale(${1/trans.scale})`,
            webkitTransform:`scale(${1/trans.scale})`,
        });
    }
    if((ops.close || this._ops.close) && (type == 'all' || type == 'pinch')){
        let closeBtn = el.querySelector(`.mt-close-btn`);
        _.setStyle(closeBtn,{
            transform:`scale(${1/trans.scale})`,
            webkitTransform:`scale(${1/trans.scale})`,
        });
    }
    window.requestAnimFrame(()=>{
        _.setPos(el, trans);
    });
};
Touchkit.prototype._limitOperator = function(transform,limit) {
    // 实时获取操作元素的状态；
    let {minScale, maxScale} = limit;
    let operatorStatus,spaceX,spaceY,boundaryX,boundaryY,minX,minY,maxX,maxY;
    if (minScale && transform.scale < minScale){
        transform.scale = minScale;
    }
    if (maxScale && transform.scale > maxScale){
        transform.scale = maxScale;
    }
    operatorStatus = _.getOffset(this.operator);
    // 因缩放产生的间隔；
    spaceX = operatorStatus.width * (transform.scale - 1) / 2;
    spaceY = operatorStatus.height * (transform.scale - 1) / 2;
    // 参数设置的边界值；
    boundaryX = operatorStatus.width * transform.scale  * (limit.x);
    boundaryY = operatorStatus.height * transform.scale * (limit.y);
    // 4个边界状态；
    minX = spaceX - boundaryX;
    minY = spaceX - boundaryY;
    maxX = this.elStatus.width - operatorStatus.width * transform.scale + spaceX + boundaryX;
    maxY = this.elStatus.height - operatorStatus.height * transform.scale + spaceY + boundaryY;

    if(limit.x || limit.x == 0){
        if(transform.x >= maxX)transform.x = maxX;
        if(transform.x < minX)transform.x = minX;
    }
    if(limit.y || limit.y == 0){
        if(transform.y > maxY)transform.y = maxY;
        if(transform.y < minY)transform.y = minY;
    }
    return transform;
};
Touchkit.prototype.switch = function(el,addButton){
    if(!this.mt || this.freezed)return;
    if(el)el = _.getEl(el);
    _.forin(this._childs,(k,v)=>{
        if(v){
            _.removeClass(v.el,'mt-active');
        }
    });
    // 转换操作元素后，也需要重置 mtouch 中的单指缩放基本点 singleBasePoint;
    this.mt.switch(el,addButton);
    // 切换operator;
    this.operator = el;
    if(el){
        _.addClass(el,'mt-active');
        this._activeChild = el;
    }
    return this;
};

Touchkit.prototype._getOperatorOps = function(target){
    let _tar = target || this.operator;
    let index = _.data(_tar,'mt-index');
    if(this._childs[index]){
        return this._childs[index].ops;
    }
};

// 冻结手势容器，暂停所有操作，且失去焦点；
// 解冻后恢复最后状态；
Touchkit.prototype.freeze = function(boolean){
    if(boolean){
        _.forin(this._childs,(k,v)=>{
            if(v){
                _.removeClass(v.el,'mt-active');
            }
        });
    }else{
        _.addClass(this._activeChild,'mt-active');
    }
    this.freezed = boolean ? true:false;
    return this;
};

Touchkit.prototype.clear = function(){
    _.forin(this._childs,(k,v)=>{
        if(v && v.type == 'element'){
            _.remove(v.el);
            this._childs[k] = null;
        }
    });
    this._init(this._childs);
    return this;
};

// 重置所有状态到初始化阶段；
Touchkit.prototype.reset = function(){
    _.forin(this._childs,(k,v)=>{
        if(v){
            _.remove(v.el);
        }
    });
    this._init();
    return this;
};

// 销毁，但保持原有样式，失去焦点与事件绑定；
Touchkit.prototype.destory = function(){
    _.forin(this._childs,(k,v)=>{
        if(v){
            _.removeClass(v.el,'mt-active');
        }
    });
    this.mt && this.mt.destroy();
    this.mt = null;
};
// 参数加工函数；
// 兼容 5 种 value 值：
// x:250, x:'250px', x:'100%', x:'left:250',x:'center',
// width:100,width:'100px',width:'100%'
Touchkit.prototype._get = function(drection,str,par , child){
    let result = str;
    let k,_par,_child;
    if(document.body && document.body.clientWidth){
        k = drection == 'hor' ? 'clientWidth':'clientHeight';
    }else{
        k = drection == 'hor' ? 'offsetWidth' : 'offsetHeight';
    }
    _par = par || this.el[k];
    _child = child || (this.operator ? this.operator[k] : 0);
    if(typeof str === 'string'){
        if(_.include(str,':')){
            let arr = str.split(':');
            switch (arr[0]) {
                case 'left':
                case 'top':
                    result = +(arr[1].replace('px',''));
                    break;
                case 'right':
                case 'bottom':
                    result = _par - (+(arr[1].replace('px',''))) - _child;
                    break;
                default:
            }
        }else if (_.include(str,'px')) {
            result = (+str.replace('px', ''));
        } else if (_.include(str,'%')) {
            result = _par * (+str.replace('%', '')) / 100;
        }else if(str == 'center'){
            result = (_par-_child)/2;
        }else{
            result = +str;
        }
    }
    return result;
};

Touchkit.prototype.getChild = function(index){
    return this._childs[index] || null;
};

Touchkit.prototype._isAdd = function(el){
    let target = el;
    while(target !== this.el || target.tagName.toLowerCase() == 'body'){
        if(_.include(target.className,'mt-child') || _.include(target.className,'mt-background') || _.include(target.className,'mt-crop-box')){
            return true;
        }
        target = target.parentNode;
    }
    return false;
};

Touchkit.prototype._getSize = function(img){
    let iw,ih;
    if(img.tagName === 'IMG'){
        iw = img.naturalWidth;
        ih = img.naturalHeight;
    }else if(img.tagName === 'CANVAS'){
        iw = img.width;
        ih = img.height;
    }else{
        iw = img.offsetWidth;
        ih = img.offsetHeight;
    }
    return{iw,ih};
};

Touchkit.prototype._insertCss = function(){
    _.addCssRule('.mt-touch-box','-webkit-user-select: none;');
    _.addCssRule('.mtouch-singleButton','display: none;');
    _.addCssRule('.mt-child.mt-active','z-index: 99;outline:2px solid hsla(0,0%,100%,.5);');
    _.addCssRule('.mt-active .mtouch-singleButton,.mt-active .mt-close-btn','display: inline-block;');
    _.addCssRule('.mt-child','position:absolute;text-align:left;visibility:hidden;');
    _.addCssRule('.mt-image','width:100%;height:100%;position:absolute;left:0;top:0;text-align:left;');
    _.addCssRule('.mt-close-btn',`z-index:999;position:absolute;width:30px;height:30px;top:-15px;right:-15px;background-size:100%;display:none;background-image:url(${removeBtn})`);
    _.addCssRule('.mt-background','position:absolute;left:0;top:0;');
    _.addCssRule('.mt-crop-box','position:absolute;left:5px;top:5px;width:90%;height:90%;border:2px dashed #996699;box-sizing:border-box;z-index:20;');
    _.addCssRule('.mt-prevent','width:100%;height:100%;position:absolute;left:0;top:0;z-index:99;');
    return this;
};
