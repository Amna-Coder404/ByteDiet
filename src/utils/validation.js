export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Enter a valid email address';
  return '';
}


// Check Password has pwd, Length , and  letter + num 
export function validatePassword(pw) {
  if (!pw) return 'Password is required';
  if (pw.length < 8) return 'Use at least 8 characters';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Include at least one letter and one number';
  return '';
}

const inRange = (v, min, max) => v !== '' && !isNaN(Number(v)) && Number(v) >= min && Number(v) <= max;

export function validatePersonal({ name, age, gender, height, weight }) {
  const e = {};
  if (name.trim().length < 2) e.name = 'Enter your full name';
  if (!inRange(age, 13, 100) || !Number.isInteger(Number(age))) e.age = 'Age must be between 13 and 100';
  if (!gender) e.gender = 'Select a gender';
  if (!inRange(height, 100, 250)) e.height = 'Height must be 100-250 cm';
  if (!inRange(weight, 25, 300)) e.weight = 'Weight must be 25-300 kg';
  return e;
}
