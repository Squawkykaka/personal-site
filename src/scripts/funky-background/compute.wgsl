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

    let size_f = vec2<f32>(size);
    let uv = vec2<f32>(gid.xy) / size_f;

    let prev = textureLoad(texture, vec2<i32>(gid.xy)).r;

    let d = distance(vec2f(uv.x * u.scale.x, uv.y * u.scale.y), vec2f(u.mouse.x * u.scale.x, u.mouse.y));

    let radius = 0.05;
    let influence = select(0.0, 1.0, d < radius);
    let next = clamp(prev + influence , 0.0, 1.0);

    textureStore(texture, vec2<i32>(gid.xy), vec4f(next, 0.0, 0.0, 1.0));
}
