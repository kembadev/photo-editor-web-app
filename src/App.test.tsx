import App from './App.tsx'

import { render, screen } from '@testing-library/react'

describe('<App />', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('should render UploadImage component', () => {
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByText('Basic photo editor')).toBeDefined()
  })
})
