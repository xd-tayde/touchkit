let sheet;
export default {
    setPos(el, transform) {
        let str = JSON.stringify(transform);
        let value = `translate3d(${transform.x}px,${transform.y}px,0px) scale(${transform.scale}) rotate(${transform.rotate}deg)`;
        el = this.getEl(el);
        el.style.transform = value;
        el.style.webkitTransform = value;
        el.setAttribute('data-mtouch-status', str);
    },
    getPos(el) {
        if(!el)return;
        let defaulTrans;
        let style = window.getComputedStyle(el,null);
        let cssTrans = style.transform || style.webkitTransform;

        if(window.getComputedStyle && cssTrans !== 'none'){
            defaulTrans = this.matrixTo(cssTrans);
        }else{
            defaulTrans = {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
            };
        }
        return JSON.parse(el.getAttribute('data-mtouch-status')) || defaulTrans;
    },
    extend(obj1, obj2) {
        for (let k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                if(typeof obj2[k] == 'object' && !(obj2[k] instanceof Node)){
                    if(typeof obj1[k] !== 'object' || obj1[k] === null){
                        obj1[k] = {};
                    }
                    this.extend(obj1[k],obj2[k]);
                }else{
                    obj1[k] = obj2[k];
                }
            }
        }
        return obj1;
    },
    getOffset(el){
        el = this.getEl(el);
        let offset = {};
        offset.width = el.offsetWidth;
        offset.height = el.offsetHeight;
        return offset;
    },
    matrixTo(matrix){
        // 解析 matrix 字符串，分割成数组；
        let arr = (matrix.replace('matrix(','').replace(')','')).split(',');
        // 根据不等式计算出 rotate 和 scale；
        let cos = arr[0],
            sin = arr[1],
            tan = sin/cos,
            rotate = Math.atan(tan)*180/Math.PI,
            scale = cos/(Math.cos(Math.PI/180*rotate)),
            trans;
        // 传入翻译后的各项参数；
        trans = {
            x:parseInt(arr[4]),
            y:parseInt(arr[5]),
            scale,
            rotate,
        };
        return trans;
    },
    domify(DOMString) {
        let htmlDoc = document.implementation.createHTMLDocument();
        htmlDoc.body.innerHTML = DOMString;
        return htmlDoc.body.children;
    },
    getEl(el){
        if(!el){
            console.error('el error,there must be a el!');
            return;
        }
        let _el;
        if(typeof el == 'string'){
            _el = document.querySelector(el);
        }else if(el instanceof Node){
            _el = el;
        }else{
            console.error('el error,there must be a el!');
            return;
        }
        return _el;
    },
    addClass(el,cls){
        let _cls;
        el = this.getEl(el);
        _cls = this.trim(el.className) || '';
        if(_cls.indexOf(cls) == -1){
            if(_cls.length == 0){
                el.className = cls;
            }else{
                el.className = _cls + ` ${cls}`;
            }
        }
    },
    trim(str){
        if(typeof str == 'string'){
            return str.replace(/(^\s*)|(\s*$)/g, '');
        }
    },
    removeClass(el,cls){
        let _cls;
        el = this.getEl(el);
        _cls = el.className || '';
        if(_cls.indexOf(cls) !== -1){
            el.className = _cls.replace(new RegExp(cls, 'g'),'');
        }
    },
    hasClass(el,cls){
        el = this.getEl(el);
        return el.className.indexOf(cls) !== -1;
    },
    forin(obj,cbk){
        for(let k in obj){
            if(obj.hasOwnProperty(k)){
                cbk(k,obj[k]);
            }
        }
    },
    data(el,key){
        el = this.getEl(el);
        return el.getAttribute(`data-${key}`);
    },
    include(str1,str2){
        if(str1.indexOf){
            return str1.indexOf(str2) !== -1;
        }else{
            return false;
        }
    },
    delegate(par,evName,child,fn = ()=>{}){
        let _par = this.getEl(par);
        _par.addEventListener(evName,ev=>{
            let target = ev.target;
            while(target !== _par ){
                if(child.indexOf('.') == 0){
                    if(this.include(target.className,child.substring(1))){
                        ev.delegateTarget = target;
                        fn.bind(target)(ev);
                        break;
                    }
                }else if(child.indexOf('#') == 0){
                    if(target.id == child.substring(1)){
                        ev.delegateTarget = target;
                        fn.bind(target)(ev);
                        break;
                    }
                }else{
                    if(target.tagName.toLowerCase() == child){
                        ev.delegateTarget = target;
                        fn.bind(target)(ev);
                        break;
                    }
                }
                target = target.parentNode;
            }
        });
    },
    addCssRule(selector, rules){
        if(!sheet){
            sheet = createStyleSheet();
        }
        sheet.insertRule(`${selector}{${rules}}`,sheet.rules.length);
    },
    remove(el){
        let _par = el.parentNode || el.parentElement;
        _par.removeChild(el);
    },
    loadImage(image, success, error) {
        let img = new Image();
        let loaded = false;
        if(image.indexOf('http') == 0){
            img.crossOrigin = '*';
        }
        img.onload = () => {
            if(!loaded){
                loaded = true;
                success(img);
            }
        };
        img.onerror = () => {
            error('img load error');
        };
        img.src = image;
    },
    getImage(image,cbk){
        if(typeof image == 'string'){
            this.loadImage(image, img => {
                cbk(img);
            },err=>{
                console.log(err);
            });
        }else if(typeof image == 'object' && image instanceof Node){
            cbk(image);
        }else{
            console.log('add image error');
            return;
        }
    },
};

function createStyleSheet() {
    let style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    return style.sheet;
}
