import { createContext, ReactNode, useState } from 'react'

export type ImageFileType = File | null

export interface ImageFileContextType {
  providedImgFile: ImageFileType;
  setProvidedImgFile: (img: ImageFileType) => void
}

export const ImageFileContext = createContext<ImageFileContextType | undefined>(undefined)

export default function ImageFileProvider ({ children }: { children: ReactNode }) {
  const [providedImgFile, setProvidedImgFile] = useState<ImageFileType>(null)

  return (
    <ImageFileContext.Provider
      value={{
        providedImgFile,
        setProvidedImgFile
      }}
    >
      {children}
    </ImageFileContext.Provider>
  )
}
