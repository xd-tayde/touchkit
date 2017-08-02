// 素材层级管理系统；
import _ from './utils';
export default class ZIndex {
    constructor(config) {
        this.config = {
            'min': 50,
            'max': 100,
        };
        this.config = _.extend(this.config, config);
        this.topIndex = this.config.min;
        this.zIndexArr = [];
    }
    init(){
        this.zIndexArr = [];
        this.topIndex = this.config.min;
    }
    setIndex(id) {
        this.zIndexArr.push(id);
        if (this.topIndex > this.config.max) {
            this.resetIndex();
        } else {
            let el = document.querySelector(`#${id}`);
            el.style.zIndex = this.topIndex;
            this.topIndex++;
        }
    }
    removeIndex(id) {
        this.zIndexArr.forEach((value, index, arr) => {
            if (value == id) {
                arr.splice(index, 1);
            }
        });
    }
    resetIndex() {
        this.zIndexArr.forEach((id, index) => {
            let el = document.querySelector(`#${id}`);
            el.style.zIndex = this.config.min+index;
        });
        this.topIndex = this.zIndexArr.length + this.config.min;
    }
    toTop(id) {
        if (id !== this.zIndexArr[this.zIndexArr.length - 1]) {
            this.removeIndex(id);
            this.setIndex(id);
        }
    }
}
