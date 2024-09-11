import './UploadImage.css'

import { useUpload } from '../../hooks/Upload/useUpload.ts'

import { FolderIcon } from '../../common/components/Icons.tsx'

const UPLOAD_FILE_ERROR_MESSAGES = {
  UNEXPECTED_ERROR: 'Unexpected error has occurred. Try again.',
  MULTIPLE_FILES: 'Multiple files not allowed.',
  INCORRECT_TYPE: (type: string) => `File must be of type image. Received: ${type}.`,
  FILE_NOT_PROVIDED: 'Only files are supported.'
}

export type UploadFileErrorMessages = typeof UPLOAD_FILE_ERROR_MESSAGES

export function UploadImage () {
  const {
    form,
    inputFile,
    errorMessage,
    isOnDragOver,
    handleInputOnChange,
    handleSubmit,
    handleOnDragOver,
    handleOnDragLeave,
    handleDrop
  } = useUpload({ UPLOAD_FILE_ERROR_MESSAGES })

  return (
    <header className='upload-image'>
      <h1>Basic photo editor</h1>
      <form
        className="form-image-input"
        ref={form}
        onSubmit={handleSubmit}
        onDrop={handleDrop}
        onDragOver={handleOnDragOver}
        onDragLeave={handleOnDragLeave}
        style={{
          color: isOnDragOver ? '#505756' : 'var(--textMain)',
          transform: isOnDragOver ? 'scale(1.1)' : ''
        }}
      >
        <div>
          <span><FolderIcon /></span>
          <strong>Drag and drop image here</strong>
          <label
            title="Click here to select an image from file explorer"
          >
            or open file explorer
            <input
              type="file"
              name="imageFile"
              accept='image/*'
              ref={inputFile}
              onChange={handleInputOnChange}
              hidden
            />
          </label>
        </div>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </header>
  )
}
