// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ArticleBlockRenderer from '../ArticleBlockRenderer';
import React from 'react';

// Mock RichTextContent since it might rely on DOMPurify which can be tricky in JSDOM if not configured
vi.mock('../RichTextContent', () => ({
  default: ({ html }: { html: string }) => <div data-testid="mock-richtext">{html}</div>
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, className }: any) => <a href={href} className={className}>{children}</a>
}));

describe('ArticleBlockRenderer', () => {
  it('renders nothing if blocks are null or invalid', () => {
    const { container } = render(<ArticleBlockRenderer blocks={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('ignores invalid or unknown block types', () => {
    const blocks = [{ type: 'unknown_magic', content: 'hello' }];
    const { container } = render(<ArticleBlockRenderer blocks={blocks} />);
    // The container will render the wrapper div, but it should be empty inside.
    expect(container.textContent).toBe('');
  });

  it('renders a valid intro block safely', () => {
    const blocks = [{ type: 'intro', content: 'Welcome to the <b>jungle</b>' }];
    render(<ArticleBlockRenderer blocks={blocks} />);
    expect(screen.getByTestId('mock-richtext')).toHaveTextContent('Welcome to the <b>jungle</b>');
  });

  it('renders ranked_item and does not show an empty image box if image is missing', () => {
    const blocks = [{
      type: 'ranked_item',
      data: {
        rank: 1,
        title: 'Mr. Gold',
        description: 'Rare figure'
      }
    }];
    render(<ArticleBlockRenderer blocks={blocks} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Mr. Gold')).toBeInTheDocument();
    // Verify the "Görsel Yakında" placeholder is NO LONGER rendered.
    expect(screen.queryByText('Görsel Yakında')).not.toBeInTheDocument();
  });

  it('removes the link button entirely if the ranked_item link contains a malicious URL', () => {
    const blocks = [{
      type: 'ranked_item',
      data: {
        title: 'Safe Link',
        link: 'javascript:alert("XSS")'
      }
    }];
    render(<ArticleBlockRenderer blocks={blocks} />);
    const link = screen.queryByText(/İlgili Sayfaya Git/i);
    expect(link).not.toBeInTheDocument();
  });

  it('does not crash if FAQ questions array is empty or malformed', () => {
    const blocks = [{ type: 'faq', data: { questions: [] } }];
    const { container } = render(<ArticleBlockRenderer blocks={blocks} />);
    expect(screen.queryByText('Sıkça Sorulan Sorular')).not.toBeInTheDocument();
  });

  it('renders TOC block correctly with safe titles as a single inline block', () => {
    const blocks = [{
      type: 'toc',
      data: {
        items: [
          { title: 'Item 1', id: 'item-1' },
          { title: 'Item <script>alert(1)</script>', id: 'item-2' }
        ]
      }
    }];
    render(<ArticleBlockRenderer blocks={blocks} />);
    expect(screen.getAllByText('İçindekiler')).toHaveLength(1);
    expect(screen.getAllByText('Item 1')).toHaveLength(1);
    // React automatically escapes interpolation, so the text node is literally the same
    expect(screen.getAllByText('Item <script>alert(1)</script>')).toHaveLength(1);
  });
});
