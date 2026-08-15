import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PermissionTreeComponent } from './components/permission-tree/permission-tree';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PermissionTreeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('angular-permission-tree');
}
