vertex = [];
vertex.push([0, 0, 0]);
vertex.push([0, 1, 0]);
vertex.push([-1, 1, 0]);
vertex.push([-1, -1, 0]);
vertex.push([0, -1, 0]);
vertex.push([1, -1, 0]);
vertex.push([1, 1, 0]);

edge = [];
edge.push([0, 1]);
edge.push([0, 2]);
edge.push([0, 3]);
edge.push([0, 4]);
edge.push([0, 5]);
edge.push([0, 6]);

boundary_edge = [];
boundary_edge.push([1, 2]);
boundary_edge.push([2, 3]);
boundary_edge.push([3, 4]);
boundary_edge.push([4, 5]);
boundary_edge.push([5, 6]);
boundary_edge.push([6, 1]);

face = [];
face.push([0, 1, 2]);
face.push([0, 2, 3]);
face.push([0, 3, 4]);
face.push([0, 4, 5]);
face.push([0, 5, 6]);
face.push([0, 6, 1]);

fold_assign = [];
fold_assign.push("M");
fold_assign.push("V");
fold_assign.push("V");
fold_assign.push("M");
fold_assign.push("V");
fold_assign.push("V");

crease_pattern = {
    "vertex": vertex,
    "edge": edge,
    "boundary_edge": boundary_edge,
    "face": face,
    "fold_assign": fold_assign,
}