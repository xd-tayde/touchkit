# Document

## init create

**`new Touchkit(ops)`**

init create the touch-box.

params:

	ops:{
		el: touch-box element
     		type: String || HTMLElement; required;

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
     	// optional;
		// global use switch;
		// it will open all touch-element all gesture while ignore the `tk.add()` 's use option.
	    use:{
	    	drag:boolean,
	    	pinch:boolean,
	    	rotate:boolean,
	    	singlePinch:boolean,
	    	singleRotate:boolean,
	    },

	    // global limit option;optional;
	    // x/y ：the ratio that touch-element can out of the box , range = element's width * x;
	    limit:{
	        x:Number,
	        y:Number,
	        maxScale:Number,
	        minScale:Number,
	    } || boolean,

	    // add close btn on touch element;
	    close:boolean,
	}

## api

### 1、`tk.background(bg)`:

add the background image of touch box;

bg: type : Object ; required ;

params:

```js
bg : {
    // background-image，type: url/HTMLImageElement/HTMLCanvasElement; required;
    image:'' ,

    // type: crop / contain， optional;
    	//  the image will covered with the canvas, can control crop by left and top; and you can drag the background-image.
		// contain : the same as background-size:contain; can control postion by left and top;
		// contain模式无法操作底图，而crop模式可进行拖动裁剪的操作；
    type:'contain',

    // optional;
    // the offset from the upper left point of touch box
    left:0,
    top:0,
};
```

### 2、`tk.add(ops)` || `tk.add(opsArr)`:

add the touch-element into touch box;

params：

```js
ops:{
	image:'',

	// the width of added touch ele, and it will has auto height based on the image;
	// example : width:100 / 100px / 100%;
	width:'',

	// the position of touch ele in touch box;
	// 	example : x : 100 / '100px' / '100%' / 'left:100'/ 'right:100';
	pos:{
	    x:0,
	    y:0,
	    scale:1,
	    rotate:0,
	},

	// the use switch of single element;
	// use:'all' : open all gesture;
	use:{
	    drag:false,
	    pinch:false,
	    rotate:false,
	    singlePinch:false,
	    singleRotate:false,
	},

	// limit params;
	limit:object || boolean,

	// add close btn on touch element;
	close:boolean,
};
```

### 3、`tk.exportImage(fn，cropOps)`

export a composite image that is what you see in touch box.

params:

    // the callback , it will get the base64
	fn : function

    // crop option , it can crop the result image directly.
    cropOps: {
        x:0,
        y:0,

        // example : width:100 / '100px' / '100%'
        width:'100%',
        height:'100%'
    };

### 4、`tk.switch(el)`

switch the operator of touch box, it will get the focus and can be  operated.

params:

	el: string || HTMLElement
		can switch on added touch element;

### 5、`tk.freeze(boolean)`

`tk.freeze(true)`: freeze the touch-box, all element will lose the foucs and no-operate .

`tk.freeze(false)`: thaw the touch-box , it will reset to the moment before freeze.

### 6、`tk.reset()`

init touch-box, there will be no background and no touch-element.


### 7、`tk.destory()`

destory the touch-box , unbind all gesture event , but maintain all element's style of box.

### 8、`tk.cropBox()`

add a corp box that can operate to crop the image.

### 9、`tk.clear()`

remove all touch-element except the background-image and cropBox;

### 10、`tk.getChild(index)`

get touch-element option;
params：
    index: the index of touch-element,
		   the value of dom's `data-mt-index`;
