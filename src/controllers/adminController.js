import * as User from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';

export async function dashboard(req, res) {
  const [counts, users] = await Promise.all([User.countByRole(), User.listAll()]);
  res.render('admin/dashboard', { title: 'Admin dashboard', counts, users });
}

export async function updateUserRole(req, res) {
  const userId = req.params.id;
  const { role } = req.body;

  // Admins cannot demote themselves, so the site can never end up with no admin.
  if (userId === req.user.id) {
    throw new AppError('You cannot change your own role.', 400);
  }

  const updated = await User.updateRole(userId, role);
  if (!updated) throw new AppError('That user does not exist.', 404);

  req.flash('success', 'Role updated.');
  res.redirect('/admin');
}
