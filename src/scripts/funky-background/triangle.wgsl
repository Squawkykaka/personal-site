@group(0) @binding(0)
var tex : texture_2d<f32>;

// @group(0) @binding(1)
// var samp : sampler;

// struct OurVertexShaderOutput {
    
//     @location(0) fragPos: vec2f,
// };

fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let hp = h * 6.0;
    let x = c * (1.0 - abs((hp % 2.0) - 1.0));
    var rgb = vec3<f32>(0.0);

    if (hp < 1.0) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (hp < 2.0) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (hp < 3.0) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (hp < 4.0) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (hp < 5.0) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }

    let m = v - c;
    return rgb + vec3<f32>(m);
}

@vertex fn vs(
    @builtin(vertex_index) vertexIndex: u32
) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( -1.0,  1.0),  // top center
        vec2f(-1.0, -1.0),  // bottom left
        vec2f( 1.0, -1.0),  // bottom right

        vec2f( 1.0,  1.0),  // top center
        vec2f(-1.0, 1.0),  // bottom left
        vec2f( 1.0, -1.0)   // bottom right
    );


    return vec4f(pos[vertexIndex] , 0.0, 1.0);
}

@fragment
fn fs(@builtin(position) pos : vec4<f32>) -> @location(0) vec4<f32> {
    let dims = vec2<i32>(textureDimensions(tex));
    

    var coord = vec2<i32>(pos.xy);

    let color = textureLoad(tex, coord, 0).r;
    if (color == 0.0) {
        return vec4f(0);
    } else {
        let hue = fract(color);      // hue from your single float
        let rgb = hsv2rgb(hue, 1.0, 1.0);
        return vec4<f32>(rgb, 1.0); 
    }
}
