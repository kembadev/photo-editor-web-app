import './App.css'

import ImageFileProvider from './context/Screen/ImageFile.tsx'

import { Screen } from './components/Screen/Screen.tsx'

function App () {
  return (
    <ImageFileProvider>
      <Screen />
    </ImageFileProvider>
  )
}

export default App
