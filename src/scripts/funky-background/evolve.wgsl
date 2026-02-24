@group(0) @binding(0) var texture : texture_storage_2d<r32float, read_write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
    let size = textureDimensions(texture);
    if (gid.x >= size.x || gid.y >= size.y) {
        return;
    }

    let prev = textureLoad(texture, vec2<i32>(gid.xy)).r;

    textureStore(texture, vec2<i32>(gid.xy), vec4f(prev, 0.0, 0.0, 1.0));

}
