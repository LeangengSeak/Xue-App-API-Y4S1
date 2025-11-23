// import { add } from "date-fns";

// export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// export const thirtyDaysFromNow = (): Date =>
//   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

// export const fortyFiveMinutesFromNow = (): Date => {
//   const now = new Date();
//   now.setMinutes(now.getMinutes() + 45);
//   return now;
// };

// export const tenMinutesAgo = (): Date => new Date(Date.now() - 10 * 60 * 1000);

// export const threeMinutesAgo = (): Date => new Date(Date.now() - 3 * 60 * 1000);

// export const oneMinuteAgo = (): Date => new Date(Date.now() - 60 * 1000);

// export const anHourFromNow = (): Date => new Date(Date.now() + 60 * 60 * 1000);

// export const calculateExpirationDate = (expiresIn: string = "15m"): Date => {
//   // Match number + unit ( m = minutes, h = hours, d = days )
//   const match = expiresIn.match(/^(\d+)([mhd])$/);
//   if (!match) throw new Error('Invalid format. Use "15m", "1h", or "2d"');
//   const [, value, unit] = match; // value is the number, unit is 'm', 'h', or 'd' the skip first match eg. 12m
//   const expirationDate = new Date();
//   if (!value) throw new Error("Invalid expiration value");
//   switch (unit) {
//     case "m": // minutes
//       return add(expirationDate, { minutes: parseInt(value, 10) });
//     case "h": // hours
//       return add(expirationDate, { hours: parseInt(value, 10) });
//     case "d": // days
//       return add(expirationDate, { days: parseInt(value, 10) });
//     default:
//       throw new Error('Invalid time unit. Use "m", "h", or "d"');
//   }
// };
