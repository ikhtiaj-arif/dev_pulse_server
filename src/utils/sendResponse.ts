import type { Response } from "express";
interface IResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

 const sendResponse = <T>(res: Response, data: IResponse<T>,) => {
  res.status(data.status).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error,
  });
};
// export const sendResponse = <T>(
//   res: Response,
//   status: number,
//   success: boolean,
//   message: string,
//   data?: T,
// ) => {
//   res.status(status).json({
//     success,
//     message,
//     data,
//   });
// };
export default sendResponse;
