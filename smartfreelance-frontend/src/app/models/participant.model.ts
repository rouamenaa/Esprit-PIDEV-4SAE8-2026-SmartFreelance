export interface Participant {
  id: number;
  fullName: string;
  email: string;
  registrationDate: string;
  status: 'REGISTERED' | 'CANCELLED';
  calendarSyncStatus: 'SYNC_OK' | 'SYNC_FAILED';
}

export interface ParticipantRequestDTO {
  fullName: string;
  email: string;
}

export interface ParticipantResponseDTO {
  id: number;
  fullName: string;
  email: string;
  registrationDate: string;
  status: 'REGISTERED' | 'CANCELLED';
  calendarSyncStatus: 'SYNC_OK' | 'SYNC_FAILED';
}