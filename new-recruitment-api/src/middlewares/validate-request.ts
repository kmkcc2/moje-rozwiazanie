import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateBody =
  <T>(schema: z.ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid request body",
        errors: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
