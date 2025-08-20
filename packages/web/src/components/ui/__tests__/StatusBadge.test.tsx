import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('should render passed status correctly', () => {
    render(<StatusBadge status="passed" />);

    const badge = screen.getByText('Passed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'bg-green-900/30',
      'text-green-400',
      'border-green-500/50'
    );

    // Should have CheckCircle icon
    const icon = badge.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render failed status correctly', () => {
    render(<StatusBadge status="failed" />);

    const badge = screen.getByText('Failed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'bg-red-900/30',
      'text-red-400',
      'border-red-500/50'
    );
  });

  it('should render skipped status correctly', () => {
    render(<StatusBadge status="skipped" />);

    const badge = screen.getByText('Skipped');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'bg-gray-700/50',
      'text-gray-400',
      'border-gray-500/50'
    );
  });

  it('should render timedOut status correctly', () => {
    render(<StatusBadge status="timedOut" />);

    const badge = screen.getByText('Timed Out');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'bg-yellow-900/30',
      'text-yellow-400',
      'border-yellow-500/50'
    );
  });

  it('should render different sizes', () => {
    const { rerender } = render(<StatusBadge status="passed" size="sm" />);
    expect(screen.getByText('Passed')).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<StatusBadge status="passed" size="md" />);
    expect(screen.getByText('Passed')).toHaveClass(
      'px-2.5',
      'py-1.5',
      'text-sm'
    );

    rerender(<StatusBadge status="passed" size="lg" />);
    expect(screen.getByText('Passed')).toHaveClass('px-3', 'py-2', 'text-base');
  });

  it('should render without icon when showIcon is false', () => {
    render(<StatusBadge status="passed" showIcon={false} />);

    const badge = screen.getByText('Passed');
    expect(badge).toBeInTheDocument();

    const icon = badge.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('should render with icon by default', () => {
    render(<StatusBadge status="passed" />);

    const badge = screen.getByText('Passed');
    const icon = badge.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<StatusBadge status="passed" className="custom-class" />);

    expect(screen.getByText('Passed')).toHaveClass('custom-class');
  });

  it('should have proper icon sizes for different badge sizes', () => {
    const { rerender } = render(<StatusBadge status="passed" size="sm" />);
    let icon = screen.getByText('Passed').querySelector('svg');
    expect(icon).toHaveClass('h-3', 'w-3');

    rerender(<StatusBadge status="passed" size="md" />);
    icon = screen.getByText('Passed').querySelector('svg');
    expect(icon).toHaveClass('h-4', 'w-4');

    rerender(<StatusBadge status="passed" size="lg" />);
    icon = screen.getByText('Passed').querySelector('svg');
    expect(icon).toHaveClass('h-5', 'w-5');
  });

  it('should have consistent base classes', () => {
    render(<StatusBadge status="passed" />);

    const badge = screen.getByText('Passed');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'font-medium',
      'rounded-full',
      'border'
    );
  });

  it('should render all status types with correct labels', () => {
    const statuses = [
      { status: 'passed' as const, label: 'Passed' },
      { status: 'failed' as const, label: 'Failed' },
      { status: 'skipped' as const, label: 'Skipped' },
      { status: 'timedOut' as const, label: 'Timed Out' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('should maintain icon margin when icon is shown', () => {
    render(<StatusBadge status="passed" showIcon={true} />);

    const badge = screen.getByText('Passed');
    const icon = badge.querySelector('svg');
    expect(icon).toHaveClass('mr-1.5');
  });

  it('should combine size and status classes correctly', () => {
    render(<StatusBadge status="failed" size="lg" className="extra-class" />);

    const badge = screen.getByText('Failed');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'font-medium',
      'rounded-full',
      'border',
      'bg-red-900/30',
      'text-red-400',
      'border-red-500/50',
      'px-3',
      'py-2',
      'text-base',
      'extra-class'
    );
  });
});
