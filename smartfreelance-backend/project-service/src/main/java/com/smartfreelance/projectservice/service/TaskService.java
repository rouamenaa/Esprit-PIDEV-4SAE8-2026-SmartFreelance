package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.Task;

import java.util.List;

public interface TaskService {
    Task createTask(Task task);
    List<Task> getTasksByPhaseId(Long phaseId);
    Task getTaskById(Long id);
    Task updateTask(Long id, Task task);
    void deleteTask(Long id);
}
