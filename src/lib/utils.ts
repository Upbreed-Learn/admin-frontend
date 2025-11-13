import { clsx, type ClassValue } from 'clsx';
import Cookies from 'js-cookie';
import { redirect } from 'react-router';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkAuthLoader = () => {
  const token = Cookies.get('rf');

  if (!token) {
    return redirect('/auth/login');
  }

  return { isAuthenticated: true };
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Define short month names
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + 'K';
  } else {
    return num.toString();
  }
}

export function formatToHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}H:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

//   interface MyTokenPayload {
//     userId: string;
//     email: string;
//     exp: number; // expiration timestamp
//     iat?: number; // issued at timestamp
//   }

//   // Example token (usually from localStorage or cookies)
//   const token =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InhlcGl5Nzg3NDdAZWx5Z2lmdHMuY29tIiwiaWQiOiIyIiwiZm5hbWUiOiJSb3NzIiwibG5hbWUiOiJHZWxsZXIiLCJyb2xlcyI6WyJVU0VSIl0sImRldmljZVNpZ25hdHVyZSI6ImE3YjNjOWQyLWUxZjAtNGc1aC1pNmo3LWs4bDltMG4xbzJwMyIsImlhdCI6MTc2MDcyMTYyOSwiZXhwIjoxNzY4NDk3NjI5fQ.R_Tt91uxMJTHLYu5O30wobU6iwEE4gQNsCGZ0s4XQPM';

// try {
//   const decoded = jwtDecode<MyTokenPayload>(token);
//   console.log(decoded);
//   console.log(decoded.userId);
//   console.log(decoded.email);
//   console.log(new Date(decoded.exp * 1000)); // Convert exp to readable date
// } catch (error) {
//   console.error('Invalid token', error);
// }
