// import * as THREE from 'https://cdn.skypack.dev/three';
// import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
// import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

function changeTexture(img) {
    console.log(img.src)
    let map = new THREE.TextureLoader().load(img.src);
    Plane.material.map = map;
}

function createLineGeometry(vertex, edge, parent) {
    let points = [];
    for (let e in edge) {
        [point1_id, point2_id] = edge[e].vertex_ID;
        point1 = vertex[point1_id];
        point2 = vertex[point2_id];
        points.push(
            point1[0], point1[1], point1[2],
            point2[0], point2[1], point2[2]
        )
    }
    let vertices = new Float32Array(points);
    let geometry = new THREE.BufferGeometry();
    geometry.computeVertexNormals();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 30});
    const line = new THREE.Line(geometry, material);
    parent.add(line);
    return line;
}

function createPlaneGeometry(vertex, face, parent) {
    let points = [];
    let points_colors = [];
    let thickness = 0.0001;
    let points_index = [0, 1, 2, 3, 4, 5, 0, 1, 3, 1, 3, 4, 1, 2, 4, 2, 4, 5, 0, 2, 3, 2, 3, 5];
    let quad_uvs = [];
    for (let f in face) {
        let [point1_id, point2_id, point3_id] = face[f].vertex_ID;
        let normal = face[f].normal;
        let point_list = [vertex[point1_id], vertex[point2_id], vertex[point3_id]];
        let plane_vertex = [];
        let plane_vertex_color = [];
        for (let i in point_list) {
            plane_vertex.push([point_list[i][0] - normal[0]*thickness, point_list[i][1] - normal[1]*thickness, point_list[i][2] - normal[2]*thickness]);
            plane_vertex_color.push([1, 1, 1]);
        }
        for (let i in point_list) {
            plane_vertex.push([point_list[i][0] + normal[0]*thickness, point_list[i][1] + normal[1]*thickness, point_list[i][2] +  normal[2]*thickness]);
            // plane_vertex_color.push([0.8, 0.7, 0.3]);    // gold
            plane_vertex_color.push([1.0, 1.0, 1.0]);
        }
        
        for (let i in points_index) {
            points.push(...plane_vertex[points_index[i]]);
            points_colors.push(...plane_vertex_color[points_index[i]]);
        }

        for (let i in points_index) {
            quad_uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        }
    }
    let vertices = new Float32Array(points);
    let colors = new Float32Array(points_colors);
    var uvs = new Float32Array( quad_uvs);
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute(colors, 3) );
    geometry.computeVertexNormals();
    console.log(geometry)

    
    // const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, vertexColors: true});
    // const material = new THREE.MeshPhysicalMaterial( { color: parseInt(color), side: THREE.DoubleSide } );
    // const texture = new THREE.TextureLoader().load( "data:image/jpeg;base64,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" );
    // const backtexture = new THREE.TextureLoader().load( "https://pbs.twimg.com/media/EFx8TfIUEAU4w3w.png" );
    // const texture = new THREE.TextureLoader().load( "https://pbs.twimg.com/media/EFx8TfIUEAU4w3w.png" );
    let map = new THREE.TextureLoader().load( "./data/paper.jpg" );
    let normalMap = new THREE.TextureLoader().load( "./data/paper-normal.jpg" );
    // const bump_texture = new THREE.TextureLoader().load( "./data/bump.jpg" );
    // var bump_texture =  new THREE.TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/33170/specular_map.jpg" );

    let normal = new THREE.TextureLoader().load( "./data/plaster.jpg" );
    let bump = new THREE.TextureLoader().load( "./data/plaster-normal.jpg" );

    const material = new THREE.MeshPhongMaterial ({
        side: THREE.DoubleSide,
        map: map,
        normalMap: normalMap,
        vertexColors: true
    });

    // const material = new THREE.MeshMatcapMaterial({
    //     emissive: new THREE.Color("rgb(7,3,5)"),
    //     specular: new THREE.Color("rgb(255,113,0)"),
    //     matcap: map,
    //     side: THREE.DoubleSide,
    //     normalMap: texture,
    //     vertexColors: true
    // });

    let plane = new THREE.Mesh(geometry, material);
    plane.material.needsUpdate = true;
    let LineMaterial = new THREE.LineBasicMaterial({color: 0x00000});
    let wireframe = new THREE.WireframeGeometry(geometry);
    let line = new THREE.LineSegments(wireframe, LineMaterial);
    plane["line"] = line;
    plane.add(line);

    parent.add(plane);
    return plane;
}

function modifyLineGeometry(Line, vertex, edge) {
    let points = [];
    for (let e in edge) {
        [point1_id, point2_id] = edge[e].vertex_ID;
        point1 = vertex[point1_id];
        point2 = vertex[point2_id];
        points.push(
            point1[0], point1[1], point1[2],
            point2[0], point2[1], point2[2]
        )
    }
    let vertices = new Float32Array(points);
    Line.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    Line.geometry.computeVertexNormals();
}

function modifyPlaneGeometry(plane, vertex, face) {
    // let points = [];
    // for (let f in face) {
    //     let [point1_id, point2_id, point3_id] = face[f].vertex_ID;
    //     let point1 = vertex[point1_id];
    //     let point2 = vertex[point2_id];
    //     let point3 = vertex[point3_id];
    //     points.push(
    //         point1[0], point1[1], point1[2],
    //         point2[0], point2[1], point2[2],
    //         point3[0], point3[1], point3[2],
    //     )
    // }
    // let vertices = new Float32Array(points);
    let points = [];
    let thickness = 0.0001;
    for (let f in face) {
        let [point1_id, point2_id, point3_id] = face[f].vertex_ID;
        let normal = face[f].normal;
        let point_list = [vertex[point1_id], vertex[point2_id], vertex[point3_id]];
        let plane_vertex = [];
        for (let i in point_list) {
            plane_vertex.push([point_list[i][0] - normal[0]*thickness, point_list[i][1] - normal[1]*thickness, point_list[i][2] - normal[2]*thickness]);
        }
        for (let i in point_list) {
            plane_vertex.push([point_list[i][0] + normal[0]*thickness, point_list[i][1] + normal[1]*thickness, point_list[i][2] +  normal[2]*thickness]);
        }
        let index = [0, 1, 2, 3, 4, 5, 0, 1, 3, 1, 3, 4, 1, 2, 4, 2, 4, 5, 0, 2, 3, 2, 3, 5];
        for (let i in index) {
            points.push(...plane_vertex[index[i]]);
        }
    }
    let vertices = new Float32Array(points);
    
    plane.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    plane["line"].geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    plane.geometry.computeVertexNormals();
}

const scene = new THREE.Scene();
let scale = 500;
let window_ratio = window.innerHeight/window.innerWidth;
let window_height = window.innerHeight-60;
let window_width = window.innerWidth*2/3;
const camera = new THREE.PerspectiveCamera( 30, window_width / window_height, 0.1, 1000 );
// const camera = new THREE.OrthographicCamera( window_width / - scale, window_width / scale, window_height / scale, window_height / - scale, -200, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
console.log(renderer)

renderer.setSize( window_width, window_height );
document.getElementById("3D visualize").appendChild( renderer.domElement );

const lightHolder = new THREE.Group();
let light = new THREE.AmbientLight( 0x404040 ); // soft white light
light.castShadow = true;
lightHolder.add(light);
let spotLight = new THREE.SpotLight(0x888888)
spotLight.position.set( 5, 5, 10);
spotLight.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 20), new THREE.MeshBasicMaterial({color:0x00ffff})));
spotLight.angle = Math.PI/6; 
spotLight.castShadow = true;
const spotLightHelper = new THREE.SpotLightHelper( spotLight );
// scene.add( spotLightHelper );
lightHolder.add(spotLight);

// let spotLight2 = new THREE.SpotLight(0xffffff)
// spotLight2.position.set( -10, 5, 10);
// spotLight2.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 20), new THREE.MeshBasicMaterial({color:0x00ffff})));
// spotLight2.angle = Math.PI/6; 
// spotLight2.castShadow = true;
// lightHolder.add(spotLight2);
// let spotLightHelper2 = new THREE.SpotLightHelper( spotLight2 );
// // scene.add( spotLightHelper2 );

const hemilight = new THREE.HemisphereLight( 0x888888, 0x888888, 1 );
hemilight.position.set( -10, 10, 10);
hemilight.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 20), new THREE.MeshBasicMaterial({color:0x00ffff})));
hemilight.castShadow = true;
lightHolder.add(hemilight);
// let spotLightHelper2 = new THREE.HemisphereLightHelper( hemilight , 15);
// scene.add( spotLightHelper2 );


scene.add(lightHolder);

const group = new THREE.Group();
group.rotation.x = -Math.PI/3;
group.rotation.z = -Math.PI/4;
scene.add(group);

let origami_structure = new Origami_Structure(crease_pattern);
console.log(origami_structure);
let fold = new Fold(origami_structure);
console.log(fold);

// const Line = createLineGeometry(origami_structure.vertex, origami_structure.edge, group);
const Plane = createPlaneGeometry(origami_structure.vertex, origami_structure.face, group);

let fold_slider = document.getElementById("fold_slider");
let fold_output = document.getElementById("fold_value");
let error_output = document.getElementById("error_value");
fold_output.innerHTML = fold_slider.value;
let work_queue = [];
fold_slider.oninput = function() {
    fold_output.innerHTML = fold_slider.value;
    let fold_angle = Number(fold_slider.value)/100*Math.PI;
    work_queue.push(fold_angle)
}

let current_fold_angle = 0;
let current_slider = 0;

let _fold_angle = 0;
let flag = 0;
window.setInterval(function() {
    if (_fold_angle > Math.PI) {
        flag = 1;
    }
    if (_fold_angle < -Math.PI) {
        flag = 0;
    }
    if (flag == 0) {
        _fold_angle += Math.PI/100;
    } else if (flag == 1) {
        _fold_angle -= Math.PI/100;
    }
    work_queue.push(_fold_angle);
}, 10);


window.setInterval(function() {
    if (work_queue.length > 0) {
        current_fold_angle = work_queue.shift();
    }
    if (fold.axial_error*100 > 0.0000001 || fold.crease_error*100 > 0.0001 || Number(fold_slider.value) !== current_slider || Number(fold_slider.value) !== _fold_angle) {
        fold.compute_displacement(current_fold_angle);
        current_slider = Number(fold_slider.value);
        modifyPlaneGeometry(Plane, origami_structure.vertex, origami_structure.face);
        error_output.innerHTML = String(fold.axial_error*100) + "%, " + String(fold.crease_error*100);
    }
}, 5);

let controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const animate = function() {
    requestAnimationFrame( animate );
    // group.rotation.x += 0.01;
    group.rotation.z += 0.01;

	controls.update();  // required if controls.enableDamping or controls.autoRotate are set to true
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render( scene, camera );
};

animate();