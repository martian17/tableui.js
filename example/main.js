let body = new ELEM(document.body);

let section = body.add(new Section());
section.style("height:100vh");

class Iframe extends ELEM{
    constructor(url){
        super("iframe");//by default this will expand 100%
        this.attr("src",url);
    }
}
/*
let a = section.insertDirection(RIGHT,new Iframe("https://www.w3schools.com/html/"));
let b = section.insertDirection(RIGHT,new Iframe("https://www.google.com?output=embed"));
let c = section.insertDirection(RIGHT,new Iframe("https://www.youtube.com/"));
let d = section.insertDirection(BOTTOM,new Iframe("https://www.github.com/"));
*/


class Something extends ELEM{
    constructor(){
        super("div",0,0,`background:linear-gradient(${Math.floor(Math.random()*360)}deg, #2d238a, #2bbbd6);width:100%;height:100%;`);
        //super("div");
    }
}


let a = section.insertDirection(RIGHT,new Something);
let aa = a.parent.insertDirection(BOTTOM,new Something);
let aaa = aa.parent.insertDirection(RIGHT,new Something);
aa.parent.insertDirection(RIGHT,new Something);
aa.parent.insertDirection(RIGHT,new Something);
aa.parent.insertDirection(RIGHT,new Something);
aa.parent.insertDirection(RIGHT,new Something);
aa.parent.insertDirection(RIGHT,new Something);
let b = section.insertDirection(RIGHT,new Something);
let c = section.insertDirection(RIGHT,new Something);
let d = section.insertDirection(RIGHT,new Something);
let e = section.insertDirection(BOTTOM,new Something);
let f = e.parent.insertDirection(RIGHT,new Something);
let g = f.parent.insertDirection(BOTTOM,new Something);
f.parent.insertDirection(RIGHT,new Something);
f.parent.insertDirection(RIGHT,new Something);
f.parent.insertDirection(RIGHT,new Something);
f.parent.insertDirection(RIGHT,new Something);
f.parent.insertDirection(RIGHT,new Something);
f.parent.insertDirection(RIGHT,new Something);
f.parent.insertDirection(RIGHT,new Something);