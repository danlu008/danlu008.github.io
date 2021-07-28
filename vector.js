class Linear_Algebra {
    static add(vec1, vec2) {
        let add = [];
        add.push(
            vec2[0] + vec1[0],
            vec2[1] + vec1[1],
            vec2[2] + vec1[2]
        );
        return add;
    }

    static subtract(vec1, vec2) {
        let subtract = [];
        subtract.push(
            vec2[0] - vec1[0],
            vec2[1] - vec1[1],
            vec2[2] - vec1[2]
        );
        return subtract;
    }

    static dot_product(vec1, vec2) {
        let dot_product = 0;
        dot_product = vec1[0]*vec2[0] + vec1[1]*vec2[1] + vec1[2]*vec2[2];
        return dot_product;
    }

    static cross_product(vec1, vec2) {
        let cross_product = [];
        cross_product.push(
            vec1[1] * vec2[2] - vec1[2] * vec2[1],
            vec1[2] * vec2[0] - vec1[0] * vec2[2],
            vec1[0] * vec2[1] - vec1[1] * vec2[0]
        );
        return cross_product;
    }

    static multiply(vec, k) {
        let multiply = [];
        multiply.push(
            vec[0] * k,
            vec[1] * k,
            vec[2] * k
        );
        return multiply;
    }

    static divide(vec, k) {
        let divide = [];
        divide.push(
            vec[0] / k,
            vec[1] / k,
            vec[2] / k
        );
        return divide;
    }

    static norm(vec) {
        return Math.abs(Math.sqrt((vec[0])**2 + (vec[1])**2 + (vec[2])**2));
    }

    static normalize(vec) {
        let norm = this.norm(vec);
        return [vec[0]/norm, vec[1]/norm, vec[2]/norm];
    }

    static cosine_angle(vec1, vec2) {
        let dot_product = this.dot_product(vec1, vec2);
        return Math.acos(dot_product/(this.norm(vec1)*this.norm(vec2)));
    }
}