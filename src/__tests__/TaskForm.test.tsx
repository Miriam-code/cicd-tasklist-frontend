import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders create mode by default', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
    expect(screen.getByText('Ajouter')).toBeInTheDocument();
  });

  it('shows a validation error when submitting an empty title', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    fireEvent.submit(screen.getByTestId('task-form'));

    expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
  });

  it('clears the validation error once the user starts typing', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    fireEvent.submit(screen.getByTestId('task-form'));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'New title' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onSubmit with trimmed values and resets fields in create mode', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: '  My task  ' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '  desc  ' } });
    fireEvent.submit(screen.getByTestId('task-form'));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'My task', description: 'desc' });
    expect(screen.getByLabelText('Titre')).toHaveValue('');
  });

  it('omits description when left blank', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Task only' } });
    fireEvent.submit(screen.getByTestId('task-form'));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Task only', description: undefined });
  });

  it('renders edit mode with initial values and does not clear after submit', () => {
    const onSubmit = vi.fn();
    render(
      <TaskForm
        onSubmit={onSubmit}
        mode="edit"
        initialValues={{ title: 'Existing', description: 'Existing desc' }}
      />
    );

    expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toHaveValue('Existing');

    fireEvent.submit(screen.getByTestId('task-form'));

    expect(onSubmit).toHaveBeenCalled();
    expect(screen.getByLabelText('Titre')).toHaveValue('Existing');
  });

  it('renders a cancel button and calls onCancel when clicked', () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Annuler'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('does not render a cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
  });
});
