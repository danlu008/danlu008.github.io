let vertex = [];
vertex.push([0, 0, 0]);
vertex.push([0, 1, 0]);
vertex.push([-1, 1, 0]);
vertex.push([-1, -1, 0]);
vertex.push([0, -1, 0]);
vertex.push([1, -1, 0]);
vertex.push([1, 1, 0]);

let edge = [];
edge.push([0, 1]);
edge.push([0, 2]);
edge.push([0, 3]);
edge.push([0, 4]);
edge.push([0, 5]);
edge.push([0, 6]);

let boundary_edge = [];
boundary_edge.push([1, 2]);
boundary_edge.push([2, 3]);
boundary_edge.push([3, 4]);
boundary_edge.push([4, 5]);
boundary_edge.push([5, 6]);
boundary_edge.push([6, 1]);

let face = [];
face.push([0, 1, 2]);
face.push([0, 2, 3]);
face.push([0, 3, 4]);
face.push([0, 4, 5]);
face.push([0, 5, 6]);
face.push([0, 6, 1]);

let fold_assign = [];
fold_assign.push("M");
fold_assign.push("V");
fold_assign.push("V");
fold_assign.push("M");
fold_assign.push("V");
fold_assign.push("V");

let crease_pattern = {
    "vertex": vertex,
    "edge": edge,
    "boundary_edge": boundary_edge,
    "face": face,
    "fold_assign": fold_assign,
}

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    var data = 0;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                data = rawFile.responseText;
                // alert(allText);
            }
        }
    }
    rawFile.send(null);
    return data;
}

let data = readTextFile("data/A.svg");
// console.log(data)

let parser = new DOMParser();
let doc = parser.parseFromString(data, "image/svg+xml");
let svg = doc.firstChild;
document.getElementById("2D").appendChild(svg);

let list = svg.querySelectorAll("line");
console.log(list)
let mountain_fold = Array.from(list).filter(element => element.getAttribute("stroke") == "red");
let valley_fold = Array.from(list).filter(element => element.getAttribute("stroke") == "blue");
let free_fold = Array.from(list).filter(element => element.getAttribute("stroke") == "magenta");
let boundary = Array.from(list).filter(element => element.getAttribute("stroke") == "black");
// console.log(mountain_fold)
// console.log(valley_fold)
// console.log(free_fold)


let _vertex = [];
let _edge = [];
let _boundary_edge = [];
let _face = [];
let _fold_assign = [];

let width = 0;
let height = 0;
let x_list = [];
let y_list = [];
let center = {"x": 0, "y": 0};

// find center
for (let i = 0; i < boundary.length; i++) {
    let x1 = boundary[i].getAttribute("x1");
    let y1 = boundary[i].getAttribute("y1");
    let x2 = boundary[i].getAttribute("x2");
    let y2 = boundary[i].getAttribute("y2");
    x_list.push(x1);
    x_list.push(x2);
    y_list.push(y1);
    y_list.push(y2);

    let boundary_width = Math.abs(x2-x1);
    let boundary_height = Math.abs(y2-y1);
    width = Math.max(width, boundary_width);
    height = Math.max(height, boundary_height);
    console.log(width, height);
}
let sum = 0;
for(let i = 0; i < x_list.length; i++){
    sum += Number(x_list[i]);
}
center.x = sum/x_list.length;
sum = 0;
for(let i = 0; i < y_list.length; i++){
    sum += Number(y_list[i]);
}
center.y = sum/y_list.length;
console.log(center)

// boundary
for (let i = 0; i < boundary.length; i++) {
    let x1 = boundary[i].getAttribute("x1") - center.x;
    let y1 = boundary[i].getAttribute("y1") - center.y;
    let x2 = boundary[i].getAttribute("x2") - center.x;
    let y2 = boundary[i].getAttribute("y2") - center.y;
    let index1 = 0;
    let index2 = 0;
    console.log(x1, y1, x2, y2);
    if (!_vertex.find(element => element[0] == x1 && element[1] == y1)) {
        _vertex.push([x1, y1]);
    }
    if (!_vertex.find(element => element[0] == x2 && element[1] == y2)) {
        _vertex.push([x2, y2]);
    }
    index1 = _vertex.findIndex(element => element[0] == x1 && element[1] == y1);
    index2 = _vertex.findIndex(element => element[0] == x2 && element[1] == y2);
    _boundary_edge.push([index1, index2]);
}

// mountain fold
for (let i = 0; i < mountain_fold.length; i++) {
    console.log(mountain_fold[i].nodeName)
    let x1 = mountain_fold[i].getAttribute("x1") - center.x;
    let y1 = mountain_fold[i].getAttribute("y1") - center.y;
    let x2 = mountain_fold[i].getAttribute("x2") - center.x;
    let y2 = mountain_fold[i].getAttribute("y2") - center.y;
    let index1 = 0;
    let index2 = 0;
    console.log(x1, y1, x2, y2);
    if (!_vertex.find(element => element[0] == x1 && element[1] == y1)) {
        _vertex.push([x1, y1]);
    }
    if (!_vertex.find(element => element[0] == x2 && element[1] == y2)) {
        _vertex.push([x2, y2]);
    }
    index1 = _vertex.findIndex(element => element[0] == x1 && element[1] == y1);
    index2 = _vertex.findIndex(element => element[0] == x2 && element[1] == y2);
    _edge.push([index1, index2]);
    _fold_assign.push("M");
}

// valley fold
for (let i = 0; i < valley_fold.length; i++) {
    console.log(valley_fold[i].nodeName)
    let x1 = valley_fold[i].getAttribute("x1") - center.x;
    let y1 = valley_fold[i].getAttribute("y1") - center.y;
    let x2 = valley_fold[i].getAttribute("x2") - center.x;
    let y2 = valley_fold[i].getAttribute("y2") - center.y;
    let index1 = 0;
    let index2 = 0;
    console.log(x1, y1, x2, y2);
    if (!_vertex.find(element => element[0] == x1 && element[1] == y1)) {
        _vertex.push([x1, y1]);
    }
    if (!_vertex.find(element => element[0] == x2 && element[1] == y2)) {
        _vertex.push([x2, y2]);
    }
    index1 = _vertex.findIndex(element => element[0] == x1 && element[1] == y1);
    index2 = _vertex.findIndex(element => element[0] == x2 && element[1] == y2);
    _edge.push([index1, index2]);
    _fold_assign.push("V");
}

console.log(_vertex);
console.log(_edge);
console.log(_boundary_edge);
console.log(_face);
console.log(_fold_assign);