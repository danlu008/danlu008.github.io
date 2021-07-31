class Fold {
    constructor(origami_structure) {
        this.mass = 1;
        this.EA = 20;
        this.omega = Math.sqrt(this.EA/this.mass);
        this.time_step = 1 / (2*Math.PI*this.omega)*2;
        // console.log(this.time_step)
        this.origami_structure = origami_structure;
        this.velocity = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        this.displacement = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        this.axial_error = this.compute_axial_error(origami_structure);
        this.crease_error = this.compute_crease_error(origami_structure, 0);
    }

    compute_displacement(fold_angle_target) {
        let origami_structure = this.origami_structure;
        this.velocity = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        this.displacement = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        this.axial_error = this.compute_axial_error(origami_structure);
        this.crease_error = this.compute_crease_error(origami_structure, fold_angle_target);
        // console.log("error: ", this.axial_error, this.crease_error)
        // while (this.error*100 > 0.1 || this.crease_error*100 > 0.1) {
        let force = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        let acceleration = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        let vertex_axial_force = this.compute_axial_force(origami_structure);
        let crease_force = this.compute_crease_force(origami_structure, fold_angle_target);

        for (let v in origami_structure.vertex) {
            force[v] = Linear_Algebra.add(force[v], vertex_axial_force[v]);
            force[v] = Linear_Algebra.add(force[v], crease_force[v]);
            acceleration[v] = Linear_Algebra.divide(force[v], this.mass);
            this.velocity[v] = Linear_Algebra.add(this.velocity[v], Linear_Algebra.multiply(acceleration[v], this.time_step));
            this.displacement[v] = Linear_Algebra.add(this.displacement[v], Linear_Algebra.multiply(this.velocity[v], this.time_step));
        }
        for(let v in origami_structure.vertex) {
            origami_structure.vertex[v] = Linear_Algebra.add(origami_structure.vertex[v], this.displacement[v]);
            origami_structure.update_dihedral_angle();
            // console.log(origami_structure.normal)
        }
        this.axial_error = this.compute_axial_error(origami_structure);
        this.crease_error = this.compute_crease_error(origami_structure, fold_angle_target);
    }

    compute_axial_force(origami_structure) {
        let vertex_axial_force = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        let EDGE = [origami_structure.edge, origami_structure.boundary_edge];
        for (let E in EDGE) {
            let edge = EDGE[E];
            for (let e in edge) {
                let [v1, v2] = edge[e].vertex_ID;
                let current_length = compute_length(edge[e].position[0], edge[e].position[1]);
                let origin_length = edge[e].edge_length;
                // if (e == 0) {
                //     console.log("current_length: ", current_length)
                //     console.log("origin_length: ", origin_length)
                // }
                let k_axial = this.EA/origin_length;
                let I = Linear_Algebra.normalize(Linear_Algebra.subtract(edge[e].position[0], edge[e].position[1]));
                let PD_v1 = Linear_Algebra.multiply(I, -1);
                let PD_v2 = Linear_Algebra.multiply(I, 1);
                vertex_axial_force[v1] = Linear_Algebra.add(vertex_axial_force[v1], Linear_Algebra.multiply(PD_v1, (-1) * k_axial * (current_length - origin_length)));
                vertex_axial_force[v2] = Linear_Algebra.add(vertex_axial_force[v2], Linear_Algebra.multiply(PD_v2, (-1) * k_axial * (current_length - origin_length)));
            }
        }
        return vertex_axial_force;
    }

    compute_crease_force(origami_structure, fold_angle_target) {
        let vertex_crease_force = new Array(origami_structure.vertex.length).fill([0, 0, 0]);
        let k_fold = 5;
        let k_facet = 0.5;
        let normal = origami_structure.normal;
        for (let e in origami_structure.edge) {
            let dihedral_angle = origami_structure.edge[e].dihedral_angle;
            let dihedral_angle_target = 0;
            let k_crease = k_fold*origami_structure.edge[e].edge_length;
            if (origami_structure.edge[e].fold_assign == "V") {
                dihedral_angle_target = 1 * fold_angle_target;
            }

            if (origami_structure.edge[e].fold_assign == "M") {
                dihedral_angle_target = (-1) * fold_angle_target;
            }

            if (origami_structure.edge[e].fold_assign == "F") {
                k_crease = 0;
                dihedral_angle_target = 0;
                // dihedral_angle_target = 1 * fold_angle_target;
            }

            // if (e == 0) {
            //     console.log("dihedral_angle: ", dihedral_angle)
            //     console.log("dihedral_angle_target: ", dihedral_angle_target)
            // }
            let [v1, v2] = origami_structure.edge[e].adjacent_vertex_ID;
            let [v3, v4] = origami_structure.edge[e].vertex_ID;
            let [f1, f2] = origami_structure.edge[e].adjacent_face_ID;

            let PD_v1 = Linear_Algebra.divide(normal[f1], 2*origami_structure.face[f1].area/origami_structure.edge[e].edge_length);
            let PD_v2 = Linear_Algebra.divide(normal[f2], 2*origami_structure.face[f2].area/origami_structure.edge[e].edge_length);

            vertex_crease_force[v1] = Linear_Algebra.add(vertex_crease_force[v1], Linear_Algebra.multiply(PD_v1, (-1) * k_crease * reduceAngle(dihedral_angle - dihedral_angle_target)));
            vertex_crease_force[v2] = Linear_Algebra.add(vertex_crease_force[v2], Linear_Algebra.multiply(PD_v2, (-1) * k_crease * reduceAngle(dihedral_angle - dihedral_angle_target)));
            // console.log(reduceAngle(dihedral_angle - dihedral_angle_target))
            let angle_v3_f1 = compute_angle(origami_structure.vertex[v3], origami_structure.vertex[v4], origami_structure.vertex[v1]);
            let angle_v4_f1 = compute_angle(origami_structure.vertex[v4], origami_structure.vertex[v3], origami_structure.vertex[v1]);
            let angle_v3_f2 = compute_angle(origami_structure.vertex[v3], origami_structure.vertex[v4], origami_structure.vertex[v2]);
            let angle_v4_f2 = compute_angle(origami_structure.vertex[v4], origami_structure.vertex[v3], origami_structure.vertex[v2]);
            // console.log(f1, 'angle_v3_f1, angle_v4_f1: ', angle_v3_f1, angle_v4_f1)
            // console.log(f2, 'angle_v3_f2, angle_v4_f2: ', angle_v3_f2, angle_v4_f2)
            let PD_v3 = Linear_Algebra.add(Linear_Algebra.multiply(PD_v1, -cotan(angle_v4_f1) / (cotan(angle_v3_f1) + cotan(angle_v4_f1))), Linear_Algebra.multiply(PD_v2, -cotan(angle_v4_f2) / (cotan(angle_v3_f2) + cotan(angle_v4_f2))));
            let PD_v4 = Linear_Algebra.add(Linear_Algebra.multiply(PD_v1, -cotan(angle_v3_f1) / (cotan(angle_v3_f1) + cotan(angle_v4_f1))), Linear_Algebra.multiply(PD_v2, -cotan(angle_v3_f2) / (cotan(angle_v3_f2) + cotan(angle_v4_f2))));
            // console.log('PD_v3, PD_v4: ', PD_v3, PD_v4)
            vertex_crease_force[v3] = Linear_Algebra.add(vertex_crease_force[v3], Linear_Algebra.multiply(PD_v3, (-1) * k_crease * reduceAngle(dihedral_angle - dihedral_angle_target)));
            vertex_crease_force[v4] = Linear_Algebra.add(vertex_crease_force[v4], Linear_Algebra.multiply(PD_v4, (-1) * k_crease * reduceAngle(dihedral_angle - dihedral_angle_target)));
        }
        return vertex_crease_force
    }

    compute_axial_error(origami_structure) {
        let error = 0;
        let EDGE = [origami_structure.edge, origami_structure.boundary_edge];
        for (let E in EDGE) {
            let edge = EDGE[E];
            let temp = 0;
            for (let e in edge) {
                let current_length = compute_length(edge[e].position[0], edge[e].position[1]);
                let origin_length = edge[e].edge_length;
                temp += (current_length - origin_length)/origin_length;
            }
            error += temp;
        }
        return Math.abs(error / (origami_structure.edge.length + origami_structure.boundary_edge.length));
    }

    compute_crease_error(origami_structure, fold_angle_target) {
        let error = 0;
        for (let e in origami_structure.edge) {
            let dihedral_angle = origami_structure.edge[e].dihedral_angle;
            let dihedral_angle_target = 0;
            if (origami_structure.edge[e].fold_assign == "V") {
                dihedral_angle_target = 1 * fold_angle_target;
            }

            if (origami_structure.edge[e].fold_assign == "M") {
                dihedral_angle_target = (-1) * fold_angle_target;
            }

            if (origami_structure.edge[e].fold_assign == "F") {
                dihedral_angle_target = dihedral_angle;
                // dihedral_angle_target = 1 * fold_angle_target;
            }

            error += reduceAngle(dihedral_angle - dihedral_angle_target)/origami_structure.edge.length;
            // console.log("angle, target: ", dihedral_angle, dihedral_angle_target)
        }
        return Math.abs(error);
    }
}

class Origami_Structure {
    constructor(crease_pattern) {
        this.vertex = crease_pattern.vertex;
        this.normal = this.construct_normal(crease_pattern);
        this.edge = this.construct_edge(crease_pattern, this.normal);
        this.boundary_edge = this.construct_boundary_edge(crease_pattern);
        this.face = this.construct_face(crease_pattern, this.normal);
        console.log(this.face)
    }

    construct_edge(crease_pattern, normal) {
        let edge = [];
        for (let e in crease_pattern.edge) {
            let new_edge = new Edge(crease_pattern.vertex, crease_pattern.edge[e], crease_pattern.face, normal, crease_pattern.fold_assign[e]);
            edge.push(new_edge);
        }
        return edge;
    }

    construct_boundary_edge(crease_pattern) {
        let boundary_edge = [];
        for (let e in crease_pattern.boundary_edge) {
            let new_boundary_edge = new Boundary_Edge(crease_pattern.vertex, crease_pattern.boundary_edge[e]);
            boundary_edge.push(new_boundary_edge);
        }
        return boundary_edge;
    }

    construct_face(crease_pattern, normal) {
        let face = [];
        for (let f in crease_pattern.face) {
            let new_face = new Face(crease_pattern.vertex, crease_pattern.face[f], normal[f]);
            face.push(new_face);
        }
        return face;
    }

    construct_normal(crease_pattern) {
        let normal = [];
        for (let f in crease_pattern.face) {
            let new_normal = this.compute_face_normal(crease_pattern.vertex, crease_pattern.face[f]);
            normal.push(new_normal);
        }
        return normal;
    }

    compute_face_normal(vertex, vertex_ID) {
        let AB = Linear_Algebra.subtract(vertex[vertex_ID[1]], vertex[vertex_ID[0]]);
        let AC = Linear_Algebra.subtract(vertex[vertex_ID[2]], vertex[vertex_ID[0]]);
        let cross_product = Linear_Algebra.cross_product(AB, AC);
        return Linear_Algebra.normalize(cross_product);
    }

    update_dihedral_angle() {
        // update normal
        this.normal = this.construct_normal(crease_pattern);
        for (let f in crease_pattern.face) {
            let new_normal = this.compute_face_normal(crease_pattern.vertex, crease_pattern.face[f]);
            this.face[f].normal = new_normal;
        }
        
        let edge = this.edge;
        let boundary_edge = this.boundary_edge;
        for (let e in edge) {
            edge[e].position = [vertex[edge[e].vertex_ID[0]], vertex[edge[e].vertex_ID[1]]];
            edge[e].dihedral_angle = edge[e].compute_dihedral_angle(this.vertex, edge[e].vertex_ID, edge[e].adjacent_face_ID, this.normal);
        }
        for (let e in boundary_edge) {
            boundary_edge[e].position = [vertex[boundary_edge[e].vertex_ID[0]], vertex[boundary_edge[e].vertex_ID[1]]];
        }
    }
}

class Edge {
    constructor(vertex, vertex_ID, face, normal, fold_assign) {
        this.vertex_ID = vertex_ID;
        this.fold_assign = fold_assign;
        this.position = [vertex[vertex_ID[0]], vertex[vertex_ID[1]]];
        this.edge_length = this.compute_edge_length(vertex, vertex_ID);
        this.adjacent_face_ID = this.compute_edge_adjacent_face(vertex_ID, face);
        this.adjacent_vertex_ID = this.compute_edge_adjacent_vertex(vertex_ID, face, this.adjacent_face_ID);
        this.dihedral_angle = this.compute_dihedral_angle(vertex, vertex_ID, this.adjacent_face_ID, normal);
    }

    compute_edge_length(vertex, vertex_ID) {
        let vec = Linear_Algebra.subtract(vertex[vertex_ID[1]], vertex[vertex_ID[0]]);
        return Linear_Algebra.norm(vec);
    }

    compute_edge_adjacent_face(vertex_ID, face) {
        let edge_adjacent_face = [0, 0];
        for (let f in face) {
            if (face[f].includes(vertex_ID[0]) && face[f].includes(vertex_ID[1])) {
                let id_0 = face[f].indexOf(vertex_ID[0]);
                let id_1 = face[f].indexOf(vertex_ID[1]);
                if (id_0 - id_1 == 1 || id_0 - id_1 == -2) {
                    edge_adjacent_face[0] = Number(f);
                } else {
                    edge_adjacent_face[1] = Number(f);
                }
            }
        }
        return edge_adjacent_face;
    }

    compute_edge_adjacent_vertex(vertex_ID, face, face_ID) {
        let edge_adjacent_vertex = [0, 0];
        let f1 = face_ID[0];
        let f2 = face_ID[1];
        edge_adjacent_vertex[0] = face[f1].filter(v => v !== vertex_ID[0] && v !== vertex_ID[1])[0];
        edge_adjacent_vertex[1] = face[f2].filter(v => v !== vertex_ID[0] && v !== vertex_ID[1])[0];
        return edge_adjacent_vertex;
    }

    compute_dihedral_angle(vertex, vertex_ID, face_ID, normal) {
        let det = Linear_Algebra.dot_product(Linear_Algebra.normalize(Linear_Algebra.subtract(vertex[vertex_ID[1]], vertex[vertex_ID[0]])), 
                                            Linear_Algebra.cross_product(normal[face_ID[0]], normal[face_ID[1]]));
        let dot = Linear_Algebra.dot_product(normal[face_ID[0]], normal[face_ID[1]]);
        if (dot > 1) {dot = 1;}
        let cos_angle = Math.acos(dot);
        if (det > 0) {cos_angle *= (-1);}
        return cos_angle;
    }
}

class Face {
    constructor(vertex, vertex_ID, normal) {
        this.vertex_ID = vertex_ID;
        this.position = [vertex[vertex_ID[0]], vertex[vertex_ID[1]], vertex[vertex_ID[2]]];
        this.area = this.compute_face_area(vertex, vertex_ID);
        this.normal = normal;
        this.face_inner_angle = this.compute_face_inner_angle(vertex, vertex_ID);
    }

    compute_face_area(vertex, vertex_ID) {
        let AB = Linear_Algebra.subtract(vertex[vertex_ID[1]], vertex[vertex_ID[0]]);
        let AC = Linear_Algebra.subtract(vertex[vertex_ID[2]], vertex[vertex_ID[0]]);
        let cross_product = Linear_Algebra.cross_product(AB, AC);
        return Linear_Algebra.norm(cross_product)/2; 
    }

    compute_face_inner_angle(vertex, vertex_ID) {
        let face_inner_angle = [0, 0, 0];
        let order = [[vertex_ID[0], vertex_ID[1], vertex_ID[2]], [vertex_ID[1], vertex_ID[0], vertex_ID[2]], [vertex_ID[2], vertex_ID[0], vertex_ID[1]]];
        for (let i in order) {
            face_inner_angle[i] = compute_angle(vertex[order[i][0]], vertex[order[i][1]], vertex[order[i][2]]);
        }
        return face_inner_angle;    
    }
}

class Boundary_Edge {
    constructor(vertex, vertex_ID) {
        this.vertex_ID = vertex_ID;
        this.position = [vertex[vertex_ID[0]], vertex[vertex_ID[1]]];
        this.edge_length = this.compute_edge_length(vertex, vertex_ID);
    }

    compute_edge_length(vertex, vertex_ID) {
        let vec = Linear_Algebra.subtract(vertex[vertex_ID[1]], vertex[vertex_ID[0]]);
        return Linear_Algebra.norm(vec);
    }
}