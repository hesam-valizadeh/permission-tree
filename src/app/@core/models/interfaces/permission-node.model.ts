export interface PermissionNode {
  id: number;
  title: string;
  selected: boolean;
  indeterminate?: boolean;
  children?: PermissionNode[];
}
