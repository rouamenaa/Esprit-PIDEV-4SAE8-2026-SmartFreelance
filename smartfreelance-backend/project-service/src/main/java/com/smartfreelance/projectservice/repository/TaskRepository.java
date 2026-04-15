package com.smartfreelance.projectservice.repository;

import com.smartfreelance.projectservice.entity.Task;
import com.smartfreelance.projectservice.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);
    //List<Task> findByProjectPhaseId(Long phaseId);
    List<Task> findByPhaseId(Long phaseId);

}