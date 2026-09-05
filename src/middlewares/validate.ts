import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
          error: "Validation failed",
          details: z.flattenError(result.error),
        });
      return;
    }

    req.body = result.data;
    next();
  };
}
