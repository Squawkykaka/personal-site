@group(0) @binding(0) var inputTexture : texture_storage_2d<r32float, read>;
@group(0) @binding(1) var outTexture : texture_storage_2d<r32float, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
    let size = textureDimensions(inputTexture);
    if (gid.x >= size.x || gid.y >= size.y) {
        return;
    }

    
    let current = textureLoad(inputTexture, vec2<i32>(gid.xy)).r;

    let coord = vec2<i32>(i32(gid.x), i32(gid.y));

    let top = textureLoad(inputTexture, vec2<i32>(coord.x, coord.y + 1)).r;
    let bottom = textureLoad(inputTexture, vec2<i32>(coord.x, coord.y - 1)).r;
    let left = textureLoad(inputTexture, vec2<i32>(coord.x + 1, coord.y)).r;
    let right = textureLoad(inputTexture, vec2<i32>(coord.x - 1, coord.y)).r;
    
    var sum : f32 = 0.0;
    var count : f32 = 0.0;

    if (top != 0.0)    { sum += top; count += 1.0; }
    if (bottom != 0.0) { sum += bottom; count += 1.0; }
    if (left != 0.0)   { sum += left; count += 1.0; }
    if (right != 0.0)  { sum += right; count += 1.0; }

    if (count > 0.0) {
        let avg = sum / count;
        if ((f32(gid.x) * f32(gid.y)) % avg < 0.5) {
            textureStore(outTexture, vec2<i32>(coord.x, coord.y), vec4f(avg * 0.999, 0.0, 0.0, 1.0));
        }
    }
}
