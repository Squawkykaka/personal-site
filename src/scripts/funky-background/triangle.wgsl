struct OurVertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) fragPos: vec2f,
};

struct UniformInput {
    color: vec4f,
    scale: vec2f,
    time: f32,
    mouse: vec2f,
    // canvas: vec2f,
}

@group(0) @binding(0) var<uniform> inputUniform: UniformInput;

@vertex fn vs(
    @builtin(vertex_index) vertexIndex: u32
) -> OurVertexShaderOutput {
    let pos = array(
        vec2f( -1.0,  1.0),  // top center
        vec2f(-1.0, -1.0),  // bottom left
        vec2f( 1.0, -1.0),  // bottom right

        vec2f( 1.0,  1.0),  // top center
        vec2f(-1.0, 1.0),  // bottom left
        vec2f( 1.0, -1.0)   // bottom right
    );

    // var color = array<vec4f, 6>(
    // vec4f(1, 0, 0, 1), // red
    // vec4f(0, 1, 0, 1), // green
    // vec4f(0, 0, 1, 1), // blue

    // vec4f(0, 1, 0, 1), // green
    // vec4f(1, 0, 0, 1), // red
    // vec4f(0, 0, 1, 1), // blue
    // );

    var vsOutput: OurVertexShaderOutput;
    vsOutput.position = vec4f(pos[vertexIndex] , 0.0, 1.0);
    vsOutput.fragPos = pos[vertexIndex] ; // NDC position

    return vsOutput;
}

@fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
    let mouse = vec2(inputUniform.mouse.x * inputUniform.scale.x, inputUniform.mouse.y);
    let uv = vec2(fsInput.fragPos.x * inputUniform.scale.x, fsInput.fragPos.y);

    let dist = distance(uv, mouse);
    let radius = 0.15;

    // Smooth edge
    let circle = smoothstep(radius, radius - 0.01, dist);

    let color = vec3(1.0, 0.2, 0.2); // red circle
    return vec4f(color * circle, 1.0);
}
