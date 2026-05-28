import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/community/domain/repositories/forum_repository.dart';
import 'forum_event.dart';
import 'forum_state.dart';

class ForumBloc extends Bloc<ForumEvent, ForumState> {
  final ForumRepository repository;

  ForumBloc({required this.repository}) : super(const ForumState()) {
    on<FetchForumPosts>(_onFetchPosts);
    on<FetchForumPostDetail>(_onFetchPostDetail);
    on<CreateForumPostRequested>(_onCreatePost);
    on<AddForumCommentRequested>(_onAddComment);
  }

  Future<void> _onFetchPosts(
    FetchForumPosts event,
    Emitter<ForumState> emit,
  ) async {
    emit(state.copyWith(status: ForumStatus.loading));
    final result = await repository.getPosts();
    result.fold(
      (failure) => emit(state.copyWith(
        status: ForumStatus.error,
        errorMessage: failure.message,
      )),
      (posts) => emit(state.copyWith(status: ForumStatus.loaded, posts: posts)),
    );
  }

  Future<void> _onFetchPostDetail(
    FetchForumPostDetail event,
    Emitter<ForumState> emit,
  ) async {
    emit(state.copyWith(status: ForumStatus.loading));
    final result = await repository.getPostWithComments(event.postId);
    result.fold(
      (failure) => emit(state.copyWith(
        status: ForumStatus.error,
        errorMessage: failure.message,
      )),
      (post) => emit(state.copyWith(
        status: ForumStatus.loaded,
        selectedPost: post,
      )),
    );
  }

  Future<void> _onCreatePost(
    CreateForumPostRequested event,
    Emitter<ForumState> emit,
  ) async {
    emit(state.copyWith(status: ForumStatus.submitting));
    final result = await repository.createPost(
      title: event.title,
      content: event.content,
      category: event.category,
    );
    result.fold(
      (failure) => emit(state.copyWith(
        status: ForumStatus.error,
        errorMessage: failure.message,
      )),
      (_) => emit(state.copyWith(status: ForumStatus.success)),
    );
  }

  Future<void> _onAddComment(
    AddForumCommentRequested event,
    Emitter<ForumState> emit,
  ) async {
    final currentPost = state.selectedPost;
    emit(state.copyWith(status: ForumStatus.submitting));
    final result = await repository.addComment(event.postId, event.content);
    result.fold(
      (failure) => emit(state.copyWith(
        status: ForumStatus.error,
        errorMessage: failure.message,
        selectedPost: currentPost,
      )),
      (comment) {
        final updatedComments = [
          ...?currentPost?.comments,
          comment,
        ];
        emit(state.copyWith(
          status: ForumStatus.loaded,
          selectedPost: currentPost?.copyWith(
            comments: updatedComments,
            commentCount: updatedComments.length,
          ),
        ));
      },
    );
  }
}
