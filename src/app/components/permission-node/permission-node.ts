import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { PermissionNode } from '../../@core/models/interfaces/permission-node.model';

@Component({
  selector: 'app-permission-node',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:"./permission-node.html" ,
  styleUrls: ["./permission-node.scss"],
})
export class PermissionNodeComponent {
  readonly node = input.required<PermissionNode>();
  readonly level = input<number>(0);
  readonly toggle = output<{ id: number; selected: boolean }>();

  readonly hasChildren = computed(() => !!this.node().children && this.node().children!.length > 0);
  readonly expanded = signal(true);

  onChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggle.emit({ id: this.node().id, selected: checked });
  }

  toggleExpand() {
    this.expanded.update((v) => !v);
  }
}
