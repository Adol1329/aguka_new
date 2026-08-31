import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useCommunityPosts, useCreatePost, useLikePost, useAddComment } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Heart,
  Send,
  Loader2,
  CornerDownRight,
  Shield,
  Shrub,
  Building2,
  Eye,
  MoreVertical,
  Trash,
  Flag,
  Pin,
  CheckCircle2,
  Globe,
  MapPin,
  Users,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { forumApi, PostAudience, PostType } from "@/api/forum";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeletePost, usePinPost, useReportPost, useVerifyAnswer } from "@/hooks/use-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/farmer/community")({
  component: CommunityPage,
});

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "farmer":
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
          <Shrub className="h-2.5 w-2.5" /> Farmer
        </span>
      );
    case "officer":
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
          <Shield className="h-2.5 w-2.5" /> Officer
        </span>
      );
    case "cooperative":
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
          <Building2 className="h-2.5 w-2.5" /> Manager
        </span>
      );
    default:
      return null;
  }
}

function PostTypeBadge({ type }: { type: PostType }) {
  switch (type) {
    case PostType.COMMUNITY_ADVISORY:
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[10px]">
          <Info className="h-3 w-3" /> ADVISORY
        </Badge>
      );
    case PostType.COMMUNITY_ALERT:
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px]">
          <AlertTriangle className="h-3 w-3" /> ALERT
        </Badge>
      );
    case PostType.COMMUNITY_EMERGENCY:
      return (
        <Badge variant="destructive" className="gap-1 animate-pulse text-[10px]">
          <Zap className="h-3 w-3" /> EMERGENCY
        </Badge>
      );
    default:
      return null;
  }
}

function AudienceBadge({ type, id }: { type: PostAudience; id?: string }) {
  switch (type) {
    case PostAudience.GLOBAL:
      return (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Globe className="h-3 w-3" /> Global
        </span>
      );
    case PostAudience.DISTRICT:
      return (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> District: {id}
        </span>
      );
    case PostAudience.COOPERATIVE:
      return (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" /> Cooperative
        </span>
      );
    default:
      return null;
  }
}

function Comment({
  comment,
  postId,
  onReply,
  onlineUsers,
}: {
  comment: any;
  postId: string;
  onReply: (cId: string) => void;
  onlineUsers: Set<string>;
}) {
  const isOnline = onlineUsers.has(comment.authorId);
  const { user } = useAuth();
  const verifyAnswer = useVerifyAnswer();

  return (
    <div
      className={cn(
        "mt-4 space-y-4",
        comment.isAcceptedAnswer && "bg-emerald-50/50 p-2 rounded-lg border border-emerald-100",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.authorAvatar} />
            <AvatarFallback className="bg-muted text-[10px]">
              {comment.authorName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-white ring-1 ring-white" />
          )}
        </div>
        <div className="flex-1 bg-muted/30 p-3 rounded-lg relative group">
          {comment.isAcceptedAnswer && (
            <div className="absolute -top-3 -right-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" /> Verified Solution
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs text-left">{comment.authorName}</span>
              <RoleBadge role={comment.authorRole} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {(user?.role === "officer" ||
                user?.role === "admin" ||
                user?.role === "super_admin") &&
                !comment.isAcceptedAnswer && (
                  <button
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-600 hover:underline transition-opacity flex items-center gap-1"
                    onClick={() => verifyAnswer.mutate(comment.id)}
                    disabled={verifyAnswer.isPending}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Verify
                  </button>
                )}
            </div>
          </div>
          <p className="text-xs mt-1 text-left">{comment.content}</p>
          <div className="flex justify-start">
            <button
              className="text-[10px] text-primary mt-2 font-medium hover:underline"
              onClick={() => onReply(comment.id)}
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="ml-6 pl-4 border-l border-muted space-y-4">
          {comment.replies.map((reply: any) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onlineUsers={onlineUsers}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  p,
  onlineUsers,
  expandedPost,
  setExpandedPost,
  handleLike,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleReply,
  addComment,
}: any) {
  const isOnline = onlineUsers.has(p.authorId);
  const { user } = useAuth();

  const markSeen = useMutation({
    mutationFn: () => forumApi.markAsSeen(p.id),
  });

  const reportPost = useReportPost();
  const deletePost = useDeletePost();
  const pinPost = usePinPost();

  const canDelete =
    user?.role === "admin" || user?.role === "super_admin" || user?.id === p.authorId;
  const canPin =
    user?.role === "admin" || user?.role === "super_admin" || user?.role === "cooperative";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          markSeen.mutate();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    const el = document.getElementById(`post-${p.id}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [p.id]);

  return (
    <Card
      id={`post-${p.id}`}
      className={cn(
        "p-5 overflow-hidden transition-all hover:shadow-md border-l-4",
        p.isPinned && "border-primary bg-primary/5",
        p.type === PostType.COMMUNITY_EMERGENCY ? "border-destructive bg-destructive/5" : 
        p.type === PostType.COMMUNITY_ALERT ? "border-amber-400" :
        p.type === PostType.COMMUNITY_ADVISORY ? "border-blue-400" : "border-l-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={p.authorAvatar} />
            <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
              {p.authorName
                ? p.authorName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                : "U"}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-white" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{p.authorName}</span>
                <RoleBadge role={p.authorRole} />
                <PostTypeBadge type={p.type} />
                {p.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">
                    <Pin className="h-3 w-3" /> Pinned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {p.authorFarm && (
                  <span className="text-[10px] text-muted-foreground">{p.authorFarm}</span>
                )}
                <AudienceBadge type={p.audienceType} id={p.audienceId} />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => reportPost.mutate({ id: p.id, reason: "Inappropriate content" })}
                  >
                    <Flag className="mr-2 h-4 w-4" /> Report Post
                  </DropdownMenuItem>
                  {canPin && (
                    <DropdownMenuItem
                      onClick={() => pinPost.mutate({ id: p.id, isPinned: !p.isPinned })}
                    >
                      <Pin className="mr-2 h-4 w-4" /> {p.isPinned ? "Unpin Post" : "Pin Post"}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => deletePost.mutate(p.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="mt-3 text-left">
            {p.title && <h3 className="font-bold text-base mb-1">{p.title}</h3>}
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{p.content}</p>
          </div>

          {p.imageUrls?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {p.imageUrls.map((url: string, i: number) => (
                <img key={i} src={url} alt="Post attachment" className="rounded-lg border object-cover w-full h-40" />
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-4 text-xs text-muted-foreground border-t pt-3">
            <button
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => handleLike(p.id)}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  p.hasLiked ? "fill-primary text-primary" : "text-muted-foreground",
                )}
              />
              <span className={cn(p.hasLiked && "font-bold text-primary")}>
                {p.likeCount} {p.likeCount === 1 ? "Like" : "Likes"}
              </span>
            </button>
            <button
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => setExpandedPost(expandedPost === p.id ? null : p.id)}
            >
              <MessageCircle className="h-4 w-4" /> 
              <span>{p.commentCount} {p.commentCount === 1 ? "Reply" : "Replies"}</span>
            </button>
            <div className="flex items-center gap-1 ml-auto opacity-70">
              <Eye className="h-3 w-3" /> {p.viewCount || 0}
            </div>
          </div>

          {expandedPost === p.id && (
            <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
                {p.comments?.map((comment: any) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={p.id}
                    onReply={(cId: string) => setReplyingTo({ postId: p.id, commentId: cId })}
                    onlineUsers={onlineUsers}
                  />
                ))}

                {!replyingTo || replyingTo.postId !== p.id ? (
                  <div className="flex gap-2 mt-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px]">Me</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Write a reply..."
                        rows={1}
                        className="min-h-[40px] pr-10 resize-none py-2"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onFocus={() => setReplyingTo({ postId: p.id })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <CornerDownRight className="h-3 w-3" />
                      {replyingTo.commentId ? "Replying to a comment" : "Replying to post"}
                      <button
                        className="ml-auto hover:text-foreground underline"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </button>
                    </div>
                    <Textarea
                      autoFocus
                      placeholder="Write your reply..."
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="h-8 px-4"
                        onClick={handleReply}
                        disabled={addComment.isPending || !replyContent.trim()}
                      >
                        {addComment.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Send className="h-3 w-3 mr-1" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CommunityPage() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState<PostType>(PostType.COMMUNITY_POST);
  const [audience, setAudience] = useState<PostAudience>(PostAudience.GLOBAL);
  
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId?: string } | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const qc = useQueryClient();
  const { data: posts, isLoading } = useCommunityPosts();
  const createPost = useCreatePost();
  const likePost = useLikePost();
  const addComment = useAddComment();

  useEffect(() => {
    const handleNewPost = (event: any) => {
      qc.setQueryData(["community-posts", undefined], (old: any) => {
        if (!old) return [event.post];
        // Prevent duplicates
        if (old.some((p: any) => p.id === event.post.id)) return old;
        return [event.post, ...old];
      });
    };

    const handleReaction = (event: any) => {
      qc.setQueryData(["community-posts", undefined], (old: any) => {
        if (!old) return old;
        return old.map((p: any) =>
          p.id === event.postId ? { ...p, likeCount: event.likesCount } : p,
        );
      });
    };

    const handleNewComment = (event: any) => {
      qc.setQueryData(["community-posts", undefined], (old: any) => {
        if (!old) return old;
        return old.map((p: any) => {
          if (p.id !== event.postId) return p;

          const addReplyToComments = (comments: any[]): any[] => {
            if (!event.comment.parentCommentId) {
              // Avoid adding same comment twice
              if (comments?.some(c => c.id === event.comment.id)) return comments;
              return [...(comments || []), event.comment];
            }
            return (comments || []).map((c) => {
              if (c.id === event.comment.parentCommentId) {
                if (c.replies?.some((r: any) => r.id === event.comment.id)) return c;
                return { ...c, replies: [...(c.replies || []), event.comment] };
              }
              if (c.replies) {
                return { ...c, replies: addReplyToComments(c.replies) };
              }
              return c;
            });
          };

          return {
            ...p,
            commentCount: p.commentCount + 1,
            comments: addReplyToComments(p.comments || []),
          };
        });
      });
      qc.invalidateQueries({ queryKey: ["forum-post", event.postId] });
    };

    const handlePostDeleted = (event: { postId: string }) => {
      qc.setQueryData(["community-posts", undefined], (old: any) => {
        if (!old) return old;
        return old.filter((p: any) => p.id !== event.postId);
      });
    };

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };

    // Listen for standardized events
    socket.on("community:post:new", handleNewPost);
    socket.on("community:reaction:new", handleReaction);
    socket.on("community:comment:new", handleNewComment);
    socket.on("community:post:deleted", handlePostDeleted);
    
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("community:post:new", handleNewPost);
      socket.off("community:reaction:new", handleReaction);
      socket.off("community:comment:new", handleNewComment);
      socket.off("community:post:deleted", handlePostDeleted);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [qc]);

  const searchString = useRouterState({ select: (s) => s.location.search });
  useEffect(() => {
    if (!posts || posts.length === 0) return;
    const postId = new URLSearchParams(searchString).get("postId");
    if (!postId) return;

    const el = document.getElementById(`post-${postId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary", "ring-offset-2", "rounded-lg");
      setExpandedPost(postId);
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-lg");
      }, 3000);
    }
  }, [posts, searchString]);

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync({
        title: title.trim() || "Community Post",
        content: content.trim(),
        type: postType,
        audienceType: audience,
        category: "General",
      });
      setContent("");
      setTitle("");
      toast.success("Post shared with the community!");
    } catch (error) {
      toast.error("Failed to share post");
    }
  };

  const handleLike = async (id: string) => {
    try {
      await likePost.mutateAsync(id);
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !replyingTo) return;
    try {
      await addComment.mutateAsync({
        id: replyingTo.postId,
        content: replyContent.trim(),
        parentCommentId: replyingTo.commentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      toast.success("Reply added!");
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const showSpecialPostTypes = user?.role === "officer" || user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="space-y-6">
      <PageHeader title="Community" subtitle="Share knowledge and learn from other farmers." />
      
      <Card className="p-5">
        <div className="space-y-4">
          <div className="flex gap-3 items-center mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user?.name}</span>
              <RoleBadge role={user?.role || "farmer"} />
            </div>
          </div>

          {showSpecialPostTypes && (
            <input
              type="text"
              placeholder="Post Title (Optional)"
              className="w-full bg-transparent border-b border-muted py-2 px-1 focus:outline-none focus:border-primary font-bold text-lg transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}

          <Textarea
            placeholder={postType === PostType.COMMUNITY_EMERGENCY ? "What's the emergency?" : "Share something with the community..."}
            rows={3}
            className={cn(
              "resize-none text-base",
              postType === PostType.COMMUNITY_EMERGENCY && "border-destructive focus-visible:ring-destructive"
            )}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {showSpecialPostTypes && (
              <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Post Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PostType.COMMUNITY_POST}>Normal Post</SelectItem>
                  <SelectItem value={PostType.COMMUNITY_ADVISORY}>Advisory</SelectItem>
                  <SelectItem value={PostType.COMMUNITY_ALERT}>Warning Alert</SelectItem>
                  <SelectItem value={PostType.COMMUNITY_EMERGENCY}>Emergency</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={audience} onValueChange={(v) => setAudience(v as PostAudience)}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PostAudience.GLOBAL}>Global Community</SelectItem>
                <SelectItem value={PostAudience.DISTRICT}>My District</SelectItem>
                <SelectItem value={PostAudience.COOPERATIVE}>My Cooperative</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {setContent(""); setTitle(""); setPostType(PostType.COMMUNITY_POST);}}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "bg-gradient-hero px-6",
                  postType === PostType.COMMUNITY_EMERGENCY && "bg-none bg-destructive hover:bg-destructive/90"
                )}
                onClick={handlePost}
                disabled={createPost.isPending || !content.trim()}
              >
                {createPost.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {postType === PostType.COMMUNITY_EMERGENCY ? "Send Emergency" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {posts?.map((p: any) => (
          <PostCard
            key={p.id}
            p={p}
            onlineUsers={onlineUsers}
            expandedPost={expandedPost}
            setExpandedPost={setExpandedPost}
            handleLike={handleLike}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReply={handleReply}
            addComment={addComment}
          />
        ))}
        {posts?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No community posts yet. Be the first to share!
          </div>
        )}
      </div>
    </div>
  );
}
