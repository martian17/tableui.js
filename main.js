let body = new ELEM(document.body);

let section = body.add(new Section());
section.style("height:100vh");

class Iframe extends ELEM{
    constructor(url){
        super("iframe");//by default this will expand 100%
        this.attr("src",url);
    }
}

let a = section.insertDirection(RIGHT,new Iframe("https://www.w3schools.com/html/"));
let b = section.insertDirection(RIGHT,new Iframe("https://www.google.com?output=embed"));
let c = section.insertDirection(RIGHT,new Iframe("https://www.youtube.com/"));
let d = section.insertDirection(BOTTOM,new Iframe("https://www.github.com/"));
