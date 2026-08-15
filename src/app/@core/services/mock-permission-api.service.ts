import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PermissionNode } from '../models/interfaces/permission-node.model';
import { MOCK_PERMISSIONS } from '../mocks/permissions.mock';

@Injectable({ providedIn: 'root' })
export class MockPermissionApiService {
  private readonly allPermissions: PermissionNode[] = JSON.parse(JSON.stringify(MOCK_PERMISSIONS));
  /**
   * شبیه‌سازی API سمت سرور:
   * GET /api/permissions/search?q={term}
   *
   * با تاخیر تصادفی شبکه برای تست لغو Requestهای قبلی
   */
  search(term: string): Observable<PermissionNode[]> {
    const filtered = this.filterNodes(this.allPermissions, term.trim().toLowerCase());
    return of(filtered).pipe(delay(300 + Math.random() * 400));
  }

  private filterNodes(nodes: PermissionNode[], term: string): PermissionNode[] {
    if (!term) return nodes;

    return nodes.reduce<PermissionNode[]>((acc, node) => {
      const matches = node.title.toLowerCase().includes(term);
      const filteredChildren = node.children?.length ? this.filterNodes(node.children, term) : [];

      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: matches ? node.children : filteredChildren,
        });
      }
      return acc;
    }, []);
  }
}
