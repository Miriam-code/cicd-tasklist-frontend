import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const baseTask: Task = {
  id: 1,
  title: 'Ma tâche',
  description: 'Une description',
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
  it('renders task details', () => {
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
    expect(screen.getByText('Une description')).toBeInTheDocument();
  });

  it('does not render a description when it is null', () => {
    render(<TaskItem task={{ ...baseTask, description: null }} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.queryByText('Une description')).not.toBeInTheDocument();
  });

  it('calls onToggle when the checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<TaskItem task={baseTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('enters edit mode, saves trimmed values, and exits editing', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByLabelText('Modifier'));
    fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: '  Updated  ' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEdit).toHaveBeenCalledWith(1, { title: 'Updated', description: 'Une description' });
    expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
  });

  it('does not save when the edited title is empty', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByLabelText('Modifier'));
    fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
  });

  it('cancels editing and restores original values', () => {
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Modifier'));
    fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText('Annuler'));

    expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
  });

  it('requires a second click on delete to confirm', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

    const deleteButton = screen.getByLabelText('Supprimer');
    fireEvent.click(deleteButton);
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
