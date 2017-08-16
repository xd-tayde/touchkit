import Touchkit from '../src/index';

let w = $(window).width();

$('.item').css({
    width:w+'px',
    height:(w+100)+'px',
});

if(!isMobile()){
    $('.js-mask').show();
}

let Tk = new Touchkit({
    el:'.js-par',
    limit:{
        x:0.5,
        y:0.5,
        maxScale:3,
        minScale:0.4,
    },
});
Tk.background({
    image:'./images/p3.jpg',
    type:'contain',
    // top:150,
    // static:true,
    success(){},
}).add({
    image:`images/ear.png`,
    width:'100px',
    use:'all',
    limit:true,
    pos:{
        x:116,
        y:45,
        scale:1.25,
        rotate:2.63,
    },
    close:true,
    success(){},
}).add({
    image:`images/neck.png`,
    width:100,
    use:'all',
    limit:true,
    pos:{
        x:0,
        y:0,
        scale:1,
        rotate:0,
    },
    close:true,
    success(){},
});

$('.js-cropBox').on('click',function(){
    Tk.cropBox();
    // Tk.clear();
});

$('.js-export').on('click',function(){
    Tk.exportImage(b64=>{
        $('.js-result').show();
        $('.js-result img').attr('src',b64);
    });
});
$('.js-result').on('click',function(){
    $('.js-result img').attr('src','');
    $(this).hide();
});
$('.Button').on('touchstart',function(){
    $(this).addClass('taped');
});
$('.Button').on('touchend',function(){
    $(this).removeClass('taped');
});

function isMobile() {
   if( navigator.userAgent.match(/Android/i)
   || navigator.userAgent.match(/webOS/i)
   || navigator.userAgent.match(/iPhone/i)
   || navigator.userAgent.match(/iPad/i)
   || navigator.userAgent.match(/iPod/i)
   || navigator.userAgent.match(/BlackBerry/i)
   || navigator.userAgent.match(/Windows Phone/i)
   ){
       return true;
   }
   else {
       return false;
   }
}
