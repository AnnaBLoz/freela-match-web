import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Profile {
  name?: string;
  biography?: string;
  userSkills: any;
  pricePerHour?: number;
  experienceLevel?: ExperienceLevel;
}

interface EditForm {
  name?: string;
  biography?: string;
  userSkills: any;
  pricePerHour?: number;
  experienceLevel?: ExperienceLevel;
}

enum ExperienceLevel {
  Junior = 1,
  Pleno,
  Senior,
  Especialista,
}

export const ExperienceYears: Record<ExperienceLevel, string> = {
  [ExperienceLevel.Junior]: '0 – 2 anos',
  [ExperienceLevel.Pleno]: '2 – 5 anos',
  [ExperienceLevel.Senior]: '5 – 10 anos',
  [ExperienceLevel.Especialista]: '10+ anos',
};

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css',
})
export class ProfileInfoComponent {
  ExperienceYears = ExperienceYears;

  @Input() profile: Profile | null = null;
  @Input() isEditing = false;
  @Input() editForm: EditForm = {
    userSkills: undefined,
  };
  @Output() updateEditForm = new EventEmitter<EditForm>();

  onEditFormChange(field: string, value: any): void {
    const updated = { ...this.editForm, [field]: value };
    this.updateEditForm.emit(updated);
  }

  getExperienceName(level?: ExperienceLevel) {
    if (level === undefined || level === null)
      return 'Nenhuma experiência adicionada.';
    return ExperienceLevel[level];
  }
}
