import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
export class ProfileInfoComponent implements OnInit {
  ExperienceYears = ExperienceYears;

  @Input() profile: Profile | null = null;
  @Input() isEditing = false;
  @Input() skills: any[] = [];
  @Input() editForm: EditForm = {
    userSkills: undefined,
  };
  @Output() updateEditForm = new EventEmitter<EditForm>();

  skillSearch = '';
  filteredSkills: any[] = [];

  ngOnInit() {
    this.filteredSkills = [...this.skills];
  }

  onEditFormChange(field: string, value: any): void {
    const updated = { ...this.editForm, [field]: value };
    this.updateEditForm.emit(updated);
  }

  getExperienceName(level?: ExperienceLevel) {
    if (level === undefined || level === null)
      return 'Nenhuma experiência adicionada.';
    return ExperienceLevel[level];
  }

  filterSkills() {
    if (!Array.isArray(this.skills)) {
      this.filteredSkills = [];
      return;
    }

    const search = this.skillSearch.toLowerCase().trim();

    if (!search) {
      this.filteredSkills = [];
      return;
    }

    this.filteredSkills = this.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(search) &&
        !this.editForm.userSkills?.some((us: any) => us.skillId === s.skillId)
    );
  }

  addSkill(skill: any) {
    if (!this.editForm.userSkills) this.editForm.userSkills = [];
    this.editForm.userSkills.push(skill);

    this.skillSearch = '';
    this.filteredSkills = [];

    this.updateEditForm.emit(this.editForm);
  }

  removeSkill(skill: any) {
    this.editForm.userSkills = this.editForm.userSkills.filter(
      (s: any) => s.skillId !== skill.skillId
    );
    this.updateEditForm.emit(this.editForm);
  }

  addSkillFromInput() {
    if (!this.skillSearch) return;
    const skill = this.skills.find(
      (s) => s.name.toLowerCase() === this.skillSearch.toLowerCase()
    );
    if (skill) this.addSkill(skill);
  }
}
