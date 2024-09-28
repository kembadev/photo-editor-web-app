interface WorkerDocument extends Document {
  createElement(tagName: 'canvas'): OffscreenCanvas;
  createElement(tagName: string): never
}

const workerDocument = {
  createElement: (tagName: string) => {
    if (tagName === 'canvas') {
      return new OffscreenCanvas(0, 0)
    }

    throw new Error(`Unsupported element: ${tagName}`)
  }
} as WorkerDocument

export function createSpecialDocumentForWorker () {
  if (typeof window === 'undefined') {
    self.document = workerDocument
  }
}
