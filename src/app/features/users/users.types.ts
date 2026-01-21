export type UserRole = 'admin' | 'staff';
export type UserRow = { id: string; name: string; email: string; role: UserRole };
export type UserFormPayload = { name: string; email: string; role: UserRole };
