import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PermissionNodeComponent } from '../permission-node/permission-node';
import { PermissionService } from '../../@core/services/permission.service';
import { MOCK_PERMISSIONS } from '../../@core/mocks/permissions.mock';

@Component({
  selector: 'app-permission-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, PermissionNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-tree.html',
  styleUrls: ['./permission-tree.scss'],
})
export class PermissionTreeComponent {
  readonly service = inject(PermissionService);
  searchText = '';

  ngOnInit() {
    this.service.loadInitialData(MOCK_PERMISSIONS);
  }

  onSearch(term: string) {
    this.service.setSearchTerm(term);
  }

  onToggle(event: { id: number; selected: boolean }) {
    this.service.toggleNode(event.id, event.selected);
  }
}
