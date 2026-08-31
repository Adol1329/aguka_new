import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/community/domain/repositories/forum_repository.dart';
import 'package:aguka_mobile/data/datasources/remote/socket_client.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';
import 'forum_event.dart';
import 'forum_state.dart';

class ForumBloc extends Bloc<ForumEvent, ForumState> {
  final ForumRepository repository;
  final SocketClient _socketClient;
  StreamSubscription? _communitySubscription;

  ForumBloc({
    required this.repository,
    required SocketClient socketClient,
  })  : _socketClient = socketClient,
        super(const ForumState()) {
    on<FetchForumPosts>(_onFetchPosts);
    on<FetchForumPostDetail>(_onFetchPostDetail);
    on<CreateForumPostRequested>(_onCreatePost);
    on<AddForumCommentRequested>(_onAddComment);
    on<LikeForumPostRequested>(_onLikePost);
    on<CommunityUpdateReceived>(_onCommunityUpdate);

    _listenToCommunityUpdates();
  }

  void _listenToCommunityUpdates() {
    _communitySubscription = _socketClient.communityStream.listen((event) {
      add(CommunityUpdateReceived(
        type: event['event'],
        data: event['data'],
      ));
    });
  }

  @override
  Future<void> close() {
    _communitySubscription?.cancel();
    return super.close();
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

  Future<void> _onLikePost(
    LikeForumPostRequested event,
    Emitter<ForumState> emit,
  ) async {
    // Optimistic toggle
    final updatedPosts = state.posts.map((p) {
      if (p.id != event.postId) return p;
      return p.copyWith(
        likeCount: p.hasLiked ? p.likeCount - 1 : p.likeCount + 1,
        hasLiked: !p.hasLiked,
      );
    }).toList();
    emit(state.copyWith(posts: updatedPosts));
    // Fire-and-forget — socket will confirm the real count
    await repository.likePost(event.postId);
  }

  void _onCommunityUpdate(
    CommunityUpdateReceived event,
    Emitter<ForumState> emit,
  ) {
    if (event.type == 'post:new') {
      final newPost = ForumPost.fromJson(event.data['post']);
      // Prevent duplicates
      if (state.posts.any((p) => p.id == newPost.id)) return;
      final updatedPosts = [newPost, ...state.posts];
      emit(state.copyWith(posts: updatedPosts));
    } else if (event.type == 'reaction:new') {
      final postId = event.data['postId'];
      final likesCount = event.data['likesCount'];
      final updatedPosts = state.posts.map((p) {
        if (p.id == postId) {
          return p.copyWith(likeCount: likesCount);
        }
        return p;
      }).toList();

      ForumPost? selected = state.selectedPost;
      if (selected?.id == postId) {
        selected = selected!.copyWith(likeCount: likesCount);
      }

      emit(state.copyWith(posts: updatedPosts, selectedPost: selected));
    } else if (event.type == 'comment:new') {
      final postId = event.data['postId'];
      final comment = ForumComment.fromJson(event.data['comment']);

      final updatedPosts = state.posts.map((p) {
        if (p.id == postId) {
          return p.copyWith(commentCount: p.commentCount + 1);
        }
        return p;
      }).toList();

      ForumPost? selected = state.selectedPost;
      if (selected?.id == postId) {
        final updatedComments = [...selected!.comments, comment];
        selected = selected!.copyWith(
          comments: updatedComments,
          commentCount: updatedComments.length,
        );
      }

      emit(state.copyWith(posts: updatedPosts, selectedPost: selected));
    } else if (event.type == 'post:deleted') {
      final postId = event.data['postId'];
      final updatedPosts = state.posts.where((p) => p.id != postId).toList();
      ForumPost? selected = state.selectedPost;
      if (selected?.id == postId) selected = null;
      emit(state.copyWith(posts: updatedPosts, selectedPost: selected));
    }
  }
}
