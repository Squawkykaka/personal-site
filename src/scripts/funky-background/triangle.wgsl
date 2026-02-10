@group(0) @binding(0)
var tex : texture_2d<f32>;

// @group(0) @binding(1)
// var samp : sampler;

// struct OurVertexShaderOutput {
    
//     @location(0) fragPos: vec2f,
// };

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

    // var vsOutput: OurVertexShaderOutput;
    // vsOutput.position = ;

    return vec4f(pos[vertexIndex] , 0.0, 1.0);
}

@fragment
fn fs(@builtin(position) pos : vec4<f32>) -> @location(0) vec4<f32> {
    let dims = vec2<i32>(textureDimensions(tex));
    
    // Convert clip-space to integer pixel coordinates
    // pos.xy is in screen pixel space, usually already in [0, width/height]
    var coord = vec2<i32>(pos.xy);
    
    // Clamp to valid range
    coord = clamp(coord, vec2<i32>(0,0), dims - vec2<i32>(1,1));

    let color = textureLoad(tex, coord, 0);
    return color;
}
