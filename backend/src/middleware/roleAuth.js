export default function roleAuth(allowedRoles = []) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient role" });
    }
    next();
  };
}

// Named export for admin-only routes
export const adminOnly = roleAuth(['admin']);

// Named export for faculty and admin routes
export const facultyOrAdmin = roleAuth(['faculty', 'admin']);
