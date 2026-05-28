import { Response, NextFunction } from "express";
import { forumService } from "../services/forum.service.js";
import { RequestWithUser } from "../types/index.js";

export const getPosts = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { category, limit, page } = req.query;

    const result = await forumService.getPosts(userId, {
      category: category as string,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const getPostById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const post = await forumService.getPostById(req.params.id, userId);
    return res.json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

export const createPost = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const post = await forumService.createPost(userId, req.body);
    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

export const likePost = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const result = await forumService.likePost(userId, req.params.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const addComment = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const comment = await forumService.addComment(
      userId,
      req.params.id,
      req.body.content,
    );
    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    return next(error);
  }
};
