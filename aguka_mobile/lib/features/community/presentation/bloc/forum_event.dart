import 'package:equatable/equatable.dart';

abstract class ForumEvent extends Equatable {
  const ForumEvent();

  @override
  List<Object?> get props => [];
}

class FetchForumPosts extends ForumEvent {}

class FetchForumPostDetail extends ForumEvent {
  final String postId;

  const FetchForumPostDetail(this.postId);

  @override
  List<Object?> get props => [postId];
}

class CreateForumPostRequested extends ForumEvent {
  final String title;
  final String content;
  final String? category;

  const CreateForumPostRequested({
    required this.title,
    required this.content,
    this.category,
  });

  @override
  List<Object?> get props => [title, content, category];
}

class AddForumCommentRequested extends ForumEvent {
  final String postId;
  final String content;

  const AddForumCommentRequested({
    required this.postId,
    required this.content,
  });

  @override
  List<Object?> get props => [postId, content];
}
