import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
  id: 1,
  title: 'Test',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('taskApi', () => {
  describe('getTasks', () => {
    it('returns array on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve([mockTask]),
        })
      );

      const tasks = await getTasks();

      expect(tasks).toEqual([mockTask]);
      expect(fetch).toHaveBeenCalledWith('/api/tasks');
    });

    it('throws an error when the response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server error'),
        })
      );

      await expect(getTasks()).rejects.toThrow('HTTP 500: Server error');
    });
  });

  describe('getTask', () => {
    it('returns the task on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockTask),
        })
      );

      const task = await getTask(1);

      expect(task).toEqual(mockTask);
      expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
    });

    it('throws an error when the task is not found', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not found'),
        })
      );

      await expect(getTask(999)).rejects.toThrow('HTTP 404: Not found');
    });
  });

  describe('createTask', () => {
    it('posts the task and returns the created task', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockTask),
        })
      );

      const result = await createTask({ title: 'Test', description: 'desc' });

      expect(result).toEqual(mockTask);
      expect(fetch).toHaveBeenCalledWith('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', description: 'desc' }),
      });
    });

    it('throws an error when creation fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          text: () => Promise.resolve('Bad request'),
        })
      );

      await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400: Bad request');
    });
  });

  describe('updateTask', () => {
    it('updates the task and returns it', async () => {
      const updated = { ...mockTask, title: 'Updated' };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(updated),
        })
      );

      const result = await updateTask(1, { title: 'Updated' });

      expect(result).toEqual(updated);
      expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });
    });

    it('throws an error when the update fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not found'),
        })
      );

      await expect(updateTask(999, { title: 'X' })).rejects.toThrow('HTTP 404: Not found');
    });
  });

  describe('deleteTask', () => {
    it('resolves when the deletion succeeds', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

      await expect(deleteTask(1)).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
    });

    it('throws an error when the deletion fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server error'),
        })
      );

      await expect(deleteTask(1)).rejects.toThrow('HTTP 500: Server error');
    });
  });
});
