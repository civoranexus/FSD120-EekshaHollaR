import '@testing-library/jest-dom'
import React from 'react'
import { jest } from '@jest/globals'

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} />
    },
}))
