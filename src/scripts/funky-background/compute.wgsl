struct Input {
    scale: vec2f,
    mouse : vec2<f32>,
    color : vec4<f32>,
};

@group(0) @binding(0) var texture : texture_storage_2d<r32float, read_write>;

@group(0) @binding(1) var<uniform> u : Input;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
    let size = textureDimensions(texture);
    if (gid.x >= size.x || gid.y >= size.y) {
        return;
    }

    let uv = vec2<f32>(gid.xy) / vec2<f32>(size);
    let prev = textureLoad(texture, vec2<i32>(gid.xy));

    let mouse = u.mouse;

    let d = distance(vec2f(uv.x * u.scale.x, uv.y), vec2f(mouse.x * u.scale.x, mouse.y));

    let influence = smoothstep(0.2, 0.0, d);

    let next = mix(prev, u.color, influence * 0.1);
    textureStore(texture, vec2<i32>(gid.xy + 2), next);
}
