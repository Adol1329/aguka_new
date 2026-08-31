import { Response, NextFunction } from "express";
import { forumService } from "../services/forum.service.js";
import { RequestWithUser } from "../types/index.js";
import { realTimeSync } from "../app.js";

export const getPosts = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { category, limit, page, audienceType, audienceId } = req.query;

    const result = await forumService.getPosts(userId, {
      category: category as string,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      audienceType: audienceType as any,
      audienceId: audienceId as string,
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

    // Emit real-time feed update
    realTimeSync.broadcastCommunityEvent(
      {
        type: "post:new",
        post: await forumService.getPostById(post.id, userId),
      },
      { type: post.audienceType, id: post.audienceId || undefined },
    );

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
    const post = await forumService.getPostById(req.params.id, userId);

    // Emit real-time feed update
    realTimeSync.broadcastCommunityEvent(
      {
        type: "reaction:new",
        postId: req.params.id,
        likesCount: result.likesCount,
        liked: result.liked,
      },
      { type: post.audienceType, id: post.audienceId || undefined },
    );

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
      req.body.parentCommentId,
    );

    const post = await forumService.getPostById(req.params.id, userId);

    // Emit real-time feed update
    realTimeSync.broadcastCommunityEvent(
      {
        type: "comment:new",
        postId: req.params.id,
        comment: {
          id: comment.id,
          content: comment.content,
          authorName: (comment as any).author?.fullName || "Member",
          authorRole: req.user?.role,
          authorId: userId,
          createdAt: comment.createdAt,
          parentCommentId: comment.parentCommentId,
        },
      },
      { type: post.audienceType, id: post.audienceId || undefined },
    );

    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    return next(error);
  }
};

export const markAsSeen = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const result = await forumService.markAsSeen(userId, req.params.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const reportPost = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { reason } = req.body;
    const result = await forumService.reportPost(userId, req.params.id, reason);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const pinPost = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { isPinned } = req.body;
    const result = await forumService.pinPost(userId, req.params.id, isPinned);
    const post = await forumService.getPostById(req.params.id, userId);

    // Broadcast change
    realTimeSync.broadcastCommunityEvent(
      {
        type: "post:pinned",
        postId: req.params.id,
        isPinned,
      },
      { type: post.audienceType, id: post.audienceId || undefined },
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const verifyAnswer = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const result = await forumService.verifyAnswer(
      userId,
      req.params.commentId,
    );

    const post = await forumService.getPostById(result.postId, userId);

    realTimeSync.broadcastCommunityEvent(
      {
        type: "comment:verified",
        postId: post.id,
        commentId: req.params.commentId,
      },
      { type: post.audienceType, id: post.audienceId || undefined },
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const promoteToKnowledgeBase = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const result = await forumService.promoteToKnowledgeBase(
      userId,
      req.params.id,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const deletePost = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const role = req.user!.role;
    const post = await forumService.getPostById(req.params.id, userId);
    const result = await forumService.deletePost(userId, req.params.id, role);

    realTimeSync.broadcastCommunityEvent(
      {
        type: "post:deleted",
        postId: req.params.id,
      },
      { type: post.audienceType, id: post.audienceId || undefined },
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
