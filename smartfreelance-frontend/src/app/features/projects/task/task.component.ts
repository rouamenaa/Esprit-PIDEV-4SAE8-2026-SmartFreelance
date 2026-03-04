import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnChanges {

  @Input() phaseId!: number; 

  tasks: Task[] = [];
searchTerm: string = '';
taskSubmitAttempted: boolean = false;
showDeleteModal: boolean = false;
taskToDeleteId: number | undefined = undefined;
taskToDeleteName: string = '';

selectedStatus: string = '';
selectedPriority: string = '';

sortField: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

filteredTasks: Task[] = [];
  newTask: Task = {
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    phase: undefined
  };

  // Tâche en cours d'édition
  editingTask: Task | null = null;

  constructor(private taskService: TaskService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['phaseId'] && this.phaseId) {
      this.loadTasks();
    }
  }

  // Charger toutes les tâches de la phase
  loadTasks(): void {
  if (!this.phaseId) return;

  this.taskService.getTasksByPhaseId(this.phaseId).subscribe({
    next: data => {
      this.tasks = data;
      this.filteredTasks = data;
    },
    error: err => console.error('Error loading tasks:', err)
  });
}
tryAddTask(): void {
  this.taskSubmitAttempted = true;
  if (!this.newTask.title?.trim()) return;
  this.addTask();
  this.taskSubmitAttempted = false;
}

trySaveEdit(): void {
  if (!this.editingTask?.title?.trim()) return;
  this.saveEdit();
}

  // Ajouter une nouvelle tâche
  addTask(): void {
    if (!this.phaseId || !this.newTask.title) return;

    const taskToCreate: Task = {
      ...this.newTask,
      phase: { id: this.phaseId }
    };

    this.taskService.createTask(taskToCreate).subscribe({
      next: () => {
        this.newTask = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', phase: undefined };
        this.loadTasks();
      },
      error: err => console.error('Error creating task:', err)
    });
  }

  // Supprimer une tâche
  deleteTask(id: number | undefined): void {
  if (!id) return;
  const task = this.tasks.find(t => t.id === id);
  this.taskToDeleteId = id;
  this.taskToDeleteName = task?.title || 'this task';
  this.showDeleteModal = true;
}
confirmDelete(): void {
  if (!this.taskToDeleteId) return;
  this.taskService.deleteTask(this.taskToDeleteId).subscribe({
    next: () => {
      this.loadTasks();
      this.closeDeleteModal();
    },
    error: err => {
      console.error('Error deleting task:', err);
      this.closeDeleteModal();
    }
  });
}

closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.taskToDeleteId = undefined;
  this.taskToDeleteName = '';
}
  // Mettre à jour uniquement le statut
  updateStatus(task: Task, status: Task['status']): void {
    task.status = status;
    if (!task.id) return;

    this.taskService.updateTask(task.id, task).subscribe({
      next: () => this.loadTasks(),
      error: err => console.error('Error updating status:', err)
    });
  }

  // Commencer l'édition d'une tâche
  startEdit(task: Task) {
    this.editingTask = { ...task }; // clone pour éviter modification directe
  }

  // Sauvegarder la tâche éditée
  saveEdit() {
    if (!this.editingTask || !this.editingTask.id) return;

    this.taskService.updateTask(this.editingTask.id, this.editingTask).subscribe({
      next: () => {
        this.editingTask = null;
        this.loadTasks();
      },
      error: err => console.error('Error updating task:', err)
    });
  }

  // Annuler l'édition
  cancelEdit() {
    this.editingTask = null;
  }
  applyFilters(): void {

  let result = this.tasks.filter(task => {

    const matchesSearch =
      !this.searchTerm ||
      task.title.toLowerCase().includes(this.searchTerm.toLowerCase());

    const matchesStatus =
      !this.selectedStatus ||
      task.status === this.selectedStatus;

    const matchesPriority =
    !this.selectedPriority ||
      task.priority === this.selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // TRI
  if (this.sortField) {
    result = result.sort((a: any, b: any) => {

      let valueA = a[this.sortField];
      let valueB = b[this.sortField];

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  this.filteredTasks = result;
}
sortBy(field: string): void {

  if (this.sortField === field) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortField = field;
    this.sortDirection = 'asc';
  }

  this.applyFilters();
}
}