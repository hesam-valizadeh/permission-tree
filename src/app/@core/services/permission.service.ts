import { Injectable, computed, inject, signal } from '@angular/core';
import { Subject, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { MockPermissionApiService } from './mock-permission-api.service';
import { PermissionNode } from '../models/interfaces/permission-node.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly api = inject(MockPermissionApiService);

  /** داده اصلی (Source of Truth) - هرگز در جستجو تخریب نمی‌شود */
  private readonly _workingTree = signal<PermissionNode[]>([]);

  /** ترم جستجو */
  private readonly _searchTerm = signal<string>('');

  /** درخت نمایشی: فیلتر شده و Immutable */
  readonly displayTree = computed(() => {
    const term = this._searchTerm().trim().toLowerCase();
    const tree = this._workingTree();
    if (!term) return tree;
    return this.filterTreeImmutable(tree, term);
  });

  /** IDهای انتخاب‌شده - Derived Signal */
  readonly selectedIds = computed(() => this.extractSelectedIds(this._workingTree()));

  /** وضعیت جستجو */
  readonly searching = signal(false);

  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.api.search(term)),
      )
      .subscribe((apiResult) => {
        // در این پیاده‌سازی، API ساختار فیلترشده برمی‌گرداند
        // اما Selection State را از درخت اصلی حفظ می‌کنیم
        const stateMap = this.buildStateMap(this._workingTree());
        const merged = this.mergeStateIntoTree(apiResult, stateMap);
        this._workingTree.set(merged);
        this.searching.set(false);
      });
  }

  /** بارگذاری اولیه */
  loadInitialData(data: PermissionNode[]) {
    this._workingTree.set(this.cloneTree(data));
  }

  /** تغییر وضعیت یک نود (با propagation بالا و پایین) */
  toggleNode(targetId: number, selected: boolean) {
    const current = this._workingTree();
    const updated = this.updateNodeState(current, targetId, selected);
    if (updated !== current) {
      this._workingTree.set(updated);
    }
  }

  /** متد UI-independent برای استخراج IDها */
  getSelectedPermissionIds(tree: PermissionNode[] = this._workingTree()): number[] {
    return this.extractSelectedIds(tree);
  }

  /** شروع جستجو از کامپوننت */
  setSearchTerm(term: string) {
    this.searching.set(true);
    this.searchSubject.next(term);
  }

  // ---------- الگوریتم‌های Immutable ----------

  private updateNodeState(
    nodes: PermissionNode[],
    targetId: number,
    selected: boolean,
  ): PermissionNode[] {
    let changed = false;

    const newNodes = nodes.map((node) => {
      if (node.id === targetId) {
        changed = true;
        return this.setNodeAndDescendants(node, selected);
      }

      if (node.children?.length) {
        const newChildren = this.updateNodeState(node.children, targetId, selected);
        const childrenChanged = newChildren.some((child, i) => child !== node.children![i]);

        if (childrenChanged) {
          changed = true;
          return this.recalculateNodeState(node, newChildren);
        }
      }

      return node;
    });

    return changed ? newNodes : nodes;
  }

  /** Propagation به پایین: انتخاب/حذف همه فرزندان */
  private setNodeAndDescendants(node: PermissionNode, selected: boolean): PermissionNode {
    const newNode: PermissionNode = { ...node, selected, indeterminate: false };
    if (node.children?.length) {
      newNode.children = node.children.map((child) => this.setNodeAndDescendants(child, selected));
    }
    return newNode;
  }

  /** محاسبه مجدد وضعیت Parent بر اساس فرزندان */
  private recalculateNodeState(node: PermissionNode, children: PermissionNode[]): PermissionNode {
    const allSelected = children.every((c) => c.selected);
    const someSelected = children.some((c) => c.selected || c.indeterminate);

    return {
      ...node,
      selected: allSelected,
      indeterminate: !allSelected && someSelected,
      children,
    };
  }

  /** فیلتر Immutable که ساختار درخت را حفظ می‌کند */
  private filterTreeImmutable(nodes: PermissionNode[], term: string): PermissionNode[] {
    return nodes.reduce<PermissionNode[]>((acc, node) => {
      const matches = node.title.toLowerCase().includes(term);
      const filteredChildren = node.children?.length
        ? this.filterTreeImmutable(node.children, term)
        : [];

      if (matches || filteredChildren.length > 0) {
        const newNode: PermissionNode = { ...node };
        if (!matches && filteredChildren.length > 0) {
          newNode.children = filteredChildren;
        }
        acc.push(newNode);
      }
      return acc;
    }, []);
  }

  /** استخراج بازگشتی IDها با الگوریتم Stack (غیربازگشتی برای Performance) */
  private extractSelectedIds(nodes: PermissionNode[]): number[] {
    const ids: number[] = [];
    const stack = [...nodes];

    while (stack.length) {
      const node = stack.pop()!;
      if (node.selected) ids.push(node.id);
      if (node.children?.length) stack.push(...node.children);
    }

    return ids;
  }

  private buildStateMap(nodes: PermissionNode[]): Map<number, Partial<PermissionNode>> {
    const map = new Map<number, Partial<PermissionNode>>();
    const stack = [...nodes];

    while (stack.length) {
      const node = stack.pop()!;
      map.set(node.id, {
        selected: node.selected,
        indeterminate: node.indeterminate,
      });
      if (node.children?.length) stack.push(...node.children);
    }

    return map;
  }

  private mergeStateIntoTree(
    nodes: PermissionNode[],
    stateMap: Map<number, Partial<PermissionNode>>,
  ): PermissionNode[] {
    return nodes.map((node) => {
      const state = stateMap.get(node.id);
      const newNode: PermissionNode = { ...node };

      if (state) {
        newNode.selected = state.selected ?? false;
        newNode.indeterminate = state.indeterminate;
      }

      if (node.children?.length) {
        newNode.children = this.mergeStateIntoTree(node.children, stateMap);
      }

      return newNode;
    });
  }

  private cloneTree(nodes: PermissionNode[]): PermissionNode[] {
    return nodes.map((node) => ({
      ...node,
      children: node.children?.length ? this.cloneTree(node.children) : undefined,
    }));
  }
}
