import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useCommunityPosts, useCreatePost, useLikePost } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Heart, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer/community")({
  component: CommunityPage,
});

function CommunityPage() {
  const [content, setContent] = useState("");
  const { data: posts, isLoading } = useCommunityPosts();
  const createPost = useCreatePost();
  const likePost = useLikePost();

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync({
        title: "Farmer Update",
        content: content.trim(),
        category: "General",
      });
      setContent("");
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

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Community" subtitle="Share knowledge and learn from other farmers." />
      <Card className="p-5">
        <Textarea 
          placeholder="Share something with the community..." 
          rows={3} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button 
            className="bg-gradient-hero" 
            onClick={handlePost}
            disabled={createPost.isPending || !content.trim()}
          >
            {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
            Post
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {posts?.map((p: any) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
                  {p.authorName
                    ? p.authorName.split(" ").map((n: string) => n[0]).join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{p.authorName}</span>
                    {p.authorFarm && <span className="text-[10px] text-muted-foreground">{p.authorFarm}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm">{p.content}</p>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleLike(p.id)}
                  >
                    <Heart className={`h-3 w-3 ${p.likeCount > 0 ? 'fill-primary text-primary' : ''}`} /> 
                    {p.likeCount} Likes
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageCircle className="h-3 w-3" /> {p.commentCount} Replies
                  </button>
                </div>
              </div>
            </div>
          </Card>
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
