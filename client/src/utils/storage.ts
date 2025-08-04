import { User } from '../types';

export const saveUser = (user: User) => {
  localStorage.setItem('medicalApp_user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const saved = localStorage.getItem('medicalApp_user');
  return saved ? JSON.parse(saved) : null;
};

export const removeUser = () => {
  localStorage.removeItem('medicalApp_user');
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('medicalApp_users', JSON.stringify(users));
};

export const getUsers = (): User[] => {
  const saved = localStorage.getItem('medicalApp_users');
  return saved ? JSON.parse(saved) : [];
};