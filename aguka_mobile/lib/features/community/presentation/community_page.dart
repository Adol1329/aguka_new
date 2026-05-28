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
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(
          post.title.isEmpty ? post.content : post.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 6),
            Text(post.content, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
            Text(
              '${post.authorName} • ${DateFormat('MMM d, y').format(post.createdAt)} • ${post.commentCount} comments',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ],
        ),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => PostDetailPage(postId: post.id)),
        ),
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
