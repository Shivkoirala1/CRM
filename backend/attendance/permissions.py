from accounts.models import User


def can_manage_attendance_for(user, employee):
    """
    Admin/CEO and Manager can mark/edit attendance for anyone.
    A Supervisor can only mark/edit attendance for Interns who report
    to them specifically (employee.supervisor == this Supervisor).
    Everyone else (General Staff, Intern) has no write access at all —
    they can only ever view their own records.
    """
    if user.role in [User.Role.ADMIN, User.Role.MANAGER]:
        return True
    if user.role == User.Role.SUPERVISOR:
        return employee.supervisor_id == user.id
    return False