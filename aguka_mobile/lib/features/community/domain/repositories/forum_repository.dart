import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';

abstract class ForumRepository {
  Future<Either<Failure, List<ForumPost>>> getPosts({
    PostAudience? audienceType,
    String? audienceId,
    String? category,
  });
  Future<Either<Failure, ForumPost>> getPostWithComments(String postId);
  Future<Either<Failure, ForumPost>> createPost({
    required String title,
    required String content,
    String? category,
    PostType? type,
    PostAudience? audienceType,
    String? audienceId,
  });
  Future<Either<Failure, ForumComment>> addComment(String postId, String content);
  Future<Either<Failure, void>> likePost(String postId);
}
