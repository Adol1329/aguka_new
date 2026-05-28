import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_bloc.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_event.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_state.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class PostDetailPage extends StatelessWidget {
  final String postId;

  const PostDetailPage({Key? key, required this.postId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ForumBloc>()..add(FetchForumPostDetail(postId)),
      child: PostDetailView(postId: postId),
    );
  }
}

class PostDetailView extends StatefulWidget {
  final String postId;

  const PostDetailView({Key? key, required this.postId}) : super(key: key);

  @override
  State<PostDetailView> createState() => _PostDetailViewState();
}

class _PostDetailViewState extends State<PostDetailView> {
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ForumBloc, ForumState>(
      listener: (context, state) {
        if (state.status == ForumStatus.error && state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!)),
          );
        }
        if (state.status == ForumStatus.loaded) {
          _commentController.clear();
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: const AgukaAppBar(title: 'Discussion'),
          body: _buildBody(context, state),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, ForumState state) {
    if (state.status == ForumStatus.loading || state.status == ForumStatus.initial) {
      return const Center(child: CircularProgressIndicator());
    }

    final post = state.selectedPost;
    if (post == null && state.status == ForumStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 56, color: Colors.red),
              const SizedBox(height: 16),
              Text(state.errorMessage ?? 'Failed to load discussion'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => context
                    .read<ForumBloc>()
                    .add(FetchForumPostDetail(widget.postId)),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (post == null) return const SizedBox.shrink();

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                post.title,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                '${post.authorName} • ${DateFormat('MMM d, y').format(post.createdAt)}',
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 16),
              Text(post.content),
              const Divider(height: 32),
              const Text(
                'Comments',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              if (post.comments.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Text('No comments yet. Be the first to reply.'),
                )
              else
                ...post.comments.map(
                  (comment) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(comment.authorName),
                    subtitle: Text(comment.content),
                    trailing: Text(DateFormat('MMM d').format(comment.createdAt)),
                  ),
                ),
            ],
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: const InputDecoration(
                      hintText: 'Write a comment',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: state.status == ForumStatus.submitting
                      ? null
                      : () {
                          final content = _commentController.text.trim();
                          if (content.isEmpty) return;
                          context.read<ForumBloc>().add(
                                AddForumCommentRequested(
                                  postId: widget.postId,
                                  content: content,
                                ),
                              );
                        },
                  icon: state.status == ForumStatus.submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
