import { defineToolcraft } from "@/toolcraft/runtime";

export const appSchema = defineToolcraft({
  canvas: {
    enabled: true,
    size: { height: 1080, unit: "px", width: 1080 },
    sizing: { mode: "editable-output" },
    upload: true,
  },
  identity: {
    id: "wzrd-image",
    title: "WZRD Image",
  },
  panels: {
    controls: {
      sections: [
        {
          controls: {
            sourceImage: {
              accept: "image/*",
              applicability: { mode: "always" },
              assetKind: "image",
              defaultValue: null,
              label: "Image",
              orderRole: "primary",
              performanceReason:
                "Uploaded image dimensions drive decode cost and the size of the media layer rendered on the canvas.",
              performanceRole: "responsiveness",
              target: "source.image",
              type: "fileDrop",
            },
          },
          id: "source",
          title: "Source",
        },
        {
          controls: {
            backgroundEnabled: {
              applicability: { mode: "always" },
              defaultValue: true,
              label: "Background",
              performanceReason:
                "Toggles whether the canvas background is composited behind the image in preview and export.",
              performanceRole: "responsiveness",
              target: "export.includeBackground",
              type: "switch",
            },
            backgroundColor: {
              applicability: { mode: "always" },
              defaultValue: "#05070B",
              label: "Background color",
              performanceReason:
                "Changes the composited canvas background color behind the image.",
              performanceRole: "responsiveness",
              target: "appearance.background",
              type: "color",
            },
          },
          id: "background",
          title: "Background",
        },
        {
          controls: {
            imageExportFormat: {
              applicability: { mode: "always" },
              defaultValue: "png",
              label: "Format",
              options: [
                { label: "PNG", value: "png" },
                { label: "JPG", value: "jpg" },
              ],
              performanceReason:
                "Changes artifact encoding cost at export time only; no per-frame preview work.",
              performanceRole: "responsiveness",
              target: "export.image.format",
              type: "select",
            },
            imageExportResolution: {
              applicability: { mode: "always" },
              defaultValue: "4k",
              label: "Resolution",
              options: [
                { label: "2K", value: "2k" },
                { label: "4K", value: "4k" },
                { label: "8K", value: "8k" },
              ],
              performanceReason:
                "Scales exported artifact dimensions and encode cost at export time only.",
              performanceRole: "responsiveness",
              target: "export.image.resolution",
              type: "select",
            },
          },
          layoutGroups: [
            {
              columns: 2,
              controls: ["imageExportFormat", "imageExportResolution"],
              layout: "inline",
            },
          ],
          id: "image-export",
          title: "Image Export",
        },
        {
          controls: {
            output: {
              applicability: { mode: "always" },
              actions: [
                {
                  icon: "upload-simple",
                  label: "Export PNG",
                  role: "export-image",
                  value: "export.image",
                },
              ],
              defaultValue: null,
              target: "actions.output",
              type: "panelActions",
            },
          },
          id: "output",
          title: "Output",
        },
      ],
      title: "WZRD Image",
    },
  },
  toolbar: {
    history: true,
    radar: true,
    theme: true,
    zoom: true,
  },
});
