import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GeneralService } from 'src/app/core/services/generalService.service';
import { Skill } from 'src/app/core/services/profileService.service';

interface Profile {
  name?: string;
  biography?: string;
  website: string;
  pricePerHour?: number;
  sector?: Sector;
}

interface EditForm {
  name?: string;
  biography?: string;
  website: string;
  pricePerHour?: number;
  sector?: Sector;
}

interface Sector {
  sectorId: number;
  name: string;
}

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css',
})
export class ProfileInfoComponent {
  @Input() profile: Profile | null = null;
  @Input() isEditing = false;
  @Input() skills: Skill[] = [];
  @Input() editForm: EditForm;
  @Output() updateEditForm = new EventEmitter<EditForm>();

  skillSearch = '';
  sectors: Sector[] = [];

  constructor(private generalService: GeneralService) {}

  onEditFormChange(field: string, value: EditForm): void {
    const updated = { ...this.editForm, [field]: value };
    this.updateEditForm.emit(updated);
  }
}
