// icons from https://heroicons.com/, https://yesicon.app/

function ScaleIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  )
}

function UndoIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  )
}

function RedoIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
    </svg>
  )
}

function RotateRightIcon () {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
    >
      <path
        fillRule="evenodd"
        d="M8 3a5 5 0 104.546 2.914.5.5 0 01.908-.417A6 6 0 118 2v1z"
      />
      <path d="M8 4.466V.534a.25.25 0 01.41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 018 4.466z" />
    </svg>
  )
}

function RotateLeftIcon () {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
    >
      <path
        fillRule="evenodd"
        d="M8 3a5 5 0 11-4.546 2.914.5.5 0 00-.908-.417A6 6 0 108 2v1z"
      />
      <path d="M8 4.466V.534a.25.25 0 00-.41-.192L5.23 2.308a.25.25 0 000 .384l2.36 1.966A.25.25 0 008 4.466z" />
    </svg>
  )
}

function FolderIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  )
}

function CheckIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function XIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function PlusIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function MinusIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  )
}

function InvertIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M15.57 20.273h.854v-1.705h-.854zm0 3.413h.854V21.98h-.854zm0 3.41h.854V25.39h-.854zm0 2.593h.854v-.89h-.854zm0-12.825h.854V15.16h-.854v1.705zm0-13.64h.854V1.52h-.854zm0 3.41h.854V4.93h-.854zm0 3.41h.854V8.34h-.854zm0 3.41h.854V11.75h-.854zm2.84-10.128V25.46h12.015zm.854 3.353l9.73 17.93h-9.73zm-5.73 18.78V3.327L1.522 25.46h12.015z"/></svg>
  )
}

function AspectRatioIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24">
      <path fill="currentColor" d="M14 17h5v-5h-2v3h-3zm-9-5h2V9h3V7H5zm-3 8V4h20v16zm2-2h16V6H4zm0 0V6z"></path>
    </svg>
  )
}

function BarsArrowDown () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
      <path fill="currentColor" fillRule="evenodd" d="M2.22 13.28a.75.75 0 0 0 1.06 0l2-2a.75.75 0 1 0-1.06-1.06l-.72.72V3.25a.75.75 0 0 0-1.5 0v7.69l-.72-.72a.75.75 0 1 0-1.06 1.06zM7 3.25a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7 3.25m.75 4a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm0 4.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/>
    </svg>
  )
}

function DownloadIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

export {
  ScaleIcon,
  UndoIcon,
  RedoIcon,
  RotateRightIcon,
  RotateLeftIcon,
  InvertIcon,
  FolderIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  MinusIcon,
  AspectRatioIcon,
  BarsArrowDown,
  DownloadIcon
}
