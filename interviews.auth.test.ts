import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("حماية إجراءات المقابلات", () => {
  it("يرفض قراءة سجل المقابلات دون جلسة مستخدم", async () => {
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: {},
    } as TrpcContext;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.interview.history()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

