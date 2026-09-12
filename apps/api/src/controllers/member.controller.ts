import type { Request, Response, NextFunction } from "express";
import { memberService } from "../services/member.service";
import type { AddMemberInput, UpdateMemberRoleInput } from "../schemas/member.schema";

export const memberController = {
  async list(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await memberService.listMembers(req.params.id);
      res.status(200).json(members);
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: Request<{ id: string }, unknown, AddMemberInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const member = await memberService.addMember(req.params.id, req.body);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  },

  async updateRole(
    req: Request<{ id: string; userId: string }, unknown, UpdateMemberRoleInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const member = await memberService.updateMemberRole(
        req.params.id,
        req.params.userId,
        req.body.role
      );
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: Request<{ id: string; userId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await memberService.removeMember(req.params.id, req.params.userId, req.workspaceRole!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
