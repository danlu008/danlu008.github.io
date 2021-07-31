function RadiusToDegree(radius) {
    return radius/Math.PI*180;
}

function compute_length(point1, point2) {
    let vec = Linear_Algebra.subtract(point1, point2);
    return Linear_Algebra.norm(vec);
}

function compute_angle(point1, point2, point3) {
    let AB = Linear_Algebra.subtract(point2, point1);
    let AC = Linear_Algebra.subtract(point3, point1);
    return Linear_Algebra.cosine_angle(AB, AC);
}

function cotan(radius) {
    return 1 / Math.tan(radius);
}

function reduceAngle(angle) {
    if (angle > Math.PI) {
        angle -= 2*Math.PI;
    } else if (angle < -Math.PI) {
        angle += 2*Math.PI;
    }
    return angle;
}