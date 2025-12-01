import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

interface Skill {
  skillId: number;
  name: string;
}

interface UserSkill {
  skillId: number;
  name: string;
}

interface Profile {
  name?: string;
  biography?: string;
  userSkills?: UserSkill[];
  pricePerHour?: number;
  experienceLevel?: ExperienceLevel;
}

interface EditForm {
  name?: string;
  biography?: string;
  userSkills?: UserSkill[];
  pricePerHour?: number;
  experienceLevel?: ExperienceLevel;
}

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css',
})
export class ProfileInfoComponent implements OnInit {
  ExperienceYears = ExperienceYears;

  @Input() profile: Profile | null = null;
  @Input() isEditing = false;
  @Input() skills: Skill[] = [];
  @Input() editForm: EditForm = {
    userSkills: undefined,
  };
  @Output() updateEditForm = new EventEmitter<EditForm>();

  skillSearch = '';
  filteredSkills: Skill[] = [];

  ngOnInit() {
    this.filteredSkills = [...this.skills];
  }

  onEditFormChange(
    field: keyof EditForm,
    value: string | number | UserSkill[] | ExperienceLevel
  ): void {
    const updated = { ...this.editForm, [field]: value };
    this.updateEditForm.emit(updated);
  }

  getExperienceName(level?: ExperienceLevel): string {
    if (level === undefined || level === null)
      return 'Nenhuma experiência adicionada.';
    return ExperienceLevel[level];
  }

  filterSkills(): void {
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
        !this.editForm.userSkills?.some((us) => us.skillId === s.skillId)
    );
  }

  addSkill(skill: Skill): void {
    if (!this.editForm.userSkills) {
      this.editForm.userSkills = [];
    }

    const userSkill: UserSkill = {
      skillId: skill.skillId,
      name: skill.name,
    };

    this.editForm.userSkills.push(userSkill);

    this.skillSearch = '';
    this.filteredSkills = [];

    this.updateEditForm.emit(this.editForm);
  }

  removeSkill(skill: UserSkill): void {
    if (!this.editForm.userSkills) return;

    this.editForm.userSkills = this.editForm.userSkills.filter(
      (s) => s.skillId !== skill.skillId
    );
    this.updateEditForm.emit(this.editForm);
  }

  addSkillFromInput(): void {
    if (!this.skillSearch) return;

    const skill = this.skills.find(
      (s) => s.name.toLowerCase() === this.skillSearch.toLowerCase()
    );

    if (skill) {
      this.addSkill(skill);
    }
  }
}
