import triangleWGSL from "./triangle.wgsl?raw";
import mouseDrawWGSL from "./draw.wgsl?raw";
import evolveWGSL from "./evolve.wgsl?raw";

const canvas = document.getElementById("background") as HTMLCanvasElement;
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
let rect = canvas.getBoundingClientRect();

let rangeSelectElement = document.getElementById("rangeSelect") as HTMLInputElement;
let mergeEnabledElement = document.getElementById("mergeEnabled") as HTMLInputElement;

let mouse = { x: 0, y: 0, pressed: false };
document.addEventListener("pointermove", (event) => {
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
});
document.addEventListener("pointerdown", (event) => (mouse.pressed = true));
document.addEventListener("pointerup", (event) => (mouse.pressed = false));

async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    console.error("Sorry, you need WebGPU to run the background animation :(");
    return;
  }

  const context = canvas.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  const firstTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: "r32float",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  });
  const secondTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: "r32float",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  });

  let { mouseDrawUniformValues, mouseDrawUniformBuffer, mouseDrawPipeline, mouseDrawBindGroup } =
    setupMouseDrawPipeline(device, firstTexture);
  let { evolvePipeline, evolveBindGroup1, evolveBindGroup2 } = setupEvolvePipeline(
    device,
    firstTexture,
    secondTexture,
  );
  // ***************
  // RENDER

  const module = device.createShaderModule({
    label: "render stage",
    code: triangleWGSL,
  });

  const pipeline = device.createRenderPipeline({
    label: "rendering pipeline for background",
    layout: "auto",
    vertex: {
      module,
    },
    fragment: {
      module,
      targets: [{ format: presentationFormat }],
    },
  });

  const renderBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: secondTexture.createView() }],
  });
  const renderBindGroupNoEvolve = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: firstTexture.createView() }],
  });

  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        view: undefined, // filled later
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  function render() {
    renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

    const encoder = device.createCommandEncoder({ label: "our encoder" });

    if (mouse.pressed) {
      // only run and upload compute related stuff when the mouse is pressed, as its the only time it matters
      const aspect = canvas.width / canvas.height;

      let calculatedMousePositon = [mouse.x / canvas.width, mouse.y / canvas.height];

      const cScaleOffset = 0;
      const cMouseOffset = 2;
      const cElementOffset = 4;

      mouseDrawUniformValues.set([aspect, 1], cScaleOffset);
      mouseDrawUniformValues.set(calculatedMousePositon, cMouseOffset);
      mouseDrawUniformValues.set([Number.parseFloat(rangeSelectElement.value)], cElementOffset);

      device.queue.writeBuffer(mouseDrawUniformBuffer, 0, mouseDrawUniformValues);

      const pass = encoder.beginComputePass();
      pass.setPipeline(mouseDrawPipeline);
      pass.setBindGroup(0, mouseDrawBindGroup);

      const wx = Math.ceil(canvas.width / 8);
      const wy = Math.ceil(canvas.height / 8);
      pass.dispatchWorkgroups(wx, wy);

      pass.end();
    }

    if (mergeEnabledElement.checked) {
      const pass = encoder.beginComputePass();
      pass.setPipeline(evolvePipeline);
      pass.setBindGroup(0, evolveBindGroup1);
      const wx = Math.ceil(canvas.width / 8);
      const wy = Math.ceil(canvas.height / 8);
      pass.dispatchWorkgroups(wx, wy);

      pass.end();
    }

    {
      renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

      const pass = encoder.beginRenderPass(renderPassDescriptor);
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, mergeEnabledElement.checked ? renderBindGroup : renderBindGroupNoEvolve);
      pass.draw(6);
      pass.end();
    }

    device.queue.submit([encoder.finish()]);

    [evolveBindGroup1, evolveBindGroup2] = [evolveBindGroup2, evolveBindGroup1];
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();

function setupMouseDrawPipeline(device: GPUDevice, frameTexture: GPUTexture) {
  const computeShader = device.createShaderModule({ code: mouseDrawWGSL });
  // const computeTexture = device.createTexture({
  //     size: [canvas.width, canvas.height, 1],
  //     format: 'r32float',
  //     usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  // })
  const mouseDrawPipeline = device.createComputePipeline({
    compute: {
      module: computeShader,
    },
    layout: "auto",
    label: "compute image writing",
  });
  const computeUniformSize =
    2 * 4 + // scale
    4 * 4 + // mouseX(vec2f)
    2 * 4; // color (vec4)

  const mouseDrawUniformBuffer = device.createBuffer({
    label: "Compute uniform buffer",
    size: computeUniformSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const mouseDrawUniformValues = new Float32Array(computeUniformSize / 4);
  const mouseDrawBindGroup = device.createBindGroup({
    layout: mouseDrawPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: frameTexture.createView() },
      { binding: 1, resource: mouseDrawUniformBuffer },
    ],
  });

  return { mouseDrawUniformValues, mouseDrawUniformBuffer, mouseDrawPipeline, mouseDrawBindGroup };
}

function setupEvolvePipeline(
  device: GPUDevice,
  frameTexture: GPUTexture,
  secondTexture: GPUTexture,
) {
  const evolveShader = device.createShaderModule({ code: evolveWGSL });
  const evolvePipeline = device.createComputePipeline({
    compute: {
      module: evolveShader,
    },
    layout: device.createPipelineLayout({
      bindGroupLayouts: [
        device.createBindGroupLayout({
          entries: [
            {
              binding: 0,
              visibility: GPUShaderStage.COMPUTE,
              storageTexture: {
                access: "read-only",
                format: "r32float",
              },
            },
            {
              binding: 1,
              visibility: GPUShaderStage.COMPUTE,
              storageTexture: {
                access: "write-only",
                format: "r32float",
              },
            },
          ],
        }),
      ],
    }),
    label: "evolve shader pipeline",
  });
  const evolveBindGroup1 = device.createBindGroup({
    layout: evolvePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: frameTexture.createView() },
      { binding: 1, resource: secondTexture.createView() },
    ],
    label: "the evolve shader bind group",
  });
  const evolveBindGroup2 = device.createBindGroup({
    layout: evolvePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 1, resource: frameTexture.createView() },
      { binding: 0, resource: secondTexture.createView() },
    ],
    label: "the evolve shader bind group",
  });

  return { evolvePipeline, evolveBindGroup1, evolveBindGroup2 };
}
