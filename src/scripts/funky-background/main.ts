import triangleWGSL from './triangle.wgsl?raw';

const canvas = document.getElementById("background") as HTMLCanvasElement;
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
let rect = canvas.getBoundingClientRect()

let mouse = {x:0,y:0};
document.addEventListener("pointermove", event => {
    mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
})

async function main() {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
        console.error('Sorry, you need WebGPU to run the background animation :(');
        return;
    }

    const context = canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });

    const module = device.createShaderModule({
        label: 'our hardcoded rgb triangle shaders',
        code: triangleWGSL
    })

    const pipeline = device.createRenderPipeline({
        label: 'our hardcoded red triangle pipelie',
        layout: 'auto',
        vertex: {
            module
        },
        fragment: {
            module,
            targets: [{ format: presentationFormat }]
        },
    });

    // const staticUniformBufferSize = 
    //     4 + 4 + // color (vec4)
    //     2 * 4 // 

    const uniformBufferSize =
        4 * 4 + // Color (vec4)
        2 * 4 + // scale
        2 * 4 +  // time
        4 * 4  // mouseX(vec2f)
        // 4 * 4  // canvas(vec2f)
        ;
    const kScaleOffset = 4;
    const kTimeOffset = 6;
    const kMouseOffset = 8;
    const kCanvasOffset = 12;
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const uniformValues = new Float32Array(uniformBufferSize / 4);
    uniformValues.set([0, 1, 0, 1], 0);

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: uniformBuffer },
        ],
    });

    const renderPassDescriptor = {
        label: 'our basic canvas renderPass',
        colorAttachments: [
            {
                view: undefined, // filled later
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };

    const startTime = performance.now();

    function render() {
        renderPassDescriptor.colorAttachments[0].view =
            context.getCurrentTexture().createView();

        const encoder = device.createCommandEncoder({ label: 'our encoder' });

        const now = (performance.now() - startTime) * 0.001;        

        const aspect = canvas.width / canvas.height;
        uniformValues.set([aspect, 1], kScaleOffset);
        uniformValues.set([now], kTimeOffset);
        uniformValues.set([
            (mouse.x / canvas.width) * 2.0 - 1.0, 
            1.0 - (mouse.y / canvas.height) * 2.0
        ], kMouseOffset);        

        device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(6)
        pass.end()

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
        // setInterval(render, 1) // requestAnimationFrame or not doing anything crashes firefox, wait nope its anything

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)


    // CRASHES FIREFOX
    // const observer = new ResizeObserver(entries => {
    //     for (const entry of entries) {
    //         const width = entry.devicePixelContentBoxSize?.[0].inlineSize ||
    //             entry.contentBoxSize[0].inlineSize * devicePixelRatio;
    //         const height = entry.devicePixelContentBoxSize?.[0].blockSize ||
    //             entry.contentBoxSize[0].blockSize * devicePixelRatio;
    //         const canvas = entry.target as HTMLCanvasElement;
    //         canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
    //         canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
    //     }
    // });
    // try {
    //     observer.observe(canvas, { box: 'device-pixel-content-box' });
    // } catch {
    //     observer.observe(canvas, { box: 'content-box' });
    // }
}
main()