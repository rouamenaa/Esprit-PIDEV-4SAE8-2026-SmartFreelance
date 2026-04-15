package com.smartfreelance.projectservice.service;

import com.smartfreelance.projectservice.entity.ProjectPhase;
import com.smartfreelance.projectservice.entity.Task;
import com.smartfreelance.projectservice.enums.PhaseStatus;
import com.smartfreelance.projectservice.repository.ProjectPhaseRepository;
import com.smartfreelance.projectservice.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectPhaseRepository phaseRepository;
    private final ProjectService projectService;

    public TaskServiceImpl(TaskRepository taskRepository,
                           ProjectPhaseRepository phaseRepository,
                           ProjectService projectService) {
        this.taskRepository = taskRepository;
        this.phaseRepository = phaseRepository;
        this.projectService = projectService;
    }

    @Override
    public Task createTask(Task task) {

        if (task.getPhase() == null || task.getPhase().getId() == null) {
            throw new RuntimeException("Phase is required");
        }

        ProjectPhase phase = phaseRepository.findById(task.getPhase().getId())
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        task.setPhase(phase);

        return taskRepository.save(task);
    }

    @Override
    public List<Task> getTasksByPhaseId(Long phaseId) {
        return taskRepository.findByPhaseId(phaseId);
    }

    @Override
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Override
    public Task updateTask(Long id, Task task) {

        Task existing = getTaskById(id);

        existing.setTitle(task.getTitle());
        existing.setDescription(task.getDescription());
        existing.setAssignedTo(task.getAssignedTo());
        existing.setStatus(task.getStatus());
        existing.setPriority(task.getPriority());

        Task savedTask = taskRepository.save(existing);

        // 🔥 LOGIQUE MÉTIER AUTOMATIQUE
        if (savedTask.getStatus().name().equals("DONE")) {
            updatePhaseAndProject(savedTask.getPhase().getId());
        }

        return savedTask;
    }

    private void updatePhaseAndProject(Long phaseId) {

        ProjectPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        boolean allTasksDone = phase.getTasks().stream()
                .allMatch(t -> t.getStatus().name().equals("DONE"));

        if (allTasksDone && !phase.getTasks().isEmpty()) {

            phase.setStatus(PhaseStatus.COMPLETED);
            phaseRepository.save(phase);

            Long projectId = phase.getProject().getId();
            projectService.autoCompleteProjectIfNeeded(projectId);
        }
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}