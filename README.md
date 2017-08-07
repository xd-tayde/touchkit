# 手势操作工具包 Touchkit.js

[Example](http://f2er.meitu.com/gxd/touchkit/example/index.html)   

[Git](https://gitlab.meitu.com/npm/meitu-touchkit)

[Download](http://f2er.meitu.com/gxd/touchkit/dist/touchkit.min.js)

## Introduction

该工具包是基于`mtouch.js`的上层封装，比较具有针对性，类似于一些需要手势操作型的项目，一键绑定事件，同时也基于`mcanvas.js`一键合成图片，内部封装复杂的各种逻辑和计算，尽量让业务方关注更少的东西。

## Change Log

- 1.0.1(8.4)
    - 增加全局配置参数；
    - 修改add函数为可传入数组，一次添加多个；
    - 完善文档；

- 1.0.0(8.3)
    - 初步完成基础性的功能点，希望大家多提issue，逐步完善。

## Basic Usage

使用了类似于`mcanvas`的设计理念，初始化创建一个手势盒子，然后通过`add`往盒子内部添加背景和可操作的手势元素，最后通过`exportImage`直接导出一张合成图片，所见即所得；

下面是简单用例，更多配置项详见`api`部分：

```js
// 初始化创建手势盒子
// init create touch box
new Touchkit('.js-par')

// 添加背景
// 背景包含两种模式：contain/crop；
// 背景会处于手势盒子的底部，crop模式会可移动进行选择裁剪，不支持缩放旋转焦点等功能；
// add background image
.background({
    image:'./images/p2.jpg',
})

// 添加可操作元素
// add operable element to touch box
.add({
    image:`images/ear.png`,
    width:'100px',
    use:{
        drag:true,
        pinch:true,
        rotate:true,
        singlePinch:true,
        singleRotate:true,
    },
    pos:{
        x:116,
        y:45,
        scale:1.25,
        rotate:2.63,
    },
}).add({
    image:`images/neck.png`,
    width:100,
    limit:true,
    close:true,
    use:{
        drag:true,
        pinch:true,
        rotate:true,
        singlePinch:true,
        singleRotate:true,
    },
    pos:{
        x:0,
        y:0,
        scale:1,
        rotate:0,
    },
})

// 一键导出合成图；
// export a image contain all elements what you see in touch box
.exportImage(b64=>{
	console.log(b64);
})
```


## 创建实例(init create)

**`new Touchkit(ops)`**

初始化创建手势盒子。

params:

	ops:{
		el: 手势盒子(touch box)
     		type: String || HTMLElement; required;

     	// 可监听的事件,可选;
     	// all listener,optional;
     	event:{
     		touchstart(){},
     		touchmove(){},
     		touchend(){},
     		dragstart(){},
     		drag(){},
     		dragend(){},
     		pinchstart(){},
     		pinch(){},
     		pinchend(){},
     		rotatestart(){},
     		rotate(){},
     		rotatend(){},
     		singlePinchstart(){},
     		singlePinch(){},
     		singlePinchend(){},
     		singleRotatestart(){},
     		singleRotate(){},
     		singleRotatend(){},
     	}，
     	// 全局配置使用开关；优先使用添加元素时的配置；optional;
		// global use;
	    use:{
	    	drag:boolean,
	    	pinch:boolean,
	    	rotate:boolean,
	    	singlePinch:boolean,
	    	singleRotate:boolean,
	    },

	    // 全局限制参数；optional;
	    // x/y ：可超出系数，代表可超出的范围 = 元素宽高 * 超出系数
	    // global limit;
	    limit:{
	        x:Number,
	        y:Number,
	        maxScale:Number,
	        minScale:Number,
	    } || boolean,

	    // 是否为手势元素添加删除按钮；
	    // add close btn on touch element;
	    close:boolean,
	}

## api

### 1、`tk.background(bg)`:

添加手势盒子的背景图；

bg: type : Object ; required ;

params:

```js
bg : {
    // 背景图片，type: url/HTMLImageElement/HTMLCanvasElement; required;
    image:'' ,

    // 绘制方式: crop / contain， optional;
    	// crop : 裁剪模式，背景图自适应铺满画布，多余部分裁剪；
		// contain : 包含模式, 类似于 background-size:contain; 可通过left/top值进行位置的控制；
		// contain模式无法操作底图，而crop模式可进行拖动裁剪的操作；
    type:'contain',

    // 背景图片距离画布左上角的距离;
    // optional;
    // the offset from the upper left point of touch box
    left:0,
    top:0,
};
```

### 2、`tk.add(ops)` || `tk.add(opsArr)`:

添加手势元素，可单对象或者数组传入，添加单个或者多个素材；

params：

```js
ops:{
	image:'',

	// 手势元素的宽度，会根据图片自适应高度；
	// the width of added touch ele, and it will has auto height based on the image;
	// example : width:100 / 100px / 100%;
	width:'',

	// 手势元素的位置参数；
	// the position of touch ele in touch box;
	// 	example : x : 100 / '100px' / '100%' / 'left:100'/ 'right:100';
	pos:{
	    x:0,
	    y:0,
	    scale:1,
	    rotate:0,
	},

	// 以下配置与初始化Init时参数一致，手势元素上的配置优先级高于手势盒子；
	use:{
	    drag:false,
	    pinch:false,
	    rotate:false,
	    singlePinch:false,
	    singleRotate:false,
	},
	limit:object || boolean,
	close:boolean,
};
```

### 3、`tk.exportImage(fn)`

一键导出合成图，包含手势盒子中的背景和所有手势元素；

params:

	fn : function , 导出图片后的回调函数, 接受base64格式的结果图；

### 4、`tk.switch(el)`

切换手势元素，使其具有焦点，并可操作；

params:

	el: string || HTMLElement
		可切换至任意已添加的手势元素上

### 5、`tk.freeze(boolean)`

`tk.freeze(true)`: 冻结手势盒子，所有手势元素失去焦点，且无法操作；

`tk.freeze(false)`: 解冻手势盒子,恢复至冻结前的状态；

### 6、`tk.reset()`

初始化手势盒子，类似于刚创建时的状态，无背景无手势元素；

### 7、`tk.destory()`

销毁手势盒子，保持样式，但失去焦点，且解绑所有事件；
