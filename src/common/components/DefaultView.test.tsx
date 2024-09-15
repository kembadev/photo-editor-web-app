import DefaultView from './DefaultView.tsx'

import { render, screen } from '@testing-library/react'

describe('<DefaultView />', () => {
  it('should render', () => {
    const msg = 'some message'
    render(<DefaultView msg={msg} />)

    expect(screen.getByText(msg)).toBeInTheDocument()
  })
})
