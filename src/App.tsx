import './App.css'

import ControlsProvider from './context/ControlsProvider.tsx'
import ImageFileProvider from './context/ImageFile.tsx'
import OffscreenCanvasProvider from './context/OffscreenCanvasProvider.tsx'
import UICanvasProvider from './context/UICanvasProvider.tsx'

import { Screen } from './components/Screen.tsx'

function App () {
  return (
    <ImageFileProvider>
      <OffscreenCanvasProvider>
        <UICanvasProvider>
          <ControlsProvider>
            <Screen />
          </ControlsProvider>
        </UICanvasProvider>
      </OffscreenCanvasProvider>
    </ImageFileProvider>
  )
}

export default App
