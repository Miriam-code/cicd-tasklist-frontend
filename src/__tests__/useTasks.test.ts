import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/taskApi', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import * as taskApi from '../api/taskApi';
import { useTasks } from '../hooks/useTasks';

const mockApi = vi.mocked(taskApi);

const mockTask = {
  id: 1,
  title: 'Task 1',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads tasks successfully on mount', async () => {
    mockApi.getTasks.mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual([mockTask]);
    expect(result.current.error).toBeNull();
  });

  it('sets an error message when loading fails', async () => {
    mockApi.getTasks.mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network down');
  });

  it('sets a generic error message for non-Error rejections', async () => {
    mockApi.getTasks.mockRejectedValue('plain string');

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Une erreur est survenue');
  });

  it('adds a new task to the front of the list', async () => {
    mockApi.getTasks.mockResolvedValue([mockTask]);
    const newTask = { ...mockTask, id: 2, title: 'New task' };
    mockApi.createTask.mockResolvedValue(newTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask({ title: 'New task' });
    });

    expect(result.current.tasks).toEqual([newTask, mockTask]);
  });

  it('edits an existing task', async () => {
    mockApi.getTasks.mockResolvedValue([mockTask]);
    const updated = { ...mockTask, title: 'Updated' };
    mockApi.updateTask.mockResolvedValue(updated);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editTask(1, { title: 'Updated' });
    });

    expect(result.current.tasks).toEqual([updated]);
  });

  it('removes a task', async () => {
    mockApi.getTasks.mockResolvedValue([mockTask]);
    mockApi.deleteTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask(1);
    });

    expect(result.current.tasks).toEqual([]);
  });

  it('toggles task completion', async () => {
    mockApi.getTasks.mockResolvedValue([mockTask]);
    const toggled = { ...mockTask, completed: true };
    mockApi.updateTask.mockResolvedValue(toggled);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(1);
    });

    expect(mockApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
    expect(result.current.tasks).toEqual([toggled]);
  });

  it('does nothing when toggling a task that does not exist', async () => {
    mockApi.getTasks.mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(999);
    });

    expect(mockApi.updateTask).not.toHaveBeenCalled();
  });
});
