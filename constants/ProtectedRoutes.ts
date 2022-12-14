import { Roles } from "./Roles";

export interface IProtectedRoute {
  path: string;
  allowedRoleIDs: number[] | "authenticated";
}

export const ProtectedRoutes: IProtectedRoute[] = [
  {
    path: "/admin",
    allowedRoleIDs: [Roles.SYSTEM.id],
  },
  {
    path: "/issuer",
    allowedRoleIDs: [Roles.ISSUER.id],
  },
  {
    path: "/protected",
    allowedRoleIDs: "authenticated",
  },
];
