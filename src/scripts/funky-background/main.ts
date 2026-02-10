import triangleWGSL from './triangle.wgsl?raw';
import computeWGSL from './compute.wgsl?raw';

const canvas = document.getElementById("background") as HTMLCanvasElement;
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
let rect = canvas.getBoundingClientRect()

let mouse = { x: 0, y: 0 };
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

    const computeShader = device.createShaderModule({ code: computeWGSL });
    const computeTexture = device.createTexture({
        size: [canvas.width, canvas.height, 1],
        format: 'r32float',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    })
    const computePipeline = device.createComputePipeline({
        compute: {
            module: computeShader,
        },
        layout: "auto",
        label: 'compute image writing + growth thing'
    });
    const computeUniformSize =
        2 * 4 + // scale
        4 * 4 + // mouseX(vec2f)
        8 * 4  // color (vec4)
        ;
    const cScaleOffset = 0;
    const cMouseOffset = 4;
    const cColorOffset = 8;
    const computeUniformBuffer = device.createBuffer({
        label: 'Compute uniform buffer',
        size: computeUniformSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const computeUniformValues = new Float32Array(computeUniformSize / 4);
    const computeBindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: computeTexture.createView() },
            { binding: 1, resource: computeUniformBuffer }
        ]
    })

    // ***************
    // RENDER

    const module = device.createShaderModule({
        label: 'render stage',
        code: triangleWGSL
    })

    const pipeline = device.createRenderPipeline({
        label: 'rendering pipeline for background',
        layout: 'auto',
        vertex: {
            module
        },
        fragment: {
            module,
            targets: [{ format: presentationFormat }]
        },
    });

    const renderBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: computeTexture.createView() },
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

    function render() {
        renderPassDescriptor.colorAttachments[0].view =
            context.getCurrentTexture().createView();

        const encoder = device.createCommandEncoder({ label: 'our encoder' });

        {
            const pass = encoder.beginComputePass();
            pass.setPipeline(computePipeline);
            pass.setBindGroup(0, computeBindGroup);

            const wx = Math.ceil(canvas.width / 8);
            const wy = Math.ceil(canvas.height / 8);
            pass.dispatchWorkgroups(wx, wy);

            pass.end();
        }

        {
            renderPassDescriptor.colorAttachments[0].view =
                context.getCurrentTexture().createView();

            const pass = encoder.beginRenderPass(renderPassDescriptor);
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, renderBindGroup);
            pass.draw(6);
            pass.end();
        }

        const aspect = canvas.width / canvas.height;
        
        let calculatedMousePositon = [
            (mouse.x / canvas.width),
            1.0 - (mouse.y / canvas.height)
        ];
        computeUniformValues.set([aspect, 1], cScaleOffset);
        computeUniformValues.set(calculatedMousePositon, cMouseOffset);
        computeUniformValues.set([1, 1, 1, 1], cColorOffset);

        device.queue.writeBuffer(computeUniformBuffer, 0, computeUniformValues);
        
        device.queue.submit([encoder.finish()]);

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}
main()