import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';

enum ForumStatus { initial, loading, loaded, submitting, success, error }

class ForumState extends Equatable {
  final ForumStatus status;
  final List<ForumPost> posts;
  final ForumPost? selectedPost;
  final String? errorMessage;

  const ForumState({
    this.status = ForumStatus.initial,
    this.posts = const [],
    this.selectedPost,
    this.errorMessage,
  });

  ForumState copyWith({
    ForumStatus? status,
    List<ForumPost>? posts,
    ForumPost? selectedPost,
    String? errorMessage,
  }) {
    return ForumState(
      status: status ?? this.status,
      posts: posts ?? this.posts,
      selectedPost: selectedPost ?? this.selectedPost,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, posts, selectedPost, errorMessage];
}
