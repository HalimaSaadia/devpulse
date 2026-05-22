import type { Response } from "express";

type TResponseData<T> = {
  status: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
};

export const sendResponse = (res: Response, data: TResponseData<any>) => {
  res.status(data.status).json({
    success: data.success,
    message: data.message,
    data: data.data,
    errors: data.errors,
  });
};
