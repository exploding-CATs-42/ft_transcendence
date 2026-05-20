// Libraries
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import workerUrl from "pdfjs-dist/build/pdf.worker.min?url";

export const PdfViewer = () => {
  return (
    <div style={{ height: "100%" }}>
      <Worker workerUrl={workerUrl}>
        <Viewer fileUrl="/rules.pdf" plugins={[defaultLayoutPlugin()]} />
      </Worker>
    </div>
  );
};

export default PdfViewer;
