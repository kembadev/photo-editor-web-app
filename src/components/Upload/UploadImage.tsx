import './UploadImage.css'

import { useUpload } from '../../hooks/Upload/useUpload.ts'

import { FolderIcon } from '../../common/components/Icons.tsx'

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
  } = useUpload()

  return (
    <header className='upload-image'>
      <h1>Basic photo editor</h1>
      <form
        aria-label='Upload image to edit'
        className="form-image-input"
        ref={form}
        onSubmit={handleSubmit}
        onDrop={handleDrop}
        onDragOver={handleOnDragOver}
        onDragLeave={handleOnDragLeave}
        style={{
          color: isOnDragOver ? '#505756' : 'var(--main-text-color)',
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
      {errorMessage && <p role='alert'>{errorMessage}</p>}
    </header>
  )
}
