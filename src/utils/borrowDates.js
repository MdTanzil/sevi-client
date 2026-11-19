// Borrowing rules shared by the borrow date picker, the profile
// history and the borrowed-books page.
//
// All dates here are plain YYYY-MM-DD calendar dates. They are parsed
// as LOCAL midnight (never as UTC), so a due date cannot shift by a day
// because of the viewer's timezone.

// Books can be borrowed for at most this many days.
export const MAX_BORROW_DAYS = 5;

// "2026-11-19" -> local Date at midnight, or null when unparseable.
export const parseDateOnly = (value) => {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // Guard against rollover (e.g. 2026-02-30 becomes 2026-03-02).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

// Local Date -> "YYYY-MM-DD".
export const toDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// Whole days from `today` until `dueDate` (negative = overdue).
// Returns null when the due date cannot be parsed.
export const daysUntilDue = (dueDate, today = new Date()) => {
  const due = parseDateOnly(dueDate);
  if (!due) return null;
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((due - start) / 86400000);
};

// "overdue" | "due-soon" | "ok" | "returned" | "unknown".
// Returned books never count as overdue or due soon. Due soon means the
// book is due today or tomorrow.
export const getDueStatus = (record, today = new Date()) => {
  if (record?.status === "returned") return "returned";
  const days = daysUntilDue(record?.retunDate, today);
  if (days === null) return "unknown";
  if (days < 0) return "overdue";
  if (days <= 1) return "due-soon";
  return "ok";
};

// Validate a picked return date for a new borrow: today .. today + 5 days.
export const validateReturnDate = (value, today = new Date()) => {
  const picked = parseDateOnly(value);
  if (!picked) {
    return { valid: false, message: "Please pick a return date." };
  }
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const days = Math.round((picked - start) / 86400000);
  if (days < 0) {
    return {
      valid: false,
      message: "The return date cannot be in the past.",
    };
  }
  if (days > MAX_BORROW_DAYS) {
    return {
      valid: false,
      message: `Books can be borrowed for up to ${MAX_BORROW_DAYS} days. Please pick a date within ${MAX_BORROW_DAYS} days.`,
    };
  }
  return { valid: true, message: "" };
};

// Bounds for the borrow date picker (YYYY-MM-DD).
export const minReturnDate = (today = new Date()) => toDateOnly(today);
export const maxReturnDate = (today = new Date()) =>
  toDateOnly(addDays(today, MAX_BORROW_DAYS));
