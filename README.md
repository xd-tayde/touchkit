# Touchkit.js

[Example](http://f2er.meitu.com/gxd/touchkit/example/index.html)   

[Git](https://github.com/xd-tayde/touchkit)

[Download](https://github.com/xd-tayde/touchkit/blob/master/dist/touchkit.min.js)

## Introduction

This toolkit is built on `mtouch.js` and `mcanvas.js`. Use it, you can build a gesture project quickly and get a image automatically. concerned less and do more!

## Basic Usage

The idea of touchkit is that init create a touch box firstly, and then use `tk.add()` add the background and touch-element into the touch box, finally, export a composite image by `tk.exportImage()`. The image is what you see in touch box.

the simple example, see the document for more details

```js
// init create touch box
new Touchkit('.js-par')

// add background image
// type: contain/crop
// the background-image will place at the bottom of touch-box
.background({
    image:'./images/p2.jpg',
    type:'contain',
})

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

// export a image contain all elements what you see in touch box
.exportImage(b64=>{
   console.log(b64);
})
```

## document

[Engligh](https://github.com/xd-tayde/touchkit/blob/master/README_EN.md) | [中文版](https://github.com/xd-tayde/touchkit/blob/master/README_ZH.md)


## License

[MIT](https://opensource.org/licenses/MIT)
