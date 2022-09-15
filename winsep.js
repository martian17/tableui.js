//enum axis
const VERTICAL = 0;
const HORIZONTAL = 1;
const AXIS_UNSET = 2;

const AXIS_STR = ["vertical","horizontal","axis_unset"];

const ORTHOGONAL = [HORIZONTAL,VERTICAL,AXIS_UNSET];

//enum direction
const LEFT = 0;
const RIGHT = 1;
const TOP = 2;
const BOTTOM = 3;
const DIR_UNSET = 4;

//maps from direction -> axis
const AXIS = [HORIZONTAL,HORIZONTAL,VERTICAL,VERTICAL,AXIS_UNSET];

//enum order
const FRONT = 0;
const BACK = 1;
const ORDER_UNSET = 2;

//map from direction -> order
const ORDER = [FRONT,BACK,FRONT,BACK,ORDER_UNSET];

let STYLE = "";

STYLE += /*css*/`
.section{
    position:relative;
    display:flex;
    background-color: #292937;
    overflow:hidden;
}
.section.horizontal{
    flex-direction: row;
}
.section.horizontal>div{
    height:100%;
}
.section.vertical{
    flex-direction: column;
}
.section.vertical>div{
    width:100%;
}

.section>.separator{
    background-color: #22212c;
    position:relative;
    transition:background-color .2s;
}
.section>.separator:hover{
    /*background-color:#444;*/
    background-color:/*#1c1b24*/#353344;
}

.section>.separator::after{
    content:"";
    background-color: #494a4f;
    position:absolute;
    border-radius:10px;
}

.section.horizontal>.separator{
    width:11px;
    cursor:col-resize;
}
.section.horizontal>.separator::after{
    width:4px;
    height:40%;
    left:3px;
    top:30%;
}
.section.vertical>.separator{
    height:11px;
    cursor:row-resize;
}
.section.vertical>.separator::after{
    width:40%;
    height:4px;
    left:30%;
    top:3px;
}
`;

let onDrag = function(elem,cb/*(move,end)*/,origin={rect:new DOMRect(0,0,0,0)}){
    elem.on("mousedown",(e)=>{
        e.preventDefault();
        let moveHandler,endHandler;
        let rect = origin.rect;
        let x = e.pageX-rect.x;
        let y = e.pageY-rect.y;
        cb(x,y,(cb)=>{
            moveHandler = cb;
        },(cb)=>{
            endHandler = cb;
        });
        let onmove = (e)=>{
            let rect = origin.rect;
            x = e.pageX-rect.x;
            y = e.pageY-rect.y;
            moveHandler(x,y);
        };
        let onend = (e)=>{
            window.removeEventListener("mousemove",onmove);
            window.removeEventListener("mouseup",onend);
            endHandler(x,y);
        }
        window.addEventListener("mousemove",onmove);
        window.addEventListener("mouseup",onend);
    });
}


class Separator extends ELEM{
    constructor(){
        super("div","class:separator");
        //wait for it to be appended
        setTimeout(this.registerEvents.bind(this),0);
    }
    registerEvents(){
        let that = this;
        let sepwidth = 11;
        onDrag(this,(x,y,move,end)=>{

            move((x,y)=>{
                let parent = that.parent;
                //calculate the target portion
                let sepcnt = 0;
                for(let c of parent.children.loopUntil(that)){
                    if(c instanceof Separator)sepcnt++;
                }
                let midportion;
                let rect = parent.rect;
                if(parent.axis === HORIZONTAL){
                    midportion = (x-5-sepwidth*sepcnt)/(rect.width-sepwidth*(parent.sectionCnt-1));
                }else{//vertical
                    midportion = (y-5-sepwidth*sepcnt)/(rect.height-sepwidth*(parent.sectionCnt-1));
                }
                if(midportion < 0)midportion = 0;
                if(midportion > 1)midportion = 1;
                let midportionR = 1-midportion;
                
                for(let c of parent.children.loopUntil(that)){
                    if(c instanceof Section){
                        if(midportion < c.portion){
                            c.portion = midportion;
                        }
                        midportion -= c.portion;
                    }
                }
                that.getPrev().portion += midportion;
                
                for(let c of parent.children.loopReverseUntil(that)){
                    if(c instanceof Section){
                        if(midportionR < c.portion){
                            c.portion = midportionR;
                        }
                        midportionR -= c.portion;
                    }
                }
                that.getNext().portion += midportionR;
                
                
                
                /*for(let c of parent.children.loopFrom(that)){
                    if(c instanceof Section){
                        if(midportion > c.portion){
                            midportion -= c.portion;
                            c.portion = 0;
                        }else if(midportion > 0){
                            c.portion -= midportion;
                            midportion = 0;
                            break;
                        }
                    }
                }*/
            });
            end((x,y)=>{
                
            });
        },this.parent);
    }
}

class Section extends ELEM{
    constructor(elem){
        super("div","class:section");
        if(elem)this.push_back(elem);
    }
    _axis = AXIS_UNSET;
    set axis(val){
        this.e.classList.remove(`${AXIS_STR[this._axis]}`);
        this.e.classList.add(`${AXIS_STR[val]}`);
        this._axis = val;
    }
    get axis(){
        return this._axis;
    }
    _portion = 1;
    set portion(n){
        this._portion = n;
        this.e.style.flex = n;
    }
    get portion(){
        return this._portion;
    }
    adjustPortionPreInsertion(elem){
        let sum = 0;
        let cnt = 0;
        for(let c of this.children.loop()){
            if(c instanceof Section){
                sum += c.portion;
                cnt++;
            }
        }
        for(let c of this.children.loop()){
            if(c instanceof Section){
                c.portion *= (1-1/(cnt+1))/sum;
            }
        }
        elem.portion = 1/(cnt+1);
    }
    adjustPortionPostRemoval(){
        let sum = 0;
        let cnt = 0;
        for(let c of this.children.loop()){
            if(c instanceof Section){
                sum += c.portion;
                cnt++;
            }
        }
        for(let c of this.children.loop()){
            if(c instanceof Section){
                elem.portion *= 1/(sum);
            }
        }
    }
    
    
    //insert and remove section methods abstract away the partition and portion calculation
    insertSection_front(elem){
        this.adjustPortionPreInsertion(elem);
        if(this.children.getHead() instanceof Section)
            this.push_front(new Separator);
        this.push_front(elem);
        return elem;
    }
    insertSection_back(elem){
        this.adjustPortionPreInsertion(elem);
        if(this.children.getTail() instanceof Section)
            this.push_back(new Separator);
        this.push_back(elem);
        return elem;
    }
    insertSection_before(c1,c2){
        this.adjustPortionPreInsertion(c1);
        this.insertBefore(c1,c2);
        this.insertBefore(new Separator,c2);
        return c1;
    }
    insertSection_after(c1,c2){
        this.adjustPortionPreInsertion(c2);
        this.insertAfter(c1,c2);
        this.insertAfter(c1,new Separator);
        return c2;
    }
    
    
    removeSection(elem){
        if(elem.getPrev() instanceof Separator){
            this.removeChild(elem.getPrev());
        }else if(elem.getNext() instanceof Separator){
            this.removeChild(elem.getNext());
        }
        this.adjustPortionPostRemoval();
        
        if(this.sectionCnt === 1){
            //unwrap child
            let child = this.children.getHead();
            if(child instanceof Section){
                this.moveChildrenFrom(child);
                this.removeChild(child);
            }
        }
        if(this.sectionCnt === 0 && this.parent instanceof Section){
            this.parent.removeSection(this);
        }
    }
    //end insert and remove section methods
    
    
    //I wish I could do compile time multiplexing
    insertDirection(dir,elem){//insert top,left,right,etc
        let axis = AXIS[dir];
        let order = ORDER[dir];
        let section;
        if(elem instanceof Section){
            section = elem;
        }else{
            section = new Section(elem);
        }
        
        if(this.parent instanceof Section && this.parent.axis === axis){
            //bubble up to the parent
            if(order === FRONT){
                this.parent.insertSection_before(section,this);
            }else{//back
                this.parent.insertSection_after(this,section);
            }
        }else if(this.axis === axis){
            if(order === FRONT){
                this.insertSection_front(section);
            }else{//order back
                this.insertSection_back(section);
            }
        }else{//this.axis unset or orthogonal
            if(this.sectionCnt === 0){
                this.push_back(elem);
            }else{
                //group all children and move to the sub node
                let sub = new Section().moveChildrenFrom(this);
                this.add(sub);
                if(order === FRONT){
                    this.push_front(sub).portion = 0.5;
                    this.push_front(new Separator);
                    this.push_front(section).portion = 0.5;
                }else{//order back
                    this.push_back(sub).portion = 0.5;
                    this.push_back(new Separator);
                    this.push_back(section).portion = 0.5;
                }
                if(this.sectionCnt > 1)this.axis = axis;
            }
        }
        return elem;
    }
    moveChildrenFrom(section){//move children from section to this
        this.axis = section.axis;
        section.axis = AXIS_UNSET;
        for(let c of section.children.loop()){
            this.push_back(c);
        }
        return this;
    }
    get sectionCnt(){
        return Math.floor((this.children.size+1)/2);
    }
    *loopSections(){
        for(let c of this.children.loop()){
            if(c instanceof Section){
                yield c;
            }
        }
    }
    *loopSeparators(){
        for(let c of this.children.loop()){
            if(c instanceof Separator){
                yield c;
            }
        }
    }
};

{
    let s = document.createElement("style");
    s.innerHTML = STYLE;
    document.body.appendChild(s);
}