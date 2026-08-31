import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_bloc.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_event.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_state.dart';
import 'package:aguka_mobile/features/community/presentation/create_post_page.dart';
import 'package:aguka_mobile/features/community/presentation/post_detail_page.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class CommunityPage extends StatelessWidget {
  const CommunityPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ForumBloc>()..add(FetchForumPosts()),
      child: const CommunityView(),
    );
  }
}

class CommunityView extends StatelessWidget {
  const CommunityView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AgukaAppBar(title: 'Community'),
      floatingActionButton: FloatingActionButton(
        heroTag: 'forum_fab',
        onPressed: () async {
          final created = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const CreatePostPage()),
          );
          if (created == true && context.mounted) {
            context.read<ForumBloc>().add(FetchForumPosts());
          }
        },
        child: const Icon(Icons.edit),
      ),
      body: BlocBuilder<ForumBloc, ForumState>(
        builder: (context, state) {
          if (state.status == ForumStatus.loading ||
              state.status == ForumStatus.initial) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.status == ForumStatus.error) {
            return _ErrorState(
              message: state.errorMessage ?? 'Failed to load discussions',
              onRetry: () => context.read<ForumBloc>().add(FetchForumPosts()),
            );
          }

          if (state.posts.isEmpty) {
            return _EmptyState(
              onCompose: () async {
                final created = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(builder: (_) => const CreatePostPage()),
                );
                if (created == true && context.mounted) {
                  context.read<ForumBloc>().add(FetchForumPosts());
                }
              },
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<ForumBloc>().add(FetchForumPosts());
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.posts.length,
              itemBuilder: (context, index) {
                final post = state.posts[index];
                return _PostCard(post: post);
              },
            ),
          );
        },
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final ForumPost post;

  const _PostCard({required this.post});

  @override
  Widget build(BuildContext context) {
    final typeBadge = _typeBadge(post.type);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => PostDetailPage(postId: post.id)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      post.title.isEmpty ? post.content : post.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                  if (typeBadge != null) ...[
                    const SizedBox(width: 8),
                    typeBadge,
                  ],
                ],
              ),
              if (post.title.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(post.content, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey[700], fontSize: 13)),
              ],
              const SizedBox(height: 8),
              Text(
                '${post.authorName} • ${DateFormat('MMM d, y').format(post.createdAt)}',
                style: TextStyle(color: Colors.grey[500], fontSize: 11),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  GestureDetector(
                    onTap: () => context
                        .read<ForumBloc>()
                        .add(LikeForumPostRequested(post.id)),
                    child: Row(
                      children: [
                        Icon(
                          post.hasLiked ? Icons.favorite : Icons.favorite_border,
                          size: 16,
                          color: post.hasLiked ? Colors.red : Colors.grey[500],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${post.likeCount}',
                          style: TextStyle(
                            fontSize: 12,
                            color: post.hasLiked ? Colors.red : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.comment_outlined, size: 15, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Text('${post.commentCount}',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                  if (post.viewCount > 0) ...[
                    const SizedBox(width: 16),
                    Icon(Icons.remove_red_eye_outlined, size: 15, color: Colors.grey[400]),
                    const SizedBox(width: 4),
                    Text('${post.viewCount}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget? _typeBadge(PostType type) {
    switch (type) {
      case PostType.COMMUNITY_ADVISORY:
        return _badge('ADVISORY', Colors.blue);
      case PostType.COMMUNITY_ALERT:
        return _badge('ALERT', Colors.orange);
      case PostType.COMMUNITY_EMERGENCY:
        return _badge('EMERGENCY', Colors.red);
      default:
        return null;
    }
  }

  Widget _badge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 56, color: Colors.red),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onCompose;

  const _EmptyState({required this.onCompose});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.forum_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              'No discussions yet. Start the first one!',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onCompose,
              icon: const Icon(Icons.edit),
              label: const Text('Compose'),
            ),
          ],
        ),
      ),
    );
  }
}
