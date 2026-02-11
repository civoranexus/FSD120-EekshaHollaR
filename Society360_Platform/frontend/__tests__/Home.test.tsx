import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home Page', () => {
    it('renders the hero heading', () => {
        render(<Home />);

        const heading = screen.getByRole('heading', { name: /Modern Living, Simplified\./i });
        expect(heading).toBeInTheDocument();
    });

    it('renders the get started link', () => {
        render(<Home />);

        const getStartedLinks = screen.getAllByRole('link', { name: /Get Started/i });
        expect(getStartedLinks.length).toBeGreaterThan(0);
        expect(getStartedLinks[0]).toHaveAttribute('href', '/auth/register');
    });
});
