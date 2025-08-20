import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import { Table, TableColumn } from '../Table';

interface TestData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  count: number;
  [key: string]: unknown;
}

const mockData: TestData[] = [
  { id: '1', name: 'Item 1', status: 'active', count: 10 },
  { id: '2', name: 'Item 2', status: 'inactive', count: 5 },
  { id: '3', name: 'Item 3', status: 'active', count: 15 },
];

const mockColumns: TableColumn<TestData>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <span className={value === 'active' ? 'text-green-400' : 'text-red-400'}>
        {value as string}
      </span>
    ),
  },
  {
    key: 'count',
    header: 'Count',
    sortable: true,
    className: 'text-right',
  },
];

describe('Table', () => {
  it('should render table with data', () => {
    render(<Table<TestData> columns={mockColumns} data={mockData} />);

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render custom cell content using render function', () => {
    render(<Table<TestData> columns={mockColumns} data={mockData} />);

    const activeStatus = screen.getAllByText('active');
    const inactiveStatus = screen.getAllByText('inactive');

    expect(activeStatus[0]).toHaveClass('text-green-400');
    expect(inactiveStatus[0]).toHaveClass('text-red-400');
  });

  it('should handle sorting', () => {
    const onSort = vi.fn();
    render(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        onSort={onSort}
        sortBy="name"
        sortDirection="asc"
      />
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameHeader);

    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('should display sort icons correctly', () => {
    render(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        sortBy="name"
        sortDirection="asc"
      />
    );

    // Should show up arrow for ascending sort
    const nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader.querySelector('svg')).toBeInTheDocument();
  });

  it('should show loading state with skeleton rows', () => {
    render(
      <Table<TestData>
        columns={mockColumns}
        data={[]}
        loading={true}
        skeletonRows={3}
      />
    );

    // Should show skeleton rows
    const skeletonElements = screen.getAllByRole('cell');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Check for skeleton animation
    const firstSkeleton = document.querySelector('.animate-pulse');
    expect(firstSkeleton).toBeInTheDocument();
  });

  it('should show error state', () => {
    const error = new Error('Failed to load data');
    const onRetry = vi.fn();

    render(
      <Table<TestData>
        columns={mockColumns}
        data={[]}
        error={error}
        onRetry={onRetry}
      />
    );

    expect(screen.getAllByText('Failed to load data')[0]).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should show empty state when no data', () => {
    render(
      <Table<TestData>
        columns={mockColumns}
        data={[]}
        emptyTitle="No items found"
        emptyDescription="There are no items to display"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(
      screen.getByText('There are no items to display')
    ).toBeInTheDocument();
  });

  it('should handle row clicks', () => {
    const onRowClick = vi.fn();
    render(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    const firstRow = screen.getByText('Item 1').closest('tr');
    fireEvent.click(firstRow!);

    expect(onRowClick).toHaveBeenCalledWith(mockData[0], 0);
  });

  it('should apply custom row classes', () => {
    const rowClassName = (row: TestData) =>
      row.status === 'active' ? 'bg-green-900' : 'bg-red-900';

    render(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        rowClassName={rowClassName}
      />
    );

    const firstRow = screen.getByText('Item 1').closest('tr');
    expect(firstRow).toHaveClass('bg-green-900');
  });

  it('should handle columns with custom classes', () => {
    const columnsWithClasses: TableColumn<TestData>[] = [
      {
        key: 'name',
        header: 'Name',
        className: 'font-bold',
        headerClassName: 'bg-blue-500',
      },
      {
        key: 'count',
        header: 'Count',
        className: 'text-right',
        width: '100px',
      },
    ];

    render(<Table<TestData> columns={columnsWithClasses} data={mockData} />);

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveClass('bg-blue-500');
    expect(nameHeader).toHaveStyle({ width: undefined }); // width not set on name column

    const countHeader = screen.getByText('Count').closest('th');
    expect(countHeader).toHaveStyle({ width: '100px' });

    const nameCell = screen.getByText('Item 1').closest('td');
    expect(nameCell).toHaveClass('font-bold');
  });

  it('should handle mobile responsive columns', () => {
    const responsiveColumns: TableColumn<TestData>[] = [
      {
        key: 'name',
        header: 'Name',
      },
      {
        key: 'status',
        header: 'Status',
        hideOnMobile: true,
      },
    ];

    render(<Table<TestData> columns={responsiveColumns} data={mockData} />);

    const statusHeader = screen.getByText('Status').closest('th');
    expect(statusHeader).toHaveClass('hidden', 'sm:table-cell');
  });

  it('should not show empty state when showEmptyState is false', () => {
    render(
      <Table<TestData>
        columns={mockColumns}
        data={[]}
        showEmptyState={false}
        emptyMessage="Custom empty message"
      />
    );

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    expect(screen.queryByText('No data found')).not.toBeInTheDocument();
  });

  it('should handle string errors', () => {
    render(
      <Table<TestData>
        columns={mockColumns}
        data={[]}
        error="String error message"
      />
    );

    expect(screen.getByText('String error message')).toBeInTheDocument();
  });

  it('should handle error objects with message property', () => {
    const error = { message: 'Custom error object' };
    render(<Table<TestData> columns={mockColumns} data={[]} error={error} />);

    expect(screen.getByText('Custom error object')).toBeInTheDocument();
  });

  it('should show non-sortable columns without sort buttons', () => {
    const nonSortableColumns: TableColumn<TestData>[] = [
      {
        key: 'name',
        header: 'Name',
        sortable: false,
      },
    ];

    render(<Table<TestData> columns={nonSortableColumns} data={mockData} />);

    const nameHeader = screen.getByText('Name');
    expect(nameHeader.closest('button')).not.toBeInTheDocument();
  });

  it('should show correct sort direction icons', () => {
    const { rerender } = render(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        sortBy="name"
        sortDirection="asc"
      />
    );

    // Check ascending icon
    let nameButton = screen.getByRole('button', { name: /name/i });
    expect(nameButton.querySelector('svg')).toBeInTheDocument();

    rerender(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        sortBy="name"
        sortDirection="desc"
      />
    );

    // Check descending icon
    nameButton = screen.getByRole('button', { name: /name/i });
    expect(nameButton.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply custom table className', () => {
    render(
      <Table<TestData>
        columns={mockColumns}
        data={mockData}
        className="custom-table-class"
      />
    );

    const tableContainer = document.querySelector('.custom-table-class');
    expect(tableContainer).toBeInTheDocument();
  });

  it('should handle retrying state', () => {
    const onRetry = vi.fn();
    render(
      <Table<TestData>
        columns={mockColumns}
        data={[]}
        error="Error occurred"
        onRetry={onRetry}
        retrying={true}
      />
    );

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });
});
