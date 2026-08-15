import { PermissionNode } from "../models/interfaces/permission-node.model";

export const MOCK_PERMISSIONS: PermissionNode[] = [
  {
    id: 1,
    title: 'HR',
    selected: false,
    children: [
      {
        id: 2,
        title: 'Employees',
        selected: false,
        children: [
          { id: 3, title: 'Create Employee', selected: false },
          { id: 4, title: 'Edit Employee', selected: false },
          { id: 5, title: 'Delete Employee', selected: false },
        ],
      },
      {
        id: 6,
        title: 'Reports',
        selected: false,
        children: [
          { id: 7, title: 'Salary Report', selected: false },
          { id: 8, title: 'Attendance Report', selected: false },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Finance',
    selected: false,
    children: [
      {
        id: 10,
        title: 'Invoices',
        selected: false,
        children: [
          { id: 11, title: 'Create Invoice', selected: false },
          { id: 12, title: 'Edit Invoice', selected: false },
        ],
      },
    ],
  },
];
